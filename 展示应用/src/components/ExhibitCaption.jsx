import {overviewStops} from './homeStoryContent';
import './exhibit-caption.css';

const companyLabels=[
  {title:['让创意，连接世界。','Ideas, connected.'],text:['连接品牌、产品设计与制造，让创意走向世界。','Connecting brands, product design and manufacturing.']},
  {title:['把想象，变成日常。','Imagination, made everyday.'],text:['从创意研究到设计开发，探索产品诞生的过程。','Explore the journey from creative research to product development.']},
  {title:['不同专长，共同创造。','Different strengths. Shared possibility.'],text:['认识公司之间的业务联系与不同专长。','Explore the connections and expertise across our companies.']},
  {title:['时间足迹','Our story'],text:['回看公司的发展历程与重要节点。','Discover the milestones in our company history.']},
  {title:['我们的故事，正在发生。','Our stories, in motion.'],text:['影像与文字，记录公司、团队与创意。','Films and stories from our company, people and ideas.']},
];
const overviewText=[companyLabels[1].text,['从研发与制造，到连接世界的供应链。','From design and manufacturing to a connected supply chain.'],['品牌、品类与样品，在同一个空间探索。','Explore brands, categories and samples in one space.'],['从国际趋势，到品类洞察与产品创造。','From global trends to category insight and product creation.']];

// Uses the current selection, so an idle view never receives another shot's label.
export function ExhibitCaption({page,chapter,focus,location,profile,locationActive,locationRevealed,capability,lang}) {
  const l=lang==='zh'?0:1;
  let title,description;
  if(page==='home') {const item=companyLabels[chapter];title=item.title[l];description=item.text[l];if(chapter===0&&focus!==null){title=overviewStops[focus][l];description=overviewText[focus][l];}}
  else if(page==='locations') {const step=locationActive?profile.chapters.find(c=>c.id===capability):null;title=locationRevealed?`${location.name[l]} · ${step?.name[l]||profile.role[l]}`:['连接世界的供应链','A connected supply chain'][l];description=locationRevealed?profile.summary[l]:['从创意与研发、制造，到市场协作，探索全球业务布局。','Explore creative development, manufacturing and market collaboration.'][l];}
  else return null;
  return <section className="exhibit-caption" aria-label={['当前画面介绍','About this scene'][l]}><div key={`${page}-${chapter}-${focus}-${title}-${lang}`} role="status" aria-live="polite"><small>PARAMONT</small><h2>{title}</h2><p>{description}</p>{page==='locations'&&<em>{['空间与流向概念','Spatial and flow concepts'][l]}</em>}</div></section>;
}
