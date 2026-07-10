import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Lightbulb, RotateCcw, Sparkles, Target } from 'lucide-react';
import { RoomType, type AssignmentAttempt, type UserProgress } from '../types';
import { playSuccess, playWrongBuzzer, speakAsync } from '../services/audioService';
import { getCampusRoom } from '../services/schoolMode';

interface StudyZoneProps {
  progress: UserProgress;
  onBack: () => void;
  onOpenRoom: (room: RoomType) => void;
  onReviewComplete: (attempt: AssignmentAttempt) => void;
}

const reviewRooms = [
  RoomType.MATH,
  RoomType.READING,
  RoomType.STORYBOOK,
  RoomType.SCIENCE,
  RoomType.GEOGRAPHY,
  RoomType.CODING,
  RoomType.LANGUAGE,
  RoomType.ART,
  RoomType.MUSIC,
  RoomType.PUZZLE,
];

const buildLatestMissedReviewQueue = (attempts: AssignmentAttempt[]) => {
  const latestByQuestion = new Map<string, AssignmentAttempt>();
  [...attempts]
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((attempt) => {
      if (!latestByQuestion.has(attempt.questionId)) {
        latestByQuestion.set(attempt.questionId, attempt);
      }
    });

  return Array.from(latestByQuestion.values())
    .filter((attempt) => !attempt.correct && attempt.room !== RoomType.STUDY)
    .slice(0, 18);
};

const makeAnswerChoices = (attempt?: AssignmentAttempt) => {
  if (!attempt) return [];
  const choices = [
    attempt.correctAnswer || 'I can explain it now',
    attempt.selectedAnswer && attempt.selectedAnswer !== attempt.correctAnswer ? attempt.selectedAnswer : undefined,
    'I need a hint',
  ].filter(Boolean) as string[];

  return Array.from(new Set(choices)).slice(0, 3);
};

export const StudyZone: React.FC<StudyZoneProps> = ({ progress, onBack, onOpenRoom, onReviewComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [hintOpen, setHintOpen] = useState(false);

  const reviewQueue = useMemo(
    () => buildLatestMissedReviewQueue(progress.assignmentAttempts || []),
    [progress.assignmentAttempts]
  );
  const openQueue = reviewQueue.filter((attempt) => !completedIds.includes(attempt.questionId));
  const activeAttempt = openQueue[Math.min(activeIndex, Math.max(0, openQueue.length - 1))];
  const answerChoices = makeAnswerChoices(activeAttempt);

  const focusByRoom = useMemo(() => {
    const counts = new Map<RoomType, number>();
    reviewQueue.forEach((attempt) => {
      counts.set(attempt.room, (counts.get(attempt.room) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [reviewQueue]);

  const readReview = async () => {
    if (!activeAttempt) return;
    await speakAsync(`Study Zone review. ${activeAttempt.prompt}. The answer we are practicing is ${activeAttempt.correctAnswer || 'the correct strategy'}.`);
  };

  const handleChoice = async (choice: string) => {
    if (!activeAttempt) return;
    if (choice === activeAttempt.correctAnswer || (!activeAttempt.correctAnswer && choice !== 'I need a hint')) {
      playSuccess();
      const message = activeAttempt.correctAnswer
        ? `Correct. ${activeAttempt.correctAnswer} is the answer because it matches the question.`
        : 'Good review. You explained the skill and cleared this practice item.';
      setFeedback(message);
      setHintOpen(false);
      onReviewComplete(activeAttempt);
      setCompletedIds((ids) => Array.from(new Set([...ids, activeAttempt.questionId])));
      await speakAsync(message);
      setActiveIndex(0);
      return;
    }

    playWrongBuzzer();
    const message = activeAttempt.correctAnswer
      ? `Not yet. The answer is ${activeAttempt.correctAnswer}. Look back at the question, then try it again.`
      : 'Not yet. Use the hint, then try to explain the answer again.';
    setFeedback(message);
    setHintOpen(true);
    await speakAsync(message);
  };

  const resetSession = () => {
    setCompletedIds([]);
    setActiveIndex(0);
    setFeedback('');
    setHintOpen(false);
  };

  return (
    <div className="academy-room-surface min-h-full overflow-y-auto p-4 sm:p-6 kid-scroll" style={{ '--academy-room-scene': "url('/academy/rooms/puzzle.webp')" } as React.CSSProperties}>
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            aria-label="Back to world map"
            className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-black text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:bg-white"
          >
            <ArrowLeft size={18} />
            School Map
          </button>
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-lg">
            {openQueue.length} review skills waiting
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border-4 border-white bg-white/90 shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/18 px-3 py-1 text-sm font-black">
                <Sparkles size={16} />
                Study Zone
              </div>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Practice missed answers until they stick.</h1>
              <p className="mt-3 max-w-2xl text-lg font-semibold text-white/88">
                Mr. Atlas brings back anything missed in class so students can fix it, hear it again, and clear it from their review list.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/15 p-4">
                  <div className="text-3xl font-black">{reviewQueue.length}</div>
                  <div className="text-sm font-bold text-white/80">Total focus items</div>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <div className="text-3xl font-black">{completedIds.length}</div>
                  <div className="text-sm font-bold text-white/80">Cleared today</div>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <div className="text-3xl font-black">{Math.max(0, reviewQueue.length - completedIds.length)}</div>
                  <div className="text-sm font-bold text-white/80">Still to review</div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[360px] flex-col justify-between bg-white p-5 sm:p-7">
              {activeAttempt ? (
                <>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-indigo-700">
                        {getCampusRoom(activeAttempt.room).shortName}
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700">
                        {activeAttempt.skill}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-slate-900">{activeAttempt.prompt}</h2>
                    {activeAttempt.selectedAnswer && (
                      <p className="mt-2 text-sm font-bold text-slate-500">Last try: {activeAttempt.selectedAnswer}</p>
                    )}
                    {hintOpen && (
                      <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                        Hint: say the question slowly, name what it is asking, then compare each answer choice.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3">
                    {answerChoices.map((choice, index) => (
                      <button
                        key={choice}
                        onClick={() => handleChoice(choice)}
                        className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-left text-lg font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        {String.fromCharCode(65 + index)}. {choice}
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={readReview} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md">
                      <BookOpen size={17} />
                      Read it to me
                    </button>
                    <button onClick={() => setHintOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-3 text-sm font-black text-slate-900 shadow-md">
                      <Lightbulb size={17} />
                      Show hint
                    </button>
                    <button onClick={() => onOpenRoom(activeAttempt.room)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-md ring-2 ring-slate-200">
                      <Target size={17} />
                      Practice room
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="text-emerald-500" size={64} />
                  <h2 className="mt-4 text-3xl font-black text-slate-900">Study Zone is clear.</h2>
                  <p className="mt-2 max-w-md text-base font-semibold text-slate-600">
                    No missed answers are waiting. Pick a classroom to keep learning fresh.
                  </p>
                  {reviewQueue.length > 0 && (
                    <button onClick={resetSession} className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-md">
                      <RotateCcw size={17} />
                      Review again
                    </button>
                  )}
                </div>
              )}
              {feedback && (
                <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
                  {feedback}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(focusByRoom.length ? focusByRoom : reviewRooms.slice(0, 4).map((room) => [room, 0] as [RoomType, number])).map(([room, count]) => (
            <button
              key={room}
              onClick={() => onOpenRoom(room)}
              className="rounded-3xl border-4 border-white bg-white/88 p-5 text-left shadow-xl transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-wide text-indigo-600">{getCampusRoom(room).shortName}</div>
                  <div className="mt-1 text-xl font-black text-slate-900">{getCampusRoom(room).classroomName}</div>
                </div>
                <div className="rounded-2xl bg-indigo-100 px-3 py-2 text-lg font-black text-indigo-700">{count}</div>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-600">{getCampusRoom(room).detail}</p>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};

export default StudyZone;
