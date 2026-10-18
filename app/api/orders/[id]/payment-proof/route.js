
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireCustomer } from "@/lib/authorization";

export async function POST(request, { params }) {
  try {
    const { session, response } = await requireCustomer();
    if (response) return response;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { message: "Please select a screenshot." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Image must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      customer: session.userId,
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.status === "Cancelled" || order.payment !== "Pending") {
      return NextResponse.json(
        { message: "This order cannot accept payment proof." },
        { status: 400 }
      );
    }

    if (
      order.paymentProof?.reviewStatus === "Pending" ||
      order.paymentProof?.reviewStatus === "Approved"
    ) {
      return NextResponse.json(
        { message: "Your submitted proof is already under review or approved." },
        { status: 409 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "business-erp/payment-proofs",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    const oldPublicId = order.paymentProof?.publicId;

    order.paymentProof = {
      url: upload.secure_url,
      publicId: upload.public_id,
      reviewStatus: "Pending",
      rejectionReason: null,
    };

    await order.save();

    if (oldPublicId) {
      await cloudinary.uploader
        .destroy(oldPublicId, { resource_type: "image" })
        .catch(() => {});
    }

    return NextResponse.json(
      {
        message: "Payment proof submitted for review.",
        paymentProof: order.paymentProof,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment proof upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload payment proof." },
      { status: 500 }
    );
  }
}
