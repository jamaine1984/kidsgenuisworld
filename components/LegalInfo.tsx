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
            </div>
          </div>

          {isPrivacy ? (
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                This draft notice explains how the current web app behaves before public launch. It is not a substitute for legal review.
              </p>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Current Data Storage</h2>
                <p>Child progress, grade selection, pet choice, achievements, accessibility settings, and local app preferences are stored in this browser using local storage.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">External Services</h2>
                <p>When configured by the app owner, narration and story cover generation may send lesson text or story-cover prompts through the app server to third-party API providers. Do not collect names, contact information, precise location, or other personal information from children without a full COPPA-compliant consent flow.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Parent Controls</h2>
                <p>Parents can review progress, adjust accessibility settings, warm voice cache, and reset local progress from the parent dashboard after passing a grown-up check.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Before Public Launch</h2>
                <p>Publish a finalized privacy policy, terms, contact method, data retention policy, deletion request process, and parental consent flow before adding accounts, analytics, subscriptions, payments, or synced child profiles.</p>
              </section>
            </div>
          ) : (
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                These draft terms describe the intended use of Kid Genius World during development and beta testing.
              </p>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Educational Use</h2>
                <p>Kid Genius World is an educational practice app for children with parent supervision. It does not replace a teacher, school curriculum, therapist, or medical professional.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Parent Responsibility</h2>
                <p>A parent or guardian should choose the appropriate grade level, monitor usage, and decide whether optional voice or generated image features are enabled.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Content Accuracy</h2>
                <p>Lessons should be reviewed before public launch for age fit, factual accuracy, reading level, accessibility, and cultural sensitivity.</p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Launch Requirement</h2>
                <p>Before commercial release, replace this draft with finalized legal terms reviewed for your target countries, app stores, payment model, and child-privacy obligations.</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
