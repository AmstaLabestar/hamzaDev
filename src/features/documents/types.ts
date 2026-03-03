import type { Database } from '@/types/supabase';

export type DocumentRecord = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export interface DocumentListQuery {
  page: number;
  pageSize: number;
  includeDeleted?: boolean;
}

export interface DocumentListResult {
  data: DocumentRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateDocumentInput {
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  is_active?: boolean;
}

export type DocumentWritePayload = Pick<
  DocumentInsert,
  'file_name' | 'storage_path' | 'mime_type' | 'size_bytes' | 'sha256' | 'is_active'
>;

