import React from 'react';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

interface LegalInfoProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalInfo: React.FC<LegalInfoProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="w-screen h-screen overflow-y-auto bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <button
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-slate-700 shadow hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              {isPrivacy ? <ShieldCheck size={28} /> : <FileText size={28} />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-black">Kid Genius World</p>
              <h1 className="text-3xl font-black">{isPrivacy ? 'Privacy Notice' : 'Terms of Use'}</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">A CrateShip Studios learning app</p>
            </div>
          </div>

          {isPrivacy ? (
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                This notice explains how Kid Genius World handles child learning data in the web app and which choices stay under parent control.
              </p>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">App Owner</h2>
                <p>Kid Genius World is created and operated by CrateShip Studios. Parents may see CrateShip Studios on checkout, receipts, support, or business pages because it is the studio brand behind this learning app.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Current Data Storage</h2>
                <p>Child progress, grade selection, pet choice, achievements, accessibility settings, and local app preferences are stored in this browser using local storage unless a parent signs in and turns on Firebase cloud progress sync.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Optional Firebase Sync</h2>
                <p>When a parent creates or signs into a Firebase parent account and enables cloud sync, the app can save the active child profile and learning progress to Firebase for parent-managed access. Cloud sync is off by default.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Saved Media</h2>
                <p>Narration and story covers are served from saved static media files prepared by the app owner. The child-facing app should not send lesson text, story prompts, names, contact information, precise location, or other personal information to live media-generation APIs.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Parent Controls</h2>
                <p>Parents can review progress, adjust accessibility settings, manage Firebase sign-in and sync, warm voice cache, export local progress, and reset local progress from the parent dashboard after passing a grown-up check.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Privacy Requests</h2>
                <p>Parents should have a clear way to request help, review stored data, turn off optional sync, delete a child profile, and manage any account or subscription choices tied to their family.</p>
              </section>
            </div>
          ) : (
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                These terms describe the intended use of Kid Genius World for supervised family learning.
              </p>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Studio Brand</h2>
                <p>Kid Genius World is a CrateShip Studios product. Stripe checkout, receipts, or support references may use CrateShip Studios as the business brand for this app.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Educational Use</h2>
                <p>Kid Genius World is an educational practice app for children with parent supervision. It does not replace a teacher, school curriculum, therapist, or medical professional.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Parent Responsibility</h2>
                <p>A parent or guardian should choose the appropriate grade level, monitor usage, and decide whether optional saved voice and illustrated cover features are enabled.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Content Quality</h2>
                <p>Lessons are designed for age-appropriate practice and should be used with parent judgment for reading level, accessibility, factual accuracy, and cultural fit.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Accounts and Billing</h2>
                <p>Account changes, support requests, subscription choices, receipts, cancellation, and privacy requests should be handled by a parent or guardian outside the child learning area.</p>
              </section>
            </div>
          )}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
            Copyright 2026 CrateShip Studios. Kid Genius World by CrateShip Studios. Visit{' '}
            <a
              href="https://crateshipstudios.com"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-700 underline"
            >
              crateshipstudios.com
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};
