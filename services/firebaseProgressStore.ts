import {
  doc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import type { ChildProfile, UserProgress } from '../types';
import { getFirebaseServices } from './firebaseClient';

export interface FamilySyncContext {
  familyId: string;
  childId: string;
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
