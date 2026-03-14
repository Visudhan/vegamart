import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const { password } = await request.json();
    // 1. Check for custom password in DB first
    const { data: customPass } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    let isAuthorized = false;

    if (customPass) {
      // If a custom password exists, ONLY use that
      isAuthorized = (password === customPass.value);
    } else {
      // Fallback to environment variable or default only if no custom password is set
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      isAuthorized = (password === adminPassword);
    }

    if (isAuthorized) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
