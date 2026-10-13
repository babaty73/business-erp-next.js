
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Department from "@/models/Department";

export async function GET() {
  try {
    await connectDB();

    const data = await Employee.find()
      .populate("department", "name")
      .lean();

    const employees = data.map((employee) => ({
      ...employee,
      department: employee.department?.name || "",
    }));

    return NextResponse.json({ data: employees }, { status: 200 });
  } catch (error) {
    console.error("Get employees failed:", error);
    return NextResponse.json(
      { message: "Failed to retrieve employees." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, email, department, role, status } =
      await request.json();

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof role !== "string" ||
      !role.trim() ||
      typeof department !== "string" ||
      !mongoose.isValidObjectId(department) ||
      (status !== undefined &&
        !["Active", "On leave", "Inactive"].includes(status))
    ) {
      return NextResponse.json(
        { message: "Invalid employee fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingDepartment = await Department.findById(department);

    if (!existingDepartment) {
      return NextResponse.json(
        { message: "Department not found." },
        { status: 400 }
      );
    }

    const employee = await Employee.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department,
      role: role.trim(),
      status: status ?? "Active",
    });

    const result = await Employee.findById(employee._id)
      .populate("department", "name")
      .lean();

    return NextResponse.json(
      {
        message: "Employee created.",
        data: {
          ...result,
          department: result.department?.name || "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "An employee with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Create employee failed:", error);
    return NextResponse.json(
      { message: "Failed to create employee." },
      { status: 500 }
    );
  }
}
