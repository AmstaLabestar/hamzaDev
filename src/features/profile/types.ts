import type { Database } from '@/types/supabase';

export type ProfileStatus = Database['public']['Enums']['publish_status'];
export type ProfileRecord = Database['public']['Tables']['profile']['Row'];
export type ProfileInsert = Database['public']['Tables']['profile']['Insert'];

export type ProfileWritePayload = Pick<
  ProfileInsert,
  'full_name' | 'professional_title' | 'bio' | 'email' | 'linkedin_url' | 'github_url' | 'avatar_path' | 'status'
>;

