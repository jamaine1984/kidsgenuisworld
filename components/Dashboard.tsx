import React from 'react';
import { UserProgress, STICKER_COLLECTION } from '../types';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, onBack }) => {
  const stickersForNextLevel = progress.currentLevel * 5;
  const percent = Math.min(100, (progress.stickers.length / stickersForNextLevel) * 100);
  const subjectCards = [
    { label: 'Math Mountain', value: progress.mathScore, emoji: '🔢', color: 'from-indigo-400 to-blue-500', helper: 'Problems solved' },
    { label: 'Reading River', value: progress.readingScore, emoji: '📚', color: 'from-orange-400 to-amber-500', helper: 'Words explored' },
    { label: 'Science Sparks', value: progress.scienceScore, emoji: '🔬', color: 'from-emerald-400 to-teal-500', helper: 'Experiments finished' },
    { label: 'World Wonders', value: progress.geographyScore, emoji: '🌍', color: 'from-cyan-400 to-blue-500', helper: 'Places learned' },
    { label: 'Code Quest', value: progress.codingScore, emoji: '💻', color: 'from-violet-400 to-purple-500', helper: 'Puzzles solved' },
    { label: 'Language Lanterns', value: progress.languageScore, emoji: '🗣️', color: 'from-rose-400 to-pink-500', helper: 'Words learned' },
  ];

  return (
    <div className="w-full h-full bg-[linear-gradient(180deg,#bce7ff_0%,#fef3c7_45%,#fde68a_100%)] flex flex-col overflow-y-auto overflow-x-hidden kid-scroll" style={{ maxHeight: '100vh' }}>
      <header className="bg-white/85 backdrop-blur-sm p-4 shadow-sm flex items-center gap-4 sticky top-0 z-30">
        <button onClick={onBack} className="p-3 bg-white rounded-full hover:bg-gray-100 border-4 border-sky-100 shadow">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Adventure Journal</h1>
      </header>

      <div className="px-4 py-5 md:p-8 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 rounded-[28px] md:rounded-[36px] p-5 md:p-8 text-white shadow-xl mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-stretch gap-5 md:gap-6">
          <div className="w-full min-w-0">
            <div className="text-cyan-50 font-black uppercase tracking-[0.25em] mb-2 text-sm">Today&apos;s Hero</div>
            <h2 className="text-3xl md:text-5xl font-black mb-2 break-words">{progress.currentGrade}</h2>
            <div className="text-lg md:text-xl opacity-95">Level {progress.currentLevel} Explorer</div>
            <div className="mt-4 max-w-md">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Road to next level</span>
                <span>{progress.stickers.length}/{stickersForNextLevel}</span>
              </div>
              <div className="h-4 bg-white/25 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-300 rounded-full" style={{ width: `${percent}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full lg:w-auto lg:min-w-[320px]">
            <div className="bg-white/20 p-4 md:p-6 rounded-2xl backdrop-blur-md text-center min-w-0">
              <div className="text-3xl md:text-4xl font-black">{progress.stickers.length}</div>
              <div className="text-sm uppercase font-black">Stars</div>
            </div>
            <div className="bg-white/20 p-4 md:p-6 rounded-2xl backdrop-blur-md text-center min-w-0">
              <div className="text-3xl md:text-4xl font-black">{progress.achievements.length}</div>
              <div className="text-sm uppercase font-black">Badges</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {subjectCards.map(card => (
            <div key={card.label} className={`bg-gradient-to-br ${card.color} p-5 md:p-6 rounded-[26px] md:rounded-[30px] shadow-lg text-white border-4 border-white/50`}>
              <div className="flex items-center justify-between mb-5 md:mb-6 gap-3">
                <div>
                  <h4 className="font-black text-lg md:text-xl">{card.label}</h4>
                  <p className="text-white/80 text-sm font-bold">{card.helper}</p>
                </div>
                <div className="text-4xl md:text-5xl shrink-0">{card.emoji}</div>
              </div>
              <div className="text-4xl md:text-5xl font-black">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white p-5 md:p-8 rounded-[28px] md:rounded-[36px] shadow-md border-8 border-yellow-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 md:px-6 py-2 rounded-bl-3xl font-black uppercase tracking-widest text-xs md:text-sm">
            Treasure Shelf
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-4 flex items-center gap-3 pr-24">
            <BookOpen className="text-yellow-500" size={32} /> My Stickers
          </h3>
          <p className="text-slate-500 font-semibold mb-8">Each star on this shelf shows something amazing you collected on your adventure.</p>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
            {STICKER_COLLECTION.map((sticker, i) => {
              const isUnlocked = progress.stickers.includes(sticker);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-3xl shadow-inner border-2 relative group ${isUnlocked ? 'bg-white border-yellow-200' : 'bg-gray-100 border-gray-200 grayscale opacity-50'}`}
                >
                  <span className={`transform transition-transform group-hover:scale-125 ${isUnlocked ? 'opacity-100' : 'opacity-20 blur-[1px]'}`}>
                    {sticker}
                  </span>
                  <div className="absolute top-1 left-1 text-[8px] text-gray-400 font-mono">{i + 1}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm font-bold">
            Collect all {STICKER_COLLECTION.length} stickers by playing games!
          </div>
        </div>
      </div>
    </div>
  );
};
