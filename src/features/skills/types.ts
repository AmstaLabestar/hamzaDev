import type { Database } from '@/types/supabase';

export type SkillStatus = Database['public']['Enums']['publish_status'];
export type SkillCategory = Database['public']['Enums']['skill_category'];
export type SkillRecord = Database['public']['Tables']['skills']['Row'];
export type SkillInsert = Database['public']['Tables']['skills']['Insert'];

export interface SkillListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: SkillStatus | 'all';
  includeDeleted?: boolean;
}

export interface SkillListResult {
  data: SkillRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export type SkillWritePayload = Pick<SkillInsert, 'name' | 'category' | 'level' | 'icon' | 'sort_order' | 'status'>;

