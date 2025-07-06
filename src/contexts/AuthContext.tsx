'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  updated_at?: string;
  username: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  location?: string;
  email?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  timezone?: string;
  language: string;
  theme_preference: string;
  dietary_restrictions?: string[];
  is_private: boolean;
  email_notifications: boolean;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, firstName?: string, lastName?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Create supabase client
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    
    // Set a timeout to prevent infinite loading (reduced to 5 seconds for faster feedback)
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout reached');
        setLoading(false);
      }
    }, 5000); // Reduced from 15 to 5 seconds

    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('initAuth: Starting authentication check...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('initAuth: Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('initAuth: Session check complete, session exists:', !!session);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('initAuth: User found, fetching profile...');
            await fetchProfile(session.user.id);
          } else {
            console.log('initAuth: No user session, setting loading to false immediately');
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('initAuth: Error in initAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: Session | null) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Add a race condition with timeout for the profile fetch
      const profilePromise = supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating initial profile');
          await createInitialProfile(userId);
        } else if (error.message === 'Profile fetch timeout') {
          console.error('Profile fetch timed out - setting basic profile');
          setProfile({
            id: userId,
            username: `user_${userId.slice(-8)}`,
            name: '',
            first_name: '',
            last_name: '',
            avatar_url: '',
            location: '',
            email: '',
            phone: '',
            bio: '',
            date_of_birth: '',
            timezone: '',
            language: 'en',
            theme_preference: 'system',
            dietary_restrictions: [],
            is_private: false,
            email_notifications: true,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setLoading(false);
        } else {
          console.error('Profile fetch error:', error.message);
          // Set loading to false even on error so UI doesn't hang
          setLoading(false);
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error);
      
      // Handle timeout or other errors gracefully
      if (error.message === 'Profile fetch timeout') {
        console.error('Profile fetch timed out - setting basic fallback profile');
      }
      
      // Set a basic fallback profile to prevent app from breaking
      setProfile({
        id: userId,
        username: `user_${userId.slice(-8)}`,
        name: '',
        first_name: '',
        last_name: '',
        avatar_url: '',
        location: '',
        email: '',
        phone: '',
        bio: '',
        date_of_birth: '',
        timezone: '',
        language: 'en',
        theme_preference: 'system',
        dietary_restrictions: [],
        is_private: false,
        email_notifications: true,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Always set loading to false to prevent infinite loading
      setLoading(false);
    }
  };

  const createInitialProfile = async (userId: string, firstName?: string, lastName?: string, username?: string) => {
    try {
      console.log('Creating initial profile for user:', userId);
      
      const profileData = {
        id: userId,
        username: username || `user_${userId.slice(-8)}`,
        name: firstName && lastName ? `${firstName} ${lastName}` : '',
        first_name: firstName || '',
        last_name: lastName || '',
        avatar_url: '',
        location: '',
        email: '',
        phone: '',
        bio: '',
        date_of_birth: '',
        timezone: '',
        language: 'en',
        theme_preference: 'system',
        dietary_restrictions: [],
        is_private: false,
        email_notifications: true,
        role: 'user',
        created_at: new Date().toISOString()
      };

      // Add timeout to profile creation
      const createPromise = supabase
        .from('profile')
        .insert([profileData])
        .select()
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile creation timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([createPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error creating profile:', error);
        // Set a basic profile even if creation fails
        setProfile({
          id: userId,
          username: username || `user_${userId.slice(-8)}`,
          name: firstName && lastName ? `${firstName} ${lastName}` : '',
          first_name: firstName || '',
          last_name: lastName || '',
          avatar_url: '',
          location: '',
          email: '',
          phone: '',
          bio: '',
          date_of_birth: '',
          timezone: '',
          language: 'en',
          theme_preference: 'system',
          dietary_restrictions: [],
          is_private: false,
          email_notifications: true,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setLoading(false);
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error in createInitialProfile:', error);
      // Set a basic profile as fallback
      setProfile({
        id: userId,
        username: username || `user_${userId.slice(-8)}`,
        name: firstName && lastName ? `${firstName} ${lastName}` : '',
        first_name: firstName || '',
        last_name: lastName || '',
        avatar_url: '',
        location: '',
        email: '',
        phone: '',
        bio: '',
        date_of_birth: '',
        timezone: '',
        language: 'en',
        theme_preference: 'system',
        dietary_restrictions: [],
        is_private: false,
        email_notifications: true,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, firstName?: string, lastName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName || '',
          last_name: lastName || '',
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profile')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}