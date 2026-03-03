import type { Database } from '@/types/supabase';

export type ProjectStatus = Database['public']['Enums']['publish_status'];
export type ProjectType = Database['public']['Enums']['project_type'];
export type ProjectRecord = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: ProjectStatus | 'all';
  projectType?: ProjectType | 'all';
  includeDeleted?: boolean;
}

export interface ProjectListResult {
  data: ProjectRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export type ProjectWritePayload = Pick<
  ProjectInsert,
  | 'title'
  | 'description'
  | 'technologies'
  | 'project_type'
  | 'github_url'
  | 'demo_url'
  | 'demo_video_path'
  | 'image_path'
  | 'project_date'
  | 'status'
>;
