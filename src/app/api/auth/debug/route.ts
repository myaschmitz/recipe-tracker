import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
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

    // Test auth via validated user lookup (getUser verifies the token server-side)
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    return NextResponse.json({
      status: 'ok',
      message: 'Auth service is working',
      hasUser: !!user,
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
