import { expect, test } from '@playwright/test';

test('parent setup requires launch checkpoints before child access', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeVisible();

  const saveButton = page.getByRole('button', { name: 'Save Parent Setup' });
  await expect(saveButton).toBeDisabled();

  await page.getByPlaceholder('4-8 digit PIN').fill('2468');
  await page.getByPlaceholder('Confirm PIN').fill('2468');
  await expect(saveButton).toBeDisabled();

  await page.getByLabel('I am the parent or guardian supervising this child account.').check();
  await page.getByLabel('I reviewed the Privacy Notice and Terms of Use.').check();
  await page.getByLabel('I understand progress is stored locally in this browser until accounts are added.').check();
  await page.getByLabel('I will supervise optional voice narration and generated story cover features.').check();
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  await expect(page.getByRole('heading', { name: 'What grade are you in?' })).toBeVisible();

  const receipt = await page.evaluate(() => window.localStorage.getItem('kidGeniusParentConsentReceipt'));
  expect(receipt).toContain('policiesReviewed');
});
