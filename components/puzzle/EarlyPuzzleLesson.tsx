import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Diamond, Fish, Flower2, Gift, Hexagon, Lightbulb, Rocket, Shapes, Square, Star, Triangle, Volume2, XCircle } from 'lucide-react';
import { playSuccess, playWrongBuzzer, speakCorrect, speakMultipleChoiceQuestion, speakWrong } from '../../services/audioService';
import { EarlyPuzzleQuestion, generateEarlyPuzzleQuestion, PuzzleToken } from '../../services/curriculum/earlyPuzzle';
import { generateElementaryPuzzleQuestion } from '../../services/curriculum/elementaryPuzzle';
import { generateUpperElementaryPuzzleQuestion } from '../../services/curriculum/upperElementaryPuzzle';

interface EarlyPuzzleLessonProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
  level: number;
}

const PICTURE_TOKENS = new Set(['star', 'circle', 'small-circle', 'large-circle', 'square', 'triangle', 'diamond', 'hexagon', 'fish', 'flower', 'rocket', 'gift', '?']);

const PuzzleIcon: React.FC<{ token: string; large?: boolean }> = ({ token, large }) => {
  const className = large ? 'h-14 w-14' : 'h-9 w-9';
  if (token === 'star') return <Star className={`${className} text-amber-500`} fill="currentColor" />;
  if (token === 'circle' || token === 'small-circle' || token === 'large-circle') return <Circle className={`${token === 'small-circle' ? 'h-8 w-8' : token === 'large-circle' ? 'h-16 w-16' : className} text-orange-500`} fill="currentColor" />;
  if (token === 'square') return <Square className={`${className} text-blue-600`} fill="currentColor" />;
  if (token === 'triangle') return <Triangle className={`${className} text-emerald-600`} fill="currentColor" />;
  if (token === 'diamond') return <Diamond className={`${className} text-violet-600`} fill="currentColor" />;
  if (token === 'hexagon') return <Hexagon className={`${className} text-teal-600`} fill="currentColor" />;
  if (token === 'fish') return <Fish className={`${className} text-cyan-700`} />;
  if (token === 'flower') return <Flower2 className={`${className} text-pink-600`} />;
  if (token === 'rocket') return <Rocket className={`${className} text-indigo-600`} />;
  if (token === 'gift') return <Gift className={`${className} text-rose-600`} />;
  if (token === '?') return <span className="text-4xl font-black text-teal-700">?</span>;
  return <span className="break-words text-center text-sm font-black text-teal-900">{token.replace('-', ' ')}</span>;
};

const PuzzleScene: React.FC<{ question: EarlyPuzzleQuestion }> = ({ question }) => (
  <div data-testid="early-puzzle-scene" className="rounded-3xl bg-gradient-to-br from-teal-50 via-white to-amber-50 p-5 ring-2 ring-teal-100">
    <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-teal-600">Strategy clue</p>
    <p className="mt-1 text-center font-black text-teal-950">{question.clueText}</p>
    <div className="mt-5 flex min-h-24 flex-wrap items-center justify-center gap-3">
      {question.clueItems.map((token, index) => <span key={`${token}-${index}`} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow ring-1 ring-teal-100"><PuzzleIcon token={token} large /></span>)}
    </div>
  </div>
);

export const EarlyPuzzleLesson: React.FC<EarlyPuzzleLessonProps> = ({ onBack, onReward, onAttempt, level }) => {
  const normalizedLevel = Math.max(1, Math.min(7, level)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const generateQuestion = useCallback((step: number) => {
    if (normalizedLevel === 1 || normalizedLevel === 2) return generateEarlyPuzzleQuestion(normalizedLevel, step);
    if (normalizedLevel === 3 || normalizedLevel === 4) return generateElementaryPuzzleQuestion(normalizedLevel, step);
    return generateUpperElementaryPuzzleQuestion(normalizedLevel, step);
  }, [normalizedLevel]);
  const [round, setRound] = useState(0); const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<EarlyPuzzleQuestion>(() => generateQuestion(0));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle'); const [selectedAnswer, setSelectedAnswer] = useState('');
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narrate = useCallback((current: EarlyPuzzleQuestion) => void speakMultipleChoiceQuestion(current.prompt, current.options.map(option => option.replace('-', ' '))), []);
  useEffect(() => { narrate(question); return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }; }, [narrate, question]);
  const moveToNext = () => { const nextRound = round + 1; setRound(nextRound); setQuestion(generateQuestion(nextRound)); setFeedback('idle'); setSelectedAnswer(''); };
  const answerQuestion = (answer: string) => {
    if (feedback !== 'idle') return;
    setSelectedAnswer(answer); const correct = answer === question.answer;
    const meta = { questionId: question.id, skill: question.skill, prompt: question.prompt, selectedAnswer: answer.replace('-', ' '), correctAnswer: question.answer.replace('-', ' ') };
    if (correct) { setFeedback('correct'); setScore(value => value + 1); playSuccess(); void speakCorrect(question.explanation); onReward(meta); if (round < 5) advanceTimer.current = setTimeout(moveToNext, 1550); return; }
    setFeedback('wrong'); playWrongBuzzer(); onAttempt?.(meta, false); void speakWrong(`The answer is ${question.answer.replace('-', ' ')}. ${question.explanation}`); advanceTimer.current = setTimeout(() => { setFeedback('idle'); setSelectedAnswer(''); }, 2300);
  };
  const gradeLabel = normalizedLevel === 1 ? 'Pre-K' : normalizedLevel === 2 ? 'Kindergarten' : normalizedLevel === 3 ? '1st Grade' : normalizedLevel === 4 ? '2nd Grade' : normalizedLevel === 5 ? '3rd Grade' : normalizedLevel === 6 ? '4th Grade' : '5th Grade';
  return (
    <div className="academy-room-surface relative flex h-full w-full flex-col overflow-auto bg-teal-50 p-4 sm:p-6" style={{ '--academy-room-scene': "url('/academy/rooms/puzzle.webp')" } as React.CSSProperties}>
      <div className="absolute inset-0 bg-white/35 backdrop-blur-[1px]" />
      <header className="relative z-10 flex items-center justify-between gap-3"><button onClick={onBack} aria-label="Back to world map" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-teal-100 bg-white shadow-lg"><ArrowLeft className="text-teal-700" /></button><div className="flex items-center gap-2 rounded-full border border-teal-100 bg-white/95 px-4 py-2 text-sm font-black uppercase text-teal-800 shadow-sm sm:px-5"><Shapes size={18} /> {gradeLabel} Strategy Gym</div><div className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-black text-white shadow"><Star size={18} fill="currentColor" /> {score}</div></header>
      <main className="relative z-10 mx-auto mt-6 w-full max-w-4xl pb-24">
        <div className="mb-4 flex items-center gap-2" aria-label={`Puzzle ${Math.min(round + 1, 6)} of 6`}>{Array.from({ length: 6 }, (_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < round ? 'bg-amber-400' : index === round ? 'bg-teal-600' : 'bg-white/80'}`} />)}</div>
        <section className="overflow-hidden rounded-[32px] border border-teal-200 bg-white/95 shadow-2xl">
          <div className="flex flex-col gap-2 bg-teal-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">{question.phase}</p><p className="mt-1 text-lg font-black">{question.title}</p></div><p className="text-sm font-bold text-teal-100">Puzzle {Math.min(round + 1, 6)} of 6</p></div>
          <div className="p-5 sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-left ring-1 ring-teal-100"><div className="flex min-w-0 gap-3"><Lightbulb className="mt-1 shrink-0 text-teal-700" /><div><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-600">Strategy Coach</p><p className="mt-1 font-semibold text-teal-950">Say what you notice, name the rule, then choose the answer that fits every clue.</p></div></div><button onClick={() => narrate(question)} aria-label="Read question aloud" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow"><Volume2 /></button></div>
            <h2 data-testid="early-puzzle-question" className="text-center text-2xl font-black leading-snug text-teal-950 sm:text-4xl">{question.prompt}</h2>
            <div className="my-6"><PuzzleScene question={question} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{question.options.map((option, index) => {
              const correct = option === question.answer; const selected = option === selectedAnswer;
              const stateClass = feedback === 'correct' && correct ? 'bg-emerald-500 ring-4 ring-emerald-200' : feedback === 'wrong' && correct ? 'bg-emerald-500' : feedback === 'wrong' && selected ? 'bg-rose-500 ring-4 ring-rose-200' : feedback !== 'idle' ? 'bg-slate-300' : 'bg-teal-600 hover:bg-teal-500 shadow-[0_6px_0_rgb(17,94,89)] active:translate-y-1 active:shadow-none';
              return <button key={option} onClick={() => answerQuestion(option)} disabled={feedback !== 'idle'} data-testid="puzzle-answer-option" data-puzzle-correct={correct ? 'true' : 'false'} className={`flex min-h-24 items-center gap-4 rounded-2xl p-4 text-left text-white transition ${stateClass}`}><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-xl font-black text-teal-800">{PICTURE_TOKENS.has(option) ? <PuzzleIcon token={option} /> : String.fromCharCode(65 + index)}</span><span className="min-w-0 break-words text-lg font-black capitalize sm:text-xl">{option.replace('-', ' ')}</span></button>;
            })}</div>
            {feedback === 'correct' && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left text-emerald-900 ring-2 ring-emerald-200"><CheckCircle2 className="shrink-0 text-emerald-600" /><div><p className="font-black">Strategy works!</p><p className="font-semibold">{question.explanation}</p></div></div>}
            {feedback === 'wrong' && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-left text-rose-900 ring-2 ring-rose-200"><XCircle className="shrink-0 text-rose-600" /><div><p className="font-black">Try the clue one more time.</p><p className="font-semibold">The answer is {question.answer.replace('-', ' ')}. {question.explanation}</p></div></div>}
          </div>
        </section>
      </main>
    </div>
  );
};
