import { supabase } from '@/lib/supabase-client';
import type {
  ProjectListQuery,
  ProjectListResult,
  ProjectRecord,
  ProjectStatus,
  ProjectWritePayload,
} from '@/features/projects/types';

const TABLE_NAME = 'projects';
const MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize: number): number {
  if (pageSize < 1) {
    return 1;
  }

  if (pageSize > MAX_PAGE_SIZE) {
    return MAX_PAGE_SIZE;
  }

  return pageSize;
}

export const projectsService = {
  async list(query: ProjectListQuery): Promise<ProjectListResult> {
    const page = Math.max(1, query.page);
    const pageSize = normalizePageSize(query.pageSize);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let builder = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('project_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!query.includeDeleted) {
      builder = builder.is('deleted_at', null);
    }

    if (query.status && query.status !== 'all') {
      builder = builder.eq('status', query.status);
    }

    if (query.projectType && query.projectType !== 'all') {
      builder = builder.eq('project_type', query.projectType);
    }

    const normalizedSearch = query.search?.trim();
    if (normalizedSearch) {
      builder = builder.textSearch('search_document', normalizedSearch, {
        config: 'simple',
        type: 'websearch',
      });
    }

    const { data, error, count } = await builder;
    if (error) {
      throw error;
    }

    return {
      data: (data ?? []) as ProjectRecord[],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  async getById(id: string): Promise<ProjectRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as ProjectRecord | null;
  },

  async create(payload: ProjectWritePayload): Promise<ProjectRecord> {
    const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select('*').single();

    if (error) {
      throw error;
    }

    return data as ProjectRecord;
  },

  async update(id: string, payload: ProjectWritePayload): Promise<ProjectRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as ProjectRecord;
  },

  async setStatus(id: string, status: ProjectStatus): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ status })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw error;
    }
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        deleted_at: new Date().toISOString(),
        status: 'draft',
      })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw error;
    }
  },
};
