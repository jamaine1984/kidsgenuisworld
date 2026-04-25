import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const bucket = process.argv[2] || 'kid-genius-world-media-cache';
const cacheDir = path.join(root, '.tts-cache');
const manifestPath = path.join(root, '.r2-tts-upload-manifest.json');
const wranglerBin = path.join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const concurrency = Number(process.env.R2_UPLOAD_CONCURRENCY || 6);

if (!fs.existsSync(cacheDir)) {
  throw new Error(`Missing cache directory: ${cacheDir}`);
}

const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : { uploaded: {} };

const files = fs.readdirSync(cacheDir)
  .filter(file => file.endsWith('.mp3'))
  .sort()
  .map(file => ({
    name: file,
    localPath: path.join(cacheDir, file),
    key: `tts/${file}`,
  }))
  .filter(file => manifest.uploaded[file.key] !== fs.statSync(file.localPath).size);

let index = 0;
let ok = 0;
let fail = 0;

const saveManifest = () => {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
};

const uploadOne = (file) => new Promise((resolve) => {
  const child = spawn(process.execPath, [
    wranglerBin,
    'r2',
    'object',
    'put',
    `${bucket}/${file.key}`,
    '--file',
    file.localPath,
  ], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let stderr = '';
  child.stderr.on('data', chunk => {
    stderr += chunk.toString();
  });
  child.on('close', code => {
    if (code === 0) {
      manifest.uploaded[file.key] = fs.statSync(file.localPath).size;
      ok += 1;
      if (ok % 25 === 0) saveManifest();
    } else {
      fail += 1;
      console.error(`failed ${file.key}: ${stderr.trim().slice(0, 240)}`);
    }
    resolve();
  });
});

const worker = async () => {
  while (index < files.length) {
    const current = files[index++];
    await uploadOne(current);
    const done = ok + fail;
    if (done % 100 === 0 || done === files.length) {
      saveManifest();
      console.log(`r2_upload_progress=${done}/${files.length} ok=${ok} fail=${fail}`);
    }
  }
};

console.log(`r2_upload_start bucket=${bucket} pending=${files.length} concurrency=${concurrency}`);
await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
saveManifest();
console.log(`r2_upload_complete pending=${files.length} ok=${ok} fail=${fail}`);

if (fail > 0) {
  process.exitCode = 1;
}
