// Authored design hypotheses for comparison, never customer or market results.
export const intelligenceProposals = [
  {id:'A',name:['产品成形','Product studio'],title:['让一个需要，\n成为一件好产品。','One need.\nA considered product.'],description:['从便携收纳这一设计假设出发，观察工具、内托与盒盖如何共同回应使用需要。','Explore how tools, an insert and a hinged case could respond to a need for portable creativity.'],steps:[
    ['选择 · 便携创作','CHOOSE · PORTABLE CREATIVITY'],['成形 · 打开与取放','SHAPE · OPEN AND REACH'],['验证 · 收纳是否稳固','REVIEW · DOES IT STAY IN PLACE?']],questions:[
    ['设计假设：一套工具，也能随行。','Design hypothesis: one creative set, ready to carry.'],['独立工具、分区内托与铰链共同构成使用关系。','Individual tools, compartments and hinges work together.'],['待验证：合盖后是否稳固？儿童能否独立取放？','To validate: secure when closed, easy to use independently?']],
    outcome:['一件可进入样品评审的产品方向。','A product direction ready for a sample review.']},
  {id:'B',name:['全球洞察','Market lens'],title:['从世界的线索，\n找到产品的方向。','Read the world.\nShape a response.'],description:['选择一个研究区域，用同一套问题审视使用情境，再把待验证方向带入产品结构。','Select a research region, examine the context and bring a hypothesis into a product structure.'],steps:[
    ['研究 · 明确使用情境','RESEARCH · FRAME THE CONTEXT'],['响应 · 形成产品方向','RESPOND · SHAPE THE PRODUCT'],['回流 · 保留验证问题','RETURN · KEEP THE QUESTIONS']],questions:[
    ['研究入口示意：区域用于组织资料，不代表已发现机会。','Regions organize research; no market finding is claimed.'],['共用假设：便携，还是桌面共享？由实际资料决定。','Shared hypothesis: portable or shared use? Evidence must decide.'],['待补充区域资料、来源日期与样品评审记录。','Regional sources, dates and sample feedback are still needed.']],
    outcome:['一个有待证据支持的区域产品提案。','A regional product proposal awaiting evidence.']},
  {id:'C',name:['客户选品','Assortment studio'],title:['让每一次选入，\n都有清楚的理由。','Every piece.\nA reason to belong.'],description:['围绕创作这一使用主题，比较随行与桌面两种组合，观察产品如何加入、替换与收敛。','Compare portable and desktop creative sets. Watch products join, change and settle into a coherent proposal.'],steps:[
    ['选择 · 定义组合条件','CHOOSE · DEFINE THE BRIEF'],['组合 · 形成互补关系','COMPOSE · BRING PIECES TOGETHER'],['评审 · 留下取舍理由','REVIEW · RETAIN THE REASONING']],questions:[
    ['假设场景：随行创作，或桌面共享。','Hypothetical brief: creativity on the go, or shared at a desk.'],['主套装、画本与独立工具，按使用关系组成提案。','The case, sketchbook and tools form a considered set.'],['待验证：组合是否完整？是否存在重复或遗漏？','To validate: is the set complete, without redundant pieces?']],
    outcome:['一套可讨论、可修订的选品提案。','An assortment ready to discuss and revise.']},
];

export const researchRegions=[
  {name:['北美','North America'],longitude:-100,latitude:40},
  {name:['欧洲','Europe'],longitude:15,latitude:49},
  {name:['亚太','Asia Pacific'],longitude:115,latitude:28},
];

export function proposalSample(time=0,step=null,reduced=false){
  const clock=reduced?0:Math.max(0,Number.isFinite(time)?time:0);
  const phase=Number.isInteger(step)?Math.max(0,Math.min(2,step)):Math.floor(clock/8)%3;
  return {phase,local:clock%8,clock};
}

export function proposalCase(scheme){
  const p=intelligenceProposals.find(item=>item.id===scheme)||intelligenceProposals[0];
  return {title:p.title.map((text,i)=>text.replace('\n',i===1?' ':'')),summary:p.description,steps:p.questions,outcome:p.outcome};
}
