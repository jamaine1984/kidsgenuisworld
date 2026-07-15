import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bot, Bug, CheckCircle2, Code2, Flag, Lightbulb, Play, RotateCcw, Star, Volume2, X, XCircle } from 'lucide-react';
import { playSuccess, playWrongBuzzer, speakCorrect, speakMultipleChoiceQuestion, speakWrong } from '../../services/audioService';
import { CodingDirection, EarlyCodingBoard, EarlyCodingQuestion, generateEarlyCodingQuestion } from '../../services/curriculum/earlyCoding';
import { generateElementaryCodingQuestion } from '../../services/curriculum/elementaryCoding';
import { generateUpperElementaryCodingQuestion } from '../../services/curriculum/upperElementaryCoding';

interface EarlyCodingLessonProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
  level: number;
}

const DirectionIcon: React.FC<{ direction: CodingDirection }> = ({ direction }) => {
  if (direction === 'up') return <ArrowUp />;
  if (direction === 'down') return <ArrowDown />;
  if (direction === 'left') return <ArrowLeft />;
  return <ArrowRight />;
};

const RobotBoard: React.FC<{ board: EarlyCodingBoard }> = ({ board }) => {
  const obstacleKeys = new Set((board.obstacles || []).map(([x, y]) => `${x}-${y}`));
  return (
    <div data-testid="early-coding-board" className="mx-auto grid w-full max-w-md gap-2" style={{ gridTemplateColumns: `repeat(${board.columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: board.rows * board.columns }, (_, index) => {
        const x = index % board.columns; const y = Math.floor(index / board.columns);
        const robot = board.robot[0] === x && board.robot[1] === y; const goal = board.goal[0] === x && board.goal[1] === y; const obstacle = obstacleKeys.has(`${x}-${y}`);
        return <div key={`${x}-${y}`} className={`relative flex aspect-square items-center justify-center rounded-2xl border-2 ${obstacle ? 'border-rose-200 bg-rose-100' : goal ? 'border-amber-300 bg-amber-100' : 'border-indigo-100 bg-white'}`}>
          {obstacle && <X className="h-10 w-10 text-rose-500" />}
          {goal && <Flag className="h-9 w-9 text-amber-600" />}
          {robot && <span className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg"><Bot className="h-9 w-9" /><span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-indigo-700 shadow"><DirectionIcon direction={board.facing} /></span></span>}
        </div>;
      })}
    </div>
  );
};

const CodeScene: React.FC<{ question: EarlyCodingQuestion }> = ({ question }) => (
  <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 ring-2 ring-indigo-100">
    {question.board && <RobotBoard board={question.board} />}
    <div className={`flex flex-wrap justify-center gap-2 ${question.board ? 'mt-5' : ''}`}>
      {question.codeClue.map((line, index) => <span key={`${line}-${index}`} className="rounded-xl bg-indigo-950 px-4 py-3 font-mono text-sm font-bold text-cyan-200 shadow sm:text-base">{index + 1}. {line}</span>)}
    </div>
  </div>
);

export const EarlyCodingLesson: React.FC<EarlyCodingLessonProps> = ({ onBack, onReward, onAttempt, level }) => {
  const normalizedLevel = Math.max(1, Math.min(7, level)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const generateQuestion = useCallback((step: number) => {
    if (normalizedLevel <= 2) return generateEarlyCodingQuestion(normalizedLevel as 1 | 2, step);
    if (normalizedLevel <= 4) return generateElementaryCodingQuestion(normalizedLevel as 3 | 4, step);
    return generateUpperElementaryCodingQuestion(normalizedLevel as 5 | 6 | 7, step);
  }, [normalizedLevel]);
  const [round, setRound] = useState(0); const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<EarlyCodingQuestion>(() => generateQuestion(0));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle'); const [selectedAnswer, setSelectedAnswer] = useState('');
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narrate = useCallback((current: EarlyCodingQuestion) => void speakMultipleChoiceQuestion(current.prompt, current.options), []);
  useEffect(() => { narrate(question); return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }; }, [narrate, question]);
  const moveToNext = () => { const nextRound = round + 1; setRound(nextRound); setQuestion(generateQuestion(nextRound)); setFeedback('idle'); setSelectedAnswer(''); };
  const answerQuestion = (answer: string) => {
    if (feedback !== 'idle') return;
    setSelectedAnswer(answer); const correct = answer === question.answer;
    const meta = { questionId: question.id, skill: question.skill, prompt: question.prompt, selectedAnswer: answer, correctAnswer: question.answer };
    if (correct) { setFeedback('correct'); setScore(value => value + 1); playSuccess(); void speakCorrect(question.explanation); onReward(meta); if (round < 5) advanceTimer.current = setTimeout(moveToNext, 1650); return; }
    setFeedback('wrong'); playWrongBuzzer(); onAttempt?.(meta, false); void speakWrong(`The best code is ${question.answer}. ${question.explanation}`); advanceTimer.current = setTimeout(() => { setFeedback('idle'); setSelectedAnswer(''); }, 2400);
  };
  const gradeLabel = normalizedLevel === 1 ? 'Pre-K' : normalizedLevel === 2 ? 'Kindergarten' : normalizedLevel === 3 ? '1st Grade' : normalizedLevel === 4 ? '2nd Grade' : normalizedLevel === 5 ? '3rd Grade' : normalizedLevel === 6 ? '4th Grade' : '5th Grade';
  return (
    <div className="academy-room-surface relative flex h-full w-full flex-col overflow-auto bg-indigo-50 p-4 sm:p-6" style={{ '--academy-room-scene': "url('/academy/rooms/coding.webp')" } as React.CSSProperties}>
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
      <header className="relative z-10 flex items-center justify-between gap-3"><button onClick={onBack} aria-label="Back to world map" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-indigo-100 bg-white shadow-lg"><ArrowLeft className="text-indigo-700" /></button><div className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white/95 px-4 py-2 text-sm font-black uppercase text-indigo-800 shadow-sm sm:px-5"><Code2 size={18} /> {gradeLabel} Coding Lab</div><div className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-black text-white shadow"><Star size={18} fill="currentColor" /> {score}</div></header>
      <main className="relative z-10 mx-auto mt-6 w-full max-w-4xl pb-24">
        <div className="mb-4 flex items-center gap-2" aria-label={`Code mission ${Math.min(round + 1, 6)} of 6`}>{Array.from({ length: 6 }, (_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index < round ? 'bg-cyan-400' : index === round ? 'bg-indigo-500' : 'bg-white/80'}`} />)}</div>
        <section className="overflow-hidden rounded-[32px] border border-indigo-200 bg-white/95 shadow-2xl">
          <div className="flex flex-col gap-2 bg-indigo-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{question.phase}</p><p className="mt-1 text-lg font-black">{question.title}</p></div><p className="text-sm font-bold text-indigo-100">Code mission {Math.min(round + 1, 6)} of 6</p></div>
          <div className="p-5 sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-left ring-1 ring-indigo-100"><div className="flex min-w-0 gap-3"><Lightbulb className="mt-1 shrink-0 text-indigo-700" /><div><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Coding Coach</p><p className="mt-1 font-semibold text-indigo-950">Plan first, follow each command in order, then check where Robot finishes.</p></div></div><button onClick={() => narrate(question)} aria-label="Read question aloud" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow"><Volume2 /></button></div>
            <h2 data-testid="early-coding-question" className="text-center text-2xl font-black leading-snug text-indigo-950 sm:text-4xl">{question.prompt}</h2>
            <div className="my-6"><CodeScene question={question} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{question.options.map((option, index) => {
              const correct = option === question.answer; const selected = option === selectedAnswer;
              const stateClass = feedback === 'correct' && correct ? 'bg-emerald-500 ring-4 ring-emerald-200' : feedback === 'wrong' && correct ? 'bg-emerald-500' : feedback === 'wrong' && selected ? 'bg-rose-500 ring-4 ring-rose-200' : feedback !== 'idle' ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_6px_0_rgb(49,46,129)] active:translate-y-1 active:shadow-none';
              return <button key={option} onClick={() => answerQuestion(option)} disabled={feedback !== 'idle'} data-testid="coding-answer-option" data-coding-correct={correct ? 'true' : 'false'} className={`flex min-h-24 items-center gap-4 rounded-2xl p-4 text-left text-white transition ${stateClass}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl font-black text-indigo-800">{String.fromCharCode(65 + index)}</span><span className="min-w-0 break-words text-base font-black sm:text-lg">{option}</span></button>;
            })}</div>
            {feedback === 'correct' && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left text-emerald-900 ring-2 ring-emerald-200"><CheckCircle2 className="shrink-0 text-emerald-600" /><div><p className="font-black">Program works!</p><p className="font-semibold">{question.explanation}</p></div></div>}
            {feedback === 'wrong' && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-left text-rose-900 ring-2 ring-rose-200"><Bug className="shrink-0 text-rose-600" /><div><p className="font-black">We found a bug to fix.</p><p className="font-semibold">The best code is {question.answer}. {question.explanation}</p></div></div>}
          </div>
        </section>
      </main>
    </div>
  );
};
