export const getStaticMediaUrl = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const getStaticVoiceManifestUrl = () => '/voice-cache/manifest.json';
