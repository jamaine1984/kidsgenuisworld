import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Disc, Piano, Speaker } from 'lucide-react';
import { playNote, playSuccess, playError, playPop, speakAsync } from '../services/audioService';

interface MusicRoomProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  level: number;
}

const MUSIC_MISSIONS = [
  { gradeLevel: 1, title: 'Sound Explorer', noteGoal: 5, loopGoal: 2, prompt: 'Play high and low sounds.' },
  { gradeLevel: 2, title: 'Beat Builder', noteGoal: 6, loopGoal: 2, prompt: 'Make a steady beat and repeat it.' },
  { gradeLevel: 3, title: 'Melody Maker', noteGoal: 7, loopGoal: 3, prompt: 'Use notes that move up and down.' },
  { gradeLevel: 4, title: 'Rhythm Mixer', noteGoal: 8, loopGoal: 3, prompt: 'Combine a beat with a short melody.' },
  { gradeLevel: 5, title: 'Mood Composer', noteGoal: 9, loopGoal: 3, prompt: 'Make the music sound happy, calm, or exciting.' },
  { gradeLevel: 6, title: 'Layered Arrangement', noteGoal: 10, loopGoal: 4, prompt: 'Layer rhythm and melody with control.' },
  { gradeLevel: 7, title: 'Performance Take', noteGoal: 12, loopGoal: 4, prompt: 'Build a short performance with a beginning and ending.' },
  { gradeLevel: 1, title: 'Echo Notes', noteGoal: 5, loopGoal: 1, prompt: 'Play one note, then play it again like an echo.' },
  { gradeLevel: 2, title: 'Two-Note Song', noteGoal: 6, loopGoal: 2, prompt: 'Make a tiny song using only two different notes.' },
  { gradeLevel: 3, title: 'Question and Answer', noteGoal: 8, loopGoal: 2, prompt: 'Play a short musical question, then answer with different notes.' },
  { gradeLevel: 4, title: 'Beat Pattern Lab', noteGoal: 8, loopGoal: 3, prompt: 'Create a rhythm pattern that repeats at least three times.' },
  { gradeLevel: 5, title: 'Major Mood', noteGoal: 10, loopGoal: 3, prompt: 'Use brighter note choices to make a confident musical mood.' },
  { gradeLevel: 6, title: 'Call and Response', noteGoal: 11, loopGoal: 4, prompt: 'Build two phrases that sound like they are talking to each other.' },
  { gradeLevel: 7, title: 'Theme Variation', noteGoal: 13, loopGoal: 4, prompt: 'Create one theme, then change the ending to make a variation.' },
];

const MUSIC_EXPANSION_THEMES = [
  'animal parade', 'rainy day', 'rocket launch', 'sleepy song', 'school bell',
  'ocean waves', 'robot dance', 'friendship theme', 'jungle walk', 'city lights',
  'mountain echo', 'garden breeze', 'sports chant', 'story intro', 'celebration',
  'quiet focus', 'mystery path', 'sunrise', 'train ride', 'hero theme',
];

const EXPANDED_MUSIC_MISSIONS = MUSIC_EXPANSION_THEMES.flatMap((theme, themeIndex) =>
  Array.from({ length: 7 }, (_, gradeIndex) => Array.from({ length: 2 }, (_, variantIndex) => {
    const gradeLevel = gradeIndex + 1;
    return {
      gradeLevel,
      title: `${theme.replace(/^\w/, letter => letter.toUpperCase())} Music ${variantIndex + 1}`,
      noteGoal: 5 + gradeLevel + (themeIndex % 3) + variantIndex,
      loopGoal: Math.min(5, 1 + Math.ceil(gradeLevel / 2)),
      prompt: gradeLevel <= 2
        ? `Make a ${theme} sound using high notes, low notes, and one repeated beat.`
        : gradeLevel <= 4
          ? `Build a ${theme} pattern with a steady beat and a short melody answer.`
          : `Compose a ${theme} performance with layers, contrast, and a clear ending.`,
    };
  })).flat()
);

const ALL_MUSIC_MISSIONS = [...MUSIC_MISSIONS, ...EXPANDED_MUSIC_MISSIONS];

export const MusicRoom: React.FC<MusicRoomProps> = ({ onBack, onReward, level }) => {
  const [tab, setTab] = useState<'PIANO' | 'DJ'>('PIANO');
  const [instrument, setInstrument] = useState<'PIANO' | 'SYNTH' | '8BIT'>('PIANO');
  const [notesPlayed, setNotesPlayed] = useState(0);
  const [loopsTried, setLoopsTried] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionRound, setSessionRound] = useState(0);
  const [teacherFeedback, setTeacherFeedback] = useState('Play notes or loops until the mission board says ready. Then finish the music mission for a teacher check.');
  
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
  const missionPool = ALL_MUSIC_MISSIONS.filter(item => item.gradeLevel <= Math.min(Math.max(level, 1), 7));
  const mission = missionPool[(new Date().getDate() + sessionRound) % missionPool.length] || ALL_MUSIC_MISSIONS[0];

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
      setNotesPlayed(count => {
        const next = count + 1;
        if (next === mission.noteGoal) {
          setTeacherFeedback(`Teacher Check: melody goal reached. You played ${next} notes for ${mission.title}.`);
        }
        return next;
      });
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
          setLoopsTried(count => {
            const next = count + 1;
            if (next === mission.loopGoal) {
              setTeacherFeedback(`Teacher Check: rhythm goal reached. You tried ${next} loops for ${mission.title}.`);
            }
            return next;
          });
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

  const hasFinishedPattern = notesPlayed >= mission.noteGoal || loopsTried >= mission.loopGoal;

  const completeMusicMission = () => {
      if (!hasFinishedPattern || isComplete) return;
      setIsComplete(true);
      playSuccess();
      const feedback = `Teacher Check: music mission complete. You used ${notesPlayed} notes and ${loopsTried} loops. Next, try a new sound pattern with a clear beginning, middle, and ending.`;
      setTeacherFeedback(feedback);
      void speakAsync(feedback, 0.86, 1.02);
      onReward({
        questionId: `music-${mission.gradeLevel}-${mission.title}`,
        skill: tab === 'PIANO' ? 'melody and pitch' : 'rhythm and loops',
        prompt: mission.prompt,
        selectedAnswer: `${notesPlayed} notes, ${loopsTried} loops`,
        correctAnswer: `${mission.noteGoal} notes or ${mission.loopGoal} loops`,
      });
      loopRefs.current.forEach(clearInterval);
      loopRefs.current.clear();
      window.setTimeout(() => {
        setNotesPlayed(0);
        setLoopsTried(0);
        setActiveLoops([]);
        setIsComplete(false);
        setSessionRound(round => round + 1);
        const nextFeedback = 'Next music round is ready. Play a new pattern so you can keep moving toward six saved practice rounds.';
        setTeacherFeedback(nextFeedback);
        void speakAsync(nextFeedback, 0.86, 1.02);
      }, 1200);
  };

  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,#7c3aed_0,#4c1d95_48%,#111827_100%)] flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,.35)_0_2px,transparent_3px),radial-gradient(circle_at_70%_35%,rgba(255,255,255,.25)_0_2px,transparent_3px),radial-gradient(circle_at_40%_75%,rgba(255,255,255,.2)_0_2px,transparent_3px)]"></div>
      <div className="absolute bottom-0 left-0 w-32 h-96 bg-yellow-400 opacity-20 blur-2xl transform rotate-12 origin-bottom"></div>
      <div className="absolute bottom-0 right-0 w-32 h-96 bg-blue-400 opacity-20 blur-2xl transform -rotate-12 origin-bottom"></div>

      <header className="w-full p-4 flex justify-between items-center z-20 absolute top-0">
        <button onClick={onBack} aria-label="Back to world map" className="bg-white p-3 rounded-full">
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

        <button
          onClick={completeMusicMission}
          disabled={!hasFinishedPattern || isComplete}
          className={`p-3 rounded-full shadow-lg ${hasFinishedPattern && !isComplete ? 'bg-emerald-400 text-emerald-950' : 'bg-white/30 text-white/50'}`}
          title="Complete music mission"
        >
          <CheckCircle2 />
        </button>
      </header>

      <div className="absolute left-1/2 top-24 z-10 w-[min(92vw,760px)] -translate-x-1/2 rounded-2xl bg-white/12 p-4 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
        <div className="text-center text-xs font-black uppercase tracking-[0.24em] text-fuchsia-100">Music Mission Board</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['Explore Sound', `${notesPlayed}/${mission.noteGoal} notes`],
            ['Build Rhythm', `${loopsTried}/${mission.loopGoal} loops`],
            ['Finish', hasFinishedPattern ? 'Ready' : 'Keep playing'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl bg-white/15 p-3 text-center ring-1 ring-white/15">
              <div className="text-sm font-black">{title}</div>
              <div className="text-xs font-semibold text-white/75">{copy}</div>
            </div>
          ))}
        </div>
        <div className={`mt-3 rounded-xl px-4 py-3 text-sm font-bold ${isComplete ? 'bg-emerald-400/90 text-emerald-950' : hasFinishedPattern ? 'bg-yellow-300/90 text-yellow-950' : 'bg-white/15 text-white'}`}>
          {teacherFeedback}
        </div>
      </div>

      {/* PIANO MODE */}
      {tab === 'PIANO' && (
        <div className="flex flex-col items-center justify-center w-full h-full pt-44">
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
            <p className="z-10 mb-5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white">
              {mission.title}: {mission.prompt}
            </p>

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
          <div className="flex flex-col items-center justify-center w-full h-full pt-44 z-10">
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
