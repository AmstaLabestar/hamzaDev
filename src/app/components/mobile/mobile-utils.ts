export const FALLBACK_AVATAR_URL = '/images/profile.jpeg';

export function normalizeStoragePath(path: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  const withoutLeadingSlash = trimmedPath.replace(/^\/+/, '');

  if (withoutLeadingSlash.startsWith('admin-private/')) {
    return withoutLeadingSlash.replace(/^admin-private\//, '');
  }

  return withoutLeadingSlash;
}
