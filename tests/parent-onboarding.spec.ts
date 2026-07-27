import { expect, test } from '@playwright/test';
import { completeParentSetup, resetApp } from './helpers';

test('parent setup requires launch checkpoints before child access', async ({ page }) => {
  await resetApp(page);

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await expect(page.getByText('qa-parent@kidgenius.test')).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Parent' }).click();
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

test('start adventure shows parent sign in before child profile setup', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await page.getByRole('button', { name: 'Watch School Tour' }).click();
  await expect(page.getByRole('dialog', { name: 'See how a school day works' })).toBeVisible();
  await expect(page.getByText('Parent opens the school')).toBeVisible();
  await page.getByRole('button', { name: 'Start Parent Setup' }).click();
  await expect(page.getByRole('dialog', { name: 'See how a school day works' })).toBeHidden();
  await expect(page.getByPlaceholder('Parent email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In Parent' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create your child profile' })).toBeHidden();
});

test('start adventure shows parent welcome even when already signed in', async ({ page }) => {
  await resetApp(page);

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await expect(page.getByText('Signed in parent')).toBeVisible();
  await expect(page.getByText('qa-parent@kidgenius.test')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue as Parent' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Create your child profile' })).toBeHidden();
});

test('school tour start setup scrolls to parent account panel on phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await page.getByRole('button', { name: 'Watch School Tour' }).click();
  await expect(page.getByRole('dialog', { name: 'See how a school day works' })).toBeVisible();
  await page.getByRole('button', { name: 'Start Parent Setup' }).click();
  await expect(page.getByRole('dialog', { name: 'See how a school day works' })).toBeHidden();

  await expect.poll(async () => page.evaluate(() => {
    const panel = document.getElementById('parent-account-panel');
    const rect = panel?.getBoundingClientRect();
    return !!rect && rect.top < window.innerHeight && rect.bottom > 0;
  })).toBe(true);
});

test('returning parent with child profile continues without creating another child', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('kidGeniusTestParentSession', JSON.stringify({
      uid: 'playwright-parent',
      email: 'qa-parent@kidgenius.test',
      familyId: 'family-playwright-parent',
    }));
    window.localStorage.setItem('kidGeniusDevAccessOverride', 'true');
    window.localStorage.setItem('kidGeniusParentOnboarded:family-playwright-parent', 'true');
    window.localStorage.setItem('kidGeniusParentPin:family-playwright-parent', '2468');
    window.localStorage.setItem('kidGeniusProfiles:family-playwright-parent', JSON.stringify([
      {
        id: 'child-existing',
        name: 'Ava',
        grade: '1st Grade',
        createdAt: Date.now() - 1000,
        lastActiveAt: Date.now() - 1000,
      },
    ]));
    window.localStorage.setItem('kidGeniusActiveProfileId:family-playwright-parent', 'child-existing');
    window.localStorage.setItem('kidGeniusProgress:family-playwright-parent:child-existing', JSON.stringify({
      childName: 'Ava',
      currentGrade: '1st Grade',
      currentLevel: 3,
      totalXP: 0,
      stickers: [],
      achievements: [],
    }));
  });
  await page.reload();

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Parent' }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
  await expect(page.getByText('Ava').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Create your child profile' })).toBeHidden();
});

test('parent session and child profile persist until the parent explicitly logs out', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('kidGeniusTestParentSession', JSON.stringify({
      uid: 'persistent-parent',
      email: 'persistent-parent@kidgenius.test',
      familyId: 'family-persistent-parent',
    }));
    window.localStorage.setItem('kidGeniusDevAccessOverride', 'true');
    window.localStorage.setItem('kidGeniusParentOnboarded:family-persistent-parent', 'true');
    window.localStorage.setItem('kidGeniusProfiles:family-persistent-parent', JSON.stringify([
      {
        id: 'child-persistent',
        name: 'Jordan',
        grade: 'Pre-K',
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      },
    ]));
    window.localStorage.setItem('kidGeniusActiveProfileId:family-persistent-parent', 'child-persistent');
    window.localStorage.setItem('kidGeniusProgress:family-persistent-parent:child-persistent', JSON.stringify({
      childName: 'Jordan',
      currentGrade: 'Pre-K',
      currentLevel: 1,
      totalXP: 0,
      stickers: [],
      achievements: [],
    }));
  });
  await page.reload();

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await page.getByRole('button', { name: 'Continue as Parent' }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
  await expect(page.getByText('Jordan').first()).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await page.getByRole('button', { name: 'Continue as Parent' }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
  await expect(page.getByText('Jordan').first()).toBeVisible();

  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in or create account' })).toBeVisible();
  await expect(page.getByText('Signed in parent')).toBeHidden();
  const profileStorage = await page.evaluate(() => window.localStorage.getItem('kidGeniusProfiles:family-persistent-parent'));
  expect(profileStorage).toContain('Jordan');
});

test('returning parent prefers saved child over placeholder profile', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.localStorage.setItem('kidGeniusTestParentSession', JSON.stringify({
      uid: 'playwright-parent',
      email: 'qa-parent@kidgenius.test',
      familyId: 'family-playwright-parent',
    }));
    window.localStorage.setItem('kidGeniusDevAccessOverride', 'true');
    window.localStorage.setItem('kidGeniusParentOnboarded:family-playwright-parent', 'true');
    window.localStorage.setItem('kidGeniusParentPin:family-playwright-parent', '2468');
    window.localStorage.setItem('kidGeniusProfiles:family-playwright-parent', JSON.stringify([
      {
        id: 'default',
        name: 'Learner',
        grade: 'Kindergarten',
        createdAt: Date.now() - 2000,
        lastActiveAt: Date.now() - 2000,
      },
      {
        id: 'child-second',
        name: 'Mia',
        grade: '2nd Grade',
        createdAt: Date.now() - 1000,
        lastActiveAt: Date.now() - 1000,
      },
    ]));
    window.localStorage.setItem('kidGeniusActiveProfileId:family-playwright-parent', 'default');
    window.localStorage.setItem('kidGeniusProgress:family-playwright-parent:child-second', JSON.stringify({
      childName: 'Mia',
      currentGrade: '2nd Grade',
      currentLevel: 4,
      totalXP: 20,
      stickers: ['star'],
      achievements: [],
    }));
  });
  await page.reload();

  await page.getByRole('button', { name: /Start Adventure/i }).click();
  await page.getByRole('button', { name: 'Continue as Parent' }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();
  await expect(page.getByText('Mia').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Create your child profile' })).toBeHidden();
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
  await expect(page.getByTestId('parent-access-gate')).toContainText('Premium adds priority curriculum drops');
  await expect(page.getByTestId('parent-access-gate')).toContainText('keeping kids out of billing screens');
  await expect(page.getByTestId('parent-access-gate')).toContainText('Stripe handles payment details');
  await expect(page.getByRole('button', { name: 'Choose Starter plan' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Choose Premium plan' })).toBeEnabled();
});
