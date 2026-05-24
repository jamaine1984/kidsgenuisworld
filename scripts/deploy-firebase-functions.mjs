import { spawn } from 'node:child_process';

const command = process.platform === 'win32' ? 'firebase.cmd' : 'firebase';
const args = ['deploy', '--only', 'functions', '--project', 'kid-genius-world'];
const child = spawn(command, args, {
  cwd: process.cwd(),
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
