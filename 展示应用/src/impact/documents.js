import {companyDocument,analysisDocument} from '../documents/content.js';
import {distributionRegions} from './distributionContent.js';
import featured from '../../../共享数据/featured-categories.json' with {type:'json'};

const pair=(zh,en)=>[zh,en];
export function impactDocument(moment,payload,{official,productReading,catalog}){
  if(payload?.type==='catalog-category'){
    const record=catalog?.categories.find(category=>category.id===payload.item.id);if(!record)return null;
    const feature=featured.categories.find(item=>item.catalogId===record.id);
    const children=catalog.subcategories.filter(sub=>sub.parent===record.id),title=record.label||pair(record.name,record.name);
    return {id:`impact-catalog-${record.id}`,category:pair('品类档案','Category archive'),title,status:pair('公司品类资料','Company category records'),summary:pair(`${title[0]} · ${children.length} 个细分类`,`${title[1]} · ${children.length} subcategories`),
      cover:feature?{src:feature.image,caption:pair('品类概念图 · 非实际商品照片','Category concept illustration · Not an actual product photograph')}:undefined,
      sections:[{id:'scope',title:pair('品类范围','Category range'),paragraphs:[pair(`以下为公司档案收录的 ${title[0]} 细分类，可用于了解这一领域的产品形态与材料范围。`,`These ${title[1]} subcategories from the company archive describe the range of forms and materials in this field.`)]},
        ...Array.from({length:Math.ceil(children.length/16)},(_,i)=>({id:`range-${i}`,title:pair(children.length>16?`细分类 ${i*16+1}–${Math.min(children.length,(i+1)*16)}`:'全部细分类',children.length>16?`Subcategories ${i*16+1}–${Math.min(children.length,(i+1)*16)}`:'All subcategories'),blocks:[{type:'list',items:children.slice(i*16,(i+1)*16).map(sub=>pair(`${sub.id} · ${sub.label?.[0]||sub.name}`,`${sub.id} · ${sub.label?.[1]||sub.name}`))}]})),
        {id:'basis',title:pair('资料说明','About these records'),paragraphs:[pair('名称与编码沿用公司档案，数量表示档案收录范围。具体产品、规格及品牌关系以相应样品资料为准。','Names and codes follow the company archive. Counts describe archive coverage; product specifications and brand relationships require the corresponding sample records.')]}],
      sources:[{label:pair('原始品类档案','Original category archive'),description:pair(`${catalog.source} · 品类 ${record.id} · 原表第 ${record.sourceRow} 行`,`${catalog.source} · Category ${record.id} · Source row ${record.sourceRow}`)}],
    };
  }
  if(moment==='company'){
    const doc=companyDocument(official);
    return doc?{...doc,cover:undefined}:null;
  }
  if(moment==='supply')return {
    id:'impact-supply-network',category:pair('全球供应链 / 区域协作','Global supply chain / Regional collaboration'),
    status:pair('业务分工依据已确认信息 · 空间与流向为概念演绎','Confirmed regional roles · Conceptual spaces and flows'),
    title:pair('让创意、制造与市场相连','Connecting creation, manufacturing and markets'),
    summary:pair('以中国的研发与核心供应链为主，柬埔寨提供制造协同，越南参与供应链协作，美国团队连接市场与客户。','China leads development and the core supply chain, with manufacturing support in Cambodia, supply chain collaboration in Vietnam and market collaboration in the US.'),
    sections:distributionRegions.map(region=>({id:region.id,title:pair(`${region.name[0]} · ${region.role[0]}`,`${region.name[1]} · ${region.role[1]}`),paragraphs:[region.summary],blocks:[{type:'list',items:region.functions}]})),
    sources:[{label:pair('内容依据','Content basis'),description:pair('区域职能来自已确认的业务分工，越南供应商覆盖来自公司国家档案。展演中的光路用于表达协作关系，不表示实时订单、运输路线或额外的实体基地。','Regional functions reflect confirmed business roles. Vietnam supplier coverage comes from company country records. Light paths illustrate collaboration, not live orders, shipping routes or additional physical bases.')}],
  };
  if(moment==='intelligence'){
    const docs=[0,1,2].map(analysisDocument);
    return {...docs[0],id:'impact-intelligence',title:pair('从市场信号，到产品方向','From market signals to product direction'),sections:docs.flatMap((doc,i)=>doc.sections.map(section=>({...section,id:`${i}-${section.id}`})))};
  }
  if(payload?.type==='category'){
    const item=payload.item,record=catalog?.categories.find(category=>category.id===item.catalogId);
    const examples=item.examples.filter(example=>catalog?.subcategories.some(sub=>sub.id===example.id&&sub.parent===item.catalogId));
    const sources=(official?.categories||[]).filter(category=>item.officialIds.includes(category.id));
    return {id:`impact-category-${item.id}`,category:pair('品类介绍','Category introduction'),title:item.name,summary:item.description,status:pair('业务品类 · 概念场景','Business category · Concept scene'),
      sections:[
        {id:'scope',title:pair('品类范围','Category scope'),paragraphs:[item.detail]},
        {id:'families',title:pair('代表细分类','Representative subcategories'),paragraphs:examples.map(example=>example.name)},
        {id:'design',title:pair('材质与设计','Materials & design'),paragraphs:[item.material]},
        {id:'concept',title:pair('场景说明','About this scene'),paragraphs:[pair('三维场景用原创概念形态呈现品类特点，不代表已确认的在售型号、品牌归属或业务量排名。','Original 3D concept forms illustrate category characteristics, not confirmed commercial models, brand ownership or business-volume rankings.')]},
      ],
      sources:[...(record?[{label:pair('品类档案','Category archive'),description:pair(`${catalog.source} · 品类 ${record.id} ${record.name}`,`${catalog.source} · Category ${record.id} ${record.name}`)}]:[]),...sources.map(source=>({label:pair(source.name.zh,source.name.en),url:source.source_url}))],
    };
  }
  if(payload?.type==='brand'){
    const brand=payload.item,source=official?.brands?.find(b=>b.id===brand.id);
    return {id:`impact-brand-${brand.id}`,category:pair('品牌介绍','Brand introduction'),title:brand.name,summary:brand.descriptor,status:brand.ownership==='company-confirmed'?pair('PARAMONT 旗下品牌','A PARAMONT brand'):pair('官方品牌资料','Official brand information'),
      cover:{src:'/media/brand/'+brand.logo,caption:pair(`${brand.name} · 官方标志`,`${brand.name} · Official identity`)},
      sections:[{id:'identity',title:brand.descriptor,paragraphs:[brand.description]},
        ...(source?.parent?[{id:'relationship',title:pair('业务关系','Business relationship'),paragraphs:[pair(`官网在 ${source.parent} 业务下介绍 ${brand.name}。`, `The company website presents ${brand.name} within the ${source.parent} business.`)]}]:[]),
        {id:'scope',title:pair('展示说明','About this presentation'),paragraphs:[pair('品牌介绍与原创产品概念分别呈现。品类页中的美妆、玩具等概念样品不代表本品牌的实际商品。','Brand information and original product concepts are presented separately. Cosmetic and toy concepts on the category page are not actual products of this brand.')]}],
      sources:source?.source_url?[{label:pair('官方品牌资料来源','Official brand source'),url:source.source_url}]:brand.source_url?[{label:pair('公司产品门户 · 旗下品牌由公司确认','Company product portal · Brand ownership confirmed by the company'),url:brand.source_url}]:[]};
  }
  return null;
}
