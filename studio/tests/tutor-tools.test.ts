import {test} from 'node:test';import assert from 'node:assert/strict';
import {CURRICULUM,makeQuestion,questionContentId} from '../src/curriculum';
import {addEvidence,checkWriting,compareReading,dailyPlan,placementItems,placementResult,planQuestions,type ExtendedProfile} from '../src/learningTools';
import {BOOK_LIBRARY,bookWords,bookReady} from '../src/bookLibrary';
import {relatedStandards,coverageRows} from '../src/standardsMap';
import {initialMission,makeMission,MISSION_KINDS,missionCorrect,quarterLabel} from '../src/missions';
import {createFamilyCode,decryptFamily,encryptFamily,mergeFamilies,parseFamilyCode,validProfiles} from '../src/familyBackup';
import service from '../cloudflare/app-worker.js';
test('Primary-site CORS permits the owned domain and rejects unrelated origins',async()=>{
 const ctx={waitUntil(){}};const origin='https://kid-genius-world.com';
 const preflight=await service.fetch(new Request('https://service.test/api/family-backup',{method:'OPTIONS',headers:{Origin:origin}}),{},ctx);
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);assert.match(preflight.headers.get('Access-Control-Allow-Headers')! ,/Authorization/);
 const status=await service.fetch(new Request('https://service.test/api/status',{headers:{Origin:origin}}),{},ctx);assert.equal(status.headers.get('Access-Control-Allow-Origin'),origin);
 const blocked=await service.fetch(new Request('https://service.test/api/family-backup',{method:'PUT',headers:{Origin:'https://untrusted.example'}}),{},ctx);assert.equal(blocked.status,403);assert.equal(blocked.headers.get('Access-Control-Allow-Origin'),null);
});
const learner=(grade=1):ExtendedProfile=>({id:'fixture-learner',name:'Explorer',mathGrade:grade,readingGrade:grade,attempts:[]});
test('Starting-point checks respect each subject grade and do not confer mastery',()=>{
 const p={...learner(1),readingGrade:3};for(const subject of ['math','reading'] as const){const items=placementItems(p,subject,10);assert.equal(items.length,subject==='math'?10:12);assert.ok(items.every(x=>x.skill.grade===(subject==='math'?1:3)&&x.skill.subject===subject));const answers=items.map((x,i)=>({skillId:x.skill.id,correct:i!==2,assisted:false})),r=placementResult(p,subject,answers);assert.equal(r.startSkillId,items[2].skill.id);assert.equal(p.attempts.length,0);}
});
test('Fresh checks are held back from teaching and familiar content never returns as a check',()=>{
 for(const s of CURRICULUM){const p=learner(s.grade),qs=planQuestions(s,42,p),demo=questionContentId(makeQuestion(s,955)),checks=qs.filter(q=>q.phase==='check'),practice=new Set(qs.filter(q=>q.phase==='practice').map(questionContentId));assert.ok(qs.length>=1&&qs.length<=10);assert.equal(new Set(checks.map(questionContentId)).size,checks.length,s.id);assert.ok(checks.every(q=>questionContentId(q)!==demo&&!practice.has(questionContentId(q))&&!q.repeated),s.id);
 if(checks.length){p.attempts=checks.map((q,i)=>({id:`a${i}`,skillId:s.id,questionId:q.id,contentId:questionContentId(q),phase:'check',correct:true,assisted:false,at:1}));const second=planQuestions(s,42,p);assert.ok(second.filter(q=>q.phase==='check').every(q=>!p.attempts.some(a=>a.contentId===questionContentId(q))),s.id);}}
});
test('Books have explicit pre-reading vocabulary and separate grade shelves',()=>{
 assert.equal(BOOK_LIBRARY.length,24);for(const g of [1,2,3])assert.equal(BOOK_LIBRARY.filter(b=>b.grade===g).length,8);for(const b of BOOK_LIBRARY){assert.equal(b.pages.length,3);assert.ok(b.pattern&&b.focus.length&&b.bridge.length);assert.ok(!b.wrong.includes(b.answer));const all=new Set([...b.focus,...b.bridge,...bookWords(b)]);for(const w of b.pages.join(' ').toLowerCase().match(/[a-z']+/g)!)assert.ok(all.has(w),`${b.id}: ${w}`);assert.ok(b.question&&b.answer);}
 const p=learner(),a=BOOK_LIBRARY[0],b=BOOK_LIBRARY[1];assert.ok(bookReady(a,p));assert.ok(!bookReady(b,p));p.bookProgress={[a.id]:{page:2,finished:true}};assert.ok(bookReady(b,p));
});
test('Manipulative missions stay in grade ranges and conserve quantities',()=>{
 for(const g of [1,2,3])for(const kind of MISSION_KINDS[g])for(let round=0;round<120;round++){const m=makeMission(g,kind,round),state=initialMission(m);assert.ok(m.story&&m.directions&&m.explanation);assert.equal(missionCorrect(m,state),false,`${g}:${kind}:${round}`);
 if(kind==='trade'){while(state.ones>=10){state.ones-=10;state.tens++;}while(state.tens>=10){state.tens-=10;state.hundreds++;}assert.ok(missionCorrect(m,state));if(g===1)assert.ok(m.target<=20);}
 if(kind==='clock'){state.hour=Math.floor(m.target/60)||12;state.minute=m.target%60;assert.ok(missionCorrect(m,state));assert.equal(state.minute%(g===1?30:5),0);}
 if(kind==='tiles'){if(g===1)assert.ok(m.target<=20);state.selected=Array.from({length:m.target},(_,i)=>i);state.value=m.target;assert.ok(missionCorrect(m,state));state.selected.pop();assert.ok(!missionCorrect(m,state));}
 if(kind==='ruler'){state.value=m.target;assert.ok(missionCorrect(m,state));assert.equal(g===3?m.target*4:m.target,m.b);}
 if(kind==='coins'||kind==='mass'){state.coins=kind==='coins'?Array(m.target).fill(1):Array(m.target/100).fill(100);assert.ok(missionCorrect(m,state));}
 if(kind==='share'){state.selected=Array.from({length:m.target},(_,i)=>i);assert.ok(missionCorrect(m,state));state.selected.push(m.a);assert.ok(!missionCorrect(m,state));}}
 assert.equal(quarterLabel(1.25),'1 1/4');assert.equal(quarterLabel(.5),'1/2');assert.ok(!MISSION_KINDS[1].includes('coins'));assert.ok(!MISSION_KINDS[2].includes('mass'));
});
test('Dictation corrects spelling and sentence marks',()=>{
 assert.ok(checkWriting('Sam has a cap.','Sam has a cap.').correct);assert.ok(!checkWriting('Sam has a cap.','sam has a cap').correct);assert.match(checkWriting('Sam has a cap.','Sam has a cup.').message,/word 4/);assert.ok(checkWriting('Can the pig dig?','Can the pig dig?').correct);assert.ok(!checkWriting('Can the pig dig?','Can the pig dig.').correct);
});
test('Speech feedback preserves word order and recognizes uncertainty',()=>{
 assert.ok(compareReading('The pig can dig.','The pig can dig',.9).words.every(w=>w.matched));assert.ok(compareReading('The pig can dig.','pig the dig can',.9).words.some(w=>!w.matched));assert.ok(compareReading('The pig can dig.','The pig can dig',.1).uncertain);assert.equal(compareReading('the the cat','the cat',.9).words.filter(w=>w.matched).length,2);
});
test('Daily plans have separate levels and tool events are idempotent',()=>{
 let p:ExtendedProfile={...learner(),readingGrade:2};const plan=dailyPlan(p);assert.equal(plan[0].skill!.grade,1);assert.equal(plan[1].skill!.grade,2);assert.equal(plan.reduce((n,t)=>n+t.minutes,0),14);assert.ok(plan.every(t=>!t.done));const e:any={id:'mission-test',kind:'mission',itemId:'mission-1-clock',grade:1,subject:'math',correct:true,assisted:true,at:Date.now()};p=addEvidence(p,e);p=addEvidence(p,e);assert.equal(p.evidence!.length,1);assert.ok(dailyPlan(p)[3].done);
});
test('All lessons have a standards link and grade maps include writing',()=>{
 for(const s of CURRICULUM)assert.ok(relatedStandards(s).length,s.id);for(const g of [1,2,3])assert.ok(coverageRows(g).some(r=>r.code===`W.${g}`));
});
test('Encrypted backups reject tampering and merge without losing attempts',async()=>{
 const p=learner(),code=createFamilyCode(),encrypted=await encryptFamily([p],code);assert.ok(!encrypted.ciphertext.includes('Explorer'));assert.deepEqual(await decryptFamily(encrypted,code),[p]);await assert.rejects(decryptFamily(encrypted,createFamilyCode()));await assert.rejects(decryptFamily({...encrypted,iv:encrypted.iv.replace(/^./,encrypted.iv[0]==='a'?'b':'a')},code));assert.throws(()=>parseFamilyCode('bad'));assert.ok(!validProfiles([{...p,mathGrade:4}]));assert.ok(!validProfiles([p,p]));
 const a:any={id:'a',skillId:'m1-1',questionId:'q1',correct:true,assisted:false,at:1,phase:'check'},b:any={...a,id:'b',questionId:'q2',at:2};const local={...p,attempts:[a],bookProgress:{one:{page:1}}},remote={...p,attempts:[a,b],readingGrade:2,bookProgress:{one:{page:2,finished:true}}};const merged=mergeFamilies([local],[remote],true);assert.equal(merged[0].attempts.length,2);assert.equal(merged[0].readingGrade,2);assert.ok(merged[0].bookProgress!.one.finished);assert.ok(validProfiles(merged));
 const four=Array.from({length:4},(_,i)=>({...learner(),id:`other-${i}`,name:`Child ${i}`}));assert.equal(mergeFamilies([learner()],four,true).length,4);assert.throws(()=>mergeFamilies([{...learner(),name:'My learner'}],four));
 const draft:any={id:'draft',kind:'writing',itemId:'story',grade:1,subject:'reading',correct:false,assisted:true,at:1,detail:'My draft.'};assert.equal(mergeFamilies([{...p,writingClearedAt:2}],[{...p,evidence:[draft]}])[0].evidence?.length,0);
});
