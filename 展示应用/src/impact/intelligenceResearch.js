// Catalog facts are traceable; all product proposals, reviews and analyses are authored concepts.
// Pair order is [Chinese, English], except informationFragments, which preserves its [English, Chinese] contract.
export const proposalDirections = [
 {
  id:'pencils',brandId:'kind-mind',title:['随行绘画笔组','Pocket pencil set'],subtitle:['常用色组与便携保护结构','Core colours with portable tip protection'],tag:['使用场景 / 随身绘画','USE / DRAW ON THE GO'],
  facts:[['色组配置：以常用颜色控制套装体积与携带重量。','Colour selection: core colours to limit size and weight.'],['保护结构：独立笔位与笔尖防护，减少携带损伤。','Protection: individual slots and guards for pencil tips.'],['验证项目：握持舒适度、笔套结构与包装成本。','Validation: grip comfort, sleeve design and packaging cost.']],
  review:['保留 · 便携场景明确，笔尖防护待样品验证','KEEP · Clear portable use; validate tip protection'],accent:'#a5c2ce',
 },
 {
  id:'gift',brandId:'sugar-rush',title:['绘画礼赠套装','Drawing gift box'],subtitle:['包装成本与目标售价匹配评估','Packaging cost against the target selling price'],tag:['成本分析 / 礼赠包装','COST / GIFT PACKAGING'],
  facts:[['报价范围：外盒、内托与装饰工艺分项核算。','Quote scope: box, insert and decorative finishes.'],['利润测算：核对目标售价与新增包装成本。','Margin review: target price and added packaging cost.'],['评审条件：完整报价确认后进入打样评估。','Review gate: confirm the full quote before sampling.']],
  review:['暂缓 · 包装报价不完整，利润测算依据待补充','DEFER · Incomplete packaging quote; margin review pending'],accent:'#b9bbb5',
 },
 {
  id:'range',brandId:'crafty-creations',title:['多规格绘画系列','Drawing size range'],subtitle:['分规格需求预测与库存配置','Demand forecasting and stock allocation by size'],tag:['销售预测 / 分规格备货','FORECAST / STOCK BY SIZE'],
  facts:[['基础笔组','Core pencil set'],['扩展颜色组','Extended colours'],['整套工具组','Complete tool set']],
  review:['暂缓 · 分规格销售与库存数据尚待交叉验证','DEFER · Sales and stock by size require validation'],accent:'#a6b7c5',
 },
 {
  id:'organizer',brandId:'cozy-craftworks',title:['桌面分区收纳','Desktop organiser'],subtitle:['工具分类、取用路径与空间利用','Tool grouping, access and space utilisation'],tag:['功能取舍 / 收纳结构','FUNCTION / ORGANISED STORAGE'],
  facts:[['笔位设计：竖向分区，保留颜色识别与取用空间。','Pencil slots: upright dividers for visibility and access.'],['小件收纳：橡皮与削笔器独立定位，减少混放。','Small tools: separate locations for eraser and sharpener.'],['结构复用：将分区方案纳入便携组合验证。','Reuse: validate the divider layout within the portable kit.']],
  review:['保留 · 分区结构可复用，便携适配待验证','KEEP · Reusable dividers; validate portable integration'],accent:'#a8c1b9',
 },
 {
  id:'drawing-kit',brandId:'scentos',title:['随行绘画收纳盒','Portable drawing kit'],subtitle:['绘画工具与分区收纳一体化提案','An integrated drawing and compartmented-storage concept'],tag:['组合提案 / 选中打样','COMBINED CONCEPT / SAMPLE'],
  facts:[['工具配置：笔组、颜料与辅助小件组成绘画套装。','Tool set: pencils, paints and supporting drawing tools.'],['收纳结构：小件独立定位，纸卡平整放置。','Storage: dedicated small-tool slots and flat paper storage.'],['打样评审：核对分项报价、装配工艺与交付条件。','Sample review: itemised quote, assembly and delivery terms.']],
  review:['选中打样 · 验证组合结构、成本目标与交付可行性','SAMPLE · Validate design, target cost and delivery feasibility'],accent:'#a8c4d1',
 },
];
export const researchReports = [
 {
  title:['客户使用反馈','Customer feedback'],kind:['评价资料 / 演示摘录','REVIEWS / AUTHORED EXCERPTS'],
  lines:[['“出门画画不用再找几个袋子，常用的东西放在一起就好。”','“I would rather carry one case than several bags of drawing tools.”'],['“笔和纸容易整理，小件最好也能有各自的位置。”','“Pencils and paper are easy to pack. Small tools need their own spaces.”'],['反馈维度：携带便利、工具取用、小件归位与纸卡保护。','Feedback dimensions: carrying, tool access, storage and paper protection.']],
  question:['反馈关联商品版本与使用场景，纳入需求验证。','Link feedback to product versions and use cases for validation.'],
  source:['创作的评价示例，并非实际客户记录','Authored examples, not actual customer records'],
 },
 {
  title:['商品分类档案','Product category records'],kind:['主数据 / 现有目录摘录','MASTER DATA / CATALOG EXCERPT'],
  lines:[['006：马克笔','006: Markers'],['004：蜡笔','004: Crayons'],['228：橡皮','228: Erasers']],
  question:['分类层级为文具品类及细类；规格关联单品档案。','Category and subcategory hierarchy; specifications link to product records.'],
  source:['来源：2026.9.10 存档 · 文具品类 14','Source: catalog archive, 10 Sep 2026 / category 14'],
 },
 {
  title:['市场趋势研究','Market trend research'],kind:['市场数据 / 调研框架','MARKET DATA / RESEARCH FRAMEWORK'],
  lines:[['场景划分：居家绘画、课堂使用与外出携带。','Use contexts: home drawing, classroom use and travel.'],['需求比较：便携重量、工具配置与收纳便利性。','Demand comparison: weight, tool selection and storage access.'],['趋势验证：跨渠道对照需求变化，记录来源与观察期间。','Trend validation: compare channels; retain sources and observation periods.']],
  question:['趋势判断需结合时间序列、渠道差异与使用验证。','Assess trends against time series, channel differences and use tests.'],
  source:['依据业务讨论整理；尚未形成市场结论','Discussion-based framework; no market finding yet'],
 },
 {
  title:['销售与库存记录','Sales and stock records'],kind:['历史业务数据 / 字段结构','BUSINESS HISTORY / RECORD STRUCTURE'],
  lines:[['销售维度：商品、月份、渠道；指标为实销数量与金额。','Sales dimensions: product, month and channel; units and revenue.'],['库存字段：可用库存、在途数量、缺货天数与库龄。','Stock fields: available and incoming units, stockout days and stock age.'],['预测校验：同期预测与实销对照，关联补货及交期记录。','Forecast checks: compare actual sales; link replenishment and lead times.']],
  question:['结合供货状态归因销售偏差，形成补货调整依据。','Explain sales variance using supply status to inform replenishment.'],
  source:['字段结构示意；未接入真实业务系统','Record structure only; no live business connection'],
 },
 {
  title:['产品图片与素材','Product image materials'],kind:['多模态资料 / 概念素材','MULTIMODAL DATA / CONCEPT ASSET'],
  lines:[['整体外观：盒体比例、开合结构与收纳布局。','Overall view: case proportions, opening mechanism and storage layout.'],['部件视图：笔组、颜料、小件与纸卡分区。','Component views: pencil, paint, small-tool and paper compartments.'],['版本索引：图片、提案与规格文件关联同一设计版本。','Version index: images, proposals and specifications share a design revision.']],
  question:['形态识别与规格关联共同支持样品评审。','Link visual features and specifications for sample review.'],
  source:['原创概念图；不代表已量产商品','Original concept imagery, not a production product'],
 },
 {
  title:['行业与业务知识','Business knowledge notes'],kind:['领域知识 / 会议观点整理','DOMAIN KNOWLEDGE / MEETING NOTES'],
  lines:[['开发评审：历史销售表现、需求变化与产品要素组合。','Development review: sales history, changing needs and product features.'],['成本模型：材料、加工、包装与运输分项归集。','Cost model: itemised materials, processing, packaging and freight.'],['复盘框架：销量、利润、缺货影响、库存积压与履约偏差。','Review framework: sales, margin, stockouts, excess stock and delivery variance.']],
  question:['评审依据与复盘结论关联至下一周期产品开发。','Link review evidence and findings to the next development cycle.'],
  source:['依据本次业务讨论整理，非外部研究结论','Based on this business discussion, not external research'],
 },
];
// Six source groups, six excerpts each. Mix customer language, catalog records,
// research dimensions and business fields without inventing operating results.
export const informationFragments = [
 ['One case is easier than several bags of tools.','“出门画画，最好不用分几个袋子装。”'],['Small tools need their own compartments.','“橡皮和削笔器最好有各自的位置。”'],['Keep drawing paper flat while travelling.','“纸卡装进包里以后，也希望保持平整。”'],['I need to try the clasp to see if it is easy to open.','“这个扣子好不好打开，我想实际试一下。”'],['Feedback topics / carrying, access and storage','反馈主题：携带便利、取用效率与收纳体验'],['Review links / product version and use context','评价关联字段：商品版本、使用场景'],
 ['CATALOG / 14 Stationery','商品目录 / 品类 14 · 文具'],['006 Markers / Stationery subcategory','细类档案：006 马克笔 / 文具'],['004 Crayons / Stationery subcategory','细类档案：004 蜡笔 / 文具'],['228 Erasers / Stationery subcategory','细类档案：228 橡皮 / 文具'],['Hierarchy / category, subcategory, product','分类层级：品类 → 细类 → 单品'],['Product fields / dimensions, material, packaging','商品规格字段：尺寸、材料、包装方式'],
 ['Use contexts / home, classroom, travel','使用场景研究：居家、课堂与外出绘画'],['Need comparison / weight and tool selection','需求比较：便携重量与工具配置'],['Research index / source, channel, observation period','调研索引：原始来源、渠道、观察期间'],['Channel comparison / needs and product formats','渠道对照：需求特征与商品组合'],['Trend validation / colour, form and use context','趋势验证维度：配色、形态、使用场景'],['Review inputs / supporting evidence and open questions','产品评审输入：需求证据与待验证事项'],
 ['Sales dimensions / product, month and channel','销售统计维度：商品 × 月份 × 渠道'],['Sales measures / units sold, revenue and returns','销售核对字段：实销数量、金额与退货'],['Forecast comparison / version, period and variance','预测对照：版本、统计期间与销售偏差'],['Replenishment inputs / available and incoming stock','补货计算输入：可用库存与在途数量'],['Stockout analysis / duration and affected products','缺货影响分析：持续天数与受影响商品'],['Planning constraints / production and transport lead time','备货约束：生产周期、运输周期与到货窗口'],
 ['Overall image / case proportions and opening mechanism','整体外观素材：盒体比例与开合结构'],['Component views / pencils, paints and small tools','部件视图索引：笔组、颜料与辅助小件'],['Storage dimensions / paper size and compartment clearance','收纳规格：纸卡尺寸与分区净空'],['Revision links / image, proposal and specifications','版本关联：图片素材、设计提案与规格文件'],['Sample review / form, assembly and material finish','样品评审项目：形态、装配与表面材质'],['Multimodal inputs / images and written specifications','多模态分析输入：产品图像与文字规格'],
 ['Development inputs / sales history and emerging needs','开发依据：历史销售表现与新增需求'],['Quote items / materials, processing and packaging','报价拆解：材料用量、加工工艺与包装结构'],['Margin assumptions / selling price, unit and cost basis','利润测算口径：售价、计价单位与成本范围'],['Review constraints / target cost and delivery feasibility','提案评审约束：成本目标与交付可行性'],['Inventory review / stockout impact and excess stock','库存复盘：缺货影响、库龄结构与积压风险'],['Delivery review / due dates, receipts and inspection','履约复盘：约定交期、签收记录与质量验收'],
];
