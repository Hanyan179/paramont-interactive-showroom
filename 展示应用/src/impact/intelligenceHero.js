import * as THREE from 'three';
import {modelDetail} from '../../../共享组件/renderQuality.js';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const blue=new THREE.Color('#57b7f0'),gold=new THREE.Color('#e5ba70');
// Three continuous surfaces retain their vertices as data volumes, an analytic
// lens, an opportunity crystal, decision panes, product forms and knowledge.
function surface(stage,body,x,y,z,theta,v,out){
  const box=Math.max(Math.abs(x),Math.abs(y),Math.abs(z),.001);
  if(stage===0){out.set(x/box*1.12+(body-1)*2.35,y/box*1.32+(body===1?.75:-.4),z/box*1.12+(body===1?-.4:.35));}
  else if(stage===1){const r=[2.95,2.22,1.35][body];out.set(x*r,y*r,z*r);}
  else if(stage===2){
    const edge=Math.abs(x)+Math.abs(y)+Math.abs(z),r=body===1?3.4:1.3;
    out.set(x/edge*r+(body-1)*3.8,y/edge*r*(body===1?1.25:1)+(body===1?.65:-.6),z/edge*r);
  }else if(stage===3){
    const angle=(body-1)*-.19,px=x/box*1.43,py=y/box*2.35,pz=z/box*.14;
    out.set(px*Math.cos(angle)+pz*Math.sin(angle)+(body-1)*3.25,py+(body===1?.4:0),-px*Math.sin(angle)+pz*Math.cos(angle)+(body===1?.7:-.25));
  }else if(stage===4){
    if(body===0){
      const height=(1-v)*5.8-2.65;
      let radius=v<.12?.52:v<.17?.43:v<.31?lerp(.48,1.02,(v-.17)/.14):1.02;
      radius*=Math.min(1,Math.sin(v*Math.PI)*16);
      out.set(-3.7+Math.cos(theta)*radius,height,Math.sin(theta)*radius);
    }else if(body===1){
      const height=(1-v)*4.65-2.55;
      const wave=Math.pow(Math.max(0,Math.sin(v*Math.PI*4)),.5);
      const radius=(.35+v*1.45)*(.23+.77*wave)*Math.min(1,Math.sin(v*Math.PI)*16);
      out.set(Math.cos(theta)*radius,height,Math.sin(theta)*radius);
    }else{out.set(3.8+x/box*1.05,y/box*1.55-.45,z/box*.7);}
  }else{
    const offset=[[-1.75,-.85,.4],[0,1.05,-.4],[1.75,-.25,.1]][body];
    out.set(x/box*1.17+offset[0],y/box*1.17+offset[1],z/box*1.17+offset[2]);
  }
  return out;
}
function luminousShell(geometry){
  return new THREE.Mesh(geometry,new THREE.ShaderMaterial({
    uniforms:{tint:{value:blue.clone()},strength:{value:.36}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide,
    vertexShader:'varying vec3 n;varying vec3 eye;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 tint;uniform float strength;varying vec3 n;varying vec3 eye;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(eye))),2.4);gl_FragColor=vec4(tint*(1.2+f),f*strength);}'
  }));
}
export function createIntelligenceHero(quality){
  const root=new THREE.Group();root.name='intelligence-material-volume';
  const detail=modelDetail('analytics',quality),segments=detail.segment(48),rings=detail.segment(32);
  const base=new THREE.SphereGeometry(1,segments,rings),basePositions=base.attributes.position.array;
  const geometries=[],materials=[],shells=[],targets=[],p=V();
  for(let body=0;body<3;body++){
    const geometry=base.clone();geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const shapes=Array.from({length:6},()=>new Float32Array(basePositions.length));
    for(let i=0;i<basePositions.length;i+=3){
      const x=basePositions[i],y=basePositions[i+1],z=basePositions[i+2],theta=Math.atan2(z,x),v=Math.acos(clamp(y,-1,1))/Math.PI;
      for(let stage=0;stage<6;stage++){surface(stage,body,x,y,z,theta,v,p);shapes[stage].set([p.x,p.y,p.z],i);}
    }
    const material=new THREE.MeshPhysicalMaterial({color:'#568eb8',metalness:.38,roughness:.13,clearcoat:1,clearcoatRoughness:.12,transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.45,emissive:'#0b4070',emissiveIntensity:.42});
    const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=body;root.add(mesh);
    const shell=luminousShell(geometry);shell.renderOrder=5+body;root.add(shell);
    geometries.push(geometry);materials.push(material);shells.push(shell);targets.push(shapes);
    geometry.boundingSphere=new THREE.Sphere(V(),9);
  }
  base.dispose();
  // A concentrated inner light gives the volume a centre, rather than a hollow outline.
  const nucleus=new THREE.Mesh(new THREE.IcosahedronGeometry(.52,2),new THREE.MeshStandardMaterial({color:'#d9eeff',emissive:'#69bbff',emissiveIntensity:3.6,metalness:.3,roughness:.18}));root.add(nucleus);
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(4.3,4.3),new THREE.ShaderMaterial({
    uniforms:{tint:{value:blue.clone()},intensity:{value:.55}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 uv0;uniform vec3 tint;uniform float intensity;void main(){float r=length(uv0-.5)*2.;float a=exp(-r*r*7.)*intensity;gl_FragColor=vec4(tint*1.6,a);}'
  }));halo.position.z=2.8;root.add(halo);
  // Reusable records become readable comparison bars inside the three decision panes.
  const blocks=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#76bee7',emissive:'#26668c',emissiveIntensity:.8,metalness:.42,roughness:.2,transparent:true,opacity:.72}),36);root.add(blocks);blocks.frustumCulled=false;
  const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),scale=V(),offset=V(),stagePositions=Array.from({length:6},()=>V());
  let previous=null;
  function update(time,weights){
    const changed=!previous||weights.some((w,i)=>Math.abs(w-previous[i])>.00001);
    if(changed){
      for(let body=0;body<3;body++){
        const geo=geometries[body],out=geo.attributes.position.array;
        for(let i=0;i<out.length;i++){let value=0;for(let s=0;s<6;s++)value+=targets[body][s][i]*weights[s];out[i]=value;}
        geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();
        const opportunity=weights[2]*(body===1?1:.1),decision=weights[3]*(body===1?.3:0);
        materials[body].color.set('#568eb8').lerp(gold,opportunity*.67+decision);
        materials[body].emissive.set('#0b4070').lerp(new THREE.Color('#6c4012'),opportunity);
        materials[body].opacity=.5+weights[4]*.23-weights[1]*(body===0?.22:.1)-weights[3]*.2;
        materials[body].roughness=.13+weights[4]*.07;
        shells[body].material.uniforms.tint.value.copy(blue).lerp(gold,opportunity);
        shells[body].material.uniforms.strength.value=.32+weights[1]*.1+weights[2]*.1;
      }
      previous=Array.from(weights);
    }
    const bright=weights[1]+weights[2];
    nucleus.scale.setScalar(.14+bright*.9);nucleus.position.y=weights[2]*.65;
    nucleus.material.emissive.copy(blue).lerp(gold,weights[2]);nucleus.rotation.set(time*.06,time*.09,0);
    halo.position.y=nucleus.position.y;halo.material.uniforms.tint.value.copy(blue).lerp(gold,weights[2]);halo.material.uniforms.intensity.value=.06+bright*.48;
    for(let i=0;i<36;i++){
      const angle=i/36*Math.PI*2,row=i%6,body=Math.floor(i/12),k=i%12;
      stagePositions[0].set((i%4-1.5)*1.9,(Math.floor(i/4)%3-1)*1.7,Math.floor(i/12)*1.6-1.6);
      stagePositions[1].set(Math.cos(angle)*2.7,Math.sin(angle*2.3)*2.2,Math.sin(angle)*2.7);
      stagePositions[2].set(Math.cos(angle)*3.7,Math.sin(angle)*2.7+.5,Math.sin(angle*2)*1.2);
      stagePositions[3].set((body-1)*3.25-.94+k%6*.37,-1.1+Math.floor(k/6)*2.15+(body===1?.4:0),body===1?.91:-.04);
      stagePositions[4].set((body-1)*3.7,-2.75+row*.13,.85);
      stagePositions[5].set((i%3-1)*1.75,(Math.floor(i/3)%4-1.5)*1.15,Math.floor(i/12)*1.4-1.4);
      offset.set(0,0,0);for(let s=0;s<6;s++)offset.addScaledVector(stagePositions[s],weights[s]);
      const size=.075+weights[0]*.22+weights[5]*.3;
      scale.set(size+weights[3]*.13,size+weights[3]*(.25+(k%6)*.21),size+weights[3]*.04);
      matrix.compose(offset,quaternion,scale);blocks.setMatrixAt(i,matrix);
    }
    blocks.instanceMatrix.needsUpdate=true;
  }
  update(0,[1,0,0,0,0,0]);
  return {root,update};
}
