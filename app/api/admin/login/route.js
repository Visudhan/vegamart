import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    let isAuthorized = (password === adminPassword);

    if (!isAuthorized) {
      // Check for custom password in DB
      const { data: customPass } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
      if (customPass && password === customPass.value) {
        isAuthorized = true;
      }
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
