
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import Inventory from "@/models/Inventory";
import { getSession } from "@/lib/auth";
import { requireCustomer } from "@/lib/authorization";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    await connectDB();

    let filter = {};

    if (session.role === "admin" && session.userId === "admin") {
      // Admins can see all orders.
    } else if (
      session.role === "customer" &&
      mongoose.isValidObjectId(session.userId)
    ) {
      const customer = await Customer.findById(session.userId)
        .select("status")
        .lean();

      if (!customer || customer.status !== "Active") {
        return NextResponse.json(
          { message: "Account not available." },
          { status: 401 }
        );
      }

      filter = { customer: session.userId };
    } else {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const orders = await Order.find(filter)
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
  const { session: authSession, response } = await requireCustomer();

  if (response) return response;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { message: "At least one product is required." },
      { status: 400 }
    );
  }

  const quantities = new Map();

  for (const item of items) {
    if (
      !item ||
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Each item needs a valid product ID and positive whole-number quantity.",
        },
        { status: 400 }
      );
    }

    const id = String(item.productId);
    const totalQuantity = (quantities.get(id) || 0) + item.quantity;

    if (!Number.isSafeInteger(totalQuantity)) {
      return NextResponse.json(
        { message: "Requested quantity is too large." },
        { status: 400 }
      );
    }

    quantities.set(id, totalQuantity);
  }

  let dbSession;

  try {
    await connectDB();

    dbSession = await mongoose.startSession();

    let orderId;

    await dbSession.withTransaction(async () => {
      const customer = await Customer.findById(authSession.userId)
        .session(dbSession);

      if (!customer || customer.status !== "Active") {
        throw Object.assign(new Error("Account not available."), {
          status: 401,
        });
      }

      const productIds = [...quantities.keys()];

      const products = await Inventory.find({
        _id: { $in: productIds },
      }).session(dbSession);

      if (products.length !== productIds.length) {
        throw Object.assign(
          new Error("One or more products were not found."),
          { status: 404 }
        );
      }

      const productMap = new Map(
        products.map((product) => [String(product._id), product])
      );

      const orderItems = [];
      let amount = 0;

      for (const [productId, quantity] of quantities) {
        const product = productMap.get(productId);

        const updatedProduct = await Inventory.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: quantity },
          },
          { $inc: { stock: -quantity } },
          { new: true, session: dbSession }
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

      if (!Number.isFinite(amount)) {
        throw Object.assign(new Error("Order total is invalid."), {
          status: 400,
        });
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
        { session: dbSession }
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
    if (dbSession) {
      await dbSession.endSession();
    }
  }
}
