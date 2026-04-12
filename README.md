<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yJfMKIfNMZrSZRChPKnkzKhAk2cGJr6f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the API keys in `.env.local`
3. Run the app:
   `npm run dev`

## Environment

Copy `.env.example` to `.env.local` and set the values you want to use:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `ELEVENLABS_MODEL_ID`

## Voice Setup

The app now prefers ElevenLabs for spoken narration through a local `/api/tts` proxy in Vite. That keeps the ElevenLabs key on the server side during local development instead of exposing it in the browser bundle.

Generated audio is cached to `.tts-cache/` so the same line does not hit the API repeatedly.

If ElevenLabs is unavailable, the app falls back to the browser speech engine so narration still works.
