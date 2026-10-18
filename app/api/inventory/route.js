
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import { requireAdmin } from "@/lib/authorization";
import mongoose from "mongoose";
import Customer from "@/models/Customer";
import { getSession } from "@/lib/auth";

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

    if (session.role === "admin" && session.userId === "admin") {
      // Admin access is allowed.
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
    } else {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    const data = await Inventory.find().sort({ name: 1 }).lean();

    return NextResponse.json(
      { message: "Inventory data retrieved.", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Retrieving inventory failed:", error);

    return NextResponse.json(
      { message: "Retrieving inventory data failed." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { response } = await requireAdmin();

    if (response) return response;

    await connectDB();

    const data = await request.json();
    const { name, sku, category, stock, price } = data;

    if (
      !name?.trim() ||
      !sku?.trim() ||
      !category?.trim() ||
      stock === undefined ||
      stock === null ||
      !Number.isFinite(stock) ||
      !Number.isInteger(stock) ||
      !Number.isFinite(price) ||
      price === undefined ||
      price === null ||
      stock < 0 ||
      price < 0
    ) {
      return NextResponse.json(
        { message: "Invalid or missing product fields." },
        { status: 400 }
      );
    }

    const product = await Inventory.create({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      stock,
      price,
    });

    return NextResponse.json(
      {
        message: "Product added successfully.",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Request error:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
