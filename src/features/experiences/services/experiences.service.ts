import { supabase } from '@/lib/supabase-client';
import type {
  ExperienceListQuery,
  ExperienceListResult,
  ExperienceRecord,
  ExperienceStatus,
  ExperienceWritePayload,
} from '@/features/experiences/types';

const TABLE_NAME = 'experiences';
const MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize: number): number {
  if (pageSize < 1) return 1;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
}

export const experiencesService = {
  async list(query: ExperienceListQuery): Promise<ExperienceListResult> {
    const page = Math.max(1, query.page);
    const pageSize = normalizePageSize(query.pageSize);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let builder = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!query.includeDeleted) {
      builder = builder.is('deleted_at', null);
    }

    if (query.status && query.status !== 'all') {
      builder = builder.eq('status', query.status);
    }

    const normalizedSearch = query.search?.trim();
    if (normalizedSearch) {
      builder = builder.textSearch('search_document', normalizedSearch, {
        config: 'simple',
        type: 'websearch',
      });
    }

    const { data, error, count } = await builder;
    if (error) throw error;

    return {
      data: (data ?? []) as ExperienceRecord[],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  async getById(id: string): Promise<ExperienceRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as ExperienceRecord | null;
  },

  async create(payload: ExperienceWritePayload): Promise<ExperienceRecord> {
    const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select('*').single();
    if (error) throw error;
    return data as ExperienceRecord;
  },

  async update(id: string, payload: ExperienceWritePayload): Promise<ExperienceRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) throw error;
    return data as ExperienceRecord;
  },

  async setStatus(id: string, status: ExperienceStatus): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ status })
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw error;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString(), status: 'draft' })
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw error;
  },
};

