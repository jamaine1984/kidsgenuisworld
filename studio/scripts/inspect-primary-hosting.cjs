const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const lib='C:/Users/koike/AppData/Roaming/npm/node_modules/firebase-tools/lib';
const {requireAuth}=require(lib+'/requireAuth');
const {getGlobalDefaultAccount}=require(lib+'/auth');
const api=require(lib+'/hosting/api');
const {Client}=require(lib+'/apiv2');
async function main(){
 const account=getGlobalDefaultAccount();await requireAuth({project:'kid-genius-world',...account});
 const client=new Client({urlPrefix:'https://firebasehosting.googleapis.com',apiVersion:'v1beta1',auth:true});
 const channel=await api.getChannel('kid-genius-world','kid-genius-world','live'),name=channel.release.version.name;
 const version=(await client.get('/'+name)).body;let pageToken,files=[];
 do{const result=(await client.get('/'+name+'/files',{queryParams:{pageSize:1000,...(pageToken?{pageToken}:{})}})).body;files.push(...(result.files||[]));pageToken=result.nextPageToken;}while(pageToken);
 const output=path.resolve('output/primary-hosting');fs.mkdirSync(output,{recursive:true});
 const report={checkedAt:new Date().toISOString(),project:'kid-genius-world',channel,version,files};
 fs.writeFileSync(path.join(output,'current-release.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({version:name,releaseTime:channel.release.releaseTime,fileCount:files.length,status:version.status,config:version.config,sampleFiles:files.slice(0,4)},null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
