// One clock, owned by the theatre frame loop. No timers or hidden-tab catch-up.
export const intelligenceTiming=Object.freeze({stages:6,hold:5,morph:3,cycle:48,focus:1.6,idle:90});
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
const oneHot=index=>Array.from({length:6},(_,i)=>Number(i===index));
export function intelligenceCycle(seconds){
  const time=((seconds%48)+48)%48,stage=Math.floor(time/8),phase=time-stage*8;
  const transition=smooth((phase-5)/3),weights=oneHot(stage);
  weights[stage]=1-transition;weights[(stage+1)%6]=transition;
  return {stage,progress:phase/8,transition,weights};
}
export function createIntelligenceDirector({reduced=false}={}){
  let time=0,mode=reduced?'manual':'auto',stage=0,idle=0,transition=null,weights=oneHot(0),phase=0;
  const snapshot=()=>({stage,mode,progress:mode==='auto'?phase:0,transition:transition?smooth(transition.elapsed/transition.duration):intelligenceCycle(time).transition,weights:[...weights]});
  const focus=(index,nextMode='manual')=>{
    if(!Number.isInteger(index)||index<0||index>=6)return false;
    stage=index;mode=nextMode;idle=0;phase=0;
    transition=reduced?null:{from:[...weights],to:oneHot(index),elapsed:0,duration:intelligenceTiming.focus};
    if(reduced)weights=oneHot(index);
    time=index*8;return true;
  };
  return {
    snapshot,
    select:index=>focus(index),
    activity(){idle=0;},
    openExample(){focus(stage,'case');},
    closeExample(){if(mode==='case'){mode='manual';idle=0;}},
    resume(){focus(stage,'auto');},
    isMoving:()=>Boolean(transition),
    tick(delta,{active=true,playing=true,held=false,suspended=false}={}){
      if(!active||suspended||held)return snapshot();
      const dt=Math.max(0,Math.min(delta,.1));
      if(transition){
        transition.elapsed+=dt;const blend=smooth(transition.elapsed/transition.duration);
        weights=transition.from.map((weight,i)=>weight*(1-blend)+transition.to[i]*blend);
        if(transition.elapsed>=transition.duration){weights=transition.to;transition=null;}
      }else if(playing&&!reduced&&mode==='auto'){
        time=(time+dt)%48;const sample=intelligenceCycle(time);
        weights=sample.weights;stage=sample.stage;phase=sample.progress;
      }
      if(playing&&!reduced&&mode==='manual'){
        idle+=dt;if(idle>=intelligenceTiming.idle)focus(stage,'auto');
      }
      return snapshot();
    },
  };
}
