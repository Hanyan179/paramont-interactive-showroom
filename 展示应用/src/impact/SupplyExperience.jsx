import {ArrowLeft,ArrowRight} from '@phosphor-icons/react';
import {supplyRegions} from './content';
import {getLocationProfile} from '../components/locationProfiles';
import './supply-experience.css';

export function SupplyExperience({view,lang,onRegion,onChapter,onBack}){
  const l=lang==='zh'?0:1,profile=view.region?getLocationProfile(view.region):null;
  const chapter=profile?.chapters.find(c=>c.id===view.chapter)||profile?.chapters[0];
  const steps=profile?.stops[view.chapter]||[];
  return <section className="supply-experience" aria-label={l===0?'连续供应链空间':'Connected supply chain'}>
    <div className="supply-heading" key={`${view.region}-${view.chapter}-${lang}`}>
      <p>{chapter?.caption[l]||['PARAMONT / 全球供应链','PARAMONT / GLOBAL CONNECTIONS'][l]}</p>
      <h1>{chapter?.title[l]||['让创造，贯通世界。','ONE WORLD. CONNECTED.'][l]}</h1>
      <div className="supply-summary">{chapter?.description[l]||['中国研发与核心供应链、柬埔寨制造协同、越南供应链协作、美国市场协作，在同一体系中连接。','China-led development and supply, manufacturing in Cambodia, supply collaboration in Vietnam and market collaboration in the US.'][l]}</div>
      {view.chapter!=='overview'&&<div className="supply-evidence">{steps.map(step=><div key={step.id}><strong>{step.name[l]}</strong><p>{step.description?.[l]}</p></div>)}</div>}
    </div>
    <div className="supply-console">
      {profile&&<nav className="supply-chapters" aria-label={['供应链环节','Supply chain stages'][l]}>{profile.chapters.map(c=><button key={c.id} aria-pressed={view.chapter===c.id} onClick={()=>onChapter(c.id)}>{c.name[l]}</button>)}</nav>}
      <nav className="supply-regions" aria-label={['三地协同','Three connected regions'][l]}>
        <button aria-pressed={!view.region} onClick={()=>onRegion(null)}>{['三地协同','CONNECTED NETWORK'][l]}</button>
        {supplyRegions.map((r,i)=><button key={r.id} aria-pressed={view.region===r.id} onClick={()=>onRegion(r.id)}><small>0{i+1}</small><span>{r.name[l]}<em>{r.role[l]}</em></span><ArrowRight/></button>)}
      </nav>
    </div>
    {['left','right'].map(side=><button key={side} className={`supply-back ${side}`} onClick={onBack} aria-label={l===0?`${side==='left'?'左侧':'右侧'}返回地球`:`Return to globe on the ${side}`}><ArrowLeft/><span>{['返回地球','BACK TO GLOBE'][l]}</span></button>)}
    <p className="supply-disclaimer">{['空间与流向为概念演绎 · 非真实场地或实时物流','Conceptual spaces and flows · Not actual sites or live logistics'][l]}</p>
  </section>;
}
