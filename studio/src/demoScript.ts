import type {Question,Skill} from './curriculum';
export type DemoStep={label:string;text:string;display:string;from:number;frames:number};
const realPairs:Record<string,string>={cube:'cub',kite:'kit',tube:'tub',note:'not',hope:'hop'};
export function demoScript(skill:Skill,q:Question):DemoStep[]{
 let steps:{label:string;text:string;display:string}[];
 if((skill.p.bank==='silentE'||skill.p.patterns?.includes('final e'))&&q.word){const w=q.word,base=realPairs[w],vowel=w.match(/[aeiou]/)?.[0]||'u';
  steps=[{label:'Listen',text:base?`Listen to these words. ${base}. ${w}. Adding a final silent e changes the vowel sound.`:`Listen to the word ${w}. Look for the vowel ${vowel} and the final e.`,display:base?`${base} → ${w}`:w},
   {label:'Notice the pattern',text:`In ${w}, listen to the long ${vowel} sound. The final e is quiet. We write the e, but we do not give it a separate sound.`,display:`${w} · final e is silent`},
   {label:'Build and read',text:`The letters are ${w.split('').join(', ')}. Together they spell ${w}. Read the whole word: ${w}. Then you will try a new word.`,display:w.split('').join(' · ')}];
 }else if(q.word&&['phonics','spelling'].includes(skill.kind)){
  steps=[{label:'Listen',text:`Listen to the word: ${q.word}. Say the word with me: ${q.word}.`,display:q.word},
   {label:'Look at the spelling',text:`${skill.teach} The spelling for this word is ${q.word.split('').join(', ')}.`,display:q.tiles?.join(' · ')||q.word},
   {label:'Read it together',text:`Together, these letters spell ${q.word}. Now you will try another word. You can press Hear the word whenever you need it.`,display:q.word}];
 }else if(q.listeningText){
  steps=[];const words=q.listeningText.split(/\s+/);for(let i=0;i<words.length;i+=32){const text=words.slice(i,i+32).join(' ');steps.push({label:'Listen together',text,display:text});}steps.push({label:'Think it through',text:q.prompt+' '+q.hint,display:q.prompt},{label:'See how it works',text:q.explanation,display:q.explanation});
 }else if(q.passage){
  const words=q.passage.split(/\s+/);steps=[];for(let i=0;i<words.length;i+=32){const text=words.slice(i,i+32).join(' ');steps.push({label:'Read together',text,display:text});}
  steps.push({label:'Think about the question',text:q.prompt,display:q.prompt},{label:'Find a clue',text:q.explanation,display:q.explanation});
 }else{
  steps=[{label:'Look at the problem',text:q.prompt,display:q.prompt},{label:'Try a strategy',text:q.hint,display:q.hint},{label:'See how it works',text:q.explanation+' Your turn will use a new problem.',display:q.explanation}];
 }
 // Keep longer explanations readable and let every spoken chunk finish.
 steps=steps.flatMap(s=>{const words=s.text.split(/\s+/);if(words.length<=36)return[s];const chunks=[];for(let i=0;i<words.length;i+=32){const text=words.slice(i,i+32).join(' ');chunks.push({label:s.label+(i?' · continued':''),text,display:text});}return chunks;});
 let from=0;return steps.map(s=>{const frames=Math.max(150,Math.ceil(s.text.split(/\s+/).length/1.8*30));const step={...s,from,frames};from+=frames;return step;});
}
