import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
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
  invoker: 'public',
};

const sendJson = (res, status, body) => {
  res.set(corsHeaders);
  res.status(status).json(body);
};

const publicError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const sendError = (res, error, fallback) => {
  console.error(fallback, error);
  return sendJson(res, error.status || 500, { error: error.message || fallback });
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

const getConfiguredPriceId = (plan) => {
  const envName = plan === 'premium' ? 'STRIPE_PREMIUM_PRICE_ID' : 'STRIPE_STARTER_PRICE_ID';
  const priceId = getEnv(envName);
  if (!priceId) {
    throw publicError(`Stripe ${plan} monthly subscription Price ID is not configured.`, 503);
  }
  return priceId;
};

const identifyPlanFromPrice = (subscription, priceId) => {
  if (subscription.metadata?.plan === 'premium' || subscription.metadata?.plan === 'starter') {
    return subscription.metadata.plan;
  }

  const premiumId = getEnv('STRIPE_PREMIUM_PRICE_ID');
  const starterId = getEnv('STRIPE_STARTER_PRICE_ID');
  if (premiumId && priceId === premiumId) return 'premium';
  if (starterId && priceId === starterId) return 'starter';
  return 'starter';
};

const verifyParent = async (req) => {
  const idToken = String(req.body?.idToken || '');
  if (!idToken) {
    throw publicError('Parent sign-in token is required.', 401);
  }
  const decoded = await getAuth().verifyIdToken(idToken);
  const user = await getAuth().getUser(decoded.uid);
  const email = user.email || decoded.email || '';
  if (!email) {
    throw publicError('Parent account email is required for Stripe billing.', 400);
  }
  return {
    uid: decoded.uid,
    email,
  };
};

const buildFamilyId = (uid) => `family-${uid}`;

const getVerifiedFamilyId = (req, parent) => {
  const expectedFamilyId = buildFamilyId(parent.uid);
  const requestedFamilyId = typeof req.body?.familyId === 'string' ? req.body.familyId : '';
  if (requestedFamilyId && requestedFamilyId !== expectedFamilyId) {
    throw publicError('Parent account does not match the requested family billing record.', 403);
  }

  return expectedFamilyId;
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

const getBillingCustomerRef = (parent) => getFirestore().collection('billingCustomers').doc(parent.uid);

const getStoredCustomer = async (stripe, parent) => {
  const snapshot = await getBillingCustomerRef(parent).get();
  const customerId = snapshot.data()?.customerId;
  if (!customerId) return null;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer?.deleted ? null : customer;
  } catch (error) {
    console.warn('Stored Stripe customer could not be retrieved', { uid: parent.uid, customerId, message: error.message });
    return null;
  }
};

const findExistingCustomer = async (stripe, parent) => {
  const storedCustomer = await getStoredCustomer(stripe, parent);
  if (storedCustomer?.id) return storedCustomer;

  const customers = await stripe.customers.list({ email: parent.email, limit: 100 });
  return customers.data.find((customer) => customer.metadata?.firebase_uid === parent.uid)
    || customers.data.find((customer) => !customer.metadata?.firebase_uid)
    || null;
};

const persistCustomerMapping = async (stripe, parent, familyId, customer) => {
  const metadata = {
    ...(customer.metadata || {}),
    firebase_uid: parent.uid,
    family_id: familyId,
    app: 'kid-genius-world',
  };

  const updatedCustomer = await stripe.customers.update(customer.id, {
    email: parent.email,
    metadata,
  });

  await getBillingCustomerRef(parent).set({
    customerId: updatedCustomer.id,
    parentUid: parent.uid,
    parentEmail: parent.email,
    familyId,
    app: 'kid-genius-world',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return updatedCustomer;
};

const findOrCreateCustomer = async (stripe, parent, familyId) => {
  const existing = await findExistingCustomer(stripe, parent);
  if (existing?.id) {
    return persistCustomerMapping(stripe, parent, familyId, existing);
  }

  const customer = await stripe.customers.create({
    email: parent.email,
    metadata: {
      firebase_uid: parent.uid,
      family_id: familyId,
      app: 'kid-genius-world',
    },
  });
  return persistCustomerMapping(stripe, parent, familyId, customer);
};

export const billingCheckout = onRequest(functionOptions, async (req, res) => {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const parent = await verifyParent(req);
    const requestedPlan = req.body?.plan === 'premium' ? 'premium' : 'starter';
    const priceId = getConfiguredPriceId(requestedPlan);

    const stripe = getStripe();
    const familyId = getVerifiedFamilyId(req, parent);
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
    return sendError(res, error, 'Stripe checkout could not be opened.');
  }
});

export const billingPortal = onRequest(functionOptions, async (req, res) => {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const parent = await verifyParent(req);
    const stripe = getStripe();
    const familyId = getVerifiedFamilyId(req, parent);
    const customer = await findOrCreateCustomer(stripe, parent, familyId);
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: safeReturnUrl(req, req.body?.returnUrl),
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    return sendError(res, error, 'Stripe billing portal could not be opened.');
  }
});

export const billingAccess = onRequest(functionOptions, async (req, res) => {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const parent = await verifyParent(req);
    const stripe = getStripe();
    const familyId = getVerifiedFamilyId(req, parent);
    const customer = await findExistingCustomer(stripe, parent);
    if (!customer?.id) {
      return sendJson(res, 200, { active: false, status: 'none' });
    }
    await persistCustomerMapping(stripe, parent, familyId, customer);

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
    const plan = identifyPlanFromPrice(subscription, priceId);
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
    return sendError(res, error, 'Billing access could not be verified.');
  }
});
