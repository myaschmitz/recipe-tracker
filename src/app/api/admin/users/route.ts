import { NextResponse } from 'next/server';
import { requireRole, handleApiError } from '@/lib/api';

export async function GET() {
  try {
    // Require admin role
    await requireRole('admin');

    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    const { cookies } = require('next/headers');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Fetch all users with their profiles
    const { data: profiles, error } = await supabase
      .from('profile')
      .select('id, username, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(profiles);
  } catch (error: any) {
    if (error.message.includes('permissions') || error.message.includes('role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return handleApiError(error, 'fetching users');
  }
}
