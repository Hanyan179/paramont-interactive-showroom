import * as THREE from 'three';
import {volumeMaterial,floatPose} from './vendor/dreiMotion.js';
import {ramp} from './intelligenceTimeline.js';
// A real, closed four-sided projection frustum. Its far edge follows the screen.
export function createProjection(){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(36*3),3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(36*2),2));
 const mesh=new THREE.Mesh(geometry,volumeMaterial());mesh.name='right-to-left-projection';mesh.frustumCulled=false;
 const eye=new THREE.Vector3(),corners=Array.from({length:4},()=>new THREE.Vector3()),point=new THREE.Vector3();
 function aim(source,screen,root,scanY,progress){
  root.updateMatrixWorld(true);source.getWorldPosition(eye);root.worldToLocal(eye);
  const w=3.24*progress,h=.12;
  [[-w,scanY-h],[w,scanY-h],[w,scanY+h],[-w,scanY+h]].forEach(([x,y],i)=>{point.set(x,y,.12);screen.localToWorld(point);corners[i].copy(root.worldToLocal(point));});
  const p=geometry.attributes.position,u=geometry.attributes.uv;let index=0;
  for(let i=0;i<4;i++)for(const [v,uv] of [[eye,[.5,0]],[corners[i],[0,1]],[corners[(i+1)%4],[1,1]]]){p.setXYZ(index,v.x,v.y,v.z);u.setXY(index,...uv);index++;}
  geometry.setDrawRange(0,index);p.needsUpdate=true;u.needsUpdate=true;geometry.computeVertexNormals();
  mesh.userData.source=eye.toArray();mesh.userData.target=corners[0].clone().lerp(corners[2],.5).toArray();
 }
 return {mesh,aim};
}
export function blinkAt(t){let blink=0;for(const at of [31.8,35.15,41.35,48.1])blink=Math.max(blink,ramp(t,at,at+.13)*(1-ramp(t,at+.16,at+.42)));return 1-.94*blink;}
export function presenceAt(t){const awake=ramp(t,28,33),look=ramp(t,34,37),float=floatPose(t-28,.85*awake);return{awake,look,turn:ramp(t,34.6,37.4),float,blink:blinkAt(t),scanY:Math.sin((t-38)*.9)*1.55,eyeY:Math.sin((t-38)*.9)*.14*look,eyeX:-.16*look};}
// Discrete letters over a smooth layout envelope; reverse at the end makes G → G seamless.
export function typedCount(t,length,index=0){
 if(index===0){if(t>=104)return Math.max(1,length-Math.floor(ramp(t,104,107.5)*(length-1)));return Math.min(length,1+Math.floor(Math.max(0,t-.45)/.14));}
 const start=2.8+index*.36;return Math.max(0,Math.min(length,Math.floor((t-start)/.08)));
}
export function installTyping(mesh,text,context,width){
 context.font=`400 ${Math.min(108,1500/Math.max(1,text.length))}px "Arial", sans-serif`;
 const total=context.measureText(text).width||text.length*55;
 const widths=Array.from({length:text.length+1},(_,i)=>context.measureText(text.slice(0,i)).width||i*55);
 const cut={value:1};mesh.userData.typing={text,widths,total,cut,width};
 mesh.material.onBeforeCompile=shader=>{shader.uniforms.letterCut=cut;shader.fragmentShader='uniform float letterCut;\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vMapUv.x>letterCut)discard;');};mesh.material.customProgramCacheKey=()=> 'intelligence-typed-text';
}
export function typeMesh(mesh,count){const q=mesh.userData.typing;if(!q)return 0;const n=Math.max(0,Math.min(q.text.length,count));q.cut.value=(512-q.total/2+q.widths[n])/1024;mesh.userData.typedCount=n;return (q.total-q.widths[n])/2048*q.width;}
