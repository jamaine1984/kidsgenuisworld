import { expect, test } from '@playwright/test';
import { GradeLevel, RoomType } from '../types';
import { generateEarlyMathProblem } from '../services/curriculum/earlyMath';
import { generateEarlyLiteracyQuestion } from '../services/curriculum/earlyLiteracy';
import { generateEarlySpeechQuestion } from '../services/curriculum/earlySpeech';
import { generateEarlyScienceQuestion } from '../services/curriculum/earlyScience';
import { generateEarlyWorldQuestion } from '../services/curriculum/earlyWorld';
import { generateEarlyCodingQuestion } from '../services/curriculum/earlyCoding';
import { generateEarlyMusicQuestion } from '../services/curriculum/earlyMusic';
import { generateEarlyPuzzleQuestion } from '../services/curriculum/earlyPuzzle';
import { generateElementaryMathProblem } from '../services/curriculum/elementaryMath';
import { generateUpperElementaryMathProblem } from '../services/curriculum/upperElementaryMath';
import { generateElementaryLiteracyQuestion } from '../services/curriculum/elementaryLiteracy';
import { generateUpperElementaryLiteracyQuestion } from '../services/curriculum/upperElementaryLiteracy';
import { generateElementaryScienceQuestion } from '../services/curriculum/elementaryScience';
import { generateUpperElementaryScienceQuestion } from '../services/curriculum/upperElementaryScience';
import { generateElementarySpeechQuestion } from '../services/curriculum/elementarySpeech';
import { generateUpperElementarySpeechQuestion } from '../services/curriculum/upperElementarySpeech';
import { generateElementaryWorldQuestion } from '../services/curriculum/elementaryWorld';
import { generateUpperElementaryWorldQuestion } from '../services/curriculum/upperElementaryWorld';
import { generateElementaryCodingQuestion } from '../services/curriculum/elementaryCoding';
import { generateUpperElementaryCodingQuestion } from '../services/curriculum/upperElementaryCoding';
import { generateElementaryMusicQuestion } from '../services/curriculum/elementaryMusic';
import { generateUpperElementaryMusicQuestion } from '../services/curriculum/upperElementaryMusic';
import { generateElementaryPuzzleQuestion } from '../services/curriculum/elementaryPuzzle';
import { generateUpperElementaryPuzzleQuestion } from '../services/curriculum/upperElementaryPuzzle';
import { ALL_ART_MISSIONS } from '../components/ArtRoom';
import { buildDailyLibraryStories, buildStoryQuiz, getStoryQuizTargetCount } from '../components/StoryBook';
import { EARLY_YEARS_SCHOOL_YEAR } from '../services/curriculum/yearPlan';
import { completeParentSetup, resetApp, startTeacherLesson } from './helpers';
import { buildSpacedReviewSchedule } from '../services/assignmentTracking';

const learningRooms = [
  RoomType.MATH,
  RoomType.READING,
  RoomType.LANGUAGE,
  RoomType.SCIENCE,
  RoomType.GEOGRAPHY,
  RoomType.CODING,
  RoomType.STORYBOOK,
  RoomType.PUZZLE,
  RoomType.ART,
  RoomType.MUSIC,
];

test('missed answers return on a 1, 3, and 7 day spaced-review cycle', () => {
  const day = 24 * 60 * 60 * 1000;
  const start = new Date('2026-01-05T12:00:00Z').getTime();
  const makeAttempt = (id: string, correct: boolean, createdAt: number) => ({
    id,
    assignmentId: `assignment-${id}`,
    questionId: 'MATH:fractions-1',
    room: RoomType.MATH,
    grade: GradeLevel.FIFTH_GRADE,
    skill: 'equivalent fractions',
    prompt: 'Which fraction equals one half?',
    correct,
    selectedAnswer: correct ? '2/4' : '1/3',
    correctAnswer: '2/4',
    createdAt,
    reviewKind: correct ? 'review' as const : 'new' as const,
  });

  const miss = makeAttempt('miss', false, start);
  expect(buildSpacedReviewSchedule([miss], start)[0].status).toBe('ready');

  const firstSuccess = makeAttempt('success-1', true, start + 10_000);
  const afterFirst = buildSpacedReviewSchedule([miss, firstSuccess], start + 20_000)[0];
  expect(afterFirst.status).toBe('scheduled');
  expect(afterFirst.dueAt).toBe(start + 10_000 + day);

  const secondSuccess = makeAttempt('success-2', true, afterFirst.dueAt);
  const afterSecond = buildSpacedReviewSchedule([miss, firstSuccess, secondSuccess], afterFirst.dueAt)[0];
  expect(afterSecond.dueAt).toBe(secondSuccess.createdAt + 3 * day);

  const thirdSuccess = makeAttempt('success-3', true, afterSecond.dueAt);
  const afterThird = buildSpacedReviewSchedule([miss, firstSuccess, secondSuccess, thirdSuccess], afterSecond.dueAt)[0];
  expect(afterThird.dueAt).toBe(thirdSuccess.createdAt + 7 * day);

  const fourthSuccess = makeAttempt('success-4', true, afterThird.dueAt);
  expect(buildSpacedReviewSchedule([miss, firstSuccess, secondSuccess, thirdSuccess, fourthSuccess], afterThird.dueAt)).toHaveLength(0);
});

test('Pre-K and Kindergarten each have 36 weeks in every classroom', () => {
  for (const grade of [GradeLevel.PRE_K, GradeLevel.KINDERGARTEN]) {
    const plan = EARLY_YEARS_SCHOOL_YEAR[grade];
    expect(plan).toHaveLength(learningRooms.length * 36);

    for (const room of learningRooms) {
      const roomPlan = plan.filter(item => item.room === room);
      expect(roomPlan).toHaveLength(36);
      expect(new Set(roomPlan.map(item => item.week)).size).toBe(36);
      expect(roomPlan.filter(item => item.phase === 'foundation')).toHaveLength(18);
      expect(roomPlan.filter(item => item.phase === 'application')).toHaveLength(18);
      expect(roomPlan.every(item => item.topic.standard.length > 0)).toBeTruthy();
      expect(roomPlan.every(item => item.masteryCheck.includes('six-item') || item.phase === 'foundation')).toBeTruthy();
    }
  }
});

test('early math produces complete visual multiple-choice problems', () => {
  for (const level of [1, 2] as const) {
    for (let step = 0; step < 72; step += 1) {
      const problem = generateEarlyMathProblem(level, step);
      expect(problem.visualModel).toBeTruthy();
      expect(problem.options).toHaveLength(4);
      expect(new Set(problem.options.map(String)).size).toBe(4);
      expect(problem.options.map(String)).toContain(String(problem.answer));
      expect(problem.question).toMatch(/^(Warm-up|Teacher model|Try together|Try with less help|Spiral review|Exit ticket):/);
      expect(['multiplication', 'division', 'money', 'time', 'fraction']).not.toContain(problem.operation);
      expect(problem.explanation?.length || 0).toBeGreaterThan(20);
      expect(problem.skill?.length || 0).toBeGreaterThan(3);
    }
  }
});

test('Grades 1 and 2 math rotate through visual, grade-fit problem types', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    const modelKinds = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const problem = generateElementaryMathProblem(level, step);
      skills.add(problem.skill || '');
      modelKinds.add(problem.visualModel?.kind || '');
      expect(problem.options).toHaveLength(4);
      expect(new Set(problem.options.map(String)).size).toBe(4);
      expect(problem.options.map(String)).toContain(String(problem.answer));
      expect(problem.question).toMatch(/^(Warm-up|Teacher model|Try together|Try with less help|Spiral review|Exit ticket):/);
      expect(problem.visualModel).toBeTruthy();
      expect(problem.explanation?.length || 0).toBeGreaterThan(20);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
    expect(modelKinds.size).toBeGreaterThanOrEqual(6);
  }
});

test('Grades 3 through 5 math rotate through operations, fractions, geometry, data, and multi-step reasoning', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    const modelKinds = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const problem = generateUpperElementaryMathProblem(level, step);
      skills.add(problem.skill || '');
      modelKinds.add(problem.visualModel?.kind || '');
      expect(problem.options).toHaveLength(4);
      expect(new Set(problem.options.map(String)).size).toBe(4);
      expect(problem.options.map(String)).toContain(String(problem.answer));
      expect(problem.question).toMatch(/^(Warm-up|Teacher model|Try together|Try with less help|Spiral review|Exit ticket):/);
      expect(problem.visualModel).toBeTruthy();
      expect(problem.explanation?.length || 0).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
    expect(modelKinds.size).toBeGreaterThanOrEqual(6);
  }
});

test('early literacy mixes grade-fit phonics, vocabulary, and comprehension', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 120; step += 1) {
      const question = generateEarlyLiteracyQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.prompt).toMatch(/^(Warm-up|Teacher model|Try together|Try with less help|Spiral review|Exit ticket):/);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(7);
  }
});

test('Grades 1 and 2 reading rotate through phonics, fluency, vocabulary, and comprehension', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementaryLiteracyQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.prompt).toMatch(/^(Warm-up|Teacher model|Try together|Try with less help|Spiral review|Exit ticket):/);
      expect(question.focusText.length).toBeGreaterThan(1);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 reading rotate through morphology, vocabulary, fluency, evidence, structure, and synthesis', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementaryLiteracyQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.prompt).toMatch(/^(Warm-up|Teacher model|Try together|Try with less help|Spiral review|Exit ticket):/);
      expect(question.focusText.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(40);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('early speech mixes listening, conversation, directions, and vocabulary', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 72; step += 1) {
      const question = generateEarlySpeechQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.coachCue.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(8);
  }
});

test('Grades 1 and 2 speech rotate through grammar, listening, discussion, and presentation skills', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementarySpeechQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.focusText.length).toBeGreaterThan(5);
      expect(question.coachCue.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 speech rotate through listening, discussion, evidence, language, and presentation skills', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementarySpeechQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.focusText.length).toBeGreaterThan(15);
      expect(question.coachCue.length).toBeGreaterThan(35);
      expect(question.explanation.length).toBeGreaterThan(45);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('early science mixes observation, prediction, evidence, and explanation', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 72; step += 1) {
      const question = generateEarlyScienceQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.evidence.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(8);
  }
});

test('Grades 1 and 2 science rotate through physical, life, earth, and engineering investigations', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementaryScienceQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.observation.length).toBeGreaterThan(10);
      expect(question.evidence.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 science rotate through physical, life, Earth, space, engineering, variables, and evidence', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementaryScienceQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.observation.length).toBeGreaterThan(20);
      expect(question.evidence.length).toBeGreaterThan(35);
      expect(question.explanation.length).toBeGreaterThan(45);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('early world studies builds from familiar places into maps and communities', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 72; step += 1) {
      const question = generateEarlyWorldQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.mapClue.length).toBeGreaterThan(5);
      expect(question.explanation.length).toBeGreaterThan(20);
    }
    expect(skills.size).toBeGreaterThanOrEqual(8);
  }
});

test('Grades 1 and 2 world studies rotate through maps, civics, economics, history, and culture', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementaryWorldQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.mapClue.length).toBeGreaterThan(8);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 world studies rotate through geography, civics, economics, history, sources, and perspectives', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementaryWorldQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.mapClue.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(45);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('early coding mixes sequencing, movement, prediction, debugging, and repeats', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 72; step += 1) {
      const question = generateEarlyCodingQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.codeClue.length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(8);
  }
});

test('Grades 1 and 2 coding rotate through algorithms, loops, events, conditions, data, and debugging', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementaryCodingQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.codeClue.length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 coding cover algorithms, logic, data, debugging, testing, and digital citizenship', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementaryCodingQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.codeClue.length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(45);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('early music mixes pitch, tempo, beat, melody, rhythm, echo, and rests', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 72; step += 1) {
      const question = generateEarlyMusicQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.sampleNotes.length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(20);
    }
    expect(skills.size).toBeGreaterThanOrEqual(8);
  }
});

test('Grades 1 and 2 music rotate through pitch, rhythm, meter, form, and composition', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementaryMusicQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.sampleNotes.length).toBeGreaterThan(0);
      expect(question.musicClue.length).toBeGreaterThan(5);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 music cover notation, meter, intervals, form, ensembles, and composition', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementaryMusicQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.sampleNotes.length).toBeGreaterThan(0);
      expect(question.musicClue.length).toBeGreaterThan(8);
      expect(question.explanation.length).toBeGreaterThan(45);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('early strategy mixes matching, patterns, shapes, sorting, memory, and logic', () => {
  for (const level of [1, 2] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 72; step += 1) {
      const question = generateEarlyPuzzleQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.clueItems.length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(20);
    }
    expect(skills.size).toBeGreaterThanOrEqual(8);
  }
});

test('Grades 1 and 2 strategy rotate through patterns, analogies, spatial logic, constraints, and deduction', () => {
  for (const level of [3, 4] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 144; step += 1) {
      const question = generateElementaryPuzzleQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.clueItems.length).toBeGreaterThan(0);
      expect(question.clueText.length).toBeGreaterThan(8);
      expect(question.explanation.length).toBeGreaterThan(25);
    }
    expect(skills.size).toBeGreaterThanOrEqual(10);
  }
});

test('Grades 3 through 5 strategy covers constraints, spatial reasoning, probability, optimization, and proof', () => {
  for (const level of [5, 6, 7] as const) {
    const skills = new Set<string>();
    for (let step = 0; step < 180; step += 1) {
      const question = generateUpperElementaryPuzzleQuestion(level, step);
      skills.add(question.skill);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options.map(option => option.toLowerCase())).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.clueItems.length).toBeGreaterThan(0);
      expect(question.clueText.length).toBeGreaterThan(10);
      expect(question.explanation.length).toBeGreaterThan(45);
    }
    expect(skills.size).toBeGreaterThanOrEqual(12);
  }
});

test('every grade has a full school year of distinct teacher-led art missions', () => {
  for (let level = 1; level <= 7; level += 1) {
    const missions = ALL_ART_MISSIONS.filter(mission => mission.gradeLevel === level);
    expect(missions.length).toBeGreaterThanOrEqual(180);
    expect(new Set(missions.map(mission => mission.title)).size).toBe(missions.length);
    expect(missions.every(mission => mission.lessonSteps.length === 4)).toBeTruthy();
    expect(missions.every(mission => mission.checks.length === 4)).toBeTruthy();
    expect(missions.every(mission => mission.prompt.length > 25)).toBeTruthy();
  }
});

test('Grades 1 and 2 receive six fresh daily books with four-question comprehension checks', () => {
  for (const level of [3, 4]) {
    const stories = buildDailyLibraryStories(level);
    expect(stories).toHaveLength(6);
    expect(new Set(stories.map(story => story.id)).size).toBe(6);
    expect(new Set(stories.map(story => story.title)).size).toBe(6);
    expect(stories.every(story => story.gradeLevel === level)).toBeTruthy();
    expect(stories.every(story => story.pages.length >= 6)).toBeTruthy();
    expect(getStoryQuizTargetCount(level)).toBe(4);

    for (const story of stories) {
      const quiz = buildStoryQuiz(story, level);
      expect(quiz).toHaveLength(4);
      expect(quiz.every(question => question.options.length === 4)).toBeTruthy();
      expect(quiz.every(question => new Set(question.options).size === 4)).toBeTruthy();
      expect(quiz.every(question => question.options.includes(question.answer))).toBeTruthy();
    }
  }
});

test('Pre-K math classroom presents a visual teacher-led lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Learner');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await expect(page.getByTestId('daily-mission-card')).toBeVisible();

  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-math-model')).toBeVisible();
  await expect(page.getByText("Today's math focus")).toBeVisible();
  await expect(page.getByTestId('math-question')).toContainText('Warm-up:');
  await expect(page.locator('[data-testid="math-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-math-tablet.png'), fullPage: true });
});

test('First Grade math classroom presents a visual real-world lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('First Grade Mathematician');
  await page.getByRole('button', { name: /1st Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-math-model')).toBeVisible();
  await expect(page.getByText("Today's math focus")).toBeVisible();
  await expect(page.getByTestId('math-question')).toContainText('Warm-up:');
  await expect(page.locator('[data-testid="math-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade1-math-tablet.png'), fullPage: true });
});

test('Fifth Grade math classroom presents visual fractions, geometry, data, and multi-step reasoning', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Mathematician');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-MATH').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-math-model')).toBeVisible();
  await expect(page.getByText('5th Grade Math')).toBeVisible();
  await expect(page.getByTestId('math-question')).toContainText('Warm-up:');
  await expect(page.locator('[data-testid="math-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-math-tablet.png'), fullPage: true });
});

test('Pre-K reading classroom presents a visual literacy lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Reader');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-READING').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-reading-question')).toBeVisible();
  await expect(page.getByText('Reading Coach')).toBeVisible();
  await expect(page.locator('[data-testid="reading-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-reading-tablet.png'), fullPage: true });
});

test('First Grade reading classroom presents a teacher-led evidence lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('First Grade Reader');
  await page.getByRole('button', { name: /1st Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-READING').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-reading-question')).toBeVisible();
  await expect(page.getByText('Reading Coach')).toBeVisible();
  await expect(page.getByText('1st Grade Reading')).toBeVisible();
  await expect(page.locator('[data-testid="reading-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade1-reading-tablet.png'), fullPage: true });
});

test('Fifth Grade reading classroom presents morphology, evidence, structure, and synthesis', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Reader');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-READING').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-reading-question')).toBeVisible();
  await expect(page.getByText('Reading Coach')).toBeVisible();
  await expect(page.getByText('5th Grade Reading')).toBeVisible();
  await expect(page.locator('[data-testid="reading-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-reading-tablet.png'), fullPage: true });
});

test('Pre-K speech classroom presents a visual communication lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Speaker');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-LANGUAGE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-speech-question')).toBeVisible();
  await expect(page.getByText('Speaking Coach')).toBeVisible();
  await expect(page.locator('[data-testid="language-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-speech-tablet.png'), fullPage: true });
});

test('Second Grade speech classroom presents a discussion and presentation lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Second Grade Speaker');
  await page.getByRole('button', { name: /2nd Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-LANGUAGE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-speech-question')).toBeVisible();
  await expect(page.getByText('Speaking Coach')).toBeVisible();
  await expect(page.getByText('2nd Grade Speech & Language')).toBeVisible();
  await expect(page.locator('[data-testid="language-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade2-speech-tablet.png'), fullPage: true });
});

test('Fifth Grade speech classroom presents discussion, evidence, delivery, and audience skills', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Speaker');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-LANGUAGE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-speech-question')).toBeVisible();
  await expect(page.getByText('Speaking Coach')).toBeVisible();
  await expect(page.getByText('5th Grade Speech & Language')).toBeVisible();
  await expect(page.locator('[data-testid="language-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-speech-tablet.png'), fullPage: true });
});

test('Pre-K science classroom presents a visual investigation', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Scientist');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-science-question')).toBeVisible();
  await expect(page.getByTestId('early-science-scene')).toBeVisible();
  await expect(page.getByText('Science Coach')).toBeVisible();
  await expect(page.locator('[data-testid="science-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-science-tablet.png'), fullPage: true });
});

test('Second Grade science classroom presents an evidence investigation', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Second Grade Scientist');
  await page.getByRole('button', { name: /2nd Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-science-question')).toBeVisible();
  await expect(page.getByTestId('early-science-scene')).toBeVisible();
  await expect(page.getByText('2nd Grade Science Lab')).toBeVisible();
  await expect(page.locator('[data-testid="science-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade2-science-tablet.png'), fullPage: true });
});

test('Fifth Grade science classroom presents matter, ecosystems, Earth systems, space, and engineering evidence', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Scientist');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-SCIENCE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-science-question')).toBeVisible();
  await expect(page.getByTestId('early-science-scene')).toBeVisible();
  await expect(page.getByText('5th Grade Science Lab')).toBeVisible();
  await expect(page.locator('[data-testid="science-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-science-tablet.png'), fullPage: true });
});

test('Pre-K world studies classroom presents a visual map mission', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Explorer');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-GEOGRAPHY').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-world-question')).toBeVisible();
  await expect(page.getByTestId('early-world-scene')).toBeVisible();
  await expect(page.getByText('World Studies Coach')).toBeVisible();
  await expect(page.locator('[data-testid="world-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-world-tablet.png'), fullPage: true });
});

test('First Grade world studies presents a map, civics, and community lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('First Grade Explorer');
  await page.getByRole('button', { name: /1st Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-GEOGRAPHY').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-world-question')).toBeVisible();
  await expect(page.getByTestId('early-world-scene')).toBeVisible();
  await expect(page.getByText('1st Grade World Studies')).toBeVisible();
  await expect(page.locator('[data-testid="world-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade1-world-tablet.png'), fullPage: true });
});

test('Fifth Grade world studies presents geography, civics, economics, history, and source analysis', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Historian');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-GEOGRAPHY').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-world-question')).toBeVisible();
  await expect(page.getByTestId('early-world-scene')).toBeVisible();
  await expect(page.getByText('5th Grade World Studies')).toBeVisible();
  await expect(page.locator('[data-testid="world-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-world-tablet.png'), fullPage: true });
});

test('Pre-K coding classroom presents a visual code mission', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Coder');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-CODING').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-coding-question')).toBeVisible();
  await expect(page.getByText('Coding Coach')).toBeVisible();
  await expect(page.locator('[data-testid="coding-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-coding-tablet.png'), fullPage: true });
});

test('Second Grade coding classroom presents loops, conditions, data, and debugging', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Second Grade Coder');
  await page.getByRole('button', { name: /2nd Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-CODING').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-coding-question')).toBeVisible();
  await expect(page.getByText('2nd Grade Coding Lab')).toBeVisible();
  await expect(page.locator('[data-testid="coding-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade2-coding-tablet.png'), fullPage: true });
});

test('Fifth Grade coding classroom presents algorithms, data, testing, and cybersecurity', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Coder');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-CODING').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-coding-question')).toBeVisible();
  await expect(page.getByText('5th Grade Coding Lab')).toBeVisible();
  await expect(page.locator('[data-testid="coding-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-coding-tablet.png'), fullPage: true });
});

test('Pre-K music classroom presents a visual listening lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Musician');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-MUSIC').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-music-question')).toBeVisible();
  await expect(page.getByTestId('early-music-scene')).toBeVisible();
  await expect(page.getByText('Music Coach')).toBeVisible();
  await expect(page.locator('[data-testid="music-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-music-tablet.png'), fullPage: true });
});

test('Second Grade music classroom presents meter, form, rhythm, and composition', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Second Grade Musician');
  await page.getByRole('button', { name: /2nd Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-MUSIC').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-music-question')).toBeVisible();
  await expect(page.getByTestId('early-music-scene')).toBeVisible();
  await expect(page.getByText('2nd Grade Music Room')).toBeVisible();
  await expect(page.locator('[data-testid="music-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade2-music-tablet.png'), fullPage: true });
});

test('Fifth Grade music classroom presents theory, listening, analysis, and composition', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Musician');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-MUSIC').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-music-question')).toBeVisible();
  await expect(page.getByTestId('early-music-scene')).toBeVisible();
  await expect(page.getByText('5th Grade Music Room')).toBeVisible();
  await expect(page.locator('[data-testid="music-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-music-tablet.png'), fullPage: true });
});

test('Pre-K strategy classroom presents a visual puzzle lesson', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Thinker');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-PUZZLE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-puzzle-question')).toBeVisible();
  await expect(page.getByTestId('early-puzzle-scene')).toBeVisible();
  await expect(page.getByText('Strategy Coach')).toBeVisible();
  await expect(page.locator('[data-testid="puzzle-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('prek-puzzle-tablet.png'), fullPage: true });
});

test('Second Grade strategy classroom presents multi-step logic and deduction', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Second Grade Thinker');
  await page.getByRole('button', { name: /2nd Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-PUZZLE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-puzzle-question')).toBeVisible();
  await expect(page.getByTestId('early-puzzle-scene')).toBeVisible();
  await expect(page.getByText('2nd Grade Strategy Gym')).toBeVisible();
  await expect(page.locator('[data-testid="puzzle-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade2-puzzle-tablet.png'), fullPage: true });
});

test('Fifth Grade strategy classroom presents deduction, probability, optimization, and proof', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Fifth Grade Strategist');
  await page.getByRole('button', { name: /5th Grade/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-PUZZLE').click();
  await startTeacherLesson(page);

  await expect(page.getByTestId('early-puzzle-question')).toBeVisible();
  await expect(page.getByTestId('early-puzzle-scene')).toBeVisible();
  await expect(page.getByText('5th Grade Strategy Gym')).toBeVisible();
  await expect(page.locator('[data-testid="puzzle-answer-option"]')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath('grade5-puzzle-tablet.png'), fullPage: true });
});

test('Pre-K library presents a guided six-book reading path', async ({ page }, testInfo) => {
  await resetApp(page);
  await completeParentSetup(page);
  await page.getByLabel('Child name').fill('Pre-K Reader');
  await page.getByRole('button', { name: /Pre-K/i }).click();
  await page.getByRole('button', { name: /Puppy/i }).click();
  await page.getByPlaceholder('Enter a name...').fill('Scout');
  await page.getByRole('button', { name: /Let's Go/i }).click();
  await page.getByTestId('room-card-STORYBOOK').click();
  await startTeacherLesson(page);

  await expect(page.getByText('School Library')).toBeVisible();
  await expect(page.getByText("Today's six books")).toBeVisible();
  await expect(page.getByTestId('story-book-option')).toHaveCount(6);
  await expect(page.getByTestId('story-book-option').first()).toBeEnabled();
  await expect(page.getByTestId('story-book-option').nth(1)).toBeDisabled();
  await expect(page.getByTestId('free-reading-book-option').first()).toBeDisabled();
  await page.getByText('More books for curious readers').scrollIntoViewIfNeeded();
  await expect(page.getByText('More books for curious readers')).toBeVisible();
  await page.getByText('School Library').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('prek-library-tablet.png'), fullPage: true });
});
