import {test} from 'node:test';import assert from 'node:assert/strict';
import {CURRICULUM,makeQuestion,questionContentId} from '../src/curriculum';
import {planSession,placementItems,resumeLessonSession,type ExtendedProfile} from '../src/learningTools';
import {questionKey,markSeen} from '../src/questionIdentity';
import {mergeFamilies} from '../src/familyBackup';
import {freshMission,missionKey,MISSION_KINDS} from '../src/missions';
import {bookChecks,dictationItems,readAloudItems,WRITING_PROMPTS,toolKey,unseenIndex} from '../src/toolQuestions';
import {BOOK_LIBRARY} from '../src/bookLibrary';
import {migrateQuestionHistory} from '../src/historyMigration';
const learner=():ExtendedProfile=>({id:'dedupe-qa',name:'Test',mathGrade:1,readingGrade:1,attempts:[]});
test('Legacy history is reconstructed only when saved content matches the current generator',()=>{
 const s=CURRICULUM.find(s=>s.id==='m1-6')!,q=makeQuestion(s,18),base={id:'legacy',skillId:s.id,questionId:q.id,contentId:questionContentId(q),correct:true,assisted:false,at:1};
 const result=migrateQuestionHistory({...learner(),attempts:[base,{...base,id:'unknown',contentId:'old-version'}]});
 assert.equal(result.attempts[0].questionKey,questionKey(q));assert.equal(result.attempts[1].questionKey,undefined);assert.deepEqual(result.seenQuestions,[questionKey(q)]);
 assert.deepEqual(migrateQuestionHistory({...learner(),attempts:[{...base,questionKey:'q-existing'}]}).seenQuestions,['q-existing']);
});
test('Arithmetic identity ignores reordered choices, cosmetic changes and commutative fact order',()=>{
 const s=CURRICULUM.find(s=>s.id==='m1-6')!,q={...makeQuestion(s,10),prompt:'What is 6 + 4?',answer:'10'};assert.equal(questionKey(q),questionKey({...q,id:'new',prompt:'What is 4 + 6?',choices:[...q.choices].reverse(),hint:'Changed'}));assert.notEqual(questionKey(q),questionKey({...q,prompt:'What is 6 − 4?',answer:'2'}));
});
test('Learner-wide delivery remains unique across overlapping lessons, grades, placement and exhaustion',()=>{
 let p=learner();const delivered=new Set<string>();const skills=['m1-1','m1-2','m1-6','m1-8','m2-6','m2-7','r1-1','r1-6','r2-1','r2-2'].map(id=>CURRICULUM.find(s=>s.id===id)!);
 for(let round=0;round<8;round++)for(const s of skills){const plan=planSession(s,11+round*219,p),questions=[...(plan.demo?[plan.demo]:[]),...plan.queue];for(const q of questions){const key=questionKey(q);assert.ok(!delivered.has(key),`${s.id}: ${q.prompt}`);delivered.add(key);p=markSeen(p,[key]);}assert.equal(new Set(questions.map(questionKey)).size,questions.length);}
 for(const q of placementItems(p,'math',1)){assert.ok(!delivered.has(questionKey(q.question)));p=markSeen(p,[questionKey(q.question)]);}
 const only=CURRICULUM.find(s=>s.p.mode==='book0')!;const first=planSession(only,15,p);assert.equal(first.queue.length,1);assert.equal(first.demo,null);p=markSeen(p,first.queue.map(questionKey));assert.equal(planSession(only,31,p).queue.length,0);
});
test('Answer-and-reload resumes at a new question, while unfinished work can continue',()=>{
 let p=learner(),s=CURRICULUM.find(s=>s.id==='m1-6')!,plan=planSession(s,18,p);const saved={...plan,index:0,results:[{correct:true}],stage:'practice',seed:18};p={...p,attempts:[{id:'a',skillId:s.id,questionId:plan.queue[0].id,questionKey:questionKey(plan.queue[0]),contentId:questionContentId(plan.queue[0]),correct:true,assisted:true,at:1,phase:'practice'}]};const resumed=resumeLessonSession(saved,p,s);assert.equal(resumed.index,1);assert.notEqual(questionKey(resumed.queue[resumed.index]),questionKey(plan.queue[0]));const unfinished=resumeLessonSession({...saved,results:[]},learner(),s);assert.equal(unfinished.index,0);
});
test('Mission delivery cannot cycle back to a familiar build, including across grades',()=>{
 let seen:string[]=[];for(const grade of [1,2,3])for(const kind of MISSION_KINDS[grade])for(let i=0;i<25;i++){const pick=freshMission(grade,kind,i,seen);if(pick.exhausted)break;const key=missionKey(pick.mission);assert.ok(!seen.includes(key));seen.push(key);}
});
test('Book checks, dictation, original writing and read-aloud tasks have stable unique identities',()=>{
 for(const grade of [1,2,3]){const keys=[...BOOK_LIBRARY.filter(b=>b.grade===grade).flatMap(b=>bookChecks(b).map(q=>q.key)),...dictationItems(grade).map(a=>a.key),...readAloudItems(grade).map(a=>a.key),...WRITING_PROMPTS[grade].map(a=>toolKey('writing-prompt',a))];assert.equal(new Set(keys).size,keys.length);const p=markSeen(learner(),keys);assert.equal(unseenIndex(keys,p),-1);}
 for(const book of BOOK_LIBRARY)for(const q of bookChecks(book)){assert.ok(q.answer);assert.ok(q.wrong.every(w=>w&&w!==q.answer));assert.equal(new Set([q.answer,...q.wrong]).size,3);}
});
test('Cloud and file merges preserve the union of question histories and exhausted activities',()=>{
 const p=learner(),m=mergeFamilies([{...p,seenQuestions:['q-one'],exhaustedSkills:['m1-1']}],[{...p,seenQuestions:['q-two'],exhaustedSkills:['m2-1']}]);assert.deepEqual(m[0].seenQuestions,['q-one','q-two']);assert.deepEqual(m[0].exhaustedSkills,['m1-1','m2-1']);
});
