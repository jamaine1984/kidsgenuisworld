import {CURRICULUM,makeQuestion,questionContentId} from './curriculum';
import {questionKey} from './questionIdentity';
import type {Profile} from './learning';
const byId=new Map(CURRICULUM.map(s=>[s.id,s]));
export function migrateQuestionHistory(p:Profile):Profile{
 let changed=false;const seen=new Set(p.seenQuestions||[]);const attempts=p.attempts.map(a=>{if(a.questionKey){if(!seen.has(a.questionKey))changed=true;seen.add(a.questionKey);return a;}const skill=byId.get(a.skillId),seed=Number(a.questionId?.split(':').at(-1));if(!skill||!Number.isInteger(seed)||seed<0||!a.contentId)return a;const q=makeQuestion(skill,seed);if(questionContentId(q)!==a.contentId)return a;const key=questionKey(q);seen.add(key);changed=true;return {...a,questionKey:key};});
 return changed?{...p,attempts,seenQuestions:[...seen]}:p;
}
