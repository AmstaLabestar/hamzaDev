import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { profileService } from '@/features/profile/services/profile.service';
import type { ProfileRecord, ProfileWritePayload } from '@/features/profile/types';

export function useProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const currentProfile = await profileService.getMine(userId);
      setProfile(currentProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Unable to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (payload: ProfileWritePayload) => {
      if (!userId) {
        toast.error('You must be authenticated');
        return;
      }

      setSaving(true);
      try {
        const updated = await profileService.upsertMine(userId, payload);
        setProfile(updated);
        toast.success('Profile saved');
      } catch (error) {
        console.error('Failed to save profile:', error);
        toast.error(error instanceof Error ? error.message : 'Unable to save profile');
      } finally {
        setSaving(false);
      }
    },
    [userId],
  );

  return {
    profile,
    loading,
    saving,
    refresh,
    save,
  };
}

