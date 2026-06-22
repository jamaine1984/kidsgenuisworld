import { expect, test } from '@playwright/test';
import { completeKidSetup, PARENT_PIN, resetApp, startTeacherLesson } from './helpers';

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

  await page.getByRole('button', { name: /Gradebook/i }).click();
  await expect(page.getByTestId('teacher-gradebook')).toContainText('Teacher Gradebook');
  await expect(page.getByTestId('teacher-gradebook')).toContainText('Recommended next action');
  await expect(page.getByTestId('teacher-gradebook')).toContainText('Last practiced');

  await page.getByRole('button', { name: /Skills/i }).click();
  await expect(page.getByText('Math Skills')).toBeVisible();

  await page.getByRole('button', { name: /Roadmap/i }).click();
  await expect(page.getByText('Curriculum Roadmap')).toBeVisible();

  await page.getByRole('button', { name: /Settings/i }).click();
  await expect(page.getByText('Family Learning Goals')).toBeVisible();
  await expect(page.getByText('Parent Consent Receipt')).toBeVisible();
  await expect(page.getByText(/Saved locally on/i)).toBeVisible();
  await expect(page.getByTestId('parent-diagnostics-card')).toContainText('Support Diagnostics');
  await expect(page.getByRole('button', { name: 'Export Diagnostics' })).toBeVisible();
});

test('parent dashboard exposes Firebase cloud sync as parent opt-in', async ({ page }) => {
  await completeKidSetup(page);

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await page.getByRole('button', { name: /Settings/i }).click();

  await expect(page.getByText('Firebase cloud progress sync', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Firebase Parent Account' })).toBeVisible();
  await expect(page.getByText(/Cloud sync is parent-only/i)).toBeVisible();
  await expect(page.getByText('Signed in parent')).toBeVisible();
  await expect(page.getByText('qa-parent@kidgenius.test').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Family Subscription' })).toBeVisible();
  await expect(page.getByText(/Stripe checkout stays parent-only/i)).toBeVisible();
  await expect(page.getByTestId('parent-billing-status-card')).toContainText('No plan selected');

  const syncToggle = page.getByLabel('Toggle Firebase cloud progress sync');
  await expect(syncToggle).toHaveAttribute('aria-pressed', 'false');
  await syncToggle.click();
  await expect(syncToggle).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByRole('button', { name: 'Sync Progress Now' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
});

test('world review quest and arcade are reachable on tablet', async ({ page }) => {
  await completeKidSetup(page);

  await expect(page.getByTestId('school-bell-strip')).toContainText('School Bell');
  await expect(page.getByTestId('school-bell-strip')).toContainText('Now');
  await expect(page.getByTestId('school-bell-strip')).toContainText('Period 1: Reading');
  await expect(page.getByTestId('school-bell-strip')).toContainText('Period 2: Speech & Language');
  await expect(page.getByTestId('school-bell-strip')).toContainText('Period 3: Math');
  await expect(page.getByTestId('school-bell-strip')).toContainText('Last Period:');
  await expect(page.getByTestId('school-bell-strip')).toContainText('Locked');
  await expect(page.getByTestId('ai-homeroom-card')).toBeHidden();
  await expect(page.getByTestId('next-class-pass')).toBeHidden();
  await expect(page.getByTestId('school-day-tracker')).toBeHidden();
  await expect(page.getByTestId('teacher-assignment-cards')).toContainText('Teacher Assignment Cards');
  await expect(page.getByTestId('teacher-assignment-cards')).toContainText('Mastery rubric');
  await expect(page.getByTestId('student-passport-conference')).toContainText('Teacher conference question');
  await expect(page.getByTestId('student-passport-conference')).toContainText('Next stamp target');
  await expect(page.getByText('Passport Stamp Collection')).toBeVisible();
  await expect(page.getByTestId('student-passport-conference')).toContainText('proof saved');
  await expect(page.getByTestId('student-passport-conference')).toContainText('reflections');
  await expect(page.getByTestId('student-passport-conference')).toContainText('mastered');
  await expect(page.getByTestId('student-teacher-conference-plan')).toContainText('Teacher conference plan');
  await expect(page.getByTestId('student-teacher-conference-plan')).toContainText('Teacher move');
  await expect(page.getByText('School Campus', { exact: true }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: /Math Classroom/i }).first()).toBeVisible();

  await page.getByRole('button', { name: /Review Quest/i }).click();
  await expect(page.getByRole('heading', { name: 'Explain it again' })).toBeVisible();
  await expect(page.getByText('Quick review helps learning stick')).toBeVisible();
  await page.getByLabel('Close Review Quest').click();
  await expect(page.getByRole('heading', { name: 'Explain it again' })).toBeHidden();

  await page.getByRole('button', { name: /Offline Break/i }).click();
  await expect(page.getByRole('heading', { name: /Plan a healthy break|Time to pause/i })).toBeVisible();
  await expect(page.getByText('Break step 1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'I Took a Break' })).toBeVisible();
  await page.getByRole('button', { name: 'I Took a Break' }).click();
  await expect(page.getByRole('heading', { name: /Plan a healthy break|Time to pause/i })).toBeHidden();

  await page.getByRole('button', { name: /Game Arcade/i }).click();
  await expect(page.getByRole('heading', { name: 'Game Arcade' })).toBeVisible();
  await expect(page.getByText('Daily Quest Board')).toBeVisible();
  await expect(page.getByRole('button', { name: /Number Dash/i })).toBeVisible();
});

test('math room completion creates reward and parent-visible journal proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);
  await page.getByRole('button', { name: 'Lesson Help' }).click();
  await expect(page.getByTestId('teacher-room-coach')).toContainText('Mr. Atlas is teaching');
  await expect(page.getByTestId('teacher-room-coach')).toContainText('Exit ticket');
  await expect(page.getByTestId('teacher-lesson-path')).toContainText('Lesson path');
  await expect(page.getByTestId('teacher-lesson-path')).toContainText('Now');
  await expect(page.getByTestId('teacher-help-ladder')).toContainText('Teacher help ladder');
  await expect(page.getByTestId('teacher-help-ladder')).toContainText('Hint');
  await page.getByLabel('Hide Mission Focus').click();
  await expect(page.getByTestId('math-question')).toBeVisible();
  await expect(page.getByTestId('guide-bubble')).toBeHidden();
  await page.getByLabel('Open guide message').click();
  await expect(page.getByTestId('guide-bubble')).toContainText(/one problem|Count carefully/i);
  await page.getByLabel('Minimize guide message').click();
  await expect(page.getByTestId('guide-bubble')).toBeHidden();

  for (let round = 0; round < 6; round += 1) {
    await expect(page.getByTestId('math-question')).toBeVisible();
    const currentQuestion = await page.getByTestId('math-question').innerText();
    await page.locator('[data-testid="math-answer-option"][data-math-correct="true"]').click();
    if (round < 5) {
      await expect(page.getByTestId('math-question')).not.toHaveText(currentQuestion, { timeout: 7_500 });
      await expect(page.locator('[data-testid="math-answer-option"][data-math-correct="true"]')).toBeEnabled();
    }
  }

  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 7_500 });
  await expect(page.getByText('practice rounds')).toBeVisible();
  await page.getByRole('button', { name: /Teach it back/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
  await page.getByRole('button', { name: 'Next Class', exact: true }).click();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('Teacher Mission Control')).toBeVisible();
  await expect(page.getByTestId('parent-school-day-attendance')).toContainText('School-day attendance');
  await expect(page.getByTestId('parent-school-day-attendance')).toContainText('periods complete');
  await expect(page.getByTestId('parent-school-day-attendance')).toContainText('Required proof');
  await expect(page.getByTestId('parent-school-day-attendance')).toContainText('Reward:');
  await expect(page.getByText('answers required before next class opens')).toBeVisible();
  await expect(page.getByText('Monthly progress report')).toBeVisible();
  await expect(page.getByText('All Classroom Activity')).toBeVisible();
  await expect(page.getByText('Every period parents can track')).toBeVisible();
  await expect(page.getByTestId('parent-teacher-help-ladder')).toContainText('Teacher help ladder');
  await expect(page.getByTestId('parent-teacher-help-ladder')).toContainText('Teach Back');
  await expect(page.getByTestId('parent-teacher-assignments')).toContainText('Teacher assignment cards');
  await expect(page.getByTestId('parent-teacher-assignments')).toContainText('Mastery rubric');
  await page.getByRole('button', { name: /Gradebook/i }).click();
  await expect(page.getByTestId('teacher-gradebook')).toContainText('Attempts');
  await expect(page.getByTestId('teacher-gradebook')).toContainText('Today');
  await page.getByRole('button', { name: /Overview/i }).click();
  await expect(page.getByTestId('parent-student-passport')).toContainText('Student Learning Passport');
  await expect(page.getByTestId('parent-student-passport')).toContainText('Teacher conference question');
  await expect(page.getByTestId('parent-student-passport')).toContainText('Parent follow-up');
  await expect(page.getByTestId('parent-teacher-conference-plan')).toContainText('Teacher conference plan');
  await expect(page.getByTestId('parent-teacher-conference-plan')).toContainText('Student can say');
  await expect(page.getByText('Learning Journal')).toBeVisible();
  await expect(page.getByText('Mr. Atlas note').first()).toBeVisible();
  await expect(page.getByText('Teach it back').first()).toBeVisible();
});

test('teacher coach starts compact on phone and expands on demand', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await completeKidSetup(page);
  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);

  await page.getByRole('button', { name: 'Lesson Help' }).click();
  await expect(page.getByTestId('teacher-room-coach-compact')).toContainText('Mr. Atlas');
  await expect(page.getByTestId('teacher-room-coach-compact')).toContainText('mastery');
  await page.getByLabel('Show next teacher help step').click();
  await page.getByLabel('Show next teacher help step').click();
  await page.getByLabel('Expand teacher coach').click();
  await expect(page.getByTestId('teacher-room-coach')).toContainText('Guided practice');
  await expect(page.getByTestId('teacher-lesson-path')).toContainText('Lesson path');
  await expect(page.getByTestId('teacher-help-ladder')).toContainText('Try Together');
  await expect(page.getByTestId('teacher-room-coach')).toContainText('Exit ticket');
  await page.getByLabel('Hide Mission Focus').click();
  await expect(page.getByRole('button', { name: 'Lesson Help' })).toBeVisible();
});

test('browser voice fallback speaks when saved voice is off', async ({ page }) => {
  await page.evaluate(() => {
    (window as any).__kidGeniusSpeechCount = 0;
    window.speechSynthesis.cancel = () => undefined;
    window.speechSynthesis.speak = (utterance: SpeechSynthesisUtterance) => {
      (window as any).__kidGeniusSpeechCount += 1;
      window.setTimeout(() => {
        utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
      }, 0);
    };
  });
  await completeKidSetup(page);
  await page.evaluate(() => {
    window.localStorage.setItem('kidGeniusAllowExternalVoice', 'false');
    (window as any).__kidGeniusSpeechCount = 0;
  });

  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);

  await expect.poll(async () => page.evaluate(() => (window as any).__kidGeniusSpeechCount || 0)).toBeGreaterThan(0);
});

test('saved human voice cache is requested during parent and child setup', async ({ page }) => {
  const voiceResponses: Array<{ url: string; status: number }> = [];
  page.on('response', response => {
    if (response.url().includes('/voice-cache/') && response.url().endsWith('.mp3')) {
      voiceResponses.push({ url: response.url(), status: response.status() });
    }
  });

  await page.evaluate(() => {
    window.localStorage.removeItem('kidGeniusAllowExternalVoice');
  });
  await completeKidSetup(page);

  await expect.poll(() => voiceResponses.filter(response => response.status === 200).length, {
    timeout: 10_000,
  }).toBeGreaterThan(0);
});

test('saved human voice cache is requested during a teacher-led math lesson', async ({ page }) => {
  const voiceResponses: Array<{ url: string; status: number }> = [];
  page.on('response', response => {
    if (response.url().includes('/voice-cache/') && response.url().endsWith('.mp3')) {
      voiceResponses.push({ url: response.url(), status: response.status() });
    }
  });

  await completeKidSetup(page);
  await page.evaluate(() => {
    window.localStorage.removeItem('kidGeniusAllowExternalVoice');
  });

  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);

  await expect.poll(() => voiceResponses.filter(response => response.status === 200).length, {
    timeout: 10_000,
  }).toBeGreaterThan(0);
});

test('reading room completion creates reward and parent-visible journal proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-READING').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Reading Coach')).toBeVisible();

  for (let round = 0; round < 6; round += 1) {
    await page.locator('[data-testid="reading-answer-option"][data-reading-correct="true"]').click();
    if (round < 5) {
      await expect(page.getByText('Great Job!')).toBeVisible();
      await expect(page.getByText('Great Job!')).toBeHidden({ timeout: 5_000 });
    }
  }

  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 7_500 });
  await page.getByRole('button', { name: /What strategy worked/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
  await page.getByRole('button', { name: 'Next Class', exact: true }).click();
  await expect(page.getByTestId('school-day-tracker')).toContainText('Period 1: Reading');
  await expect(page.getByTestId('school-day-tracker')).toContainText('Mastered');
  const nextPeriodButton = page.getByRole('button', { name: /2 Now Period 2: Speech & Language/i });
  await expect(nextPeriodButton).toBeEnabled();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('Learning Journal')).toBeVisible();
  await expect(page.getByText('What strategy worked?').first()).toBeVisible();
});

test('art studio finish review completes the room and creates journal proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.evaluate(() => {
    const originalSetInterval = window.setInterval;
    window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: any[]) => (
      originalSetInterval(handler, Math.min(Number(timeout) || 1, 1), ...args)
    )) as typeof window.setInterval;
  });
  await page.getByTestId('room-card-ART').click();
  await startTeacherLesson(page);

  await expect(page.getByText('Creative Studio Mission')).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: /Finish artwork/i }).click();
  await expect(page.getByText(/Almost ready/i)).toBeVisible();

  const canvas = page.locator('canvas');
  for (let stroke = 0; stroke < 24; stroke += 1) {
    await canvas.click({ position: { x: 80 + (stroke % 6) * 24, y: 100 + Math.floor(stroke / 6) * 24 } });
  }

  await expect(page.getByText('Timed studio steps: 4/4')).toBeVisible({ timeout: 10_000 });

  await page.getByRole('button', { name: 'I can explain my choice' }).click();
  await page.getByRole('button', { name: /Finish artwork/i }).click();
  await expect(page.getByText(/100\/100 studio score/i)).toBeVisible();
  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 7_500 });
  await page.getByRole('button', { name: /Teach it back/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
});

test('arcade completion creates reward and parent-visible journal proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByRole('button', { name: /Game Arcade/i }).click();
  await expect(page.getByRole('heading', { name: 'Game Arcade' })).toBeVisible();
  await page.getByRole('button', { name: /Number Dash/i }).click();

  for (let round = 0; round < 3; round += 1) {
    await page.locator('[data-testid="arcade-answer-option"][data-arcade-correct="true"]').click();
    if (round < 2) {
      await expect(page.getByText(/New round loading/i)).toBeVisible();
      await expect(page.locator('[data-testid="arcade-answer-option"][data-arcade-correct="true"]')).toBeEnabled({ timeout: 5_000 });
    }
  }

  await expect(page.getByText(/Number Dash complete/i)).toBeVisible();
  await page.getByLabel('Back to world map').click();
  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 7_500 });
  await page.getByRole('button', { name: /What was tricky/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
  await page.getByRole('button', { name: 'Next Class', exact: true }).click();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('Game Arcade Proof')).toBeVisible();
  await expect(page.getByText('Learning Journal')).toBeVisible();
  await expect(page.getByText('What was tricky?')).toBeVisible();
});

test('story time completion creates reward and parent-visible journal proof', async ({ page }) => {
  await completeKidSetup(page);
  await page.getByTestId('room-card-STORYBOOK').click();
  await startTeacherLesson(page);
  await expect(page.getByText('Story Library')).toBeVisible();
  await page.getByRole('button', { name: /Pip and the Puddle/i }).click();
  await expect(page.getByRole('heading', { name: 'Pip and the Puddle' })).toBeVisible();

  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    await page.getByLabel('Next story page').click();
  }

  await expect(page.getByText('Small moments can be joyful.')).toBeVisible();
  await page.getByRole('button', { name: 'I Finished Reading' }).click();
  await expect(page.getByRole('heading', { name: 'Story Check' })).toBeVisible();
  await page.getByRole('button', { name: /Pip puts on tiny yellow boots/i }).click();
  await expect(page.getByText('Correct. Nice evidence.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Story Check' })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /Small moments can be joyful/i }).click();
  await expect(page.getByText('Learning Reflection')).toBeVisible({ timeout: 7_500 });
  await page.getByRole('button', { name: /Teach it back/i }).click();
  await expect(page.getByText('Saved for parent review')).toBeVisible();
  await page.getByRole('button', { name: 'Next Book', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Nora Finds a Nest|Story Library/i })).toBeVisible();
  await page.getByLabel('Back to story library').click();
  await page.getByLabel('Back to world map').click();

  await page.getByTitle('Settings').click();
  await page.getByLabel('Parent PIN').fill(PARENT_PIN);
  await page.getByRole('button', { name: 'Unlock Parent Dashboard' }).click();
  await expect(page.getByText('Learning Journal')).toBeVisible();
  await expect(page.getByText('Teach it back')).toBeVisible();
});
