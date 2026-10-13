
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department";
import Employee from "@/models/Employee";

export async function GET() {
  try {
    await connectDB();

    const [departments, counts] = await Promise.all([
      Department.find().populate("manager", "name email").lean(),
      Employee.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count])
    );

    const data = departments.map((department) => ({
      ...department,
      manager: department.manager?.name || "",
      employees: countMap.get(String(department._id)) || 0,
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Get departments failed:", error);
    return NextResponse.json(
      { message: "Failed to retrieve departments." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, manager, budget, status } = await request.json();

    if (
      typeof name !== "string" ||
      !name.trim() ||
      (budget !== undefined &&
        (!Number.isFinite(budget) || budget < 0)) ||
      (status !== undefined &&
        !["Active", "Inactive"].includes(status)) ||
      (manager != null &&
        (typeof manager !== "string" ||
          !mongoose.isValidObjectId(manager)))
    ) {
      return NextResponse.json(
        { message: "Invalid department fields." },
        { status: 400 }
      );
    }

    await connectDB();

    if (manager) {
      const employee = await Employee.findById(manager);

      if (!employee) {
        return NextResponse.json(
          { message: "Manager employee not found." },
          { status: 400 }
        );
      }
    }

    const department = await Department.create({
      name: name.trim(),
      manager: manager || null,
      budget: budget ?? 0,
      status: status ?? "Active",
    });

    const result = await Department.findById(department._id)
      .populate("manager", "name email")
      .lean();

    return NextResponse.json(
      {
        message: "Department created.",
        data: {
          ...result,
          manager: result.manager?.name || "",
          employees: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Department name already exists." },
        { status: 409 }
      );
    }

    console.error("Create department failed:", error);
    return NextResponse.json(
      { message: "Failed to create department." },
      { status: 500 }
    );
  }
}
