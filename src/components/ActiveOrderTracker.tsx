// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { ChevronLeft, ChevronRight, Package, ChefHat, Clock } from "lucide-react";
// import { io, Socket } from "socket.io-client";

// interface OrderItem {
//   id: string;
//   menuItem: {
//     name: string;
//     image: string | null;
//   };
// }

// interface ActiveOrder {
//   id: string;
//   status: string;
//   canteenId: string;
//   totalAmount: number;
//   items: OrderItem[];
// }

// export default function ActiveOrderTracker() {
//   const router = useRouter();
//   const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [user, setUser] = useState<any>(null);

//   // 1. Initial State Load on Component Mount
//   useEffect(() => {
//     const cachedUser = localStorage.getItem("user");
//     if (!cachedUser) {
//       setIsLoading(false);
//       return;
//     }
//     const parsedUser = JSON.parse(cachedUser);
//     setUser(parsedUser);

//     async function fetchActiveOrders() {
//       try {
//         // Fetch current student active orders matching enum markers
//         const res = await fetch(`/api/orders/history?userId=${parsedUser.id}`);
//         const data = await res.json();
//         if (data.success) {
//           const active = data.orders.filter((o: any) =>
//             ["PENDING", "PREPARING", "READY"].includes(o.status.toUpperCase())
//           );
//           setActiveOrders(active);
//         }
//       } catch (err) {
//         console.error("Failed fetching active order logs:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchActiveOrders();
//   }, []);

//   // 2. ✨ WebSockets Real-Time Sync Connection Pipe
//   useEffect(() => {
//     if (!user) return;

//     // Establish WebSocket tunnel link pointing straight to your hosting environment url
//     const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

//     // Join room channel locked strictly to this student's ID
//     socket.emit("join_user_room", user.id);

//     // Listen for order state adjustments broadcast by your admin panels
//     socket.on("order_status_updated", (updatedOrder: { id: string; status: string }) => {
//       setActiveOrders((prevOrders) => {
//         const uppercaseStatus = updatedOrder.status.toUpperCase();
        
//         // If state shifts to COMPLETED or CANCELLED, discard it from the active floating drawer array
//         if (["COMPLETED", "CANCELLED"].includes(uppercaseStatus)) {
//           const filtered = prevOrders.filter((o) => o.id !== updatedOrder.id);
//           if (currentIndex >= filtered.length) setCurrentIndex(Math.max(0, filtered.length - 1));
//           return filtered;
//         }

//         // Otherwise, update the target order tracking parameters mapping seamlessly
//         return prevOrders.map((o) =>
//           o.id === updatedOrder.id ? { ...o, status: uppercaseStatus } : o
//         );
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [user, currentIndex]);

//   // Navigation arrows controllers
//   const handleNext = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (currentIndex < activeOrders.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//     } else {
//       router.push("/dashboard/orders");
//     }
//   };

//   const handlePrevious = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//     }
//   };

//   if (isLoading || activeOrders.length === 0) return null;

//   const currentOrder = activeOrders[currentIndex];

//   // Map database status string values to your exact customized orange color specs
//   const getStatusInfo = (status: string) => {
//     switch (status.toUpperCase()) {
//       case "PREPARING":
//         return {
//           icon: <ChefHat className="w-4 h-4" />,
//           text: "Preparing",
//           color: "text-orange-600",
//           bgColor: "bg-orange-50",
//           gradient: "from-orange-400 to-orange-600"
//         };
//       case "READY":
//         return {
//           icon: <Package className="w-4 h-4" />,
//           text: "Ready for Pickup",
//           color: "text-orange-700 font-black",
//           bgColor: "bg-orange-100 animate-bounce",
//           gradient: "from-orange-500 to-red-600"
//         };
//       default: // PENDING
//         return {
//           icon: <Clock className="w-4 h-4" />,
//           text: "Confirmed",
//           color: "text-orange-500",
//           bgColor: "bg-orange-50/50",
//           gradient: "from-orange-300 to-orange-500"
//         };
//     }
//   };

//   const statusInfo = getStatusInfo(currentOrder.status);

//   return (
//     <div className="fixed bottom-24 left-0 right-0 px-4 z-50 antialiased">
//       <div className="max-w-md mx-auto">
//         <div className={`bg-gradient-to-r ${statusInfo.gradient} p-[2px] rounded-2xl shadow-xl transition-all duration-300`}>
//           <div 
//             className="bg-white rounded-2xl py-3 px-4 cursor-pointer hover:bg-orange-50/10 transition-colors flex items-center justify-between gap-3"
//             onClick={() => router.push("/dashboard/orders")}
//           >
//             {/* Left Hand Thumbnail Image Grid Layout */}
//             <div className="h-12 w-12 bg-gray-50 border rounded-xl overflow-hidden flex-shrink-0">
//               {currentOrder.items && currentOrder.items.length === 1 ? (
//                 <img 
//                   src={currentOrder.items[0].menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=100"} 
//                   alt="" 
//                   className="w-full h-full object-cover" 
//                 />
//               ) : (
//                 <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full w-full">
//                   {currentOrder.items?.slice(0, 4).map((item, idx) => (
//                     <img 
//                       key={idx} 
//                       src={item.menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=50"} 
//                       alt="" 
//                       className="h-full w-full object-cover rounded" 
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Central Information Stack */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center justify-between mb-0.5 gap-2">
//                 <p className="text-sm font-black text-gray-900 truncate">
//                   {currentOrder.items[0]?.menuItem?.name || "Food Item"}
//                   {currentOrder.items.length > 1 && (
//                     <span className="text-orange-500 font-black ml-1">+{currentOrder.items.length - 1} more</span>
//                   )}
//                 </p>
//                 <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wide ${statusInfo.bgColor} ${statusInfo.color} border border-orange-100/30`}>
//                   {statusInfo.icon}
//                   <span>{statusInfo.text}</span>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
//                 <span>Token: CE-{currentOrder.id.slice(-6).toUpperCase()}</span>
//                 {activeOrders.length > 1 && (
//                   <span className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
//                     Order {currentIndex + 1} of {activeOrders.length}
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Navigation Carousel Toggle Arrows */}
//             {activeOrders.length > 1 && (
//               <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
//                 <button
//                   onClick={handlePrevious}
//                   disabled={currentIndex === 0}
//                   className="p-1 rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
//                 >
//                   <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
//                 </button>
//                 <button
//                   onClick={handleNext}
//                   disabled={currentIndex === activeOrders.length - 1}
//                   className="p-1 rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
//                 >
//                   <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { ChevronLeft, ChevronRight, Package, ChefHat, Clock } from "lucide-react";
// import { io, Socket } from "socket.io-client";

// interface OrderItem {
//   id: string;
//   menuItem: {
//     name: string;
//     image: string | null;
//   };
// }

// interface ActiveOrder {
//   id: string;
//   status: string;
//   canteenId: string;
//   totalAmount: number;
//   items: OrderItem[];
// }

// export default function ActiveOrderTracker() {
//   const router = useRouter();
//   const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [user, setUser] = useState<any>(null);

//   // Core reusable function to pull active orders from PostgreSQL via Prisma
//   const syncActiveOrdersFromDB = useCallback(async (userId: string) => {
//     try {
//       const res = await fetch(`/api/orders/history?userId=${userId}`);
//       const data = await res.json();
//       if (data.success) {
//         // Strict match filtering for active states
//         const active = data.orders.filter((o: any) =>
//           ["PENDING", "PREPARING", "READY"].includes(o.status.toUpperCase())
//         );
//         setActiveOrders(active);
//       }
//     } catch (err) {
//       console.error("Failed fetching active order logs:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // 1. Initial configuration load on mount
//   useEffect(() => {
//     const cachedUser = localStorage.getItem("user");
//     if (!cachedUser) {
//       setIsLoading(false);
//       return;
//     }
//     const parsedUser = JSON.parse(cachedUser);
//     setUser(parsedUser);
//     syncActiveOrdersFromDB(parsedUser.id);
//   }, [syncActiveOrdersFromDB]);

//   // ✨ FIX: Robust Real-time WebSocket Event Handler
//   useEffect(() => {
//     if (!user) return;

//     const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

//     socket.emit("join_user_room", user.id);

//     const handleOrderStatusChange = (updatedOrder: { id: string; status: string }) => {
//       console.log("WebSocket event captured inside floating drawer:", updatedOrder);
      
//       const uppercaseStatus = (updatedOrder.status || "").toUpperCase().trim();

//       // 🚀 CRITICAL FIX: If the owner marks the order COMPLETED or CANCELLED, remove it from the active state immediately!
//       if (["COMPLETED", "CANCELLED"].includes(uppercaseStatus)) {
//         setActiveOrders((prevOrders) => {
//           const filteredOrders = prevOrders.filter((o) => o.id !== updatedOrder.id);
          
//           // Failsafe index management preventing carousel breaks
//           if (currentIndex >= filteredOrders.length) {
//             setCurrentIndex(Math.max(0, filteredOrders.length - 1));
//           }
//           return filteredOrders;
//         });
//       } else {
//         // If the order is transitioning between active states (PENDING -> PREPARING -> READY), update it in place
//         setActiveOrders((prevOrders) =>
//           prevOrders.map((o) =>
//             o.id === updatedOrder.id ? { ...o, status: uppercaseStatus } : o
//           )
//         );
//       }
//     };

//     socket.on("order_status_updated", handleOrderStatusChange);
//     socket.on("status_change", handleOrderStatusChange);

//     return () => {
//       socket.disconnect();
//     };
//   }, [user, currentIndex]);

//   // Handle auto-indexing checks if the order list changes size
//   useEffect(() => {
//     if (currentIndex >= activeOrders.length && activeOrders.length > 0) {
//       setCurrentIndex(activeOrders.length - 1);
//     }
//   }, [activeOrders, currentIndex]);

//   const handleNext = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (currentIndex < activeOrders.length - 1) {
//       setCurrentIndex((prev) => prev + 1);
//     } else {
//       router.push("/dashboard/orders");
//     }
//   };

//   const handlePrevious = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (currentIndex > 0) {
//       setCurrentIndex((prev) => prev - 1);
//     }
//   };

//   if (isLoading || activeOrders.length === 0) return null;

//   const currentOrder = activeOrders[currentIndex];
//   if (!currentOrder) return null;

//   // Map database status safely with fallback mapping rules
//   const getStatusInfo = (status: string) => {
//     const normalizedStatus = (status || "").toUpperCase().trim();
    
//     switch (normalizedStatus) {
//       case "PREPARING":
//         return {
//           icon: <ChefHat className="w-4 h-4 animate-bounce" />,
//           text: "Preparing Your Meal",
//           color: "text-orange-600 font-extrabold",
//           bgColor: "bg-orange-50",
//           gradient: "from-orange-400 via-orange-500 to-amber-500"
//         };
//       case "READY":
//         return {
//           icon: <Package className="w-4 h-4 text-white scale-110" />,
//           text: "Ready for Pickup!",
//           color: "text-white font-black tracking-wide",
//           bgColor: "bg-orange-600 px-3",
//           gradient: "from-orange-500 via-red-500 to-red-600 animate-pulse"
//         };
//       default: // PENDING / RECEIVED
//         return {
//           icon: <Clock className="w-4 h-4" />,
//           text: "Order Confirmed",
//           color: "text-orange-600 font-bold",
//           bgColor: "bg-orange-50/60",
//           gradient: "from-orange-300 via-orange-400 to-orange-500"
//         };
//     }
//   };

//   const statusInfo = getStatusInfo(currentOrder.status);

//   return (
//     <div className="fixed bottom-24 left-0 right-0 px-4 z-50 antialiased">
//       <div className="max-w-md mx-auto">
//         <div className={`bg-gradient-to-r ${statusInfo.gradient} p-[2px] rounded-2xl shadow-xl transition-all duration-300`}>
//           <div 
//             className="bg-white rounded-2xl py-3 px-4 cursor-pointer hover:bg-orange-50/5 transition-colors flex items-center justify-between gap-3"
//             onClick={() => router.push("/dashboard/orders")}
//           >
//             {/* Item Thumbnail */}
//             <div className="h-12 w-12 bg-gray-50 border rounded-xl overflow-hidden flex-shrink-0">
//               {currentOrder.items && currentOrder.items.length === 1 ? (
//                 <img 
//                   src={currentOrder.items[0].menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=100"} 
//                   alt="" 
//                   className="w-full h-full object-cover" 
//                 />
//               ) : (
//                 <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full w-full">
//                   {currentOrder.items?.slice(0, 4).map((item, idx) => (
//                     <img 
//                   key={idx} 
//                   src={item.menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=50"} 
//                   alt="" 
//                   className="h-full w-full object-cover rounded" 
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Central Info Stack */}
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center justify-between mb-0.5 gap-2">
//                 <p className="text-sm font-black text-gray-900 truncate">
//                   {currentOrder.items[0]?.menuItem?.name || "Food Item"}
//                   {currentOrder.items.length > 1 && (
//                     <span className="text-orange-500 font-black ml-1">+{currentOrder.items.length - 1} more</span>
//                   )}
//                 </p>
//                 <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wide ${statusInfo.bgColor} ${statusInfo.color} border border-orange-100/20`}>
//                   {statusInfo.icon}
//                   <span>{statusInfo.text}</span>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
//                 <span>Token: CE-{currentOrder.id.slice(-6).toUpperCase()}</span>
//                 {activeOrders.length > 1 && (
//                   <span className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
//                     Order {currentIndex + 1} of {activeOrders.length}
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Navigation Carousel Toggle Arrows */}
//             {activeOrders.length > 1 && (
//               <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
//                 <button
//                   onClick={handlePrevious}
//                   disabled={currentIndex === 0}
//                   className="p-1 rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
//                 >
//                   <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
//                 </button>
//                 <button
//                   onClick={handleNext}
//                   disabled={currentIndex === activeOrders.length - 1}
//                   className="p-1 rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
//                 >
//                   <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Package, ChefHat, Clock } from "lucide-react";
import PusherClient from "pusher-js";

interface OrderItem {
  id: string;
  menuItem: {
    name: string;
    image: string | null;
  };
}

interface ActiveOrder {
  id: string;
  status: string;
  canteenId: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function ActiveOrderTracker() {
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  // Core reusable function to pull active orders from PostgreSQL via Prisma
  const syncActiveOrdersFromDB = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/orders/history?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        // Strict match filtering for active states
        const active = data.orders.filter((o: any) =>
          ["PENDING", "PREPARING", "READY"].includes(o.status.toUpperCase())
        );
        setActiveOrders(active);
      }
    } catch (err) {
      console.error("Failed fetching active order logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. Initial configuration load on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      setIsLoading(false);
      return;
    }
    const parsedUser = JSON.parse(cachedUser);
    setUser(parsedUser);
    syncActiveOrdersFromDB(parsedUser.id);
  }, [syncActiveOrdersFromDB]);

  // 2. ✨ Pusher Real-Time WebSocket Channel Listener Sync
  useEffect(() => {
    if (!user) return;

    // Initialize Pusher Client using your public client key
    const pusher = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "4ea74b7ade3151df8b06", 
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
      }
    );

    // Subscribe to a student-specific channel room matching the user ID
    const channel = pusher.subscribe(`user-${user.id}`);

    // Bind listener event mapped to backend status mutations
    channel.bind("order-status-changed", (updatedOrder: { id: string; status: string }) => {
      console.log("☁️ Real-time Pusher push payload captured:", updatedOrder);
      
      const uppercaseStatus = (updatedOrder.status || "").toUpperCase().trim();

      // If the owner marks the order COMPLETED or CANCELLED, drop it out immediately!
      if (["COMPLETED", "CANCELLED"].includes(uppercaseStatus)) {
        setActiveOrders((prevOrders) => {
          const filteredOrders = prevOrders.filter((o) => o.id !== updatedOrder.id);
          
          // Reset index boundaries smoothly to avoid breaks
          if (currentIndex >= filteredOrders.length) {
            setCurrentIndex(Math.max(0, filteredOrders.length - 1));
          }
          return filteredOrders;
        });
      } else {
        // Otherwise, update the target row item status parameters in place
        setActiveOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === updatedOrder.id ? { ...o, status: uppercaseStatus } : o
          )
        );
      }
    });

    // Cleanup subscription loops securely on lifecycle unmount
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${user.id}`);
      pusher.disconnect();
    };
  }, [user, currentIndex]);

  // Handle auto-indexing checks if the order list changes size
  useEffect(() => {
    if (currentIndex >= activeOrders.length && activeOrders.length > 0) {
      setCurrentIndex(activeOrders.length - 1);
    }
  }, [activeOrders, currentIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < activeOrders.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.push("/dashboard/orders");
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isLoading || activeOrders.length === 0) return null;

  const currentOrder = activeOrders[currentIndex];
  if (!currentOrder) return null;

  // Map database status safely with fallback mapping rules
  const getStatusInfo = (status: string) => {
    const normalizedStatus = (status || "").toUpperCase().trim();
    
    switch (normalizedStatus) {
      case "PREPARING":
        return {
          icon: <ChefHat className="w-4 h-4 animate-bounce" />,
          text: "Preparing Your Meal",
          color: "text-orange-600 font-extrabold",
          bgColor: "bg-orange-50",
          gradient: "from-orange-400 via-orange-500 to-amber-500"
        };
      case "READY":
        return {
          icon: <Package className="w-4 h-4 text-white scale-110" />,
          text: "Ready for Pickup!",
          color: "text-white font-black tracking-wide",
          bgColor: "bg-orange-600 px-3",
          gradient: "from-orange-500 via-red-500 to-red-600 animate-pulse"
        };
      default: // PENDING / RECEIVED
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Order Confirmed",
          color: "text-orange-600 font-bold",
          bgColor: "bg-orange-50/60",
          gradient: "from-orange-300 via-orange-400 to-orange-500"
        };
    }
  };

  const statusInfo = getStatusInfo(currentOrder.status);

  return (
    <div className="fixed bottom-24 left-0 right-0 px-4 z-50 antialiased">
      <div className="max-w-md mx-auto">
        <div className={`bg-gradient-to-r ${statusInfo.gradient} p-[2px] rounded-2xl shadow-xl transition-all duration-300`}>
          <div 
            className="bg-white rounded-2xl py-3 px-4 cursor-pointer hover:bg-orange-50/5 transition-colors flex items-center justify-between gap-3"
            onClick={() => router.push("/dashboard/orders")}
          >
            {/* Item Thumbnail */}
            <div className="h-12 w-12 bg-gray-50 border rounded-xl overflow-hidden flex-shrink-0">
              {currentOrder.items && currentOrder.items.length === 1 ? (
                <img 
                  src={currentOrder.items[0].menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=100"} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full w-full">
                  {currentOrder.items?.slice(0, 4).map((item, idx) => (
                    <img 
                      key={idx} 
                      src={item.menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=50"} 
                      alt="" 
                      className="h-full w-full object-cover rounded" 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Central Info Stack */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5 gap-2">
                <p className="text-sm font-black text-gray-900 truncate">
                  {currentOrder.items[0]?.menuItem?.name || "Food Item"}
                  {currentOrder.items.length > 1 && (
                    <span className="text-orange-500 font-black ml-1">+{currentOrder.items.length - 1} more</span>
                  )}
                </p>
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wide ${statusInfo.bgColor} ${statusInfo.color} border border-orange-100/20`}>
                  {statusInfo.icon}
                  <span>{statusInfo.text}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold">
                <span>Token: CE-{currentOrder.id.slice(-6).toUpperCase()}</span>
                {activeOrders.length > 1 && (
                  <span className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    Order {currentIndex + 1} of {activeOrders.length}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation Carousel Toggle Arrows */}
            {activeOrders.length > 1 && (
              <div className="flex flex-col gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="p-1 rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === activeOrders.length - 1}
                  className="p-1 rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100 disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}