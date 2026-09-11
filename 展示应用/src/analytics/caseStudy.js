// One authored, local design study. No measured weights or generated market facts.
export const study = {
  id:'creative-play',
  title:['下一季，如何让玩耍更有创造力？','What could creative play become next season?'],
  category:['儿童创意用品','Children’s creative products'],
  period:['下一季 · 时间待确认','Next season · Timing to confirm'],
  status:['设计示例 · 非市场研究结论','Design study · Not market research findings'],
  markets:[{id:'all',label:['国际市场','International markets']},{id:'us',label:['美国','United States']},{id:'eu',label:['欧洲','Europe']},{id:'au',label:['澳洲','Australia']}],
};
export const studyStages=[
  {title:['国际趋势','Global signals'],heading:['从信号，找到值得研究的问题。','Find the questions worth exploring.'],caption:['公开趋势、使用情境与设计观察，汇入研究主题。','Connect public signals, use contexts and design observations.']},
  {title:['品类洞察','Category insight'],heading:['把需要，展开为设计选择。','Turn a need into design choices.'],caption:['同一个主题，从场景、形态与材料三个角度展开。','Explore one theme through context, form and materials.']},
  {title:['人工智能协同','AI collaboration'],heading:['让每一条关联，都有来处。','Give every connection a traceable origin.'],caption:['辅助归类、探索候选方向，保留待复核的判断。','Assist grouping and exploration. Keep judgments open to review.']},
  {title:['产品方向','Product direction'],heading:['让一个方向，变得可以讨论。','Make a direction tangible.'],caption:['设计依据与概念样品相连，继续验证而非直接定案。','Connect design reasoning to a concept sample for further validation.']},
];
export const lenses=[['使用场景','Use context'],['产品形态','Product form'],['材料语言','Material language']];
export const paths=[
  {id:'together',color:'#8edddd',theme:['共同玩耍','Play together'],source:['使用情境','Use context'],sourceKind:['消费者记录待采集','Consumer records pending'],opportunity:['组合与协作','Arrange & collaborate'],direction:['开放式几何拼合','Open-ended shapes'],productId:'puzzle',skuId:'puzzle-01',image:'/modules/product-explorer/studies/puzzle-0.png',
    question:['两个人如何用同一组形状，创造不同的玩法？','How could two people invent different ways to play with the same shapes?'],
    finding:['把“共同完成”作为设计问题，观察摆放、轮流与重新组合。','Use shared creation as a design question: placing, taking turns and rearranging.'],
    matrix:[['亲子桌面共玩','Shared tabletop play'],['可重组的几何件','Rearrangeable shapes'],['柔色与木质感','Soft color & wood feel']],
    notes:[['观察轮流操作时，组件是否容易取放与共享。需要实际使用记录验证。','Observe whether pieces are easy to reach and share during turn-taking. Actual use records are needed.'],['以圆、方、三角建立可重新排列的组合。当前概念尚未验证玩法与尺寸。','Explore rearrangeable circles, squares and triangles. Play patterns and dimensions remain untested.'],['用柔和配色区分角色。图像中的木质感不等于已确认材料或安全规格。','Use soft colors to distinguish roles. The wood appearance is not a verified material or safety specification.']],
    reason:['把共同操作与可重组形态相连，是本示例的设计假设。人工智能可以辅助整理类似表达，不能据此认定市场需求。','Connecting shared use to rearrangeable forms is an authored hypothesis. AI could help group similar expressions; it would not establish market demand.'],
    review:['待收集亲子共玩记录；核对组件尺寸、使用年龄与材料要求。','Collect shared-play observations; review part sizes, age suitability and material requirements.'],
  },
  {id:'discover',color:'#ddbc80',theme:['形状与触感','Shape & touch'],source:['设计观察','Design observation'],sourceKind:['本地概念资料','Local concept material'],opportunity:['层叠与探索','Stack & explore'],direction:['可反复组合的彩环','Colors to stack again'],productId:'rings',skuId:'rings-02',image:'/modules/product-explorer/studies/rings-02-0.png',
    question:['大小、形状与触感，能否成为反复探索的线索？','Could size, form and touch invite repeated exploration?'],
    finding:['从现有彩环概念出发，拆开“抓握—组合—收纳”的设计问题。','Use the existing ring concept to examine grasping, combining and storing.'],
    matrix:[['独立探索与陪伴','Solo & shared discovery'],['大小递进的环形件','Graduated ring forms'],['自然色与圆润边缘','Natural color & soft edges']],
    notes:[['比较独立探索与成人陪伴两种情境，记录抓握、移动与放回的过程。','Compare solo exploration with adult-supported play; observe grasping, moving and replacing pieces.'],['递进尺寸与环形开口是当前概念的形态语言，是否易用仍需样品验证。','Graduated sizes and ring openings define the concept. Usability still requires sample validation.'],['森林配色用于讨论视觉方向；不推断环保、材料认证或教育效果。','The forest palette supports a visual discussion. No environmental certification or learning outcome is implied.']],
    reason:['从本地概念档案抽取形状、触感与层叠三个描述，关联成候选方向。本图是预设关系，尚未执行人工智能分析。','Extract shape, touch and layering from the local concept record to form a candidate direction. This authored graph is not the output of an AI run.'],
    review:['待验证抓握与组合体验；确认材料、尺寸、年龄及适用市场要求。','Validate grasping and stacking; confirm materials, dimensions, ages and relevant market requirements.'],
  },
  {id:'portable',color:'#a5adf3',theme:['随行创作','Create on the go'],source:['公开趋势','Public signals'],sourceKind:['公开研究待采集','Public research pending'],opportunity:['折叠与携带','Fold & carry'],direction:['便携纸艺创作包','Portable paper studio'],productId:null,skuId:null,image:'/media/generated/b2-paper-kit.png',
    question:['一套创作材料，怎样在途中展开，又轻松收起？','How could a creative kit unfold on the go and pack away easily?'],
    finding:['先提出“展开—创作—收起”的研究问题，再寻找公开资料与使用记录。','Start with unfolding, making and packing away; then seek public sources and use records.'],
    matrix:[['旅途与短时创作','Travel & short sessions'],['折叠式材料组织','Foldable organization'],['纸本与色彩分区','Paper & color zones']],
    notes:[['空间有限的情境是待验证假设，尚无真实消费者记录支持。','Limited-space use is a hypothesis, without consumer records to support it yet.'],['探索展开和收纳的顺序，后续以样品检查组件数量与操作负担。','Explore unfolding and packing order; use samples to test part count and effort.'],['现有图片为纸艺视觉概念；未关联到产品档案，也没有已确认的材料规格。','The image is a paper-craft visual study. It has no linked product record or confirmed material specification.']],
    reason:['将携带场景与折叠结构相连，属于候选设计假设。缺少原始来源时，关系需保持待验证。','Linking portability to folding is a candidate design hypothesis. Without original sources, the relationship remains unverified.'],
    review:['先补充公开来源与使用记录，再决定是否开展样品开发。','Collect public sources and use records before deciding on sample development.'],
  },
];
export const initialStudySelection={path:null,market:'all',lens:0,compare:null,node:'theme'};
export const presentedStudySelection=stage=>({...initialStudySelection,path:'discover',lens:stage===1||stage===3?1:0,node:stage===2?'review':'theme'});
export function pathById(id){return paths.find(p=>p.id===id)||null;}
export function selectedStudyPath(selection){return pathById(selection.path);}
export function studySelection(state,patch){
  const next={...state,...patch};
  if(!pathById(next.path))next.path=null;
  if(!study.markets.some(m=>m.id===next.market))next.market='all';
  if(!Number.isInteger(next.lens)||next.lens<0||next.lens>2)next.lens=0;
  if(!pathById(next.compare)||next.compare===next.path)next.compare=null;
  if(!['source','theme','opportunity','review'].includes(next.node))next.node='theme';
  return next;
}
export function linkedStudyProduct(path,data){
  if(!path?.productId||!data)return null;
  const product=data.concepts.items.find(p=>p.id===path.productId);
  const sku=data.skus.items.find(s=>s.id===path.skuId&&s.productId===path.productId);
  return product&&sku?{productId:product.id,skuId:sku.id}:null;
}
export function studyDocument(selection){
  const p=selectedStudyPath(selection);if(!p)return null;
  const market=study.markets.find(m=>m.id===selection.market)||study.markets[0];
  return {id:`study-${study.id}-${p.id}-${market.id}`,category:['数据分析 / 设计依据','Data analysis / Design reasoning'],status:study.status,
    title:p.direction,summary:p.question,cover:{src:p.image,caption:['概念图 · 非真实商品','Concept image · Not an actual product']},
    sections:[
      {id:'source',title:['来源与适用范围','Source and scope'],paragraphs:[p.sourceKind,p.finding,['拟研究市场：'+market.label[0]+'。资料日期：待提供。当前没有已验证的趋势序列或消费者原文。','Planned market: '+market.label[1]+'. Source date: not supplied. No verified time series or original consumer statement is included.']]},
      {id:'interpretation',title:['从问题到设计','From question to design'],paragraphs:p.notes},
      {id:'reasoning',title:['归类与关联理由','Grouping and connection'],paragraphs:[p.reason,['人工智能辅助流程为预设演示，未运行在线模型；没有虚构的置信度或增长指标。','The AI-assisted process is an authored demonstration, without a live model run, confidence scores or growth metrics.']]},
      {id:'review',title:['人工复核与下一步','Human review and next steps'],paragraphs:[p.review,['待补材料：原始报告、日期与市场、原文片段、使用图片、复核记录。预计阅读时间仅供参考。','Materials needed: original reports, dates and markets, source excerpts, use images and review records. Reading time is an estimate only.']]},
    ],sources:[{label:['内容依据','Content basis'],description:p.productId?['现有本地概念样品档案与本次设计假设；不构成市场验证、量产承诺或品牌归属依据。','Existing local concept record and this design hypothesis; not market validation, a production commitment or evidence of brand ownership.']:['现有原创纸艺概念图与本次设计假设；尚无对应样品档案。','Existing original paper-craft concept image and this design hypothesis; no matching sample record.']}],
  };
}
