import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const countMatches = (text, pattern) => [...text.matchAll(pattern)].length;
const countGeneratedThemes = (text, constName) => {
  const match = text.match(new RegExp(`const ${constName}[^=]*= \\[([\\s\\S]*?)\\];`));
  if (!match) return 0;
  return countMatches(match[1], /['"`][^'"`]+['"`]/g);
};
const countGeneratedObjects = (text, constName) => {
  const match = text.match(new RegExp(`const ${constName}[^=]*= \\[([\\s\\S]*?)\\];`));
  if (!match) return 0;
  return countMatches(match[1], /\{\s*[^}]*\}/g);
};
const countGeneratedTuples = (text, constName) => {
  const match = text.match(new RegExp(`const ${constName}[^=]*= \\[([\\s\\S]*?)\\];`));
  if (!match) return 0;
  return countMatches(match[1], /\[[^\]]+\]/g);
};
const countByGrade = (text) => {
  const counts = {};
  for (const match of text.matchAll(/gradeLevel\s*:\s*(\d+)/g)) {
    counts[match[1]] = (counts[match[1]] || 0) + 1;
  }
  return counts;
};

const roomAudits = [
  { room: 'Science', file: 'components/ScienceRoom.tsx', current: text => countMatches(text, /\bid\s*:\s*['"`]/g) + countGeneratedObjects(text, 'SCIENCE_EXPANSION_TOPICS') * 7 * 8, target: 700 },
  { room: 'Geography', file: 'components/GeographyRoom.tsx', current: text => countMatches(text, /question\s*:\s*['"`]/g) + countGeneratedObjects(text, 'GEOGRAPHY_EXPANSION_TOPICS') * 7 * 8, target: 700 },
  { room: 'Language', file: 'components/LanguageRoom.tsx', current: text => countMatches(text, /english\s*:\s*['"`]/g) + countGeneratedObjects(text, 'LANGUAGE_EXPANSION_CONCEPTS') * 4, target: 700 },
  { room: 'Reading Studio', file: 'components/ReadingRoom.tsx', current: text => countMatches(text, /\bid\s*:\s*['"`]/g) + countGeneratedThemes(text, 'READING_PASSAGE_TOPICS') * 7 * 5 + countGeneratedTuples(text, 'READING_EXPANSION_WORDS') * 2, target: 700 },
  { room: 'School Library', file: 'components/StoryBook.tsx', current: text => countMatches(text, /\bid\s*:\s*['"`]/g) + countGeneratedObjects(text, 'STORY_EXPANSION_TOPICS') * 7 * 2, target: 350 },
  { room: 'Coding', file: 'components/CodingRoom.tsx', current: text => countMatches(text, /\bid\s*:\s*['"`]/g) + countGeneratedThemes(text, 'CODING_EXPANSION_THEMES') * 7 * 3, target: 350 },
  { room: 'Art', file: 'components/ArtRoom.tsx', current: text => countMatches(text, /gradeLevel\s*:\s*\d+/g) + countGeneratedThemes(text, 'ART_EXPANSION_THEMES') * 7 * 2, target: 210 },
  { room: 'Music', file: 'components/MusicRoom.tsx', current: text => countMatches(text, /gradeLevel\s*:\s*\d+/g) + countGeneratedThemes(text, 'MUSIC_EXPANSION_THEMES') * 7 * 2, target: 210 },
  { room: 'Puzzle', file: 'components/PuzzleRoom.tsx', current: text => countMatches(text, /gradeLevel\s*:\s*\d+/g) + countGeneratedThemes(text, 'PUZZLE_EXPANSION_THEMES') * 7 * 2, target: 210 },
];

const results = roomAudits.map(audit => {
  const text = read(audit.file);
  const current = audit.current(text);
  return {
    room: audit.room,
    file: audit.file,
    current,
    target: audit.target,
    percent: Math.round((current / audit.target) * 100),
    byGrade: countByGrade(text),
  };
});

const trackingSource = read('types.ts') + read('services/assignmentTracking.ts') + read('services/firebaseProgressStore.ts');
const trackingReady = [
  'AssignmentAttempt',
  'DailyAssignmentSet',
  'questionSeenAt',
  'recordAssignmentAttempt',
  'assignmentAttempts',
  'dailyAssignmentSets',
].every(token => trackingSource.includes(token));

console.log('Curriculum depth audit');
for (const result of results) {
  console.log(`${result.room}: ${result.current}/${result.target} (${result.percent}%)`);
}

if (!trackingReady) {
  throw new Error('Assignment tracking data model is incomplete.');
}

const criticalBelowMvp = results.filter(result => result.current < Math.min(result.target, 10));
if (criticalBelowMvp.length > 0) {
  throw new Error(`Critical content banks below MVP floor: ${criticalBelowMvp.map(result => result.room).join(', ')}`);
}

console.log('Assignment tracking readiness passed. Year-long content targets are reported above for expansion tracking.');
