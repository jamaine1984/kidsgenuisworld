import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsonc',
  '.md',
  '.mjs',
  '.rules',
  '.ts',
  '.tsx',
  '.txt',
  '.webmanifest',
  '.xml',
]);

const ignoredTrackedPaths = [
  /^dist\//,
  /^ios\//,
  /^node_modules\//,
  /^package-lock\.json$/,
  /^functions\/package-lock\.json$/,
  /^public\/voice-cache\/manifest\.json$/,
];

const privateKeyBlockPattern = new RegExp([
  '-{5}BEGIN ',
  '(?:RSA |EC |OPENSSH |)?',
  'PRIVATE KEY',
  '-{5}',
].join(''));
const firebasePrivateKeyPattern = new RegExp([
  '"private_key"\\s*:\\s*"',
  '-{5}BEGIN PRIVATE KEY-{5}',
].join(''));

const secretPatterns = [
  ['Stripe secret key', /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/],
  ['OpenAI secret key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/],
  ['OpenRouter secret key', /\bsk-or-[A-Za-z0-9_-]{20,}\b/],
  ['ElevenLabs API key shape', /\b[a-f0-9]{64}\b/i],
  ['Google API key shape', /\bAIza[0-9A-Za-z_-]{30,}\b/],
  ['Private key block', privateKeyBlockPattern],
  ['Firebase service account private key', firebasePrivateKeyPattern],
  ['Firebase service account client email', /"client_email"\s*:\s*"firebase-adminsdk-[^"]+"/],
];

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !ignoredTrackedPaths.some((pattern) => pattern.test(file)))
  .filter((file) => textExtensions.has(path.extname(file)) || file.endsWith('.env.example'));

const failures = [];

for (const file of trackedFiles) {
  const absolute = path.join(root, file);
  const source = fs.readFileSync(absolute, 'utf8');
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(source)) {
      failures.push(`${label} appears in tracked file ${file}. Move real secrets to ignored local env files or hosted secrets.`);
    }
  }
}

const requiredIgnoredSecrets = [
  '.env.local',
  'functions/.env.kid-genius-world',
  '.dev.vars',
  '.r2-tts-upload-manifest.json',
];

for (const file of requiredIgnoredSecrets) {
  try {
    execFileSync('git', ['check-ignore', file], { cwd: root, stdio: 'ignore' });
  } catch {
    failures.push(`${file} must be ignored by Git before launch.`);
  }
}

if (failures.length) {
  console.error('Secret scan failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Secret scan passed: ${trackedFiles.length} tracked text files checked and local secret files confirmed ignored.`);
