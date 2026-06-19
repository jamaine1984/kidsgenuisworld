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
  'playwright-report',
  'story-covers',
  'test-results',
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
const studyZoneSource = read('components/StudyZone.tsx');
const worldMapSource = read('components/WorldMap.tsx');
const typesSource = read('types.ts');
const audioSource = read('services/audioService.ts');
const diagnosticsSource = read('services/diagnosticsService.ts');
const storySource = read('components/StoryBook.tsx');
const serverSource = read('server/production-server.mjs');
const cloudflareWorkerSource = read('cloudflare/worker.ts');
const wranglerSource = read('wrangler.jsonc');
const firebaseJsonSource = read('firebase.json');
const firestoreRulesSource = read('firestore.rules');
const storageRulesSource = read('storage.rules');
const firebaseClientSource = read('services/firebaseClient.ts');
const firebaseParentAuthSource = read('services/firebaseParentAuth.ts');
const firebaseProgressStoreSource = read('services/firebaseProgressStore.ts');
const stripeBillingSource = read('services/stripeBilling.ts');
const firebaseFunctionsSource = read('functions/index.js');
const blogIndexSource = read('public/blog/index.html');
const packageJson = JSON.parse(read('package.json'));
const readmeSource = read('README.md');
const secretCheckSource = read('scripts/check-secrets.mjs');
const functionsEnvExampleSource = read('functions/.env.example');

if (!appSource.includes("setLegalView('privacy')") || !appSource.includes("setLegalView('terms')") || !appSource.includes("setLegalView('support')")) {
  fail('Privacy, terms, and parent support links are not reachable from the app.');
}
const legalLower = legalSource.toLowerCase();
if (
  !legalLower.includes('children') ||
  !legalLower.includes('parent') ||
  !legalLower.includes('saved static media') ||
  !legalLower.includes('crateshipstudios@gmail.com') ||
  !legalLower.includes('review stored account data') ||
  !legalLower.includes('request deletion') ||
  !legalLower.includes('do not sell child personal information')
) {
  fail('Legal copy must clearly address children, parents, saved static media, support contact, and parent data rights.');
}
if (!parentSource.includes('Privacy Controls') || !parentSource.includes('Parent PIN')) {
  fail('Parent privacy controls and PIN gate must be present before launch.');
}
if (
  !typesSource.includes("STUDY = 'STUDY'") ||
  !appSource.includes("import('./components/StudyZone')") ||
  !appSource.includes('handleStudyReviewComplete') ||
  !worldMapSource.includes('RoomType.STUDY') ||
  !studyZoneSource.includes('buildLatestMissedReviewQueue') ||
  !studyZoneSource.includes('assignmentAttempts') ||
  !studyZoneSource.includes('onReviewComplete')
) {
  fail('Study Zone must be wired as a real missed-answer review room before launch.');
}
if (!parentSource.includes('Support Diagnostics') || !parentSource.includes('Export Diagnostics') || !diagnosticsSource.includes('kid-genius-diagnostics-') || !appSource.includes('logDiagnosticEvent') || !audioSource.includes('voice-playback')) {
  fail('Parent support diagnostics export and client-side error logging must be present before launch.');
}
if (
  !packageJson.scripts?.qa?.includes('qa:secrets') ||
  !packageJson.scripts?.['qa:secrets'] ||
  !secretCheckSource.includes('git') ||
  !secretCheckSource.includes('Stripe secret key') ||
  !secretCheckSource.includes('ElevenLabs API key shape') ||
  !secretCheckSource.includes('functions/.env.kid-genius-world') ||
  !readmeSource.includes('Firebase Functions') ||
  !readmeSource.includes('functions/.env.kid-genius-world') ||
  !readmeSource.includes('Do not hardcode live Stripe Price IDs') ||
  !readmeSource.includes('npm run qa:secrets')
) {
  fail('Secret scanning and Firebase Functions environment documentation must stay wired before launch.');
}
if (
  !audioSource.includes('kidGeniusAllowExternalVoice') ||
  !audioSource.includes('playBrowserVoiceSpeech') ||
  !audioSource.includes('window.speechSynthesis.speak(utterance)') ||
  !storySource.includes('/story-covers/${story.id}.png')
) {
  fail('Saved voice, browser voice fallback, and static cover features must be wired before launch.');
}
if (audioSource.includes('/api/tts') || storySource.includes('/api/story-cover') || storySource.includes('fetch(')) {
  fail('Child-facing media must load from static files, not runtime generation APIs.');
}
if (!firebaseJsonSource.includes('"public": "dist"') || !firebaseJsonSource.includes('"destination": "/index.html"') || !firebaseJsonSource.includes('"storage"')) {
  fail('Firebase Hosting must serve the Vite dist build with SPA rewrites and Storage rules config.');
}
if (
  !firestoreRulesSource.includes('isFamilyParent') ||
  !firestoreRulesSource.includes('familyPayloadIsSafe') ||
  !firestoreRulesSource.includes('parentListUnchanged') ||
  !firestoreRulesSource.includes('match /billingCustomers/{parentUid}') ||
  !firestoreRulesSource.includes('allow read, write: if false') ||
  !firestoreRulesSource.includes('stripeCustomerId') ||
  !firestoreRulesSource.includes('billingAccessActive')
) {
  fail('Firestore rules must enforce parent-owned access, server-only billing records, and deny by default.');
}
if (
  !storageRulesSource.includes('isFamilyParent') ||
  !storageRulesSource.includes('match /families/{familyId}/{allPaths=**}') ||
  !storageRulesSource.includes('allow create, update: if isFamilyParent(familyId) && childUploadIsSafe()') ||
  !storageRulesSource.includes('match /public/{allPaths=**}') ||
  !storageRulesSource.includes('allow write: if false') ||
  !storageRulesSource.includes('match /{allPaths=**}') ||
  !storageRulesSource.includes('allow read, write: if false')
) {
  fail('Storage rules must enforce parent-owned family files, read-only public assets, and deny by default.');
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
if (!appSource.includes('syncActiveProgressToCloud') || !appSource.includes('CLOUD_AUTOSYNC_DELAY_MS') || !firebaseProgressStoreSource.includes('loadFamilyProgressFromFirebase')) {
  fail('Firebase cloud progress must hydrate saved child profiles and autosave learning progress after parent opt-in.');
}
if (!parentSource.includes('Family Subscription') || !stripeBillingSource.includes('getCurrentParentIdToken') || !firebaseFunctionsSource.includes('STRIPE_SECRET_KEY') || !firebaseFunctionsSource.includes('STRIPE_STARTER_PRICE_ID') || !firebaseFunctionsSource.includes('STRIPE_PREMIUM_PRICE_ID') || !firebaseFunctionsSource.includes('verifyIdToken')) {
  fail('Stripe subscription controls must be parent-only and backed by Firebase Functions verified auth.');
}
if (
  !read('services/schoolMode.ts').includes('whyItMatters') ||
  !read('services/schoolMode.ts').includes('getStudentPassportSummary') ||
  !read('services/schoolMode.ts').includes('getTeacherConferencePlan') ||
  !read('services/schoolMode.ts').includes('getTeacherHelpLadder') ||
  !read('components/TeacherRoomCoach.tsx').includes('teacher-help-ladder') ||
  !read('components/WorldMap.tsx').includes('Proof to finish') ||
  !read('components/WorldMap.tsx').includes('Class reward') ||
  !read('components/WorldMap.tsx').includes('period.proof') ||
  !read('components/WorldMap.tsx').includes('student-passport-conference') ||
  !read('components/WorldMap.tsx').includes('student-teacher-conference-plan') ||
  !read('components/WorldMap.tsx').includes('Teacher conference question') ||
  !read('components/WorldMap.tsx').includes('Next stamp target') ||
  !parentSource.includes('Required proof') ||
  !parentSource.includes('period.whyItMatters') ||
  !parentSource.includes('parent-teacher-help-ladder') ||
  !parentSource.includes('parent-student-passport') ||
  !parentSource.includes('parent-teacher-conference-plan') ||
  !parentSource.includes('Student Learning Passport') ||
  !parentSource.includes('Parent follow-up')
) {
  fail('School day plan and learning passport must show proof, rewards, teacher help ladder support, conference plans, and parent rationale.');
}
if (
  !readmeSource.includes('https://kid-genius-world.com/api/billing/webhook') ||
  !readmeSource.includes('STRIPE_WEBHOOK_SECRET') ||
  !secretCheckSource.includes('Stripe webhook signing secret')
) {
  fail('Stripe webhook endpoint, signing-secret documentation, and secret scanning must stay wired.');
}
if (
  !firebaseFunctionsSource.includes('getVerifiedFamilyId') ||
  !firebaseFunctionsSource.includes('getConfiguredPriceId') ||
  !firebaseFunctionsSource.includes('identifyPlanFromPrice') ||
  !firebaseFunctionsSource.includes('verifyStripeWebhookEvent') ||
  !firebaseFunctionsSource.includes('handleStripeBillingEvent') ||
  !firebaseFunctionsSource.includes('STRIPE_WEBHOOK_SECRET') ||
  !firebaseFunctionsSource.includes('stripe.webhooks.constructEvent') ||
  !firebaseFunctionsSource.includes('checkout.session.completed') ||
  !firebaseFunctionsSource.includes('invoice.payment_failed') ||
  !firebaseFunctionsSource.includes('billingCustomers') ||
  !firebaseFunctionsSource.includes('stripeEvents') ||
  !firebaseFunctionsSource.includes('billingAccessActive') ||
  !firebaseFunctionsSource.includes('cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)') ||
  !firebaseFunctionsSource.includes('FieldValue.serverTimestamp') ||
  !firebaseFunctionsSource.includes('persistCustomerMapping') ||
  !firebaseFunctionsSource.includes("invoker: 'public'") ||
  !firebaseFunctionsSource.includes('Parent account does not match the requested family billing record')
) {
  fail('Firebase billing functions must derive family access from verified Firebase auth and persist Stripe customer mappings.');
}
if (
  !firebaseFunctionsSource.includes('DEFAULT_COMPED_PARENT_EMAILS') ||
  !firebaseFunctionsSource.includes('korikes2021@gmail.com') ||
  !firebaseFunctionsSource.includes('koikes2021@gmail.com') ||
  !firebaseFunctionsSource.includes('owner_comped') ||
  !firebaseFunctionsSource.includes('persistCompedBillingSnapshot') ||
  !stripeBillingSource.includes('accessSource') ||
  !appSource.includes('OWNER_STARTER_PROFILES') ||
  !appSource.includes('buildOwnerFamilyAccessRecord') ||
  !appSource.includes('verifiedOwnerEmail') ||
  !parentSource.includes('No profile limit in the app') ||
  !functionsEnvExampleSource.includes('COMPED_PARENT_EMAILS')
) {
  fail('Owner comped access and starter child profile seeding must stay launch-ready.');
}
if (
  firebaseFunctionsSource.includes('price_1TU') ||
  firebaseFunctionsSource.includes("getEnv('STRIPE_PREMIUM_PRICE_ID',") ||
  firebaseFunctionsSource.includes("getEnv('STRIPE_STARTER_PRICE_ID',")
) {
  fail('Firebase billing functions must not hardcode live Stripe Price ID fallbacks.');
}
const liveBillingCheckSource = read('scripts/check-live-billing-api.mjs');
const liveSiteCheckSource = read('scripts/check-live-site.mjs');
const functionsDeployScriptSource = read('scripts/deploy-firebase-functions.mjs');
const staticMediaCheckSource = read('scripts/check-static-media-readiness.mjs');
const mobileHandoffCheckSource = read('scripts/check-mobile-handoff-readiness.mjs');
const operationsCheckSource = read('scripts/check-operations-readiness.mjs');
const finishLineSource = read('docs/production-finish-line.md');
const mobileHandoffSource = read('docs/mobile-handoff.md');
const launchOperationsSource = read('docs/launch-operations-runbook.md');
if (
  !packageJson.scripts?.['qa:site-live'] ||
  !packageJson.scripts?.['qa:billing-live'] ||
  !packageJson.scripts?.['qa:production-live'] ||
  !packageJson.scripts?.['qa:media'] ||
  !packageJson.scripts?.['qa:mobile-handoff'] ||
  !packageJson.scripts?.['qa:ops'] ||
  !packageJson.scripts?.qa?.includes('qa:media') ||
  !packageJson.scripts?.qa?.includes('qa:mobile-handoff') ||
  !packageJson.scripts?.qa?.includes('qa:ops') ||
  !liveSiteCheckSource.includes('checkWwwRedirect') ||
  !liveSiteCheckSource.includes('/manifest.webmanifest') ||
  !liveSiteCheckSource.includes('/sitemap.xml') ||
  !liveSiteCheckSource.includes('Blog index has too few article links') ||
  !liveBillingCheckSource.includes('/api/billing/access') ||
  !liveBillingCheckSource.includes('Parent sign-in token is required.') ||
  !liveBillingCheckSource.includes('/api/billing/webhook') ||
  !liveBillingCheckSource.includes('Stripe webhook signature is required.') ||
  !liveBillingCheckSource.includes('CORS preflight') ||
  !packageJson.scripts?.['firebase:deploy:functions'] ||
  !packageJson.scripts?.['firebase:deploy:hosting']?.includes('qa:production-live') ||
  !functionsDeployScriptSource.includes('FUNCTIONS_DISCOVERY_TIMEOUT') ||
  !staticMediaCheckSource.includes('MIN_STATIC_VOICE_FILES') ||
  !staticMediaCheckSource.includes('Missing SVG story cover fallbacks') ||
  !mobileHandoffCheckSource.includes('disallowedWebRepoMobileDeps') ||
  !mobileHandoffSource.includes('Legacy Native Reference') ||
  !mobileHandoffSource.includes('com.kidgenius.world') ||
  !finishLineSource.includes('Kid Genius World Mobile') ||
  !finishLineSource.includes('separate GitHub repo') ||
  !finishLineSource.includes('$0.50') ||
  !operationsCheckSource.includes('Operations readiness passed') ||
  !launchOperationsSource.includes('Firebase Monitoring') ||
  !launchOperationsSource.includes('Search And SEO Monitoring') ||
  !launchOperationsSource.includes('Rollback path')
) {
  fail('Live production, static media, finish-line, operations, billing API, and Firebase deploy smoke scripts must stay available.');
}
if (!firebaseJsonSource.includes('/api/billing/checkout') || !firebaseJsonSource.includes('billingCheckout') || !firebaseJsonSource.includes('billingAccess') || !firebaseJsonSource.includes('/api/billing/webhook') || !firebaseJsonSource.includes('billingWebhook')) {
  fail('Firebase Hosting must rewrite billing API routes to Firebase Functions.');
}
if (stripeBillingSource.includes('VITE_MEDIA_API_BASE_URL')) {
  fail('Stripe billing must not fall back to the media host; it should use Firebase Hosting /api/billing routes.');
}
if (!firebaseFunctionsSource.includes("subscription_data") || !firebaseFunctionsSource.includes("trial_period_days: 3") || !stripeBillingSource.includes('getStripeBillingAccess') || !appSource.includes('verifiedByBillingApi')) {
  fail('Paid learning sections must use a Stripe-backed 3-day trial and verified billing access before opening.');
}
if (
  !appSource.includes('access-gate-billing-status') ||
  !parentSource.includes('parent-billing-status-card') ||
  !appSource.includes('Trial active') ||
  !parentSource.includes('Subscription active') ||
  !stripeBillingSource.includes('lastStripeEventAt') ||
  !appSource.includes('lastInvoiceStatus') ||
  !parentSource.includes('Stripe webhook:') ||
  !parentSource.includes('Latest invoice:') ||
  !firebaseFunctionsSource.includes('getBillingSnapshotSummary') ||
  !parentSource.includes('Manage Billing in Stripe') ||
  !parentSource.includes('Refresh Stripe Status') ||
  !appSource.includes('handleRefreshBillingAccess')
) {
  fail('Parent billing UI must show explicit trial/subscription status after checkout before launch.');
}
if (appSource.includes('Access is unlocked while server verification finishes') || appSource.includes('verifiedByBillingApi: false')) {
  fail('Checkout success must not unlock paid learning access without Stripe verification.');
}
if (!exists('tailwind.config.js') || !exists('postcss.config.js') || !exists('index.css')) {
  fail('Tailwind must stay in the local build pipeline for production.');
}
if (/href="\d+\//.test(blogIndexSource)) {
  fail('Blog index must link to canonical /blog/article.html URLs, not numbered placeholder folders.');
}
for (const match of blogIndexSource.matchAll(/href="\/blog\/([^"]+\.html)"/g)) {
  const blogFile = `public/blog/${match[1]}`;
  if (!exists(blogFile)) {
    fail(`Blog index links to missing article file: ${blogFile}`);
  }
}

if (failures.length) {
  console.error('Launch readiness failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`Launch readiness passed: ${sourceFiles.length} source/config files checked, production build and kids-safety gates verified.`);
