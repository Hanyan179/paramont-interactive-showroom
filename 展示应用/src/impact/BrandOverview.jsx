import {useEffect,useRef} from 'react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {brandFlowPose} from './brandLayout.js';
import './brand-overview.css';

export function BrandOverview({brands,lang,onSelect,onHold,onInteract,flow,journeyRef}){
  const l=lang==='zh'?0:1,host=useRef(),targets=useRef({}),latest=useRef();
  latest.current={onSelect,onHold,onInteract};
  journeyRef.current={frame(points){points.forEach(point=>{
    const button=targets.current[point.index];if(!button)return;
    button.style.left=point.x+'px';button.style.top=point.y+'px';button.hidden=!point.visible;
  });}};
  useEffect(()=>{
    let row=0,origin=0;
    const pointer=bindScenePointer(host.current,{includeControls:true,claimClick:true,
      onStart(_event,gesture){
        const rect=host.current.getBoundingClientRect();row=(gesture.startY-rect.top)/rect.height<.55?0:1;
        origin=flow.current.offsets[row];flow.current.heldRow=row;latest.current.onHold(true);latest.current.onInteract();host.current.classList.add('is-dragging');
      },
      onMove(_event,{gesture}){flow.current.offsets[row]=origin+(gesture.x-gesture.startX)/host.current.clientWidth;latest.current.onInteract();},
      onEnd({cancelled}){if(cancelled)flow.current.offsets[row]=origin;flow.current.heldRow=null;host.current?.classList.remove('is-dragging');latest.current.onHold(false);},
      onTap(_event,gesture){const slot=gesture.target.closest('[data-brand-slot]')?.dataset.brandSlot;if(slot!==undefined)latest.current.onSelect(Number(slot));},
    });return()=>{pointer.dispose();journeyRef.current=null;};
  },[]);
  return <section ref={host} className="brand-overview" aria-label={['品牌总览','Brand overview'][l]}>
    <header><p>{['旗下品牌','OUR BRANDS'][l]}</p><h1>{['品牌，各有光芒。','DISTINCTIVE BY NATURE.'][l]}</h1></header>
    <nav aria-label={['选择品牌','Choose a brand'][l]}>{brands.map((brand,index)=>{
      const pose=brandFlowPose(index,brands.length,flow.current.offsets);
      return <button key={brand.id} ref={el=>{targets.current[index]=el;}} data-brand-slot={index} data-brand-row={pose.row} hidden={!pose.visible} style={{left:`${pose.x*100}%`,top:`${pose.y*100}%`}} onFocus={()=>{flow.current.heldRow=pose.row;onHold(true);}} onBlur={()=>{flow.current.heldRow=null;onHold(false);}} onClick={event=>{if(event.detail===0)onSelect(index);}} aria-label={`${brand.name} · ${['进入品牌','Explore brand'][l]}`}/>;
    })}</nav>
  </section>;
}
