import {CURRICULUM, makeQuestion, questionContentId, type Question, type Skill, type Subject} from './curriculum';
import {progress, recommendation, type Profile} from './learning';
import {ACTIVITY_BUDGETS} from './activityBudgets';
import {questionKey,markSeen} from './questionIdentity';
export {questionKey,markSeen};

export type ToolEvidence={id:string;kind:'mission'|'book'|'writing'|'readaloud'|'placement';itemId:string;grade:number;subject:Subject;correct:boolean;assisted:boolean;at:number;detail?:string};
export type Placement={subject:Subject;grade:number;at:number;correct:number;total:number;startSkillId:string;answers:{skillId:string;correct:boolean;assisted:boolean}[]};
export type ExtendedProfile=Profile&{evidence?:ToolEvidence[];placements?:Partial<Record<Subject,Placement>>;bookProgress?:Record<string,{page:number;finished?:boolean}>;writingClearedAt?:number;};
export function addEvidence(p:ExtendedProfile,e:ToolEvidence):ExtendedProfile{return p.evidence?.some(x=>x.id===e.id)?p:{...p,evidence:[...(p.evidence||[]),e].slice(-2000)};}
export function dayKey(at=Date.now()){const d=new Date(at);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function gradeOf(p:Profile,subject:Subject){return subject==='math'?p.mathGrade:p.readingGrade;}
export function placementItems(p:Profile,subject:Subject,seed:number){
 const grade=gradeOf(p,subject),pool=CURRICULUM.filter(s=>s.grade===grade&&s.subject===subject),domains=[...new Set(pool.map(s=>s.domain))];
 const seen=knownQuestions(p);return domains.flatMap(d=>{const skills=pool.filter(s=>s.domain===d);return [skills[0],skills[Math.min(3,skills.length-1)]];}).flatMap((skill,i)=>{for(let n=0;n<600;n++){const question=makeQuestion(skill,seed+i*173+n*101),key=questionKey(question);if(!seen.keys.has(key)&&!seen.content.has(questionContentId(question))){seen.keys.add(key);return [{skill,question}];}}return [];});
}
export function placementResult(p:Profile,subject:Subject,answers:Placement['answers'],at=Date.now()):Placement{
 const first=answers.find(a=>!a.correct||a.assisted),fallback=answers[0]?.skillId||recommendation(p,subject).id;
 return {subject,grade:gradeOf(p,subject),at,correct:answers.filter(a=>a.correct&&!a.assisted).length,total:answers.length,startSkillId:first?.skillId||fallback,answers};
}
export type PlannedQuestion=Question&{phase:'practice'|'check'};
// Reserve transfer items BEFORE teaching. Never show the held-back items in the example or guided practice.
export function knownQuestions(p:Profile){return {keys:new Set([...(p.seenQuestions||[]),...p.attempts.map(a=>a.questionKey).filter((k):k is string=>!!k)]),content:new Set(p.attempts.map(a=>a.contentId).filter((k):k is string=>!!k))};}
export function planSession(skill:Skill,seed:number,p:Profile):{demo:Question|null;queue:PlannedQuestion[];teachingOnly?:boolean}{
 const size=ACTIVITY_BUDGETS[skill.id]||10,known=knownQuestions(p),seen=new Set(known.keys),content=new Set(known.content);let demo:Question|null=null;const pool:Question[]=[];
 for(let n=0;n<600;n++){const q=makeQuestion(skill,seed+913+n*101),key=questionKey(q);if(!seen.has(key)&&!content.has(questionContentId(q))){demo=q;seen.add(key);content.add(questionContentId(q));break;}}
 if(!demo)return {demo:null,queue:[]};
 for(let i=0;i<1200&&pool.length<Math.max(size*3,24);i++){const q=makeQuestion(skill,seed+i*101),key=questionKey(q),id=questionContentId(q);if(!seen.has(key)&&!content.has(id)){seen.add(key);content.add(id);pool.push(q);}}
 if(!pool.length)return {demo:null,queue:[{...demo,repeated:false,phase:'practice'}],teachingOnly:true};
 const independent=['Independent','Retained'].includes(progress(p,skill.id).state),reserve=skill.kind!=='fluency'&&size>=7&&pool.length>=(independent?4:6)?pool.slice(0,4):[],held=new Set(reserve.map(questionKey));
 const practice=pool.filter(q=>!held.has(questionKey(q))).slice(0,Math.max(0,size-reserve.length)).map(q=>({...q,repeated:false,phase:'practice' as const}));
 return {demo,queue:[...practice,...reserve.map(q=>({...q,repeated:false,phase:'check' as const}))]};
}
export function planQuestions(skill:Skill,seed:number,p:Profile){return planSession(skill,seed,p).queue;}
export function resumeLessonSession(saved:any,p:Profile,skill:Skill){
 if(!saved.queue||saved.stage==='watch'){const fresh=planSession(skill,Date.now()%1000000000,p);return {...saved,...fresh,index:0,results:[],stage:fresh.queue.length?'watch':'complete',intro:false};}
 const index=saved.index+(saved.results?.[saved.index]?1:0),known=knownQuestions(p),alreadyAnswered=(q:Question)=>p.attempts.some(a=>a.questionKey===questionKey(q)||a.contentId===questionContentId(q));
 const remaining=saved.queue.slice(index).filter((q:Question,j:number)=>!alreadyAnswered(q)&&(j===0||!known.keys.has(questionKey(q))&&!known.content.has(questionContentId(q))));
 return {...saved,index,queue:[...saved.queue.slice(0,index),...remaining],stage:remaining.length?'practice':'complete',intro:false};
}
export function coach(q:Question,chosen:string,skill:Skill){
 const v=q.visual,a=Number(chosen),right=Number(q.answer);let message='Let’s look at the clue again.';
 if(skill.subject==='math'){
  if(v?.type==='clock')message='Check the hands separately: the short hand shows the hour. The long hand shows the minutes.';
  else if(v?.type==='fraction')message='Count all the equal parts first. Then count only the parts chosen. Compare parts of the same-sized whole.';
  else if(/perimeter/i.test(skill.title))message='Trace the outside edge. Perimeter counts all four sides; the squares inside belong to area.';
  else if(/area/i.test(skill.title))message='Cover the inside with equal unit squares. Count every row, not just the outside edges.';
  else if(/place|tens|hundred|trade|exchange/i.test(skill.title))message='Keep the places separate. One ten has the same value as ten ones; a hundred has ten tens.';
  else if(/coin|money/i.test(skill.title))message='Count each coin’s value, rather than the number of coins. A nickel has a different value from a penny.';
  else if(v?.type==='array'&&right===v.rows*v.cols&&(a===v.rows||a===v.cols))message='That counts one dimension of the array. Count every object across all of the equal rows to find the whole total.';
  else if(/equal group|array|multiply|multiplication|division|share/i.test(skill.title))message='Check that the groups are equal. Keep track of the number of groups and the number in each group.';
  else if(q.prompt.match(/(\d+)\s*\+\s*(\d+)/)&&(()=>{const n=q.prompt.match(/(\d+)\s*\+\s*(\d+)/)!;return a===Math.abs(Number(n[1])-Number(n[2]));})())message='The plus sign asks you to join the parts. Taking their difference answers a different question.';
  else if(q.prompt.match(/(\d+)\s*−\s*(\d+)/)&&(()=>{const n=q.prompt.match(/(\d+)\s*−\s*(\d+)/)!;return a===Number(n[1])+Number(n[2]);})())message='The minus sign asks you to take away from the whole. Joining the amounts answers a different question.';
  else if(Number.isFinite(a)&&Number.isFinite(right)&&Math.abs(a-right)===1)message='You are one step away. Point to each object once, or check the last counting step.';
  else if(/subtract|take away|fewer/i.test(skill.title))message='Start with the whole. Taking away leaves fewer; addition joins parts.';
  else if(/add|sum|more|make a ten/i.test(skill.title))message='Find both parts. Join them once, then count on from the larger part.';
 }else{
  if(q.tiles)message=q.tileJoin?'Listen to the whole sentence. Start with the capital word and finish at its ending mark.':'Listen again. Compare the sounds in order with the spelling tiles.';
  else if(q.passage&&q.passage.split(' ').length>8)message='Point to words in the text that support your choice. A possible idea still needs a clue in this passage.';
  else if(/silent|final e/i.test(skill.title))message='Look at the ending. A final silent e can change the earlier vowel sound, as in cap and cape.';
  else if(/syllable/i.test(skill.title))message='Say the whole word. Listen for its vowel beats rather than counting letters.';
  else if(/past|tense|verb/i.test(skill.title))message='Look for a time clue such as yesterday or today, then match the action word to that time.';
  else if(/punctuation|ending|capital/i.test(skill.title))message='Check the first letter and the ending. A question asks something; a statement tells something.';
 }
 return `${message} ${q.explanation}`;
}
export type DailyTask={id:string;type:'lesson'|'book'|'mission'|'writing';subject:Subject;title:string;minutes:number;skill?:Skill;reason:string;done:boolean};
export function dailyPlan(p:ExtendedProfile,now=Date.now()):DailyTask[]{
 const today=dayKey(now),done=(id:string)=>new Set(p.attempts.filter(a=>a.skillId===id&&dayKey(a.at)===today).map(a=>a.contentId||a.questionId)).size>=(ACTIVITY_BUDGETS[id]||10)||p.evidence?.some(e=>e.itemId===id&&dayKey(e.at)===today&&e.correct)||false;
 const choose=(subject:Subject)=>{const grade=gradeOf(p,subject),pool=CURRICULUM.filter(s=>s.grade===grade&&s.subject===subject&&!p.exhaustedSkills?.includes(s.id)),due=pool.filter(s=>progress(p,s.id,now).due).sort((a,b)=>progress(p,a.id).last-progress(p,b.id).last)[0],placed=p.placements?.[subject];
  const starting=placed?.grade===grade&&pool.find(s=>s.id===placed.startSkillId&&!['Independent','Retained','Practiced'].includes(progress(p,s.id).state));return {skill:due||starting||recommendation(p,subject),reason:due?'Revisit an earlier idea after a break.':starting?'Picked from your starting-point check.':'Build your next idea with Theo.'};};
 const m=choose('math'),r=choose('reading');
 return [{id:m.skill.id,type:'lesson',subject:'math',title:m.skill.title,minutes:4,skill:m.skill,reason:m.reason,done:done(m.skill.id)},{id:r.skill.id,type:'lesson',subject:'reading',title:r.skill.title,minutes:4,skill:r.skill,reason:r.reason,done:done(r.skill.id)},{id:`daily-book-${p.readingGrade}`,type:'book',subject:'reading',title:'A little book together',minutes:3,reason:'Practice reading connected text.',done:(p.evidence||[]).some(e=>e.kind==='book'&&e.grade===p.readingGrade&&dayKey(e.at)===today&&e.correct)},{id:`daily-mission-${p.mathGrade}`,type:'mission',subject:'math',title:'Build it in Theo’s workshop',minutes:3,reason:'Show the idea with your hands.',done:(p.evidence||[]).some(e=>e.kind==='mission'&&e.grade===p.mathGrade&&dayKey(e.at)===today&&e.correct)}];
}
export function learningReport(p:ExtendedProfile){
 const activities=CURRICULUM.filter(s=>p.attempts.some(a=>a.skillId===s.id)),independent=activities.filter(s=>progress(p,s.id).state==='Independent'),retained=activities.filter(s=>progress(p,s.id).state==='Retained');
 const support=activities.filter(s=>{const a=p.attempts.filter(a=>a.skillId===s.id).slice(-8);return a.length>=2&&a.filter(x=>!x.correct||x.assisted).length/a.length>=.5;}).slice(0,5);
 return {independent,retained,support,evidence:p.evidence||[],plans:dailyPlan(p)};
}
export function compareReading(expected:string,heard:string,confidence:number){
 const tokenize=(s:string)=>s.toLowerCase().replace(/[^a-z'\s]/g,' ').trim().split(/\s+/).filter(Boolean),a=tokenize(expected),b=tokenize(heard);
 if(!heard.trim()||confidence<.65)return {uncertain:true,words:a.map(word=>({word,matched:false})),message:'The microphone was not sure. Try a shorter sentence, or read with a grown-up.'};
 const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
 const matched=new Set<number>();let i=a.length,j=b.length;while(i&&j){if(a[i-1]===b[j-1]){matched.add(--i);j--;}else if(dp[i-1][j]>=dp[i][j-1])i--;else j--;}
 return {uncertain:false,words:a.map((word,i)=>({word,matched:matched.has(i)})),message:matched.size===a.length?'The browser heard the words in order. Read it once more smoothly.':'The browser may have missed some words. Listen to the sentence, then try the highlighted words again.'};
}
export function checkWriting(target:string,input:string){
 const words=(s:string)=>s.toLowerCase().match(/[a-z']+/g)||[],a=words(target),b=words(input),spelling=a.length===b.length&&a.every((w,i)=>w===b[i]),capital=/^[A-Z]/.test(input.trim()),end=input.trim().at(-1)===target.at(-1),sentence=/[.!?]$/.test(target),correct=spelling&&(!sentence||capital&&end);
 const hints:string[]=[];if(!spelling){const index=a.findIndex((w,i)=>w!==b[i]);hints.push(`Check word ${index<0?a.length+1:index+1}. Listen again and check its spelling and order.`);}if(sentence&&!capital)hints.push('Start the sentence with a capital letter.');if(sentence&&!end)hints.push(target.endsWith('?')?'End the question with a question mark.':'End this statement with a period.');
 return {correct,spelling,capital,end,message:correct?'Your spelling and sentence marks match. Read your work aloud.':hints.join(' ')};
}
