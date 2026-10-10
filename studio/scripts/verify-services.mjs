import assert from 'node:assert/strict';
const base=process.env.TEST_SERVICE_URL||'http://127.0.0.1:8790';
if(!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base))throw Error('This check creates disposable LOCAL test accounts only.');
const nonce=crypto.randomUUID();
async function call(path,method='GET',data,cookie,origin){const r=await fetch(base+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},...(data?{body:JSON.stringify(data)}:{})});return{status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const users=[];
try{
 for(let i=0;i<2;i++){const email=`qa-${nonce}-${i}@example.test`,password='Disposable-test-password-42';const a=await call('/api/register','POST',{email,password});assert.equal(a.status,200);assert.ok(a.cookie);users.push({email,password,...a});}
 const profiles=[{id:'test-learner',name:'Test learner',mathGrade:1,readingGrade:1,attempts:[]}];
 assert.equal((await call('/api/progress','PUT',{profiles},users[0].cookie)).status,200);
 assert.deepEqual((await call('/api/progress','GET',undefined,users[0].cookie)).data.profiles,profiles);
 assert.deepEqual((await call('/api/progress','GET',undefined,users[1].cookie)).data.profiles,[]);
 assert.equal((await call('/api/progress','GET')).status,401);
 assert.equal((await call('/api/login','POST',{email:users[0].email,password:'Incorrect-test-password'})).status,401);
 assert.equal((await call('/api/progress','PUT',{profiles},users[0].cookie,'https://untrusted.example')).status,403);
 assert.equal((await call('/api/progress','PUT',{profiles:[{id:'bad'}]},users[0].cookie)).status,400);
 assert.equal((await call('/api/voice','POST',{text:'A simple lesson.'})).data.available,false);
 assert.equal((await call('/api/checkout','POST',{},users[0].cookie)).status,503);
 console.log('PASS: authentication, family isolation, progress round trip, validation, origin protection, voice fallback and disabled billing.');
}finally{for(const u of users)await call('/api/delete-account','DELETE',undefined,u.cookie);}
