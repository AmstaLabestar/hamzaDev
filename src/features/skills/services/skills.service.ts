import { supabase } from '@/lib/supabase-client';
import type { SkillListQuery, SkillListResult, SkillRecord, SkillStatus, SkillWritePayload } from '@/features/skills/types';

const TABLE_NAME = 'skills';
const MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize: number): number {
  if (pageSize < 1) return 1;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
}

export const skillsService = {
  async list(query: SkillListQuery): Promise<SkillListResult> {
    const page = Math.max(1, query.page);
    const pageSize = normalizePageSize(query.pageSize);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let builder = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .range(from, to);

    if (!query.includeDeleted) {
      builder = builder.is('deleted_at', null);
    }

    if (query.status && query.status !== 'all') {
      builder = builder.eq('status', query.status);
    }

    const normalizedSearch = query.search?.trim();
    if (normalizedSearch) {
      builder = builder.ilike('name', `%${normalizedSearch}%`);
    }

    const { data, error, count } = await builder;
    if (error) throw error;

    return {
      data: (data ?? []) as SkillRecord[],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  async create(payload: SkillWritePayload): Promise<SkillRecord> {
    const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select('*').single();
    if (error) throw error;
    return data as SkillRecord;
  },

  async update(id: string, payload: SkillWritePayload): Promise<SkillRecord> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();

    if (error) throw error;
    return data as SkillRecord;
  },

  async setStatus(id: string, status: SkillStatus): Promise<void> {
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

