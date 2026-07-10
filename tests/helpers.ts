import { expect, type Page } from '@playwright/test';

export const PARENT_PIN = '2468';

export async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('kidGeniusTestParentSession', JSON.stringify({
      uid: 'playwright-parent',
      email: 'qa-parent@kidgenius.test',
      familyId: 'family-playwright-parent',
    }));
    window.localStorage.setItem('kidGeniusDevAccessOverride', 'true');
  });
  await page.reload();
}

export async function completeParentSetup(page: Page) {
  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Parent' }).click();
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeVisible();
  await expect(page.getByText(/Signed in: qa-parent@kidgenius.test/i)).toBeVisible();

  await page.getByLabel('I am the parent or guardian supervising this child account.').check();
  await page.getByLabel('I reviewed the Privacy Notice and Terms of Use.').check();
  await page.getByLabel('I understand progress is stored locally in this browser unless a parent enables Firebase cloud sync.').check();
  await page.getByLabel('I will supervise optional saved voice narration and illustrated story cover features.').check();
  await page.getByPlaceholder('4-8 digit PIN').fill(PARENT_PIN);
  await page.getByPlaceholder('Confirm PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Save Parent Setup' }).click();
  await expect(page.getByRole('heading', { name: 'Create your child profile' })).toBeVisible();
}

export async function completeKidSetup(page: Page) {
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Student One');
  await page.getByRole('button', { name: /Kindergarten/i }).click();
  await expect(page.getByRole('heading', { name: /Choose Your Learning Buddy/i })).toBeVisible();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Buddy');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
}

export async function startTeacherLesson(page: Page) {
  await expect(page.getByTestId('teacher-lesson-start')).toContainText("Today's lesson path");
  await expect(page.getByTestId('teacher-lesson-start')).toContainText('Learning target');
  await expect(page.getByTestId('teacher-lesson-start')).toContainText('Exit ticket');
  await page.getByRole('button', { name: /Start guided practice/i }).click();
}
