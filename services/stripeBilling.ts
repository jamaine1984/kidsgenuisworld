import { getCurrentParentIdToken, type ParentCloudSession } from './firebaseParentAuth';

const getBillingApiBaseUrl = () => {
  const configured = import.meta.env.VITE_BILLING_API_BASE_URL || '';

  return String(configured).replace(/\/$/, '');
};

const BILLING_FUNCTIONS_UNAVAILABLE_MESSAGE = 'Billing is not available yet. Firebase Functions need Blaze billing enabled and the Stripe billing functions deployed before checkout can open.';

const parseBillingResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');
  const result = isJson ? await response.json().catch(() => ({})) : {};

  if (!response.ok && !isJson && response.status >= 500) {
    throw new Error(BILLING_FUNCTIONS_UNAVAILABLE_MESSAGE);
  }

  return result as {
    url?: string;
    error?: string;
    active?: boolean;
    status?: string;
    plan?: 'starter' | 'premium';
    accessSource?: 'stripe' | 'owner_comped';
    billingAccessActive?: boolean;
    comped?: boolean;
    trialEndsAt?: number | null;
    currentPeriodEndsAt?: number | null;
    cancelAtPeriodEnd?: boolean;
    lastInvoiceAmountDue?: number;
    lastInvoiceAmountPaid?: number;
    lastInvoiceCurrency?: string;
    lastInvoicePaid?: boolean;
    lastInvoiceStatus?: string;
    lastStripeEventAt?: number;
    lastStripeEventType?: string;
  };
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

  const result = await parseBillingResponse(response);
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

  const result = await parseBillingResponse(response);

  if (!response.ok) {
    throw new Error(result.error || 'Billing access could not be verified.');
  }

  return {
    active: Boolean(result.active),
    status: result.status || 'none',
    plan: result.plan,
    accessSource: result.accessSource,
    billingAccessActive: Boolean(result.billingAccessActive),
    comped: Boolean(result.comped),
    trialEndsAt: result.trialEndsAt || null,
    currentPeriodEndsAt: result.currentPeriodEndsAt || null,
    cancelAtPeriodEnd: Boolean(result.cancelAtPeriodEnd),
    lastInvoiceAmountDue: result.lastInvoiceAmountDue,
    lastInvoiceAmountPaid: result.lastInvoiceAmountPaid,
    lastInvoiceCurrency: result.lastInvoiceCurrency,
    lastInvoicePaid: result.lastInvoicePaid,
    lastInvoiceStatus: result.lastInvoiceStatus,
    lastStripeEventAt: result.lastStripeEventAt,
    lastStripeEventType: result.lastStripeEventType,
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
