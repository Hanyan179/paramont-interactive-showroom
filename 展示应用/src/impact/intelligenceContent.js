// One continuous, authored scenario. These examples describe a workflow, not live findings.
export const intelligenceStages = [
  {
    id: 'assets',
    name: ['数据资产', 'Data Assets'],
    action: ['汇聚', 'Gather'],
    description: ['汇聚互联网信息、行业报告与发展趋势，融入行业和业务专家的判断，沉淀为可追溯、可分析的知识资产。', 'Bring internet information, industry reports and emerging trends together with industry and business expertise, creating traceable knowledge ready for analysis.'],
    example: {
      title: ['一个产品方向，怎样建立研究依据？', 'What gives a product direction a sound foundation?'],
      summary: ['以儿童创意用品为例，汇入公开报告、互联网信息与趋势线索，再结合行业专家和业务专家的经验，让信息成为可用的研究依据。', 'For creative play products, combine public reports, internet sources and trend signals with industry and business expertise to build a useful research foundation.'],
      steps: [
        ['汇入多渠道资料，保留来源、日期与原文', 'Collect source material with its origin, date and original context'],
        ['由 AI 辅助提取主题、去重和关联观点', 'Use AI to help extract themes, remove duplicates and connect viewpoints'],
        ['由专家补充经验、校核依据，标记待验证判断', 'Have experts add context, review evidence and flag unverified judgments'],
      ],
      outcome: ['外部信息与专家知识共同成为下一步分析的基础。', 'External information and expert knowledge become the foundation for analysis.'],
    },
  },
  {
    id: 'analytics',
    name: ['AI 驱动分析', 'AI-Powered Analytics'],
    action: ['编织', 'Weave'],
    description: ['结合报告、趋势信号与专家判断，由 AI 辅助发现关联、比较差异，让分散的信息形成可解释的结构。', 'Use AI to connect reports, trend signals and expert judgment, compare differences and give scattered information an explainable structure.'],
    example: {
      title: ['同一个需要，有哪些产品可能？', 'How could one need inspire different products?'],
      summary: ['围绕儿童创意用品，将使用情境、产品形态与材料语言交叉整理。', 'Explore children’s creative products through use context, product form and material language.'],
      steps: [
        ['整理亲子共玩、独立探索等情境', 'Organize shared play and independent exploration'],
        ['关联拼合、层叠与折叠等形态', 'Connect arranging, stacking and folding forms'],
        ['交由团队复核关联与设计依据', 'Have the team review connections and reasoning'],
      ],
      outcome: ['把分散描述整理为可讨论的方向。', 'Scattered descriptions become directions worth discussing.'],
    },
  },
  {
    id: 'insights',
    name: ['洞察发现', 'Insights'],
    action: ['显现', 'Reveal'],
    description: ['从交织的线索中，让值得验证的机会清晰浮现。', 'Let opportunities worth validating emerge from interconnected signals.'],
    example: {
      title: ['让“共同玩耍”，成为一个设计问题。', 'Turn playing together into a design question.'],
      summary: ['以现有几何拼合概念为线索，提出一个有待验证的机会：同一组组件能否支持不同玩法？', 'Use an existing shape concept to frame a hypothesis: could the same pieces support different ways to play?'],
      steps: [
        ['关注轮流、共享与重新组合', 'Focus on taking turns, sharing and rearranging'],
        ['突出开放式几何拼合这一假设', 'Surface open-ended shapes as a design hypothesis'],
        ['列出需要收集的真实使用记录', 'Identify the real use observations still needed'],
      ],
      outcome: ['一个明确的机会，连同它的验证问题。', 'A clear opportunity, together with the questions that test it.'],
    },
  },
  {
    id: 'decisioning',
    name: ['决策赋能', 'Decisioning'],
    action: ['分岔', 'Explore'],
    description: ['展开不同路径，看清取舍，让判断有据可循。', 'Explore possible paths, make trade-offs visible and give decisions a clear basis.'],
    example: {
      title: ['随行创作，还是桌面共享？', 'Create on the go, or share a studio?'],
      summary: ['将随行套装与桌面共享组合放在同一套问题下比较，选择一个方向继续查看产品提案。', 'Compare a portable kit with a shared desktop assortment, then take the chosen direction into a product proposal.'],
      steps: [
        ['比较使用场景与操作方式', 'Compare contexts and ways of interacting'],
        ['核对样品依据与材料待确认项', 'Review sample evidence and material questions'],
        ['选择一个方向进入样品讨论', 'Select a direction for a sample review'],
      ],
      outcome: ['留下选择理由，也保留其他可能。', 'Keep the reasoning for the choice and the alternatives.'],
    },
  },
  {
    id: 'impact',
    name: ['价值实现', 'Market Impact'],
    action: ['成形', 'Shape'],
    description: ['让选择成为可触及的产品方向，连接开发与市场。', 'Shape a decision into a tangible product direction, connecting development with the market.'],
    example: {
      title: ['从一个方向，走向一次样品验证。', 'From a direction to a sample worth testing.'],
      summary: ['把选中的几何拼合方向转为概念样品讨论，明确进入开发前需要回答的问题。', 'Bring the chosen shape direction into a concept sample review and define what must be answered before development.'],
      steps: [
        ['整理组件、玩法与产品组合', 'Outline components, play patterns and the assortment'],
        ['检查取放、共享与收纳体验', 'Review handling, sharing and packing away'],
        ['收集设计、供应链与市场反馈', 'Gather design, supply and market team feedback'],
      ],
      outcome: ['一个可以继续验证与完善的产品提案。', 'A product proposal ready for further validation and refinement.'],
    },
  },
  {
    id: 'evolution',
    name: ['智能进化', 'Intelligent Evolution'],
    action: ['沉淀', 'Learn'],
    description: ['让市场反馈回流为知识，把每次验证的积累带入下一轮创造。', 'Preserve sample feedback and design experience in a reusable collection that guides the next creation.'],
    example: {
      title: ['这次学到的，如何帮助下一次？', 'How does this cycle improve the next one?'],
      summary: ['把样品讨论与后续验证的依据沉淀下来，让新项目从已有积累继续出发。', 'Preserve the reasoning from sample reviews and subsequent validation so the next project builds on what has been learned.'],
      steps: [
        ['记录有效反馈与仍待验证的问题', 'Record useful feedback and unresolved questions'],
        ['整理可复用的场景与设计规则', 'Organize reusable contexts and design principles'],
        ['把知识带回下一批产品资料', 'Bring that knowledge into the next set of product records'],
      ],
      outcome: ['知识持续积累，创造继续发生。', 'Knowledge accumulates. Creation continues.'],
    },
  },
];
