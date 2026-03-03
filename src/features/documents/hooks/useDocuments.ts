import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { documentsService } from '@/features/documents/services/documents.service';
import type { DocumentListQuery, DocumentRecord } from '@/features/documents/types';

const DEFAULT_QUERY: DocumentListQuery = {
  page: 1,
  pageSize: 10,
  includeDeleted: false,
};

export function useDocuments() {
  const [query, setQuery] = useState<DocumentListQuery>(DEFAULT_QUERY);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (total === 0) return 1;
    return Math.ceil(total / query.pageSize);
  }, [total, query.pageSize]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await documentsService.list(query);
      setDocuments(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Unable to load documents');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setPage = useCallback((page: number) => {
    setQuery((previous) => ({ ...previous, page }));
  }, []);

  const uploadVersion = useCallback(
    async (file: File, userId: string) => {
      try {
        await documentsService.createVersionFromPdf(file, userId);
        toast.success('New CV version uploaded');
        await refresh();
      } catch (error) {
        console.error('Failed to upload document:', error);
        toast.error(error instanceof Error ? error.message : 'Unable to upload file');
      }
    },
    [refresh],
  );

  const setActive = useCallback(
    async (id: string) => {
      try {
        await documentsService.setActive(id);
        toast.success('Active CV version updated');
        await refresh();
      } catch (error) {
        console.error('Failed to activate document:', error);
        toast.error('Unable to activate selected version');
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await documentsService.softDelete(id);
        toast.success('Document archived');
        await refresh();
      } catch (error) {
        console.error('Failed to archive document:', error);
        toast.error('Unable to archive document');
      }
    },
    [refresh],
  );

  return {
    query,
    documents,
    total,
    totalPages,
    loading,
    refresh,
    setPage,
    uploadVersion,
    setActive,
    remove,
  };
}

