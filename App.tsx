import React, { Suspense, lazy, useState, useEffect } from 'react';
import { WorldMap } from './components/WorldMap';
import { Guide } from './components/Guide';
import { Dashboard } from './components/Dashboard';
import { VirtualPetPanel, PetSelection } from './components/VirtualPet';
import { AchievementsPanel, AchievementUnlockToast } from './components/AchievementsPanel';
import { ParentDashboard } from './components/ParentDashboard';
import { LegalInfo } from './components/LegalInfo';
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
  ChildProfile,
  createDefaultProgress,
  DEFAULT_LEARNING_PROFILE,
  DEFAULT_ACCESSIBILITY,
  DEFAULT_PRIVACY_SETTINGS
} from './types';
import { resumeAudioContext, playSuccess, speak, stopSpeaking, setNarrationContext, setSpeechPreferences } from './services/audioService';
import { updateSkillMetrics, updateLearningProfile, getEncouragingMessage } from './services/adaptiveLearning';
import { BookOpen, CheckCircle2, LockKeyhole, Play, ShieldCheck, Sparkles } from 'lucide-react';

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

const PROFILES_KEY = 'kidGeniusProfiles';
const ACTIVE_PROFILE_KEY = 'kidGeniusActiveProfileId';

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

const loadProfiles = (): ChildProfile[] => {
  try {
    const saved = localStorage.getItem(PROFILES_KEY);
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
  localStorage.setItem(PROFILES_KEY, JSON.stringify([defaultProfile]));
  localStorage.setItem(ACTIVE_PROFILE_KEY, defaultProfile.id);
  return [defaultProfile];
};

const loadProgressForProfile = (profile: ChildProfile): UserProgress => {
  const profileProgress = localStorage.getItem(`kidGeniusProgress:${profile.id}`);
  const legacyProgress = localStorage.getItem('kidGeniusProgress');
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

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showGradeSelection, setShowGradeSelection] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType>(RoomType.HUB);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPet, setShowPet] = useState(false);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [guideTrigger, setGuideTrigger] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [parentOnboarded, setParentOnboarded] = useState(() => localStorage.getItem('kidGeniusParentOnboarded') === 'true');
  const [legalView, setLegalView] = useState<'privacy' | 'terms' | null>(null);
  const [parentPin, setParentPin] = useState(() => localStorage.getItem('kidGeniusParentPin') || '');
  const [pinDraft, setPinDraft] = useState('');
  const [pinConfirmDraft, setPinConfirmDraft] = useState('');
  const [pinSetupError, setPinSetupError] = useState('');
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem(ACTIVE_PROFILE_KEY) || loadProfiles()[0]?.id || 'default');

  // Global Progression State with all new features
  const [progress, setProgress] = useState<UserProgress>(() => {
    const loadedProfiles = loadProfiles();
    const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY) || loadedProfiles[0]?.id || 'default';
    const activeProfile = loadedProfiles.find(profile => profile.id === activeId) || loadedProfiles[0];
    return loadProgressForProfile(activeProfile);
  });

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`kidGeniusProgress:${activeProfileId}`, JSON.stringify(progress));
    localStorage.setItem('kidGeniusProgress', JSON.stringify(progress));
  }, [progress, activeProfileId]);

  useEffect(() => {
    const privacy = progress.privacy || DEFAULT_PRIVACY_SETTINGS;
    localStorage.setItem('kidGeniusAllowExternalVoice', String(privacy.allowExternalVoice === true));
    localStorage.setItem('kidGeniusAllowGeneratedStoryCovers', String(privacy.allowGeneratedStoryCovers === true));
  }, [progress.privacy]);

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
  }, [profiles, activeProfileId]);

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

  // Check for achievements
  const checkAchievements = (newProgress: UserProgress) => {
    const unlockedIds = newProgress.achievements || [];

    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedIds.includes(achievement.id)) return; // Already unlocked

      let shouldUnlock = false;
      let currentProgress = 0;

      switch (achievement.id) {
        case 'math_starter':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'math_10':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'math_50':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 50;
          break;
        case 'math_100':
          currentProgress = newProgress.mathScore;
          shouldUnlock = currentProgress >= 100;
          break;
        case 'read_starter':
          currentProgress = newProgress.readingScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'read_25':
          currentProgress = newProgress.readingScore;
          shouldUnlock = currentProgress >= 25;
          break;
        case 'sticker_10':
          currentProgress = newProgress.stickers.length;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'sticker_50':
          currentProgress = newProgress.stickers.length;
          shouldUnlock = currentProgress >= 50;
          break;
        case 'science_starter':
          currentProgress = newProgress.scienceScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'geo_starter':
          currentProgress = newProgress.geographyScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'code_starter':
          currentProgress = newProgress.codingScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'lang_starter':
          currentProgress = newProgress.languageScore;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'story_starter':
          currentProgress = newProgress.storybookScore || 0;
          shouldUnlock = currentProgress >= 1;
          break;
        case 'story_10':
          currentProgress = newProgress.storybookScore || 0;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'story_25':
          currentProgress = newProgress.storybookScore || 0;
          shouldUnlock = currentProgress >= 25;
          break;
      }

      if (shouldUnlock) {
        newProgress.achievements = [...(newProgress.achievements || []), achievement.id];
        setNewAchievement({ ...achievement, unlockedAt: Date.now() });
      }
    });

    return newProgress;
  };

  // Start Screen to unlock AudioContext
  const handleStart = async () => {
    await resumeAudioContext();
    setHasStarted(true);
    const today = new Date().toISOString().slice(0, 10);

    setProgress(prev => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const alreadyPlayedToday = prev.lastPlayedDate === today;
      const continuedStreak = prev.lastPlayedDate === yesterday;
      return {
        ...prev,
        sessionsCompleted: alreadyPlayedToday ? prev.sessionsCompleted : (prev.sessionsCompleted || 0) + 1,
        currentStreak: alreadyPlayedToday ? prev.currentStreak : continuedStreak ? (prev.currentStreak || 0) + 1 : 1,
        lastPlayedDate: today,
      };
    });

    // Check if this is a new player who needs to select grade and pet
    const isNewPlayer = !progress.pet || progress.currentGrade === GradeLevel.KINDERGARTEN && progress.totalXP === 0;

    if (isNewPlayer) {
      if (parentOnboarded) {
        setShowGradeSelection(true);
      }
    } else {
      speak("Welcome back to Kid Genius World!");
    }
  };

  const handleParentOnboardingComplete = () => {
    if (!/^\d{4,8}$/.test(pinDraft)) {
      setPinSetupError('Choose a 4 to 8 digit parent PIN.');
      return;
    }
    if (pinDraft !== pinConfirmDraft) {
      setPinSetupError('The PIN entries do not match.');
      return;
    }
    localStorage.setItem('kidGeniusParentPin', pinDraft);
    localStorage.setItem('kidGeniusParentOnboarded', 'true');
    setParentPin(pinDraft);
    setParentOnboarded(true);
    setShowGradeSelection(true);
  };

  const handleUpdateParentPin = (newPin: string) => {
    localStorage.setItem('kidGeniusParentPin', newPin);
    setParentPin(newPin);
  };

  const handleResetProgress = () => {
    if (!window.confirm('Reset all local learning progress on this device? This cannot be undone.')) {
      return;
    }
    localStorage.removeItem(`kidGeniusProgress:${activeProfileId}`);
    localStorage.removeItem('kidGeniusVoiceCacheProfile');
    const activeProfile = profiles.find(profile => profile.id === activeProfileId) || profiles[0];
    setProgress(loadProgressForProfile(activeProfile));
    setShowParentDashboard(false);
    setCurrentRoom(RoomType.HUB);
  };

  const handleCreateChildProfile = (name: string, grade: GradeLevel) => {
    const cleanName = name.trim() || 'Learner';
    localStorage.setItem(`kidGeniusProgress:${activeProfileId}`, JSON.stringify(progress));
    const profile: ChildProfile = {
      id: createProfileId(),
      name: cleanName,
      grade,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    setProfiles(prev => [...prev, profile]);
    setActiveProfileId(profile.id);
    setProgress(loadProgressForProfile(profile));
    setCurrentRoom(RoomType.HUB);
    setShowParentDashboard(false);
    setShowPetSelection(true);
  };

  const handleSwitchChildProfile = (profileId: string) => {
    const nextProfile = profiles.find(profile => profile.id === profileId);
    if (!nextProfile || nextProfile.id === activeProfileId) {
      return;
    }
    localStorage.setItem(`kidGeniusProgress:${activeProfileId}`, JSON.stringify(progress));
    const updatedProfiles = profiles.map(profile => (
      profile.id === nextProfile.id
        ? { ...profile, lastActiveAt: Date.now() }
        : profile
    ));
    const updatedProfile = updatedProfiles.find(profile => profile.id === nextProfile.id) || nextProfile;
    setProfiles(updatedProfiles);
    setActiveProfileId(nextProfile.id);
    setProgress(loadProgressForProfile(updatedProfile));
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
    setProfiles(prev => prev.map(profile => (
      profile.id === activeProfileId
        ? { ...profile, grade, lastActiveAt: Date.now() }
        : profile
    )));
    setProgress(prev => ({
      ...prev,
      currentGrade: grade,
      currentLevel: gradeToLevel[grade],
      memberId: activeProfileId,
    }));

    speak(`Great! You're in ${grade}. Let's learn together!`);
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

  const handleEnterRoom = (room: RoomType, unitId?: string) => {
    stopSpeaking();
    setActiveUnitId(unitId || null);
    setProgress(prev => ({
      ...prev,
      dailyStats: updateDailyStats(prev.dailyStats, { roomsVisited: [room] }),
      gradeRoomVisits: {
        ...(prev.gradeRoomVisits || {}),
        [String(prev.currentLevel)]: Array.from(new Set([
          ...(prev.gradeRoomVisits?.[String(prev.currentLevel)] || []),
          room,
        ])),
      },
    }));
    setCurrentRoom(room);
    setGuideTrigger(p => p + 1);
  };

  const handleBack = () => {
    stopSpeaking();
    setCurrentRoom(RoomType.HUB);
    setActiveUnitId(null);
    setShowDashboard(false);
    setShowParentDashboard(false);
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

  const addSticker = (subject?: string) => {
    playSuccess();

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
      const nextCompletedUnitIds = activeUnitId
        ? Array.from(new Set([...(prev.completedUnitIds || []), activeUnitId]))
        : (prev.completedUnitIds || []);

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
        currentLevel: newLevel,
        currentGrade: newGrade,
        xp: prev.xp + 10,
        totalXP: (prev.totalXP || 0) + 10,
        pet: updatedPet,
        dailyStats: updateDailyStats(prev.dailyStats, {
          problemsAttempted: subject ? 1 : 0,
          problemsCorrect: subject ? 1 : 0,
          stickersEarned: earnedNewSticker ? 1 : 0,
        }),
      };

      newProgress = checkAchievements(newProgress);
      return newProgress;
    });
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
    addSticker(subject);
  };

  const handleUpdatePet = (pet: VirtualPet) => {
    setProgress(p => ({ ...p, pet }));
  };

  const handleUpdateAccessibility = (settings: AccessibilitySettings) => {
    setProgress(p => ({ ...p, accessibility: settings }));
  };

  const handleUpdatePrivacy = (settings: PrivacySettings) => {
    setProgress(p => ({ ...p, privacy: settings }));
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
      <div className="w-screen h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 flex items-center justify-center flex-col gap-8 overflow-hidden relative">

        {/* ============ SKY LAYER ============ */}

        {/* Giant Sun with Rays */}
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 z-0">
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
        <div className="absolute top-8 left-0 text-7xl animate-cloud-drift opacity-70" style={{ animationDelay: '0s' }}>☁️</div>
        <div className="absolute top-20 left-0 text-8xl animate-cloud-drift-slow opacity-50" style={{ animationDelay: '5s' }}>☁️</div>
        <div className="absolute top-32 left-0 text-6xl animate-cloud-drift-fast opacity-60" style={{ animationDelay: '10s' }}>☁️</div>
        <div className="absolute top-16 left-0 text-5xl animate-cloud-drift opacity-40" style={{ animationDelay: '15s' }}>☁️</div>
        <div className="absolute top-40 left-0 text-7xl animate-cloud-drift-slow opacity-55" style={{ animationDelay: '8s' }}>⛅</div>

        {/* Rainbow */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-8xl animate-rainbow">🌈</div>

        {/* Flying birds */}
        <div className="absolute top-28 left-0 text-3xl animate-bird" style={{ animationDelay: '0s' }}>🕊️</div>
        <div className="absolute top-36 left-0 text-2xl animate-bird" style={{ animationDelay: '3s' }}>🐦</div>

        {/* ============ INSECTS LAYER ============ */}

        {/* Bees flying in patterns */}
        <div className="absolute top-[30%] left-[15%] text-4xl animate-bee z-10">🐝</div>
        <div className="absolute top-[45%] right-[20%] text-3xl animate-bee-2 z-10">🐝</div>
        <div className="absolute top-[25%] right-[35%] text-4xl animate-bee-3 z-10">🐝</div>
        <div className="absolute bottom-[40%] left-[25%] text-3xl animate-bee z-10" style={{ animationDelay: '2s' }}>🐝</div>

        {/* Butterflies fluttering */}
        <div className="absolute top-[35%] left-[10%] text-5xl animate-butterfly z-10">🦋</div>
        <div className="absolute top-[50%] right-[15%] text-4xl animate-butterfly-2 z-10">🦋</div>
        <div className="absolute top-[20%] left-[40%] text-5xl animate-butterfly-3 z-10">🦋</div>
        <div className="absolute bottom-[35%] right-[30%] text-4xl animate-butterfly z-10" style={{ animationDelay: '4s' }}>🦋</div>

        {/* Ladybugs */}
        <div className="absolute bottom-[25%] left-[8%] text-3xl animate-float z-10">🐞</div>
        <div className="absolute bottom-[30%] right-[12%] text-2xl animate-float-delayed z-10">🐞</div>

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
        <div className="absolute bottom-16 left-[10%] text-3xl animate-float z-10">🐌</div>
        <div className="absolute bottom-20 right-[18%] text-2xl animate-float-delayed z-10">🐛</div>
        <div className="absolute bottom-14 left-[45%] text-3xl animate-float z-10">🦗</div>

        {/* Trees on sides */}
        <div className="absolute bottom-0 left-2 text-8xl z-5">🌳</div>
        <div className="absolute bottom-0 right-2 text-8xl z-5">🌲</div>

        {/* ============ CONTENT LAYER ============ */}

        {/* Title */}
        <div className="text-center z-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] animate-title-bounce">
            Kid Genius World
          </h1>
          <p className="text-2xl text-white/95 mt-4 font-semibold drop-shadow-lg flex items-center justify-center gap-2">
            <span className="animate-sparkle">✨</span>
            Learning is an Adventure!
            <span className="animate-sparkle" style={{ animationDelay: '0.7s' }}>✨</span>
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="z-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 hover:from-yellow-300 hover:via-orange-300 hover:to-yellow-300 text-yellow-900 px-14 py-7 rounded-full text-3xl font-bold shadow-[0_10px_0_rgb(161,98,7),0_15px_30px_rgba(0,0,0,0.3)] active:translate-y-2 active:shadow-[0_5px_0_rgb(161,98,7)] transition-all flex items-center gap-4 hover:scale-105"
        >
          <Play size={44} fill="currentColor" />
          Start Adventure!
          <Sparkles size={36} className="animate-pulse" />
        </button>

        {/* Features */}
        <div className="z-20 flex gap-3 mt-4 flex-wrap justify-center px-4">
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
              className="bg-white/90 px-5 py-2 rounded-full text-gray-700 font-semibold shadow-lg hover:scale-110 hover:bg-white transition-all cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {item.emoji} {item.label}
            </span>
          ))}
        </div>

        {/* Cute mascot hint */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-white/80 text-sm animate-float">
          <span className="text-2xl">🎓</span>
          Choose your learning buddy inside!
          <span className="text-2xl">🐾</span>
        </div>

        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-3 text-xs font-bold text-white/90">
          <button onClick={() => setLegalView('privacy')} className="underline decoration-white/50 hover:text-white">Privacy</button>
          <button onClick={() => setLegalView('terms')} className="underline decoration-white/50 hover:text-white">Terms</button>
        </div>
      </div>
    );
  }

  // Grade Selection Screen
  if (showGradeSelection) {
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
            What grade are you in?
          </h1>
          <p className="text-white/90 text-lg">This helps us pick the right challenges for you!</p>
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
                <p className="text-sm text-slate-600">Progress is local to this browser. Voice and generated cover features may call configured third-party services through your app server.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <Sparkles className="text-amber-600 mb-3" size={28} />
                <h2 className="font-bold text-lg mb-2">Family Plan</h2>
                <p className="text-sm text-slate-600">Beta testing can start with local progress, but paid subscriptions need real accounts, billing, consent, and support flows first.</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 mb-5">
                Public launch still needs a formal privacy policy, terms, and COPPA review before collecting personal data, accounts, analytics, or payments.
              </div>
              <div className="flex justify-center gap-4 mb-4 text-sm font-bold text-indigo-700">
                <button onClick={() => setLegalView('privacy')} className="underline">Read Privacy Notice</button>
                <button onClick={() => setLegalView('terms')} className="underline">Read Terms</button>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 mb-5">
                <h2 className="font-bold text-lg mb-2">Create Parent PIN</h2>
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
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} />
                I Understand - Continue Setup
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
      />
    );
  }

  // Main Game View
  const renderView = () => {
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
        return <ArtRoom onBack={handleBack} onReward={() => handleCreativeReward('art')} />;
      case RoomType.MUSIC:
        return <MusicRoom onBack={handleBack} onReward={handleMusicReward} />;
      case RoomType.PUZZLE:
        return <PuzzleRoom onBack={handleBack} onReward={() => addSticker('puzzle')} />;
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
            onOpenSettings={() => {
              stopSpeaking();
              setShowParentDashboard(true);
            }}
            progress={progress}
          />
        );
    }
  };

  return (
    <div className={`w-screen h-screen overflow-hidden bg-sky-100 relative ${getAccessibilityClasses()}`}>
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
      <Guide room={currentRoom} trigger={guideTrigger} />

      {/* Modals */}
      {showAchievements && (
        <AchievementsPanel
          unlockedAchievements={progress.achievements || []}
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
