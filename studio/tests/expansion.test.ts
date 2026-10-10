import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CURRICULUM,makeQuestion,freshQuestion} from '../src/curriculum';
import {STUDIO_WORD_BANKS} from '../src/readingExpansion';
import {STUDIO_TEXTS} from '../src/readingTexts';
import {taskDirections,narrationText} from '../src/voiceGuidance';
import {demoScript} from '../src/demoScript';
import {progress} from '../src/learning';
import {ACTIVITY_BUDGETS} from '../src/activityBudgets';

test('Every grade has five math areas and six reading areas, with forty activities in each',()=>{
 assert.equal(CURRICULUM.length,1320);assert.equal(new Set(CURRICULUM.map(s=>s.id)).size,1320);
 for(const grade of [1,2,3])for(const subject of ['math','reading']){
  const pool=CURRICULUM.filter(s=>s.grade===grade&&s.subject===subject),areas=[...new Set(pool.map(s=>s.domain))];
  assert.equal(areas.length,subject==='math'?5:6);
  for(const area of areas){const activities=pool.filter(s=>s.domain===area);assert.equal(activities.length,40,`${grade}/${subject}/${area}`);assert.equal(new Set(activities.map(s=>s.title)).size,40);}
 }
 // IDs from the published first expansion remain readable by saved progress.
 for(const grade of [1,2,3])for(const prefix of ['m','r'])for(let i=1;i<=30;i++)assert.ok(CURRICULUM.some(s=>s.id===`${prefix}${grade}-${i}`));
 for(const s of CURRICULUM){if(!s.prerequisite)continue;const before=CURRICULUM.find(x=>x.id===s.prerequisite);assert.ok(before,s.id);assert.equal(before.grade,s.grade);assert.equal(before.subject,s.subject);}
});
function arithmetic(expression:string):number{
 const clean=expression.replace(/\s/g,'');const terms=clean.match(/\d+|[+−×÷]/g)!;let values:(number|string)[]=terms.map(v=>/^\d+$/.test(v)?Number(v):v);
 for(let i=1;i<values.length;i+=2)if(values[i]==='×'||values[i]==='÷'){const value=values[i]==='×'?(values[i-1] as number)*(values[i+1] as number):(values[i-1] as number)/(values[i+1] as number);values.splice(i-1,3,value);i-=2;}
 let total=values[0] as number;for(let i=1;i<values.length;i+=2)total+=values[i]==='+'?(values[i+1] as number):-(values[i+1] as number);return total;
}
test('Teaching equations are numerically true, models fit grade limits, and graph keys divide their values',()=>{
 for(const s of CURRICULUM.filter(s=>s.subject==='math'))for(let seed=1;seed<=100;seed++){
  const q=makeQuestion(s,seed);
  for(const match of q.explanation.matchAll(/(\d+(?:\s*[+−×÷]\s*\d+)+)\s*=\s*(\d+)/g))assert.equal(arithmetic(match[1]),Number(match[2]),`${s.id}: ${match[0]}`);
  const v=q.visual;if(v?.type==='array'){assert.ok(v.rows>0&&v.cols>0);assert.ok(v.rows<= (s.grade===2?5:10));assert.ok(v.cols<=(s.grade===2?5:10));}
  if(v?.type==='fraction'){assert.ok([2,3,4,6,8].includes(v.parts));assert.ok(v.filled>=1&&v.filled<=v.parts*(v.wholes||1));}
  if(v?.type==='chart')for(const value of v.values)assert.equal(value%(v.scale||1),0,`${s.id}: graph key`);
  if(s.kind==='mathStudio'&&s.p.engine==='sequence')for(const n of (q.prompt.match(/\d+/g)||[]).map(Number))assert.ok(n<=s.p.max,`${s.id}: ${q.prompt}`);
 }
});
test('Regrouping tasks really exchange a ten and group-size questions differ from group-count questions',()=>{
 for(const s of CURRICULUM.filter(s=>s.p.engine==='arithmetic'&&s.p.mode?.includes('Regroup')))for(let seed=1;seed<=80;seed++){
  const q=makeQuestion({...s,p:{...s.p,task:0}},seed),[part,whole]=(q.prompt.match(/\d+/g)||[]).map(Number);
  if(s.p.mode.startsWith('sub'))assert.ok(whole%10<part%10,`${s.id}: ${q.prompt}`);else assert.ok(whole%10+part%10>=10,`${s.id}: ${q.prompt}`);
  assert.ok(Number(q.answer)>=0&&Number(q.answer)<=s.p.max);
 }
 const count=CURRICULUM.find(s=>s.id==='m3-8')!,share=CURRICULUM.find(s=>s.id==='m3-7')!;
 for(let seed=1;seed<=80;seed++){const a=makeQuestion(count,seed),b=makeQuestion(share,seed);assert.equal(Number(a.answer),a.visual.rows);assert.equal(Number(b.answer),b.visual.cols);}
});
test('Spelling tiles reconstruct their targets, text evidence is real, and sound tasks have spoken input',()=>{
 for(const s of CURRICULUM.filter(s=>s.subject==='reading'))for(let seed=1;seed<=80;seed++){
  const q=makeQuestion(s,seed);if(q.tiles)assert.equal(q.tiles.join(q.tileJoin||''),q.answer,s.id);
  if(s.kind==='listening')assert.ok(q.listeningText,s.id);
  if(s.p.studio==='Stories and Comprehension'&&s.p.task===0)assert.ok(q.passage?.includes(q.answer),s.id);
  if(s.p.studio==='Phonics and Word Patterns'&&s.p.task===2&&s.p.patterns?.some((p:string)=>p.includes('syllables'))){const answer=Number(q.answer.match(/\d/)![0]);assert.ok(q.choices.filter(c=>/one|two|three|four/i.test(c)).every(c=>!c.toLowerCase().startsWith(['','one','two','three','four'][answer])));}
 }
 for(const grade of [1,2,3]){for(const bank of STUDIO_WORD_BANKS[grade]){assert.ok(new Set(bank.words).size>=8,bank.name);assert.ok(bank.sentences.length>=3);}for(const text of STUDIO_TEXTS[grade]){assert.ok(text.text.includes(text.detail),text.title);assert.ok(text.text.split(' ').length>15);}}
});
test('Voice directions give normal task input and keep answer explanations separate',()=>{
 const s=CURRICULUM.find(s=>s.p.studio==='Spelling and Sentence Building'&&s.p.task===0)!,q=makeQuestion(s,42);
 assert.ok(taskDirections(q).includes(q.word!));assert.ok(!taskDirections(q).includes(q.explanation));
 assert.equal(narrationText('6 × ___ = 24; 1/4 + 1/4 = 2/4.'),'6 times blank equals 24; 1 over 4 plus 1 over 4 equals 2 over 4.');
 const listening=CURRICULUM.find(s=>s.grade===3&&s.p.studio==='Sounds and Listening'&&s.p.unit===2)!;
 const script=demoScript(listening,makeQuestion(listening,8));assert.ok(script.filter(s=>s.label==='Listen together').every(s=>s.text.split(/\s+/).length<=32));
 const book=CURRICULUM.find(s=>s.p.studio==='Stories and Comprehension')!;assert.equal(freshQuestion(book,42,6).repeated,true);
});
test('Lower grades use named equal shares and Grade 2 arrays use repeated addition',()=>{
 for(const s of CURRICULUM.filter(s=>s.subject==='math'&&s.grade<3))for(let seed=1;seed<=60;seed++){
  const q=makeQuestion(s,seed);if(s.kind==='fraction'||s.p.engine==='shares')assert.ok(!/\d+\/\d+|numerator|denominator/.test(JSON.stringify(q)),s.id);
  if(s.grade===2&&(s.kind==='multiply'||s.p.engine==='groups'))assert.ok(!/[×÷]/.test(JSON.stringify(q)),s.id);
 }
});
test('Fluency remains practice even if older imported attempts incorrectly call it a check',()=>{
 const skill=CURRICULUM.find(s=>s.kind==='fluency')!,profile:any={attempts:Array.from({length:5},(_,i)=>({skillId:skill.id,correct:true,assisted:false,phase:'check',at:Date.now(),id:String(i)}))};
 const result=progress(profile,skill.id);assert.equal(result.state,'Practicing');assert.equal(result.independent,0);assert.equal(result.due,false);
});
test('Fixed books have one useful practice task and seeded work keeps a longer set',()=>{
 for(const s of CURRICULUM){assert.ok(ACTIVITY_BUDGETS[s.id]>=1&&ACTIVITY_BUDGETS[s.id]<=10,s.id);if(s.p.studio==='Stories and Comprehension'||s.p.studio==='Fluency and Read-along')assert.equal(ACTIVITY_BUDGETS[s.id],1,s.id);}
 assert.equal(ACTIVITY_BUDGETS['m1-8'],10);const book=CURRICULUM.find(s=>s.p.studio==='Stories and Comprehension')!;const result=progress({attempts:[{skillId:book.id,correct:true,assisted:true,phase:'practice',at:Date.now()}]} as any,book.id);assert.equal(result.state,'Practiced');assert.equal(result.independent,0);
});
