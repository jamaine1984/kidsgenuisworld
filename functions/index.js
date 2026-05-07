import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

initializeApp();

const getEnv = (name, fallback = '') => process.env[name] || fallback;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const functionOptions = {
  region: 'us-central1',
  maxInstances: 10,
};

const sendJson = (res, status, body) => {
  res.set(corsHeaders);
  res.status(status).json(body);
};

const handleOptions = (req, res) => {
  if (req.method !== 'OPTIONS') return false;
  res.set(corsHeaders);
  res.status(204).send('');
  return true;
};

const getStripe = () => {
  const secretKey = getEnv('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('Stripe secret key is not configured in Firebase Functions.');
  }
  return new Stripe(secretKey, { apiVersion: '2025-11-17.clover' });
};

const verifyParent = async (req) => {
  const idToken = String(req.body?.idToken || '');
  if (!idToken) {
    throw new Error('Parent sign-in token is required.');
  }
  const decoded = await getAuth().verifyIdToken(idToken);
  const user = await getAuth().getUser(decoded.uid);
  return {
    uid: decoded.uid,
    email: user.email || decoded.email || '',
  };
};

const safeReturnUrl = (req, value) => {
  const fallback = `${req.protocol}://${req.get('host')}`;
  if (typeof value !== 'string') return fallback;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      ? url.origin
      : fallback;
  } catch {
    return fallback;
  }
};

const findOrCreateCustomer = async (stripe, parent, familyId) => {
  const customers = await stripe.customers.list({ email: parent.email, limit: 1 });
  const existing = customers.data[0];
  if (existing?.id) return existing;

  return stripe.customers.create({
    email: parent.email,
    metadata: {
      firebase_uid: parent.uid,
      family_id: familyId,
      app: 'kid-genius-world',
    },
  });
};

export const billingCheckout = onRequest(functionOptions, async (req, res) => {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const parent = await verifyParent(req);
    const requestedPlan = req.body?.plan === 'premium' ? 'premium' : 'starter';
    const priceId = requestedPlan === 'premium'
      ? getEnv('STRIPE_PREMIUM_PRICE_ID', 'price_1TU8tCQRAEgZiCW1pr5nMlzY')
      : getEnv('STRIPE_STARTER_PRICE_ID', 'price_1TU8rvQRAEgZiCW1ZBMSCSq2');
    if (!priceId) {
      return sendJson(res, 503, { error: `Stripe ${requestedPlan} monthly subscription Price ID is not configured.` });
    }

    const stripe = getStripe();
    const familyId = typeof req.body?.familyId === 'string' && req.body.familyId
      ? req.body.familyId
      : `family-${parent.uid}`;
    const customer = await findOrCreateCustomer(stripe, parent, familyId);
    const returnUrl = safeReturnUrl(req, req.body?.returnUrl);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: parent.uid,
      success_url: `${returnUrl}/?billing=success`,
      cancel_url: `${returnUrl}/?billing=cancelled`,
      metadata: {
        firebase_uid: parent.uid,
        family_id: familyId,
        trial_days: '3',
      },
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          firebase_uid: parent.uid,
          family_id: familyId,
          plan: requestedPlan,
          trial_days: '3',
        },
      },
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    console.error('billingCheckout failed', error);
    return sendJson(res, 500, { error: error.message || 'Stripe checkout could not be opened.' });
  }
});

export const billingPortal = onRequest(functionOptions, async (req, res) => {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const parent = await verifyParent(req);
    const stripe = getStripe();
    const familyId = typeof req.body?.familyId === 'string' && req.body.familyId
      ? req.body.familyId
      : `family-${parent.uid}`;
    const customer = await findOrCreateCustomer(stripe, parent, familyId);
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: safeReturnUrl(req, req.body?.returnUrl),
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    console.error('billingPortal failed', error);
    return sendJson(res, 500, { error: error.message || 'Stripe billing portal could not be opened.' });
  }
});

export const billingAccess = onRequest(functionOptions, async (req, res) => {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const parent = await verifyParent(req);
    const stripe = getStripe();
    const customers = await stripe.customers.list({ email: parent.email, limit: 1 });
    const customer = customers.data[0];
    if (!customer?.id) {
      return sendJson(res, 200, { active: false, status: 'none' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 20,
      expand: ['data.items.data.price'],
    });
    const subscription = subscriptions.data.find((item) =>
      ['trialing', 'active', 'past_due'].includes(item.status)
    );
    if (!subscription) {
      return sendJson(res, 200, { active: false, status: 'none', customerId: customer.id });
    }

    const priceId = subscription.items.data[0]?.price?.id || '';
    const premiumId = getEnv('STRIPE_PREMIUM_PRICE_ID', 'price_1TU8tCQRAEgZiCW1pr5nMlzY');
    const plan = subscription.metadata?.plan || (priceId === premiumId ? 'premium' : 'starter');
    return sendJson(res, 200, {
      active: true,
      customerId: customer.id,
      subscriptionId: subscription.id,
      status: subscription.status,
      plan,
      trialEndsAt: subscription.trial_end ? subscription.trial_end * 1000 : null,
      currentPeriodEndsAt: subscription.current_period_end ? subscription.current_period_end * 1000 : null,
    });
  } catch (error) {
    console.error('billingAccess failed', error);
    return sendJson(res, 500, { error: error.message || 'Billing access could not be verified.' });
  }
});
