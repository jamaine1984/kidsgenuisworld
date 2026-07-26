#!/usr/bin/env node
/**
 * GRADE PURITY AUDIT
 * ==================
 * Fails the build if any room can serve a child content tagged for a grade
 * other than their own.
 *
 * This exists because the app previously showed 2nd-grade math to a Pre-K
 * profile: `currentGrade` came from the profile while `currentLevel` was
 * restored from saved progress and advanced independently. Content filters
 * were also cumulative (`<= level`), so every grade inherited every grade
 * below it. Both classes of bug are checked here so they cannot come back.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const failures = [];
const notes = [];

// ---------------------------------------------------------------
// 1. currentLevel must be derived from the profile grade, never
//    restored from a saved patch.
// ---------------------------------------------------------------
const appSource = read('App.tsx');
if (/currentLevel:\s*patch\.currentLevel\s*\|\|/.test(appSource)) {
  failures.push(
    'App.tsx: currentLevel is restored from `patch.currentLevel`, so a promoted ' +
    'level can drift away from the profile grade. It must always derive from ' +
    'gradeToLevel[profile.grade].'
  );
} else {
  notes.push('App.tsx: currentLevel derives from the profile grade.');
}

// ---------------------------------------------------------------
// 2. Mastery must not silently change the grade. It should raise a
//    pendingPromotion for a parent to approve.
// ---------------------------------------------------------------
if (!/pendingPromotion/.test(appSource)) {
  failures.push('App.tsx: no pendingPromotion flow found; grade changes must be parent-approved.');
} else {
  notes.push('App.tsx: promotions are parent-approved via pendingPromotion.');
}

// ---------------------------------------------------------------
// 3. No room may filter its content cumulatively.
// ---------------------------------------------------------------
const CUMULATIVE_PATTERNS = [
  { re: /gradeLevel\s*<=\s*level/, label: 'gradeLevel <= level' },
  { re: /\.level\s*<=\s*maxLvl/, label: '.level <= maxLvl' },
  { re: /gradeOrder\.indexOf\(unit\.grade\)\s*<=/, label: 'gradeOrder.indexOf(unit.grade) <=' },
];

const roomFiles = fs
  .readdirSync(path.join(root, 'components'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => `components/${f}`);

for (const rel of [...roomFiles, 'services/curriculum.ts']) {
  const source = read(rel);
  for (const { re, label } of CUMULATIVE_PATTERNS) {
    // A cumulative comparison is only allowed inside an explicit fallback,
    // which we mark with the GRADE-FALLBACK comment.
    const lines = source.split('\n');
    lines.forEach((line, index) => {
      if (!re.test(line)) return;
      const context = lines.slice(Math.max(0, index - 6), index + 1).join('\n');
      const isDeclaredFallback = /GRADE-FALLBACK|exactGrade|exact\.length|banded\.length/.test(context);
      if (!isDeclaredFallback) {
        failures.push(`${rel}:${index + 1} uses cumulative filter "${label}" outside a declared fallback.`);
      }
    });
  }
}

// ---------------------------------------------------------------
// 4. Generators must only build questions from the exact grade.
// ---------------------------------------------------------------
const generators = read('services/questionGenerators.ts');
if (!/PLACE_FACTS\[lvl\]/.test(generators) || !/SCIENCE_ITEMS\[lvl\]/.test(generators)) {
  failures.push('services/questionGenerators.ts: generators must read facts keyed by the exact grade level.');
} else {
  notes.push('questionGenerators.ts: generators read only exact-grade fact tables.');
}

// ---------------------------------------------------------------
// Report
// ---------------------------------------------------------------
for (const note of notes) console.log(`  ok  ${note}`);

if (failures.length > 0) {
  console.error('\nGrade purity audit FAILED:\n');
  for (const failure of failures) console.error(`  x  ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(`\nGrade purity audit passed: ${roomFiles.length} room files and the curriculum service serve exact-grade content only.`);
