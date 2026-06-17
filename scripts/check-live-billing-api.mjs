const baseUrl = (process.env.KID_GENIUS_LIVE_URL || process.argv[2] || 'https://kid-genius-world.com').replace(/\/$/, '');

const endpoints = [
  '/api/billing/access',
  '/api/billing/checkout',
  '/api/billing/portal',
];
const webhookEndpoint = '/api/billing/webhook';

const fail = (message) => {
  console.error(`Live billing API check failed: ${message}`);
  process.exit(1);
};

const expectHeader = (headers, name, expectedValue) => {
  const actual = headers.get(name);
  if (!actual || !actual.toLowerCase().includes(expectedValue.toLowerCase())) {
    fail(`Expected ${name} to include "${expectedValue}", got "${actual || ''}".`);
  }
};

const readResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.toLowerCase().includes('application/json')) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => '');
};

const failIfFunctionsUnavailable = (endpoint, response, body) => {
  const text = typeof body === 'string' ? body : JSON.stringify(body || {});
  if ([500, 503].includes(response.status) && /billing is disabled|service you requested is not available|server error/i.test(text)) {
    fail(`${endpoint} is reaching Firebase Functions but the function is unavailable. Enable Firebase Blaze billing, redeploy functions, then rerun npm run qa:billing-live.`);
  }
};

for (const endpoint of endpoints) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const body = await readResponseBody(response);
  failIfFunctionsUnavailable(endpoint, response, body);

  if (response.status !== 401) {
    fail(`${endpoint} should return 401 without a Firebase parent token, got ${response.status}.`);
  }
  if (!body || body.error !== 'Parent sign-in token is required.') {
    fail(`${endpoint} should return the parent token JSON error.`);
  }
  expectHeader(response.headers, 'content-type', 'application/json');
  expectHeader(response.headers, 'access-control-allow-origin', '*');
}

const preflight = await fetch(`${baseUrl}/api/billing/access`, {
  method: 'OPTIONS',
  headers: {
    Origin: baseUrl,
    'Access-Control-Request-Method': 'POST',
  },
});

if (preflight.status !== 204) {
  fail(`CORS preflight should return 204, got ${preflight.status}.`);
}
expectHeader(preflight.headers, 'access-control-allow-methods', 'POST');
expectHeader(preflight.headers, 'access-control-allow-headers', 'Content-Type');

const unsignedWebhook = await fetch(`${baseUrl}${webhookEndpoint}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'customer.subscription.updated' }),
});
const unsignedWebhookBody = await readResponseBody(unsignedWebhook);
failIfFunctionsUnavailable(webhookEndpoint, unsignedWebhook, unsignedWebhookBody);

if (unsignedWebhook.status !== 400) {
  fail(`${webhookEndpoint} should reject unsigned Stripe events with 400, got ${unsignedWebhook.status}.`);
}
if (!unsignedWebhookBody || unsignedWebhookBody.error !== 'Stripe webhook signature is required.') {
  fail(`${webhookEndpoint} should return the missing Stripe signature JSON error.`);
}
expectHeader(unsignedWebhook.headers, 'content-type', 'application/json');

console.log(`Live billing API check passed for ${baseUrl}: ${endpoints.length} protected endpoints, signed webhook rejection, and CORS preflight verified.`);
