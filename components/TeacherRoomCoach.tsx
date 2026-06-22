import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, GraduationCap, Lightbulb, Volume2 } from 'lucide-react';
import { UserProgress } from '../types';
import type { CurriculumUnit } from '../services/curriculum';
import {
  AI_TEACHER,
  MASTERED_PRACTICE_TARGET,
  SCHOOL_LESSON_PHASES,
  getCampusRoom,
  getTeacherHelpLadder,
  getTeacherScript,
} from '../services/schoolMode';
import { speakAsync } from '../services/audioService';

interface TeacherRoomCoachProps {
  unit: CurriculumUnit;
  progress: UserProgress;
  practiceCount: number;
  onOpenLessonBoard: () => void;
}

export const TeacherRoomCoach: React.FC<TeacherRoomCoachProps> = ({
  unit,
  progress,
  practiceCount,
  onOpenLessonBoard,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 640px)').matches
      : false
  ));
  const [helpStepIndex, setHelpStepIndex] = useState(0);
  const script = getTeacherScript(unit, progress);
  const helpLadder = getTeacherHelpLadder(unit);
  const activeHelp = helpLadder[Math.min(helpStepIndex, helpLadder.length - 1)];
  const room = getCampusRoom(unit.room);
  const safePracticeCount = Math.min(practiceCount, MASTERED_PRACTICE_TARGET);
  const activePhaseIndex = safePracticeCount <= 0
    ? 2
    : safePracticeCount < MASTERED_PRACTICE_TARGET
      ? 3
      : 4;
  const activePhase = SCHOOL_LESSON_PHASES[activePhaseIndex];
  const getPhaseStatus = (index: number) => {
    if (index < activePhaseIndex) return 'Done';
    if (index === activePhaseIndex) return 'Now';
    return 'Next';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleChange = () => setIsCollapsed(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [unit.id]);

  useEffect(() => {
    setHelpStepIndex(0);
  }, [unit.id]);

  const readTeacherPrompt = async () => {
    try {
      await speakAsync(script.greeting, 0.9, 1.1, 'gentle');
    } catch {
      // Static voice may not be generated yet. The visible script still guides the lesson.
    }
  };

  const readHelpPrompt = async () => {
    try {
      await speakAsync(`${AI_TEACHER.name} help. ${activeHelp.prompt}`, 0.88, 1.05, 'gentle');
    } catch {
      // Static voice may not be generated yet. The visible help ladder still guides the lesson.
    }
  };

  const showNextHelpStep = () => {
    setHelpStepIndex(current => Math.min(current + 1, helpLadder.length - 1));
  };

  if (isCollapsed) {
    return (
      <div className="pointer-events-none fixed left-3 right-3 top-3 z-30 mx-auto max-w-xl">
        <div
          data-testid="teacher-room-coach-compact"
          className="pointer-events-auto rounded-[22px] border-4 border-white/80 bg-white/95 p-2 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <GraduationCap size={23} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
                {AI_TEACHER.name} in {room.classroomName}
              </p>
              <p className="truncate text-sm font-black text-slate-900">{unit.title}</p>
              <p className="text-[11px] font-bold text-indigo-700">
                {safePracticeCount}/{MASTERED_PRACTICE_TARGET} mastery - Now: {activePhase.label}
              </p>
            </div>
            <button
              onClick={onOpenLessonBoard}
              aria-label="Open teacher lesson board"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow"
            >
              <BookOpen size={17} />
            </button>
            <button
              onClick={readTeacherPrompt}
              aria-label="Listen to teacher prompt"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900 shadow"
            >
              <Volume2 size={17} />
            </button>
            <button
              onClick={showNextHelpStep}
              aria-label="Show next teacher help step"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow"
            >
              <Lightbulb size={17} />
            </button>
            <button
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand teacher coach"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow"
            >
              <ChevronDown size={19} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed left-3 right-3 top-3 z-30 mx-auto max-w-4xl">
      <div
        data-testid="teacher-room-coach"
        className="pointer-events-none rounded-[24px] border-4 border-white/80 bg-white/95 p-3 shadow-2xl backdrop-blur"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <GraduationCap size={26} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-indigo-600">
                {AI_TEACHER.name} is teaching in {room.classroomName}
              </p>
              <h2 className="truncate text-base font-black text-slate-900">{unit.title}</h2>
              <p className="line-clamp-2 text-xs font-semibold text-slate-600">{script.teach}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:w-[440px] md:grid-cols-4">
            <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-center">
              <p className="text-lg font-black text-indigo-800">{safePracticeCount}/{MASTERED_PRACTICE_TARGET}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-indigo-500">mastery</p>
            </div>
            <button
              onClick={onOpenLessonBoard}
              className="pointer-events-auto inline-flex items-center justify-center gap-1 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow hover:bg-indigo-700"
            >
              <BookOpen size={15} />
              Board
            </button>
            <button
              onClick={readTeacherPrompt}
              className="pointer-events-auto inline-flex items-center justify-center gap-1 rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-900 shadow hover:bg-emerald-200"
            >
              <Volume2 size={15} />
              Listen
            </button>
            <button
              onClick={showNextHelpStep}
              aria-label="Show next teacher help step"
              className="pointer-events-auto inline-flex items-center justify-center gap-1 rounded-2xl bg-amber-100 px-3 py-2 text-xs font-black text-amber-900 shadow hover:bg-amber-200"
            >
              <Lightbulb size={15} />
              Help
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse teacher coach"
              className="pointer-events-auto inline-flex items-center justify-center gap-1 rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-800 shadow hover:bg-indigo-100"
            >
              <ChevronUp size={15} />
              Hide
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <div
            data-testid="teacher-lesson-path"
            className="rounded-2xl border border-indigo-100 bg-white px-3 py-2 sm:col-span-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">Lesson path</p>
                <p className="mt-1 text-xs font-bold text-slate-600">Mr. Atlas moves from teaching to exit ticket before mastery is saved.</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-black text-indigo-800">
                Now: {activePhase.label}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {SCHOOL_LESSON_PHASES.map((phase, index) => {
                const status = getPhaseStatus(index);
                return (
                  <div
                    key={phase.id}
                    className={`rounded-xl px-2 py-2 text-center ${
                      status === 'Done'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'Now'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.08em]">{status}</p>
                    <p className="mt-1 truncate text-[10px] font-black">{phase.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            data-testid="teacher-help-ladder"
            className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Teacher help ladder</p>
                <p className="mt-1 line-clamp-2 text-xs font-black text-amber-950">{activeHelp.label}: {activeHelp.prompt}</p>
                <p className="mt-1 line-clamp-2 text-[11px] font-bold text-amber-900">{activeHelp.parentMeaning}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-amber-900 shadow">
                {helpStepIndex + 1}/{helpLadder.length}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                onClick={readHelpPrompt}
                className="pointer-events-auto inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl bg-white px-2.5 py-1.5 text-[11px] font-black text-amber-900 shadow hover:bg-amber-100"
              >
                <Volume2 size={15} />
                Read help
              </button>
              <button
                onClick={showNextHelpStep}
                aria-label="Show next teacher help step"
                className="pointer-events-auto inline-flex shrink-0 items-center justify-center gap-1 rounded-2xl bg-amber-500 px-2.5 py-1.5 text-[11px] font-black text-white shadow hover:bg-amber-600"
              >
                <Lightbulb size={14} />
                Next help
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-sky-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">Guided practice</p>
            <p className="mt-1 text-xs font-bold text-sky-950">{script.guided}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Exit ticket</p>
            <p className="mt-1 text-xs font-bold text-emerald-950">{script.exitTicket}</p>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-amber-50 px-3 py-2 text-amber-800">
            <CheckCircle2 size={20} />
            <span className="ml-1 text-xs font-black">Saved for parents</span>
          </div>
        </div>
      </div>
    </div>
  );
};
