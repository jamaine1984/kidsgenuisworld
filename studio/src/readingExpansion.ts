import type {Question,Skill} from './curriculum';
import {STUDIO_TEXTS,STUDIO_PHRASES} from './readingTexts';
type WordBank={name:string;pattern:string;words:string[];wrong:string[];teach:string;syllables?:number;sentences:string[]};
const bank=(name:string,pattern:string,words:string,wrong:string,teach:string,sentences:string[],syllables?:number):WordBank=>({name,pattern,words:words.split(' '),wrong:wrong.split(' '),teach,sentences,syllables});
export const STUDIO_WORD_BANKS:Record<number,WordBank[]>={
 1:[
  bank('Short a workshop','a','cat map cap bag fan hat jam pan','sit dog cup hen','Read the consonant, short a, and final consonant. Keep the sounds in order.',['Sam has a tan cap.','A cat naps on a mat.','The bag has a map.']),
  bank('Short i workshop','i','sit pin tip fin big win pig lip','cat dog sun hen','The short i sound is in sit. Blend the whole word without changing the vowel.',['The pig can dig.','A big pin is in the bin.','Tim can sit.']),
  bank('Short o workshop','o','hot pot dog log top hop mop fog','cat pig sun hen','The short o sound is in hot. Blend from left to right.',['The dog is on a log.','A pot is hot.','The fox can hop.']),
  bank('Short u workshop','u','sun cup bug mud run fun rug tub','cat sit dog hen','The short u sound is in sun. Read each spelling and blend.',['The pup is in the tub.','A bug is on the rug.','The pup can run in the sun.']),
  bank('Short e workshop','e','hen bed pet net red ten wet pen','cat sit dog sun','The short e sound is in hen. Keep the short vowel sound.',['The red hen is in a pen.','Ben has a pet.','The net is wet.']),
  bank('The sh team','sh','ship shop fish wish shed shin dish shell','cat chin thin frog','The letters S and H work together to spell one sound, as in ship. Read that spelling as one unit.',['The fish is in a dish.','A ship is at the shop.','Nell has a shell.']),
  bank('The ch team','ch','chin chat chop rich much chip chum such','ship thin frog cat','The letters C and H spell one sound in chin. Blend that sound with the rest.',['The chip is in a dish.','The rich soil is wet.','We can chat.']),
  bank('The th team','th','thin bath math path this that them then','ship chin frog cat','The letters T and H work as one spelling. In thin and this the th sound is not exactly the same. Listen to the whole word.',['The path is wet.','This is a bath.','That is a red hat.']),
  bank('Beginning blends','blend','frog clap flag drum snap swim trip stop','cat pig hen sun','In a consonant blend, both consonant sounds can be heard. Read both before the vowel.',['The frog can swim.','The flag is on a pole.','We clap for the drum.']),
  bank('Silent e workshop','final e','cake bike home cube kite name rope gate','cat sit hot tub','Read the vowel and the final quiet e. In these words the vowel has its long sound.',['The kite is by the gate.','The bike is at home.','The rope is in a cube-shaped box.'])
 ],
 2:[
  bank('Silent e review','final e','cake bike home cube kite name rope gate','cat sit hot tub','A final silent e often signals a long vowel. Read the whole word.',['The kite rose above the gate.','I rode my bike home.','The rope held the gate open.']),
  bank('Long a with ai','ai','rain train paint snail wait tail mail sail','seed boat coin park','The team ai spells long a in these words. Read the team together.',['The snail stayed out of the rain.','We wait for the train.','The mail came on a rainy day.']),
  bank('Long e with ee','ee','seed feet tree green sleep keep sheep week','rain boat coin park','The team ee spells long e. Look for both letters.',['The sheep sleeps near a tree.','Keep the green seed dry.','My feet felt cold this week.']),
  bank('Long o with oa','oa','boat coat road soap goat float load toad','seed rain coin park','The team oa spells long o in these words.',['The goat stood beside the road.','The boat carried a heavy load.','The toad sat near my coat.']),
  bank('The ar pattern','ar','star park farm car bark card harm yard','seed boat coin bird','The r changes the vowel sound in ar. Read ar as a spelling unit.',['A bright star shone over the farm.','We parked the car by the yard.','The card showed a map of the park.']),
  bank('The or pattern','or','corn fork horn cord storm porch north short','seed boat coin bird','Read or together as in corn. Then blend the rest of the word.',['The storm moved north.','The horn was on the porch.','The fork sat beside the corn.']),
  bank('The oi pattern','oi','coin join soil foil point oil spoil noise','seed boat rain park','The vowel sound in oi moves within the syllable. Read the word as a whole.',['I found a coin in the soil.','Please join us at this point.','The foil kept the oil off the table.']),
  bank('The ou pattern','ou','out cloud loud proud shout sound round found','seed boat rain coin','The ou in these words has the sound in out. Some other ou words use a different sound.',['A loud sound came from outside.','The cloud looked round.','We found the toy on the ground.']),
  bank('Two-syllable decoding','two syllables','rabbit sunset picnic basket kitten napkin pocket rocket','cat cake ship rain','Find the vowel sounds, read each syllable, and join the parts.',['The rabbit hid beside the basket.','We took a napkin to the picnic.','A kitten curled up at sunset.'],2),
  bank('Word endings','ending','jumped jumping helped helping looked looking walked walking','sun coat train coin','Find the base word first. Read the ending without losing the base word.',['We helped clean the garden.','The kitten was jumping.','Theo looked at the painted sign.'])
 ],
 3:[
  bank('Prefix un','un','unhappy unkind unfair unsafe unpaid untold unpack unlock','reread careful kindness sunset','The prefix un often means not or the opposite. Decode the base word after the prefix.',['The unfair rule made the players unhappy.','Unlock the box before you unpack it.','The unsafe path had a clear warning.']),
  bank('Prefix re','re','reread replay rewrite remake refill retell redo reuse','unhappy careful kindness sunset','The prefix re often means again. Read the base word, then add the prefix meaning.',['Please reread the paragraph and retell its main idea.','We can reuse the jar and refill it.','The group will rewrite the ending.']),
  bank('Suffix ful','ful','careful helpful hopeful joyful useful thankful playful colorful','careless kindness replay sunset','The suffix ful means full of or having. Read the base word and the ending.',['A helpful neighbor carried the colorful banner.','Be careful with the useful tool.','The playful puppy made us joyful.']),
  bank('Suffix less','less','careless helpless hopeless harmless endless fearless thankless useless','careful kindness replay sunset','The suffix less means without. Join it to the base word to understand the meaning.',['A harmless moth rested on the endless row of flowers.','The fearless climber checked every rope.','The broken tool was useless for this job.']),
  bank('Suffix ness','ness','kindness sadness softness darkness fairness neatness illness goodness','careful careless replay sunset','The suffix ness names a state or quality. Notice the base word and any spelling change.',['The kindness of the group lifted her sadness.','The softness of the cloth surprised us.','Fairness mattered in the new game.']),
  bank('Compound-word workshop','compound','sunshine raincoat bedroom playground backpack snowman mailbox notebook','careful replay kindness rabbit','Read both smaller words. Their meanings help you understand the compound word.',['Leave the notebook in the backpack.','The raincoat hung beside the bedroom door.','Sunshine reached the playground.']),
  bank('Three-syllable workshop','three syllables','animal banana tomato elephant holiday potato tornado together','cat rabbit sunset cake','Read one syllable at a time, then blend the whole word. Use context to check it.',['We saw an elephant on our holiday.','The animal moved toward the tomato plant.','We read about a tornado together.'],3),
  bank('Four-syllable workshop','four syllables','helicopter macaroni alligator elevator caterpillar calculator avocado binoculars','cat rabbit banana cake','A long word can have four syllables. Keep all the vowel sounds in order.',['The helicopter flew beyond the elevator tower.','We watched an alligator through binoculars.','The caterpillar crawled past an avocado.'],4),
  bank('Latin ending tion','tion','action station motion nation section fiction direction attention','careful replay kindness rabbit','The ending tion is often pronounced like shun. Read the base and ending, then check the meaning in context.',['Pay attention to the direction of motion.','The fiction section is near the station display.','Each section described an action.']),
  bank('Vowel-pattern review','oi','coin join soil foil point oil spoil noise','seed boat rain park','Compare the actual spellings. Read the vowel pattern, then use the word in context.',['Join the group at the marked point.','A coin lay under the garden soil.','The noise stopped when we covered the oil pump.'])
 ]
};
// Larger banks support separate teaching, transfer and later-day checks without re-crediting familiar words.
const extraWords:Record<number,string[]>={
 1:['bat mat rat sat tap nap ram van','bin bit hit lid zip dip fit six','cot dot fox lot nod rob rod sob','bun cut dug gum hut jug nut pup','beg bet fed get leg let met set','cash dash hush mash rash rush shut shot','check chest chick chill lunch munch pinch bench','thick thud moth with both cloth broth thump','brag crab drag flat grin plan slip step','bake game lake late line mine note hope'],
 2:['bake game lake late line mine note hope','chain drain gain grain nail paid plain stain','bee deep feel feed meet need peel seen','coach coast foam goal loaf oak roast soak','arch art dark hard jar march part sharp','born cork form fort sort sport torn worn','boil toil coil hoist moist voice choice joint','count couch flour ground house mouth mouse south','pencil lesson winter summer garden window paper tablet','painted painting played playing worked working rested resting'],
 3:['unwell undo untie unseen unplug unfit unwrap unfold','rebuild recheck repaint recount reopen rename retry restart','wonderful cheerful peaceful powerful graceful faithful beautiful successful','breathless leafless toothless sleepless restless cloudless homeless wireless','happiness calmness roughness weakness boldness shyness sweetness wetness','sunset rainbow footprint toothbrush bookshelf doorbell football bedtime','umbrella butterfly dinosaur computer newspaper spaghetti remember magazine','celebration invitation information education operation observation conversation transportation','invention collection protection instruction addition subtraction selection vacation','boil toil coil hoist moist voice choice joint']
};
for(const grade of [1,2,3])STUDIO_WORD_BANKS[grade].forEach((b,i)=>{b.words=[...new Set([...b.words,...extraWords[grade][i].split(' ')])];});
// Explicit chunk maps avoid treating a silent e as a separate spoken phoneme.
const chunks:Record<string,string[]>={cake:['c','a','k','e'],bike:['b','i','k','e'],home:['h','o','m','e'],cube:['c','u','b','e'],kite:['k','i','t','e'],name:['n','a','m','e'],rope:['r','o','p','e'],gate:['g','a','t','e']};
export function spellingChunks(word:string):string[]{return chunks[word]||word.match(/tion|sh|ch|th|ee|ai|oa|ar|or|oi|ou|[a-z]/g)||[word];}
const readingDomains=['Sounds and Listening','Phonics and Word Patterns','Spelling and Sentence Building','Language and Vocabulary','Stories and Comprehension','Fluency and Read-along'];
const listeningUnits:Record<number,string[]>={1:['Beginning sounds','Ending sounds','Middle vowel contrasts','Rhyming families','Syllable listening','Compound-word listening','Follow two steps','Listen for a detail'],2:['Rhyming families','Syllable listening','Compound-word listening','Follow three steps','Listen for a detail','Listen for a cause','Listen for the main idea','Listen and infer'],3:['Listen for a detail','Listen for a cause','Listen for the main idea','Listen and infer','Listen for evidence','Listen for the first event','Follow three steps','Listen for word meaning']};
const literacyStandards=(grade:number,domain:string)=>domain==='Sounds and Listening'?[`${grade}.SL.2`]:domain==='Language and Vocabulary'?[`${grade}.L.1`,`${grade}.L.4`]:domain==='Stories and Comprehension'?[`${grade}.RL.1`,`${grade}.RI.2`]:domain==='Fluency and Read-along'?[`${grade}.RF.4`]:[`${grade}.RF.3`,`${grade}.L.2`];
export function expandReading(base:Skill[]):Skill[]{
 const added:Skill[]=[];
 for(const grade of [1,2,3])for(const domain of readingDomains){const old=base.filter(s=>s.grade===grade&&s.subject==='reading'&&s.domain===domain),needed=40-old.length;
  const candidates=Array.from({length:40},(_,i)=>{
   let title:string,teach:string,kind='readingStudio',p:any={studio:domain,task:i%4,unit:Math.floor(i/4)};
   if(domain==='Sounds and Listening'){p.unit=Math.floor(i/5);p.task=i%5;p.foundational=grade===2&&p.unit<3;title=`${p.foundational?'Foundation review · ':''}${listeningUnits[grade][p.unit]}: ${['listen and match','notice the clue','choose carefully','check the meaning','tell what you heard'][p.task]}`;kind='listening';teach='Listen to the whole clue first. Replay it when you need to. Think about the question before choosing.';}
   else if(domain==='Phonics and Word Patterns'){const b=STUDIO_WORD_BANKS[grade][p.unit];title=`${b.name}: ${['hear and read','find the pattern','notice the word part','build and read'][p.task]}`;teach=b.teach;kind=p.task===3?'spelling':'phonics';p.patterns=[b.pattern];}
   else if(domain==='Spelling and Sentence Building'){const b=STUDIO_WORD_BANKS[grade][p.unit];title=`${b.name}: ${['word dictation','spelling detective','sentence dictation','sentence editor'][p.task]}`;teach=p.task<2?b.teach:'Listen to the sentence. Begin with a capital, keep the words in order, and check the ending punctuation.';kind=p.task===0?'spelling':'readingStudio';p.patterns=[b.pattern];}
   else if(domain==='Language and Vocabulary'){p.unit=Math.floor(i/5);p.task=i%5;title=`${LANGUAGE_UNITS[grade][p.unit]}: ${['identify','complete','edit','compare','explain'][p.task]}`;teach=languageTeaching(grade,p.unit);}
   else{const text=STUDIO_TEXTS[grade][p.unit];title=`${domain==='Fluency and Read-along'?'Book Club':'Story Detective'} · ${text.title}: ${domain==='Fluency and Read-along'?['read in phrases','pause at punctuation','reread for meaning','check a word'][p.task]:['find a detail','find the main idea','explain why','use a clue'][p.task]}`;teach=domain==='Fluency and Read-along'?'Read accurately first. Reread in meaningful phrases, pausing at punctuation. Use the text to check a word.':'Read or listen to the text. Find a clue that supports your answer; check the whole passage.';kind=domain==='Fluency and Read-along'?'fluency':'readingStudio';p.patterns=text.patterns;}
   p.standards=literacyStandards(grade,domain);p.review='draft';p.textGrade=grade;return{title,teach,kind,p,index:i};
  });
  const chosen=Array.from({length:needed},(_,i)=>candidates[Math.floor(i*40/needed)]);
  for(const item of chosen){const id=`r${grade}-studio-${readingDomains.indexOf(domain)}-${item.index}`,previous=added.filter(s=>s.grade===grade&&s.domain===domain).at(-1);
   added.push({id,grade,subject:'reading',domain,title:item.title,kind:item.kind,p:item.p,objective:item.teach,teach:item.teach,order:base.length+added.length,prerequisite:previous?.id||old.at(-1)?.id});
  }
 }
 return added;
}

const LANGUAGE_UNITS:Record<number,string[]>={1:['Nouns in our world','Action words','Describing words','Complete sentences','Capital letters','Sentence endings','Similar meanings','Opposite meanings'],2:['Nouns and plurals','Past-tense verbs','Adjectives and adverbs','Pronouns','Compound sentences','Sentence endings','Context clues','Word relationships'],3:['Nouns and pronouns','Verb tense and agreement','Adjectives and adverbs','Connect ideas','Dialogue punctuation','Context clues','Prefix meanings','Suffix meanings']};
function languageTeaching(grade:number,unit:number){const topic=LANGUAGE_UNITS[grade][unit];if(topic.includes('Nouns'))return 'A noun names a person, place or thing. A plural names more than one. A pronoun can stand for a noun.';if(/\bverbs?\b/i.test(topic)||topic==='Action words')return grade===1?'An action word tells what someone or something does. Find the action in the sentence.':'A verb shows an action or state. Yesterday signals past time; today can signal present time. Match the verb to its subject.';if(topic.includes('Describing')||topic.includes('Adjectives'))return 'An adjective describes a noun. An adverb can tell how an action happens.';if(topic==='Pronouns')return 'Find the noun first. Choose a pronoun that refers clearly to that person or thing.';if(topic==='Capital letters')return 'Capitalize the first word of a sentence and every person’s name.';if(topic==='Complete sentences')return 'A complete thought names who or what and tells something about it.';if(topic==='Connect ideas'||topic==='Compound sentences')return 'Use and to add, but to contrast, because to give a reason, or to give a choice, and so to show a result.';if(topic==='Dialogue punctuation')return 'Quotation marks surround the exact words someone says. Keep the sentence punctuation inside the quotation marks.';if(topic==='Sentence endings')return 'Statements end with a period. Questions ask for information and end with a question mark.';if(topic==='Context clues')return 'Read around the unfamiliar word. Nearby details can help you choose the meaning that fits.';if(topic==='Prefix meanings')return 'Read the prefix and base word. un often means not or the opposite; re often means again.';if(topic==='Suffix meanings')return 'Read the base word and ending. ful means having; less means without; ness names a state or quality.';return 'Synonyms have similar meanings. Antonyms have opposite meanings. Check the relationship the question asks for.';}
const synonyms=[['small','tiny','huge'],['fast','quick','slow'],['happy','glad','sad'],['quiet','silent','noisy'],['start','begin','finish'],['easy','simple','difficult'],['kind','caring','mean'],['brave','courageous','afraid'],['tidy','neat','messy'],['bright','shiny','dim']];
const nouns=['pencil','garden','teacher','rabbit','basket','library','bridge','neighbor','boat','window'];
const verbs=[['walk','walked','walks','walking'],['jump','jumped','jumps','jumping'],['play','played','plays','playing'],['help','helped','helps','helping'],['look','looked','looks','looking'],['paint','painted','paints','painting'],['run','ran','runs','running'],['go','went','goes','going'],['eat','ate','eats','eating'],['see','saw','sees','seeing']];
const adjectives=[['soft','scarf','softly'],['bright','lamp','brightly'],['slow','turtle','slowly'],['careful','artist','carefully'],['quiet','room','quietly'],['quick','runner','quickly'],['smooth','stone','smoothly'],['neat','desk','neatly'],['kind','friend','kindly'],['patient','teacher','patiently']];
const contextWords=[['fragile','The fragile cup could break if it fell.','Easily broken.','Very heavy.'],['enormous','The enormous tree was taller than all the nearby trees.','Very large.','Very tiny.'],['exhausted','After the long walk, she was exhausted and needed to rest.','Very tired.','Full of energy.'],['inspect','We inspect the bridge by looking closely for cracks.','Look at carefully.','Build quickly.'],['scarce','Rain was scarce; only a little fell all month.','Hard to find or limited.','Available everywhere.'],['accurate','An accurate map shows places in their correct positions.','Correct and exact.','Guessing randomly.'],['generous','The generous neighbor shared her extra fruit.','Willing to share.','Keeping everything.'],['predict','We predict what may happen by using clues.','Make an informed guess about what comes next.','Describe only what happened yesterday.'],['revise','We revise the draft by improving unclear sentences.','Change to improve.','Never change.'],['observe','We observe the plant by watching it carefully each day.','Notice carefully.','Ignore completely.']];

export function readingStudioQuestion(skill:Skill,seed:number,random:()=>number):Question{
 const {studio,unit,task}=skill.p,grade=skill.grade;const int=(lo:number,hi:number)=>lo+Math.floor(random()*(hi-lo+1));const pick=<T,>(arr:T[]):T=>arr[int(0,arr.length-1)];
 const q:Question={id:`${skill.id}:${seed}`,prompt:'',answer:'',choices:[],hint:skill.teach,explanation:''};let wrong:string[]=[];
 const set=(prompt:string,answer:string,explanation:string,distractors:string[])=>{q.prompt=prompt;q.answer=answer;q.explanation=explanation;wrong=distractors;};
 if(studio==='Phonics and Word Patterns'||studio==='Spelling and Sentence Building'){
  const b=STUDIO_WORD_BANKS[grade][unit],word=pick(b.words);q.word=word;
  if(studio==='Phonics and Word Patterns'){
   if(task===0)set('Listen to the word. Which spelling matches?',word,`${word} is spelled ${word.split('').join(', ')}. ${b.teach}`,b.words.filter(w=>w!==word));
   if(task===1){q.word=undefined;set(`Which word belongs in ${b.name.toLowerCase()}?`,word,`${word} fits this pattern. ${b.teach}`,b.wrong);}
   if(task===2){q.passage=word;q.word=undefined;const focus=b.syllables?`${b.syllables} syllables`:b.pattern==='blend'?word.slice(0,2):b.pattern==='ending'?word.endsWith('ing')?'ing':'ed':b.pattern==='compound'?compoundParts[word]:b.pattern==='final e'?'The final e':b.pattern;
    set(b.syllables?`How many syllables do you hear in ${word}?`:b.pattern==='compound'?`Which two smaller words make ${word}?`:`In ${word}, which part is the focus of ${b.name.toLowerCase()}?`,focus,b.teach,b.syllables?['One syllable','Two syllables','Three syllables','Four syllables'].filter(x=>x.toLowerCase()!==`${b.syllables===2?'two':b.syllables===3?'three':'four'} syllables`):['No letters','The whole sentence','A punctuation mark']);}
   if(task===3){q.tiles=spellingChunks(word);set('Listen, then build and read the word.',word,`${q.tiles.join(' · ')} spells ${word}. ${b.teach}`,b.words.filter(w=>w!==word));}
  }else{
   if(task===0){q.tiles=spellingChunks(word);set('Listen to the word, then spell it.',word,`${q.tiles.join(' · ')} spells ${word}.`,b.words.filter(w=>w!==word));}
   if(task===1){const wrongWord=word.slice(0,-1)+word.at(-1)+word.at(-1);set('Listen to the word. Which spelling is correct?',word,`${word} uses this spelling: ${spellingChunks(word).join(' · ')}.`,[wrongWord,word.slice(1),word+'s'].filter(w=>w!==word));}
   if(task===2){const sentence=pick(b.sentences);q.word=undefined;q.listeningText=sentence;q.tiles=sentence.split(' ');q.tileJoin=' ';set('Listen to the sentence, then build it with the word tiles.',sentence,'Start with the capital word, keep the spoken order, and end at the punctuation.',['Check the word order.','Check the beginning and ending.']);}
   if(task===3){const sentence=pick(b.sentences),lower=sentence[0].toLowerCase()+sentence.slice(1,-1);q.word=undefined;q.passage=lower;set('Which edit makes this a correctly written statement?',sentence,'A statement begins with a capital and ends with a period.',[lower+'.',sentence.slice(0,-1)+'?',lower+'?']);}
  }
 }else if(studio==='Sounds and Listening'){
  const topic=listeningUnits[grade][unit];
  if(['Beginning sounds','Ending sounds','Middle vowel contrasts','Rhyming families'].includes(topic)){
   const sets:Record<string,string[][]>={
    'Beginning sounds':[['cat','cup','cap','map','dog'],['sun','sit','seed','hen','bug'],['map','mud','mop','fan','log'],['pig','pen','pan','cat','run'],['hat','hop','hen','bin','cup']],
    'Ending sounds':[['cat','hat','sit','map','sun'],['dog','bag','pig','hen','cup'],['sun','pin','hen','map','cat'],['cup','hop','map','hen','dog'],['ham','jam','rim','pig','hat']],
    'Middle vowel contrasts':[['cat','map','hat','sit','sun'],['pin','sit','pig','hot','hen'],['hot','pot','top','cap','bug'],['sun','cup','mud','pen','cat'],['hen','bed','pen','sit','dog']],
    'Rhyming families':[['cat','hat','mat','sun','pig'],['pin','fin','win','dog','cup'],['hop','top','mop','hen','bag'],['bug','rug','hug','cat','log'],['hen','pen','ten','sit','map']]};
   const [target,match,other,...bad]=sets[topic][task],anchor=pick([target,other]);q.listeningText=`Listen carefully: ${anchor}. ${anchor}.`;
   set(topic==='Beginning sounds'?'Which word starts with the same sound?':topic==='Ending sounds'?'Which word ends with the same sound?':topic==='Middle vowel contrasts'?'Which word has the same middle vowel sound?':'Which word rhymes with the spoken word?',match,`${anchor} and ${match} share ${topic==='Beginning sounds'?'their first sound':topic==='Ending sounds'?'their last sound':topic==='Middle vowel contrasts'?'the middle vowel sound':'the ending rhyme'}.`,bad);
  }else if(topic==='Syllable listening'){
   const b=STUDIO_WORD_BANKS[grade][grade===1?0:8],words=grade===1?[['cat','rabbit',2],['sun','basket',2],['cup','elephant',3],['dog','banana',3],['hen','kitten',2]] as const:undefined;
   const item=words?.[task],word=item?item[1]:pick(b.words),count=item?item[2]:b.syllables||2;q.listeningText=`Say the word ${word}. Clap once for each vowel sound in ${word}.`;
   set('How many syllables did you hear?',String(count),`${word} has ${count} syllables.`,['1','2','3','4']);
  }else if(topic==='Compound-word listening'){
   const pairs=[['sun','shine','sunshine'],['rain','coat','raincoat'],['bed','room','bedroom'],['snow','man','snowman'],['back','pack','backpack']],pair=pairs[task];q.listeningText=`Join ${pair[0]} and ${pair[1]}.`;
   set('Which whole word do you hear when the parts are joined?',pair[2],`${pair[0]} + ${pair[1]} makes ${pair[2]}.`,pairs.filter(p=>p!==pair).map(p=>p[2]));
  }else if(topic.startsWith('Follow')){
   const things=['blue block','gold star','red book','green leaf','small shell'],first=things[task],second=things[(task+1)%5],third=things[(task+2)%5],three=topic.includes('three');q.listeningText=`First touch the ${first}. Next point to the ${second}.${three?` Last pick up the ${third}.`:''}`;
   const position=pick(three?['first','next','last']:['first','next']),target=position==='first'?first:position==='last'?third:second;
   set(`Which object did Theo name ${position}?`,target,`The direction says ${position}: ${target}.`,things.filter(x=>x!==target));
  }else if(topic==='Listen for word meaning'){
   const [word,sentence,meaning,bad]=contextWords[task*2+int(0,1)];q.listeningText=sentence;set(`What does ${word} mean in the spoken sentence?`,meaning,`The sentence gives a clue: ${sentence}`,[bad,'A kind of number.','A place on a map.']);
  }else{
   const text=STUDIO_TEXTS[grade][task*2+int(0,1)],field=topic==='Listen for a cause'?'cause':topic==='Listen for the main idea'?'main':topic==='Listen and infer'?'inference':topic==='Listen for the first event'?'first':'detail';q.listeningText=text.text;
   const answer=field==='first'?text.text.split(/(?<=[.!?])\s+/)[0]:text[field as 'detail'|'main'|'cause'|'inference'];
   set(field==='cause'?'Why did the event happen?':field==='main'?'What is the whole passage mostly about?':field==='inference'?'What conclusion fits the spoken clues?':field==='first'?'What happened first?':topic==='Listen for evidence'?'Which statement was directly supported by the words you heard?':'Which detail did you hear?',answer,`The spoken text supports this: ${answer}`,text.wrong);
  }
 }else if(studio==='Language and Vocabulary'){
  languageQuestion(grade,unit,task,q,set,pick);
 }else{
  const text=STUDIO_TEXTS[grade][unit];q.passage=text.text;
  if(studio==='Stories and Comprehension'){
   const field=(['detail','main','cause','inference'] as const)[task],prompts=['Which detail appears in the text?','What is the whole text mostly about?','Which reason fits what happened?','Which conclusion is supported by the clues?'];set(prompts[task],text[field],`The text supports “${text[field]}”. Find the words that helped you.`,text.wrong);q.hint=task===1?'Think about all the sentences, not just one detail.':task===3?'Combine a text clue with what you know. Avoid a conclusion that contradicts the text.':'Reread the text and find the matching detail or reason.';
  }else{
   const first=text.text.split(/(?<=[.!?])\s+/)[0],words=first.split(' '),last=words.at(-1)!;
   if(task===0){const phrase=STUDIO_PHRASES[grade][unit];set('Read the first sentence. Which choice groups the words while keeping them in the same order?',phrase,'Read each group smoothly. A slash separates phrase groups; keep all the words in their original order.',[words.slice().reverse().join(' / '),words.slice(1).join(' / ')]);}
   if(task===1)set('After which word do you pause at the first period?',last,`The first sentence ends “${last}” Pause briefly at the period.`,words.slice(0,-1));
   if(task===2)set('Reread smoothly. Which detail belongs to the text?',text.detail,`After rereading, you can check meaning: ${text.detail}`,text.wrong);
   if(task===3){const idx=Math.min(words.length-2,Math.max(1,Math.floor(words.length/2))),target=words[idx],line=words.map((w,i)=>i===idx?'___':w).join(' ');set(`Use the text to check the missing word: ${line}`,target,`The text says “${first}” Read the restored sentence smoothly.`,words.filter(w=>w!==target));}
   q.hint='Listen to a model if you need one. Reread accurately, then try a smooth phrase. This is practice, not a measurement of your spoken reading.';
  }
 }
 if(!q.prompt||!q.answer)throw Error(`Missing reading task ${studio}/${unit}/${task}`);
 const unique=[...new Set([q.answer,...wrong])];q.choices=unique.slice(0,4);if(q.choices.length<2)throw Error(`No distractor ${skill.id}`);
 for(let i=q.choices.length-1;i>0;i--){const j=int(0,i);[q.choices[i],q.choices[j]]=[q.choices[j],q.choices[i]];}
 return q;
}
const compoundParts:Record<string,string>={sunshine:'sun + shine',raincoat:'rain + coat',bedroom:'bed + room',playground:'play + ground',backpack:'back + pack',snowman:'snow + man',mailbox:'mail + box',notebook:'note + book',sunset:'sun + set',rainbow:'rain + bow',footprint:'foot + print',toothbrush:'tooth + brush',bookshelf:'book + shelf',doorbell:'door + bell',football:'foot + ball',bedtime:'bed + time'};

type Setter=(prompt:string,answer:string,explanation:string,wrong:string[])=>void;
function languageQuestion(grade:number,unit:number,task:number,q:Question,set:Setter,pick:<T>(arr:T[])=>T){
 const noun=pick(nouns),[base,past,present,ongoing]=pick(verbs),[adj,thing,adv]=pick(adjectives),relation=pick(synonyms);
 const t=task,topic=LANGUAGE_UNITS[grade][unit];
 if(topic.includes('Nouns')){
  if(grade===3&&t>=2){q.passage='The students made a model. They tested it together.';const target=t===2?'They':t===3?'it':'students';set(t===2?'Which word stands for the students?':t===3?'Which word stands for the model?':'Which noun does “They” refer to?',target,'They refers to the students; it refers to the model.',['model','tested','together'].filter(w=>w!==target));}
  else if(grade===2&&t>=2){const plural:Record<string,string>={pencil:'pencils',garden:'gardens',teacher:'teachers',rabbit:'rabbits',basket:'baskets',library:'libraries',bridge:'bridges',neighbor:'neighbors',boat:'boats',window:'windows'};set(t===2?`Which word means more than one ${noun}?`:`Complete: We saw two ___. The word is ${noun} in its singular form.`,plural[noun],`The plural of ${noun} is ${plural[noun]}.`,[noun,noun+'ing',noun+'ed']);}
  else{q.passage=`The ${noun} is beside the window.`;if(t===0)set('Which word is a noun?',noun,`${noun} names a person, place or thing.`,['is','beside','The']);if(t===1)set('Complete with a noun: Theo carries a ___.','basket','A basket names a thing.',['quickly','carries','kind']);if(t===2)set('Which word names a place?','garden','A garden is a place.',['walks','kind','slowly']);if(t===3)set('Which pair contains two nouns?',`${noun} and basket`,'Both words name people, places or things.',[`${noun} and runs`,'soft and quickly']);if(t===4)set(`Why is ${noun} a noun?`,'It names a person, place or thing.','That naming job makes it a noun.',['It always describes how to move.','It is a punctuation mark.']);}
 }else if(/\bverbs?\b/i.test(topic)||topic==='Action words'){
  if(grade===1){q.passage=`Theo ${present} near the garden.`;if(t===0)set('Which word shows an action?',present,`${present} tells what Theo does.`,['Theo','garden','the']);if(t===1)set('Complete with an action: The rabbit ___.','hops','Hops tells what the rabbit does.',['soft','basket','the']);if(t===2)set('Which sentence clearly tells an action?','Mia paints a picture.','Paints tells what Mia does.',['Mia a picture.','The soft.']);if(t===3)set('Which pair contains two action words?',`${base} and jump`,'Both words name things someone can do.',[`${base} and basket`,'soft and blue']);if(t===4)set(`Why is ${present} an action word?`,'It tells what Theo does.',`In this sentence, ${present} names the action.`,['It names a place.','It describes only a color.']);return;}
  q.passage=`Yesterday, Theo ${past}. Today, Theo ${present}.`;
  if(t===0)set('Which word shows the past action?',past,`Yesterday signals the past: ${past}.`,[base,present,'tomorrow']);
  if(t===1)set(`Complete with the present-tense verb: Today, Theo ___.`,present,`Theo is one person, so ${present} fits this present-tense sentence.`,[past,base,ongoing]);
  if(t===2)set(`Correct: Yesterday, Theo ${present}.`,`Yesterday, Theo ${past}.`,'Use the past tense with yesterday.',[`Yesterday, Theo ${base}.`,`Yesterday, Theo ${ongoing}.`]);
  if(t===3)set('Which pair names the same action in present and past?',`${present} / ${past}`,'The tense changes, but the action stays related.',[`${present} / window`,'basket / garden']);
  if(t===4)set(`What clue helps choose ${past}?`,'The word yesterday.','Yesterday tells that the action already happened.',['The color of the letters.','The number of commas.']);
 }else if(topic.includes('Describing')||topic.includes('Adjectives')){
  q.passage=`The ${adj} ${thing} is nearby.`;
  if(t===0)set(`Which word describes the ${thing}?`,adj,`${adj} is an adjective that describes ${thing}.`,[thing,'is','nearby']);
  if(t===1)set(`Complete with a describing word: The ___ ${thing} is nearby.`,adj,'An adjective gives information about a noun.',[thing,'runs','and']);
  if(t===2&&grade>1){q.passage=`The artist worked ${adv}.`;set('Which word describes how the artist worked?',adv,`${adv} tells how; it is an adverb.`,['artist','worked','The']);}
  else if(t===2)set(`Which sentence uses ${adj} to describe something?`,`The ${thing} is ${adj}.`,'The describing word tells about the noun.',[`${adj} and.`,`The is ${adj}.`]);
  if(t===3)set(grade>1?'Which pair is an adjective and its related adverb?':'Which pair is a describing word and a noun?',grade>1?`${adj} / ${adv}`:`${adj} / ${thing}`,grade>1?'An adjective describes a noun; an adverb can describe an action.':'A describing word gives information about a noun.',[`${thing} / and`,'the / is']);
  if(t===4)set(`What does ${adj} do in “the ${adj} ${thing}”?`,`It describes the ${thing}.`,'Check the job of the word in its sentence.',['It names the punctuation.','It joins two sentences.']);
 }else if(topic==='Pronouns'){
  const [sentence,pronoun,name]=pick([['The girls read. ___ like books.','They','The girls'],['The boys paint. ___ use blue paint.','They','The boys'],['The plant grows. ___ needs water.','It','The plant'],['Theo and I build. ___ make a bridge.','We','Theo and I']]);q.passage=sentence;
  set(t===4?'Why use a pronoun here?':`Which pronoun can replace ${name}?`,t===4?'It can stand for the noun without repeating it.':pronoun,`${pronoun} stands for ${name}.`,t===4?['It always changes the meaning.','It removes every action.']:['She','He','They','It','We'].filter(w=>w!==pronoun));
 }else if(topic==='Complete sentences'){
  const sentence=`The ${thing} is ${adj}.`;
  if(t===0)set('Which choice tells a complete thought?',sentence,'It names something and tells something about it.',[`The ${adj}.`,`Beside the ${thing}.`]);
  if(t===1)set(`Complete: The ${thing} ___.`,`is ${adj}.`,'Add words that tell something about the noun.',['The and.','Beside.']);
  if(t===2)set(`Fix the fragment: The ${adj} ${thing}.`,`The ${adj} ${thing} is nearby.`,'Add a verb to complete the thought.',[`The ${adj} ${thing} and.`,`Nearby ${adj}.`]);
  if(t===3)set('Which pair has two complete sentences?','Theo reads. Mia draws.','Each sentence names someone and tells an action.',['Theo and. Mia.','The book. Near the desk.']);
  if(t===4)set('What makes a sentence a complete thought?','It names who or what and tells something about it.','A capital and period alone cannot complete a missing thought.',['It has any two words.','It has only a period.']);
 }else if(topic==='Capital letters'){
  const name=pick(['Sam','Mia','Ben','Nora','Theo']),sentence=`${name} has a book.`;
  if(t<4){q.passage=sentence[0].toLowerCase()+sentence.slice(1);set('Which sentence uses capitals correctly?',sentence,'Capitalize the first word and a person’s name.',[q.passage,`${name.toLowerCase()} Has a Book.`,`The ${name.toLowerCase()} reads.`]);}
  else set(`Why does ${name} begin with a capital?`,'It is a person’s name.','Names are capitalized wherever they appear.',['Every word must start with a capital.','Only long words have capitals.']);
 }else if(topic==='Connect ideas'||topic==='Compound sentences'){
  const items=[['Mia wanted to play, ___ it was raining.','but','The ideas contrast.','shows a contrast'],['Theo packed paper ___ crayons.','and','The ideas are added together.','adds the two items'],['We stayed inside ___ the rain was heavy.','because','The second idea gives a reason.','introduces the reason'],['You may use a pencil ___ a crayon.','or','The sentence gives a choice.','gives a choice'],['The bridge was weak, ___ we added supports.','so','The second idea is a result.','introduces the result']];const [sentence,word,why,job]=items[t];q.passage=sentence;set(`Which connecting word ${job}?`,word,why,['and','but','because','or','so'].filter(w=>w!==word));
 }else if(topic==='Sentence endings'||topic==='Dialogue punctuation'){
  const question=t%2===0,core=question?'Where is the book':'The book is on the shelf',sentence=core+(question?'?':'.');
  if(topic==='Dialogue punctuation'){const tag=question?'asked':'said',dialogue=`“${core}${question?'?':','}” ${tag} Mia.`;set('Which choice uses quotation marks and punctuation correctly?',dialogue,question?'Keep the question mark inside the quotation marks before the speaker tag.':'Use a comma inside the quotation marks before said Mia; end the whole sentence with a period.',[`${core} ${tag} Mia.`,`“${core} ${tag}” Mia.`,`“${core}${question?',':'.'}” ${tag} Mia.`]);}
  else if(t===4)set('Why does a question end with a question mark?','It asks for information.','The punctuation matches the sentence purpose.',['It always gives a command.','It is the longest sentence.']);
  else{q.passage=core+'___';set(question?'Which mark ends this question?':'Which mark ends this ordinary statement?',question?'?':'.',question?'The sentence asks a question.':'The sentence makes a statement.',['.','?',',',':']);}
 }else if(topic==='Similar meanings'||topic==='Opposite meanings'||topic==='Word relationships'){
  const [word,same,opposite]=relation,isOpposite=topic==='Opposite meanings'||topic==='Word relationships'&&t%2===1;set(`Which word has ${isOpposite?'the opposite':'a similar'} meaning to ${word}?`,isOpposite?opposite:same,`${word} and ${same} have similar meanings; ${opposite} has the opposite meaning.`,[isOpposite?same:opposite,'window','basket']);
 }else if(topic==='Context clues'){
  const [word,sentence,meaning,bad]=pick(contextWords.filter((_,i)=>grade===2?i<6:true));q.passage=sentence;set(`What does ${word} mean here?`,meaning,`Use these clues: ${sentence}`,[bad,'A kind of number.','A punctuation mark.']);
 }else if(topic==='Prefix meanings'){
  const prefix=t%2?'re':'un',word=pick(STUDIO_WORD_BANKS[3][prefix==='un'?0:1].words);q.passage=word;set(`What does the prefix ${prefix}- mean in ${word}?`,prefix==='un'?'Not or the opposite.':'Again.',`${prefix}- changes the base-word meaning.`,['Full of.','Without.',prefix==='un'?'Again.':'Not or the opposite.']);
 }else if(topic==='Suffix meanings'){
  const index=t%3+2,b=STUDIO_WORD_BANKS[3][index],word=pick(b.words),meaning=index===2?'Full of or having.':index===3?'Without.':'A state or quality.';q.passage=word;set(`What does the suffix ${b.pattern} mean in ${word}?`,meaning,b.teach,['Again.','Before.','Not or the opposite.']);
 }
}
