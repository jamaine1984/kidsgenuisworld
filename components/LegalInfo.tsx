import React from 'react';
import { ArrowLeft, FileText, LifeBuoy, Mail, ShieldCheck } from 'lucide-react';

export type LegalPageType = 'privacy' | 'terms' | 'support';

const supportEmail = 'crateshipstudios@gmail.com';
const supportHref = `mailto:${supportEmail}?subject=Kid%20Genius%20World%20Parent%20Support`;

interface LegalInfoProps {
  type: LegalPageType;
  onBack: () => void;
}

export const LegalInfo: React.FC<LegalInfoProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';
  const isSupport = type === 'support';
  const title = isPrivacy ? 'Privacy Notice' : isSupport ? 'Parent Support' : 'Terms of Use';

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
              {isPrivacy ? <ShieldCheck size={28} /> : isSupport ? <LifeBuoy size={28} /> : <FileText size={28} />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-black">Kid Genius World</p>
              <h1 className="text-3xl font-black">{title}</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">A CrateShip Studios learning app</p>
              <p className="mt-1 text-xs font-bold text-slate-400">Last updated May 10, 2026</p>
            </div>
          </div>

          {isPrivacy ? (
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                This notice explains how Kid Genius World handles child learning data in the web app and which choices stay under parent control.
              </p>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">App Owner</h2>
                <p>
                  Kid Genius World is created and operated by CrateShip Studios. Parents may see CrateShip Studios on checkout,
                  receipts, support, or business pages because it is the studio brand behind this learning app. Parent support
                  requests go to <a href={supportHref} className="font-black text-indigo-700 underline">{supportEmail}</a>.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Child-Directed Privacy</h2>
                <p>
                  Kid Genius World is designed for children with parent supervision. A parent or guardian must complete setup,
                  review this notice, and approve the child learning experience before paid rooms open. We do not ask children
                  for an email address, phone number, precise location, open chat message, or public profile.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Information We Handle</h2>
                <p>
                  The app can store a child profile nickname, grade level, learning progress, scores, room visits, achievements,
                  pet choice, accessibility settings, and parent-approved learning preferences. Parent sign-in uses Firebase
                  Authentication. Stripe handles checkout, trials, subscriptions, receipts, and billing management.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Current Data Storage</h2>
                <p>
                  Child progress starts in this browser using local storage. If a parent creates or signs into a Firebase
                  parent account and turns on cloud sync, the app can save the active child profile and learning progress to
                  Firebase for parent-managed multi-device access. Cloud sync is parent controlled.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Saved Media and Voice</h2>
                <p>
                  Narration and story covers are served from saved static media files prepared by the app owner. The child-facing
                  app should not send lesson text, story prompts, names, contact information, precise location, or other personal
                  information to live media-generation APIs during normal use.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Parent Rights and Controls</h2>
                <p>
                  Parents can review progress, export local progress, adjust accessibility settings, manage Firebase sign-in
                  and sync, delete or reset local progress, and manage subscriptions from parent-only areas after a grown-up
                  check. A parent may contact support to review stored account data, request deletion, turn off optional sync,
                  or refuse further collection tied to their family account.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Sharing, Ads, and Service Providers</h2>
                <p>
                  We do not sell child personal information and do not run behavioral advertising in the child learning area.
                  We use service providers only to operate the app, including Firebase for parent authentication/cloud data,
                  Firebase Hosting for the web app, Stripe for billing, saved static media hosting for voice and images,
                  and the device browser's built-in voice when a saved narration file is unavailable.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Security and Retention</h2>
                <p>
                  We use parent-gated controls, Firebase security rules, static media files, and server-side billing verification
                  to protect family data. We keep child learning data only as long as needed to provide the app, support the
                  parent account, meet legal obligations, or resolve billing/security issues.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Privacy Requests</h2>
                <p>
                  Parents can request help, data review, data deletion, subscription help, or account support by emailing{' '}
                  <a href={supportHref} className="font-black text-indigo-700 underline">{supportEmail}</a>.
                </p>
              </section>
            </div>
          ) : isSupport ? (
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                Parent support is handled by CrateShip Studios for Kid Genius World account, billing, privacy, and learning access questions.
              </p>
              <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Parent Support Email</h2>
                    <a href={supportHref} className="font-black text-indigo-700 underline">{supportEmail}</a>
                  </div>
                </div>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">What Parents Can Ask For</h2>
                <p>
                  Email support for sign-in help, child profile questions, privacy requests, progress review or deletion,
                  subscription/trial questions, Stripe receipt questions, cancellation help, or accessibility settings.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Billing Help</h2>
                <p>
                  Kid Genius World uses Stripe for the 3-day trial and monthly plans. Parents can manage billing from the
                  parent dashboard after signing into the same parent account used at checkout.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Privacy and Data Requests</h2>
                <p>
                  Parents can ask to review, export, correct, or delete family account data and child learning progress.
                  Include the parent account email used in Kid Genius World so support can locate the right account.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Studio Identity</h2>
                <p>
                  Checkout and receipts may show CrateShip Studios because CrateShip Studios is the business brand behind
                  Kid Genius World.
                </p>
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
                <p>Kid Genius World is an AI-powered educational practice app and parent-guided AI school experience for children with parent supervision. It is not accredited, is not a real school, does not issue grades, credits, diplomas, or transcripts, and does not replace a teacher, school curriculum, therapist, medical professional, or parent judgment.</p>
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
                <p>
                  Account changes, support requests, subscription choices, receipts, cancellation, and privacy requests should
                  be handled by a parent or guardian outside the child learning area. Paid access starts with a Stripe 3-day
                  free trial and then renews monthly unless the parent cancels through Stripe billing management.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-2">Support</h2>
                <p>
                  Parents can contact CrateShip Studios at{' '}
                  <a href={supportHref} className="font-black text-indigo-700 underline">{supportEmail}</a>
                  {' '}for billing, account, privacy, or learning access support.
                </p>
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
            . Parent support:{' '}
            <a href={supportHref} className="text-indigo-700 underline">{supportEmail}</a>.
          </div>
        </div>
      </div>
    </div>
  );
};
