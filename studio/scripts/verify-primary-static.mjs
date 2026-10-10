import fs from 'node:fs';import crypto from 'node:crypto';import zlib from 'node:zlib';import assert from 'node:assert/strict';
const membership=process.argv.includes('--membership'),reportDir=membership?'output/billing':'output/primary-hosting';
const stage=JSON.parse(fs.readFileSync(reportDir+'/'+(membership?'hosting-staged.json':'staged-release.json'))),before=JSON.parse(fs.readFileSync(reportDir+'/'+(membership?'hosting-before.json':'current-release.json')));
const base=process.argv.includes('--live')?'https://kid-genius-world.com':stage.previewUrl;
const hashes=new Map(before.files.map(f=>[f.path,f.hash]));for(const [p,h] of Object.entries(stage.overlay))hashes.set(p,h);
const sitemap=await fetch(base+'/sitemap.xml').then(r=>r.text()),paths=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
assert.ok(paths.length>=59,'Published sitemap entries are missing.');
const targets=[...new Set([...paths,'/','/legacy/','/robots.txt','/llms.txt','/manifest.webmanifest','/sw.js'])],checks=[];
for(let i=0;i<targets.length;i+=6)await Promise.all(targets.slice(i,i+6).map(async p=>{
 const r=await fetch(base+p),bytes=Buffer.from(await r.arrayBuffer()),file=p.endsWith('/')?p+'index.html':p;
 assert.equal(r.status,200,p);assert.ok(hashes.has(file),'Unmapped page '+file);
 const digest=crypto.createHash('sha256').update(zlib.gzipSync(bytes,{level:9})).digest('hex');assert.equal(digest,hashes.get(file),'Served bytes differ: '+p);
 checks.push({path:p,status:r.status,hashMatches:true});
}));
const missing=await fetch(base+'/qa-confirm-missing-studio-page-20261009');assert.equal(missing.status,404);
const root=await fetch(base+'/');assert.match(root.headers.get('Cache-Control')||'',/no-store/);
const report={checkedAt:new Date().toISOString(),base,sitemapEntries:paths.length,verifiedFiles:checks.length,checks,unknownPageStatus:missing.status,rootNoStore:true,passed:true};
fs.writeFileSync(reportDir+'/'+(process.argv.includes('--live')?'live-static-checks.json':'preview-static-checks.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({base,sitemapEntries:paths.length,verifiedFiles:checks.length,unknownPageStatus:404,passed:true}));
