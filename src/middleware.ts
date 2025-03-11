import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, supabase } = createClient(request);
  
  // Refresh session if expired
  await supabase.auth.getUser();
  
  // Check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for the login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return response;
    }
    
    // Check for the admin-auth cookie
    const authCookie = request.cookies.get('admin-auth');
    
    // If no auth cookie exists or it's invalid, redirect to login
    if (!authCookie || authCookie.value !== process.env.ADMIN_PASSWORD) {
      // Store the original URL to redirect back after login
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    // Required for Supabase auth
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Admin paths
    '/admin/:path*'
  ],
};