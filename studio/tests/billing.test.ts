import {test} from 'node:test';import assert from 'node:assert/strict';
import {canLearn,safeBillingUrl,familyStorageKey,MONTHLY_PRICE_CENTS,TRIAL_DAYS} from '../src/billingPolicy';
import {readStore,writeStore,type Store} from '../src/learning';
import {TOUR_STEPS,TOUR_FRAMES} from '../src/tourScript';
import {validateMonthlyPrice,ownedSubscription,checkoutParams} from '../firebase-billing/functions/billing-policy.js';
test('Membership uses verified billing state; redirects and account storage remain bounded',()=>{
 assert.equal(MONTHLY_PRICE_CENTS,499);assert.equal(TRIAL_DAYS,0);assert.equal(canLearn(null),false);assert.equal(canLearn({active:true,status:'canceled'}),false);assert.equal(canLearn({active:false,status:'active'}),false);assert.equal(canLearn({active:true,status:'active'}),true);assert.equal(canLearn({active:true,status:'trialing'}),true);
 assert.throws(()=>safeBillingUrl('https://untrusted.example/checkout'));assert.throws(()=>safeBillingUrl('javascript:alert(1)'));assert.match(safeBillingUrl('https://checkout.stripe.com/c/pay/example'),/^https:\/\/checkout.stripe.com/);assert.notEqual(familyStorageKey('one'),familyStorageKey('two'));
});
test('New checkout charges one $4.99 monthly plan, without a trial or promotion override',()=>{
 const price={active:true,unit_amount:499,currency:'usd',recurring:{interval:'month',interval_count:1}};assert.ok(validateMonthlyPrice(price));assert.ok(!validateMonthlyPrice({...price,unit_amount:1000}));assert.ok(!validateMonthlyPrice({...price,recurring:{interval:'year',interval_count:1}}));
 const p=checkoutParams({customerId:'owned-customer',priceId:'price-499',uid:'parent-one',familyId:'family-parent-one',returnUrl:'https://kid-genius-world.com'});assert.equal(p.subscription_data.trial_period_days,undefined);assert.equal(p.subscription_data.trial_end,undefined);assert.equal(p.metadata.trial_days,'0');assert.deepEqual(p.line_items,[{price:'price-499',quantity:1}]);assert.equal(p.customer,'owned-customer');assert.equal(p.allow_promotion_codes,false);
 const foreign={status:'active',items:{data:[{price:{id:'unrelated'}}]}},canceled={status:'canceled',items:{data:[{price:{id:'price-499'}}]}},current={status:'active',items:{data:[{price:{id:'price-499'}}]}};assert.equal(ownedSubscription([foreign,canceled,current],['price-499']),current);
});
test('Different parent accounts do not restore or overwrite one another’s learner history',()=>{
 const data=new Map<string,string>();Object.assign(globalThis,{localStorage:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v)}});
 const make=(id:string):Store=>({version:1,profiles:[{id,name:id,mathGrade:1,readingGrade:1,attempts:[],seenQuestions:['q-'+id]}],activeId:id,settings:{voice:true,reducedMotion:false,flatMode:false,music:false},createdAt:1});
 writeStore(make('one'),familyStorageKey('parent-one'));writeStore(make('two'),familyStorageKey('parent-two'));assert.equal(readStore(familyStorageKey('parent-one')).profiles[0].id,'one');assert.equal(readStore(familyStorageKey('parent-two')).profiles[0].id,'two');assert.equal(data.has('wonderlane:v1'),false);
});
test('The tour gives reading 30 seconds, math 30 seconds, and the app 60 seconds',()=>{
 assert.equal(TOUR_FRAMES/30,120);assert.equal(TOUR_STEPS[3].from/30,30);assert.equal(TOUR_STEPS[6].from/30,60);assert.ok(TOUR_STEPS.every((s,i)=>s.from===i*300&&s.frames===300&&s.text.length>60));assert.ok(!/no free trial/i.test(TOUR_STEPS.at(-1)!.text));
});
