export const supplyFacilities={
  china:[
    {id:'materials',name:['趋势与材料库','TRENDS & MATERIALS'],title:['以材料，\n打开可能。','MATERIALS OPEN\nPOSSIBILITIES.'],description:['在同一个材料与趋势空间中比较色彩、表面、触感与结构，为产品和包装建立设计方向。','Explore colour, finish, touch and structure together to establish directions for products and packaging.']},
    {id:'design',name:['产品设计中心','PRODUCT DESIGN'],title:['让创意，\n成为设计。','IDEAS INTO\nPRODUCT DESIGN.'],description:['围绕美妆、儿童玩具等领域展开造型、包装与使用场景研究，通过概念样品沟通方案。','Explore form, packaging and use scenarios in beauty, toys and other fields, using concept samples to communicate ideas.']},
    {id:'prototype',name:['打样与验证','PROTOTYPING'],title:['从设计，\n走向样品。','DESIGN INTO\nTANGIBLE SAMPLES.'],description:['以打样、结构观察与样品对照支持设计迭代，再将明确的产品要求交接至制造协作。','Use prototypes, structural review and sample comparison to refine designs before handing product requirements to manufacturing.']},
    {id:'supply',name:['核心供应链中心','CORE SUPPLY CHAIN'],title:['中国为核，\n协同制造。','CHINA AT THE CORE.\nCONNECTED SUPPLY.'],description:['以中国为核心连接采购、制造、质量与交付。研发与样品要求在这里衔接供应商和生产协作，柬埔寨制造能力与越南供应链协作提供补充支持。','China connects sourcing, manufacturing, quality and delivery. Development and sample requirements flow into supplier and production collaboration, supported by complementary manufacturing in Cambodia and supply collaboration in Vietnam.']},
  ],
  cambodia:[
    {id:'production',name:['连续制造','PRODUCTION'],title:['制造有序，\n连续运行。','PRECISION\nIN MOTION.'],description:['生产、工序衔接与过程检查在同一空间运行，让每一步制造与产品要求保持联系。','Production, process hand-offs and in-process inspection operate in one space around product requirements.']},
    {id:'quality',name:['质量与样品中心','QUALITY & SAMPLES'],title:['质量，\n贯穿始终。','QUALITY\nTHROUGHOUT.'],description:['通过样品、检查与质量协作理解产品标准。集团质量体系覆盖概念、开发、产前、生产与消费反馈。','Understand product standards through samples, inspection and quality collaboration. Group processes span concept through consumer feedback.']},
    {id:'dispatch',name:['仓储与交付','WAREHOUSING & DELIVERY'],title:['从生产，\n走向交付。','PRODUCTION\nINTO DELIVERY.'],description:['将成品整理、仓储协作与交付衔接纳入完整制造流程。画面展示协作逻辑，不代表实际场地产能或即时订单。','Connect finished products, warehousing and dispatch. This depicts a concept, not actual site capacity or live orders.']},
  ],
  usa:[
    {id:'portfolio',name:['产品组合展廊','PRODUCT PORTFOLIO'],title:['让产品组合，\n呈现价值。','A PORTFOLIO\nOF POSSIBILITIES.'],description:['以有层次的展廊组织产品形态、领域与应用场景，支持组合讨论与市场交流。展品为未绑定品牌的概念样品。','Organise product forms, fields and applications for portfolio discussion. Displays are concept samples, unassigned to brands.']},
    {id:'brandstage',name:['品牌体验空间','BRAND EXPERIENCE'],title:['让创意，\n被世界看见。','CREATIVITY\nMEETS THE WORLD.'],description:['在美妆与儿童玩具等领域场景中呈现产品表达，让品牌故事、产品细节与体验自然连接。','Present beauty, toys and other fields through product experiences that connect storytelling, detail and use.']},
    {id:'customers',name:['客户与市场协作','CUSTOMER COLLABORATION'],title:['与客户，\n共同创造。','CREATE\nWITH CUSTOMERS.'],description:['围绕产品方案、组合与市场反馈交流，把客户需求带回研发和供应链协作。','Discuss proposals, portfolios and market feedback, connecting customer needs back to development and supply collaboration.']},
  ],
};
export function supplyLocation(selection){const [region='china',area=null]=(selection||'china').split(':');return {region,area};}
export function validSupplySelection(selection){const {region,area}=supplyLocation(selection);return !!supplyFacilities[region]&&(!area||supplyFacilities[region].some(item=>item.id===area));}
export function supplyHotspots(selection){const {region}=supplyLocation(selection);return (supplyFacilities[region]||[]).map(item=>({...item,id:`${region}:${item.id}`}));}
