// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(request: Request) {
//   try {
//     const { menuItemId, isAvailable } = await request.json();

//     if (!menuItemId || isAvailable === undefined) {
//       return NextResponse.json({ success: false, error: "Missing required properties" }, { status: 400 });
//     }

//     // Mutate the specific MenuItem availability row parameters directly inside PostgreSQL
//     const updatedItem = await prisma.menuItem.update({
//       where: { id: menuItemId },
//       data: { isAvailable }
//     });

//     return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
//   } catch (error: any) {
//     console.error("Stock update failure:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";

// ✨ Configured inline to explicitly match your exact Pusher application instance
const pusher = new Pusher({
  appId: "2176300",
  key: "4ea74b7ade3151df8b06",
  secret: "a22f017220027783b225",
  cluster: "ap2",
  useTLS: true,
});

export async function POST(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const canteenId = resolvedParams.canteenId;
    const { menuItemId, isAvailable } = await request.json();

    if (!menuItemId || isAvailable === undefined || !canteenId) {
      return NextResponse.json({ success: false, error: "Missing required properties" }, { status: 400 });
    }

    // 1. Update the database record in PostgreSQL
    const updatedItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isAvailable }
    });

    console.log(`📝 Stock updated for item ${menuItemId}: isAvailable = ${isAvailable}`);

    // 2. 📡 REAL-TIME TRIGGER: Broadcast directly to customers looking at this canteen menu
    await pusher.trigger(`canteen-${canteenId}`, "menu-stock-updated", {
      menuItemId: menuItemId,
      isAvailable: isAvailable
    });
    
    console.log(`📡 Broadcasted live real-time stock event onto channel: canteen-${canteenId}`);

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Stock update failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}