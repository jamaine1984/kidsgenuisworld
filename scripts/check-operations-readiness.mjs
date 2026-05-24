import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];
const fail = (message) => failures.push(message);

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const packageJson = JSON.parse(read('package.json'));
const readme = read('README.md');
const runbook = exists('docs/launch-operations-runbook.md') ? read('docs/launch-operations-runbook.md') : '';
const liveSiteCheck = read('scripts/check-live-site.mjs');
const liveBillingCheck = read('scripts/check-live-billing-api.mjs');
const legalInfo = read('components/LegalInfo.tsx');

if (!packageJson.scripts?.['qa:ops']) {
  fail('qa:ops script is missing.');
}

if (!packageJson.scripts?.qa?.includes('qa:ops')) {
  fail('Full qa script must include qa:ops.');
}

if (!readme.includes('docs/launch-operations-runbook.md')) {
  fail('README must link to the launch operations runbook.');
}

for (const required of [
  'crateshipstudios@gmail.com',
  'Firebase Monitoring',
  'Stripe Monitoring',
  'Search And SEO Monitoring',
  'Static Media Monitoring',
  'Mobile Boundary',
  'Rollback path',
  'npm run qa:production-live',
  'KOIKES2021@gmail.com',
]) {
  if (!runbook.includes(required)) {
    fail(`Launch operations runbook is missing: ${required}`);
  }
}

if (!liveSiteCheck.includes('/sitemap.xml') || !liveSiteCheck.includes('/manifest.webmanifest') || !liveSiteCheck.includes('checkWwwRedirect')) {
  fail('Live site check must verify sitemap, manifest, and www redirect.');
}

if (!liveBillingCheck.includes('/api/billing/webhook') || !liveBillingCheck.includes('Stripe webhook signature is required.') || !liveBillingCheck.includes('CORS preflight')) {
  fail('Live billing check must verify webhook rejection and CORS preflight.');
}

if (!legalInfo.includes('crateshipstudios@gmail.com') || !legalInfo.includes('request deletion') || !legalInfo.includes('Parent Support')) {
  fail('Legal/support surfaces must include support email, deletion, and parent support language.');
}

if (failures.length) {
  console.error('Operations readiness failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Operations readiness passed: support, monitoring, SEO, media, mobile boundary, live QA, and rollback runbook verified.');
