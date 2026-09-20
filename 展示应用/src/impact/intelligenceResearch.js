// Catalog facts are traceable; all product proposals, reviews and analyses are authored concepts.
// Pair order is [Chinese, English], except informationFragments, which preserves its [English, Chinese] contract.
export const proposalDirections = [
 {
  id:'pencils',title:['随行绘画笔组','Pocket pencil set'],subtitle:['把常用颜色带在身边','Everyday colours, ready to travel'],tag:['使用场景 / 随身绘画','USE / DRAW ON THE GO'],
  facts:[['保留常用颜色，减少出门时的携带负担。','Keep everyday colours; carry fewer tools.'],['笔尖需要独立保护，避免在包内折损。','Protect each tip from damage in a bag.'],['先验证握持手感，再确认笔套与包装成本。','Test the grip, then quote the sleeve and pack.']],
  review:['保留 · 便携需求清楚，笔尖保护需要验证','KEEP · Clear use; test tip protection'],accent:'#a5c2ce',
 },
 {
  id:'gift',title:['绘画礼赠套装','Drawing gift box'],subtitle:['先拆包装成本，再判断礼赠价值','Review the packaging before the gift premium'],tag:['成本分析 / 礼赠包装','COST / GIFT PACKAGING'],
  facts:[['外盒、内托和装饰分别报价，避免漏算。','Quote the box, insert and decoration separately.'],['先确认目标售价能否覆盖新增包装成本。','Check whether the price supports extra packaging.'],['报价未齐，暂缓进入样品开发。','Defer sampling until the full quote is available.']],
  review:['暂缓 · 包装报价未齐，利润空间仍待核算','DEFER · Complete the quote before margin review'],accent:'#b9bbb5',
 },
 {
  id:'range',title:['多规格绘画系列','Drawing size range'],subtitle:['规格越多，越需要看清各自需求','More sizes need clearer demand evidence'],tag:['销售预测 / 分规格备货','FORECAST / STOCK BY SIZE'],
  facts:[['基础笔组','Core pencil set'],['扩展颜色组','Extended colours'],['整套工具组','Complete tool set']],
  review:['暂缓 · 各规格销量与库存记录尚待对照','DEFER · Compare sales and stock for each size'],accent:'#a6b7c5',
 },
 {
  id:'organizer',title:['桌面分区收纳','Desktop organiser'],subtitle:['让常用工具取用顺手，归位清楚','Keep everyday tools visible and easy to reach'],tag:['功能取舍 / 收纳结构','FUNCTION / ORGANISED STORAGE'],
  facts:[['笔具竖放，常用颜色一眼可见。','Store pencils upright, with colours in view.'],['小件分区，避免橡皮与削笔器混放。','Give erasers and sharpeners their own space.'],['保留收纳结构，便携能力交由组合款验证。','Keep the dividers; test portability in the kit.']],
  review:['保留 · 分区收纳可复用，继续验证便携结构','KEEP · Reuse the dividers; test portability'],accent:'#a8c1b9',
 },
 {
  id:'drawing-kit',title:['随行绘画收纳盒','Portable drawing kit'],subtitle:['把绘画工具和收纳结构放进同一个盒子','Drawing tools and organised storage in one case'],tag:['组合提案 / 选中打样','COMBINED CONCEPT / SAMPLE'],
  facts:[['笔组负责勾画，颜料补充上色。','Pencils for sketching; paints for colour.'],['小件独立归位，纸卡平整收纳。','Separate small tools and keep paper flat.'],['带着完整结构，核对报价与交付条件。','Quote the complete design and confirm delivery.']],
  review:['选中打样 · 合并绘画与收纳，验证成本和交付','SAMPLE · Combine drawing and storage; validate cost'],accent:'#a8c4d1',
 },
];
export const researchReports = [
 {
  title:['客户使用反馈','Customer feedback'],kind:['评价资料 / 演示摘录','REVIEWS / AUTHORED EXCERPTS'],
  lines:[['“出门画画不用再找几个袋子，常用的东西放在一起就好。”','“I would rather carry one case than several bags of drawing tools.”'],['“笔和纸容易整理，小件最好也能有各自的位置。”','“Pencils and paper are easy to pack. Small tools need their own spaces.”'],['关注携带、取用与收纳，也记录不方便的地方。','Record difficulties with carrying, access and storage.']],
  question:['反馈是需求线索，需要结合实际使用验证。','Use feedback as a lead; validate it in use.'],
  source:['创作的评价示例，并非实际客户记录','Authored examples, not actual customer records'],
 },
 {
  title:['商品分类档案','Product category records'],kind:['主数据 / 现有目录摘录','MASTER DATA / CATALOG EXCERPT'],
  lines:[['006：马克笔','006: Markers'],['004：蜡笔','004: Crayons'],['228：橡皮','228: Erasers']],
  question:['这些是细类编码；商品规格需另行关联。','These are subcategory codes, not product IDs.'],
  source:['来源：2026.9.10 存档 · 文具品类 14','Source: catalog archive, 10 Sep 2026 / category 14'],
 },
 {
  title:['市场资料与线索','Market research notes'],kind:['市场数据 / 调研问题','MARKET DATA / RESEARCH QUESTIONS'],
  lines:[['场景：用户在家里、课堂还是出门时绘画？','Context: Do people draw at home, in class or on the go?'],['需求：轻便和工具齐全，哪一个更影响选择？','Need: What matters more: portability or a full set?'],['验证：按渠道核对需求，保留原始来源与日期。','Check: Compare channels; keep original sources and dates.']],
  question:['先收集证据，再判断哪些变化值得跟进。','Gather evidence before calling a change a trend.'],
  source:['依据业务讨论整理；尚未形成市场结论','Discussion-based questions; no market finding yet'],
 },
 {
  title:['销售与库存记录','Sales and stock records'],kind:['历史业务数据 / 字段结构','BUSINESS HISTORY / RECORD STRUCTURE'],
  lines:[['销售：按商品、月份和渠道，查看实销数量与金额。','Sales: Review units and revenue by product, month and channel.'],['库存：一起核对可用库存、在途数量和缺货记录。','Stock: Check available stock, incoming units and stockouts.'],['预测：结合历史销量与交期，判断下一轮备货量。','Plan: Use sales history and lead time to inform replenishment.']],
  question:['分清销售下滑与无货可卖，再调整补货。','Separate low demand from unavailable stock.'],
  source:['字段结构示意；未接入真实业务系统','Record structure only; no live business connection'],
 },
 {
  title:['产品图片与素材','Product image materials'],kind:['多模态资料 / 概念素材','MULTIMODAL DATA / CONCEPT ASSET'],
  lines:[['整体外观：看清比例、开合方式与收纳位置。','Overall view: proportions, opening and storage.'],['部件细节：笔组、颜料、小件和纸卡分别对照。','Details: pencils, paints, small tools and paper.'],['版本关联：让图片与同一份提案、规格一起更新。','Versions: keep images, proposal and specs together.']],
  question:['图片提供形态线索，不代替样品与规格验证。','Images guide form; samples verify the design.'],
  source:['原创概念图；不代表已量产商品','Original concept imagery, not a production product'],
 },
 {
  title:['行业与业务知识','Business knowledge notes'],kind:['领域知识 / 会议观点整理','DOMAIN KNOWLEDGE / MEETING NOTES'],
  lines:[['产品：保留历史表现好的要素，再结合新的需求。','Product: retain proven elements and test new needs.'],['成本：拆开材料、加工、包装和运输，再核对利润。','Cost: review materials, labour, packaging and freight.'],['复盘：一起看销量、利润、缺货和积压，修正判断。','Review: examine sales, margin, stockouts and excess.']],
  question:['把讨论沉淀成判断方法，供下一次分析使用。','Turn working knowledge into repeatable review methods.'],
  source:['依据本次业务讨论整理，非外部研究结论','Based on this business discussion, not external research'],
 },
];
// Six source groups, six fragments each. Sentences retain context when read close up.
export const informationFragments = [
 ['One case is easier than several bags of tools.','出门画画，最好不用再分几个袋子装。'],['Small tools need their own compartments.','橡皮和削笔器最好有各自的位置。'],['Keep drawing paper flat while travelling.','纸卡装进包里以后，也希望保持平整。'],['Check whether the closure is easy to use.','开合顺不顺手，需要实际试用才知道。'],['Record what was inconvenient as well.','除了好评，也要留下使用不方便的地方。'],['Link each review to its product version.','这条评价对应哪一款、哪一个版本？'],
 ['Stationery is catalog category 14.','现有目录中，文具的品类编码是 14。'],['Markers are listed under subcategory 006.','马克笔已归入文具细类，编号 006。'],['Crayons are listed under subcategory 004.','蜡笔已归入文具细类，编号 004。'],['Erasers are listed under subcategory 228.','橡皮已归入文具细类，编号 228。'],['Category codes are not individual product IDs.','品类编码不能直接当作单个商品编码。'],['Keep dimensions and materials with the record.','尺寸、材料和包装需要关联到商品档案。'],
 ['Where will people use these drawing tools?','用户是在家里画，还是带出门使用？'],['Compare portability with a complete tool set.','轻便与工具齐全，哪一个更影响选择？'],['Keep the source and date of every market note.','每条市场资料都保留原始来源和日期。'],['Compare needs across different sales channels.','不同销售渠道的使用需求需要分开核对。'],['A new colour alone does not prove a trend.','新配色只是线索，还不能直接认定为趋势。'],['Test the idea before committing to development.','把待验证的问题带入下一轮产品评审。'],
 ['Review units and revenue by product and month.','按商品和月份查看实销数量与销售金额。'],['Read sales alongside available inventory.','查看销量时，也要核对当时是否有库存。'],['Compare forecast demand with actual sales.','将预测需求与实销对照，记录偏差原因。'],['Include incoming stock in replenishment plans.','补货之前，先核对可用库存和在途数量。'],['Stockouts can conceal unmet demand.','销量低也可能是缺货，不能直接判为滞销。'],['Lead time affects how much to prepare.','生产与运输周期会影响下一轮备货量。'],
 ['An overall view shows how the case opens.','整体外观图可以看清盒子怎样开合。'],['Detail images show the tool compartments.','部件图片记录笔组和小件的收纳位置。'],['Check paper storage against the proposed size.','纸卡放置方式需要与产品尺寸一起核对。'],['Keep the image version with the proposal.','图片版本要和提案版本保持一致。'],['Concept imagery still needs sample validation.','概念图表达设计方向，最终还要验证样品。'],['Pair visual materials with written specifications.','图片素材与文字规格一起进入分析。'],
 ['Retain what performed well, then test new needs.','先保留历史表现好的要素，再结合新需求。'],['Quote materials, processing and packaging separately.','提案阶段就把材料、加工和包装分开报价。'],['Check margin against the complete cost.','判断利润之前，要把完整成本核算清楚。'],['A good idea still has to meet the cost target.','概念再好，成本下不来也不能直接开发。'],['Review both missed sales and excess inventory.','复盘既要看缺货损失，也要看库存积压。'],['Feed delivery and usage lessons into the next cycle.','把交付和使用中的问题带回下一轮开发。'],
];
