// src/app/api/admin/check-auth/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const authCookie = (await cookieStore).get('admin-auth');
  
  // Check if the auth cookie exists and matches the expected value
  if (authCookie && authCookie.value === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ authenticated: true });
  }
  
  // Return unauthorized status if not authenticated
  return NextResponse.json(
    { authenticated: false, message: 'Not authenticated' },
    { status: 401 }
  );
}