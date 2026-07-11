import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { items } = await request.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: true, validatedItems: [] });
    }

    const validatedItems = [];
    let discoveredCanteen = null;

    // Loop through lightweight client items to attach heavy DB attributes safely
    for (const clientItem of items) {
      const dbItem = await prisma.menuItem.findUnique({
        where: { id: clientItem.id },
        include: { canteen: true }
      });

      if (dbItem) {
        if (!discoveredCanteen && dbItem.canteen) {
          discoveredCanteen = dbItem.canteen;
        }

        validatedItems.push({
          id: dbItem.id,
          name: dbItem.name,
          price: dbItem.price,
          originalPrice: dbItem.originalPrice || undefined,
        //   image: dbItem.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
          quantity: clientItem.quantity,
          isAvailable: dbItem.isAvailable,
          canteenId: dbItem.canteenId
        });
      } else {
        // If an item was completely deleted from PostgreSQL, flag it out of stock
        validatedItems.push({
          ...clientItem,
          isAvailable: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      validatedItems,
      canteen: discoveredCanteen
    });
  } catch (error: any) {
    console.error("Cart Validation Engine Failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}