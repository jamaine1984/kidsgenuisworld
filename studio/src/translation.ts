import dictionary from './translations.json';import {getLocale,type Locale} from './locale';
import {SPANISH_PACKS} from './spanishWords';import {SPANISH_STORIES,SPANISH_INFO} from './spanishTexts';
import {SPANISH_TOUR_STEPS} from './tourScript';
// A Spanish word may also be an English word (pan, pie, red). Native curriculum
// content must never pass through the English-to-Spanish UI dictionary.
const native=new Set<string>(Object.values(SPANISH_PACKS).flat().flatMap(p=>[p.name,p.teach,p.rule,...p.wrong,...p.words.flatMap(w=>[w.word,...w.syllables])]));
for(const word of ['pan','pie','red'])native.add(word);
for(const step of SPANISH_TOUR_STEPS){native.add(step.label);native.add(step.text);}
for(const text of [...Object.values(SPANISH_STORIES).flat(),...Object.values(SPANISH_INFO).flat()]){for(const s of [text.title,text.text,text.main,...text.detail.slice(0,2),...text.cause.slice(0,2),...text.word.slice(0,2)] as string[])native.add(s);for(const word of text.text.toLowerCase().match(/\p{L}+/gu)||[])native.add(word);}
const entries=dictionary as Record<string,string>;const normal=(s:string)=>s.replace(/\s+/g,' ').trim();const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const insensitive=new Map(Object.entries(entries).filter(([s])=>!s.includes('${')).map(([s,value])=>[s.toLowerCase(),value]));
const patterns=Object.entries(entries).filter(([s])=>s.includes('${')&&/[A-Za-z]{3}/.test(s.replace(/\$\{\d+\}/g,''))).map(([source,target])=>{const pieces=source.split(/\$\{\d+\}/);return {source,target,weight:pieces.join('').length,regex:new RegExp('^'+pieces.map(escape).join('(.*?)')+'$','u')};}).sort((a,b)=>b.weight-a.weight);
const missing=new Set<string>();export const missingTranslations=()=>[...missing];
const cache=new Map<string,string>();
export function translateText(text:string,locale:Locale=getLocale(),depth=0,nativeContent=true):string{if(locale!=='es'||!text||depth>4)return text;if(depth)return translateUncached(text,locale,depth,nativeContent);const key=(nativeContent?'native:':'math:')+text;if(cache.has(key))return cache.get(key)!;const value=translateUncached(text,locale,depth,nativeContent);if(cache.size>=5000)cache.delete(cache.keys().next().value!);cache.set(key,value);return value;}
function translateUncached(text:string,locale:Locale,depth:number,nativeContent:boolean):string{
 if(locale!=='es'||!text||depth>4)return text;const value=normal(text);if(nativeContent&&native.has(value))return text;const pad=(s:string)=>(/^\s/.test(text)?' ':'')+s+(/\s$/.test(text)?' ':'');if(entries[value])return pad(entries[value]);const folded=insensitive.get(value.toLowerCase());if(folded)return pad(value===value.toUpperCase()?folded.toUpperCase():value[0]===value[0]?.toLowerCase()?folded[0].toLowerCase()+folded.slice(1):folded);
 for(const p of patterns){const m=value.match(p.regex);if(m)return pad(p.target.replace(/\$\{(\d+)\}/g,(_,n)=>translateText(m[Number(n)+1],locale,depth+1,nativeContent)));}
 // Generated activity titles join independently translated concepts and tasks.
 // Keep this structural rule narrow so numbers, syllables and names stay intact.
 const separator=value.includes(': ')?': ':value.includes(' · ')?' · ':null;
 if(separator){const parts=value.split(separator);const translated=parts.map(s=>translateText(s,locale,depth+1,nativeContent));if(translated.every((s,i)=>s!==parts[i]||!/[A-Za-z]{3}/.test(s)||nativeContent&&native.has(s)))return pad(translated.join(separator));}
 const sentences=value.split(/(?<=[.!?])\s+/);if(sentences.length>1)return sentences.map(s=>translateText(s,locale,depth+1,nativeContent)).join(' ');
 if(/[A-Za-z]{3}/.test(value))missing.add(value);return text;
}
export function tr<T>(value:T):T{if(typeof value==='string')return translateText(value) as T;if(Array.isArray(value))return value.map(v=>tr(v)) as T;return value;}
