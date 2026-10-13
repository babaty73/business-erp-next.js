import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET() {
  try {
    await connectDB();

    const data = await Customer.find();

    return NextResponse.json(
      {
        message: "Customer data retrieved.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Retrieving failed:", error.message);

    return NextResponse.json(
      {
        message: "Retrieving data failed.",
      },
      { status: 500 }
    );
  }
}



export async function POST(request) {
  try {
    await connectDB();

    const { name, email, status } = await request.json();

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      (status !== undefined && !["Active", "Inactive"].includes(status))
    ) {
      return NextResponse.json(
        { message: "Invalid or missing customer fields." },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      status: status ?? "Active",
    });

    return NextResponse.json(
      {
        message: "Customer created successfully.",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "A customer with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Customer creation failed:", error);

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
