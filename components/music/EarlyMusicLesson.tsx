import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Ear, Music2, Pause, Play, Star, Volume2, Waves, XCircle } from 'lucide-react';
import { playNote, playSuccess, playWrongBuzzer, speakCorrect, speakMultipleChoiceQuestion, speakWrong } from '../../services/audioService';
import { EarlyMusicQuestion, generateEarlyMusicQuestion } from '../../services/curriculum/earlyMusic';
import { generateElementaryMusicQuestion } from '../../services/curriculum/elementaryMusic';
import { generateUpperElementaryMusicQuestion } from '../../services/curriculum/upperElementaryMusic';

interface EarlyMusicLessonProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
  level: number;
}

const MusicScene: React.FC<{ question: EarlyMusicQuestion; onPlay: () => void }> = ({ question, onPlay }) => {
  const audibleNotes = question.sampleNotes.filter(note => note > 0);
  const minimum = Math.min(...audibleNotes, 220);
  const maximum = Math.max(...audibleNotes, 440);
  return (
    <div data-testid="early-music-scene" className="rounded-3xl bg-gradient-to-br from-fuchsia-50 via-white to-indigo-50 p-5 ring-2 ring-fuchsia-100">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-600">Sound sample</p><p className="mt-1 font-black text-fuchsia-950">{question.musicClue}</p></div><button onClick={onPlay} aria-label="Play sound sample" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-white shadow-lg"><Play fill="currentColor" /></button></div>
      <div className="relative mt-5 h-28 overflow-hidden rounded-2xl bg-indigo-950 px-4 py-3">
        {[20, 40, 60, 80].map(top => <span key={top} className="absolute left-0 right-0 h-px bg-white/20" style={{ top }} />)}
        <div className="relative z-10 flex h-full items-center justify-center gap-3">
          {question.sampleNotes.map((note, index) => {
            if (note === 0) return <span key={index} className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-cyan-200 text-cyan-100"><Pause /></span>;
            const ratio = maximum === minimum ? 0.5 : (note - minimum) / (maximum - minimum);
            return <span key={index} className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-300 text-indigo-950 shadow" style={{ transform: `translateY(${18 - ratio * 36}px)` }}><Music2 /></span>;
          })}
        </div>
      </div>
    </div>
  );
};

export const EarlyMusicLesson: React.FC<EarlyMusicLessonProps> = ({ onBack, onReward, onAttempt, level }) => {
  const normalizedLevel = Math.max(1, Math.min(7, level)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const generateQuestion = useCallback((step: number) => {
    if (normalizedLevel === 1 || normalizedLevel === 2) return generateEarlyMusicQuestion(normalizedLevel, step);
    if (normalizedLevel === 3 || normalizedLevel === 4) return generateElementaryMusicQuestion(normalizedLevel, step);
    return generateUpperElementaryMusicQuestion(normalizedLevel, step);
  }, [normalizedLevel]);
  const [round, setRound] = useState(0); const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<EarlyMusicQuestion>(() => generateQuestion(0));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle'); const [selectedAnswer, setSelectedAnswer] = useState('');
  const sampleTimers = useRef<number[]>([]); const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSample = useCallback(() => { sampleTimers.current.forEach(timer => window.clearTimeout(timer)); sampleTimers.current = []; }, []);
  const playSample = useCallback((current: EarlyMusicQuestion) => {
    stopSample();
    current.sampleNotes.forEach((note, index) => {
      const timer = window.setTimeout(() => { if (note > 0) playNote(note, 'triangle', 0.24); }, index * current.sampleGapMs);
      sampleTimers.current.push(timer);
    });
  }, [stopSample]);
  const narrate = useCallback((current: EarlyMusicQuestion) => { void speakMultipleChoiceQuestion(current.prompt, current.options); }, []);

  useEffect(() => { narrate(question); return () => { stopSample(); if (advanceTimer.current) clearTimeout(advanceTimer.current); }; }, [narrate, question, stopSample]);
  const moveToNext = () => { const nextRound = round + 1; setRound(nextRound); setQuestion(generateQuestion(nextRound)); setFeedback('idle'); setSelectedAnswer(''); };
  const answerQuestion = (answer: string) => {
    if (feedback !== 'idle') return;
    setSelectedAnswer(answer); const correct = answer === question.answer;
    const meta = { questionId: question.id, skill: question.skill, prompt: question.prompt, selectedAnswer: answer, correctAnswer: question.answer };
    if (correct) { setFeedback('correct'); setScore(value => value + 1); playSuccess(); void speakCorrect(question.explanation); onReward(meta); if (round < 5) advanceTimer.current = setTimeout(moveToNext, 1650); return; }
    setFeedback('wrong'); playWrongBuzzer(); onAttempt?.(meta, false); void speakWrong(`The answer is ${question.answer}. ${question.explanation}`); advanceTimer.current = setTimeout(() => { setFeedback('idle'); setSelectedAnswer(''); }, 2400);
  };
  const gradeLabel = normalizedLevel === 1 ? 'Pre-K' : normalizedLevel === 2 ? 'Kindergarten' : normalizedLevel === 3 ? '1st Grade' : normalizedLevel === 4 ? '2nd Grade' : normalizedLevel === 5 ? '3rd Grade' : normalizedLevel === 6 ? '4th Grade' : '5th Grade';
  return (
    <div className="academy-room-surface academy-room-surface-dark relative flex h-full w-full flex-col overflow-auto bg-fuchsia-950 p-4 sm:p-6" style={{ '--academy-room-scene': "url('/academy/rooms/music.webp')" } as React.CSSProperties}>
      <div className="absolute inset-0 bg-indigo-950/35 backdrop-blur-[1px]" />
      <header className="relative z-10 flex items-center justify-between gap-3"><button onClick={onBack} aria-label="Back to world map" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-fuchsia-100 bg-white shadow-lg"><ArrowLeft className="text-fuchsia-700" /></button><div className="flex items-center gap-2 rounded-full border border-fuchsia-100 bg-white/95 px-4 py-2 text-sm font-black uppercase text-fuchsia-800 shadow-sm sm:px-5"><Music2 size={18} /> {gradeLabel} Music Room</div><div className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-black text-white shadow"><Star size={18} fill="currentColor" /> {score}</div></header>
      <main className="relative z-10 mx-auto mt-6 w-full max-w-4xl pb-24">
        <div className="mb-4 flex items-center gap-2" aria-label={`Music check ${Math.min(round + 1, 6)} of 6`}>{Array.from({ length: 6 }, (_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < round ? 'bg-cyan-300' : index === round ? 'bg-fuchsia-400' : 'bg-white/40'}`} />)}</div>
        <section className="overflow-hidden rounded-[32px] border border-fuchsia-200 bg-white/95 shadow-2xl">
          <div className="flex flex-col gap-2 bg-fuchsia-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{question.phase}</p><p className="mt-1 text-lg font-black">{question.title}</p></div><p className="text-sm font-bold text-fuchsia-100">Music check {Math.min(round + 1, 6)} of 6</p></div>
          <div className="p-5 sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-fuchsia-50 px-4 py-3 text-left ring-1 ring-fuchsia-100"><div className="flex min-w-0 gap-3"><Ear className="mt-1 shrink-0 text-fuchsia-700" /><div><p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-600">Music Coach</p><p className="mt-1 font-semibold text-fuchsia-950">Listen once, move with the sound, then replay it before choosing.</p></div></div><button onClick={() => narrate(question)} aria-label="Read question aloud" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow"><Volume2 /></button></div>
            <h2 data-testid="early-music-question" className="text-center text-2xl font-black leading-snug text-fuchsia-950 sm:text-4xl">{question.prompt}</h2>
            <div className="my-6"><MusicScene question={question} onPlay={() => playSample(question)} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{question.options.map((option, index) => {
              const correct = option === question.answer; const selected = option === selectedAnswer;
              const stateClass = feedback === 'correct' && correct ? 'bg-emerald-500 ring-4 ring-emerald-200' : feedback === 'wrong' && correct ? 'bg-emerald-500' : feedback === 'wrong' && selected ? 'bg-rose-500 ring-4 ring-rose-200' : feedback !== 'idle' ? 'bg-slate-300' : 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_6px_0_rgb(112,26,117)] active:translate-y-1 active:shadow-none';
              return <button key={option} onClick={() => answerQuestion(option)} disabled={feedback !== 'idle'} data-testid="music-answer-option" data-music-correct={correct ? 'true' : 'false'} className={`flex min-h-24 items-center gap-4 rounded-2xl p-4 text-left text-white transition ${stateClass}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl font-black text-fuchsia-800">{String.fromCharCode(65 + index)}</span><span className="min-w-0 break-words text-lg font-black sm:text-xl">{option}</span></button>;
            })}</div>
            {feedback === 'correct' && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left text-emerald-900 ring-2 ring-emerald-200"><CheckCircle2 className="shrink-0 text-emerald-600" /><div><p className="font-black">You heard it!</p><p className="font-semibold">{question.explanation}</p></div></div>}
            {feedback === 'wrong' && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-left text-rose-900 ring-2 ring-rose-200"><XCircle className="shrink-0 text-rose-600" /><div><p className="font-black">Replay and listen for one clue.</p><p className="font-semibold">The answer is {question.answer}. {question.explanation}</p></div></div>}
          </div>
        </section>
      </main>
    </div>
  );
};
