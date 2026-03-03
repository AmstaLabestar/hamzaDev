import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { experiencesService } from '@/features/experiences/services/experiences.service';
import type { ExperienceListQuery, ExperienceRecord, ExperienceStatus } from '@/features/experiences/types';

const DEFAULT_QUERY: ExperienceListQuery = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
  includeDeleted: false,
};

export function useExperiences() {
  const [query, setQuery] = useState<ExperienceListQuery>(DEFAULT_QUERY);
  const [experiences, setExperiences] = useState<ExperienceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (total === 0) return 1;
    return Math.ceil(total / query.pageSize);
  }, [total, query.pageSize]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await experiencesService.list(query);
      setExperiences(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load experiences:', error);
      toast.error('Unable to load experiences');
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

  const setStatus = useCallback((status: ExperienceStatus | 'all') => {
    setQuery((previous) => ({ ...previous, page: 1, status }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((previous) => ({ ...previous, page }));
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await experiencesService.softDelete(id);
        toast.success('Experience archived');
        await refresh();
      } catch (error) {
        console.error('Failed to archive experience:', error);
        toast.error('Unable to archive experience');
      }
    },
    [refresh],
  );

  const togglePublish = useCallback(
    async (id: string, currentStatus: ExperienceStatus) => {
      try {
        const nextStatus: ExperienceStatus = currentStatus === 'published' ? 'draft' : 'published';
        await experiencesService.setStatus(id, nextStatus);
        toast.success(nextStatus === 'published' ? 'Experience published' : 'Experience moved to draft');
        await refresh();
      } catch (error) {
        console.error('Failed to toggle experience status:', error);
        toast.error('Unable to change status');
      }
    },
    [refresh],
  );

  return {
    query,
    experiences,
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

