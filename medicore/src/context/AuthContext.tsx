import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthSession, AuthUser } from '../types';
import { getSession, logout as logoutService } from '../services/authService';

interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isPatient: boolean;
  isHospital: boolean;
  isLoading: boolean;
  refreshSession: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(() => {
    const s = getSession();
    setSession(s);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'medicore_session') {
        refreshSession();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshSession]);

  const logout = useCallback(() => {
    logoutService();
    setSession(null);
  }, []);

  const user = session?.user ?? null;
  const isAuthenticated = !!session && !!user;
  const isPatient = isAuthenticated && user?.role === 'patient';
  const isHospital = isAuthenticated && user?.role === 'hospital';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        isPatient,
        isHospital,
        isLoading,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
