import type {Question,Skill} from './curriculum';
const rows:[string,string,string][]=[
 ['Sound Detective: rhyming words','rhyme','Listen to the endings. Rhyming words have the same ending sound.'],
 ['Sound Detective: beginning sounds','initial','Say both words. Listen to the sound at the beginning.'],
 ['Sound Detective: ending sounds','final','Say the whole word, then listen to its last sound.'],
 ['Sound Detective: the odd one out','odd','Listen to the first sound in each word. Find the one that starts differently.'],
 ['Join two spoken words','compound','Listen to two smaller words. Join them to make a compound word.'],
 ['Listen and follow two steps','directions','Listen for first and next. Think about the order before choosing.'],
 ['Sentence Studio: build a sentence','sentence','Begin with a capital. Put the words in order. End with a period.'],
 ['Sentence Studio: build a question','question','Put the words in order to ask something. End with a question mark.'],
 ['Word Workshop: change one letter','chain','Change just the named letter. Read the new word.'],
 ['Sentence Studio: choose the complete thought','complete','A complete sentence tells a whole thought.'],
 ['Little Book: Sam’s cap','book0','Read each short sentence. Pause at each period. Then think about the story.'],
 ['Little Book: a pig in mud','book1','Read each short sentence. Look carefully at the short vowel spellings.'],
 ['Little Book: the red hen','book2','Read the whole sentence. Use the words to picture what happened.'],
 ['Little Book: a dog on a log','book3','Read carefully, then reread smoothly. Find a detail from the story.'],
];
export const LITTLE_BOOKS=[
 {text:'Sam has a cap. The cap is tan. Sam has a bag. Sam puts the cap in the bag.',detail:'The cap is tan.',wrong:['The cap is red.','Sam has a fan.'],patterns:['short-a','CVC'],knownWords:['has','a','the','is','puts','in']},
 {text:'A pig is in mud. The pig can dig. The pig can run. The pig sits in the sun.',detail:'The pig can dig.',wrong:['The pig has a cap.','The pig is in a bag.'],patterns:['short-i','short-u','CVC'],knownWords:['a','is','in','the','can','sits']},
 {text:'Ben has a red hen. The hen is in a pen. Ben has a cup. The hen has a sip.',detail:'The hen is in a pen.',wrong:['The hen is in mud.','The cup is tan.'],patterns:['short-e','short-i','short-u','CVC'],knownWords:['has','a','the','is','in']},
 {text:'A dog is on a log. The dog can hop. The dog can run. The dog sits on the log.',detail:'A dog is on a log.',wrong:['The dog is in a pen.','The dog has a hat.'],patterns:['short-o','short-u','CVC'],knownWords:['a','is','on','the','can','sits']},
];
export const READING_DEPTH:Skill[]=rows.map(([title,mode,teach],i)=>({id:`r1-depth-${i+1}`,grade:1,subject:'reading',domain:i<6?'Sounds and Listening':i<10?'Spelling and Sentence Building':'Fluency and Read-along',title,kind:i>=10?'fluency':i<6?'listening':'readingDepth',p:{mode,foundational:true,patterns:i>=10?LITTLE_BOOKS[i-10].patterns:[]},objective:teach,teach,order:211+i}));
export function readingDepthQuestion(skill:Skill,seed:number,random:()=>number):Question{
 const pick=<T,>(arr:T[]):T=>arr[Math.floor(random()*arr.length)];const q:Question={id:`${skill.id}:${seed}`,prompt:'',answer:'',choices:[],hint:skill.teach,explanation:''};let variants:string[]=[];const m=skill.p.mode;
 if(['rhyme','initial','final'].includes(m)){
  const sets=m==='rhyme'?[['cat','hat','sun','pig'],['pin','fin','dog','cup'],['hop','top','hen','bag'],['bug','rug','cat','log'],['hen','pen','sit','map']]:m==='initial'?[['cat','cup','map','dog'],['sun','sit','hen','bug'],['map','mud','fan','log'],['pig','pen','cat','run'],['hat','hop','bin','cup']]:[['cat','hat','map','sun'],['dog','bag','hen','cup'],['sun','pin','map','cat'],['cup','hop','hen','dog'],['ham','jam','pig','hat']];
  const [target,match,...wrong]=pick(sets);q.prompt=m==='rhyme'?'Which word rhymes with the word Theo says?':m==='initial'?'Which word starts with the same sound?':'Which word ends with the same sound?';q.listeningText=`Listen to the word ${target}. ${target}.`;q.answer=match;variants=wrong;q.explanation=m==='rhyme'?`${target} and ${match} rhyme. Their endings sound the same.`:`${target} and ${match} have the same ${m==='initial'?'first':'last'} sound.`;
 }else if(m==='odd'){const [one,two,odd]=pick([['map','mat','sun'],['cat','cup','hen'],['pig','pin','dog'],['run','red','hat'],['bag','bin','fan']]);q.prompt='Which word starts with a different sound?';q.listeningText=`Listen: ${one}, ${two}, ${odd}.`;q.answer=odd;variants=[one,two];q.explanation=`${one} and ${two} start with the same sound. ${odd} starts differently.`;}
 else if(m==='compound'){const [one,two,word]=pick([['sun','shine','sunshine'],['rain','coat','raincoat'],['bed','room','bedroom'],['snow','man','snowman'],['back','pack','backpack']]);q.prompt='Which word do the two spoken words make?';q.listeningText=`Join ${one} and ${two}. ${one}. ${two}.`;q.answer=word;variants=['sunshine','raincoat','bedroom','snowman','backpack'].filter(w=>w!==word);q.explanation=`${one} and ${two} join to make ${word}.`;}
 else if(m==='directions'){const [first,next]=pick([['blue','gold'],['gold','coral'],['coral','blue'],['blue','coral']]);q.prompt='Which color did Theo tell you to pick first?';q.listeningText=`First pick ${first}. Next pick ${next}.`;q.answer=first;variants=['blue','gold','coral'].filter(w=>w!==first);q.explanation=`Theo said first pick ${first}, then pick ${next}. The word first tells the order.`;}
 else if(m==='sentence'||m==='question'){const sentence=pick(m==='sentence'?['Sam has a red cap.','The pig can dig.','The dog is on a log.','Ben has a red hen.']:['Can the pig dig?','Is the cap red?','Can the dog hop?','Is the hen in a pen?']);q.prompt=m==='sentence'?'Listen, then build the sentence.':'Listen, then build the question.';q.listeningText=sentence;q.answer=sentence;q.tiles=sentence.split(' ');q.tileJoin=' ';variants=['Try the word order again','Check the capital and ending'];q.explanation=sentence;}
 else if(m==='chain'){const [from,to,oldLetter,newLetter]=pick([['cat','hat','c','h'],['map','mat','p','t'],['pin','pan','i','a'],['hot','hop','t','p'],['bug','bag','u','a'],['hen','pen','h','p'],['cup','cut','p','t']]);q.prompt=`In ${from}, change ${oldLetter} to ${newLetter}. Which word do you make?`;q.answer=to;variants=[from,'sun','dog'].filter(w=>w!==to);q.explanation=`Changing ${oldLetter} to ${newLetter} changes ${from} to ${to}. Read the new word.`;}
 else if(m==='complete'){const sentence=pick(['The dog can run.','Sam has a bag.','A hen is in the pen.','The pig can dig.']);q.prompt='Which choice tells a complete thought?';q.answer=sentence;variants=['In the bag.','The red.','Can the.'];q.explanation=`${sentence} tells a complete thought and ends with a period.`;}
 else if(m.startsWith('book')){const book=LITTLE_BOOKS[Number(m.slice(4))];q.prompt='Read the little book. Which detail did you read?';q.passage=book.text;q.answer=book.detail;variants=book.wrong;q.explanation=`The book says: ${book.detail}`;}
 if(!q.prompt)throw new Error(`Missing reading activity ${m}`);q.choices=[q.answer,...variants.filter(v=>v!==q.answer).slice(0,3)];for(let i=q.choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[q.choices[i],q.choices[j]]=[q.choices[j],q.choices[i]];}return q;
}
