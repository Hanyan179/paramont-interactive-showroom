import {isExplorerPage} from './areas.js';
import {explorerViews} from '../../../共享组件/explorerViews.js';

export const companyChapters = [
  {id:1,label:['我们是谁','Who we are']},
  {id:2,label:['协作网络','Our companies']},
  {id:3,label:['时间足迹','Our story']},
  {id:4,label:['公司动态','Company news']},
];

// Only the current scene supplies the center of the single system bar.
export function sceneNavigation({page,chapter,locations,locationActive,locationRevealed,selectedLocation,profile,capability,analysisSteps,analysisStage,explorerView}) {
  if(page==='home')return {label:['公司介绍章节','Company chapters'],active:chapter===0?null:chapter,items:companyChapters};
  if(page==='locations')return locationActive
    ?{label:['能力场景','Capability scenes'],active:capability,items:profile.chapters.map(c=>({id:c.id,label:c.name}))}
    :{label:['全球布局','Global presence'],active:locationRevealed?selectedLocation:null,items:locations.map(c=>({id:c.id,label:c.name}))};
  if(isExplorerPage(page))return {label:['品牌与产品','Brands & products'],active:explorerView,items:explorerViews};
  return {label:['数据分析阶段','Analysis stages'],active:analysisStage,items:analysisSteps.map((s,id)=>({id,label:s.title}))};
}
