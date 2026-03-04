import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import { getConfiguredAdminEmail, isAuthorizedAdminEmail } from '@/app/utils/admin-access';

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

async function resolveAdminStatus(userId: string, email: string | null | undefined): Promise<boolean> {
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  const configuredAdminEmail = getConfiguredAdminEmail();

  if (!configuredAdminEmail || !isAuthorizedAdminEmail(normalizedEmail)) {
    return false;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email')
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
    if (!user?.id || !user?.email) {
      setIsAdmin(false);
      return;
    }

    try {
      const admin = await resolveAdminStatus(user.id, user.email);
      setIsAdmin(admin);
    } catch (error) {
      console.error('Admin role check failed:', error);
      setIsAdmin(false);
    }
  }, [user?.email, user?.id]);

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

        if (currentSession?.user?.id && currentSession.user.email) {
          const admin = await resolveAdminStatus(currentSession.user.id, currentSession.user.email);
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

      if (nextSession?.user?.id && nextSession.user.email) {
        if (mounted) {
          setLoading(true);
        }

        void resolveAdminStatus(nextSession.user.id, nextSession.user.email)
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
          })
          .finally(() => {
            if (mounted) {
              setLoading(false);
            }
          });
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscriptionData.subscription.unsubscribe();
    };
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    if (!isAuthorizedAdminEmail(email)) {
      throw new Error('Access denied. This admin area is restricted to the configured administrator email.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const resolvedEmail = data.user?.email ?? data.session?.user?.email ?? email;
    if (!isAuthorizedAdminEmail(resolvedEmail)) {
      await supabase.auth.signOut();
      throw new Error('Access denied. This account is not authorized for admin access.');
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
