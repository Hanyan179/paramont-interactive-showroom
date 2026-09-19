import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {House,ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,Clock,Images,Minus,Plus,X,ArrowsOut,DownloadSimple} from '@phosphor-icons/react';
import {useDialog} from '../hooks';
import {captureReadingAnchor,restoreReadingAnchor,localText,readingEstimate,safeDocumentURL,sectionBlocks,documentPictures} from '../documents/reading.js';
import './DocumentReader.css';
import './exhibit-action.css';

export function DocumentReader({document:doc,lang,onLanguage,onClose,onHome,initialSection,memory,onRemember,wallControls=false}) {
  const text=value=>localText(value,lang),t=(zh,en)=>lang==='zh'?zh:en;
  const root=useRef(null),scroller=useRef(null),sections=useRef([]),saved=useRef(memory),last=useRef(null),photoTrigger=useRef(null);
  const [active,setActive]=useState(0),[progress,setProgress]=useState(0),[large,setLarge]=useState(memory?.large||false);
  const [photo,setPhoto]=useState(null),[zoom,setZoom]=useState(1),[failedImages,setFailedImages]=useState({});
  const layout=useRef({lang,large});
  const pictures=documentPictures(doc);
  const estimate=readingEstimate(doc,lang);
  useDialog(root,()=>photo!==null?setPhoto(null):onClose());
  const remember=useRef(onRemember);remember.current=onRemember;
  useEffect(()=>()=>remember.current?.(last.current),[]);
  function geometry(){return sections.current.flatMap((el,i)=>el?[{id:doc.sections[i].id,top:el.offsetTop}]:[]);}
  useLayoutEffect(()=>{const el=scroller.current;if(!el)return;
    const index=doc.sections.findIndex(s=>s.id===initialSection);
    if(index>=0&&sections.current[index])el.scrollTop=Math.max(0,sections.current[index].offsetTop-24);
    else if(saved.current?.anchor)el.scrollTop=restoreReadingAnchor(saved.current.anchor,geometry(),el.scrollHeight,el.scrollHeight-el.clientHeight);
    else if(saved.current?.top!==undefined)el.scrollTop=saved.current.top;
    saved.current=null;updateProgress();
  },[]);
  useLayoutEffect(()=>{const el=scroller.current;if(!el||photo!==null)return;
    if((layout.current.lang!==lang||layout.current.large!==large)&&last.current?.anchor){
      el.scrollTop=restoreReadingAnchor(last.current.anchor,geometry(),el.scrollHeight,el.scrollHeight-el.clientHeight);
    }
    layout.current={lang,large};updateProgress();
  },[large,lang,photo]);
  useEffect(()=>{setZoom(1);if(photo!==null)root.current?.querySelector('.reading-return')?.focus();else if(photoTrigger.current){photoTrigger.current.focus({preventScroll:true});photoTrigger.current=null;}},[photo]);
  function updateProgress(){const el=scroller.current;if(!el||photo!==null||!el.clientHeight)return;
    const max=el.scrollHeight-el.clientHeight,p=max>0?Math.min(100,Math.round(el.scrollTop/max*100)):100;
    setProgress(p);const anchor=captureReadingAnchor(el.scrollTop,geometry(),el.scrollHeight);
    setActive(doc.sections.findIndex(section=>section.id===anchor.sectionId));
    last.current={top:el.scrollTop,large,anchor};
  }
  function toSection(index){const el=scroller.current,section=sections.current[index];if(!el)return;el.scrollTo({top:index<0?0:(section?.offsetTop||0)-24,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});setActive(index);}
  function picture(item,index,className=''){return <button className={`reading-image ${className}`} onClick={event=>{photoTrigger.current=event.currentTarget;setPhoto(index);}} aria-label={t('放大图片：','Enlarge image: ')+text(item.caption)}>
    {failedImages[item.src]?<span className="reading-image-unavailable">{t('图片暂时无法显示','Image unavailable')}</span>:<img src={safeDocumentURL(item.src)||undefined} alt={text(item.caption)} onLoad={updateProgress} onError={()=>setFailedImages(v=>({...v,[item.src]:true}))}/>}
    <span className="reading-image-expand"><ArrowsOut/></span></button>;}
  return <div className="document-scrim"><section ref={root} className={`document-reader ${large?'reading-large':''} ${wallControls?'reading-wall':''}`} role="dialog" aria-modal="true" aria-labelledby="reading-title" data-document={doc.id}>
    <header className="reading-toolbar">
      <button className="reading-return exhibit-action" onClick={()=>photo!==null?setPhoto(null):onClose()}><ArrowLeft/>{photo!==null?t('返回文档','Back to document'):t('返回场景','Back to scene')}</button>
      <div className="reading-identity"><BookOpen/><span>{text(doc.category)}</span></div>
      <div className="reading-tools">{onHome&&<button onClick={onHome} aria-label={t('返回公司首页','Company home')}><House/></button>}<button aria-label={t('切换英文','Switch to Chinese')} onClick={()=>onLanguage(lang==='zh'?'en':'zh')}>{lang==='zh'?'EN':'中文'}</button><button aria-pressed={large} onClick={()=>setLarge(v=>!v)} aria-label={t('放大文字','Larger text')}><span className="reading-type-icon">A<span>A</span></span></button><button onClick={onClose} aria-label={t('关闭文档','Close document')}><X/></button></div>
    </header>
    <div className="reading-body" hidden={photo!==null}>
      <aside className="reading-sidebar"><p>{t('本文目录','CONTENTS')}</p><nav aria-label={t('文档目录','Document contents')}><button aria-current={active===-1?'location':undefined} onClick={()=>toSection(-1)}><BookOpen/><span>{t('文档概览','Overview')}</span></button>{doc.sections.map((s,i)=><button key={s.id} aria-current={active===i?'location':undefined} onClick={()=>toSection(i)}><small>{String(i+1).padStart(2,'0')}</small><span>{text(s.title)}</span></button>)}</nav><div className="reading-sidebar-note"><Clock/><span>{t('阅读期间，自动导览已暂停','Presentation is paused while you read')}</span></div></aside>
      <div ref={scroller} className="reading-scroll" onScroll={updateProgress} tabIndex={0} aria-label={t('文档正文','Document body')}>
        <article>
          <header className={`reading-hero ${doc.cover?'with-cover':''}`}><div><p className="reading-status">{text(doc.status)}</p><h1 id="reading-title">{text(doc.title)}</h1><p className="reading-summary">{text(doc.summary)}</p><div className="reading-metadata"><span><Clock/>{t(`约 ${estimate.minutes} 分钟`,`About ${estimate.minutes} min`)}</span>{estimate.images>0&&<span><Images/>{t(`${estimate.images} 张图片`,`${estimate.images} ${estimate.images===1?'image':'images'}`)}</span>}{doc.author&&<span>{text(doc.author)}</span>}{doc.updated&&<span>{t('整理于 ','Compiled ')}{doc.updated}</span>}</div></div>{doc.cover&&<figure>{picture(doc.cover,0,'reading-cover')}<figcaption>{text(doc.cover.caption)}</figcaption></figure>}</header>
          {doc.sections.map((s,i)=><section className="reading-section" key={s.id} id={`reading-${s.id}`} ref={el=>sections.current[i]=el}><div className="reading-section-heading"><span>{String(i+1).padStart(2,'0')}</span><h2>{text(s.title)}</h2></div>{sectionBlocks(s).map((block,j)=>block.type==='paragraph'?<p key={j}>{text(block.text)}</p>:block.type==='list'?<ul key={j}>{block.items.map((v,k)=><li key={k}>{text(v)}</li>)}</ul>:block.type==='image'?<figure className="reading-inline-image" key={j}>{picture(block,pictures.indexOf(block))}<figcaption>{text(block.caption)}</figcaption></figure>:block.type==='gallery'?<div key={j} className="reading-figures" style={{'--gallery-columns':Math.min(3,block.images.length)}}>{block.images.map((item,k)=><figure key={k}>{picture(item,pictures.indexOf(item))}<figcaption>{text(item.caption)}</figcaption></figure>)}</div>:null)}</section>)}
          {(doc.sources?.length>0||doc.attachments?.length>0)&&<footer className="reading-sources"><h2>{t('来源与附件','Sources & files')}</h2>{doc.sources?.map((s,i)=><div key={i}>{safeDocumentURL(s.url)?<a href={safeDocumentURL(s.url)} target="_blank" rel="noopener noreferrer">{text(s.label)}<ArrowUpRight/></a>:<strong>{text(s.label)}</strong>}{s.description&&<p>{text(s.description)}</p>}</div>)}{doc.attachments?.filter(a=>safeDocumentURL(a.url)).map((a,i)=><a className="reading-attachment" key={i} href={safeDocumentURL(a.url)} target="_blank" rel="noopener noreferrer"><DownloadSimple/><span>{text(a.title)}<small>{a.format||t('原始文件','Original file')}</small></span><ArrowUpRight/></a>)}</footer>}
        </article>
      </div>
    </div>
    {photo!==null&&<div className="reading-photo-view"><div className="reading-photo-pan" onDoubleClick={()=>setZoom(v=>v===1?2:1)}><div style={{width:`${zoom*100}%`,height:`${zoom*100}%`}}><img draggable="false" src={safeDocumentURL(pictures[photo].src)||undefined} alt={text(pictures[photo].caption)}/></div></div><div className="reading-photo-tools"><button disabled={photo===0} aria-label={t('上一张图片','Previous image')} onClick={()=>setPhoto(v=>v-1)}><ArrowLeft/></button><span>{photo+1} / {pictures.length}</span><button disabled={photo===pictures.length-1} aria-label={t('下一张图片','Next image')} onClick={()=>setPhoto(v=>v+1)}><ArrowRight/></button><i/><button disabled={zoom===1} aria-label={t('缩小图片','Zoom out')} onClick={()=>setZoom(v=>Math.max(1,v-.5))}><Minus/></button><span>{Math.round(zoom*100)}%</span><button disabled={zoom===3} aria-label={t('放大图片','Zoom in')} onClick={()=>setZoom(v=>Math.min(3,v+.5))}><Plus/></button></div><p>{text(pictures[photo].caption)}</p></div>}
    <footer className="reading-footer"><div className="reading-progress" role="progressbar" aria-label={t('阅读进度','Reading progress')} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${progress}%`}}/></div>{wallControls?<button className="reading-wall-back exhibit-action" onClick={onClose}><ArrowLeft/>{t('返回展演','Back to experience')}</button>:<span>{t('阅读进度','Reading progress')} · {progress}%</span>}<div>{photo===null&&<><button onClick={()=>toSection(active-1)} disabled={active<0} aria-label={t('上一节','Previous section')}><ArrowLeft/></button><button className="exhibit-action" onClick={()=>toSection(active+1)} disabled={active>=doc.sections.length-1||progress===100}>{t('下一节','Next section')}<ArrowRight/></button></>}{wallControls&&<button className="reading-wall-back exhibit-action" onClick={onClose}>{t('返回展演','Back to experience')}<ArrowRight/></button>}</div></footer>
  </section></div>;
}
