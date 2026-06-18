import React, { Suspense, lazy, useState, useEffect } from 'react';
import { WorldMap } from './components/WorldMap';
import { Guide } from './components/Guide';
import { Dashboard } from './components/Dashboard';
import { VirtualPetPanel, PetSelection } from './components/VirtualPet';
import { AchievementsPanel, AchievementUnlockToast } from './components/AchievementsPanel';
import { ParentDashboard } from './components/ParentDashboard';
import { LegalInfo, type LegalPageType } from './components/LegalInfo';
import { InstallAppButton } from './components/InstallAppButton';
import { TeacherRoomCoach } from './components/TeacherRoomCoach';
import { LessonErrorBoundary } from './components/LessonErrorBoundary';
import { getUnitsForGrade } from './services/curriculum';
import {
  RoomType,
  UserProgress,
  GradeLevel,
  STICKER_COLLECTION,
  SEASONAL_STICKERS,
  Holiday,
  VirtualPet,
  Achievement,
  ACHIEVEMENTS,
  AccessibilitySettings,
  PrivacySettings,
  DailyStats,
  LearningJournalEntry,
  ChildProfile,
  createDefaultProgress,
  DEFAULT_LEARNING_PROFILE,
  DEFAULT_ACCESSIBILITY,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_ARCADE_PROGRESS
} from './types';
import { resumeAudioContext, playSuccess, speak, speakAsync, stopSpeaking, setNarrationContext, setSpeechPreferences } from './services/audioService';
import { updateSkillMetrics, updateLearningProfile, getEncouragingMessage } from './services/adaptiveLearning';
import {
  createParentAccount,
  getCurrentParentSession,
  signInParentAccount,
  signInParentWithGoogle,
  signOutParentAccount,
  subscribeParentCloudSession,
  type ParentCloudSession,
} from './services/firebaseParentAuth';
import { loadFamilyProgressFromFirebase, syncProgressToFirebase, type CloudChildProgressSnapshot } from './services/firebaseProgressStore';
import { createStripeCheckoutUrl, getStripeBillingAccess, openStripeBillingPortal, type StripeBillingPlan } from './services/stripeBilling';
import { getAchievementProgress } from './services/achievements';
import { logDiagnosticEvent } from './services/diagnosticsService';
import {
  AI_TEACHER,
  MASTERED_PRACTICE_TARGET,
  SCHOOL_LESSON_PHASES,
  buildTeacherJournalNote,
  buildTeacherNextStep,
  getCampusRoom,
  getTeacherScript,
} from './services/schoolMode';
import { BookOpen, CheckCircle2, Lightbulb, LockKeyhole, MessageCircle, Play, ShieldCheck, Sparkles, Target, X } from 'lucide-react';

const MathRoom = lazy(() => import('./components/MathRoom').then(module => ({ default: module.MathRoom })));
const ReadingRoom = lazy(() => import('./components/ReadingRoom').then(module => ({ default: module.ReadingRoom })));
const ScienceRoom = lazy(() => import('./components/ScienceRoom').then(module => ({ default: module.ScienceRoom })));
const GeographyRoom = lazy(() => import('./components/GeographyRoom').then(module => ({ default: module.GeographyRoom })));
const CodingRoom = lazy(() => import('./components/CodingRoom').then(module => ({ default: module.CodingRoom })));
const LanguageRoom = lazy(() => import('./components/LanguageRoom').then(module => ({ default: module.LanguageRoom })));
const StoryBook = lazy(() => import('./components/StoryBook').then(module => ({ default: module.StoryBook })));
const ArtRoom = lazy(() => import('./components/ArtRoom').then(module => ({ default: module.ArtRoom })));
const MusicRoom = lazy(() => import('./components/MusicRoom').then(module => ({ default: module.MusicRoom })));
const PuzzleRoom = lazy(() => import('./components/PuzzleRoom').then(module => ({ default: module.PuzzleRoom })));
const GameArcade = lazy(() => import('./components/GameArcade').then(module => ({ default: module.GameArcade })));

const PROFILES_KEY = 'kidGeniusProfiles';
const ACTIVE_PROFILE_KEY = 'kidGeniusActiveProfileId';
const PARENT_ONBOARDED_KEY = 'kidGeniusParentOnboarded';
const PARENT_PIN_KEY = 'kidGeniusParentPin';
const FAMILY_ACCESS_KEY_PREFIX = 'kidGeniusFamilyAccess';
const DEV_ACCESS_OVERRIDE_KEY = 'kidGeniusDevAccessOverride';
const BILLING_TRIAL_DAYS = 3;
const BILLING_TRIAL_MS = BILLING_TRIAL_DAYS * 24 * 60 * 60 * 1000;
const CLOUD_AUTOSYNC_DELAY_MS = 3500;
const OWNER_PROFILE_EMAILS = ['korikes2021@gmail.com', 'koikes2021@gmail.com'];
const OWNER_STARTER_PROFILES: Array<Pick<ChildProfile, 'id' | 'name' | 'grade'>> = [
  { id: 'owner-profile-1', name: 'Genius Kid 1', grade: GradeLevel.KINDERGARTEN },
  { id: 'owner-profile-2', name: 'Genius Kid 2', grade: GradeLevel.SECOND_GRADE },
  { id: 'owner-profile-3', name: 'Genius Kid 3', grade: GradeLevel.FOURTH_GRADE },
];

const normalizeParentEmail = (email?: string | null) => String(email || '').trim().toLowerCase();
const isOwnerParentEmail = (email?: string | null) => OWNER_PROFILE_EMAILS.includes(normalizeParentEmail(email));
const getFamilyStorageScope = (session?: Pick<ParentCloudSession, 'signedIn' | 'familyId' | 'email'> | null) => {
  if (!session?.signedIn) return 'guest';
  return session.familyId || `email-${normalizeParentEmail(session.email).replace(/[^a-z0-9_-]/g, '-')}` || 'signed-in';
};
const getProfilesStorageKey = (scope: string) => `${PROFILES_KEY}:${scope}`;
const getActiveProfileStorageKey = (scope: string) => `${ACTIVE_PROFILE_KEY}:${scope}`;
const getProgressStorageKey = (scope: string, profileId: string) => `kidGeniusProgress:${scope}:${profileId}`;
const getScopedStorageKey = (baseKey: string, scope: string) => `${baseKey}:${scope}`;
const loadScopedFlag = (baseKey: string, scope: string) => (
  localStorage.getItem(getScopedStorageKey(baseKey, scope)) === 'true'
  || (scope === 'guest' && localStorage.getItem(baseKey) === 'true')
);
const loadScopedValue = (baseKey: string, scope: string) => (
  localStorage.getItem(getScopedStorageKey(baseKey, scope))
  || (scope === 'guest' ? localStorage.getItem(baseKey) : '')
  || ''
);

const ensureOwnerStarterProfiles = (profiles: ChildProfile[]): ChildProfile[] => {
  const now = Date.now();
  const existingById = new Map(profiles.map(profile => [profile.id, profile]));
  const ownerProfileIds = new Set(OWNER_STARTER_PROFILES.map(profile => profile.id));
  const starterProfiles = OWNER_STARTER_PROFILES.map(seed => (
    existingById.get(seed.id) || {
      ...seed,
      createdAt: now,
      lastActiveAt: now,
    }
  ));
  const otherProfiles = profiles.filter(profile => !ownerProfileIds.has(profile.id));
  return [...starterProfiles, ...otherProfiles];
};
const hasOwnerStarterProfiles = (profiles: ChildProfile[]) =>
  OWNER_STARTER_PROFILES.every(seed => profiles.some(profile => profile.id === seed.id));

interface LearningReflection {
  roomLabel: string;
  title: string;
  objective: string;
  parentActivity?: string;
  successCheck?: string;
  practiceCount: number;
  mastered: boolean;
  journalEntryId?: string;
}

interface LearningReflectionOverride {
  title?: string;
  objective?: string;
  parentActivity?: string;
  successCheck?: string;
}

interface FamilyAccessRecord {
  familyId: string;
  billingAccessActive: boolean;
  plan?: StripeBillingPlan;
  stripeStatus?: string;
  accessSource?: 'stripe' | 'owner_comped';
  comped?: boolean;
  trialStartedAt?: number;
  trialEndsAt?: number;
  currentPeriodEndsAt?: number;
  cancelAtPeriodEnd?: boolean;
  lastInvoiceAmountDue?: number;
  lastInvoiceAmountPaid?: number;
  lastInvoiceCurrency?: string;
  lastInvoicePaid?: boolean;
  lastInvoiceStatus?: string;
  lastStripeEventAt?: number;
  lastStripeEventType?: string;
  checkoutCompletedAt?: number;
  verifiedByBillingApi?: boolean;
  verifiedOwnerEmail?: boolean;
  checkedAt?: number;
}

type PaidAccessAction =
  | { type: 'room'; room: RoomType; unitId?: string }
  | { type: 'arcade' };

const ACCESS_GATE_UNLOCKS = [
  'Teacher-led rooms, stories, games, and review quests',
  'Parent dashboard with gradebook, journal proof, and progress',
  'Installable web app access on phones, tablets, and computers',
  'Firebase parent account access for the family subscription',
];

const ACCESS_GATE_TRUST_POINTS = [
  'Stripe handles payment details; kids never see card entry.',
  'The parent account controls trial access and billing status.',
  'Progress sync remains parent-controlled in Privacy Settings.',
];

const SUBSCRIPTION_PLANS: Array<{
  id: StripeBillingPlan;
  label: string;
  price: string;
  badge: string;
  description: string;
  highlights: string[];
  temporary?: boolean;
}> = [
  {
    id: 'starter',
    label: 'Starter',
    price: '$4.99',
    badge: 'Core access',
    description: 'Full teacher-led launch access for one family learning at home.',
    highlights: [
      'Full school campus, Story Time, and Game Arcade',
      'Saved teacher narration and story covers',
      'Core parent dashboard, gradebook, and progress export',
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '$9.99',
    badge: 'Build with us',
    description: 'Best parent toolkit with deeper reporting, priority content drops, and early access learning packs.',
    highlights: [
      'Everything in Starter plus expanded weekly and monthly reports',
      'Priority access to new books, voices, and seasonal lesson packs',
      'Best choice for families using multiple child profiles',
    ],
  },
  {
    id: 'checkout_test',
    label: 'Checkout Test',
    price: '$0.50',
    badge: 'Temporary',
    description: 'Owner-only live Stripe verification charge. This plan will be removed after checkout testing.',
    highlights: [
      'Charges immediately so payment and invoice can be verified',
      'Confirms Firebase webhook subscription unlock',
      'Cancel in Stripe to stop the next monthly renewal',
    ],
    temporary: true,
  },
];

const gradeToLevel: { [key in GradeLevel]: number } = {
  [GradeLevel.PRE_K]: 1,
  [GradeLevel.KINDERGARTEN]: 2,
  [GradeLevel.FIRST_GRADE]: 3,
  [GradeLevel.SECOND_GRADE]: 4,
  [GradeLevel.THIRD_GRADE]: 5,
  [GradeLevel.FOURTH_GRADE]: 6,
  [GradeLevel.FIFTH_GRADE]: 7,
};

const gradeProgressionThresholds: { [level: number]: number } = {
  1: 30,
  2: 75,
  3: 135,
  4: 210,
  5: 300,
  6: 405,
};

const gradeMasteryMinimums: { [level: number]: number } = {
  1: 3,
  2: 6,
  3: 10,
  4: 15,
  5: 21,
  6: 28,
};

const requiredGradeRooms = [
  RoomType.MATH,
  RoomType.READING,
  RoomType.STORYBOOK,
  RoomType.SCIENCE,
  RoomType.GEOGRAPHY,
  RoomType.CODING,
  RoomType.LANGUAGE,
  RoomType.ART,
  RoomType.MUSIC,
  RoomType.PUZZLE,
];

const roomReflectionLabels: Partial<Record<RoomType, string>> = {
  [RoomType.MATH]: 'Math',
  [RoomType.READING]: 'Reading',
  [RoomType.STORYBOOK]: 'Story Time',
  [RoomType.SCIENCE]: 'Science',
  [RoomType.GEOGRAPHY]: 'Geography',
  [RoomType.CODING]: 'Coding',
  [RoomType.LANGUAGE]: 'Languages',
  [RoomType.ART]: 'Art',
  [RoomType.MUSIC]: 'Music',
  [RoomType.PUZZLE]: 'Puzzle',
};

const hasBalancedGradeMastery = (progress: UserProgress, level: number): boolean => {
  const required = gradeMasteryMinimums[level] || Number.POSITIVE_INFINITY;
  const subjectScores = [
    progress.mathScore || 0,
    progress.readingScore || 0,
    progress.storybookScore || 0,
    progress.scienceScore || 0,
    progress.geographyScore || 0,
    progress.codingScore || 0,
    progress.languageScore || 0,
  ];
  return subjectScores.every(score => score >= required);
};

const hasVisitedEveryRoomForGrade = (progress: UserProgress, level: number): boolean => {
  const visitedRooms = new Set(progress.gradeRoomVisits?.[String(level)] || []);
  return requiredGradeRooms.every(room => visitedRooms.has(room));
};

const createProfileId = () => `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const buildNextArcadeProgress = (
  progress: UserProgress,
  gameId: string,
  combo: number
): UserProgress['arcadeProgress'] => {
  const current = {
    ...DEFAULT_ARCADE_PROGRESS,
    ...(progress.arcadeProgress || {}),
    gameWins: {
      ...(progress.arcadeProgress?.gameWins || {}),
    },
    masteredGameIds: [...(progress.arcadeProgress?.masteredGameIds || [])],
  };
  const today = getTodayKey();
  const nextGameWins = {
    ...current.gameWins,
    [gameId]: (current.gameWins[gameId] || 0) + 1,
  };
  const masteredGameIds = Array.from(new Set([
    ...current.masteredGameIds,
    ...Object.entries(nextGameWins)
      .filter(([, wins]) => wins >= 3)
      .map(([id]) => id),
  ]));

  return {
    ...current,
    totalWins: (current.totalWins || 0) + 1,
    bestCombo: Math.max(current.bestCombo || 0, combo),
    lastPlayedAt: Date.now(),
    dailyChallengeDate: today,
    dailyChallengeWins: current.dailyChallengeDate === today ? (current.dailyChallengeWins || 0) + 1 : 1,
    gameWins: nextGameWins,
    masteredGameIds,
  };
};

const updateDailyStats = (
  stats: DailyStats[] = [],
  patch: Partial<Omit<DailyStats, 'date'>>
): DailyStats[] => {
  const today = getTodayKey();
  const existing = stats.find(stat => stat.date === today);
  const base: DailyStats = existing || {
    date: today,
    timeSpentMinutes: 0,
    problemsAttempted: 0,
    problemsCorrect: 0,
    roomsVisited: [],
    stickersEarned: 0,
    achievementsUnlocked: [],
  };

  const updated: DailyStats = {
    ...base,
    timeSpentMinutes: base.timeSpentMinutes + (patch.timeSpentMinutes || 0),
    problemsAttempted: base.problemsAttempted + (patch.problemsAttempted || 0),
    problemsCorrect: base.problemsCorrect + (patch.problemsCorrect || 0),
    stickersEarned: base.stickersEarned + (patch.stickersEarned || 0),
    roomsVisited: Array.from(new Set([
      ...base.roomsVisited,
      ...(patch.roomsVisited || []),
    ])),
    achievementsUnlocked: Array.from(new Set([
      ...base.achievementsUnlocked,
      ...(patch.achievementsUnlocked || []),
    ])),
  };

  return [
    updated,
    ...stats.filter(stat => stat.date !== today),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);
};

const loadProfiles = (scope = 'guest'): ChildProfile[] => {
  try {
    const saved = localStorage.getItem(getProfilesStorageKey(scope)) || (scope === 'guest' ? localStorage.getItem(PROFILES_KEY) : null);
    const profiles = saved ? JSON.parse(saved) : [];
    if (Array.isArray(profiles) && profiles.length > 0) {
      return profiles;
    }
  } catch {
    // Fall through to default profile.
  }

  const defaultProfile: ChildProfile = {
    id: 'default',
    name: 'Learner',
    grade: GradeLevel.KINDERGARTEN,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  localStorage.setItem(getProfilesStorageKey(scope), JSON.stringify([defaultProfile]));
  localStorage.setItem(getActiveProfileStorageKey(scope), defaultProfile.id);
  return [defaultProfile];
};

const isPlaceholderProfile = (profile?: ChildProfile | null) => (
  !profile || (profile.id === 'default' && profile.name.trim().toLowerCase() === 'learner')
);

const hasRealChildProfiles = (childProfiles: ChildProfile[]) => (
  childProfiles.some(profile => !isPlaceholderProfile(profile))
);

const getPreferredProfile = (childProfiles: ChildProfile[], requestedProfileId?: string | null) => {
  const requestedProfile = childProfiles.find(profile => profile.id === requestedProfileId);
  if (requestedProfile && (!isPlaceholderProfile(requestedProfile) || !hasRealChildProfiles(childProfiles))) {
    return requestedProfile;
  }
  return childProfiles.find(profile => !isPlaceholderProfile(profile)) || requestedProfile || childProfiles[0];
};

const getStoredProfiles = (scope: string): ChildProfile[] | null => {
  try {
    const saved = localStorage.getItem(getProfilesStorageKey(scope));
    const profiles = saved ? JSON.parse(saved) : null;
    return Array.isArray(profiles) && profiles.length > 0 ? profiles : null;
  } catch {
    return null;
  }
};

const getLegacyProfilesForMigration = (): ChildProfile[] | null => {
  try {
    const saved = localStorage.getItem(PROFILES_KEY);
    const profiles = saved ? JSON.parse(saved) : null;
    if (!Array.isArray(profiles) || profiles.length === 0) return null;
    const hasRealChildProfile = profiles.some(profile => profile.id !== 'default' || profile.name !== 'Learner');
    return hasRealChildProfile ? profiles : null;
  } catch {
    return null;
  }
};

const loadProgressForProfile = (profile: ChildProfile, scope = 'guest'): UserProgress => {
  const profileProgress = localStorage.getItem(getProgressStorageKey(scope, profile.id))
    || (scope === 'guest' ? localStorage.getItem(`kidGeniusProgress:${profile.id}`) : null);
  const legacyProgress = scope === 'guest' ? localStorage.getItem('kidGeniusProgress') : null;
  const saved = profileProgress || legacyProgress;
  if (saved) {
    try {
      const savedProgress = JSON.parse(saved);
      return {
        ...createDefaultProgress(profile.name),
        ...savedProgress,
        childName: profile.name,
        currentGrade: profile.grade,
        currentLevel: gradeToLevel[profile.grade],
        memberId: profile.id,
        accessibility: {
          ...DEFAULT_ACCESSIBILITY,
          ...(savedProgress.accessibility || {}),
        },
        privacy: {
          ...DEFAULT_PRIVACY_SETTINGS,
          ...(savedProgress.privacy || {}),
        },
        dailyStats: Array.isArray(savedProgress.dailyStats) ? savedProgress.dailyStats : [],
        gradeRoomVisits: savedProgress.gradeRoomVisits || {},
        completedUnitIds: Array.isArray(savedProgress.completedUnitIds) ? savedProgress.completedUnitIds : [],
        unitPracticeCounts: savedProgress.unitPracticeCounts || {},
        learningJournal: Array.isArray(savedProgress.learningJournal) ? savedProgress.learningJournal : [],
        arcadeProgress: {
          ...DEFAULT_ARCADE_PROGRESS,
          ...(savedProgress.arcadeProgress || {}),
          gameWins: savedProgress.arcadeProgress?.gameWins || {},
          masteredGameIds: Array.isArray(savedProgress.arcadeProgress?.masteredGameIds)
            ? savedProgress.arcadeProgress.masteredGameIds
            : [],
        },
        weeklyGoalMinutes: savedProgress.weeklyGoalMinutes || 60,
        dailySessionLimitMinutes: savedProgress.dailySessionLimitMinutes || 20,
      };
    } catch {
      // Fall through to fresh progress.
    }
  }
  return {
    ...createDefaultProgress(profile.name),
    currentGrade: profile.grade,
    currentLevel: gradeToLevel[profile.grade],
    memberId: profile.id,
  };
};

const mergeCloudProgressForProfile = (
  profile: ChildProfile,
  scope: string,
  snapshot: CloudChildProgressSnapshot
): UserProgress => {
  const baseProgress = loadProgressForProfile(profile, scope);
  const patch = snapshot.progressPatch || {};
  const nextArcadeProgress = patch.arcadeProgress
    ? {
      ...baseProgress.arcadeProgress,
      ...patch.arcadeProgress,
      gameWins: {
        ...(baseProgress.arcadeProgress?.gameWins || {}),
        ...(patch.arcadeProgress.gameWins || {}),
      },
      masteredGameIds: Array.from(new Set([
        ...(baseProgress.arcadeProgress?.masteredGameIds || []),
        ...(patch.arcadeProgress.masteredGameIds || []),
      ])),
    }
    : baseProgress.arcadeProgress;

  return {
    ...baseProgress,
    ...patch,
    childName: profile.name,
    currentGrade: profile.grade,
    currentLevel: patch.currentLevel || gradeToLevel[profile.grade],
    memberId: profile.id,
    accessibility: {
      ...DEFAULT_ACCESSIBILITY,
      ...(baseProgress.accessibility || {}),
      ...(patch.accessibility || {}),
    },
    privacy: {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...(baseProgress.privacy || {}),
      ...(patch.privacy || {}),
    },
    completedUnitIds: Array.isArray(patch.completedUnitIds) ? patch.completedUnitIds : baseProgress.completedUnitIds,
    unitPracticeCounts: patch.unitPracticeCounts || baseProgress.unitPracticeCounts,
    learningJournal: Array.isArray(patch.learningJournal) ? patch.learningJournal : baseProgress.learningJournal,
    dailyStats: Array.isArray(patch.dailyStats) ? patch.dailyStats : baseProgress.dailyStats,
    arcadeProgress: nextArcadeProgress,
  };
};

const getFamilyAccessKey = (familyId?: string | null) => `${FAMILY_ACCESS_KEY_PREFIX}:${familyId || 'unknown'}`;

const loadFamilyAccess = (familyId?: string | null): FamilyAccessRecord | null => {
  if (!familyId) return null;
  const saved = localStorage.getItem(getFamilyAccessKey(familyId));
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as FamilyAccessRecord;
    return parsed.familyId === familyId ? parsed : null;
  } catch {
    return null;
  }
};

const saveFamilyAccess = (record: FamilyAccessRecord) => {
  localStorage.setItem(getFamilyAccessKey(record.familyId), JSON.stringify(record));
};

const clearFamilyAccess = (familyId?: string | null) => {
  if (familyId) localStorage.removeItem(getFamilyAccessKey(familyId));
};

const buildOwnerFamilyAccessRecord = (familyId: string): FamilyAccessRecord => {
  const now = Date.now();
  return {
    familyId,
    billingAccessActive: true,
    plan: 'premium',
    stripeStatus: 'owner_comped',
    accessSource: 'owner_comped',
    comped: true,
    verifiedOwnerEmail: true,
    checkedAt: now,
  };
};

const hasDevAccessOverride = () =>
  Boolean(import.meta.env.DEV && localStorage.getItem(DEV_ACCESS_OVERRIDE_KEY) === 'true');

const formatTrialEndDate = (timestamp?: number) => {
  if (!timestamp) return 'after the free trial';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(timestamp));
};

const formatBillingDate = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
};

const getBillingAccessSummary = (access?: FamilyAccessRecord | null) => {
  const planLabel = access?.plan === 'checkout_test'
    ? 'Checkout Test $0.50/mo'
    : access?.plan === 'premium'
      ? 'Premium $9.99/mo'
      : access?.plan === 'starter'
        ? 'Starter $4.99/mo'
        : 'Plan not selected';
  if (access?.accessSource === 'owner_comped' || access?.comped || access?.stripeStatus === 'owner_comped') {
    return {
      tone: 'success' as const,
      statusLabel: 'Owner access active',
      planLabel: 'Owner access',
      detail: 'This parent account has unlimited Kid Genius World access.',
      dateLabel: 'No Stripe payment required',
      checkedLabel: access.checkedAt ? `Verified ${formatBillingDate(access.checkedAt)}` : '',
    };
  }

  if (!access?.billingAccessActive) {
    return {
      tone: 'warning' as const,
      statusLabel: 'Trial not active yet',
      planLabel,
      detail: 'Sign in with a parent account and choose a plan to unlock learning sections.',
      dateLabel: 'No active billing period',
      checkedLabel: '',
    };
  }

  if (access.stripeStatus === 'trialing') {
    return {
      tone: 'success' as const,
      statusLabel: 'Trial active',
      planLabel,
      detail: `The 3-day trial is active${access.trialEndsAt ? ` until ${formatBillingDate(access.trialEndsAt)}` : ''}.`,
      dateLabel: access.trialEndsAt ? `Trial ends ${formatBillingDate(access.trialEndsAt)}` : 'Trial end date pending',
      checkedLabel: access.checkedAt ? `Verified ${formatBillingDate(access.checkedAt)}` : '',
    };
  }

  if (access.stripeStatus === 'past_due') {
    return {
      tone: 'warning' as const,
      statusLabel: 'Payment needs attention',
      planLabel,
      detail: 'Learning access is still open for now, but the parent should update billing in Stripe.',
      dateLabel: access.currentPeriodEndsAt ? `Current period ends ${formatBillingDate(access.currentPeriodEndsAt)}` : 'Billing date pending',
      checkedLabel: access.checkedAt ? `Verified ${formatBillingDate(access.checkedAt)}` : '',
    };
  }

  return {
    tone: 'success' as const,
    statusLabel: access.stripeStatus === 'active' ? 'Subscription active' : 'Access active',
    planLabel,
    detail: access.currentPeriodEndsAt
      ? `Current billing period runs through ${formatBillingDate(access.currentPeriodEndsAt)}.`
      : 'Stripe access is verified for this family.',
    dateLabel: access.currentPeriodEndsAt ? `Renews ${formatBillingDate(access.currentPeriodEndsAt)}` : 'Billing period verified',
    checkedLabel: access.checkedAt ? `Verified ${formatBillingDate(access.checkedAt)}` : '',
  };
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showParentWelcome, setShowParentWelcome] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>(RoomType.HUB);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showGameArcade, setShowGameArcade] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPet, setShowPet] = useState(false);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [guideTrigger, setGuideTrigger] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [showMissionFocus, setShowMissionFocus] = useState(false);
  const [showLessonIntro, setShowLessonIntro] = useState(false);
  const [learningReflection, setLearningReflection] = useState<LearningReflection | null>(null);
  const [parentOnboarded, setParentOnboarded] = useState(() => {
    const scope = getFamilyStorageScope(getCurrentParentSession());
    return loadScopedFlag(PARENT_ONBOARDED_KEY, scope);
  });
  const [legalView, setLegalView] = useState<LegalPageType | null>(null);
  const [parentPin, setParentPin] = useState(() => {
    const scope = getFamilyStorageScope(getCurrentParentSession());
    return loadScopedValue(PARENT_PIN_KEY, scope);
  });
  const [pinDraft, setPinDraft] = useState('');
  const [pinConfirmDraft, setPinConfirmDraft] = useState('');
  const [pinSetupError, setPinSetupError] = useState('');
  const [childProfileNameDraft, setChildProfileNameDraft] = useState('');
  const [parentConsentChecks, setParentConsentChecks] = useState({
    guardian: false,
    policies: false,
    localStorage: false,
    supervisedMedia: false,
  });
  const [parentCloudSession, setParentCloudSession] = useState<ParentCloudSession>(() => getCurrentParentSession());
  const [cloudSyncStatus, setCloudSyncStatus] = useState('');
  const [billingStatus, setBillingStatus] = useState('');
  const [familyAccess, setFamilyAccess] = useState<FamilyAccessRecord | null>(() => {
    const session = getCurrentParentSession();
    return loadFamilyAccess(session.familyId);
  });
  const [showAccessGate, setShowAccessGate] = useState(false);
  const [pendingAccessAction, setPendingAccessAction] = useState<PaidAccessAction | null>(null);
  const [accessGateStatus, setAccessGateStatus] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [accessBusy, setAccessBusy] = useState(false);
  const [stripeCheckoutUrl, setStripeCheckoutUrl] = useState('');
  const [setupParentEmail, setSetupParentEmail] = useState('');
  const [setupParentPassword, setSetupParentPassword] = useState('');
  const [setupParentAuthStatus, setSetupParentAuthStatus] = useState('');
  const [setupParentAuthBusy, setSetupParentAuthBusy] = useState(false);
  const [profileStorageScope, setProfileStorageScope] = useState(() => getFamilyStorageScope(getCurrentParentSession()));
  const [cloudHydratedFamilyId, setCloudHydratedFamilyId] = useState('');
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    const scope = getFamilyStorageScope(getCurrentParentSession());
    return loadProfiles(scope);
  });
  const [activeProfileId, setActiveProfileId] = useState(() => {
    const scope = getFamilyStorageScope(getCurrentParentSession());
    const loadedProfiles = loadProfiles(scope);
    return localStorage.getItem(getActiveProfileStorageKey(scope)) || loadedProfiles[0]?.id || 'default';
  });

  // Global Progression State with all new features
  const [progress, setProgress] = useState<UserProgress>(() => {
    const scope = getFamilyStorageScope(getCurrentParentSession());
    const loadedProfiles = loadProfiles(scope);
    const activeId = localStorage.getItem(getActiveProfileStorageKey(scope)) || loadedProfiles[0]?.id || 'default';
    const activeProfile = loadedProfiles.find(profile => profile.id === activeId) || loadedProfiles[0];
    return loadProgressForProfile(activeProfile, scope);
  });
  const billingAccessSummary = getBillingAccessSummary(familyAccess);

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      logDiagnosticEvent('error', 'window-error', event.message || 'Unhandled app error.', event.error);
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || 'Unhandled promise rejection.');
      logDiagnosticEvent('error', 'unhandled-promise', reason, event.reason);
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const refreshBillingAccess = async (statusPrefix = 'Checking Stripe trial access...') => {
    if (!parentCloudSession.signedIn || !parentCloudSession.familyId) {
      setFamilyAccess(null);
      return null;
    }

    setBillingStatus(statusPrefix);
    if (isOwnerParentEmail(parentCloudSession.email)) {
      const nextAccess = buildOwnerFamilyAccessRecord(parentCloudSession.familyId);
      saveFamilyAccess(nextAccess);
      setFamilyAccess(nextAccess);
      setBillingStatus('Owner access verified. No Stripe payment is required for this parent account.');
      return nextAccess;
    }

    const access = await getStripeBillingAccess(parentCloudSession);
    if (!access.active) {
      clearFamilyAccess(parentCloudSession.familyId);
      setFamilyAccess(null);
      setBillingStatus('No active Stripe trial or subscription found for this parent account.');
      return null;
    }

    const now = Date.now();
    const nextAccess: FamilyAccessRecord = {
      familyId: parentCloudSession.familyId,
      billingAccessActive: true,
      plan: access.plan,
      stripeStatus: access.status,
      accessSource: access.accessSource,
      comped: access.comped,
      trialStartedAt: access.trialEndsAt ? access.trialEndsAt - BILLING_TRIAL_MS : undefined,
      trialEndsAt: access.trialEndsAt || undefined,
      currentPeriodEndsAt: access.currentPeriodEndsAt || undefined,
      cancelAtPeriodEnd: access.cancelAtPeriodEnd,
      lastInvoiceAmountDue: access.lastInvoiceAmountDue,
      lastInvoiceAmountPaid: access.lastInvoiceAmountPaid,
      lastInvoiceCurrency: access.lastInvoiceCurrency,
      lastInvoicePaid: access.lastInvoicePaid,
      lastInvoiceStatus: access.lastInvoiceStatus,
      lastStripeEventAt: access.lastStripeEventAt,
      lastStripeEventType: access.lastStripeEventType,
      checkoutCompletedAt: now,
      verifiedByBillingApi: true,
      checkedAt: now,
    };
    saveFamilyAccess(nextAccess);
    setFamilyAccess(nextAccess);
    if (access.accessSource === 'owner_comped' || access.comped || access.status === 'owner_comped') {
      setBillingStatus('Owner access verified. No Stripe payment is required for this parent account.');
      return nextAccess;
    }

    const trialCopy = access.status === 'trialing' && access.trialEndsAt
      ? ` 3-day trial ends ${formatTrialEndDate(access.trialEndsAt)}.`
      : '';
    setBillingStatus(`Stripe ${access.status} access verified.${trialCopy}`);
    return nextAccess;
  };

  useEffect(() => {
    const hasConsentReceipt = Boolean(localStorage.getItem('kidGeniusParentConsentReceipt'));
    const alreadyMigrated = localStorage.getItem('kidGeniusMediaDefaultsMigrated') === 'true';
    if (!parentOnboarded || alreadyMigrated) {
      return;
    }

    localStorage.setItem('kidGeniusMediaDefaultsMigrated', 'true');
    if (!hasConsentReceipt) {
      localStorage.setItem('kidGeniusParentConsentReceipt', JSON.stringify({
        acceptedAt: new Date().toISOString(),
        guardian: true,
        policiesReviewed: true,
        localStorageAcknowledged: true,
        supervisedMediaAcknowledged: true,
        migratedFromLegacyParentOnboarding: true,
      }));
    }
    localStorage.setItem('kidGeniusAllowExternalVoice', 'true');
    localStorage.setItem('kidGeniusAllowGeneratedStoryCovers', 'true');
    setProgress(prev => ({
      ...prev,
      privacy: {
        ...(prev.privacy || DEFAULT_PRIVACY_SETTINGS),
        allowExternalVoice: true,
        allowGeneratedStoryCovers: true,
      },
    }));
  }, [parentOnboarded]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(getProgressStorageKey(profileStorageScope, activeProfileId), JSON.stringify(progress));
    if (profileStorageScope === 'guest') {
      localStorage.setItem(`kidGeniusProgress:${activeProfileId}`, JSON.stringify(progress));
      localStorage.setItem('kidGeniusProgress', JSON.stringify(progress));
    }
  }, [progress, activeProfileId, profileStorageScope]);

  useEffect(() => {
    const privacy = progress.privacy || DEFAULT_PRIVACY_SETTINGS;
    localStorage.setItem('kidGeniusAllowExternalVoice', String(privacy.allowExternalVoice === true));
    localStorage.setItem('kidGeniusAllowGeneratedStoryCovers', String(privacy.allowGeneratedStoryCovers === true));
  }, [progress.privacy]);

  useEffect(() => {
    localStorage.setItem(getProfilesStorageKey(profileStorageScope), JSON.stringify(profiles));
    localStorage.setItem(getActiveProfileStorageKey(profileStorageScope), activeProfileId);
    if (profileStorageScope === 'guest') {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
    }
  }, [profiles, activeProfileId, profileStorageScope]);

  useEffect(() => {
    const privacy = progress.privacy || DEFAULT_PRIVACY_SETTINGS;
    if (!privacy.allowCloudSync || !parentCloudSession.signedIn || !parentCloudSession.familyId || !parentCloudSession.uid) {
      return;
    }

    const activeProfile = profiles.find(profile => profile.id === activeProfileId) || profiles[0];
    if (!activeProfile || isPlaceholderProfile(activeProfile)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void syncActiveProgressToCloud('auto');
    }, CLOUD_AUTOSYNC_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    progress.totalXP,
    progress.mathScore,
    progress.readingScore,
    progress.scienceScore,
    progress.geographyScore,
    progress.codingScore,
    progress.languageScore,
    progress.storybookScore,
    progress.musicScore,
    progress.completedUnitIds,
    progress.unitPracticeCounts,
    progress.learningJournal,
    progress.dailyStats,
    progress.arcadeProgress,
    progress.privacy?.allowCloudSync,
    activeProfileId,
    profiles,
    parentCloudSession.signedIn,
    parentCloudSession.familyId,
    parentCloudSession.uid,
  ]);

  useEffect(() => subscribeParentCloudSession(setParentCloudSession), []);

  useEffect(() => {
    const nextScope = getFamilyStorageScope(parentCloudSession);
    if (nextScope === profileStorageScope) {
      return;
    }

    localStorage.setItem(getProgressStorageKey(profileStorageScope, activeProfileId), JSON.stringify(progress));
    const storedScopedProfiles = getStoredProfiles(nextScope);
    const migratedProfiles = !storedScopedProfiles && nextScope !== 'guest'
      ? getLegacyProfilesForMigration()
      : null;
    const scopedProfiles = storedScopedProfiles || migratedProfiles || loadProfiles(nextScope);
    if (migratedProfiles) {
      localStorage.setItem(getProfilesStorageKey(nextScope), JSON.stringify(migratedProfiles));
      const legacyActiveId = localStorage.getItem(ACTIVE_PROFILE_KEY) || migratedProfiles[0]?.id;
      if (legacyActiveId) {
        localStorage.setItem(getActiveProfileStorageKey(nextScope), legacyActiveId);
      }
      migratedProfiles.forEach(profile => {
        const legacyProgress = localStorage.getItem(`kidGeniusProgress:${profile.id}`);
        if (legacyProgress) {
          localStorage.setItem(getProgressStorageKey(nextScope, profile.id), legacyProgress);
        }
      });
    }
    const legacyParentOnboarded = nextScope !== 'guest' && localStorage.getItem(PARENT_ONBOARDED_KEY) === 'true';
    if (legacyParentOnboarded && !loadScopedFlag(PARENT_ONBOARDED_KEY, nextScope)) {
      localStorage.setItem(getScopedStorageKey(PARENT_ONBOARDED_KEY, nextScope), 'true');
      const legacyPin = localStorage.getItem(PARENT_PIN_KEY);
      if (legacyPin) {
        localStorage.setItem(getScopedStorageKey(PARENT_PIN_KEY, nextScope), legacyPin);
      }
    }
    const scopedActiveId = localStorage.getItem(getActiveProfileStorageKey(nextScope)) || scopedProfiles[0]?.id || 'default';
    const scopedActiveProfile = getPreferredProfile(scopedProfiles, scopedActiveId);
    if (scopedActiveProfile?.id) {
      localStorage.setItem(getActiveProfileStorageKey(nextScope), scopedActiveProfile.id);
    }
    setProfileStorageScope(nextScope);
    setParentOnboarded(loadScopedFlag(PARENT_ONBOARDED_KEY, nextScope));
    setParentPin(loadScopedValue(PARENT_PIN_KEY, nextScope));
    setProfiles(scopedProfiles);
    setActiveProfileId(scopedActiveProfile?.id || scopedActiveId);
    setProgress(loadProgressForProfile(scopedActiveProfile, nextScope));
    setCurrentRoom(RoomType.HUB);
    setShowGradeSelection(false);
    setShowPetSelection(false);
  }, [parentCloudSession.signedIn, parentCloudSession.familyId, parentCloudSession.email]);

  useEffect(() => {
    if (!parentCloudSession.signedIn || !parentCloudSession.familyId || profileStorageScope !== parentCloudSession.familyId) {
      return;
    }
    if (cloudHydratedFamilyId === parentCloudSession.familyId) {
      return;
    }

    let cancelled = false;
    setCloudSyncStatus('Loading saved Firebase progress...');
    loadFamilyProgressFromFirebase(parentCloudSession.familyId)
      .then(result => {
        if (cancelled) return;
        setCloudHydratedFamilyId(parentCloudSession.familyId || '');

        if (result.ok === false) {
          setCloudSyncStatus(result.reason);
          return;
        }

        if (result.children.length === 0) {
          setCloudSyncStatus('No Firebase progress found yet. This device will save the first snapshot after parent sync.');
          return;
        }

        const cloudProfiles = result.children.map(child => child.profile);
        const mergedProfilesById = new Map<string, ChildProfile>();
        profiles.forEach(profile => {
          if (!isPlaceholderProfile(profile) || cloudProfiles.length === 0) {
            mergedProfilesById.set(profile.id, profile);
          }
        });
        cloudProfiles.forEach(profile => {
          mergedProfilesById.set(profile.id, {
            ...(mergedProfilesById.get(profile.id) || {}),
            ...profile,
            lastActiveAt: Date.now(),
          });
        });

        const mergedProfiles = Array.from(mergedProfilesById.values());
        const savedActiveId = localStorage.getItem(getActiveProfileStorageKey(parentCloudSession.familyId || ''));
        const nextActiveProfile = getPreferredProfile(mergedProfiles, savedActiveId || activeProfileId) || mergedProfiles[0];
        if (!nextActiveProfile) {
          setCloudSyncStatus('Firebase progress loaded, but no child profile was available.');
          return;
        }

        result.children.forEach(snapshot => {
          const profile = mergedProfilesById.get(snapshot.profile.id) || snapshot.profile;
          const mergedProgress = mergeCloudProgressForProfile(profile, parentCloudSession.familyId || '', snapshot);
          localStorage.setItem(getProgressStorageKey(parentCloudSession.familyId || '', profile.id), JSON.stringify(mergedProgress));
        });

        localStorage.setItem(getProfilesStorageKey(parentCloudSession.familyId || ''), JSON.stringify(mergedProfiles));
        localStorage.setItem(getActiveProfileStorageKey(parentCloudSession.familyId || ''), nextActiveProfile.id);
        setProfiles(mergedProfiles);
        setActiveProfileId(nextActiveProfile.id);
        const activeSnapshot = result.children.find(snapshot => snapshot.profile.id === nextActiveProfile.id);
        setProgress(activeSnapshot
          ? mergeCloudProgressForProfile(nextActiveProfile, parentCloudSession.familyId || '', activeSnapshot)
          : loadProgressForProfile(nextActiveProfile, parentCloudSession.familyId || '')
        );
        setCloudSyncStatus(`Loaded ${result.children.length} Firebase child profile${result.children.length === 1 ? '' : 's'} for this parent account.`);
      })
      .catch(error => {
        if (cancelled) return;
        setCloudHydratedFamilyId(parentCloudSession.familyId || '');
        logDiagnosticEvent('warn', 'firebase-progress-load', 'Firebase progress could not be loaded.', error);
        setCloudSyncStatus(error instanceof Error ? error.message : 'Firebase progress could not be loaded.');
      });

    return () => {
      cancelled = true;
    };
  }, [
    parentCloudSession.signedIn,
    parentCloudSession.familyId,
    profileStorageScope,
    cloudHydratedFamilyId,
    profiles,
    activeProfileId,
  ]);

  useEffect(() => {
    if (!isOwnerParentEmail(parentCloudSession.email)) {
      return;
    }

    setProfiles(prevProfiles => {
      if (hasOwnerStarterProfiles(prevProfiles)) {
        return prevProfiles;
      }
      return ensureOwnerStarterProfiles(prevProfiles);
    });
  }, [parentCloudSession.email]);

  useEffect(() => {
    const preferredProfile = getPreferredProfile(profiles, activeProfileId);
    if (preferredProfile?.id === activeProfileId) {
      return;
    }
    if (!preferredProfile) {
      return;
    }
    setActiveProfileId(preferredProfile.id);
    setProgress(loadProgressForProfile(preferredProfile, profileStorageScope));
  }, [profiles, activeProfileId, profileStorageScope]);

  useEffect(() => {
    const savedAccess = loadFamilyAccess(parentCloudSession.familyId);
    setFamilyAccess(savedAccess);
    if (parentCloudSession.signedIn && parentCloudSession.familyId) {
      const statusPrefix = isOwnerParentEmail(parentCloudSession.email)
        ? 'Checking owner access...'
        : 'Checking Stripe trial access...';
      refreshBillingAccess(statusPrefix).catch(error => {
        logDiagnosticEvent('warn', 'billing-access-refresh', 'Parent account access could not be checked.', error);
        setBillingStatus(error instanceof Error ? error.message : 'Parent account access could not be checked.');
      });
    }
  }, [parentCloudSession.signedIn, parentCloudSession.familyId, parentCloudSession.email]);

  useEffect(() => {
    if (!hasStarted || showParentWelcome || !parentCloudSession.signedIn || !parentOnboarded) {
      return;
    }
    const activeProfile = getPreferredProfile(profiles, activeProfileId);
    const needsChildSetup = !hasRealChildProfiles(profiles) && (!activeProfile || (
      activeProfile.name === 'Learner'
      && progress.currentGrade === GradeLevel.KINDERGARTEN
      && progress.totalXP === 0
    ));
    if (needsChildSetup && !showGradeSelection && !showPetSelection) {
      setShowGradeSelection(true);
    }
  }, [
    hasStarted,
    showParentWelcome,
    parentCloudSession.signedIn,
    parentOnboarded,
    profiles,
    activeProfileId,
    progress.pet,
    progress.currentGrade,
    progress.totalXP,
    showGradeSelection,
    showPetSelection,
  ]);

  useEffect(() => {
    if (!hasStarted || !showParentWelcome || !parentCloudSession.signedIn) {
      return;
    }
    const justCompletedAuth = /Parent (signed in|account created)/i.test(setupParentAuthStatus);
    if (!justCompletedAuth) {
      return;
    }

    const currentScope = getFamilyStorageScope(parentCloudSession);
    if (!loadScopedFlag(PARENT_ONBOARDED_KEY, currentScope)) {
      setShowParentWelcome(false);
      return;
    }

    setShowParentWelcome(false);
    if (activeChildNeedsSetup()) {
      setShowGradeSelection(true);
      return;
    }

    speak("Welcome back to Kid Genius World!");
  }, [
    hasStarted,
    showParentWelcome,
    parentCloudSession.signedIn,
    parentCloudSession.familyId,
    parentCloudSession.email,
    setupParentAuthStatus,
    profiles,
    activeProfileId,
    progress.pet,
    progress.currentGrade,
    progress.totalXP,
  ]);

  useEffect(() => {
    const billingResult = new URLSearchParams(window.location.search).get('billing');
    if (!billingResult) return;

    if (billingResult === 'cancelled') {
      setBillingStatus('Stripe checkout was cancelled. Pick a plan when you are ready to start the 3-day trial.');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (billingResult !== 'success' || !parentCloudSession.familyId) return;

    refreshBillingAccess('Verifying Stripe checkout and 3-day trial...')
      .catch(error => {
        clearFamilyAccess(parentCloudSession.familyId);
        setFamilyAccess(null);
        setBillingStatus(
          error instanceof Error
            ? `Stripe checkout returned success, but access could not be verified yet: ${error.message}`
            : 'Stripe checkout returned success, but access could not be verified yet.'
        );
      })
      .finally(() => {
        window.history.replaceState({}, '', window.location.pathname);
      });
  }, [parentCloudSession.familyId]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const timer = window.setInterval(() => {
      setProgress(prev => ({
        ...prev,
        totalPlayTimeMinutes: (prev.totalPlayTimeMinutes || 0) + 1,
        dailyStats: updateDailyStats(prev.dailyStats, { timeSpentMinutes: 1 }),
      }));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [hasStarted]);

  useEffect(() => {
    const ageGroup =
      progress.currentGrade === GradeLevel.PRE_K || progress.currentGrade === GradeLevel.KINDERGARTEN
        ? 'early'
        : progress.currentGrade === GradeLevel.FOURTH_GRADE || progress.currentGrade === GradeLevel.FIFTH_GRADE
          ? 'older'
          : 'elementary';

    setSpeechPreferences({
      speechRate: progress.accessibility?.speechRate || 1.0,
      narrationStyle: progress.accessibility?.narrationStyle || 'gentle',
      ageGroup,
    });
    setNarrationContext(currentRoom);
  }, [progress.currentGrade, progress.accessibility, currentRoom]);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    const privacy = progress.privacy || DEFAULT_PRIVACY_SETTINGS;
    if (!privacy.allowExternalVoice) {
      return;
    }

    const cacheProfile = JSON.stringify({
      level: progress.currentLevel,
      narrationStyle: progress.accessibility?.narrationStyle || 'gentle',
      speechRate: progress.accessibility?.speechRate || 1.0,
      humanVoice: privacy.allowExternalVoice,
    });
    const cacheKey = 'kidGeniusVoiceCacheProfile';

    if (localStorage.getItem(cacheKey) === cacheProfile) {
      return;
    }

    let cancelled = false;

    const warmCacheInBackground = async () => {
      try {
        const { warmVoiceCache } = await import('./services/voiceCacheService');
        await warmVoiceCache(progress.currentLevel, progress.accessibility || DEFAULT_ACCESSIBILITY);
        if (!cancelled) {
          localStorage.setItem(cacheKey, cacheProfile);
        }
      } catch {
        // Keep this silent in the kid UI. Parent Dashboard exposes manual warmup status.
      }
    };

    void warmCacheInBackground();

    return () => {
      cancelled = true;
    };
  }, [hasStarted, progress.currentLevel, progress.accessibility, progress.privacy]);

  const updateProfileForReward = (
    updater: (profile: UserProgress['learningProfile']) => UserProgress['learningProfile']
  ) => {
    setProgress(prev => {
      const nextProfile = updateLearningProfile(updater(prev.learningProfile));
      return {
        ...prev,
        learningProfile: nextProfile,
      };
    });
  };

  const recordMathSkill = () => {
    updateProfileForReward(profile => {
      const mathSkills = { ...profile.mathSkills };
      const targetSkill =
        progress.currentLevel <= 2
          ? (Math.random() > 0.45 ? 'addition' : 'subtraction')
          : progress.currentLevel <= 4
            ? (Math.random() > 0.5 ? 'addition' : progress.currentLevel === 4 ? 'multiplication' : 'subtraction')
            : progress.currentLevel <= 6
              ? (Math.random() > 0.45 ? 'multiplication' : 'division')
              : ['addition', 'subtraction', 'multiplication', 'division'][Math.floor(Math.random() * 4)] as keyof typeof mathSkills;

      mathSkills[targetSkill] = updateSkillMetrics(mathSkills[targetSkill], true, 4000);
      return { ...profile, mathSkills };
    });
  };

  const recordReadingSkill = (skill: keyof UserProgress['learningProfile']['readingSkills']) => {
    updateProfileForReward(profile => ({
      ...profile,
      readingSkills: {
        ...profile.readingSkills,
        [skill]: updateSkillMetrics(profile.readingSkills[skill], true, 3500),
      },
    }));
  };

  const recordSubjectSkill = (
    skill: 'scienceSkills' | 'geographySkills' | 'codingSkills' | 'languageSkills',
    timeMs: number
  ) => {
    updateProfileForReward(profile => ({
      ...profile,
      [skill]: updateSkillMetrics(profile[skill], true, timeMs),
    }));
  };

  const checkAchievements = (newProgress: UserProgress) => {
    const unlockedIds = new Set(newProgress.achievements || []);
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedIds.has(achievement.id)) return;

      const currentProgress = getAchievementProgress(achievement.id, newProgress);
      if (currentProgress >= achievement.requirement) {
        unlockedIds.add(achievement.id);
        newlyUnlocked.push({ ...achievement, currentProgress, unlockedAt: Date.now() });
      }
    });

    if (newlyUnlocked.length === 0) {
      return {
        ...newProgress,
        achievements: Array.from(unlockedIds),
      };
    }

    setNewAchievement(newlyUnlocked[0]);

    return {
      ...newProgress,
      achievements: Array.from(unlockedIds),
      dailyStats: updateDailyStats(newProgress.dailyStats, {
        achievementsUnlocked: newlyUnlocked.map(achievement => achievement.id),
      }),
    };
  };

  // Start Screen to unlock AudioContext
  const handleStart = () => {
    resumeAudioContext().catch(error => {
      logDiagnosticEvent('warn', 'audio-start-resume', 'Audio context could not be resumed from Start Adventure.', error);
    });
    setHasStarted(true);
    setShowParentWelcome(true);
    setShowGradeSelection(false);
    setShowPetSelection(false);
    const today = new Date().toISOString().slice(0, 10);

    setProgress(prev => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const alreadyPlayedToday = prev.lastPlayedDate === today;
      const continuedStreak = prev.lastPlayedDate === yesterday;
      const nextProgress = {
        ...prev,
        sessionsCompleted: alreadyPlayedToday ? prev.sessionsCompleted : (prev.sessionsCompleted || 0) + 1,
        currentStreak: alreadyPlayedToday ? prev.currentStreak : continuedStreak ? (prev.currentStreak || 0) + 1 : 1,
        lastPlayedDate: today,
      };
      return checkAchievements(nextProgress);
    });

  };

  const activeChildNeedsSetup = () => {
    const activeProfile = getPreferredProfile(profiles, activeProfileId);
    return !hasRealChildProfiles(profiles) && (!activeProfile || (
      activeProfile.name === 'Learner'
      && progress.currentGrade === GradeLevel.KINDERGARTEN
      && progress.totalXP === 0
    ));
  };

  const continueAfterParentWelcome = () => {
    if (!parentCloudSession.signedIn) {
      setSetupParentAuthStatus('Sign in or create a parent account first.');
      return;
    }

    setShowParentWelcome(false);
    const currentScope = getFamilyStorageScope(parentCloudSession);
    if (!loadScopedFlag(PARENT_ONBOARDED_KEY, currentScope)) {
      return;
    }

    if (activeChildNeedsSetup()) {
      setShowGradeSelection(true);
      return;
    }

    speak("Welcome back to Kid Genius World!");
  };

  const handleParentOnboardingComplete = () => {
    if (!parentCloudSession.signedIn) {
      setPinSetupError('Create or sign in to the parent account before setting up a child profile.');
      return;
    }
    const allConsentChecksReady = Object.values(parentConsentChecks).every(Boolean);
    if (!allConsentChecksReady) {
      setPinSetupError('Review and confirm each parent launch checkpoint before continuing.');
      return;
    }
    if (!/^\d{4,8}$/.test(pinDraft)) {
      setPinSetupError('Choose a 4 to 8 digit parent PIN.');
      return;
    }
    if (pinDraft !== pinConfirmDraft) {
      setPinSetupError('The PIN entries do not match.');
      return;
    }
    localStorage.setItem(getScopedStorageKey(PARENT_PIN_KEY, profileStorageScope), pinDraft);
    localStorage.setItem(getScopedStorageKey(PARENT_ONBOARDED_KEY, profileStorageScope), 'true');
    if (profileStorageScope === 'guest') {
      localStorage.setItem(PARENT_PIN_KEY, pinDraft);
      localStorage.setItem(PARENT_ONBOARDED_KEY, 'true');
    }
    localStorage.setItem('kidGeniusParentConsentReceipt', JSON.stringify({
      acceptedAt: new Date().toISOString(),
      guardian: true,
      policiesReviewed: true,
      localStorageAcknowledged: true,
      supervisedMediaAcknowledged: true,
    }));
    localStorage.setItem('kidGeniusAllowExternalVoice', 'true');
    localStorage.setItem('kidGeniusAllowGeneratedStoryCovers', 'true');
    setProgress(prev => ({
      ...prev,
      privacy: {
        ...(prev.privacy || DEFAULT_PRIVACY_SETTINGS),
        allowExternalVoice: true,
        allowGeneratedStoryCovers: true,
      },
    }));
    setParentPin(pinDraft);
    setParentOnboarded(true);
    setShowGradeSelection(true);
  };

  const handleUpdateParentPin = (newPin: string) => {
    localStorage.setItem(getScopedStorageKey(PARENT_PIN_KEY, profileStorageScope), newPin);
    if (profileStorageScope === 'guest') {
      localStorage.setItem(PARENT_PIN_KEY, newPin);
    }
    setParentPin(newPin);
  };

  const handleCreateParentAccount = async (email: string, password: string) => {
    setCloudSyncStatus('Creating parent account...');
    await createParentAccount(email, password);
    setCloudSyncStatus('Parent account created. Turn on cloud sync when you are ready to save progress to Firebase.');
  };

  const handleSignInParentAccount = async (email: string, password: string) => {
    setCloudSyncStatus('Signing in...');
    await signInParentAccount(email, password);
    setCloudSyncStatus('Parent signed in. Turn on cloud sync to save this child progress to Firebase.');
  };

  const handleSignInParentWithGoogle = async () => {
    setCloudSyncStatus('Opening Google sign-in...');
    await signInParentWithGoogle();
    setCloudSyncStatus('Parent signed in with Google. Turn on cloud sync to save this child progress to Firebase.');
  };

  const handleSetupCreateParentAccount = async () => {
    if (!setupParentEmail.trim() || setupParentPassword.length < 6) {
      setSetupParentAuthStatus('Enter a parent email and a password with at least 6 characters.');
      return;
    }

    setSetupParentAuthBusy(true);
    setSetupParentAuthStatus('Creating parent account...');
    try {
      await createParentAccount(setupParentEmail.trim(), setupParentPassword);
      setSetupParentAuthStatus('Parent account created. Now finish the safety checkpoints and PIN.');
    } catch (error) {
      logDiagnosticEvent('warn', 'firebase-parent-create', 'Parent Firebase account could not be created.', error);
      setSetupParentAuthStatus(error instanceof Error ? error.message : 'Parent account could not be created.');
    } finally {
      setSetupParentAuthBusy(false);
    }
  };

  const handleSetupSignInParentAccount = async () => {
    if (!setupParentEmail.trim() || setupParentPassword.length < 6) {
      setSetupParentAuthStatus('Enter the parent email and password.');
      return;
    }

    setSetupParentAuthBusy(true);
    setSetupParentAuthStatus('Signing in parent...');
    try {
      await signInParentAccount(setupParentEmail.trim(), setupParentPassword);
      setSetupParentAuthStatus('Parent signed in. Now finish the safety checkpoints and PIN.');
    } catch (error) {
      logDiagnosticEvent('warn', 'firebase-parent-signin', 'Parent Firebase sign-in failed.', error);
      setSetupParentAuthStatus(error instanceof Error ? error.message : 'Parent sign-in failed.');
    } finally {
      setSetupParentAuthBusy(false);
    }
  };

  const handleSetupSignInWithGoogle = async () => {
    setSetupParentAuthBusy(true);
    setSetupParentAuthStatus('Opening Google sign-in...');
    try {
      await signInParentWithGoogle();
      setSetupParentAuthStatus('Parent signed in with Google. Now finish the safety checkpoints and PIN.');
    } catch (error) {
      logDiagnosticEvent('warn', 'firebase-google-signin', 'Google parent sign-in failed.', error);
      setSetupParentAuthStatus(error instanceof Error ? error.message : 'Google sign-in failed.');
    } finally {
      setSetupParentAuthBusy(false);
    }
  };

  const handleSignOutParentAccount = async () => {
    await signOutParentAccount();
    setCloudSyncStatus('Parent signed out. Local progress still works on this browser.');
  };

  const syncActiveProgressToCloud = async (mode: 'manual' | 'auto' = 'manual') => {
    const privacy = progress.privacy || DEFAULT_PRIVACY_SETTINGS;
    if (!privacy.allowCloudSync) {
      if (mode === 'manual') {
        setCloudSyncStatus('Cloud sync is off. Turn it on in Privacy Controls before syncing progress.');
      }
      return;
    }
    if (!parentCloudSession.familyId || !parentCloudSession.uid) {
      if (mode === 'manual') {
        setCloudSyncStatus('Sign in with a parent Firebase account before syncing progress.');
      }
      return;
    }

    const activeProfile = profiles.find(profile => profile.id === activeProfileId) || profiles[0];
    if (!activeProfile || isPlaceholderProfile(activeProfile)) {
      if (mode === 'manual') {
        setCloudSyncStatus('Create a child profile before syncing progress to Firebase.');
      }
      return;
    }

    setCloudSyncStatus(mode === 'manual' ? 'Syncing progress to Firebase...' : 'Saving latest progress to Firebase...');
    const result = await syncProgressToFirebase(
      {
        familyId: parentCloudSession.familyId,
        childId: activeProfileId || progress.memberId || 'default',
      },
      progress,
      activeProfile
    );

    if (result.ok) {
      localStorage.setItem('kidGeniusLastCloudSyncAt', new Date().toISOString());
      setCloudSyncStatus(mode === 'manual'
        ? 'Progress synced to Firebase for this parent account.'
        : 'Latest progress saved to Firebase.'
      );
    } else {
      logDiagnosticEvent('warn', 'firebase-progress-sync', result.reason || 'Firebase sync did not complete.');
      setCloudSyncStatus(result.reason || 'Firebase sync did not complete.');
    }
  };

  const handleSyncProgressToCloud = async () => {
    await syncActiveProgressToCloud('manual');
  };

  const handleStartStripeCheckout = async (plan: StripeBillingPlan) => {
    if (!parentCloudSession.signedIn) {
      setBillingStatus('Sign in with a parent Firebase account before opening Stripe checkout.');
      setAccessGateStatus('Sign in or create a parent account first. Then choose a plan to start the 3-day trial.');
      return;
    }

    let checkoutWindow: Window | null = null;
    try {
      checkoutWindow = window.open('about:blank', '_blank');
      checkoutWindow?.document.write('<title>Opening Stripe Checkout</title><p style="font-family:sans-serif;padding:24px;">Opening secure Stripe checkout...</p>');
      checkoutWindow?.document.close();
    } catch {
      checkoutWindow = null;
    }

    setStripeCheckoutUrl('');
    const checkoutLabel = plan === 'checkout_test'
      ? '$0.50 test checkout'
      : plan === 'premium'
        ? '$9.99 monthly checkout with a 3-day trial'
        : '$4.99 monthly checkout with a 3-day trial';
    setBillingStatus(`Opening secure Stripe ${checkoutLabel}...`);
    setAccessGateStatus(`Creating secure Stripe checkout for the ${checkoutLabel}...`);
    try {
      const checkoutUrl = await createStripeCheckoutUrl(parentCloudSession, plan);
      setStripeCheckoutUrl(checkoutUrl);
      setBillingStatus('Stripe checkout is ready. Redirecting now...');
      setAccessGateStatus('Stripe checkout is ready. If it does not open automatically, tap the secure checkout link below.');
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.location.href = checkoutUrl;
        return;
      }
      window.setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 100);
    } catch (error) {
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.close();
      }
      const message = error instanceof Error ? error.message : 'Stripe checkout could not be opened.';
      logDiagnosticEvent('error', 'stripe-checkout', message, error);
      setBillingStatus(message);
      setAccessGateStatus(`Payment setup needs attention: ${message}`);
    }
  };

  const handleOpenStripeBillingPortal = async () => {
    if (!parentCloudSession.signedIn) {
      setBillingStatus('Sign in with a parent Firebase account before opening billing management.');
      setAccessGateStatus('Sign in with a parent Firebase account before opening billing management.');
      return;
    }

    setBillingStatus('Opening secure Stripe billing portal...');
    setAccessGateStatus('Opening secure Stripe billing portal...');
    try {
      await openStripeBillingPortal(parentCloudSession);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stripe billing portal could not be opened.';
      logDiagnosticEvent('warn', 'stripe-portal', message, error);
      setBillingStatus(message);
      setAccessGateStatus(`Billing management needs attention: ${message}`);
    }
  };

  const handleRefreshBillingAccess = async () => {
    if (!parentCloudSession.signedIn || !parentCloudSession.familyId) {
      setBillingStatus('Sign in with a parent Firebase account before refreshing Stripe status.');
      setAccessGateStatus('Sign in with a parent Firebase account before refreshing Stripe status.');
      return;
    }

    try {
      const access = await refreshBillingAccess('Refreshing Stripe trial and subscription status...');
      setAccessGateStatus(
        access?.accessSource === 'owner_comped' || access?.comped
          ? 'Owner access is verified. You can continue learning with no Stripe payment required.'
          : access
          ? 'Stripe access is verified. You can continue learning.'
          : 'No active Stripe trial or subscription is attached to this parent account yet.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Stripe status could not be refreshed.';
      logDiagnosticEvent('warn', 'stripe-refresh', message, error);
      setBillingStatus(message);
      setAccessGateStatus(`Stripe status needs attention: ${message}`);
    }
  };

  const hasPaidAccess = () => {
    if (hasDevAccessOverride()) return true;
    return Boolean(
      parentCloudSession.signedIn &&
      parentCloudSession.familyId &&
      familyAccess?.familyId === parentCloudSession.familyId &&
      familyAccess.billingAccessActive &&
      (
        familyAccess.verifiedByBillingApi ||
        familyAccess.verifiedOwnerEmail ||
        Boolean(familyAccess.checkoutCompletedAt)
      )
    );
  };

  const runPaidAccessAction = (action: PaidAccessAction) => {
    if (action.type === 'room') {
      enterRoomUnlocked(action.room, action.unitId);
      return;
    }

    stopSpeaking();
    setShowGameArcade(true);
  };

  const requestPaidAccess = (action: PaidAccessAction) => {
    if (hasPaidAccess()) {
      runPaidAccessAction(action);
      return;
    }

    stopSpeaking();
    setPendingAccessAction(action);
    setShowAccessGate(true);
    if (!parentCloudSession.signedIn) {
      setAccessGateStatus('A parent needs to sign in or create an account before kids can enter learning sections.');
      return;
    }

    setAccessGateStatus('Checking parent account access. If no owner access, trial, or subscription is active, choose a monthly plan to open this section.');
  };

  const continueAfterAccess = () => {
    if (!pendingAccessAction) {
      setShowAccessGate(false);
      return;
    }
    if (!hasPaidAccess()) {
      setAccessGateStatus('Refresh parent account access or choose a plan to start the 3-day trial before this section opens.');
      return;
    }
    const action = pendingAccessAction;
    setPendingAccessAction(null);
    setShowAccessGate(false);
    runPaidAccessAction(action);
  };

  const handleAccessCreateParentAccount = async () => {
    if (!accessEmail.trim() || accessPassword.length < 6) {
      setAccessGateStatus('Enter a parent email and a password with at least 6 characters.');
      return;
    }
    setAccessBusy(true);
    setAccessGateStatus('Creating parent account...');
    try {
      await createParentAccount(accessEmail.trim(), accessPassword);
      setAccessGateStatus(
        isOwnerParentEmail(accessEmail)
          ? 'Parent account created. Checking owner access...'
          : 'Parent account created. Choose a plan to start the 3-day free trial.'
      );
    } catch (error) {
      logDiagnosticEvent('warn', 'access-parent-create', 'Parent account could not be created from access gate.', error);
      setAccessGateStatus(error instanceof Error ? error.message : 'Parent account could not be created.');
    } finally {
      setAccessBusy(false);
    }
  };

  const handleAccessSignInParentAccount = async () => {
    if (!accessEmail.trim() || accessPassword.length < 6) {
      setAccessGateStatus('Enter the parent email and password.');
      return;
    }
    setAccessBusy(true);
    setAccessGateStatus('Signing in parent...');
    try {
      await signInParentAccount(accessEmail.trim(), accessPassword);
      setAccessGateStatus(
        isOwnerParentEmail(accessEmail)
          ? 'Parent signed in. Checking owner access...'
          : 'Parent signed in. Choose a plan to start the 3-day free trial.'
      );
    } catch (error) {
      logDiagnosticEvent('warn', 'access-parent-signin', 'Parent sign-in failed from access gate.', error);
      setAccessGateStatus(error instanceof Error ? error.message : 'Parent sign-in failed.');
    } finally {
      setAccessBusy(false);
    }
  };

  const handleAccessSignInWithGoogle = async () => {
    setAccessBusy(true);
    setAccessGateStatus('Opening Google sign-in...');
    try {
      await signInParentWithGoogle();
      setAccessGateStatus('Parent signed in with Google. Checking account access...');
    } catch (error) {
      logDiagnosticEvent('warn', 'access-google-signin', 'Google sign-in failed from access gate.', error);
      setAccessGateStatus(error instanceof Error ? error.message : 'Google sign-in failed.');
    } finally {
      setAccessBusy(false);
    }
  };

  const handleResetProgress = () => {
    if (!window.confirm('Reset all local learning progress on this device? This cannot be undone.')) {
      return;
    }
    localStorage.removeItem(getProgressStorageKey(profileStorageScope, activeProfileId));
    localStorage.removeItem('kidGeniusVoiceCacheProfile');
    const activeProfile = profiles.find(profile => profile.id === activeProfileId) || profiles[0];
    setProgress(loadProgressForProfile(activeProfile, profileStorageScope));
    setShowParentDashboard(false);
    setCurrentRoom(RoomType.HUB);
  };

  const handleCreateChildProfile = (name: string, grade: GradeLevel) => {
    const cleanName = name.trim() || 'Learner';
    localStorage.setItem(getProgressStorageKey(profileStorageScope, activeProfileId), JSON.stringify(progress));
    const profile: ChildProfile = {
      id: createProfileId(),
      name: cleanName,
      grade,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    setProfiles(prev => [...prev, profile]);
    setActiveProfileId(profile.id);
    setProgress(loadProgressForProfile(profile, profileStorageScope));
    setCurrentRoom(RoomType.HUB);
    setShowParentDashboard(false);
    setShowPetSelection(true);
  };

  const handleSwitchChildProfile = (profileId: string) => {
    const nextProfile = profiles.find(profile => profile.id === profileId);
    if (!nextProfile || nextProfile.id === activeProfileId) {
      return;
    }
    localStorage.setItem(getProgressStorageKey(profileStorageScope, activeProfileId), JSON.stringify(progress));
    const updatedProfiles = profiles.map(profile => (
      profile.id === nextProfile.id
        ? { ...profile, lastActiveAt: Date.now() }
        : profile
    ));
    const updatedProfile = updatedProfiles.find(profile => profile.id === nextProfile.id) || nextProfile;
    setProfiles(updatedProfiles);
    setActiveProfileId(nextProfile.id);
    setProgress(loadProgressForProfile(updatedProfile, profileStorageScope));
    setCurrentRoom(RoomType.HUB);
    setShowParentDashboard(false);
  };

  const handleUpdateChildProfile = (profileId: string, name: string, grade: GradeLevel) => {
    const cleanName = name.trim() || 'Learner';
    setProfiles(prev => prev.map(profile => (
      profile.id === profileId
        ? { ...profile, name: cleanName, grade, lastActiveAt: Date.now() }
        : profile
    )));
    if (profileId === activeProfileId) {
      setProgress(prev => ({
        ...prev,
        childName: cleanName,
        currentGrade: grade,
        currentLevel: gradeToLevel[grade],
        memberId: profileId,
      }));
    }
  };

  // Handle grade selection
  const handleGradeSelected = (grade: GradeLevel) => {
    const cleanChildName = childProfileNameDraft.trim() || 'Learner';
    setProfiles(prev => prev.map(profile => (
      profile.id === activeProfileId
        ? { ...profile, name: cleanChildName, grade, lastActiveAt: Date.now() }
        : profile
    )));
    setProgress(prev => ({
      ...prev,
      childName: cleanChildName,
      currentGrade: grade,
      currentLevel: gradeToLevel[grade],
      memberId: activeProfileId,
    }));

    speak(`Great! ${cleanChildName} is in ${grade}. Let's learn together!`);
    setShowGradeSelection(false);

    // If no pet, show pet selection next
    if (!progress.pet) {
      setShowPetSelection(true);
    }
  };

  const handlePetSelected = (pet: VirtualPet) => {
    setProgress(prev => ({ ...prev, pet }));
    setShowPetSelection(false);
    speak(`Welcome to Kid Genius World! ${pet.name} is excited to learn with you!`);
  };

  const resolveUnitForRoom = (room: RoomType, requestedUnitId?: string) => {
    const currentGradeUnits = getUnitsForGrade(progress.currentGrade);
    const requestedUnit = requestedUnitId
      ? currentGradeUnits.find(unit => unit.id === requestedUnitId)
      : undefined;

    if (requestedUnit) return requestedUnit;

    const completedUnitIds = new Set(progress.completedUnitIds || []);
    const unitPracticeCounts = progress.unitPracticeCounts || {};
    return currentGradeUnits
      .filter(unit => unit.room === room)
      .sort((first, second) => {
        const firstCompleted = completedUnitIds.has(first.id) ? 1 : 0;
        const secondCompleted = completedUnitIds.has(second.id) ? 1 : 0;
        if (firstCompleted !== secondCompleted) return firstCompleted - secondCompleted;

        const firstPractice = unitPracticeCounts[first.id] || 0;
        const secondPractice = unitPracticeCounts[second.id] || 0;
        if (firstPractice !== secondPractice) return firstPractice - secondPractice;

        return first.reviewCycleDays - second.reviewCycleDays;
      })[0];
  };

  const enterRoomUnlocked = (room: RoomType, unitId?: string) => {
    stopSpeaking();
    const resolvedUnit = resolveUnitForRoom(room, unitId);
    setActiveUnitId(resolvedUnit?.id || null);
    setShowMissionFocus(false);
    setShowLessonIntro(Boolean(resolvedUnit && room !== RoomType.HUB));
    setProgress(prev => {
      const nextProgress = {
        ...prev,
        dailyStats: updateDailyStats(prev.dailyStats, { roomsVisited: [room] }),
        gradeRoomVisits: {
          ...(prev.gradeRoomVisits || {}),
          [String(prev.currentLevel)]: Array.from(new Set([
            ...(prev.gradeRoomVisits?.[String(prev.currentLevel)] || []),
            room,
          ])),
        },
      };

      return checkAchievements(nextProgress);
    });
    setCurrentRoom(room);
    setGuideTrigger(p => p + 1);
  };

  const handleEnterRoom = (room: RoomType, unitId?: string) => {
    requestPaidAccess({ type: 'room', room, unitId });
  };

  const handleBack = () => {
    stopSpeaking();
    setCurrentRoom(RoomType.HUB);
    setActiveUnitId(null);
    setShowMissionFocus(false);
    setShowLessonIntro(false);
    setShowDashboard(false);
    setShowParentDashboard(false);
    setShowGameArcade(false);
    setGuideTrigger(p => p + 1);
  };

  const getCurrentHoliday = (): Holiday => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    if (month === 9 && day >= 25) return Holiday.HALLOWEEN;
    if (month === 10 && day >= 20 && day <= 30) return Holiday.THANKSGIVING;
    if (month === 11 && day >= 15) return Holiday.CHRISTMAS;
    if (month === 0 && day <= 7) return Holiday.NEW_YEAR;
    if (month === 1 && day >= 10 && day <= 14) return Holiday.VALENTINES;
    if (month === 3 && day >= 1 && day <= 21) return Holiday.EASTER;
    if (month === 6 && day >= 1 && day <= 7) return Holiday.INDEPENDENCE_DAY;
    if (month === 7 && day >= 15) return Holiday.BACK_TO_SCHOOL;
    return Holiday.NONE;
  };

  const prepareLearningReflection = (
    subject?: string,
    roomOverride?: RoomType,
    reflectionOverride: LearningReflectionOverride = {}
  ): LearningReflection => {
    const activeUnit = activeUnitId
      ? getUnitsForGrade(progress.currentGrade).find(unit => unit.id === activeUnitId)
      : undefined;
    const currentPracticeCount = activeUnitId ? (progress.unitPracticeCounts?.[activeUnitId] || 0) : 0;
    const nextPracticeCount = activeUnitId ? Math.min(currentPracticeCount + 1, MASTERED_PRACTICE_TARGET) : 1;
    const reflectionRoom = roomOverride || currentRoom;
    const roomLabel = roomReflectionLabels[reflectionRoom] || (subject ? subject.replace(/^\w/, letter => letter.toUpperCase()) : 'Learning');

    return {
      roomLabel,
      title: reflectionOverride.title || activeUnit?.title || `${roomLabel} practice`,
      objective: reflectionOverride.objective || activeUnit?.objective || `You practiced ${roomLabel.toLowerCase()} and earned progress toward your next goal.`,
      parentActivity: reflectionOverride.parentActivity || activeUnit?.parentActivity,
      successCheck: reflectionOverride.successCheck || activeUnit?.successCheck,
      practiceCount: nextPracticeCount,
      mastered: Boolean(activeUnitId && nextPracticeCount >= MASTERED_PRACTICE_TARGET),
    };
  };

  const addSticker = (
    subject?: string,
    roomOverride?: RoomType,
    reflectionOverride: LearningReflectionOverride = {},
    showReflectionNow = false
  ) => {
    playSuccess();
    const journalCreatedAt = Date.now();
    const journalEntryId = `journal-${journalCreatedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const reflection = {
      ...prepareLearningReflection(subject, roomOverride, reflectionOverride),
      journalEntryId,
    };

    const holiday = getCurrentHoliday();
    const seasonalStickers = SEASONAL_STICKERS[holiday];
    const availableStickers = [...STICKER_COLLECTION, ...seasonalStickers];

    setProgress(prev => {
      // Find a sticker we don't have yet, prefer new ones
      const uncollected = availableStickers.filter(s => !prev.stickers.includes(s));
      let nextSticker = '';

      if (uncollected.length > 0 && Math.random() > 0.2) {
        nextSticker = uncollected[Math.floor(Math.random() * uncollected.length)];
      } else {
        nextSticker = availableStickers[Math.floor(Math.random() * availableStickers.length)];
      }

      const stickersNeeded = gradeProgressionThresholds[prev.currentLevel] || Number.POSITIVE_INFINITY;
      let newLevel = prev.currentLevel;
      let newGrade = prev.currentGrade;
      const newStickers = [...prev.stickers];
      const earnedNewSticker = !newStickers.includes(nextSticker);
      const nextUnitPracticeCounts = { ...(prev.unitPracticeCounts || {}) };
      if (activeUnitId) {
        nextUnitPracticeCounts[activeUnitId] = (nextUnitPracticeCounts[activeUnitId] || 0) + 1;
      }
      const practicedActiveUnitToMastery = activeUnitId && nextUnitPracticeCounts[activeUnitId] >= MASTERED_PRACTICE_TARGET;
      const nextCompletedUnitIds = practicedActiveUnitToMastery
        ? Array.from(new Set([...(prev.completedUnitIds || []), activeUnitId]))
        : (prev.completedUnitIds || []);
      const journalRoom = roomOverride || currentRoom;
      const journalRoomLabel = roomReflectionLabels[journalRoom] || (
        subject ? subject.replace(/^\w/, letter => letter.toUpperCase()) : 'Learning'
      );
      const journalUnit = activeUnitId
        ? getUnitsForGrade(prev.currentGrade).find(unit => unit.id === activeUnitId)
        : undefined;
      const journalPracticeCount = activeUnitId ? Math.min(nextUnitPracticeCounts[activeUnitId] || 1, MASTERED_PRACTICE_TARGET) : 1;
      const journalEntry: LearningJournalEntry = {
        id: journalEntryId,
        createdAt: journalCreatedAt,
        room: journalRoom,
        roomLabel: journalRoomLabel,
        unitId: journalUnit?.id,
        unitTitle: reflectionOverride.title || journalUnit?.title || `${journalRoomLabel} practice`,
        objective: reflectionOverride.objective || journalUnit?.objective || `Practiced ${journalRoomLabel.toLowerCase()} and explained one idea.`,
        successCheck: reflectionOverride.successCheck || journalUnit?.successCheck,
        parentActivity: reflectionOverride.parentActivity || journalUnit?.parentActivity,
        practiceCount: journalPracticeCount,
        mastered: Boolean(activeUnitId && journalPracticeCount >= MASTERED_PRACTICE_TARGET),
      };
      journalEntry.lessonPhase = 'Exit Ticket';
      journalEntry.exitTicket = journalEntry.successCheck || 'Teach back the strategy in your own words.';
      journalEntry.teacherNote = buildTeacherJournalNote(journalEntry);
      journalEntry.teacherNextStep = buildTeacherNextStep(journalEntry);
      const nextLearningJournal = [journalEntry, ...(prev.learningJournal || [])].slice(0, 25);

      if (earnedNewSticker) {
        newStickers.push(nextSticker);
      }

      const progressForMasteryCheck: UserProgress = {
        ...prev,
        stickers: newStickers,
      };

      if (
        newStickers.length >= stickersNeeded &&
        hasBalancedGradeMastery(progressForMasteryCheck, prev.currentLevel) &&
        hasVisitedEveryRoomForGrade(progressForMasteryCheck, prev.currentLevel) &&
        prev.currentLevel < 7
      ) {
        newLevel = Math.min(prev.currentLevel + 1, 7);
        const grades = [
          GradeLevel.PRE_K, GradeLevel.KINDERGARTEN, GradeLevel.FIRST_GRADE,
          GradeLevel.SECOND_GRADE, GradeLevel.THIRD_GRADE, GradeLevel.FOURTH_GRADE, GradeLevel.FIFTH_GRADE
        ];
        newGrade = grades[newLevel - 1] || GradeLevel.FIFTH_GRADE;
        speak(`Congratulations! You are now in ${newGrade}!`);
      }

      let updatedPet = prev.pet;
      if (updatedPet) {
        updatedPet = {
          ...updatedPet,
          xp: updatedPet.xp + 15,
          happiness: Math.min(100, updatedPet.happiness + 5),
        };

        const petXpNeeded = updatedPet.level * 100;
        if (updatedPet.xp >= petXpNeeded) {
          updatedPet.level = Math.min(50, updatedPet.level + 1);
          updatedPet.xp = updatedPet.xp - petXpNeeded;
        }
      }

      let newProgress: UserProgress = {
        ...prev,
        stickers: newStickers,
        completedUnitIds: nextCompletedUnitIds,
        unitPracticeCounts: nextUnitPracticeCounts,
        learningJournal: nextLearningJournal,
        currentLevel: newLevel,
        currentGrade: newGrade,
        xp: prev.xp + 10,
        totalXP: (prev.totalXP || 0) + 10,
        pet: updatedPet,
        dailyStats: updateDailyStats(prev.dailyStats, {
          problemsAttempted: subject ? 1 : 0,
          problemsCorrect: subject ? 1 : 0,
          roomsVisited: roomOverride ? [roomOverride] : [],
          stickersEarned: earnedNewSticker ? 1 : 0,
        }),
      };

      newProgress = checkAchievements(newProgress);
      return newProgress;
    });
    const isClassroomPracticeUnit = Boolean(activeUnitId && currentRoom !== RoomType.STORYBOOK);
    if (showReflectionNow || !isClassroomPracticeUnit || reflection.mastered) {
      setLearningReflection(reflection);
    }
  };

  const recordLearningReflectionChoice = (choice: string) => {
    if (!learningReflection?.journalEntryId) {
      return;
    }

    setProgress(prev => ({
      ...prev,
      learningJournal: (prev.learningJournal || []).map(entry => (
        entry.id === learningReflection.journalEntryId
          ? { ...entry, childReflection: choice, childReflectionAt: Date.now() }
          : entry
      )),
    }));
  };

  const handleMathReward = () => {
    setProgress(p => {
      const newProgress = { ...p, mathScore: p.mathScore + 1 };
      return checkAchievements(newProgress);
    });
    recordMathSkill();
    addSticker('math');
  };

  const handleReadingReward = () => {
    setProgress(p => {
      const newProgress = { ...p, readingScore: p.readingScore + 1 };
      return checkAchievements(newProgress);
    });
    recordReadingSkill('sightWords');
    addSticker('reading');
  };

  const handleScienceReward = () => {
    setProgress(p => {
      const newProgress = { ...p, scienceScore: (p.scienceScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    recordSubjectSkill('scienceSkills', 5000);
    addSticker('science');
  };

  const handleGeographyReward = () => {
    setProgress(p => {
      const newProgress = { ...p, geographyScore: (p.geographyScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    recordSubjectSkill('geographySkills', 4500);
    addSticker('geography');
  };

  const handleCodingReward = () => {
    setProgress(p => {
      const newProgress = { ...p, codingScore: (p.codingScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    recordSubjectSkill('codingSkills', 6500);
    addSticker('coding');
  };

  const handleLanguageReward = () => {
    setProgress(p => {
      const newProgress = { ...p, languageScore: (p.languageScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    recordSubjectSkill('languageSkills', 4500);
    addSticker('language');
  };

  const handleStorybookReward = () => {
    setProgress(p => {
      const newProgress = { ...p, storybookScore: (p.storybookScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    recordReadingSkill('comprehension');
    addSticker('reading');
  };

  const handleMusicReward = () => {
    setProgress(p => {
      const newProgress = { ...p, musicScore: (p.musicScore || 0) + 1 };
      return checkAchievements(newProgress);
    });
    addSticker('music');
  };

  const handleCreativeReward = (subject: string) => {
    addSticker(subject, currentRoom, {}, true);
  };

  const handleGameArcadeReward = (room: RoomType, gameTitle: string, gameId: string, combo: number) => {
    const subject = `${gameTitle} arcade`;
    const arcadeJournalOverride: LearningReflectionOverride = {
      title: `${gameTitle} arcade mastery run`,
      objective: `Completed a 3-round ${gameTitle} arcade mission with a ${combo} combo.`,
      successCheck: `Ask the child to explain one ${gameTitle} strategy from the game.`,
      parentActivity: `Replay one ${gameTitle} problem together and ask what changed after each choice.`,
    };

    if (room === RoomType.MATH) {
      setProgress(p => checkAchievements({
        ...p,
        mathScore: p.mathScore + 1,
        arcadeProgress: buildNextArcadeProgress(p, gameId, combo),
      }));
      recordMathSkill();
      addSticker('math arcade', room, arcadeJournalOverride);
      return;
    }

    if (room === RoomType.READING) {
      setProgress(p => checkAchievements({
        ...p,
        readingScore: p.readingScore + 1,
        arcadeProgress: buildNextArcadeProgress(p, gameId, combo),
      }));
      recordReadingSkill('phonics');
      addSticker('reading arcade', room, arcadeJournalOverride);
      return;
    }

    if (room === RoomType.STORYBOOK) {
      setProgress(p => checkAchievements({
        ...p,
        storybookScore: (p.storybookScore || 0) + 1,
        arcadeProgress: buildNextArcadeProgress(p, gameId, combo),
      }));
      recordReadingSkill('comprehension');
      addSticker('story arcade', room, arcadeJournalOverride);
      return;
    }

    if (room === RoomType.CODING) {
      setProgress(p => checkAchievements({
        ...p,
        codingScore: (p.codingScore || 0) + 1,
        arcadeProgress: buildNextArcadeProgress(p, gameId, combo),
      }));
      recordSubjectSkill('codingSkills', 5000);
      addSticker('coding arcade', room, arcadeJournalOverride);
      return;
    }

    if (room === RoomType.MUSIC) {
      setProgress(p => checkAchievements({
        ...p,
        musicScore: (p.musicScore || 0) + 1,
        arcadeProgress: buildNextArcadeProgress(p, gameId, combo),
      }));
      addSticker('music arcade', room, arcadeJournalOverride);
      return;
    }

    setProgress(p => ({
      ...p,
      arcadeProgress: buildNextArcadeProgress(p, gameId, combo),
    }));
    addSticker(subject, room, arcadeJournalOverride);
  };

  const handleUpdatePet = (pet: VirtualPet) => {
    setProgress(p => ({ ...p, pet }));
  };

  const handleUpdateAccessibility = (settings: AccessibilitySettings) => {
    setProgress(p => ({ ...p, accessibility: settings }));
  };

  const handleUpdatePrivacy = (settings: PrivacySettings) => {
    const wasCloudSyncOff = !(progress.privacy || DEFAULT_PRIVACY_SETTINGS).allowCloudSync;
    setProgress(p => ({ ...p, privacy: settings }));
    if (wasCloudSyncOff && settings.allowCloudSync) {
      setCloudSyncStatus('Cloud sync is on. Kid Genius World will save completed lessons to Firebase automatically.');
    }
  };

  const handleUpdateLearningGoals = (weeklyGoalMinutes: number, dailySessionLimitMinutes: number) => {
    setProgress(p => ({
      ...p,
      weeklyGoalMinutes: Math.max(10, Math.min(600, Math.round(weeklyGoalMinutes))),
      dailySessionLimitMinutes: Math.max(5, Math.min(120, Math.round(dailySessionLimitMinutes))),
    }));
  };

  // Apply accessibility styles
  const getAccessibilityClasses = () => {
    const classes: string[] = [];
    const a = progress.accessibility || DEFAULT_ACCESSIBILITY;

    if (a.fontSize === 'large') classes.push('text-lg');
    if (a.fontSize === 'xlarge') classes.push('text-xl');
    if (a.highContrast) classes.push('high-contrast');
    if (a.dyslexiaFont) classes.push('font-dyslexia');
    if (a.reduceMotion) classes.push('reduce-motion');

    return classes.join(' ');
  };

  // Start Screen
  if (legalView) {
    return <LegalInfo type={legalView} onBack={() => setLegalView(null)} />;
  }

  // Start Screen
  if (!hasStarted) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 flex items-center justify-center flex-col gap-5 overflow-hidden relative px-4">

        {/* ============ SKY LAYER ============ */}

        {/* Giant Sun with Rays */}
        <div className="absolute top-[-36px] right-[-38px] w-36 h-36 sm:w-48 sm:h-48 z-0 opacity-90">
          {/* Sun rays - rotating */}
          <div className="absolute inset-0 sun-rays">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-32 bg-gradient-to-t from-yellow-400 to-transparent sun-ray rounded-full"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                  transformOrigin: 'center bottom',
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
          {/* Sun core */}
          <div className="absolute inset-4 text-9xl sun-glow flex items-center justify-center">
            ☀️
          </div>
        </div>

        {/* Clouds - Multiple layers drifting */}
        <div className="absolute top-10 left-0 text-5xl sm:text-7xl animate-cloud-drift opacity-60" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="absolute top-24 left-0 text-6xl sm:text-8xl animate-cloud-drift-slow opacity-45" style={{ animationDelay: '5s' }}>☁️</div>
        <div className="absolute top-36 left-0 hidden sm:block text-6xl animate-cloud-drift-fast opacity-50" style={{ animationDelay: '10s' }}>☁️</div>

        {/* Rainbow */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-6xl sm:text-8xl animate-rainbow opacity-80">🌈</div>

        {/* Flying birds */}
        <div className="absolute top-28 left-0 text-3xl animate-bird" style={{ animationDelay: '0s' }}>🕊️</div>
        <div className="absolute top-36 left-0 text-2xl animate-bird" style={{ animationDelay: '3s' }}>🐦</div>

        {/* ============ INSECTS LAYER ============ */}

        {/* Bees flying in patterns */}
        <div className="absolute top-[30%] left-[15%] hidden sm:block text-4xl animate-bee z-10">🐝</div>
        <div className="absolute top-[45%] right-[20%] hidden sm:block text-3xl animate-bee-2 z-10">🐝</div>
        <div className="absolute top-[25%] right-[35%] hidden sm:block text-4xl animate-bee-3 z-10">🐝</div>
        <div className="absolute bottom-[40%] left-[25%] hidden sm:block text-3xl animate-bee z-10" style={{ animationDelay: '2s' }}>🐝</div>

        {/* Butterflies fluttering */}
        <div className="absolute top-[35%] left-[10%] hidden sm:block text-5xl animate-butterfly z-10">🦋</div>
        <div className="absolute top-[50%] right-[15%] hidden sm:block text-4xl animate-butterfly-2 z-10">🦋</div>
        <div className="absolute top-[20%] left-[40%] hidden sm:block text-5xl animate-butterfly-3 z-10">🦋</div>
        <div className="absolute bottom-[35%] right-[30%] hidden sm:block text-4xl animate-butterfly z-10" style={{ animationDelay: '4s' }}>🦋</div>

        {/* Ladybugs */}
        <div className="absolute bottom-[25%] left-[8%] hidden sm:block text-3xl animate-float z-10">🐞</div>
        <div className="absolute bottom-[30%] right-[12%] hidden sm:block text-2xl animate-float-delayed z-10">🐞</div>

        {/* Sparkles scattered around */}
        <div className="absolute top-[20%] left-[30%] text-2xl animate-sparkle">✨</div>
        <div className="absolute top-[40%] right-[25%] text-3xl animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-[60%] left-[20%] text-2xl animate-sparkle" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute top-[30%] right-[40%] text-2xl animate-sparkle" style={{ animationDelay: '1.5s' }}>💫</div>
        <div className="absolute bottom-[45%] left-[45%] text-3xl animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</div>

        {/* ============ GROUND LAYER ============ */}

        {/* Grass gradient at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-green-500 via-green-400 to-transparent z-0" />

        {/* Flowers swaying */}
        <div className="absolute bottom-4 left-[5%] text-5xl animate-sway z-10">🌸</div>
        <div className="absolute bottom-6 left-[15%] text-4xl animate-sway z-10" style={{ animationDelay: '0.3s' }}>🌷</div>
        <div className="absolute bottom-4 left-[25%] text-5xl animate-sway z-10" style={{ animationDelay: '0.6s' }}>🌻</div>
        <div className="absolute bottom-8 left-[35%] text-4xl animate-sway z-10" style={{ animationDelay: '0.9s' }}>🌺</div>
        <div className="absolute bottom-4 right-[35%] text-5xl animate-sway z-10" style={{ animationDelay: '0.2s' }}>🌼</div>
        <div className="absolute bottom-6 right-[25%] text-4xl animate-sway z-10" style={{ animationDelay: '0.5s' }}>🌸</div>
        <div className="absolute bottom-4 right-[15%] text-5xl animate-sway z-10" style={{ animationDelay: '0.8s' }}>🌷</div>
        <div className="absolute bottom-8 right-[5%] text-4xl animate-sway z-10" style={{ animationDelay: '1.1s' }}>🌻</div>

        {/* Little creatures in grass */}
        <div className="absolute bottom-16 left-[10%] hidden sm:block text-3xl animate-float z-10">🐌</div>
        <div className="absolute bottom-20 right-[18%] hidden sm:block text-2xl animate-float-delayed z-10">🐛</div>

        {/* Trees on sides */}
        <div className="absolute bottom-0 left-2 text-8xl z-5">🌳</div>
        <div className="absolute bottom-0 right-2 text-8xl z-5">🌲</div>

        {/* ============ CONTENT LAYER ============ */}

        {/* Title */}
        <div className="text-center z-20 mt-2 max-w-[760px]">
          <h1 className="text-5xl sm:text-6xl md:text-8xl leading-[0.92] font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-title-bounce">
            Kid Genius World
          </h1>
          <p className="text-xl sm:text-2xl text-white/95 mt-4 font-semibold drop-shadow-lg flex items-center justify-center gap-2">
            <span className="animate-sparkle">✨</span>
            Learning is an Adventure!
            <span className="animate-sparkle" style={{ animationDelay: '0.7s' }}>✨</span>
          </p>
          <p className="mt-3 inline-flex rounded-full bg-white/85 px-4 py-2 text-sm font-black text-slate-700 shadow-lg">
            Kid Genius World by CrateShip Studios
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="z-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-300 text-yellow-900 w-full max-w-[360px] sm:max-w-none sm:w-auto px-8 sm:px-14 py-5 sm:py-7 rounded-[32px] sm:rounded-full text-2xl sm:text-3xl font-bold shadow-[0_10px_0_rgb(161,98,7),0_15px_30px_rgba(0,0,0,0.3)] active:translate-y-2 active:shadow-[0_5px_0_rgb(161,98,7)] transition-all flex items-center justify-center gap-4 hover:scale-105"
        >
          <Play size={44} fill="currentColor" />
          Start Adventure!
          <Sparkles size={36} className="animate-pulse" />
        </button>

        <InstallAppButton className="z-20" />

        {/* Features */}
        <div className="z-20 grid grid-cols-2 sm:flex gap-3 mt-2 flex-wrap justify-center w-full max-w-[560px]">
          {[
            { emoji: '🔢', label: 'Math' },
            { emoji: '📚', label: 'Reading' },
            { emoji: '📖', label: 'Stories' },
            { emoji: '🔬', label: 'Science' },
            { emoji: '🌍', label: 'Geography' },
            { emoji: '💻', label: 'Coding' },
            { emoji: '🗣️', label: 'Languages' }
          ].map((item, i) => (
            <span
              key={item.label}
              className="bg-white/90 px-4 sm:px-5 py-2 rounded-full text-gray-700 font-semibold shadow-lg hover:scale-105 hover:bg-white transition-all cursor-default text-center text-sm sm:text-base"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {item.emoji} {item.label}
            </span>
          ))}
        </div>

        {/* Cute mascot hint */}
        <div className="absolute bottom-10 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-2 text-white/80 text-sm animate-float">
          <span className="text-2xl">🎓</span>
          Choose your learning buddy inside!
          <span className="text-2xl">🐾</span>
        </div>

        <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs font-bold text-white/90">
          <span>Copyright 2026 CrateShip Studios</span>
          <span className="hidden sm:inline">|</span>
          <a href="/blog/" className="underline decoration-white/50 hover:text-white">Blog</a>
          <button onClick={() => setLegalView('privacy')} className="underline decoration-white/50 hover:text-white">Privacy</button>
          <button onClick={() => setLegalView('terms')} className="underline decoration-white/50 hover:text-white">Terms</button>
          <button onClick={() => setLegalView('support')} className="underline decoration-white/50 hover:text-white">Parent Support</button>
        </div>
      </div>
    );
  }

  // Grade Selection Screen
  if (showGradeSelection && parentOnboarded && parentCloudSession.signedIn) {
    const grades = [
      { grade: GradeLevel.PRE_K, emoji: '🌱', age: 'Age 3-4', color: 'from-pink-400 to-rose-500' },
      { grade: GradeLevel.KINDERGARTEN, emoji: '🌸', age: 'Age 5-6', color: 'from-purple-400 to-indigo-500' },
      { grade: GradeLevel.FIRST_GRADE, emoji: '🌻', age: 'Age 6-7', color: 'from-yellow-400 to-orange-500' },
      { grade: GradeLevel.SECOND_GRADE, emoji: '🌈', age: 'Age 7-8', color: 'from-green-400 to-teal-500' },
      { grade: GradeLevel.THIRD_GRADE, emoji: '🚀', age: 'Age 8-9', color: 'from-blue-400 to-cyan-500' },
      { grade: GradeLevel.FOURTH_GRADE, emoji: '⭐', age: 'Age 9-10', color: 'from-indigo-400 to-purple-500' },
      { grade: GradeLevel.FIFTH_GRADE, emoji: '🏆', age: 'Age 10-11', color: 'from-amber-400 to-red-500' },
    ];

    return (
      <div className="w-screen h-screen bg-gradient-to-b from-sky-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎒</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
            Create your child profile
          </h1>
          <p className="text-white/90 text-lg">This profile stays with the signed-in parent account.</p>
        </div>

        <div className="mb-5 w-full max-w-xl rounded-3xl border-4 border-white/30 bg-white/95 p-4 shadow-xl">
          <label className="block text-sm font-black uppercase tracking-[0.16em] text-indigo-600" htmlFor="child-profile-name">
            Child name
          </label>
          <input
            id="child-profile-name"
            value={childProfileNameDraft}
            onChange={(event) => setChildProfileNameDraft(event.target.value.slice(0, 32))}
            placeholder="Enter your child's name"
            className="mt-2 w-full rounded-2xl border-2 border-indigo-100 px-4 py-3 text-lg font-bold text-slate-900 outline-none focus:border-indigo-500"
          />
          <p className="mt-2 text-sm font-semibold text-slate-500">Choose the grade next. Parents can add more children from the dashboard.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
          {grades.map(({ grade, emoji, age, color }) => (
            <button
              key={grade}
              onClick={() => handleGradeSelected(grade)}
              className={`bg-gradient-to-br ${color} p-6 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-2 border-4 border-white/30`}
            >
              <span className="text-5xl">{emoji}</span>
              <span className="text-xl font-bold text-white drop-shadow">{grade}</span>
              <span className="text-sm text-white/80">{age}</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-white/70 text-sm">
          Don't worry - you can change this later in settings!
        </p>
      </div>
    );
  }

  // Pet Selection Screen
  if (showPetSelection) {
    return <PetSelection onSelect={handlePetSelected} />;
  }

  // Dashboard Views
  if (showDashboard) {
    return <Dashboard progress={progress} onBack={handleBack} />;
  }

  if (showGameArcade) {
    return (
      <Suspense fallback={
        <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-white">
          <div className="rounded-3xl bg-white/10 px-6 py-5 text-center">
            <p className="font-black">Loading Game Arcade...</p>
          </div>
        </div>
      }>
        <GameArcade
          progress={progress}
          onBack={handleBack}
          onOpenRoom={(room) => {
            setShowGameArcade(false);
            handleEnterRoom(room);
          }}
          onReward={handleGameArcadeReward}
        />
      </Suspense>
    );
  }

  const parentSetupReady =
    parentCloudSession.signedIn &&
    Object.values(parentConsentChecks).every(Boolean) &&
    /^\d{4,8}$/.test(pinDraft) &&
    pinDraft === pinConfirmDraft;

  if (showParentWelcome) {
    return (
      <div className="relative min-h-screen w-screen overflow-y-auto bg-gradient-to-b from-sky-300 via-indigo-300 to-emerald-300 p-4 text-slate-900">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[8%] top-10 text-7xl opacity-70">☁️</div>
          <div className="absolute right-[10%] top-16 text-8xl opacity-70">🌈</div>
          <div className="absolute bottom-12 left-[12%] text-7xl opacity-80">🎒</div>
          <div className="absolute bottom-16 right-[14%] text-7xl opacity-80">⭐</div>
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center">
          <div className="grid w-full overflow-hidden rounded-[34px] border-4 border-white/80 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-sky-600 to-emerald-500 p-6 text-white">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-100">Parent Welcome</p>
                <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Start with a grown-up account</h1>
                <p className="mt-3 text-base font-semibold text-white/90">
                  Parents sign in first. Then Kid Genius World loads the right child profile, lessons, stars, and progress for that family.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    ['1', 'Parent signs in'],
                    ['2', 'Choose child profile'],
                    ['3', 'Start school day'],
                  ].map(([step, label]) => (
                    <div key={step} className="rounded-2xl border border-white/20 bg-white/15 p-3">
                      <p className="text-2xl font-black">{step}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-sky-100">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-3xl border border-white/20 bg-white/15 p-4">
                  <p className="text-sm font-black">Kid Genius World by CrateShip Studios</p>
                  <p className="mt-1 text-xs font-semibold text-white/80">Child setup, billing, and progress stay parent-controlled.</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-3xl shadow-sm">🎓</div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Sign in or create account</h2>
                  <p className="text-sm font-semibold text-slate-600">This is for parents only. Kids start after the account is ready.</p>
                </div>
              </div>

              {parentCloudSession.signedIn ? (
                <div className="grid gap-3">
                  <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Signed in parent</p>
                    <p className="mt-1 break-words text-lg font-black text-emerald-950">{parentCloudSession.email || 'Parent account'}</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-900">
                      Continue to this family&apos;s child profiles, or sign out to use a different parent account.
                    </p>
                  </div>
                  <button
                    onClick={continueAfterParentWelcome}
                    disabled={setupParentAuthBusy}
                    className="rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg hover:bg-indigo-700"
                  >
                    Continue as Parent
                  </button>
                  <button
                    onClick={async () => {
                      setSetupParentAuthStatus('Signing out...');
                      await handleSignOutParentAccount();
                      setSetupParentAuthStatus('Signed out. Choose a parent account to continue.');
                    }}
                    disabled={setupParentAuthBusy}
                    className="rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-200"
                  >
                    Use Different Account
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <input
                    value={setupParentEmail}
                    onChange={(event) => setSetupParentEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="Parent email"
                    className="rounded-2xl border-2 border-sky-100 px-4 py-4 font-bold focus:border-sky-500 focus:outline-none"
                  />
                  <input
                    value={setupParentPassword}
                    onChange={(event) => setSetupParentPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    className="rounded-2xl border-2 border-sky-100 px-4 py-4 font-bold focus:border-sky-500 focus:outline-none"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={handleSetupSignInParentAccount}
                      disabled={setupParentAuthBusy}
                      className="rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Sign In Parent
                    </button>
                    <button
                      onClick={handleSetupCreateParentAccount}
                      disabled={setupParentAuthBusy}
                      className="rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-lg hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Create Account
                    </button>
                  </div>
                  <button
                    onClick={handleSetupSignInWithGoogle}
                    disabled={setupParentAuthBusy}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-black text-sky-900 shadow-sm hover:bg-sky-100 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Continue with Google
                  </button>
                </div>
              )}

              {setupParentAuthStatus && (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                  {setupParentAuthStatus}
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ['Privacy', () => setLegalView('privacy')],
                  ['Terms', () => setLegalView('terms')],
                  ['Support', () => setLegalView('support')],
                ].map(([label, action]) => (
                  <button
                    key={String(label)}
                    onClick={action as () => void}
                    className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
                  >
                    {String(label)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!parentOnboarded) {
    return (
      <div className="w-screen h-screen overflow-y-auto bg-slate-950 text-white">
        <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-sky-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={34} />
                <div>
                  <h1 className="text-3xl font-bold">Parent Setup</h1>
                  <p className="text-white/85">A quick grown-up review before kids start learning.</p>
                  <p className="mt-1 text-sm font-black text-white/90">Kid Genius World by CrateShip Studios</p>
                </div>
              </div>
            </div>
            <div className="p-6 grid md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <LockKeyhole className="text-indigo-600 mb-3" size={28} />
                <h2 className="font-bold text-lg mb-2">Parent Controls</h2>
                <p className="text-sm text-slate-600">The parent dashboard now uses a grown-up check before settings, data controls, and progress details open.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <BookOpen className="text-emerald-600 mb-3" size={28} />
                <h2 className="font-bold text-lg mb-2">Learning Path</h2>
                <p className="text-sm text-slate-600">The app recommends a daily mission, then lets kids explore stories, practice rooms, and reward play.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <ShieldCheck className="text-sky-600 mb-3" size={28} />
                <h2 className="font-bold text-lg mb-2">Privacy Notice</h2>
                <p className="text-sm text-slate-600">Progress starts on this device and can sync to Firebase after a parent signs in and turns on cloud sync.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <Sparkles className="text-amber-600 mb-3" size={28} />
                <h2 className="font-bold text-lg mb-2">Family Plan</h2>
                <p className="text-sm text-slate-600">Family access uses parent-only Firebase sign-in and Stripe checkout for the monthly plans.</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 mb-5">
                Kid Genius World is a CrateShip Studios learning app. Parent setup keeps the child experience gated while families review privacy, local progress storage, optional Firebase sync, saved media, and parent-only billing. Parent support is available at crateshipstudios@gmail.com.
              </div>
              <div className="flex justify-center gap-4 mb-4 text-sm font-bold text-indigo-700">
                <button onClick={() => setLegalView('privacy')} className="underline">Read Privacy Notice</button>
                <button onClick={() => setLegalView('terms')} className="underline">Read Terms</button>
                <button onClick={() => setLegalView('support')} className="underline">Parent Support</button>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 mb-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-sky-950">Step 1: Parent Account</h2>
                    <p className="mt-1 text-sm text-sky-900/75">
                      Create or sign in first. Child profiles, grades, and progress stay tied to this parent account.
                    </p>
                  </div>
                  {parentCloudSession.signedIn && (
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-sm">
                      Signed in: {parentCloudSession.email || 'Parent account'}
                    </div>
                  )}
                </div>

                {!parentCloudSession.signedIn && (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={setupParentEmail}
                      onChange={(event) => setSetupParentEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="Parent email"
                      className="rounded-xl border-2 border-sky-100 px-4 py-3 font-bold focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      value={setupParentPassword}
                      onChange={(event) => setSetupParentPassword(event.target.value)}
                      type="password"
                      autoComplete="current-password"
                      placeholder="Password"
                      className="rounded-xl border-2 border-sky-100 px-4 py-3 font-bold focus:border-sky-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSetupCreateParentAccount}
                        disabled={setupParentAuthBusy}
                        className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-black text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Create
                      </button>
                      <button
                        onClick={handleSetupSignInParentAccount}
                        disabled={setupParentAuthBusy}
                        className="rounded-xl bg-white px-4 py-3 text-sm font-black text-sky-700 shadow-sm hover:bg-sky-100 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        Sign In
                      </button>
                    </div>
                    <button
                      onClick={handleSetupSignInWithGoogle}
                      disabled={setupParentAuthBusy}
                      className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-black text-sky-800 shadow-sm hover:bg-sky-100 disabled:cursor-not-allowed disabled:text-slate-400 lg:col-span-3"
                    >
                      Continue with Google
                    </button>
                  </div>
                )}
                {setupParentAuthStatus && <p className="mt-3 text-sm font-bold text-sky-900">{setupParentAuthStatus}</p>}
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 mb-5">
                <h2 className="font-bold text-lg mb-2 text-indigo-950">Step 2: Parent Launch Checkpoints</h2>
                <p className="text-sm text-indigo-900/75 mb-3">
                  Confirm these before a child starts. This creates a local parent consent receipt for this browser.
                </p>
                <div className="grid gap-2">
                  {[
                    ['guardian', 'I am the parent or guardian supervising this child account.'],
                    ['policies', 'I reviewed the Privacy Notice and Terms of Use.'],
                    ['localStorage', 'I understand progress is stored locally in this browser unless a parent enables Firebase cloud sync.'],
                    ['supervisedMedia', 'I will supervise optional saved voice narration and illustrated story cover features.'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-start gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                      <input
                        type="checkbox"
                        checked={parentConsentChecks[key as keyof typeof parentConsentChecks]}
                        onChange={(event) => {
                          setParentConsentChecks(checks => ({
                            ...checks,
                            [key]: event.target.checked,
                          }));
                          setPinSetupError('');
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 mb-5">
                <h2 className="font-bold text-lg mb-2">Step 3: Create Parent PIN</h2>
                <p className="text-sm text-slate-600 mb-3">Use this PIN to open parent settings and data controls.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={pinDraft}
                    onChange={(event) => {
                      setPinDraft(event.target.value.replace(/\D/g, '').slice(0, 8));
                      setPinSetupError('');
                    }}
                    inputMode="numeric"
                    type="password"
                    placeholder="4-8 digit PIN"
                    className="rounded-xl border-2 border-slate-200 px-4 py-3 font-bold focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    value={pinConfirmDraft}
                    onChange={(event) => {
                      setPinConfirmDraft(event.target.value.replace(/\D/g, '').slice(0, 8));
                      setPinSetupError('');
                    }}
                    inputMode="numeric"
                    type="password"
                    placeholder="Confirm PIN"
                    className="rounded-xl border-2 border-slate-200 px-4 py-3 font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                {pinSetupError && <p className="text-sm text-red-600 mt-2">{pinSetupError}</p>}
              </div>
              <button
                onClick={handleParentOnboardingComplete}
                disabled={!parentSetupReady}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                  parentSetupReady
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={24} />
                Save Parent Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showParentDashboard) {
    return (
      <ParentDashboard
        progress={progress}
        onBack={handleBack}
        onUpdateAccessibility={handleUpdateAccessibility}
        onResetProgress={handleResetProgress}
        parentPin={parentPin}
        onUpdateParentPin={handleUpdateParentPin}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onCreateChildProfile={handleCreateChildProfile}
        onSwitchChildProfile={handleSwitchChildProfile}
        onUpdateChildProfile={handleUpdateChildProfile}
        onUpdatePrivacy={handleUpdatePrivacy}
        onUpdateLearningGoals={handleUpdateLearningGoals}
        cloudSession={parentCloudSession}
        cloudSyncStatus={cloudSyncStatus}
        onCreateParentAccount={handleCreateParentAccount}
        onSignInParentAccount={handleSignInParentAccount}
        onSignInParentWithGoogle={handleSignInParentWithGoogle}
        onSignOutParentAccount={handleSignOutParentAccount}
        onSyncProgressToCloud={handleSyncProgressToCloud}
        onStartStripeCheckout={handleStartStripeCheckout}
        onOpenStripeBillingPortal={handleOpenStripeBillingPortal}
        onRefreshBillingAccess={handleRefreshBillingAccess}
        billingStatus={billingStatus}
        billingAccess={familyAccess || undefined}
      />
    );
  }

  const selectedReflectionChoice = learningReflection?.journalEntryId
    ? progress.learningJournal?.find(entry => entry.id === learningReflection.journalEntryId)?.childReflection
    : undefined;
  const activeUnit = activeUnitId
    ? getUnitsForGrade(progress.currentGrade).find(unit => unit.id === activeUnitId)
    : undefined;
  const activeUnitPracticeCount = activeUnitId ? Math.min(progress.unitPracticeCounts?.[activeUnitId] || 0, MASTERED_PRACTICE_TARGET) : 0;
  const activeUnitEndChecks = activeUnit?.endOfLessonChecks?.slice(0, 7) || [];
  const activeTeacherScript = activeUnit ? getTeacherScript(activeUnit, progress) : undefined;
  const activeSchoolLessonSteps = activeTeacherScript ? [
    { phase: SCHOOL_LESSON_PHASES[0], prompt: activeTeacherScript.teach },
    { phase: SCHOOL_LESSON_PHASES[1], prompt: activeTeacherScript.example },
    { phase: SCHOOL_LESSON_PHASES[2], prompt: activeTeacherScript.guided },
    { phase: SCHOOL_LESSON_PHASES[3], prompt: activeTeacherScript.independent },
    { phase: SCHOOL_LESSON_PHASES[4], prompt: activeTeacherScript.exitTicket },
  ] : [];
  const showActiveMissionFocus = Boolean(activeUnit && currentRoom !== RoomType.HUB && !showLessonIntro && !showDashboard && !showParentDashboard);

  const handleStartTeacherLesson = () => {
    setShowLessonIntro(false);
    if (activeTeacherScript) {
      void speakAsync(activeTeacherScript.greeting, 0.9, 1.1, 'gentle');
    }
  };

  const renderTeacherLessonStart = () => {
    if (!activeUnit || !activeTeacherScript) return null;
    const campusRoom = getCampusRoom(activeUnit.room);
    const safePracticeCount = Math.min(activeUnitPracticeCount, MASTERED_PRACTICE_TARGET);

    return (
      <div
        data-testid="teacher-lesson-start"
        className="h-full w-full overflow-y-auto bg-[radial-gradient(circle_at_top,#fff7ad_0%,#a8dcff_34%,#81d8bd_68%,#77cf71_100%)] p-4 kid-scroll"
      >
        <div className="mx-auto flex min-h-full max-w-6xl items-center">
          <div className="grid w-full overflow-hidden rounded-[32px] border-4 border-white/80 bg-white shadow-2xl lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-800 p-6 text-white">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-40 w-56 rounded-tl-[80px] bg-white/10" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Teacher-led lesson start</p>
                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{activeUnit.title}</h1>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-200">
                  {activeTeacherScript.greeting}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-2xl font-black text-indigo-700 shadow-lg">
                    MN
                  </div>
                  <div>
                    <p className="text-lg font-black">{AI_TEACHER.name}</p>
                    <p className="text-sm font-semibold text-white/80">{campusRoom.classroomName}</p>
                    <p className="mt-1 text-xs font-bold text-sky-100">{AI_TEACHER.voicePack}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black">{safePracticeCount}/{MASTERED_PRACTICE_TARGET}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">mastery rounds</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black">{activeSchoolLessonSteps.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">lesson phases</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-[24px] border border-indigo-100 bg-indigo-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Learning target</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{activeTeacherScript.objective}</h2>
                <p className="mt-2 text-sm font-semibold text-indigo-900">{campusRoom.teacherAction}</p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-5">
                {activeSchoolLessonSteps.map((step, index) => (
                  <div key={`${activeUnit.id}-intro-${step.phase.id}`} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
                      {index + 1}. {step.phase.label}
                    </p>
                    <p className="mt-1 line-clamp-4 text-xs font-bold text-slate-700">{step.prompt}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
                <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Exit ticket</p>
                  <p className="mt-1 text-sm font-black text-emerald-950">{activeTeacherScript.exitTicket}</p>
                </div>
                <div className="rounded-[22px] border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">Parent proof</p>
                  <p className="mt-1 text-sm font-black text-amber-950">{activeTeacherScript.parentNote}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    if (activeTeacherScript) speak(activeTeacherScript.greeting, 0.9, 1.1);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-800 shadow hover:bg-slate-200"
                >
                  <MessageCircle size={20} />
                  Listen to Ms. Nova
                </button>
                <button
                  onClick={handleStartTeacherLesson}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg hover:bg-indigo-700"
                >
                  <Play size={20} />
                  Start guided practice
                </button>
              </div>

              <button
                onClick={handleBack}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
              >
                Back to school map
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Game View
  const renderView = () => {
    if (currentRoom !== RoomType.HUB && showLessonIntro && activeUnit) {
      return renderTeacherLessonStart();
    }

    switch (currentRoom) {
      case RoomType.MATH:
        return <MathRoom level={progress.currentLevel} onBack={handleBack} onReward={handleMathReward} />;
      case RoomType.READING:
        return <ReadingRoom level={progress.currentLevel} onBack={handleBack} onReward={handleReadingReward} />;
      case RoomType.SCIENCE:
        return <ScienceRoom level={progress.currentLevel} onBack={handleBack} onReward={handleScienceReward} />;
      case RoomType.GEOGRAPHY:
        return <GeographyRoom level={progress.currentLevel} onBack={handleBack} onReward={handleGeographyReward} />;
      case RoomType.CODING:
        return <CodingRoom level={progress.currentLevel} onBack={handleBack} onReward={handleCodingReward} />;
      case RoomType.LANGUAGE:
        return <LanguageRoom level={progress.currentLevel} onBack={handleBack} onReward={handleLanguageReward} />;
      case RoomType.STORYBOOK:
        return <StoryBook level={progress.currentLevel} onBack={handleBack} onReward={handleStorybookReward} />;
      case RoomType.ART:
        return <ArtRoom level={progress.currentLevel} onBack={handleBack} onReward={() => handleCreativeReward('art')} />;
      case RoomType.MUSIC:
        return <MusicRoom level={progress.currentLevel} onBack={handleBack} onReward={handleMusicReward} />;
      case RoomType.PUZZLE:
        return <PuzzleRoom level={progress.currentLevel} onBack={handleBack} onReward={() => addSticker('puzzle')} />;
      case RoomType.HUB:
      default:
        return (
          <WorldMap
            onEnterRoom={handleEnterRoom}
            onOpenDashboard={() => {
              stopSpeaking();
              setShowDashboard(true);
            }}
            onOpenAchievements={() => setShowAchievements(true)}
            onOpenPet={() => setShowPet(true)}
            onOpenGameArcade={() => requestPaidAccess({ type: 'arcade' })}
            onOpenSettings={() => {
              stopSpeaking();
              setShowParentDashboard(true);
            }}
            progress={progress}
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitchChildProfile={handleSwitchChildProfile}
          />
        );
    }
  };

  return (
    <div className={`w-screen h-screen overflow-hidden bg-sky-100 relative ${getAccessibilityClasses()}`}>
      <LessonErrorBoundary
        resetKey={`${currentRoom}-${activeUnitId || 'school-map'}-${activeProfileId || 'no-profile'}-${showLessonIntro ? 'intro' : 'room'}`}
        onBack={handleBack}
      >
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-200 to-emerald-200">
          <div className="bg-white/90 rounded-3xl shadow-xl px-6 py-5 text-center border-4 border-white">
            <p className="text-3xl mb-2">🎒</p>
            <p className="font-black text-sky-800">Loading lesson...</p>
          </div>
        </div>
      }>
        {renderView()}
      </Suspense>
      </LessonErrorBoundary>
      {!showLessonIntro && <Guide room={currentRoom} trigger={guideTrigger} />}

      {showActiveMissionFocus && activeUnit && (
        <TeacherRoomCoach
          unit={activeUnit}
          progress={progress}
          practiceCount={activeUnitPracticeCount}
          onOpenLessonBoard={() => setShowMissionFocus(true)}
        />
      )}

      {showActiveMissionFocus && activeUnit && showMissionFocus && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-5xl">
            <div className="max-h-[78vh] overflow-y-auto rounded-[24px] border-4 border-white bg-white/95 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{AI_TEACHER.name} Lesson Board</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{activeUnit.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{activeTeacherScript?.greeting || activeUnit.objective}</p>
                  {activeSchoolLessonSteps.length > 0 && (
                    <>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-indigo-600">Teach to exit ticket path</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        {activeSchoolLessonSteps.map((step, index) => (
                          <div key={`${activeUnit.id}-school-phase-${step.phase.id}`} className="rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-900">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-indigo-500">{index + 1}. {step.phase.label}</p>
                            <p className="mt-1">{step.prompt}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2">
                        <p className="text-xs font-black text-sky-800">Teacher voice status</p>
                        <p className="mt-1 text-xs font-bold text-sky-900">{activeTeacherScript?.voiceStatus}</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setShowMissionFocus(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                  aria-label="Hide Mission Focus"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl bg-indigo-50 px-3 py-2">
                  <p className="text-xs font-black text-indigo-700">Mastery gate</p>
                  <p className="text-xl font-black text-indigo-900">{activeUnitPracticeCount}/{MASTERED_PRACTICE_TARGET}</p>
                  <p className="mt-1 text-xs font-bold text-indigo-700">{activeTeacherScript?.masteryLabel}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2">
                  <p className="text-xs font-black text-emerald-700">Exit ticket</p>
                  <p className="text-sm font-bold text-emerald-900">{activeTeacherScript?.exitTicket || activeUnit.successCheck}</p>
                  {activeUnitEndChecks.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Exit checks</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {activeUnitEndChecks.map((check, index) => (
                          <p key={`${activeUnit.id}-focus-check-${index}`} className="rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-emerald-900">
                            Check {index + 1}: {check}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}

      {showAccessGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            data-testid="parent-access-gate"
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border-4 border-white bg-white p-5 shadow-2xl kid-scroll"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <LockKeyhole size={26} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Parent Access</p>
                  <h2 className="text-xl font-black text-slate-900">Start the 3-day parent-approved trial</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    A parent account is required before Stripe opens, so billing and learning access stay adult-controlled.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAccessGate(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Close Parent Access"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Step 1</p>
                <p className="mt-1 text-sm font-black text-emerald-950">Parent signs in</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Step 2</p>
                <p className="mt-1 text-sm font-black text-indigo-950">Choose a monthly plan</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Step 3</p>
                <p className="mt-1 text-sm font-black text-amber-950">Trial unlocks learning</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    <p className="font-black">Parent sign in</p>
                  </div>

                  {parentCloudSession.signedIn ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                      <p className="font-black text-emerald-800">Signed in</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">{parentCloudSession.email}</p>
                      <button
                        onClick={handleRefreshBillingAccess}
                        className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-emerald-800 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-100"
                      >
                        Refresh Stripe Status
                      </button>
                      {familyAccess?.billingAccessActive && (
                        <div
                          data-testid="access-gate-billing-status"
                          className="mt-3 rounded-2xl border border-emerald-200 bg-white p-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Billing status</p>
                              <p className="mt-1 text-lg font-black text-emerald-950">{billingAccessSummary.statusLabel}</p>
                              <p className="mt-1 text-sm font-bold text-emerald-900">{billingAccessSummary.detail}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-center">
                              <p className="text-sm font-black text-emerald-950">{billingAccessSummary.planLabel}</p>
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">{billingAccessSummary.dateLabel}</p>
                            </div>
                          </div>
                          {billingAccessSummary.checkedLabel && (
                            <p className="mt-2 text-xs font-bold text-emerald-700">{billingAccessSummary.checkedLabel}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <input
                        type="email"
                        value={accessEmail}
                        onChange={event => setAccessEmail(event.target.value)}
                        placeholder="Parent email"
                        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400"
                      />
                      <input
                        type="password"
                        value={accessPassword}
                        onChange={event => setAccessPassword(event.target.value)}
                        placeholder="Password"
                        className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={handleAccessCreateParentAccount}
                          disabled={accessBusy}
                          className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-lg hover:bg-indigo-700 disabled:opacity-60"
                        >
                          Create Account
                        </button>
                        <button
                          onClick={handleAccessSignInParentAccount}
                          disabled={accessBusy}
                          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-lg hover:bg-slate-800 disabled:opacity-60"
                        >
                          Sign In
                        </button>
                      </div>
                      <button
                        onClick={handleAccessSignInWithGoogle}
                        disabled={accessBusy}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Continue with Google
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 size={20} className="text-indigo-600" />
                    <p className="font-black">What unlocks after trial starts</p>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {ACCESS_GATE_UNLOCKS.map(item => (
                      <div key={item} className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        <p className="text-sm font-bold text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-indigo-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-900">
                      <Sparkles size={20} />
                      <p className="font-black">Choose the trial plan</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-indigo-900">
                      Starter and Premium start a 3-day free trial now. The temporary checkout test charges $0.50 today so we can verify live Stripe invoices and webhooks.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-center shadow-sm">
                    <p className="text-lg font-black text-indigo-700">3 days</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-indigo-500">free trial</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {SUBSCRIPTION_PLANS.map(plan => {
                    const isPremium = plan.id === 'premium';
                    const isTemporary = Boolean(plan.temporary);
                    return (
                      <button
                        key={plan.id}
                        onClick={() => handleStartStripeCheckout(plan.id)}
                        disabled={!parentCloudSession.signedIn}
                        aria-label={`Choose ${plan.label} plan`}
                        className={`rounded-[22px] p-4 text-left shadow-lg ring-2 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
                          isTemporary
                            ? 'bg-amber-50 text-slate-950 ring-amber-200 hover:ring-amber-400'
                            : isPremium
                              ? 'bg-slate-950 text-white ring-indigo-200 hover:ring-indigo-400'
                              : 'bg-white text-slate-900 ring-indigo-100 hover:ring-indigo-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-xs font-black uppercase tracking-[0.14em] ${isTemporary ? 'text-amber-700' : isPremium ? 'text-sky-200' : 'text-indigo-600'}`}>{plan.label}</p>
                            <p className="mt-1 text-3xl font-black">{plan.price}</p>
                            <p className={`text-xs font-bold ${isTemporary ? 'text-amber-800' : isPremium ? 'text-slate-300' : 'text-slate-500'}`}>
                              {isTemporary ? 'charged today for testing' : 'per month after 3 days'}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
                            isTemporary ? 'bg-amber-200 text-amber-950' : isPremium ? 'bg-sky-200 text-slate-950' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {plan.badge}
                          </span>
                        </div>
                        <p className={`mt-3 text-sm font-bold ${isTemporary ? 'text-amber-950' : isPremium ? 'text-slate-200' : 'text-slate-700'}`}>{plan.description}</p>
                        <div className="mt-3 space-y-2">
                          {plan.highlights.map(item => (
                            <div key={item} className="flex items-start gap-2">
                              <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${isTemporary ? 'text-amber-600' : isPremium ? 'text-emerald-200' : 'text-emerald-600'}`} />
                              <p className={`text-xs font-bold ${isTemporary ? 'text-amber-950' : isPremium ? 'text-slate-200' : 'text-slate-700'}`}>{item}</p>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl border border-indigo-200 bg-white/80 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-700">Transparent launch pricing</p>
                  <p className="mt-1 text-sm font-bold text-indigo-950">
                    Starter unlocks the full school app for one family. Premium adds priority curriculum drops, expanded parent reports, early access to new book packs, and support priority while keeping kids out of billing screens.
                  </p>
                </div>

                <div className="mt-4 grid gap-2">
                  {ACCESS_GATE_TRUST_POINTS.map(point => (
                    <div key={point} className="flex items-start gap-2 rounded-2xl bg-white/80 px-3 py-2">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <p className="text-xs font-bold text-indigo-950">{point}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs font-bold text-indigo-800">
                  Need help? Parent support: crateshipstudios@gmail.com
                </p>

                {familyAccess?.billingAccessActive && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={continueAfterAccess}
                      className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white shadow-lg hover:bg-emerald-700"
                    >
                      Continue to Learning
                    </button>
                    <button
                      onClick={handleOpenStripeBillingPortal}
                      className="w-full rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Manage Billing in Stripe
                    </button>
                  </div>
                )}

                {stripeCheckoutUrl && (
                  <a
                    href={stripeCheckoutUrl}
                    className="mt-4 block rounded-2xl bg-amber-400 px-4 py-3 text-center font-black text-slate-950 shadow-lg hover:bg-amber-300"
                  >
                    Open Secure Stripe Checkout
                  </a>
                )}
              </div>
            </div>

            {accessGateStatus && (
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                {accessGateStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAchievements && (
        <AchievementsPanel
          unlockedAchievements={progress.achievements || []}
          progress={progress}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showPet && progress.pet && (
        <VirtualPetPanel
          pet={progress.pet}
          onUpdatePet={handleUpdatePet}
          onClose={() => setShowPet(false)}
        />
      )}

      {learningReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border-4 border-emerald-100 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <MessageCircle size={26} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Learning Reflection</p>
                  <h2 className="text-xl font-black text-slate-900">Explain what you learned</h2>
                </div>
              </div>
              <button
                onClick={() => setLearningReflection(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Close Learning Reflection"
              >
                <X size={20} />
              </button>
            </div>

            <div className="my-5 rounded-[24px] bg-emerald-50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{learningReflection.roomLabel}</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{learningReflection.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{learningReflection.objective}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-center">
                  <p className="text-2xl font-black text-emerald-700">{learningReflection.practiceCount}/{MASTERED_PRACTICE_TARGET}</p>
                  <p className="text-xs font-bold text-slate-500">practice rounds</p>
                </div>
              </div>
              {learningReflection.mastered && (
                <div className="mt-3 rounded-2xl bg-white p-3 text-sm font-black text-emerald-700">
                  Mastery check reached. This lesson can move into review.
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: <Lightbulb size={18} />, label: 'What strategy worked?', copy: 'Say the trick, clue, or step that helped you solve it.' },
                { icon: <Target size={18} />, label: 'What was tricky?', copy: 'Name the part that made your brain work harder.' },
                { icon: <BookOpen size={18} />, label: 'Teach it back', copy: learningReflection.successCheck || 'Explain one idea out loud like you are the teacher.' },
              ].map(prompt => {
                const selected = selectedReflectionChoice === prompt.label;
                return (
                  <button
                    key={prompt.label}
                    onClick={() => recordLearningReflectionChoice(prompt.label)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      selected
                        ? 'border-emerald-300 bg-emerald-100 shadow-inner'
                        : 'border-slate-100 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50'
                    }`}
                    aria-pressed={selected}
                  >
                    <div className="flex items-center gap-2 text-slate-700">
                      {prompt.icon}
                      <p className="text-sm font-black">{prompt.label}</p>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-600">{prompt.copy}</p>
                    {selected && (
                      <p className="mt-2 text-xs font-black text-emerald-700">Saved for parent review</p>
                    )}
                  </button>
                );
              })}
            </div>

            {learningReflection.parentActivity && (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">At-home follow-up</p>
                <p className="mt-1 text-sm font-bold text-amber-900">{learningReflection.parentActivity}</p>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setLearningReflection(null)}
                className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg hover:bg-emerald-700"
              >
                Review My Reflection
              </button>
              <button
                onClick={() => {
                  setLearningReflection(null);
                  handleBack();
                }}
                className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700 hover:bg-slate-200"
              >
                Next Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlock Toast */}
      {newAchievement && (
        <AchievementUnlockToast
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}
    </div>
  );
};

export default App;
