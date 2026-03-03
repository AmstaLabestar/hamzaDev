import { supabase } from '@/lib/supabase-client';
import type { ProfileRecord, ProfileWritePayload } from '@/features/profile/types';

const TABLE_NAME = 'profile';

export const profileService = {
  async getMine(userId: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('owner_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as ProfileRecord | null;
  },

  async upsertMine(userId: string, payload: ProfileWritePayload): Promise<ProfileRecord> {
    const existing = await profileService.getMine(userId);

    if (existing) {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error) throw error;
      return data as ProfileRecord;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...payload,
        owner_id: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as ProfileRecord;
  },
};
