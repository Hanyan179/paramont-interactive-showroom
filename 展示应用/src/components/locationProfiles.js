import { capabilityStops } from './capabilityContent.js';

const chapter=(id,name,title,caption,description)=>({id,name,title,caption,description});
const stop=(base,name,description,extra={})=>({...base,name,description,...extra});
// Business roles were supplied by the user on 2026-09-10. The spaces are concepts.
export const locationProfiles={
  china:{
    id:'china',role:['创意与研发源头','Creative origin & R&D'],
    summary:['从创意与研究出发，连接产品设计、研发与样品探索。','Ideas and research connect product design, development and sample exploration.'],
    enter:['走进创研空间','Explore our creative studios'],
    missing:['具体研究项目、设计过程与研发案例待补充。','Research projects, design processes and development cases are awaiting content.'],
    chapters:[
      chapter('overview',['创研总览','Creative studios'],['创意，从这里出发。','Where ideas begin.'],['中国 · 创意与研发','CHINA / CREATIVE ORIGIN'],['灵感、研究与产品研发，共同构成创意的源头。','Inspiration, research and product development come together at the creative origin.']),
      chapter('manufacturing',['创意与设计','Ideas & design'],['让灵感，有了方向。','Give ideas a direction.'],['灵感与设计工作室','IDEAS & DESIGN STUDIO'],['从灵感资料、创意方案到产品设计，让想法逐步清晰。','Move from inspiration and creative concepts to considered product design.']),
      chapter('quality',['研究与洞察','Research & insight'],['把好奇，带进研究。','Curiosity becomes insight.'],['趋势与材料研究空间','RESEARCH & INSIGHT LAB'],['探索趋势、材料与产品方向，为设计和研发提供参考。','Explore trends, materials and product direction to inform design and development.']),
      chapter('delivery',['研发与样品','R&D & samples'],['让设计，走向实物。','Design becomes tangible.'],['研发与样品工坊','DEVELOPMENT WORKSHOP'],['通过模型、样品与开发协作，让创意逐步成形。','Models, samples and development collaboration give ideas a tangible form.']),
    ],
    stops:{
      overview:[
        stop(capabilityStops.overview[0],['创意设计室','Design studio']),
        stop(capabilityStops.overview[1],['研究实验室','Research lab']),
        stop(capabilityStops.overview[2],['研发样品间','Development atelier']),
      ],
      manufacturing:[
        stop(capabilityStops.manufacturing[0],['灵感与素材','Inspiration library'],['从色彩、材质和创意线索出发，探索新的产品表达。','Explore product possibilities through colour, materials and creative references.']),
        stop(capabilityStops.manufacturing[1],['创意方案','Creative concepts'],['把研究与灵感汇聚成可以讨论、比较的设计方案。','Bring research and inspiration together in concepts that can be discussed and compared.']),
        stop(capabilityStops.manufacturing[2],['产品设计','Product design'],['从外观、结构到细节，逐步完善产品的设计表达。','Develop product design through form, structure and detail.']),
      ],
      quality:[
        stop(capabilityStops.quality[0],['趋势研究','Trend research'],['通过趋势与品类研究，探索产品的创意方向。','Explore creative product direction through trend and category research.']),
        stop(capabilityStops.quality[1],['材料研究','Material studies'],['将材料、表面与色彩放在一起研究，连接设计与开发。','Study materials, finishes and colour together, connecting design and development.']),
      ],
      delivery:[
        stop(capabilityStops.delivery[0],['模型与样品','Models & samples'],['把设计转化为可观察、可比较的模型与样品。','Translate design into models and samples that can be examined and compared.'],{sample:'sample-02'}),
        stop(capabilityStops.delivery[1],['开发协作','Development collaboration'],['连接设计、研发与后续制造所需的信息。','Connect the information needed across design, development and subsequent manufacturing.']),
      ],
    },
  },
  usa:{
    id:'usa',role:['市场与客户连接','Market & customer connections'],
    summary:['面向销售市场与客户，由美国团队连接需求、产品提案与项目沟通。','The US team connects markets and customers with product proposals and project conversations.'],
    enter:['走进市场与团队空间','Explore markets & our US team'],
    missing:['具体市场、客户案例与美国团队介绍待补充。','Market details, customer cases and US team introductions are awaiting content.'],
    chapters:[
      chapter('overview',['市场总览','Market connections'],['与市场，更近一步。','Closer to the market.'],['美国 · 市场与客户','UNITED STATES / MARKET CONNECTIONS'],['产品展示、客户会谈与美国团队协作，共同连接市场。','Product presentations, customer conversations and the US team connect with the market.']),
      chapter('manufacturing',['市场与销售','Markets & sales'],['让产品，遇见市场。','Products meet their market.'],['市场与产品展示空间','MARKET SHOWROOM'],['围绕产品提案、渠道场景与市场反馈，展开销售沟通。','Explore product proposals, channel contexts and market feedback through sales conversations.']),
      chapter('quality',['客户与合作','Customers & partnerships'],['从一次对话，开始合作。','A partnership starts with a conversation.'],['客户洽谈与共创空间','CUSTOMER FORUM'],['在客户需求、产品方案与协作内容之间建立连接。','Connect customer needs, product proposals and collaboration.']),
      chapter('delivery',['美国团队','Our US team'],['在当地，保持连接。','Connected, locally.'],['美国团队协作空间','US TEAM STUDIO'],['由美国团队连接市场与客户，并与创研、制造端协作。','The US team connects markets and customers with creative and manufacturing teams.']),
    ],
    stops:{
      overview:[stop(capabilityStops.overview[0],['市场展示厅','Market showroom']),stop(capabilityStops.overview[1],['客户会谈室','Customer forum']),stop(capabilityStops.overview[2],['团队协作室','US team studio'])],
      manufacturing:[
        stop(capabilityStops.manufacturing[0],['渠道场景','Channel contexts'],['围绕产品的销售场景与呈现方式，展开市场沟通。','Discuss how products are presented in their sales context.']),
        stop(capabilityStops.manufacturing[1],['产品提案','Product proposals'],['通过产品、样品与方案，把创意介绍给客户。','Introduce ideas to customers through products, samples and proposals.']),
        stop(capabilityStops.manufacturing[2],['市场反馈','Market feedback'],['把市场与客户反馈带回产品讨论。','Bring market and customer feedback into product conversations.']),
      ],
      quality:[
        stop(capabilityStops.quality[0],['客户会谈','Customer conversations'],['从需求与产品方案出发，展开具体的合作讨论。','Discuss collaboration through customer needs and product proposals.']),
        stop(capabilityStops.quality[1],['需求协同','Shared requirements'],['让客户需求与创研、制造端的信息彼此衔接。','Connect customer requirements with creative and manufacturing information.']),
      ],
      delivery:[
        stop(capabilityStops.delivery[0],['当地团队','Local team'],['美国团队面向当地市场与客户，连接产品和业务沟通。','The US team connects local markets and customers with product and business conversations.']),
        stop(capabilityStops.delivery[1],['跨区域协作','Cross-region collaboration'],['连接中国的创意研发、柬埔寨的制造供应链与美国市场。','Connect creative development in China, manufacturing and supply chain in Cambodia, and the US market.']),
      ],
    },
  },
  cambodia:{
    id:'cambodia',role:['制造与供应链','Manufacturing & supply chain'],
    summary:['连接工厂、加工制造与供应链，把产品方案带向生产与交付。','Connect factories, processing and supply chain to take product proposals into production and delivery.'],
    enter:['走进制造与供应链','Explore manufacturing & supply chain'],
    missing:['具体厂区、产线、设备、质量记录与交付案例待补充。','Sites, production lines, equipment, quality records and delivery cases are awaiting content.'],
    chapters:[
      chapter('overview',['制造总览','Manufacturing campus'],['让创意，成为产品。','Ideas become products.'],['柬埔寨 · 制造与供应链','CAMBODIA / MANUFACTURING'],['从加工制造、质量检查到仓储交付，连接产品落地的各个环节。','Connect processing, manufacturing, quality checks, storage and delivery.']),
      chapter('manufacturing',['加工与制造','Processing & making'],['在工序之间，逐步成形。','Taking shape, step by step.'],['工厂与加工空间','FACTORY & PROCESSING'],['将产品方案与工艺、加工和生产协作相衔接。','Connect product proposals with processes, production and manufacturing collaboration.']),
      chapter('quality',['质量与检查','Quality & inspection'],['关注每一道细节。','Attention at every stage.'],['样品与质量检查空间','QUALITY & INSPECTION'],['通过样品、检查与质量资料，展开制造过程中的质量内容。','Explore manufacturing quality through samples, inspection and quality information.']),
      chapter('delivery',['供应链与交付','Supply chain & delivery'],['让制造，连接交付。','Making connects to delivery.'],['仓储与交付协作空间','SUPPLY CHAIN EXCHANGE'],['围绕包装、仓储与交付协作，连接供应链信息。','Connect supply chain information through packaging, storage and delivery collaboration.']),
    ],
    stops:{
      overview:[stop(capabilityStops.overview[0],['加工制造区','Production floor']),stop(capabilityStops.overview[1],['质量检查区','Inspection zone']),stop(capabilityStops.overview[2],['仓储交付区','Warehouse & delivery'])],
      manufacturing:[
        stop(capabilityStops.manufacturing[0],['材料与工艺','Materials & processes'],['将产品设计与材料、工艺及加工方案衔接。','Connect product design with materials, processes and manufacturing plans.']),
        stop(capabilityStops.manufacturing[1],['加工产线','Production line'],['沿工序查看制造流程；具体产线和加工内容可随实际资料继续展开。','Explore the production flow. Specific lines and processes will follow supplied site material.'],{sample:undefined}),
        stop(capabilityStops.manufacturing[2],['设备与协作','Equipment & coordination'],['连接设备、工序与生产协作，了解产品的制造过程。','Connect equipment, processes and coordination across manufacturing.']),
      ],
      quality:capabilityStops.quality,
      delivery:capabilityStops.delivery,
    },
  },
};
// Unconfirmed regions never borrow another country's business or geometry.
const pendingDescription=['区域职能与场地资料待确认。','Regional functions and site information are awaiting confirmation.'];
export const getLocationProfile=id=>locationProfiles[id]||{
  id,role:['区域资料待确认','Region awaiting confirmation'],summary:pendingDescription,
  enter:['查看区域资料','View regional information'],missing:pendingDescription,
  chapters:[chapter('overview',['区域总览','Regional overview'],['资料待完善','Details to be added'],['区域信息','REGIONAL INFORMATION'],pendingDescription)],stops:{overview:[]},
};
