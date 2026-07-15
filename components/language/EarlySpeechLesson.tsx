import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleHelp, Ear, ListOrdered, MessageCircleMore, MoveRight, Shapes, Smile, Star, TextCursorInput, Users, Volume2, XCircle } from 'lucide-react';
import { playSuccess, playWrongBuzzer, speakCorrect, speakMultipleChoiceQuestion, speakWrong } from '../../services/audioService';
import { EarlySpeechQuestion, EarlySpeechVisual, generateEarlySpeechQuestion } from '../../services/curriculum/earlySpeech';
import { generateElementarySpeechQuestion } from '../../services/curriculum/elementarySpeech';
import { generateUpperElementarySpeechQuestion } from '../../services/curriculum/upperElementarySpeech';

interface EarlySpeechLessonProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
  level: number;
}

const SpeechVisual: React.FC<{ visual: EarlySpeechVisual; focusText: string }> = ({ visual, focusText }) => {
  const Icon = visual === 'conversation' ? MessageCircleMore
    : visual === 'emotion' ? Smile
      : visual === 'listening' ? Ear
        : visual === 'direction' ? MoveRight
          : visual === 'category' ? Shapes
            : visual === 'sentence' ? TextCursorInput
              : visual === 'sequence' ? ListOrdered
                : CircleHelp;

  return (
    <div className="flex min-h-36 w-full flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-5 text-center ring-2 ring-cyan-100 sm:flex-row">
      <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-cyan-600 text-white shadow-lg">
        <Icon className="h-14 w-14" />
      </span>
      <p className={`${focusText.length > 44 ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'} max-w-xl break-words font-black leading-tight text-cyan-950`}>{focusText}</p>
    </div>
  );
};

export const EarlySpeechLesson: React.FC<EarlySpeechLessonProps> = ({ onBack, onReward, onAttempt, level }) => {
  const normalizedLevel = Math.max(1, Math.min(7, level)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const generateQuestion = useCallback((step: number) => {
    if (normalizedLevel === 1 || normalizedLevel === 2) return generateEarlySpeechQuestion(normalizedLevel, step);
    if (normalizedLevel === 3 || normalizedLevel === 4) return generateElementarySpeechQuestion(normalizedLevel, step);
    return generateUpperElementarySpeechQuestion(normalizedLevel, step);
  }, [normalizedLevel]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<EarlySpeechQuestion>(() => generateQuestion(0));
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gradeLabel = normalizedLevel === 1 ? 'Pre-K'
    : normalizedLevel === 2 ? 'Kindergarten'
      : normalizedLevel === 3 ? '1st Grade'
        : normalizedLevel === 4 ? '2nd Grade'
          : normalizedLevel === 5 ? '3rd Grade'
            : normalizedLevel === 6 ? '4th Grade'
              : '5th Grade';
  const lessonLabel = useMemo(() => question.phase, [question.phase]);

  const narrate = useCallback((current: EarlySpeechQuestion) => {
    void speakMultipleChoiceQuestion(current.prompt, current.options);
  }, []);

  useEffect(() => {
    narrate(question);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [narrate, question]);

  const moveToNext = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    setQuestion(generateQuestion(nextRound));
    setFeedback('idle');
    setSelectedAnswer('');
  };

  const answerQuestion = (answer: string) => {
    if (feedback !== 'idle') return;
    setSelectedAnswer(answer);
    const correct = answer === question.answer;
    const meta = {
      questionId: question.id,
      skill: question.skill,
      prompt: question.prompt,
      selectedAnswer: answer,
      correctAnswer: question.answer,
    };

    if (correct) {
      setFeedback('correct');
      setScore(value => value + 1);
      playSuccess();
      void speakCorrect(question.explanation);
      onReward(meta);
      if (round < 5) advanceTimer.current = setTimeout(moveToNext, 1500);
      return;
    }

    setFeedback('wrong');
    playWrongBuzzer();
    onAttempt?.(meta, false);
    void speakWrong(`The answer is ${question.answer}. ${question.explanation}`);
    advanceTimer.current = setTimeout(() => {
      setFeedback('idle');
      setSelectedAnswer('');
    }, 2200);
  };

  return (
    <div className="academy-room-surface relative flex h-full w-full flex-col overflow-auto bg-cyan-50 p-4 sm:p-6" style={{ '--academy-room-scene': "url('/academy/rooms/language.webp')" } as React.CSSProperties}>
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />

      <header className="relative z-10 flex items-center justify-between gap-3">
        <button onClick={onBack} aria-label="Back to world map" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-100 bg-white shadow-lg">
          <ArrowLeft className="text-cyan-700" />
        </button>
        <div className="rounded-full border border-cyan-100 bg-white/95 px-4 py-2 text-center text-sm font-black uppercase text-cyan-800 shadow-sm sm:px-5">{gradeLabel} Speech &amp; Language</div>
        <div className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-black text-white shadow"><Star size={18} fill="currentColor" /> {score}</div>
      </header>

      <main className="relative z-10 mx-auto mt-6 w-full max-w-4xl pb-24">
        <div className="mb-4 flex items-center gap-2" aria-label={`Question ${Math.min(round + 1, 6)} of 6`}>
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className={`h-2 flex-1 rounded-full ${index < round ? 'bg-emerald-500' : index === round ? 'bg-cyan-600' : 'bg-white/80'}`} />
          ))}
        </div>

        <section className="overflow-hidden rounded-[32px] border border-cyan-200 bg-white/95 shadow-2xl">
          <div className="flex flex-col gap-2 bg-cyan-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">{lessonLabel}</p>
              <p className="mt-1 text-lg font-black capitalize">{question.skill}</p>
            </div>
            <p className="text-sm font-bold text-cyan-100">Question {Math.min(round + 1, 6)} of 6</p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-cyan-50 px-4 py-3 text-left ring-1 ring-cyan-100">
              <div className="flex min-w-0 gap-3">
                <Users className="mt-1 shrink-0 text-cyan-700" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-600">Speaking Coach</p>
                  <p className="mt-1 font-semibold text-cyan-950">{question.coachCue}</p>
                </div>
              </div>
              <button onClick={() => narrate(question)} aria-label="Read question aloud" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                <Volume2 />
              </button>
            </div>

            <h2 data-testid="early-speech-question" className="text-center text-2xl font-black leading-snug text-cyan-950 sm:text-4xl">{question.prompt}</h2>

            <div className="my-6">
              <SpeechVisual visual={question.visual} focusText={question.focusText} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {question.options.map((option, index) => {
                const correct = option === question.answer;
                const selected = option === selectedAnswer;
                const stateClass = feedback === 'correct' && correct ? 'bg-emerald-500 ring-4 ring-emerald-200'
                  : feedback === 'wrong' && correct ? 'bg-emerald-500'
                    : feedback === 'wrong' && selected ? 'bg-rose-500 ring-4 ring-rose-200'
                      : feedback !== 'idle' ? 'bg-slate-300'
                        : 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_6px_0_rgb(22,78,99)] active:translate-y-1 active:shadow-none';
                return (
                  <button
                    key={option}
                    data-testid="language-answer-option"
                    data-language-correct={correct ? 'true' : 'false'}
                    onClick={() => answerQuestion(option)}
                    disabled={feedback !== 'idle'}
                    className={`flex min-h-24 items-center gap-4 rounded-2xl p-4 text-left text-white transition ${stateClass}`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl font-black text-cyan-800">{String.fromCharCode(65 + index)}</span>
                    <span className="min-w-0 break-words text-lg font-black sm:text-xl">{option}</span>
                  </button>
                );
              })}
            </div>

            {feedback === 'correct' && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left text-emerald-900 ring-2 ring-emerald-200">
                <CheckCircle2 className="shrink-0 text-emerald-600" />
                <div><p className="font-black">Strong speaking!</p><p className="font-semibold">{question.explanation}</p></div>
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-left text-rose-900 ring-2 ring-rose-200">
                <XCircle className="shrink-0 text-rose-600" />
                <div><p className="font-black">Let us say it together.</p><p className="font-semibold">The answer is {question.answer}. {question.explanation}</p></div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
