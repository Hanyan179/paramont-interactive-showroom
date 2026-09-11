import { exhibitionTiming } from './config/presentation.js';
import {useEffect,useRef,useState} from 'react';
import {createExhibitionDirector} from './exhibitionDirector';

export function useExhibition({seconds=exhibitionTiming.idleSeconds,blocked,onStart,onShot,onStop}) {
  const [quiet,setQuiet]=useState(false),[presenting,setPresenting]=useState(false),[shot,setShot]=useState(null);
  const latest=useRef();latest.current={blocked,onStart,onShot,onStop};
  const director=useRef();
  if(!director.current)director.current=createExhibitionDirector({idleSeconds:seconds,onQuiet:setQuiet,
    onStart(){latest.current.onStart();setPresenting(true);},
    onShot(value){setShot(value);latest.current.onShot(value);},
    onStop(options){setPresenting(false);setShot(null);latest.current.onStop(options);},
  });
  useEffect(()=>{ director.current.configureTiming({idleSeconds:seconds}); },[seconds]);
  useEffect(()=>{
    const d=director.current;
    let wakingPointer=null,swallowClick=false;
    const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
    const down=e=>{
      d.pointer(e.pointerId,true);
      if(d.state.quiet||d.state.active){wakingPointer=e.pointerId;consume(e);return;}
      swallowClick=false;
      if(e.target.closest?.('.tour-button'))return;
      if(e.target.closest?.('.system-bar nav,.system-brand'))d.stop({restore:false});else d.activity();
    };
    const up=e=>{d.pointer(e.pointerId,false);if(wakingPointer===e.pointerId){wakingPointer=null;swallowClick=true;consume(e);d.activity();}};
    const click=e=>{if(swallowClick){swallowClick=false;consume(e);}};
    const activity=e=>{
      if(wakingPointer!==null)return;
      if(d.state.quiet||d.state.active){if(e.type==='pointermove')return;consume(e);}
      d.activity();
    };
    const reset=()=>{wakingPointer=null;swallowClick=false;d.clearPointers();};
    window.addEventListener('pointerdown',down,true);
    window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);
    window.addEventListener('click',click,true);
    ['pointermove','keydown','wheel'].forEach(e=>window.addEventListener(e,activity,{capture:true,passive:false}));
    window.addEventListener('blur',reset);
    const timer=setInterval(()=>{
      const blocked=latest.current.blocked||Array.from(document.querySelectorAll('[role=dialog]:not([data-tour-media=true])')).some(el=>el.getClientRects().length)||Array.from(document.querySelectorAll('video:not([data-tour-media=true])')).some(v=>!v.paused&&!v.ended);
      d.tick({blocked,hidden:document.hidden});
      const main=document.querySelector('.showroom');
      if(main){main.dataset.idleSeconds=(d.state.idleMs/1000).toFixed(1);main.dataset.idleBlocked=String(!!blocked);main.dataset.heldTouches=String(d.state.held);}
    },250);
    return()=>{clearInterval(timer);window.removeEventListener('pointerdown',down,true);window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);window.removeEventListener('click',click,true);['pointermove','keydown','wheel'].forEach(e=>window.removeEventListener(e,activity,true));window.removeEventListener('blur',reset);};
  },[]);
  return {presenting,quiet,cinematic:presenting||quiet,shot,activityFromChild:message=>{if(['pointerdown','pointerup','pointercancel'].includes(message.event))director.current.pointer('child-'+message.pointerId,message.event==='pointerdown');director.current.activity();},wake:()=>director.current.activity(),leavePresentation:()=>director.current.stop({restore:false}),toggle:()=>director.current.state.active?director.current.stop():director.current.start()};
}
