import {narrationText} from './voiceGuidance';
import {getLocale,speechLanguage} from './locale';import {translateText} from './translation';
let activeRequest=0;let finish:((ok:boolean)=>void)|undefined;
export function speechGeneration(){return activeRequest;}
export function stopSpeech(){activeRequest++;finish?.(false);finish=undefined;if('speechSynthesis' in window)speechSynthesis.cancel();}
export async function speak(text:string,onWord?:(index:number)=>void,rate=.88,onStart?:()=>void):Promise<boolean>{
 text=narrationText(translateText(text));
 stopSpeech();const request=activeRequest;
 // The same built-in voice is used throughout Wonderlane. No paid narration API is requested.
 if(request!==activeRequest||!('speechSynthesis' in window))return false;
 return new Promise(resolve=>{let settled=false;const done=(ok:boolean)=>{if(settled)return;settled=true;if(finish===done)finish=undefined;resolve(ok);};finish=done;const utterance=new SpeechSynthesisUtterance(text);utterance.lang=speechLanguage();utterance.rate=rate;const voices=speechSynthesis.getVoices();utterance.voice=getLocale()==='es'?(voices.find(v=>/^es-MX/i.test(v.lang)&&/Dalia|Natural|Google/i.test(v.name))||voices.find(v=>/^es-(MX|US)/i.test(v.lang))||voices.find(v=>/^es/i.test(v.lang))||null):(voices.find(v=>v.lang==='en-US'&&/Jenny|Aria|Samantha|Natural|Google US/.test(v.name))||voices.find(v=>v.lang==='en-US')||null);if(getLocale()==='es'&&voices.length&&!utterance.voice){done(false);return;}utterance.onboundary=(e)=>{if(request!==activeRequest)return;const before=text.slice(0,e.charIndex).trim();onWord?.(before?before.split(/\s+/).length:0);};utterance.onstart=()=>{if(request===activeRequest)onStart?.();};utterance.onend=()=>done(true);utterance.onerror=()=>done(false);speechSynthesis.speak(utterance);});
}
