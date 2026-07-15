import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose'; // Optimized for edge runtime performance

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Retrieve the token string from the Authorization header or browser cookies
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : request.cookies.get('token')?.value;

  // 2. Decode the JWT Token to inspect role metrics if token exists
  let userPayload: any = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_development_secret_key');
      const { payload } = await jose.jwtVerify(token, secret);
      userPayload = payload;
    } catch (err) {
      console.error("Middleware JWT verification collapsed on reload:", err);
      // If token is invalid/expired on refresh, wipe session and kick back to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 3. Protect Student Dashboard views (`/dashboard`)
  if (pathname.startsWith('/dashboard')) {
    if (!token || !userPayload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    const userRole = (userPayload.role || "").toUpperCase().trim();
    
    // 🛡️ If an OWNER tries to load student pages, bounce them directly to the canteen dashboard
    if (userRole === 'OWNER' || userRole === 'CANTEEN_ADMIN') {
      return NextResponse.redirect(new URL('/canteen/dashboard', request.url));
    }
    
    if (userRole !== 'STUDENT') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 4. ✨ Protect Canteen Merchant Dashboard views (`/canteen`)
  if (pathname.startsWith('/canteen')) {
    if (!token || !userPayload) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    const userRole = (userPayload.role || "").toUpperCase().trim();
    
    // 🛡️ Only let verified owners or canteen admins access merchant operations
    if (userRole !== 'OWNER' && userRole !== 'CANTEEN_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url)); // Boot regular students back to standard dashboard
    }
  }

  return NextResponse.next();
}

// ✨ FIX: Configure middleware tracking boundaries to monitor BOTH student and canteen merchant paths
export const config = {
  matcher: ['/dashboard/:path*', '/canteen/:path*'],
};