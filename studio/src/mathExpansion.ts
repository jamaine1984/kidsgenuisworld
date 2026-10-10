import type {Question,Skill} from './curriculum';

// A concept has five different tasks: solve, represent, find an unknown,
// evaluate a claim, and explain. Seeds only vary examples inside those tasks.
type Concept={name:string;engine:string;max?:number;step?:number;factor?:number;mode?:string;teach:string;standard:string};
type Section={grade:number;domain:string;concepts:Concept[]};
const c=(name:string,engine:string,max:number,teach:string,standard:string,extra:Partial<Concept>={}):Concept=>({name,engine,max,teach,standard,...extra});
const placeTeach='Read hundreds, tens and ones separately. A digit tells how many units of its place there are.';
const countTeach='Keep the counting step the same. Say each number once and check where the sequence begins.';
const arithTeach='Keep track of the whole and its parts. Use an equation, then check with the inverse operation.';
const groupTeach='Keep every group equal. Distinguish how many groups from how many objects in each group.';
const measureTeach='Use equal units and name the unit. Find the starting point before finding the difference.';
const fractionTeach='Use the same-sized whole, divided into equal parts. The denominator names the part size; the numerator counts parts.';
const dataTeach='Read the labels and key first. Use the actual amounts, then compare or combine them.';
export const MATH_SECTIONS:Section[]=[
 {grade:1,domain:'Number sense',concepts:[
  c('Counter collections to ten','count',10,'Count every object once. The last number names the total.','1.NBT.A.1'),
  c('Counter collections to twenty','count',20,'Group ten counters, then count the extras.','1.NBT.A.1'),
  c('Counting trail to 120','sequence',120,countTeach,'1.NBT.A.1',{step:1}),
  c('Count back along the trail','sequence',100,countTeach,'1.NBT.A.1',{step:-1}),
  c('Tens on the number trail','sequence',100,countTeach,'1.NBT.B.2',{step:10}),
  c('Numbers between neighbors','order',100,'Compare the numbers. A number between two neighbors is greater than one and less than the other.','1.NBT.B.3'),
  c('Compare teen numbers','order',19,'Teen numbers have one ten. Compare the ones to decide which is greater.','1.NBT.B.3'),
  c('Numbers across a new ten','sequence',120,countTeach,'1.NBT.A.1',{step:1,mode:'boundary'})]},
 {grade:1,domain:'Place value',concepts:[
  c('One ten and extra ones','place',19,placeTeach,'1.NBT.B.2'),c('Tens-and-ones workshop','place',99,placeTeach,'1.NBT.B.2'),
  c('Numbers with no extra ones','place',90,placeTeach,'1.NBT.B.2',{mode:'zero'}),c('The value of a tens digit','place',99,placeTeach,'1.NBT.B.2'),
  c('Trade ten ones','exchange',99,'Ten ones can be exchanged for one ten without changing the amount.','1.NBT.B.2'),
  c('Ten more in the workshop','shift',89,'Adding a ten changes the tens amount by one. The ones stay the same.','1.NBT.C.5',{step:10}),
  c('Ten fewer in the workshop','shift',99,'Subtracting one ten keeps the ones digit the same.','1.NBT.C.5',{step:-10}),
  c('Compare block collections','order',99,placeTeach,'1.NBT.B.3')]},
 {grade:1,domain:'Measurement and time',concepts:[
  c('Measure the ribbon','length',12,measureTeach,'1.MD.A.2'),c('Measure the toy road','length',20,measureTeach,'1.MD.A.2'),
  c('Compare two builds','lengthCompare',20,'Line up the ends. The longer object reaches farther. Find the difference in equal units.','1.MD.A.1'),
  c('Order three lengths','lengthOrder',20,'Compare lengths using the same unit. Put them in order from shortest to longest.','1.MD.A.1'),
  c('Choose a fair measuring method','unit',12,'Equal units must touch without gaps or overlaps.','1.MD.A.2'),
  c('Hour-hand workshop','clock',12,'At an exact hour, the minute hand points to twelve. Read the short hour hand.','1.MD.B.3',{step:60}),
  c('Half-hour workshop','clock',12,'At half past, the minute hand points to six. The hour hand is halfway to the next hour.','1.MD.B.3',{step:30}),
  c('Join equal measuring units','length',15,measureTeach,'1.MD.A.2')]},
 {grade:1,domain:'Shapes and data',concepts:[
  c('Shape detective: straight sides','shape',6,'Count straight sides and corners. Size and color do not define a shape.','1.G.A.1',{mode:'sides'}),
  c('Shape detective: corners','shape',6,'A corner is where two straight sides meet. Count each corner once.','1.G.A.1',{mode:'corners'}),
  c('Shape detective: solid shapes','solid',6,'Describe a solid by its flat faces or curved surface.','1.G.A.2'),
  c('Two triangles make a build','compose',6,'Use two matching right triangles, each with two equal short sides. Join their long sides to make a square.','1.G.A.2'),
  c('Share a snack in halves','shares',2,'Two equal shares of one whole are halves. Unequal pieces are not halves.','1.G.A.3',{step:2}),
  c('Share a snack in fourths','shares',4,'Four equal shares of one whole are fourths. The shares must be equal.','1.G.A.3',{step:4}),
  c('Read the workshop survey','chart',10,dataTeach,'1.MD.C.4',{mode:'total'}),
  c('Compare the workshop survey','chart',10,dataTeach,'1.MD.C.4',{mode:'difference'})]},
 {grade:2,domain:'Place value',concepts:[
  c('Hundreds in the block shop','place',999,placeTeach,'2.NBT.A.1'),c('Numbers with a zero place','place',999,placeTeach,'2.NBT.A.1',{mode:'zero'}),
  c('Trade ten tens','exchange',999,'Ten tens have the same value as one hundred. Trading changes the units, not the total.','2.NBT.A.1',{step:100}),
  c('Compare three-digit builds','order',999,placeTeach,'2.NBT.A.4'),c('Count five at a time','sequence',100,countTeach,'2.NBT.A.2',{step:5}),
  c('Count ten at a time','sequence',1000,countTeach,'2.NBT.A.2',{step:10}),c('Count hundred at a time','sequence',1000,countTeach,'2.NBT.A.2',{step:100}),
  c('A hundred more or less','shift',899,'Add or remove one hundred. Keep the tens and ones unchanged.','2.NBT.B.8',{step:100})]},
 {grade:2,domain:'Addition and subtraction',concepts:[
  c('Add tens and ones','arithmetic',99,arithTeach,'2.NBT.B.5',{mode:'add'}),c('Subtract tens and ones','arithmetic',99,arithTeach,'2.NBT.B.5',{mode:'sub'}),
  c('Exchange ones to add','arithmetic',99,'Join ones first. When there are ten ones, exchange them for a ten.','2.NBT.B.5',{mode:'addRegroup'}),
  c('Exchange a ten to subtract','arithmetic',99,'If there are too few ones, exchange a ten for ten ones, then subtract.','2.NBT.B.5',{mode:'subRegroup'}),
  c('Add hundreds tens and ones','arithmetic',999,arithTeach,'2.NBT.B.7',{mode:'add'}),c('Subtract three-digit amounts','arithmetic',999,arithTeach,'2.NBT.B.7',{mode:'sub'}),
  c('Join three quantities','three',100,'Join two quantities, then add the third. Check that all parts were counted once.','2.NBT.B.6'),
  c('Two-step workshop stories','twoStep',100,'Find the first change, then the second. Keep the intermediate amount.','2.OA.A.1')]},
 {grade:2,domain:'Equal groups',concepts:[
  c('Pair the collection','pairs',20,'An even collection can be paired with nothing left over. An odd collection has one left.','2.OA.C.3'),
  c('Two in every basket','groups',5,groupTeach,'2.OA.C.4',{factor:2}),c('Three in every row','groups',5,groupTeach,'2.OA.C.4',{factor:3}),
  c('Four in every row','groups',5,groupTeach,'2.OA.C.4',{factor:4}),c('Five in every row','groups',5,groupTeach,'2.OA.C.4',{factor:5}),
  c('Rows in the garden','groups',5,groupTeach,'2.OA.C.4'),c('Columns in the garden','groups',5,'Columns go down the mat. Each column holds an equal amount. Add the column amounts.','2.OA.C.4',{mode:'columns'}),
  c('Match repeated additions','groups',5,'Add the same group size for every row. Use no more than five rows and five columns.','2.OA.C.4')]},
 {grade:2,domain:'Measurement money and time',concepts:[
  c('Centimeter ribbon shop','length',30,measureTeach,'2.MD.A.1'),c('Ruler starts away from zero','offsetRuler',30,'Subtract the starting mark from the ending mark. A ruler need not start at zero.','2.MD.A.1'),
  c('Compare centimeter lengths','lengthCompare',50,measureTeach,'2.MD.A.4'),c('Choose an inch or a foot','unit',30,'Choose a small unit for a small length and a larger unit for a large length.','2.MD.A.3',{mode:'standard'}),
  c('Five-minute clock shop','clock',12,'Each number around the minute hand stands for five minutes.','2.MD.C.7',{step:5}),
  c('Dimes and nickels market','coins',100,'Add the coin values, not the number of coins. A dime is ten cents and a nickel is five.','2.MD.C.8',{mode:'small'}),
  c('Quarter and penny market','coins',100,'A quarter is twenty-five cents. A penny is one cent. Combine their values.','2.MD.C.8'),
  c('Market: count the change','change',100,'Find the cost and the amount paid. Subtract the cost to find the change.','2.MD.C.8')]},
 {grade:2,domain:'Shapes and data',concepts:[
  c('Polygons in the studio','shape',6,'Use the number of sides and corners to name a polygon.','2.G.A.1'),c('Solid-shape detective','solid',6,'Count flat faces and notice curved surfaces.','2.G.A.1'),
  c('Equal halves','shares',2,'Two equal shares of one whole are halves. Count how many shares are chosen.','2.G.A.3',{step:2}),c('Equal thirds','shares',3,'Three equal shares of one whole are thirds. Count chosen shares and all shares.','2.G.A.3',{step:3}),c('Equal fourths','shares',4,'Four equal shares of one whole are fourths. The pieces must be equal in size.','2.G.A.3',{step:4}),
  c('Rectangle rows of squares','groups',5,'A rectangle can be partitioned into equal rows and columns of squares. Count every square once.','2.G.A.2',{mode:'tiles'}),
  c('Add the survey categories','chart',20,dataTeach,'2.MD.D.10',{mode:'total'}),c('Compare survey categories','chart',20,dataTeach,'2.MD.D.10',{mode:'difference'})]},
 {grade:3,domain:'Multiplication and division',concepts:[2,3,4,5,6,7,8,9].map(f=>c(`${f}-group garden`,'groups',10,groupTeach,'3.OA.A.1;3.OA.A.2;3.OA.B.5',{factor:f,mode:'division'}))},
 {grade:3,domain:'Number and operations',concepts:[
  c('Round to tens','round',999,'Find the lower and upper multiples of ten. At the midpoint, round to the higher ten.','3.NBT.A.1',{step:10}),
  c('Round to hundreds','round',999,'Find the neighboring hundreds. Compare distances; halfway rounds up.','3.NBT.A.1',{step:100}),
  c('Add two-digit workshop amounts','arithmetic',99,arithTeach,'3.NBT.A.2',{mode:'add'}),c('Subtract two-digit workshop amounts','arithmetic',99,arithTeach,'3.NBT.A.2',{mode:'sub'}),
  c('Add three-digit workshop amounts','arithmetic',999,arithTeach,'3.NBT.A.2',{mode:'addRegroup'}),c('Subtract three-digit workshop amounts','arithmetic',999,arithTeach,'3.NBT.A.2',{mode:'subRegroup'}),
  c('Multiply a multiple of ten','tensProduct',90,'Multiply the number of tens, then convert those tens to ones.','3.NBT.A.3'),
  c('Two-step supply stories','twoStep',100,'Solve each step in order. Check whether the final amount fits the story.','3.OA.D.8')]},
 {grade:3,domain:'Fractions',concepts:[
  c('Unit-fraction kitchen','fraction',8,fractionTeach,'3.NF.A.1',{mode:'unit'}),c('Count fraction parts','fraction',8,fractionTeach,'3.NF.A.1'),
  c('Fraction trail from zero','fraction',8,fractionTeach,'3.NF.A.2',{mode:'line'}),c('Fractions equal to one','fraction',8,fractionTeach,'3.NF.A.3c',{mode:'whole'}),
  c('Equivalent-share kitchen','fraction',4,'Splitting each part into two equal pieces doubles both the numerator and denominator. The amount stays the same.','3.NF.A.3b',{mode:'equivalent'}),
  c('Compare same-sized parts','fraction',8,'With the same denominator and whole, compare how many equal parts are selected.','3.NF.A.3d',{mode:'compareD'}),
  c('Compare unit fractions','fraction',8,'For the same whole, more equal parts means smaller parts. One half is greater than one fourth.','3.NF.A.3d',{mode:'compareN'}),
  c('Fractions past one whole','fraction',8,'Keep the unit-fraction size the same as you count past one whole.','3.NF.A.2',{mode:'pastOne'})]},
 {grade:3,domain:'Measurement and geometry',concepts:[
  c('Tile an area','area',10,'Count square units inside a rectangle. Multiply rows by columns.','3.MD.C.7'),
  c('Walk a perimeter','perimeter',20,'Add every outside side. Perimeter is measured in length units.','3.MD.D.8'),
  c('Join two tiled rectangles','compositeArea',8,'Add areas of rectangles that do not overlap. Count square units, not the outside edge.','3.MD.C.7d'),
  c('Find a missing rectangle side','missingSide',10,'Use the known area and one side. Find how many equal rows make the area.','3.MD.C.7'),
  c('Minute-hand clock shop','clock',12,'Count single minute marks. Read the hour hand as well.','3.MD.A.1',{step:1}),
  c('Elapsed-time trail','elapsed',60,'Count forward from the start time in manageable chunks. Cross an hour carefully.','3.MD.A.1'),
  c('Mass in grams','measureStory',1000,measureTeach,'3.MD.A.2',{mode:'grams'}),c('Volume in liters','measureStory',20,measureTeach,'3.MD.A.2',{mode:'liters'})]},
 {grade:3,domain:'Data and patterns',concepts:[
  c('Picture graph: pairs','chart',30,dataTeach,'3.MD.B.3',{step:2}),c('Picture graph: groups of five','chart',50,dataTeach,'3.MD.B.3',{step:5}),
  c('Scaled bars: tens','chart',100,dataTeach,'3.MD.B.3',{step:10}),c('Survey totals','chart',30,dataTeach,'3.MD.B.3',{mode:'total'}),
  c('Survey comparisons','chart',30,dataTeach,'3.MD.B.3',{mode:'difference'}),c('Pattern detective: threes','sequence',100,countTeach,'3.OA.D.9',{step:3}),
  c('Pattern detective: fours','sequence',100,countTeach,'3.OA.D.9',{step:4}),c('Pattern detective: sixes','sequence',100,countTeach,'3.OA.D.9',{step:6})]},
];
const taskNames:Record<string,string[]>={
 count:['Count the set','Find one more','Find one fewer','Find a hidden part','Check a counting claim'],
 sequence:['Continue the trail','Fill the middle gap','Choose the step','Fix a broken trail','Explain the pattern'],
 place:['Build the number','Find a digit value','Write expanded form','Find a missing place','Check the block label'],
 order:['Choose the greater','Choose the smaller','Find the middle number','Order three numbers','Check a comparison'],
 clock:['Read the clock','Match the minute hand','Find the next time','Find the time before','Check a clock label'],
 groups:['Count the whole','Find a group size','Find the number of groups','Match a group equation','Check an equal-group claim'],
 fraction:['Name the amount','Locate or compare shares','Find an equivalent description','Find a missing part','Check a fraction claim'],
 default:['Solve the task','Represent the idea','Find the unknown','Fix Theo’s mistake','Explain how you know'],
};
export function expandMath(base:Skill[]):Skill[]{
 const added:Skill[]=[];
 for(const section of MATH_SECTIONS){const old=base.filter(s=>s.grade===section.grade&&s.subject==='math'&&s.domain===section.domain),needed=40-old.length;if(needed<0)throw Error('Section exceeds target');
  const candidates=section.concepts.flatMap((concept,unit)=>Array.from({length:5},(_,task)=>({concept,unit,task})));
  const chosen=Array.from({length:needed},(_,i)=>candidates[Math.floor(i*candidates.length/needed)]);
  for(const {concept,unit,task} of chosen){const id=`m${section.grade}-studio-${MATH_SECTIONS.indexOf(section)}-${unit}-${task}`,previous=added.filter(s=>s.grade===section.grade&&s.domain===section.domain).at(-1);
   added.push({id,grade:section.grade,subject:'math',domain:section.domain,title:`${concept.name}: ${(taskNames[concept.engine]||taskNames.default)[task]}`,kind:'mathStudio',p:{...concept,task,unit,standards:concept.standard.split(';'),review:'draft'},objective:`${(taskNames[concept.engine]||taskNames.default)[task]} using ${concept.name.toLowerCase()}.`,teach:concept.teach,order:base.length+added.length,prerequisite:previous?.id||old.at(-1)?.id});
  }
 }
 return added;
}

export function mathStudioQuestion(skill:Skill,seed:number,random:()=>number):Question{
 const p=skill.p,t=p.task as number,max=p.max||20,engine=p.engine;
 const int=(lo:number,hi:number)=>lo+Math.floor(random()*(hi-lo+1));const pick=<T,>(arr:readonly T[])=>arr[int(0,arr.length-1)];
 const q:Question={id:`${skill.id}:${seed}`,prompt:'',answer:'',choices:[],hint:skill.teach,explanation:''};let wrong:string[]=[];
 const set=(prompt:string,answer:string|number,explanation:string,distractors:(string|number)[]=[])=>{q.prompt=prompt;q.answer=String(answer);q.explanation=explanation;wrong=distractors.map(String);if(!wrong.length&&typeof answer==='number')wrong=[Math.max(0,answer-1),answer+1,answer+2,Math.max(0,answer-2)].map(String);};
 const claim=(statement:string,correct:boolean,explanation:string)=>set(`Theo says, “${statement}” Is Theo correct?`,correct?'Yes':'No',explanation,['Yes','No']);
 let a=int(2,Math.max(3,max-2)),b=int(1,Math.max(1,max-a));
 if(engine==='count'){
  a=int(2,max-1);q.visual={type:'counters',count:a};const removed=int(1,a-1);
  if(t===0)set('How many counters are on the mat?',a,`Touch every counter once. There are ${a}.`);
  if(t===1)set(`There are ${a} counters. Add one. How many now?`,a+1,`${a} + 1 = ${a+1}.`);
  if(t===2)set(`There are ${a} counters. Remove one. How many remain?`,a-1,`${a} − 1 = ${a-1}.`);
  if(t===3)set(`There were ${a} counters. ${removed} are covered. How many are not covered?`,a-removed,`${a} − ${removed} = ${a-removed}.`);
  if(t===4){const yes=random()>.5;claim(`The collection has ${a+(yes?0:1)} counters.`,yes,`Count once for every counter. The total is ${a}.`);}
 }else if(engine==='sequence'){
  const step=p.step||1,size=Math.abs(step),start=p.mode==='boundary'?int(1,10)*10-1:int(0,Math.max(0,Math.floor(max/size)-3))*size;
  a=step<0?start+size*3:start;const values=[a,a+step,a+step*2,a+step*3];
  if(t===0)set(`${values.slice(0,3).join(', ')}, ___. What comes next?`,values[3],`The step is ${step}. The next number is ${values[3]}.`);
  if(t===1)set(`${values[0]}, ___, ${values[2]}, ${values[3]}. What fills the gap?`,values[1],`Count ${size} ${step<0?'back':'forward'} each time.`);
  if(t===2)set(`${values.join(', ')}. What is the step?`,step,`Every next number changes by ${step}.`,[1,2,5,10,-1,-5,-10].filter(x=>x!==step));
  if(t===3)set(`${values[0]}, ${values[1]}, ${values[2]+1}, ${values[3]}. Replace the wrong third number.`,values[2],`The third number should be ${values[1]} ${step<0?'−':'+'} ${size} = ${values[2]}.`);
  if(t===4)set(`Which rule matches ${values.join(', ')}?`,`${step<0?'Subtract':'Add'} ${size} each time.`,`The distance between neighbors is always ${size}.`,[`Add ${size+1} each time.`,`Subtract ${size+1} each time.`,`${step<0?'Add':'Subtract'} ${size} each time.`]);
 }else if(engine==='place'){
  a=max>99?int(100,999):int(10,max);if(p.mode==='zero')a=max>99?int(1,9)*100+int(1,9):int(1,9)*10;
  const h=Math.floor(a/100),ten=Math.floor(a/10)%10,one=a%10,place=pick(max>99?['hundreds','tens','ones']:['tens','ones']);const value=place==='hundreds'?h*100:place==='tens'?ten*10:one;
  const expanded=[h?`${h*100}`:'',ten?`${ten*10}`:'',one?`${one}`:''].filter(Boolean).join(' + ')||'0';q.visual={type:'blocks',number:a};
  if(t===0)set(`Build ${h?`${h} hundreds, `:''}${ten} tens and ${one} ones. What number?`,a,`The places together make ${a}.`);
  if(t===1)set(`In ${a}, what is the value of the ${place} digit?`,value,`The ${place} digit represents ${value}.`,[a,value+10,value+1,place==='tens'?ten:h]);
  if(t===2)set(`Which expanded form equals ${a}?`,expanded,`${expanded} = ${a}.`,[`${a} + 10`,`${Math.floor(a/10)} + ${one}`,`${a} + 1`]);
  if(t===3)set(`${h?`${h*100} + `:''}___ + ${one} = ${a}. What is the tens value?`,ten*10,`${ten} tens are ${ten*10} ones.`);
  if(t===4){const yes=random()>.5;claim(`${a} has ${ten+(yes?0:1)} tens in its tens place.`,yes,`${a} has ${h} hundreds, ${ten} tens and ${one} ones.`);}
 }else if(engine==='order'){
  a=int(max===19?10:1,max-6);b=a+int(1,3);const third=b+int(1,3),values=[a,b,third];
  if(t===0)set(`Which is greatest: ${values.join(', ')}?`,third,`Compare the greatest place first. ${third} is greatest.`,values);
  if(t===1)set(`Which is smallest: ${values.join(', ')}?`,a,`${a} is less than both other numbers.`,values);
  if(t===2)set(`Which number is between ${a} and ${third}?`,b,`${a} < ${b} < ${third}.`,[a,third,third+1]);
  if(t===3)set('Choose the numbers from least to greatest.',values.join(', '),`The order is ${values.join(', ')}.`,[[third,b,a],[b,a,third],[a,third,b]].map(x=>x.join(', ')));
  if(t===4){const yes=random()>.5;claim(`${yes?a:third} is smaller than ${b}.`,yes,`${a} < ${b} < ${third}.`);}
 }else if(engine==='exchange'||engine==='shift'){
  const step=p.step||10;
  if(engine==='exchange'){const amount=step===100?int(1,8)*100:int(1,8)*10;const small=amount/(step===100?10:1),large=amount/step,smallName=step===100?'tens':'ones',largeName=step===100?'hundreds':'tens';
   if(t===0)set(`Trade ${small} ${smallName} for ${largeName}. How many ${largeName}?`,large,`${small} ${smallName} = ${large} ${largeName}.`);
   if(t===1)set(`Which amount equals ${large} ${largeName}?`,`${small} ${smallName}`,`Both name ${amount} ones.`,[`${small+1} ${smallName}`,`${large} ${smallName}`,`${small-1} ${smallName}`]);
   if(t===2)set(`${large} ${largeName} = ___ ${smallName}. What is missing?`,small,`Each ${largeName.slice(0,-1)} is ten ${smallName}.`);
   if(t===3)set(`Theo trades ${small} ${smallName} for ${large+1} ${largeName}. How many ${largeName} should Theo get?`,large,'A fair exchange keeps the total unchanged.');
   if(t===4)claim(`Trading changes the units but keeps the amount ${amount}.`,true,'Ten smaller units equal one of the next larger unit.');
  }else{const distance=Math.abs(step);a=int(step<0?distance+1:1,Math.min(max,skill.grade===1?99-distance:999-distance));const end=a+step;
   if(t===0)set(`What is ${distance} ${step>0?'more':'less'} than ${a}?`,end,`${a} ${step>0?'+':'−'} ${distance} = ${end}.`);
   if(t===1)set(`Which equation finds ${distance} ${step>0?'more':'less'} than ${a}?`,`${a} ${step>0?'+':'−'} ${distance} = ${end}`,skill.teach,[`${a} + 1 = ${a+1}`,`${a} − 1 = ${a-1}`,`${a} ${step>0?'−':'+'} ${distance} = ${a-step}`]);
   if(t===2)set(`___ ${step>0?'+':'−'} ${distance} = ${end}. What was the start?`,a,`Undo the change to find ${a}.`);
   if(t===3)set(`Theo says the new number is ${end+1}. Correct it: ${a} ${step>0?'+':'−'} ${distance} = ?`,end,`The correct result is ${end}.`);
   if(t===4)set(`When ${distance} is ${step>0?'added to':'subtracted from'} ${a}, which place stays the same?`,'Ones',`Changing a whole ten or hundred leaves the ones digit unchanged.`,['Every place changes','No place stays the same']);
  }
 }else if(['arithmetic','three','twoStep','measureStory'].includes(engine)){
  let sum:number,expr:string,op=p.mode?.startsWith('sub')?'−':'+';const unit=engine==='measureStory'?p.mode:'supplies';
  if(p.mode?.includes('Regroup')){a=int(3,5)*10+int(op==='−'?0:6,op==='−'?3:9);b=int(1,2)*10+int(op==='−'?6:4,op==='−'?9:8);if(max>99){a+=int(2,5)*100;b+=int(1,2)*100;}}
  if(op==='−'){if(a<b)[a,b]=[b,a];sum=a-b;}else sum=a+b;
  expr=`${a} ${op} ${b}`;
  const third=int(1,Math.max(1,Math.min(15,sum-1)));
  if(engine==='three'){sum=a+b+third;if(sum>max){a=Math.floor(max/4);b=int(1,a);sum=a+b+third;}expr=`${a} + ${b} + ${third}`;}
  if(engine==='twoStep'){sum=a+b-third;expr=`${a} + ${b} − ${third}`;}
  const context=engine==='twoStep'?`Theo starts with ${a} supplies, gets ${b} more, then uses ${third}.`:engine==='three'?`Three shelves have ${a}, ${b} and ${third} supplies.`:engine==='measureStory'?`The first container holds ${a} ${unit}; the second holds ${b} ${unit}.`:`Theo ${op==='+'?'joins':'removes'} ${b} supplies ${op==='+'?'with':'from'} ${a} supplies.`;
  if(engine==='arithmetic'&&t!==2)q.visual=op==='+'?{type:'blocks',number:a,other:b}:{type:'blocks',number:a,remove:b};
  if(t===0)set(`${context} How many ${unit} ${op==='−'||engine==='twoStep'?'remain':'altogether'}?`,sum,`${expr} = ${sum}${engine==='measureStory'?' '+unit:''}.`);
  if(t===1)set(`${context} Which equation solves it?`,`${expr} = ${sum}`,`Represent every change in order. ${expr} = ${sum}.`,[`${a} + ${b+1} = ${a+b+1}`,`${a} − ${b} = ${a-b}`,`${a} + ${b} + ${third+1} = ${a+b+third+1}`]);
  if(t===2){const other=engine==='three'?sum-b-third:engine==='twoStep'?sum-b+third:op==='+'?sum-b:sum+b;set(`___ ${op} ${b}${engine==='three'?' + '+third:engine==='twoStep'?' − '+third:''} = ${sum}. What is missing?`,other,`Use the result and undo each change. The missing amount is ${other}.`);}
  if(t===3)set(`Theo writes ${expr} = ${sum+1}. What should the answer be?`,sum,`Work through the quantities: ${expr} = ${sum}.`);
  if(t===4){const yes=random()>.5;claim(`${expr} = ${sum+(yes?0:2)}.`,yes,`${expr} = ${sum}. Check each operation.`);}
  if(engine==='arithmetic'){
   const onesA=a%10,onesB=b%10,tensA=Math.floor(a/10)%10,tensB=Math.floor(b/10)%10;
   if(op==='+'&&onesA+onesB>=10){const ones=onesA+onesB;q.hint='Join the ones. Trade ten ones for one ten, then join the tens. Keep any hundreds.';q.explanation+=` Join ${onesA} ones and ${onesB} ones: ${ones} ones. Trade ten of them for one ten. Keep ${ones-10} ${ones-10===1?'one':'ones'}. Add the new ten to the other tens, then combine any hundreds. The total is ${sum}.`;}
   if(op==='−'&&onesA<onesB){q.hint='There are too few ones to take away the ones part. Exchange one ten for ten ones, then subtract by place.';q.explanation+=` Exchange one ten from ${a}. There are now ${onesA+10} ones. Subtract ${onesB} ones to leave ${onesA+10-onesB} ${onesA+10-onesB===1?'one':'ones'}. The tens also lose the one that was exchanged. Finish subtracting the tens and hundreds: ${sum} remains.`;}
   if(op==='+'&&onesA+onesB<10)q.explanation+=` Join the ones first: ${onesA} + ${onesB} = ${onesA+onesB}. Then join ${tensA} tens and ${tensB} tens and keep any hundreds.`;
  }
 }else if(engine==='groups'||engine==='tensProduct'){
  const rows=engine==='tensProduct'?int(1,9)*10:p.factor||int(2,max),cols=int(2,engine==='tensProduct'?9:max),total=rows*cols;q.visual=engine==='tensProduct'?undefined:{type:'array',rows,cols,unitSquares:p.mode==='tiles'};
  if(t===0)set(`${rows} groups have ${cols} objects each. How many altogether?`,total,`${rows} × ${cols} = ${total}.`);
  if(t===1)set(`${total} objects are shared equally in ${rows} groups. How many per group?`,cols,`${total} ÷ ${rows} = ${cols}.`);
  if(t===2)set(`${total} objects, ${cols} per group. How many groups?`,rows,`${total} ÷ ${cols} = ${rows}.`);
  if(t===3){const repeated=Array.from({length:Math.min(rows,10)},()=>cols).join(' + ');set(`Which multiplication equation represents ${rows} groups of ${cols}?`,`${rows} × ${cols} = ${total}`,engine==='tensProduct'?skill.teach:`${repeated} = ${total}.`,[`${rows} + ${cols} = ${rows+cols}`,`${rows} × ${cols+1} = ${rows*(cols+1)}`,`${total} − ${rows} = ${total-rows}`]);}
  if(t===4){const yes=random()>.5;claim(`${rows} groups of ${cols} have ${total+(yes?0:cols)} objects.`,yes,`${rows} × ${cols} = ${total}. Every group has ${cols}.`);}
  if(skill.grade===2){const groups=p.mode==='columns'?cols:rows,size=p.mode==='columns'?rows:cols,label=p.mode==='columns'?'columns':'rows',addition=Array.from({length:groups},()=>size).join(' + '),explanation=`${groups} ${label} of ${size}: ${addition} = ${total}.`;
   if(t===0)set(`Count the equal ${label}. ${groups} ${label} have ${size} objects each. How many altogether?`,total,explanation);
   if(t===1)set(`The mat has ${groups} equal ${label} and ${total} counters. Count one ${label.slice(0,-1)}. How many in it?`,size,explanation);
   if(t===2)set(`There are ${total} counters, ${size} in each ${label.slice(0,-1)}. Count the ${label}. How many?`,groups,explanation);
   if(t===3)set(`Which repeated addition counts all the counters by ${label}?`,`${addition} = ${total}`,explanation,[`${groups} + ${size} = ${groups+size}`,`${addition} + 1 = ${total+1}`]);
   if(t===4){const yes=random()>.5;claim(`${groups} equal ${label} of ${size} contain ${total+(yes?0:size)} counters.`,yes,explanation);}
  }
 }else if(engine==='pairs'){
  a=int(2,20);const pairs=Math.floor(a/2),left=a%2;q.visual={type:'counters',count:a};
  if(t===0)set(`Pair ${a} counters. Is the total odd or even?`,left?'Odd':'Even',`${pairs} pairs leave ${left} counter.`,['Odd','Even']);
  if(t===1)set(`How many complete pairs can you make from ${a} counters?`,pairs,`Two go in each pair. ${pairs} complete pairs use ${pairs*2}.`);
  if(t===2)set(`Pair ${a} counters. How many remain unpaired?`,left,`${pairs*2} are paired. ${left} remains.`);
  if(t===3)set(`Theo pairs ${a} counters and says ${left?0:1} remain. How many actually remain?`,left,`The remainder is ${left}.`);
  if(t===4)set(`Which equation describes ${a} counters paired as far as possible?`,`${pairs} + ${pairs}${left?' + 1':''} = ${a}`,`Two equal groups${left?' and one extra':''} make ${a}.`,[`${pairs} + ${pairs} + 2 = ${pairs*2+2}`,`${pairs+1} + ${pairs+1} = ${pairs*2+2}`]);
 }else if(['length','offsetRuler','lengthCompare','lengthOrder'].includes(engine)){
  a=int(2,max-3);b=int(1,3);const end=a+b,start=engine==='offsetRuler'?b:0,len=engine==='offsetRuler'?a:end;q.visual={type:'ruler',length:len,start};
  if(engine==='lengthOrder'){const lengths=[a,a+b,a+b+1];if(t===0)set(`Ribbon lengths are ${lengths.join(', ')} units. Which is shortest?`,a,'Compare using the same unit.',lengths);if(t===1)set(`Ribbon lengths are ${lengths.join(', ')} units. Which is longest?`,lengths[2],'The largest number measures the longest ribbon.',lengths);if(t===2)set(`Which length is between ${a} and ${lengths[2]} units?`,lengths[1],'The middle length is longer than one and shorter than the other.',lengths);if(t===3)set('Put the ribbon lengths from shortest to longest.',lengths.join(', '),'Use the same unit for every ribbon.',[[lengths[2],a,lengths[1]],[lengths[1],a,lengths[2]]].map(x=>x.join(', ')));if(t===4)claim(`${lengths[2]} units is shorter than ${a} units.`,false,`${lengths[2]} units is longer than ${a} units.`);
  }else if(engine==='lengthCompare'){if(t===0)set(`One ribbon is ${a} units; another is ${end} units. How much longer is the second?`,b,`${end} − ${a} = ${b} units.`);if(t===1)set(`Which equation compares ${a} and ${end} units?`,`${end} − ${a} = ${b}`,measureTeach,[`${end} + ${a} = ${end+a}`,`${a} + ${b+1} = ${end+1}`]);if(t===2)set(`A ${end}-unit ribbon is ${b} units longer than another. How long is the other?`,a,`${end} − ${b} = ${a}.`);if(t===3)set(`Theo says the difference between ${a} and ${end} is ${b+1}. Correct the difference.`,b,`${end} − ${a} = ${b}.`);if(t===4)claim(`The longer ribbon is ${end} units.`,true,`${end} > ${a}.`);
  }else{if(t===0)set(`The strip starts at ${start} and ends at ${start+len}. How long is it?`,len,`${start+len} − ${start} = ${len} units.`);if(t===1)set(`Which equation measures a strip from ${start} to ${start+len}?`,`${start+len} − ${start} = ${len}`,measureTeach,[`${start+len} + ${start} = ${len+2*start}`,`${len} + 1 = ${len+1}`]);if(t===2)set(`A strip is ${len} units long and begins at ${start}. Which mark ends it?`,start+len,`${start} + ${len} = ${start+len}.`);if(t===3)set(`Theo labels the strip from ${start} to ${start+len} as ${len+1} units. Correct the label.`,len,`Find the difference between end and start.`);if(t===4)set('Which measuring method is fair?','Equal units with no gaps or overlaps.',measureTeach,['Units of different sizes.','Units with gaps between them.','Units piled on each other.']);}
 }else if(engine==='unit'){
  const standard=p.mode==='standard',small=pick(['a pencil','a key','a crayon']),large=pick(['a classroom','a playground','a long hallway']);
  if(!standard){const prompts=['Which units can measure a straight ribbon fairly?','How should measuring cubes be placed?','What must you check before counting units?','Theo leaves gaps between cubes. How should Theo fix the measurement?','Why should every measuring unit be the same length?'];const answers=['Same-sized cubes.','End to end, touching.','Every unit has the same length.','Move the cubes so they touch.','So each count represents the same length.'];set(prompts[t],answers[t],skill.teach,['Use different-sized cubes.','Leave spaces between units.','Overlap all the units.']);}
  else{const useSmall=t%2===0;set(`Which unit is more useful to measure ${useSmall?small:large}?`,useSmall?'Inches':'Feet',`Use ${useSmall?'inches for a small object':'feet for a long distance'}.`,[useSmall?'Feet':'Inches','Minutes','Cents']);}
 }else if(engine==='clock'||engine==='elapsed'){
  const step=p.step||5,h=int(1,11),minute=step===60?0:step===30?30:int(0,Math.floor(59/step))*step;
  const fmt=(n:number)=>`${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')}`,start=h*60+minute,delta=engine==='elapsed'?pick([5,10,15,20,25,30,45,60]):step===60?60:step===30?30:5;
  q.visual={type:'clock',hour:h,minute};const time=fmt(start),end=fmt(start+delta);
  if(engine==='elapsed'){if(t===0)set(`Start at ${time}. Finish at ${end}. How many minutes passed?`,delta,`Count forward ${delta} minutes from ${time} to ${end}.`);if(t===1)set(`Start at ${time}. Work for ${delta} minutes. When do you finish?`,end,`Add ${delta} minutes. Finish at ${end}.`,[time,fmt(start+delta+5),fmt(start+delta-5)]);if(t===2)set(`Finish at ${end} after ${delta} minutes. When did you begin?`,time,`Count back ${delta} minutes. Start at ${time}.`,[end,fmt(start+5),fmt(start-5)]);if(t===3)set(`Theo says ${delta+5} minutes pass from ${time} to ${end}. Correct the elapsed minutes.`,delta,`The interval is ${delta} minutes.`);if(t===4)set(`Which plan finds the time after ${delta} minutes?`,'Count forward from the start time.','Move forward on a timeline; cross an hour at sixty minutes.',['Subtract the finish time from zero.','Add the clock labels as whole numbers.']);}
  else{if(t===0)set('What time is shown on the clock?',time,`The hour is ${h} and the minute is ${minute}.`,[fmt(start+60),fmt(start+delta),fmt(start+30)]);if(t===1)set(`At ${time}, how many minutes past the hour is the minute hand?`,minute,`The minute hand is at ${minute} minutes.`);if(t===2)set(`What time is ${delta} minutes after ${time}?`,end,`Count forward ${delta} minutes to ${end}.`,[time,fmt(start+60),fmt(start+delta+5)]);if(t===3)set(`What time is ${delta} minutes before ${time}?`,fmt(start-delta),`Count back ${delta} minutes.`,[time,end,fmt(start-delta-5)]);if(t===4){const yes=random()>.5;claim(`The clock reads ${yes?time:fmt(start+60)}.`,yes,`Read both hands: ${time}.`);}}
 }else if(engine==='coins'||engine==='change'){
  const values=p.mode==='small'?[5,10]:[1,5,10,25],coins=Array.from({length:int(2,4)},()=>pick(values)),cost=coins.reduce((x,y)=>x+y,0),paid=cost+pick([5,10,20]);q.visual={type:'coins',coins};
  if(engine==='change'){if(t===0)set(`A kit costs ${cost} cents. You pay ${paid} cents. How much change?`,paid-cost,`${paid} − ${cost} = ${paid-cost} cents.`);if(t===1)set(`Which equation finds change from ${paid} cents for a ${cost}-cent kit?`,`${paid} − ${cost} = ${paid-cost}`,skill.teach,[`${paid} + ${cost} = ${paid+cost}`,`${cost} + 1 = ${cost+1}`]);if(t===2)set(`You get ${paid-cost} cents change after buying a ${cost}-cent kit. How much did you pay?`,paid,`${cost} + ${paid-cost} = ${paid}.`);if(t===3)set(`Theo says the change is ${paid-cost+1} cents. Correct the change from ${paid} for a ${cost}-cent kit.`,paid-cost,'Subtract cost from the amount paid.');if(t===4)claim(`The cost and change add up to the amount paid.`,true,`${cost} + ${paid-cost} = ${paid}.`);}
  else{if(t===0)set('What is the total value of the coins in cents?',cost,`${coins.join(' + ')} = ${cost} cents.`);if(t===1)set('Which addition counts the coin values?',coins.join(' + '),`Each coin has its own value. ${coins.join(' + ')} = ${cost}.`,[coins.map(()=>1).join(' + '),coins.map(x=>x+1).join(' + ')]);if(t===2)set(`The coins total ${cost} cents. Remove a ${coins[0]}-cent coin. How many cents remain?`,cost-coins[0],`${cost} − ${coins[0]} = ${cost-coins[0]}.`);if(t===3)set(`Theo says ${coins.length} coins must be worth ${coins.length} cents. What are these coins actually worth?`,cost,`Add values: ${coins.join(' + ')} = ${cost}.`);if(t===4)set('Why do we add coin values instead of counting coins?','Different coins can have different values.',skill.teach,['Every coin is worth one cent.','Bigger piles always have less value.']);}
 }else if(['shape','solid','compose'].includes(engine)){
  const shapes=[['Triangle',3],['Square',4],['Pentagon',5],['Hexagon',6]] as const;const [name,sides]=pick(shapes);
  if(engine==='shape'){q.visual={type:'shape',name,sides};if(t===0)set(`How many ${p.mode==='corners'?'corners':'sides'} does this ${name.toLowerCase()} have?`,sides,`A ${name.toLowerCase()} has ${sides} sides and ${sides} corners.`);if(t===1)set(`Which shape has ${sides} sides${sides===4?' and four equal sides':''}?`,name,`The ${name.toLowerCase()} fits those attributes.`,shapes.map(x=>x[0]));if(t===2)set(`A ${name.toLowerCase()} has ${sides} sides. How many corners?`,sides,'Each meeting of two sides makes one corner.');if(t===3)set(`Theo says this ${name.toLowerCase()} has ${sides+1} sides. Correct the count.`,sides,`Count ${sides} straight sides.`);if(t===4)set(`What stays true when a ${name.toLowerCase()} is turned?`,`It still has ${sides} sides.`, 'Turning a shape does not change its sides or corners.',['It gains a side.','It becomes a circle.','Its corners disappear.']);}
  else if(engine==='solid'){const [solid,attribute,wrongAttribute]=pick([['Cube','Six square faces.','One curved surface.'],['Sphere','One curved surface and no flat faces.','Six square faces.'],['Cylinder','Two circular flat faces and a curved surface.','Only straight edges and corners.']]);const prompts=[`Which description fits a ${solid.toLowerCase()}?`,`Which solid has this attribute: ${attribute}`,`Which attribute would help you identify a ${solid.toLowerCase()}?`,`Theo labels a ${solid.toLowerCase()}: ${wrongAttribute} Choose the correction.`,`Which property stays the same when you turn a ${solid.toLowerCase()}?`];set(prompts[t],t===1?solid:attribute,`${solid}: ${attribute}`,t===1?['Cube','Sphere','Cylinder'].filter(x=>x!==solid):[wrongAttribute,'Five triangular faces.','No surface at all.']);}
  else{const condition='Each matching right triangle has two equal short sides.',prompts=[`${condition} They meet along their long sides. Which shape can they make?`,`${condition} Which pieces make a square when joined along their long sides?`,`${condition} One piece is in place. Which piece completes the square?`,`${condition} Theo joins them into a square. How many triangular pieces?`,`${condition} Why can they make a square?`];const answers=['Square','Two matching right triangles.','The other matching right triangle.',2,'Their outside edges form four equal sides and four right angles.'];set(prompts[t],answers[t],skill.teach,t===3?[1,3,4]:['Sphere','Circle','One curved strip.']);}
 }else if(engine==='shares'||engine==='fraction'){
  const d=engine==='shares'?p.step:pick([2,3,4,6,8].filter(x=>x<=max)),n=p.mode==='unit'||p.mode==='compareN'?1:p.mode==='whole'?d:p.mode==='pastOne'?d+int(1,d-1):int(1,d-1);const f=`${n}/${d}`;
  q.visual={type:'fraction',parts:d,filled:n,line:p.mode==='line'||p.mode==='pastOne',wholes:n>d?2:1};
  if(p.mode==='equivalent'){const eq=`${n*2}/${d*2}`;if(t===0||t===1)set(`Each part of ${f} is split into two. Which fraction names the same amount?`,eq,`${f} = ${eq}.`,[`${n}/${d*2}`,`${n*2}/${d}`,`${n+1}/${d+1}`]);if(t===2)set(`Which rule creates an equivalent fraction?`,'Multiply numerator and denominator by the same number.',skill.teach,['Multiply only the numerator.','Add one to each number.']);if(t===3)set(`${f} = ___/${d*2}. What numerator is missing?`,n*2,`Double ${n} as well as ${d}.`);if(t===4)claim(`${f} equals ${n}/${d*2}.`,false,`Splitting pieces also changes the count of selected pieces. ${f} = ${eq}.`);}
  else if(p.mode==='compareD'||p.mode==='compareN'){const otherD=p.mode==='compareN'?pick([2,3,4,6,8].filter(x=>x!==d)):d,otherN=p.mode==='compareN'?1:n===d-1?n-1:n+1,other=`${otherN}/${otherD}`,greater=n/d>otherN/otherD?f:other,less=greater===f?other:f;
   if(t===0)set(`Same-sized wholes: which is greater, ${f} or ${other}?`,greater,skill.teach,[less,'They are equal.']);if(t===1)set(`Same-sized wholes: which is smaller, ${f} or ${other}?`,less,skill.teach,[greater,'They are equal.']);if(t===2)set(`Why is ${greater} greater than ${less}?`,p.mode==='compareN'?'Its single part is larger.':'It counts more of the same-sized parts.',skill.teach,['Its parts are unequal.','The whole changed size.']);if(t===3)set(`Compare ${f} and ${other} using same-sized wholes. Theo chooses ${less} as the greater fraction. What is the correction?`,greater,skill.teach,[less,'They are equal.']);if(t===4)claim(`${greater} is greater than ${less} for the same-sized whole.`,true,skill.teach);
  }else{if(t===0)set(p.mode==='pastOne'?`There are ${n} one-${d===2?'half':d===3?'third':d===4?'fourth':d===6?'sixth':'eighth'} parts. What fraction?`:'What fraction of the whole is selected?',f,`${n} equal parts of size 1/${d} make ${f}.`,[`${d}/${n}`,`${n}/${d+1}`,`${n+1}/${d}`]);if(t===1)set(`${f} counts how many equal parts?`,n,`The numerator ${n} counts the selected parts.`);if(t===2)set(`In ${f}, how many equal parts make one whole?`,d,`The denominator ${d} describes the partition of one whole.`);if(t===3)set(`${f} = ___ parts of size 1/${d}. What is missing?`,n,`Count ${n} unit fractions.`);if(t===4){const yes=random()>.5;claim(`${f} has ${n+(yes?0:1)} selected parts.`,yes,`${f} counts ${n} parts of size 1/${d}.`);}}
  if(skill.grade<3){const names:Record<number,string>={2:'half',3:'third',4:'fourth'},numbers=['Zero','One','Two','Three','Four'],label=(amount:number,parts:number)=>`${numbers[amount]} ${names[parts]}${amount===1?'':parts===2?'ves':'s'}`.replace('halfves','halves');q.visual.simpleShare=true;
   if(t===0)set('The whole is divided into equal shares. What do we call the selected shares?',label(n,d),`There are ${d} equal shares. ${label(n,d)} ${n===1?'is':'are'} selected.`,[label(n,d===2?4:2),label(n+1,d)]);
   if(t===1)set('How many equal shares are selected?',n,`${n} of the ${d} equal shares are selected.`);
   if(t===2)set('How many equal shares make this whole?',d,`${d} equal shares make one whole.`);
   if(t===3)set(`There are ${d} equal shares. ${d-n} are not selected. How many are selected?`,n,`${d} − ${d-n} = ${n} selected shares.`);
   if(t===4){const yes=random()>.5;claim(`There are ${n+(yes?0:1)} selected shares.`,yes,`Count ${n} selected shares out of ${d} equal shares.`);}
  }
 }else if(['area','perimeter','compositeArea','missingSide'].includes(engine)){
  a=int(2,max);b=int(2,max);const area=a*b,perimeter=2*(a+b),extra=int(1,4),total=area+extra*b;
  q.visual=engine==='perimeter'?{type:'rectangle',length:a,width:b}:engine==='compositeArea'?undefined:{type:'array',rows:a,cols:b,unitSquares:true};
  const value=engine==='perimeter'?perimeter:engine==='compositeArea'?total:engine==='missingSide'?a:area;
  const context=engine==='compositeArea'?`Two nonoverlapping rectangles have areas ${area} and ${extra*b} square units.`:engine==='missingSide'?`A rectangle has area ${area} square units and one side ${b} units.`:`A rectangle has sides ${a} and ${b} units.`;
  const formula=engine==='perimeter'?`${a} + ${b} + ${a} + ${b}`:engine==='compositeArea'?`${area} + ${extra*b}`:engine==='missingSide'?`${area} ÷ ${b}`:`${a} × ${b}`;
  if(t===0)set(`${context} Find ${engine==='perimeter'?'the perimeter':engine==='missingSide'?'the other side':'the area'}.`,value,`${formula} = ${value}.`);
  if(t===1){const alternatives=engine==='perimeter'?[`${a} + ${b}`,`${a} + ${b} + ${a}`,`${a} + ${b} + ${a} + ${b+1}`]:engine==='missingSide'?[`${area} + ${b}`,`${area} ÷ ${b} + 1`,`${area} ÷ ${b} − 1`]:engine==='compositeArea'?[`${area} + ${extra*b+1}`,`${area} + ${extra*b} + 2`,`${area} + ${extra*b} − 1`]:[`${a} × ${b+1}`,`${a+1} × ${b}`,`${a} × ${b} + 1`];set(`${context} Which expression finds ${engine==='perimeter'?'perimeter':engine==='missingSide'?'the missing side':'area'}?`,formula,skill.teach,alternatives);}
  if(t===2)set(`${context} ${formula} = ___. Fill the blank.`,value,`${formula} = ${value}.`);
  if(t===3)set(`${context} Theo gives ${value+1}. Correct the answer.`,value,`${formula} = ${value}.`);
  if(t===4)set(`Which unit fits ${engine==='perimeter'?'perimeter':engine==='missingSide'?'a side length':'area'}?`,engine==='perimeter'||engine==='missingSide'?'Length units':'Square units',skill.teach,['Length units','Square units','Minutes','Cents']);
 }else if(engine==='round'){
  const step=p.step||10;a=int(1,max);const lo=Math.floor(a/step)*step,hi=lo+step,result=a-lo<step/2?lo:hi;
  if(t===0)set(`Round ${a} to the nearest ${step===10?'ten':'hundred'}.`,result,`${a} lies between ${lo} and ${hi}. It rounds to ${result}.`,[lo,hi,result+step,Math.max(0,result-step)]);
  if(t===1)set(`Which two multiples of ${step} surround ${a}?`,`${lo} and ${hi}`,`They bracket ${a}.`,[`${lo-step} and ${lo}`,`${hi} and ${hi+step}`]);
  if(t===2)set(`The midpoint between ${lo} and ${hi} is ___.`,lo+step/2,`Half of ${step} is ${step/2}.`);
  if(t===3)set(`Theo rounds ${a} to ${result===lo?hi:lo}. Correct the rounded number.`,result,`Compare distances to ${lo} and ${hi}.`,[lo,hi,result+step]);
  if(t===4)set(`At the exact midpoint ${lo+step/2}, which multiple of ${step} do we choose?`,hi,'At the midpoint, round to the higher multiple.',[lo,hi+step,Math.max(0,lo-step)]);
 }else if(engine==='chart'){
  const scale=p.step||1,categoryMax=skill.grade===1?Math.min(max,6):max,values=Array.from({length:3},()=>int(1,Math.floor(categoryMax/scale))*scale),[blue,gold,coral]=values,total=blue+gold+coral,diff=Math.abs(blue-gold);q.visual={type:'chart',values,labels:['Blue','Gold','Coral'],scale};
  if(t===0)set(p.mode==='total'?'How many votes altogether?':p.mode==='difference'?'What is the difference between Blue and Gold?':`The key says each symbol is ${scale} votes. Blue has ${blue/scale} symbols. How many Blue votes?`,p.mode==='total'?total:p.mode==='difference'?diff:blue,p.mode==='total'?`${values.join(' + ')} = ${total}.`:p.mode==='difference'?`${Math.max(blue,gold)} − ${Math.min(blue,gold)} = ${diff}.`:`${blue/scale} × ${scale} = ${blue}.`);
  if(t===1)set(`How many votes do Blue and Gold have together?`,blue+gold,`${blue} + ${gold} = ${blue+gold}.`);
  if(t===2)set(`The total is ${total} votes. Blue has ${blue}, Gold has ${gold}. How many Coral votes?`,coral,`${total} − ${blue} − ${gold} = ${coral}.`);
  if(t===3)set(`Theo says the difference between Blue and Gold is ${diff+1}. Correct it.`,diff,`${Math.max(blue,gold)} − ${Math.min(blue,gold)} = ${diff}.`);
  if(t===4)set(`Which equation counts all the votes?`,`${blue} + ${gold} + ${coral} = ${total}`,dataTeach,[`${blue} + ${gold} = ${blue+gold}`,`${total} + ${coral} = ${total+coral}`]);
 }
 if(!q.prompt||!q.answer)throw Error(`Missing math task ${engine}/${t}`);
 const unique=[...new Set([q.answer,...wrong])];q.choices=unique.slice(0,4);if(q.choices.length<2)throw Error(`No distractor ${skill.id}`);
 for(let i=q.choices.length-1;i>0;i--){const j=int(0,i);[q.choices[i],q.choices[j]]=[q.choices[j],q.choices[i]];}
 return q;
}
