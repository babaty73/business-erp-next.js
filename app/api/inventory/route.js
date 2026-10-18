
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import { requireAdmin } from "@/lib/authorization";

export async function GET() {
  try {
    await connectDB();

    const data = await Inventory.find();

    return NextResponse.json(
      {
        message: "Inventory data retrieved.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Retrieving failed:", error.message);

    return NextResponse.json(
      { message: "Retrieving data failed." },
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
