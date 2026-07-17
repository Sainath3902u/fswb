// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import Pusher from "pusher";

// // Initialize Pusher Server configuration instances securely
// const pusher = new Pusher({
//   appId: "2176300",
//   key: "4ea74b7ade3151df8b06",
//   secret: "a22f017220027783b225",
//   cluster: "ap2",
//   useTLS: true,
// });

// export async function POST(request: Request) {
//   try {
//     const { userId, canteenId, items, totalAmount } = await request.json();

//     if (!userId || !canteenId || !items || !items.length || !totalAmount) {
//       return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
//     }


//     // 1. Core Transaction Database Creation Hook inside PostgreSQL
//     const createdOrder = await prisma.order.create({
//       data: {
//         userId,
//         canteenId,
//         totalAmount,
//         status: "PENDING",
//         items: {
//           create: items.map((item: any) => ({
//             menuItemId: item.menuItemId,
//             quantity: item.quantity,
//             price: item.price,
//           })),
//         },
//       },
//       // ✨ FIX: Force-include relational dependencies so the shape directly matches what the UI tracker loop maps out
//       include: {
//         user: {
//           select: {
//             name: true,
//           }
//         },
//         items: {
//           include: {
//             menuItem: true,
//           },
//         },
//       }
//     });

//     // const orders = orders.map(order => ({
//     //   ...order,
//     //   user: order.user ? {
//     //     ...order.user,
//     //     phone: "9999999999 (No Phone Provided)" // 👈 Dynamically mock the phone field structure needed by your UI component
//     //   } : null
//     // }));

//     console.log(`📝 Order created successfully inside database context pipeline for token: ${createdOrder.id}`);

//     // 2. ✨ DISPATCH REAL-TIME SIGNAL VIA PUSHER
//     // Emits payload straight to 'user-{userId}' on event listener token 'new-order-created'
//     await pusher.trigger(`user-${userId}`, "new-order-created", createdOrder);
//     console.log(`📡 Pusher event dispatched successfully for real-time creation injection onto user: ${userId}`);

//     await pusher.trigger(`canteen-${canteenId}`, "canteen-new-order", createdOrder);
//     console.log(`📡 Instantly pushed order notification bundle straight to merchant room channel: canteen-${canteenId}`);

//     return NextResponse.json({ success: true, order: createdOrder });
//   } catch (error: any) {
//     console.error("Order creation route runtime error:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";

// Initialize Pusher Server configuration instances securely
const pusher = new Pusher({
  appId: "2176300",
  key: "4ea74b7ade3151df8b06",
  secret: "a22f017220027783b225",
  cluster: "ap2",
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const { userId, canteenId, items, totalAmount } = await request.json();

    if (!userId || !canteenId || !items || !items.length || !totalAmount) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    // 🛡️ ✨ CRITICAL SECURITY CHECK: Fetch live availability from database
    const menuItemIds = items.map((item: any) => item.menuItemId);
    const dbItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
    });

    // Verify if any of the cart items are currently disabled/unstocked
    const unavailableItem = dbItems.find((item) => item.isAvailable === false);
    if (unavailableItem) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Order failed: "${unavailableItem.name}" just went out of stock! Please remove unavailable items from your cart.` 
        }, 
        { status: 400 }
      );
    }

    // 1. Core Transaction Database Creation Hook inside PostgreSQL
    const createdOrder = await prisma.order.create({
      data: {
        userId,
        canteenId,
        totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      // Force-include relational dependencies so the shape directly matches what the UI tracker loop maps out
      include: {
        user: {
          select: {
            name: true,
          }
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      }
    });

    console.log(`... Order created successfully inside database context pipeline for token: ${createdOrder.id}`);

    // 2. DISPATCH REAL-TIME SIGNAL VIA PUSHER
    // Emits payload straight to 'user-{userId}' on event listener token 'new-order-created'
    await pusher.trigger(`user-${userId}`, "new-order-created", createdOrder);
    console.log(`... Pusher event dispatched successfully for real-time creation injection onto user: ${userId}`);

    await pusher.trigger(`canteen-${canteenId}`, "canteen-new-order", createdOrder);
    console.log(`... Instantly pushed order notification bundle straight to merchant room channel: canteen-${canteenId}`);

    return NextResponse.json({ success: true, order: createdOrder });
  } catch (error: any) {
    console.error("Order creation route runtime error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}