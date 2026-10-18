
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department";
import Employee from "@/models/Employee";
import { requireAdmin } from "@/lib/authorization";

export async function GET(request, { params }) {
  const { response } = await requireAdmin();
if (response) return response;
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid department ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const department = await Department.findById(id)
      .populate("manager", "name email")
      .lean();

    if (!department) {
      return NextResponse.json(
        { message: "Department not found." },
        { status: 404 }
      );
    }

    const employees = await Employee.countDocuments({
      department: id,
    });

    return NextResponse.json(
      {
        data: {
          ...department,
          manager: department.manager?.name || "",
          managerId: department.manager?._id
            ? String(department.manager._id)
            : "",
          employees,
},
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get department failed:", error);

    return NextResponse.json(
      { message: "Failed to retrieve department." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { response } = await requireAdmin();
if (response) return response;
  try {
    const { id } = await params;
    const { name, manager, budget, status } = await request.json();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid department ID." },
        { status: 400 }
      );
    }

    if (
      (name !== undefined &&
        (typeof name !== "string" || !name.trim())) ||
      (budget !== undefined &&
        (!Number.isFinite(budget) || budget < 0)) ||
      (status !== undefined &&
        !["Active", "Inactive"].includes(status)) ||
      (manager !== undefined &&
        manager !== null &&
        (typeof manager !== "string" ||
          !mongoose.isValidObjectId(manager)))
    ) {
      return NextResponse.json(
        { message: "Invalid department fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (budget !== undefined) updates.budget = budget;
    if (status !== undefined) updates.status = status;

    if (manager !== undefined) {
      if (manager) {
        const employee = await Employee.findById(manager);

        if (!employee) {
          return NextResponse.json(
            { message: "Manager employee not found." },
            { status: 400 }
          );
        }
      }

      updates.manager = manager || null;
    }

    const department = await Department.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("manager", "name email")
      .lean();

    if (!department) {
      return NextResponse.json(
        { message: "Department not found." },
        { status: 404 }
      );
    }

    const employees = await Employee.countDocuments({
      department: id,
    });

    return NextResponse.json(
      {
        message: "Department updated.",
        data: {
  ...department,
  manager: department.manager?.name || "",
  managerId: department.manager?._id
    ? String(department.manager._id)
    : "",
  employees,
},
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Department name already exists." },
        { status: 409 }
      );
    }

    console.error("Update department failed:", error);

    return NextResponse.json(
      { message: "Failed to update department." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { response } = await requireAdmin();
if (response) return response;
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid department ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const employeeCount = await Employee.countDocuments({
      department: id,
    });

    if (employeeCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete a department that still has employees assigned to it.",
        },
        { status: 409 }
      );
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return NextResponse.json(
        { message: "Department not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Department deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete department failed:", error);

    return NextResponse.json(
      { message: "Failed to delete department." },
      { status: 500 }
    );
  }
}
