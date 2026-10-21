const configuredBase = (import.meta.env.VITE_ADMIN_API_BASE_URL || '').trim().replace(/\/$/, '');

export const adminApiUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return configuredBase ? `${configuredBase}${normalized}` : normalized;
};

export const adminApiConfigured = Boolean(configuredBase);
