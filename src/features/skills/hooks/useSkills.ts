import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { skillsService } from '@/features/skills/services/skills.service';
import type { SkillListQuery, SkillRecord, SkillStatus } from '@/features/skills/types';

const DEFAULT_QUERY: SkillListQuery = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
  includeDeleted: false,
};

export function useSkills() {
  const [query, setQuery] = useState<SkillListQuery>(DEFAULT_QUERY);
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (total === 0) return 1;
    return Math.ceil(total / query.pageSize);
  }, [total, query.pageSize]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await skillsService.list(query);
      setSkills(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load skills:', error);
      toast.error('Unable to load skills');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSearch = useCallback((search: string) => {
    setQuery((previous) => ({ ...previous, page: 1, search }));
  }, []);

  const setStatus = useCallback((status: SkillStatus | 'all') => {
    setQuery((previous) => ({ ...previous, page: 1, status }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((previous) => ({ ...previous, page }));
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await skillsService.softDelete(id);
        toast.success('Skill archived');
        await refresh();
      } catch (error) {
        console.error('Failed to archive skill:', error);
        toast.error('Unable to archive skill');
      }
    },
    [refresh],
  );

  const togglePublish = useCallback(
    async (id: string, currentStatus: SkillStatus) => {
      try {
        const nextStatus: SkillStatus = currentStatus === 'published' ? 'draft' : 'published';
        await skillsService.setStatus(id, nextStatus);
        toast.success(nextStatus === 'published' ? 'Skill published' : 'Skill moved to draft');
        await refresh();
      } catch (error) {
        console.error('Failed to toggle skill status:', error);
        toast.error('Unable to change status');
      }
    },
    [refresh],
  );

  return {
    query,
    skills,
    total,
    totalPages,
    loading,
    refresh,
    setSearch,
    setStatus,
    setPage,
    remove,
    togglePublish,
  };
}

