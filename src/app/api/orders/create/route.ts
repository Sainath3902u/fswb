import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, canteenId, items, totalAmount } = body;

    // 1. Validate incoming payload arguments
    if (!userId || !canteenId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters to process your checkout." },
        { status: 400 }
      );
    }

    console.log(`📝 Creating a new database order for User: ${userId} at Canteen: ${canteenId}`);

    // 2. Insert order using the exact schema model relation mappings
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        canteenId: canteenId,
        totalAmount: totalAmount,
        status: "PENDING", // Matches your exact capitalized OrderStatus enum string!
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log(`✨ Order successfully logged to PostgreSQL. Order ID: ${newOrder.id}`);

    return NextResponse.json({ success: true, orderId: newOrder.id }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Prisma database transaction failed:", error);
    return NextResponse.json(
      { success: false, error: "Database tracking failure.", details: error.message },
      { status: 500 }
    );
  }
}