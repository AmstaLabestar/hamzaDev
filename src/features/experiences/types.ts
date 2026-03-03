import type { Database } from '@/types/supabase';

export type ExperienceStatus = Database['public']['Enums']['publish_status'];
export type ExperienceRecord = Database['public']['Tables']['experiences']['Row'];
export type ExperienceInsert = Database['public']['Tables']['experiences']['Insert'];

export interface ExperienceListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: ExperienceStatus | 'all';
  includeDeleted?: boolean;
}

export interface ExperienceListResult {
  data: ExperienceRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export type ExperienceWritePayload = Pick<
  ExperienceInsert,
  'position' | 'company' | 'location' | 'start_date' | 'end_date' | 'is_current' | 'description' | 'status'
>;

