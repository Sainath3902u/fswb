// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";

// export async function POST(request: Request) {
//   try {
//     const { 
//       razorpay_order_id, 
//       razorpay_payment_id, 
//       razorpay_signature,
//       userId,
//       canteenId,
//       items,
//       totalAmount
//     } = await request.json();

//     // 🛡️ SECURITY STEP 3: Cryptographically recreate the signature hash locally using your secret key
//     const secret = process.env.RAZORPAY_KEY_SECRET!;
//     const expectedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     // Compare tokens. If different, the payment was forged or tampered with!
//     if (expectedSignature !== razorpay_signature) {
//       return NextResponse.json({ success: false, error: "Payment verification failed. Signature mismatch!" }, { status: 400 });
//     }

//     // 🛡️ SECURITY STEP 4: Transaction is authentic! Safe to write a verified 'PAID' order record into database
//     const authorizedOrder = await prisma.order.create({
//       data: {
//         userId,
//         canteenId,
//         totalAmount: parseFloat((totalAmount / 100).toFixed(2)), // Convert back from paise to rupees
//         status: "PENDING", 
//         razorpayOrderId: razorpay_order_id,
//         paymentId: razorpay_payment_id,
//         items: {
//           create: items.map((item: any) => ({
//             menuItemId: item.menuItemId,
//             quantity: item.quantity,
//             price: item.price
//           }))
//         }
//       }
//     });

//     console.log(`✨ Database written: Order ${authorizedOrder.id} finalized successfully as PAID.`);

//     return NextResponse.json({ success: true, orderId: authorizedOrder.id }, { status: 200 });
//   } catch (error: any) {
//     console.error("Payment Signature Verification Crash:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "2176300",
  key: "4ea74b7ade3151df8b06",
  secret: "a22f017220027783b225",
  cluster: "ap2",
  useTLS: true,
});

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

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Signature verification failed" }, { status: 400 });
    }

    // 1. Create the order with fully populated relational sub-tables
    const verifiedOrder = await prisma.order.create({
      data: {
        userId,
        canteenId,
        totalAmount: parseFloat((totalAmount / 100).toFixed(2)), 
        status: "PENDING", // Correctly marked as PENDING for standard tracking
        razorpayOrderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      // ✨ THE MASTER FIX: Force-include parent tables so user names/items are passed through Pusher!
      include: {
        canteen: true,
        user: {
          select: {
            name: true
          }
        },
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    console.log(`📝 Order created & verified via Razorpay: ${verifiedOrder.id}`);

    // 2. Dispatch real-time websocket updates with full complete payload shape
    await pusher.trigger(`user-${userId}`, "new-order-created", verifiedOrder);
    await pusher.trigger(`canteen-${canteenId}`, "canteen-new-order", verifiedOrder);

    return NextResponse.json({ success: true, orderId: verifiedOrder.id }, { status: 200 });
  } catch (error: any) {
    console.error("Verification endpoint crash error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}