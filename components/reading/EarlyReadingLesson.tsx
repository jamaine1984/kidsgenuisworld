import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Apple, ArrowLeft, Bed, BookOpen, BusFront, Cat, CheckCircle2, CircleDot, Dog, Fish, Moon, Star, Sun, TreePine, Volume2, XCircle } from 'lucide-react';
import { playSuccess, playWrongBuzzer, speakCorrect, speakMultipleChoiceQuestion, speakWrong } from '../../services/audioService';
import { EarlyLiteracyQuestion, EarlyLiteracyVisual, generateEarlyLiteracyQuestion } from '../../services/curriculum/earlyLiteracy';
import { generateElementaryLiteracyQuestion } from '../../services/curriculum/elementaryLiteracy';
import { generateUpperElementaryLiteracyQuestion } from '../../services/curriculum/upperElementaryLiteracy';

interface EarlyReadingLessonProps {
  onBack: () => void;
  onReward: (meta?: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }) => void;
  onAttempt?: (meta: { questionId: string; skill: string; prompt: string; selectedAnswer?: string; correctAnswer?: string }, correct: boolean) => void;
  level: number;
}

const VisualIcon: React.FC<{ visual: EarlyLiteracyVisual }> = ({ visual }) => {
  const className = 'h-24 w-24 text-orange-500';
  if (visual === 'cat') return <Cat className={className} />;
  if (visual === 'dog') return <Dog className={className} />;
  if (visual === 'sun') return <Sun className="h-24 w-24 text-amber-400" />;
  if (visual === 'bus') return <BusFront className={className} />;
  if (visual === 'bed') return <Bed className={className} />;
  if (visual === 'cup') return <CircleDot className={className} />;
  if (visual === 'apple') return <Apple className="h-24 w-24 text-red-500" />;
  if (visual === 'fish') return <Fish className={className} />;
  if (visual === 'tree') return <TreePine className="h-24 w-24 text-emerald-600" />;
  if (visual === 'moon') return <Moon className="h-24 w-24 text-indigo-500" />;
  if (visual === 'book') return <BookOpen className={className} />;
  return null;
};

export const EarlyReadingLesson: React.FC<EarlyReadingLessonProps> = ({ onBack, onReward, onAttempt, level }) => {
  const normalizedLevel = Math.max(1, Math.min(7, level)) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const generateQuestion = useCallback((step: number) => {
    if (normalizedLevel === 1 || normalizedLevel === 2) return generateEarlyLiteracyQuestion(normalizedLevel, step);
    if (normalizedLevel === 3 || normalizedLevel === 4) return generateElementaryLiteracyQuestion(normalizedLevel, step);
    return generateUpperElementaryLiteracyQuestion(normalizedLevel, step);
  }, [normalizedLevel]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<EarlyLiteracyQuestion>(() => generateQuestion(0));
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
  const coachTip = useMemo(() => {
    if (/letter|phoneme|sound/i.test(question.skill)) return 'Say the word slowly and listen to one sound at a time.';
    if (/rhyme/i.test(question.skill)) return 'Listen to the ending. Rhyming words end with the same sound.';
    if (/syllable/i.test(question.skill)) return 'Clap once for each word beat you hear.';
    if (/comprehension|detail|event/i.test(question.skill)) return 'Listen again and use the exact words from the sentence.';
    if (/main idea|evidence|inference|cause|compare|purpose/i.test(question.skill)) return 'Read the whole text, then point to the clue that proves your answer.';
    if (/prefix|suffix|context|compound/i.test(question.skill)) return 'Break the word into meaningful parts and test the meaning in the sentence.';
    if (/root|morphology|multisyllabic/i.test(question.skill)) return 'Mark the word parts, name each meaning, then blend the whole word again.';
    if (/theme|summary|structure|point of view/i.test(question.skill)) return 'Name the author’s pattern, then choose the answer supported across the whole text.';
    if (/paired|source|argument|claim|quotation/i.test(question.skill)) return 'Compare the sources and choose the most relevant evidence, not just a true detail.';
    return 'Look carefully, say the answer, then choose it.';
  }, [question.skill]);

  const narrate = useCallback((current: EarlyLiteracyQuestion) => {
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

    if (correct) {
      setFeedback('correct');
      setScore(value => value + 1);
      playSuccess();
      void speakCorrect(question.explanation);
      onReward({
        questionId: question.id,
        skill: question.skill,
        prompt: question.prompt,
        selectedAnswer: answer,
        correctAnswer: question.answer,
      });
      if (round < 5) advanceTimer.current = setTimeout(moveToNext, 1500);
      return;
    }

    setFeedback('wrong');
    playWrongBuzzer();
    onAttempt?.({
      questionId: question.id,
      skill: question.skill,
      prompt: question.prompt,
      selectedAnswer: answer,
      correctAnswer: question.answer,
    }, false);
    void speakWrong(`The answer is ${question.answer}. ${question.explanation}`);
    advanceTimer.current = setTimeout(() => {
      setFeedback('idle');
      setSelectedAnswer('');
    }, 2200);
  };

  return (
    <div className="academy-room-surface relative flex h-full w-full flex-col overflow-auto bg-orange-50 p-4 sm:p-6" style={{ '--academy-room-scene': "url('/academy/rooms/reading.webp')" } as React.CSSProperties}>
      <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />

      <header className="relative z-10 flex items-center justify-between gap-3">
        <button onClick={onBack} aria-label="Back to world map" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-orange-100 bg-white shadow-lg">
          <ArrowLeft className="text-orange-600" />
        </button>
        <div className="rounded-full border border-orange-100 bg-white/95 px-5 py-2 text-sm font-black uppercase text-orange-700 shadow-sm">{gradeLabel} Reading</div>
        <div className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 font-black text-white shadow"><Star size={18} fill="currentColor" /> {score}</div>
      </header>

      <main className="relative z-10 mx-auto mt-6 w-full max-w-4xl pb-24">
        <div className="mb-4 flex items-center gap-2" aria-label={`Question ${Math.min(round + 1, 6)} of 6`}>
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className={`h-2 flex-1 rounded-full ${index < round ? 'bg-emerald-500' : index === round ? 'bg-orange-500' : 'bg-white/80'}`} />
          ))}
        </div>

        <section className="overflow-hidden rounded-[32px] border border-orange-200 bg-white/95 shadow-2xl">
          <div className="flex flex-col gap-2 bg-orange-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Reading focus</p>
              <p className="mt-1 text-lg font-black capitalize">{question.skill}</p>
            </div>
            <p className="text-sm font-bold text-orange-100">Question {Math.min(round + 1, 6)} of 6</p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-left ring-1 ring-orange-100">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">Reading Coach</p>
                <p className="mt-1 font-semibold text-orange-950">{coachTip}</p>
              </div>
              <button onClick={() => narrate(question)} aria-label="Read question aloud" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                <Volume2 />
              </button>
            </div>

            <h2 data-testid="early-reading-question" className="text-center text-2xl font-black leading-snug text-orange-950 sm:text-4xl">{question.prompt}</h2>

            <div className="my-6 flex min-h-36 items-center justify-center rounded-[24px] bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 ring-2 ring-orange-100">
              <VisualIcon visual={question.visual} />
              {(question.visual === 'letter' || question.visual === 'word') && (
                <span className={`${question.focusText.length > 20 ? 'text-2xl sm:text-3xl' : 'text-6xl sm:text-7xl'} max-w-full break-words text-center font-black text-orange-700`}>{question.focusText}</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {question.options.map((option, index) => {
                const correct = option === question.answer;
                const selected = option === selectedAnswer;
                const stateClass = feedback === 'correct' && correct ? 'bg-emerald-500 ring-4 ring-emerald-200'
                  : feedback === 'wrong' && correct ? 'bg-emerald-500'
                    : feedback === 'wrong' && selected ? 'bg-orange-400 ring-4 ring-orange-200'
                      : feedback !== 'idle' ? 'bg-slate-300'
                        : 'bg-orange-500 hover:bg-orange-400 shadow-[0_6px_0_rgb(154,52,18)] active:translate-y-1 active:shadow-none';
                return (
                  <button
                    key={option}
                    data-testid="reading-answer-option"
                    data-reading-correct={correct ? 'true' : 'false'}
                    onClick={() => answerQuestion(option)}
                    disabled={feedback !== 'idle'}
                    className={`flex min-h-24 items-center gap-4 rounded-2xl p-4 text-left text-white transition ${stateClass}`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl font-black text-orange-700">{String.fromCharCode(65 + index)}</span>
                    <span className="min-w-0 break-words text-xl font-black sm:text-2xl">{option}</span>
                  </button>
                );
              })}
            </div>

            {feedback === 'correct' && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left text-emerald-900 ring-2 ring-emerald-200">
                <CheckCircle2 className="shrink-0 text-emerald-600" />
                <div><p className="font-black">Great Job!</p><p className="font-semibold">{question.explanation}</p></div>
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-left text-rose-900 ring-2 ring-rose-200">
                <XCircle className="shrink-0 text-rose-600" />
                <div><p className="font-black">Let us learn it together.</p><p className="font-semibold">The answer is {question.answer}. {question.explanation}</p></div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
