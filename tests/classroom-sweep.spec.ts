import { expect, test, type Page } from '@playwright/test';
import { completeKidSetup, startTeacherLesson, PARENT_PIN, resetApp } from './helpers';
import { ALL_CHALLENGES } from '../components/CodingRoom';
import { ALL_GEOGRAPHY_QUESTIONS } from '../components/GeographyRoom';
import { getLanguageWords } from '../components/LanguageRoom';
import { ALL_SCIENCE_EXPERIMENTS } from '../components/ScienceRoom';

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

const TEST_LEVEL = 2;

async function saveReflection(page: Page) {
  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Teach it back/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
}

async function answerScienceRound(page: Page) {
  const visibleExperiment = await findVisibleItem(page, ALL_SCIENCE_EXPERIMENTS.filter(item => item.gradeLevel <= TEST_LEVEL), item => item.question);
  await page.getByRole('button', { name: new RegExp(escapeRegExp(visibleExperiment.hypothesis[visibleExperiment.correctAnswer])) }).click();
  await expect(page.getByText('Correct prediction.')).toBeVisible();
}

async function answerGeographyRound(page: Page) {
  const visibleQuestion = await findVisibleItem(page, ALL_GEOGRAPHY_QUESTIONS.filter(item => item.gradeLevel <= TEST_LEVEL), item => item.question);
  await page.getByRole('button', { name: new RegExp(escapeRegExp(visibleQuestion.answer)) }).first().click();
  await expect(page.getByText('Correct.')).toBeVisible();
}

async function answerLanguageRound(page: Page) {
  const words = getLanguageWords('spanish').filter(word => (word.gradeLevel ?? 1) <= TEST_LEVEL);
  const visibleWord = await findVisibleItem(page, words, word => word.english);
  await page.getByRole('button', { name: new RegExp(escapeRegExp(visibleWord.translation)) }).click();
  await expect(page.getByText('Correct translation.')).toBeVisible();
}

async function finishSixQuestionRoom(page: Page, answerRound: (page: Page) => Promise<void>, nextButtonName: RegExp) {
  for (let round = 0; round < 6; round += 1) {
    await answerRound(page);
    if (round < 5) {
      await page.waitForTimeout(2100);
      await page.getByRole('button', { name: nextButtonName }).click();
    }
  }
  await saveReflection(page);
}

async function findVisibleItem<T>(page: Page, items: T[], getText: (item: T) => string): Promise<T> {
  for (const item of items) {
    if (await page.getByText(getText(item), { exact: true }).first().isVisible().catch(() => false)) {
      return item;
    }
  }
  throw new Error(`No matching visible curriculum item found. Checked ${items.length} items.`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type Direction = 'up' | 'down' | 'left' | 'right';
type CodingState = { x: number; y: number; direction: Direction; blocks: string[] };

function solveCodingChallenge(challengeName: string): string[] {
  const cleanChallengeName = challengeName.replace(/^.*:\s*/, '').trim();
  const challenge = ALL_CHALLENGES.find(item => item.name === cleanChallengeName);
  if (!challenge) throw new Error(`Could not find coding challenge named ${challengeName}`);

  const queue: CodingState[] = [{ ...challenge.startPos, blocks: [] }];
  const seen = new Set<string>();
  const turnLeft: Record<Direction, Direction> = { up: 'left', left: 'down', down: 'right', right: 'up' };
  const turnRight: Record<Direction, Direction> = { up: 'right', right: 'down', down: 'left', left: 'up' };
  const turns: Array<{ label: string; direction: (direction: Direction) => Direction }> = [
    { label: 'Turn Left', direction: direction => turnLeft[direction] },
    { label: 'Turn Right', direction: direction => turnRight[direction] },
  ];

  while (queue.length) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y},${current.direction},${current.blocks.length}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (current.x === challenge.goalPos.x && current.y === challenge.goalPos.y) return current.blocks;
    if (current.blocks.length >= challenge.maxBlocks) continue;

    const nextMove = moveForward(current.x, current.y, current.direction);
    if (isOpen(challenge.grid, nextMove.x, nextMove.y)) {
      queue.push({ ...nextMove, direction: current.direction, blocks: [...current.blocks, 'Move Forward'] });
    }
    for (const turn of turns) {
      queue.push({ x: current.x, y: current.y, direction: turn.direction(current.direction), blocks: [...current.blocks, turn.label] });
    }
  }

  throw new Error(`Could not solve coding challenge ${challengeName}`);
}

function moveForward(x: number, y: number, direction: Direction) {
  if (direction === 'up') return { x, y: y - 1 };
  if (direction === 'down') return { x, y: y + 1 };
  if (direction === 'left') return { x: x - 1, y };
  return { x: x + 1, y };
}

function isOpen(grid: Array<Array<{ type: string }>>, x: number, y: number) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length && grid[y][x].type !== 'obstacle';
}

test('science lab completes six experiments and saves parent proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Science Lab')).toBeVisible();
  await finishSixQuestionRoom(page, answerScienceRound, /Next Experiment/i);
});

test('geography room completes six map questions and saves parent proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-GEOGRAPHY').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Geography Globe')).toBeVisible();
  await finishSixQuestionRoom(page, answerGeographyRound, /Explore More/i);
});

test('language room completes six quiz questions and saves parent proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-LANGUAGE').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Language Lab', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Quiz' }).click();
  await finishSixQuestionRoom(page, answerLanguageRound, /Next Word/i);
});

test('coding lab solves the active robot path and records progress', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-CODING').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Coding Corner')).toBeVisible();

  const challengeName = (await page.locator('h2').first().innerText()).trim();
  const blocks = solveCodingChallenge(challengeName);
  for (const block of blocks) {
    await page.getByRole('button', { name: new RegExp(escapeRegExp(block)) }).first().click();
  }
  await page.getByRole('button', { name: 'Run Code' }).click();
  await expect(page.getByText('Program reached the star.')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /Next Challenge/i })).toBeVisible();
});

test('music room completes a mission and hands progress to reflection', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-MUSIC').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Music Mission Board')).toBeVisible();

  for (let note = 0; note < 14; note += 1) {
    await page.getByRole('button', { name: 'C', exact: true }).click();
  }
  await expect(page.getByText(/Ready/i)).toBeVisible();
  await page.getByTitle('Complete music mission').evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByText(/music mission complete/i)).toBeVisible();
});

test('puzzle room solves shape and pattern activities without blocking progress', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-PUZZLE').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Puzzle Brain Gym')).toBeVisible();

  await page.locator('header button').nth(3).click();
  await expect(page.getByRole('heading', { name: 'Find the matching shape!' })).toBeVisible();
  const firstShapeTarget = await page.locator('h2 + div').innerText();
  await page.locator('button.w-20.h-20').filter({ hasText: firstShapeTarget }).first().click();
  await expect.poll(async () => page.locator('h2 + div').innerText()).not.toBe(firstShapeTarget);

  await page.locator('header button').nth(2).click();
  await expect(page.getByText('What comes next?')).toBeVisible();
  for (let index = 0; index < 6; index += 1) {
    await page.locator('button.w-24.h-24').nth(index % 4).click();
    if (await page.getByText(/Correct/i).isVisible().catch(() => false)) return;
  }
  await expect(page.getByText(/Correct/i)).toBeVisible();
});

test('completed classroom work appears in parent dashboard activity reports', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);
  await finishSixQuestionRoom(page, answerScienceRound, /Next Experiment/i);
  await page.getByRole('button', { name: 'Next Class', exact: true }).click();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('All Classroom Activity')).toBeVisible();
  await expect(page.getByText('Science').first()).toBeVisible();
  await expect(page.getByText('Learning Journal')).toBeVisible();
});
