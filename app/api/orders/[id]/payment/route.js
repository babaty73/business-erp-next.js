
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/authorization";

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

  const { payment } = body;

  if (!["Paid", "Refunded"].includes(payment)) {
    return NextResponse.json(
      { message: "Payment must be Paid or Refunded." },
      { status: 400 }
    );
  }

  let session;

  try {
    await connectDB();
    session = await mongoose.startSession();

    let orderId;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        throw Object.assign(new Error("Order not found."), {
          status: 404,
        });
      }

      if (order.status === "Cancelled") {
        throw Object.assign(
          new Error("Cancelled orders cannot have their payment changed."),
          { status: 409 }
        );
      }

      if (payment === "Paid" && order.payment !== "Pending") {
        throw Object.assign(
          new Error("Only pending payments can be marked as paid."),
          { status: 409 }
        );
      }

      if (payment === "Refunded" && order.payment !== "Paid") {
        throw Object.assign(
          new Error("Only paid orders can be refunded."),
          { status: 409 }
        );
      }

      order.payment = payment;
      await order.save({ session });
      orderId = order._id;
    });

    const data = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .lean();

    return NextResponse.json(
      { message: "Payment status updated.", data },
      { status: 200 }
    );
  } catch (error) {
    if (error.status) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    console.error("Payment update failed:", error);

    return NextResponse.json(
      { message: "Failed to update payment status." },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
