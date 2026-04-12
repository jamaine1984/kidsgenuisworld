import React, { useState } from 'react';
import { RoomType, UserProgress } from '../types';
import {
  Trophy, PawPrint, Settings, LayoutDashboard,
} from 'lucide-react';
import { playPop } from '../services/audioService';

interface WorldMapProps {
  onEnterRoom: (room: RoomType) => void;
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

  const rooms = [
    { type: RoomType.MATH, name: 'Math Mountain', emoji: '🔢', color: 'from-indigo-500 to-blue-600' },
    { type: RoomType.READING, name: 'Reading River', emoji: '📚', color: 'from-orange-500 to-amber-500' },
    { type: RoomType.SCIENCE, name: 'Science Springs', emoji: '🔬', color: 'from-emerald-500 to-teal-500' },
    { type: RoomType.GEOGRAPHY, name: 'World Wonders', emoji: '🌍', color: 'from-cyan-500 to-blue-500' },
    { type: RoomType.PLAYGROUND, name: 'Play Park', emoji: '🎪', color: 'from-green-500 to-lime-500', featured: true },
    { type: RoomType.CODING, name: 'Code Castle', emoji: '💻', color: 'from-violet-500 to-purple-600' },
    { type: RoomType.ART, name: 'Art Garden', emoji: '🎨', color: 'from-pink-500 to-rose-500' },
    { type: RoomType.MUSIC, name: 'Music Meadow', emoji: '🎵', color: 'from-fuchsia-500 to-purple-500' },
    { type: RoomType.LANGUAGE, name: 'Language Lanterns', emoji: '🗣️', color: 'from-rose-500 to-red-500' },
    { type: RoomType.PUZZLE, name: 'Puzzle Pier', emoji: '🧩', color: 'from-teal-500 to-cyan-500' },
    { type: RoomType.STORYBOOK, name: 'Story Treehouse', emoji: '📖', color: 'from-amber-500 to-yellow-500' },
  ];

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
              <span className="bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-black">🎯 Pick your next mission</span>
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

      <div className="relative z-10 px-4 mt-2">
        <div className="bg-white/75 backdrop-blur-sm rounded-[30px] px-5 py-3 shadow-lg border-4 border-white/50 max-w-max mx-auto">
          <p className="text-center text-sky-800 font-black tracking-wide">Choose a magical place to learn next</p>
        </div>
      </div>

      <div className="relative z-10 p-4 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-5xl w-full">
          {rooms.map((room) => (
            <button
              key={room.type}
              onClick={() => { playPop(); onEnterRoom(room.type); }}
              onMouseEnter={() => setHoveredRoom(room.type)}
              onMouseLeave={() => setHoveredRoom(null)}
              className={`${room.featured ? 'sm:col-span-2 sm:row-span-2' : ''} relative group`}
            >
              <div className={`bg-gradient-to-br ${room.color} rounded-[28px] shadow-xl p-5 flex flex-col items-center justify-center border-4 border-white/40 transform transition-all duration-200 group-hover:scale-105 group-hover:-translate-y-2 ${room.featured ? 'min-h-[220px]' : 'aspect-[1/1.05]'}`}>
                <span className={`${room.featured ? 'text-7xl' : 'text-5xl'} mb-3 drop-shadow-lg`}>{room.emoji}</span>
                <span className={`${room.featured ? 'text-xl' : 'text-sm'} text-center text-white font-black drop-shadow`}>{room.name}</span>
                <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/85 font-bold">Tap To Enter</span>
                <div className="absolute inset-0 rounded-[28px] bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className={`${room.featured ? 'w-32 h-4' : 'w-16 h-3'} mx-auto mt-2 bg-black/20 rounded-full blur-sm transition-all group-hover:scale-75 group-hover:opacity-50`} />

              {hoveredRoom === room.type && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap z-30 animate-fade-in">
                  Enter {room.name}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-400/60 to-transparent pointer-events-none" />
    </div>
  );
};
