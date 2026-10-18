
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "admin" || session.userId !== "admin") {
    return {
      session: null,
      response: NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

export async function requireCustomer() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "customer") {
    return {
      session: null,
      response: NextResponse.json(
        { message: "Customer access required." },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}
