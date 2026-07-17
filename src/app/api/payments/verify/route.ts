import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      canteenId,
      items,
      totalAmount
    } = await request.json();

    // 🛡️ SECURITY STEP 3: Cryptographically recreate the signature hash locally using your secret key
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Compare tokens. If different, the payment was forged or tampered with!
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Payment verification failed. Signature mismatch!" }, { status: 400 });
    }

    // 🛡️ SECURITY STEP 4: Transaction is authentic! Safe to write a verified 'PAID' order record into database
    const authorizedOrder = await prisma.order.create({
      data: {
        userId,
        canteenId,
        totalAmount: parseFloat((totalAmount / 100).toFixed(2)), // Convert back from paise to rupees
        status: "PENDING", 
        razorpayOrderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    console.log(`✨ Database written: Order ${authorizedOrder.id} finalized successfully as PAID.`);

    return NextResponse.json({ success: true, orderId: authorizedOrder.id }, { status: 200 });
  } catch (error: any) {
    console.error("Payment Signature Verification Crash:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}