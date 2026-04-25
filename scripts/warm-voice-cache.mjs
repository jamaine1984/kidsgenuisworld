import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const allAges = process.argv.includes('--all-ages');
const migrateOnly = process.argv.includes('--migrate-only');
const endpointArg = process.argv.slice(2).find(arg => !arg.startsWith('--'));
const endpoint = endpointArg || process.env.KID_GENIUS_URL || 'http://127.0.0.1:5177';
const tempDir = path.join(root, '.tmp-voice-cache');
const bundledFile = path.join(tempDir, 'voice-cache-service.mjs');

fs.mkdirSync(tempDir, { recursive: true });

const esbuildBin = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild');
execFileSync(process.execPath, [
  esbuildBin,
  path.join(root, 'services/voiceCacheService.ts'),
  '--bundle',
  '--platform=node',
  '--format=esm',
  '--jsx=automatic',
  '--external:react',
  '--external:react-dom',
  '--external:lucide-react',
  `--outfile=${bundledFile}`,
], { stdio: 'ignore' });

const { getVoiceCacheTexts } = await import(pathToFileURL(bundledFile).href);

const uniqueTexts = Array.from(
  new Set(
    Array.from({ length: 7 }, (_, index) => index + 1)
      .flatMap(level => getVoiceCacheTexts(level))
      .map(text => String(text || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  )
);

const voiceProfiles = allAges ? [
  { label: 'early-gentle', narrationStyle: 'gentle', speechRate: 1, ageGroup: 'early' },
  { label: 'elementary-gentle', narrationStyle: 'gentle', speechRate: 1, ageGroup: 'elementary' },
  { label: 'older-gentle', narrationStyle: 'gentle', speechRate: 1, ageGroup: 'older' },
] : [
  { label: 'elementary-gentle', narrationStyle: 'gentle', speechRate: 1, ageGroup: 'elementary' },
];

const readEnvFile = (file) => {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
};

const localEnv = readEnvFile(path.join(root, '.env.local'));
const voiceId = process.env.ELEVENLABS_VOICE_ID || localEnv.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
const modelId = process.env.ELEVENLABS_MODEL_ID || localEnv.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';

const resolveVoiceSettings = (input = {}) => {
  const styleMap = {
    gentle: { stability: 0.72, similarity_boost: 0.82, style: 0.2, speed: 0.94 },
    energetic: { stability: 0.45, similarity_boost: 0.88, style: 0.65, speed: 1.02 },
    phonics: { stability: 0.86, similarity_boost: 0.8, style: 0.05, speed: 0.82 },
    story: { stability: 0.58, similarity_boost: 0.9, style: 0.78, speed: 0.96 },
  };
  const ageRateMap = { early: 0.88, elementary: 0.96, older: 1.0 };
  const selected = styleMap[input.narrationStyle || 'gentle'] || styleMap.gentle;
  const speechRate = typeof input.speechRate === 'number' ? input.speechRate : 1;
  const effectiveSpeed = Math.max(0.7, Math.min(1.15, selected.speed * speechRate * (ageRateMap[input.ageGroup] || 0.96)));
  return {
    stability: selected.stability,
    similarity_boost: selected.similarity_boost,
    style: selected.style,
    use_speaker_boost: true,
    speed: effectiveSpeed,
  };
};

const getCachePath = (text, profile) => path.join(
  cacheDir,
  `${crypto
    .createHash('sha256')
    .update(JSON.stringify({
      text,
      voiceId,
      modelId,
      voiceSettings: resolveVoiceSettings(profile),
    }))
    .digest('hex')}.mp3`
);

const cacheDir = path.join(root, '.tts-cache');
const beforeCount = fs.existsSync(cacheDir)
  ? fs.readdirSync(cacheDir).filter(file => file.endsWith('.mp3')).length
  : 0;

if (dryRun) {
  const profileStatus = voiceProfiles.map(profile => {
    const missing = uniqueTexts.filter(text => !fs.existsSync(getCachePath(text, profile))).length;
    return {
      profile: profile.label,
      requested: uniqueTexts.length,
      estimatedHits: uniqueTexts.length - missing,
      estimatedMissing: missing,
    };
  });
  console.log(JSON.stringify({
    endpoint,
    dryRun: true,
    uniqueTexts: uniqueTexts.length,
    profiles: profileStatus,
    maxRequestsIfEmpty: uniqueTexts.length * voiceProfiles.length,
    cacheBefore: beforeCount,
  }, null, 2));
  process.exit(0);
}

const results = [];
const chunkSize = 500;
for (const profile of voiceProfiles) {
  const profileResult = {
    profile: profile.label,
    requested: 0,
    hits: 0,
    misses: 0,
    errors: 0,
    skipped: 0,
  };

  for (let index = 0; index < uniqueTexts.length; index += chunkSize) {
    const texts = uniqueTexts.slice(index, index + chunkSize);
    const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/tts-precache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts,
        voice_settings: profile,
        migrate_only: migrateOnly,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`${profile.label} failed with ${response.status}: ${errorText}`);
    }

    const chunkResult = await response.json();
    profileResult.requested += chunkResult.requested || texts.length;
    profileResult.hits += chunkResult.hits || 0;
    profileResult.misses += chunkResult.misses || 0;
    profileResult.errors += chunkResult.errors || 0;
    profileResult.skipped += chunkResult.skipped || 0;
  }

  results.push(profileResult);
}

const afterCount = fs.existsSync(cacheDir)
  ? fs.readdirSync(cacheDir).filter(file => file.endsWith('.mp3')).length
  : 0;

console.log(JSON.stringify({
  endpoint,
  migrateOnly,
  uniqueTexts: uniqueTexts.length,
  profiles: results,
  cacheBefore: beforeCount,
  cacheAfter: afterCount,
  newFiles: Math.max(0, afterCount - beforeCount),
}, null, 2));
