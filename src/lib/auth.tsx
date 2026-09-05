import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { supabase } from './supabaseClient';
import { db } from './storage';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCurrentUser: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to ensure a profile row exists in public.profiles for an authenticated Supabase user
  const syncUserProfile = async (authUser: { id: string; email?: string; user_metadata?: any }): Promise<Profile> => {
    let profile = await db.getProfile(authUser.id);
    if (!profile) {
      const email = authUser.email || '';
      const name = authUser.user_metadata?.display_name || email.split('@')[0] || 'Vault User';
      profile = {
        id: authUser.id,
        email: email,
        display_name: name,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        created_at: new Date().toISOString(),
      };
      await db.upsertProfile(profile);
    }
    return profile;
  };

  useEffect(() => {
    // 1. Check existing Supabase session on app load
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          const profile = await syncUserProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to get Supabase session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // 2. Listen to real Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await syncUserProfile(session.user);
          setUser(profile);
        } catch (e) {
          console.error('Error syncing profile on auth state change:', e);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required to sign in.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await syncUserProfile(data.user);
        setUser(profile);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during sign in.' };
    }
  };

  const signup = async (
    email: string,
    password?: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email is required.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const name = displayName?.trim() || cleanEmail.split('@')[0];

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            display_name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create initial profile in public.profiles table
        const profile: Profile = {
          id: data.user.id,
          email: cleanEmail,
          display_name: name,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          created_at: new Date().toISOString(),
        };
        await db.upsertProfile(profile);
        setUser(profile);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUser(null);
  };

  const updateCurrentUser = async (data: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await db.upsertProfile(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
