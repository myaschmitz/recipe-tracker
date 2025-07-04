import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { UserRole } from '@/lib/schemas';

export const handleApiError = (error: any, context: string) => {
  console.error(`Error ${context}: ${error}`);
  return NextResponse.json({ error: error.message }, { status: 500 });
};

export const createSuccessResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, { status });
};

export const validateRequired = (fields: Record<string, any>) => {
  const missing = Object.entries(fields)
    .filter(
      ([key, value]) =>
        !value || (typeof value === "string" && value.trim() === "")
    )
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

// Role checking utilities
export const getUserProfile = async () => {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ 
    cookies: () => Promise.resolve(cookieStore) 
  });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile;
};

export const checkUserRole = async (requiredRole: UserRole) => {
  const profile = await getUserProfile();
  if (!profile) {
    return { authorized: false, profile: null };
  }

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3
  };

  const userLevel = roleHierarchy[profile.role as UserRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  return {
    authorized: userLevel >= requiredLevel,
    profile
  };
};

export const requireAuth = async () => {
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error('Authentication required');
  }
  return profile;
};

export const requireRole = async (requiredRole: UserRole) => {
  const { authorized, profile } = await checkUserRole(requiredRole);
  if (!authorized) {
    throw new Error(`Insufficient permissions. ${requiredRole} role required.`);
  }
  return profile;
};

// Constants for consistent API behavior
export const DEFAULT_RECIPE_LIMIT = 1000;
export const DEFAULT_API_TIMEOUT = 30000;
