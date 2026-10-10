import assert from 'node:assert/strict';
import {createFamilyCode,decryptFamily,encryptFamily,parseFamilyCode} from '../src/familyBackup';
const base=process.env.TEST_SERVICE_URL||'http://127.0.0.1:8789';
if(!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)&&base!=='https://wonderlane-tutor.koikes2021.workers.dev')throw Error('Use only the named Wonderlane service or a local test service.');
const codes=[createFamilyCode(),createFamilyCode()],profiles=[{id:`qa-only-${crypto.randomUUID()}`,name:'Disposable QA',mathGrade:1,readingGrade:1,attempts:[]}];
async function call(code:string|undefined,method='GET',data?:unknown,origin?:string){const token=code&&parseFamilyCode(code).token,r=await fetch(base+'/api/family-backup',{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...(data?{'Content-Type':'application/json'}:{}),...(origin?{Origin:origin}:{})},...(data?{body:JSON.stringify(data)}:{})});return {status:r.status,data:await r.json(),allowedOrigin:r.headers.get('Access-Control-Allow-Origin')};}
try{
 const status=await fetch(base+'/api/status').then(r=>r.json());assert.equal(status.browserVoice,true);assert.equal(status.voice,false);assert.equal(status.familyBackup,true);
 assert.equal((await call(undefined)).status,401);assert.equal((await call(codes[0])).data.revision,0);
 const primary='https://kid-genius-world.com',preflight=await fetch(base+'/api/family-backup',{method:'OPTIONS',headers:{Origin:primary,'Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'authorization,content-type'}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),primary);
 const encrypted=await encryptFamily(profiles,codes[0]);assert.equal((await call(codes[0],'PUT',{...encrypted,revision:0},primary)).status,200);
 const read=await call(codes[0],'GET',undefined,primary);assert.equal(read.status,200);assert.equal(read.allowedOrigin,primary);assert.equal(read.data.revision,1);assert.deepEqual(await decryptFamily(read.data,codes[0]),profiles);
 assert.equal((await call(codes[1])).data.revision,0);assert.equal((await call(codes[0],'PUT',{...encrypted,revision:0})).status,409);
 assert.equal((await call(codes[0],'PUT',{...encrypted,revision:1},'https://untrusted.example')).status,403);
 assert.equal((await call(codes[0],'PUT',{...encrypted,iv:'invalid',revision:1})).status,400);
 assert.equal((await call(codes[0],'PUT',{...encrypted,revision:1})).status,200);assert.equal((await call(codes[0])).data.revision,2);
 assert.equal((await call(codes[0],'DELETE')).status,200);assert.equal((await call(codes[0])).data.revision,0);
 console.log(JSON.stringify({service:base,checks:['browser-only voice','encrypted round trip','family isolation','revision conflict','cross-origin rejection','format validation','delete and empty restore'],passed:true,usedDisposableQaDataOnly:true}));
}finally{for(const code of codes)await call(code,'DELETE');}
