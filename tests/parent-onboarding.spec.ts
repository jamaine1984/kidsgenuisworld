import { expect, test } from '@playwright/test';
import { completeParentSetup, resetApp } from './helpers';

test('parent setup requires launch checkpoints before child access', async ({ page }) => {
  await resetApp(page);

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeVisible();

  const saveButton = page.getByRole('button', { name: 'Save Parent Setup' });
  await expect(saveButton).toBeDisabled();

  await page.getByPlaceholder('4-8 digit PIN').fill('2468');
  await page.getByPlaceholder('Confirm PIN').fill('2468');
  await expect(saveButton).toBeDisabled();

  await page.getByLabel('I am the parent or guardian supervising this child account.').check();
  await page.getByLabel('I reviewed the Privacy Notice and Terms of Use.').check();
  await page.getByLabel('I understand progress is stored locally in this browser unless a parent enables Firebase cloud sync.').check();
  await page.getByLabel('I will supervise optional saved voice narration and illustrated story cover features.').check();
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  await expect(page.getByRole('heading', { name: 'Create your child profile' })).toBeVisible();

  const receipt = await page.evaluate(() => window.localStorage.getItem('kidGeniusParentConsentReceipt'));
  expect(receipt).toContain('policiesReviewed');
});

test('parent access gate explains trial plans before paid sections unlock', async ({ page }) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Student One');
  await page.getByRole('button', { name: /Kindergarten/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Buddy');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
  await page.evaluate(() => {
    window.localStorage.removeItem('kidGeniusDevAccessOverride');
  });

  await page.getByTestId('room-card-MATH').click();
  await expect(page.getByTestId('parent-access-gate')).toContainText('Start the 3-day parent-approved trial');
  await expect(page.getByTestId('parent-access-gate')).toContainText('What unlocks after trial starts');
  await expect(page.getByTestId('parent-access-gate')).toContainText('Transparent launch pricing');
  await expect(page.getByTestId('parent-access-gate')).toContainText('Premium is optional');
  await expect(page.getByTestId('parent-access-gate')).toContainText('no child-facing feature is hidden behind surprise upsells');
  await expect(page.getByTestId('parent-access-gate')).toContainText('Stripe handles payment details');
  await expect(page.getByRole('button', { name: 'Choose Starter plan' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Choose Premium plan' })).toBeEnabled();
});
