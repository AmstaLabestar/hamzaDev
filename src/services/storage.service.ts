import { supabase } from '@/lib/supabase-client';

const BUCKET_NAME = 'admin-private';
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

function createPathPrefix(folder: 'projects' | 'documents' | 'avatars', userId: string): string {
  return `${folder}/${userId}`;
}

async function createSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw error ?? new Error('Unable to create signed URL');
  }
  return data.signedUrl;
}

export const storageService = {
  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    return createSignedUrl(path, expiresInSeconds);
  },

  async uploadProjectImage(file: File, userId: string): Promise<{ path: string; previewUrl: string }> {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error('Only JPG, PNG, and WEBP images are allowed');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image size must be 5MB or less');
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const path = `${createPathPrefix('projects', userId)}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (uploadError) {
      throw uploadError;
    }

    const previewUrl = await createSignedUrl(path, 3600);
    return { path, previewUrl };
  },

  async uploadAvatar(file: File, userId: string): Promise<{ path: string; previewUrl: string }> {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error('Only JPG, PNG, and WEBP images are allowed');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Avatar size must be 5MB or less');
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const path = `${createPathPrefix('avatars', userId)}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (uploadError) {
      throw uploadError;
    }

    const previewUrl = await createSignedUrl(path, 3600);
    return { path, previewUrl };
  },

  async uploadProjectDemoVideo(file: File, userId: string): Promise<{ path: string; previewUrl: string }> {
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      throw new Error('Only MP4, WEBM, and MOV videos are allowed');
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      throw new Error('Video size must be 100MB or less');
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const path = `${createPathPrefix('projects', userId)}/demo-videos/${fileName}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (uploadError) {
      throw uploadError;
    }

    const previewUrl = await createSignedUrl(path, 3600);
    return { path, previewUrl };
  },

  async uploadDocumentPdf(file: File, userId: string): Promise<{ path: string }> {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new Error('PDF size must be 10MB or less');
    }

    const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const path = `${createPathPrefix('documents', userId)}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '3600',
    });

    if (error) {
      throw error;
    }

    return { path };
  },
};
