import React from 'react';
import { UserProgress, STICKER_COLLECTION } from '../types';
import { ArrowLeft, Trophy, Star, Award, BookOpen } from 'lucide-react';

interface DashboardProps {
  progress: UserProgress;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ progress, onBack }) => {
  
  const stickersForNextLevel = progress.currentLevel * 5;
  const percent = Math.min(100, (progress.stickers.length / stickersForNextLevel) * 100);

  return (
    <div className="w-full h-full bg-slate-100 flex flex-col overflow-y-auto overflow-x-hidden kid-scroll" style={{ maxHeight: '100vh' }}>
       <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-30">
           <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
               <ArrowLeft className="text-gray-600" />
           </button>
           <h1 className="text-2xl font-bold text-slate-800">My Learning Dashboard</h1>
       </header>

       <div className="p-8 max-w-6xl mx-auto w-full">
           
           <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center">
               <div>
                   <div className="text-blue-100 font-bold uppercase tracking-widest mb-2">Current Status</div>
                   <h2 className="text-5xl font-bold mb-2">{progress.currentGrade}</h2>
                   <div className="text-xl opacity-90">Level {progress.currentLevel} Scholar</div>
               </div>
               <div className="mt-6 md:mt-0 bg-white/20 p-6 rounded-2xl backdrop-blur-md text-center">
                   <div className="text-4xl font-bold">{progress.stickers.length}</div>
                   <div className="text-sm uppercase font-bold">Total Stickers</div>
               </div>
           </div>

           {/* Grid Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-indigo-400">
                   <div className="flex items-center gap-3 mb-4">
                       <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><Trophy /></div>
                       <h4 className="font-bold text-lg">Math Genius</h4>
                   </div>
                   <div className="text-3xl font-bold text-gray-800">{progress.mathScore}</div>
                   <div className="text-gray-400 text-xs">Problems Solved</div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-orange-400">
                   <div className="flex items-center gap-3 mb-4">
                       <div className="p-3 bg-orange-100 rounded-xl text-orange-600"><Star /></div>
                       <h4 className="font-bold text-lg">Reading Star</h4>
                   </div>
                   <div className="text-3xl font-bold text-gray-800">{progress.readingScore}</div>
                   <div className="text-gray-400 text-xs">Words Mastered</div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-teal-400">
                   <div className="flex items-center gap-3 mb-4">
                       <div className="p-3 bg-teal-100 rounded-xl text-teal-600"><Award /></div>
                       <h4 className="font-bold text-lg">Puzzle Master</h4>
                   </div>
                   <div className="text-3xl font-bold text-gray-800">Level {progress.currentLevel}</div>
                   <div className="text-gray-400 text-xs">Current Challenge</div>
               </div>
           </div>

           {/* STICKER BOOK */}
           <div className="bg-white p-8 rounded-3xl shadow-md border-8 border-yellow-400 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-bl-3xl font-bold uppercase tracking-widest">
                   Official Collector's Book
               </div>
               <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                   <BookOpen className="text-yellow-500" size={32} /> My Stickers
               </h3>
               
               <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                   {STICKER_COLLECTION.map((sticker, i) => {
                       const isUnlocked = progress.stickers.includes(sticker);
                       const count = progress.stickers.filter(s => s === sticker).length; // Logic if we stored duplicates, but simple check works
                       
                       return (
                           <div 
                                key={i} 
                                className={`
                                    aspect-square rounded-xl flex flex-col items-center justify-center text-3xl shadow-inner border-2 relative group
                                    ${isUnlocked ? 'bg-white border-yellow-200' : 'bg-gray-100 border-gray-200 grayscale opacity-50'}
                                `}
                           >
                               <span className={`transform transition-transform group-hover:scale-125 ${isUnlocked ? 'opacity-100' : 'opacity-20 blur-[1px]'}`}>
                                   {sticker}
                               </span>
                               <div className="absolute top-1 left-1 text-[8px] text-gray-400 font-mono">{i + 1}</div>
                           </div>
                       );
                   })}
               </div>
               
               <div className="mt-8 text-center text-gray-400 text-sm">
                   Collect all {STICKER_COLLECTION.length} stickers by playing games!
               </div>
           </div>

       </div>
    </div>
  );
};
