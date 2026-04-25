# Kid Genius World

Kid Genius World is a colorful educational web app for kids with guided daily missions, room-based learning, parent controls, local progress tracking, and optional server-proxied voice/story-cover generation.

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

Serve the production build with the included API proxy:

```bash
npm run serve
```

Set `PORT` if your host requires a specific port.

## Cloudflare Hosting

This repo is scaffolded for Cloudflare Workers static assets plus API routes:

- React/Vite build output is served from `dist/`.
- `/api/tts` and `/api/tts-precache` run in `cloudflare/worker.ts`.
- `/api/story-cover` runs in `cloudflare/worker.ts`.
- R2 binding `MEDIA_CACHE` stores generated narration MP3 files and story-cover JSON responses.
- API keys must be set as Cloudflare Worker secrets, not committed files.

One-time Cloudflare setup:

```bash
npm install -D wrangler
npx wrangler login
npx wrangler r2 bucket create kid-genius-world-media-cache
npx wrangler secret put ELEVENLABS_API_KEY
npx wrangler secret put OPENROUTER_API_KEY
```

Deploy:

```bash
npm run build
npx wrangler deploy
```

The GitHub remote for this local repo is expected to point at `jamaine1984/kidsgenuisworld`. Cloudflare can also connect to that GitHub repository for automatic deploys after the Worker project exists.

## Human Voice Cache

Warm or migrate the app-wide human narration cache:

```bash
npm run voice:cache -- --dry-run
npm run voice:cache -- http://127.0.0.1:5177 --migrate-only
npm run voice:cache -- http://127.0.0.1:5177
```

Use `--migrate-only` when you want to reuse existing local cache files without spending ElevenLabs credits. Run the full command only when the ElevenLabs account has enough credits.

## QA Gates

Run the full launch gate before shipping:

```bash
npm run qa
```

This runs the production build, source-level product checks, and launch-readiness checks for kids-safety gates, legal surfaces, production assets, and common secret leaks.

Targeted checks:

```bash
npm run qa:source
npm run qa:launch
```

## Environment Variables

Private keys must stay in `.env.local` for development or hosted environment secrets for production. Do not commit real keys.

- `ELEVENLABS_API_KEY`: enables server-proxied narration.
- `ELEVENLABS_VOICE_ID`: optional ElevenLabs voice override.
- `ELEVENLABS_MODEL_ID`: optional ElevenLabs model override.
- `OPENROUTER_API_KEY`: enables optional generated story covers.
- `OPENROUTER_IMAGE_MODEL`: optional image model override.

If an API key was pasted into chat, logs, screenshots, or a ticket, rotate it before using the app publicly.

## Kids Privacy Notes

The app includes draft privacy and terms screens, parent PIN controls, and parent-gated external voice/story-cover settings. Before public launch, replace draft legal copy with reviewed policies for the countries, payment model, accounts, analytics, and child-data flows you actually use.

Current progress is local-browser storage. Add real account/auth, hosted database rules, deletion/export flows, and parental consent before syncing child profiles across devices.
