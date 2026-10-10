import {test} from 'node:test';import assert from 'node:assert/strict';import {speak,stopSpeech,speechGeneration} from '../src/audio';
test('Browser narration completes and cancellation settles the old step before a new one',async()=>{
 let utterance:any;const synthesis={cancel(){},getVoices(){return[];},speak(u:any){utterance=u;}};
 (globalThis as any).window={speechSynthesis:synthesis};(globalThis as any).speechSynthesis=synthesis;(globalThis as any).SpeechSynthesisUtterance=class{constructor(public text:string){}};
 globalThis.fetch=async()=>new Response(JSON.stringify({available:false}),{status:200});
 const first=speak('first');await new Promise(r=>setImmediate(r));assert.equal(utterance.text,'first');const generation=speechGeneration();stopSpeech();assert.notEqual(speechGeneration(),generation);assert.equal(await first,false);
 const second=speak('second');await new Promise(r=>setImmediate(r));assert.equal(utterance.text,'second');utterance.onend();assert.equal(await second,true);stopSpeech();
});
test('Narration uses the preferred browser voice without a paid API request',async()=>{
 let utterance:any;const voice={name:'Microsoft Aria Natural',lang:'en-US'},synthesis={cancel(){},getVoices(){return[voice];},speak(u:any){utterance=u;}};
 (globalThis as any).window={speechSynthesis:synthesis};(globalThis as any).speechSynthesis=synthesis;
 globalThis.fetch=async()=>{throw Error('Narration must not request a paid API.');};
 const pending=speak('2 + 3 = 5',undefined,.72);assert.equal(utterance.voice,voice);assert.equal(utterance.rate,.72);assert.equal(utterance.text,'2 plus 3 equals 5');utterance.onend();assert.equal(await pending,true);stopSpeech();
});
