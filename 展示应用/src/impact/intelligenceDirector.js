import {JOURNEY_DURATION,stageStarts,stageFrames,journeyFrame,loopTime,ease} from './intelligenceTimeline.js';
export const intelligenceTiming=Object.freeze({stages:6,cycle:JOURNEY_DURATION,idle:90});
export function intelligenceCycle(seconds){const f=journeyFrame(seconds);return {...f,weights:Array.from({length:6},(_,i)=>Number(i===f.stage))};}
export function createIntelligenceDirector({reduced=false,startTime=0}={}){
  let time=reduced?stageFrames[0]:loopTime(startTime),mode=reduced?'manual':'auto',idle=0,seek=null,returnMode='manual';
  const snapshot=()=>({...intelligenceCycle(time),mode,seeking:!!seek});
  return {
    snapshot,
    inspect(seconds){if(!Number.isFinite(seconds))return;time=loopTime(seconds);seek=null;mode='manual';idle=0;},
    select(index){
      if(!Number.isInteger(index)||index<0||index>5)return false;
      const target=stageFrames[index];let distance=target-time;
      if(distance>54)distance-=108;if(distance< -54)distance+=108;
      mode='manual';idle=0;
      if(reduced){time=target;seek=null;}else seek={from:time,distance,elapsed:0,duration:Math.max(1.4,Math.abs(distance)/7)};
      return true;
    },
    activity(){idle=0;},
    openExample(){returnMode=mode;mode='case';idle=0;},
    closeExample(){if(mode==='case'){mode=returnMode;idle=0;}},
    resume(){mode=reduced?'manual':'auto';idle=0;},
    reset(){time=reduced?stageFrames[0]:0;mode=reduced?'manual':'auto';seek=null;idle=0;},
    isMoving:()=>!!seek&&mode!=='case',
    tick(delta,{active=true,playing=true,held=false,suspended=false}={}){
      if(!active||suspended||held||mode==='case')return snapshot();
      const dt=Number.isFinite(delta)?Math.max(0,Math.min(delta,.1)):0;
      if(seek){seek.elapsed+=dt;time=loopTime(seek.from+seek.distance*ease(seek.elapsed/seek.duration));if(seek.elapsed>=seek.duration)seek=null;}
      else if(playing&&!reduced&&mode==='auto')time=loopTime(time+dt);
      else if(playing&&!reduced&&mode==='manual'){idle+=dt;if(idle>=intelligenceTiming.idle){mode='auto';idle=0;}}
      return snapshot();
    },
  };
}
