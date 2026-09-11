import { showroomAreas } from '../config/areas.js';
// Editorial labels describe the official capability framework, never performance metrics.
export const storyThemes = [['创意协同','Creative network'],['产品开发','Product development'],['全程质量','Quality throughout']];
export const overviewStops = showroomAreas.map(area => area.overview);
export const companyNames = ['Paramont Global','WeVeel','Evergreat','Zhike'];
export const storyYears = [2003,2009,2013,2016,2018,2023];
export const storySteps = [
  [['产品开发','Development'],['品牌','Branding'],['趋势研究','Trend research'],['供应链','Supply chain']],
  [['品类管理','Category'],['设计','Design'],['趋势研究','Research'],['采购','Sourcing'],['制造','Manufacturing']],
  [['概念','Concept'],['开发','Development'],['产前','Pre-production'],['生产','Production'],['消费者反馈','Consumer feedback']],
  [['全球趋势','Global trends'],['品类研究','Category research'],['季节报告','Seasonal reports'],['产品方向','Product direction']],
];
export const stepDescriptions = [
  [['产品开发是全球协作网络的一部分。','Product development forms part of the global creative network.'],['品牌团队与产品开发、研究及供应链共同协作。','Brand teams work with development, research and supply chain teams.'],['趋势研究连接不同市场的产品方向。','Trend research informs product direction across markets.'],['供应链与设计、研究和开发共同支撑产品落地。','Supply chain teams work alongside design, research and development.']],
  [['品类管理参与从洞察到产品的开发过程。','Category management contributes to the journey from insight to product.'],['产品与包装设计融入完整的开发体系。','Product and packaging design form part of the development ecosystem.'],['趋势研究为产品开发提供方向参考。','Trend research helps inform development decisions.'],['采购与设计、制造共同参与开发。','Sourcing works with design and manufacturing through development.'],['制造与前期设计、采购相互衔接。','Manufacturing connects with design and sourcing.']],
  [['质量管理从产品概念阶段开始。','Quality management begins at the concept stage.'],['开发阶段是质量保证与控制框架的一部分。','Development is part of the quality assurance and control framework.'],['质量框架覆盖正式生产之前的阶段。','The quality framework includes the pre-production stage.'],['质量保证与控制贯穿生产阶段。','Quality assurance and control continue through production.'],['消费者反馈纳入完整的质量管理框架。','Consumer feedback forms part of the complete quality framework.']],
  [['全球趋势研究为产品方向提供参考。','Global trend research helps inform product direction.'],['内部品类报告支持系列开发判断。','Internal category reports support collection development.'],['季节报告帮助组织产品开发方向。','Seasonal reports help shape development direction.'],['研究与报告共同支持产品方向判断。','Research and reports together inform product decisions.']],
];
export const milestoneTitles = [['起点','An origin'],['制造与品牌','Making & brands'],['连接市场','Connecting markets'],['新的专长','New expertise'],['跨洋协作','Across oceans'],['持续进化','An evolving identity']];
export function homeStops(chapter, selection) {
  if(chapter===4)return [];
  const labels = chapter === 0 ? overviewStops : chapter === 1 ? storySteps[selection.capability] : chapter === 2 ? companyNames.map(n=>[n,n]) : storyYears.map(y=>[String(y),String(y)]);
  return labels.map((name,index)=>({index,name}));
}
