import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];
const fail = (message) => failures.push(message);

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const packageJson = JSON.parse(read('package.json'));
const handoffDoc = exists('docs/mobile-handoff.md') ? read('docs/mobile-handoff.md') : '';
const finishLineDoc = exists('docs/production-finish-line.md') ? read('docs/production-finish-line.md') : '';
const allDependencies = {
  ...(packageJson.dependencies || {}),
  ...(packageJson.devDependencies || {}),
};

const disallowedWebRepoMobileDeps = [
  'expo',
  'react-native',
  '@capacitor/core',
  '@capacitor/ios',
  '@capacitor/android',
  'cordova',
  'ionic',
];

for (const dependency of disallowedWebRepoMobileDeps) {
  if (Object.prototype.hasOwnProperty.call(allDependencies, dependency)) {
    fail(`Mobile dependency ${dependency} belongs in Kid Genius World Mobile, not the web repo.`);
  }
}

if (!handoffDoc.includes('Kid Genius World Mobile') || !handoffDoc.includes('github.com/jamaine1984/kid-genius-world-mobile')) {
  fail('Mobile handoff doc must name the separate folder and separate GitHub repo.');
}

if (!handoffDoc.includes('Legacy Native Reference') || !handoffDoc.includes('tracked `ios/` folder')) {
  fail('Mobile handoff doc must explain the existing tracked ios folder as legacy reference only.');
}

if (!handoffDoc.includes('com.kidgenius.world') || !handoffDoc.includes('Play Store')) {
  fail('Mobile handoff doc must preserve the Android package and Play Store direction.');
}

if (!finishLineDoc.includes('Start mobile only after the web launch gates pass and Stripe is confirmed.')) {
  fail('Production finish-line doc must keep mobile after web launch and Stripe confirmation.');
}

for (const asset of [
  'public/brand/logo-option-1-genius-globe.svg',
  'public/icons/icon-512.png',
  'public/icons/maskable-icon-512.png',
  'public/story-covers/k-1.png',
  'public/voice-cache/manifest.json',
]) {
  if (!exists(asset)) {
    fail(`Mobile reusable asset is missing: ${asset}`);
  }
}

if (failures.length) {
  console.error('Mobile handoff readiness failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Mobile handoff readiness passed: web repo boundary, reusable assets, Android package, and separate mobile repo plan verified.');
