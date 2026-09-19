import { showroomAreas, activeArea } from '../config/areas.js';
import { useEffect, useRef, useState } from 'react';
import { CaretUp, CornersOut, Play, Pause, Check, Compass, X } from '@phosphor-icons/react';
import './exhibition-controls.css';

export function SystemBar({page,lang,context,onSelect,onNavigate,onHome,onLanguage,onFullscreen,onPresentation,onAttention,presenting}) {
  const t=(zh,en)=>lang==='zh'?zh:en;
  const activePage=activeArea(page);
  const [expanded,setExpanded]=useState(false),[controlsOpen,setControlsOpen]=useState(false),root=useRef(null),trigger=useRef(null),menu=useRef(null),controlsTrigger=useRef(null),controlsRoot=useRef(null);
  const closeControls=()=>{setExpanded(false);setControlsOpen(false);controlsTrigger.current?.focus({preventScroll:true});};
  useEffect(()=>{onAttention?.(controlsOpen);return()=>onAttention?.(false);},[controlsOpen,onAttention]);
  useEffect(()=>{setExpanded(false);setControlsOpen(false);},[page,context.active,presenting]);
  useEffect(()=>{if(!controlsOpen)return;
    trigger.current?.focus({preventScroll:true});
    const outside=e=>{if(!controlsRoot.current?.contains(e.target))closeControls();};
    const key=e=>{if(e.key==='Escape'&&!expanded){e.preventDefault();closeControls();}};
    window.addEventListener('pointerdown',outside,true);window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('pointerdown',outside,true);window.removeEventListener('keydown',key);};
  },[controlsOpen,expanded]);
  useEffect(()=>{if(!expanded)return;menu.current?.querySelector('[aria-current="page"]')?.focus();
    const outside=e=>{if(!root.current?.contains(e.target))setExpanded(false);};
    const key=e=>{if(e.key==='Escape'){e.preventDefault();setExpanded(false);trigger.current?.focus();}};
    window.addEventListener('pointerdown',outside,true);window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('pointerdown',outside,true);window.removeEventListener('keydown',key);};
  },[expanded]);
  return <footer ref={controlsRoot} className={`system-bar exhibition-controls ${controlsOpen?'controls-open':'controls-resting'}`} aria-label={t('展厅系统栏','Showroom system bar')}>
    <button className="system-brand" aria-label={t('返回公司首页','Company home')} onClick={()=>{closeControls();onHome();}}>
      <svg className="system-logo" viewBox="0 99 406 210" role="img" aria-label="PARAMONT GLOBAL">
        <defs><filter id="paramont-remove-white" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 10"/></filter></defs>
        <image href="/media/brand/paramont-global-original.png" width="406" height="407" filter="url(#paramont-remove-white)"/>
      </svg>
    </button>
    <div className="system-panel" id="exhibition-control-panel" hidden={!controlsOpen}>
    <div className="system-area" ref={root} onBlur={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget))setExpanded(false);}}>
      <button ref={trigger} className="system-area-trigger" aria-expanded={expanded} aria-controls="showroom-areas" aria-label={t('切换区域：','Switch area: ')+t(...showroomAreas.find(a=>a.id===activePage).label)} onClick={()=>setExpanded(v=>!v)}><span>{t(...showroomAreas.find(a=>a.id===activePage).label)}</span><CaretUp/></button>
      {expanded&&<div id="showroom-areas" className="system-area-menu" ref={menu}><p>{t('展厅区域','Showroom areas')}</p>{showroomAreas.map(({id,label})=><button key={id} onClick={()=>{closeControls();onNavigate(id);}} aria-current={activePage===id?'page':undefined}><span>{t(...label)}</span>{activePage===id&&<Check/>}</button>)}</div>}
    </div>
    <nav aria-label={t(...context.label)}>
      {context.items.map(({id,label})=><button key={id} onClick={()=>{closeControls();onSelect(id);}} aria-current={context.active===id?'step':undefined} className={context.active===id?'active':''}>{t(...label)}</button>)}
    </nav>
    <div className="system-tools">
      <button className="system-language" onClick={()=>onLanguage(lang==='zh'?'en':'zh')} aria-label={t('切换英文','Switch to Chinese')}>{lang==='zh'?'EN':'中文'}</button>
      <button className="system-icon" onClick={onFullscreen} aria-label={t('切换全屏','Toggle fullscreen')}><CornersOut/></button>
    </div>
    </div>
    <div className="system-rest-actions">
      <button ref={controlsTrigger} className="system-explore-toggle" aria-label={controlsOpen?t('收起操作','Close controls'):t('探索展厅','Explore')} aria-expanded={controlsOpen} aria-controls="exhibition-control-panel" onClick={()=>{if(controlsOpen)closeControls();else setControlsOpen(true);}}>{controlsOpen?<X/>:<Compass/>}<span>{controlsOpen?t('收起操作','Close controls'):t('探索展厅','Explore')}</span></button>
      {!controlsOpen&&<button className="system-present-toggle" onClick={()=>{closeControls();onPresentation();}} aria-pressed={presenting} aria-label={t('自动展示','Presentation')}>{presenting?<Pause/>:<Play/>}</button>}
    </div>
  </footer>;
}
