import { getCurrentParentIdToken, type ParentCloudSession } from './firebaseParentAuth';

const getBillingApiBaseUrl = () => {
  const configured =
    import.meta.env.VITE_BILLING_API_BASE_URL ||
    import.meta.env.VITE_MEDIA_API_BASE_URL ||
    '';

  return String(configured).replace(/\/$/, '');
};

const postBillingRequest = async (
  path: '/api/billing/checkout' | '/api/billing/portal',
  cloudSession: ParentCloudSession
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
      returnUrl: window.location.origin,
    }),
  });

  const result = await response.json().catch(() => ({})) as { url?: string; error?: string };
  if (!response.ok || !result.url) {
    throw new Error(result.error || 'Billing session could not be created.');
  }

  return result.url;
};

export const openStripeCheckout = async (cloudSession: ParentCloudSession) => {
  window.location.assign(await postBillingRequest('/api/billing/checkout', cloudSession));
};

export const openStripeBillingPortal = async (cloudSession: ParentCloudSession) => {
  window.location.assign(await postBillingRequest('/api/billing/portal', cloudSession));
};
