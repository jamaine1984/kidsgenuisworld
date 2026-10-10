import type {Question} from './curriculum';
const normal=(s:string)=>s.toLowerCase().replace(/[“”‘’]/g,"'").replace(/\s+/g,' ').trim();
export function identityHash(data:unknown){let h=0xcbf29ce484222325n;for(const c of JSON.stringify(data)){h^=BigInt(c.codePointAt(0)!);h=BigInt.asUintN(64,h*0x100000001b3n);}return h.toString(16).padStart(16,'0');}
// IDs, answer-choice order, hints, character names and cosmetic model changes do not create a new question.
export function questionKey(q:Question):string{
 if(q.canonicalKey)return q.canonicalKey;
 let content:unknown;
 const equation=q.prompt.match(/^(?:What is|Calculate|Solve)\s+(\d+)\s*([+−×÷])\s*(\d+)\??$/i);
 if(equation){const numbers=[Number(equation[1]),Number(equation[3])];if(['+','×'].includes(equation[2]))numbers.sort((a,b)=>a-b);content=['calculate',equation[2],numbers];}
 else if(q.tiles)content=[q.tileJoin?'sentence-build':'word-build',normal(q.answer)];
 else if(q.word&&/(?:syllable|cuántas sílabas)/i.test(q.prompt))content=['syllable-count',normal(q.word)];
 else if(q.word&&/spelling|listen.*(?:word|spelling)/i.test(q.prompt))content=['hear-and-spell',normal(q.word)];
 else if(q.visual?.type==='counters'&&/how many counters/i.test(q.prompt))content=['count-counters',q.visual.count];
 else content=[normal(q.prompt).replace(/\b(theo|mia|sam|lena|omar|nina|kai|ava|jun|rosa|max|zoe|lee|nora|ben)\b/g,'learner'),q.passage?normal(q.passage):null,q.word?normal(q.word):null,q.listeningText?normal(q.listeningText):null,normal(q.answer),q.visual||null];
 return 'q-'+identityHash(q.language==='es'?['es-reading',content]:content);
}
export function markSeen<T extends {seenQuestions?:string[]}>(p:T,keys:string[]):T{const seen=new Set(p.seenQuestions||[]);let changed=false;for(const k of keys)if(!seen.has(k)){seen.add(k);changed=true;}return changed?{...p,seenQuestions:[...seen]}:p;}
