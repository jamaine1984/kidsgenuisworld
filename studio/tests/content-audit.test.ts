import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CURRICULUM,makeQuestion,questionContentId} from '../src/curriculum';
import {mathStudioQuestion} from '../src/mathExpansion';
import {STUDIO_TEXTS,STUDIO_PHRASES} from '../src/readingTexts';
import {recordAttempt,progress,type Profile,type Attempt} from '../src/learning';
import {modelDescription,rectangleDimensions,modelLabel} from '../src/mathModel';
const reference=JSON.parse(readFileSync(new URL('./fixtures/pronunciations.json',import.meta.url),'utf8'));
function value(expression:string,x=0):number{
 const tokens=expression.replace(/___/g,'X').replace(/\//g,'÷').match(/\d+|X|[+−×÷]/g)!;
 const parts:(number|string)[]=tokens.map(t=>t==='X'?x:/^\d+$/.test(t)?Number(t):t);
 for(let i=1;i<parts.length;i+=2)if(parts[i]==='×'||parts[i]==='÷'){const n=parts[i]==='×'?Number(parts[i-1])*Number(parts[i+1]):Number(parts[i-1])/Number(parts[i+1]);parts.splice(i-1,3,n);i-=2;}
 let result=Number(parts[0]);for(let i=1;i<parts.length;i+=2)result+=parts[i]==='+'?Number(parts[i+1]):-Number(parts[i+1]);return result;
}
test('Unknown equation answers and measurement expressions have one correct numerical solution',()=>{
 for(const s of CURRICULUM.filter(s=>s.subject==='math'))for(let seed=1;seed<=160;seed++){
  const q=makeQuestion(s,seed),match=q.prompt.match(/(?:\d+|___)(?:\s*[+−×÷/]\s*(?:\d+|___))*\s*=\s*(?:\d+|___)(?:\s*[+−×÷/]\s*(?:\d+|___))*/);
  if(q.prompt.includes('parts of size')&&q.prompt.includes('___'))assert.equal(Number(q.answer),q.visual.filled);
  else if(match?.[0].includes('___')){const [left,right]=match[0].split('='),slope=value(left,1)-value(left,0)-value(right,1)+value(right,0),expected=(value(right,0)-value(left,0))/slope;assert.ok(Math.abs(Number(q.answer)-expected)<1e-9,`${s.id}: ${q.prompt}`);}
  if(['area','perimeter','compositeArea','missingSide'].includes(s.p.engine)&&s.p.task===1){const expected=value(q.answer),matching=q.choices.filter(c=>Math.abs(value(c)-expected)<1e-9);assert.deepEqual(matching,[q.answer],`${s.id}: ${q.choices.join(' | ')}`);}
 }
});
test('Counting reaches stated endpoints, Grade 1 survey arithmetic stays within twenty, and scaled graph units match',()=>{
 for(const s of CURRICULUM.filter(s=>s.p.engine==='sequence'&&!s.p.mode)){
  const edge=mathStudioQuestion({...s,p:{...s.p,task:0}},0,()=>.999999);
  const end=Number(edge.answer);assert.ok(end>=0&&end<=s.p.max,s.id);
  if(s.p.step>0)assert.equal(end,Math.floor(s.p.max/s.p.step)*s.p.step);
  else assert.equal(mathStudioQuestion({...s,p:{...s.p,task:0}},0,()=>0).answer,'0');
 }
 for(let seed=1;seed<=800;seed++)for(const s of CURRICULUM.filter(s=>s.grade===1&&s.p.engine==='chart')){const q=makeQuestion(s,seed);assert.ok(q.visual.values.reduce((a:number,b:number)=>a+b,0)<=20,s.id);}
 for(const s of CURRICULUM.filter(s=>s.kind==='data'&&s.p.scale>1))for(let seed=1;seed<=160;seed++){const q=makeQuestion(s,seed);assert.ok(q.prompt.includes('votes'));assert.equal(Number(q.answer),q.visual.values[0]);}
 const difference=CURRICULUM.find(s=>s.kind==='word'&&s.p.op==='difference')!;for(let seed=1;seed<=160;seed++)assert.ok(!/Theo has.*Theo has/.test(makeQuestion(difference,seed).prompt));
 for(const s of CURRICULUM.filter(s=>s.p.engine==='compose'))assert.ok(s.teach.includes('two equal short sides'));
 for(const s of CURRICULUM.filter(s=>s.p.engine==='measureStory'&&s.p.mode==='liters'))assert.ok(s.p.max<=20);
 assert.ok(CURRICULUM.filter(s=>s.grade===3&&s.subject==='math').every(s=>s.p.unit!=='milliliters'&&s.p.mode!=='milliliters'));
});
test('Clock intervals and fraction comparisons are correct across grades',()=>{
 const minutes=(t:string)=>{const [h,m]=t.split(':').map(Number);return h%12*60+m;};
 for(const s of CURRICULUM.filter(s=>['clock','elapsed'].includes(s.p.engine)))for(let seed=1;seed<=160;seed++){
  const q=makeQuestion(s,seed),times=q.prompt.match(/\d{1,2}:\d{2}/g)||[],t=s.p.task;
  if(s.p.engine==='clock'&&t===0)assert.equal(minutes(q.answer),s.p.step===60?q.visual.hour%12*60:q.visual.hour%12*60+q.visual.minute);
  if(s.p.engine==='elapsed'&&(t===0||t===3))assert.equal(Number(q.answer),(minutes(times[1])-minutes(times[0])+720)%720);
  if(s.p.engine==='elapsed'&&t===1){const delta=Number(q.prompt.match(/Work for (\d+)/)![1]);assert.equal((minutes(q.answer)-minutes(times[0])+720)%720,delta);}
  if(s.p.engine==='elapsed'&&t===2){const delta=Number(q.prompt.match(/after (\d+)/)![1]);assert.equal((minutes(times[0])-minutes(q.answer)+720)%720,delta);}
 }
 for(const s of CURRICULUM.filter(s=>['compareD','compareN'].includes(s.p.mode)))for(let seed=1;seed<=160;seed++){
  if(![0,1,3].includes(s.p.task))continue;const q=makeQuestion(s,seed),fractions=q.prompt.match(/\d+\/\d+/g)!,numbers=fractions.map(f=>value(f));assert.equal(value(q.answer),s.p.task===1?Math.min(...numbers):Math.max(...numbers));
 }
});
test('Area models use square units, perimeter proportions are faithful, and simple mat descriptions are valid',()=>{
 assert.equal(modelLabel([10,' units']),'10 units');assert.equal(modelLabel([5,' rows · ',2,' in each']),'5 rows · 2 in each');
 for(const s of CURRICULUM.filter(s=>s.subject==='math'))for(let seed=1;seed<=40;seed++){
  const q=makeQuestion(s,seed);if(!q.visual||['clock','coins','ruler','chart'].includes(q.visual.type))continue;
  assert.ok(!/undefined|NaN/.test(modelDescription(q.visual)),s.id);
  if(s.kind==='area'||['area','missingSide'].includes(s.p.engine))assert.equal(q.visual.unitSquares,true);
  if(q.visual.type==='rectangle'){const size=rectangleDimensions(q.visual.length,q.visual.width);assert.ok(Math.abs(size.length/size.width-q.visual.length/q.visual.width)<1e-9);assert.ok(modelDescription(q.visual).includes('outside sides'));}
 }
});
test('Grammar prompts specify meaning and tense, related adverbs match, and statement dialogue uses a comma',()=>{
 for(const s of CURRICULUM.filter(s=>s.p.studio==='Language and Vocabulary'))for(let seed=1;seed<=80;seed++){
  const q=makeQuestion(s,seed);
  if(s.grade===3&&s.p.unit===4){assert.ok(q.prompt.includes('punctuation correctly'));assert.ok(s.p.task%2===0?q.answer.includes('?” asked Mia.'):q.answer.includes(',” said Mia.'));}
  if((s.grade===2&&s.p.unit===4||s.grade===3&&s.p.unit===3)){assert.ok(/contrast|adds|reason|choice|result/.test(q.prompt));}
  if(s.grade>1&&s.p.unit===1&&s.p.task===1)assert.ok(q.prompt.includes('present-tense'));
  if(s.grade>1&&s.p.unit===2&&s.p.task===3){const [adj,adv]=q.answer.split(' / ');assert.equal(adv,adj+'ly');}
  assert.ok(!/\bruning\b/.test(JSON.stringify(q)));
 }
});
test('Word targets and syllable counts have independent pronunciation references; phrase models preserve the complete sentence',()=>{
 for(const s of CURRICULUM.filter(s=>s.subject==='reading'))for(let seed=1;seed<=100;seed++){
  const q=makeQuestion(s,seed);if(q.word)assert.ok(reference.entries[q.word]?.length||reference.manualWords[q.word],q.word);
  if(s.kind==='syllable'||s.p.studio==='Phonics and Word Patterns'&&s.p.task===2&&s.p.patterns?.some((p:string)=>p.includes('syllables'))){const word=q.word||q.passage!,expected=Number(q.answer.match(/\d+/)![0]);assert.ok(reference.entries[word].some((phones:string[])=>phones.filter(p=>/[012]/.test(p)).length===expected),`${word}: ${expected}`);}
 }
 for(const grade of [1,2,3])for(let i=0;i<STUDIO_TEXTS[grade].length;i++){const text=STUDIO_TEXTS[grade][i];assert.equal(STUDIO_PHRASES[grade][i].replace(/\s*\/\s*/g,' '),text.text.split(/(?<=[.!?])\s+/)[0]);assert.ok(text.text.includes(text.detail));}
 assert.ok(STUDIO_TEXTS[1][5].text.includes('They want to try both fruits.'));
 assert.ok(STUDIO_TEXTS[3][2].text.includes('evaporated into the air'));
 assert.ok(STUDIO_TEXTS[3][9].wrong.includes('They used unequal spoonfuls of water.'));
});
test('Listening sound matches are supported by phonemes and have no matching distractor',()=>{
 const signature=(phones:string[],topic:string)=>{const clean=phones.map(p=>p.replace(/[012]/g,''));if(topic==='initial')return clean[0];if(topic==='final')return clean.at(-1);if(topic==='middle')return clean.find((_,i)=>/[012]/.test(phones[i]));const stress=phones.map(p=>/[12]/.test(p)).lastIndexOf(true);return clean.slice(stress).join(' ');};
 for(const s of CURRICULUM.filter(s=>s.kind==='listening'))for(let seed=1;seed<=160;seed++){
  const q=makeQuestion(s,seed);let topic:string|undefined,anchor:string|undefined;
  if(['initial','final','rhyme'].includes(s.p.mode)){topic=s.p.mode;anchor=q.listeningText!.match(/word (\w+)/)![1];}
  if(s.p.studio==='Sounds and Listening'&&(s.grade===1&&s.p.unit<4||s.grade===2&&s.p.unit===0)){topic=s.grade===2?'rhyme':['initial','final','middle','rhyme'][s.p.unit];anchor=q.listeningText!.match(/carefully: (\w+)/)![1];}
  if(!topic||!anchor)continue;const matches=(word:string)=>reference.entries[anchor!]?.some((a:string[])=>reference.entries[word]?.some((b:string[])=>signature(a,topic!)===signature(b,topic!)));
  assert.ok(matches(q.answer),`${s.id}: ${anchor}/${q.answer}`);for(const wrong of q.choices.filter(w=>w!==q.answer))assert.ok(!matches(wrong),`${s.id}: matching distractor ${wrong}`);
 }
});
test('Repeated content across sessions cannot earn independent mastery, and retained requires a later fresh check set',()=>{
 const skill=CURRICULUM.find(s=>s.id==='m1-1')!,q=makeQuestion(skill,4),key=questionContentId(q);assert.equal(questionContentId({...q,id:'another-session',choices:[...q.choices].reverse()}),key);
 let p:Profile={id:'qa',name:'QA',mathGrade:1,readingGrade:1,attempts:[]};const day=Date.UTC(2026,9,9,10);
 const attempt=(id:string,contentId:string,at=day):Attempt=>({id,contentId,skillId:skill.id,questionId:id,correct:true,assisted:false,phase:'check',at});
 for(let i=0;i<8;i++)p=recordAttempt(p,attempt('replay'+i,key));assert.equal(progress(p,skill.id).state,'Practicing');assert.equal(progress(p,skill.id).independent,1);
 p={...p,attempts:[]};for(let i=0;i<4;i++)p=recordAttempt(p,attempt('new'+i,'new-content'+i));assert.equal(progress(p,skill.id).state,'Independent');
 p=recordAttempt(p,attempt('later0','later-content0',day+2*86400000));assert.equal(progress(p,skill.id).state,'Independent');
 for(let i=1;i<4;i++)p=recordAttempt(p,attempt('later'+i,'later-content'+i,day+2*86400000));assert.equal(progress(p,skill.id).state,'Retained');
 const imported={...p,attempts:Array.from({length:8},(_,i)=>({...attempt('import'+i,'same'),questionId:'same-old-question'}))};assert.equal(progress(imported,skill.id).state,'Practicing');
});
