import { NextResponse } from 'next/server';
import { requireRole, handleApiError } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Require admin role
    await requireRole('admin');

    const supabase = await createClient();

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
