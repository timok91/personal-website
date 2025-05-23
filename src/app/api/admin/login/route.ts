import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    console.log("Attempting login with password:", password ? "provided" : "not provided");
    console.log("Expected password:", process.env.ADMIN_PASSWORD ? "set" : "not set");
    
    // Check password against environment variable
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }
    
    // Set a secure cookie for admin authentication
    const cookieStore = cookies();
    (await cookieStore).set('admin-auth', process.env.ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    console.log("Login successful, cookie set");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin login:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}