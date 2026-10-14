import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 })
      .lean();

    const data = orders.map((order) => ({
      ...order,
      id: String(order._id),
      customer: order.customer?.name || "Unknown customer",
      date: order.createdAt.toISOString().slice(0, 10),
      items: order.items.map((item) => ({
        ...item,
        product: item.product?.name || "Deleted product",
      })),
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Retrieving orders failed:", error);

    return NextResponse.json(
      { message: "Failed to retrieve orders." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const { customerId, items } = body;

  if (
    !mongoose.isValidObjectId(customerId) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json(
      { message: "A valid customer and at least one product are required." },
      { status: 400 }
    );
  }

  // Validate and combine repeated products.
  const quantities = new Map();

  for (const item of items) {
    if (
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return NextResponse.json(
        { message: "Each item needs a valid product ID and positive whole-number quantity." },
        { status: 400 }
      );
    }

    const id = String(item.productId);
    quantities.set(id, (quantities.get(id) || 0) + item.quantity);
  }

  let session;

  try {
    await connectDB();

    session = await mongoose.startSession();

    let orderId;

    await session.withTransaction(async () => {
      const customer = await Customer.findById(customerId).session(session);

      if (!customer) {
        throw Object.assign(new Error("Customer not found."), {
          status: 404,
        });
      }

      const productIds = [...quantities.keys()];

      const products = await Inventory.find({
        _id: { $in: productIds },
      }).session(session);

      if (products.length !== productIds.length) {
        throw Object.assign(new Error("One or more products were not found."), {
          status: 404,
        });
      }

      const productMap = new Map(
        products.map((product) => [String(product._id), product])
      );

      const orderItems = [];
      let amount = 0;

      for (const [productId, quantity] of quantities) {
        const product = productMap.get(productId);

        // Deduct stock only if enough is still available.
        const updatedProduct = await Inventory.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: quantity },
          },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          throw Object.assign(
            new Error(`Insufficient stock for ${product.name}.`),
            { status: 409 }
          );
        }

        orderItems.push({
          product: product._id,
          quantity,
          unitPrice: product.price,
        });

        amount += product.price * quantity;
      }

      const [order] = await Order.create(
        [
          {
            customer: customer._id,
            items: orderItems,
            amount,
            status: "Processing",
            payment: "Pending",
          },
        ],
        { session }
      );

      orderId = order._id;
    });

    const order = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .lean();

    return NextResponse.json(
      {
        message: "Order created successfully.",
        data: {
          ...order,
          id: String(order._id),
          customer: order.customer?.name || "",
          date: order.createdAt.toISOString().slice(0, 10),
          items: order.items.map((item) => ({
            ...item,
            product: item.product?.name || "",
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.status) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Creating order failed:", error);

    return NextResponse.json(
      { message: "Failed to create order." },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}