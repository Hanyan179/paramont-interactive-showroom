import {supplyFacilities,supplyLocation,supplyHotspots} from './supplyRegionsContent.js';
export const depthContent={
  supply:{name:['全球供应链','GLOBAL SUPPLY NETWORK'],title:['贯通全链，\n协同世界。','ONE NETWORK.\nGLOBAL REACH.'],description:['从研发、采购到生产、质量与交付，让产品从创意走向全球市场。','Connect development, sourcing, production, quality and delivery to take ideas to global markets.'],note:['协作体系的三维概念演绎 · 非真实厂区、产能或实时物流','3D interpretation of an integrated system · Not actual sites, capacity or live logistics'],back:['返回地球','BACK TO GLOBE'],items:[
    {id:'china',name:['中国 · 核心','CHINA · CORE'],title:['研发为源，\n供应为核。','DEVELOPMENT.\nCORE SUPPLY.'],description:['中国是研发与供应链的核心。将设计、打样、采购、制造与交付连接起来，统筹产品从创意到市场的协作。','China is the core of development and the supply chain, connecting design, prototyping, sourcing, manufacturing and delivery from idea to market.'],tags:[['趋势研究','TREND RESEARCH'],['设计开发','DESIGN & DEVELOPMENT'],['样品验证','SAMPLE VALIDATION']]},
    {id:'cambodia',name:['柬埔寨 · 协同','CAMBODIA · SUPPORT'],title:['制造协同，\n拓展可能。','MANUFACTURING.\nIN SUPPORT.'],description:['作为中国核心供应链的补充，柬埔寨承接制造协作，连接生产、质量检查与仓储交付，共同支撑产品落地。','Complementing the China-led supply network, Cambodia supports manufacturing through production, quality inspection, warehousing and delivery.'],tags:[['连续生产','PRODUCTION FLOW'],['过程检查','IN-PROCESS INSPECTION'],['质量管理','QUALITY MANAGEMENT']]},
    {id:'usa',name:['美国 · 市场','US · MARKETS'],title:['让产品，\n走向市场。','PRODUCTS MEET\nTHE MARKET.'],description:['连接产品组合、供应链协作与市场团队，让开发成果走向客户，并将反馈带回下一轮创造。','Connect the portfolio, supply partners and market teams to bring products to customers and feedback into the next development cycle.'],tags:[['产品组合','PRODUCT PORTFOLIO'],['交付协同','DELIVERY COLLABORATION'],['市场反馈','MARKET FEEDBACK']]},
  ]},
  intelligence:{name:['人工智能 · 协同研究','AI · COLLABORATIVE RESEARCH'],title:['让信息，\n生长为洞察。','INFORMATION.\nINTO INSIGHT.'],description:['感知市场信号，连接知识与需求，在多种可能中探索下一件产品。','Sense market signals, connect knowledge with needs, and explore the next product through multiple possibilities.'],note:['人工智能流程与产品形态的概念演示 · 未接入实时分析或生成服务','Concept AI workflow and product forms · No live analysis or generation service'],back:['返回洞察核心','BACK TO CORE'],items:[
    {id:'signals',name:['信号感知','SIGNAL SENSING'],title:['让变化，\n清晰可见。','SENSE THE\nCHANGE.'],description:['公开趋势、市场观察与用户表达分层进入研究，经过来源核对与语境整理，形成可追溯的线索。','Public trends, market observations and user expressions enter a layered research flow. Source checks and context keep every signal traceable.'],tags:[['多源信息汇聚','SOURCE COLLECTION'],['来源与语境核对','SOURCE & CONTEXT'],['保留证据线索','TRACEABLE EVIDENCE']]},
    {id:'categories',name:['关联推演','CONNECTED REASONING'],title:['万千关联，\n汇聚新知。','CONNECT.\nUNDERSTAND.'],description:['将场景、形态、材料与需求交叉关联。用神经网络意象呈现人工智能辅助研究的推演过程，关键判断由团队复核。','Cross-reference scenarios, form, materials and needs. This neural-network metaphor visualises AI-assisted research, with key judgements reviewed by the team.'],tags:[['需求与场景关联','NEEDS & SCENARIOS'],['材料与形态比较','MATERIALS & FORM'],['依据复核与判断','EVIDENCE & REVIEW']]},
    {id:'direction',name:['生成探索','GENERATIVE EXPLORATION'],title:['从可能，\n走向创造。','EXPLORE.\nCREATE.'],description:['从结构线稿到材质表达，同时探索美妆与玩具的产品可能。候选方向经过团队评审，再进入设计、打样与验证。','From structure to material expression, explore possibilities for beauty and toys. Candidate directions move through team review before design, prototyping and validation.'],tags:[['结构与形态探索','FORM EXPLORATION'],['材质与方案比较','MATERIAL VARIANTS'],['人工评审与验证','REVIEW & VALIDATION']]},
  ]},
};
// The map and globe are two entrances to the same preloaded supply scenes.
export const depthSceneId=chapter=>chapter;
export function depthBack(view){
  if(view.id==='supply'&&supplyLocation(view.selection).area)return ['返回地区总览','BACK TO REGION'];
  if(view.id==='intelligence'&&view.selection)return ['返回推演总览','BACK TO OVERVIEW'];
  return view.originView==='flat'?['返回世界地图','BACK TO WORLD MAP']:depthContent[view.id].back;
}
export function depthItem(id,selection){const content=depthContent[id];if(id==='supply'){const {region,area}=supplyLocation(selection);return supplyFacilities[region]?.find(item=>item.id===area)||content.items.find(item=>item.id===region)||content;}return content?.items.find(item=>item.id===selection)||content;}
export function depthHotspots(view){return view.id==='supply'?supplyHotspots(view.selection):depthContent[view.id].items;}
export const transitionProgress=(elapsed,duration)=>{const t=Math.max(0,Math.min(1,elapsed/duration));return t*t*(3-2*t);};

export function supplyEvidence(facts,selection){
  const records=facts?.official_metrics_requiring_date_confirmation||[];
  if(selection)selection=supplyLocation(selection).region;
  const fields={suppliers:['活跃配件',['活跃配件、零部件与材料供应商','Active accessory, component and material suppliers']],products:['活跃产品',['活跃产品库存单位','Active product SKUs']],design:['产品及包装设计',['中美产品与包装设计人员','Product and packaging designers in the US and China']],quality:['质量保证',['集团质量保证与质量控制人员','Group quality assurance and control staff']]};
  const keys=selection==='china'?['design']:selection==='cambodia'?['quality']:selection==='usa'?['products']:['suppliers','products'];
  return keys.flatMap(key=>{const [needle,label]=fields[key],record=records.find(r=>r.label_zh.includes(needle));return record?[{...record,id:key,label}]:[];});
}
