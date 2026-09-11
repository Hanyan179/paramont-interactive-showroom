import { exhibitionShots, exhibitionTiming } from './config/presentation.js';

export function createExhibitionDirector({now=()=>performance.now(),idleSeconds=exhibitionTiming.idleSeconds,quietSeconds=exhibitionTiming.quietSeconds,onQuiet=()=>{},shots=exhibitionShots,onStart=()=>{},onShot=()=>{},onStop=()=>{}}={}) {
  let active=false,quiet=false,index=0,lastInput=now(),shotAt=now(),held=new Set();
  const setQuiet=value=>{if(quiet!==value){quiet=value;onQuiet(value);}};
  const start=()=>{if(active)return;setQuiet(true);active=true;index=0;shotAt=now();onStart();onShot(shots[index],index);};
  const stop=(options={restore:true})=>{lastInput=now();setQuiet(false);if(!active)return;active=false;onStop(options);};
  return {
    start,stop,activity:()=>stop(),
    configureTiming(timing){
      if(Number.isFinite(timing.idleSeconds)&&timing.idleSeconds>0)idleSeconds=timing.idleSeconds;
      if(Number.isFinite(timing.quietSeconds)&&timing.quietSeconds>0)quietSeconds=timing.quietSeconds;
    },
    pointer(id,down){if(down)held.add(id);else held.delete(id);lastInput=now();},
    clearPointers(){held.clear();lastInput=now();},
    tick({blocked=false,hidden=false}={}){
      const time=now();
      if(blocked||hidden||held.size){lastInput=time;shotAt=time;if(!active)setQuiet(false);return;}
      if(!active){if(time-lastInput>=idleSeconds*1000)start();else if(time-lastInput>=quietSeconds*1000)setQuiet(true);return;}
      if(time-shotAt>=shots[index].seconds*1000){index=(index+1)%shots.length;shotAt=time;onShot(shots[index],index);}
    },
    get state(){return {active,quiet,idleMs:Math.max(0,now()-lastInput),index,shot:shots[index],held:held.size};},
  };
}
