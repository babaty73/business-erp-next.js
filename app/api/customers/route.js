
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/authorization";

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

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
      { message: "Customer data retrieved.", data },
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
