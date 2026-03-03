import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { projectsService } from '@/features/projects/services/projects.service';
import type { ProjectListQuery, ProjectRecord, ProjectStatus, ProjectType } from '@/features/projects/types';

const DEFAULT_QUERY: ProjectListQuery = {
  page: 1,
  pageSize: 10,
  search: '',
  status: 'all',
  projectType: 'all',
  includeDeleted: false,
};

export function useProjects() {
  const [query, setQuery] = useState<ProjectListQuery>(DEFAULT_QUERY);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (total === 0) {
      return 1;
    }

    return Math.ceil(total / query.pageSize);
  }, [total, query.pageSize]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectsService.list(query);
      setProjects(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Unable to load projects');
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

  const setStatus = useCallback((status: ProjectStatus | 'all') => {
    setQuery((previous) => ({ ...previous, page: 1, status }));
  }, []);

  const setProjectType = useCallback((projectType: ProjectType | 'all') => {
    setQuery((previous) => ({ ...previous, page: 1, projectType }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((previous) => ({ ...previous, page }));
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await projectsService.softDelete(id);
        toast.success('Project archived');
        await refresh();
      } catch (error) {
        console.error('Failed to archive project:', error);
        toast.error('Unable to archive this project');
      }
    },
    [refresh],
  );

  const togglePublish = useCallback(
    async (id: string, currentStatus: ProjectStatus) => {
      try {
        const nextStatus: ProjectStatus = currentStatus === 'published' ? 'draft' : 'published';
        await projectsService.setStatus(id, nextStatus);
        toast.success(nextStatus === 'published' ? 'Project published' : 'Project moved to draft');
        await refresh();
      } catch (error) {
        console.error('Failed to update project status:', error);
        toast.error('Unable to change project status');
      }
    },
    [refresh],
  );

  return {
    query,
    projects,
    total,
    totalPages,
    loading,
    refresh,
    setSearch,
    setStatus,
    setProjectType,
    setPage,
    remove,
    togglePublish,
  };
}
