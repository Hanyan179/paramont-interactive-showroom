import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ArrowRight,ArrowLeft,Check,Plus,X,BookOpen,Compass,Sparkle,Stack,CircleDashed} from '@phosphor-icons/react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {study,paths,lenses,selectedStudyPath,pathById,studyStages} from '../analytics/caseStudy.js';
import {graphLayout,graphNodeActive} from '../analytics/graph.js';
import '../analytics/analysis.css';
export const analysisSteps=studyStages;

// Same tap/drag classifier as the models, with native keyboard activation.
function StudyButton({onClick,children,disabled,...props}){
 const ref=useRef(),latest=useRef();latest.current={onClick,disabled};
 useEffect(()=>{const pointer=bindScenePointer(ref.current,{includeControls:true,enabled:()=>!latest.current.disabled&&!ref.current.closest('[inert]'),onTap:e=>latest.current.onClick?.(e)});return()=>pointer.dispose();},[]);
 return <button ref={ref} disabled={disabled} {...props} onClick={e=>{if(e.detail===0)onClick?.(e);else e.preventDefault();}}>{children}</button>;
}
function FlowGraph({stage,selection,onSelection,lang}){
 const l=lang==='zh'?0:1,graph=graphLayout(stage),host=useRef(),latest=useRef();latest.current={onSelection};
 useEffect(()=>{
   // Pointer capture retargets pointerup to the graph; retain the original edge.
   let pressedPath=null;
   const gesture=bindScenePointer(host.current,{
     onStart:e=>{pressedPath=e.target.closest('.link-hit[data-path]')?.dataset.path||null;},
     onTap:()=>{if(pressedPath)latest.current.onSelection({path:pressedPath,node:'theme'});},
     onEnd:({cancelled})=>{if(cancelled)pressedPath=null;},
   });
   return()=>gesture.dispose();
 },[]);
 return <div className={`study-flow stage-${stage}`} ref={host} aria-label={l===0?'从信号到方向的关系图':'Signal-to-direction relationship graph'}>
   <svg className="study-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
     {graph.links.map(link=><g key={link.id} className={`study-link ${selection.path===link.path?'selected':selection.path?'muted':''}`} style={{'--path-color':link.color}}>
       <path className="link-hit" d={link.d} data-path={link.path}/><path className="link-glow" d={link.d}/><path className="link-track" d={link.d}/><path className="link-travel" d={link.d}/>
     </g>)}
   </svg>
   {graph.columns.map(c=><p className="flow-column" key={c.id} style={{left:`${c.x}%`}}>{c.title[l]}</p>)}
   {graph.nodes.map(n=><StudyButton key={n.id} className={`flow-node ${selection.path?(graphNodeActive(graph,n,selection.path)?'selected':'muted'):''} ${selection.path===n.path&&selection.node===n.column?'focused':''}`} style={{left:`${n.x}%`,top:`${n.y}%`,'--path-color':n.color}} onClick={()=>onSelection({path:n.path,node:n.column})} aria-pressed={selection.path===n.path&&selection.node===n.column}>
     <i/>{n.column==='review'?<CircleDashed className="review-mark"/>:null}<span>{n.label[l]}</span>
   </StudyButton>)}
   <p className="graph-key">{l===0?'关系示意 · 等宽线不代表数量':'Illustrative relationships · Equal widths carry no quantity'}</p>
 </div>;
}
function CategoryMatrix({selection,onSelection,lang}){
 const l=lang==='zh'?0:1;
 return <div className="study-matrix" aria-label={l===0?'品类设计矩阵':'Category design matrix'}>
   <div className="matrix-grid"><div className="matrix-corner"><Stack/><span>{l===0?'设计维度':'Design lens'}</span></div>
    {paths.map(p=><StudyButton key={p.id} className={`matrix-heading ${selection.path===p.id?'selected':''}`} style={{'--path-color':p.color}} onClick={()=>onSelection({path:p.id,node:'opportunity'})} aria-pressed={selection.path===p.id}>{p.theme[l]}</StudyButton>)}
    {lenses.map((lens,row)=><div className="matrix-row" key={row}><div className="matrix-axis"><small>0{row+1}</small><span>{lens[l]}</span></div>{paths.map(p=><StudyButton key={p.id} className={`matrix-cell ${selection.path===p.id&&selection.lens===row?'selected':''} ${selection.compare===p.id?'comparing':''}`} style={{'--path-color':p.color}} onClick={()=>onSelection({path:p.id,lens:row,node:'opportunity'})} aria-pressed={selection.path===p.id&&selection.lens===row}><i/>{p.matrix[row][l]}{selection.path===p.id&&selection.lens===row&&<Check/>}</StudyButton>)}</div>)}
   </div>
   {selection.compare?<div className="matrix-comparison" aria-live="polite">{[selectedStudyPath(selection),pathById(selection.compare)].filter(Boolean).map(p=><div key={p.id}><strong>{p.theme[l]}</strong><p>{p.notes[selection.lens][l]}</p></div>)}<StudyButton className="comparison-close" aria-label={l===0?'关闭比较':'Close comparison'} onClick={()=>onSelection({compare:null})}><X/></StudyButton></div>:<p className="matrix-foot">{l===0?'候选设计关系，尚未进行市场或样品验证。':'Candidate design relationships, pending market and sample validation.'}</p>}
 </div>;
}
function ProductDirection({selection,onSelection,lang}){
 const l=lang==='zh'?0:1,p=selectedStudyPath(selection);
 if(!p)return <div className="direction-choices">{paths.map(path=><StudyButton key={path.id} onClick={()=>onSelection({path:path.id,node:'opportunity'})}><img src={path.image} alt=""/><span>{path.direction[l]}<ArrowRight/></span></StudyButton>)}</div>;
 return <div className="study-direction" key={p.id}><div className="direction-photo"><img src={p.image} alt={p.direction[l]}/><span>{l===0?'原创概念 · 待验证':'Original concept · To validate'}</span></div><div className="direction-reasons">{p.matrix.map((text,i)=><StudyButton key={i} className={selection.lens===i?'selected':''} onClick={()=>onSelection({lens:i,node:'opportunity'})} aria-pressed={selection.lens===i}><small>0{i+1}</small><span>{text[l]}</span></StudyButton>)}</div></div>;
}
export function DataStory({lang,stage,phase='closed',selection,onSelection,onStage,onDocument,onProducts,productAvailable,cinematic=false,paused=false}){
 const [hidden,setHidden]=useState(document.hidden);
 useEffect(()=>{const visibility=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[]);
 const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en,p=selectedStudyPath(selection),step=studyStages[stage??0];
 const text=p?(stage===1||stage===3?p.notes[selection.lens]:stage===2?(selection.node==='review'?p.review:p.reason):p.finding):null;
 return <>
  <section className="analysis-intro" hidden={phase!=='closed'}><p className="eyebrow">PARAMONT / {t('数据分析','DATA ANALYSIS')}</p><h1>{t(<>让信号，<br/>成为创造的起点。</>,<>Signals.<br/>A starting point<br/>for creation.</>)}</h1><p>{t('从国际市场的变化，到可以讨论的产品方向。','From changes in international markets to tangible product directions.')}</p><StudyButton className="primary-link" onClick={()=>onStage(stage??0)}>{t('进入分析案例','Explore the case')}<ArrowRight/></StudyButton><small>{study.status[l]}</small></section>
  {phase!=='closed'&&<section className={`analysis-experience ${cinematic?'is-ambient':''}`} data-phase={phase} data-stage={stage??0} data-path={selection.path||''} data-market={selection.market} data-paused={paused||hidden} aria-label={t('数据探索案例','Data exploration case')} inert={phase!=='open'||cinematic?true:undefined} onKeyDown={e=>{if(e.key==='Escape'&&e.target.tagName!=='SELECT'){e.preventDefault();onStage(null);}}}>
    <header className="study-header"><div><StudyButton className="study-back analysis-secondary" onClick={()=>onStage(null)}><ArrowLeft/>{t('数据工作台','Data workstation')}</StudyButton><p className="study-kicker">{t('案例 01 / 儿童创意用品','CASE 01 / CREATIVE PLAY')}</p><h1>{study.title[l]}</h1></div><div className="study-context analysis-secondary"><label>{t('拟研究市场','Planned market')}<select value={selection.market} onChange={e=>onSelection({market:e.target.value})}>{study.markets.map(m=><option value={m.id} key={m.id}>{m.label[l]}</option>)}</select></label><p>{study.period[l]}</p></div></header>
    <div className="study-topic-list analysis-secondary" role="group" aria-label={t('研究主题','Research themes')}><span>{t('研究主题','Themes')}</span>{paths.map(path=><StudyButton key={path.id} aria-pressed={selection.path===path.id} onClick={()=>onSelection({path:path.id,node:'theme'})} style={{'--path-color':path.color}}><i/>{path.theme[l]}{selection.path===path.id&&<Check/>}</StudyButton>)}{selection.path&&<StudyButton onClick={()=>onSelection({path:null,compare:null})} aria-label={t('显示全部关系','Show all relationships')}><X/></StudyButton>}</div>
    <div className="study-workspace"><div className="analysis-visual"><div className="visual-heading"><span>0{(stage??0)+1}</span><h2>{step.heading[l]}</h2></div>
        <div className="study-chart" key={stage??0}>{stage===1?<CategoryMatrix selection={selection} onSelection={onSelection} lang={lang}/>:stage===3?<ProductDirection selection={selection} onSelection={onSelection} lang={lang}/>:<FlowGraph stage={stage??0} selection={selection} onSelection={onSelection} lang={lang}/>}</div>
        <p className="study-ambient-caption">{p?p.finding[l]:step.caption[l]}</p>
      </div>
      <aside className="study-inspector analysis-secondary" aria-live="polite" style={{'--path-color':p?.color||'#8edddd'}}>
       {p?<><div className="inspector-meta"><span>{t('当前线索','SELECTED PATH')}</span><small>{t('待验证','TO VALIDATE')}</small></div><h2>{(stage===3?p.direction:p.theme)[l]}</h2><p className="inspector-statement">{text[l]}</p>
        {stage===0?<div className="source-kind"><BookOpen/><span>{p.sourceKind[l]}</span></div>:stage===2?<div className="ai-review"><Sparkle/><div><strong>{t('人工智能辅助 · 流程示例','AI-assisted · Workflow study')}</strong><p>{t('关联由本案例预设，尚未运行模型。','Relations are authored; no model has been run.')}</p></div></div>:<div className="inspector-image"><img src={p.image} alt={p.direction[l]}/><span>{t('概念图','Concept image')}</span></div>}
        <StudyButton className="study-document" onClick={()=>onDocument(stage===2?(selection.node==='review'?'review':'reasoning'):stage===0?'source':'interpretation')}>{t('查看依据与资料','Read reasoning & sources')}<ArrowUpRight/></StudyButton>
        {stage===1&&<div className="study-compare"><span>{t('对照另一主题','Compare another theme')}</span>{paths.filter(a=>a.id!==p.id).map(a=><StudyButton key={a.id} onClick={()=>onSelection({compare:selection.compare===a.id?null:a.id})} aria-pressed={selection.compare===a.id}>{selection.compare===a.id?<Check/>:<Plus/>}{a.theme[l]}</StudyButton>)}</div>}
        {stage===2&&<StudyButton className="review-entry" onClick={()=>onSelection({node:selection.node==='review'?'theme':'review'})}>{selection.node==='review'?t('回到归类理由','Back to grouping rationale'):t('查看人工复核要点','Review what needs checking')}<ArrowRight/></StudyButton>}
        {stage===3?(productAvailable?<StudyButton className="study-continue" onClick={onProducts}>{t('查看关联概念样品','Explore linked concept')}<ArrowRight/></StudyButton>:<p className="mapping-empty">{t(p.productId?'样品资料尚未就绪。':'尚未关联样品档案。',p.productId?'Sample material is not ready.':'No sample record is linked yet.')}</p>):<StudyButton className="study-continue" onClick={()=>onStage((stage??0)+1)}>{studyStages[(stage??0)+1].title[l]}<ArrowRight/></StudyButton>}
       </>:<div className="inspector-empty"><Compass/><h2>{t('先看见联系。','See the connections.')}</h2><p>{step.caption[l]}</p><small>{t('点选主题后，查看它的解释、依据与候选方向。','Select a theme to reveal its reasoning, sources and candidate direction.')}</small></div>}
      </aside>
    </div><footer className="study-status"><span>{study.status[l]}</span><span>{t('来源 → 主题 → 方向 → 复核','Source → Theme → Direction → Review')}</span></footer>
  </section>}
 </>;
}
