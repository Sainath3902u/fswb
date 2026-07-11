import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { canteenId: string } }
) {
  try {
    // 1. Await and extract the dynamic route parameter token
    const { canteenId } = await params;

    if (!canteenId) {
      return NextResponse.json(
        { error: "Missing unique canteen parameter token" },
        { status: 400 }
      );
    }

    // 2. Query your live PostgreSQL cluster using Prisma Client
    // Fetch items matching this specific canteenId that are flagged in-stock
    const menuItems = await prisma.menuItem.findMany({
      where: {
        canteenId: canteenId,
        isAvailable: true, 
      },
      orderBy: {
        category: {
          name: "asc"
        }
      },
      include: {
        category: true
      }
    });

    // 3. Respond with a successful data delivery payload wrapper
    return NextResponse.json({ success: true, menuItems }, { status: 200 });
  } catch (error: any) {
    console.error("API Menu Fetch Breakdown:", error);
    return NextResponse.json(
      { error: "Failed to connect to menu database lines", details: error.message },
      { status: 500 }
    );
  }
}