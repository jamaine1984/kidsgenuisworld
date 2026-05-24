import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const storyBookPath = path.join(root, 'components', 'StoryBook.tsx');
const storyCoverDir = path.join(root, 'public', 'story-covers');
const voiceManifestPath = path.join(root, 'public', 'voice-cache', 'manifest.json');
const MIN_STORY_COUNT = 60;
const MIN_STATIC_VOICE_FILES = 1000;

const failures = [];
const fail = (message) => failures.push(message);

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const exists = (filePath) => fs.existsSync(filePath);

if (!exists(storyBookPath)) {
  fail('StoryBook.tsx is missing.');
}

if (!exists(storyCoverDir)) {
  fail('public/story-covers is missing.');
}

if (!exists(voiceManifestPath)) {
  fail('public/voice-cache/manifest.json is missing.');
}

const storySource = exists(storyBookPath) ? read(storyBookPath) : '';
const storyIds = Array.from(storySource.matchAll(/id: '([^']+)', title: /g)).map(match => match[1]);
const uniqueStoryIds = Array.from(new Set(storyIds));

if (uniqueStoryIds.length < MIN_STORY_COUNT) {
  fail(`Story library has ${uniqueStoryIds.length} stories; expected at least ${MIN_STORY_COUNT}.`);
}

const missingPngCovers = uniqueStoryIds.filter(id => !exists(path.join(storyCoverDir, `${id}.png`)));
const missingSvgCovers = uniqueStoryIds.filter(id => !exists(path.join(storyCoverDir, `${id}.svg`)));

if (missingPngCovers.length) {
  fail(`Missing PNG story covers: ${missingPngCovers.slice(0, 10).join(', ')}${missingPngCovers.length > 10 ? '...' : ''}`);
}

if (missingSvgCovers.length) {
  fail(`Missing SVG story cover fallbacks: ${missingSvgCovers.slice(0, 10).join(', ')}${missingSvgCovers.length > 10 ? '...' : ''}`);
}

let voiceManifest = {};
if (exists(voiceManifestPath)) {
  try {
    voiceManifest = JSON.parse(read(voiceManifestPath));
  } catch {
    fail('Voice cache manifest is not valid JSON.');
  }
}

const voiceFiles = Array.isArray(voiceManifest.files) ? voiceManifest.files : [];
const invalidVoiceFileNames = voiceFiles.filter(file => !/^[a-f0-9]{64}\.mp3$/.test(file));

if (voiceManifest.storage !== 'static') {
  fail('Voice cache manifest must declare static storage.');
}

if (voiceFiles.length < MIN_STATIC_VOICE_FILES) {
  fail(`Voice cache manifest has ${voiceFiles.length} files; expected at least ${MIN_STATIC_VOICE_FILES} saved narration files.`);
}

if (invalidVoiceFileNames.length) {
  fail(`Voice cache manifest has invalid MP3 names: ${invalidVoiceFileNames.slice(0, 5).join(', ')}`);
}

if (failures.length) {
  console.error('Static media readiness failed:');
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`Static media readiness passed: ${uniqueStoryIds.length} stories, ${uniqueStoryIds.length * 2} cover assets, and ${voiceFiles.length} saved voice files verified.`);
