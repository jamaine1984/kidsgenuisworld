# Kid Genius World

Kid Genius World is a colorful web-only educational app for kids with guided daily missions, room-based learning, parent controls, local progress tracking, Firebase-ready cloud sync, static story-cover art, and saved human voice narration.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set private keys locally.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown by Vite.

## Production Build

Build the static web app:

```bash
npm run build
```

Serve the production build:

```bash
npm run serve
```

Set `PORT` if your host requires a specific port.

## Firebase Web App Setup

Firebase project:

- Project name: `kid genius world`
- Project ID: `kid-genius-world`
- Project number: `250508907300`

The Android and Apple app registrations in Firebase are not used for this web-only build. In Firebase Console, add a **Web app** and copy the Web SDK config into `.env.local` using the `VITE_FIREBASE_*` names from `.env.example`.

Required web env values:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=kid-genius-world.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kid-genius-world
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=250508907300
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Do not use the Android app ID (`1:250508907300:android:...`) as the web app ID. Firebase will generate a separate web `appId` after you add the Web app.

## Firebase Hosting

This repo now includes Firebase web hosting config:

- `firebase.json` serves the Vite build from `dist/`.
- `.firebaserc` points at project `kid-genius-world`.
- `firestore.rules` starts with parent-owned family records and denies everything else.
- `services/firebaseClient.ts` initializes the Firebase Web SDK only when web env values exist.
- `services/firebaseParentAuth.ts` wires parent email/password account creation, sign-in, sign-out, and family IDs.
- `services/firebaseProgressStore.ts` contains the first cloud progress-sync boundary for parent-owned child profiles.

Login and deploy:

```bash
npx firebase login
npm run firebase:deploy:hosting
```

Firebase Hosting is a static host for this app. It serves the React build and static story-cover files. For saved voice MP3s stored on Cloudflare R2, point media calls to the Cloudflare Worker before the production build:

```bash
VITE_MEDIA_API_BASE_URL=https://your-media-worker.example.com
```

Without `VITE_MEDIA_API_BASE_URL`, the Firebase-hosted build still shows story covers, but saved voice narration only works for MP3 files hosted alongside Firebase.

Deploy Firestore rules:

```bash
npm run firebase:deploy:rules
```

Run local emulators:

```bash
npm run firebase:emulators
```

## Cloudflare Static Media

This repo uses Cloudflare Workers static assets plus R2-backed saved voice files:

- React/Vite build output is served from `dist/`.
- `/voice-cache/manifest.json` is a static manifest generated from `.tts-cache`.
- `/voice-cache/{hash}.mp3` is served from R2 binding `MEDIA_CACHE`.
- Story covers are static files in `public/story-covers/`.
- Runtime media generation APIs are disabled for the child-facing app.

One-time Cloudflare setup:

```bash
npm install -D wrangler
npx wrangler login
npx wrangler r2 bucket create kid-genius-world-media-cache
```

Legacy deploy:

```bash
npm run build
npx wrangler deploy
```

The GitHub remote for this local repo is expected to point at `jamaine1984/kidsgenuisworld`. Cloudflare can also connect to that GitHub repository for automatic deploys after the Worker project exists. For the current web-only Firebase direction, Firebase Hosting should be treated as the primary deploy target.

Run `npm run covers:static` after changing story titles or IDs. Run `npm run voice:static` after generating or migrating voice MP3s, then upload `.tts-cache` to R2 with `npm run r2:upload-tts`.

## Stripe Billing

Stripe checkout is parent-only and runs through the Cloudflare Worker. The child-facing React app never receives the Stripe secret key and never displays card forms.

Create a Stripe product named `Kid Genius World Family Plan`, then create two recurring monthly prices in the Stripe dashboard for the account `crateshipstudios@gmail.com`:

- Starter: `$4.99/month`
- Premium: `$9.99/month`

Then configure the Worker:

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put FIREBASE_WEB_API_KEY
```

Add the recurring Price IDs to `wrangler.jsonc` under `vars`:

```jsonc
"STRIPE_STARTER_PRICE_ID": "price_...",
"STRIPE_PREMIUM_PRICE_ID": "price_..."
```

For Firebase Hosting builds, point billing calls to the Cloudflare Worker:

```bash
VITE_BILLING_API_BASE_URL=https://kid-genius-world.koikes2021.workers.dev
```

The Worker verifies the signed-in Firebase parent token before creating Stripe Checkout or Billing Portal sessions.

## Human Voice Cache

Generate or migrate the app-wide human narration cache offline, then export the static manifest:

```bash
npm run voice:cache -- --dry-run
npm run voice:cache -- http://127.0.0.1:5177 --migrate-only
npm run voice:cache -- http://127.0.0.1:5177
npm run voice:static
npm run r2:upload-tts
```

Use `--migrate-only` when you want to reuse existing local cache files without spending ElevenLabs credits. Run the full generation command only when the ElevenLabs account has enough credits. The child app only loads saved MP3 files.

## QA Gates

Run the full launch gate before shipping:

```bash
npm run qa:all
```

This runs the production build, source-level product checks, launch-readiness checks, and tablet browser QA for kids-safety gates, legal surfaces, production assets, parent-gated flows, completion/reward loops, and common secret leaks.

Targeted checks:

```bash
npm run qa:source
npm run qa:launch
```

## Environment Variables

Private keys must stay in `.env.local` for development or hosted environment secrets for production. Do not commit real keys.

- `ELEVENLABS_API_KEY`: enables offline/admin voice cache generation.
- `ELEVENLABS_VOICE_ID`: optional ElevenLabs voice override.
- `ELEVENLABS_MODEL_ID`: optional ElevenLabs model override.
- `VITE_FIREBASE_*`: public Firebase Web app config values generated by Firebase Console after adding a Web app.
- `VITE_MEDIA_API_BASE_URL`: public URL for the static media host that serves `/voice-cache/manifest.json` and `/voice-cache/{hash}.mp3` when the app is hosted on Firebase.
- `VITE_BILLING_API_BASE_URL`: public URL for the Cloudflare Worker billing endpoint used by Firebase Hosting builds.
- `FIREBASE_WEB_API_KEY`: Worker-side Firebase Web API key used to verify parent ID tokens before Stripe billing.
- `STRIPE_SECRET_KEY`: Worker-side Stripe secret key. Store as a Cloudflare secret only.
- `STRIPE_STARTER_PRICE_ID`: Worker-side recurring Stripe Price ID for the `$4.99/month` plan.
- `STRIPE_PREMIUM_PRICE_ID`: Worker-side recurring Stripe Price ID for the `$9.99/month` plan.

If an API key was pasted into chat, logs, screenshots, or a ticket, rotate it before using the app publicly.

## Kids Privacy Notes

The app includes draft privacy and terms screens, parent PIN controls, and parent-gated saved voice/story-cover settings. Before public launch, replace draft legal copy with reviewed policies for the countries, payment model, accounts, analytics, and child-data flows you actually use.

Current progress starts in local-browser storage. Parents can create or sign into a Firebase account, turn on Firebase cloud progress sync in Privacy Controls, and manually sync the active child profile. Keep this parent-gated and consent-backed before syncing child profiles across devices in production.
