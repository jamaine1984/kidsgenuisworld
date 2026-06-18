import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const roomFiles = [
  'components/MathRoom.tsx',
  'components/ReadingRoom.tsx',
  'components/ScienceRoom.tsx',
  'components/GeographyRoom.tsx',
  'components/CodingRoom.tsx',
  'components/LanguageRoom.tsx',
  'components/StoryBook.tsx',
  'components/ArtRoom.tsx',
  'components/MusicRoom.tsx',
  'components/PuzzleRoom.tsx',
];

const missing = [];
for (const file of roomFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (!/onReward:\s*\(meta\?:/.test(text)) {
    missing.push(`${file}: reward callback does not accept metadata`);
  }
  if (!/onReward\(\{[\s\S]*?questionId:/.test(text)) {
    missing.push(`${file}: no successful reward call with questionId metadata`);
  }
}

const appText = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
if (!appText.includes('assignmentMeta?: AssignmentRewardMeta')) {
  missing.push('App.tsx: addSticker does not accept assignment metadata');
}
if (!appText.includes('recordAssignmentAttempt(newProgress')) {
  missing.push('App.tsx: assignment attempts are not recorded in progress updates');
}

if (missing.length > 0) {
  throw new Error(`Assignment tracking check failed:\n${missing.join('\n')}`);
}

console.log(`Assignment tracking check passed: ${roomFiles.length} classrooms send exact question metadata.`);
