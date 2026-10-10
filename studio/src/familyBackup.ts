import {serviceUrl} from './serviceUrl';
import {validProfiles} from '../cloudflare/family-data.js';
import type {ExtendedProfile} from './learningTools';
export {validProfiles};
const encode=(b:Uint8Array)=>btoa(Array.from(b,c=>String.fromCharCode(c)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export function createFamilyCode(){return `wl1.${encode(crypto.getRandomValues(new Uint8Array(32)))}.${encode(crypto.getRandomValues(new Uint8Array(32)))}`;}
export function parseFamilyCode(code:string){const match=code.trim().match(/^wl1\.([a-zA-Z0-9_-]{43})\.([a-zA-Z0-9_-]{43})$/);if(!match)throw new Error('Use the full private family code, starting with wl1.');return {token:match[1],key:match[2]};}
export async function encryptFamily(profiles:ExtendedProfile[],code:string){
 if(!validProfiles(profiles))throw new Error('This family backup has an invalid format.');
 const data=parseFamilyCode(code),key=await crypto.subtle.importKey('raw',decode(data.key),{name:'AES-GCM'},false,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode('wonderlane-family-v1')},key,new TextEncoder().encode(JSON.stringify({version:1,profiles})));
 return {iv:encode(iv),ciphertext:encode(new Uint8Array(encrypted))};
}
export async function decryptFamily(payload:{iv:string;ciphertext:string},code:string):Promise<ExtendedProfile[]>{
 try{const {key:secret}=parseFamilyCode(code),key=await crypto.subtle.importKey('raw',decode(secret),{name:'AES-GCM'},false,['decrypt']);const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(payload.iv),additionalData:new TextEncoder().encode('wonderlane-family-v1')},key,decode(payload.ciphertext));const d=JSON.parse(new TextDecoder().decode(bytes));if(d.version!==1||!validProfiles(d.profiles))throw Error();return d.profiles;}catch{throw new Error('This private family code cannot open that backup. Check the full code.');}
}
export function mergeFamilies(local:ExtendedProfile[],remote:ExtendedProfile[],preferRemote=false):ExtendedProfile[]{
 if(!validProfiles(local)||!validProfiles(remote))throw new Error('The progress file has an invalid format.');
 const untouchedDefault=local.length===1&&local[0].name==='Explorer'&&local[0].mathGrade===1&&local[0].readingGrade===1&&!local[0].seenQuestions?.length&&!local[0].exhaustedSkills?.length&&!local[0].lastSkill&&!local[0].writingClearedAt&&!local[0].attempts.length&&!local[0].evidence?.length&&!local[0].placements&&!Object.keys(local[0].bookProgress||{}).length&&!remote.some(r=>r.id===local[0].id);
 const result=new Map((untouchedDefault?[]:local).map(p=>[p.id,p]));
 for(const r of remote){const l=result.get(r.id);if(!l){result.set(r.id,r);continue;}const writingClearedAt=Math.max(l.writingClearedAt||0,r.writingClearedAt||0),attempts=[...new Map([...l.attempts,...r.attempts].map(a=>[a.id,a])).values()].sort((a,b)=>a.at-b.at).slice(-12000),evidence=[...new Map([...(l.evidence||[]),...(r.evidence||[])].map(a=>[a.id,a])).values()].filter(e=>e.kind!=='writing'||e.at>writingClearedAt).sort((a,b)=>a.at-b.at).slice(-2000),bookProgress={...l.bookProgress};
 for(const [id,b] of Object.entries(r.bookProgress||{}))bookProgress[id]={page:Math.max(b.page,bookProgress[id]?.page||0),finished:!!(b.finished||bookProgress[id]?.finished)};
 const placements={...l.placements};for(const s of ['math','reading'] as const)if(r.placements?.[s]&&(!placements[s]||r.placements[s]!.at>placements[s]!.at))placements[s]=r.placements[s];
 result.set(r.id,{...(preferRemote?l:r),...(preferRemote?r:l),attempts,evidence,bookProgress,placements,seenQuestions:[...new Set([...(l.seenQuestions||[]),...(r.seenQuestions||[])])],exhaustedSkills:[...new Set([...(l.exhaustedSkills||[]),...(r.exhaustedSkills||[])])],...(writingClearedAt?{writingClearedAt}:{})});}
 if(result.size>4)throw new Error('These files contain more than four different learners. Keep a separate backup for each family.');return [...result.values()];
}
export type CloudSnapshot={revision:number;updatedAt?:number;iv?:string;ciphertext?:string};
export async function getCloudFamily(code:string):Promise<CloudSnapshot>{const {token}=parseFamilyCode(code);const r=await fetch(serviceUrl('/api/family-backup'),{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(!r.ok)throw new Error(d.error||'Cloud progress could not be opened.');return d;}
export async function saveCloudFamily(code:string,profiles:ExtendedProfile[]){
 const remote=await getCloudFamily(code),merged=remote.ciphertext?mergeFamilies(profiles,await decryptFamily(remote as Required<Pick<CloudSnapshot,'iv'|'ciphertext'>>,code)):profiles,encrypted=await encryptFamily(merged,code),{token}=parseFamilyCode(code);
 const r=await fetch(serviceUrl('/api/family-backup'),{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({...encrypted,revision:remote.revision})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Cloud progress could not be saved.');return {profiles:merged,updatedAt:d.updatedAt};
}
