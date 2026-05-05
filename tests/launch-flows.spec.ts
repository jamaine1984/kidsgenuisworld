import { expect, test } from '@playwright/test';
import { completeKidSetup, PARENT_PIN, resetApp } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetApp(page);
});

test('landing legal links open privacy and terms surfaces', async ({ page }) => {
  await page.getByRole('button', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { name: 'Privacy Notice' })).toBeVisible();
  await expect(page.getByText('Current Data Storage')).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Terms' }).click();
  await expect(page.getByRole('heading', { name: 'Terms of Use' })).toBeVisible();
  await expect(page.getByText('Educational Use')).toBeVisible();
});

test('parent dashboard gate protects tabs and privacy receipt', async ({ page }) => {
  await completeKidSetup(page);

  await page.getByTitle('Settings').click();
  await expect(page.getByRole('heading', { name: 'Parent Check' })).toBeVisible();
  await page.getByLabel('Parent PIN').fill('1111');
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('That PIN did not match. Please try again.')).toBeVisible();

  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Parent Dashboard' })).toBeVisible();
  await expect(page.getByText('Parent Learning Report')).toBeVisible();

  await page.getByRole('button', { name: /Skills/i }).click();
  await expect(page.getByText('Math Skills')).toBeVisible();

  await page.getByRole('button', { name: /Roadmap/i }).click();
  await expect(page.getByText('Curriculum Roadmap')).toBeVisible();

  await page.getByRole('button', { name: /Settings/i }).click();
  await expect(page.getByText('Family Learning Goals')).toBeVisible();
  await expect(page.getByText('Parent Consent Receipt')).toBeVisible();
  await expect(page.getByText(/Saved locally on/i)).toBeVisible();
});

test('world review quest and arcade are reachable on tablet', async ({ page }) => {
  await completeKidSetup(page);

  await page.getByRole('button', { name: /Review Quest/i }).click();
  await expect(page.getByRole('heading', { name: 'Explain it again' })).toBeVisible();
  await expect(page.getByText('Quick review helps learning stick')).toBeVisible();
  await page.getByLabel('Close Review Quest').click();
  await expect(page.getByRole('heading', { name: 'Explain it again' })).toBeHidden();

  await page.getByRole('button', { name: /Game Arcade/i }).click();
  await expect(page.getByRole('heading', { name: 'Game Arcade' })).toBeVisible();
  await expect(page.getByText('Daily Quest Board')).toBeVisible();
  await expect(page.getByRole('button', { name: /Number Dash/i })).toBeVisible();
});

test('math room completion creates reward and parent-visible journal proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-MATH').click();
  await expect(page.getByTestId('math-question')).toBeVisible();

  for (let round = 0; round < 3; round += 1) {
    const question = (await page.getByTestId('math-question').innerText()).trim();
    const answer = solveMathQuestion(question);
    await page.getByTestId('math-answer-option').filter({ hasText: String(answer) }).click();
    if (round < 2) {
      await expect(page.getByTestId('math-answer-option').first()).toBeEnabled({ timeout: 5_000 });
    }
  }

  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 7_500 });
  await expect(page.getByText('practice rounds')).toBeVisible();
  await page.getByRole('button', { name: /Teach it back/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
  await page.getByRole('button', { name: 'Back to World', exact: true }).click();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('Learning Journal')).toBeVisible();
  await expect(page.getByText('Teach it back')).toBeVisible();
});

function solveMathQuestion(question: string) {
  const equation = question.match(/^(\d+)\s*([+-])\s*(\d+)\s*=/);
  if (!equation) {
    throw new Error(`Unsupported math question in browser QA: ${question}`);
  }

  const left = Number(equation[1]);
  const right = Number(equation[3]);
  return equation[2] === '+' ? left + right : left - right;
}
