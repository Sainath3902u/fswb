"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, ShoppingBag, Info, Phone, FileText, LogOut, ShieldCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "CANTEEN_ADMIN";
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Extract state directly from cookies & localStorage validated by your middleware
    const cachedProfile = localStorage.getItem("user");
    if (!cachedProfile) {
      router.replace('/auth/login');
    } else {
      setUser(JSON.parse(cachedProfile));
    }
    setLoading(false);
  }, [router]);

  const handleSignOut = () => {
    // 1. Scrub frontend state metrics
    localStorage.clear();
    
    // 2. Wipe authorization cookie tokens from the browser stack completely
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;";
    
    // 3. Force redirect back into login barrier route view
    router.replace('/auth/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Helper template element layout for menu listings
  const ProfileLink = ({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle?: string }) => (
    <Link 
      href={href}
      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900 text-sm sm:text-base">{title}</p>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header View Header Strip */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center px-4 py-4 max-w-xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-xl mx-auto">
        {/* Core Account Description Card Block */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl font-bold uppercase">
                {user.name ? user.name.charAt(0) : '?'}
              </span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 capitalize leading-snug">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              
              {/* Dynamic Badge reflecting mapped schema Role enums */}
              <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user.role === 'CANTEEN_ADMIN' ? 'Canteen Admin' : 'Student Account'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Group Elements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Activity</h3>
          </div>
          <ProfileLink 
            href="/orders"
            icon={<ShoppingBag className="w-5 h-5 text-gray-600" />}
            title="Your Orders"
            subtitle="Check order tracking pipeline history"
          />
        </div>

        {/* Secondary Document Navigation Matrices */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Other Information</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <ProfileLink 
              href="/about"
              icon={<Info className="w-5 h-5 text-gray-600" />}
              title="About CampusEats"
            />
            <ProfileLink 
              href="/contact"
              icon={<Phone className="w-5 h-5 text-gray-600" />}
              title="Contact Support"
            />
            <ProfileLink 
              href="/terms"
              icon={<FileText className="w-5 h-5 text-gray-600" />}
              title="Terms & Conditions"
            />
          </div>
        </div>

        {/* System Exit Terminal Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-4 flex items-center justify-center space-x-3 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600" />
            <span className="font-bold text-red-500 group-hover:text-red-600 text-sm sm:text-base">Log Out</span>
          </button>
        </div>
      </main>
    </div>
  );
}