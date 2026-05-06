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
  'story-covers',
  'voice-cache',
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
const firebaseJsonSource = read('firebase.json');
const firestoreRulesSource = read('firestore.rules');
const firebaseClientSource = read('services/firebaseClient.ts');
const firebaseParentAuthSource = read('services/firebaseParentAuth.ts');
const firebaseProgressStoreSource = read('services/firebaseProgressStore.ts');
const stripeBillingSource = read('services/stripeBilling.ts');

if (!appSource.includes("setLegalView('privacy')") || !appSource.includes("setLegalView('terms')")) {
  fail('Privacy and terms links are not reachable from the app.');
}
const legalLower = legalSource.toLowerCase();
if (!legalLower.includes('children') || !legalLower.includes('parent') || !legalLower.includes('saved static media')) {
  fail('Legal copy must clearly address children, parents, and saved static media.');
}
if (!parentSource.includes('Privacy Controls') || !parentSource.includes('Parent PIN')) {
  fail('Parent privacy controls and PIN gate must be present before launch.');
}
if (!audioSource.includes('kidGeniusAllowExternalVoice') || !storySource.includes('/story-covers/${story.id}.png')) {
  fail('Saved voice and static cover features must be wired before launch.');
}
if (audioSource.includes('/api/tts') || storySource.includes('/api/story-cover') || storySource.includes('fetch(')) {
  fail('Child-facing media must load from static files, not runtime generation APIs.');
}
if (!cloudflareWorkerSource.includes('MEDIA_CACHE') || !cloudflareWorkerSource.includes('/voice-cache/') || !wranglerSource.includes('r2_buckets')) {
  fail('Cloudflare deployment must serve static voice files from R2 storage.');
}
if (!firebaseJsonSource.includes('"public": "dist"') || !firebaseJsonSource.includes('"destination": "/index.html"')) {
  fail('Firebase Hosting must serve the Vite dist build with SPA rewrites.');
}
if (!firestoreRulesSource.includes('isFamilyParent') || !firestoreRulesSource.includes('allow read, write: if false')) {
  fail('Firestore rules must enforce parent-owned access and deny by default.');
}
if (!firebaseClientSource.includes('VITE_FIREBASE_API_KEY') || !firebaseClientSource.includes('getFirebaseServices')) {
  fail('Firebase Web SDK config must be env-driven and initialized behind a helper.');
}
if (!firebaseParentAuthSource.includes('createUserWithEmailAndPassword') || !firebaseParentAuthSource.includes('signInWithEmailAndPassword') || !firebaseParentAuthSource.includes('GoogleAuthProvider') || !parentSource.includes('Firebase Parent Account')) {
  fail('Firebase parent auth must be wired before cloud progress sync is offered.');
}
if (!parentSource.includes('Firebase cloud progress sync') || !firebaseProgressStoreSource.includes('cloudSyncConsent') || !appSource.includes('syncProgressToFirebase')) {
  fail('Firebase cloud progress sync must be explicit, consent-backed, and parent-gated.');
}
if (!parentSource.includes('Family Subscription') || !stripeBillingSource.includes('getCurrentParentIdToken') || !cloudflareWorkerSource.includes('STRIPE_SECRET_KEY') || !cloudflareWorkerSource.includes('STRIPE_STARTER_PRICE_ID') || !cloudflareWorkerSource.includes('STRIPE_PREMIUM_PRICE_ID') || !cloudflareWorkerSource.includes('accounts:lookup')) {
  fail('Stripe subscription controls must be parent-only and backed by verified Firebase auth.');
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
