import { getCurrentParentIdToken, type ParentCloudSession } from './firebaseParentAuth';

const getBillingApiBaseUrl = () => {
  const configured = import.meta.env.VITE_BILLING_API_BASE_URL || '';

  return String(configured).replace(/\/$/, '');
};

const postBillingRequest = async (
  path: '/api/billing/checkout' | '/api/billing/portal',
  cloudSession: ParentCloudSession,
  plan?: 'starter' | 'premium'
) => {
  if (!cloudSession.signedIn || !cloudSession.uid) {
    throw new Error('Sign in with a parent account before opening billing.');
  }

  const token = await getCurrentParentIdToken();
  const baseUrl = getBillingApiBaseUrl();
  const endpoint = `${baseUrl}${path}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: token,
      familyId: cloudSession.familyId,
      plan,
      returnUrl: window.location.origin,
    }),
  });

  const result = await response.json().catch(() => ({})) as { url?: string; error?: string };
  if (!response.ok || !result.url) {
    throw new Error(result.error || `Billing session could not be created. Server returned ${response.status}.`);
  }

  return result.url;
};

export const getStripeBillingAccess = async (cloudSession: ParentCloudSession) => {
  if (!cloudSession.signedIn || !cloudSession.uid) {
    return { active: false as const, status: 'signed-out' };
  }

  const token = await getCurrentParentIdToken();
  const baseUrl = getBillingApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/billing/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idToken: token,
      familyId: cloudSession.familyId,
      returnUrl: window.location.origin,
    }),
  });

  const result = await response.json().catch(() => ({})) as {
    active?: boolean;
    status?: string;
    plan?: 'starter' | 'premium';
    trialEndsAt?: number | null;
    currentPeriodEndsAt?: number | null;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error || 'Billing access could not be verified.');
  }

  return {
    active: Boolean(result.active),
    status: result.status || 'none',
    plan: result.plan,
    trialEndsAt: result.trialEndsAt || null,
    currentPeriodEndsAt: result.currentPeriodEndsAt || null,
  };
};

export const createStripeCheckoutUrl = async (
  cloudSession: ParentCloudSession,
  plan: 'starter' | 'premium' = 'starter'
) => postBillingRequest('/api/billing/checkout', cloudSession, plan);

export const openStripeCheckout = async (
  cloudSession: ParentCloudSession,
  plan: 'starter' | 'premium' = 'starter'
) => {
  window.location.assign(await createStripeCheckoutUrl(cloudSession, plan));
};

export const openStripeBillingPortal = async (cloudSession: ParentCloudSession) => {
  window.location.assign(await postBillingRequest('/api/billing/portal', cloudSession));
};
