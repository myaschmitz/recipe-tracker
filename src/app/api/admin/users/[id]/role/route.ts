import { NextResponse } from 'next/server';
import { requireRole, handleApiError } from '@/lib/api';
import { userRoleSchema } from '@/lib/schemas';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin role
    await requireRole('admin');

    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    const { cookies } = require('next/headers');
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const body = await request.json();
    const { role } = body;

    // Validate role
    const validatedRole = userRoleSchema.parse(role);

    // Update user role
    const { data: profile, error } = await supabase
      .from('profile')
      .update({ 
        role: validatedRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('id, username, role')
      .single();

    if (error) {
      throw error;
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `User ${profile.username} role updated to ${validatedRole}`,
      profile
    });
  } catch (error: any) {
    if (error.message.includes('permissions') || error.message.includes('role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }
    return handleApiError(error, 'updating user role');
  }
}
