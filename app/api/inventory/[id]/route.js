
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/authorization";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid product ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Inventory.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    console.error("Get product failed:", error);

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
        { message: "Invalid product ID." },
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

    const allowedFields = ["name", "sku", "category", "stock", "price"];
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
      ("sku" in updates &&
        (typeof updates.sku !== "string" || !updates.sku.trim())) ||
      ("category" in updates &&
        (typeof updates.category !== "string" ||
          !updates.category.trim())) ||
      ("stock" in updates &&
        (!Number.isInteger(updates.stock) || updates.stock < 0)) ||
      ("price" in updates &&
        (typeof updates.price !== "number" ||
          !Number.isFinite(updates.price) ||
          updates.price < 0))
    ) {
      return NextResponse.json(
        { message: "Invalid product values." },
        { status: 400 }
      );
    }

    for (const field of ["name", "sku", "category"]) {
      if (field in updates) updates[field] = updates[field].trim();
    }

    await connectDB();

    const product = await Inventory.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product updated.", data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update product failed:", error);

    return NextResponse.json(
      { message: "Update failed. Check the submitted values." },
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
        { message: "Invalid product ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Inventory.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    const usedInOrder = await Order.exists({
      "items.product": id,
    });

    if (usedInOrder) {
      return NextResponse.json(
        {
          message:
            "This product cannot be deleted because it is referenced by existing orders.",
        },
        { status: 409 }
      );
    }

    await Inventory.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Product deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete product failed:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
