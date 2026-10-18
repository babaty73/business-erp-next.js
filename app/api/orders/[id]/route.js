
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import { getSession } from "@/lib/auth";
import { requireAdmin } from "@/lib/authorization";
import Customer from "@/models/Customer";

const allowedTransitions = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid order ID." },
        { status: 400 }
      );
    }

    await connectDB();
const session = await getSession();

if (!session) {
  return NextResponse.json(
    { message: "Authentication required." },
    { status: 401 }
  );
}

if (
  session.role !== "admin" ||
  session.userId !== "admin"
) {
  if (
    session.role !== "customer" ||
    !mongoose.isValidObjectId(session.userId)
  ) {
    return NextResponse.json(
      { message: "Access denied." },
      { status: 403 }
    );
  }


  const customer = await Customer.findById(session.userId)
    .select("status")
    .lean();

  if (!customer || customer.status !== "Active") {
    return NextResponse.json(
      { message: "Account not available." },
      { status: 401 }
    );
  }
}
    const filter =
  session.role === "admin" && session.userId === "admin"
    ? { _id: id }
    : { _id: id, customer: session.userId };

const order = await Order.findOne(filter)
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .lean();

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order }, { status: 200 });
  } catch (error) {
    console.error("Retrieving order failed:", error);

    return NextResponse.json(
      { message: "Failed to retrieve order." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
const { response } = await requireAdmin();
if (response) return response;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json(
      { message: "Invalid order ID." },
      { status: 400 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const { status } = body;

  if (
    typeof status !== "string" ||
    !Object.hasOwn(allowedTransitions, status)
  ) {
    return NextResponse.json(
      { message: "Invalid order status." },
      { status: 400 }
    );
  }

  let session;

  try {
    await connectDB();
    session = await mongoose.startSession();

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        throw Object.assign(new Error("Order not found."), {
          status: 404,
        });
      }

      if (!allowedTransitions[order.status].includes(status)) {
        throw Object.assign(
          new Error(
            `Cannot change order status from ${order.status} to ${status}.`
          ),
          { status: 409 }
        );
      }

      // Restore inventory only when cancelling.
      if (status === "Cancelled") {
        for (const item of order.items) {
          const result = await Inventory.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session }
          );

          if (result.matchedCount !== 1) {
            throw new Error(
              `Inventory product ${item.product} was not found.`
            );
          }
        }
      }

      order.status = status;
      await order.save({ session });

      updatedOrder = order;
    });

    const data = await Order.findById(updatedOrder._id)
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .lean();

    return NextResponse.json(
      { message: "Order status updated successfully.", data },
      { status: 200 }
    );
  } catch (error) {
    if (error.status) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Updating order failed:", error);

    return NextResponse.json(
      { message: "Failed to update order." },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
