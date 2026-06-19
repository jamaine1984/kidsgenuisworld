import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = [
  'components/ArtRoom.tsx',
  'components/CodingRoom.tsx',
  'components/GameArcade.tsx',
  'components/GeographyRoom.tsx',
  'components/LanguageRoom.tsx',
  'components/MathRoom.tsx',
  'components/MusicRoom.tsx',
  'components/PuzzleRoom.tsx',
  'components/ReadingRoom.tsx',
  'components/ScienceRoom.tsx',
  'components/StoryBook.tsx',
  'components/StudyZone.tsx',
];

const blockedPatterns = [
  /\bexample\s+\d+\b/i,
  /\bclue\s+\d+\b/i,
  /\bevidence\s+set\s+\d+\b/i,
  /\bmap\s+set\s+\d+\b/i,
  /\bidea\s+\d+\b/i,
  /lunch choice/i,
  /ignored every clue/i,
  /hid the notebook/i,
  /happens by magic/i,
  /without any cause/i,
  /answer never changes/i,
  /not connected to places/i,
];

const issues = [];

const readSingleQuotedValues = (source) => {
  const values = [];
  const valuePattern = /'((?:\\'|[^'])*)'/g;
  let match;
  while ((match = valuePattern.exec(source)) !== null) {
    values.push(match[1].replace(/\\'/g, "'").trim());
  }
  return values;
};

const checkChoices = ({ file, lineNumber, answer, choices, label }) => {
  const cleanChoices = choices.map(choice => choice.trim()).filter(Boolean);
  const uniqueChoices = new Set(cleanChoices.map(choice => choice.toLowerCase()));

  if (!answer.trim()) {
    issues.push(`${file}:${lineNumber}: ${label} has an empty answer`);
  }

  if (cleanChoices.length < 2) {
    issues.push(`${file}:${lineNumber}: ${label} needs at least two answer choices`);
  }

  if (uniqueChoices.size !== cleanChoices.length) {
    issues.push(`${file}:${lineNumber}: ${label} has duplicate answer choices`);
  }

  if (!cleanChoices.includes(answer.trim())) {
    issues.push(`${file}:${lineNumber}: ${label} answer "${answer}" is missing from its choices`);
  }
};

for (const file of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    issues.push(`${file}: file is missing from curriculum quality audit`);
    continue;
  }

  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of blockedPatterns) {
      if (pattern.test(line)) {
        issues.push(`${file}:${index + 1}: blocked placeholder wording matched ${pattern}`);
      }
    }
  });

  const answerOptionsPattern = /answer:\s*'([^']*)'\s*,\s*options:\s*\[([^\]]*)\]/g;
  let answerOptionsMatch;
  while ((answerOptionsMatch = answerOptionsPattern.exec(text)) !== null) {
    checkChoices({
      file,
      lineNumber: text.slice(0, answerOptionsMatch.index).split(/\r?\n/).length,
      answer: answerOptionsMatch[1],
      choices: readSingleQuotedValues(answerOptionsMatch[2]),
      label: 'multiple-choice item',
    });
  }

  const scienceHypothesisPattern = /hypothesis:\s*\[([^\]]*)\]\s*,\s*correctAnswer:\s*(\d+)/g;
  let scienceMatch;
  while ((scienceMatch = scienceHypothesisPattern.exec(text)) !== null) {
    const choices = readSingleQuotedValues(scienceMatch[1]);
    const correctIndex = Number(scienceMatch[2]);
    const lineNumber = text.slice(0, scienceMatch.index).split(/\r?\n/).length;
    const uniqueChoices = new Set(choices.map(choice => choice.toLowerCase()));

    if (choices.length === 0) {
      continue;
    }

    if (choices.length < 2) {
      issues.push(`${file}:${lineNumber}: science item needs at least two hypotheses`);
    }

    if (uniqueChoices.size !== choices.length) {
      issues.push(`${file}:${lineNumber}: science item has duplicate hypotheses`);
    }

    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= choices.length) {
      issues.push(`${file}:${lineNumber}: science item has invalid correctAnswer index ${correctIndex}`);
    }
  }
}

if (issues.length) {
  console.error('Curriculum quality audit failed:');
  issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Curriculum quality audit passed: ${files.length} classroom files checked for placeholder wording and answer-choice integrity.`);
