import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { GradeLevel, type ArcadeProgress, type ChildProfile, type DailyStats, type UserProgress } from '../types';
import { getFirebaseServices } from './firebaseClient';

export interface FamilySyncContext {
  familyId: string;
  childId: string;
}

export interface CloudChildProgressSnapshot {
  profile: ChildProfile;
  progressPatch: Partial<UserProgress>;
}

export const getFirebaseSyncStatus = () => {
  const services = getFirebaseServices();
  return {
    configured: Boolean(services),
    readyForCloudSync: Boolean(services?.auth.currentUser),
    uid: services?.auth.currentUser?.uid || null,
  };
};

const ensureFamilyDocument = async (
  db: Firestore,
  context: FamilySyncContext,
  parentUid: string
) => {
  const familyRef = doc(db, 'families', context.familyId);
  await setDoc(familyRef, {
    parentUids: [parentUid],
    cloudSyncConsent: true,
    cloudSyncConsentAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

const writeProgressSnapshot = async (
  db: Firestore,
  context: FamilySyncContext,
  progress: UserProgress,
  profile?: ChildProfile
) => {
  const childRef = doc(db, 'families', context.familyId, 'children', context.childId);
  await setDoc(childRef, {
    displayName: profile?.name || progress.childName || 'Learner',
    grade: profile?.grade || progress.currentGrade,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const progressRef = doc(childRef, 'progress', 'latest');
  await setDoc(progressRef, {
    updatedAt: serverTimestamp(),
    currentGrade: progress.currentGrade,
    currentLevel: progress.currentLevel,
    weeklyGoalMinutes: progress.weeklyGoalMinutes,
    dailySessionLimitMinutes: progress.dailySessionLimitMinutes,
    scores: {
      math: progress.mathScore,
      reading: progress.readingScore,
      science: progress.scienceScore,
      geography: progress.geographyScore,
      coding: progress.codingScore,
      language: progress.languageScore,
      storybook: progress.storybookScore || 0,
      music: progress.musicScore || 0,
    },
    completedUnitIds: progress.completedUnitIds || [],
    unitPracticeCounts: progress.unitPracticeCounts || {},
    arcadeProgress: progress.arcadeProgress,
    dailyStats: progress.dailyStats || [],
  }, { merge: true });
};

const isGradeLevel = (value: unknown): value is GradeLevel => (
  typeof value === 'string' && Object.values(GradeLevel).includes(value as GradeLevel)
);

const toNumber = (value: unknown, fallback = 0) => (
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
);

const toOptionalNumber = (value: unknown) => (
  typeof value === 'number' && Number.isFinite(value) ? value : undefined
);

const toStringArray = (value: unknown) => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
);

const toDailyStats = (value: unknown): DailyStats[] => (
  Array.isArray(value) ? value.filter((item): item is DailyStats => (
    Boolean(item)
    && typeof item === 'object'
    && typeof (item as DailyStats).date === 'string'
  )) : []
);

const toUnitPracticeCounts = (value: unknown) => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    )
    : {}
);

const toArcadeProgress = (value: unknown): Partial<ArcadeProgress> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const source = value as Partial<ArcadeProgress>;
  return {
    totalWins: toNumber(source.totalWins),
    bestCombo: toNumber(source.bestCombo),
    lastPlayedAt: toNumber(source.lastPlayedAt),
    dailyChallengeDate: typeof source.dailyChallengeDate === 'string' ? source.dailyChallengeDate : '',
    dailyChallengeWins: toNumber(source.dailyChallengeWins),
    gameWins: source.gameWins && typeof source.gameWins === 'object' && !Array.isArray(source.gameWins)
      ? Object.fromEntries(Object.entries(source.gameWins).filter(([, count]) => typeof count === 'number'))
      : {},
    masteredGameIds: toStringArray(source.masteredGameIds),
  };
};

const readProgressSnapshot = async (
  db: Firestore,
  familyId: string,
  childId: string,
  profile: ChildProfile
): Promise<CloudChildProgressSnapshot> => {
  const progressRef = doc(db, 'families', familyId, 'children', childId, 'progress', 'latest');
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    return { profile, progressPatch: {} };
  }

  const data = progressSnap.data();
  const scores = data.scores && typeof data.scores === 'object' ? data.scores as Record<string, unknown> : {};
  const grade = isGradeLevel(data.currentGrade) ? data.currentGrade : profile.grade;
  const progressPatch: Partial<UserProgress> = {
    currentGrade: grade,
    mathScore: toNumber(scores.math),
    readingScore: toNumber(scores.reading),
    scienceScore: toNumber(scores.science),
    geographyScore: toNumber(scores.geography),
    codingScore: toNumber(scores.coding),
    languageScore: toNumber(scores.language),
    storybookScore: toNumber(scores.storybook),
    musicScore: toNumber(scores.music),
    completedUnitIds: toStringArray(data.completedUnitIds),
    unitPracticeCounts: toUnitPracticeCounts(data.unitPracticeCounts),
    arcadeProgress: toArcadeProgress(data.arcadeProgress) as ArcadeProgress,
    dailyStats: toDailyStats(data.dailyStats),
  };

  const currentLevel = toOptionalNumber(data.currentLevel);
  const weeklyGoalMinutes = toOptionalNumber(data.weeklyGoalMinutes);
  const dailySessionLimitMinutes = toOptionalNumber(data.dailySessionLimitMinutes);
  if (currentLevel) progressPatch.currentLevel = currentLevel;
  if (weeklyGoalMinutes) progressPatch.weeklyGoalMinutes = weeklyGoalMinutes;
  if (dailySessionLimitMinutes) progressPatch.dailySessionLimitMinutes = dailySessionLimitMinutes;

  return {
    profile: {
      ...profile,
      grade,
    },
    progressPatch,
  };
};

export const syncProgressToFirebase = async (
  context: FamilySyncContext,
  progress: UserProgress,
  profile?: ChildProfile
) => {
  const services = getFirebaseServices();
  if (!services?.auth.currentUser) {
    return { ok: false, reason: 'Firebase is not configured or the parent is not signed in.' };
  }

  await ensureFamilyDocument(services.db, context, services.auth.currentUser.uid);
  await writeProgressSnapshot(services.db, context, progress, profile);
  return { ok: true };
};

export const loadFamilyProgressFromFirebase = async (
  familyId: string
): Promise<{ ok: true; children: CloudChildProgressSnapshot[] } | { ok: false; reason: string }> => {
  const services = getFirebaseServices();
  if (!services?.auth.currentUser) {
    return { ok: false, reason: 'Firebase is not configured or the parent is not signed in.' };
  }

  const familyRef = doc(services.db, 'families', familyId);
  const familySnap = await getDoc(familyRef);
  if (!familySnap.exists()) {
    return { ok: true, children: [] };
  }

  const childrenRef = collection(services.db, 'families', familyId, 'children');
  const childrenSnap = await getDocs(childrenRef);
  const children = await Promise.all(childrenSnap.docs.map(async childDoc => {
    const childData = childDoc.data();
    const grade = isGradeLevel(childData.grade) ? childData.grade : GradeLevel.KINDERGARTEN;
    const profile: ChildProfile = {
      id: childDoc.id,
      name: typeof childData.displayName === 'string' && childData.displayName.trim()
        ? childData.displayName.trim()
        : 'Learner',
      grade,
      createdAt: toNumber(childData.createdAt, Date.now()),
      lastActiveAt: Date.now(),
    };

    return readProgressSnapshot(services.db, familyId, childDoc.id, profile);
  }));

  return { ok: true, children };
};
