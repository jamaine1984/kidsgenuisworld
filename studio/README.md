# Kid Genius World Studio

The illustrated Little Studio / Maker Lab web app for grades 1-3. Theo, the brown bear in a blue apron, appears in the home, lessons, games and narrated examples. The primary website is https://kid-genius-world.com; the earlier app and existing publisher pages remain available.

## Develop and verify

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The production frontend is `dist/client`. `npm run dev:cloudflare` serves the compiled frontend and private backup service at port 8789. Restart it after rebuilding if the Windows asset watcher stops. Sites compatibility files are retained; `npm run test:sites` checks that separate runtime.

## Learning and narration

English and Spanish each offer 200 math activities across five sections and 240 reading activities across six sections per grade: 1,320 activities per language, with 40 activities per section. Spanish reading has its own 720 native activities covering sounds, syllables, spelling, vocabulary, comprehension and fluency, plus 24 Spanish books and 60 writing prompts. Math content and exposure identity are shared across languages; reading content and exposure identity remain language-specific. Entries have grade-specific question generators; activity counts do not mean every question is infinite. Missions, dictation, writing, optional local read-aloud practice, starting-point checks, daily suggestions and parent reports use the selected language.

Learner-wide exposure history prevents reused questions from being assigned again, including across overlapping activities and imported backups. Exhausted banks offer another activity. Replayable narration and unfinished work remain available. Supported answers are separate from independent checks; retention needs fresh checks on a later day. Automated checks and standards links do not establish external curriculum approval, full school-program coverage or guaranteed outcomes.

Browser speech supplies the voice throughout. No ElevenLabs key is required. Remotion examples match the exact question and narration. The public Take a tour player gives reading approximately 30 seconds, math 30 seconds, and the app overview 60 seconds, with a HyperFrames title composition. Captions, replay, chapters and slower speech are available; long spoken steps can extend the nominal two-minute duration.

The header language switch selects English or Español throughout the studio, parent tools and native narrated tour. Spanish speech selects an available Spanish browser voice; it never substitutes an English voice when Spanish is missing. Voice availability depends on the browser/device, with written guidance retained. See `design/spanish-curriculum.md` for sequencing, primary references and validation limits. Existing publisher articles and the explicitly labeled earlier app remain English.

## Parent membership

Parent authentication and authoritative billing use the existing Kid Genius World Firebase project and Stripe integration. New checkout uses the existing live USD $4.99 monthly price; the first payment is collected at checkout. Existing subscriptions retain their original terms. A server access response unlocks lessons; URL flags never grant access. Parent accounts have separate device progress and resumable lessons. Earlier free studio progress is imported only by a signed-in parent.

Stripe card details remain outside the frontend. `firebase-billing/functions` is the billing release source. Its private `.env` and dependencies are excluded from Git. Do not deploy saved configuration from an older app blindly: it differed from the running production credentials. `scripts/prepare-billing-release.cjs` was used to preserve the live runtime configuration during the release.

The Cloudflare worker continues serving optional encrypted progress backups. Its older email-account and Stripe implementation stays disabled; Firebase handles membership. Backups expire 30 days after the latest save; the parent holds the decryption code. Recordings and speech transcripts are not backed up.

## Publish safely

The frontend is an overlay on the current Firebase Hosting version, preserving `/legacy/`, publisher articles, assets, sitemap paths, billing rewrites and 404 behavior. `scripts/release-studio.cjs` creates a recoverable rollback and preview before publication. Inspect its release/channel identifiers before using it for another release. Never replace the primary site with the earlier app's whole `dist` directory.

The release checks covered 48 tests, TypeScript, the production build, an unpaid $4.99 Checkout quote with no subscription creation, ownership rejection, quote reuse, and 59 sitemap entries / 64 served file hashes on preview and live. These checks did not complete a customer payment or cancellation. A live existing parent membership was also restored and shown active.

## Remaining work

English/Spanish switching and a native Spanish reading and phonics curriculum are requested and not implemented in this release. Google Play packaging, device testing, and school pilots remain future work. Preserve the approved illustrated homepage when extending the app.
