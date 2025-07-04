import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('profile')
      .select('count')
      .limit(1);

    if (healthError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: healthError.message
      }, { status: 500 });
    }

    // Test auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    return NextResponse.json({
      status: 'ok',
      message: 'Auth service is working',
      hasSession: !!session,
      sessionError: sessionError?.message || null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message
    }, { status: 500 });
  }
}
