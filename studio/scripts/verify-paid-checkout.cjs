// Disposable account and an UNPAID checkout quote only. No payment or subscription is completed.
const fs=require('node:fs');const crypto=require('node:crypto');const assert=require('node:assert/strict');
const lib='C:/Users/koike/AppData/Roaming/npm/node_modules/firebase-tools/lib';const {requireAuth}=require(lib+'/requireAuth');const {getGlobalDefaultAccount}=require(lib+'/auth');const {Client,getAccessToken}=require(lib+'/apiv2');
const billingRequire=require('node:module').createRequire(require('node:path').resolve('firebase-billing/functions/package.json'));
const {initializeApp}=billingRequire('firebase-admin/app');const {getAuth}=billingRequire('firebase-admin/auth');const Stripe=billingRequire('stripe');
async function main(){
 await requireAuth({project:'kid-genius-world',...getGlobalDefaultAccount()});const app=initializeApp({projectId:'kid-genius-world',credential:{getAccessToken:async()=>({access_token:await getAccessToken(),expires_in:3600})}},'kgw-billing-qa');const auth=getAuth(app),firestore=new Client({urlPrefix:'https://firestore.googleapis.com',apiVersion:'v1',auth:true});
 const c=new Client({urlPrefix:'https://cloudfunctions.googleapis.com',apiVersion:'v2',auth:true}),f=(await c.get('/projects/kid-genius-world/locations/us-central1/functions/billingCheckout')).body,env=f.serviceConfig.environmentVariables;
 const stripe=new Stripe(env.STRIPE_SECRET_KEY,{apiVersion:'2025-11-17.clover'}),config=JSON.parse(fs.readFileSync('src/firebaseConfig.json')),uid='kgw-billing-qa-'+crypto.randomUUID(),email=uid+'@example.com',password=crypto.randomBytes(32).toString('base64url');let customerId,sessionId;
 const post=async(kind,data)=>{const r=await fetch('https://kid-genius-world.com/api/billing/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,data:await r.json()};};
 try{
  await auth.createUser({uid,email,password});const signin=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+config.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})}).then(r=>r.json());if(!signin.idToken)throw Error('Disposable parent sign-in did not complete.');
  const payload={idToken:signin.idToken,familyId:'family-'+uid,returnUrl:'https://kid-genius-world.com',plan:'starter'};
  assert.equal((await post('access',{})).status,401);assert.equal((await post('access',{...payload,familyId:'family-someone-else'})).status,403);const before=await post('access',payload);assert.equal(before.status,200);assert.equal(before.data.active,false);
  const first=await post('checkout',payload);assert.equal(first.status,200);assert.match(first.data.url,/^https:\/\/checkout\.stripe\.com\//);
  const customer=(await stripe.customers.list({email,limit:3})).data.find(a=>a.metadata.firebase_uid===uid);assert.ok(customer);customerId=customer.id;
  const sessions=(await stripe.checkout.sessions.list({customer:customerId,status:'open',limit:10})).data.filter(s=>s.metadata.firebase_uid===uid);assert.equal(sessions.length,1);const session=sessions[0];sessionId=session.id;
  assert.equal(session.amount_total,499);assert.equal(session.currency,'usd');assert.equal(session.metadata.trial_days,'0');assert.equal(session.metadata.billing_policy,'studio-499-no-trial-v1');assert.equal(session.payment_status,'unpaid');assert.equal(session.subscription,null);
  const lines=await stripe.checkout.sessions.listLineItems(sessionId,{limit:3});assert.equal(lines.data.length,1);assert.equal(lines.data[0].price.id,env.STRIPE_STARTER_PRICE_ID);assert.equal(lines.data[0].price.recurring.interval,'month');
  const second=await post('checkout',payload);assert.equal(second.data.url,first.data.url);assert.equal((await post('access',payload)).data.active,false);
  const report={checkedAt:new Date().toISOString(),passed:true,monthlyPriceCents:499,currency:'usd',trialDays:0,checkoutAmountDueNow:499,checkoutReuse:true,unpaidCheckoutDoesNotUnlock:true,familyMismatchRejected:true,anonymousRejected:true,paymentCompleted:false,subscriptionCreated:false};
  fs.writeFileSync('output/billing/paid-checkout-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{
  if(!customerId){const customer=(await stripe.customers.list({email,limit:3})).data.find(a=>a.metadata.firebase_uid===uid);customerId=customer?.id;}
  if(customerId){const customer=await stripe.customers.retrieve(customerId);assert.equal(customer.email,email);assert.equal(customer.metadata.firebase_uid,uid);const subscriptions=await stripe.subscriptions.list({customer:customerId,status:'all',limit:1});assert.equal(subscriptions.data.length,0,'Never clean up a customer who acquired a subscription.');const open=await stripe.checkout.sessions.list({customer:customerId,status:'open',limit:20});for(const s of open.data)if(s.metadata.firebase_uid===uid)await stripe.checkout.sessions.expire(s.id);await stripe.customers.del(customerId);}
  await firestore.delete('/projects/kid-genius-world/databases/(default)/documents/billingCustomers/'+encodeURIComponent(uid));await auth.deleteUser(uid).catch(e=>{if(e.code!=='auth/user-not-found')throw e;});console.log('Disposable account, customer, mapping and unpaid checkout cleaned up.');
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
