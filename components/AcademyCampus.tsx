import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  Brain,
  Brush,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Compass,
  CreditCard,
  FlaskConical,
  Gamepad2,
  Globe2,
  Languages,
  LockKeyhole,
  LogOut,
  Music2,
  Palette,
  PawPrint,
  Play,
  Puzzle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { ChildProfile, DEFAULT_ARCADE_PROGRESS, RoomType, UserProgress } from '../types';
import { playPop } from '../services/audioService';
import { getDailyMission, getUnitsForGrade, getWeeklyLearningPlan } from '../services/curriculum';
import {
  MASTERED_PRACTICE_TARGET,
  getCampusRoom,
  getNextSchoolStep,
  getSchoolDayPlan,
  getStudentPassportSummary,
  getTeacherAssignmentCards,
  getTeacherConferencePlan,
} from '../services/schoolMode';

export interface AcademyCampusProps {
  onEnterRoom: (room: RoomType, unitId?: string) => void;
  onOpenDashboard: () => void;
  onOpenAchievements: () => void;
  onOpenPet: () => void;
  onOpenGameArcade: () => void;
  onOpenSettings: () => void;
  onOpenBilling?: () => void;
  hasBillingAccess?: boolean;
  progress: UserProgress;
  profiles?: ChildProfile[];
  activeProfileId?: string;
  onSwitchChildProfile?: (profileId: string) => void;
  onLogOut?: () => void;
}

const roomConfig = [
  { room: RoomType.READING, icon: BookOpenCheck, scene: 'reading', accent: '#7257d5' },
  { room: RoomType.MATH, icon: Calculator, scene: 'math', accent: '#0786b6' },
  { room: RoomType.SCIENCE, icon: FlaskConical, scene: 'science', accent: '#18845b' },
  { room: RoomType.STORYBOOK, icon: BookOpenCheck, scene: 'storybook', accent: '#bd7120' },
  { room: RoomType.LANGUAGE, icon: Languages, scene: 'language', accent: '#c64565' },
  { room: RoomType.CODING, icon: Code2, scene: 'coding', accent: '#5b4bc4' },
  { room: RoomType.GEOGRAPHY, icon: Globe2, scene: 'geography', accent: '#087f89' },
  { room: RoomType.PUZZLE, icon: Puzzle, scene: 'puzzle', accent: '#167d73' },
  { room: RoomType.ART, icon: Palette, scene: 'art', accent: '#c24172' },
  { room: RoomType.MUSIC, icon: Music2, scene: 'music', accent: '#8546b6' },
] as const;

const getStatusLabel = (status: string) => {
  if (status === 'done') return 'Mastered';
  if (status === 'in-progress') return 'Now';
  if (status === 'due') return 'Review';
  if (status === 'locked') return 'Locked';
  return 'Ready';
};

export const AcademyCampus: React.FC<AcademyCampusProps> = ({
  onEnterRoom,
  onOpenDashboard,
  onOpenAchievements,
  onOpenPet,
  onOpenGameArcade,
  onOpenSettings,
  onOpenBilling,
  hasBillingAccess = false,
  progress,
  profiles = [],
  activeProfileId = '',
  onSwitchChildProfile,
  onLogOut,
}) => {
  const [showReviewQuest, setShowReviewQuest] = useState(false);
  const [showBreakCoach, setShowBreakCoach] = useState(false);
  const mission = getDailyMission(progress);
  const schoolDay = getSchoolDayPlan(progress);
  const nextSchoolStep = getNextSchoolStep(progress);
  const assignments = getTeacherAssignmentCards(progress);
  const passport = getStudentPassportSummary(progress);
  const conference = getTeacherConferencePlan(progress);
  const weeklyPlan = getWeeklyLearningPlan(progress).slice(0, 3);
  const completedPeriods = schoolDay.periods.filter(period => period.status === 'done').length;
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  const activeAssignment = assignments.find(card => card.room === nextSchoolStep.room) || assignments[0];
  const assignmentByRoom = useMemo(
    () => new Map(assignments.map(card => [card.room, card])),
    [assignments],
  );
  const unitsByRoom = useMemo(() => {
    const unitMap = new Map<RoomType, ReturnType<typeof getUnitsForGrade>[number]>();
    const completed = new Set(progress.completedUnitIds || []);
    const counts = progress.unitPracticeCounts || {};
    getUnitsForGrade(progress.currentGrade)
      .sort((first, second) => {
        const completionDifference = Number(completed.has(first.id)) - Number(completed.has(second.id));
        if (completionDifference !== 0) return completionDifference;
        return (counts[first.id] || 0) - (counts[second.id] || 0);
      })
      .forEach(unit => {
        if (!unitMap.has(unit.room)) unitMap.set(unit.room, unit);
      });
    return unitMap;
  }, [progress.completedUnitIds, progress.currentGrade, progress.unitPracticeCounts]);

  const activeRoomScene = roomConfig.find(item => item.room === nextSchoolStep.room)?.scene || 'reading';
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMinutes = progress.dailyStats?.find(day => day.date === todayKey)?.timeSpentMinutes || 0;
  const dailyLimit = progress.dailySessionLimitMinutes || 20;
  const isBreakDue = todayMinutes >= dailyLimit;
  const arcade = { ...DEFAULT_ARCADE_PROGRESS, ...(progress.arcadeProgress || {}) };

  const enterRoom = (room: RoomType, unitId?: string) => {
    playPop();
    onEnterRoom(room, unitId);
  };

  return (
    <div className="academy-campus h-full w-full overflow-y-auto bg-[#f2f6f4] text-slate-950 kid-scroll">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#0b1f30]/95 text-white shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1480px] items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/brand/logo-option-1-genius-globe.png" alt="" className="h-11 w-11 shrink-0 rounded-[13px] sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <p className="truncate text-base font-black sm:text-lg">Kid Genius World</p>
              <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-300">
                <span className="truncate">{activeProfile?.name || progress.childName || 'Learner'}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{progress.currentGrade}</span>
              </div>
            </div>
            {profiles.length > 1 && (
              <select
                value={activeProfileId}
                onChange={event => onSwitchChildProfile?.(event.target.value)}
                aria-label="Switch child profile"
                className="hidden min-h-11 max-w-[190px] rounded-[12px] border border-white/20 bg-white/10 px-3 text-sm font-extrabold text-white outline-none focus:border-sky-300 sm:block"
              >
                {profiles.map(profile => <option key={profile.id} value={profile.id} className="text-slate-950">{profile.name} · {profile.grade}</option>)}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-4 pr-2 text-xs font-extrabold text-slate-200 lg:flex">
              <span>{progress.stickers.length} stars</span>
              <span>Level {progress.currentLevel}</span>
            </div>
            {progress.pet && (
              <button type="button" onClick={onOpenPet} aria-label="Learning buddy" title="Learning buddy" className="academy-campus-icon-button">
                <PawPrint size={20} />
              </button>
            )}
            <button type="button" onClick={onOpenAchievements} aria-label="Achievements" title="Achievements" className="academy-campus-icon-button">
              <Trophy size={20} />
            </button>
            <button type="button" onClick={onOpenDashboard} aria-label="Student progress" title="Student progress" className="academy-campus-icon-button">
              <BarChart3 size={20} />
            </button>
            {hasBillingAccess && onOpenBilling && (
              <button type="button" onClick={onOpenBilling} className="academy-campus-header-action hidden md:inline-flex">
                <CreditCard size={18} /> Manage Billing
              </button>
            )}
            <button type="button" onClick={onOpenSettings} aria-label="Parent Settings" title="Settings" className="academy-campus-header-action">
              <Settings size={19} /><span className="hidden lg:inline">Parent Settings</span>
            </button>
            {onLogOut && (
              <button type="button" onClick={onLogOut} aria-label="Log out" title="Log out" className="academy-campus-icon-button">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="academy-campus-hero relative overflow-hidden text-white">
          <img src={`/academy/rooms/${activeRoomScene}.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="academy-campus-hero-shade absolute inset-0" aria-hidden="true" />
          <div className="relative z-10 mx-auto grid max-w-[1480px] gap-7 px-4 pb-5 pt-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:px-8 lg:pb-7 lg:pt-12">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-slate-950/35 px-3 py-2 backdrop-blur-md"><Clock3 size={15} /> School Bell</span>
                <span className="rounded-full bg-emerald-400 px-3 py-2 text-emerald-950">{nextSchoolStep.progressLabel}</span>
              </div>
              <p className="mt-5 text-sm font-black text-emerald-200">{nextSchoolStep.title}</p>
              <h1 className="mt-2 max-w-2xl text-4xl font-black leading-[1.02] drop-shadow-xl sm:text-5xl">{activeAssignment?.title || mission.title}</h1>
              <p className="mt-4 max-w-xl text-base font-bold leading-7 text-white drop-shadow-md">{activeAssignment?.objective || mission.objective}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  data-testid="daily-mission-card"
                  aria-label={`Start today's mission: ${mission.title}`}
                  onClick={() => enterRoom(nextSchoolStep.room, nextSchoolStep.unitId || mission.id)}
                  className="academy-campus-primary"
                >
                  <Play size={21} fill="currentColor" /> {nextSchoolStep.actionLabel || 'Start lesson'} <ChevronRight size={19} />
                </button>
                <button type="button" onClick={() => setShowReviewQuest(true)} className="academy-campus-secondary">
                  <RefreshCw size={20} /> Review Quest
                </button>
              </div>
            </div>

            <div data-testid="school-bell-strip" className="academy-school-bell-strip" aria-label="Today's school day schedule">
              <div className="flex items-end justify-between gap-3 border-b border-white/15 pb-4">
                <div>
                  <p className="text-xs font-black uppercase text-sky-200">Today&apos;s periods</p>
                  <p className="mt-1 text-xl font-black">{completedPeriods}/{schoolDay.periods.length} complete</p>
                </div>
                <span className="text-xs font-extrabold text-white/75">Finish each mastery gate to unlock the next period.</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {schoolDay.periods.map((period, index) => {
                  const locked = period.status === 'locked';
                  const label = getStatusLabel(period.status);
                  return (
                    <button
                      key={period.id}
                      type="button"
                      disabled={locked}
                      onClick={() => enterRoom(period.room, period.unitId)}
                      className="academy-period-button"
                      data-status={period.status}
                      aria-label={`${index + 1} ${label} ${period.label} ${period.proof}`}
                    >
                      <span className="academy-period-number">{index + 1}</span>
                      <span className="min-w-0 text-left">
                        <span className="block text-[10px] font-black uppercase text-white/70">{index === schoolDay.periods.length - 1 ? 'Last Period:' : label}</span>
                        <span className="block whitespace-normal text-xs font-black leading-tight text-white sm:truncate sm:text-sm">{period.label}</span>
                      </span>
                      {period.status === 'done' ? <CheckCircle2 size={16} className="ml-auto shrink-0 text-emerald-300" /> : locked ? <LockKeyhole size={15} className="ml-auto shrink-0 text-white/45" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="School day choices">
            <button type="button" onClick={() => setShowReviewQuest(true)} className="academy-campus-quick-action">
              <RefreshCw size={24} className="text-indigo-600" />
              <span><strong>Review Quest</strong><small>Bring back missed skills</small></span>
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => enterRoom(RoomType.STUDY)} className="academy-campus-quick-action">
              <Brain size={24} className="text-emerald-700" />
              <span><strong>Study Zone</strong><small>Personal practice plan</small></span>
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={() => enterRoom(RoomType.STORYBOOK)} className="academy-campus-quick-action">
              <BookOpenCheck size={24} className="text-amber-700" />
              <span><strong>Story Time</strong><small>Read and comprehend</small></span>
              <ChevronRight size={18} />
            </button>
            <button type="button" onClick={onOpenGameArcade} className="academy-campus-quick-action" aria-label="Game Arcade">
              <Gamepad2 size={24} className="text-rose-600" />
              <span><strong>Game Arcade</strong><small>{arcade.totalWins || 0} learning wins</small></span>
              <ChevronRight size={18} />
            </button>
          </section>

          <section className="mt-14" aria-labelledby="academy-campus-title">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="academy-eyebrow">School Campus</p>
                <h2 id="academy-campus-title" className="mt-2 text-3xl font-black sm:text-4xl">Choose a classroom</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Every room keeps the same teacher rhythm: learn, watch, practice, explain, and save proof.</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-600"><Compass size={20} /> {roomConfig.length} learning rooms</div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {roomConfig.map(({ room, icon: Icon, scene, accent }) => {
                const assignment = assignmentByRoom.get(room);
                const unit = unitsByRoom.get(room);
                const roomMeta = getCampusRoom(room);
                const practiceCount = assignment?.practiceCount || 0;
                return (
                  <button
                    key={room}
                    type="button"
                    data-testid={`room-card-${room}`}
                    aria-label={`Enter ${roomMeta.classroomName}`}
                    onClick={() => enterRoom(room, assignment?.unitId || unit?.id)}
                    className="academy-room-card group"
                    style={{ '--room-accent': accent } as React.CSSProperties}
                  >
                    <div className="academy-room-image-wrap">
                      <img src={`/academy/rooms/${scene}.webp`} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                      <span className="academy-room-icon"><Icon size={22} /></span>
                      <span className="academy-room-progress">{Math.min(practiceCount, MASTERED_PRACTICE_TARGET)}/{MASTERED_PRACTICE_TARGET}</span>
                    </div>
                    <div className="p-5 text-left">
                      <p className="text-xs font-black uppercase" style={{ color: accent }}>{schoolDay.periods.some(period => period.room === room) ? 'Today’s schedule' : roomMeta.subject}</p>
                      <h3 className="mt-2 text-xl font-black text-slate-950">{roomMeta.classroomName}</h3>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{assignment?.title || unit?.title || roomMeta.detail}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-slate-900">Enter classroom <ChevronRight size={17} /></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section data-testid="teacher-assignment-cards" className="mt-14 border-y border-slate-200 py-8">
            <details>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <p className="academy-eyebrow">Teacher Assignment Cards</p>
                  <h2 className="mt-2 text-2xl font-black">See what Mr. Atlas assigned</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Objectives, examples, parent notes, and the mastery rubric are available without crowding the child&apos;s home screen.</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"><ChevronRight size={22} /></span>
              </summary>
              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                {assignments.map(card => (
                  <button key={card.unitId} type="button" onClick={() => enterRoom(card.room, card.unitId)} className="academy-assignment-row">
                    <div>
                      <p className="text-xs font-black uppercase text-indigo-600">{card.classroomName}</p>
                      <h3 className="mt-1 text-lg font-black">{card.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{card.objective}</p>
                      <p className="mt-3 text-xs font-black text-slate-500">Mastery rubric</p>
                      <p className="mt-1 text-sm font-bold text-slate-800">{card.masteryRubric}</p>
                    </div>
                    <ChevronRight className="shrink-0 text-slate-400" size={21} />
                  </button>
                ))}
              </div>
            </details>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            <div data-testid="student-passport-conference" className="academy-campus-report-band">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="academy-eyebrow">Learning Passport</p>
                  <h2 className="mt-2 text-2xl font-black">Passport Stamp Collection</h2>
                </div>
                <Award size={30} className="text-amber-600" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  [String(passport.evidenceCount), 'proof saved'],
                  [String(passport.reflectionCount), 'reflections'],
                  [String(passport.masteryCount), 'mastered'],
                ].map(([value, label]) => (
                  <div key={label} className="border-r border-slate-200 last:border-r-0">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5 text-sm font-semibold leading-6 text-slate-700">
                <p><strong>Teacher conference question:</strong> {passport.teacherConferenceQuestion}</p>
                <p className="mt-3"><strong>Next stamp target:</strong> {passport.nextStampTarget}</p>
              </div>
            </div>

            <div data-testid="student-teacher-conference-plan" className="academy-campus-report-band">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="academy-eyebrow">Teacher conference plan</p>
                  <h2 className="mt-2 text-2xl font-black">{conference.headline}</h2>
                </div>
                <Brain size={30} className="text-indigo-600" />
              </div>
              <div className="mt-6 grid gap-4 text-sm font-semibold leading-6 text-slate-700">
                <p><strong>Teacher move:</strong> {conference.teacherMove}</p>
                <p><strong>Student can say:</strong> {conference.studentCanSay}</p>
                <p><strong>Review plan:</strong> {conference.reviewPlan}</p>
              </div>
            </div>
          </section>

          <div data-testid="school-day-tracker" hidden={completedPeriods === 0} className="mt-8 border-l-4 border-emerald-500 bg-emerald-50 px-5 py-4">
            <p className="font-black text-emerald-950">School-day progress</p>
            <p className="mt-1 text-sm font-bold text-emerald-900">{schoolDay.periods.map(period => `${period.label}: ${getStatusLabel(period.status)}`).join(' · ')}</p>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-slate-200 pt-8 sm:flex-row sm:items-center">
            <div>
              <p className="academy-eyebrow">Healthy pacing</p>
              <p className="mt-2 text-lg font-black">{todayMinutes}/{dailyLimit} learning minutes today</p>
            </div>
            <button type="button" onClick={() => setShowBreakCoach(true)} className="academy-auth-secondary sm:w-auto" aria-label="Offline Break">
              <Clock3 size={19} /> Offline Break
            </button>
          </div>
        </div>
      </main>

      {showReviewQuest && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06131f]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="review-quest-title">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[24px] bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="academy-eyebrow">Quick review helps learning stick</p>
                <h2 id="review-quest-title" className="mt-2 text-3xl font-black">Explain it again</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Mr. Atlas brings back a small set of ideas before they fade.</p>
              </div>
              <button type="button" onClick={() => setShowReviewQuest(false)} aria-label="Close Review Quest" className="academy-campus-icon-button academy-campus-icon-button--light"><X size={20} /></button>
            </div>
            <div className="mt-7 grid gap-3">
              {weeklyPlan.map(({ unit }, index) => (
                <button key={unit.id} type="button" onClick={() => enterRoom(unit.room, unit.id)} className="academy-assignment-row">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-black text-indigo-700">{index + 1}</span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-black uppercase text-indigo-600">{getCampusRoom(unit.room).classroomName}</p>
                    <p className="mt-1 text-base font-black">{unit.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{unit.successCheck}</p>
                  </div>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showBreakCoach && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#06131f]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="break-coach-title">
          <div className="w-full max-w-xl rounded-[24px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="academy-eyebrow">Healthy pacing</p>
                <h2 id="break-coach-title" className="mt-2 text-3xl font-black">{isBreakDue ? 'Time to pause' : 'Plan a healthy break'}</h2>
              </div>
              <Clock3 size={30} className="text-emerald-700" />
            </div>
            <div className="mt-7 grid gap-4">
              {[
                'Stand up, stretch, and take three slow breaths.',
                'Drink water or walk to another room for two minutes.',
                'Tell a grown-up one thing you learned before returning.',
              ].map((step, index) => (
                <div key={step} className="flex gap-4 border-b border-slate-200 pb-4 last:border-b-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-800">{index + 1}</span>
                  <div><p className="text-xs font-black uppercase text-slate-400">Break step {index + 1}</p><p className="mt-1 text-sm font-bold leading-6 text-slate-700">{step}</p></div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setShowBreakCoach(false)} className="academy-auth-primary mt-7">I Took a Break</button>
          </div>
        </div>
      )}
    </div>
  );
};
