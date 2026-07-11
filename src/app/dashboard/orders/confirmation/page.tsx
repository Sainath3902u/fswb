"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle, ArrowRight, ShoppingBag, Clock } from "lucide-react";

export default function ConfirmationPage() {
  
  useEffect(() => {
    // ✨ FIX: Wipes local memory securely on mount so the cart resets back to zero state
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 antialiased">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-md w-full flex flex-col items-center text-center">
        {/* Animated Check badge icon wrapper */}
        <div className="w-20 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <CheckCircle className="w-12 h-12 text-green-600 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-gray-500 font-medium px-4 mb-6 leading-relaxed">
          Thank you for your purchase! Your order token has been created and transmitted directly to the canteen counter.
        </p>

        {/* Zepto/Blinkit style mini order card status update indicator box */}
        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-3 mb-8 text-left">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Estimated Setup Time</h4>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Ready for hot pickup in 8-10 minutes</p>
          </div>
        </div>

        {/* Redirect Controls */}
        <div className="w-full space-y-3">
          <Link 
            href="/dashboard" 
            className="w-full bg-orange-500 text-white font-black py-3.5 px-6 rounded-xl hover:bg-orange-600 transition-colors shadow-md flex items-center justify-center gap-2 group text-sm select-none"
          >
            <span>Back to Canteens</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link 
            href="/dashboard/orders" 
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm select-none"
          >
            <ShoppingBag className="w-4 h-4 text-gray-400" />
            <span>Track Order Logs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}