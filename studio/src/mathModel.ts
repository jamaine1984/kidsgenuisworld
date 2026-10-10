export function rectangleDimensions(length:number,width:number){const scale=3/Math.max(length,width);return{length:length*scale,width:width*scale};}
export function modelLabel(children:any):string{return Array.isArray(children)?children.map(modelLabel).join(''):children==null?'':String(children);}
export function modelDescription(v:any):string{
 if(v.type==='blocks')return `${v.number}${v.other?' and '+v.other:''} shown as hundreds, tens and ones${v.remove?`, before removing ${v.remove}`:''}`;
 if(v.type==='array')return `${v.rows} rows with ${v.cols} ${v.unitSquares?'unit squares':'objects'} in each`;
 if(v.type==='fraction')return v.simpleShare?`${v.filled} selected shares of ${v.parts} equal shares in one whole`:`${v.filled} parts of size one over ${v.parts}, across ${v.wholes||1} whole${v.wholes===2?'s':''}`;
 if(v.type==='shape')return `${v.name} with ${v.sides} sides`;
 if(v.type==='rectangle')return `Rectangle: ${v.length} units long and ${v.width} units wide. Perimeter follows all four outside sides.`;
 return `${v.count} counter${v.count===1?'':'s'}`;
}
