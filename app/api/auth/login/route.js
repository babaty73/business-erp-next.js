
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

  const { email, password } = body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    email.length > 254 ||
    password.length > 72
  ) {
    return NextResponse.json(
      { message: "Enter a valid email and password." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const customer = await Customer.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    // Use the same error for unknown emails and incorrect passwords.
    if (
      !customer ||
      !customer.passwordHash ||
      !(await bcrypt.compare(password, customer.passwordHash))
    ) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (customer.status !== "Active") {
      return NextResponse.json(
        { message: "This account is inactive. Contact the administrator." },
        { status: 403 }
      );
    }

    await createSession({
      userId: customer._id,
      role: "customer",
    });

    return NextResponse.json(
      {
        message: "Login successful.",
        data: {
          id: String(customer._id),
          name: customer.name,
          email: customer.email,
          role: "customer",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customer login failed:", error);

    return NextResponse.json(
      { message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
