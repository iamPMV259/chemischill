const env = import.meta.env;

const fallback = (value: string | undefined, defaultValue: string) =>
  value && value.trim() ? value : defaultValue;

export const appEnv = {
  apiUrl:
    env.VITE_API_URL ||
    `${fallback(env.VITE_API_PROTOCOL, 'http')}://${fallback(env.VITE_API_HOST, 'localhost')}:${fallback(env.VITE_API_PORT, '8000')}`,
  officeViewerUrl: fallback(env.VITE_OFFICE_VIEWER_URL, 'https://view.officeapps.live.com/op/embed.aspx'),
  defaultAvatarBaseUrl: fallback(env.VITE_DEFAULT_AVATAR_BASE_URL, 'https://api.dicebear.com/7.x/avataaars/svg'),
  adminZaloUrl: env.VITE_ADMIN_ZALO_URL || '',
  adminZaloLabel: fallback(env.VITE_ADMIN_ZALO_LABEL, 'Admin ChemisChill'),
} as const;

export function getDefaultAvatarUrl(seed: string) {
  return `${appEnv.defaultAvatarBaseUrl}?seed=${encodeURIComponent(seed)}`;
}
