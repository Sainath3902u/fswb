import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { menuItemId, isAvailable } = await request.json();

    if (!menuItemId || isAvailable === undefined) {
      return NextResponse.json({ success: false, error: "Missing required properties" }, { status: 400 });
    }

    // Mutate the specific MenuItem availability row parameters directly inside PostgreSQL
    const updatedItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable }
    });

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Stock update failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}