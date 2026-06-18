import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const requiredFiles = [
  'App.tsx',
  'components/LegalInfo.tsx',
  'components/ParentDashboard.tsx',
  'components/WorldMap.tsx',
  'components/AchievementsPanel.tsx',
  'components/GameArcade.tsx',
  'components/StudyZone.tsx',
  'components/StoryBook.tsx',
  'services/curriculum.ts',
  'services/learningConstants.ts',
  'services/achievements.ts',
  'services/audioService.ts',
  'services/diagnosticsService.ts',
  'services/mediaApi.ts',
  'services/voiceCacheService.ts',
  'server/production-server.mjs',
  '.firebaserc',
  'firebase.json',
  'firestore.rules',
  'storage.rules',
  'firestore.indexes.json',
  'services/firebaseClient.ts',
  'services/firebaseParentAuth.ts',
  'services/firebaseProgressStore.ts',
  'services/stripeBilling.ts',
  'functions/index.js',
  'functions/.env.example',
  'components/InstallAppButton.tsx',
  'scripts/check-secrets.mjs',
  'scripts/check-elevenlabs-key.mjs',
  'scripts/check-live-site.mjs',
  'scripts/check-live-billing-api.mjs',
  'scripts/check-static-media-readiness.mjs',
  'scripts/check-mobile-handoff-readiness.mjs',
  'scripts/check-operations-readiness.mjs',
  'scripts/deploy-firebase-functions.mjs',
  'scripts/warm-voice-cache.mjs',
  'scripts/export-static-voice-cache.mjs',
  'scripts/generate-static-story-covers.mjs',
  'public/manifest.webmanifest',
  'public/sw.js',
  'public/icons/icon.svg',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/maskable-icon-512.png',
  'public/icons/apple-touch-icon.png',
  'public/brand/logo-options.html',
  'public/brand/logo-option-1-genius-globe.svg',
  'public/brand/logo-option-2-brain-book.svg',
  'public/brand/logo-option-3-rocket-pencil.svg',
  'public/voice-cache/manifest.json',
  'docs/production-finish-line.md',
  'docs/mobile-handoff.md',
  'docs/launch-operations-runbook.md',
  'public/story-covers/pk-1.svg',
  'public/story-covers/pk-1.png',
  'cloudflare/worker.ts',
  'wrangler.jsonc',
  'types.ts',
  'index.css',
  'tailwind.config.js',
  'postcss.config.js',
  'dist/index.html',
];

const fail = (message) => {
  console.error(`QA check failed: ${message}`);
  process.exitCode = 1;
};

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    fail(`Missing required file: ${file}`);
  }
}

const appSource = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
const parentDashboardSource = fs.readFileSync(path.join(root, 'components/ParentDashboard.tsx'), 'utf8');
const worldMapSource = fs.readFileSync(path.join(root, 'components/WorldMap.tsx'), 'utf8');
const achievementsPanelSource = fs.readFileSync(path.join(root, 'components/AchievementsPanel.tsx'), 'utf8');
const teacherRoomCoachSource = fs.readFileSync(path.join(root, 'components/TeacherRoomCoach.tsx'), 'utf8');
const curriculumSource = fs.readFileSync(path.join(root, 'services/curriculum.ts'), 'utf8');
const learningConstantsSource = fs.readFileSync(path.join(root, 'services/learningConstants.ts'), 'utf8');
const achievementServiceSource = fs.readFileSync(path.join(root, 'services/achievements.ts'), 'utf8');
const schoolModeSource = fs.readFileSync(path.join(root, 'services/schoolMode.ts'), 'utf8');
const typesSource = fs.readFileSync(path.join(root, 'types.ts'), 'utf8');
const audioServiceSource = fs.readFileSync(path.join(root, 'services/audioService.ts'), 'utf8');
const diagnosticsServiceSource = fs.readFileSync(path.join(root, 'services/diagnosticsService.ts'), 'utf8');
const mediaApiSource = fs.readFileSync(path.join(root, 'services/mediaApi.ts'), 'utf8');
const voiceCacheSource = fs.readFileSync(path.join(root, 'services/voiceCacheService.ts'), 'utf8');
const firebaseClientSource = fs.readFileSync(path.join(root, 'services/firebaseClient.ts'), 'utf8');
const firebaseParentAuthSource = fs.readFileSync(path.join(root, 'services/firebaseParentAuth.ts'), 'utf8');
const firebaseProgressStoreSource = fs.readFileSync(path.join(root, 'services/firebaseProgressStore.ts'), 'utf8');
const stripeBillingSource = fs.readFileSync(path.join(root, 'services/stripeBilling.ts'), 'utf8');
const installAppButtonSource = fs.readFileSync(path.join(root, 'components/InstallAppButton.tsx'), 'utf8');
const firebaseJsonSource = fs.readFileSync(path.join(root, 'firebase.json'), 'utf8');
const firestoreRulesSource = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
const storageRulesSource = fs.readFileSync(path.join(root, 'storage.rules'), 'utf8');
const storyBookSource = fs.readFileSync(path.join(root, 'components/StoryBook.tsx'), 'utf8');
const cloudflareWorkerSource = fs.readFileSync(path.join(root, 'cloudflare/worker.ts'), 'utf8');
const wranglerSource = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
const viteConfigSource = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8');
const codingRoomSource = fs.readFileSync(path.join(root, 'components/CodingRoom.tsx'), 'utf8');
const mathRoomSource = fs.readFileSync(path.join(root, 'components/MathRoom.tsx'), 'utf8');
const readingRoomSource = fs.readFileSync(path.join(root, 'components/ReadingRoom.tsx'), 'utf8');
const scienceRoomSource = fs.readFileSync(path.join(root, 'components/ScienceRoom.tsx'), 'utf8');
const geographyRoomSource = fs.readFileSync(path.join(root, 'components/GeographyRoom.tsx'), 'utf8');
const gameArcadeSource = fs.readFileSync(path.join(root, 'components/GameArcade.tsx'), 'utf8');
const studyZoneSource = fs.readFileSync(path.join(root, 'components/StudyZone.tsx'), 'utf8');
const languageRoomSource = fs.readFileSync(path.join(root, 'components/LanguageRoom.tsx'), 'utf8');
const artRoomSource = fs.readFileSync(path.join(root, 'components/ArtRoom.tsx'), 'utf8');
const puzzleRoomSource = fs.readFileSync(path.join(root, 'components/PuzzleRoom.tsx'), 'utf8');
const musicRoomSource = fs.readFileSync(path.join(root, 'components/MusicRoom.tsx'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const readmeSource = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const secretCheckSource = fs.readFileSync(path.join(root, 'scripts/check-secrets.mjs'), 'utf8');
const staticMediaCheckSource = fs.readFileSync(path.join(root, 'scripts/check-static-media-readiness.mjs'), 'utf8');
const mobileHandoffCheckSource = fs.readFileSync(path.join(root, 'scripts/check-mobile-handoff-readiness.mjs'), 'utf8');
const operationsCheckSource = fs.readFileSync(path.join(root, 'scripts/check-operations-readiness.mjs'), 'utf8');
const finishLineSource = fs.readFileSync(path.join(root, 'docs/production-finish-line.md'), 'utf8');
const mobileHandoffSource = fs.readFileSync(path.join(root, 'docs/mobile-handoff.md'), 'utf8');
const launchOperationsSource = fs.readFileSync(path.join(root, 'docs/launch-operations-runbook.md'), 'utf8');
const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.tsx'), 'utf8');
const pwaManifest = JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.webmanifest'), 'utf8'));
const serviceWorkerSource = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
const distIndex = fs.existsSync(path.join(root, 'dist/index.html'))
  ? fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')
  : '';
const roomBackButtonSources = [
  ['MathRoom', mathRoomSource],
  ['ReadingRoom', readingRoomSource],
  ['ScienceRoom', scienceRoomSource],
  ['GeographyRoom', geographyRoomSource],
  ['CodingRoom', codingRoomSource],
  ['LanguageRoom', languageRoomSource],
  ['ArtRoom', artRoomSource],
  ['MusicRoom', musicRoomSource],
  ['PuzzleRoom', puzzleRoomSource],
  ['StoryBook', storyBookSource],
  ['StudyZone', studyZoneSource],
];

const sourceFilesToScan = [
  'App.tsx',
  'components/AchievementsPanel.tsx',
  'components/ArtRoom.tsx',
  'components/CodingRoom.tsx',
  'components/GeographyRoom.tsx',
  'components/GameArcade.tsx',
  'components/StudyZone.tsx',
  'components/Guide.tsx',
  'components/LanguageRoom.tsx',
  'components/MathRoom.tsx',
  'components/MusicRoom.tsx',
  'components/ParentDashboard.tsx',
  'components/PuzzleRoom.tsx',
  'components/ReadingRoom.tsx',
  'components/ScienceRoom.tsx',
  'components/StoryBook.tsx',
  'components/TeacherRoomCoach.tsx',
  'components/WorldMap.tsx',
  'services/audioService.ts',
  'services/achievements.ts',
  'services/curriculum.ts',
  'services/firebaseParentAuth.ts',
  'services/firebaseProgressStore.ts',
  'services/mediaApi.ts',
  'services/voiceCacheService.ts',
  'types.ts',
];

const mojibakePattern = /Ã|Â|ðŸ|âœ|â˜|â­|âš|â/;
for (const file of sourceFilesToScan) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (mojibakePattern.test(source)) {
    fail(`Possible text encoding/mojibake artifact found in ${file}.`);
  }
}

if (!appSource.includes('Parent Setup')) fail('Parent setup screen is not wired in App.tsx.');
if (appSource.includes("components/Playground") || appSource.includes('RoomType.PLAYGROUND') || worldMapSource.includes('Free Play')) {
  fail('Playground should stay removed from the launch app surface.');
}
if (
  !typesSource.includes("STUDY = 'STUDY'") ||
  !appSource.includes("import('./components/StudyZone')") ||
  !appSource.includes('handleStudyReviewComplete') ||
  !worldMapSource.includes('RoomType.STUDY') ||
  !studyZoneSource.includes('buildLatestMissedReviewQueue') ||
  !studyZoneSource.includes('assignmentAttempts') ||
  !studyZoneSource.includes('onReviewComplete') ||
  !studyZoneSource.includes('Study Zone')
) {
  fail('Study Zone must be wired as a real missed-answer review room.');
}
if (packageJson.dependencies?.three || packageJson.dependencies?.['@types/three']) {
  fail('Three.js should not ship while Playground is removed.');
}
if (!appSource.includes('lazy(() => import') || !appSource.includes('<Suspense fallback=')) {
  fail('Room components are not lazy-loaded for production bundle performance.');
}
if (!appSource.includes("import('./services/voiceCacheService')") || !parentDashboardSource.includes("import('../services/voiceCacheService')")) {
  fail('Voice cache service is not dynamically loaded.');
}
if (!appSource.includes('kidGeniusParentPin')) fail('Local parent PIN storage is not wired in App.tsx.');
if (!appSource.includes('kidGeniusProfiles') || !appSource.includes('kidGeniusActiveProfileId')) {
  fail('Local child profile storage is not wired in App.tsx.');
}
if (!appSource.includes('onCreateChildProfile') || !appSource.includes('onSwitchChildProfile')) {
  fail('Child profile handlers are not connected to the parent dashboard.');
}
if (!appSource.includes('totalPlayTimeMinutes') || !appSource.includes('sessionsCompleted') || !appSource.includes('currentStreak')) {
  fail('Local session analytics are not wired in App.tsx.');
}
if (!typesSource.includes('dailyStats: DailyStats[]') || !appSource.includes('updateDailyStats')) {
  fail('Daily activity analytics are not wired into the progress model.');
}
if (!typesSource.includes('weeklyGoalMinutes') || !typesSource.includes('dailySessionLimitMinutes') || !parentDashboardSource.includes('Family Learning Goals')) {
  fail('Parent-configurable learning goals and screen-time pacing are missing.');
}
if (!parentDashboardSource.includes('Daily Activity') || !parentDashboardSource.includes('minutes this week') || !parentDashboardSource.includes('rooms explored')) {
  fail('Parent dashboard daily activity summary is missing.');
}
if (!parentDashboardSource.includes('Family Plan') || !parentDashboardSource.includes('No payment collection') || !parentDashboardSource.includes('Paid Launch Readiness')) {
  fail('Parent dashboard must explain family plan value without collecting payments.');
}
if (!parentDashboardSource.includes('Export Local Progress') || !parentDashboardSource.includes('kid-genius-progress-') || !parentDashboardSource.includes('Parent progress export')) {
  fail('Parent dashboard must provide local progress export before reset or device migration.');
}
if (!parentDashboardSource.includes('Support Diagnostics') || !parentDashboardSource.includes('Export Diagnostics') || !diagnosticsServiceSource.includes('kid-genius-diagnostics-') || !appSource.includes('logDiagnosticEvent') || !audioServiceSource.includes('voice-playback')) {
  fail('Parent support diagnostics export and client-side error logging must be wired.');
}
if (!appSource.includes('Family Plan') || !appSource.includes('parent-only Firebase sign-in and Stripe checkout')) {
  fail('Parent onboarding must clearly frame parent-only family billing.');
}
if (
  appSource.includes('future premium') ||
  appSource.includes('Intended tier for future premium content') ||
  !appSource.includes('Transparent launch pricing') ||
  !appSource.includes('Premium adds priority curriculum drops, expanded parent reports, early access to new book packs, and support priority') ||
  !appSource.includes('keeping kids out of billing screens') ||
  !parentDashboardSource.includes('Plan clarity') ||
  !parentDashboardSource.includes('expanded parent reports, early book packs, priority content drops, and support priority') ||
  !parentDashboardSource.includes('no child-facing learning room is hidden behind a surprise upsell at launch')
) {
  fail('Launch subscription plan copy must be transparent and avoid unfinished premium promises.');
}
if (!appSource.includes('Parent Launch Checkpoints') || !appSource.includes('kidGeniusParentConsentReceipt') || !appSource.includes('I reviewed the Privacy Notice and Terms of Use')) {
  fail('Parent onboarding must require explicit privacy, terms, and consent checkpoints.');
}
if (!appSource.includes("setLegalView('privacy')")) fail('Privacy notice link is not wired in App.tsx.');
if (!appSource.includes("setLegalView('terms')")) fail('Terms link is not wired in App.tsx.');
if (!appSource.includes("setLegalView('support')") || !appSource.includes('crateshipstudios@gmail.com')) {
  fail('Parent support page and support email must be reachable from the app.');
}
const legalSource = fs.readFileSync(path.join(root, 'components/LegalInfo.tsx'), 'utf8');
const legalLower = legalSource.toLowerCase();
if (!legalLower.includes('parent support') || !legalLower.includes('crateshipstudios@gmail.com') || !legalLower.includes('request deletion') || !legalLower.includes('do not sell child personal information')) {
  fail('Legal pages must include parent support, support email, deletion rights, and child data sale language.');
}
if (!parentDashboardSource.includes('Parent PIN')) fail('Parent PIN UI is missing.');
if (!parentDashboardSource.includes('Child Profiles')) fail('Child profile UI is missing.');
if (!parentDashboardSource.includes('Create Child Profile')) fail('Create child profile action is missing.');
if (!parentDashboardSource.includes('Curriculum Roadmap')) fail('Parent curriculum roadmap is missing.');
if (!parentDashboardSource.includes('getRoadmapRecommendations')) fail('Roadmap recommendations are not shown in the parent dashboard.');
if (!parentDashboardSource.includes('Active grade depth') || !parentDashboardSource.includes('Unlock rules')) {
  fail('Parent roadmap does not summarize active grade depth and unlock rules.');
}
if (parentDashboardSource.includes('hidden sm:inline')) fail('Parent dashboard tab labels are hidden on mobile.');
if (!parentDashboardSource.includes('What is 8 + 7?')) fail('Parent dashboard fallback gate is missing.');
if (!parentDashboardSource.includes('served from saved static media files') || !parentDashboardSource.includes('does not call live media generation APIs')) {
  fail('Privacy copy must explain static saved media instead of live media generation APIs.');
}
if (!typesSource.includes('PrivacySettings') || !typesSource.includes('allowExternalVoice') || !typesSource.includes('allowGeneratedStoryCovers') || !typesSource.includes('allowCloudSync')) {
  fail('Privacy settings data model is missing.');
}
if (!appSource.includes('kidGeniusAllowExternalVoice') || !appSource.includes('kidGeniusAllowGeneratedStoryCovers')) {
  fail('Privacy controls are not synced to browser storage.');
}
if (!appSource.includes('kidGeniusMediaDefaultsMigrated') || !appSource.includes('kidGeniusParentConsentReceipt')) {
  fail('Parent-approved profiles must migrate to voice and generated-cover defaults without re-onboarding.');
}
if (!parentDashboardSource.includes('Privacy Controls') || !parentDashboardSource.includes('Enable Saved Voice First')) {
  fail('Parent privacy controls are not visible in settings.');
}
if (!parentDashboardSource.includes('Parent Consent Receipt') || !parentDashboardSource.includes('kidGeniusParentConsentReceipt')) {
  fail('Parent dashboard must show the local consent receipt status.');
}
if (!audioServiceSource.includes('kidGeniusAllowExternalVoice') || !voiceCacheSource.includes('kidGeniusAllowExternalVoice')) {
  fail('Saved voice playback is not gated by parent privacy controls.');
}
if (!packageJson.dependencies?.firebase || !packageJson.devDependencies?.['firebase-tools']) {
  fail('Firebase Web SDK and Firebase CLI dependencies must be present for web-only Firebase deployment.');
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
if (!firebaseJsonSource.includes('"public": "dist"') || !firebaseJsonSource.includes('"firestore"') || !firebaseJsonSource.includes('"storage"')) {
  fail('Firebase Hosting must serve the Vite dist folder and include Firestore and Storage config.');
}
if (!firebaseClientSource.includes('VITE_FIREBASE_PROJECT_ID') || !firebaseClientSource.includes('kid-genius-world')) {
  fail('Firebase Web SDK must be initialized from VITE_FIREBASE_* config with the expected project fallback.');
}
if (!firebaseParentAuthSource.includes('createUserWithEmailAndPassword') || !firebaseParentAuthSource.includes('signInWithEmailAndPassword') || !firebaseParentAuthSource.includes('GoogleAuthProvider') || !parentDashboardSource.includes('Firebase Parent Account')) {
  fail('Firebase parent account creation/sign-in, including Google, must be wired into the parent dashboard.');
}
if (!parentDashboardSource.includes('Firebase cloud progress sync') || !parentDashboardSource.includes('Sync Progress Now') || !appSource.includes('syncProgressToFirebase')) {
  fail('Firebase cloud progress sync must be parent-gated and available from the parent dashboard.');
}
if (!appSource.includes('syncActiveProgressToCloud') || !appSource.includes('CLOUD_AUTOSYNC_DELAY_MS') || !firebaseProgressStoreSource.includes('loadFamilyProgressFromFirebase')) {
  fail('Firebase cloud progress must load saved child profiles and autosave completed learning after parent opt-in.');
}
if (!parentDashboardSource.includes('getFriendlyFirebaseMessage') || !parentDashboardSource.includes('auth/operation-not-allowed') || !parentDashboardSource.includes('auth/popup-blocked')) {
  fail('Firebase parent auth errors must be translated into parent-friendly messages.');
}
if (!firebaseProgressStoreSource.includes('families') || !firebaseProgressStoreSource.includes('children') || !firebaseProgressStoreSource.includes('progress')) {
  fail('Firebase progress sync boundary must use parent-owned family/child/progress paths.');
}
if (!firebaseProgressStoreSource.includes('ensureFamilyDocument') || !firebaseProgressStoreSource.includes('cloudSyncConsent')) {
  fail('Firebase progress sync must create a parent-owned family consent record before child progress writes.');
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
  fail('Firestore rules must enforce parent-owned access, server-only billing records, and deny unknown collections.');
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
  fail('Storage rules must enforce parent-owned family files, read-only public assets, and deny unknown paths.');
}
if (!stripeBillingSource.includes('getCurrentParentIdToken') || !stripeBillingSource.includes('/api/billing/checkout') || !stripeBillingSource.includes('/api/billing/portal')) {
  fail('Stripe billing must require Firebase parent auth before checkout or portal access.');
}
if (
  !readmeSource.includes('https://kid-genius-world.com/api/billing/webhook') ||
  !readmeSource.includes('STRIPE_WEBHOOK_SECRET') ||
  !secretCheckSource.includes('Stripe webhook signing secret')
) {
  fail('Stripe webhook endpoint, signing-secret documentation, and secret scanning must stay wired.');
}
if (!cloudflareWorkerSource.includes('STRIPE_SECRET_KEY') || !cloudflareWorkerSource.includes('STRIPE_STARTER_PRICE_ID') || !cloudflareWorkerSource.includes('STRIPE_PREMIUM_PRICE_ID') || !cloudflareWorkerSource.includes('accounts:lookup') || !cloudflareWorkerSource.includes('/api/billing/checkout')) {
  fail('Cloudflare Worker must create Stripe billing sessions behind verified Firebase parent auth.');
}
const firebaseFunctionsSource = fs.readFileSync(path.join(root, 'functions/index.js'), 'utf8');
const functionsEnvExampleSource = fs.readFileSync(path.join(root, 'functions/.env.example'), 'utf8');
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
  !stripeBillingSource.includes('comped') ||
  !appSource.includes('OWNER_STARTER_PROFILES') ||
  !appSource.includes('buildOwnerFamilyAccessRecord') ||
  !appSource.includes('verifiedOwnerEmail') ||
  !appSource.includes('owner-profile-1') ||
  !appSource.includes('owner-profile-2') ||
  !appSource.includes('owner-profile-3') ||
  !parentDashboardSource.includes('Unlimited access is enabled') ||
  !parentDashboardSource.includes('No profile limit in the app') ||
  !functionsEnvExampleSource.includes('COMPED_PARENT_EMAILS')
) {
  fail('Owner comped access and starter child profile seeding must stay wired for the launch owner account.');
}
if (
  firebaseFunctionsSource.includes('price_1TU') ||
  firebaseFunctionsSource.includes("getEnv('STRIPE_PREMIUM_PRICE_ID',") ||
  firebaseFunctionsSource.includes("getEnv('STRIPE_STARTER_PRICE_ID',")
) {
  fail('Firebase billing functions must not hardcode live Stripe Price ID fallbacks.');
}
const liveBillingCheckSource = fs.readFileSync(path.join(root, 'scripts/check-live-billing-api.mjs'), 'utf8');
const liveSiteCheckSource = fs.readFileSync(path.join(root, 'scripts/check-live-site.mjs'), 'utf8');
const functionsDeployScriptSource = fs.readFileSync(path.join(root, 'scripts/deploy-firebase-functions.mjs'), 'utf8');
if (
  !packageJson.scripts?.['qa:site-live'] ||
  !packageJson.scripts?.['qa:billing-live'] ||
  !packageJson.scripts?.['qa:production-live'] ||
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
  !functionsDeployScriptSource.includes('FUNCTIONS_DISCOVERY_TIMEOUT')
) {
  fail('Live production site, billing API, and Firebase deploy smoke scripts must stay available.');
}
if (!parentDashboardSource.includes('Family Subscription') || !parentDashboardSource.includes('Start $4.99/mo') || !parentDashboardSource.includes('Start $9.99/mo') || !parentDashboardSource.includes('Manage Billing')) {
  fail('Parent dashboard must expose parent-only Stripe subscription controls.');
}
if (!firebaseJsonSource.includes('/api/billing/webhook') || !firebaseJsonSource.includes('billingWebhook')) {
  fail('Firebase Hosting must rewrite signed Stripe webhooks to Firebase Functions.');
}
if (
  !appSource.includes('access-gate-billing-status') ||
  !parentDashboardSource.includes('parent-billing-status-card') ||
  !appSource.includes('Trial active') ||
  !parentDashboardSource.includes('Subscription active') ||
  !stripeBillingSource.includes('lastStripeEventAt') ||
  !appSource.includes('lastInvoiceStatus') ||
  !parentDashboardSource.includes('Stripe webhook:') ||
  !parentDashboardSource.includes('Latest invoice:') ||
  !firebaseFunctionsSource.includes('getBillingSnapshotSummary') ||
  !parentDashboardSource.includes('Manage Billing in Stripe') ||
  !parentDashboardSource.includes('Refresh Stripe Status') ||
  !appSource.includes('handleRefreshBillingAccess')
) {
  fail('Parent billing UI must show explicit trial/subscription status after Stripe checkout.');
}
if (!audioServiceSource.includes('playBrowserVoiceSpeech') || !audioServiceSource.includes('window.speechSynthesis.speak(utterance)')) {
  fail('Kid-facing narration must fall back to a free device browser voice when saved voice audio is unavailable.');
}
if (!voiceCacheSource.includes('Welcome back to Kid Genius World!') || !fs.readFileSync(path.join(root, 'server/production-server.mjs'), 'utf8').includes('slice(0, 500)')) {
  fail('Human voice cache must include app greetings and support larger pre-cache batches.');
}
if (!voiceCacheSource.includes('getTeacherVoiceTexts') || !voiceCacheSource.includes('getTeacherScript') || !voiceCacheSource.includes('SCHOOL_LESSON_PHASES')) {
  fail('Static human voice cache must include AI homeroom teacher scripts and lesson phases.');
}
if (
  !schoolModeSource.includes('whyItMatters') ||
  !schoolModeSource.includes('TEACHER_HELP_LADDER') ||
  !schoolModeSource.includes('getTeacherHelpLadder') ||
  !worldMapSource.includes('Proof to finish') ||
  !worldMapSource.includes('Class reward') ||
  !worldMapSource.includes('period.proof') ||
  !parentDashboardSource.includes('Required proof') ||
  !parentDashboardSource.includes('period.whyItMatters') ||
  !teacherRoomCoachSource.includes('teacher-help-ladder') ||
  !teacherRoomCoachSource.includes('Show next teacher help step') ||
  !parentDashboardSource.includes('parent-teacher-help-ladder')
) {
  fail('School day plan must show required proof, rewards, parent rationale, and teacher help ladder support.');
}
if (
  !schoolModeSource.includes('CORE_SCHOOL_PERIOD_ROOMS') ||
  !schoolModeSource.includes('RoomType.READING') ||
  !schoolModeSource.includes('RoomType.LANGUAGE') ||
  !schoolModeSource.includes('RoomType.MATH') ||
  !schoolModeSource.includes('Last Period: Art Studio') ||
  !schoolModeSource.includes('Last Period: Music Room') ||
  !schoolModeSource.includes('previousComplete') ||
  !schoolModeSource.includes('Finish 6 answers')
) {
  fail('School periods must prioritize reading, speech/language, and math first, then keep art/music as last-period work.');
}
for (const achievementMarker of [
  'math_streak_10',
  'read_100',
  'science_10',
  'geo_50',
  'code_10',
  'lang_25',
  'sticker_100',
  'pet_level_10',
  'all_rooms',
  'week_streak',
]) {
  if (!achievementServiceSource.includes(achievementMarker)) {
    fail(`Achievement progress service must track ${achievementMarker}.`);
  }
}
if (
  !achievementServiceSource.includes('LEARNING_ROOM_ACHIEVEMENT_ROOMS') ||
  !achievementServiceSource.includes('getAchievementProgress') ||
  !achievementServiceSource.includes('getAchievementsWithProgress') ||
  !appSource.includes('getAchievementProgress(achievement.id, newProgress)') ||
  !appSource.includes('achievementsUnlocked: newlyUnlocked.map') ||
  !appSource.includes('return checkAchievements(nextProgress)') ||
  !achievementsPanelSource.includes('getAchievementsWithProgress(progress)') ||
  !achievementsPanelSource.includes('aria-label={`${achievement.name}: ${achievement.currentProgress} of ${achievement.requirement}`') ||
  !typesSource.includes("description: 'Visit all current learning rooms'") ||
  !typesSource.includes('requirement: 10')
) {
  fail('Achievement progress, unlock, and badge panel coverage must include every launch badge.');
}
const voiceWarmScript = fs.readFileSync(path.join(root, 'scripts/warm-voice-cache.mjs'), 'utf8');
const voiceStaticScript = fs.readFileSync(path.join(root, 'scripts/export-static-voice-cache.mjs'), 'utf8');
const coversStaticScript = fs.readFileSync(path.join(root, 'scripts/generate-static-story-covers.mjs'), 'utf8');
const voiceCheckScript = fs.readFileSync(path.join(root, 'scripts/check-elevenlabs-key.mjs'), 'utf8');
if (!voiceWarmScript.includes('getVoiceCacheTexts') || !voiceWarmScript.includes('--migrate-only') || !packageJson.scripts?.['voice:cache']) {
  fail('Reusable whole-app human voice cache warmup script is missing.');
}
if (!voiceWarmScript.includes('--max-chars=') || !voiceWarmScript.includes('errorSamples') || !voiceWarmScript.includes('process.exit(1)')) {
  fail('Voice cache warmup must support credit caps and fail loudly on provider errors.');
}
if (!voiceCheckScript.includes('/v1/user/subscription') || !voiceCheckScript.includes('remainingCharacters') || !packageJson.scripts?.['voice:check']) {
  fail('ElevenLabs key validation script is missing.');
}
if (!wranglerSource.includes('"MEDIA_CACHE"') || !wranglerSource.includes('"kid-genius-world-media-cache"') || !wranglerSource.includes('"not_found_handling": "single-page-application"')) {
  fail('Cloudflare Worker config must bind R2 storage and serve the SPA build.');
}
if (!cloudflareWorkerSource.includes('/voice-cache/') || !cloudflareWorkerSource.includes('MEDIA_CACHE.get(`tts/${fileName}`)') || !cloudflareWorkerSource.includes('Cache-Control')) {
  fail('Cloudflare Worker must serve static voice MP3 files from R2 without child-facing generation calls.');
}
if (!viteConfigSource.includes('/voice-cache') || !viteConfigSource.includes('.tts-cache') || !viteConfigSource.includes('audio/mpeg')) {
  fail('Local dev must serve static voice MP3 files without runtime TTS generation.');
}
if (!packageJson.scripts?.['cf:deploy'] || !packageJson.scripts?.['voice:static'] || !packageJson.scripts?.['covers:static']) {
  fail('Static media export and deployment scripts are missing.');
}
if (!packageJson.scripts?.['qa:media'] || !packageJson.scripts?.qa?.includes('qa:media') || !staticMediaCheckSource.includes('MIN_STATIC_VOICE_FILES') || !staticMediaCheckSource.includes('Missing PNG story covers')) {
  fail('Static media readiness must be part of the launch QA path.');
}
if (!finishLineSource.includes('Kid Genius World Mobile') || !finishLineSource.includes('separate GitHub repo') || !finishLineSource.includes('$0.50') || !readmeSource.includes('docs/production-finish-line.md')) {
  fail('Production finish line and separate mobile handoff documentation are missing.');
}
if (
  !packageJson.scripts?.['qa:mobile-handoff'] ||
  !packageJson.scripts?.qa?.includes('qa:mobile-handoff') ||
  !mobileHandoffCheckSource.includes('disallowedWebRepoMobileDeps') ||
  !mobileHandoffSource.includes('Legacy Native Reference') ||
  !mobileHandoffSource.includes('com.kidgenius.world') ||
  !readmeSource.includes('docs/mobile-handoff.md')
) {
  fail('Mobile handoff boundary checks and documentation are missing.');
}
if (
  !packageJson.scripts?.['qa:ops'] ||
  !packageJson.scripts?.qa?.includes('qa:ops') ||
  !operationsCheckSource.includes('Operations readiness passed') ||
  !launchOperationsSource.includes('Firebase Monitoring') ||
  !launchOperationsSource.includes('Search And SEO Monitoring') ||
  !launchOperationsSource.includes('Rollback path') ||
  !readmeSource.includes('docs/launch-operations-runbook.md')
) {
  fail('Launch operations runbook and QA gate are missing.');
}
if (!audioServiceSource.includes('speechRunId') || !audioServiceSource.includes('stopActiveSpeechPlayback') || !audioServiceSource.includes('queueRunId === speechRunId')) {
  fail('Narration overlap guard is missing from audioService.');
}
if (
  !audioServiceSource.includes('playStaticVoiceSpeech(text)') ||
  !audioServiceSource.includes('playBrowserVoiceSpeech') ||
  !audioServiceSource.includes('new SpeechSynthesisUtterance') ||
  !audioServiceSource.includes('hasStaticVoiceCache()') ||
  !audioServiceSource.includes('getStaticVoiceManifestUrl()') ||
  !audioServiceSource.includes('kidgenius:narration-status')
) {
  fail('Kid-facing voice mode must use static saved MP3 files first and a browser voice fallback instead of runtime TTS APIs.');
}
if (!mediaApiSource.includes('VITE_MEDIA_API_BASE_URL') || !mediaApiSource.includes('getStaticMediaUrl') || !mediaApiSource.includes('getStaticVoiceManifestUrl') || !audioServiceSource.includes('getStaticVoiceManifestUrl()') || !voiceCacheSource.includes('getStaticVoiceManifestUrl()')) {
  fail('Firebase-hosted builds must route static MP3 files through a configured media base URL while loading the static manifest from the app origin.');
}
if (audioServiceSource.includes('/api/tts') || voiceCacheSource.includes('/api/tts-precache') || storyBookSource.includes('/api/story-cover') || storyBookSource.includes('fetch(')) {
  fail('Child-facing app code must not call runtime media generation APIs.');
}
if (!storyBookSource.includes('/story-covers/${story.id}.png') || !coversStaticScript.includes('sharp') || !coversStaticScript.includes('pngPath') || !coversStaticScript.includes('sceneFor')) {
  fail('Story covers must load from static saved files.');
}
if (!voiceStaticScript.includes('.tts-cache') || !voiceStaticScript.includes('manifest.json') || !voiceStaticScript.includes('files')) {
  fail('Static voice cache manifest export is missing.');
}
if (!packageJson.scripts?.serve) fail('Production serve script is missing.');
if (!distIndex.includes('/assets/')) fail('Production build output is missing bundled assets.');
if (!htmlSource.includes('/manifest.webmanifest') || !htmlSource.includes('apple-mobile-web-app-capable') || !htmlSource.includes('/icons/apple-touch-icon.png')) {
  fail('PWA and mobile install metadata is missing from index.html.');
}
if (!indexSource.includes("navigator.serviceWorker.register('/sw.js')")) {
  fail('Service worker registration is missing from the app entry point.');
}
if (!installAppButtonSource.includes('beforeinstallprompt') || !installAppButtonSource.includes('Add to Home Screen')) {
  fail('Install App button must support browser install prompts and iOS add-to-home-screen guidance.');
}
if (pwaManifest.name !== 'Kid Genius World' || pwaManifest.display !== 'standalone' || pwaManifest.start_url !== '/?source=pwa') {
  fail('PWA manifest must identify Kid Genius World as a standalone web app.');
}
if (!Array.isArray(pwaManifest.icons) || !pwaManifest.icons.some((icon) => icon.src === '/icons/maskable-icon-512.png' && icon.purpose === 'maskable')) {
  fail('PWA manifest must include a maskable 512px app icon.');
}
if (!serviceWorkerSource.includes('CACHE_NAME') || !serviceWorkerSource.includes("url.pathname.startsWith('/api/')") || !serviceWorkerSource.includes("request.mode === 'navigate'")) {
  fail('Service worker must cache the app shell without caching protected API calls.');
}

const coreCurriculumUnitCount = (curriculumSource.match(/id: '/g) || []).length;
const hasEveryRoomExpansion = curriculumSource.includes('EVERY_ROOM_CURRICULUM_UNITS') &&
  curriculumSource.includes('gradeExpansionPlans') &&
  curriculumSource.includes('roomExpansionPlans') &&
  curriculumSource.includes('lessonArcPlans');
const lessonArcPlansSource = curriculumSource.match(/const lessonArcPlans = \[([\s\S]*?)\];/)?.[1] || '';
const lessonArcPlanCount = (lessonArcPlansSource.match(/id: '/g) || []).length;
const expandedCurriculumUnitCount = hasEveryRoomExpansion
  ? coreCurriculumUnitCount + (7 * 11 * lessonArcPlanCount)
  : coreCurriculumUnitCount;
if (expandedCurriculumUnitCount < 400) {
  fail(`Curriculum map is too small: found ${expandedCurriculumUnitCount} planned units, expected at least 400.`);
}
for (const field of ['standardsFocus', 'reviewCycleDays', 'masteryTarget', 'objective', 'parentActivity', 'successCheck', 'practiceActivities', 'endOfLessonChecks', 'masteryGate', 'parentExplanation']) {
  if (!curriculumSource.includes(field)) fail(`Curriculum field is missing: ${field}`);
}
if (!curriculumSource.includes('Foundation') || !curriculumSource.includes('Guided Practice') || !curriculumSource.includes('Independent Practice') || !curriculumSource.includes('Mastery Check') || !curriculumSource.includes('Spiral Review')) {
  fail('Curriculum needs a five-step foundation, guided, independent, mastery, and spiral-review lesson arc.');
}
if (!curriculumSource.includes('foundation, guided practice, independent practice, mastery check, spiral review') || !curriculumSource.includes('without rushing to the next grade') || !worldMapSource.includes('slice(0, 8)') || !parentDashboardSource.includes('slice(0, 8)') || !worldMapSource.includes('xl:grid-cols-5') || !parentDashboardSource.includes('xl:grid-cols-5')) {
  fail('Deep lesson practice steps must be visible to kids and parents.');
}
const requiredGradeCoverage = [
  'GradeLevel.PRE_K',
  'GradeLevel.KINDERGARTEN',
  'GradeLevel.FIRST_GRADE',
  'GradeLevel.SECOND_GRADE',
  'GradeLevel.THIRD_GRADE',
  'GradeLevel.FOURTH_GRADE',
  'GradeLevel.FIFTH_GRADE',
];
for (const grade of requiredGradeCoverage) {
  const count = (curriculumSource.match(new RegExp(`grade: ${grade.replace('.', '\\.')}`, 'g')) || []).length;
  if (count < 5) fail(`Curriculum grade coverage is too thin for ${grade}: found ${count}, expected at least 5.`);
}
const requiredRoomCoverage = [
  'RoomType.MATH',
  'RoomType.READING',
  'RoomType.STORYBOOK',
  'RoomType.SCIENCE',
  'RoomType.GEOGRAPHY',
  'RoomType.CODING',
  'RoomType.LANGUAGE',
  'RoomType.ART',
  'RoomType.MUSIC',
  'RoomType.PUZZLE',
];
for (const room of requiredRoomCoverage) {
  if (!curriculumSource.includes(`room: ${room}`)) fail(`Curriculum room coverage is missing: ${room}.`);
}
if (!appSource.includes('gradeProgressionThresholds') || !appSource.includes('405')) {
  fail('Grade progression pacing thresholds are not strict enough.');
}
if (!appSource.includes('gradeMasteryMinimums') || !appSource.includes('hasBalancedGradeMastery')) {
  fail('Balanced subject mastery is not required for grade progression.');
}
if (!typesSource.includes('gradeRoomVisits') || !appSource.includes('hasVisitedEveryRoomForGrade')) {
  fail('Every-room grade coverage is not required for grade progression.');
}
if (!typesSource.includes('completedUnitIds') || !appSource.includes('activeUnitId') || !curriculumSource.includes('completedUnitIds?.includes(unit.id)')) {
  fail('Exact curriculum unit completion is not tracked.');
}
if (!typesSource.includes('unitPracticeCounts') || !appSource.includes('nextUnitPracticeCounts') || !schoolModeSource.includes('MASTERED_PRACTICE_TARGET') || !learningConstantsSource.includes('MASTERED_PRACTICE_TARGET = 6') || !parentDashboardSource.includes('Mission practice')) {
  fail('Curriculum unit completion must require repeated mission practice and show progress to parents.');
}
if (!curriculumSource.includes('SCHOOL_YEAR_PACING') || !curriculumSource.includes('${SCHOOL_YEAR_PACING.weeks}-week school-year rhythm') || !curriculumSource.includes('saved practice rounds')) {
  fail('Curriculum depth must describe year-long pacing, repeated practice, and saved mastery rounds.');
}
if (!curriculumSource.includes('getCurrentGradeUnits') || !curriculumSource.includes('RoomType.ART') || !curriculumSource.includes('RoomType.PUZZLE')) {
  fail('Daily mission and roadmap do not account for every current-grade room.');
}
if (!curriculumSource.includes('getUnitReadiness') || !curriculumSource.includes('getRoomPracticeScore')) {
  fail('Curriculum unit readiness helpers are missing.');
}
if (!curriculumSource.includes('getWeeklyLearningPlan') || !curriculumSource.includes('WeeklyPlanItem')) {
  fail('Weekly learning plan helpers are missing.');
}
if (!appSource.includes("addSticker('puzzle', currentRoom, {}, false, meta)")) {
  fail('Puzzle completions are not counted as learning activity.');
}
if (!appSource.includes("handleCreativeReward('art', meta)") || !appSource.includes('handleMusicReward') || !appSource.includes("addSticker('puzzle', currentRoom, {}, false, meta)")) {
  fail('Art, music, and puzzle curriculum completions are not wired to rewards.');
}
for (const gradeLevel of [1, 2, 3, 4, 5, 6, 7]) {
  const challengeCount = (codingRoomSource.match(new RegExp(`gradeLevel: ${gradeLevel}`, 'g')) || []).length;
  if (challengeCount < 5) {
    fail(`Coding room has too few challenges for level ${gradeLevel}: found ${challengeCount}, expected at least 5.`);
  }
}
for (const gradeLevel of [2, 3, 4]) {
  const scienceCount = (scienceRoomSource.match(new RegExp(`gradeLevel: ${gradeLevel}`, 'g')) || []).length;
  const geographyCount = (geographyRoomSource.match(new RegExp(`gradeLevel: ${gradeLevel}`, 'g')) || []).length;
  const codingCount = (codingRoomSource.match(new RegExp(`gradeLevel: ${gradeLevel}`, 'g')) || []).length;
  if (scienceCount < 12) fail(`Science room needs deeper K-2 depth for level ${gradeLevel}: found ${scienceCount}, expected at least 12.`);
  if (geographyCount < 12) fail(`Geography room needs deeper K-2 depth for level ${gradeLevel}: found ${geographyCount}, expected at least 12.`);
  if (codingCount < 8) fail(`Coding room needs deeper K-2 challenge depth for level ${gradeLevel}: found ${codingCount}, expected at least 8.`);
}
if (!audioServiceSource.includes('speakMultipleChoiceQuestion') || !mathRoomSource.includes('speakMultipleChoiceQuestion') || !scienceRoomSource.includes('speakMultipleChoiceQuestion') || !geographyRoomSource.includes('speakMultipleChoiceQuestion') || !readingRoomSource.includes('speakMultipleChoiceQuestion')) {
  fail('Question rooms must read multiple-choice answers aloud with A/B/C/D choice narration.');
}
if (!curriculumSource.includes('daySeed') || !curriculumSource.includes('dailyPool') || !codingRoomSource.includes('dailyChallengeIndex')) {
  fail('Daily school missions and coding periods must rotate by date instead of always starting the same.');
}
for (const gradeLevel of [1, 2, 3, 4, 5, 6, 7]) {
  const geographyCount = (geographyRoomSource.match(new RegExp(`gradeLevel: ${gradeLevel}`, 'g')) || []).length;
  if (geographyCount < 8) {
    fail(`Geography room has too few questions for level ${gradeLevel}: found ${geographyCount}, expected at least 8.`);
  }
}
for (const language of ['spanish', 'french', 'mandarin', 'japanese']) {
  const languageWordCount = (languageRoomSource.match(new RegExp(`language: '${language}'`, 'g')) || []).length;
  if (languageWordCount < 24) {
    fail(`Language room has too few ${language} words: found ${languageWordCount}, expected at least 24.`);
  }
}
for (const [file, marker] of [
  ['components/ArtRoom.tsx', 'Teacher-Led Art Lesson'],
  ['components/MusicRoom.tsx', 'Complete music mission'],
  ['components/PuzzleRoom.tsx', 'Puzzle Brain Gym'],
]) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (!source.includes(marker) || !source.includes('onReward')) {
    fail(`${file} does not expose a completion goal tied to rewards.`);
  }
}
if (!parentDashboardSource.includes('Every-room coverage')) {
  fail('Parent dashboard does not show every-room grade coverage.');
}
if (!parentDashboardSource.includes('Unit Readiness') || !parentDashboardSource.includes('ready units') || !parentDashboardSource.includes('Needs practice')) {
  fail('Parent roadmap does not show unit readiness states.');
}
if (!parentDashboardSource.includes('Weekly Learning Plan') || !worldMapSource.includes('This Week')) {
  fail('Weekly learning plan is not visible to parents and kids.');
}
if (!parentDashboardSource.includes('Printable Family Practice Cards') || !parentDashboardSource.includes('Print Plan') || !fs.readFileSync(path.join(root, 'index.css'), 'utf8').includes('@media print')) {
  fail('Parent printable/offline weekly practice support is missing.');
}
if (!parentDashboardSource.includes('Unit completion') || !parentDashboardSource.includes('completed units in this grade')) {
  fail('Parent roadmap does not show exact unit completion.');
}
for (const strand of ['Social-emotional learning', 'Engineering', 'Fluency', 'Debugging', 'Project planning']) {
  if (!curriculumSource.includes(strand)) fail(`Curriculum strand is missing: ${strand}.`);
}
if (!parentDashboardSource.includes('Parent Activity') || !parentDashboardSource.includes('Success check')) {
  fail('Parent-guided curriculum activities are not visible in the roadmap.');
}
if (!parentDashboardSource.includes('Parent explanation') || !parentDashboardSource.includes('End-of-lesson checks') || !parentDashboardSource.includes('Mastery gate')) {
  fail('Parent roadmap must show explanations, end-of-lesson checks, and mastery gates.');
}
if (!parentDashboardSource.includes('Parent Learning Report') || !parentDashboardSource.includes('Practice rhythm') || !parentDashboardSource.includes('Next parent actions') || !parentDashboardSource.includes('Print Weekly Report')) {
  fail('Parent dashboard needs plain-language weekly learning insights for paid-user readiness.');
}
if (
  !parentDashboardSource.includes('All Classroom Activity') ||
  !parentDashboardSource.includes('Every period parents can track') ||
  !parentDashboardSource.includes('allRoomActivityRows') ||
  !parentDashboardSource.includes('RoomType.MUSIC') ||
  !parentDashboardSource.includes('RoomType.ART') ||
  !parentDashboardSource.includes('RoomType.PUZZLE') ||
  !parentDashboardSource.includes('RoomType.STUDY') ||
  !parentDashboardSource.includes('saved proof items')
) {
  fail('Parent dashboard must show all-room activity, including music, art, puzzle, and Study Zone proof.');
}
if (!appSource.includes('Learning Reflection') || !appSource.includes('Explain what you learned') || !appSource.includes('Teach it back') || !appSource.includes('practice rounds')) {
  fail('Reward flow needs a kid-facing learning reflection after practice.');
}
if (!appSource.includes('Lesson Board') || !appSource.includes('showMissionFocus') || !appSource.includes('Mastery gate') || !appSource.includes('Exit ticket')) {
  fail('Active lesson teacher board is missing inside room practice.');
}
if (!appSource.includes('Teach to exit ticket path') || !appSource.includes('Exit checks') || !appSource.includes('SCHOOL_LESSON_PHASES') || !appSource.includes('activeUnit?.endOfLessonChecks?.slice(0, 7)') || !appSource.includes('max-w-5xl')) {
  fail('Active room teacher board must expose the full teach, example, guided, independent, exit-ticket path.');
}
if (!typesSource.includes('LearningJournalEntry') || !typesSource.includes('childReflection') || !appSource.includes('learningJournal') || !appSource.includes('recordLearningReflectionChoice') || !parentDashboardSource.includes('Learning Journal') || !parentDashboardSource.includes('Recent proof of practice') || !parentDashboardSource.includes('Child reflection')) {
  fail('Parent evidence trail learning journal is missing.');
}
if (!appSource.includes('arcadeJournalOverride') || !appSource.includes('arcade mastery run') || !appSource.includes('Completed a 3-round') || !appSource.includes('combo') || !appSource.includes('Replay one')) {
  fail('Arcade completions must write explicit parent-visible learning journal proof.');
}
if (!worldMapSource.includes('Review Quest') || !worldMapSource.includes('Start Review') || !parentDashboardSource.includes('Spaced Review Queue')) {
  fail('Spaced review must be visible to kids and parents.');
}
if (!worldMapSource.includes('Review due') || !worldMapSource.includes('lastPracticedAtByUnit') || !parentDashboardSource.includes('due now') || !parentDashboardSource.includes('Practiced today')) {
  fail('Spaced review timing must use journal history for due and last-practiced signals.');
}
if (
  !worldMapSource.includes('Learning Passport') ||
  !worldMapSource.includes('Passport Stamp Collection') ||
  !worldMapSource.includes('reflection stamps') ||
  !worldMapSource.includes('student-passport-conference') ||
  !worldMapSource.includes('student-teacher-conference-plan') ||
  !worldMapSource.includes('Teacher conference plan') ||
  !worldMapSource.includes('Teacher conference question') ||
  !worldMapSource.includes('Next stamp target') ||
  !parentDashboardSource.includes('parent-student-passport') ||
  !parentDashboardSource.includes('parent-teacher-conference-plan') ||
  !parentDashboardSource.includes('Student Learning Passport') ||
  !parentDashboardSource.includes('Parent follow-up') ||
  !schoolModeSource.includes('getStudentPassportSummary') ||
  !schoolModeSource.includes('getTeacherConferencePlan')
) {
  fail('Kid-facing learning passport and teacher conference evidence are missing.');
}
if (!worldMapSource.includes('At-home idea') || !worldMapSource.includes('Review in') || !worldMapSource.includes('Story Time')) {
  fail('World map daily path does not surface curriculum guidance clearly.');
}
if (!worldMapSource.includes('Step {index + 1}') || !worldMapSource.includes('Exit check') || !worldMapSource.includes('getPracticeActivities')) {
  fail('Kid world map must surface lesson activities and exit checks.');
}
if (!worldMapSource.includes('data-testid="daily-mission-card"') || !worldMapSource.includes('data-testid={`room-card-${room.type}`}') || !worldMapSource.includes('aria-label={`Enter ${room.name}`}')) {
  fail('Tablet room QA needs stable accessible room selectors.');
}
for (const [roomName, source] of roomBackButtonSources) {
  if (!source.includes('aria-label="Back to world map"')) {
    fail(`${roomName} needs an accessible Back to world map button for tablet QA.`);
  }
}
if (!worldMapSource.includes('Focus Quest') || !worldMapSource.includes('Try Again Plan') || !worldMapSource.includes('Mistakes are information')) {
  fail('World map needs a kid-facing focus and social-emotional learning routine.');
}
if (!worldMapSource.includes('Offline Break') || !worldMapSource.includes('dailyLimitMinutes') || !worldMapSource.includes('I Took a Break')) {
  fail('World map needs parent-configured healthy screen-time break guidance.');
}
if (!worldMapSource.includes('room-destination-tile') || !worldMapSource.includes('room-scene') || !worldMapSource.includes('Mission') || !worldMapSource.includes('Visited')) {
  fail('World map room tiles are too basic; destination scenes and progress badges are missing.');
}
if (!worldMapSource.includes('Next lesson') || !worldMapSource.includes('nextUnitByRoom') || !worldMapSource.includes('getUnitsForGrade') || !worldMapSource.includes('onEnterRoom(room.type, nextUnit?.id)')) {
  fail('World map room tiles must show the next structured lesson for each room.');
}
if (!appSource.includes('GameArcade') || !worldMapSource.includes('Game Arcade') || !worldMapSource.includes('onOpenGameArcade')) {
  fail('Modern Game Arcade is not wired from the world map.');
}
for (const worldMapArcadeMarker of ['Arcade Passport', 'Next arcade game', 'Badge trail', 'Long-term mastery']) {
  if (!worldMapSource.includes(worldMapArcadeMarker)) fail(`World map needs arcade progression preview marker: ${worldMapArcadeMarker}.`);
}
for (const gameMarker of ['Number Dash', 'Word Builder', 'Pattern Quest', 'Story Detective', 'Robot Maze', 'Rhythm Tap']) {
  if (!gameArcadeSource.includes(gameMarker)) fail(`Game Arcade is missing required game: ${gameMarker}.`);
}
if (!gameArcadeSource.includes('Daily Game Challenge') || !gameArcadeSource.includes('roundWins') || !gameArcadeSource.includes('onReward(activeGame.room, activeGame.title, activeGame.id, nextCombo)') || !gameArcadeSource.includes('Full Room')) {
  fail('Game Arcade must include daily challenge, replayable rounds, rewards, and full-room handoff.');
}
if (!typesSource.includes('ArcadeProgress') || !appSource.includes('buildNextArcadeProgress') || !gameArcadeSource.includes('mastery badge') || !parentDashboardSource.includes('Game Arcade Proof')) {
  fail('Game Arcade progress must persist into the child arcade and parent dashboard.');
}
for (const arcadeParentMarker of ['Arcade Skill Coach', 'Daily Quest Plan', 'Next game to assign', 'Strongest arcade skill', 'Use Game Arcade next']) {
  if (!parentDashboardSource.includes(arcadeParentMarker)) fail(`Parent dashboard needs stronger arcade coaching marker: ${arcadeParentMarker}.`);
}
for (const arcadeParentPassportMarker of ['Arcade Passport Summary', 'Badge Trail', 'Balanced Explorer', 'All-Room Arcade Champion', 'Long-term mastery']) {
  if (!parentDashboardSource.includes(arcadeParentPassportMarker)) fail(`Parent dashboard needs arcade passport proof marker: ${arcadeParentPassportMarker}.`);
}
for (const playSurfaceMarker of ['Interactive Playboard', 'First number', 'Scene card', 'Start', 'Answer Pads']) {
  if (!gameArcadeSource.includes(playSurfaceMarker)) fail(`Game Arcade is missing richer mini-game surface: ${playSurfaceMarker}.`);
}
for (const arcadeDepthMarker of ['Skill Focus', 'Strategy Coach', 'Bridge to Ten', 'Character Feelings', 'Conditionals', 'Rhythm Reading']) {
  if (!gameArcadeSource.includes(arcadeDepthMarker)) fail(`Game Arcade needs deeper grade-paced content marker: ${arcadeDepthMarker}.`);
}
for (const arcadeRetentionMarker of ['Daily Quest Board', 'Recommended next', 'Mastery step', 'Try next skill']) {
  if (!gameArcadeSource.includes(arcadeRetentionMarker)) fail(`Game Arcade needs clearer daily retention guidance: ${arcadeRetentionMarker}.`);
}
for (const arcadePassportMarker of ['Arcade Passport', 'Badge Trail', 'Balanced Explorer', 'All-Room Arcade Champion', 'Long-term mastery']) {
  if (!gameArcadeSource.includes(arcadePassportMarker)) fail(`Game Arcade needs long-term badge progression marker: ${arcadePassportMarker}.`);
}
if (!mathRoomSource.includes('renderMathManipulatives') || !mathRoomSource.includes('First number') || !readingRoomSource.includes('Word Stage') || !readingRoomSource.includes('modeSteps')) {
  fail('Core Math and Reading rooms need richer kid-facing visual learning props.');
}
if (!mathRoomSource.includes('Picture model') || !mathRoomSource.includes('Take away') || !mathRoomSource.includes('setEarlyWordProblem')) {
  fail('Math room needs visual take-away models and deeper early-grade story problems.');
}
if (!mathRoomSource.includes('Mission Type') || !mathRoomSource.includes('setMoneyProblem') || !mathRoomSource.includes('setTimeProblem') || !mathRoomSource.includes('setFractionProblem') || !mathRoomSource.includes('setGeometryProblem')) {
  fail('Math room needs grade-paced word, money, time, fraction, and geometry missions.');
}
if (!mathRoomSource.includes('setMeasurementProblem') || (mathRoomSource.match(/template ===/g) || []).length < 7) {
  fail('Math room needs a deeper bank of word-problem and measurement templates.');
}
if (!readingRoomSource.includes('READING_PASSAGES') || !readingRoomSource.includes('COMPREHENSION') || !readingRoomSource.includes('Comprehension Quest') || !voiceCacheSource.includes('readingPassageTexts')) {
  fail('Reading room needs grade-paced comprehension passages included in the voice cache.');
}
if ((readingRoomSource.match(/id: 'g/g) || []).length < 20 || (readingRoomSource.match(/skill: '/g) || []).length < 30) {
  fail('Reading room needs a deeper passage bank across grade levels.');
}
if (!scienceRoomSource.includes('Junior Lab Bench') || !scienceRoomSource.includes('Observe') || !geographyRoomSource.includes('Travel Passport') || !geographyRoomSource.includes('Map clue')) {
  fail('Science and Geography rooms need destination-style visual learning props.');
}
if (!geographyRoomSource.includes("type: 'map'") || !geographyRoomSource.includes("type: 'climate'") || !geographyRoomSource.includes('Compass rose') || !geographyRoomSource.includes('Longitude')) {
  fail('Geography room needs grade-paced map skills and climate questions.');
}
if (!codingRoomSource.includes('Robot Command Center') || !codingRoomSource.includes('Step Coach') || !codingRoomSource.includes('Read plan') || !languageRoomSource.includes('Word Passport') || !languageRoomSource.includes('Listen, Say, Match')) {
  fail('Coding and Language rooms need destination-style visual learning props.');
}
if (!languageRoomSource.includes('availableWords') || !languageRoomSource.includes('gradeLevel: 7') || !languageRoomSource.includes('CATEGORY_LABELS') || !languageRoomSource.includes('I need help')) {
  fail('Language room needs grade-paced vocabulary, phrase practice, and clean category labels.');
}
if (!artRoomSource.includes('Creative Studio Mission') || !artRoomSource.includes('Teacher-Led Art Lesson') || !puzzleRoomSource.includes('Puzzle Brain Gym') || !puzzleRoomSource.includes('Find what comes next')) {
  fail('Art and Puzzle rooms need clearer kid-facing mission panels.');
}
if (!artRoomSource.includes('lessonSteps') || !artRoomSource.includes('reflectionChoice') || !artRoomSource.includes('vocabulary')) {
  fail('Art room needs a real lesson path, art vocabulary, and reflection before completion.');
}
if (!musicRoomSource.includes('Music Mission Board') || !musicRoomSource.includes('Explore Sound')) {
  fail('Music room needs a clearer kid-facing mission panel.');
}
if (!musicRoomSource.includes('sessionRound') || !musicRoomSource.includes('Next music round is ready') || !musicRoomSource.includes('setIsComplete(false)')) {
  fail('Music room must auto-advance to another round so six mastery saves are possible in one period.');
}
if (!appSource.includes('<ArtRoom level={progress.currentLevel}') || !appSource.includes('<MusicRoom level={progress.currentLevel}') || !appSource.includes('<PuzzleRoom level={progress.currentLevel}')) {
  fail('Creative rooms must receive the active grade level for pacing.');
}
if (!artRoomSource.includes('ART_MISSIONS') || !artRoomSource.includes('minStrokes') || !artRoomSource.includes('Pattern Artist')) {
  fail('Art room needs grade-paced missions and stroke requirements.');
}
if (!musicRoomSource.includes('MUSIC_MISSIONS') || !musicRoomSource.includes('noteGoal') || !musicRoomSource.includes('loopGoal')) {
  fail('Music room needs grade-paced note and rhythm goals.');
}
if (!puzzleRoomSource.includes('PUZZLE_MISSIONS') || !puzzleRoomSource.includes('patternAnswer') || !puzzleRoomSource.includes('mission.pairCount')) {
  fail('Puzzle room needs grade-paced puzzle depth and a stable pattern answer.');
}
if (musicRoomSource.includes('transparenttextures.com')) {
  fail('Music room should not load decorative third-party texture assets.');
}
if (readingRoomSource.includes('useCallback') && !readingRoomSource.includes('import React, { useCallback')) {
  fail('ReadingRoom uses useCallback without importing it.');
}
if (!worldMapSource.includes('Next grade:') || !parentDashboardSource.includes('Grade pacing')) {
  fail('Slow grade progression is not visible in the child and parent UI.');
}
if (!worldMapSource.includes('Next Grade Checklist') || !parentDashboardSource.includes('Next Grade Requirements')) {
  fail('Next grade checklist is not visible to kids and parents.');
}
if (!parentDashboardSource.includes('Balanced subject mastery') || !parentDashboardSource.includes('Stars earned')) {
  fail('Parent next-grade requirements are missing concrete gate details.');
}

const responsiveContracts = [
  'sm:grid-cols',
  'md:grid-cols',
  'lg:grid-cols',
  'overflow-y-auto',
  'w-screen h-screen',
];
for (const contract of responsiveContracts) {
  if (!appSource.includes(contract) && !parentDashboardSource.includes(contract)) {
    fail(`Responsive layout contract is missing: ${contract}`);
  }
}

if (!process.exitCode) {
  console.log(`QA check passed: ${expandedCurriculumUnitCount} planned curriculum units, legal surfaces, parent gate, and production assets verified.`);
}
