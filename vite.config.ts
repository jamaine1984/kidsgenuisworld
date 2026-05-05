import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const cacheDir = path.resolve(__dirname, '.tts-cache');
    const storyCoverCacheDir = path.resolve(__dirname, '.story-covers');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (!fs.existsSync(storyCoverCacheDir)) {
      fs.mkdirSync(storyCoverCacheDir, { recursive: true });
    }

    const normalizeSpeechText = (text: string) =>
      text.replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();

    const resolveVoiceSettings = (input: any = {}) => {
      if (
        typeof input?.stability === 'number' &&
        typeof input?.similarity_boost === 'number' &&
        typeof input?.style === 'number'
      ) {
        return input;
      }

      const style = input?.narrationStyle || 'gentle';
      const speechRate = typeof input?.speechRate === 'number' ? input.speechRate : 1.0;
      const ageGroup = input?.ageGroup || 'elementary';
      const styleMap: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
        gentle: { stability: 0.72, similarity_boost: 0.82, style: 0.2, speed: 0.9 },
        energetic: { stability: 0.45, similarity_boost: 0.88, style: 0.65, speed: 1.02 },
        phonics: { stability: 0.86, similarity_boost: 0.8, style: 0.05, speed: 0.82 },
        story: { stability: 0.64, similarity_boost: 0.92, style: 0.55, speed: 0.82 },
      };
      const ageRateMap: Record<string, number> = {
        early: 0.88,
        elementary: 0.96,
        older: 1.0,
      };
      const selected = styleMap[style] || styleMap.gentle;
      const effectiveSpeed = Math.max(0.7, Math.min(1.15, selected.speed * speechRate * (ageRateMap[ageGroup] || 0.96)));

      return {
        stability: selected.stability,
        similarity_boost: selected.similarity_boost,
        style: selected.style,
        use_speaker_boost: true,
        speed: effectiveSpeed,
      };
    };

    const getTtsCachePath = ({
      text,
      voiceId,
      modelId,
      voiceSettings,
    }: {
      text: string;
      voiceId: string;
      modelId: string;
      voiceSettings: any;
    }) =>
      path.join(
        cacheDir,
        `${crypto
          .createHash('sha256')
          .update(JSON.stringify({ text: normalizeSpeechText(text), voiceId, modelId, voiceSettings }))
          .digest('hex')}.mp3`
      );

    const getLegacyTtsCachePath = ({
      text,
      context,
      voiceId,
      modelId,
      voiceSettings,
    }: {
      text: string;
      context: string;
      voiceId: string;
      modelId: string;
      voiceSettings: any;
    }) =>
      path.join(
        cacheDir,
        `${crypto
          .createHash('sha256')
          .update(JSON.stringify({ text: normalizeSpeechText(text), context, voiceId, modelId, voiceSettings }))
          .digest('hex')}.mp3`
      );

    const findCachedTtsPath = ({
      text,
      context,
      voiceId,
      modelId,
      voiceSettings,
    }: {
      text: string;
      context: string;
      voiceId: string;
      modelId: string;
      voiceSettings: any;
    }) => {
      const primaryPath = getTtsCachePath({ text, voiceId, modelId, voiceSettings });
      if (fs.existsSync(primaryPath)) {
        return { cachePath: primaryPath, migrated: false };
      }

      const legacyContexts = Array.from(new Set([context, 'general'].filter(Boolean)));
      for (const legacyContext of legacyContexts) {
        const legacyPath = getLegacyTtsCachePath({ text, context: legacyContext, voiceId, modelId, voiceSettings });
        if (fs.existsSync(legacyPath)) {
          fs.copyFileSync(legacyPath, primaryPath);
          return { cachePath: primaryPath, migrated: true };
        }
      }

      return { cachePath: primaryPath, migrated: false };
    };
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'elevenlabs-tts-proxy',
          configureServer(server) {
            server.middlewares.use('/api/story-cover', async (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method Not Allowed');
                return;
              }

              const openAiKey = env.OPENAI_API_KEY;
              const openAiModel = env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
              const openRouterKey = env.OPENROUTER_API_KEY;
              const openRouterModel = env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3.1-flash-image-preview';
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }

              try {
                const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                const payload = {
                  title: typeof body?.title === 'string' ? body.title : 'Storybook Adventure',
                  category: typeof body?.category === 'string' ? body.category : 'adventure',
                  gradeLevel: typeof body?.gradeLevel === 'number' ? body.gradeLevel : 1,
                  promptSeed: typeof body?.promptSeed === 'string' ? body.promptSeed : '',
                };
                const cacheKey = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
                const cachePath = path.join(storyCoverCacheDir, `${cacheKey}.json`);

                if (fs.existsSync(cachePath)) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(fs.readFileSync(cachePath));
                  return;
                }

                const prompt = `Create a premium, bright, child-friendly illustrated book cover for a kids educational app. Title: "${payload.title}". Category: ${payload.category}. Reading level: grade ${payload.gradeLevel}. Style: modern children's publishing, warm, playful, safe, clean composition, single clear focal subject, no readable text inside the artwork, no scary details. ${payload.promptSeed}`;

                if (openAiKey) {
                  const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${openAiKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      model: openAiModel,
                      prompt,
                      size: '1024x1536',
                      quality: 'high',
                      n: 1,
                    }),
                  });

                  if (openAiRes.ok) {
                    const result = await openAiRes.json();
                    const firstImage = result?.data?.[0];
                    const imageUrl = firstImage?.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : firstImage?.url || null;
                    const responseBody = JSON.stringify({ imageUrl, cache: 'MISS', provider: 'openai' });
                    fs.writeFileSync(cachePath, responseBody);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(responseBody);
                    return;
                  }
                }

                if (!openRouterKey) {
                  const fallback = JSON.stringify({ imageUrl: null, cache: 'FALLBACK' });
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(fallback);
                  return;
                }

                const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: openRouterModel,
                    messages: [{ role: 'user', content: prompt }],
                    modalities: ['image', 'text'],
                    image_config: { aspect_ratio: '3:4', image_size: '1024x1024' },
                  }),
                });

                if (!openRouterRes.ok) {
                  const fallback = JSON.stringify({ imageUrl: null, cache: 'ERROR' });
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(fallback);
                  return;
                }

                const result = await openRouterRes.json();
                const imageUrl = result?.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
                const responseBody = JSON.stringify({ imageUrl, cache: 'MISS', provider: 'openrouter' });
                fs.writeFileSync(cachePath, responseBody);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(responseBody);
              } catch {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ imageUrl: null, cache: 'ERROR' }));
              }
            });

            server.middlewares.use('/api/tts', async (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method Not Allowed');
                return;
              }

              const apiKey = env.ELEVENLABS_API_KEY;
              const voiceId = env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
              const modelId = env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';

              if (!apiKey) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured.' }));
                return;
              }

              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }

              try {
                const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                const text = typeof body?.text === 'string' ? normalizeSpeechText(body.text) : '';
                const context = typeof body?.context === 'string' ? body.context : 'general';
                const voiceSettings = resolveVoiceSettings(body?.voice_settings ?? {
                  stability: 0.45,
                  similarity_boost: 0.8,
                  style: 0.35,
                  use_speaker_boost: true,
                });
                const { cachePath, migrated } = findCachedTtsPath({ text, context, voiceId, modelId, voiceSettings });

                if (!text) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Text is required.' }));
                  return;
                }

                if (fs.existsSync(cachePath)) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'audio/mpeg');
                  res.setHeader('X-TTS-Cache', migrated ? 'MIGRATED' : 'HIT');
                  res.end(fs.readFileSync(cachePath));
                  return;
                }

                const elevenRes = await fetch(
                  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'xi-api-key': apiKey,
                    },
                    body: JSON.stringify({
                      text,
                      model_id: modelId,
                      voice_settings: voiceSettings,
                    }),
                  }
                );

                if (!elevenRes.ok) {
                  const errorText = await elevenRes.text();
                  res.statusCode = elevenRes.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: errorText || 'ElevenLabs request failed.' }));
                  return;
                }

                const audioBuffer = Buffer.from(await elevenRes.arrayBuffer());
                fs.writeFileSync(cachePath, audioBuffer);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Cache-Control', 'no-store');
                res.setHeader('X-TTS-Cache', 'MISS');
                res.end(audioBuffer);
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unexpected TTS proxy error.',
                }));
              }
            });

            server.middlewares.use('/api/tts-precache', async (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method Not Allowed');
                return;
              }

              const apiKey = env.ELEVENLABS_API_KEY;
              const voiceId = env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
              const modelId = env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';

              if (!apiKey) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured.' }));
                return;
              }

              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
              }

              try {
                const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                const texts = Array.isArray(body?.texts)
                  ? body.texts.map((text: unknown) => (typeof text === 'string' ? normalizeSpeechText(text) : '')).filter(Boolean).slice(0, 500)
                  : [];
                const migrateOnly = body?.migrate_only === true;
                const voiceSettings = resolveVoiceSettings(body?.voice_settings);

                let hits = 0;
                let misses = 0;
                let errors = 0;
                let skipped = 0;
                const errorSamples: Array<{ status?: number; message: string }> = [];

                for (const text of texts) {
                  const { cachePath } = findCachedTtsPath({
                    text,
                    context: 'general',
                    voiceId,
                    modelId,
                    voiceSettings,
                  });

                  if (fs.existsSync(cachePath)) {
                    hits += 1;
                    continue;
                  }

                  if (migrateOnly) {
                    skipped += 1;
                    continue;
                  }

                  try {
                    const elevenRes = await fetch(
                      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'xi-api-key': apiKey,
                        },
                        body: JSON.stringify({
                          text,
                          model_id: modelId,
                          voice_settings: voiceSettings,
                        }),
                      }
                    );

                    if (!elevenRes.ok) {
                      errors += 1;
                      if (errorSamples.length < 3) {
                        errorSamples.push({
                          status: elevenRes.status,
                          message: (await elevenRes.text()).slice(0, 220),
                        });
                      }
                      continue;
                    }

                    const audioBuffer = Buffer.from(await elevenRes.arrayBuffer());
                    fs.writeFileSync(cachePath, audioBuffer);
                    misses += 1;
                  } catch (error) {
                    errors += 1;
                    if (errorSamples.length < 3) {
                      errorSamples.push({
                        message: error instanceof Error ? error.message.slice(0, 220) : 'Unexpected ElevenLabs request error.',
                      });
                    }
                  }
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  requested: texts.length,
                  hits,
                  misses,
                  errors,
                  skipped,
                  errorSamples,
                }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unexpected TTS precache error.',
                }));
              }
            });
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
                return 'firebase';
              }
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            },
          },
        },
      }
    };
});
