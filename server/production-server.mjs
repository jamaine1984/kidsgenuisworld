import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const ttsCacheDir = path.join(rootDir, '.tts-cache');
const storyCoverCacheDir = path.join(rootDir, '.story-covers');
const port = Number(process.env.PORT || 8080);

fs.mkdirSync(ttsCacheDir, { recursive: true });
fs.mkdirSync(storyCoverCacheDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
};

const normalizeSpeechText = (text) =>
  String(text || '').replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 100_000) {
        reject(new Error('Request body is too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', reject);
  });

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const resolveVoiceSettings = (input = {}) => {
  if (
    typeof input?.stability === 'number' &&
    typeof input?.similarity_boost === 'number' &&
    typeof input?.style === 'number'
  ) {
    return input;
  }

  const styleMap = {
    gentle: { stability: 0.72, similarity_boost: 0.82, style: 0.2, speed: 0.94 },
    energetic: { stability: 0.45, similarity_boost: 0.88, style: 0.65, speed: 1.02 },
    phonics: { stability: 0.86, similarity_boost: 0.8, style: 0.05, speed: 0.82 },
    story: { stability: 0.58, similarity_boost: 0.9, style: 0.78, speed: 0.96 },
  };
  const ageRateMap = { early: 0.88, elementary: 0.96, older: 1.0 };
  const selected = styleMap[input?.narrationStyle || 'gentle'] || styleMap.gentle;
  const speechRate = typeof input?.speechRate === 'number' ? input.speechRate : 1;
  const effectiveSpeed = Math.max(0.7, Math.min(1.15, selected.speed * speechRate * (ageRateMap[input?.ageGroup] || 0.96)));

  return {
    stability: selected.stability,
    similarity_boost: selected.similarity_boost,
    style: selected.style,
    use_speaker_boost: true,
    speed: effectiveSpeed,
  };
};

const getTtsCachePath = ({ text, voiceId, modelId, voiceSettings }) =>
  path.join(
    ttsCacheDir,
    `${crypto.createHash('sha256').update(JSON.stringify({ text: normalizeSpeechText(text), voiceId, modelId, voiceSettings })).digest('hex')}.mp3`
  );

const getLegacyTtsCachePath = ({ text, context, voiceId, modelId, voiceSettings }) =>
  path.join(
    ttsCacheDir,
    `${crypto.createHash('sha256').update(JSON.stringify({ text: normalizeSpeechText(text), context, voiceId, modelId, voiceSettings })).digest('hex')}.mp3`
  );

const findCachedTtsPath = ({ text, context, voiceId, modelId, voiceSettings }) => {
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

const handleTts = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
  if (!apiKey) return sendJson(res, 503, { error: 'ELEVENLABS_API_KEY is not configured.' });

  const body = await readJsonBody(req);
  const text = normalizeSpeechText(body?.text);
  if (!text) return sendJson(res, 400, { error: 'Text is required.' });

  const context = typeof body?.context === 'string' ? body.context : 'general';
  const voiceSettings = resolveVoiceSettings(body?.voice_settings);
  const { cachePath, migrated } = findCachedTtsPath({ text, context, voiceId, modelId, voiceSettings });

  if (fs.existsSync(cachePath)) {
    res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'X-TTS-Cache': migrated ? 'MIGRATED' : 'HIT' });
    res.end(fs.readFileSync(cachePath));
    return;
  }

  const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify({ text, model_id: modelId, voice_settings: voiceSettings }),
  });

  if (!elevenRes.ok) return sendJson(res, elevenRes.status, { error: await elevenRes.text() });
  const audioBuffer = Buffer.from(await elevenRes.arrayBuffer());
  fs.writeFileSync(cachePath, audioBuffer);
  res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store', 'X-TTS-Cache': 'MISS' });
  res.end(audioBuffer);
};

const handleTtsPrecache = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });
  const body = await readJsonBody(req);
  const texts = Array.isArray(body?.texts) ? body.texts.map(normalizeSpeechText).filter(Boolean).slice(0, 500) : [];
  const migrateOnly = body?.migrate_only === true;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey && !migrateOnly) return sendJson(res, 503, { error: 'ELEVENLABS_API_KEY is not configured.' });

  let hits = 0;
  let misses = 0;
  let errors = 0;
  let skipped = 0;
  const errorSamples = [];
  for (const text of texts) {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
    const voiceSettings = resolveVoiceSettings(body?.voice_settings);
    const { cachePath } = findCachedTtsPath({ text, context: 'general', voiceId, modelId, voiceSettings });
    if (fs.existsSync(cachePath)) {
      hits += 1;
      continue;
    }
    if (migrateOnly) {
      skipped += 1;
      continue;
    }
    try {
      const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
        body: JSON.stringify({ text, model_id: modelId, voice_settings: voiceSettings }),
      });
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
      fs.writeFileSync(cachePath, Buffer.from(await elevenRes.arrayBuffer()));
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
  sendJson(res, 200, { requested: texts.length, hits, misses, errors, skipped, errorSamples });
};

const handleStoryCover = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });
  const body = await readJsonBody(req);
  const payload = {
    title: typeof body?.title === 'string' ? body.title : 'Storybook Adventure',
    category: typeof body?.category === 'string' ? body.category : 'adventure',
    gradeLevel: typeof body?.gradeLevel === 'number' ? body.gradeLevel : 1,
    promptSeed: typeof body?.promptSeed === 'string' ? body.promptSeed : '',
  };
  const cacheKey = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const cachePath = path.join(storyCoverCacheDir, `${cacheKey}.json`);
  if (fs.existsSync(cachePath)) return sendJson(res, 200, JSON.parse(fs.readFileSync(cachePath, 'utf8')));

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return sendJson(res, 200, { imageUrl: null, cache: 'FALLBACK' });
  const model = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3.1-flash-image-preview';
  const prompt = `Create a bright, child-friendly illustrated book cover for a kids educational app. Title: "${payload.title}". Category: ${payload.category}. Reading level: grade ${payload.gradeLevel}. Style: warm, playful, safe, clean composition, single clear focal subject, no readable text inside the artwork, no scary details. ${payload.promptSeed}`;

  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '3:4', image_size: '1024x1024' },
    }),
  });

  if (!openRouterRes.ok) return sendJson(res, 200, { imageUrl: null, cache: 'ERROR' });
  const result = await openRouterRes.json();
  const responseBody = { imageUrl: result?.choices?.[0]?.message?.images?.[0]?.image_url?.url || null, cache: 'MISS' };
  fs.writeFileSync(cachePath, JSON.stringify(responseBody));
  sendJson(res, 200, responseBody);
};

const serveStatic = (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.resolve(distDir, `.${requestedPath}`);
  if (!filePath.startsWith(distDir)) return sendJson(res, 403, { error: 'Forbidden' });
  const finalPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(distDir, 'index.html');
  const ext = path.extname(finalPath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(finalPath).pipe(res);
};

http
  .createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
      if (pathname === '/api/tts') return await handleTts(req, res);
      if (pathname === '/api/tts-precache') return await handleTtsPrecache(req, res);
      if (pathname === '/api/story-cover') return await handleStoryCover(req, res);
      return serveStatic(req, res);
    } catch (error) {
      return sendJson(res, 500, { error: error instanceof Error ? error.message : 'Unexpected server error.' });
    }
  })
  .listen(port, () => {
    console.log(`Kid Genius World server running at http://localhost:${port}`);
  });
