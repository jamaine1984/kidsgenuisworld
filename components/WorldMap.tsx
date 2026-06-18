import React, { useState } from 'react';
import { ChildProfile, DEFAULT_ARCADE_PROGRESS, RoomType, UserProgress } from '../types';
import {
  Trophy, PawPrint, Settings, LayoutDashboard, PlayCircle, BookOpen, CreditCard,
  Clock, Target, CheckCircle2, MapPin, HeartPulse, Sparkles, X, Gamepad2,
} from 'lucide-react';
import { playPop } from '../services/audioService';
import { getDailyMission, getUnitsForGrade, getWeeklyLearningPlan, type CurriculumUnit } from '../services/curriculum';
import {
  AI_TEACHER,
  MASTERED_PRACTICE_TARGET,
  SCHOOL_LESSON_PHASES,
  getCampusRoom,
  getNextSchoolStep,
  getSchoolDayPlan,
  getStudentPassportSummary,
  getTeacherConferencePlan,
  getTeacherScript,
  getTeacherAssignmentCards,
} from '../services/schoolMode';

interface WorldMapProps {
  onEnterRoom: (room: RoomType, unitId?: string) => void;
  onOpenDashboard: () => void;
  onOpenAchievements: () => void;
  onOpenPet: () => void;
  onOpenGameArcade: () => void;
  onOpenSettings: () => void;
  onOpenBilling?: () => void;
  hasBillingAccess?: boolean;
  progress: UserProgress;
  profiles?: ChildProfile[];
  activeProfileId?: string;
  onSwitchChildProfile?: (profileId: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  onEnterRoom,
  onOpenDashboard,
  onOpenAchievements,
  onOpenPet,
  onOpenGameArcade,
  onOpenSettings,
  onOpenBilling,
  hasBillingAccess = false,
  progress,
  profiles = [],
  activeProfileId = '',
  onSwitchChildProfile,
}) => {
  const [hoveredRoom, setHoveredRoom] = useState<RoomType | null>(null);
  const [showFocusCoach, setShowFocusCoach] = useState(false);
  const [showBreakCoach, setShowBreakCoach] = useState(false);
  const [showReviewQuest, setShowReviewQuest] = useState(false);
  const [focusStep, setFocusStep] = useState(0);
  const mission = getDailyMission(progress);
  const schoolDay = getSchoolDayPlan(progress);
  const teacherAssignments = getTeacherAssignmentCards(progress);
  const missionTeacherScript = getTeacherScript(mission, progress);
  const nextSchoolStep = getNextSchoolStep(progress);
  const studentPassport = getStudentPassportSummary(progress);
  const teacherConferencePlan = getTeacherConferencePlan(progress);
  const weeklyPlan = getWeeklyLearningPlan(progress);
  const unitPracticeCounts = progress.unitPracticeCounts || {};
  const completedUnitIds = new Set(progress.completedUnitIds || []);
  const passportStamps = [...(progress.learningJournal || [])]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);
  const passportRoomCount = new Set((progress.learningJournal || []).map(entry => entry.room)).size;
  const passportReflectionCount = (progress.learningJournal || []).filter(entry => entry.childReflection).length;
  const passportMasteryCount = (progress.learningJournal || []).filter(entry => entry.mastered).length;
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const lastPracticedAtByUnit = (progress.learningJournal || []).reduce((latest, entry) => {
    if (entry.unitId) {
      latest[entry.unitId] = Math.max(latest[entry.unitId] || 0, entry.createdAt);
    }
    return latest;
  }, {} as Record<string, number>);
  const getReviewTiming = (unit: CurriculumUnit) => {
    const lastPracticedAt = lastPracticedAtByUnit[unit.id];
    if (!lastPracticedAt) {
      return {
        label: `${unit.reviewCycleDays}d cycle`,
        detail: 'First practice is ready when you are.',
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
        ? 'Ready to explain again today.'
        : `Explain again after ${daysUntilReview} more day${daysUntilReview === 1 ? '' : 's'}.`,
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
    'Complete one mixed example with less help.',
    'Name one mistake to watch for next time.',
    'Explain the idea in your own words.',
    'Try one more example without guessing.',
  ];
  const reviewQuestItems = [...weeklyPlan]
    .sort((a, b) => {
      const aTiming = getReviewTiming(a.unit);
      const bTiming = getReviewTiming(b.unit);
      if (aTiming.isDue !== bTiming.isDue) return aTiming.isDue ? -1 : 1;
      const aCompleted = completedUnitIds.has(a.unit.id) ? 1 : 0;
      const bCompleted = completedUnitIds.has(b.unit.id) ? 1 : 0;
      if (aCompleted !== bCompleted) return bCompleted - aCompleted;
      const aPracticed = unitPracticeCounts[a.unit.id] || 0;
      const bPracticed = unitPracticeCounts[b.unit.id] || 0;
      if ((aPracticed > 0) !== (bPracticed > 0)) return aPracticed > 0 ? -1 : 1;
      return a.unit.reviewCycleDays - b.unit.reviewCycleDays;
    })
    .slice(0, 3);
  const reviewReadyCount = reviewQuestItems.filter(item => completedUnitIds.has(item.unit.id) || (unitPracticeCounts[item.unit.id] || 0) > 0).length;
  const reviewDueCount = reviewQuestItems.filter(item => getReviewTiming(item.unit).isDue).length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayStats = progress.dailyStats?.find(day => day.date === todayKey);
  const arcadeProgress = {
    ...DEFAULT_ARCADE_PROGRESS,
    ...(progress.arcadeProgress || {}),
    gameWins: progress.arcadeProgress?.gameWins || {},
    masteredGameIds: progress.arcadeProgress?.masteredGameIds || [],
  };
  const arcadeGameRows = [
    { id: 'number-dash', label: 'Number Dash' },
    { id: 'word-builder', label: 'Word Builder' },
    { id: 'pattern-quest', label: 'Pattern Quest' },
    { id: 'story-detective', label: 'Story Detective' },
    { id: 'robot-maze', label: 'Robot Maze' },
    { id: 'rhythm-tap', label: 'Rhythm Tap' },
  ].map(game => ({
    ...game,
    wins: arcadeProgress.gameWins[game.id] || 0,
    mastered: arcadeProgress.masteredGameIds.includes(game.id) || (arcadeProgress.gameWins[game.id] || 0) >= 3,
  }));
  const todayArcadeWins = arcadeProgress.dailyChallengeDate === todayKey ? arcadeProgress.dailyChallengeWins || 0 : 0;
  const arcadeMasteredCount = arcadeGameRows.filter(game => game.mastered).length;
  const arcadeStartedCount = arcadeGameRows.filter(game => game.wins > 0).length;
  const arcadeLongTermMasteryPercent = Math.round((arcadeMasteredCount / Math.max(arcadeGameRows.length, 1)) * 100);
  const arcadeRecommendedGame = [...arcadeGameRows]
    .filter(game => !game.mastered)
    .sort((first, second) => first.wins - second.wins)[0] || arcadeGameRows[0];
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  const todayMinutes = todayStats?.timeSpentMinutes || 0;
  const dailyLimitMinutes = progress.dailySessionLimitMinutes || 20;
  const dailyLimitPercent = Math.min(100, Math.round((todayMinutes / dailyLimitMinutes) * 100));
  const isBreakDue = todayMinutes >= dailyLimitMinutes;
  const breakPacingCopy = isBreakDue
    ? `${todayMinutes} minutes today. Time for an offline reset.`
    : `${todayMinutes}/${dailyLimitMinutes} minutes today before a movement break.`;
  const gradePacingThresholds: { [level: number]: number } = {
    1: 30,
    2: 75,
    3: 135,
    4: 210,
    5: 300,
    6: 405,
  };
  const nextGradeTarget = gradePacingThresholds[progress.currentLevel];
  const nextGradeProgress = nextGradeTarget ? Math.min(progress.stickers.length, nextGradeTarget) : progress.stickers.length;
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
  const currentGradeUnits = getUnitsForGrade(progress.currentGrade);
  const nextUnitByRoom = requiredGradeRooms.reduce((unitsByRoom, room) => {
    const roomUnits = currentGradeUnits
      .filter(unit => unit.room === room)
      .sort((a, b) => {
        const aCompleted = completedUnitIds.has(a.id) ? 1 : 0;
        const bCompleted = completedUnitIds.has(b.id) ? 1 : 0;
        if (aCompleted !== bCompleted) return aCompleted - bCompleted;
        const aPractice = unitPracticeCounts[a.id] || 0;
        const bPractice = unitPracticeCounts[b.id] || 0;
        if (aPractice !== bPractice) return aPractice - bPractice;
        return a.reviewCycleDays - b.reviewCycleDays;
      });

    if (roomUnits[0]) {
      unitsByRoom[room] = roomUnits[0];
    }

    return unitsByRoom;
  }, {} as Partial<Record<RoomType, CurriculumUnit>>);
  const masteryMinimum = gradeMasteryMinimums[progress.currentLevel];
  const subjectScores = [
    progress.mathScore || 0,
    progress.readingScore || 0,
    progress.storybookScore || 0,
    progress.scienceScore || 0,
    progress.geographyScore || 0,
    progress.codingScore || 0,
    progress.languageScore || 0,
  ];
  const subjectsReady = masteryMinimum ? subjectScores.filter(score => score >= masteryMinimum).length : subjectScores.length;
  const visitedRooms = new Set(progress.gradeRoomVisits?.[String(progress.currentLevel)] || []);
  const roomsReady = requiredGradeRooms.filter(room => visitedRooms.has(room)).length;
  const nextGradeChecklist = [
    { label: 'Stars', value: nextGradeTarget ? `${nextGradeProgress}/${nextGradeTarget}` : 'Complete', done: !nextGradeTarget || nextGradeProgress >= nextGradeTarget },
    { label: 'Core skills', value: masteryMinimum ? `${subjectsReady}/7` : 'Complete', done: !masteryMinimum || subjectsReady >= 7 },
    { label: 'Rooms', value: `${roomsReady}/10`, done: roomsReady >= 10 },
  ];
  const focusRoutine = [
    {
      title: 'Breathe',
      prompt: 'Take three slow breaths before the next lesson.',
      cue: 'In through your nose, out like you are cooling soup.',
    },
    {
      title: 'Name the Goal',
      prompt: `Today I will practice: ${mission.title}.`,
      cue: 'Say the goal once so your brain knows where to aim.',
    },
    {
      title: 'Try Again Plan',
      prompt: 'If it feels hard, I can pause, check my clue, and try one more strategy.',
      cue: 'Mistakes are information. Use them to choose the next step.',
    },
  ];
  const offlineBreakIdeas = [
    'Move your body for two minutes: stretch, hop, or walk across the room.',
    'Drink water and tell a grown-up one thing you learned today.',
    `Try the at-home idea: ${mission.parentActivity}`,
  ];
  const getPeriodStatusClasses = (status: (typeof schoolDay.periods)[number]['status']) => {
    if (status === 'done') return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    if (status === 'in-progress') return 'border-indigo-200 bg-indigo-50 text-indigo-900';
    if (status === 'due') return 'border-amber-200 bg-amber-50 text-amber-900';
    if (status === 'locked') return 'border-slate-200 bg-slate-100 text-slate-500';
    return 'border-slate-100 bg-white text-slate-900';
  };
  const getPeriodStatusLabel = (status: (typeof schoolDay.periods)[number]['status']) => {
    if (status === 'done') return 'Done';
    if (status === 'in-progress') return 'In progress';
    if (status === 'due') return 'Due';
    if (status === 'locked') return 'Locked';
    return 'Ready';
  };
  const activePeriod = nextSchoolStep.isSchoolDayComplete
    ? schoolDay.periods[schoolDay.periods.length - 1]
    : nextSchoolStep.period;

  const roomsBase: Array<{ type: RoomType; name: string; emoji: string; color: string; featured?: boolean }> = [
    { type: RoomType.MATH, name: 'Math Mountain', emoji: '🔢', color: 'from-indigo-500 to-blue-600' },
    { type: RoomType.READING, name: 'Reading River', emoji: '📚', color: 'from-orange-500 to-amber-500' },
    { type: RoomType.SCIENCE, name: 'Science Springs', emoji: '🔬', color: 'from-emerald-500 to-teal-500' },
    { type: RoomType.GEOGRAPHY, name: 'World Wonders', emoji: '🌍', color: 'from-cyan-500 to-blue-500' },
    { type: RoomType.CODING, name: 'Code Castle', emoji: '💻', color: 'from-violet-500 to-purple-600' },
    { type: RoomType.ART, name: 'Art Garden', emoji: '🎨', color: 'from-pink-500 to-rose-500' },
    { type: RoomType.MUSIC, name: 'Music Meadow', emoji: '🎵', color: 'from-fuchsia-500 to-purple-500' },
    { type: RoomType.LANGUAGE, name: 'Language Lanterns', emoji: '🗣️', color: 'from-rose-500 to-red-500' },
    { type: RoomType.PUZZLE, name: 'Puzzle Pier', emoji: '🧩', color: 'from-teal-500 to-cyan-500' },
    { type: RoomType.STORYBOOK, name: 'Story Treehouse', emoji: '📖', color: 'from-amber-500 to-yellow-500' },
  ];
  const rooms = roomsBase.map(room => ({
    ...room,
    name: getCampusRoom(room.type).classroomName,
  }));

  const roomScores: Record<RoomType, number> = {
    [RoomType.HUB]: 0,
    [RoomType.MATH]: progress.mathScore || 0,
    [RoomType.READING]: progress.readingScore || 0,
    [RoomType.SCIENCE]: progress.scienceScore || 0,
    [RoomType.GEOGRAPHY]: progress.geographyScore || 0,
    [RoomType.CODING]: progress.codingScore || 0,
    [RoomType.LANGUAGE]: progress.languageScore || 0,
    [RoomType.STORYBOOK]: progress.storybookScore || 0,
    [RoomType.MUSIC]: progress.musicScore || 0,
    [RoomType.ART]: visitedRooms.has(RoomType.ART) ? 1 : 0,
    [RoomType.PUZZLE]: visitedRooms.has(RoomType.PUZZLE) ? 1 : 0,
  };

  const roomDetails: Record<RoomType, { land: string; action: string; detail: string; glow: string; scene?: string }> = {
    [RoomType.HUB]: { land: 'hub', action: 'Choose a path', detail: 'Start learning', glow: 'bg-white/20' },
    [RoomType.MATH]: { land: 'mountain', action: 'Climb numbers', detail: 'Counting, facts, word problems', glow: 'bg-sky-200/30', scene: 'math' },
    [RoomType.READING]: { land: 'river', action: 'Sail through words', detail: 'Phonics, sight words, fluency', glow: 'bg-amber-200/30', scene: 'reading' },
    [RoomType.SCIENCE]: { land: 'springs', action: 'Try experiments', detail: 'Observe, predict, explain', glow: 'bg-emerald-200/30', scene: 'science' },
    [RoomType.GEOGRAPHY]: { land: 'globe', action: 'Explore places', detail: 'Maps, flags, landmarks', glow: 'bg-cyan-200/30', scene: 'geography' },
    [RoomType.CODING]: { land: 'castle', action: 'Command robots', detail: 'Code paths, patterns, problem solving', glow: 'bg-violet-200/30', scene: 'coding' },
    [RoomType.ART]: { land: 'garden', action: 'Create a masterpiece', detail: 'Color, shape, design', glow: 'bg-pink-200/30', scene: 'art' },
    [RoomType.MUSIC]: { land: 'music', action: 'Build rhythms', detail: 'Pitch, patterns, beats', glow: 'bg-fuchsia-200/30', scene: 'music' },
    [RoomType.LANGUAGE]: { land: 'lanterns', action: 'Say new words', detail: 'Spanish, French, Mandarin', glow: 'bg-rose-200/30', scene: 'language' },
    [RoomType.PUZZLE]: { land: 'pier', action: 'Solve challenges', detail: 'Memory, logic, strategy', glow: 'bg-teal-200/30', scene: 'puzzle' },
    [RoomType.STORYBOOK]: { land: 'treehouse', action: 'Read adventures', detail: 'Stories, morals, comprehension', glow: 'bg-yellow-200/30', scene: 'storybook' },
  };
  const schoolRoomDetails = {
    ...roomDetails,
    [RoomType.HUB]: { ...roomDetails[RoomType.HUB], action: 'Homeroom', detail: 'Start the school day with a teacher-led mission.' },
    [RoomType.MATH]: { ...roomDetails[RoomType.MATH], action: 'Teacher-led math', detail: getCampusRoom(RoomType.MATH).detail },
    [RoomType.READING]: { ...roomDetails[RoomType.READING], action: 'Teacher-led reading', detail: getCampusRoom(RoomType.READING).detail },
    [RoomType.SCIENCE]: { ...roomDetails[RoomType.SCIENCE], action: 'Science lesson', detail: getCampusRoom(RoomType.SCIENCE).detail },
    [RoomType.GEOGRAPHY]: { ...roomDetails[RoomType.GEOGRAPHY], action: 'World studies', detail: getCampusRoom(RoomType.GEOGRAPHY).detail },
    [RoomType.CODING]: { ...roomDetails[RoomType.CODING], action: 'Coding lesson', detail: getCampusRoom(RoomType.CODING).detail },
    [RoomType.ART]: { ...roomDetails[RoomType.ART], action: 'Studio lesson', detail: getCampusRoom(RoomType.ART).detail },
    [RoomType.MUSIC]: { ...roomDetails[RoomType.MUSIC], action: 'Music lesson', detail: getCampusRoom(RoomType.MUSIC).detail },
    [RoomType.LANGUAGE]: { ...roomDetails[RoomType.LANGUAGE], action: 'Language lesson', detail: getCampusRoom(RoomType.LANGUAGE).detail },
    [RoomType.PUZZLE]: { ...roomDetails[RoomType.PUZZLE], action: 'Strategy lesson', detail: getCampusRoom(RoomType.PUZZLE).detail },
    [RoomType.STORYBOOK]: { ...roomDetails[RoomType.STORYBOOK], action: 'Library lesson', detail: getCampusRoom(RoomType.STORYBOOK).detail },
  };

  const renderRoomScene = (room: RoomType) => {
    const scene = roomDetails[room]?.scene;
    if (scene) {
      return (
        <img
          src={`/room-scenes/${scene}.png`}
          alt=""
          aria-hidden="true"
          className="h-full w-full rounded-[20px] object-cover shadow-lg"
          loading="lazy"
        />
      );
    }

    switch (room) {
      case RoomType.MATH:
        return (
          <div className="room-art room-art-math" aria-hidden="true">
            <div className="mountain mountain-back" />
            <div className="mountain mountain-front" />
            <span className="number-orb left-4 top-4">2</span>
            <span className="number-orb right-5 bottom-5">8</span>
          </div>
        );
      case RoomType.READING:
        return (
          <div className="room-art room-art-reading" aria-hidden="true">
            <div className="river-line" />
            <div className="storybook-card -rotate-6">cat</div>
            <div className="storybook-card rotate-6">sun</div>
          </div>
        );
      case RoomType.SCIENCE:
        return (
          <div className="room-art room-art-science" aria-hidden="true">
            <div className="beaker">
              <div className="beaker-liquid" />
            </div>
            <span className="bubble left-5 top-4" />
            <span className="bubble right-8 top-7" />
            <span className="bubble right-4 bottom-7" />
          </div>
        );
      case RoomType.GEOGRAPHY:
        return (
          <div className="room-art room-art-geo" aria-hidden="true">
            <div className="globe">
              <span className="land land-a" />
              <span className="land land-b" />
              <span className="globe-line" />
            </div>
            <div className="map-pin" />
          </div>
        );
      case RoomType.CODING:
        return (
          <div className="room-art room-art-coding" aria-hidden="true">
            <div className="castle">
              <span />
              <span />
              <span />
            </div>
            <div className="robot-face">01</div>
          </div>
        );
      case RoomType.ART:
        return (
          <div className="room-art room-art-art" aria-hidden="true">
            <div className="palette">
              <span className="paint-dot bg-red-400" />
              <span className="paint-dot bg-yellow-300" />
              <span className="paint-dot bg-blue-400" />
            </div>
            <div className="brush" />
          </div>
        );
      case RoomType.MUSIC:
        return (
          <div className="room-art room-art-music" aria-hidden="true">
            <span className="music-note note-a">♪</span>
            <span className="music-note note-b">♫</span>
            <span className="music-note note-c">♩</span>
            <div className="sound-wave" />
          </div>
        );
      case RoomType.LANGUAGE:
        return (
          <div className="room-art room-art-language" aria-hidden="true">
            <div className="speech-card">Hola</div>
            <div className="speech-card speech-card-small">Bonjour</div>
            <div className="lantern" />
          </div>
        );
      case RoomType.PUZZLE:
        return (
          <div className="room-art room-art-puzzle" aria-hidden="true">
            <div className="puzzle-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        );
      case RoomType.STORYBOOK:
        return (
          <div className="room-art room-art-story" aria-hidden="true">
            <div className="treehouse">
              <span className="tree-top" />
              <span className="tree-room" />
              <span className="tree-trunk" />
            </div>
            <div className="open-book" />
          </div>
        );
      default:
        return <div className="room-art" aria-hidden="true" />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden relative bg-[radial-gradient(circle_at_top,#fff1a8_0%,#97dbff_28%,#74d3c8_58%,#82d86e_100%)] kid-scroll">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-[8%] text-6xl opacity-60 animate-float">☁️</div>
        <div className="absolute top-10 right-[12%] text-7xl opacity-50 animate-float-delayed">☁️</div>
        <div className="absolute top-16 right-8 text-8xl animate-pulse">☀️</div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-5xl opacity-40">🌈</div>
        <div className="absolute bottom-16 left-8 text-5xl">🌸</div>
        <div className="absolute bottom-20 right-12 text-5xl">🌼</div>
        <div className="absolute bottom-28 left-1/3 text-4xl">🦋</div>
        <div className="absolute bottom-12 right-1/4 text-4xl">🐝</div>
      </div>

      <div className="relative z-20 p-4 flex justify-between items-start gap-4 flex-wrap">
        <div className="bg-white/90 p-4 rounded-[28px] shadow-xl border-4 border-white/60 backdrop-blur-sm flex items-center gap-4">
          <div className="text-5xl">
            {progress.pet ? (progress.pet.type === 'dog' ? '🐶' : progress.pet.type === 'cat' ? '🐱' : progress.pet.type === 'bunny' ? '🐰' : '🤖') : '🧒'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-sky-700">Kid Genius World</h1>
            <p className="text-sm font-black text-slate-800">
              {activeProfile?.name || progress.childName || 'Learner'}
            </p>
            {profiles.length > 1 && (
              <label className="mt-2 flex max-w-xs flex-col gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">
                Switch child
                <select
                  value={activeProfileId}
                  onChange={(event) => {
                    playPop();
                    onSwitchChildProfile?.(event.target.value);
                  }}
                  className="rounded-xl border-2 border-sky-100 bg-white px-3 py-2 text-sm font-black normal-case tracking-normal text-slate-800 outline-none focus:border-sky-400"
                  aria-label="Switch child profile"
                >
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} - {profile.grade}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <p className="text-sm text-slate-600 font-bold">{progress.currentGrade} • Level {progress.currentLevel}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-xs font-black">⭐ {progress.stickers.length} stars</span>
              <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-black">🏆 {progress.achievements?.length || 0} badges</span>
              <span className="bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-black">
                {nextGradeTarget ? `Next grade: ${nextGradeProgress}/${nextGradeTarget}` : 'Top grade path'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {progress.pet && (
            <button
              onClick={() => { playPop(); onOpenPet(); }}
              className="bg-pink-400 hover:bg-pink-300 text-white p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 border-b-4 border-pink-600"
              title="My Pet"
            >
              <PawPrint size={24} />
            </button>
          )}
          <button
            onClick={() => { playPop(); onOpenAchievements(); }}
            className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 border-b-4 border-yellow-600"
            title="Achievements"
          >
            <Trophy size={24} />
          </button>
          <button
            onClick={() => { playPop(); onOpenDashboard(); }}
            className="bg-white hover:bg-gray-100 text-gray-700 p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 border-b-4 border-slate-300"
            title="Dashboard"
          >
            <LayoutDashboard size={24} />
          </button>
          {hasBillingAccess && onOpenBilling && (
            <button
              onClick={() => { playPop(); onOpenBilling(); }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-lg transition-transform hover:scale-105 border-b-4 border-emerald-800 font-black"
              title="Manage Billing"
            >
              <CreditCard size={22} />
              <span className="hidden sm:inline">Manage Billing</span>
              <span className="sm:hidden">Billing</span>
            </button>
          )}
          <button
            onClick={() => { playPop(); onOpenSettings(); }}
            className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl shadow-lg transition-transform hover:scale-105 border-b-4 border-slate-400 font-black"
            title="Parent Dashboard and Settings"
          >
            <Settings size={22} />
            <span className="hidden sm:inline">Parent Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-2 max-w-6xl mx-auto">
        <section
          data-testid="school-bell-strip"
          className="mb-4 rounded-[28px] border-4 border-white/70 bg-white/95 p-3 shadow-xl"
          aria-label="Today's school day schedule"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="rounded-3xl bg-slate-950 px-4 py-3 text-white xl:w-72">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">School Bell</p>
              <h2 className="mt-1 text-xl font-black leading-tight">{activePeriod.label}</h2>
              <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-200">{activePeriod.detail}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300"
                    style={{ width: `${schoolDay.schoolDayPercent}%` }}
                  />
                </div>
                <span className="text-xs font-black text-white">{schoolDay.schoolDayPercent}%</span>
              </div>
            </div>

            <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {schoolDay.periods.map((period, index) => {
                const isActivePeriod = period.id === activePeriod.id && !nextSchoolStep.isSchoolDayComplete;
                return (
                  <button
                    key={`school-bell-${period.id}`}
                    onClick={() => {
                      if (period.status === 'locked') return;
                      playPop();
                      onEnterRoom(period.room, period.unitId);
                    }}
                    disabled={period.status === 'locked'}
                    className={`min-h-[104px] rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none ${getPeriodStatusClasses(period.status)} ${isActivePeriod ? 'ring-4 ring-indigo-200' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-xs font-black">
                        {index + 1}
                      </span>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">
                        {isActivePeriod ? 'Now' : getPeriodStatusLabel(period.status)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-black leading-tight">{period.label}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-semibold opacity-80">{period.proof}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { playPop(); onEnterRoom(nextSchoolStep.room, nextSchoolStep.unitId); }}
              className="rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700 xl:w-44"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <PlayCircle size={20} />
                {nextSchoolStep.actionLabel}
              </span>
            </button>
          </div>
        </section>

        <div
          data-testid="ai-homeroom-card"
          className="hidden"
        >
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.25fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-sky-700 to-emerald-500 p-5">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
              <div className="absolute bottom-0 right-0 h-28 w-44 rounded-tl-[60px] bg-white/10" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-100">AI Homeroom</p>
                <h2 className="mt-1 text-3xl font-black leading-tight">{AI_TEACHER.school}</h2>
                <p className="mt-2 max-w-md text-sm font-semibold text-white/85">
                  {AI_TEACHER.name} opens the day, teaches the lesson path, checks the exit ticket, and saves parent-visible progress.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-white/40 bg-white text-2xl font-black text-indigo-700 shadow-lg">
                    MN
                  </div>
                  <div>
                    <p className="text-lg font-black">{AI_TEACHER.name}</p>
                    <p className="text-sm font-semibold text-white/80">{AI_TEACHER.title}</p>
                    <p className="mt-1 text-xs font-bold text-sky-100">{AI_TEACHER.voicePack}</p>
                  </div>
                </div>
                <button
                  onClick={() => { playPop(); onEnterRoom(schoolDay.mission.room, schoolDay.mission.id); }}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50"
                >
                  <PlayCircle size={20} />
                  Start Homeroom Lesson
                </button>
              </div>
            </div>

            <div className="bg-white p-5 text-slate-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Today's teacher plan</p>
                  <h3 className="mt-1 text-2xl font-black">{schoolDay.mission.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{missionTeacherScript.objective}</p>
                </div>
                <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-indigo-700">{schoolDay.mastery.practiceCount}/{MASTERED_PRACTICE_TARGET}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-indigo-500">mastery gate</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                {schoolDay.schedule.map(item => (
                  <button
                    key={`${item.time}-${item.label}`}
                    onClick={() => { playPop(); onEnterRoom(item.room === RoomType.HUB ? schoolDay.mission.room : item.room, schoolDay.mission.id); }}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-500">{item.time}</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{item.label}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-600">{item.detail}</p>
                    <div className="mt-2 rounded-xl bg-white px-2 py-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Proof</p>
                      <p className="line-clamp-2 text-[11px] font-bold text-slate-700">{item.proof}</p>
                    </div>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-indigo-600">{item.reward}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-5">
                {SCHOOL_LESSON_PHASES.map(phase => (
                  <div key={phase.id} className="rounded-2xl bg-sky-50 p-3">
                    <p className="text-xs font-black text-sky-800">{phase.label}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-600">{phase.studentAction}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Teacher exit ticket</p>
                <p className="mt-1 text-sm font-bold text-emerald-950">{missionTeacherScript.exitTicket}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          data-testid="next-class-pass"
          className="hidden"
        >
          <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-800 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Next Class Pass</p>
              <h2 className="mt-1 text-3xl font-black leading-tight">{nextSchoolStep.title}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-200">{nextSchoolStep.detail}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                  <p className="text-2xl font-black">{nextSchoolStep.stepNumber}/{nextSchoolStep.totalSteps}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">class step</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                  <p className="text-2xl font-black">{schoolDay.schoolDayPercent}%</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-200">school day</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Ms. Nova says</p>
                  <p className="mt-2 text-lg font-black leading-snug text-slate-900">{nextSchoolStep.teacherPrompt}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                      <CheckCircle2 size={13} />
                      {nextSchoolStep.progressLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">
                      <MapPin size={13} />
                      {getCampusRoom(nextSchoolStep.room).classroomName}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">Proof to finish</p>
                      <p className="mt-1 text-xs font-bold text-emerald-950">{nextSchoolStep.proof}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">Class reward</p>
                      <p className="mt-1 text-xs font-bold text-amber-950">{nextSchoolStep.reward}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { playPop(); onEnterRoom(nextSchoolStep.room, nextSchoolStep.unitId); }}
                  className="shrink-0 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <PlayCircle size={20} />
                    {nextSchoolStep.actionLabel}
                  </span>
                </button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500"
                  style={{ width: `${schoolDay.schoolDayPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          data-testid="school-day-tracker"
          className="hidden"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">School Day Tracker</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Today&apos;s class periods</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">{schoolDay.attendanceSummary}</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-white">
              <p className="text-2xl font-black">{schoolDay.completedPeriods}/{schoolDay.totalPeriods}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-200">periods complete</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500"
              style={{ width: `${schoolDay.schoolDayPercent}%` }}
            />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {schoolDay.periods.map(period => {
              const isActivePeriod = period.id === nextSchoolStep.period.id && !nextSchoolStep.isSchoolDayComplete;
              return (
                <button
                  key={period.id}
                  onClick={() => {
                    if (period.status === 'locked') return;
                    playPop();
                    onEnterRoom(period.room, period.unitId);
                  }}
                  disabled={period.status === 'locked'}
                  className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none ${getPeriodStatusClasses(period.status)} ${isActivePeriod ? 'ring-4 ring-indigo-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
                        {isActivePeriod ? 'Now' : getPeriodStatusLabel(period.status)}
                      </p>
                      <p className="mt-1 text-sm font-black">{period.label}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">{period.actionLabel}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold opacity-80">{period.detail}</p>
                  <div className="mt-2 rounded-xl bg-white/70 px-2 py-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-70">Proof</p>
                    <p className="line-clamp-2 text-[11px] font-bold opacity-90">{period.proof}</p>
                  </div>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] opacity-70">{period.reward}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div
          data-testid="teacher-assignment-cards"
          className="mb-4 rounded-[28px] border-4 border-white/70 bg-white/95 p-4 shadow-xl"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Teacher Assignment Cards</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Ms. Nova assigned every classroom</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Each card has the objective, one worked-example cue, a mastery rubric, and a parent practice note.
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center">
              <p className="text-2xl font-black text-indigo-700">{teacherAssignments.length}</p>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-indigo-500">class assignments</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {teacherAssignments.map(card => (
              <button
                key={card.unitId}
                onClick={() => { playPop(); onEnterRoom(card.room, card.unitId); }}
                className={`flex min-h-[260px] flex-col rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${getPeriodStatusClasses(card.status)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{card.statusLabel}</p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black">{card.classroomName}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">{card.actionLabel}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-black">{card.title}</p>
                <p className="mt-2 line-clamp-3 text-xs font-semibold opacity-80">{card.objective}</p>
                <div className="mt-3 rounded-xl bg-white/70 p-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-70">Example</p>
                  <p className="mt-1 line-clamp-2 text-xs font-bold">{card.example}</p>
                </div>
                <div className="mt-2 rounded-xl bg-white/70 p-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-70">Mastery rubric</p>
                  <p className="mt-1 line-clamp-2 text-xs font-bold">{card.masteryRubric}</p>
                </div>
                <div className="mt-auto pt-3">
                  <p className="line-clamp-2 text-[11px] font-semibold opacity-80">Parent note: {card.parentNote}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full rounded-full bg-slate-950/80"
                      style={{ width: `${Math.round((Math.min(card.practiceCount, MASTERED_PRACTICE_TARGET) / MASTERED_PRACTICE_TARGET) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-black opacity-70">{Math.min(card.practiceCount, MASTERED_PRACTICE_TARGET)}/{MASTERED_PRACTICE_TARGET} practice rounds</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 bg-white/90 rounded-[24px] p-4 shadow-lg border-4 border-white/60">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-700 font-black mb-3">Next Grade Checklist</p>
          <div className="grid grid-cols-3 gap-2">
            {nextGradeChecklist.map(item => (
              <div key={item.label} className={`rounded-2xl px-3 py-2 text-center ${item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                <p className="text-[11px] font-black">{item.label}</p>
                <p className="text-sm font-black">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 overflow-hidden rounded-[28px] border-4 border-white/60 bg-gradient-to-r from-amber-100 via-white to-emerald-100 p-4 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-800 shadow-inner">
                <Trophy size={30} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Learning Passport</p>
                <h2 className="text-xl font-black text-slate-900">Passport Stamp Collection</h2>
                <p className="text-sm font-semibold text-slate-600">
                  {passportStamps.length > 0
                    ? `${passportStamps.length} recent stamps from finished missions.`
                    : 'Finish a mission to earn your first learning stamp.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                <p className="text-lg font-black text-emerald-700">{passportRoomCount}</p>
                <p className="text-[11px] font-black text-slate-500">rooms</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                <p className="text-lg font-black text-violet-700">{passportReflectionCount}</p>
                <p className="text-[11px] font-black text-slate-500">reflection stamps</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                <p className="text-lg font-black text-amber-700">{passportMasteryCount}</p>
                <p className="text-[11px] font-black text-slate-500">mastered</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div
              data-testid="student-passport-conference"
              className="rounded-2xl border border-indigo-100 bg-white/90 p-3 shadow-sm sm:col-span-2 lg:col-span-4"
            >
              <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-indigo-600">Teacher conference question</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{studentPassport.teacherConferenceQuestion}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">{studentPassport.attendanceLabel}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50 px-2 py-2">
                    <p className="text-lg font-black text-emerald-700">{studentPassport.evidenceCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-800">proof saved</p>
                  </div>
                  <div className="rounded-xl bg-violet-50 px-2 py-2">
                    <p className="text-lg font-black text-violet-700">{studentPassport.reflectionCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-800">reflections</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 px-2 py-2">
                    <p className="text-lg font-black text-amber-700">{studentPassport.masteryCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-amber-800">mastered</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Latest proof</p>
                  <p className="mt-1 text-xs font-bold text-slate-800">{studentPassport.latestProofLabel}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-600">{studentPassport.latestProofDetail}</p>
                </div>
                <div className="rounded-xl bg-indigo-50 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-indigo-600">Next stamp target</p>
                  <p className="mt-1 text-xs font-bold text-indigo-950">{studentPassport.nextStampTarget}</p>
                </div>
              </div>
              <div
                data-testid="student-teacher-conference-plan"
                className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-sky-700">Teacher conference plan</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{teacherConferencePlan.statusLabel}: {teacherConferencePlan.headline}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{teacherConferencePlan.focusRoom} - {teacherConferencePlan.evidenceLabel}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-sky-800 shadow-sm">
                    {teacherConferencePlan.tone === 'review' ? 'Review ready' : teacherConferencePlan.tone === 'start' ? 'Start here' : 'Teacher support'}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="rounded-lg bg-white/80 px-2 py-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-sky-700">Teacher move</p>
                    <p className="mt-1 line-clamp-3 text-[11px] font-bold text-slate-700">{teacherConferencePlan.teacherMove}</p>
                  </div>
                  <div className="rounded-lg bg-white/80 px-2 py-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">Student can say</p>
                    <p className="mt-1 line-clamp-3 text-[11px] font-bold text-slate-700">{teacherConferencePlan.studentCanSay}</p>
                  </div>
                  <div className="rounded-lg bg-white/80 px-2 py-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">Review plan</p>
                    <p className="mt-1 line-clamp-3 text-[11px] font-bold text-slate-700">{teacherConferencePlan.reviewPlan}</p>
                  </div>
                </div>
              </div>
            </div>
            {passportStamps.length > 0 ? (
              passportStamps.map(stamp => (
                <div key={stamp.id} className="rounded-2xl bg-white/85 border border-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-emerald-600">{stamp.roomLabel}</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{stamp.unitTitle}</p>
                    </div>
                    <CheckCircle2 size={18} className={stamp.childReflection ? 'text-emerald-500' : 'text-amber-500'} />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    {stamp.childReflection ? `Reflection: ${stamp.childReflection}` : `${Math.min(stamp.practiceCount, MASTERED_PRACTICE_TARGET)}/${MASTERED_PRACTICE_TARGET} practice rounds`}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-white/60 p-3 text-sm font-bold text-amber-800 sm:col-span-2 lg:col-span-4">
                Your passport is ready for the first mission stamp.
              </div>
            )}
          </div>
        </div>

        <div className="hidden">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-700 font-black">School Campus</p>
              <h2 className="text-2xl font-black text-slate-900">Choose a classroom for the next lesson</h2>
            </div>
            <p className="text-sm font-bold text-slate-600">Homeroom, daily mission, and weekly review keep every room teacher-led.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {rooms.map((room) => {
              const details = schoolRoomDetails[room.type];
              const nextUnit = nextUnitByRoom[room.type];
              return (
                <button
                  key={`quick-${room.type}`}
                  onClick={() => { playPop(); onEnterRoom(room.type, nextUnit?.id); }}
                  className="group overflow-hidden rounded-2xl bg-slate-900 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                  aria-label={`Enter ${room.name}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {renderRoomScene(room.type)}
                  </div>
                  <div className={`bg-gradient-to-br ${room.color} p-3`}>
                    <p className="text-sm font-black text-white drop-shadow">{room.name}</p>
                    <p className="mt-1 line-clamp-1 text-[11px] font-bold text-white/85">{details.detail}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-4">
          <button
            onClick={() => { playPop(); onEnterRoom(mission.room, mission.id); }}
            aria-label={`Start today's mission: ${mission.title}`}
            data-testid="daily-mission-card"
            className="text-left bg-white/92 backdrop-blur-sm rounded-[28px] p-5 shadow-xl border-4 border-white/60 hover:scale-[1.01] transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <PlayCircle size={36} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-600 font-black mb-1">Today's Mission</p>
                <h2 className="text-2xl font-black text-slate-900">{mission.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{mission.objective}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black">
                    <Target size={13} />
                    Goal: {mission.masteryTarget}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 px-3 py-1 text-xs font-black">
                    <Clock size={13} />
                    Review in {mission.reviewCycleDays} days
                  </span>
                </div>
                <div className="mt-3 rounded-2xl bg-indigo-50 border border-indigo-100 p-3">
                  <p className="text-xs text-indigo-900 font-bold">At-home idea: {mission.parentActivity}</p>
                  <p className="text-xs text-indigo-700 mt-1">Success check: {mission.successCheck}</p>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {getPracticeActivities(mission).map((activity, index) => (
                    <div key={`${mission.id}-activity-${index}`} className="rounded-2xl bg-white border border-indigo-100 p-3 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-500">Step {index + 1}</p>
                      <p className="mt-1 text-xs font-bold text-slate-700">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>
              <span className="bg-indigo-600 text-white rounded-full px-5 py-3 font-black shadow-lg">Start</span>
            </div>
          </button>

          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="bg-white/90 rounded-[24px] p-4 shadow-lg border-4 border-white/60">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-700 font-black mb-2">This Week</p>
              <div className="space-y-2">
                {weeklyPlan.slice(0, 3).map(item => (
                  <button
                    key={item.day}
                    onClick={() => { playPop(); onEnterRoom(item.unit.room, item.unit.id); }}
                    className="w-full text-left rounded-2xl bg-sky-50 hover:bg-sky-100 transition px-3 py-2"
                  >
                    <p className="text-[11px] font-black text-sky-700">{item.day} • {item.focus}</p>
                    <p className="text-sm font-black text-slate-800">{item.unit.title}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                playPop();
                setShowReviewQuest(true);
              }}
              className="bg-violet-50/95 rounded-[24px] p-4 shadow-lg border-4 border-white/60 text-left hover:scale-[1.02] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] font-black text-violet-600">Spaced Review</p>
                  <p className="mt-1 font-black text-violet-950">Review Quest</p>
                  <p className="text-sm text-violet-800/80">
                    {reviewDueCount > 0
                      ? `${reviewDueCount} lesson${reviewDueCount === 1 ? '' : 's'} due for explain-again practice.`
                      : reviewReadyCount > 0
                      ? `${reviewReadyCount} practiced lessons ready to explain again.`
                      : 'Start with quick explain-again lessons from this week.'}
                  </p>
                </div>
                <CheckCircle2 className="text-violet-600" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {reviewQuestItems.map(item => (
                  <span key={`${item.day}-${item.unit.id}`} className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-violet-700">
                    {item.unit.reviewCycleDays}d review
                  </span>
                ))}
              </div>
            </button>
            <button
              onClick={() => {
                playPop();
                setShowBreakCoach(true);
              }}
              className={`${isBreakDue ? 'bg-rose-50/95' : 'bg-white/90'} rounded-[24px] p-4 shadow-lg border-4 border-white/60 text-left hover:scale-[1.02] transition`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-[0.18em] font-black ${isBreakDue ? 'text-rose-600' : 'text-sky-700'}`}>
                    {isBreakDue ? 'Break due' : 'Healthy pacing'}
                  </p>
                  <p className={`mt-1 font-black ${isBreakDue ? 'text-rose-900' : 'text-slate-900'}`}>Offline Break</p>
                  <p className={`text-sm ${isBreakDue ? 'text-rose-800/80' : 'text-slate-600'}`}>
                    {breakPacingCopy}
                  </p>
                </div>
                <Clock className={isBreakDue ? 'text-rose-600' : 'text-sky-600'} />
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full ${isBreakDue ? 'bg-rose-500' : 'bg-sky-500'}`}
                  style={{ width: `${dailyLimitPercent}%` }}
                />
              </div>
            </button>
            <button
              onClick={() => { playPop(); onEnterRoom(RoomType.STORYBOOK); }}
              className="bg-amber-50/95 rounded-[24px] p-4 shadow-lg border-4 border-white/60 text-left hover:scale-[1.02] transition"
            >
              <BookOpen className="text-amber-600 mb-2" />
              <p className="font-black text-amber-900">Story Time</p>
              <p className="text-sm text-amber-800/80">Read, listen, and build comprehension.</p>
            </button>
            <button
              onClick={() => {
                playPop();
                onOpenGameArcade();
              }}
              className="bg-slate-950 rounded-[24px] p-4 shadow-lg border-4 border-cyan-200/70 text-left hover:scale-[1.02] transition text-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] font-black text-cyan-200">Play Zone</p>
                  <p className="mt-1 font-black">Game Arcade</p>
                  <p className="text-sm text-slate-200">Short modern games for math, words, logic, stories, code, and rhythm.</p>
                </div>
                <Gamepad2 className="text-cyan-200" />
              </div>
              <div className="mt-3 rounded-2xl bg-white/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Arcade Passport</p>
                    <p className="mt-1 text-xs font-semibold text-slate-200">Badge trail progress for every game.</p>
                  </div>
                  <div className="rounded-xl bg-cyan-100 px-3 py-2 text-center text-slate-950">
                    <p className="text-lg font-black">{arcadeLongTermMasteryPercent}%</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.12em]">Long-term mastery</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-yellow-300"
                    style={{ width: `${arcadeLongTermMasteryPercent}%` }}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
                <span className="rounded-full bg-cyan-100 px-2 py-1 text-slate-900">{todayArcadeWins} today</span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-900">{arcadeMasteredCount}/6 badges</span>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">{arcadeStartedCount}/6 tried</span>
              </div>
              <div className="mt-3 rounded-2xl bg-white/10 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Next arcade game</p>
                <p className="mt-1 text-sm font-black text-white">{arcadeRecommendedGame.label}</p>
                <p className="mt-1 text-xs font-semibold text-slate-300">Badge trail: win 3 rounds to master this game.</p>
              </div>
            </button>
            <button
              onClick={() => {
                playPop();
                setFocusStep(0);
                setShowFocusCoach(true);
              }}
              className="bg-emerald-50/95 rounded-[24px] p-4 shadow-lg border-4 border-white/60 text-left hover:scale-[1.02] transition"
            >
              <HeartPulse className="text-emerald-600 mb-2" />
              <p className="font-black text-emerald-900">Focus Quest</p>
              <p className="text-sm text-emerald-800/80">Breathe, set a goal, and try again when learning feels hard.</p>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 pb-10">
        <div className="max-w-6xl mx-auto mb-3">
          <p className="text-sky-900 font-black bg-white/70 rounded-full px-5 py-2 inline-block shadow">School Campus</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl mx-auto w-full">
          {rooms.map((room) => {
            const details = schoolRoomDetails[room.type];
            const isVisited = visitedRooms.has(room.type);
            const isMissionRoom = mission.room === room.type;
            const score = roomScores[room.type] || 0;
            const nextUnit = nextUnitByRoom[room.type];
            const nextUnitPractice = nextUnit ? Math.min(unitPracticeCounts[nextUnit.id] || 0, MASTERED_PRACTICE_TARGET) : 0;

            return (
              <button
                key={room.type}
                onClick={() => { playPop(); onEnterRoom(room.type, nextUnit?.id); }}
                onMouseEnter={() => setHoveredRoom(room.type)}
                onMouseLeave={() => setHoveredRoom(null)}
                aria-label={`Enter ${room.name}`}
                data-testid={`room-card-${room.type}`}
                className={`${room.featured ? 'sm:col-span-2 sm:row-span-2' : ''} relative group text-left`}
              >
                <div className={`room-destination-tile relative overflow-hidden bg-gradient-to-br ${room.color} rounded-[30px] shadow-xl border-4 border-white/50 transform transition-all duration-200 group-hover:scale-[1.03] group-hover:-translate-y-2 ${room.featured ? 'min-h-[260px]' : 'min-h-[214px]'}`}>
                  <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${details.glow} blur-xl`} />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-black/10" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    {isMissionRoom && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-1 text-[11px] font-black text-yellow-900 shadow">
                        <MapPin size={12} />
                        Mission
                      </span>
                    )}
                    {isVisited && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-black text-emerald-700 shadow">
                        <CheckCircle2 size={12} />
                        Visited
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-between p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/75">{details.action}</p>
                        <h3 className={`${room.featured ? 'text-2xl' : 'text-lg'} mt-1 font-black text-white drop-shadow`}>{room.name}</h3>
                      </div>
                      <span className={`${room.featured ? 'text-6xl' : 'text-4xl'} shrink-0 drop-shadow-lg`}>{room.emoji}</span>
                    </div>

                    <div className="room-scene relative my-3 flex flex-1 items-center justify-center rounded-[24px] border border-white/25 bg-white/15 px-3 py-4 shadow-inner">
                      {renderRoomScene(room.type)}
                    </div>

                    <div className="rounded-2xl bg-white/90 p-3 shadow-lg">
                      <p className="text-sm font-black text-slate-900">{details.detail}</p>
                      {nextUnit && (
                        <div className="mt-2 rounded-xl bg-slate-50 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Next lesson</p>
                            <p className="text-[10px] font-black text-emerald-700">{nextUnitPractice}/{MASTERED_PRACTICE_TARGET}</p>
                          </div>
                          <p className="mt-1 text-xs font-black text-slate-800">{nextUnit.title}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-slate-500">
                            {getPracticeActivities(nextUnit)[0]}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-700">{score} wins</span>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">Enter</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-[30px] bg-white/15 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className={`${room.featured ? 'w-40 h-5' : 'w-24 h-4'} mx-auto mt-2 bg-black/20 rounded-full blur-sm transition-all group-hover:scale-75 group-hover:opacity-50`} />

                {hoveredRoom === room.type && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap z-30 animate-fade-in">
                    Enter {room.name}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showFocusCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl border-4 border-emerald-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Sparkles size={26} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Focus Quest</p>
                  <h2 className="text-xl font-black text-slate-900">{focusRoutine[focusStep].title}</h2>
                </div>
              </div>
              <button
                onClick={() => setShowFocusCoach(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Close Focus Quest"
              >
                <X size={20} />
              </button>
            </div>

            <div className="my-5 rounded-[24px] bg-gradient-to-br from-emerald-50 to-sky-50 p-5 text-center">
              <p className="text-lg font-black text-emerald-950">{focusRoutine[focusStep].prompt}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{focusRoutine[focusStep].cue}</p>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {focusRoutine.map((step, index) => (
                <div
                  key={step.title}
                  className={`h-2 rounded-full ${index <= focusStep ? 'bg-emerald-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (focusStep >= focusRoutine.length - 1) {
                    setShowFocusCoach(false);
                    return;
                  }
                  setFocusStep(step => step + 1);
                }}
                className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg hover:bg-emerald-700"
              >
                {focusStep >= focusRoutine.length - 1 ? 'I Am Ready' : 'Next Step'}
              </button>
              <button
                onClick={() => {
                  playPop();
                  onEnterRoom(mission.room, mission.id);
                  setShowFocusCoach(false);
                }}
                className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700 hover:bg-slate-200"
              >
                Start Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-5 shadow-2xl border-4 border-violet-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">Review Quest</p>
                  <h2 className="text-xl font-black text-slate-900">Explain it again</h2>
                </div>
              </div>
              <button
                onClick={() => setShowReviewQuest(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Close Review Quest"
              >
                <X size={20} />
              </button>
            </div>

            <p className="my-4 rounded-[22px] bg-violet-50 p-4 text-sm font-semibold text-violet-900">
              Quick review helps learning stick. Pick one lesson, explain the idea out loud, then try the room again.
            </p>

            <div className="space-y-3">
              {reviewQuestItems.map(item => {
                const practiceCount = unitPracticeCounts[item.unit.id] || 0;
                const completed = completedUnitIds.has(item.unit.id);
                const reviewTiming = getReviewTiming(item.unit);
                return (
                  <div key={`${item.day}-${item.unit.id}`} className="rounded-2xl border border-violet-100 bg-slate-50 p-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                          {completed ? `Mastered • ${reviewTiming.label}` : practiceCount > 0 ? reviewTiming.label : `${item.unit.reviewCycleDays} day review`}
                        </p>
                        <h3 className="mt-1 font-black text-slate-900">{item.unit.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{item.unit.successCheck}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-center">
                        <p className="text-xl font-black text-violet-700">{Math.min(practiceCount, MASTERED_PRACTICE_TARGET)}/{MASTERED_PRACTICE_TARGET}</p>
                        <p className="text-xs font-bold text-slate-500">practice</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 rounded-xl bg-white p-3 text-xs font-bold text-slate-700">
                        <p>{reviewTiming.lastLabel} • {reviewTiming.detail}</p>
                        <p className="mt-1">At-home check: {item.unit.parentActivity}</p>
                        <p className="mt-2 text-violet-800">Exit check: {getEndChecks(item.unit)[0]}</p>
                      </div>
                      <button
                        onClick={() => {
                          playPop();
                          onEnterRoom(item.unit.room, item.unit.id);
                          setShowReviewQuest(false);
                        }}
                        className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white hover:bg-violet-700"
                      >
                        Start Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showBreakCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl border-4 border-sky-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isBreakDue ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'}`}>
                  <Clock size={26} />
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${isBreakDue ? 'text-rose-600' : 'text-sky-600'}`}>Offline Break</p>
                  <h2 className="text-xl font-black text-slate-900">
                    {isBreakDue ? 'Time to pause' : 'Plan a healthy break'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowBreakCoach(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Close Offline Break"
              >
                <X size={20} />
              </button>
            </div>

            <div className={`my-5 rounded-[24px] p-4 ${isBreakDue ? 'bg-rose-50' : 'bg-sky-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-900">Today</p>
                <p className={`font-black ${isBreakDue ? 'text-rose-700' : 'text-sky-700'}`}>{todayMinutes}/{dailyLimitMinutes} minutes</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full ${isBreakDue ? 'bg-rose-500' : 'bg-sky-500'}`}
                  style={{ width: `${dailyLimitPercent}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Short breaks help kids come back calmer, focused, and ready to explain what they learned.
              </p>
            </div>

            <div className="space-y-3">
              {offlineBreakIdeas.map((idea, index) => (
                <div key={idea} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Break step {index + 1}</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{idea}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowBreakCoach(false)}
                className="flex-1 rounded-2xl bg-sky-600 px-5 py-3 font-black text-white shadow-lg hover:bg-sky-700"
              >
                I Took a Break
              </button>
              <button
                onClick={() => {
                  playPop();
                  onEnterRoom(mission.room, mission.id);
                  setShowBreakCoach(false);
                }}
                className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-black text-slate-700 hover:bg-slate-200"
              >
                Continue Mission
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-400/60 to-transparent pointer-events-none" />
    </div>
  );
};
