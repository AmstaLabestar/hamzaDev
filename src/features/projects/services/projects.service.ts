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

type LegacyProjectPayload = Omit<ProjectWritePayload, 'project_type' | 'demo_video_path'>;

function formatSupabaseError(
  error: { message?: string; details?: string | null; hint?: string | null } | null,
  fallbackMessage: string,
): Error {
  if (!error) {
    return new Error(fallbackMessage);
  }

  const base = error.message?.trim() || fallbackMessage;
  const details = error.details?.trim();
  const hint = error.hint?.trim();

  const detailParts = [details, hint].filter((part): part is string => Boolean(part));
  if (detailParts.length === 0) {
    return new Error(base);
  }

  return new Error(`${base} ${detailParts.join(' ')}`.trim());
}

function toLegacyPayload(payload: ProjectWritePayload): LegacyProjectPayload {
  const { project_type: _projectType, demo_video_path: _demoVideoPath, ...legacyPayload } = payload;
  return legacyPayload;
}

function shouldRetryWithLegacyProjectSchema(
  error: { message?: string; details?: string | null; hint?: string | null } | null,
): boolean {
  const haystack = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase();
  return haystack.includes('does not exist') && (haystack.includes('project_type') || haystack.includes('demo_video_path'));
}

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
      throw formatSupabaseError(error, 'Unable to load projects');
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
      throw formatSupabaseError(error, 'Unable to load project');
    }

    return data as ProjectRecord | null;
  },

  async create(payload: ProjectWritePayload): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).insert(payload);
    if (!error) {
      return;
    }

    if (shouldRetryWithLegacyProjectSchema(error)) {
      const { error: legacyError } = await supabase.from(TABLE_NAME).insert(toLegacyPayload(payload));
      if (!legacyError) {
        return;
      }
      throw formatSupabaseError(legacyError, 'Unable to create project');
    }

    throw formatSupabaseError(error, 'Unable to create project');
  },

  async update(id: string, payload: ProjectWritePayload): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id)
      .is('deleted_at', null);

    if (!error) {
      return;
    }

    if (shouldRetryWithLegacyProjectSchema(error)) {
      const { error: legacyError } = await supabase
        .from(TABLE_NAME)
        .update(toLegacyPayload(payload))
        .eq('id', id)
        .is('deleted_at', null);

      if (!legacyError) {
        return;
      }

      throw formatSupabaseError(legacyError, 'Unable to update project');
    }

    throw formatSupabaseError(error, 'Unable to update project');
  },

  async setStatus(id: string, status: ProjectStatus): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ status })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      throw formatSupabaseError(error, 'Unable to update project status');
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
      throw formatSupabaseError(error, 'Unable to archive project');
    }
  },
};
