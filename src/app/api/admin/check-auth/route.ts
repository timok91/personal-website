import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const authCookie = (await cookieStore).get('admin-auth');
    
    console.log("Auth cookie in check-auth:", authCookie);
    
    // Check if the auth cookie exists and matches the expected value
    if (authCookie && authCookie.value === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ authenticated: true });
    }
    
    // Return unauthorized status if not authenticated
    return NextResponse.json(
      { authenticated: false, message: 'Not authenticated' },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in check-auth:", error);
    return NextResponse.json(
      { authenticated: false, message: 'Error checking authentication' },
      { status: 500 }
    );
  }
}