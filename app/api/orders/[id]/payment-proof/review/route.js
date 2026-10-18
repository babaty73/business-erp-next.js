
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/authorization";

export async function PATCH(request, { params }) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!["Approved", "Rejected"].includes(action)) {
      return NextResponse.json(
        { message: "Action must be Approved or Rejected." },
        { status: 400 }
      );
    }

    if (
      action === "Rejected" &&
      (typeof rejectionReason !== "string" ||
        !rejectionReason.trim())
    ) {
      return NextResponse.json(
        { message: "A rejection reason is required." },
        { status: 400 }
      );
    }

    if (
      action === "Rejected" &&
      rejectionReason.trim().length > 500
    ) {
      return NextResponse.json(
        { message: "Rejection reason must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    if (
      order.status === "Cancelled" ||
      order.payment !== "Pending" ||
      order.paymentProof?.reviewStatus !== "Pending" ||
      !order.paymentProof?.url
    ) {
      return NextResponse.json(
        { message: "This order has no reviewable payment proof." },
        { status: 409 }
      );
    }

    order.paymentProof.reviewStatus = action;

    if (action === "Approved") {
      order.payment = "Paid";
      order.paymentProof.rejectionReason = null;
    } else {
      order.paymentProof.rejectionReason =
        rejectionReason.trim();
    }

    await order.save();

    return NextResponse.json({
      message:
        action === "Approved"
          ? "Payment approved."
          : "Payment proof rejected.",
      order,
    });
  } catch (error) {
    console.error("Payment proof review error:", error);
    return NextResponse.json(
      { message: "Failed to review payment proof." },
      { status: 500 }
    );
  }
}
