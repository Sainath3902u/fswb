import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized user access request" }, { status: 400 });
    }

    // Pull all orders belonging to this user from PostgreSQL via Prisma
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        canteen: true, // Includes the parent Canteen's name and subtitle details
        items: {
          include: {
            menuItem: true // Includes individual dish titles and descriptions
          }
        }
      },
      orderBy: {
        createdAt: "desc" // Displays fresh active orders at the top of the history list
      }
    });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error("History pipeline compilation failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}