export const capabilityChapters = [
  { id:'overview', name:['空间总览','The connected atelier'], title:['从灵感，到交付。','From idea to delivery.'], caption:['一条连续的创作旅程','ONE CONTINUOUS JOURNEY'] },
  { id:'manufacturing', name:['工艺与设备','Making'], title:['让创意，逐渐成形。','Where ideas take shape.'], caption:['创研与样品空间','MATERIAL & SAMPLE ATELIER'] },
  { id:'quality', name:['质量管理','Quality'], title:['细节，经得起审视。','Considered in every detail.'], caption:['质量与检测空间','QUALITY OBSERVATORY'] },
  { id:'delivery', name:['交付协同','Delivery'], title:['让每一步，彼此相连。','Every step, connected.'], caption:['包装与协作空间','DELIVERY EXCHANGE'] },
];

export const capabilityStops = {
  overview: [
    {id:'making', chapter:'manufacturing', name:['创研样品间','Sample atelier'], point:[-12,5.7,1]},
    {id:'lab', chapter:'quality', name:['质量观测室','Quality observatory'], point:[0,5.7,1]},
    {id:'exchange', chapter:'delivery', name:['交付协作区','Delivery exchange'], point:[12,5.7,1]},
  ],
  manufacturing: [
    {id:'materials', name:['材料与色彩','Materials & colour'], point:[-15,2.4,-1], description:['从材料、表面和色彩开始，探索产品的设计表达。','Explore a product through material, finish and colour.']},
    {id:'samples', name:['样品研究','Sample studies'], point:[-12,2.5,2], description:['将创意转化为可以近距离查看的样品与细节。','Explore sample forms and details at close range.'], sample:'sample-01'},
    {id:'process', name:['工艺与设备','Process & equipment'], point:[-8.8,2.6,-.4], description:['产线、设备与制作过程，可在这里按项目逐项展示。','Explore production lines, equipment and processes by project.']},
  ],
  quality: [
    {id:'inspection', name:['检测与观察','Inspection'], point:[-1.7,3.2,1.3], description:['聚焦样品、检验方法和判定依据，连接每个质量环节。','Connect samples, inspection methods and assessment criteria.']},
    {id:'standards', name:['质量全过程','Quality journey'], point:[2.8,2.9,-1.3], description:['集团质量管理框架覆盖概念、开发、产前、生产及消费者反馈。','The group framework covers concept, development, pre-production, production and consumer feedback.']},
  ],
  delivery: [
    {id:'packaging', name:['包装与保护','Packaging'], point:[9.7,2.5,1], description:['围绕产品尺寸、包装结构与保护方式，展开交付方案。','Explore the relationship between product, packaging structure and protection.']},
    {id:'collaboration', name:['协作与流转','Collaboration'], point:[14.2,2.5,-.2], description:['让项目节点、协作内容与交付资料在同一空间中串联。','Connect project stages, collaboration and delivery documentation.']},
  ],
};

