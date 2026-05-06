interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  MEDIA_CACHE: {
    get: (key: string) => Promise<{ body: ReadableStream; writeHttpMetadata?: (headers: Headers) => void } | null>;
    put: (key: string, value: ArrayBuffer | string, options?: { httpMetadata?: Record<string, string> }) => Promise<unknown>;
  };
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
  ELEVENLABS_MODEL_ID?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_IMAGE_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_IMAGE_MODEL?: string;
  FIREBASE_WEB_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_STARTER_PRICE_ID?: string;
  STRIPE_PREMIUM_PRICE_ID?: string;
}

type VoiceStyle = 'gentle' | 'energetic' | 'phonics' | 'story';

const normalizeSpeechText = (text: unknown) =>
  String(text || '').replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const withCors = (response: Response) => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

const sendJson = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
  });

const stripeRequest = async (env: Env, path: string, init: RequestInit = {}) => {
  if (!env.STRIPE_SECRET_KEY) {
    return sendJson({ error: 'Stripe secret key is not configured.' }, 503);
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(init.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (result as { error?: { message?: string } }).error?.message || 'Stripe request failed.';
    return sendJson({ error: message }, response.status);
  }

  return sendJson(result);
};

const verifyFirebaseParent = async (env: Env, idToken: string) => {
  if (!env.FIREBASE_WEB_API_KEY) {
    return { error: 'Firebase Web API key is not configured for billing auth.' };
  }
  if (!idToken) {
    return { error: 'Parent sign-in token is required.' };
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const result = await response.json().catch(() => ({})) as { users?: Array<{ localId?: string; email?: string }> };
  const user = result.users?.[0];
  if (!response.ok || !user?.localId) {
    return { error: 'Parent Firebase sign-in could not be verified.' };
  }

  return {
    uid: user.localId,
    email: user.email || '',
  };
};

const findOrCreateStripeCustomer = async (
  env: Env,
  parent: { uid: string; email: string },
  familyId: string
) => {
  const listResponse = await stripeRequest(env, `/customers?email=${encodeURIComponent(parent.email)}&limit=1`);
  if (!listResponse.ok) return listResponse;
  const list = await listResponse.json() as { data?: Array<{ id: string }> };
  const existingCustomer = list.data?.[0];
  if (existingCustomer?.id) {
    return sendJson(existingCustomer);
  }

  const params = new URLSearchParams();
  params.set('email', parent.email);
  params.set('metadata[firebase_uid]', parent.uid);
  params.set('metadata[family_id]', familyId);
  params.set('metadata[app]', 'kid-genius-world');
  return stripeRequest(env, '/customers', {
    method: 'POST',
    body: params,
  });
};

const safeReturnUrl = (request: Request, value: unknown) => {
  const requestOrigin = new URL(request.url).origin;
  if (typeof value !== 'string') return requestOrigin;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      ? url.origin
      : requestOrigin;
  } catch {
    return requestOrigin;
  }
};

const handleBillingCheckout = async (request: Request, env: Env) => {
  if (request.method !== 'POST') return sendJson({ error: 'Method Not Allowed' }, 405);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const parent = await verifyFirebaseParent(env, String(body.idToken || ''));
  if ('error' in parent) return sendJson({ error: parent.error }, 401);

  const requestedPlan = body.plan === 'premium' ? 'premium' : 'starter';
  const priceId = requestedPlan === 'premium'
    ? env.STRIPE_PREMIUM_PRICE_ID
    : env.STRIPE_STARTER_PRICE_ID;
  if (!priceId) {
    return sendJson({ error: `Stripe ${requestedPlan} monthly subscription Price ID is not configured.` }, 503);
  }

  const familyId = typeof body.familyId === 'string' && body.familyId ? body.familyId : `family-${parent.uid}`;
  const customerResponse = await findOrCreateStripeCustomer(env, parent, familyId);
  if (!customerResponse.ok) return customerResponse;
  const customer = await customerResponse.json() as { id?: string };
  if (!customer.id) return sendJson({ error: 'Stripe customer could not be created.' }, 502);

  const returnUrl = safeReturnUrl(request, body.returnUrl);
  const params = new URLSearchParams();
  params.set('mode', 'subscription');
  params.set('customer', customer.id);
  params.set('line_items[0][price]', priceId);
  params.set('line_items[0][quantity]', '1');
  params.set('allow_promotion_codes', 'true');
  params.set('client_reference_id', parent.uid);
  params.set('success_url', `${returnUrl}/?billing=success`);
  params.set('cancel_url', `${returnUrl}/?billing=cancelled`);
  params.set('metadata[firebase_uid]', parent.uid);
  params.set('metadata[family_id]', familyId);
  params.set('subscription_data[metadata][firebase_uid]', parent.uid);
  params.set('subscription_data[metadata][family_id]', familyId);
  params.set('subscription_data[metadata][plan]', requestedPlan);

  return stripeRequest(env, '/checkout/sessions', {
    method: 'POST',
    body: params,
  });
};

const handleBillingPortal = async (request: Request, env: Env) => {
  if (request.method !== 'POST') return sendJson({ error: 'Method Not Allowed' }, 405);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const parent = await verifyFirebaseParent(env, String(body.idToken || ''));
  if ('error' in parent) return sendJson({ error: parent.error }, 401);

  const familyId = typeof body.familyId === 'string' && body.familyId ? body.familyId : `family-${parent.uid}`;
  const customerResponse = await findOrCreateStripeCustomer(env, parent, familyId);
  if (!customerResponse.ok) return customerResponse;
  const customer = await customerResponse.json() as { id?: string };
  if (!customer.id) return sendJson({ error: 'Stripe customer could not be created.' }, 502);

  const params = new URLSearchParams();
  params.set('customer', customer.id);
  params.set('return_url', safeReturnUrl(request, body.returnUrl));
  return stripeRequest(env, '/billing_portal/sessions', {
    method: 'POST',
    body: params,
  });
};

const safeErrorSample = async (response: Response) => ({
  status: response.status,
  message: (await response.text()).slice(0, 220),
});

const hashJson = async (value: unknown) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const resolveVoiceSettings = (input: Record<string, unknown> = {}) => {
  if (
    typeof input.stability === 'number' &&
    typeof input.similarity_boost === 'number' &&
    typeof input.style === 'number'
  ) {
    return input;
  }

  const styleMap: Record<VoiceStyle, { stability: number; similarity_boost: number; style: number; speed: number }> = {
    gentle: { stability: 0.72, similarity_boost: 0.82, style: 0.2, speed: 0.9 },
    energetic: { stability: 0.45, similarity_boost: 0.88, style: 0.65, speed: 1.02 },
    phonics: { stability: 0.86, similarity_boost: 0.8, style: 0.05, speed: 0.82 },
    story: { stability: 0.64, similarity_boost: 0.92, style: 0.55, speed: 0.82 },
  };
  const ageRateMap: Record<string, number> = { early: 0.88, elementary: 0.96, older: 1.0 };
  const selected = styleMap[(input.narrationStyle as VoiceStyle) || 'gentle'] || styleMap.gentle;
  const speechRate = typeof input.speechRate === 'number' ? input.speechRate : 1;
  const effectiveSpeed = Math.max(0.7, Math.min(1.15, selected.speed * speechRate * (ageRateMap[String(input.ageGroup || 'elementary')] || 0.96)));

  return {
    stability: selected.stability,
    similarity_boost: selected.similarity_boost,
    style: selected.style,
    use_speaker_boost: true,
    speed: effectiveSpeed,
  };
};

const getTtsKey = async (text: string, env: Env, voiceSettings: Record<string, unknown>) => {
  const voiceId = env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const modelId = env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
  return `tts/${await hashJson({ text: normalizeSpeechText(text), voiceId, modelId, voiceSettings })}.mp3`;
};

const handleTts = async (request: Request, env: Env) => {
  if (request.method !== 'POST') return sendJson({ error: 'Method Not Allowed' }, 405);

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const text = normalizeSpeechText(body.text);
  if (!text) return sendJson({ error: 'Text is required.' }, 400);

  const voiceSettings = resolveVoiceSettings((body.voice_settings || {}) as Record<string, unknown>);
  const cacheKey = await getTtsKey(text, env, voiceSettings);
  const cached = await env.MEDIA_CACHE.get(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-TTS-Cache': 'HIT',
        ...corsHeaders,
      },
    });
  }

  if (!env.ELEVENLABS_API_KEY) {
    return sendJson({ error: 'ELEVENLABS_API_KEY is not configured.' }, 503);
  }

  const voiceId = env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const modelId = env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
  const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': env.ELEVENLABS_API_KEY },
    body: JSON.stringify({ text, model_id: modelId, voice_settings: voiceSettings }),
  });

  if (!elevenRes.ok) {
    return sendJson({ error: await elevenRes.text() }, elevenRes.status);
  }

  const audio = await elevenRes.arrayBuffer();
  await env.MEDIA_CACHE.put(cacheKey, audio, { httpMetadata: { contentType: 'audio/mpeg' } });
  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-TTS-Cache': 'MISS',
      ...corsHeaders,
    },
  });
};

const handleTtsPrecache = async (request: Request, env: Env) => {
  if (request.method !== 'POST') return sendJson({ error: 'Method Not Allowed' }, 405);

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const texts = Array.isArray(body.texts)
    ? body.texts.map(normalizeSpeechText).filter(Boolean).slice(0, 500)
    : [];
  const migrateOnly = body.migrate_only === true;
  const voiceSettings = resolveVoiceSettings((body.voice_settings || {}) as Record<string, unknown>);
  let hits = 0;
  let misses = 0;
  let errors = 0;
  let skipped = 0;
  const errorSamples: Array<{ status?: number; message: string }> = [];

  for (const text of texts) {
    const cacheKey = await getTtsKey(text, env, voiceSettings);
    if (await env.MEDIA_CACHE.get(cacheKey)) {
      hits += 1;
      continue;
    }
    if (migrateOnly || !env.ELEVENLABS_API_KEY) {
      skipped += 1;
      continue;
    }

    const response = await handleTts(new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_settings: voiceSettings }),
    }), env);
    if (response.ok) misses += 1;
    else {
      errors += 1;
      if (errorSamples.length < 3) errorSamples.push(await safeErrorSample(response));
    }
  }

  return sendJson({ requested: texts.length, hits, misses, errors, skipped, errorSamples });
};

const handleStoryCover = async (request: Request, env: Env) => {
  if (request.method !== 'POST') return sendJson({ error: 'Method Not Allowed' }, 405);

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const payload = {
    title: typeof body.title === 'string' ? body.title : 'Storybook Adventure',
    category: typeof body.category === 'string' ? body.category : 'adventure',
    gradeLevel: typeof body.gradeLevel === 'number' ? body.gradeLevel : 1,
    promptSeed: typeof body.promptSeed === 'string' ? body.promptSeed : '',
  };
  const cacheKey = `story-covers/${await hashJson(payload)}.json`;
  const cached = await env.MEDIA_CACHE.get(cacheKey);
  if (cached) return new Response(cached.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Cover-Cache': 'HIT', ...corsHeaders } });

  const prompt = `Create a premium, bright, child-friendly illustrated book cover for a kids educational app. Title: "${payload.title}". Category: ${payload.category}. Reading level: grade ${payload.gradeLevel}. Style: modern children's publishing, warm, playful, safe, clean composition, single clear focal subject, no readable text inside the artwork, no scary details. ${payload.promptSeed}`;

  if (env.OPENAI_API_KEY) {
    const model = env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
    const openAiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        size: '1024x1536',
        quality: 'high',
        n: 1,
      }),
    });

    if (openAiRes.ok) {
      const result = await openAiRes.json() as { data?: Array<{ b64_json?: string; url?: string }> };
      const firstImage = result?.data?.[0];
      const responseBody = {
        imageUrl: firstImage?.b64_json ? `data:image/png;base64,${firstImage.b64_json}` : firstImage?.url || null,
        cache: 'MISS',
        provider: 'openai',
      };
      await env.MEDIA_CACHE.put(cacheKey, JSON.stringify(responseBody), { httpMetadata: { contentType: 'application/json; charset=utf-8' } });
      return sendJson(responseBody);
    }
  }

  if (!env.OPENROUTER_API_KEY) {
    return sendJson({ imageUrl: null, cache: 'FALLBACK' });
  }

  const model = env.OPENROUTER_IMAGE_MODEL || 'google/gemini-3.1-flash-image-preview';
  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '3:4', image_size: '1024x1024' },
    }),
  });

  if (!openRouterRes.ok) return sendJson({ imageUrl: null, cache: 'ERROR' });
  const result = await openRouterRes.json() as { choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }> };
  const responseBody = { imageUrl: result?.choices?.[0]?.message?.images?.[0]?.image_url?.url || null, cache: 'MISS', provider: 'openrouter' };
  await env.MEDIA_CACHE.put(cacheKey, JSON.stringify(responseBody), { httpMetadata: { contentType: 'application/json; charset=utf-8' } });
  return sendJson(responseBody);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.startsWith('/voice-cache/') && url.pathname.endsWith('.mp3')) {
      const fileName = url.pathname.split('/').pop() || '';
      const cached = /^[a-f0-9]{64}\.mp3$/.test(fileName)
        ? await env.MEDIA_CACHE.get(`tts/${fileName}`)
        : null;
      if (!cached) return new Response('Not Found', { status: 404 });
      return new Response(cached.body, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...corsHeaders,
        },
      });
    }
    if (url.pathname === '/api/billing/checkout') return withCors(await handleBillingCheckout(request, env));
    if (url.pathname === '/api/billing/portal') return withCors(await handleBillingPortal(request, env));
    if (url.pathname.startsWith('/api/')) return sendJson({ error: 'Runtime media generation APIs are disabled. Use saved static media.' }, 404);
    if (url.pathname === '/api/tts') return withCors(await handleTts(request, env));
    if (url.pathname === '/api/tts-precache') return withCors(await handleTtsPrecache(request, env));
    if (url.pathname === '/api/story-cover') return withCors(await handleStoryCover(request, env));
    return env.ASSETS.fetch(request);
  },
};
