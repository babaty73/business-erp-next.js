
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { requireAdmin } from "@/lib/authorization";
import Department from "@/models/Department";

export async function GET(request, { params }) {
  const { response } = await requireAdmin();
if (response) return response;
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const employee = await Employee.findById(id)
      .populate("department", "name")
      .lean();

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...employee,
        department: employee.department?.name || "",
      },
    });
  } catch (error) {
    console.error("Get employee failed:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { response } = await requireAdmin();
if (response) return response;
  try {
    const { id } = await params;
    const updates = await request.json();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid employee ID." },
        { status: 400 }
      );
    }

    const allowed = ["name", "email", "department", "role", "status"];
    const keys = Object.keys(updates);

    if (
      keys.length === 0 ||
      keys.some((key) => !allowed.includes(key))
    ) {
      return NextResponse.json(
        { message: "Invalid or empty update." },
        { status: 400 }
      );
    }

    if (
      ("name" in updates &&
        (typeof updates.name !== "string" || !updates.name.trim())) ||
      ("email" in updates &&
        (typeof updates.email !== "string" || !updates.email.trim())) ||
      ("role" in updates &&
        (typeof updates.role !== "string" || !updates.role.trim())) ||
      ("status" in updates &&
        !["Active", "On leave", "Inactive"].includes(updates.status)) ||
      ("department" in updates &&
        (typeof updates.department !== "string" ||
          !mongoose.isValidObjectId(updates.department)))
    ) {
      return NextResponse.json(
        { message: "Invalid employee values." },
        { status: 400 }
      );
    }

    for (const field of ["name", "role"]) {
      if (field in updates) updates[field] = updates[field].trim();
    }

    if ("email" in updates) {
      updates.email = updates.email.trim().toLowerCase();
    }

    await connectDB();

    if (updates.department) {
      const department = await Department.findById(updates.department);

      if (!department) {
        return NextResponse.json(
          { message: "Department not found." },
          { status: 400 }
        );
      }
    }

    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("department", "name")
      .lean();

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Employee updated.",
      data: {
        ...employee,
        department: employee.department?.name || "",
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This employee email is already in use." },
        { status: 409 }
      );
    }

    console.error("Update employee failed:", error);
    return NextResponse.json(
      { message: "Employee update failed." },
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
        { message: "Invalid employee ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found." },
        { status: 404 }
      );
    }

    const managesDepartment = await Department.exists({ manager: id });

    if (managesDepartment) {
      return NextResponse.json(
        { message: "Reassign managed departments before deleting this employee." },
        { status: 409 }
      );
    }

    await Employee.findByIdAndDelete(id);

    return NextResponse.json({ message: "Employee deleted." });
  } catch (error) {
    console.error("Delete employee failed:", error);
    return NextResponse.json(
      { message: "Employee deletion failed." },
      { status: 500 }
    );
  }
}
