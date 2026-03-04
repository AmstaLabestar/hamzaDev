const configuredAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL ?? '').trim().toLowerCase();

export function getConfiguredAdminEmail(): string | null {
  return configuredAdminEmail.length > 0 ? configuredAdminEmail : null;
}

export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  const normalized = (email ?? '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  if (!configuredAdminEmail) {
    return false;
  }

  return normalized === configuredAdminEmail;
}
