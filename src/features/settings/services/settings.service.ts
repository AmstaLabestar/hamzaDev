import { supabase } from '@/lib/supabase-client';
import type { AdminLogListResult, SecurityOverview, SessionInfo } from '@/features/settings/types';

const LOGS_TABLE = 'admin_logs';
const MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize: number): number {
  if (pageSize < 1) return 1;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
}

export const settingsService = {
  async getSecurityOverview(isAdmin: boolean): Promise<SecurityOverview> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    const user = data.user;
    return {
      email: user?.email ?? null,
      userId: user?.id ?? null,
      emailConfirmedAt: user?.email_confirmed_at ?? null,
      lastSignInAt: user?.last_sign_in_at ?? null,
      isAdmin,
    };
  },

  async getSessionInfo(): Promise<SessionInfo> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data.session;
    return {
      session,
      user: session?.user ?? null,
      issuedAt: session?.expires_at ? new Date((session.expires_at - 3600) * 1000).toISOString() : null,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    };
  },

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async signOutAllSessions(): Promise<void> {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
  },

  async listAdminLogs(page: number, pageSize: number): Promise<AdminLogListResult> {
    const safePage = Math.max(1, page);
    const safePageSize = normalizePageSize(pageSize);
    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const { data, error, count } = await supabase
      .from(LOGS_TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data ?? [],
      total: count ?? 0,
      page: safePage,
      pageSize: safePageSize,
    };
  },
};

