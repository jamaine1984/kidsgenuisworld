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

const stripeObjectId = (value) => (typeof value === 'string' ? value : value?.id || '');

const timestampToMillis = (value) => (typeof value === 'number' ? value * 1000 : null);

const removeUndefined = (record) => Object.fromEntries(
  Object.entries(record).filter(([, value]) => value !== undefined)
);

const subscriptionAllowsAccess = (status) => ['trialing', 'active', 'past_due'].includes(status);
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const DEFAULT_COMPED_PARENT_EMAILS = ['korikes2021@gmail.com', 'koikes2021@gmail.com'];

const getCompedParentEmails = () => {
  const configuredEmails = getEnv('COMPED_PARENT_EMAILS')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
  return new Set([...DEFAULT_COMPED_PARENT_EMAILS, ...configuredEmails]);
};

const isCompedParent = (parent) => getCompedParentEmails().has(normalizeEmail(parent.email));

const getCompedAccessPayload = (parent, familyId) => ({
  active: true,
  status: 'owner_comped',
  plan: 'premium',
  accessSource: 'owner_comped',
  billingAccessActive: true,
  comped: true,
  customerId: '',
  subscriptionId: '',
  trialEndsAt: null,
  currentPeriodEndsAt: null,
  cancelAtPeriodEnd: false,
  parentEmail: parent.email,
  familyId,
});

const getMetadataValue = (key, ...objects) => {
  for (const object of objects) {
    const metadataSources = [
      object?.metadata,
      object?.subscription_details?.metadata,
      object?.parent?.subscription_details?.metadata,
    ];
    for (const metadata of metadataSources) {
      const value = metadata?.[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
  }
  return '';
};

const getFirebaseUidFromStripeObjects = (...objects) => (
  getMetadataValue('firebase_uid', ...objects)
  || objects.find((object) => typeof object?.client_reference_id === 'string')?.client_reference_id
  || ''
);

const getSubscriptionPriceId = (subscription) => (
  subscription?.items?.data?.[0]?.price?.id
  || stripeObjectId(subscription?.plan)
  || ''
);

const getInvoiceSubscriptionId = (invoice) => (
  stripeObjectId(invoice?.subscription)
  || stripeObjectId(invoice?.subscription_details?.subscription)
  || stripeObjectId(invoice?.parent?.subscription_details?.subscription)
);

const retrieveStripeCustomer = async (stripe, customerId) => {
  if (!customerId) return null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer?.deleted ? null : customer;
  } catch (error) {
    console.warn('Stripe webhook customer lookup failed', { customerId, message: error.message });
    return null;
  }
};

const retrieveStripeSubscription = async (stripe, subscriptionId) => {
  if (!subscriptionId) return null;
  try {
    return stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
  } catch (error) {
    console.warn('Stripe webhook subscription lookup failed', { subscriptionId, message: error.message });
    return null;
  }
};

const findBillingDocumentByCustomerId = async (customerId) => {
  if (!customerId) return null;
  const snapshot = await getFirestore()
    .collection('billingCustomers')
    .where('customerId', '==', customerId)
    .limit(1)
    .get();
  const document = snapshot.docs[0];
  return document ? { id: document.id, ...document.data() } : null;
};

const resolveWebhookParentContext = async (stripe, { checkoutSession, subscription, invoice }) => {
  const customerId = stripeObjectId(subscription?.customer)
    || stripeObjectId(checkoutSession?.customer)
    || stripeObjectId(invoice?.customer);
  const storedBilling = await findBillingDocumentByCustomerId(customerId);
  const customer = await retrieveStripeCustomer(stripe, customerId);
  const parentUid = getFirebaseUidFromStripeObjects(subscription, checkoutSession, invoice, customer)
    || storedBilling?.parentUid
    || storedBilling?.id
    || '';
  const familyId = getMetadataValue('family_id', subscription, checkoutSession, invoice, customer)
    || storedBilling?.familyId
    || (parentUid ? buildFamilyId(parentUid) : '');
  const parentEmail = checkoutSession?.customer_details?.email
    || checkoutSession?.customer_email
    || invoice?.customer_email
    || customer?.email
    || storedBilling?.parentEmail
    || '';

  return {
    customerId,
    familyId,
    parentEmail,
    parentUid,
  };
};

const persistStripeEventRecord = async (parentUid, event, objectId) => {
  if (!parentUid || !event?.id) return;
  await getFirestore()
    .collection('billingCustomers')
    .doc(parentUid)
    .collection('stripeEvents')
    .doc(event.id)
    .set(removeUndefined({
      eventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
      objectId,
      receivedAt: FieldValue.serverTimestamp(),
      stripeCreatedAt: timestampToMillis(event.created),
    }), { merge: true });
};

const persistBillingSnapshot = async (stripe, event, { checkoutSession = null, subscription = null, invoice = null }) => {
  const subscriptionId = stripeObjectId(subscription?.id)
    || stripeObjectId(checkoutSession?.subscription)
    || getInvoiceSubscriptionId(invoice);
  const resolvedSubscription = subscription || await retrieveStripeSubscription(stripe, subscriptionId);
  const context = await resolveWebhookParentContext(stripe, {
    checkoutSession,
    subscription: resolvedSubscription,
    invoice,
  });

  if (!context.parentUid) {
    console.warn('Stripe webhook skipped because no Firebase parent uid was found', {
      eventId: event.id,
      eventType: event.type,
      customerId: context.customerId,
      subscriptionId,
    });
    return { handled: true, updated: false, reason: 'missing_parent_uid' };
  }

  const priceId = getSubscriptionPriceId(resolvedSubscription);
  const plan = resolvedSubscription
    ? identifyPlanFromPrice(resolvedSubscription, priceId)
    : getMetadataValue('plan', checkoutSession, invoice) || undefined;
  const subscriptionStatus = resolvedSubscription?.status || undefined;
  const billingAccessActive = subscriptionStatus ? subscriptionAllowsAccess(subscriptionStatus) : undefined;
  const objectId = event.data?.object?.id || subscriptionId || context.customerId;

  await getBillingCustomerRef({ uid: context.parentUid }).set(removeUndefined({
    app: 'kid-genius-world',
    billingAccessActive,
    cancelAtPeriodEnd: resolvedSubscription?.cancel_at_period_end,
    canceledAt: timestampToMillis(resolvedSubscription?.canceled_at),
    currentPeriodEndsAt: timestampToMillis(resolvedSubscription?.current_period_end),
    customerId: context.customerId,
    familyId: context.familyId,
    lastInvoiceAmountDue: typeof invoice?.amount_due === 'number' ? invoice.amount_due : undefined,
    lastInvoiceAmountPaid: typeof invoice?.amount_paid === 'number' ? invoice.amount_paid : undefined,
    lastInvoiceCurrency: invoice?.currency,
    lastInvoiceId: invoice?.id,
    lastInvoicePaid: typeof invoice?.paid === 'boolean' ? invoice.paid : undefined,
    lastInvoiceStatus: invoice?.status,
    lastStripeEventAt: timestampToMillis(event.created),
    lastStripeEventId: event.id,
    lastStripeEventType: event.type,
    parentEmail: context.parentEmail,
    parentUid: context.parentUid,
    plan,
    priceId,
    subscriptionId: resolvedSubscription?.id || subscriptionId,
    subscriptionStatus,
    trialEndsAt: timestampToMillis(resolvedSubscription?.trial_end),
    updatedAt: FieldValue.serverTimestamp(),
  }), { merge: true });

  await persistStripeEventRecord(context.parentUid, event, objectId);
  return { handled: true, updated: true };
};

const verifyStripeWebhookEvent = (stripe, req) => {
  const signature = req.get('stripe-signature') || '';
  if (!signature) {
    throw publicError('Stripe webhook signature is required.', 400);
  }

  const endpointSecret = getEnv('STRIPE_WEBHOOK_SECRET');
  if (!endpointSecret) {
    throw publicError('Stripe webhook secret is not configured.', 503);
  }

  if (!req.rawBody) {
    throw publicError('Stripe webhook raw body is unavailable.', 400);
  }

  try {
    return stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (error) {
    console.warn('Stripe webhook signature verification failed', { message: error.message });
    throw publicError('Stripe webhook signature could not be verified.', 400);
  }
};

const handleStripeBillingEvent = async (stripe, event) => {
  const stripeObject = event.data?.object;

  switch (event.type) {
    case 'checkout.session.completed':
      return persistBillingSnapshot(stripe, event, { checkoutSession: stripeObject });
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.trial_will_end':
      return persistBillingSnapshot(stripe, event, { subscription: stripeObject });
    case 'invoice.finalized':
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      return persistBillingSnapshot(stripe, event, { invoice: stripeObject });
    default:
      console.info('Stripe billing webhook ignored event type', { eventType: event.type, eventId: event.id });
      return { handled: false, updated: false };
  }
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

const persistCompedBillingSnapshot = async (parent, familyId) => {
  await getBillingCustomerRef(parent).set({
    app: 'kid-genius-world',
    accessSource: 'owner_comped',
    billingAccessActive: true,
    comped: true,
    customerId: '',
    familyId,
    parentEmail: parent.email,
    parentUid: parent.uid,
    plan: 'premium',
    subscriptionId: '',
    subscriptionStatus: 'owner_comped',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
};

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

const getStoredBillingSnapshot = async (parent) => {
  const snapshot = await getBillingCustomerRef(parent).get();
  return snapshot.data() || {};
};

const getBillingSnapshotSummary = (storedBilling) => removeUndefined({
  cancelAtPeriodEnd: storedBilling.cancelAtPeriodEnd,
  lastInvoiceAmountDue: storedBilling.lastInvoiceAmountDue,
  lastInvoiceAmountPaid: storedBilling.lastInvoiceAmountPaid,
  lastInvoiceCurrency: storedBilling.lastInvoiceCurrency,
  lastInvoicePaid: storedBilling.lastInvoicePaid,
  lastInvoiceStatus: storedBilling.lastInvoiceStatus,
  lastStripeEventAt: storedBilling.lastStripeEventAt,
  lastStripeEventType: storedBilling.lastStripeEventType,
});

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
    const familyId = getVerifiedFamilyId(req, parent);
    const returnUrl = safeReturnUrl(req, req.body?.returnUrl);
    if (isCompedParent(parent)) {
      await persistCompedBillingSnapshot(parent, familyId);
      return sendJson(res, 200, {
        url: `${returnUrl}/?billing=success`,
        ...getCompedAccessPayload(parent, familyId),
      });
    }

    const requestedPlan = req.body?.plan === 'premium' ? 'premium' : 'starter';
    const priceId = getConfiguredPriceId(requestedPlan);

    const stripe = getStripe();
    const customer = await findOrCreateCustomer(stripe, parent, familyId);
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
    const familyId = getVerifiedFamilyId(req, parent);
    if (isCompedParent(parent)) {
      await persistCompedBillingSnapshot(parent, familyId);
      return sendJson(res, 200, {
        url: safeReturnUrl(req, req.body?.returnUrl),
        ...getCompedAccessPayload(parent, familyId),
      });
    }

    const stripe = getStripe();
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
    const familyId = getVerifiedFamilyId(req, parent);
    if (isCompedParent(parent)) {
      await persistCompedBillingSnapshot(parent, familyId);
      return sendJson(res, 200, getCompedAccessPayload(parent, familyId));
    }

    const stripe = getStripe();
    const customer = await findExistingCustomer(stripe, parent);
    if (!customer?.id) {
      return sendJson(res, 200, { active: false, status: 'none' });
    }
    await persistCustomerMapping(stripe, parent, familyId, customer);
    const storedBilling = await getStoredBillingSnapshot(parent);
    const billingSnapshotSummary = getBillingSnapshotSummary(storedBilling);

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
      return sendJson(res, 200, {
        active: false,
        status: 'none',
        customerId: customer.id,
        ...billingSnapshotSummary,
      });
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
      ...billingSnapshotSummary,
    });
  } catch (error) {
    return sendError(res, error, 'Billing access could not be verified.');
  }
});

export const billingWebhook = onRequest(functionOptions, async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const stripe = getStripe();
    const event = verifyStripeWebhookEvent(stripe, req);
    const result = await handleStripeBillingEvent(stripe, event);
    return sendJson(res, 200, { received: true, ...result });
  } catch (error) {
    return sendError(res, error, 'Stripe webhook could not be processed.');
  }
});
