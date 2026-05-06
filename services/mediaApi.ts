const configuredMediaBaseUrl = import.meta.env.VITE_MEDIA_API_BASE_URL || '';

export const getMediaApiUrl = (path: string) => {
  if (!configuredMediaBaseUrl) {
    return path;
  }

  const base = configuredMediaBaseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const isRemoteMediaApiConfigured = Boolean(configuredMediaBaseUrl);

export const getStaticMediaUrl = (path: string) => getMediaApiUrl(path);

export const getStaticVoiceManifestUrl = () => '/voice-cache/manifest.json';
