import { expect, test, type Page } from '@playwright/test';
import { completeKidSetup, startTeacherLesson, PARENT_PIN, resetApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

async function saveReflection(page: Page) {
  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Teach it back/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
}

async function answerScienceRound(page: Page) {
  await page.locator('[data-testid="science-answer-option"][data-science-correct="true"]').click();
  await expect(page.getByText('Evidence found!')).toBeVisible();
}

async function finishSixAutoRoom(page: Page, answerRound: (page: Page) => Promise<void>) {
  for (let round = 0; round < 6; round += 1) {
    await answerRound(page);
    if (round < 5) await page.waitForTimeout(1850);
  }
  await saveReflection(page);
}

async function answerGeographyRound(page: Page) {
  await page.locator('[data-testid="world-answer-option"][data-world-correct="true"]').click();
  await expect(page.getByText('Map connection made!')).toBeVisible();
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

test('science lab completes six experiments and saves parent proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Kindergarten Science Lab')).toBeVisible();
  await finishSixAutoRoom(page, answerScienceRound);
});

test('geography room completes six map questions and saves parent proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-GEOGRAPHY').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Kindergarten World Studies')).toBeVisible();
  await finishSixAutoRoom(page, answerGeographyRound);
});

test('speech and language room completes six teacher-led questions and saves parent proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-LANGUAGE').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Kindergarten Speech & Language', { exact: true })).toBeVisible();
  for (let round = 0; round < 6; round += 1) {
    await page.locator('[data-testid="language-answer-option"][data-language-correct="true"]').click();
    await expect(page.getByText('Strong speaking!')).toBeVisible();
    if (round < 5) await page.waitForTimeout(1700);
  }
  await saveReflection(page);
});

test('coding lab completes six visual code missions and records progress', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-CODING').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Kindergarten Coding Lab')).toBeVisible();
  for (let round = 0; round < 6; round += 1) {
    await page.locator('[data-testid="coding-answer-option"][data-coding-correct="true"]').click();
    await expect(page.getByText('Program works!')).toBeVisible();
    if (round < 5) await page.waitForTimeout(1850);
  }
  await saveReflection(page);
});

test('music room completes six listening checks and hands progress to reflection', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-MUSIC').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Kindergarten Music Room')).toBeVisible();
  for (let round = 0; round < 6; round += 1) {
    await page.getByLabel('Play sound sample').click();
    await page.locator('[data-testid="music-answer-option"][data-music-correct="true"]').click();
    await expect(page.getByText('You heard it!')).toBeVisible();
    if (round < 5) await page.waitForTimeout(1850);
  }
  await saveReflection(page);
});

test('strategy gym completes six mixed puzzles without blocking progress', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-PUZZLE').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Kindergarten Strategy Gym')).toBeVisible();
  for (let round = 0; round < 6; round += 1) {
    await page.locator('[data-testid="puzzle-answer-option"][data-puzzle-correct="true"]').click();
    await expect(page.getByText('Strategy works!')).toBeVisible();
    if (round < 5) await page.waitForTimeout(1750);
  }
  await saveReflection(page);
});

test('completed classroom work appears in parent dashboard activity reports', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);
  await finishSixAutoRoom(page, answerScienceRound);
  await page.getByRole('button', { name: 'Next Class', exact: true }).click();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('All Classroom Activity')).toBeVisible();
  await expect(page.getByText('Science').first()).toBeVisible();
  await expect(page.getByText('Learning Journal')).toBeVisible();
});
