import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CURRICULUM,makeQuestion} from '../src/curriculum';
import {STUDIO_WORD_BANKS} from '../src/readingExpansion';
const raw=await readFile('output/qa/cmudict-audit-source.txt','utf8');
const dictionary:Record<string,string[][]>=Object.create(null);
for(const line of raw.split('\n')){const [entry,...phones]=line.split('#')[0].trim().split(/\s+/);if(!entry||entry.startsWith(';;;'))continue;const word=entry.replace(/\(\d+\)$/,'');(dictionary[word]||=[]).push(phones);}
const needed=new Set(Object.values(STUDIO_WORD_BANKS).flatMap(banks=>banks.flatMap(b=>b.words)));
const issues:any[]=[];let syllableChecks=0,soundChecks=0;
const sound=(phones:string[],topic:string)=>{const clean=phones.map(p=>p.replace(/[012]/g,''));if(topic==='Beginning sounds')return clean[0];if(topic==='Ending sounds')return clean.at(-1);const lastStress=phones.findLastIndex(p=>/[12]/.test(p));return topic==='Rhyming families'?clean.slice(lastStress).join(' '):clean.find((_,i)=>/[012]/.test(phones[i]));};
for(const skill of CURRICULUM.filter(s=>s.subject==='reading'))for(let seed=1;seed<=300;seed++){
 const q=makeQuestion(skill,seed);if(q.word)needed.add(q.word);
 if(skill.kind==='syllable'||skill.p.studio==='Phonics and Word Patterns'&&skill.p.task===2&&skill.p.patterns?.some((p:string)=>p.includes('syllables'))||skill.p.studio==='Sounds and Listening'&&(skill.grade===1&&skill.p.unit===4||skill.grade===2&&skill.p.unit===1)){const word=q.word||q.passage||q.listeningText!.match(/word (\w+)/)![1],expected=Number(q.answer.match(/\d+/)?.[0]),counts=dictionary[word]?.map(p=>p.filter(v=>/[012]/.test(v)).length)||[];needed.add(word);syllableChecks++;if(!counts.includes(expected))issues.push({type:'syllable',skill:skill.id,word,expected,counts});}
 if(skill.p.studio==='Sounds and Listening'&&skill.grade===1&&skill.p.unit<4){const topic=['Beginning sounds','Ending sounds','Middle vowel contrasts','Rhyming families'][skill.p.unit],anchor=q.listeningText!.match(/carefully: (\w+)/)![1];needed.add(anchor);needed.add(q.answer);soundChecks++;if(!dictionary[anchor]?.some(a=>dictionary[q.answer]?.some(b=>sound(a,topic)===sound(b,topic))))issues.push({type:'sound',skill:skill.id,anchor,answer:q.answer,topic});}
}
const entries=Object.fromEntries([...needed].sort().map(word=>[word,dictionary[word]||[]]));
const missing=[...needed].filter(word=>!dictionary[word]);
const manualWords={lunchbox:{parts:['lunch','box'],note:'A standard compound of lunch and box; absent as a joined entry in this CMU snapshot. Not used as a syllable-count or sound-matching target.'}};
await writeFile('tests/fixtures/pronunciations.json',JSON.stringify({source:'https://github.com/cmusphinx/cmudict',download:'https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict',date:'2026-10-09',sha256:createHash('sha256').update(raw).digest('hex'),note:'CMU US English pronunciation reference; not a grade-level or voice-quality certification. License: CMUDICT-LICENSE.txt.',manualWords,entries},null,2)+'\n');
const uniqueIssues=[...new Map(issues.map(i=>[JSON.stringify(i),i])).values()];
const unresolvedWords=missing.filter(w=>!(w in manualWords));
await writeFile('output/qa/language-audit.json',JSON.stringify({words:needed.size,syllableChecks,soundChecks,missing,manualWords,unresolvedWords,issues:uniqueIssues},null,2)+'\n');
console.log(JSON.stringify({words:needed.size,syllableChecks,soundChecks,missing,unresolvedWords,issues:uniqueIssues},null,2));
if(unresolvedWords.length||uniqueIssues.length)process.exitCode=1;
