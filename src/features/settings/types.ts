import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type AdminLogRecord = Database['public']['Tables']['admin_logs']['Row'];

export interface AdminLogListResult {
  data: AdminLogRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SecurityOverview {
  email: string | null;
  userId: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  isAdmin: boolean;
}

export interface SessionInfo {
  session: Session | null;
  user: User | null;
  issuedAt: string | null;
  expiresAt: string | null;
}

