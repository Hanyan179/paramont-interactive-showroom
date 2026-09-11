import {groupEN,historyEN} from '../components/companyCopy.js';
import {getLocationProfile} from '../components/locationProfiles.js';
const pair = (zh,en) => [zh,en];
const conceptCaption=pair('视觉概念图 · 非实际产品或场地','Visual concept · Not an actual product or site');
const image=(name,caption=conceptCaption)=>({src:`/media/generated/${name}`,caption});
const conceptStatus=pair('流程示意 · 待真实资料补充','Workflow study · Actual materials pending');

const research = [
  {title:pair('从国际信号，到研究线索','From global signals to research leads'), summary:pair('先理解变化发生在哪里，再讨论它与产品的关系。','Understand where change is happening before relating it to a product.'),cover:image('a2-sketchbook.png'),topics:[
    [pair('公开趋势','Public trends'),pair('从公开研究、设计报道和行业资料中记录变化。每条线索保留原始链接、发布时间、观察市场和原文语境，便于后续复核。','Record changes from public research, design reporting and industry material. Keep the original link, publication date, market and context for review.'),pair('一条趋势只是研究起点。需要比较多个来源，区分长期变化、季节现象和短期热度，再决定是否进入品类研究。','A trend is a starting point. Compare sources and distinguish enduring changes, seasonal patterns and brief attention before taking it into category research.')],
    [pair('市场观察','Market observation'),pair('围绕具体市场记录陈列方式、使用场景、产品组合与价格区间。同一品类在不同渠道的呈现需要分别观察。','Observe merchandising, use occasions, product combinations and price ranges in a specific market. Different channels may present the same category differently.'),pair('保留样本范围与观察时间。局部渠道中的发现不直接代表整个市场，也不应变成未经验证的销量或份额。','Keep the sample scope and observation date. Findings from a channel do not establish market-wide demand, sales or market share.')],
    [pair('消费者表达','Consumer expression'),pair('从公开评价与需求表达中识别使用中的问题：为什么购买、在哪使用、哪里不方便，以及期待怎样的改进。','Identify use problems in public reviews and expressed needs: reasons for buying, context, friction and desired improvements.'),pair('把原始表达与团队解释分开记录。重复出现的问题可以成为验证线索，产品判断仍需要样品和目标用户反馈。','Separate original expression from team interpretation. Recurring problems suggest validation questions; product decisions still require samples and target-user feedback.')]
  ]},
  {title:pair('让品类机会，变得具体','Make category opportunities tangible'),summary:pair('把使用场景、产品形态与材料语言放在同一份研究中。','Study use occasions, product form and material language together.'),cover:image('b1-wooden-arches.png'),topics:[
    [pair('使用场景','Use occasion'),pair('先描述谁在什么情境中使用产品，以及希望完成什么。把场景拆成使用前、使用中与收纳携带，寻找值得改善的细节。','Describe who uses a product, in what context, and for what purpose. Study preparation, use, storage and transport to identify details worth improving.'),pair('输出应是一组具体问题与验证方式，便于客户和设计团队讨论优先级。','The output is a set of concrete questions and validation methods for discussing priorities with customers and designers.')],
    [pair('产品形态','Product form'),pair('比较体量、握持、开合、组合与陈列方式，说明每种设计选择服务于哪个使用需要。','Compare scale, grip, opening, combinations and display. Explain the user need served by each design choice.'),pair('图像用于说明方向。形态是否可制造、成本是否适合，需要在开发与样品阶段确认。','Images communicate direction. Manufacturing feasibility and cost fit require development and sample validation.')],
    [pair('材料与色彩','Materials & colors'),pair('用材质、表面、触感与配色组织视觉方向，并记录适用场景及参考来源。','Organize a visual direction through materials, finishes, touch and color, with its use context and references.'),pair('概念图中的材质表现不等于真实规格。接入实物资料后，再说明实际材料、测试依据与工艺条件。','Material appearance in a concept image is not a specification. Actual materials, testing and process conditions follow verified sample information.')]
  ]},
  {title:pair('让人工智能，参与创造','Bring AI into creative exploration'),summary:pair('把整理、关联与探索交给工具，把判断与确认留给团队。','Use tools to organize, connect and explore; keep judgment and confirmation with the team.'),cover:image('a3-paper-mountains.png'),topics:[
    [pair('整理与关联','Organize & connect'),pair('人工智能可以辅助归纳资料、聚合同类问题，并建立趋势、品类与使用场景之间的关联。每条归纳应保留对应依据。','AI can help summarize material, group similar questions and connect trends with categories and use occasions. Each synthesis should retain its supporting evidence.'),pair('需要记录输入范围与未覆盖的信息；来源不足时应保留不确定性，不能把生成内容当成新增事实。','Record input scope and gaps. Preserve uncertainty where sources are insufficient; generated content is not an additional fact.')],
    [pair('创意探索','Explore concepts'),pair('以清晰的设计问题和约束作为输入，探索不同形态、配色与应用方向，再把差异整理成便于比较的方案。','Start from a clear design question and constraints. Explore form, color and use directions, then organize the differences into comparable options.'),pair('生成图用于讨论与启发。选择方向后仍需设计深化、工艺判断与样品验证。','Generated images support discussion and inspiration. A selected direction still needs design development, process review and sample validation.')],
    [pair('人工复核','Human review'),pair('团队检查来源是否可靠、解释是否准确、方向是否符合客户需求，并标记保留、修改或暂不采用的内容。','The team checks source reliability, interpretation and customer fit, marking what to retain, revise or set aside.'),pair('当前页面演示的是协作方式。具体工具、执行记录和真实成果将在资料确认后接入，不代表已经运行的分析服务。','This page illustrates a collaboration approach. Specific tools, execution records and actual outcomes will follow confirmed material; it is not a live analysis service.')]
  ]},
  {title:pair('从洞察，到产品方向','From insight to product direction'),summary:pair('让研究结论进入设计讨论，并以样品与反馈继续验证。','Bring research into design discussion and continue validation through samples and feedback.'),cover:image('b2-paper-kit.png'),topics:[
    [pair('系列开发','Collection development'),pair('围绕一致的使用需要、视觉语言与组合关系组织产品方向，让系列中的每一件产品有清楚的角色。','Organize a collection around coherent use needs, visual language and combinations, giving each product a clear role.'),pair('说明哪些方向来自研究、哪些是设计假设，以及需要进一步验证的范围。','Identify what comes from research, what is a design hypothesis, and what still needs validation.')],
    [pair('设计方案','Design direction'),pair('用草图、效果图与关键细节说明方向，关联其要解决的问题和选择理由。保留备选方案便于比较。','Use sketches, visuals and key details to explain a direction, the problem it addresses and why it was chosen. Retain alternatives for comparison.'),pair('设计讨论需要结合开发、成本与材料条件；视觉方案不直接作为量产承诺。','Design discussion considers development, cost and materials. A visual concept is not a production commitment.')],
    [pair('样品验证','Sample validation'),pair('将设计问题转成可以观察的验证项目，检查使用体验、形态、色彩与工艺表达，并记录反馈。','Translate design questions into observable checks for use, form, color and process expression, recording feedback.'),pair('确认后的资料可以关联到品牌与产品档案，继续查看样品、多角度图片及款式信息。','Confirmed material can link to brand and product records for samples, views and style information.')]
  ]}
];

export function analysisDocument(stage) {
  const data=research[stage]; if(!data)return null;
  return {id:`analysis-${stage}`,category:pair('数据洞察 / 方法说明','Intelligence / Approach'),status:conceptStatus,title:data.title,summary:data.summary,cover:data.cover,
    sections:data.topics.map(([title,...paragraphs],i)=>({id:`topic-${i}`,title,blocks:[{type:'paragraph',text:paragraphs[0]},...(stage===1&&i===1?[{type:'gallery',images:[image('a1-markers.png',pair('色彩与握持 · 视觉概念','Color and grip · Visual concept')),image('a2-sketchbook.png',pair('纸本与开合 · 视觉概念','Paper and opening · Visual concept')),image('b1-wooden-arches.png',pair('组合与平衡 · 视觉概念','Composition and balance · Visual concept'))]}]:[]),{type:'paragraph',text:paragraphs[1]}]})),
    sources:[{label:pair('内容依据','Content basis'),description:pair('展厅流程设计示意；并非研究报告、实时分析结果或已验证业绩。','An exhibition workflow study, not a research report, live result or verified business outcome.')}]};
}

export function companyStoryDocument(official,chapter) {
  if(!official||chapter!==2&&chapter!==3)return companyDocument(official);
  const network=chapter===2,items=network?official.company_groups:official.history;
  return {id:network?'company-network':'company-history',category:pair('公司介绍','Company'),
    status:pair('官网资料整理 · 展示文案待确认','Official source summary · Copy awaiting confirmation'),
    title:network?pair('协作网络','Our companies'):pair('时间足迹','Our story'),
    summary:network?pair('不同专长，共同创造。','Different strengths. Shared possibility.'):pair('每一步，构筑下一步。','Every chapter builds the next.'),
    sections:items.map((item,i)=>({id:`${network?'company':'year'}-${i}`,title:network?item.name:String(item.year),
      paragraphs:[network?pair(item.description_zh,groupEN[i]):pair(item.summary_zh,historyEN[i]+(i===5?' The source’s capital-market wording awaits confirmation; no listing status is implied.':''))]})),
    sources:[...new Set(items.map(item=>item.source_url))].map((url,i)=>({label:pair(`官网依据 ${i+1}`,`Official source ${i+1}`),url})),updated:official.retrieved_at_utc?.slice(0,10)};
}

export function companyDocument(official) {
  if(!official)return null;
  return {id:'company-introduction',category:pair('公司介绍 / 能力概览','Company / Capabilities'),status:pair('官网资料整理 · 展示文案待确认','Official source summary · Copy awaiting confirmation'),title:pair('把想象，变成日常','Imagination, made everyday'),summary:official.hero_copy.supporting_copy_zh?[official.hero_copy.supporting_copy_zh,official.hero_copy.supporting_copy_en]:null,cover:image('a1-markers.png'),
    sections:official.capabilities.map(c=>({id:c.id,title:c.title,paragraphs:[c.description]})),
    sources:[...new Set(official.capabilities.map(c=>c.source_url))].map((url,i)=>({label:pair(`官网依据 ${i+1}`,`Official source ${i+1}`),url})),
    updated:official.retrieved_at_utc?.slice(0,10)};
}

export function locationDocument(location,chapter,focus) {
  const profile=getLocationProfile(location.id),current=profile.chapters.find(c=>c.id===chapter)||profile.chapters[0];
  const stops=profile.stops[chapter]||[],selected=stops.find(s=>s.id===focus),supplied=location.capabilities?.[chapter];
  const sectionStops=selected?[selected]:stops;
  return {id:`location-${location.id}-${chapter}-${focus||'overview'}`,category:pair(`${location.name[0]} / ${current.name[0]}`,`${location.name[1]} / ${current.name[1]}`),status:conceptStatus,
    title:selected?.name||supplied?.title||current.title,summary:selected?.description||supplied?.description||current.description,
    sections:[...sectionStops.map(s=>({id:s.id,title:s.name,paragraphs:[s.description]})),
      ...(supplied?.items||[]).map((item,i)=>({id:`material-${i}`,title:item.name,paragraphs:[item.description]})),
      {id:'context',title:pair('资料与展示范围','Content and scope'),paragraphs:[profile.missing,pair('本空间为业务概念演绎，不是实际场地、设备或能力证明。具体城市、工艺及质量文件，以后续确认资料为准。','This is a business concept, not evidence of an actual site, equipment or capability. Cities, processes and quality documents require confirmed material.')]}],
    sources:[{label:pair('业务分工','Business role'),description:profile.role}],attachments:supplied?.documents||[]};
}

export function productDocument(product,sku,media) {
  if(!product)return null;
  const pictures=(sku?.media?.images||media?.images||[]).map(p=>({src:`/modules/product-explorer/${p.src}`,caption:pair(`${p.label[0]} · 原创概念渲染`,`${p.label[1]} · Original concept render`)}));
  return {id:`product-${product.id}-${sku?.id||'default'}`,category:pair('品牌与产品 / 样品档案','Brands & products / Sample dossier'),status:pair('原创概念 · 非真实商品','Original concept · Not an actual product'),
    title:product.name,summary:product.topic,cover:pictures[0],sections:[
      {id:'design',title:pair('设计与应用','Design and use'),paragraphs:[product.description,product.application]},
      {id:'style',title:sku?.name||pair('材质与形态','Material and form'),paragraphs:[sku?.material,sku?.form,product.materialStatus].filter(Boolean),images:pictures.slice(1)},
      {id:'provenance',title:pair('资料说明','About this record'),paragraphs:[pair('图片、款式与编号用于展示设计方向，不作为真实商品规格或品牌归属依据。','Images, styles and codes illustrate a design direction. They do not establish actual specifications or brand ownership.')]}
    ],sources:[{label:pair('品类依据','Category basis'),description:typeof product.source==='string'?pair(product.source,product.source.replace(/ · 品类$/,' · Categories')):product.source}]};
}
