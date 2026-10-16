
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import Customer from "@/models/Customer";
import Department from "@/models/Department";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await connectDB();

    const [
      orderCounts,
      sales,
      inventoryCount,
      lowStock,
      customerCount,
      departmentCount,
      employeeCount,
      departmentHeadcounts,
    ] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            payment: "Paid",
            status: { $ne: "Cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$amount" },
            paidOrders: { $sum: 1 },
          },
        },
      ]),

      Inventory.countDocuments(),

      Inventory.find({ stock: { $lte: 5 } })
        .select("name sku stock")
        .sort({ stock: 1 })
        .lean(),

      Customer.countDocuments(),
      Department.countDocuments(),
      Employee.countDocuments(),

      Employee.aggregate([
        {
          $group: {
            _id: "$department",
            employees: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countsByStatus = Object.fromEntries(
      orderCounts.map(({ _id, count }) => [_id, count])
    );

    const departments = await Department.find()
      .select("name status")
      .lean();

    const headcountMap = new Map(
      departmentHeadcounts.map((item) => [
        String(item._id),
        item.employees,
      ])
    );

    const departmentData = departments.map((department) => ({
      id: String(department._id),
      name: department.name,
      status: department.status,
      employees: headcountMap.get(String(department._id)) || 0,
    }));

    return NextResponse.json(
      {
        data: {
          orders: {
            total: orderCounts.reduce(
              (sum, item) => sum + item.count,
              0
            ),
            byStatus: countsByStatus,
          },
          sales: {
            revenue: sales[0]?.revenue || 0,
            paidOrders: sales[0]?.paidOrders || 0,
          },
          inventory: {
            totalProducts: inventoryCount,
            lowStockThreshold: 5,
            lowStockProducts: lowStock,
          },
          customers: {
            total: customerCount,
          },
          employees: {
            total: employeeCount,
          },
          departments: departmentData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Generating reports failed:", error);

    return NextResponse.json(
      { message: "Failed to generate the reports." },
      { status: 500 }
    );
  }
}
