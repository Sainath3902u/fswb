import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// ✨ ADDED: Import the floating tracker component
import ActiveOrderTracker from "@/components/ActiveOrderTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Eats",
  description: "B.M.S. College of Engineering Canteen Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative text-gray-900">
        {/* Render pages normally */}
        {children}
        
        {/* ✨ ADDED: Global tracking widget overlay */}
        <ActiveOrderTracker />
      </body>
    </html>
  );
}