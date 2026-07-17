import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

// Initialize Razorpay backend connection instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { userId, canteenId, items } = await request.json();

    if (!userId || !items || !items.length) {
      return NextResponse.json({ success: false, error: "Missing required checkout fields." }, { status: 400 });
    }

    // 🛡️ SECURITY STEP 1: Fetch live database prices to protect against client-side price tampering
    const menuItemIds = items.map((i: any) => i.menuItemId);
    const dbItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true }
    });

    if (dbItems.length !== items.length) {
      return NextResponse.json({ success: false, error: "An item in your cart is out of stock!" }, { status: 400 });
    }

    // Calculate absolute total from DB records
    const itemTotal = items.reduce((acc: number, currentItem: any) => {
      const matched = dbItems.find(d => d.id === currentItem.menuItemId);
      return acc + (matched?.price || 0) * currentItem.quantity;
    }, 0);

    const taxGst = Math.round(itemTotal * 0.05); // 5% GST computation
    const grandTotalRupees = itemTotal + taxGst;

    // 🛡️ SECURITY STEP 2: Razorpay handles amounts strictly in PAISE (1 Rupee = 100 Paise)
    const options = {
      amount: grandTotalRupees * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    // Ask Razorpay to reserve an official order transaction session inside their cluster
    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id, // Handed back to the UI layout page
      amount: options.amount,
      currency: options.currency
    }, { status: 200 });

  } catch (error: any) {
    console.error("Razorpay Order Session Initiation Breakdown:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}