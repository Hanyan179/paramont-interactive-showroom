import {ArrowLeft,ArrowRight} from '@phosphor-icons/react';
import {depthContent,depthItem,supplyEvidence,depthBack} from './depthContent.js';
import {supplyLocation} from './supplyRegionsContent.js';
import './depth-experience.css';

export function DepthExperience({view,lang,companyFacts,onSelect,onBack}){
  const l=lang==='zh'?0:1,content=depthContent[view.id],item=depthItem(view.id,view.selection);
  const supply=view.id==='supply',location=supply?supplyLocation(view.selection):null;
  const evidence=supply&&!location.area?supplyEvidence(companyFacts,view.selection):[];
  const region=supply?content.items.find(entry=>entry.id===location.region):null;
  const back=depthBack(view);
  return <section className={`depth-experience ${supply?'':'insight-experience'}`} aria-label={view.id==='supply'?['三维供应链空间','3D supply chain space'][l]:['三维洞察空间','3D insight space'][l]}>
    <div className="depth-copy" key={`${view.id}-${view.selection}-${lang}`}><p className="depth-eyebrow">{region?.name[l]||content.name[l]}</p><h1>{item.title[l]}</h1><p className="depth-description">{item.description[l]}</p>{item.tags&&<ol className="depth-tags">{item.tags.map((tag,i)=><li key={i}><small>0{i+1}</small>{tag[l]}</li>)}</ol>}{supply&&location.region==='china'&&!location.area&&<div className="depth-china-entries"><button className="exhibit-action" onClick={()=>onSelect('china:materials')}>{['研发与样品','DEVELOPMENT'][l]}<ArrowRight/></button><button className="exhibit-action" onClick={()=>onSelect('china:supply')}>{['核心供应链','CORE SUPPLY'][l]}<ArrowRight/></button></div>}{evidence.length>0&&<div className="supply-evidence" aria-label={['集团体系规模 · 官网披露','Group scale reported on the official website'][l]}><dl>{evidence.map(record=><div key={record.id}><dt>{record.label[l]}</dt><dd>{record.value}</dd></div>)}</dl><small>{['集团体系 · 官网披露，统计日期未注明','Group-wide figures · Official website, reporting date unspecified'][l]}</small></div>}</div>
    <nav className="depth-navigation" aria-label={['空间节点','Spatial nodes'][l]}>{!supply?<button aria-pressed={!view.selection} onClick={()=>onSelect(null)}>{['推演总览','OVERVIEW'][l]}</button>:location.area&&<button onClick={()=>onSelect(location.region)}>{['地区总览','REGION OVERVIEW'][l]}</button>}{content.items.map((entry,i)=><button key={entry.id} aria-pressed={entry.id===(location?.region||view.selection)} onClick={()=>onSelect(entry.id)}><small>0{i+1}</small><span>{entry.name[l]}</span></button>)}</nav>
    {['left','right'].map(side=><button key={side} className={`depth-back exhibit-action ${side}`} onClick={onBack} aria-label={l===0?`${side==='left'?'左侧':'右侧'}${back[0]}`:`${back[1]} ${side}`}><ArrowLeft/><span>{back[l]}</span></button>)}
    <p className="depth-note">{content.note[l]}</p>
  </section>;
}
