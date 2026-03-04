import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay server keys are missing" },
        { status: 500 }
      );
    }
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const { submissionId, razorpay_payment_id } = await req.json();

    if (!submissionId || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(submissionId)) {
      return NextResponse.json(
        { error: "Invalid submission ID" },
        { status: 400 }
      );
    }

    // Verify payment from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: "Payment not captured" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const submission = await db
      .collection("submissions")
      .findOne({ _id: new ObjectId(submissionId) });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.paymentStatus === "captured") {
      return NextResponse.json({
        message: "Already processed",
        paymentStatus: "captured",
        data: {
          _id: submission._id.toString(),
          cohortNumber: submission.cohortNumber,
          cohortPosition: submission.cohortPosition,
          referralCode: submission.referralCode,
          tier: submission.tier,
          amount: submission.amount,
        },
      });
    }

    const totalPaid = await db.collection("submissions").countDocuments({
      paymentStatus: "captured",
    });

    const cohortNumber = Math.floor(totalPaid / 20) + 1;
    const cohortPosition = (totalPaid % 20) + 1;

    const referralCode =
      "REF" + razorpay_payment_id.slice(-8).toUpperCase();

    await db.collection("submissions").updateOne(
      { _id: new ObjectId(submissionId) },
      {
        $set: {
          paymentStatus: "captured",
          razorpayPaymentId: razorpay_payment_id,
          cohortNumber,
          cohortPosition,
          referralCode,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Payment verified successfully",
      paymentStatus: "captured",
      data: {
        _id: submissionId,
        cohortNumber,
        cohortPosition,
        referralCode,
        tier: submission.tier,
        amount: submission.amount,
      },
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
