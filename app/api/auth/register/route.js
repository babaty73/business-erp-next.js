
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const { name, email, password } = body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { message: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2 || cleanName.length > 80) {
    return NextResponse.json(
      { message: "Name must be between 2 and 80 characters." },
      { status: 400 }
    );
  }

  if (
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
  ) {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (password.length < 8 || password.length > 72) {
    return NextResponse.json(
      { message: "Password must be between 8 and 72 characters." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existingCustomer = await Customer.findOne({
      email: cleanEmail,
    });

    if (existingCustomer) {
      return NextResponse.json(
        { message: "Unable to register with that email address." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      status: "Active",
    });

    await createSession({
      userId: customer._id,
      role: "customer",
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        data: {
          id: String(customer._id),
          name: customer.name,
          email: customer.email,
          role: "customer",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // The unique email index also protects against simultaneous registrations.
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Unable to register with that email address." },
        { status: 409 }
      );
    }

    console.error("Customer registration failed:", error);

    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
