import React, { useState } from 'react';
import { RoomType, UserProgress } from '../types';
import {
  Trophy, PawPrint, Settings, LayoutDashboard, PlayCircle, BookOpen,
  Clock, Target, CheckCircle2, MapPin,
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
  const mission = getDailyMission(progress);
  const weeklyPlan = getWeeklyLearningPlan(progress);
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

  const roomDetails: Record<RoomType, { land: string; action: string; detail: string; scene: string; glow: string }> = {
    [RoomType.HUB]: { land: 'hub', action: 'Choose a path', detail: 'Start learning', scene: '🏠', glow: 'bg-white/20' },
    [RoomType.MATH]: { land: 'mountain', action: 'Climb numbers', detail: 'Counting, facts, word problems', scene: '▲ ▲ ▲', glow: 'bg-sky-200/30' },
    [RoomType.READING]: { land: 'river', action: 'Sail through words', detail: 'Phonics, sight words, fluency', scene: '~~~~', glow: 'bg-amber-200/30' },
    [RoomType.SCIENCE]: { land: 'springs', action: 'Try experiments', detail: 'Observe, predict, explain', scene: '○ ○ ○', glow: 'bg-emerald-200/30' },
    [RoomType.GEOGRAPHY]: { land: 'globe', action: 'Explore places', detail: 'Maps, flags, landmarks', scene: '◎', glow: 'bg-cyan-200/30' },
    [RoomType.CODING]: { land: 'castle', action: 'Command robots', detail: 'Sequences, loops, debugging', scene: '▥ ▣ ▥', glow: 'bg-violet-200/30' },
    [RoomType.ART]: { land: 'garden', action: 'Create a masterpiece', detail: 'Color, shape, design', scene: '✿ ✿ ✿', glow: 'bg-pink-200/30' },
    [RoomType.MUSIC]: { land: 'music', action: 'Build rhythms', detail: 'Pitch, patterns, beats', scene: '♪ ♫ ♪', glow: 'bg-fuchsia-200/30' },
    [RoomType.LANGUAGE]: { land: 'lanterns', action: 'Say new words', detail: 'Spanish, French, Mandarin', scene: '▢ ▢ ▢', glow: 'bg-rose-200/30' },
    [RoomType.PUZZLE]: { land: 'pier', action: 'Solve challenges', detail: 'Memory, logic, strategy', scene: '▣ ▢ ▣', glow: 'bg-teal-200/30' },
    [RoomType.STORYBOOK]: { land: 'treehouse', action: 'Read adventures', detail: 'Stories, morals, comprehension', scene: '♧ ▤ ♧', glow: 'bg-yellow-200/30' },
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
              onClick={() => { playPop(); onEnterRoom(RoomType.STORYBOOK); }}
              className="bg-amber-50/95 rounded-[24px] p-4 shadow-lg border-4 border-white/60 text-left hover:scale-[1.02] transition"
            >
              <BookOpen className="text-amber-600 mb-2" />
              <p className="font-black text-amber-900">Story Time</p>
              <p className="text-sm text-amber-800/80">Read, listen, and build comprehension.</p>
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
                      <span className={`${room.featured ? 'text-5xl' : 'text-3xl'} font-black tracking-[0.25em] text-white/85 drop-shadow-sm`}>{details.scene}</span>
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

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-400/60 to-transparent pointer-events-none" />
    </div>
  );
};
