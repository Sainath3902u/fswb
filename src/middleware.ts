import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose'; // Use jose as it is fully optimized for edge runtime performance

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Retrieve the token string from the Authorization header or browser cookies
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : request.cookies.get('token')?.value;

  // 2. Protect Student Dashboard views
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_development_secret_key');
      const { payload } = await jose.jwtVerify(token, secret);
      
      if (payload.role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 3. Protect Admin/Canteen Staff Dashboard views (Role-Based Access Control)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_development_secret_key');
      const { payload } = await jose.jwtVerify(token, secret);
      
      if (payload.role !== 'CANTEEN_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url)); // Boot regular users back to standard dashboard
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure middleware tracking boundaries
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};