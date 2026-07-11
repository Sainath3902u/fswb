import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all canteen rows from PostgreSQL
    const canteens = await prisma.canteen.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, canteens }, { status: 200 });
  } catch (error: any) {
    console.error("Dashboard Canteen Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to load canteens from database", details: error.message },
      { status: 500 }
    );
  }
}