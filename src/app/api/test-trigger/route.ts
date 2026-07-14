// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { socketStore } from "@/lib/socketStore";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const orderId = searchParams.get("orderId");
//     const status = searchParams.get("status");

//     if (!orderId || !status) {
//       return NextResponse.json({ error: "Missing orderId or status query parameters." }, { status: 400 });
//     }

//     const uppercaseStatus = status.toUpperCase().trim();

//     // 1. Update order status inside PostgreSQL via Prisma
//     const updatedOrder = await prisma.order.update({
//       where: { id: orderId },
//       data: { status: uppercaseStatus as any },
//     });

//     console.log(`📝 Prisma shifted Order #${orderId} status directly to: ${uppercaseStatus}`);

//     // 2. ✨ Extract the shared socket instance from our central singleton store module
//     const liveIo = socketStore.getIo() || (global as any).io;

//     if (liveIo) {
//       // Broadcast status change directly to the target student's isolated room channel
//       liveIo.to(updatedOrder.userId).emit("order_status_updated", {
//         id: updatedOrder.id,
//         status: updatedOrder.status,
//       });
//       console.log(`📡 WebSocket real-time broadcast event dispatched to room: ${updatedOrder.userId}`);
//     } else {
//       console.warn("⚠️ Socket pipeline instance missing. Hit http://localhost:3000/api/socket once first.");
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: `Order set to ${uppercaseStatus} and WebSocket event fired!` 
//     });
//   } catch (error: any) {
//     console.error("Test trigger execution crash:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";

// 1. Initialize Pusher with your cloud app credentials
const pusher = new Pusher({
  appId: "2176300",
  key: "4ea74b7ade3151df8b06",
  secret: "a22f017220027783b225",
  cluster: "ap2",
  useTLS: true,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const uppercaseStatus = status.toUpperCase().trim();

    // 2. Update the status column inside PostgreSQL via Prisma
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: uppercaseStatus as any },
    });

    console.log(`📝 Database row updated for Order #${orderId} -> ${uppercaseStatus}`);

    // 3. ✨ BROADCAST THE LIVE EVENT THROUGH PUSHER HTTP GATEWAY
    // Channel name: 'user-{userId}', Event name: 'order-status-changed'
    await pusher.trigger(`user-${updatedOrder.userId}`, "order-status-changed", {
      id: updatedOrder.id,
      status: updatedOrder.status,
    });

    console.log(`📡 Cloud real-time payload successfully emitted to channel user-${updatedOrder.userId}`);

    return NextResponse.json({ 
      success: true, 
      message: `Order altered to ${uppercaseStatus} and real-time cloud notification pushed!` 
    });
  } catch (error: any) {
    console.error("Pusher trigger error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}