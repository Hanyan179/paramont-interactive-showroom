import * as THREE from 'three';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {V,TAU,fract,addMesh,opticalPalette,ribbonGeometry,flowingSurface} from './intelligenceOptics.js';

export function evolutionPoint(t,out=V()){
  const a=t*TAU;return out.set(2.02*Math.sin(a),.91*Math.sin(a*2),.49*Math.cos(a));
}

/** Feedback and accumulated knowledge share one continuous volumetric track. */
export function createIntelligenceEvolution(quality){
  const detail=modelDetail('analytics',quality),root=new THREE.Group(),body=new THREE.Group(),m=opticalPalette();
  root.name='knowledge-infinity';root.userData.illustrative=true;root.add(body);body.rotation.set(.10,-.16,-.16);
  const twist=t=>.82*Math.sin(t*TAU)+.22;
  addMesh(body,'infinity-optical-ribbon',ribbonGeometry(detail,evolutionPoint,{width:.27,depth:.062,twist}),m.glass);
  const stream=flowingSurface(m.blue.clone());
  addMesh(body,'infinity-inner-current',ribbonGeometry(detail,evolutionPoint,{width:.205,depth:.045,twist}),stream.material);
  for(const side of [-1,1])addMesh(body,`infinity-polished-edge-${side}`,ribbonGeometry(detail,evolutionPoint,{width:.018,depth:.07,offset:side*.254,twist}),m.silver);
  // Retained inlays are knowledge already acquired; arriving pulses light them
  // in sequence. Nothing is erased or rebuilt when the loop crosses its seam.
  const inlays=[],tangent=V(),p=V(),q=V();
  const inlayGeometry=new THREE.CapsuleGeometry(.018,.085,4,detail.segment(12));
  for(let i=0;i<8;i++){
    const t=(i+.35)/8;evolutionPoint(t,p);evolutionPoint(t+.001,q);tangent.subVectors(q,p).normalize();
    const mark=addMesh(body,`retained-knowledge-${i}`,inlayGeometry,m.gold.clone());mark.position.copy(p);mark.position.z+=.082;
    mark.quaternion.setFromUnitVectors(V(0,1,0),V(tangent.y,-tangent.x,0).normalize());inlays.push(mark);
  }
  const packets=new THREE.InstancedMesh(new THREE.SphereGeometry(1,detail.segment(12),detail.segment(8)),m.light,72);
  packets.name='infinity-feedback-current';packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);packets.frustumCulled=false;body.add(packets);
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),scale=V(),cross=V();
  function update({time=0,reduced=false}={}){
    const clock=reduced?0:time;stream.clock.value=clock;
    for(let i=0;i<packets.count;i++){
      const t=fract(clock/16+i/packets.count);evolutionPoint(t,p);evolutionPoint(t+.001,q);tangent.subVectors(q,p).normalize();
      cross.set(tangent.y,-tangent.x,0).normalize();p.addScaledVector(cross,Math.sin(i*2.4)*.13);p.z+=.082;
      rotation.setFromUnitVectors(V(0,1,0),tangent);const amplitude=.65+.35*Math.sin(t*TAU*3-clock*.35);
      scale.set(.012,.036*amplitude,.012);matrix.compose(p,rotation,scale);packets.setMatrixAt(i,matrix);
    }
    packets.instanceMatrix.needsUpdate=true;
    inlays.forEach((mark,i)=>{const phase=fract(clock/16-(i+.35)/8);mark.material.emissive.set('#c6893a');mark.material.emissiveIntensity=.10+.7*Math.pow(Math.max(0,1-phase*8),2);});
    root.userData.feedbackPhase=fract(clock/16);root.userData.retainedKnowledge=inlays.length;
  }
  update();return {root,update};
}
