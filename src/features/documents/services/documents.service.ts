import { supabase } from '@/lib/supabase-client';
import type {
  DocumentListQuery,
  DocumentListResult,
  DocumentRecord,
  DocumentWritePayload,
} from '@/features/documents/types';
import { storageService } from '@/services/storage.service';

const TABLE_NAME = 'documents';
const MAX_PAGE_SIZE = 100;

function normalizePageSize(pageSize: number): number {
  if (pageSize < 1) return 1;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function computeSha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return toHex(digest);
}

export const documentsService = {
  async list(query: DocumentListQuery): Promise<DocumentListResult> {
    const page = Math.max(1, query.page);
    const pageSize = normalizePageSize(query.pageSize);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let builder = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('is_active', { ascending: false })
      .order('version', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!query.includeDeleted) {
      builder = builder.is('deleted_at', null);
    }

    const { data, error, count } = await builder;
    if (error) throw error;

    return {
      data: (data ?? []) as DocumentRecord[],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  async createVersionFromPdf(file: File, userId: string): Promise<DocumentRecord> {
    const { path } = await storageService.uploadDocumentPdf(file, userId);
    const sha256 = await computeSha256(file);

    const payload: DocumentWritePayload = {
      file_name: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
      sha256,
      is_active: true,
    };

    const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select('*').single();
    if (error) {
      throw error;
    }

    return data as DocumentRecord;
  },

  async setActive(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ is_active: true })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw error;
  },

  async getSignedUrl(storagePath: string, expiresInSeconds = 3600): Promise<string> {
    return storageService.getSignedUrl(storagePath, expiresInSeconds);
  },
};

