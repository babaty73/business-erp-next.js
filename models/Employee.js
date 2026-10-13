
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Active", "On leave", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Employee =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);

export default Employee;
