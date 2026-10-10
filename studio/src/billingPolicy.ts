export const MONTHLY_PRICE_CENTS=499;
export const TRIAL_DAYS=0;
export type BillingAccess={active:boolean;status:string;plan?:string;comped?:boolean;trialEndsAt?:number|null;currentPeriodEndsAt?:number|null;cancelAtPeriodEnd?:boolean;customerId?:string;subscriptionId?:string};
export function canLearn(access:BillingAccess|null){return !!access?.active&&['active','trialing','past_due','owner_comped'].includes(access.status);}
export function safeBillingUrl(raw:string){const url=new URL(raw);if(url.protocol!=='https:'||!['checkout.stripe.com','billing.stripe.com','kid-genius-world.com','www.kid-genius-world.com'].includes(url.hostname))throw Error('The billing service returned an unexpected address.');return url.href;}
export const familyStorageKey=(uid:string)=>'wonderlane:v1:family:'+uid;
