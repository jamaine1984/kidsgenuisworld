import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const cacheDir = path.join(root, '.tts-cache');
const publicVoiceDir = path.join(root, 'public', 'voice-cache');
const manifestPath = path.join(publicVoiceDir, 'manifest.json');

fs.mkdirSync(publicVoiceDir, { recursive: true });

const files = fs.existsSync(cacheDir)
  ? fs.readdirSync(cacheDir)
      .filter(file => /^[a-f0-9]{64}\.mp3$/.test(file))
      .sort()
  : [];

for (const file of fs.readdirSync(publicVoiceDir)) {
  if (/^[a-f0-9]{64}\.mp3$/.test(file) && !files.includes(file)) {
    fs.rmSync(path.join(publicVoiceDir, file), { force: true });
  }
}

for (const file of files) {
  const sourcePath = path.join(cacheDir, file);
  const destinationPath = path.join(publicVoiceDir, file);
  if (!fs.existsSync(destinationPath) || fs.statSync(destinationPath).size !== fs.statSync(sourcePath).size) {
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

const totalBytes = files.reduce((sum, file) => sum + fs.statSync(path.join(cacheDir, file)).size, 0);
const manifest = {
  generatedAt: new Date().toISOString(),
  storage: 'firebase-hosting',
  files,
  count: files.length,
  totalBytes,
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({
  manifest: path.relative(root, manifestPath),
  count: files.length,
  totalMB: Number((totalBytes / 1024 / 1024).toFixed(2)),
  storage: manifest.storage,
}, null, 2));
