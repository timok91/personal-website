// src/app/api/admin/logout/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  
  // Clear the admin authentication cookie
  (await
        // Clear the admin authentication cookie
        cookieStore).set('admin-auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  // Redirect to login page
  return NextResponse.redirect(new URL('/admin/login', request.url));
}