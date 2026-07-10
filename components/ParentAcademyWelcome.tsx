import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  LockKeyhole,
  LogIn,
  PlayCircle,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';

interface ParentAcademyWelcomeProps {
  signedIn: boolean;
  signedInEmail?: string | null;
  authBusy: boolean;
  authStatus: string;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  onGoogleSignIn: () => void;
  onContinue: () => void;
  onUseDifferentAccount: () => void;
  onOpenTour: () => void;
  onScrollToAccount: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenSupport: () => void;
}

const parentProof = [
  { icon: BookOpenCheck, title: 'A real school-day path', detail: 'Reading and speech lead, math follows, and creative periods finish the day.' },
  { icon: Brain, title: 'Mr. Atlas teaches', detail: 'Each period moves from a model to guided practice, independent work, and an exit ticket.' },
  { icon: BarChart3, title: 'Progress has meaning', detail: 'Parents see skills, accuracy, review needs, mastery evidence, and next steps.' },
] as const;

export const ParentAcademyWelcome: React.FC<ParentAcademyWelcomeProps> = ({
  signedIn,
  signedInEmail,
  authBusy,
  authStatus,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onCreateAccount,
  onGoogleSignIn,
  onContinue,
  onUseDifferentAccount,
  onOpenTour,
  onScrollToAccount,
  onOpenPrivacy,
  onOpenTerms,
  onOpenSupport,
}) => (
  <main className="parent-academy-welcome h-screen w-screen overflow-y-auto bg-[#f7faf8] text-slate-950">
    <section className="relative min-h-[600px] overflow-hidden">
      <picture className="absolute inset-0">
        <source media="(max-width: 640px)" srcSet="/academy/academy-atrium-hero-mobile.webp" />
        <img
          src="/academy/academy-atrium-hero.webp"
          alt="Mr. Atlas greeting families inside Genius World School"
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div className="academy-parent-hero-shade absolute inset-0" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10 lg:py-6">
        <div className="flex min-w-0 items-center gap-3 text-white">
          <img src="/brand/logo-option-1-genius-globe.png" alt="" className="h-12 w-12 rounded-[14px] shadow-lg" />
          <div>
            <p className="text-lg font-black leading-tight sm:text-xl">Kid Genius World</p>
            <p className="hidden text-xs font-bold text-white/80 sm:block">By CrateShip Studios</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-slate-950/30 px-3 py-2 text-xs font-extrabold text-white backdrop-blur-md sm:px-4 sm:text-sm">
          <ShieldCheck size={17} /> Parent access
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-[1200px] items-end px-4 pb-10 pt-24 sm:px-7 lg:px-10">
        <div className="max-w-[700px] text-white">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/40 bg-slate-950/35 px-4 py-2 text-xs font-black uppercase backdrop-blur-md">
            <LockKeyhole size={16} /> Parent-controlled school
          </p>
          <h1 className="text-4xl font-black leading-tight drop-shadow-2xl sm:text-5xl lg:text-6xl">Welcome to Genius World School</h1>
          <p className="mt-4 max-w-[640px] text-base font-bold leading-7 text-white drop-shadow-lg sm:text-lg">
            Meet the teacher, see the daily path, and open the right private family profile before class begins.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              id="school-tour-preview"
              type="button"
              onClick={onOpenTour}
              aria-label="Watch School Tour"
              className="academy-secondary-action academy-secondary-action--dark"
            >
              <PlayCircle size={23} /> See a school day
            </button>
            <button type="button" onClick={onScrollToAccount} className="academy-primary-action academy-primary-action--compact">
              <UserRoundCheck size={22} /> Create Parent Account
            </button>
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-7">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
        {parentProof.map(({ icon: Icon, title, detail }, index) => (
          <article key={title} className="flex gap-4 lg:border-r lg:border-slate-200 lg:pr-8 last:border-r-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-indigo-50 text-indigo-700">
              <Icon size={23} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">School promise {index + 1}</p>
              <h2 className="mt-1 text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section id="parent-account-panel" className="scroll-mt-4 bg-[#eef7f4] px-4 py-14 sm:px-7 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <p className="academy-eyebrow">Private parent access</p>
          <h2 className="academy-section-title">Sign in first. Then choose the child who is learning today.</h2>
          <p className="academy-section-copy">
            Every family account keeps its own child profiles, grade placement, school-day progress, rewards, review work, and parent reports.
          </p>
          <div className="mt-7 grid gap-3">
            {[
              'No child profile opens before parent authentication',
              'Each child keeps separate progress and recommendations',
              'Parent PIN protects reports, settings, and billing',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="academy-auth-panel">
          <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-amber-100 p-3 text-amber-800">
              <LockKeyhole size={26} />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">Parent account</p>
              <h2 className="mt-1 text-2xl font-black">Sign in or create account</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">Parents unlock the school. Children start inside the right family profile.</p>
            </div>
          </div>

          {signedIn ? (
            <div className="mt-6 grid gap-4">
              <div className="border-l-4 border-emerald-500 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-black uppercase text-emerald-700">Signed in parent</p>
                <p className="mt-1 break-words text-lg font-black text-emerald-950">{signedInEmail || 'Parent account'}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900">Continue to this family&apos;s saved child profiles and school progress.</p>
              </div>
              <button type="button" onClick={onContinue} disabled={authBusy} className="academy-auth-primary">
                Continue as Parent <ArrowRight size={20} />
              </button>
              <button type="button" onClick={onUseDifferentAccount} disabled={authBusy} className="academy-auth-secondary">
                Use Different Account
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-black text-slate-800">
                Parent email
                <input
                  value={email}
                  onChange={event => onEmailChange(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="Parent email"
                  className="academy-auth-input"
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-800">
                Password
                <input
                  value={password}
                  onChange={event => onPasswordChange(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  className="academy-auth-input"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={onSignIn} disabled={authBusy} className="academy-auth-primary">
                  <LogIn size={19} /> Sign In Parent
                </button>
                <button type="button" onClick={onCreateAccount} disabled={authBusy} className="academy-auth-create">
                  Create Account
                </button>
              </div>
              <button type="button" onClick={onGoogleSignIn} disabled={authBusy} className="academy-auth-secondary">
                Continue with Google
              </button>
            </div>
          )}

          {authStatus && (
            <div role="status" className="mt-5 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
              {authStatus}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-200 pt-5 text-sm font-bold text-slate-600">
            <button type="button" onClick={onOpenPrivacy} className="hover:text-slate-950">Privacy</button>
            <button type="button" onClick={onOpenTerms} className="hover:text-slate-950">Terms</button>
            <button type="button" onClick={onOpenSupport} className="hover:text-slate-950">Parent Support</button>
          </div>
        </div>
      </div>
    </section>

    <footer className="bg-[#0b1f30] px-4 py-7 text-slate-300 sm:px-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-black text-white">Kid Genius World by CrateShip Studios</p>
        <p className="text-xs font-bold">Parent-guided enrichment · Not an accredited school · © 2026</p>
      </div>
    </footer>
  </main>
);
