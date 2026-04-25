import React, { useState } from 'react';
import { RoomType, UserProgress } from '../types';
import {
  Trophy, PawPrint, Settings, LayoutDashboard, PlayCircle, BookOpen,
  Clock, Target, CheckCircle2, MapPin, HeartPulse, Sparkles, X,
} from 'lucide-react';
import { playPop } from '../services/audioService';
import { getDailyMission, getWeeklyLearningPlan } from '../services/curriculum';

interface WorldMapProps {
  onEnterRoom: (room: RoomType, unitId?: string) => void;
  onOpenDashboard: () => void;
  onOpenAchievements: () => void;
  onOpenPet: () => void;
  onOpenSettings: () => void;
  progress: UserProgress;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  onEnterRoom,
  onOpenDashboard,
  onOpenAchievements,
  onOpenPet,
  onOpenSettings,
  progress
}) => {
  const [hoveredRoom, setHoveredRoom] = useState<RoomType | null>(null);
  const [showFocusCoach, setShowFocusCoach] = useState(false);
  const [showBreakCoach, setShowBreakCoach] = useState(false);
  const [showReviewQuest, setShowReviewQuest] = useState(false);
  const [focusStep, setFocusStep] = useState(0);
  const mission = getDailyMission(progress);
  const weeklyPlan = getWeeklyLearningPlan(progress);
  const unitPracticeCounts = progress.unitPracticeCounts || {};
  const completedUnitIds = new Set(progress.completedUnitIds || []);
  const passportStamps = [...(progress.learningJournal || [])]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);
  const passportRoomCount = new Set((progress.learningJournal || []).map(entry => entry.room)).size;
  const passportReflectionCount = (progress.learningJournal || []).filter(entry => entry.childReflection).length;
  const passportMasteryCount = (progress.learningJournal || []).filter(entry => entry.mastered).length;
  const reviewQuestItems = [...weeklyPlan]
    .sort((a, b) => {
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
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayStats = progress.dailyStats?.find(day => day.date === todayKey);
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

  const rooms: Array<{ type: RoomType; name: string; emoji: string; color: string; featured?: boolean }> = [
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

  const roomDetails: Record<RoomType, { land: string; action: string; detail: string; glow: string }> = {
    [RoomType.HUB]: { land: 'hub', action: 'Choose a path', detail: 'Start learning', glow: 'bg-white/20' },
    [RoomType.MATH]: { land: 'mountain', action: 'Climb numbers', detail: 'Counting, facts, word problems', glow: 'bg-sky-200/30' },
    [RoomType.READING]: { land: 'river', action: 'Sail through words', detail: 'Phonics, sight words, fluency', glow: 'bg-amber-200/30' },
    [RoomType.SCIENCE]: { land: 'springs', action: 'Try experiments', detail: 'Observe, predict, explain', glow: 'bg-emerald-200/30' },
    [RoomType.GEOGRAPHY]: { land: 'globe', action: 'Explore places', detail: 'Maps, flags, landmarks', glow: 'bg-cyan-200/30' },
    [RoomType.CODING]: { land: 'castle', action: 'Command robots', detail: 'Sequences, loops, debugging', glow: 'bg-violet-200/30' },
    [RoomType.ART]: { land: 'garden', action: 'Create a masterpiece', detail: 'Color, shape, design', glow: 'bg-pink-200/30' },
    [RoomType.MUSIC]: { land: 'music', action: 'Build rhythms', detail: 'Pitch, patterns, beats', glow: 'bg-fuchsia-200/30' },
    [RoomType.LANGUAGE]: { land: 'lanterns', action: 'Say new words', detail: 'Spanish, French, Mandarin', glow: 'bg-rose-200/30' },
    [RoomType.PUZZLE]: { land: 'pier', action: 'Solve challenges', detail: 'Memory, logic, strategy', glow: 'bg-teal-200/30' },
    [RoomType.STORYBOOK]: { land: 'treehouse', action: 'Read adventures', detail: 'Stories, morals, comprehension', glow: 'bg-yellow-200/30' },
  };

  const renderRoomScene = (room: RoomType) => {
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
          <button
            onClick={() => { playPop(); onOpenSettings(); }}
            className="bg-slate-200 hover:bg-slate-100 text-slate-700 p-4 rounded-2xl shadow-lg transition-transform hover:scale-110 border-b-4 border-slate-400"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="relative z-10 px-4 mt-2 max-w-6xl mx-auto">
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
                    {stamp.childReflection ? `Reflection: ${stamp.childReflection}` : `${Math.min(stamp.practiceCount, 3)}/3 practice rounds`}
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

        <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-4">
          <button
            onClick={() => { playPop(); onEnterRoom(mission.room, mission.id); }}
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
                    {reviewReadyCount > 0
                      ? `${reviewReadyCount} practiced lessons ready to explain again.`
                      : 'Start with quick explain-again lessons from this week.'}
                  </p>
                </div>
                <CheckCircle2 className="text-violet-600" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {reviewQuestItems.map(item => (
                  <span key={item.unit.id} className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-violet-700">
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
          <p className="text-sky-900 font-black bg-white/70 rounded-full px-5 py-2 inline-block shadow">Explore Learning Rooms</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-6xl mx-auto w-full">
          {rooms.map((room) => {
            const details = roomDetails[room.type];
            const isVisited = visitedRooms.has(room.type);
            const isMissionRoom = mission.room === room.type;
            const score = roomScores[room.type] || 0;

            return (
              <button
                key={room.type}
                onClick={() => { playPop(); onEnterRoom(room.type); }}
                onMouseEnter={() => setHoveredRoom(room.type)}
                onMouseLeave={() => setHoveredRoom(null)}
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
                return (
                  <div key={item.unit.id} className="rounded-2xl border border-violet-100 bg-slate-50 p-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                          {completed ? 'Mastered review' : practiceCount > 0 ? 'Practice review' : `${item.unit.reviewCycleDays} day review`}
                        </p>
                        <h3 className="mt-1 font-black text-slate-900">{item.unit.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{item.unit.successCheck}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-center">
                        <p className="text-xl font-black text-violet-700">{Math.min(practiceCount, 3)}/3</p>
                        <p className="text-xs font-bold text-slate-500">practice</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 rounded-xl bg-white p-3 text-xs font-bold text-slate-700">
                        At-home check: {item.unit.parentActivity}
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
