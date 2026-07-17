import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get("canteenId");

    if (!canteenId) {
      return NextResponse.json({ success: false, error: "Missing canteenId parameter" }, { status: 400 });
    }

    // Fetch categories belonging to this canteen ordered by their sorting position
    const categories = await prisma.category.findMany({
      where: { canteenId },
      orderBy: { order: "asc" }
    });

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error: any) {
    console.error("Categories API runtime failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}