import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check that doesn't require database
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'ok',
      message: 'Auth endpoints are accessible',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Auth check failed',
      error: error.message
    }, { status: 500 });
  }
}
