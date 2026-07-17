// // import { NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";

// // export async function GET(
// //   request: Request,
// //   { params }: { params: { canteenId: string } }
// // ) {
// //   try {
// //     // 1. Await and extract the dynamic route parameter token
// //     const { canteenId } = await params;

// //     if (!canteenId) {
// //       return NextResponse.json(
// //         { error: "Missing unique canteen parameter token" },
// //         { status: 400 }
// //       );
// //     }

// //     // 2. Query your live PostgreSQL cluster using Prisma Client
// //     // Fetch items matching this specific canteenId that are flagged in-stock
// //     const menuItems = await prisma.menuItem.findMany({
// //       where: {
// //         canteenId: canteenId,
// //         isAvailable: true, 
// //       },
// //       orderBy: {
// //         category: {
// //           name: "asc"
// //         }
// //       },
// //       include: {
// //         category: true
// //       }
// //     });

// //     // 3. Respond with a successful data delivery payload wrapper
// //     return NextResponse.json({ success: true, menuItems }, { status: 200 });
// //   } catch (error: any) {
// //     console.error("API Menu Fetch Breakdown:", error);
// //     return NextResponse.json(
// //       { error: "Failed to connect to menu database lines", details: error.message },
// //       { status: 500 }
// //     );
// //   }
// // }



// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   request: Request,
//   { params }: { params: any }
// ) {
//   try {
//     // 1. Properly await parameters to stay fully compatible with Next.js dynamic signatures
//     const resolvedParams = await params;
//     const canteenId = resolvedParams.canteenId;

//     // 2. Safely capture the dashboard query flags (?all=true)
//     const { searchParams } = new URL(request.url);
//     const showAll = searchParams.get("all") === "true";

//     if (!canteenId) {
//       return NextResponse.json(
//         { success: false, error: "Missing unique canteen parameter token" },
//         { status: 400 }
//       );
//     }

//     // 3. Build a smart, dynamic query filter object
//     let queryWhere: any = {
//       canteenId: canteenId,
//     };

//     // 🛡️ SECURITY: If a regular student is visiting (showAll is false), hide unstocked items!
//     if (!showAll) {
//       queryWhere.isAvailable = true;
//     }

//     // 4. Query your database with proper relational parameters included
//     const fetchedItems = await prisma.menuItem.findMany({
//       where: queryWhere,
//       orderBy: {
//         name: "asc" // Clean sorting alphabetically
//       },
//       include: {
//         category: true // ✨ CRITICAL: Keeps both client filtering pipelines healthy!
//       }
//     });

//     console.log(`📡 Menu API: Found ${fetchedItems.length} items for canteen ${canteenId} (showAll: ${showAll})`);

//     // 5. ✨ THE ULTIMATE RESOLUTION: Return BOTH keys so no frontend page breaks ever again!
//     return NextResponse.json({ 
//       success: true, 
//       menu: fetchedItems,       // 🍱 Satisfies your Owner manage_menu page layout loops
//       menuItems: fetchedItems   // 🎒 Satisfies your Student canteen menu page state maps
//     }, { status: 200 });

//   } catch (error: any) {
//     console.error("API Menu Fetch Breakdown:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to connect to menu database lines", details: error.message },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const canteenId = resolvedParams.canteenId;

    if (!canteenId) {
      return NextResponse.json({ success: false, error: "Missing canteenId parameter" }, { status: 400 });
    }

    // ✨ FIX 2: We query all menu items. The user's page will grey them out based on 'isAvailable: false'
    const menuItemsList = await prisma.menuItem.findMany({
      where: { canteenId: canteenId },
      orderBy: { name: "asc" },
      include: { category: true }
    });

    return NextResponse.json({ 
      success: true, 
      menu: menuItemsList,      
      menuItems: menuItemsList  
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Menu Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
