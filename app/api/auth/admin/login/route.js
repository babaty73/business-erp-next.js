
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { email, password } = body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminPasswordHash) {
      return NextResponse.json(
        { message: "Admin login is not configured." },
        { status: 500 }
      );
    }

    const emailMatches = email.trim().toLowerCase() === adminEmail;
    const passwordMatches = await bcrypt.compare(
      password,
      adminPasswordHash
    );

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    await connectDB();
    await createSession({ userId: "admin", role: "admin" });

    return NextResponse.json({
      message: "Admin login successful.",
      data: {
        name: "Administrator",
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Admin login failed. Please try again." },
      { status: 500 }
    );
  }
}
