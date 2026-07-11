"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Home, ArrowLeft, Minus, Plus, ShoppingBag, ShieldCheck, Clock, FileText, ArrowRight } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  canteenId: string;
}

interface ValidatedCartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  isAvailable: boolean;
  canteenId: string;
}

export default function CartPage() {
  const router = useRouter();

  // Local state parameters
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [validatedCartItems, setValidatedCartItems] = useState<ValidatedCartItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState<boolean>(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [canteenDetails, setCanteenDetails] = useState({ 
    name: "Campus Canteen", 
    subtitle: "B.M.S.C.E Dining Spot" 
  });

  // 1. Load active data safely out of localStorage
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(cachedUser));

    const cachedBasket = localStorage.getItem("cart");
    if (cachedBasket) {
      setCartItems(JSON.parse(cachedBasket));
    } else {
      setIsCartLoading(false);
    }
  }, [router]);

  // 2. Database Validator Hook
  useEffect(() => {
    if (cartItems.length === 0) {
      setValidatedCartItems([]);
      setIsCartLoading(false);
      return;
    }

    async function syncCartWithPostgres() {
      try {
        setIsCartLoading(true);
        const res = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems }),
        });

        const data = await res.json();
        if (data.success) {
          setValidatedCartItems(data.validatedItems);
          if (data.canteen) {
            setCanteenDetails({
              name: data.canteen.name,
              subtitle: data.canteen.subtitle || "Ground Floor Block"
            });
          }
        }
      } catch (error) {
        console.error("Failed to sync basket choices:", error);
      } finally {
        setIsCartLoading(false);
      }
    }

    syncCartWithPostgres();
  }, [cartItems]);

  // Quantity Mutation Sync Helpers
  const updateLocalBasketAndState = (updated: CartItem[]) => {
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const increaseQuantity = (itemId: string) => {
    const updated = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateLocalBasketAndState(updated);
  };

  const decreaseQuantity = (itemId: string) => {
    const updated = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0);
    updateLocalBasketAndState(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  // Financial Pricing Calculations
  const itemTotal = validatedCartItems.reduce((total, item) => {
    return item.isAvailable ? total + (item.price * item.quantity) : total;
  }, 0);

  const handlingCharge = 0; // Blinkit style token item lines
  const tokenGst = Math.round(itemTotal * 0.05); // 5% GST computation
  const finalTotal = itemTotal + tokenGst;
  const totalSavings = validatedCartItems.reduce((total, item) => {
    if (item.isAvailable && item.originalPrice && item.originalPrice > item.price) {
      return total + ((item.originalPrice - item.price) * item.quantity);
    }
    return total;
  }, 0) || Math.round(itemTotal * 0.15); // Fallback savings calc

  const hasOutOfStockItems = validatedCartItems.some(item => !item.isAvailable);

//   const handlePlaceOrder = async () => {
//     if (!user || cartItems.length === 0 || hasOutOfStockItems) return;

//     try {
//       setIsPlacingOrder(true);

//       const orderPayload = {
//         userId: user.id,
//         canteenId: cartItems[0]?.canteenId,
//         items: validatedCartItems.filter(i => i.isAvailable).map(i => ({
//           menuItemId: i.id,
//           quantity: i.quantity,
//           price: i.price
//         })),
//         totalAmount: finalTotal
//       };

//       const res = await fetch("/api/orders/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderPayload)
//       });

//       const data = await res.json();
//       if (data.success) {
//         clearCart();
//         router.push(`/dashboard/orders/confirmation?orderId=${data.orderId}`);
//       } else {
//         alert(data.error || "Order finalization rejected by server pipelines.");
//       }
//     } catch (err) {
//       console.error("Checkout crash loop error:", err);
//       alert("An issue occurred logging transaction models to PostgreSQL.");
//     } finally {
//       setIsPlacingOrder(false);
//     }
//   };

const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0 || hasOutOfStockItems) return;

    try {
      setIsPlacingOrder(true);

      const orderPayload = {
        userId: user.id, // Maps smoothly to your Prisma User model schema
        canteenId: cartItems[0]?.canteenId,
        items: validatedCartItems.filter(i => i.isAvailable).map(i => ({
          menuItemId: i.id,
          quantity: i.quantity,
          price: i.price
        })),
        totalAmount: finalTotal
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success) {
        // ❌ REMOVED: clearCart(); from here to prevent instant empty flashing UI glitches.
        
        // 🚀 REDIRECT ONLY: Let the confirmation page clear the memory on mount safely!
        router.push("/dashboard/orders/confirmation");
      } else {
        alert(data.error || "Order finalization rejected by server pipelines.");
      }
    } catch (err) {
      console.error("Checkout crash loop error:", err);
      alert("An issue occurred logging transaction models to PostgreSQL.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-5 shadow-inner">
          <ShoppingBag className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Your cart is empty</h2>
        <p className="text-sm text-gray-500 max-w-xs mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => router.back()}
          className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-md hover:bg-orange-600 transition-all active:scale-95"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 antialiased pb-32">
      {/* Top sticky Navigation header block */}
      <div className="bg-white shadow-sm sticky top-0 z-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-none">Checkout review</h1>
            <p className="text-[11px] text-gray-500 font-medium mt-1">{cartItems.length} items from your dining hub</p>
          </div>
        </div>
        <Heart className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-500 transition-colors" />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Delivery / Timing Indicator Box (Zepto Style) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-gray-900">Instant Campus Pickup</h2>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Hot</span>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{canteenDetails.name} • {canteenDetails.subtitle}</p>
            <p className="text-xs text-green-600 font-bold mt-1.5">Freshly prepared and ready in 8-10 mins</p>
          </div>
        </div>

        {/* Cart items list wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Items Added</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {validatedCartItems.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 flex items-center gap-4 transition-all ${
                  !item.isAvailable ? 'bg-red-50/40' : 'hover:bg-gray-50/30'
                }`}
              >
                {/* Image Item Thumbnail */}
                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[8px] text-white font-black bg-red-600/90 px-1 py-0.5 rounded">ERR</span>
                    </div>
                  )}
                </div>
                
                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-1">{item.name}</h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">Custom campus portion</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-black text-gray-900 text-sm">₹{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-gray-400 line-through font-medium">₹{item.originalPrice}</span>
                    )}
                  </div>

                  {!item.isAvailable && (
                    <p className="text-red-600 text-[10px] font-black tracking-tight mt-1 bg-red-100/60 inline-block px-2 py-0.5 rounded-md">
                      OUT OF STOCK (Please remove)
                    </p>
                  )}
                </div>

                {/* Blinkit style quantity incrementer controller toggles */}
                <div className="flex items-center bg-orange-500 text-white rounded-lg shadow-sm border border-orange-600 overflow-hidden h-9 flex-shrink-0">
                  <button 
                    onClick={() => decreaseQuantity(item.id)} 
                    className="px-2.5 h-full hover:bg-orange-600 transition-colors flex items-center justify-center active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="px-1 min-w-[20px] text-center text-xs font-black select-none bg-orange-500">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => increaseQuantity(item.id)} 
                    className="px-2.5 h-full hover:bg-orange-600 transition-colors flex items-center justify-center active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed billing breakdown parameters (Blinkit Structure) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">Bill Details</h3>
          </div>

          <div className="p-4 space-y-3 text-xs font-semibold text-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Item total</span>
              <span className="text-gray-900 font-bold">₹{itemTotal}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium">Handling charge</span>
                <span className="text-[10px] text-green-600 font-bold mt-0.5">Campus subsidy active</span>
              </div>
              <div className="text-right">
                <span className="line-through text-gray-400 text-[11px] mr-1.5 font-medium">₹5</span>
                <span className="text-green-600 font-black">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Canteen service commission</span>
              <div className="text-right">
                <span className="line-through text-gray-400 text-[11px] mr-1.5 font-medium">₹12</span>
                <span className="text-green-600 font-black">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Govt Goods & Services Tax (5% GST)</span>
              <span className="text-gray-900 font-bold">₹{tokenGst}</span>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-baseline mt-1">
              <span className="font-black text-gray-900 text-sm">Grand Total</span>
              <span className="font-black text-gray-900 text-base">₹{finalTotal}</span>
            </div>
          </div>

          {/* Green Savings Alert Label stripe */}
          <div className="bg-green-50 px-4 py-2.5 border-t border-green-100 flex items-center justify-between text-xs font-bold text-green-700">
            <span>Total savings on this order</span>
            <span className="font-black bg-green-600 text-white px-2 py-0.5 rounded">Saved ₹{totalSavings}</span>
          </div>
        </div>

        {/* Failsafe platform trust badge protection element footer row */}
        <div className="flex items-center justify-center gap-2 py-2 text-gray-400 select-none">
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Secure token transaction protocol active</span>
        </div>
      </div>

      {/* Premium Sticky Bottom Floating Call-To-Action Payment processing bar block */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-40 flex items-center justify-center">
        <div className="w-full max-w-xl flex items-center justify-between gap-4">
          <div className="text-left hidden xs:block">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total To pay</p>
            <p className="text-xl font-black text-gray-900">₹{finalTotal}</p>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || hasOutOfStockItems || itemTotal === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-between group disabled:bg-gray-300 disabled:cursor-not-allowed select-none active:scale-[0.99]"
          >
            <div className="flex flex-col text-left xs:hidden">
              <span className="text-[9px] font-bold opacity-80 leading-none">TOTAL PAY</span>
              <span className="text-sm font-black mt-0.5">₹{finalTotal}</span>
            </div>
            
            <span className="text-sm mx-auto xs:mx-0 tracking-wide font-black">
              {isPlacingOrder 
                ? "Connecting to gateway..." 
                : hasOutOfStockItems 
                  ? "Remove unavailable items" 
                  : "Proceed to Payment"}
            </span>

            <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-0.5 transition-transform hidden xs:block" />
          </button>
        </div>
      </div>
    </div>
  );
}