import {supplyRegions} from './content.js';
// Country-level business roles, not factory addresses or customer locations.
// Business coverage can be featured without inventing a corresponding factory model.
const regionDetails=[
  {id:'usa',countryCode:'840',kind:'market',role:['市场与客户协作','Market & customer collaboration'],summary:['由美国团队连接客户需求、产品提案与市场反馈。','The US team connects customer requirements, product proposals and market feedback.'],functions:[['市场沟通','Market dialogue'],['产品提案','Product proposals'],['客户协作','Customer collaboration']]},
  {id:'china',countryCode:'156',kind:'supply',role:['研发 · 核心供应链','Development · Core supply chain'],summary:['以中国为研发与供应链核心，连接设计、打样、采购、制造与交付。','China leads development and the core supply chain, connecting design, prototypes, sourcing, manufacturing and delivery.'],functions:[['设计研发','Design & development'],['采购协同','Sourcing'],['供应链协作','Supply collaboration']]},
  {id:'cambodia',countryCode:'116',kind:'manufacturing',role:['制造协同 · 补充支持','Manufacturing · Complementary support'],summary:['柬埔寨作为中国核心供应链的补充，以制造、质量和交付提供协同支持。','Cambodia complements the China-led supply chain with manufacturing, quality and delivery support.'],functions:[['加工制造','Manufacturing'],['质量检查','Quality control'],['仓储交付','Warehousing & delivery']]},
  {id:'vietnam',countryCode:'704',name:['越南','VIETNAM'],kind:'partner',role:['供应链协作','Supply chain collaboration'],summary:['越南参与公司的供应链协作，与中国核心供应链相连接。供应商覆盖以公司档案为依据。','Vietnam participates in supply chain collaboration connected to the China-led network. Supplier coverage is based on company records.'],functions:[['供应商协作','Supplier collaboration']]},
];
export const distributionRegions=regionDetails.map(detail=>{
  const region=supplyRegions.find(region=>region.id===detail.id);
  return {...detail,name:region?.name||detail.name,sceneId:region?.id||null,coordinate:region?[region.longitude,region.latitude]:undefined};
});
export const distributionLayers=[
  {id:'all',name:['全部业务','ALL OPERATIONS']},
  {id:'customers',name:['客户分布','CUSTOMERS']},
  {id:'suppliers',name:['供应商分布','SUPPLIERS']},
];
export const distributionLinks=[['china','cambodia'],['china','vietnam'],['china','usa']];
export function footprintCountries(data,layer='all',query=''){
  const term=query.trim().toLocaleLowerCase(),code=data.aliases?.[term.toUpperCase()]||term.toUpperCase(),exactCode=data.countries.some(country=>country.code===code);
  return data.countries.filter(country=>(layer==='all'||country[layer]>0)&&(!term||(exactCode?country.code===code:country.name.some(value=>value.toLocaleLowerCase().includes(term)))))
    .sort((a,b)=>(layer==='all'?b.customers+b.suppliers-a.customers-a.suppliers:b[layer]-a[layer])||a.code.localeCompare(b.code));
}
export function footprintScene(country){return distributionRegions.find(region=>region.countryCode===country?.mapId)?.sceneId||null;}
export function footprintKind(country,layer){return layer==='all'?(country.customers&&country.suppliers?'both':country.customers?'customers':'suppliers'):layer;}
export function clampMapView(view){const zoom=Math.max(1,Math.min(2.4,view.zoom));if(zoom===1)return {zoom:1,x:0,y:0};return {zoom,x:Math.max(-(zoom-1)*.5,Math.min((zoom-1)*.5,view.x)),y:Math.max(-(zoom-1)*.5,Math.min((zoom-1)*.5,view.y))};}

// The existing theatre frame loop drives this reversible map-to-model move.
export function mapJourneyFrame(view,point,size,progress){
  const p=Math.max(0,Math.min(1,progress)),smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const move=smooth(p/.78),reveal=smooth((p-.28)/.5),zoom=Math.max(3.6,view.zoom*1.8);
  const x=size[0]*.65-size[0]/2-(point[0]-size[0]/2)*zoom,y=size[1]*.5-size[1]/2-(point[1]-size[1]/2)*zoom;
  return {x:view.x*size[0]+(x-view.x*size[0])*move,y:view.y*size[1]+(y-view.y*size[1])*move,zoom:view.zoom+(zoom-view.zoom)*move,opacity:1-reveal,copyOpacity:1-smooth(p/.25),modelOpacity:reveal};
}
