import { expect, type Page } from '@playwright/test';

export const PARENT_PIN = '2468';

export async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();
}

export async function completeParentSetup(page: Page) {
  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeVisible();

  await page.getByLabel('I am the parent or guardian supervising this child account.').check();
  await page.getByLabel('I reviewed the Privacy Notice and Terms of Use.').check();
  await page.getByLabel('I understand progress is stored locally in this browser unless a parent enables Firebase cloud sync.').check();
  await page.getByLabel('I will supervise optional saved voice narration and illustrated story cover features.').check();
  await page.getByPlaceholder('4-8 digit PIN').fill(PARENT_PIN);
  await page.getByPlaceholder('Confirm PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Save Parent Setup' }).click();
  await expect(page.getByRole('heading', { name: 'What grade are you in?' })).toBeVisible();
}

export async function completeKidSetup(page: Page) {
  await completeParentSetup(page);
  await page.getByRole('button', { name: /Kindergarten/i }).click();
  await expect(page.getByRole('heading', { name: /Choose Your Learning Buddy/i })).toBeVisible();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Buddy');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
}
