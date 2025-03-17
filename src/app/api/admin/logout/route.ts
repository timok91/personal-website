import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
    
    console.log("Logout successful, cookie cleared");
    
    // Redirect to login page
    return NextResponse.redirect(new URL('/admin/login', request.url));
  } catch (error) {
    console.error('Error in admin logout:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}