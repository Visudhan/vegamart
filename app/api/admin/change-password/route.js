import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 1. Verify current password (for now, just check against env or a local session)
    // In a real app, this would check the database.
    if (currentPassword !== envPassword) {
       // Check if there's a custom password in the DB
       const { data: customPass } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
       if (!customPass || currentPassword !== customPass.value) {
         return NextResponse.json({ success: false, message: 'Current password incorrect' }, { status: 401 });
       }
    }

    // 2. Save new password to Supabase (dynamic override)
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key: 'admin_password', value: newPassword }, { onConflict: 'key' });

    if (error) {
       // If table doesn't exist, we might need to handle it.
       // For this demo, let's assume it works or just log it.
       console.error('Failed to save to admin_settings', error);
       return NextResponse.json({ success: false, message: 'Failed to update password. Table admin_settings may be missing.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
