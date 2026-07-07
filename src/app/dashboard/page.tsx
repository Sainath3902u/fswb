"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Utensils, ChevronRight } from "lucide-react";

export default function DashboardHomePage() {
  const [user, setUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();

  // Mapped static data reflecting specific physical spots on the B.M.S.C.E campus
  const canteens = [
    { 
      id: "main-canteen", 
      name: "Main Campus Canteen", 
      subtitle: "Standard meals, South & North Indian lunch", 
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" 
    },
    { 
      id: "nescafe-stall", 
      name: "Nescafe Snack Stall", 
      subtitle: "Quick bites, rolls, coffee & treats", 
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80" 
    },
    { 
      id: "sports-stall", 
      name: "Sports Complex Food Court", 
      subtitle: "Chaats, fast food & cold drinks", 
      image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80" 
    }
  ];

  useEffect(() => {
    // Rely exclusively on your secure local context parsed after passing middleware layers
    const cachedProfile = localStorage.getItem("user");
    if (!cachedProfile) {
      router.push("/auth/login");
    } else {
      setUser(JSON.parse(cachedProfile));
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-br from-orange-500 to-red-500 px-4 py-6 pb-8 relative overflow-hidden">
        
        {/* Floating Food Icons (Left) */}
        <div className="absolute left-1 top-0 h-full w-20 md:left-2 md:w-24 pointer-events-none">
          <div className="absolute left-0 top-0 opacity-70">
            <div className="text-xs md:text-sm mb-8 animate-[float1_4s_ease-in-out_infinite]">🍕</div>
          </div>
          <div className="absolute left-2 top-1 opacity-60">
            <div className="text-xs md:text-sm mb-8 animate-[float2_5s_ease-in-out_infinite_1.5s]">🍔</div>
          </div>
          <div className="absolute left-4 top-0 opacity-80">
            <div className="text-xs md:text-sm mb-8 animate-[float3_6s_ease-in-out_infinite_3s]">🍟</div>
          </div>
          <div className="absolute left-6 top-2 opacity-50">
            <div className="text-xs md:text-sm mb-8 animate-[float1_4s_ease-in-out_infinite_0.5s]">🌮</div>
          </div>
          <div className="absolute left-8 top-0 opacity-75">
            <div className="text-xs md:text-sm mb-8 animate-[float2_5s_ease-in-out_infinite_2.5s]">🍝</div>
          </div>
          <div className="absolute left-10 top-1 opacity-65">
            <div className="text-xs md:text-sm mb-8 animate-[float3_6s_ease-in-out_infinite_3.5s]">🥗</div>
          </div>
          <div className="absolute left-12 top-0 opacity-55">
            <div className="text-xs md:text-sm mb-8 animate-[float1_4s_ease-in-out_infinite_1s]">🍜</div>
          </div>
        </div>

        {/* Floating Food Icons (Right) */}
        <div className="absolute right-1 top-0 h-full w-20 md:right-2 md:w-24 pointer-events-none">
          <div className="absolute right-0 top-0 opacity-70">
            <div className="text-xs md:text-sm mb-8 animate-[float2_5s_ease-in-out_infinite]">☕</div>
          </div>
          <div className="absolute right-2 top-1 opacity-60">
            <div className="text-xs md:text-sm mb-8 animate-[float3_6s_ease-in-out_infinite_1.5s]">🍰</div>
          </div>
          <div className="absolute right-4 top-0 opacity-80">
            <div className="text-xs md:text-sm mb-8 animate-[float1_4s_ease-in-out_infinite_3s]">🥤</div>
          </div>
          <div className="absolute right-6 top-2 opacity-50">
            <div className="text-xs md:text-sm mb-8 animate-[float2_5s_ease-in-out_infinite_0.5s]">🍪</div>
          </div>
          <div className="absolute right-8 top-0 opacity-75">
            <div className="text-xs md:text-sm mb-8 animate-[float3_6s_ease-in-out_infinite_2s]">🧁</div>
          </div>
          <div className="absolute right-10 top-1 opacity-65">
            <div className="text-xs md:text-sm mb-8 animate-[float1_4s_ease-in-out_infinite_2.5s]">🍩</div>
          </div>
          <div className="absolute right-12 top-0 opacity-55">
            <div className="text-xs md:text-sm mb-8 animate-[float2_5s_ease-in-out_infinite_3.5s]">🍦</div>
          </div>
        </div>

        {/* Profile Link Anchor Navigation */}
        <Link
          href="/profile"
          onClick={() => setProfileLoading(true)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 active:scale-95 md:w-12 md:h-12 md:top-6 md:right-6 z-20 focus:outline-none"
          aria-label="Open profile"
        >
          {profileLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent md:h-6 md:w-6"></div>
          ) : (
            <User className="w-5 h-5 text-white md:w-6 md:h-6" />
          )}
        </Link>

        {/* Central App Brand Title */}
        <div className="flex flex-col items-center pt-4 relative z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 hover:scale-105 transition-transform duration-200 md:w-16 md:h-16">
            <Utensils className="w-7 h-7 text-white md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center tracking-wide md:text-3xl">
            Campus Eats
          </h1>
          <p className="text-white/90 text-sm mt-1 text-center md:text-base font-medium">
            B.M.S. College of Engineering Canteen Center
          </p>
        </div>

        {/* Floating Animation Matrix Styles Injection */}
        <style jsx>{`
          @keyframes float1 {
            0% { transform: translateY(-50px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(200px); opacity: 0; }
          }
          @keyframes float2 {
            0% { transform: translateY(-50px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(220px); opacity: 0; }
          }
          @keyframes float3 {
            0% { transform: translateY(-50px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(240px); opacity: 0; }
          }
          @media (min-width: 768px) {
            @keyframes float1 {
              0% { transform: translateY(-50px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(250px); opacity: 0; }
            }
            @keyframes float2 {
              0% { transform: translateY(-50px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(270px); opacity: 0; }
            }
            @keyframes float3 {
              0% { transform: translateY(-50px); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(290px); opacity: 0; }
            }
          }
        `}</style>
      </header>

      {/* Main Selection Area */}
      <main className="p-4 pb-8 md:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1 md:text-2xl">
            Choose Your Canteen
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Hey {user.name}, select a campus dining hub to display their live menu options
          </p>
        </div>

        {/* Relational Canteen Navigation Matrix Cards */}
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {canteens.map((canteen) => (
            <Link
              key={canteen.id}
              href={`/dashboard/${canteen.id}`} // Links cleanly into dynamic slug routes matching middleware configurations
              className="block w-full h-28 rounded-xl overflow-hidden relative group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none md:h-28 lg:h-32 shadow-sm border border-gray-100"
            >
              {/* Card Thumbnail Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${canteen.image})` }}
              />

              {/* Tint overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

              {/* Layout Info Content */}
              <div className="relative h-full flex items-center justify-between px-4">
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-orange-100 transition-colors duration-200 md:text-xl">
                    {canteen.name}
                  </h3>
                  <p className="text-white/80 text-xs group-hover:text-orange-100/80 transition-colors duration-200 md:text-sm">
                    {canteen.subtitle}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 md:w-6 md:h-6" />
              </div>
            </Link>
          ))}
        </div>

        <div className="h-6 md:h-4"></div>
      </main>
    </div>
  );
}