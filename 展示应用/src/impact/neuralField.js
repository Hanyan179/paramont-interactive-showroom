import * as THREE from 'three';
import {V,trace} from './depthGeometry.js';

// A designed inference volume. Nodes and pulses express a process, not measured data.
export function createNeuralField(){
  const root=new THREE.Group(),points=[],positions=[],phases=[],sizes=[];
  for(let side=-1;side<=1;side+=2)for(let i=0;i<420;i++){
    const a=i*2.39996323,v=1-2*(i+.5)/420,r=Math.sqrt(1-v*v);
    const fold=1+.065*Math.sin(a*5+v*13),shell=i%6===0?.66:1;
    const point=V(side*(2.05+Math.cos(a)*r*2.55*fold*shell),v*3.25*shell,Math.sin(a)*r*3.8*fold*shell);
    point.y+=.48*Math.cos(point.z*.5);points.push(point);positions.push(...point.toArray());phases.push((point.x+5)/10);sizes.push(i%19===0?4.5:1.8);
  }
  const edges=[],edgePhases=[];
  points.forEach((p,i)=>{
    const neighbours=points.map((other,j)=>({j,d:p.distanceToSquared(other)})).filter(n=>n.j>i&&n.d<5).sort((a,b)=>a.d-b.d).slice(0,4);
    neighbours.forEach(({j})=>{edges.push(...p.toArray(),...points[j].toArray());edgePhases.push(phases[i],phases[j]);});
  });
  const uniforms={time:{value:0},focus:{value:1}};
  const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edges,3));lineGeometry.setAttribute('aPhase',new THREE.Float32BufferAttribute(edgePhases,1));
  const lines=new THREE.LineSegments(lineGeometry,new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute float aPhase;varying float vPhase;void main(){vPhase=aPhase;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float time;uniform float focus;varying float vPhase;void main(){float wave=pow(max(0.,1.-fract(vPhase-time*.13)),15.);vec3 color=mix(vec3(.12,.44,.69),vec3(.63,.93,1.2),wave);gl_FragColor=vec4(color,(.13+wave*.7)*focus);}',
  }));root.add(lines);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
  const nodes=new THREE.Points(geometry,new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute float aPhase;attribute float aSize;uniform float time;varying float vPulse;void main(){vPulse=pow(max(0.,1.-fract(aPhase-time*.13)),12.);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*(1.+vPulse*.8)*105./-p.z,1.5,16.);}',
    fragmentShader:'uniform float focus;varying float vPulse;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-d),1.7);gl_FragColor=vec4(mix(vec3(.27,.68,1.),vec3(1.4,1.15,.72),vPulse),a*focus);}',
  }));root.add(nodes);
  for(let i=0;i<12;i++){
    const z=(i-5.5)*.45;trace(root,Array.from({length:50},(_,j)=>{const x=-3+j/49*6;return V(x,.5+Math.sin(j/49*Math.PI)*1.3,z+Math.cos(x)*.15);}),i%4===0?'#d4b879':'#63bedc',.3);
  }
  return {root,update(time,emphasis=1){uniforms.time.value=time;uniforms.focus.value=emphasis;root.rotation.y=Math.sin(time*.095)*.16;root.rotation.z=Math.sin(time*.12)*.025;}};
}
