import { MASTERED_PRACTICE_TARGET } from './learningConstants';
import { GradeLevel, RoomType, type AssignmentAttempt, type DailyAssignmentItem, type DailyAssignmentSet, type UserProgress } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_REPEAT_WINDOW_DAYS = 14;
const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7] as const;

export interface AssignmentCandidate {
  questionId: string;
  room: RoomType;
  grade: GradeLevel;
  unitId?: string;
  skill: string;
  prompt: string;
}

export interface RecordAssignmentAttemptInput extends AssignmentCandidate {
  correct: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  timeSpentMs?: number;
}

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getQuestionKey = (room: RoomType, rawId: string) => `${room}:${rawId}`;

export const wasQuestionSeenRecently = (
  progress: Pick<UserProgress, 'questionSeenAt'>,
  questionId: string,
  now = Date.now(),
  repeatWindowDays = RECENT_REPEAT_WINDOW_DAYS
) => {
  const seenAt = progress.questionSeenAt?.[questionId] || 0;
  return seenAt > 0 && now - seenAt < repeatWindowDays * DAY_MS;
};

export const chooseSpacedCandidates = (
  progress: Pick<UserProgress, 'questionSeenAt'>,
  candidates: AssignmentCandidate[],
  count = MASTERED_PRACTICE_TARGET,
  now = Date.now()
) => {
  const uniqueCandidates = Array.from(
    new Map(candidates.map(candidate => [candidate.questionId, candidate])).values()
  );
  const fresh = uniqueCandidates.filter(candidate => !wasQuestionSeenRecently(progress, candidate.questionId, now));
  const review = uniqueCandidates.filter(candidate => wasQuestionSeenRecently(progress, candidate.questionId, now));
  return [...fresh, ...review].slice(0, count);
};

export const ensureDailyAssignmentSet = (
  progress: UserProgress,
  candidates: AssignmentCandidate[],
  dateKey = getLocalDateKey()
): DailyAssignmentSet => {
  const existing = progress.dailyAssignmentSets?.[dateKey];
  if (existing?.items?.length) {
    return existing;
  }

  const now = Date.now();
  const selected = chooseSpacedCandidates(progress, candidates, MASTERED_PRACTICE_TARGET, now);
  return {
    date: dateKey,
    childId: progress.memberId,
    grade: progress.currentGrade,
    items: selected.map((candidate, index): DailyAssignmentItem => ({
      assignmentId: `${dateKey}-${candidate.room.toLowerCase()}-${index + 1}`,
      questionId: candidate.questionId,
      room: candidate.room,
      grade: candidate.grade,
      unitId: candidate.unitId,
      skill: candidate.skill,
      reviewKind: wasQuestionSeenRecently(progress, candidate.questionId, now) ? 'review' : 'new',
      plannedAt: now,
    })),
  };
};

export const recordAssignmentAttempt = (
  progress: UserProgress,
  input: RecordAssignmentAttemptInput
): UserProgress => {
  const now = Date.now();
  const dateKey = getLocalDateKey(new Date(now));
  const existingSet = progress.dailyAssignmentSets?.[dateKey];
  const assignmentId = existingSet?.items.find(item => item.questionId === input.questionId && !item.completedAt)?.assignmentId
    || `${dateKey}-${input.room.toLowerCase()}-${now}`;
  const reviewKind = wasQuestionSeenRecently(progress, input.questionId, now) ? 'review' : 'new';
  const attempt: AssignmentAttempt = {
    id: `attempt-${now}-${Math.random().toString(36).slice(2, 8)}`,
    assignmentId,
    questionId: input.questionId,
    room: input.room,
    grade: input.grade,
    unitId: input.unitId,
    skill: input.skill,
    prompt: input.prompt,
    correct: input.correct,
    selectedAnswer: input.selectedAnswer,
    correctAnswer: input.correctAnswer,
    createdAt: now,
    timeSpentMs: input.timeSpentMs,
    reviewKind,
  };

  const updatedDailySet = existingSet
    ? {
      ...existingSet,
      items: existingSet.items.map(item => (
        item.assignmentId === assignmentId || item.questionId === input.questionId
          ? { ...item, completedAt: item.completedAt || now }
          : item
      )),
    }
    : undefined;

  return {
    ...progress,
    assignmentAttempts: [attempt, ...(progress.assignmentAttempts || [])].slice(0, 2000),
    dailyAssignmentSets: {
      ...(progress.dailyAssignmentSets || {}),
      ...(updatedDailySet ? { [dateKey]: updatedDailySet } : {}),
    },
    questionSeenAt: {
      ...(progress.questionSeenAt || {}),
      [input.questionId]: now,
    },
  };
};

export interface MasteryPeriodSummary {
  attemptsReviewed: number;
  correctCount: number;
  starsEarned: number;
  accuracyPercent: number;
  missedSkills: string[];
  reviewQuestionIds: string[];
  nextRecommendedLesson: string;
  parentExplanation: string;
}

const normalizeSkillLabel = (skill: string) => skill.trim() || 'current skill';

export const getMasteryPeriodSummary = (
  progress: Pick<UserProgress, 'assignmentAttempts'>,
  room?: RoomType,
  targetCount = MASTERED_PRACTICE_TARGET
): MasteryPeriodSummary => {
  const attempts = [...(progress.assignmentAttempts || [])]
    .filter(attempt => !room || attempt.room === room)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, targetCount);
  const correctCount = attempts.filter(attempt => attempt.correct).length;
  const missedAttempts = attempts.filter(attempt => !attempt.correct);
  const missedSkills = Array.from(new Set(missedAttempts.map(attempt => normalizeSkillLabel(attempt.skill)))).slice(0, 3);
  const reviewQuestionIds = missedAttempts.map(attempt => attempt.questionId).slice(0, 6);
  const accuracyPercent = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;
  const starsEarned = attempts.length === 0
    ? 0
    : accuracyPercent >= 90
      ? 3
      : accuracyPercent >= 70
        ? 2
        : 1;
  const nextRecommendedLesson = missedSkills.length > 0
    ? `Review ${missedSkills[0]} before the next new lesson.`
    : attempts.length >= targetCount
      ? 'Move to the next lesson and keep one quick review question.'
      : `Finish ${targetCount - attempts.length} more question${targetCount - attempts.length === 1 ? '' : 's'} to complete this period.`;
  const parentExplanation = missedSkills.length > 0
    ? `Review is ready for ${missedSkills.join(', ')}. Missed questions should come back before harder work.`
    : attempts.length >= targetCount
      ? 'This period is ready for new learning with light spaced review.'
      : 'This period is still collecting enough evidence for a full mastery summary.';

  return {
    attemptsReviewed: attempts.length,
    correctCount,
    starsEarned,
    accuracyPercent,
    missedSkills,
    reviewQuestionIds,
    nextRecommendedLesson,
    parentExplanation,
  };
};

export interface SpacedReviewItem {
  attempt: AssignmentAttempt;
  stage: number;
  dueAt: number;
  status: 'ready' | 'scheduled';
  remainingReviews: number;
}

export const buildSpacedReviewSchedule = (
  attempts: AssignmentAttempt[],
  now = Date.now()
): SpacedReviewItem[] => {
  const attemptsByQuestion = new Map<string, AssignmentAttempt[]>();
  attempts
    .filter(attempt => attempt.room !== RoomType.STUDY)
    .forEach((attempt) => {
      const questionAttempts = attemptsByQuestion.get(attempt.questionId) || [];
      questionAttempts.push(attempt);
      attemptsByQuestion.set(attempt.questionId, questionAttempts);
    });

  return Array.from(attemptsByQuestion.values())
    .map((questionAttempts): SpacedReviewItem | null => {
      const ordered = [...questionAttempts].sort((a, b) => a.createdAt - b.createdAt);
      let latestMissIndex = -1;
      ordered.forEach((attempt, index) => {
        if (!attempt.correct) latestMissIndex = index;
      });
      if (latestMissIndex < 0) return null;

      const latestMiss = ordered[latestMissIndex];
      const successfulReviews = ordered.slice(latestMissIndex + 1).filter(attempt => attempt.correct);
      const stage = successfulReviews.length;
      if (stage >= REVIEW_INTERVAL_DAYS.length) return null;

      const latestEvidenceAt = successfulReviews.at(-1)?.createdAt || latestMiss.createdAt;
      const dueAt = latestEvidenceAt + REVIEW_INTERVAL_DAYS[stage] * DAY_MS;
      return {
        attempt: latestMiss,
        stage,
        dueAt,
        status: dueAt <= now ? 'ready' : 'scheduled',
        remainingReviews: REVIEW_INTERVAL_DAYS.length - stage,
      };
    })
    .filter((item): item is SpacedReviewItem => Boolean(item))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'ready' ? -1 : 1;
      return a.dueAt - b.dueAt;
    });
};
