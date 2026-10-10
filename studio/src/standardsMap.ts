import {CURRICULUM,type Skill} from './curriculum';
export function relatedStandards(s:Skill):string[]{
 if(s.p.standards?.length)return s.p.standards.map((c:string)=>c.replace(/^(\d)\.(RF|RL|RI|SL|L|W)\./,'$2.$1.'));
 const g=s.grade,k=s.kind;
 if(s.subject==='reading')return k==='listening'?[`SL.${g}.2`,`RF.${g}.${g===1?'2':'3'}`]:['phonics','spelling','syllable','morph','readingDepth'].includes(k)?[`RF.${g}.3`,`L.${g}.2`]:k==='grammar'?[`L.${g}.1`,`L.${g}.2`]:k==='vocab'?[`L.${g}.4`]:k==='fluency'?[`RF.${g}.4`]:[`RL.${g}.1`,`RI.${g}.1`];
 const map:Record<number,Record<string,string>>={1:{count:'NBT.A.1',sequence:'NBT.A.1',place:'NBT.B.2',compare:'NBT.B.3',add:'OA.C.6',sub:'OA.C.6',missing:'OA.D.8',word:'OA.A.1',time:'MD.B.3',length:'MD.A.2',shape:'G.A.1',fraction:'G.A.3',data:'MD.C.4'},2:{place:'NBT.A.1',compare:'NBT.A.4',sequence:'NBT.A.2',add:'NBT.B.5',sub:'NBT.B.5',missing:'OA.A.1',word:'OA.A.1',multiply:'OA.C.4',odd:'OA.C.3',time:'MD.C.7',money:'MD.C.8',length:'MD.A.1',shape:'G.A.1',fraction:'G.A.3',data:'MD.D.10'},3:{add:'NBT.A.2',sub:'NBT.A.2',place:'NBT.A.1',compare:'NBT.A.1',round:'NBT.A.1',sequence:'OA.D.9',multiply:'OA.A.1',divide:'OA.A.2',word:'OA.D.8',fraction:'NF.A.1',area:'MD.C.7',perimeter:'MD.D.8',time:'MD.A.1',length:'MD.A.4',data:'MD.B.3',quad:'G.A.1',shape:'G.A.1'}};
 if(g===1&&s.domain==='Addition and subtraction'&&!map[g][k])return ['1.OA.C.6','1.OA.D.8'];
 if(k==='compare'&&s.p.unit)return [`${g}.MD.A.${g===1?'1':'4'}`];
 if(k==='add'&&g===1&&s.p.tens)return ['1.NBT.C.4'];
 if(['add','sub'].includes(k)&&g===2&&s.p.max>100)return ['2.NBT.B.7'];
 if(k==='word'&&g===3&&['multiply','divide'].includes(s.p.op))return ['3.OA.A.3'];
 if(k==='word'&&g===2&&s.p.unit)return ['2.MD.B.5','2.OA.A.1'];
 return map[g][k]?[`${g}.${map[g][k]}`]:[];
}
export const COVERAGE_TARGETS:Record<number,{code:string;name:string}[]>={
 1:[{code:'1.OA',name:'Addition, subtraction and equal equations'},{code:'1.NBT',name:'Counting and place value'},{code:'1.MD',name:'Lengths, clocks and data'},{code:'1.G',name:'Shapes and equal shares'},{code:'RF.1',name:'Sounds, decoding and connected reading'},{code:'RL.1',name:'Literature and evidence'},{code:'RI.1',name:'Informational text'},{code:'L.1',name:'Vocabulary, spelling and sentences'},{code:'SL.1',name:'Listening and speaking'},{code:'W.1',name:'Writing and dictation'}],
 2:[{code:'2.OA',name:'Fluent facts and equal groups'},{code:'2.NBT',name:'Three-digit numbers and operations'},{code:'2.MD',name:'Measurement, money, clocks and data'},{code:'2.G',name:'Shapes, arrays and equal shares'},{code:'RF.2',name:'Word patterns and fluency'},{code:'RL.2',name:'Stories and evidence'},{code:'RI.2',name:'Informational text'},{code:'L.2',name:'Vocabulary, grammar and spelling'},{code:'SL.2',name:'Listening and speaking'},{code:'W.2',name:'Writing and dictation'}],
 3:[{code:'3.OA',name:'Multiplication, division and patterns'},{code:'3.NBT',name:'Rounding and whole-number operations'},{code:'3.NF',name:'Fractions and comparisons'},{code:'3.MD',name:'Area, perimeter, measurement and data'},{code:'3.G',name:'Shape categories and equal parts'},{code:'RF.3',name:'Word parts and connected reading'},{code:'RL.3',name:'Stories and evidence'},{code:'RI.3',name:'Informational text'},{code:'L.3',name:'Vocabulary, grammar and spelling'},{code:'SL.3',name:'Listening and speaking'},{code:'W.3',name:'Writing and dictation'}]
};
export function coverageRows(grade:number){return COVERAGE_TARGETS[grade].map(t=>({...t,skills:CURRICULUM.filter(s=>s.grade===grade&&relatedStandards(s).some(c=>c.startsWith(t.code+'.')))}));}
