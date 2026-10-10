import type {Question,Skill} from './curriculum';
const activities:[string,string,string][]=[
 ['Count on one','on1','Start at the first number. Count one more.'],
 ['Count on two','on2','Keep the first number in mind. Count two more.'],
 ['Count on three','on3','Count on three steps from the first number.'],
 ['Count back one','back1','Start at the whole. Count back one.'],
 ['Count back two','back2','Count back two steps from the whole.'],
 ['Count back three','back3','Count back three steps from the whole.'],
 ['Double a number','double','Two equal parts make a double.'],
 ['Use a near double','near','Use a double, then add one more.'],
 ['Add zero','zeroAdd','Adding zero leaves the amount unchanged.'],
 ['Take away zero','zeroSub','Taking away zero leaves the amount unchanged.'],
 ['Take away the whole','whole','Taking away the whole leaves zero.'],
 ['Change the order of addition','turn','Changing the order of two parts does not change their sum.'],
 ['Find a subtraction partner','inverse','The same whole and parts make related addition and subtraction facts.'],
 ['Find a fact family','family','Look for the same whole and the same two parts.'],
 ['Missing first addend','first','Subtract the known part from the whole.'],
 ['Missing second addend','second','The missing part completes the whole.'],
 ['Missing amount taken away','removed','Compare the starting amount and what is left.'],
 ['Missing starting amount','start','Join what is left and what was taken away.'],
 ['Check an addition equation','trueAdd','Both sides of an equal sign must name the same amount.'],
 ['Check a subtraction equation','trueSub','Work out the left side before you compare it with the right side.'],
 ['Fix Theo’s addition','fixAdd','Find the sum yourself, then replace the mistaken answer.'],
 ['Fix Theo’s subtraction','fixSub','Count what remains and correct Theo’s answer.'],
 ['Balance two additions','balance','The two sides must have equal totals.'],
 ['Choose the larger total','larger','Find both totals before comparing them.'],
 ['Join three small parts','three','Join two parts, then add the third part.'],
 ['Make ten, then add','bridge','Split the second part. Use enough to make ten, then add the rest.'],
 ['Picnic: how many joined?','joinChange','The new children and the children already there make the final group.'],
 ['Workshop: how many were used?','leaveChange','The starting parts minus the parts left tells how many were used.'],
 ['Garden: find the smaller group','smaller','Subtract the difference from the larger group.'],
 ['Choose a story equation','storyEquation','Match what happened in the story to addition or subtraction.'],
];
export const MATH_DEPTH:Skill[]=activities.map(([title,mode,teach],i)=>({id:`m1-depth-${i+1}`,grade:1,subject:'math',domain:'Addition and subtraction',title,kind:'mathDepth',p:{mode,max:20},objective:teach,teach,order:181+i,prerequisite:i?`m1-depth-${i}`:'m1-6'}));
export function depthQuestion(skill:Skill,seed:number,random:()=>number):Question{
 const int=(a:number,b:number)=>a+Math.floor(random()*(b-a+1));let a=int(2,9),b=int(1,9),total=a+b;
 const q:Question={id:`${skill.id}:${seed}`,prompt:'',answer:'',choices:[],hint:skill.teach,explanation:''};let variants:string[]=[];
 const num=(n:number)=>{q.answer=String(n);variants=[String(Math.max(0,n-1)),String(n+1),String(n+2),String(Math.max(0,n-2))];};
 const m=skill.p.mode;
 if(m.startsWith('on')){b=Number(m.slice(2));q.prompt=`Start at ${a}. Count on ${b}. Where do you land?`;num(a+b);q.explanation=`${a} + ${b} = ${a+b}.`;}
 else if(m.startsWith('back')){b=Number(m.slice(4));a=int(b,15);q.prompt=`Start at ${a}. Count back ${b}. Where do you land?`;num(a-b);q.explanation=`${a} − ${b} = ${a-b}.`;}
 else if(m==='double'||m==='near'){b=m==='near'?a+1:a;q.prompt=`What is ${a} + ${b}?`;num(a+b);q.explanation=m==='near'?`Double ${a} is ${a*2}. Add one more: ${a+b}.`:`Two groups of ${a} make ${a*2}.`;q.visual={type:'blocks',number:a,other:b};}
 else if(['zeroAdd','zeroSub','whole'].includes(m)){q.prompt=m==='zeroAdd'?`${a} + 0 = ?`:m==='zeroSub'?`${a} − 0 = ?`:`${a} − ${a} = ?`;num(m==='whole'?0:a);q.explanation=`${q.prompt.replace('?',q.answer)}. ${skill.teach}`;}
 else if(m==='turn'){q.prompt=`${a} + ${b} = ${total}. What is ${b} + ${a}?`;num(total);q.explanation=`Both equations join the same parts. Both totals are ${total}.`;}
 else if(m==='inverse'){q.prompt=`${a} + ${b} = ${total}. What is ${total} − ${a}?`;num(b);q.explanation=`Take away the part ${a}. The other part is ${b}.`;}
 else if(m==='family'){q.prompt=`Which subtraction belongs with ${a} + ${b} = ${total}?`;q.answer=`${total} − ${a} = ${b}`;variants=[`${total} − ${a} = ${b+1}`,`${a} − ${b} = ${total}`,`${total} + ${a} = ${b}`];q.explanation=`${total} is the whole; ${a} and ${b} are the parts.`;}
 else if(m==='first'||m==='second'){q.prompt=m==='first'?`___ + ${b} = ${total}. Find the missing first part.`:`${b} + ___ = ${total}. Find the missing second part.`;num(a);q.explanation=`${total} − ${b} = ${a}. Check: ${a} + ${b} = ${total}.`;}
 else if(m==='removed'){q.prompt=`${total} − ___ = ${a}. How much was taken away?`;num(b);q.explanation=`${total} − ${a} = ${b}. So taking away ${b} leaves ${a}.`;}
 else if(m==='start'){q.prompt=`___ − ${b} = ${a}. What was the starting amount?`;num(total);q.explanation=`Join ${a} left and ${b} taken away. The start was ${total}.`;}
 else if(m==='trueAdd'||m==='trueSub'){const truth=random()>.5;const result=m==='trueAdd'?total:a;const claimed=result+(truth?0:1);q.prompt=m==='trueAdd'?`Is ${a} + ${b} = ${claimed} true?`:`Is ${total} − ${b} = ${claimed} true?`;q.answer=truth?'True':'False';variants=[truth?'False':'True'];q.explanation=`The left side equals ${result}. ${truth?'The amounts match.':'The amounts do not match.'}`;}
 else if(m==='fixAdd'||m==='fixSub'){const result=m==='fixAdd'?total:a;const equation=m==='fixAdd'?`${a} + ${b}`:`${total} − ${b}`;q.prompt=`Theo wrote ${equation} = ${result+1}. What should his answer be?`;num(result);q.explanation=`${equation} = ${result}. Check the quantities, even when Theo makes a mistake.`;}
 else if(m==='balance'){const c=int(1,total-1);q.prompt=`${a} + ${b} = ${c} + ___. Keep both sides equal.`;num(total-c);q.explanation=`The left side is ${total}. The right side needs ${total-c} more to make ${total}.`;}
 else if(m==='larger'){q.prompt=`Which total is larger: ${a} + ${b} or ${a} + ${b+1}?`;q.answer=`${a} + ${b+1}`;variants=[`${a} + ${b}`];q.explanation=`The same first part has one more added to it: ${total+1} is greater than ${total}.`;}
 else if(m==='three'){a=int(1,6);b=int(1,6);const c=int(1,6);q.prompt=`Join ${a}, ${b}, and ${c} shells. How many altogether?`;num(a+b+c);q.explanation=`First ${a} + ${b} = ${a+b}. Then ${a+b} + ${c} = ${a+b+c}.`;}
 else if(m==='bridge'){a=int(6,9);b=int(10-a+1,9);q.prompt=`What is ${a} + ${b}? Make ten first.`;num(a+b);q.explanation=`${a} needs ${10-a} to make ten. Split ${b} into ${10-a} and ${b-(10-a)}. Ten plus ${b-(10-a)} is ${a+b}.`;}
 else if(m==='joinChange'){q.prompt=`${a} children are at the picnic. Some join them. Now there are ${total}. How many joined?`;num(b);q.explanation=`${a} + ${b} = ${total}. ${b} children joined.`;}
 else if(m==='leaveChange'){q.prompt=`Theo has ${total} blocks. He uses some to build a tower. ${a} blocks are left. How many did he use?`;num(b);q.explanation=`${total} − ${a} = ${b}. Theo used ${b} blocks.`;}
 else if(m==='smaller'){q.prompt=`Mia has ${total} seeds. She has ${b} more than Sam. How many seeds does Sam have?`;num(a);q.explanation=`Sam has the smaller amount: ${total} − ${b} = ${a}.`;}
 else if(m==='storyEquation'){const join=random()>.5;q.prompt=join?`Theo has ${a} shells and finds ${b} more. Which equation tells how many he has now?`:`Theo has ${total} shells and gives away ${b}. Which equation tells how many remain?`;q.answer=join?`${a} + ${b} = ${total}`:`${total} − ${b} = ${a}`;variants=join?[`${a} − ${b} = ${total}`,`${total} + ${b} = ${a}`]:[`${total} + ${b} = ${a}`,`${a} − ${b} = ${total}`];q.explanation=join?'More shells join the group, so add.':'Some shells leave the group, so subtract.';}
 if(!q.prompt)throw new Error(`Missing depth activity ${m}`);
 const wrong=[...new Set(variants)].filter(s=>s!==q.answer).slice(0,3);q.choices=[q.answer,...wrong];for(let i=q.choices.length-1;i>0;i--){const j=int(0,i);[q.choices[i],q.choices[j]]=[q.choices[j],q.choices[i]];}return q;
}
