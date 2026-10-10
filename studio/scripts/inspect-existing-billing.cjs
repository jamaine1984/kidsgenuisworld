// Read only. Never print credentials, customer details, or complete runtime environment.
const fs=require('node:fs');const path=require('node:path');
const lib='C:/Users/koike/AppData/Roaming/npm/node_modules/firebase-tools/lib';
const {requireAuth}=require(lib+'/requireAuth');const {getGlobalDefaultAccount}=require(lib+'/auth');const {Client}=require(lib+'/apiv2');

async function main(){
 await requireAuth({project:'kid-genius-world',...getGlobalDefaultAccount()});
 const client=new Client({urlPrefix:'https://cloudfunctions.googleapis.com',apiVersion:'v2',auth:true});
 const functions=(await client.get('/projects/kid-genius-world/locations/us-central1/functions')).body.functions||[];
 const checkout=functions.find(f=>f.name.split('/').at(-1).toLowerCase()==='billingcheckout');if(!checkout)throw Error('The current Kid Genius World checkout function was not found.');
 const env=checkout.serviceConfig.environmentVariables||{};
 const localEnv=Object.fromEntries(fs.readFileSync('C:/Users/koike/OneDrive/Desktop/kidsgeniusworld/functions/.env','utf8').split(/\r?\n/).filter(l=>/^[A-Z_]+=/.test(l)).map(l=>{const at=l.indexOf('=');return [l.slice(0,at),l.slice(at+1).trim().replace(/^([\"'])|([\"'])$/g,'')];}));const relevant=['STRIPE_SECRET_KEY','STRIPE_STARTER_PRICE_ID','STRIPE_PREMIUM_PRICE_ID','STRIPE_TEST_PRICE_ID','STRIPE_WEBHOOK_SECRET','COMPED_PARENT_EMAILS'];const deploymentEnvironmentMatches=relevant.every(k=>localEnv[k]===env[k]);console.log(JSON.stringify({localConfigMatchesLive:deploymentEnvironmentMatches,differentNames:relevant.filter(k=>localEnv[k]!==env[k])}));if(!env.STRIPE_SECRET_KEY)throw Error('Stripe runtime uses a secret reference; inspect it through the existing authorized deployment workflow.');
 const readStripe=async endpoint=>{const r=await fetch('https://api.stripe.com/v1/'+endpoint,{headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Stripe-Version':'2025-11-17.clover'}});if(!r.ok)throw Error('Stripe read failed: '+r.status);return r.json();};const price=await readStripe('prices/'+env.STRIPE_STARTER_PRICE_ID),portals=await readStripe('billing_portal/configurations?limit=10');
 const report={checkedAt:new Date().toISOString(),project:'kid-genius-world',functionNames:functions.filter(f=>/billing/i.test(f.name)).map(f=>f.name),checkoutUpdateTime:checkout.updateTime,
 price:{id:price.id,active:price.active,livemode:price.livemode,amount:price.unit_amount,currency:price.currency,interval:price.recurring?.interval,intervalCount:price.recurring?.interval_count},
 portals:portals.data.map(p=>({id:p.id,isDefault:p.is_default,active:p.active,cancelEnabled:p.features.subscription_cancel?.enabled,cancelMode:p.features.subscription_cancel?.mode})),stripeKeyAvailable:true};
 fs.mkdirSync('output/billing',{recursive:true});fs.writeFileSync('output/billing/existing-billing-inspection.json',JSON.stringify(report,null,2));
 fs.writeFileSync('output/billing/function-source-location.json',JSON.stringify(checkout.buildConfig.source,null,2));
 console.log(JSON.stringify(report,null,2));
 const config=await fetch('https://kid-genius-world.com/__/firebase/init.json').then(r=>r.json());
 if(config.projectId!=='kid-genius-world')throw Error('Unexpected Firebase project.');fs.writeFileSync('src/firebaseConfig.json',JSON.stringify(config,null,2));console.log('Existing public Firebase configuration saved for the same project.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
