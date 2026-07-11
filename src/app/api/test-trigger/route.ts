import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status"); // e.g., PREPARING, READY, COMPLETED

    if (!orderId || !status) {
      return NextResponse.json({ error: "Provide orderId and status query parameters." }, { status: 400 });
    }

    // 1. Update the PostgreSQL record via Prisma
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status.toUpperCase() as any },
    });

    // 2. ✨ TRIGGER THE WEBSOCKET BROADCAST VIA THE RUNTIME CONTEXT
    // This replicates exactly what your Admin Dashboard page will do later!
    if (global.io) {
      global.io.to(updatedOrder.userId).emit("order_status_updated", {
        id: updatedOrder.id,
        status: updatedOrder.status,
      });
      console.log(`📡 Real-Time Socket Event Dispatched: Order ${orderId} -> ${status}`);
    } else {
      console.warn("⚠️ Socket.IO global server object not initialized yet.");
    }

    return NextResponse.json({ 
      success: true, 
      message: `Order status shifted to ${status} and socket broadcast fired!` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}