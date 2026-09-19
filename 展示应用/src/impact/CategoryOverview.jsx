import {useEffect,useRef} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight} from '@phosphor-icons/react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {categoryReel} from './categoryContent.js';
import featured from '../../../共享数据/featured-categories.json';
import './category-overview.css';

export function CategoryOverview({catalog,lang,selected=0,onSelect,onRead,onScene,onHold,onDrag}){
  const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en,host=useRef(),latest=useRef(),entries=featured.categories;
  const entry=entries[selected],category=catalog?.categories.find(item=>item.id===entry.catalogId);
  const change=delta=>onSelect((selected+delta+entries.length)%entries.length);
  const read=()=>category&&onRead(category);
  latest.current={change,onSelect,read,onHold,onDrag,onScene,scene:categoryReel.findIndex(item=>item.catalogId===entry.catalogId)};
  useEffect(()=>{
    let distance=0;
    const pointer=bindScenePointer(host.current,{includeControls:true,claimClick:true,
      onStart(){distance=0;latest.current.onHold?.(true);},
      onMove(_event,{gesture}){distance=gesture.x-gesture.startX;latest.current.onDrag?.(Math.max(-.38,Math.min(.38,distance/host.current.clientWidth)));},
      onEnd({cancelled}){latest.current.onDrag?.(0);latest.current.onHold?.(false);if(!cancelled&&Math.abs(distance)>55)latest.current.change(distance<0?1:-1);},
      onTap(_event,gesture){const button=gesture.target.closest('[data-category-index],[data-category-step],[data-category-read],[data-category-scene]');if(!button)return;if(button.dataset.categoryIndex!==undefined)latest.current.onSelect(Number(button.dataset.categoryIndex));else if(button.dataset.categoryStep!==undefined)latest.current.change(Number(button.dataset.categoryStep));else if(button.dataset.categoryScene!==undefined)latest.current.onScene(latest.current.scene);else latest.current.read();}
    });return()=>pointer.dispose();
  },[]);
  const scene=categoryReel.findIndex(item=>item.catalogId===entry.catalogId);
  return <section ref={host} className="category-overview" aria-label={t('精选业务品类','Featured business categories')}>
    <div className="category-space-touch" aria-hidden="true"/>
    <header>
      <p>{t('品类世界','OUR KEY CATEGORIES')}<span>{String(selected+1).padStart(2,'0')} / 06</span></p>
      <div key={entry.id} className="category-introduction"><h1>{entry.name[l]}</h1><div className="category-range">{entry.detail[l]}</div></div>
      <nav className="category-index" aria-label={t('选择品类','Choose a category')}>{entries.map((item,index)=><button data-category-index={index} key={item.id} aria-pressed={index===selected} onClick={()=>onSelect(index)}><i/><strong>{item.name[l]}</strong></button>)}</nav>
      <div className="category-actions"><button className="exhibit-action" data-category-read onClick={read}>{t('探索这一品类','EXPLORE THE CATEGORY')}<ArrowUpRight/></button>
        {scene>=0&&<button className="category-scene-link exhibit-action" data-category-scene onClick={()=>onScene(scene)}>{t('走进产品场景','ENTER PRODUCT SCENE')}<ArrowRight/></button>}
      </div>
    </header>
    <button className="category-object-touch" data-category-read onClick={read} aria-label={t(`了解${entry.name[0]}`,`Explore ${entry.name[1]}`)}/>
    <div className="category-turn"><button data-category-step={-1} onClick={()=>change(-1)} aria-label={t('上一个精选品类','Previous featured category')}><ArrowLeft/></button><button data-category-step={1} onClick={()=>change(1)} aria-label={t('下一个精选品类','Next featured category')}><ArrowRight/></button></div>
    <p className="category-overview-note">{t('六大精选品类 · 产品视觉为品类概念演绎','Six core categories · Product visuals are category concepts')}</p>
  </section>;
}
