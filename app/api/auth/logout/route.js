
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json(
      { message: "Logged out successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.json(
      { message: "Logout failed." },
      { status: 500 }
    );
  }
}
