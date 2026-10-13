
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET(request, { params }) {
  try {
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
    const { id } = await params;
    const updates = await request.json();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid customer ID." },
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
        (typeof updates.email !== "string" || !updates.email.trim())) ||
      ("status" in updates &&
        !["Active", "Inactive"].includes(updates.status))
    ) {
      return NextResponse.json(
        { message: "Invalid customer fields." },
        { status: 400 }
      );
    }

    if (updates.name) updates.name = updates.name.trim();

    if (updates.email) {
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
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid customer ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

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
