import { supabase } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profile']['Row'];

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

let profileCache: CacheEntry<ProfileRow | null> | null = null;
let profileInFlight: Promise<ProfileRow | null> | null = null;

const skillsCache = new Map<number, CacheEntry<string[]>>();
const skillsInFlight = new Map<number, Promise<string[]>>();

function isFresh<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
  return Boolean(entry && entry.expiresAt > Date.now());
}

async function fetchPublishedProfile(): Promise<ProfileRow | null> {
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
}

async function fetchPublishedSkills(limit: number): Promise<string[]> {
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
}

export const publicContentService = {
  async getPublishedProfile(options?: { forceRefresh?: boolean }): Promise<ProfileRow | null> {
    const forceRefresh = options?.forceRefresh ?? false;

    if (!forceRefresh && isFresh(profileCache)) {
      return profileCache.value;
    }

    if (!forceRefresh && profileInFlight) {
      return profileInFlight;
    }

    const request = fetchPublishedProfile()
      .then((profile) => {
        profileCache = {
          value: profile,
          expiresAt: Date.now() + CACHE_TTL_MS,
        };
        return profile;
      })
      .finally(() => {
        profileInFlight = null;
      });

    profileInFlight = request;
    return request;
  },

  async listPublishedSkills(limit = 30, options?: { forceRefresh?: boolean }): Promise<string[]> {
    const forceRefresh = options?.forceRefresh ?? false;
    const cached = skillsCache.get(limit);

    if (!forceRefresh && isFresh(cached)) {
      return [...cached.value];
    }

    const inflight = skillsInFlight.get(limit);
    if (!forceRefresh && inflight) {
      return inflight;
    }

    const request = fetchPublishedSkills(limit)
      .then((skills) => {
        skillsCache.set(limit, {
          value: skills,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return [...skills];
      })
      .finally(() => {
        skillsInFlight.delete(limit);
      });

    skillsInFlight.set(limit, request);
    return request;
  },
};
