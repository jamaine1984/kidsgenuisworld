import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Music, PlayCircle, Repeat, Disc, Speaker, Mic2, Piano } from 'lucide-react';
import { playNote, playSuccess, playError, playPop } from '../services/audioService';

interface MusicRoomProps {
  onBack: () => void;
}

export const MusicRoom: React.FC<MusicRoomProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'PIANO' | 'DJ'>('PIANO');
  const [instrument, setInstrument] = useState<'PIANO' | 'SYNTH' | '8BIT'>('PIANO');
  
  // DJ State
  const [activeLoops, setActiveLoops] = useState<number[]>([]);
  const loopRefs = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  // Piano State
  const [activeNote, setActiveNote] = useState<number | null>(null);

  const notes = [
    { id: 0, note: 'C', freq: 261.63, color: 'bg-red-500', border: 'border-red-700' },
    { id: 1, note: 'D', freq: 293.66, color: 'bg-orange-500', border: 'border-orange-700' },
    { id: 2, note: 'E', freq: 329.63, color: 'bg-yellow-500', border: 'border-yellow-700' },
    { id: 3, note: 'F', freq: 349.23, color: 'bg-green-500', border: 'border-green-700' },
    { id: 4, note: 'G', freq: 392.00, color: 'bg-teal-500', border: 'border-teal-700' },
    { id: 5, note: 'A', freq: 440.00, color: 'bg-blue-500', border: 'border-blue-700' },
    { id: 6, note: 'B', freq: 493.88, color: 'bg-indigo-500', border: 'border-indigo-700' },
    { id: 7, note: 'C2', freq: 523.25, color: 'bg-purple-500', border: 'border-purple-700' },
  ];

  const djPads = [
      { id: 1, name: 'Kick', freq: 100, type: 'square', pattern: 500 },
      { id: 2, name: 'Snare', freq: 200, type: 'sawtooth', pattern: 1000 },
      { id: 3, name: 'HiHat', freq: 800, type: 'triangle', pattern: 250 },
      { id: 4, name: 'Bass', freq: 60, type: 'sine', pattern: 2000 },
  ];

  const getOscType = (): OscillatorType => {
      if (instrument === 'SYNTH') return 'sawtooth';
      if (instrument === '8BIT') return 'square';
      return 'triangle'; // Piano-ish
  };

  const handleNoteClick = (id: number) => {
      setActiveNote(id);
      playNote(notes[id].freq, getOscType(), 0.5);
      setTimeout(() => setActiveNote(null), 200);
  };

  const toggleLoop = (padId: number) => {
      playPop();
      if (activeLoops.includes(padId)) {
          // Stop
          setActiveLoops(prev => prev.filter(id => id !== padId));
          const interval = loopRefs.current.get(padId);
          if (interval) clearInterval(interval);
          loopRefs.current.delete(padId);
      } else {
          // Start
          setActiveLoops(prev => [...prev, padId]);
          const pad = djPads.find(p => p.id === padId);
          if (pad) {
             // Play immediately
             playNote(pad.freq, pad.type as OscillatorType, 0.1);
             // Loop
             const interval = setInterval(() => {
                 playNote(pad.freq, pad.type as OscillatorType, 0.1);
             }, pad.pattern);
             loopRefs.current.set(padId, interval);
          }
      }
  };

  // Cleanup
  useEffect(() => {
      return () => {
          loopRefs.current.forEach(clearInterval);
      };
  }, []);

  return (
    <div className="h-full w-full bg-purple-900 flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-32 h-96 bg-yellow-400 opacity-20 blur-2xl transform rotate-12 origin-bottom"></div>
      <div className="absolute bottom-0 right-0 w-32 h-96 bg-blue-400 opacity-20 blur-2xl transform -rotate-12 origin-bottom"></div>

      <header className="w-full p-4 flex justify-between items-center z-20 absolute top-0">
        <button onClick={onBack} className="bg-white p-3 rounded-full">
            <ArrowLeft className="text-purple-900" />
        </button>
        
        <div className="flex gap-2 bg-black/40 p-1 rounded-full backdrop-blur-md">
            <button 
                onClick={() => setTab('PIANO')}
                className={`px-4 py-2 rounded-full font-bold flex gap-2 ${tab === 'PIANO' ? 'bg-purple-500 text-white' : 'text-white/70'}`}
            >
                <Piano size={18} /> Piano
            </button>
            <button 
                onClick={() => setTab('DJ')}
                className={`px-4 py-2 rounded-full font-bold flex gap-2 ${tab === 'DJ' ? 'bg-pink-500 text-white' : 'text-white/70'}`}
            >
                <Disc size={18} /> DJ Booth
            </button>
        </div>
      </header>

      {/* PIANO MODE */}
      {tab === 'PIANO' && (
        <div className="flex flex-col items-center justify-center w-full h-full pt-20">
            {/* Instrument Switcher */}
            <div className="flex gap-4 mb-10 z-10">
                {(['PIANO', 'SYNTH', '8BIT'] as const).map(inst => (
                    <button
                        key={inst}
                        onClick={() => setInstrument(inst)}
                        className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${instrument === inst ? 'bg-white text-purple-900 scale-110' : 'bg-purple-800 text-purple-300'}`}
                    >
                        {inst}
                    </button>
                ))}
            </div>

            <div className="flex gap-1 md:gap-3 h-64 md:h-80 items-end z-10 perspective-[1000px] w-full justify-center px-4 mb-10">
                {notes.map((n) => (
                <button
                    key={n.id}
                    onMouseDown={() => handleNoteClick(n.id)}
                    className={`
                        ${n.color} w-full max-w-[80px] rounded-b-lg rounded-t-sm
                        border-b-8 ${n.border}
                        transition-all duration-75
                        ${activeNote === n.id ? 'h-[95%] brightness-150 translate-y-2 border-b-0' : 'h-[85%] hover:h-[90%]'}
                        relative shadow-2xl group
                    `}
                >
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 font-bold text-xl group-hover:text-white">{n.note}</span>
                </button>
                ))}
            </div>
        </div>
      )}

      {/* DJ MODE */}
      {tab === 'DJ' && (
          <div className="flex flex-col items-center justify-center w-full h-full pt-20 z-10">
              <h2 className="text-white text-4xl font-bold mb-8 animate-pulse">Kid DJ Station</h2>
              <div className="grid grid-cols-2 gap-8">
                  {djPads.map(pad => (
                      <button
                        key={pad.id}
                        onClick={() => toggleLoop(pad.id)}
                        className={`
                            w-40 h-40 rounded-full border-8 flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all
                            ${activeLoops.includes(pad.id) 
                                ? 'bg-green-500 border-green-300 animate-bounce scale-105 shadow-[0_0_50px_rgba(34,197,94,0.6)]' 
                                : 'bg-gray-800 border-gray-600 hover:border-gray-400 hover:bg-gray-700'}
                        `}
                      >
                          <Speaker className="text-white" size={40} />
                          <span className="text-white font-bold uppercase tracking-wider">{pad.name}</span>
                          {activeLoops.includes(pad.id) && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
                      </button>
                  ))}
              </div>
              <p className="text-white/50 mt-8">Tap to loop beats!</p>
          </div>
      )}
      
    </div>
  );
};