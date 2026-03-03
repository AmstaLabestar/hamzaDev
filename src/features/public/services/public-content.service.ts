import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profile']['Row'];

export const publicContentService = {
  async getPublishedProfile(): Promise<ProfileRow | null> {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async listPublishedSkills(limit = 30): Promise<string[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('name')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => item.name);
  },
};

