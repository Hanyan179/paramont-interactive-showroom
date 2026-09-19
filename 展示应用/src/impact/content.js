import {categoryReel} from './categoryContent.js';
export const impactMoments=[
  {id:'company',name:['公司','COMPANY'],duration:38,title:['创意，连接世界。','CREATIVITY CONNECTS.'],description:['从创意出发，连接品牌、产品与制造。','Connecting brands, product creation and manufacturing.'],action:['了解公司','Discover PARAMONT'],note:['PARAMONT GLOBAL · 品牌装置为概念演绎','PARAMONT GLOBAL · Conceptual brand sculpture']},
  {id:'supply',name:['全球供应链','GLOBAL REACH'],duration:32,title:['纵贯世界。','A WORLD CONNECTED.'],description:['中国研发与核心供应链 · 柬埔寨制造协同 · 越南供应链协作 · 美国市场\n让创意、制造与市场，贯通同一个世界。','China leads development and supply, with manufacturing support in Cambodia, supply collaboration in Vietnam and market connections in the US.\nIdeas, manufacturing and markets in one connected world.'],note:['区域协作与流向的视觉演绎 · 非实时物流','A visual interpretation of regional collaboration · Not live logistics']},
  {id:'brands',name:['品牌','BRANDS'],duration:40,title:['品牌，各有光芒。','BRANDS WITH CHARACTER.'],description:['走进各具特色的品牌世界。','Discover distinctive brand identities.'],note:['官方品牌标志与形象展示','Official identities · Brand presentation']},
  {id:'categories',name:['品类','CATEGORIES'],duration:24,title:['让创意，走进生活。','CREATIVITY IN EVERYDAY LIFE.'],description:['从美妆个护、儿童玩具，到派对庆典。','Beauty, children’s play and celebrations.'],note:['业务品类展示 · 产品形态为原创概念','Business categories · Original concept product forms']},
  {id:'intelligence',name:['智能与洞察','INTELLIGENCE'],duration:48,title:['让信息，\n生长为洞察。','INFORMATION.\nINTO INSIGHT.'],description:['从数据，到洞察，再到产品与价值。\n在持续进化中，创造更多可能。','From data to insight, from ideas to value.\nLearning continuously. Creating new possibilities.'],action:['探索分析流程','Explore the process'],note:['人工智能与分析流程的视觉概念','A visual concept of intelligence and analysis']},
];
export const reelDwell=8;
export const isReelMoment=id=>id==='brands'||id==='categories';
// Reel selections use an eight-second slot. The tour clock must cover every
// available item, including brand records added after the original five.
export const momentDuration=(moment,entryCount=0)=>isReelMoment(moment.id)&&entryCount>0?entryCount*reelDwell:moment.duration;
export const wrapReel=(position,count)=>count>0?((position%count)+count)%count:0;
export function reelEntries(id,brands=[]){
  if(id==='brands')return brands.map((item,index)=>({type:'brand',index,item}));
  if(id==='categories')return categoryReel.map((item,index)=>({type:'category',index,item}));
  return [];
}
export function automaticReelPosition(time){
  const index=Math.floor(time/reelDwell),t=Math.max(0,Math.min(1,((time%reelDwell)-(reelDwell-.95))/.95));
  return index+t*t*(3-2*t);
}
// A deliberate horizontal gesture advances once. Cancellation restores its origin.
export function settleReel(origin,displacement,cancelled=false){
  return Math.round(origin)+(cancelled||Math.abs(displacement)<.16?0:displacement>0?1:-1);
}
export function advanceMoment(index,time,delta,duration=impactMoments[index].duration){
  let elapsed=time+Math.max(0,Math.min(delta,.05));
  if(elapsed>=duration)return {index:(index+1)%impactMoments.length,time:elapsed-duration};
  return {index,time:elapsed};
}

// Regional anchors describe known company roles, not factory street addresses.
export const supplyRegions=[
  {id:'china',latitude:35,longitude:104,name:['中国','CHINA'],role:['研发与核心供应链','DEVELOPMENT & CORE SUPPLY']},
  {id:'cambodia',latitude:12.6,longitude:104.9,name:['柬埔寨','CAMBODIA'],role:['制造协同','MANUFACTURING SUPPORT']},
  {id:'usa',latitude:38,longitude:-98,name:['美国','UNITED STATES'],role:['市场协作','MARKET COLLABORATION']},
];
