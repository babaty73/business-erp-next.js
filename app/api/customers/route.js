import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    const [customers, orderTotals] = await Promise.all([
      Customer.find().lean(),

      Order.aggregate([
        {
          $group: {
            _id: "$customer",
            orders: { $sum: 1 },
            spent: {
              $sum: {
                $cond: [
                  { $eq: ["$payment", "Paid"] },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const totalsByCustomer = new Map(
      orderTotals.map((item) => [
        String(item._id),
        { orders: item.orders, spent: item.spent },
      ])
    );

    const data = customers.map((customer) => {
      const totals = totalsByCustomer.get(String(customer._id));

      return {
        ...customer,
        orders: totals?.orders ?? 0,
        spent: totals?.spent ?? 0,
      };
    });

    return NextResponse.json(
      {
        message: "Customer data retrieved.",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Retrieving customers failed:", error);

    return NextResponse.json(
      { message: "Retrieving customer data failed." },
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
      (status !== undefined &&
        !["Active", "Inactive"].includes(status))
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
        data: {
          ...customer.toObject(),
          orders: 0,
          spent: 0,
        },
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
