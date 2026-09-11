import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, Minus, MapPin, CornersOut } from '@phosphor-icons/react';
import { getLocationProfile } from './locationProfiles';
import { Modal } from './Dialogs';
import { asset } from '../content';

const stages=[['概念','Concept'],['开发','Development'],['产前','Pre-production'],['生产','Production'],['消费者反馈','Consumer feedback']];
const localText=(value,l)=>Array.isArray(value)?value[l]:value;

export function FactoryDetail({location:loc,samples=[],lang,tab,onTab,focus,onFocus,onClose,onVideoPlaying,onSample,onDocument}) {
  const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en;
  const [stage,setStage]=useState(0),[expanded,setExpanded]=useState(false),[media,setMedia]=useState(0),[mediaOpen,setMediaOpen]=useState(false);
  const profile=getLocationProfile(loc.id),capabilityChapters=profile.chapters;
  const current=capabilityChapters.find(c=>c.id===tab)||capabilityChapters[0],stops=profile.stops[tab]||[],stop=stops.find(s=>s.id===focus);
  const conceptSample=samples.find(s=>s.id===stop?.sample);
  const supplied=loc.capabilities?.[tab], selectedMedia=loc.media?.[media];
  const back=useRef(null),latest=useRef({focus,tab,onFocus,onTab,onClose});latest.current={focus,tab,onFocus,onTab,onClose};
  useEffect(()=>{const previous=document.activeElement;back.current?.focus({preventScroll:true});const key=e=>{if(e.defaultPrevented||e.key!=='Escape'||document.querySelector('[aria-modal="true"]')||document.fullscreenElement)return;e.preventDefault();const p=latest.current;if(p.focus)p.onFocus(null);else if(p.tab!=='overview')p.onTab('overview');else p.onClose();};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus?.({preventScroll:true});onVideoPlaying(false);};},[]);
  useEffect(()=>{setExpanded(false);setMediaOpen(false);setStage(0);setMedia(0);onVideoPlaying(false);},[loc.id,tab,focus]);
  const changeTab=id=>{onTab(id);setExpanded(false);};
  return <><section className="capability-experience" aria-label={t('地点与能力空间','Place and capability space')} data-testid="capability-experience" data-location={loc.id}>
    <div className="capability-breadcrumb"><button ref={back} onClick={onClose}><ArrowLeft size={21}/>{t('全球布局','Global presence')}</button><span>/</span><span>{loc.name[l]}</span>{tab!=='overview'&&<><span>/</span><button onClick={()=>changeTab('overview')}>{t('空间总览','Overview')}</button></>}</div>
    <aside className={`capability-glass ${focus?'has-focus':''}`} aria-label={t('能力内容','Capability details')}>
      <div className="capability-glass-top"><span className="eyebrow">{current.caption[l]}</span><span className="capability-index">0{capabilityChapters.indexOf(current)+1}</span></div>
      <div className="capability-reading" key={`${tab}-${focus||'intro'}`}>
        <h2>{stop?stop.name[l]:(localText(supplied?.title,l)||current.title[l])}</h2>
        {stop?<><p className="capability-description">{stop.description[l]}</p><button className="glass-back" onClick={()=>onFocus(null)}><ArrowLeft size={17}/>{t('返回本区总览','Back to this space')}</button></>:<p className="capability-description">{localText(supplied?.description,l)||current.description[l]}</p>}
        {!focus&&<div className="capability-links">{stops.map((s,i)=><button key={s.id} onClick={()=>s.chapter?changeTab(s.chapter):onFocus(s.id)}><small>0{i+1}</small><span>{s.name[l]}</span><ArrowRight size={19}/></button>)}</div>}
        {focus&&<div className="capability-focus-content">
          {conceptSample&&<button className="sample-preview-link" onClick={()=>onSample(conceptSample.id)}><img src={asset(conceptSample.image)} alt={localText(conceptSample.name,l)}/><span>{t('查看概念样品','View concept sample')}<ArrowRight size={19}/></span></button>}
          {loc.id==='cambodia'&&focus==='standards'&&<><div className="quality-journey" aria-label={t('集团质量阶段','Group quality stages')}>{stages.map((s,i)=><button key={s[1]} className={stage===i?'active':''} aria-pressed={stage===i} onClick={()=>setStage(i)}><small>0{i+1}</small>{s[l]}</button>)}</div><p className="stage-caption" key={stage}>{stages[stage][l]}<span>{t('该地点对应的流程与案例待补充。','Site-specific processes and cases are awaiting content.')}</span></p></>}
          {supplied?.items?.length>0&&<button className="capability-expand" aria-expanded={expanded} aria-controls="capability-facts" onClick={()=>setExpanded(v=>!v)}>{t('相关资料','Related information')}{expanded?<Minus size={20}/>:<Plus size={20}/>}</button>}
          {expanded&&<div id="capability-facts" className="capability-facts">{supplied?.items?.length?supplied.items.map((item,i)=><div key={i}><h4>{localText(item.name,l)}</h4><p>{localText(item.description,l)}</p></div>):<p>{profile.missing[l]}</p>}</div>}
        </div>}
        {tab==='overview'&&<>
          {selectedMedia&&<div className="location-media-preview"><button onClick={()=>setMediaOpen(true)}>{selectedMedia.type==='video'?<span>{t('查看地点视频','View location video')}</span>:<img src={selectedMedia.src} alt={selectedMedia.alt||loc.name[l]}/>}<CornersOut size={20}/></button>{loc.media.length>1&&<div><button aria-label={t('上一份影像','Previous media')} onClick={()=>setMedia(i=>(i-1+loc.media.length)%loc.media.length)}><ArrowLeft/></button><span>{media+1} / {loc.media.length}</span><button aria-label={t('下一份影像','Next media')} onClick={()=>setMedia(i=>(i+1)%loc.media.length)}><ArrowRight/></button></div>}</div>}
          <button className="capability-expand" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}><span><MapPin size={18}/>{t('地点资料','Location information')}</span>{expanded?<Minus size={20}/>:<Plus size={20}/>}</button>
          {expanded&&<dl className="capability-location-facts"><div><dt>{t('城市 / 园区','City / site')}</dt><dd>{localText(loc.city,l)||t('待补充','To be added')}</dd></div><div><dt>{t('业务性质','Site function')}</dt><dd>{localText(loc.type,l)||profile.role[l]}</dd></div></dl>}
        </>}
        <button className="document-entry" onClick={onDocument}>{t('阅读本区资料','Read about this space')}<ArrowUpRight/></button>
      </div>
      <p className="capability-disclaimer">{t('空间概念演示 · 非真实场地','Spatial concept · Not an actual site')}{loc.id==='cambodia'&&tab==='quality'&&<span>{t('质量框架为集团介绍，非该地点能力证明。','The group framework does not establish this site’s capabilities.')}</span>}</p>
    </aside>
    <div className="capability-scene-label"><span>PARAMONT</span><strong>{current.name[l]}</strong></div>

    </section>
    {mediaOpen&&selectedMedia&&<Modal title={t('地点影像','Location media')} className="capability-media-dialog" onClose={()=>{setMediaOpen(false);onVideoPlaying(false);}}>{selectedMedia.type==='video'?<video controls muted playsInline autoPlay src={selectedMedia.src} onPlay={()=>onVideoPlaying(true)} onPause={()=>onVideoPlaying(false)} onEnded={()=>onVideoPlaying(false)}/>:<img src={selectedMedia.src} alt={selectedMedia.alt||loc.name[l]}/>}</Modal>}
  </>;
}
