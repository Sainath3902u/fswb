"use client";

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  LogOut, 
  ClipboardList, 
  ChefHat, 
  Package, 
  CheckCircle, 
  XCircle,
  Clock,
  Phone,
  MapPin,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PusherClient from 'pusher-js';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  userId: string;
  canteenId: string;
  items: OrderItem[];
  user?: {
    name: string;
    phone?: string | null;
  } | null;
}

export default function CanteenOwnerDashboard() {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ownerUser, setOwnerUser] = useState<any>(null);

  // 1. Authorization & Authentication Lock Check Loop
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(cachedUser);
    
    // Strict Role-Based Access Control Rule check validation matching CANTEEN_ADMIN enum
    if (parsedUser.role !== "CANTEEN_ADMIN") {
      router.push("/dashboard"); // Kick out standard students to standard view
      return;
    }

    setOwnerUser(parsedUser);
    setAuthLoading(false);
  }, [router]);

  // 2. Initial HTTP Data Load Routine for Canteen Orders
  useEffect(() => {
    if (!ownerUser) return;

    // ✨ FIX: Robust fallback matching either key casing saved in localStorage
    const activeCanteenId = ownerUser.canteenId || ownerUser.canteenID || "";

    const fetchCanteenOrders = async () => {
      try {
        // Fetching orders tied to this owner's specific canteen
        const res = await fetch(`/api/orders/history?canteenId=${activeCanteenId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed loading canteen order history array:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchCanteenOrders();
  }, [ownerUser]);

  // 3. ✨ Real-time Pusher WebSockets Sync for Incoming Canteen Submissions
  // useEffect(() => {
  //   if (!ownerUser) return;

  //   // ✨ FIX: Standardized canteen ID resolver to open the socket pipeline successfully
  //   const activeCanteenId = ownerUser.canteenId || ownerUser.canteenID || "";
  //   if (!activeCanteenId) return;

  //   const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "4ea74b7ade3151df8b06";
  //   const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  //   const pusher = new PusherClient(pusherKey, {
  //     cluster: pusherCluster,
  //   });

  //   // Subscribing to this specific canteen's alert channel pipeline
  //   const channel = pusher.subscribe(`canteen-${activeCanteenId}`);

  //   // Listen for incoming new order placements
  //   channel.bind("canteen-new-order", (newOrder: Order) => {
  //     console.log("📡 New incoming live order caught:", newOrder);
  //     setOrders((prevOrders) => {
  //       if (prevOrders.some(o => o.id === newOrder.id)) return prevOrders;
  //       return [newOrder, ...prevOrders];
  //     });
  //   });

  //   // Listen for client status updates or adjustments from test triggers
  //   channel.bind("order-status-changed", (updatedPayload: { id: string; status: string }) => {
  //     console.log("📡 Live order status transition update captured:", updatedPayload);
  //     setOrders((prevOrders) =>
  //       prevOrders.map((o) =>
  //         o.id === updatedPayload.id ? { ...o, status: updatedPayload.status.toUpperCase() } : o
  //       )
  //     );
  //   });

  //   return () => {
  //     channel.unbind_all();
  //     pusher.unsubscribe(`canteen-${activeCanteenId}`);
  //     pusher.disconnect();
  //   };
  // }, [ownerUser]);

// 3. ✨ UPGRADED: Real-time Pusher WebSockets Sync with Duplication & State Overwrite Handling
  useEffect(() => {
    if (!ownerUser) return;

    const activeCanteenId = ownerUser.canteenId || ownerUser.canteenID || "";
    if (!activeCanteenId) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "4ea74b7ade3151df8b06";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

    const pusher = new PusherClient(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe(`canteen-${activeCanteenId}`);

    // Listen for incoming new order placements (Fires instantly upon successful Razorpay verification)
    channel.bind("canteen-new-order", (newOrder: Order) => {
      console.log("📡 Live Canteen Event: Incoming order transaction update caught:", newOrder);
      
      setOrders((prevOrders) => {
        const orderExists = prevOrders.some(o => o.id === newOrder.id);
        const normalizedOrder = { ...newOrder, status: newOrder.status?.toUpperCase() };

        if (orderExists) {
          // ✨ THE CRITICAL FIX: Replaces the stale checkout-state entry with the fully verified server record instantly
          console.log(`🔄 Overwriting existing order ID CE-${newOrder.id.slice(-6).toUpperCase()} state to: ${normalizedOrder.status}`);
          return prevOrders.map(o => o.id === newOrder.id ? normalizedOrder : o);
        }
        
        // If it doesn't exist yet in the local list array pool, simply prepend it to the top cleanly
        return [normalizedOrder, ...prevOrders];
      });
    });

    // Listen for merchant pipeline updates (Accept, Ready, Delivered)
    channel.bind("order-status-changed", (updatedPayload: { id: string; status: string }) => {
      console.log("📡 Live Canteen Event: State transition update captured:", updatedPayload);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === updatedPayload.id ? { ...o, status: updatedPayload.status.toUpperCase() } : o
        )
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`canteen-${activeCanteenId}`);
      pusher.disconnect();
    };
  }, [ownerUser]);

  // 4. State Mutations: Update Next.js Backend Endpoint API Handlers
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/test-trigger?orderId=${orderId}&status=${newStatus.toUpperCase()}`);
      const data = await res.json();
      
      if (data.success) {
        // Optimistic local state adjustment updates inside dashboard views
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus.toUpperCase() } : o
          )
        );
      } else {
        alert("Operation failed: " + data.error);
      }
    } catch (err) {
      console.error("Failed communicating status change mutations:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  // Guard Condition Blocks rendering frames before verification passes
  if (authLoading || pageLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-orange-600 animate-pulse">Synchronizing Dashboard Channels...</div>;
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const OrderCard = ({ order, type }: { order: Order, type: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-3 border border-gray-100">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Token: CE-{order.id.slice(-6).toUpperCase()}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {formatTime(order.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate font-semibold">{order.user?.name || "Campus Student"}</p>
        </div>
        <div className="text-right ml-2">
          <p className="text-lg sm:text-xl font-bold text-green-600">₹{order.totalAmount}</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          {order.items?.map((item, idx) => (
            <p key={idx} className="text-xs sm:text-sm text-gray-700 font-medium">
              • {item.menuItem?.name} <span className="text-orange-600 font-bold">x{item.quantity}</span>
            </p>
          ))}
        </div>
        
        {/* Customer Information Block */}
        <div className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm">
          {/* ✨ FIX: Render default fallback number seamlessly since User table lacks phone properties */}
          <a 
            href={`tel:${order.user?.phone || "9999999999"}`} 
            className="flex items-center gap-2 text-blue-600 font-semibold active:text-blue-700"
          >
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{order.user?.phone || "9999999999 (No Phone Provided)"}</span>
          </a>
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Canteen Dining Desk / Pickup Box</span>
          </div>
        </div>
      </div>

      {/* Action Decision Flow Triggers */}
      {type === 'new' && (
        <div className="flex gap-2">
          <button 
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            className="flex-1 bg-green-500 text-white py-2.5 px-3 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors shadow-sm"
          >
            Accept Order
          </button>
          <button 
            onClick={() => updateOrderStatus(order.id, 'cancelled')}
            className="w-20 py-2.5 border-2 border-red-500 text-red-500 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
      {type === 'preparing' && (
        <button 
          onClick={() => updateOrderStatus(order.id, 'ready')}
          className="w-full bg-purple-500 text-white py-2.5 px-3 rounded-lg font-bold text-sm hover:bg-purple-600 transition-colors shadow-sm"
        >
          Mark as Ready
        </button>
      )}
      {type === 'ready' && (
        <button 
          onClick={() => updateOrderStatus(order.id, 'completed')}
          className="w-full bg-green-500 text-white py-2.5 px-3 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors shadow-sm"
        >
          Mark as Delivered
        </button>
      )}
    </div>
  );

  // Filtering data subsets based on reactive schema string enum categories
  const newOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PAID');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');
  const deliveredOrders = orders.filter(o => o.status === 'COMPLETED');
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

  const tabs = [
    { id: 'new', label: 'New', fullLabel: 'Incoming Requests', icon: ClipboardList, color: 'blue', data: newOrders, count: newOrders.length },
    { id: 'preparing', label: 'Preparing', fullLabel: 'In Cooking Queue', icon: ChefHat, color: 'orange', data: preparingOrders, count: preparingOrders.length},
    { id: 'ready', label: 'Ready', fullLabel: 'Awaiting Counter Pickup', icon: Package, color: 'purple', data: readyOrders ,count: readyOrders.length },
    { id: 'delivered', label: 'Delivered', fullLabel: 'Archived Completed Orders', icon: CheckCircle, color: 'green', data: deliveredOrders ,count: deliveredOrders.length},
    { id: 'cancelled', label: 'Cancelled', fullLabel: 'Rejected / Refused Transactions', icon: XCircle, color: 'red', data: cancelledOrders ,count: cancelledOrders.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 antialiased text-gray-900">
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-gray-900 truncate">
                B.M.S.C.E Canteen Center
              </h1>
              <p className="text-xs text-orange-600 font-bold">Authorized Merchant Gateway Panel</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {newOrders.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                )}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors border"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link 
                        href="/canteen/dashboard/manage_menu"
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <ClipboardList className="w-4 h-4 text-orange-500" />
                        Manage Menu Items
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out Gate
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto hide-scrollbar border-t border-gray-50">
          <div className="flex gap-3 px-4 pb-3 pt-3 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              const activeBgMap: Record<string, string> = {
                blue: 'bg-blue-50 border-blue-400 text-blue-700',
                orange: 'bg-orange-50 border-orange-400 text-orange-700',
                purple: 'bg-purple-50 border-purple-400 text-purple-700',
                green: 'bg-green-50 border-green-400 text-green-700',
                red: 'bg-red-50 border-red-400 text-red-700'
              };

              const counterBadgeMap: Record<string, string> = {
                blue: 'bg-blue-600 text-white',
                orange: 'bg-orange-600 text-white',
                purple: 'bg-purple-600 text-white',
                green: 'bg-green-600 text-white',
                red: 'bg-red-600 text-white'
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all border shadow-sm min-w-[85px] ${
                    isActive
                      ? `${activeBgMap[tab.color]} border-2 font-bold scale-105 shadow-sm`
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-bold whitespace-nowrap">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`absolute -top-1.5 -right-1.5 ${counterBadgeMap[tab.color]} text-[10px] px-1.5 py-0.5 rounded-full font-black min-w-[20px] text-center border border-white shadow-sm`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-black text-gray-900 mb-0.5">
            {tabs.find(t => t.id === activeTab)?.fullLabel}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {activeTab === 'new' && 'Accept or reject incoming new campus customer transactions'}
            {activeTab === 'preparing' && 'Mark kitchen tickets as ready when food preparation concludes'}
            {activeTab === 'ready' && 'Orders prepared and waiting collection at pickup window channels'}
            {activeTab === 'delivered' && 'Orders safely fulfilled and collected'}
            {activeTab === 'cancelled' && 'Orders rejected or canceled during operation window bars'}
          </p>
        </div>

        <div className="mt-2">
          {tabs.find(t => t.id === activeTab)?.data.length ? (
            tabs.find(t => t.id === activeTab)?.data.map(order => (
              <OrderCard key={order.id} order={order} type={activeTab} />
            ))
          ) : (
            <div className="text-center py-20 bg-white border rounded-2xl shadow-sm">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-400">No current tickets found in this group</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}