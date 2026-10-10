// Kid Genius World only. Clone the exact live frontend, overlay reviewed studio files,
// preserve every unrelated path and the current billing rewrites, then preview first.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const zlib=require('node:zlib');
const lib='C:/Users/koike/AppData/Roaming/npm/node_modules/firebase-tools/lib';
const {requireAuth}=require(lib+'/requireAuth');const {getGlobalDefaultAccount}=require(lib+'/auth');const api=require(lib+'/hosting/api');const {Client}=require(lib+'/apiv2');
const {Uploader}=require(lib+'/deploy/hosting/uploader');
const site='kid-genius-world',preview='studio-preview-20261009',backup='kgw-before-studio-20261009',out=path.resolve('output/primary-hosting');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const gzip=b=>zlib.gzipSync(b,{level:9});
function walk(root,dir=root){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(root,path.join(dir,e.name)):[path.relative(root,path.join(dir,e.name)).replaceAll('\\','/')]);}
async function files(client,name){let token,result=[];do{const r=(await client.get('/'+name+'/files',{queryParams:{pageSize:1000,...(token?{pageToken:token}:{})}})).body;result.push(...(r.files||[]));token=r.nextPageToken;}while(token);return result;}
async function channel(id){const existing=await api.getChannel(site,site,id);return existing||api.createChannel(site,site,id,30*86400000);}
async function main(){
 await requireAuth({project:site,...getGlobalDefaultAccount()});const client=new Client({urlPrefix:'https://firebasehosting.googleapis.com',apiVersion:'v1beta1',auth:true});
 const saved=JSON.parse(fs.readFileSync(path.join(out,'current-release.json'))),live=await api.getChannel(site,site,'live');
 if(process.argv[2]==='publish'){
  const staged=JSON.parse(fs.readFileSync(path.join(out,'staged-release.json')));
  if(live.release.version.name!==staged.sourceVersion)throw Error('Live changed since staging. Inspect and stage again.');
  const current=(await client.get('/'+staged.version)).body;if(current.status!=='FINALIZED')throw Error('The staged version is not finalized.');
  if(hash(stable(current.config))!==staged.configurationFingerprint)throw Error('Staged hosting configuration changed.');
  const release=await api.createRelease(site,'live',staged.version,{message:'Kid Genius World grades 1–3 studio; previous library and accounts preserved at /legacy/'});
  fs.writeFileSync(path.join(out,'published-release.json'),JSON.stringify({publishedAt:new Date().toISOString(),release,rollback:staged.backup,sourceVersion:staged.sourceVersion,version:staged.version},null,2));console.log(JSON.stringify({published:true,version:staged.version,url:'https://kid-genius-world.com',rollbackChannel:backup}));return;
 }
 if(live.release.version.name!==saved.version.name)throw Error('The live release changed since inspection.');
 const rollback=await channel(backup);if(!rollback.release)await api.createRelease(site,backup,saved.version.name);await api.updateChannelTtl(site,site,backup,30*86400000);
 const verifiedRollback=await api.getChannel(site,site,backup);if(verifiedRollback.release.version.name!==saved.version.name)throw Error('Rollback does not point to the inspected release.');
 fs.writeFileSync(path.join(out,'rollback-release.json'),JSON.stringify(verifiedRollback,null,2));
 const localLegacy=path.resolve('C:/Users/koike/OneDrive/Desktop/kidsgeniusworld/dist'),oldIndex=fs.readFileSync(path.join(localLegacy,'index.html'));
 if(hash(gzip(oldIndex))!==saved.files.find(f=>f.path==='/index.html').hash)throw Error('Local previous index differs from the actual live index.');
 const overlay=path.join(out,'overlay');fs.mkdirSync(overlay,{recursive:true});fs.cpSync(path.resolve('dist/client'),overlay,{recursive:true});
 fs.mkdirSync(path.join(overlay,'legacy'),{recursive:true});fs.writeFileSync(path.join(overlay,'legacy/index.html'),oldIndex.toString().replace('<head>','<head><meta name="robots" content="noindex,follow" />'));
 fs.writeFileSync(path.join(overlay,'llms.txt'),'# Kid Genius World\n\nCanonical URL: https://kid-genius-world.com/\nLast updated: 2026-10-09\n\nKid Genius World is a voice-guided math and reading studio for grades 1–3, with Theo. It includes 1,320 curriculum activities, original little books, hands-on missions, writing practice, starting-point checks, and parent progress tools. Browser voice is used for directions. The new studio is currently free and saves progress separately from earlier accounts. Optional encrypted family backups expire 30 days after the last save.\n\nEarlier subject library, accounts, and subscription management: https://kid-genius-world.com/legacy/\nArticles: https://kid-genius-world.com/blog/\nSitemap: https://kid-genius-world.com/sitemap.xml\n\nThis practice app is not an accredited school and does not issue credits, diplomas, or official grades. Learning outcomes and equivalence to one-to-one tutoring have not been established.\n');
 const map={},buffers=new Map(),old=new Map(saved.files.map(f=>[f.path,f.hash]));
 const allowedChanges=new Set(['/index.html','/manifest.webmanifest','/sw.js','/llms.txt']);
 for(const file of walk(overlay)){const compressed=gzip(fs.readFileSync(path.join(overlay,file))),digest=hash(compressed),url='/'+file;
  if(old.has(url)&&old.get(url)!==digest&&!allowedChanges.has(url))throw Error('Overlay would overwrite a protected existing file: '+url);
  map[url]=digest;buffers.set(digest,compressed);
 }
 console.log(JSON.stringify({stage:'rollback-verified',source:saved.version.name,rollbackUrl:verifiedRollback.url,newFiles:Object.keys(map).length}));
 let version,finalizedDraft=false;const draftPath=path.join(out,'draft-version.json');if(fs.existsSync(draftPath)){const draft=JSON.parse(fs.readFileSync(draftPath));if(draft.source===saved.version.name){const state=(await client.get('/'+draft.version)).body.status;if(['CREATED','FINALIZED'].includes(state)){version=draft.version;finalizedDraft=state==='FINALIZED';}}}
 if(!version)version=(await api.cloneVersion(site,saved.version.name,false)).name;if(!version)throw Error('Version cloning did not return a version.');fs.writeFileSync(draftPath,JSON.stringify({version,source:saved.version.name,createdAt:new Date().toISOString()},null,2));
 // Use Firebase CLI's own streaming uploader. The old files stay in the cloned version.
 if(!finalizedDraft){await new Uploader({version,projectRoot:path.resolve('.'),public:overlay,files:walk(overlay),uploadConcurrency:6,hashConcurrency:6}).start();const versionId=version.split('/').at(-1);await api.updateVersion(site,versionId,{status:'FINALIZED'});}
 const final=(await client.get('/'+version)).body,finalFiles=await files(client,version),byPath=new Map(finalFiles.map(f=>[f.path,f.hash]));
 for(const f of saved.files)if(!map[f.path]&&byPath.get(f.path)!==f.hash)throw Error('Existing published file changed: '+f.path);
 for(const [file,digest] of Object.entries(map))if(byPath.get(file)!==digest)throw Error('New file was not included: '+file);
 if(hash(stable(final.config))!==hash(stable(saved.version.config)))throw Error('Existing hosting configuration was not preserved.');
 const previewChannel=await channel(preview);await api.createRelease(site,preview,version,{message:'Preview Kid Genius World studio with preserved prior library'});
 const report={stagedAt:new Date().toISOString(),sourceVersion:saved.version.name,version,previewUrl:previewChannel.url,backup:verifiedRollback,configurationFingerprint:hash(stable(final.config)),originalFileCount:saved.files.length,totalFileCount:finalFiles.length,overlay:map,preservedPublishedPaths:true,billingRewritesPreserved:true};
 fs.writeFileSync(path.join(out,'staged-release.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({staged:true,version,previewUrl:previewChannel.url,originalFiles:saved.files.length,totalFiles:finalFiles.length,preservedPublishedPaths:true,billingRewritesPreserved:true}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
