import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Filter Supabase-related cookies
    const supabaseCookies = allCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') || 
      cookie.name.includes('auth')
    );
    
    console.log('API Test - All cookies:', allCookies.length);
    console.log('API Test - Supabase cookies:', supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const supabase = await createClient();
    
    // Test the connection
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('API Test - Auth result:', { hasUser: !!user, userId: user?.id, error: error?.message });
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message || (user ? null : 'Auth session missing!'),
      cookieCount: allCookies.length,
      supabaseCookieCount: supabaseCookies.length,
      cookieNames: supabaseCookies.map(c => c.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Test - Server error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
