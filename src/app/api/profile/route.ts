import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    username, 
    name, 
    first_name, 
    last_name, 
    avatar_url, 
    location,
    email,
    phone,
    bio,
    date_of_birth,
    timezone,
    language,
    theme_preference,
    dietary_restrictions,
    is_private,
    email_notifications,
    role
  } = body;

  // Check if user is trying to update their own role
  if (role && role !== undefined) {
    // Only admins can change roles
    const { data: currentProfile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (currentProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can change user roles' }, { status: 403 });
    }
  }

  const updateData: any = {
    username,
    name,
    first_name,
    last_name,
    avatar_url,
    location,
    email,
    phone,
    bio,
    date_of_birth,
    timezone,
    language,
    theme_preference,
    dietary_restrictions,
    is_private,
    email_notifications,
    updated_at: new Date().toISOString(),
  };

  // Only include role if user is admin
  if (role && role !== undefined) {
    updateData.role = role;
  }

  const { data: profile, error } = await supabase
    .from('profile')
    .update(updateData)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile);
}