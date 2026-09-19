import {useEffect,useRef} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Sun,Moon} from '@phosphor-icons/react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {categoryReel} from './categoryContent.js';
import {portalSelection} from './categoryPortalLayout.js';
import featured from '../../../共享数据/featured-categories.json';
import './category-portals.css';

export function CategoryPortals({theme,onTheme,catalog,lang,selected,focused,onSelect,onFocus,onBack,onRead,onScene,onHold,onDrag,onInteract,journeyRef}){
  const host=useRef(),targets=useRef({}),back=useRef(),latest=useRef(),restoreFocus=useRef(false);
  const l=lang==='en'?1:0,entry=featured.categories[selected];
  const category=catalog?.categories.find(item=>item.id===entry.catalogId),scene=categoryReel.findIndex(item=>item.catalogId===entry.catalogId);
  const step=delta=>{onSelect(portalSelection(selected,delta));onInteract();};
  const read=()=>{if(category){onInteract();onRead(category);}};
  latest.current={focused,selected,onSelect,onFocus,onBack,onHold,onDrag,onInteract,step,read,onScene,scene,onTheme};
  useEffect(()=>{
  journeyRef.current={frame(points){points.forEach(point=>{
    const el=targets.current[point.index];if(!el)return;
    el.hidden=!point.visible;el.style.left=`${point.x}px`;el.style.top=`${point.y}px`;el.style.width=`${point.width}px`;el.style.height=`${point.height}px`;el.style.clipPath=`polygon(${point.clip})`;
    if(restoreFocus.current&&point.index===latest.current.selected&&point.visible&&point.settled){restoreFocus.current=false;el.focus({preventScroll:true});}
  });}};
    let distance=0;
    const pointer=bindScenePointer(host.current,{includeControls:true,claimClick:true,
      onStart(){distance=0;latest.current.onHold(true);latest.current.onInteract();},
      onMove(_event,{gesture}){distance=gesture.x-gesture.startX;latest.current.onDrag(Math.max(-.5,Math.min(.5,distance/host.current.clientWidth)));},
      onEnd({cancelled}){latest.current.onDrag(0);latest.current.onHold(false);if(!cancelled&&latest.current.focused&&Math.abs(distance)>70)latest.current.step(distance<0?1:-1);},
      onTap(_event,gesture){
        const el=gesture.target.closest('[data-portal-index],[data-portal-action]');if(!el)return;
        if(el.dataset.portalIndex!==undefined){latest.current.onFocus(Number(el.dataset.portalIndex));return;}
        switch(el.dataset.portalAction){case'light':latest.current.onTheme('light');break;case'dark':latest.current.onTheme('dark');break;case'back':latest.current.onBack();break;case'read':latest.current.read();break;case'scene':latest.current.onScene(latest.current.scene);break;case'previous':latest.current.step(-1);break;case'next':latest.current.step(1);break;}
      }
    });return()=>{pointer.dispose();journeyRef.current=null;};
  },[]);
  const keyboard=fn=>e=>{if(e.detail===0)fn();};
  function close(){restoreFocus.current=true;onBack();}
  latest.current.onBack=close;
  useEffect(()=>{if(focused)back.current?.focus({preventScroll:true});},[focused]);
  return <section ref={host} className={`category-portals ${focused?'is-focused':''}`} aria-label={['六大品类展廊','Six category gallery'][l]} data-scheme="2" data-focused={focused?entry.id:'overview'} onKeyDown={e=>{
    if(e.key==='Escape'&&focused){e.preventDefault();e.stopPropagation();close();}
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();const delta=e.key==='ArrowRight'?1:-1;if(focused)step(delta);else{const next=portalSelection(Number(e.target.dataset.portalIndex??selected),delta);onSelect(next);targets.current[next]?.focus({preventScroll:true});}}
  }}>
    <div className="category-theme-switch" role="group" aria-label={['展厅色系','Gallery theme'][l]}>{['light','dark'].map(value=><button key={value} aria-pressed={theme===value} data-portal-action={value} onClick={keyboard(()=>onTheme(value))}>{value==='light'?<Sun weight="light"/>:<Moon weight="light"/>}<span>{(value==='light'?['明色','Light']:['暗色','Dark'])[l]}</span></button>)}</div>
    <header className="category-portals-title" aria-hidden={focused?true:undefined}><p>{['我们的品类世界','OUR CATEGORY WORLD'][l]}</p><h1>{['让每个生活场景','Every moment.'][l]}<br/>{['都更美好。','A better life.'][l]}</h1></header>
    <nav className="category-portal-targets" aria-label={['走进一个品类','Explore a category'][l]} aria-hidden={focused?true:undefined}>
      {featured.categories.map((item,index)=><button key={item.id} hidden ref={el=>{targets.current[index]=el;}} className="category-portal-target" data-portal-index={index} onClick={keyboard(()=>onFocus(index))} onFocus={()=>onHold(true)} onBlur={()=>onHold(false)} aria-label={`${item.name[l]} · ${['走近展窗','View exhibit'][l]}`}/>)}
    </nav>
    {!focused&&<p className="category-portals-footer">{['多元品类，共创生活灵感','Thoughtfully made. For every day.'][l]}</p>}
    {focused&&<><div className="category-portal-focus-touch" role="group" tabIndex={0} aria-label={['左右滑动切换品类','Swipe to change category'][l]}/><article className="category-portal-detail" key={entry.id}><p className="category-portal-number">{String(selected+1).padStart(2,'0')} / 06<span>{['精选品类','OUR KEY CATEGORIES'][l]}</span></p><h1>{entry.name[l]}</h1><p className="category-portal-description">{entry.detail[l]}</p><div className="category-portal-actions"><button data-portal-action="read" onClick={keyboard(read)}>{['阅读品类介绍','Explore this category'][l]}<ArrowUpRight/></button>{scene>=0&&<button data-portal-action="scene" onClick={keyboard(()=>onScene(scene))}>{['走进产品场景','Enter product scene'][l]}<ArrowRight/></button>}</div><div className="category-portal-paging"><button data-portal-action="previous" onClick={keyboard(()=>step(-1))} aria-label={['上一个精选品类','Previous featured category'][l]}><ArrowLeft/></button><button data-portal-action="next" onClick={keyboard(()=>step(1))} aria-label={['下一个精选品类','Next featured category'][l]}><ArrowRight/></button></div></article>
      {['left','right'].map(side=><button ref={side==='left'?back:null} key={side} data-portal-action="back" className={`category-portal-back ${side}`} onClick={keyboard(close)} aria-label={`${(side==='left'?['左侧','Left']:['右侧','Right'])[l]} ${['返回品类总览','Back to categories'][l]}`}><ArrowLeft/>{['品类总览','All categories'][l]}</button>)}
    </>}
    <p className="category-portals-note">{['产品视觉为品类概念演绎','Product visuals are category concepts'][l]}</p>
  </section>;
}
