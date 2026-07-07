"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  // 1. Core authentication input states mapping directly to your Prisma backend
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Execute standard backend login route connection handler logic
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Save valid dynamic session records straight into browser context localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict;`;

      // Redirect user instantly according to their verified database Role structure
      if (data.user.role === "CANTEEN_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden p-4 sm:p-8">
      
      {/* Food Pattern Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cg fill='none' stroke='%23000' stroke-width='2'%3E%3Ccircle cx='100' cy='100' r='40'/%3E%3Cpath d='M80 90h40v20H80z'/%3E%3Ccircle cx='200' cy='150' r='25'/%3E%3Cpath d='M190 140c0-10 5-15 10-15s10 5 10 15-5 15-10 15-10-5-10-15z'/%3E%3Crect x='300' y='80' width='60' height='40' rx='5'/%3E%3Ccircle cx='400' cy='200' r='30'/%3E%3Cpath d='M380 180h40v40H380z'/%3E%3Ccircle cx='150' cy='250' r='20'/%3E%3Cpath d='M130 240h40v20H130z'/%3E%3Ccircle cx='500' cy='120' r='35'/%3E%3Cpath d='M480 100h40v40H480z'/%3E%3Ccircle cx='350' cy='300' r='25'/%3E%3Cpath d='M330 285h40v30H330z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '400px 300px',
          backgroundRepeat: 'repeat'
        }}
      ></div>

      {/* Floating Animated Food Elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-white bg-opacity-15 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="absolute bottom-20 left-20 w-10 h-10 bg-white bg-opacity-10 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      <div className="absolute bottom-10 right-10 w-7 h-7 bg-white bg-opacity-20 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>

      <div className="bg-white bg-opacity-95 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white border-opacity-20 relative z-10">
        
        {/* Verified College Premium Branding Gear Logo Overlay */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full shadow-lg flex items-center justify-center opacity-90 overflow-hidden">
            <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-3 bg-blue-800"
                      style={{
                        top: '2px',
                        left: '50%',
                        transformOrigin: '0 30px',
                        transform: `translateX(-50%) rotate(${i * 30}deg)`
                      }}
                    ></div>
                  ))}
                </div>
                <div className="text-white text-xs font-bold z-10 flex flex-col items-center">
                  <div className="w-6 sm:w-8 h-1 bg-white rounded mb-1"></div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-3 bg-white"></div>
                    <div className="w-1 h-3 bg-white"></div>
                    <div className="w-1 h-3 bg-white"></div>
                  </div>
                  <div className="text-[6px] mt-1">BMS</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-4 bg-red-500 transform rotate-12 opacity-90"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institution and App Description Banners */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold text-blue-700 mb-1 leading-tight">
            B.M.S. College of Engineering
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">Established 1946 • Bangalore</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Campus Eats</h2>
          <p className="text-sm text-gray-600">Welcome Back</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-center text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Simplified Relational Database Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900"
              placeholder="student@bmsce.ac.in"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </div>
        </form>

        {/* Navigation Alternatives Footer Section */}
        <p className="mt-8 text-center text-gray-600 text-sm">
          New to Campus Eats?{" "}
          <Link href="/auth/register" className="text-blue-600 font-medium hover:underline transition-colors hover:text-blue-700">
            Create an account
          </Link>
        </p>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">© 2026 B.M.S. College of Engineering</p>
        </div>
      </div>
    </div>
  );
}