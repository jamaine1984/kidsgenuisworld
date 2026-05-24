import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const firebaseCli = path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
const args = ['deploy', '--only', 'functions', '--project', 'kid-genius-world'];
const child = spawn(process.execPath, [firebaseCli, ...args], {
  cwd: root,
  env: {
    ...process.env,
    FUNCTIONS_DISCOVERY_TIMEOUT: process.env.FUNCTIONS_DISCOVERY_TIMEOUT || '60',
  },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Firebase Functions deploy stopped by signal ${signal}.`);
    process.exit(1);
  }
  process.exit(code || 0);
});
