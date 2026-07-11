"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, ShoppingBag, Home, ShoppingCart, Package, Star, RotateCcw } from "lucide-react";

export default function OrdersPage () {
  const router = useRouter();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 1. Fetch live PostgreSQL history records
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(cachedUser);

    async function fetchUserOrders() {
      try {
        setPageLoading(true);
        const res = await fetch(`/api/orders/history?userId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error pulling history from PostgreSQL:", error);
      } finally {
        setPageLoading(false);
      }
    }

    fetchUserOrders();
  }, [router]);

  // Reorder handler syncing back to localStorage
  const handleReorder = (order: any) => {
    const existingCartRaw = localStorage.getItem("cart");
    let currentCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];

    order.items.forEach((item: any) => {
      const targetId = item.menuItemId || item.id;
      const existingIdx = currentCart.findIndex((c: any) => c.id === targetId);

      if (existingIdx > -1) {
        currentCart[existingIdx].quantity += item.quantity;
      } else {
        currentCart.push({
          id: targetId,
          quantity: item.quantity,
          canteenId: order.canteenId
        });
      }
    });

    localStorage.setItem("cart", JSON.stringify(currentCart));
    router.push("/dashboard/cart");
  };

  const openRatingModal = (order: any) => {
    setSelectedOrder(order);
    setIsRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setSelectedOrder(null);
    setIsRatingModalOpen(false);
  };

  const handleRatingSuccess = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rated: true } : o));
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => ["PENDING", "PREPARING", "READY"].includes(o.status?.toUpperCase()));
  const completedOrders = orders.filter(o => ["COMPLETED", "CANCELLED"].includes(o.status?.toUpperCase()));
  const itemsToDisplay = activeTab === "active" ? activeOrders : completedOrders;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-32 antialiased">
      {/* Header Bar */}
      <div className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100 px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-orange-50 rounded-full transition-colors active:scale-95 text-gray-800 hover:text-orange-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-none">Your Orders</h1>
            <p className="text-[11px] text-gray-500 mt-1 font-semibold">Track live token status</p>
          </div>
        </div>
        
        {/* ✨ IMPROVED UI: Vibrant Orange Segmented Tabs Context */}
        <div className="bg-orange-50/60 rounded-xl p-1 flex gap-1 border border-orange-100">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all uppercase tracking-wider text-center ${
              activeTab === "active" 
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                : "text-orange-700/70 hover:text-orange-600 hover:bg-white/40"
            }`}
          >
            Active tracker ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all uppercase tracking-wider text-center ${
              activeTab === "completed" 
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                : "text-orange-700/70 hover:text-orange-600 hover:bg-white/40"
            }`}
          >
            Past history ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Main List Container Area */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {itemsToDisplay.length === 0 && (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center flex flex-col items-center py-14">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100 shadow-inner">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">No orders logged</h3>
            <p className="text-xs text-gray-400 max-w-xs mt-1 font-medium">Your menu purchases will appear here instantly.</p>
          </div>
        )}

        {/* Dynamic Card Loops */}
        <div className="space-y-4">
          {itemsToDisplay.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onReorder={handleReorder} 
              onRate={openRatingModal} 
            />
          ))}
        </div>
      </div>
      
      {isRatingModalOpen && (
        <RatingModal 
          order={selectedOrder} 
          onClose={closeRatingModal} 
          onSuccess={handleRatingSuccess} 
        />
      )}

      {/* ✨ IMPROVED UI: Colored Persistent Bottom Bar Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(249,115,22,0.04)] flex justify-around p-2.5 z-40">
        <Link href="/dashboard" className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-orange-500 transition-colors py-1">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link href="/dashboard/orders" className="flex flex-col items-center gap-0.5 text-orange-500 font-black py-1">
          <Package className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5">Orders</span>
        </Link>
        <Link href="/dashboard/cart" className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-orange-500 transition-colors py-1">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Cart</span>
        </Link>
      </nav>
    </div>
  );
}

// 📦 Reusable Zepto-Blinkit Grid Layout Order Card Component
const OrderCard = ({ order, onReorder, onRate }: { order: any; onReorder: any; onRate: any }) => {
  const getStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING": 
        return { text: "Placed", icon: <ShoppingBag className="w-3 h-3 stroke-[2.5]" />, color: "bg-blue-50 text-blue-700 border-blue-100" };
      case "PREPARING": 
        return { text: "Preparing", icon: <Clock className="w-3 h-3 stroke-[2.5]" />, color: "bg-orange-50 text-orange-600 border-orange-100 animate-pulse font-extrabold" };
      case "READY": 
        return { text: "Ready for Pickup", icon: <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />, color: "bg-purple-50 text-purple-700 border-purple-100 font-black animate-bounce" };
      case "CANCELLED": 
        return { text: "Cancelled", icon: <AlertCircle className="w-3 h-3 stroke-[2.5]" />, color: "bg-red-50 text-red-600 border-red-100" };
      default: 
        return { text: "Delivered", icon: <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />, color: "bg-green-50 text-green-700 border-green-100" };
    }
  };

  const statusInfo = getStatusInfo(order.status);
  const orderTime = new Date(order.createdAt).toLocaleString("en-IN", { 
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit" 
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4 hover:shadow-md hover:border-orange-100 transition-all duration-200">
      {/* Top Card Section */}
      <div className="flex items-start justify-between border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
            {order.items && order.items.length === 1 ? (
              <img 
                src={order.items[0].menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=120"} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full w-full">
                {order.items?.slice(0, 4).map((item: any, idx: number) => (
                  <img 
                    key={idx} 
                    src={item.menuItem?.image || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=60"} 
                    alt="" 
                    className="h-full w-full object-cover rounded" 
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border w-fit ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.text}
            </div>
            <h4 className="font-black text-sm text-gray-900 mt-1 leading-tight line-clamp-1">
              {order.canteen?.name || "Campus Dining Hub"}
            </h4>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">ID: CE-{order.id.slice(-6)}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-sm font-black text-orange-600">₹{order.totalAmount}</span>
          <span className="text-[10px] text-gray-400 font-semibold mt-0.5 whitespace-nowrap">{orderTime}</span>
        </div>
      </div>

      {/* List Container Rows */}
      <div className="space-y-2 bg-orange-50/30 rounded-xl p-3 border border-orange-100/40 text-xs font-semibold text-gray-600">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center">
            <span className="text-gray-700 truncate pr-4">
              {item.menuItem?.name} <span className="text-orange-500 font-black ml-1">×{item.quantity}</span>
            </span>
            <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      
      {/* ✨ IMPROVED UI: Colored Interactive Footer Buttons */}
      <div className="flex gap-3 mt-1">
        <button 
          onClick={() => onReorder(order)} 
          className="flex-1 py-2.5 px-4 bg-white border border-orange-200 text-orange-600 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:bg-orange-50/50 active:scale-[0.98]"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Repeat Order</span>
        </button>
        <button 
          onClick={() => onRate(order)} 
          disabled={order.rated || order.status?.toUpperCase() !== "COMPLETED"} 
          className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-xl font-black text-xs hover:bg-orange-600 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:border-none disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-[0.98]"
        >
          <Star className="w-3.5 h-3.5 stroke-[2.5] fill-current" />
          <span>{order.rated ? "Rated" : "Rate Items"}</span>
        </button>
      </div>
    </div>
  );
};

// 🌟 Premium Feedback Overlay Card Modal component
function RatingModal({ order, onClose, onSuccess }: { order: any; onClose: any; onSuccess: any }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !order) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/orders/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          rating: rating
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(order.id);
      }
    } catch (error) {
      console.error("Failed executing rating registration:", error);
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end xs:items-center justify-center p-0 xs:p-4 transition-all">
      <div className="bg-white rounded-t-3xl xs:rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-100 flex flex-col max-h-[85vh] overflow-y-auto transform scale-100 transition-transform duration-200">
        <h2 className="text-lg font-black text-gray-900 text-center tracking-tight">Rate items cooked</h2>
        <p className="text-center text-xs text-gray-400 font-medium mt-1 mb-6 px-4">
          How was your meal from {order?.canteen?.name || "the canteen"}? Your feedback keeps campus quality high!
        </p>
        
        {/* Star Selection Row using App Themes */}
        <div className="flex justify-center gap-2.5 my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transform transition-transform hover:scale-125 active:scale-95 p-0.5 focus:outline-none"
              aria-label={`Rate ${star} star`}
            >
              <Star 
                className={`w-9 h-9 transition-colors duration-150 ${
                  rating >= star ? "text-orange-500 fill-orange-500 stroke-orange-600" : "text-gray-200 stroke-gray-300"
                }`} 
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-orange-500 text-white font-black py-3 rounded-xl mt-8 text-xs disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md shadow-orange-500/20 select-none tracking-wider uppercase active:scale-[0.99]"
        >
          {submitting ? "Submitting feedback..." : "Submit Review"}
        </button>
        <button
          onClick={onClose}
          className="w-full text-orange-500 font-bold py-2 rounded-xl mt-2 text-xs hover:bg-orange-50 transition-colors select-none text-center"
        >
          Skip / Dismiss
        </button>
      </div>
    </div>
  );
}