import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const canteenId = searchParams.get("canteenId"); // ✨ ADDED: Capture canteenId query param

    // 1. Build dynamic query conditions
    let queryWhere: any = {};
    
    if (canteenId) {
      queryWhere.canteenId = canteenId; // Fetching orders for the owner's dashboard
    } else if (userId) {
      queryWhere.userId = userId; // Fetching personal history for the student
    } else {
      return NextResponse.json(
        { success: false, error: "Missing required query parameters (userId or canteenId)" }, 
        { status: 400 }
      );
    }

    // 2. Pull orders from PostgreSQL via Prisma matching the query target
    const orders = await prisma.order.findMany({
      where: queryWhere,
      include: {
        canteen: true, // Includes the parent Canteen data metrics
        user: {        // ✨ CRITICAL: Include user data so the owner dashboard gets client names/phones
          select: {
            name: true
          }
        },
        items: {
          include: {
            menuItem: true // Includes item images, names, etc.
          }
        }
      },
      orderBy: {
        createdAt: "desc" // Displays fresh active orders at the top
      }
    });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error("History pipeline failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}