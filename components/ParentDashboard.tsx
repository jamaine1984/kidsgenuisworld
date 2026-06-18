import React, { useState } from 'react';
import {
  ArrowLeft, BarChart3, Clock, Target, TrendingUp,
  Star, Award, Brain, Calendar, CheckCircle2, ChevronRight, Lock,
  Settings, Shield, Volume2, Eye, Type, BookOpen, Map, Printer, Download, Gamepad2,
  Cloud, CreditCard, LogIn, LogOut, ClipboardList
} from 'lucide-react';
import {
  UserProgress,
  RoomType,
  AccessibilitySettings,
  PrivacySettings,
  ChildProfile,
  GradeLevel,
  SkillMetrics,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_ARCADE_PROGRESS
} from '../types';
import { getCurrentGradeUnits, getRoadmapRecommendations, getUnitReadiness, getUnitsForGrade, getWeeklyLearningPlan, type CurriculumUnit } from '../services/curriculum';
import type { ParentCloudSession } from '../services/firebaseParentAuth';
import {
  AI_TEACHER,
  MASTERED_PRACTICE_TARGET,
  SCHOOL_LESSON_PHASES,
  buildTeacherNotesFromJournal,
  getCampusRoom,
  getSchoolDayPlan,
  getStudentPassportSummary,
  getTeacherConferencePlan,
  getTeacherHelpLadder,
  getTeacherScript,
  getTeacherAssignmentCards,
  getTeacherGradebookRows,
} from '../services/schoolMode';
import { clearDiagnosticEvents, exportDiagnosticEvents, getDiagnosticEvents } from '../services/diagnosticsService';
import type { StripeBillingPlan } from '../services/stripeBilling';

interface BillingAccessSummary {
  billingAccessActive?: boolean;
  plan?: StripeBillingPlan;
  stripeStatus?: string;
  accessSource?: 'stripe' | 'owner_comped';
  comped?: boolean;
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
  checkedAt?: number;
  verifiedByBillingApi?: boolean;
}

interface ParentDashboardProps {
  progress: UserProgress;
  onBack: () => void;
  onUpdateAccessibility: (settings: AccessibilitySettings) => void;
  onResetProgress?: () => void;
  parentPin?: string;
  onUpdateParentPin?: (pin: string) => void;
  profiles?: ChildProfile[];
  activeProfileId?: string;
  onCreateChildProfile?: (name: string, grade: GradeLevel) => void;
  onSwitchChildProfile?: (profileId: string) => void;
  onUpdateChildProfile?: (profileId: string, name: string, grade: GradeLevel) => void;
  onUpdatePrivacy?: (settings: PrivacySettings) => void;
  onUpdateLearningGoals?: (weeklyGoalMinutes: number, dailySessionLimitMinutes: number) => void;
  requireParentGate?: boolean;
  cloudSession?: ParentCloudSession;
  cloudSyncStatus?: string;
  onCreateParentAccount?: (email: string, password: string) => Promise<void>;
  onSignInParentAccount?: (email: string, password: string) => Promise<void>;
  onSignInParentWithGoogle?: () => Promise<void>;
  onSignOutParentAccount?: () => Promise<void>;
  onSyncProgressToCloud?: () => Promise<void>;
  onStartStripeCheckout?: (plan: StripeBillingPlan) => Promise<void>;
  onOpenStripeBillingPortal?: () => Promise<void>;
  onRefreshBillingAccess?: () => Promise<void>;
  billingStatus?: string;
  billingAccess?: BillingAccessSummary;
}

type ParentDashboardTab = 'overview' | 'gradebook' | 'skills' | 'curriculum' | 'settings';

const formatBillingDate = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
};

const formatBillingMoney = (amount?: number, currency?: string) => {
  if (typeof amount !== 'number') return '';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount / 100);
};

const formatStripeEventType = (eventType?: string) => (
  eventType ? eventType.replaceAll('.', ' ') : ''
);

const getDashboardBillingSummary = (billingAccess?: BillingAccessSummary) => {
  const planLabel = billingAccess?.plan === 'checkout_test'
    ? 'Checkout Test $0.50/mo'
    : billingAccess?.plan === 'premium'
    ? 'Premium $9.99/mo'
    : billingAccess?.plan === 'starter'
      ? 'Starter $4.99/mo'
      : 'No plan selected';

  if (!billingAccess?.billingAccessActive) {
    return {
      active: false,
      tone: 'warning' as const,
      statusLabel: 'No active trial or subscription',
      planLabel,
      detail: 'Choose a parent-approved plan to start the 3-day Stripe trial.',
      dateLabel: 'Not started',
      checkedLabel: '',
      webhookLabel: '',
      invoiceLabel: '',
      cancelLabel: '',
    };
  }

  if (billingAccess.accessSource === 'owner_comped' || billingAccess.comped || billingAccess.stripeStatus === 'owner_comped') {
    return {
      active: true,
      tone: 'success' as const,
      statusLabel: 'Owner access active',
      planLabel: 'Owner access',
      detail: 'Unlimited access is enabled for this parent account.',
      dateLabel: 'No Stripe payment required',
      checkedLabel: billingAccess.checkedAt ? `Verified ${formatBillingDate(billingAccess.checkedAt)}` : '',
      webhookLabel: '',
      invoiceLabel: '',
      cancelLabel: '',
    };
  }

  const webhookLabel = billingAccess.lastStripeEventAt
    ? `Stripe webhook: ${formatStripeEventType(billingAccess.lastStripeEventType)} on ${formatBillingDate(billingAccess.lastStripeEventAt)}`
    : '';
  const invoiceAmount = formatBillingMoney(
    typeof billingAccess.lastInvoiceAmountPaid === 'number'
      ? billingAccess.lastInvoiceAmountPaid
      : billingAccess.lastInvoiceAmountDue,
    billingAccess.lastInvoiceCurrency
  );
  const invoiceLabel = billingAccess.lastInvoiceStatus
    ? `Latest invoice: ${billingAccess.lastInvoiceStatus}${invoiceAmount ? ` (${invoiceAmount})` : ''}`
    : '';
  const cancelLabel = billingAccess.cancelAtPeriodEnd
    ? 'Cancellation is scheduled at the end of the billing period.'
    : '';

  if (billingAccess.stripeStatus === 'trialing') {
    return {
      active: true,
      tone: 'success' as const,
      statusLabel: 'Trial active',
      planLabel,
      detail: billingAccess.trialEndsAt
        ? `Trial access is active until ${formatBillingDate(billingAccess.trialEndsAt)}.`
        : 'Trial access is active for this family.',
      dateLabel: billingAccess.trialEndsAt ? `Trial ends ${formatBillingDate(billingAccess.trialEndsAt)}` : 'Trial end pending',
      checkedLabel: billingAccess.checkedAt ? `Verified ${formatBillingDate(billingAccess.checkedAt)}` : '',
      webhookLabel,
      invoiceLabel,
      cancelLabel,
    };
  }

  if (billingAccess.stripeStatus === 'past_due') {
    return {
      active: true,
      tone: 'warning' as const,
      statusLabel: 'Payment needs attention',
      planLabel,
      detail: 'Stripe marked this subscription past due. Use Manage Billing to update payment.',
      dateLabel: billingAccess.currentPeriodEndsAt ? `Period ends ${formatBillingDate(billingAccess.currentPeriodEndsAt)}` : 'Billing date pending',
      checkedLabel: billingAccess.checkedAt ? `Verified ${formatBillingDate(billingAccess.checkedAt)}` : '',
      webhookLabel,
      invoiceLabel,
      cancelLabel,
    };
  }

  return {
    active: true,
    tone: 'success' as const,
    statusLabel: billingAccess.stripeStatus === 'active' ? 'Subscription active' : 'Access active',
    planLabel,
    detail: billingAccess.currentPeriodEndsAt
      ? `Current billing period runs through ${formatBillingDate(billingAccess.currentPeriodEndsAt)}.`
      : 'Stripe access is verified for this family.',
    dateLabel: billingAccess.currentPeriodEndsAt ? `Renews ${formatBillingDate(billingAccess.currentPeriodEndsAt)}` : 'Billing period verified',
    checkedLabel: billingAccess.checkedAt ? `Verified ${formatBillingDate(billingAccess.checkedAt)}` : '',
    webhookLabel,
    invoiceLabel,
    cancelLabel,
  };
};

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  progress,
  onBack,
  onUpdateAccessibility,
  onResetProgress,
  parentPin = '',
  onUpdateParentPin,
  profiles = [],
  activeProfileId = '',
  onCreateChildProfile,
  onSwitchChildProfile,
  onUpdateChildProfile,
  onUpdatePrivacy,
  onUpdateLearningGoals,
  requireParentGate = true,
  cloudSession = {
    configured: false,
    signedIn: false,
    uid: null,
    email: null,
    familyId: null,
  },
  cloudSyncStatus = '',
  onCreateParentAccount,
  onSignInParentAccount,
  onSignInParentWithGoogle,
  onSignOutParentAccount,
  onSyncProgressToCloud,
  onStartStripeCheckout,
  onOpenStripeBillingPortal,
  onRefreshBillingAccess,
  billingStatus = '',
  billingAccess,
}) => {
  const [activeTab, setActiveTab] = useState<ParentDashboardTab>('overview');
  const [isWarmingVoiceCache, setIsWarmingVoiceCache] = useState(false);
  const [voiceCacheSummary, setVoiceCacheSummary] = useState<string>('');
  const [voiceCacheTone, setVoiceCacheTone] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState('');
  const [isParentVerified, setIsParentVerified] = useState(!requireParentGate);
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinStatus, setPinStatus] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState<GradeLevel>(GradeLevel.KINDERGARTEN);
  const [editChildName, setEditChildName] = useState(progress.childName || 'Learner');
  const [editChildGrade, setEditChildGrade] = useState<GradeLevel>(progress.currentGrade);
  const [profileStatus, setProfileStatus] = useState('');
  const [weeklyGoalDraft, setWeeklyGoalDraft] = useState(String(progress.weeklyGoalMinutes || 60));
  const [dailyLimitDraft, setDailyLimitDraft] = useState(String(progress.dailySessionLimitMinutes || 20));
  const [goalStatus, setGoalStatus] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [cloudAuthStatus, setCloudAuthStatus] = useState('');
  const [isCloudActionBusy, setIsCloudActionBusy] = useState(false);
  const [isBillingBusy, setIsBillingBusy] = useState(false);
  const [diagnosticEvents, setDiagnosticEvents] = useState(() => getDiagnosticEvents());

  // Calculate stats
  const totalProblems = progress.mathScore + progress.readingScore + progress.scienceScore +
                        progress.geographyScore + progress.codingScore + progress.languageScore +
                        (progress.storybookScore || 0);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSubjectData = () => {
    return [
      { name: 'Math', score: progress.mathScore, icon: '🔢', color: 'bg-blue-500' },
      { name: 'Reading', score: progress.readingScore, icon: '📚', color: 'bg-green-500' },
      { name: 'Story Time', score: progress.storybookScore || 0, icon: '📖', color: 'bg-amber-500' },
      { name: 'Science', score: progress.scienceScore, icon: '🔬', color: 'bg-purple-500' },
      { name: 'Geography', score: progress.geographyScore, icon: '🌍', color: 'bg-cyan-500' },
      { name: 'Coding', score: progress.codingScore, icon: '💻', color: 'bg-indigo-500' },
      { name: 'Language', score: progress.languageScore, icon: '🗣️', color: 'bg-pink-500' },
    ].sort((a, b) => b.score - a.score);
  };

  const subjectData = getSubjectData();
  const maxScore = Math.max(...subjectData.map(s => s.score), 1);
  const curriculumUnits = getUnitsForGrade(progress.currentGrade);
  const currentGradeUnits = getCurrentGradeUnits(progress.currentGrade);
  const weeklyPlan = getWeeklyLearningPlan(progress);
  const schoolDay = getSchoolDayPlan(progress);
  const studentPassport = getStudentPassportSummary(progress);
  const teacherConferencePlan = getTeacherConferencePlan(progress);
  const missionTeacherScript = getTeacherScript(schoolDay.mission, progress);
  const teacherHelpLadder = getTeacherHelpLadder(schoolDay.mission);
  const teacherNotes = buildTeacherNotesFromJournal(progress);
  const teacherAssignments = getTeacherAssignmentCards(progress);
  const teacherGradebookRows = getTeacherGradebookRows(progress);
  const gradebookMasteredCount = teacherGradebookRows.filter(row => row.status === 'done').length;
  const gradebookInProgressCount = teacherGradebookRows.filter(row => row.status === 'in-progress').length;
  const gradebookNotStartedCount = teacherGradebookRows.filter(row => row.status === 'ready').length;
  const journalByRoom = (progress.learningJournal || []).reduce((summary, entry) => {
    const current = summary[entry.room] || { total: 0, mastered: 0, reflected: 0 };
    summary[entry.room] = {
      total: current.total + 1,
      mastered: current.mastered + (entry.mastered ? 1 : 0),
      reflected: current.reflected + (entry.childReflection ? 1 : 0),
    };
    return summary;
  }, {} as Record<RoomType, { total: number; mastered: number; reflected: number }>);
  const formatSkillLabel = (skill: string) => skill.replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
  const getSkillAccuracy = (metrics: SkillMetrics) => (
    metrics.totalAttempts > 0 ? Math.round((metrics.correctAnswers / metrics.totalAttempts) * 100) : 0
  );
  const buildSkillStatus = (mastery: number, attempts: number, evidenceCount: number, score: number) => {
    if (mastery >= 80 || score >= 10) return 'Strong';
    if (mastery >= 50 || attempts >= 5 || evidenceCount >= 3) return 'Growing';
    if (attempts > 0 || evidenceCount > 0 || score > 0) return 'Needs practice';
    return 'Not started';
  };
  const getSkillStatusClasses = (status: string) => {
    if (status === 'Strong') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status === 'Growing') return 'bg-sky-50 text-sky-700 border-sky-100';
    if (status === 'Needs practice') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };
  const skillStrandReports = [
    {
      subject: 'Math',
      strand: 'Addition and number sense',
      room: RoomType.MATH,
      metrics: progress.learningProfile.mathSkills.addition,
      score: progress.mathScore || 0,
      parentMeaning: 'Can count on, make ten, solve missing addends, and explain number stories.',
      nextAssignment: 'Ask for one picture model and one spoken strategy before moving on.',
    },
    {
      subject: 'Math',
      strand: 'Subtraction and comparison',
      room: RoomType.MATH,
      metrics: progress.learningProfile.mathSkills.subtraction,
      score: progress.mathScore || 0,
      parentMeaning: 'Can take away, compare how many more, and use counters or drawings.',
      nextAssignment: 'Practice one take-away story and have the child cross out the removed group.',
    },
    {
      subject: 'Math',
      strand: 'Multiplication, division, and equal groups',
      room: RoomType.MATH,
      metrics: progress.learningProfile.mathSkills.multiplication,
      score: progress.mathScore || 0,
      parentMeaning: 'Can see arrays, equal groups, skip counting, and fair shares.',
      nextAssignment: 'Use rows of objects, then ask how many groups and how many in each group.',
    },
    {
      subject: 'Reading',
      strand: 'Phonics and word building',
      room: RoomType.READING,
      metrics: progress.learningProfile.readingSkills.phonics,
      score: progress.readingScore || 0,
      parentMeaning: 'Can hear sounds, build words, and blend sounds into fluent reading.',
      nextAssignment: 'Have the child tap each sound, blend the word, then use it in a sentence.',
    },
    {
      subject: 'Reading',
      strand: 'Vocabulary and sight words',
      room: RoomType.READING,
      metrics: progress.learningProfile.readingSkills.vocabulary,
      score: progress.readingScore || 0,
      parentMeaning: 'Can recognize useful words, explain meanings, and connect words to context.',
      nextAssignment: 'Ask for one new word, one meaning, and one sentence after reading practice.',
    },
    {
      subject: 'Reading',
      strand: 'Comprehension and evidence',
      room: RoomType.STORYBOOK,
      metrics: progress.learningProfile.readingSkills.comprehension,
      score: (progress.readingScore || 0) + (progress.storybookScore || 0),
      parentMeaning: 'Can retell, infer, use clues, and explain why an answer is supported.',
      nextAssignment: 'Ask the child to point to the clue that proves the answer.',
    },
    {
      subject: 'Science',
      strand: 'Observation, evidence, and fair tests',
      room: RoomType.SCIENCE,
      metrics: progress.learningProfile.scienceSkills,
      score: progress.scienceScore || 0,
      parentMeaning: 'Can observe, compare properties, make predictions, and explain evidence.',
      nextAssignment: 'Ask what changed, what stayed the same, and what evidence was seen.',
    },
    {
      subject: 'Geography',
      strand: 'Maps, places, landforms, and climate',
      room: RoomType.GEOGRAPHY,
      metrics: progress.learningProfile.geographySkills,
      score: progress.geographyScore || 0,
      parentMeaning: 'Can use map symbols, directions, landmarks, countries, and climate clues.',
      nextAssignment: 'Ask the child to use one direction word and one map clue.',
    },
    {
      subject: 'Coding',
      strand: 'Sequencing, loops, and debugging',
      room: RoomType.CODING,
      metrics: progress.learningProfile.codingSkills,
      score: progress.codingScore || 0,
      parentMeaning: 'Can plan steps, test a route, find a wrong turn, and improve the code.',
      nextAssignment: 'Have the child trace the commands out loud before pressing run.',
    },
    {
      subject: 'Language',
      strand: 'World language listening and speaking',
      room: RoomType.LANGUAGE,
      metrics: progress.learningProfile.languageSkills,
      score: progress.languageScore || 0,
      parentMeaning: 'Can listen, repeat, match translations, and use useful phrases.',
      nextAssignment: 'Ask for the word, the pronunciation, and one time they could use it.',
    },
  ].map(item => {
    const evidence = journalByRoom[item.room] || { total: 0, mastered: 0, reflected: 0 };
    const accuracy = getSkillAccuracy(item.metrics);
    const status = buildSkillStatus(item.metrics.masteryLevel, item.metrics.totalAttempts, evidence.total, item.score);
    return {
      ...item,
      evidence,
      accuracy,
      status,
      priorityScore: (status === 'Not started' ? 0 : status === 'Needs practice' ? 1 : status === 'Growing' ? 2 : 3)
        + Math.min(evidence.total, 4)
        + Math.min(item.metrics.totalAttempts, 6) / 2,
    };
  });
  const strandFocusQueue = [...skillStrandReports]
    .sort((a, b) => {
      const statusOrder: Record<string, number> = { 'Not started': 0, 'Needs practice': 1, Growing: 2, Strong: 3 };
      const statusDelta = statusOrder[a.status] - statusOrder[b.status];
      if (statusDelta !== 0) return statusDelta;
      return a.evidence.total - b.evidence.total || a.metrics.masteryLevel - b.metrics.masteryLevel;
    })
    .slice(0, 4);
  const strongStrandCount = skillStrandReports.filter(item => item.status === 'Strong').length;
  const practicedStrandCount = skillStrandReports.filter(item => item.status !== 'Not started').length;
  const strandEvidenceCount = skillStrandReports.reduce((sum, item) => sum + item.evidence.total, 0);
  const billingSummary = getDashboardBillingSummary(billingAccess);
  const isOwnerCompedBilling = billingAccess?.accessSource === 'owner_comped' || billingAccess?.comped;
  const getSchoolPeriodClasses = (status: (typeof schoolDay.periods)[number]['status']) => {
    if (status === 'done') return 'border-emerald-300/40 bg-emerald-400/15';
    if (status === 'in-progress') return 'border-sky-300/40 bg-sky-400/15';
    if (status === 'due') return 'border-amber-300/40 bg-amber-400/15';
    if (status === 'locked') return 'border-slate-300/20 bg-slate-400/10';
    return 'border-white/10 bg-white/[0.08]';
  };
  const getSchoolPeriodLabel = (status: (typeof schoolDay.periods)[number]['status']) => {
    if (status === 'done') return 'Done';
    if (status === 'in-progress') return 'In progress';
    if (status === 'due') return 'Due';
    if (status === 'locked') return 'Locked';
    return 'Ready';
  };
  const roadmapRecommendations = getRoadmapRecommendations(progress);
  const hasParentPin = parentPin.trim().length > 0;
  const privacy = progress.privacy || DEFAULT_PRIVACY_SETTINGS;
  const parentConsentReceipt = (() => {
    if (typeof window === 'undefined') return '';
    try {
      const receipt = window.localStorage.getItem('kidGeniusParentConsentReceipt');
      if (!receipt) return '';
      const parsed = JSON.parse(receipt) as { acceptedAt?: string };
      return parsed.acceptedAt
        ? new Date(parsed.acceptedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
    } catch {
      return '';
    }
  })();
  const canWarmVoiceCache = privacy.allowExternalVoice && !isWarmingVoiceCache;
  const voiceCacheStatusClasses = {
    info: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    warning: 'bg-amber-50 text-amber-800 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100',
  };
  const recentDailyStats = [...(progress.dailyStats || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const monthlyDailyStats = (progress.dailyStats || []).filter(day => day.date.startsWith(currentMonthKey));
  const monthlyJournalEntries = (progress.learningJournal || []).filter(entry => new Date(entry.createdAt).toISOString().slice(0, 7) === currentMonthKey);
  const weeklyMinutes = recentDailyStats.reduce((sum, day) => sum + day.timeSpentMinutes, 0);
  const weeklyAttempted = recentDailyStats.reduce((sum, day) => sum + day.problemsAttempted, 0);
  const weeklyCorrect = recentDailyStats.reduce((sum, day) => sum + day.problemsCorrect, 0);
  const weeklyRooms = Array.from(new Set(recentDailyStats.flatMap(day => day.roomsVisited))).length;
  const monthlyMinutes = monthlyDailyStats.reduce((sum, day) => sum + day.timeSpentMinutes, 0);
  const monthlyAttempted = monthlyDailyStats.reduce((sum, day) => sum + day.problemsAttempted, 0);
  const monthlyCorrect = monthlyDailyStats.reduce((sum, day) => sum + day.problemsCorrect, 0);
  const monthlyRooms = Array.from(new Set(monthlyDailyStats.flatMap(day => day.roomsVisited))).length;
  const monthlyLearningDays = monthlyDailyStats.filter(day => day.timeSpentMinutes > 0 || day.problemsAttempted > 0 || day.roomsVisited.length > 0).length;
  const monthlyMasteryProofs = monthlyJournalEntries.filter(entry => entry.mastered).length;
  const monthlyReflectionProofs = monthlyJournalEntries.filter(entry => Boolean(entry.childReflection)).length;
  const weeklyGoalMinutes = progress.weeklyGoalMinutes || 60;
  const dailySessionLimitMinutes = progress.dailySessionLimitMinutes || 20;
  const weeklyGoalPercent = Math.min(100, Math.round((weeklyMinutes / weeklyGoalMinutes) * 100));
  const activeLearningDays = recentDailyStats.filter(day => day.timeSpentMinutes > 0).length;
  const healthyPacingDays = recentDailyStats.filter(day => day.timeSpentMinutes > 0 && day.timeSpentMinutes <= dailySessionLimitMinutes).length;
  const weeklyAccuracy = weeklyAttempted > 0 ? Math.round((weeklyCorrect / weeklyAttempted) * 100) : 0;
  const monthlyAccuracy = monthlyAttempted > 0 ? Math.round((monthlyCorrect / monthlyAttempted) * 100) : 0;
  const gradePacingThresholds: { [level: number]: number } = {
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
  const nextGradeTarget = gradePacingThresholds[progress.currentLevel];
  const nextGradeProgress = nextGradeTarget ? Math.min(progress.stickers.length, nextGradeTarget) : progress.stickers.length;
  const nextGradePercent = nextGradeTarget ? Math.round((nextGradeProgress / nextGradeTarget) * 100) : 100;
  const masteryMinimum = gradeMasteryMinimums[progress.currentLevel];
  const masterySubjects = [
    { name: 'Math', score: progress.mathScore || 0 },
    { name: 'Reading', score: progress.readingScore || 0 },
    { name: 'Story Time', score: progress.storybookScore || 0 },
    { name: 'Science', score: progress.scienceScore || 0 },
    { name: 'Geography', score: progress.geographyScore || 0 },
    { name: 'Coding', score: progress.codingScore || 0 },
    { name: 'Language', score: progress.languageScore || 0 },
  ];
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
  const currentGradeVisitedRooms = new Set(progress.gradeRoomVisits?.[String(progress.currentLevel)] || []);
  const roomCoverageCount = requiredGradeRooms.filter(room => currentGradeVisitedRooms.has(room)).length;
  const masteryReadyCount = masteryMinimum ? masterySubjects.filter(subject => subject.score >= masteryMinimum).length : masterySubjects.length;
  const nextGradeRequirements = [
    {
      label: 'Stars earned',
      detail: nextGradeTarget ? `${nextGradeProgress}/${nextGradeTarget}` : 'Top grade path',
      done: !nextGradeTarget || nextGradeProgress >= nextGradeTarget,
    },
    {
      label: 'Balanced subject mastery',
      detail: masteryMinimum ? `${masteryReadyCount}/7 subjects at ${masteryMinimum}+` : 'Top grade path',
      done: !masteryMinimum || masteryReadyCount >= 7,
    },
    {
      label: 'Every-room coverage',
      detail: `${roomCoverageCount}/${requiredGradeRooms.length} rooms`,
      done: roomCoverageCount >= requiredGradeRooms.length,
    },
  ];
  const currentGradeRoomCount = new Set(currentGradeUnits.map(unit => unit.room)).size;
  const currentGradeUnitCount = currentGradeUnits.length;
  const completedCurrentGradeUnits = currentGradeUnits.filter(unit => progress.completedUnitIds?.includes(unit.id)).length;
  const unitPracticeCounts = progress.unitPracticeCounts || {};
  const activeGradePracticeEvents = currentGradeUnits.reduce((sum, unit) => sum + (unitPracticeCounts[unit.id] || 0), 0);
  const unitReadinessSummary = currentGradeUnits.reduce((summary, unit) => {
    const readiness = getUnitReadiness(progress, unit, masteryMinimum || 3);
    return {
      ...summary,
      [readiness]: summary[readiness] + 1,
    };
  }, {
    ready: 0,
    'in-progress': 0,
    'needs-practice': 0,
  } as Record<'ready' | 'in-progress' | 'needs-practice', number>);
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const lastPracticedAtByUnit = (progress.learningJournal || []).reduce((latest, entry) => {
    if (entry.unitId) {
      latest[entry.unitId] = Math.max(latest[entry.unitId] || 0, entry.createdAt);
    }
    return latest;
  }, {} as Record<string, number>);
  const getReviewTiming = (unit: (typeof currentGradeUnits)[number]) => {
    const lastPracticedAt = lastPracticedAtByUnit[unit.id];
    if (!lastPracticedAt) {
      return {
        label: `${unit.reviewCycleDays}d cycle`,
        detail: 'Ready for the first guided practice round.',
        lastLabel: 'First practice ready',
        isDue: false,
      };
    }

    const daysSincePractice = Math.max(0, Math.floor((now - lastPracticedAt) / dayMs));
    const daysUntilReview = Math.max(0, unit.reviewCycleDays - daysSincePractice);
    const lastLabel = daysSincePractice === 0
      ? 'Practiced today'
      : daysSincePractice === 1
        ? 'Practiced yesterday'
        : `Practiced ${daysSincePractice} days ago`;

    return {
      label: daysUntilReview === 0 ? 'Review due' : `Review in ${daysUntilReview}d`,
      detail: daysUntilReview === 0
        ? 'Ask for an explain-again check today.'
        : `Next explain-again check in ${daysUntilReview} day${daysUntilReview === 1 ? '' : 's'}.`,
      lastLabel,
      isDue: daysUntilReview === 0,
    };
  };
  const getPracticeActivities = (unit: CurriculumUnit) => unit.practiceActivities?.slice(0, 8) || [
    unit.objective,
    `Practice one example connected to ${unit.standardsFocus[0].toLowerCase()}.`,
    `Try a second example using ${unit.standardsFocus[Math.min(1, unit.standardsFocus.length - 1)].toLowerCase()}.`,
    'Pause and name the clue or strategy that helped.',
    'Say the strategy out loud before finishing.',
  ];
  const getEndChecks = (unit: CurriculumUnit) => unit.endOfLessonChecks?.slice(0, 7) || [
    unit.successCheck,
    'Child completes one mixed example with less help.',
    'Child names one mistake to watch for next time.',
    'Child explains the idea in their own words.',
    'Child tries one more example without guessing.',
  ];
  const spacedReviewQueue = [...currentGradeUnits]
    .sort((a, b) => {
      const aTiming = getReviewTiming(a);
      const bTiming = getReviewTiming(b);
      if (aTiming.isDue !== bTiming.isDue) return aTiming.isDue ? -1 : 1;
      const aCompleted = progress.completedUnitIds?.includes(a.id) ? 1 : 0;
      const bCompleted = progress.completedUnitIds?.includes(b.id) ? 1 : 0;
      if (aCompleted !== bCompleted) return bCompleted - aCompleted;
      const aPractice = unitPracticeCounts[a.id] || 0;
      const bPractice = unitPracticeCounts[b.id] || 0;
      if ((aPractice > 0) !== (bPractice > 0)) return aPractice > 0 ? -1 : 1;
      return a.reviewCycleDays - b.reviewCycleDays;
    })
    .slice(0, 5);
  const spacedReviewDueCount = spacedReviewQueue.filter(unit => getReviewTiming(unit).isDue).length;
  const getReadinessLabel = (readiness: 'ready' | 'in-progress' | 'needs-practice') => {
    if (readiness === 'ready') return 'Ready';
    if (readiness === 'in-progress') return 'In progress';
    return 'Needs practice';
  };
  const getReadinessClasses = (readiness: 'ready' | 'in-progress' | 'needs-practice') => {
    if (readiness === 'ready') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (readiness === 'in-progress') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };
  const grades = [
    GradeLevel.PRE_K,
    GradeLevel.KINDERGARTEN,
    GradeLevel.FIRST_GRADE,
    GradeLevel.SECOND_GRADE,
    GradeLevel.THIRD_GRADE,
    GradeLevel.FOURTH_GRADE,
    GradeLevel.FIFTH_GRADE,
  ];
  const familyPlanValue = [
    'Structured daily missions across every learning room',
    'Slow grade pacing with mastery checks before promotion',
    'Parent dashboard, printable practice, and local child profiles',
    'Optional premium voice narration and illustrated story covers from saved static media',
  ];
  const familyProtectionItems = [
    { label: 'Parent-controlled setup', status: 'A grown-up creates the child profile and PIN.' },
    { label: 'Opt-in cloud sync', status: 'Firebase progress sync stays off until a parent turns it on.' },
    { label: 'Static media library', status: 'Story covers and narration are served from saved media files.' },
    { label: 'No kid payment screens', status: 'Billing choices stay outside the child learning area.' },
  ];
  const launchReadySignals = [
    'Local parent PIN protects settings and data controls',
    'Firebase parent account sign-in and opt-in progress sync are wired',
    'Curriculum roadmap covers grades and rooms',
    'Progress and learning goals are visible to parents',
  ];
  const hasScoredActivities = subjectData.some(subject => subject.score > 0);
  const strongestSubject = subjectData.find(subject => subject.score > 0);
  const focusSubject = hasScoredActivities
    ? [...subjectData].reverse().find(subject => subject.score < (masteryMinimum || 3)) || subjectData[subjectData.length - 1]
    : undefined;
  const nextPlanItem = weeklyPlan[0];
  const recentLearningJournal = [...(progress.learningJournal || [])]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  const learningReportCards = [
    {
      label: 'Practice rhythm',
      value: `${activeLearningDays}/7 days`,
      detail: activeLearningDays >= 4
        ? 'Strong weekly rhythm. Keep sessions short and consistent.'
        : 'Aim for four short practice days before adding longer sessions.',
    },
    {
      label: 'Accuracy signal',
      value: weeklyAttempted > 0 ? `${weeklyAccuracy}%` : 'Ready',
      detail: weeklyAttempted > 0
        ? `${weeklyCorrect}/${weeklyAttempted} activities correct this week.`
        : 'Accuracy starts tracking after the first scored activity.',
    },
    {
      label: 'Strongest room',
      value: strongestSubject?.name || 'Start today',
      detail: strongestSubject
        ? `${strongestSubject.score} correct activities recorded.`
        : 'The strongest room appears after the first completed lesson.',
    },
    {
      label: 'Healthy pacing',
      value: `${healthyPacingDays}/${Math.max(activeLearningDays, 1)} days`,
      detail: `${dailySessionLimitMinutes} minute daily cap before an offline break.`,
    },
  ];
  const monthlyReportCards = [
    {
      label: 'Learning days',
      value: `${monthlyLearningDays}`,
      detail: `${monthlyMinutes} minutes and ${monthlyJournalEntries.length} saved proof item${monthlyJournalEntries.length === 1 ? '' : 's'} this month.`,
    },
    {
      label: 'Monthly accuracy',
      value: monthlyAttempted > 0 ? `${monthlyAccuracy}%` : 'Ready',
      detail: monthlyAttempted > 0 ? `${monthlyCorrect}/${monthlyAttempted} correct activities this month.` : 'Monthly accuracy starts after scored practice.',
    },
    {
      label: 'Rooms this month',
      value: `${monthlyRooms}`,
      detail: 'Unique learning rooms visited during the current calendar month.',
    },
    {
      label: 'Mastery proof',
      value: `${monthlyMasteryProofs}`,
      detail: `${monthlyReflectionProofs} student reflection${monthlyReflectionProofs === 1 ? '' : 's'} saved for parent review.`,
    },
  ];
  const arcadeProgress = {
    ...DEFAULT_ARCADE_PROGRESS,
    ...(progress.arcadeProgress || {}),
    gameWins: progress.arcadeProgress?.gameWins || {},
    masteredGameIds: progress.arcadeProgress?.masteredGameIds || [],
  };
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayArcadeWins = arcadeProgress.dailyChallengeDate === todayKey ? arcadeProgress.dailyChallengeWins : 0;
  const arcadeGameRows = [
    {
      label: 'Number Dash',
      id: 'number-dash',
      skill: 'Number fluency',
      parentAction: 'Ask the child to explain the strategy before picking an answer.',
    },
    {
      label: 'Word Builder',
      id: 'word-builder',
      skill: 'Phonics and vocabulary',
      parentAction: 'Have the child say the full word slowly, then name the missing sound.',
    },
    {
      label: 'Pattern Quest',
      id: 'pattern-quest',
      skill: 'Logic and working memory',
      parentAction: 'Ask what repeats or changes before the next choice appears.',
    },
    {
      label: 'Story Detective',
      id: 'story-detective',
      skill: 'Reading comprehension',
      parentAction: 'Ask the child to point to the clue that proves the answer.',
    },
    {
      label: 'Robot Maze',
      id: 'robot-maze',
      skill: 'Sequencing and debugging',
      parentAction: 'Have the child trace each command in order and fix one wrong turn.',
    },
    {
      label: 'Rhythm Tap',
      id: 'rhythm-tap',
      skill: 'Rhythm and auditory memory',
      parentAction: 'Clap the pattern together, then let the child predict the next beat.',
    },
  ].map(game => ({
    ...game,
    wins: arcadeProgress.gameWins[game.id] || 0,
    mastered: arcadeProgress.masteredGameIds.includes(game.id) || (arcadeProgress.gameWins[game.id] || 0) >= 3,
  }));
  const arcadeMasteredCount = arcadeGameRows.filter(game => game.mastered).length;
  const arcadeGamesStartedCount = arcadeGameRows.filter(game => game.wins > 0).length;
  const arcadeLongTermMasteryPercent = Math.round((arcadeMasteredCount / Math.max(arcadeGameRows.length, 1)) * 100);
  const arcadeRecommendedGame = [...arcadeGameRows]
    .filter(game => !game.mastered)
    .sort((first, second) => first.wins - second.wins)[0] || arcadeGameRows[0];
  const arcadeStrongestGame = [...arcadeGameRows].sort((first, second) => second.wins - first.wins)[0];
  const arcadeQuestCards = [
    {
      label: 'Daily Quest Plan',
      value: todayArcadeWins > 0 ? 'Done today' : 'Needs one win',
      detail: todayArcadeWins > 0
        ? `${todayArcadeWins} arcade win${todayArcadeWins === 1 ? '' : 's'} recorded today.`
        : 'Have the child finish one arcade mission before free exploration.',
    },
    {
      label: 'Next game to assign',
      value: arcadeRecommendedGame?.label || 'Start arcade',
      detail: arcadeRecommendedGame
        ? `${arcadeRecommendedGame.skill}: ${arcadeRecommendedGame.parentAction}`
        : 'Start with any short arcade game and watch for strategy talk.',
    },
    {
      label: 'Strongest arcade skill',
      value: arcadeStrongestGame?.wins ? arcadeStrongestGame.label : 'Start arcade',
      detail: arcadeStrongestGame?.wins
        ? `${arcadeStrongestGame.skill} has the most saved wins so far.`
        : 'The strongest arcade skill appears after the first completed game mission.',
    },
  ];
  const arcadePassportCards = [
    {
      label: 'Starter Badge',
      value: `${Math.min(arcadeProgress.totalWins, 1)}/1`,
      detail: 'First completed arcade mission.',
      done: arcadeProgress.totalWins >= 1,
    },
    {
      label: 'Balanced Explorer',
      value: `${Math.min(arcadeGamesStartedCount, 3)}/3`,
      detail: 'Three different arcade skill paths tried.',
      done: arcadeGamesStartedCount >= 3,
    },
    {
      label: 'Mastery Collector',
      value: `${Math.min(arcadeMasteredCount, 3)}/3`,
      detail: 'Three arcade badges mastered.',
      done: arcadeMasteredCount >= 3,
    },
    {
      label: 'All-Room Arcade Champion',
      value: `${arcadeMasteredCount}/6`,
      detail: 'Every arcade skill path mastered.',
      done: arcadeMasteredCount >= arcadeGameRows.length,
    },
  ];
  const lastArcadePlayed = arcadeProgress.lastPlayedAt
    ? new Date(arcadeProgress.lastPlayedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'Not played yet';
  const parentNextActions = [
    focusSubject
      ? `Give ${focusSubject.name} one short practice block before free exploration.`
      : nextPlanItem
        ? `Start with today's guided mission: ${nextPlanItem.unit.title}.`
        : 'Start with one guided mission before free exploration.',
    nextPlanItem
      ? `Use today's parent activity: ${nextPlanItem.unit.parentActivity}`
      : 'Pick one at-home activity from the weekly plan.',
    arcadeRecommendedGame
      ? `Use Game Arcade next: ${arcadeRecommendedGame.label} for ${arcadeRecommendedGame.skill.toLowerCase()}.`
      : 'Use Game Arcade for one short skill check.',
    activeLearningDays >= 4
      ? 'Ask the child to explain one solved problem out loud.'
      : 'Build a four-day weekly habit with short sessions.',
  ];

  const unlockParentDashboard = () => {
    const answer = gateAnswer.trim();
    const isValid = hasParentPin ? answer === parentPin : answer === '15';
    if (isValid) {
      setIsParentVerified(true);
    } else {
      setGateError(hasParentPin ? 'That PIN did not match. Please try again.' : 'That answer did not match. Please try again.');
    }
  };

  const saveLearningGoals = () => {
    const weeklyGoal = Number(weeklyGoalDraft);
    const dailyLimit = Number(dailyLimitDraft);
    if (!Number.isFinite(weeklyGoal) || !Number.isFinite(dailyLimit)) {
      setGoalStatus('Please enter valid numbers.');
      return;
    }
    onUpdateLearningGoals?.(weeklyGoal, dailyLimit);
    setWeeklyGoalDraft(String(Math.max(10, Math.min(600, Math.round(weeklyGoal)))));
    setDailyLimitDraft(String(Math.max(5, Math.min(120, Math.round(dailyLimit)))));
    setGoalStatus('Learning goals saved.');
  };

  const exportLocalProgress = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      app: 'Kid Genius World',
      version: 'web-parent-export',
      note: 'Parent progress export. Do not share publicly because it may include child profile names and learning activity.',
      progress,
      profiles,
      activeProfileId,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kid-genius-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportDiagnostics = () => {
    exportDiagnosticEvents();
    setDiagnosticEvents(getDiagnosticEvents());
  };

  const clearDiagnostics = () => {
    clearDiagnosticEvents();
    setDiagnosticEvents([]);
  };

  const getFriendlyFirebaseMessage = (message: string) => {
    if (message.includes('auth/operation-not-allowed')) {
      return 'Firebase Email/Password sign-in is not enabled yet. Turn it on in Firebase Console under Authentication > Sign-in method.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'That parent email already has an account. Use Sign In Parent instead.';
    }
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
      return 'The parent email or password did not match a Firebase account.';
    }
    if (message.includes('auth/weak-password')) {
      return 'Use a stronger parent password with at least 6 characters.';
    }
    if (message.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in was closed before it finished.';
    }
    if (message.includes('auth/popup-blocked')) {
      return 'The browser blocked the Google sign-in popup. Allow popups for this site and try again.';
    }
    if (message.includes('auth/unauthorized-domain')) {
      return 'This domain is not authorized for Firebase Google sign-in. Add it in Firebase Authentication settings.';
    }
    if (message.includes('auth/account-exists-with-different-credential')) {
      return 'That email already uses another sign-in method. Sign in with the original method first.';
    }
    if (message.includes('permission-denied')) {
      return 'Firebase blocked this write. Check that the parent is signed in and Firestore rules are deployed.';
    }
    if (message.includes('network-request-failed')) {
      return 'Firebase could not be reached. Check the internet connection and try again.';
    }
    return message;
  };

  const runCloudAction = async (action: () => Promise<void>, fallbackMessage: string) => {
    setIsCloudActionBusy(true);
    setCloudAuthStatus('');
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      setCloudAuthStatus(getFriendlyFirebaseMessage(message));
    } finally {
      setIsCloudActionBusy(false);
    }
  };

  const runBillingAction = async (action: () => Promise<void>, fallbackMessage: string) => {
    setIsBillingBusy(true);
    setCloudAuthStatus('');
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      setCloudAuthStatus(message);
    } finally {
      setIsBillingBusy(false);
    }
  };

  if (requireParentGate && !isParentVerified) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-purple-700 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <button onClick={onBack} aria-label="Back to world map" className="mb-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Parent Check</h1>
              <p className="text-sm text-gray-500">For grown-ups only</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            {hasParentPin
              ? 'Enter the parent PIN to open settings, progress, privacy, and data controls.'
              : 'Please solve this quick grown-up check to open settings, progress, privacy, and data controls.'}
          </p>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="parent-gate">
            {hasParentPin ? 'Parent PIN' : 'What is 8 + 7?'}
          </label>
          <input
            id="parent-gate"
            inputMode="numeric"
            type={hasParentPin ? 'password' : 'text'}
            value={gateAnswer}
            onChange={(event) => {
              setGateAnswer(event.target.value.replace(/\D/g, '').slice(0, 8));
              setGateError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                unlockParentDashboard();
              }
            }}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-bold focus:border-indigo-500 focus:outline-none"
            placeholder="Answer"
          />
          {gateError && <p className="text-sm text-red-600 mt-2">{gateError}</p>}
          <button
            onClick={unlockParentDashboard}
            className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            Unlock Parent Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col overflow-y-auto overflow-x-hidden kid-scroll">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white sticky top-0 z-20">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button onClick={onBack} aria-label="Back to world map" className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition shrink-0">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-base sm:text-xl font-bold flex items-center gap-2 min-w-0 text-center">
            <Shield size={24} />
            Parent Dashboard
          </h1>
          <div className="w-10 shrink-0" /> {/* Spacer */}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{progress.currentLevel}</p>
            <p className="text-xs opacity-80">Level</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{totalProblems}</p>
            <p className="text-xs opacity-80">Problems Solved</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{progress.stickers.length}</p>
            <p className="text-xs opacity-80">Stickers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
        <div className="grid grid-cols-5 bg-white border-b sticky top-[140px] sm:top-[120px] z-10">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
          { id: 'gradebook', label: 'Gradebook', icon: <ClipboardList size={18} /> },
          { id: 'skills', label: 'Skills', icon: <Brain size={18} /> },
          { id: 'curriculum', label: 'Roadmap', icon: <Map size={18} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ParentDashboardTab)}
            className={`py-3 px-2 flex items-center justify-center gap-2 font-semibold transition text-sm sm:text-base ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span className="text-[11px] sm:text-base">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Grade */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award size={20} className="text-indigo-500" />
                Current Progress
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600 break-words">{progress.currentGrade}</p>
                  <p className="text-sm text-gray-500">Grade Level</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-green-600">{progress.currentStreak}</p>
                  <p className="text-sm text-gray-500">Day Streak</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                <div className="flex items-center justify-between gap-3 text-sm mb-2">
                  <span className="font-semibold text-indigo-900">Grade pacing</span>
                  <span className="font-bold text-indigo-700">
                    {nextGradeTarget ? `${nextGradeProgress}/${nextGradeTarget} stars` : 'Top grade path'}
                  </span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${nextGradePercent}%` }}
                  />
                </div>
                <p className="text-xs text-indigo-700 mt-2">
                  Students stay in each grade longer so they practice every room before the next grade unlocks.
                </p>
                {masteryMinimum && (
                  <>
                    <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-700">Every-room coverage</span>
                        <span className={`font-bold ${roomCoverageCount >= requiredGradeRooms.length ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {roomCoverageCount}/{requiredGradeRooms.length} rooms
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {masterySubjects.map(subject => (
                        <div key={subject.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs">
                          <span className="font-semibold text-gray-700">{subject.name}</span>
                          <span className={`font-bold ${subject.score >= masteryMinimum ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {Math.min(subject.score, masteryMinimum)}/{masteryMinimum}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Target size={20} className="text-emerald-500" />
                Next Grade Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {nextGradeRequirements.map(requirement => (
                  <div key={requirement.label} className={`rounded-xl border p-3 ${requirement.done ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    <p className={`text-sm font-bold ${requirement.done ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {requirement.done ? 'Ready' : 'Keep practicing'}
                    </p>
                    <p className="font-semibold text-gray-800 mt-1">{requirement.label}</p>
                    <p className="text-sm text-gray-600">{requirement.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 shadow-sm text-white">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-200">Teacher Mission Control</p>
                  <h3 className="text-xl font-black mt-1">{AI_TEACHER.name}'s school-day plan</h3>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                    Parents can see the teacher objective, lesson phase, mastery gate, and exit-ticket proof before the child moves ahead.
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3">
                  <p className="text-2xl font-black">{schoolDay.mastery.practiceCount}/{MASTERED_PRACTICE_TARGET}</p>
                  <p className="text-xs text-slate-300">answers required before next class opens</p>
                </div>
              </div>
              <div
                data-testid="parent-school-day-attendance"
                className="mt-4 rounded-xl bg-white/10 border border-white/15 p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-200">School-day attendance</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">{schoolDay.attendanceSummary}</p>
                  </div>
                  <div className="rounded-xl bg-white px-4 py-2 text-center text-slate-950">
                    <p className="text-xl font-black">{schoolDay.completedPeriods}/{schoolDay.totalPeriods}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">periods complete</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300"
                    style={{ width: `${schoolDay.schoolDayPercent}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {schoolDay.periods.map(period => (
                    <div key={period.id} className={`rounded-lg border p-2 ${getSchoolPeriodClasses(period.status)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-100">{getSchoolPeriodLabel(period.status)}</p>
                          <p className="mt-1 text-sm font-black text-white">{period.label}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-slate-100">{period.actionLabel}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-300">{period.detail}</p>
                      <div className="mt-2 rounded-lg bg-white/10 p-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100">Required proof</p>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-white">{period.proof}</p>
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-sky-100">Reward: {period.reward}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-300">{period.whyItMatters}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div
                data-testid="parent-teacher-assignments"
                className="mt-4 rounded-xl bg-white/10 border border-white/15 p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-200">Teacher assignment cards</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      Every classroom has a real assigned lesson, example, parent note, and mastery rubric.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white px-4 py-2 text-center text-slate-950">
                    <p className="text-xl font-black">{teacherAssignments.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">assignments</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                  {teacherAssignments.map(card => (
                    <div key={card.unitId} className={`rounded-lg border p-2 ${getSchoolPeriodClasses(card.status)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-100">{card.statusLabel}</p>
                          <p className="mt-1 line-clamp-2 text-sm font-black text-white">{card.classroomName}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-slate-100">{card.practiceCount}/{MASTERED_PRACTICE_TARGET}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs font-black text-slate-100">{card.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-300">{card.objective}</p>
                      <div className="mt-2 rounded-lg bg-white/10 p-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-indigo-100">Mastery rubric</p>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-white">{card.masteryRubric}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[11px] font-semibold text-slate-300">Parent note: {card.parentNote}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-3">
                <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-200">Today in {getCampusRoom(schoolDay.mission.room).classroomName}</p>
                  <h4 className="mt-1 text-lg font-black">{schoolDay.mission.title}</h4>
                  <p className="mt-1 text-sm font-semibold text-slate-300">{missionTeacherScript.objective}</p>
                  <div className="mt-3 rounded-lg bg-emerald-400/15 border border-emerald-300/30 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-200">Exit ticket</p>
                    <p className="mt-1 text-sm font-bold text-white">{missionTeacherScript.exitTicket}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {teacherNotes.slice(0, 4).map(note => (
                    <div key={`${note.label}-${note.value}`} className="rounded-xl bg-white/[0.08] border border-white/10 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">{note.label}</p>
                      <p className="mt-1 text-sm font-black text-white">{note.value}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-300">{note.detail}</p>
                      {note.nextStep && (
                        <p className="mt-2 rounded-lg bg-white/10 px-2 py-1 text-xs font-bold text-slate-100">Next: {note.nextStep}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div
                data-testid="parent-teacher-help-ladder"
                className="mt-4 rounded-xl bg-amber-300/15 border border-amber-200/25 p-3"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-100">Teacher help ladder</p>
                    <h4 className="mt-1 text-lg font-black text-white">How {AI_TEACHER.name} helps when learning gets hard</h4>
                    <p className="mt-1 max-w-3xl text-sm font-semibold text-amber-50">
                      When a child gets stuck, {AI_TEACHER.name} moves through hint, model, try together, then teach-back proof before the lesson counts as secure.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white px-4 py-2 text-center text-slate-950">
                    <p className="text-xl font-black">{teacherHelpLadder.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">support steps</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                  {teacherHelpLadder.map((step, index) => (
                    <div key={step.id} className="rounded-lg bg-white/10 border border-white/10 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">Step {index + 1}</p>
                      <p className="mt-1 text-sm font-black text-white">{step.label}</p>
                      <p className="mt-1 line-clamp-3 text-xs font-semibold text-amber-50">{step.prompt}</p>
                      <p className="mt-2 line-clamp-3 text-[11px] font-semibold text-slate-200">{step.parentMeaning}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
                {SCHOOL_LESSON_PHASES.map(phase => (
                  <div key={phase.id} className="rounded-lg bg-white/[0.08] border border-white/10 p-2">
                    <p className="text-xs font-black text-white">{phase.label}</p>
                    <p className="mt-1 text-[11px] text-slate-300">{phase.parentMeaning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-500" />
                Subject Performance
              </h3>
              <div className="space-y-3">
                {subjectData.map(subject => (
                  <div key={subject.name} className="flex items-center gap-3">
                    <span className="text-2xl w-8">{subject.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-gray-500">{subject.score} correct</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${subject.color} rounded-full transition-all`}
                          style={{ width: `${(subject.score / maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Target size={20} className="text-orange-500" />
                Recommendations
              </h3>
              <div className="space-y-2">
                {roadmapRecommendations.length > 0 ? (
                  roadmapRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <ChevronRight size={16} className="text-orange-500" />
                      {rec}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Keep exploring all the learning rooms!</p>
                )}
              </div>
            </div>

            <div className="printable-parent-report bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Parent Learning Report</p>
                  <h3 className="text-xl font-black text-gray-900 mt-1">Weekly insight for grown-ups</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    A plain-language report parents can use to understand practice quality, pacing, and what to do next.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-left md:text-right">
                    <p className="text-2xl font-black text-indigo-700">{weeklyGoalPercent}%</p>
                    <p className="text-xs font-semibold text-indigo-700">weekly goal progress</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700"
                  >
                    <Printer size={16} />
                    Print Weekly Report
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {learningReportCards.map(card => (
                  <div key={card.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{card.value}</p>
                    <p className="text-xs text-slate-600 mt-1">{card.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black text-sky-900">Monthly progress report</p>
                    <p className="mt-1 text-sm font-semibold text-sky-900/80">
                      Current-month totals connect daily class work to parent review, mastery proof, and saved reflections.
                    </p>
                  </div>
                  <p className="rounded-full bg-white px-3 py-1 text-xs font-black text-sky-700">{currentMonthKey}</p>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                  {monthlyReportCards.map(card => (
                    <div key={card.label} className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-500">{card.label}</p>
                      <p className="mt-1 text-xl font-black text-slate-900">{card.value}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{card.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-black text-violet-900">Skill Strand Report</p>
                    <p className="mt-1 text-sm font-semibold text-violet-900/80">
                      Parent strand report across math, reading, science, geography, coding, and language.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      <p className="text-lg font-black text-violet-700">{practicedStrandCount}/{skillStrandReports.length}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-600">started</p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      <p className="text-lg font-black text-emerald-700">{strongStrandCount}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600">strong</p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      <p className="text-lg font-black text-sky-700">{strandEvidenceCount}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-sky-600">proof</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                  {strandFocusQueue.map(strand => (
                    <div key={`${strand.subject}-${strand.strand}`} className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-violet-600">{strand.subject}</p>
                          <p className="mt-1 text-sm font-black text-slate-900">{strand.strand}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${getSkillStatusClasses(strand.status)}`}>
                          {strand.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-600">{strand.nextAssignment}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-sm font-black text-emerald-800 mb-2">Next parent actions</p>
                <div className="space-y-2">
                  {parentNextActions.map(action => (
                    <div key={action} className="flex items-start gap-2 text-sm text-emerald-900">
                      <ChevronRight size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-cyan-100">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Gamepad2 size={20} className="text-cyan-600" />
                    Game Arcade Proof
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Arcade play is now saved as parent-visible progress, not just free play.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-cyan-50 border border-cyan-100 px-3 py-2">
                    <p className="text-xl font-black text-cyan-700">{arcadeProgress.totalWins}</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-700">wins</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <p className="text-xl font-black text-emerald-700">{arcadeMasteredCount}/6</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">mastered</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                    <p className="text-xl font-black text-amber-700">{todayArcadeWins}</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">today</p>
                  </div>
                </div>
              </div>
              <div className="mb-3 rounded-xl bg-gradient-to-r from-cyan-50 via-white to-emerald-50 border border-cyan-100 p-3">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-cyan-900">Arcade Skill Coach</p>
                    <p className="mt-1 text-sm text-cyan-900/80">
                      Parent view of the same Daily Quest Plan, mastery step, and next game recommendation kids see in the arcade.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-700 shadow-sm">
                    Paid-user proof
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  {arcadeQuestCards.map(card => (
                    <div key={card.label} className="rounded-lg bg-white border border-cyan-100 p-3 shadow-sm">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-cyan-600">{card.label}</p>
                      <p className="mt-1 text-base font-black text-gray-900">{card.value}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-600">{card.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3 rounded-xl bg-slate-950 p-3 text-white shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-cyan-200">Arcade Passport Summary</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Parent view of the Badge Trail, long-term mastery, and all-room arcade badges.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
                    <p className="text-2xl font-black">{arcadeLongTermMasteryPercent}%</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200">Long-term mastery</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300"
                    style={{ width: `${arcadeLongTermMasteryPercent}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {arcadePassportCards.map(card => (
                    <div key={card.label} className={`rounded-lg border p-3 ${card.done ? 'border-emerald-300/50 bg-emerald-400/15' : 'border-white/10 bg-white/[0.06]'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-white">{card.label}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-300">{card.detail}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-black ${card.done ? 'bg-emerald-300 text-emerald-950' : 'bg-white/10 text-slate-200'}`}>
                          {card.done ? 'Earned' : card.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <p className="text-sm font-black text-gray-800 mb-3">Arcade mastery ladder</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {arcadeGameRows.map(game => {
                      const percent = Math.min(100, Math.round((Math.min(game.wins, 3) / 3) * 100));
                      return (
                        <div key={game.id} className="rounded-lg bg-white border border-gray-100 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-gray-800">{game.label}</span>
                            <span className={`text-xs font-black ${game.mastered ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {game.mastered ? 'Mastered' : `${Math.min(game.wins, 3)}/3`}
                            </span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3">
                  <p className="text-sm font-black text-cyan-900">What this tells parents</p>
                  <div className="mt-3 space-y-2 text-sm text-cyan-900">
                    <p><span className="font-black">Best combo:</span> {arcadeProgress.bestCombo}</p>
                    <p><span className="font-black">Last arcade day:</span> {lastArcadePlayed}</p>
                    <p><span className="font-black">Learning value:</span> games connect back to math, reading, logic, stories, coding, and music rooms.</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-testid="parent-student-passport"
              className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600">Student Learning Passport</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">Teacher conference snapshot</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{studentPassport.attendanceLabel}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <p className="text-lg font-black text-emerald-700">{studentPassport.evidenceCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-800">proof</p>
                  </div>
                  <div className="rounded-xl bg-violet-50 px-3 py-2">
                    <p className="text-lg font-black text-violet-700">{studentPassport.reflectionCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-800">reflect</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2">
                    <p className="text-lg font-black text-amber-700">{studentPassport.roomCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-800">rooms</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl bg-indigo-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Teacher conference question</p>
                  <p className="mt-1 text-sm font-black text-indigo-950">{studentPassport.teacherConferenceQuestion}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Parent follow-up</p>
                  <p className="mt-1 text-sm font-bold text-emerald-950">{studentPassport.parentFollowUp}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Latest proof</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{studentPassport.latestProofLabel}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{studentPassport.latestProofDetail}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">Next stamp target</p>
                  <p className="mt-1 text-sm font-bold text-amber-950">{studentPassport.nextStampTarget}</p>
                </div>
              </div>
              <div
                data-testid="parent-teacher-conference-plan"
                className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-700">Teacher conference plan</p>
                    <h4 className="mt-1 text-base font-black text-slate-900">{teacherConferencePlan.statusLabel}</h4>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{teacherConferencePlan.headline}</p>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
                    <p className="text-sm font-black text-sky-800">{teacherConferencePlan.focusRoom}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{teacherConferencePlan.evidenceLabel}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-700">Teacher move</p>
                    <p className="mt-1 text-xs font-bold text-slate-700">{teacherConferencePlan.teacherMove}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Student can say</p>
                    <p className="mt-1 text-xs font-bold text-slate-700">{teacherConferencePlan.studentCanSay}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">Parent check-in</p>
                    <p className="mt-1 text-xs font-bold text-slate-700">{teacherConferencePlan.parentCheckIn}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-700">Review plan</p>
                    <p className="mt-1 text-xs font-bold text-slate-700">{teacherConferencePlan.reviewPlan}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen size={20} className="text-emerald-600" />
                    Learning Journal
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Recent proof of practice parents can review during check-ins.
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">
                  {recentLearningJournal.length} saved
                </div>
              </div>
              {recentLearningJournal.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {recentLearningJournal.map(entry => (
                    <div key={entry.id} className="rounded-xl border border-gray-100 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
                            {entry.roomLabel}
                          </p>
                          <h4 className="font-black text-gray-900 mt-1">{entry.unitTitle}</h4>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                          entry.mastered
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {entry.mastered ? 'Mastered' : `${Math.min(entry.practiceCount, MASTERED_PRACTICE_TARGET)}/${MASTERED_PRACTICE_TARGET}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{entry.objective}</p>
                      {entry.teacherNote && (
                        <div className="mt-3 rounded-lg bg-indigo-50 border border-indigo-100 p-2">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">
                            {AI_TEACHER.name} note
                          </p>
                          <p className="text-sm font-bold text-indigo-950 mt-1">{entry.teacherNote}</p>
                          {entry.teacherNextStep && (
                            <p className="mt-1 text-xs font-semibold text-indigo-800">Next step: {entry.teacherNextStep}</p>
                          )}
                        </div>
                      )}
                      {entry.childReflection && (
                        <div className="mt-3 rounded-lg bg-emerald-100 border border-emerald-200 p-2">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                            Child reflection
                          </p>
                          <p className="text-sm font-bold text-emerald-900 mt-1">{entry.childReflection}</p>
                        </div>
                      )}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-white border border-gray-100 p-2">
                          <p className="font-black text-gray-700 flex items-center gap-1">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            Success check
                          </p>
                          <p className="text-gray-600 mt-1">{entry.exitTicket || entry.successCheck || 'Ask the child to teach back one idea.'}</p>
                        </div>
                        <div className="rounded-lg bg-white border border-gray-100 p-2">
                          <p className="font-black text-gray-700 flex items-center gap-1">
                            <Calendar size={14} className="text-sky-500" />
                            Parent follow-up
                          </p>
                          <p className="text-gray-600 mt-1">{entry.parentActivity || 'Try one short real-world example together.'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        Saved {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800">
                  Completed rewards will appear here as a local learning journal.
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-800 rounded-xl p-4 shadow-sm text-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-sky-200">Family Plan</p>
                  <h3 className="text-xl font-black mt-1">What families get</h3>
                  <p className="text-sm text-white/80 mt-2 max-w-2xl">
                    Kid Genius World gives families structured daily missions, parent reports, slow mastery paths, saved story media, and parent-controlled privacy settings.
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3">
                  <p className="text-2xl font-black">{currentGradeUnitCount}</p>
                  <p className="text-xs text-white/75">current-grade lessons and missions</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {familyPlanValue.map(value => (
                  <div key={value} className="rounded-xl bg-white/10 border border-white/15 p-3 text-sm font-semibold">
                    {value}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-amber-300/15 border border-amber-200/30 p-3 text-sm text-amber-50">
                Kids never enter payment details inside the learning app. Parent account, sync, and privacy choices stay behind the grown-up check.
              </div>
            </div>

            {/* Time Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                Time Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{progress.totalPlayTimeMinutes}</p>
                  <p className="text-xs text-gray-500">Total Minutes</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{progress.sessionsCompleted}</p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={20} className="text-sky-500" />
                Daily Activity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-sky-50 p-3 text-center">
                  <p className="text-2xl font-bold text-sky-600">{weeklyMinutes}</p>
                  <p className="text-xs text-gray-500">minutes this week</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{weeklyCorrect}</p>
                  <p className="text-xs text-gray-500">correct activities</p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{weeklyRooms}</p>
                  <p className="text-xs text-gray-500">rooms explored</p>
                </div>
              </div>
              <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-sky-800">Monthly report snapshot</p>
                    <p className="text-xs font-semibold text-sky-700">
                      {monthlyLearningDays} learning day{monthlyLearningDays === 1 ? '' : 's'} this month • {monthlyJournalEntries.length} saved proof item{monthlyJournalEntries.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="text-lg font-black text-sky-700">{monthlyMinutes}</p>
                      <p className="text-[10px] font-bold text-slate-500">min</p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="text-lg font-black text-emerald-700">{monthlyCorrect}</p>
                      <p className="text-[10px] font-bold text-slate-500">correct</p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2">
                      <p className="text-lg font-black text-indigo-700">{monthlyRooms}</p>
                      <p className="text-[10px] font-bold text-slate-500">rooms</p>
                    </div>
                  </div>
                </div>
              </div>
              {recentDailyStats.length > 0 ? (
                <div className="space-y-2">
                  {recentDailyStats.map(day => (
                    <div key={day.date} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="font-semibold text-gray-700">{day.date}</p>
                        <p className="text-sm text-gray-500">
                          {day.timeSpentMinutes} min • {day.problemsCorrect} correct • {day.roomsVisited.length} rooms • {day.stickersEarned} stickers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Daily activity will appear after the child enters rooms and completes lessons.</p>
              )}
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-bold text-emerald-800">Weekly learning goal</p>
                  <p className="text-sm font-black text-emerald-700">{weeklyMinutes}/{weeklyGoalMinutes} min</p>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${weeklyGoalPercent}%` }} />
                </div>
                <p className="text-xs text-emerald-700 mt-2">
                  Suggested daily cap: {dailySessionLimitMinutes} minutes before an offline break.
                </p>
              </div>
            </div>

            {/* Achievements Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                Achievements
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-yellow-600">
                  {progress.achievements.length}
                </p>
                <p className="text-gray-500">badges earned</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gradebook' && (
          <div className="space-y-4" data-testid="teacher-gradebook">
            <div className="rounded-xl bg-slate-950 p-4 text-white shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-200">Teacher Gradebook</p>
                  <h3 className="mt-1 text-xl font-black">{AI_TEACHER.name}'s classroom mastery record</h3>
                  <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-300">
                    Track every assigned classroom lesson, attempts, mastery state, last practice date, and the next action a parent can take.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-3 py-2">
                    <p className="text-xl font-black">{gradebookMasteredCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">mastered</p>
                  </div>
                  <div className="rounded-xl border border-sky-300/30 bg-sky-400/15 px-3 py-2">
                    <p className="text-xl font-black">{gradebookInProgressCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">active</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                    <p className="text-xl font-black">{gradebookNotStartedCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">assigned</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {teacherGradebookRows.map(row => (
                <div key={row.unitId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600">{row.classroomName}</p>
                      <h4 className="mt-1 text-lg font-black text-slate-900">{row.title}</h4>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{row.objective}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                      row.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : row.status === 'in-progress'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.statusLabel}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Attempts</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{row.attempts}/{MASTERED_PRACTICE_TARGET}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Last practiced</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{row.lastPracticedLabel}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Evidence</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{row.evidenceCount}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Reflections</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{row.reflectionCount}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Mastery rubric</p>
                      <p className="mt-1 text-sm font-bold text-indigo-950">{row.masteryRubric}</p>
                    </div>
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Recommended next action</p>
                      <p className="mt-1 text-sm font-bold text-emerald-950">{row.nextAction}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">Parent note</p>
                    <p className="mt-1 text-sm font-bold text-amber-950">{row.parentNote}</p>
                  </div>

                  {row.standardsFocus.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {row.standardsFocus.slice(0, 3).map(standard => (
                        <span key={`${row.unitId}-${standard}`} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
                          {standard}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-900 p-4 text-white shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">Skill Strand Report</p>
                  <h3 className="mt-1 text-xl font-black">What your child is learning by strand</h3>
                  <p className="mt-1 max-w-3xl text-sm font-semibold text-violet-100">
                    This turns room activity into parent-readable strands: mastery, attempts, evidence saved, and the next assignment.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <p className="text-xl font-black">{practicedStrandCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-200">started</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <p className="text-xl font-black">{strongStrandCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">strong</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2">
                    <p className="text-xl font-black">{strandEvidenceCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">proof</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {skillStrandReports.map(strand => (
                  <div key={`${strand.subject}-${strand.strand}`} className="rounded-xl border border-white/10 bg-white/[0.08] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-200">{strand.subject}</p>
                        <h4 className="mt-1 text-base font-black text-white">{strand.strand}</h4>
                      </div>
                      <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-black ${getSkillStatusClasses(strand.status)}`}>
                        {strand.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-violet-50">{strand.parentMeaning}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-white/10 p-2">
                        <p className="text-lg font-black">{strand.metrics.masteryLevel}%</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-200">mastery</p>
                      </div>
                      <div className="rounded-lg bg-white/10 p-2">
                        <p className="text-lg font-black">{strand.metrics.correctAnswers}/{strand.metrics.totalAttempts}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-200">correct</p>
                      </div>
                      <div className="rounded-lg bg-white/10 p-2">
                        <p className="text-lg font-black">{strand.evidence.total}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-200">evidence saved</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300"
                        style={{ width: `${Math.max(strand.metrics.masteryLevel, strand.evidence.total > 0 ? 20 : 0)}%` }}
                      />
                    </div>
                    <div className="mt-3 rounded-lg bg-white p-3 text-slate-900">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-700">Next assignment</p>
                      <p className="mt-1 text-sm font-bold">{strand.nextAssignment}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Accuracy: {strand.metrics.totalAttempts > 0 ? `${strand.accuracy}%` : 'starts after first attempt'}.
                        Reflections saved: {strand.evidence.reflected}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                <ClipboardList size={20} className="text-amber-600" />
                Focus Queue
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {strandFocusQueue.map(strand => (
                  <div key={`focus-${strand.subject}-${strand.strand}`} className="rounded-xl bg-amber-50 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">{strand.subject}</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{strand.strand}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-600">{strand.nextAssignment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Math Skills */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">🔢 Math Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(progress.learningProfile.mathSkills) as Array<[string, SkillMetrics]>).map(([skill, metrics]) => (
                  <div key={skill} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-sm">{formatSkillLabel(skill)}</p>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <p className="text-xl font-bold text-indigo-600">{metrics.masteryLevel}%</p>
                        <p className="text-xs text-gray-500">mastery</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          {metrics.correctAnswers}/{metrics.totalAttempts}
                        </p>
                        <p className="text-xs text-gray-500">correct</p>
                      </div>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${metrics.masteryLevel}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Skills */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">📚 Reading Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(progress.learningProfile.readingSkills) as Array<[string, SkillMetrics]>).map(([skill, metrics]) => (
                  <div key={skill} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-sm">{formatSkillLabel(skill)}</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-xl font-bold text-green-600">{metrics.masteryLevel}%</p>
                      <p className="text-sm text-gray-500">{metrics.totalAttempts} attempts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            {progress.learningProfile.weakAreas.length > 0 && (
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-orange-700 mb-3">⚠️ Areas Needing Practice</h3>
                <div className="space-y-2">
                  {progress.learningProfile.weakAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-2 text-orange-600">
                      <Target size={16} />
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Map size={20} className="text-indigo-500" />
                Curriculum Roadmap
              </h3>
              <p className="text-sm text-gray-600">
                These units are unlocked for {progress.currentGrade}. The daily mission chooses from this roadmap and prioritizes areas with less practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-500 font-bold mb-1">Active grade depth</p>
                <p className="text-3xl font-black text-indigo-700">{currentGradeUnitCount}</p>
                <p className="text-sm text-gray-600">planned units for {progress.currentGrade}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
                <p className="text-xs uppercase tracking-[0.16em] text-purple-500 font-bold mb-1">Unit completion</p>
                <p className="text-3xl font-black text-purple-700">{completedCurrentGradeUnits}/{currentGradeUnitCount}</p>
                <p className="text-sm text-gray-600">completed units in this grade</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-500 font-bold mb-1">Room coverage</p>
                <p className="text-3xl font-black text-emerald-700">{currentGradeRoomCount}/10</p>
                <p className="text-sm text-gray-600">rooms represented in this grade</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                <p className="text-xs uppercase tracking-[0.16em] text-amber-500 font-bold mb-1">Unlock rules</p>
                <p className="text-3xl font-black text-amber-700">{activeGradePracticeEvents}</p>
                <p className="text-sm text-gray-600">mission practice wins before completion</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target size={18} className="text-emerald-500" />
                Unit Readiness
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-2xl font-black text-emerald-700">{unitReadinessSummary.ready}</p>
                  <p className="text-xs text-emerald-800">ready units</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <p className="text-2xl font-black text-amber-700">{unitReadinessSummary['in-progress']}</p>
                  <p className="text-xs text-amber-800">in progress</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-center">
                  <p className="text-2xl font-black text-slate-700">{unitReadinessSummary['needs-practice']}</p>
                  <p className="text-xs text-slate-600">needs practice</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-sky-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-sky-500" />
                Weekly Learning Plan
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {weeklyPlan.map(item => (
                  <div key={`${item.day}-${item.unit.id}`} className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-sky-600 font-bold">{item.day}</p>
                    <p className="font-bold text-gray-900 mt-1">{item.unit.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.unit.room}</p>
                    <p className="text-xs text-sky-700 font-semibold mt-2">{item.focus}</p>
                    <p className="text-xs text-gray-600 mt-2">{getPracticeActivities(item.unit)[0]}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                The plan balances weak rooms first, then rotates across the grade so families see steady progress every week.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-violet-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-violet-500" />
                Spaced Review Queue
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                These are the next lessons to revisit so skills move from short-term practice into durable mastery. {spacedReviewDueCount} due now.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                {spacedReviewQueue.map(unit => {
                  const practiceCount = unitPracticeCounts[unit.id] || 0;
                  const completed = progress.completedUnitIds?.includes(unit.id);
                  const reviewTiming = getReviewTiming(unit);
                  return (
                    <div key={`review-${unit.id}`} className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-violet-600 font-bold">
                        {completed ? `Mastered • ${reviewTiming.label}` : practiceCount > 0 ? reviewTiming.label : `${unit.reviewCycleDays}d cycle`}
                      </p>
                      <p className="font-bold text-gray-900 mt-1">{unit.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{unit.room}</p>
                      <p className="text-xs font-bold text-violet-700 mt-2">{Math.min(practiceCount, MASTERED_PRACTICE_TARGET)}/{MASTERED_PRACTICE_TARGET} practice rounds</p>
                      <p className="text-xs font-bold text-violet-700 mt-2">{reviewTiming.lastLabel}</p>
                      <p className="text-xs text-violet-700 mt-1">{reviewTiming.detail}</p>
                      <p className="text-xs text-gray-600 mt-2">{unit.successCheck}</p>
                      <p className="text-xs text-violet-800 mt-2">Exit check: {getEndChecks(unit)[0]}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-emerald-500" />
                    Printable Family Practice Cards
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Short offline tasks help families practice without turning every lesson into more screen time.
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <Printer size={16} />
                  Print Plan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weeklyPlan.map(item => (
                  <div key={`print-${item.day}-${item.unit.id}`} className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-emerald-700 font-bold">{item.day} family card</p>
                    <p className="font-bold text-gray-900 mt-1">{item.unit.title}</p>
                    <p className="text-sm text-gray-700 mt-2">{item.unit.parentActivity}</p>
                    <p className="text-xs text-emerald-800 mt-2">Success check: {item.unit.successCheck}</p>
                    <p className="text-xs text-gray-600 mt-2">{item.unit.parentExplanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {curriculumUnits.map(unit => {
                const readiness = getUnitReadiness(progress, unit, masteryMinimum || 3);
                const unitPractice = unitPracticeCounts[unit.id] || 0;
                const unitPracticeTarget = Math.max(3, masteryMinimum || 3);
                return (
                  <div key={unit.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-indigo-500 font-bold">{unit.grade} • {unit.room}</p>
                        <h4 className="text-lg font-bold text-gray-900">{unit.title}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-xs font-bold">
                          {unit.reviewCycleDays}d review
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getReadinessClasses(readiness)}`}>
                          {getReadinessLabel(readiness)}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 rounded-xl bg-indigo-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-indigo-800">
                        <span>Mission practice</span>
                        <span>{Math.min(unitPractice, unitPracticeTarget)}/{unitPracticeTarget}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(100, Math.round((unitPractice / unitPracticeTarget) * 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-indigo-700">
                        A unit counts as completed after repeated successful practice, not one quick answer.
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{unit.objective}</p>
                    <div className="mb-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-bold mb-1">Parent explanation</p>
                      <p className="text-sm text-slate-700">{unit.parentExplanation}</p>
                    </div>
                    {unit.prerequisite && (
                      <p className="text-xs text-gray-500 mb-2">Prerequisite: {unit.prerequisite}</p>
                    )}
                    <p className="text-sm text-emerald-700 font-semibold mb-3">Mastery: {unit.masteryTarget}</p>
                    <div className="mb-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                      {getPracticeActivities(unit).map((activity, index) => (
                        <div key={`${unit.id}-activity-${index}`} className="rounded-lg bg-white border border-indigo-100 p-3">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-indigo-500 font-bold">Activity {index + 1}</p>
                          <p className="mt-1 text-xs text-gray-700 font-semibold">{activity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-emerald-700 font-bold mb-2">End-of-lesson checks</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
                        {getEndChecks(unit).map((check, index) => (
                          <p key={`${unit.id}-check-${index}`} className="rounded-lg bg-white/80 p-2 text-xs font-semibold text-emerald-900">
                            {check}
                          </p>
                        ))}
                      </div>
                      <p className="mt-2 text-xs font-bold text-emerald-800">Mastery gate: {unit.masteryGate}</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mb-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-bold mb-1">Parent Activity</p>
                      <p className="text-sm text-amber-900">{unit.parentActivity}</p>
                      <p className="text-xs text-amber-800 mt-2">Success check: {unit.successCheck}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {unit.standardsFocus.map(focus => (
                        <span key={focus} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Target size={20} className="text-emerald-500" />
                Family Learning Goals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-600">Weekly goal minutes</span>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    value={weeklyGoalDraft}
                    onChange={(event) => {
                      setWeeklyGoalDraft(event.target.value);
                      setGoalStatus('');
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-600">Daily session limit minutes</span>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={dailyLimitDraft}
                    onChange={(event) => {
                      setDailyLimitDraft(event.target.value);
                      setGoalStatus('');
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </label>
              </div>
              <button
                onClick={saveLearningGoals}
                className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Save Learning Goals
              </button>
              {goalStatus && <p className="mt-2 text-sm text-emerald-700">{goalStatus}</p>}
            </div>

            {/* Accessibility Settings */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Eye size={20} className="text-indigo-500" />
                Accessibility
              </h3>

              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Type size={16} className="inline mr-2" />
                  Text Size
                </label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large', 'xlarge'].map(size => (
                    <button
                      key={size}
                      onClick={() => onUpdateAccessibility({
                        ...progress.accessibility,
                        fontSize: size as any
                      })}
                      className={`flex-1 py-2 rounded-lg font-medium transition ${
                        progress.accessibility.fontSize === size
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-3">
                {[
                  { key: 'highContrast', label: 'High Contrast Mode', desc: 'Increases color contrast for visibility' },
                  { key: 'dyslexiaFont', label: 'Dyslexia-Friendly Font', desc: 'Uses OpenDyslexic font' },
                  { key: 'reduceMotion', label: 'Reduce Motion', desc: 'Minimizes animations' },
                  { key: 'autoReadQuestions', label: 'Auto-Read Questions', desc: 'Automatically reads questions aloud' },
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                    <button
                      onClick={() => onUpdateAccessibility({
                        ...progress.accessibility,
                        [option.key]: !progress.accessibility[option.key as keyof AccessibilitySettings]
                      })}
                      className={`w-12 h-6 rounded-full transition ${
                        progress.accessibility[option.key as keyof AccessibilitySettings]
                          ? 'bg-indigo-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        progress.accessibility[option.key as keyof AccessibilitySettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Speech Rate */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  <Volume2 size={16} className="inline mr-2" />
                  Speech Rate: {progress.accessibility.speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={progress.accessibility.speechRate}
                  onChange={(e) => onUpdateAccessibility({
                    ...progress.accessibility,
                    speechRate: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Narration Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'gentle', label: 'Gentle' },
                    { key: 'energetic', label: 'Energetic' },
                    { key: 'phonics', label: 'Phonics' },
                    { key: 'story', label: 'Story' },
                  ].map(option => (
                    <button
                      key={option.key}
                      onClick={() => onUpdateAccessibility({
                        ...progress.accessibility,
                        narrationStyle: option.key as AccessibilitySettings['narrationStyle']
                      })}
                      className={`py-2 rounded-lg font-medium transition ${
                        progress.accessibility.narrationStyle === option.key
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-amber-500" />
                Reading Journey
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{progress.readingScore}</p>
                  <p className="text-xs text-gray-500">Reading Wins</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{progress.storybookScore || 0}</p>
                  <p className="text-xs text-gray-500">Stories Completed</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{progress.learningProfile.readingSkills.comprehension.masteryLevel}%</p>
                  <p className="text-xs text-gray-500">Comprehension Mastery</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Shield size={20} className="text-sky-500" />
                Child Profiles
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Keep separate progress for each child. You can create unlimited local child profiles, then sync the active child after parent approval.
              </p>

              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Profiles on this device</p>
                  <p className="mt-1 text-2xl font-black text-indigo-950">{profiles.length}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Profile limit</p>
                  <p className="mt-1 text-sm font-black text-emerald-950">No profile limit in the app.</p>
                </div>
              </div>

              <div className="space-y-2 mb-4" data-testid="child-profile-switcher">
                {profiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => onSwitchChildProfile?.(profile.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      profile.id === activeProfileId
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{profile.name}</p>
                        <p className="text-xs">{profile.grade}</p>
                      </div>
                      <span className="text-xs font-bold">
                        {profile.id === activeProfileId ? 'Active' : 'Switch'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 p-3 mb-4">
                <p className="font-semibold text-gray-700 mb-2">Update Active Child</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={editChildName}
                    onChange={(event) => {
                      setEditChildName(event.target.value);
                      setProfileStatus('');
                    }}
                    placeholder="Child name"
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={editChildGrade}
                    onChange={(event) => {
                      setEditChildGrade(event.target.value as GradeLevel);
                      setProfileStatus('');
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    {grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    onUpdateChildProfile?.(activeProfileId, editChildName, editChildGrade);
                    setProfileStatus('Active child profile updated.');
                  }}
                  className="mt-3 w-full py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition"
                >
                  Save Active Child
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-700 mb-2">Add Another Child</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={newChildName}
                    onChange={(event) => {
                      setNewChildName(event.target.value);
                      setProfileStatus('');
                    }}
                    placeholder="Child name"
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    value={newChildGrade}
                    onChange={(event) => {
                      setNewChildGrade(event.target.value as GradeLevel);
                      setProfileStatus('');
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    {grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    onCreateChildProfile?.(newChildName, newChildGrade);
                    setNewChildName('');
                    setNewChildGrade(GradeLevel.KINDERGARTEN);
                    setProfileStatus('New child profile created.');
                  }}
                  className="mt-3 w-full py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition"
                >
                  Create Child Profile
                </button>
              </div>
              {profileStatus && <p className="text-sm text-gray-600 mt-2">{profileStatus}</p>}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Shield size={20} className="text-green-500" />
                Privacy Controls
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Keep media features parent-approved. Voice uses saved static files first and the device browser voice as a no-API fallback; the child app does not generate media with live APIs.
              </p>
              {[
                {
                  key: 'allowCloudSync',
                  title: 'Firebase cloud progress sync',
                  description: 'Saves parent-approved child progress to Firebase after a parent account signs in.',
                },
                {
                  key: 'allowExternalVoice',
                  title: 'Saved voice narration',
                  description: 'Plays pre-generated human lesson audio from the static voice cache. If unavailable, lessons use the free device browser voice so kids still hear guidance.',
                },
                {
                  key: 'allowGeneratedStoryCovers',
                  title: 'Illustrated story covers',
                  description: 'Loads saved static cover art for each book. No child-facing cover generation API is called at runtime.',
                },
              ].map(option => {
                const enabled = privacy[option.key as keyof PrivacySettings];
                return (
                  <div key={option.key} className="flex items-center justify-between gap-4 py-3 border-t first:border-t-0 border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-700">{option.title}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    <button
                      onClick={() => onUpdatePrivacy?.({
                        ...privacy,
                        [option.key]: !enabled,
                      })}
                      className={`w-12 h-6 rounded-full transition shrink-0 ${
                        enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      aria-pressed={enabled}
                      aria-label={`Toggle ${option.title}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-sky-100">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Cloud size={20} className="text-sky-500" />
                Firebase Parent Account
              </h3>
                  <p className="text-sm text-gray-600 mb-4">
                Cloud sync is parent-only. Sign in with Google or email, turn on Firebase cloud progress sync in Privacy Controls, then sync the active child profile.
              </p>

              {!cloudSession.configured && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900">
                  Firebase Web config is missing for this browser. Add the VITE_FIREBASE values in local environment settings before using cloud sync.
                </div>
              )}

              {cloudSession.configured && cloudSession.signedIn ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-700">Signed in parent</p>
                    <p className="mt-1 text-sm font-bold text-sky-950 break-words">{cloudSession.email || 'Firebase parent account'}</p>
                    <p className="mt-1 text-xs text-sky-800 break-words">Family ID: {cloudSession.familyId}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => runCloudAction(
                        () => onSyncProgressToCloud?.() || Promise.resolve(),
                        'Firebase progress sync failed.'
                      )}
                      disabled={isCloudActionBusy || !privacy.allowCloudSync}
                      className={`py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        privacy.allowCloudSync
                          ? 'bg-sky-600 text-white hover:bg-sky-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Cloud size={18} />
                      {privacy.allowCloudSync ? 'Sync Progress Now' : 'Turn On Cloud Sync First'}
                    </button>
                    <button
                      onClick={() => runCloudAction(
                        () => onSignOutParentAccount?.() || Promise.resolve(),
                        'Firebase sign out failed.'
                      )}
                      disabled={isCloudActionBusy}
                      className="py-3 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : cloudSession.configured ? (
                <div className="space-y-3">
                  <button
                    onClick={() => runCloudAction(
                      () => onSignInParentWithGoogle?.() || Promise.resolve(),
                      'Firebase Google parent sign in failed.'
                    )}
                    disabled={isCloudActionBusy}
                    className="w-full py-3 rounded-lg bg-white text-slate-800 font-semibold hover:bg-slate-50 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                  >
                    <LogIn size={18} />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    Or use email
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={parentEmail}
                      onChange={(event) => {
                        setParentEmail(event.target.value);
                        setCloudAuthStatus('');
                      }}
                      type="email"
                      autoComplete="email"
                      placeholder="Parent email"
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      value={parentPassword}
                      onChange={(event) => {
                        setParentPassword(event.target.value);
                        setCloudAuthStatus('');
                      }}
                      type="password"
                      autoComplete="current-password"
                      placeholder="Password, 6+ characters"
                      className="rounded-lg border border-gray-200 px-3 py-2 focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => runCloudAction(
                        () => onSignInParentAccount?.(parentEmail, parentPassword) || Promise.resolve(),
                        'Firebase parent sign in failed.'
                      )}
                      disabled={isCloudActionBusy || parentEmail.trim().length === 0 || parentPassword.length < 6}
                      className="py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} />
                      Sign In Parent
                    </button>
                    <button
                      onClick={() => runCloudAction(
                        () => onCreateParentAccount?.(parentEmail, parentPassword) || Promise.resolve(),
                        'Firebase parent account creation failed.'
                      )}
                      disabled={isCloudActionBusy || parentEmail.trim().length === 0 || parentPassword.length < 6}
                      className="py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-500 transition"
                    >
                      Create Parent Account
                    </button>
                  </div>
                </div>
              ) : null}

              {(cloudAuthStatus || cloudSyncStatus) && (
                <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3 text-sm font-semibold text-sky-900">
                  {cloudAuthStatus || cloudSyncStatus}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-600" />
                Family Subscription
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Stripe checkout stays parent-only. Kids never see card forms, receipts, cancellation, or account billing controls inside the learning rooms.
              </p>

              {cloudSession.signedIn ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Billing parent</p>
                    <p className="mt-1 text-sm font-bold text-emerald-950 break-words">{cloudSession.email || 'Signed-in parent account'}</p>
                    <p className="mt-1 text-xs text-emerald-800">
                      {billingSummary.active
                        ? isOwnerCompedBilling
                          ? 'Owner access is connected to this Firebase parent account.'
                          : 'Stripe access is connected to this Firebase parent account.'
                        : 'Choose Starter or Premium in parent-only Stripe checkout.'}
                    </p>
                  </div>
                  <div
                    data-testid="parent-billing-status-card"
                    className={`rounded-xl border p-3 ${
                      billingSummary.tone === 'success'
                        ? 'border-emerald-100 bg-emerald-50'
                        : 'border-amber-100 bg-amber-50'
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={`text-xs font-black uppercase tracking-[0.12em] ${
                          billingSummary.tone === 'success' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          Parent subscription status
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-950">{billingSummary.statusLabel}</p>
                        <p className="mt-1 text-sm font-bold text-slate-700">{billingSummary.detail}</p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
                        <p className="text-sm font-black text-slate-950">{billingSummary.planLabel}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{billingSummary.dateLabel}</p>
                      </div>
                    </div>
                    {billingSummary.checkedLabel && (
                      <p className="mt-2 text-xs font-bold text-slate-600">{billingSummary.checkedLabel}</p>
                    )}
                    {(billingSummary.webhookLabel || billingSummary.invoiceLabel || billingSummary.cancelLabel) && (
                      <div className="mt-3 space-y-1 border-t border-white/80 pt-3 text-xs font-bold text-slate-700">
                        {billingSummary.webhookLabel && <p>{billingSummary.webhookLabel}</p>}
                        {billingSummary.invoiceLabel && <p>{billingSummary.invoiceLabel}</p>}
                        {billingSummary.cancelLabel && <p className="text-amber-800">{billingSummary.cancelLabel}</p>}
                      </div>
                    )}
                  </div>
                  {!billingSummary.active && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-xl border border-emerald-100 bg-white p-3">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Starter</p>
                          <p className="mt-1 text-lg font-black text-slate-950">$4.99/mo</p>
                          <p className="mt-1 text-xs font-bold text-slate-600">Full school campus, games, saved media, and parent progress tools.</p>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-indigo-700">Premium</p>
                          <p className="mt-1 text-lg font-black text-slate-950">$9.99/mo</p>
                          <p className="mt-1 text-xs font-bold text-slate-600">Everything in Starter plus expanded parent reports, early book packs, priority content drops, and support priority.</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">Plan clarity</p>
                        <p className="mt-1 text-xs font-bold text-slate-700">
                          Starter unlocks the full school app for one family. Premium adds parent-facing reporting and early content benefits; no child-facing learning room is hidden behind a surprise upsell at launch.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => runBillingAction(
                            () => onStartStripeCheckout?.('starter') || Promise.resolve(),
                            'Stripe $4.99 checkout could not be opened.'
                          )}
                          disabled={isBillingBusy}
                          className="py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2"
                        >
                          <CreditCard size={18} />
                          Start $4.99/mo
                        </button>
                        <button
                          onClick={() => runBillingAction(
                            () => onStartStripeCheckout?.('premium') || Promise.resolve(),
                            'Stripe $9.99 checkout could not be opened.'
                          )}
                          disabled={isBillingBusy}
                          className="py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2"
                        >
                          <CreditCard size={18} />
                          Start $9.99/mo
                        </button>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">Owner checkout test</p>
                        <p className="mt-1 text-xs font-bold text-amber-900">
                          Temporary live Stripe test. Charges $0.50 today, creates a real invoice, then can be canceled in Stripe before the next renewal.
                        </p>
                        <button
                          onClick={() => runBillingAction(
                            () => onStartStripeCheckout?.('checkout_test') || Promise.resolve(),
                            'Stripe $0.50 test checkout could not be opened.'
                          )}
                          disabled={isBillingBusy}
                          className="mt-3 w-full py-3 rounded-lg bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2"
                        >
                          <CreditCard size={18} />
                          Start $0.50 Test Checkout
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => runBillingAction(
                        () => onRefreshBillingAccess?.() || Promise.resolve(),
                        'Stripe status could not be refreshed.'
                      )}
                      disabled={isBillingBusy}
                      className="py-3 rounded-lg bg-white text-emerald-700 font-semibold hover:bg-emerald-50 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2 border border-emerald-100"
                    >
                      <CreditCard size={18} />
                      Refresh Stripe Status
                    </button>
                    <button
                      onClick={() => runBillingAction(
                        () => onOpenStripeBillingPortal?.() || Promise.resolve(),
                        'Stripe billing portal could not be opened.'
                      )}
                      disabled={isBillingBusy || isOwnerCompedBilling}
                      className="py-3 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:bg-gray-200 disabled:text-gray-500 transition flex items-center justify-center gap-2"
                    >
                      {isOwnerCompedBilling ? 'No Stripe Billing Needed' : billingSummary.active ? 'Manage Billing in Stripe' : 'Manage Billing'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900">
                  Sign in with the Firebase parent account above before opening Stripe checkout or billing management.
                </div>
              )}

              {billingStatus && (
                <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
                  {billingStatus}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Volume2 size={20} className="text-indigo-500" />
                Voice Cache
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Check saved lesson and story narration for this grade. MP3 files are reused from static storage, so child lessons do not call ElevenLabs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-xs">
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <p className="font-bold text-slate-700">1. Prepare offline</p>
                  <p className="text-slate-500">Missing human narration is generated outside the child app.</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <p className="font-bold text-slate-700">2. Save audio</p>
                  <p className="text-slate-500">The app stores MP3 files in Cloudflare R2.</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <p className="font-bold text-slate-700">3. Reuse cache</p>
                  <p className="text-slate-500">Future plays load saved audio first.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!privacy.allowExternalVoice) {
                    setVoiceCacheTone('warning');
                    setVoiceCacheSummary('Saved voice narration is off. Enable it in Privacy Controls before checking the static voice cache.');
                    return;
                  }
                  setIsWarmingVoiceCache(true);
                  setVoiceCacheTone('info');
                  setVoiceCacheSummary('');
                  try {
                    const { warmVoiceCache } = await import('../services/voiceCacheService');
                    const result = await warmVoiceCache(progress.currentLevel, progress.accessibility);
                    if (result.errors > 0) {
                      setVoiceCacheTone('error');
                      setVoiceCacheSummary(`Voice cache had ${result.errors} errors. Saved files still work, but missing narration must be generated offline and redeployed.`);
                    } else if (result.misses > 0) {
                      setVoiceCacheTone('success');
                      setVoiceCacheSummary(`Voice cache updated. Checked ${result.requested} phrases, reused ${result.hits}, and saved ${result.misses} new human voice files.`);
                    } else {
                      setVoiceCacheTone('success');
                      setVoiceCacheSummary(`Voice cache ready. Checked ${result.requested} phrases and reused ${result.hits} saved human voice files.`);
                    }
                  } catch (error) {
                    setVoiceCacheTone('error');
                    const message = error instanceof Error ? error.message : 'Voice cache warmup failed.';
                    const friendlyMessage = message.includes('quota_exceeded') || message.includes('remaining')
                      ? 'The static voice cache is still usable. Generate any missing voices offline after ElevenLabs credits are available, then export and redeploy static media.'
                      : message;
                    setVoiceCacheSummary(friendlyMessage);
                  } finally {
                    setIsWarmingVoiceCache(false);
                  }
                }}
                disabled={!canWarmVoiceCache}
                className={`w-full py-3 font-semibold rounded-lg transition ${
                  !canWarmVoiceCache
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {isWarmingVoiceCache ? 'Checking Voice Cache...' : privacy.allowExternalVoice ? 'Check Static Voice Cache' : 'Enable Saved Voice First'}
              </button>
              {voiceCacheSummary && (
                <p className={`text-sm mt-3 rounded-lg border p-3 ${voiceCacheStatusClasses[voiceCacheTone]}`}>{voiceCacheSummary}</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Lock size={20} className="text-indigo-500" />
                Parent PIN
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Update the local parent PIN used to protect settings and data controls on this browser.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={newPin}
                  onChange={(event) => {
                    setNewPin(event.target.value.replace(/\D/g, '').slice(0, 8));
                    setPinStatus('');
                  }}
                  inputMode="numeric"
                  type="password"
                  placeholder="New 4-8 digit PIN"
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
                <input
                  value={newPinConfirm}
                  onChange={(event) => {
                    setNewPinConfirm(event.target.value.replace(/\D/g, '').slice(0, 8));
                    setPinStatus('');
                  }}
                  inputMode="numeric"
                  type="password"
                  placeholder="Confirm PIN"
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (!/^\d{4,8}$/.test(newPin)) {
                    setPinStatus('Choose a 4 to 8 digit PIN.');
                    return;
                  }
                  if (newPin !== newPinConfirm) {
                    setPinStatus('The PIN entries do not match.');
                    return;
                  }
                  onUpdateParentPin?.(newPin);
                  setNewPin('');
                  setNewPinConfirm('');
                  setPinStatus('Parent PIN updated.');
                }}
                className="mt-3 w-full py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition"
              >
                Save Parent PIN
              </button>
              {pinStatus && <p className="text-sm text-gray-600 mt-2">{pinStatus}</p>}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award size={20} className="text-indigo-500" />
                Paid Launch Readiness
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Use this as the parent-facing launch checklist. Families can use the learning path now, and subscription actions stay in parent-only billing screens.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-sm font-black text-emerald-800 mb-2">Ready now</p>
                  <div className="space-y-2">
                    {launchReadySignals.map(signal => (
                      <div key={signal} className="text-xs font-semibold text-emerald-700 flex gap-2">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="text-sm font-black text-amber-800 mb-2">Family protections</p>
                  <div className="space-y-2">
                    {familyProtectionItems.map(item => (
                      <div key={item.label} className="rounded-lg bg-white p-2">
                        <p className="text-xs font-bold text-gray-800">{item.label}</p>
                        <p className="text-[11px] text-amber-700">{item.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-700">No payment collection</p>
                <p className="text-xs text-slate-500 mt-1">
                  The child learning area does not collect card data or create subscriptions. Keep checkout, receipts, cancellation, and account changes in parent-controlled billing screens.
                </p>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Lock size={20} className="text-green-500" />
                Privacy & Data
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Learning progress is stored locally in this browser. Voice narration and story covers are served from saved static media files; the child app does not call live media generation APIs.
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Parent controls should stay active for cloud sync, account access, privacy requests, subscriptions, and any feature that stores family data outside this browser.
              </p>
              <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Parent Consent Receipt</p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">
                  {parentConsentReceipt
                    ? `Saved locally on ${parentConsentReceipt}.`
                    : 'Complete parent setup to save the local consent receipt.'}
                </p>
              </div>
              <button
                onClick={exportLocalProgress}
                className="mb-3 w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Export Local Progress
              </button>
              <div className="mb-3 rounded-xl border border-sky-100 bg-sky-50 p-3" data-testid="parent-diagnostics-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-700">Support Diagnostics</p>
                    <p className="mt-1 text-sm font-semibold text-sky-950">
                      {diagnosticEvents.length} recent app event{diagnosticEvents.length === 1 ? '' : 's'} saved on this device.
                    </p>
                    <p className="mt-1 text-xs text-sky-800">
                      Export this if parent support needs to review crashes, checkout issues, voice playback, or Firebase sync problems.
                    </p>
                  </div>
                  <ClipboardList className="shrink-0 text-sky-600" size={24} />
                </div>
                {diagnosticEvents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {diagnosticEvents.slice(0, 3).map(event => (
                      <div key={event.id} className="rounded-lg bg-white/85 px-3 py-2 text-xs">
                        <p className="font-black text-slate-800">{event.area}: {event.message}</p>
                        <p className="mt-1 text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={exportDiagnostics}
                    className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-700"
                  >
                    Export Diagnostics
                  </button>
                  <button
                    onClick={clearDiagnostics}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-sky-700 hover:bg-sky-100"
                  >
                    Clear Diagnostics
                  </button>
                </div>
              </div>
              <button
                onClick={onResetProgress}
                className="w-full py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition"
              >
                Reset All Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
