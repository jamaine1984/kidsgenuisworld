import { MASTERED_PRACTICE_TARGET } from './learningConstants';
import { GradeLevel, RoomType, type AssignmentAttempt, type DailyAssignmentItem, type DailyAssignmentSet, type UserProgress } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_REPEAT_WINDOW_DAYS = 14;

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

