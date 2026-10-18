
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    // Handle admin sessions.
    if (session.role === "admin" && session.userId === "admin") {
      const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

      if (!email) {
        return NextResponse.json(
          { message: "Admin account is not configured." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          data: {
            id: "admin",
            name: "Administrator",
            email,
            role: "admin",
          },
        },
        { status: 200 }
      );
    }

    // Handle customer sessions.
    if (
      session.role !== "customer" ||
      !mongoose.isValidObjectId(session.userId)
    ) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    await connectDB();

    const customer = await Customer.findById(session.userId).lean();

    if (!customer || customer.status !== "Active") {
      return NextResponse.json(
        { message: "Account not available." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
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
    console.error("Session lookup failed:", error);

    return NextResponse.json(
      { message: "Failed to check session." },
      { status: 500 }
    );
  }
}
