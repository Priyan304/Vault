import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { db } from './storage';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCurrentUser: (data: Partial<Profile>) => void;
}

const AUTH_STORAGE_KEY = 'vault_auth_session_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check persisted user session
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        const profile = db.getProfile(parsed.id) || parsed;
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Session load error', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const rawDB = db.getRawTables();
    let existingProfile = rawDB.profiles.find(
      (p) => p.email.toLowerCase() === cleanEmail
    );

    if (!existingProfile) {
      // Create new account if not found
      existingProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        display_name: cleanEmail.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
        created_at: new Date().toISOString(),
      };
      db.upsertProfile(existingProfile);
    }

    setUser(existingProfile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(existingProfile));
    return { success: true };
  };

  const signup = async (
    email: string,
    _password?: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email is required.' };
    }

    const name = displayName?.trim() || cleanEmail.split('@')[0];
    const newProfile: Profile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      display_name: name,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      created_at: new Date().toISOString(),
    };

    db.upsertProfile(newProfile);
    setUser(newProfile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateCurrentUser = (data: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    db.upsertProfile(updated);
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
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
