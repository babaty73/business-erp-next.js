
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/authorization";

export async function GET(request, { params }) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid customer ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const customer = await Customer.findById(id).lean();

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: customer }, { status: 200 });
  } catch (error) {
    console.error("Get customer failed:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid customer ID." },
        { status: 400 }
      );
    }

    const updates = await request.json();

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json(
        { message: "Invalid update body." },
        { status: 400 }
      );
    }

    const allowedFields = ["name", "email", "status"];
    const keys = Object.keys(updates);

    if (
      keys.length === 0 ||
      keys.some((key) => !allowedFields.includes(key))
    ) {
      return NextResponse.json(
        { message: "Invalid or empty update." },
        { status: 400 }
      );
    }

    if (
      ("name" in updates &&
        (typeof updates.name !== "string" || !updates.name.trim())) ||
      ("email" in updates &&
        (typeof updates.email !== "string" ||
          !updates.email.trim())) ||
      ("status" in updates &&
        !["Active", "Inactive"].includes(updates.status))
    ) {
      return NextResponse.json(
        { message: "Invalid customer fields." },
        { status: 400 }
      );
    }

    if ("name" in updates) updates.name = updates.name.trim();

    if ("email" in updates) {
      updates.email = updates.email.trim().toLowerCase();
    }

    await connectDB();

    const customer = await Customer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Customer updated.", data: customer },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This email is already in use." },
        { status: 409 }
      );
    }

    console.error("Update customer failed:", error);

    return NextResponse.json(
      { message: "Customer update failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid customer ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    const hasOrders = await Order.exists({ customer: id });

    if (hasOrders) {
      return NextResponse.json(
        {
          message:
            "This customer cannot be deleted because existing orders reference the account.",
        },
        { status: 409 }
      );
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Customer deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete customer failed:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
