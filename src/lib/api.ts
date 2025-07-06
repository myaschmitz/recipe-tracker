import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
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
  try {
    console.log('getUserProfile: Starting authentication check');
    const supabase = await createClient();
    console.log('getUserProfile: Supabase client created');

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('getUserProfile: Auth result -', {
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message || 'No user');
      return null;
    }

    console.log('getUserProfile: Starting profile fetch for user:', user.id);
    
    // Get the user profile with a timeout
    const profilePromise = supabase
      .from('profile')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout in API')), 5000)
    );
    
    const { data: profile, error: profileError } = await Promise.race([
      profilePromise, 
      timeoutPromise
    ]) as any;

    if (profileError) {
      console.log('getUserProfile: Profile fetch error:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details
      });
      
      // If profile doesn't exist (PGRST116), that might be normal for new users
      if (profileError.code === 'PGRST116') {
        console.log('getUserProfile: Profile not found for user, might need to be created');
        return null;
      }
      
      return null;
    }

    console.log('getUserProfile: Profile found successfully:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      profileRole: profile?.role
    });
    return profile;
  } catch (error) {
    console.error('getUserProfile: Unexpected error:', error);
    return null;
  }
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
