import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function resolveAdminStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAdminStatus = useCallback(async () => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

    try {
      const admin = await resolveAdminStatus(user.id);
      setIsAdmin(admin);
    } catch (error) {
      console.error('Admin role check failed:', error);
      setIsAdmin(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        const currentSession = data.session;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          const admin = await resolveAdminStatus(currentSession.user.id);
          if (mounted) {
            setIsAdmin(admin);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const { data: subscriptionData } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user?.id) {
        void resolveAdminStatus(nextSession.user.id)
          .then((admin) => {
            if (mounted) {
              setIsAdmin(admin);
            }
          })
          .catch((error) => {
            console.error('Auth state admin check failed:', error);
            if (mounted) {
              setIsAdmin(false);
            }
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      mounted = false;
      subscriptionData.subscription.unsubscribe();
    };
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }, []);

  const signout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setIsAdmin(false);
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      isAdmin,
      signin,
      signout,
      refreshAdminStatus,
      isAuthenticated: Boolean(session && user),
    }),
    [user, session, loading, isAdmin, signin, signout, refreshAdminStatus],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
