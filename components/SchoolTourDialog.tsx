import React from 'react';
import { ArrowRight, CalendarCheck, LockKeyhole, PlayCircle, ShieldCheck, X } from 'lucide-react';

interface ClassPreviewItem {
  title: string;
  room: string;
}

interface TourStepItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  detail: string;
}

interface SchoolTourDialogProps {
  open: boolean;
  classPreview: ClassPreviewItem[];
  tourSteps: TourStepItem[];
  onClose: () => void;
  onStartSetup: () => void;
}

export const SchoolTourDialog: React.FC<SchoolTourDialogProps> = ({
  open,
  classPreview,
  tourSteps,
  onClose,
  onStartSetup,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#06131f]/80 px-3 py-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="school-tour-title">
      <div className="academy-tour-dialog max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-white shadow-2xl">
        <div className="relative min-h-[300px] overflow-hidden text-white sm:min-h-[360px]">
          <img
            src="/academy/academy-atrium-hero.webp"
            alt="Mr. Atlas welcoming students into Genius World School"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="academy-tour-hero-shade absolute inset-0" aria-hidden="true" />
          <button type="button" onClick={onClose} aria-label="Close school tour" className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-slate-950/40 text-white backdrop-blur-md hover:bg-slate-950/60">
            <X size={22} />
          </button>
          <div className="relative z-10 flex min-h-[300px] max-w-2xl flex-col justify-end p-6 sm:min-h-[360px] sm:p-9">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-slate-950/35 px-4 py-2 text-xs font-black uppercase backdrop-blur-md">
              <PlayCircle size={16} /> School tour
            </p>
            <h2 id="school-tour-title" className="mt-4 text-3xl font-black leading-tight drop-shadow-xl sm:text-5xl">See how a school day works</h2>
            <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-white drop-shadow-lg sm:text-base">
              Parent access opens the school, Mr. Atlas teaches each period, and every completed skill becomes evidence parents can understand.
            </p>
          </div>
        </div>

        <div className="grid gap-10 p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
          <section>
            <div className="flex items-center gap-3">
              <CalendarCheck className="text-indigo-600" size={25} />
              <div>
                <p className="text-xs font-black uppercase text-indigo-600">Today&apos;s campus preview</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">Core learning comes first</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-1 border-y border-slate-200 py-2">
              {classPreview.map((item, index) => (
                <div key={item.title} className="flex items-center gap-4 border-b border-slate-100 px-2 py-4 last:border-b-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-700">{index + 1}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">{item.title}</p>
                    <p className="mt-1 text-base font-black text-slate-950">{item.room}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 bg-emerald-50 px-4 py-4 text-sm font-bold leading-6 text-emerald-950">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={21} />
              Reading, speech, and math stay early in the day. Creative classes and review finish the schedule after core work.
            </div>
          </section>

          <section>
            <p className="text-xs font-black uppercase text-indigo-600">From parent sign-in to saved mastery</p>
            <div className="mt-4 grid gap-5">
              {tourSteps.map(({ icon: Icon, title, detail }, index) => (
                <article key={title} className="flex gap-4 border-b border-slate-200 pb-5 last:border-b-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#eef7f4] text-emerald-700">
                    <Icon size={23} />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Step {index + 1}</p>
                    <h3 className="mt-1 text-lg font-black text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <button type="button" onClick={onClose} className="academy-auth-secondary sm:w-auto">Keep Browsing</button>
          <button type="button" onClick={onStartSetup} className="academy-auth-primary sm:w-auto">
            <LockKeyhole size={18} /> Start Parent Setup <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
