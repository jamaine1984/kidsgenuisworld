import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Code2,
  FlaskConical,
  Languages,
  LockKeyhole,
  LogIn,
  Mic2,
  Palette,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

interface AcademyLandingProps {
  onStart: () => void;
  onTour: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenSupport: () => void;
}

const learningDay = [
  { label: 'Reading & Speech', detail: 'Phonics, fluency, and voice', icon: BookOpenCheck, tone: 'violet' },
  { label: 'Math', detail: 'Models, strategy, and practice', icon: Calculator, tone: 'sky' },
  { label: 'Science', detail: 'Explore, predict, and explain', icon: FlaskConical, tone: 'green' },
  { label: 'Creative Studio', detail: 'Art, music, and making', icon: Palette, tone: 'coral' },
] as const;

const schoolModel = [
  {
    icon: UserRoundCheck,
    title: 'Mr. Atlas teaches first',
    detail: 'Every period opens with a short model, a clear objective, and one worked example before independent practice.',
  },
  {
    icon: Mic2,
    title: 'Children hear and respond',
    detail: 'Questions, answer choices, stories, and feedback are read aloud with age-appropriate pacing and speech support.',
  },
  {
    icon: BarChart3,
    title: 'Parents see the evidence',
    detail: 'Completed periods, accuracy, missed skills, review work, and next recommendations stay tied to the child profile.',
  },
] as const;

const subjects = [
  { icon: BookOpenCheck, label: 'Reading' },
  { icon: Mic2, label: 'Speech' },
  { icon: Calculator, label: 'Math' },
  { icon: FlaskConical, label: 'Science' },
  { icon: Languages, label: 'Languages' },
  { icon: Code2, label: 'Coding' },
] as const;

export const AcademyLanding: React.FC<AcademyLandingProps> = ({
  onStart,
  onTour,
  onOpenPrivacy,
  onOpenTerms,
  onOpenSupport,
}) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="academy-landing h-screen w-screen overflow-y-auto bg-[#f7faf8] text-slate-950">
      <section className="academy-hero relative flex min-h-[760px] flex-col overflow-hidden lg:min-h-[880px]">
        <picture className="absolute inset-0">
          <source media="(max-width: 640px)" srcSet="/academy/academy-atrium-hero-mobile.webp" />
          <img
            src="/academy/academy-atrium-hero.webp"
            alt="Mr. Atlas welcoming students inside the Kid Genius World academy atrium"
            className="h-full w-full object-cover object-center"
          />
        </picture>
        <div className="academy-hero-shade absolute inset-0" aria-hidden="true" />

        <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10 lg:py-6">
          <button
            type="button"
            onClick={() => scrollTo('academy-top')}
            className="academy-brand flex min-w-0 items-center gap-3 text-left text-white"
            aria-label="Kid Genius World home"
          >
            <img
              src="/brand/logo-option-1-genius-globe.png"
              alt=""
              className="h-12 w-12 rounded-[14px] object-cover shadow-lg sm:h-14 sm:w-14"
            />
            <span className="hidden text-xl font-black drop-shadow sm:block lg:text-2xl">Kid Genius World</span>
          </button>

          <nav className="flex items-center gap-1 rounded-[18px] bg-slate-950/30 p-1.5 text-white shadow-xl backdrop-blur-md sm:gap-2" aria-label="Welcome navigation">
            <button type="button" onClick={() => scrollTo('learning-model')} className="academy-nav-link hidden sm:inline-flex">
              How It Works
            </button>
            <button type="button" onClick={() => scrollTo('parent-view')} className="academy-nav-link hidden md:inline-flex">
              For Parents
            </button>
            <button type="button" onClick={onStart} className="academy-nav-signin">
              <LockKeyhole size={17} />
              <span>Sign In</span>
            </button>
          </nav>
        </header>

        <div id="academy-top" className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-end px-4 pb-7 pt-16 text-center sm:px-6 lg:pb-9">
          <div className="max-w-[920px]">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/45 bg-slate-950/35 px-4 py-2 text-xs font-extrabold uppercase text-white shadow-lg backdrop-blur-md sm:text-sm">
              <Sparkles size={16} aria-hidden="true" />
              A parent-controlled AI learning campus
            </p>
            <h1 className="academy-hero-title text-5xl font-black leading-[0.98] text-white drop-shadow-2xl sm:text-6xl lg:text-7xl">
              Kid Genius World
            </h1>
            <p className="mx-auto mt-4 max-w-[760px] text-2xl font-black leading-tight text-white drop-shadow-xl sm:text-3xl lg:text-4xl">
              A school day built around your child.
            </p>
            <p className="mx-auto mt-4 max-w-[720px] text-base font-bold leading-7 text-white drop-shadow-lg sm:text-lg">
              Mr. Atlas teaches. Your child practices. You see the progress.
            </p>
          </div>

          <div className="mt-7 flex w-full max-w-[720px] flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onStart}
              aria-label="Start Adventure - Enter Genius World"
              className="academy-primary-action"
            >
              <LogIn size={25} aria-hidden="true" />
              Enter Genius World
              <ArrowRight size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onTour}
              aria-label="Watch School Tour"
              className="academy-secondary-action"
            >
              <PlayCircle size={25} aria-hidden="true" />
              See a school day
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-extrabold text-white drop-shadow-lg">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={18} /> Parent-controlled</span>
            <span className="inline-flex items-center gap-2"><LockKeyhole size={18} /> Private profiles</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={18} /> Ages 4–11</span>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/70 bg-white/95 shadow-[0_-18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-4 sm:px-7 lg:grid-cols-[270px_1fr] lg:items-center lg:px-10 lg:py-5">
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">Today at Genius World</p>
              <p className="mt-1 text-lg font-black text-slate-950">A focused four-period day</p>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {learningDay.map(({ label, detail, icon: Icon, tone }, index) => (
                <div key={label} className="academy-day-item" data-tone={tone}>
                  <span className="academy-day-icon"><Icon size={21} /></span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase text-slate-500">Period {index + 1}</span>
                    <span className="block truncate text-sm font-black text-slate-950">{label}</span>
                    <span className="hidden truncate text-xs font-bold text-slate-500 xl:block">{detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="learning-model" className="scroll-mt-4 bg-[#f7faf8] px-4 py-16 sm:px-7 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="academy-eyebrow">The Genius World method</p>
            <h2 className="academy-section-title">A teacher-led lesson, not a question conveyor belt.</h2>
            <p className="academy-section-copy">
              Children see one idea at a time, practice with support, explain what they know, and revisit missed skills before the app moves them ahead.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {schoolModel.map(({ icon: Icon, title, detail }, index) => (
              <article key={title} className="academy-method-step">
                <div className="academy-method-number">{index + 1}</div>
                <Icon size={30} className="text-indigo-600" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#10293f] px-4 py-16 text-white sm:px-7 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase text-emerald-300">More than practice</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Core learning first. Creativity and curiosity every day.</h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-slate-200">
              Reading, speech, and math lead the day. Science, languages, coding, geography, books, art, and music deepen the experience without rushing children into the next grade.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
            {subjects.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 border-b border-white/15 pb-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-emerald-200">
                  <Icon size={22} />
                </span>
                <span className="font-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="parent-view" className="scroll-mt-4 bg-white px-4 py-16 sm:px-7 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="academy-eyebrow">Built for parent trust</p>
            <h2 className="academy-section-title">Know what your child learned, not just how long they tapped.</h2>
            <p className="academy-section-copy">
              Every child keeps a separate profile. Parents can see completed periods, skill accuracy, mastery evidence, review needs, weekly movement, and the next recommended lesson.
            </p>
            <div className="mt-7 grid gap-3">
              {[
                'Parent account required before any child profile opens',
                'Private family profiles and Firebase-synced progress',
                'Daily, weekly, and monthly learning summaries',
                'Accessibility, narration, and session controls',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="academy-progress-preview" aria-label="Example parent progress summary">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-black uppercase text-indigo-600">This week</p>
                <p className="mt-1 text-2xl font-black text-slate-950">Learning is moving forward</p>
              </div>
              <BarChart3 className="text-indigo-600" size={32} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['18', 'skills practiced'],
                ['84%', 'accuracy'],
                ['4', 'periods mastered'],
              ].map(([value, label]) => (
                <div key={label} className="min-w-0 border-r border-slate-200 pr-3 last:border-r-0">
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-bold leading-4 text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 border-t border-slate-200 pt-5">
              <p className="text-xs font-black uppercase text-emerald-700">Mr. Atlas recommends</p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-700">Review short vowel sounds, then continue the next reading story.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f4] px-4 py-12 sm:px-7">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase text-emerald-700">Ready for the first bell?</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Open Genius World School.</h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <InstallAppButton className="academy-install-action" />
            <button type="button" onClick={onStart} className="academy-primary-action academy-primary-action--compact">
              <LogIn size={21} />
              Enter Genius World
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#0b1f30] px-4 py-8 text-slate-300 sm:px-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-option-1-genius-globe.png" alt="" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="font-black text-white">Kid Genius World</p>
              <p className="text-xs font-bold">By CrateShip Studios · © 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            <a href="/blog/" className="hover:text-white">Parent Guides</a>
            <button type="button" onClick={onOpenPrivacy} className="hover:text-white">Privacy</button>
            <button type="button" onClick={onOpenTerms} className="hover:text-white">Terms</button>
            <button type="button" onClick={onOpenSupport} className="hover:text-white">Parent Support</button>
          </div>
        </div>
      </footer>
    </main>
  );
};
