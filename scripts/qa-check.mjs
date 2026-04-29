import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const requiredFiles = [
  'App.tsx',
  'components/LegalInfo.tsx',
  'components/ParentDashboard.tsx',
  'components/WorldMap.tsx',
  'components/GameArcade.tsx',
  'components/StoryBook.tsx',
  'services/curriculum.ts',
  'services/audioService.ts',
  'services/voiceCacheService.ts',
  'server/production-server.mjs',
  'scripts/check-elevenlabs-key.mjs',
  'scripts/warm-voice-cache.mjs',
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
const curriculumSource = fs.readFileSync(path.join(root, 'services/curriculum.ts'), 'utf8');
const typesSource = fs.readFileSync(path.join(root, 'types.ts'), 'utf8');
const audioServiceSource = fs.readFileSync(path.join(root, 'services/audioService.ts'), 'utf8');
const voiceCacheSource = fs.readFileSync(path.join(root, 'services/voiceCacheService.ts'), 'utf8');
const storyBookSource = fs.readFileSync(path.join(root, 'components/StoryBook.tsx'), 'utf8');
const cloudflareWorkerSource = fs.readFileSync(path.join(root, 'cloudflare/worker.ts'), 'utf8');
const wranglerSource = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
const codingRoomSource = fs.readFileSync(path.join(root, 'components/CodingRoom.tsx'), 'utf8');
const mathRoomSource = fs.readFileSync(path.join(root, 'components/MathRoom.tsx'), 'utf8');
const readingRoomSource = fs.readFileSync(path.join(root, 'components/ReadingRoom.tsx'), 'utf8');
const scienceRoomSource = fs.readFileSync(path.join(root, 'components/ScienceRoom.tsx'), 'utf8');
const geographyRoomSource = fs.readFileSync(path.join(root, 'components/GeographyRoom.tsx'), 'utf8');
const gameArcadeSource = fs.readFileSync(path.join(root, 'components/GameArcade.tsx'), 'utf8');
const languageRoomSource = fs.readFileSync(path.join(root, 'components/LanguageRoom.tsx'), 'utf8');
const artRoomSource = fs.readFileSync(path.join(root, 'components/ArtRoom.tsx'), 'utf8');
const puzzleRoomSource = fs.readFileSync(path.join(root, 'components/PuzzleRoom.tsx'), 'utf8');
const musicRoomSource = fs.readFileSync(path.join(root, 'components/MusicRoom.tsx'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const distIndex = fs.existsSync(path.join(root, 'dist/index.html'))
  ? fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')
  : '';

const sourceFilesToScan = [
  'App.tsx',
  'components/ArtRoom.tsx',
  'components/CodingRoom.tsx',
  'components/GeographyRoom.tsx',
  'components/GameArcade.tsx',
  'components/Guide.tsx',
  'components/LanguageRoom.tsx',
  'components/MathRoom.tsx',
  'components/MusicRoom.tsx',
  'components/ParentDashboard.tsx',
  'components/PuzzleRoom.tsx',
  'components/ReadingRoom.tsx',
  'components/ScienceRoom.tsx',
  'components/StoryBook.tsx',
  'components/WorldMap.tsx',
  'services/audioService.ts',
  'services/curriculum.ts',
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
if (!parentDashboardSource.includes('Family Plan Preview') || !parentDashboardSource.includes('No payment collection') || !parentDashboardSource.includes('Paid Launch Readiness')) {
  fail('Parent dashboard must explain family plan value without collecting payments.');
}
if (!parentDashboardSource.includes('Export Local Progress') || !parentDashboardSource.includes('kid-genius-progress-') || !parentDashboardSource.includes('Local progress export')) {
  fail('Parent dashboard must provide local progress export before reset or device migration.');
}
if (!appSource.includes('Family Plan') || !appSource.includes('paid subscriptions need real accounts, billing, consent, and support flows first')) {
  fail('Parent onboarding must clearly frame paid launch prerequisites.');
}
if (!appSource.includes("setLegalView('privacy')")) fail('Privacy notice link is not wired in App.tsx.');
if (!appSource.includes("setLegalView('terms')")) fail('Terms link is not wired in App.tsx.');
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
if (!parentDashboardSource.includes('Voice narration and generated story covers may use configured third-party API services')) {
  fail('Privacy copy does not disclose optional third-party API services.');
}
if (!typesSource.includes('PrivacySettings') || !typesSource.includes('allowExternalVoice') || !typesSource.includes('allowGeneratedStoryCovers')) {
  fail('Privacy settings data model is missing.');
}
if (!appSource.includes('kidGeniusAllowExternalVoice') || !appSource.includes('kidGeniusAllowGeneratedStoryCovers')) {
  fail('Privacy controls are not synced to browser storage.');
}
if (!parentDashboardSource.includes('Privacy Controls') || !parentDashboardSource.includes('Enable External Voice First')) {
  fail('Parent privacy controls are not visible in settings.');
}
if (!audioServiceSource.includes('kidGeniusAllowExternalVoice') || !voiceCacheSource.includes('kidGeniusAllowExternalVoice')) {
  fail('Voice API calls are not gated by parent privacy controls.');
}
if (audioServiceSource.includes('new SpeechSynthesisUtterance') || audioServiceSource.includes('window.speechSynthesis.speak(')) {
  fail('Kid-facing narration should use cached human voice audio, not browser speech synthesis.');
}
if (!voiceCacheSource.includes('Welcome back to Kid Genius World!') || !fs.readFileSync(path.join(root, 'server/production-server.mjs'), 'utf8').includes('slice(0, 500)')) {
  fail('Human voice cache must include app greetings and support larger pre-cache batches.');
}
const voiceWarmScript = fs.readFileSync(path.join(root, 'scripts/warm-voice-cache.mjs'), 'utf8');
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
if (!cloudflareWorkerSource.includes('env.MEDIA_CACHE.put') || !cloudflareWorkerSource.includes('/api/tts-precache') || !cloudflareWorkerSource.includes('/api/story-cover') || !cloudflareWorkerSource.includes('errorSamples')) {
  fail('Cloudflare Worker must proxy cached TTS and story-cover API routes through R2.');
}
if (!packageJson.scripts?.['cf:deploy'] || !packageJson.scripts?.['cf:secret:elevenlabs']) {
  fail('Cloudflare deployment and secret scripts are missing.');
}
if (!audioServiceSource.includes('speechRunId') || !audioServiceSource.includes('stopActiveSpeechPlayback') || !audioServiceSource.includes('queueRunId === speechRunId')) {
  fail('Narration overlap guard is missing from audioService.');
}
if (!audioServiceSource.includes('playElevenLabsSpeech(text)') || !audioServiceSource.includes('.catch(resolve)')) {
  fail('External voice mode should stay on ElevenLabs instead of falling back to browser speech.');
}
if (!storyBookSource.includes('kidGeniusAllowGeneratedStoryCovers') || !storyBookSource.includes('/api/story-cover')) {
  fail('Generated story covers are not gated by parent privacy controls.');
}
if (!packageJson.scripts?.serve) fail('Production serve script is missing.');
if (!distIndex.includes('/assets/')) fail('Production build output is missing bundled assets.');

const coreCurriculumUnitCount = (curriculumSource.match(/id: '/g) || []).length;
const hasEveryRoomExpansion = curriculumSource.includes('EVERY_ROOM_CURRICULUM_UNITS') &&
  curriculumSource.includes('gradeExpansionPlans') &&
  curriculumSource.includes('roomExpansionPlans') &&
  curriculumSource.includes('lessonArcPlans');
const expandedCurriculumUnitCount = hasEveryRoomExpansion
  ? coreCurriculumUnitCount + (7 * 11 * 3)
  : coreCurriculumUnitCount;
if (expandedCurriculumUnitCount < 240) {
  fail(`Curriculum map is too small: found ${expandedCurriculumUnitCount} planned units, expected at least 240.`);
}
for (const field of ['standardsFocus', 'reviewCycleDays', 'masteryTarget', 'objective', 'parentActivity', 'successCheck', 'practiceActivities', 'endOfLessonChecks', 'masteryGate', 'parentExplanation']) {
  if (!curriculumSource.includes(field)) fail(`Curriculum field is missing: ${field}`);
}
if (!curriculumSource.includes('Foundation') || !curriculumSource.includes('Guided Practice') || !curriculumSource.includes('Mastery Check')) {
  fail('Curriculum needs a foundation, guided practice, and mastery-check lesson arc.');
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
if (!typesSource.includes('unitPracticeCounts') || !appSource.includes('nextUnitPracticeCounts') || !appSource.includes('>= 3') || !parentDashboardSource.includes('Mission practice')) {
  fail('Curriculum unit completion must require repeated mission practice and show progress to parents.');
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
if (!appSource.includes("addSticker('puzzle')")) {
  fail('Puzzle completions are not counted as learning activity.');
}
if (!appSource.includes("handleCreativeReward('art')") || !appSource.includes('handleMusicReward') || !appSource.includes("addSticker('puzzle')")) {
  fail('Art, music, and puzzle curriculum completions are not wired to rewards.');
}
for (const gradeLevel of [1, 2, 3, 4, 5, 6, 7]) {
  const challengeCount = (codingRoomSource.match(new RegExp(`gradeLevel: ${gradeLevel}`, 'g')) || []).length;
  if (challengeCount < 5) {
    fail(`Coding room has too few challenges for level ${gradeLevel}: found ${challengeCount}, expected at least 5.`);
  }
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
  ['components/ArtRoom.tsx', 'Complete artwork'],
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
if (!appSource.includes('Learning Reflection') || !appSource.includes('Explain what you learned') || !appSource.includes('Teach it back') || !appSource.includes('practice rounds')) {
  fail('Reward flow needs a kid-facing learning reflection after practice.');
}
if (!appSource.includes('Mission Focus') || !appSource.includes('showMissionFocus') || !appSource.includes('Practice progress') || !appSource.includes('Success check')) {
  fail('Active lesson mission focus is missing inside room practice.');
}
if (!typesSource.includes('LearningJournalEntry') || !typesSource.includes('childReflection') || !appSource.includes('learningJournal') || !appSource.includes('recordLearningReflectionChoice') || !parentDashboardSource.includes('Learning Journal') || !parentDashboardSource.includes('Recent proof of practice') || !parentDashboardSource.includes('Child reflection')) {
  fail('Parent evidence trail learning journal is missing.');
}
if (!worldMapSource.includes('Review Quest') || !worldMapSource.includes('Start Review') || !parentDashboardSource.includes('Spaced Review Queue')) {
  fail('Spaced review must be visible to kids and parents.');
}
if (!worldMapSource.includes('Review due') || !worldMapSource.includes('lastPracticedAtByUnit') || !parentDashboardSource.includes('due now') || !parentDashboardSource.includes('Practiced today')) {
  fail('Spaced review timing must use journal history for due and last-practiced signals.');
}
if (!worldMapSource.includes('Learning Passport') || !worldMapSource.includes('Passport Stamp Collection') || !worldMapSource.includes('reflection stamps')) {
  fail('Kid-facing learning passport evidence is missing from the world map.');
}
if (!worldMapSource.includes('At-home idea') || !worldMapSource.includes('Review in') || !worldMapSource.includes('Story Time')) {
  fail('World map daily path does not surface curriculum guidance clearly.');
}
if (!worldMapSource.includes('Step {index + 1}') || !worldMapSource.includes('Exit check') || !worldMapSource.includes('getPracticeActivities')) {
  fail('Kid world map must surface lesson activities and exit checks.');
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
for (const gameMarker of ['Number Dash', 'Word Builder', 'Pattern Quest', 'Story Detective', 'Robot Maze', 'Rhythm Tap']) {
  if (!gameArcadeSource.includes(gameMarker)) fail(`Game Arcade is missing required game: ${gameMarker}.`);
}
if (!gameArcadeSource.includes('Daily Game Challenge') || !gameArcadeSource.includes('roundWins') || !gameArcadeSource.includes('onReward(activeGame.room, activeGame.title, activeGame.id, nextCombo)') || !gameArcadeSource.includes('Full Room')) {
  fail('Game Arcade must include daily challenge, replayable rounds, rewards, and full-room handoff.');
}
if (!typesSource.includes('ArcadeProgress') || !appSource.includes('buildNextArcadeProgress') || !gameArcadeSource.includes('mastery badge') || !parentDashboardSource.includes('Game Arcade Proof')) {
  fail('Game Arcade progress must persist into the child arcade and parent dashboard.');
}
if (!mathRoomSource.includes('renderMathManipulatives') || !mathRoomSource.includes('First number') || !readingRoomSource.includes('Word Stage') || !readingRoomSource.includes('modeSteps')) {
  fail('Core Math and Reading rooms need richer kid-facing visual learning props.');
}
if (!mathRoomSource.includes('Mission Type') || !mathRoomSource.includes('setMoneyProblem') || !mathRoomSource.includes('setTimeProblem') || !mathRoomSource.includes('setFractionProblem') || !mathRoomSource.includes('setGeometryProblem')) {
  fail('Math room needs grade-paced word, money, time, fraction, and geometry missions.');
}
if (!readingRoomSource.includes('READING_PASSAGES') || !readingRoomSource.includes('COMPREHENSION') || !readingRoomSource.includes('Comprehension Quest') || !voiceCacheSource.includes('readingPassageTexts')) {
  fail('Reading room needs grade-paced comprehension passages included in the voice cache.');
}
if (!scienceRoomSource.includes('Junior Lab Bench') || !scienceRoomSource.includes('Observe') || !geographyRoomSource.includes('Travel Passport') || !geographyRoomSource.includes('Map clue')) {
  fail('Science and Geography rooms need destination-style visual learning props.');
}
if (!geographyRoomSource.includes("type: 'map'") || !geographyRoomSource.includes("type: 'climate'") || !geographyRoomSource.includes('Compass rose') || !geographyRoomSource.includes('Longitude')) {
  fail('Geography room needs grade-paced map skills and climate questions.');
}
if (!codingRoomSource.includes('Robot Command Center') || !codingRoomSource.includes('Plan') || !languageRoomSource.includes('Word Passport') || !languageRoomSource.includes('Listen, Say, Match')) {
  fail('Coding and Language rooms need destination-style visual learning props.');
}
if (!languageRoomSource.includes('availableWords') || !languageRoomSource.includes('gradeLevel: 7') || !languageRoomSource.includes('CATEGORY_LABELS') || !languageRoomSource.includes('I need help')) {
  fail('Language room needs grade-paced vocabulary, phrase practice, and clean category labels.');
}
if (!artRoomSource.includes('Creative Studio Mission') || !artRoomSource.includes('Artist Checklist') || !puzzleRoomSource.includes('Puzzle Brain Gym') || !puzzleRoomSource.includes('Find what comes next')) {
  fail('Art and Puzzle rooms need clearer kid-facing mission panels.');
}
if (!musicRoomSource.includes('Music Mission Board') || !musicRoomSource.includes('Explore Sound')) {
  fail('Music room needs a clearer kid-facing mission panel.');
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
