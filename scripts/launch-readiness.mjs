import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];

const fail = (message) => failures.push(message);

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const trackedLikeExtensions = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.ts',
  '.tsx',
  '.json',
  '.md',
]);

const ignoredDirs = new Set([
  '.git',
  '.tts-cache',
  '.story-covers',
  '.tmp-voice-cache',
  '.wrangler',
  'dist',
  'ios',
  'node_modules',
]);

const ignoredFiles = new Set([
  '.r2-tts-upload-manifest.json',
]);

const sourceFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    if (ignoredFiles.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    const ext = path.extname(entry.name);
    if (
      trackedLikeExtensions.has(ext) &&
      !entry.name.startsWith('.env') &&
      entry.name !== 'launch-readiness.mjs' &&
      entry.name !== 'qa-check.mjs'
    ) {
      sourceFiles.push(absolute);
    }
  }
};

walk(root);

const distIndexPath = path.join(root, 'dist/index.html');
if (!exists('dist/index.html')) {
  fail('Run npm run build before launch checks; dist/index.html is missing.');
} else {
  const distIndex = fs.readFileSync(distIndexPath, 'utf8');
  if (!distIndex.includes('/assets/')) fail('Built index.html does not reference bundled assets.');
  if (distIndex.includes('cdn.tailwindcss.com')) fail('Tailwind CDN is present in production output.');
  if (!distIndex.includes('<title>Kid Genius World</title>')) fail('Production title is missing.');
}

const disallowedExternalAssets = [
  'transparenttextures.com',
  'cdn.tailwindcss.com',
  'unpkg.com',
  'jsdelivr.net',
];

for (const asset of disallowedExternalAssets) {
  const sourceHit = sourceFiles.find((file) => fs.readFileSync(file, 'utf8').includes(asset));
  if (sourceHit) {
    fail(`Disallowed external production asset reference found in ${path.relative(root, sourceHit)}: ${asset}`);
  }
}

const secretPatterns = [
  ['ElevenLabs API key shape', /\b[a-f0-9]{64}\b/i],
  ['OpenRouter key shape', /\bsk-or-[A-Za-z0-9_-]{20,}\b/],
  ['Generic private key block', /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/],
];

for (const [label, pattern] of secretPatterns) {
  const sourceHit = sourceFiles.find((file) => pattern.test(fs.readFileSync(file, 'utf8')));
  if (sourceHit) {
    fail(`${label} appears in ${path.relative(root, sourceHit)}. Move secrets to local or hosted environment secrets.`);
  }
}

const appSource = read('App.tsx');
const legalSource = read('components/LegalInfo.tsx');
const parentSource = read('components/ParentDashboard.tsx');
const audioSource = read('services/audioService.ts');
const storySource = read('components/StoryBook.tsx');
const serverSource = read('server/production-server.mjs');
const cloudflareWorkerSource = read('cloudflare/worker.ts');
const wranglerSource = read('wrangler.jsonc');

if (!appSource.includes("setLegalView('privacy')") || !appSource.includes("setLegalView('terms')")) {
  fail('Privacy and terms links are not reachable from the app.');
}
const legalLower = legalSource.toLowerCase();
if (!legalLower.includes('children') || !legalLower.includes('parent') || !legalLower.includes('third-party')) {
  fail('Legal copy must clearly address children, parents, and third-party services.');
}
if (!parentSource.includes('Privacy Controls') || !parentSource.includes('Parent PIN')) {
  fail('Parent privacy controls and PIN gate must be present before launch.');
}
if (!audioSource.includes('kidGeniusAllowExternalVoice') || !storySource.includes('kidGeniusAllowGeneratedStoryCovers')) {
  fail('External voice and generated cover features must be parent-gated.');
}
if (!serverSource.includes('/api/tts') || !serverSource.includes('/api/story-cover')) {
  fail('Production server must proxy external TTS and cover generation APIs.');
}
if (!cloudflareWorkerSource.includes('MEDIA_CACHE') || !cloudflareWorkerSource.includes('ELEVENLABS_API_KEY') || !wranglerSource.includes('r2_buckets')) {
  fail('Cloudflare deployment must use R2 storage and Worker secrets for media APIs.');
}
if (!exists('tailwind.config.js') || !exists('postcss.config.js') || !exists('index.css')) {
  fail('Tailwind must stay in the local build pipeline for production.');
}

if (failures.length) {
  console.error('Launch readiness failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`Launch readiness passed: ${sourceFiles.length} source/config files checked, production build and kids-safety gates verified.`);
