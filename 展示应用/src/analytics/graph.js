import {paths} from './caseStudy.js';
export const graphColumns=[
 {id:'source',title:['信号来源','Signal source'],field:'source'},
 {id:'theme',title:['研究主题','Research theme'],field:'theme'},
 {id:'opportunity',title:['候选方向','Candidate direction'],field:'opportunity'},
 {id:'review',title:['人工复核','Human review'],field:null},
];
export function graphLayout(stage=0){
 const columns=stage===0?graphColumns.slice(0,2):graphColumns;
 const xs=stage===0?[18,78]:[10,36,63,90];
 const nodes=columns.flatMap((c,col)=>paths.map((p,row)=>({id:`${c.id}-${p.id}`,path:p.id,column:c.id,label:c.field?p[c.field]:['待验证','To validate'],x:xs[col],y:25+row*28,color:p.color})));
 const inputs={together:['together','discover'],discover:['discover'],portable:['together','portable']};
 const links=columns.slice(1).flatMap((c,col)=>paths.flatMap((p,row)=>(col===0?inputs[p.id]:[p.id]).map(input=>{
   // Explicit authored relations, with equal-width edges, never quantitative bands.
   const a=nodes.find(n=>n.path===input&&n.column===columns[col].id),b=nodes.find(n=>n.path===p.id&&n.column===c.id);
   const x1=a.x+8,x2=b.x-8,y1=a.y+(col%2===0?-2:2),y2=b.y+(col%2===0?2:-2),bend=(x1+x2)/2;
   return {id:`${a.id}/${b.id}`,path:p.id,color:p.color,d:`M ${x1} ${y1} C ${bend} ${y1-8}, ${bend} ${y2+8}, ${x2} ${y2}`};
 })));
 return {columns:columns.map((c,i)=>({...c,x:xs[i]})),nodes,links};
}
export function graphNodeActive(graph,node,path){return !path||node.path===path&&node.column!=='source'||graph.links.some(link=>link.path===path&&link.id.startsWith(node.id+'/'));}
