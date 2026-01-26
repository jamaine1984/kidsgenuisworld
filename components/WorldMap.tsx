import React, { useState } from 'react';
import { RoomType, UserProgress } from '../types';
import {
  Calculator, BookOpen, Palette, Music, Puzzle, TreePine, LayoutDashboard,
  FlaskConical, Globe2, Code, Languages, Trophy, PawPrint, Settings, Library
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
    // Top Row
    { type: RoomType.MATH, name: "Math Lab", color: "from-indigo-500 to-blue-600", icon: Calculator, emoji: "🔢" },
    { type: RoomType.READING, name: "Library", color: "from-orange-500 to-amber-600", icon: BookOpen, emoji: "📚" },
    { type: RoomType.SCIENCE, name: "Science Lab", color: "from-emerald-500 to-teal-600", icon: FlaskConical, emoji: "🔬" },

    // Middle Row
    { type: RoomType.GEOGRAPHY, name: "World Globe", color: "from-cyan-500 to-blue-600", icon: Globe2, emoji: "🌍" },
    { type: RoomType.PLAYGROUND, name: "Playground", color: "from-green-500 to-lime-600", icon: TreePine, emoji: "🎪", featured: true },
    { type: RoomType.CODING, name: "Code Corner", color: "from-violet-500 to-purple-600", icon: Code, emoji: "💻" },

    // Bottom Row
    { type: RoomType.ART, name: "Art Studio", color: "from-pink-500 to-rose-600", icon: Palette, emoji: "🎨" },
    { type: RoomType.MUSIC, name: "Music Hall", color: "from-purple-500 to-fuchsia-600", icon: Music, emoji: "🎵" },
    { type: RoomType.LANGUAGE, name: "Language Lab", color: "from-rose-500 to-red-600", icon: Languages, emoji: "🗣️" },
    { type: RoomType.PUZZLE, name: "Puzzle Room", color: "from-teal-500 to-cyan-600", icon: Puzzle, emoji: "🧩" },
    { type: RoomType.STORYBOOK, name: "Story Time", color: "from-amber-500 to-yellow-600", icon: Library, emoji: "📖" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 overflow-hidden relative">
      {/* Sky Decorations */}
      <div className="absolute top-5 left-[10%] text-5xl opacity-60 animate-float">☁️</div>
      <div className="absolute top-10 right-[15%] text-6xl opacity-50 animate-float-delayed">☁️</div>
      <div className="absolute top-20 left-[30%] text-4xl opacity-40 animate-float">☁️</div>
      <div className="absolute top-8 right-[40%] text-5xl opacity-50 animate-float-delayed">🌤️</div>

      {/* Sun */}
      <div className="absolute top-5 right-10 text-7xl animate-pulse">☀️</div>

      {/* Rainbow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-4xl opacity-30">🌈</div>

      {/* HUD - Top Bar */}
      <div className="relative z-20 p-3 flex justify-between items-start">
        {/* Player Info */}
        <div className="bg-white/95 p-3 rounded-2xl shadow-lg backdrop-blur-sm flex items-center gap-3">
          <div className="text-3xl">
            {progress.pet ? (progress.pet.type === 'dog' ? '🐶' : progress.pet.type === 'cat' ? '🐱' : '🐰') : '👤'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-sky-600">Kid Genius World</h1>
            <div className="text-xs text-gray-500 font-semibold">{progress.currentGrade} • Level {progress.currentLevel}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                ⭐ {progress.stickers.length}
              </span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                🏆 {progress.achievements?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {progress.pet && (
            <button
              onClick={() => { playPop(); onOpenPet(); }}
              className="bg-pink-400 hover:bg-pink-300 text-white p-3 rounded-xl shadow-lg transition-transform hover:scale-110"
              title="My Pet"
            >
              <PawPrint size={24} />
            </button>
          )}
          <button
            onClick={() => { playPop(); onOpenAchievements(); }}
            className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 p-3 rounded-xl shadow-lg transition-transform hover:scale-110"
            title="Achievements"
          >
            <Trophy size={24} />
          </button>
          <button
            onClick={() => { playPop(); onOpenDashboard(); }}
            className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-xl shadow-lg transition-transform hover:scale-110"
            title="Dashboard"
          >
            <LayoutDashboard size={24} />
          </button>
          <button
            onClick={() => { playPop(); onOpenSettings(); }}
            className="bg-gray-200 hover:bg-gray-100 text-gray-600 p-3 rounded-xl shadow-lg transition-transform hover:scale-110"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* World Map Grid */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 max-w-4xl w-full">
          {rooms.map((room) => (
            <button
              key={room.type}
              onClick={() => { playPop(); onEnterRoom(room.type); }}
              onMouseEnter={() => setHoveredRoom(room.type)}
              onMouseLeave={() => setHoveredRoom(null)}
              className={`
                relative group
                ${room.featured ? 'col-span-2 row-span-2' : ''}
              `}
            >
              {/* Building Card */}
              <div className={`
                bg-gradient-to-br ${room.color}
                rounded-2xl shadow-lg
                p-4 flex flex-col items-center justify-center
                transform transition-all duration-200
                group-hover:scale-105 group-hover:-translate-y-2
                group-hover:shadow-xl
                border-4 border-white/30
                ${room.featured ? 'h-full min-h-[180px]' : 'aspect-square'}
              `}>
                {/* Emoji Icon */}
                <span className={`${room.featured ? 'text-6xl' : 'text-4xl'} mb-2 drop-shadow-lg`}>
                  {room.emoji}
                </span>

                {/* Room Name */}
                <span className={`font-bold text-white drop-shadow ${room.featured ? 'text-lg' : 'text-xs'} text-center`}>
                  {room.name}
                </span>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Ground Shadow */}
              <div className={`
                mx-auto mt-2 bg-black/20 rounded-full blur-sm transition-all
                group-hover:scale-75 group-hover:opacity-50
                ${room.featured ? 'w-32 h-4' : 'w-16 h-3'}
              `} />

              {/* Tooltip on Hover */}
              {hoveredRoom === room.type && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap z-30 animate-fade-in">
                  Enter {room.name}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ground Decorations */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-400/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-2 left-10 text-4xl">🌸</div>
      <div className="absolute bottom-4 left-1/4 text-3xl">🌷</div>
      <div className="absolute bottom-2 right-20 text-4xl">🌺</div>
      <div className="absolute bottom-4 right-1/4 text-3xl">🌻</div>

      {/* Walking Path */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 opacity-40">
        <div className="w-8 h-8 bg-amber-300 rounded-full" />
        <div className="w-8 h-8 bg-amber-300 rounded-full" />
        <div className="w-8 h-8 bg-amber-300 rounded-full" />
        <div className="w-8 h-8 bg-amber-300 rounded-full" />
        <div className="w-8 h-8 bg-amber-300 rounded-full" />
      </div>
    </div>
  );
};
