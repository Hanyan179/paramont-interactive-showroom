// Authored business scenarios for the animation, not observed market or sales results.
// The existing product geometry is retained as a concept sample. See docs/智能展厅内容依据.md.
export const proposalDirections = [
 {
  id:'lip',title:['便携单品','Portable single'],subtitle:['减少携带，聚焦一种用途','Carry less. Focus on one use.'],tag:['便携需求','PORTABILITY'],
  facts:[['需求：轻便、随手取用','Need: light and easy to reach'],['成本：核对容器与包装','Cost: container and packaging'],['下一步：验证密封与耐用','Next: test closure and durability']],
  review:['保留 · 便携需求清楚，核对包装成本','KEEP · Clear need; review packaging cost'],accent:'#d3a6a9',
 },
 {
  id:'cheek',title:['礼赠包装款','Gift-ready format'],subtitle:['让包装服务于送礼场景','Design packaging for gifting'],tag:['礼赠场景','GIFTING'],
  facts:[['需求：开箱体验与保护','Need: presentation and protection'],['成本：增加内托与外包装','Cost: insert and outer packaging'],['下一步：核对成本与利润','Next: review cost and margin']],
  review:['暂缓 · 包装投入与利润空间待核对','DEFER · Packaging cost and margin need review'],accent:'#d9a395',
 },
 {
  id:'tint',title:['多规格系列','Multi-size range'],subtitle:['用不同规格覆盖使用差异','Match sizes to different needs'],tag:['规格组合','SIZE RANGE'],
  facts:[['需求：不同用量与购买频次','Need: usage and purchase frequency'],['库存：多规格分别备货','Stock: plan each size separately'],['下一步：核对销量与库存','Next: review sales and stock']],
  review:['暂缓 · 各规格销量与备货量待验证','DEFER · Validate demand and stock by size'],accent:'#c8b396',
 },
 {
  id:'light',title:['精简功能款','Focused essential'],subtitle:['留下核心用途，减少冗余','Keep the core use. Remove excess.'],tag:['功能取舍','FUNCTION / COST'],
  facts:[['需求：解决一个明确问题','Need: solve one clear problem'],['结构：保留必要功能','Form: retain essential features'],['下一步：验证简化后的体验','Next: test the simpler design']],
  review:['保留 · 聚焦核心用途，验证使用体验','KEEP · Focused use; test the experience'],accent:'#d7cdb4',
 },
 {
  id:'palette',title:['一体组合款','Integrated set'],subtitle:['把互补用途放进一个产品','Bring complementary uses together'],tag:['组合开发','PRODUCT COMBINATION'],
  facts:[['需求：多用与便携','Need: versatility and portability'],['结构：分区与一体收纳','Form: divided, integrated storage'],['下一步：打样、报价、备货评审','Next: sample, quote and stock review']],
  review:['选中打样 · 互补组合，继续验证成本与交付','SAMPLE · Complementary uses; validate cost and delivery'],accent:'#cdb7a4',
 },
];
export const researchReports = [
 {
  title:['客户反馈摘要','Customer feedback'],kind:['评价与使用场景 · 演示摘录','REVIEWS / ILLUSTRATIVE EXCERPTS'],
  lines:[['“出门希望少带几件。”','“I want fewer things to carry.”'],['“包装完好，收纳也方便。”','“Arrived intact. Easy to store.”'],['提炼需求：便携、保护与收纳','Needs: portability, protection, storage']],
  question:['反馈需结合销量与实际使用验证','Validate against sales and actual use'],
 },
 {
  title:['商品主数据','Product records'],kind:['商品档案 · 字段示意','PRODUCT MASTER / EXAMPLE FIELDS'],
  lines:[['规格：品类、尺寸与重量','Specs: category, size and weight'],['结构：材料、部件与包装','Build: materials, parts and packaging'],['素材：图片、图纸与版本','Assets: images, drawings and versions']],
  question:['用商品编码关联资料与后续订单','Link records and orders by product ID'],
 },
 {
  title:['市场趋势研判','Market trend review'],kind:['市场资料与行业知识 · 分析框架','RESEARCH / ANALYSIS FRAMEWORK'],
  lines:[['观察：需求、场景与产品变化','Observe: needs, use and product shifts'],['对照：历史畅销要素与新趋势','Compare: past strengths and new trends'],['验证：适用人群与渠道差异','Test: audience and channel differences']],
  question:['保留来源与日期，区分趋势和假设','Keep sources and dates; test hypotheses'],
 },
 {
  title:['销售与需求预测','Sales / demand plan'],kind:['历史销售与备货 · 分析框架','SALES HISTORY / PLANNING FRAMEWORK'],
  lines:[['历史：按产品、时期与渠道对照','History: product, period and channel'],['预测：标明需求判断与假设','Forecast: state demand assumptions'],['备货：结合库存与交付周期','Stock: account for inventory and lead time']],
  question:['对比预测与实销，再调整补货计划','Compare forecast to sales; adjust stock'],
 },
 {
  title:['成本与利润测算','Cost / margin review'],kind:['报价与产品结构 · 待核算','QUOTES / COST REVIEW PENDING'],
  lines:[['成本：材料、加工、包装与运输','Cost: materials, labor, pack and freight'],['报价：核对规格、数量与交期','Quote: check specs, quantity and timing'],['利润：比较售价与完整成本','Margin: compare price with full cost']],
  question:['报价未确认前，不输出利润结论','No margin claim before quotes are checked'],
 },
 {
  title:['履约与库存复盘','Fulfillment / stock'],kind:['订单与经营反馈 · 复盘框架','ORDERS / REVIEW FRAMEWORK'],
  lines:[['交付：核对规格、数量与交期','Delivery: specs, quantity and timing'],['库存：识别缺货、积压与补货','Stock: shortages, excess and reorder'],['复盘：利润、评价与预测偏差','Review: margin, feedback and forecast error']],
  question:['经营结果回到下一轮开发与补货','Feed results into development and stock'],
 },
];
// Six sources each contribute six fragments to the corresponding cube report.
export const informationFragments = [
 ['Review · easy to carry','评价 · 方便携带'],['Review · fewer pieces','评价 · 少带几件'],['Review · arrived intact','评价 · 包装完好'],['Review · easy to store','评价 · 收纳方便'],['Review · clear instructions','评价 · 说明清楚'],['Review · daily use','评价 · 日常使用'],
 ['Product · category code','商品 · 品类编码'],['Product · dimensions','商品 · 尺寸重量'],['Product · materials','商品 · 材料结构'],['Asset · product image','素材 · 商品图片'],['Asset · specification','素材 · 规格图纸'],['Record · version date','档案 · 版本日期'],
 ['Market · usage occasions','市场 · 使用场景'],['Market · channel needs','市场 · 渠道需求'],['Research · industry report','研究 · 行业报告'],['Trend · product changes','趋势 · 产品变化'],['Knowledge · proven elements','知识 · 历史畅销要素'],['Source · publication date','来源 · 发布日期'],
 ['Sales · product history','销售 · 商品历史'],['Sales · channel mix','销售 · 渠道结构'],['Sales · seasonality','销售 · 季节变化'],['Forecast · demand assumptions','预测 · 需求假设'],['Stock · reorder plan','备货 · 补货计划'],['Forecast · actual comparison','预测 · 实销对照'],
 ['Cost · materials','成本 · 材料'],['Cost · processing','成本 · 加工'],['Cost · packaging','成本 · 包装'],['Cost · freight','成本 · 运输'],['Quote · order quantity','报价 · 订单数量'],['Margin · price and cost','利润 · 售价与成本'],
 ['Order · confirmed specs','订单 · 确认规格'],['Delivery · lead time','交付 · 履约周期'],['Quality · inspection','质量 · 检查记录'],['Stock · shortage','库存 · 缺货'],['Stock · excess','库存 · 积压'],['Review · customer feedback','复盘 · 客户反馈'],
];
