import * as THREE from 'three';
import {V,block,flow} from './depthGeometry.js';
import {createFinishTexture} from '../../../共享组件/surfaceFinish.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

// Authored concept architecture and samples, never a reconstruction of a company site.
export function craftMaterials(quality,id='china'){
  const detail=modelDetail(id,quality),finish=detail.surfaceDetail?createFinishTexture(THREE,detail,true):null;
  const standard=(color,metalness,roughness)=>new THREE.MeshPhysicalMaterial({color,metalness,roughness,roughnessMap:finish,clearcoat:.35,clearcoatRoughness:.24});
  return {
    navy:standard('#102b49',.62,.32),silver:standard('#b5cbd7',.86,.25),gold:standard('#b69b68',.8,.3),
    stone:standard('#b9c9d0',.12,.46),rose:standard('#bfa0a2',.25,.33),blue:standard('#3a7296',.45,.25),
    glass:new THREE.MeshPhysicalMaterial({color:'#74b6cb',metalness:0,roughness:.13,transmission:.38,thickness:1.2,ior:1.46,transparent:true,opacity:.72,side:THREE.DoubleSide}),
    smoke:new THREE.MeshPhysicalMaterial({color:'#406d83',roughness:.2,metalness:.25,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}),
    light:new THREE.MeshBasicMaterial({color:new THREE.Color('#ffe6bc').multiplyScalar(2.1)}),
    ice:new THREE.MeshBasicMaterial({color:new THREE.Color('#b9edff').multiplyScalar(1.4)}),
  };
}
export function mesh(parent,geometry,material,position=[0,0,0]){const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function cylinder(parent,mat,r,h,p,top=r){return mesh(parent,new THREE.CylinderGeometry(top,r,h,64),mat,p);}
export function tube(parent,points,r,mat){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,r,10,false),mat);}
function lathe(parent,profile,mat,p){return mesh(parent,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),96),mat,p);}
function ribs(parent,mat,count,fn){const geo=new THREE.CylinderGeometry(.027,.027,1,7),inst=new THREE.InstancedMesh(geo,mat,count),m=new THREE.Matrix4(),q=new THREE.Quaternion();for(let i=0;i<count;i++){const {p,h}=fn(i);m.compose(p,q,V(1,h,1));inst.setMatrixAt(i,m);}parent.add(inst);return inst;}
export function bottle(parent,m,p,scale=1,body=m.glass){
  const root=new THREE.Group();root.position.set(...p);root.scale.setScalar(scale);parent.add(root);
  lathe(root,[[0,0],[.72,0],[.88,.12],[.94,.3],[.94,3],[.88,3.3],[.62,3.55],[.48,3.58],[.48,3.9],[0,3.9]],body,[0,0,0]);
  cylinder(root,m.gold,.5,.1,[0,3.88,0]);cylinder(root,m.silver,.51,.08,[0,3.97,0]);
  cylinder(root,m.gold,.56,.8,[0,4.43,0]);
  ribs(root,m.gold,48,i=>({p:V(Math.cos(i/48*Math.PI*2)*.57,4.43,Math.sin(i/48*Math.PI*2)*.57),h:.72}));
  cylinder(root,m.silver,.81,.04,[0,.16,0]);
  mesh(root,new THREE.CylinderGeometry(.946,.946,.92,64,1,true,-.64,1.28),m.stone,[0,1.76,0]);
  return root;
}
export function stackingToy(parent,m,p,scale=1){
  const root=new THREE.Group();root.position.set(...p);root.scale.setScalar(scale);parent.add(root);
  const colors=[m.navy,m.blue,m.stone,m.rose,m.gold];cylinder(root,m.stone,1.15,.22,[0,.11,0]);
  for(let i=0;i<5;i++){const ring=mesh(root,new THREE.TorusGeometry(1-i*.135,.27,24,80),colors[i],[0,.45+i*.48,0]);ring.rotation.x=Math.PI/2;}
  mesh(root,new THREE.SphereGeometry(.39,40,32),m.rose,[0,2.98,0]);return root;
}
export function floor(parent,m,size=[27,.38,22],p=[5,-.55,-3]){
  const material=new THREE.MeshStandardMaterial({color:'#061d2c',metalness:.32,roughness:.53,roughnessMap:m.navy.roughnessMap,transparent:true,depthWrite:false});
  material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 vCraftFloor;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvCraftFloor=uv;');
    shader.fragmentShader='varying vec2 vCraftFloor;\n'+shader.fragmentShader.replace('#include <alphamap_fragment>','#include <alphamap_fragment>\ndiffuseColor.a*=1.-smoothstep(.16,.51,length(vCraftFloor-.5));');
  };material.customProgramCacheKey=()=> 'supply-soft-ground-v1';
  const ground=mesh(parent,new THREE.PlaneGeometry(size[0]*2,size[2]*1.7),material,[p[0],p[1],p[2]]);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
}
// A continuous sculpted ribbon with a changing section that catches light.
function ribbon(parent,m,x,z,width=1.3,height=12,lean=0){
  const vertices=[],indices=[],n=90;
  for(let i=0;i<=n;i++){
    const t=i/n,a=t*Math.PI*.94,cx=x+Math.sin(a)*8+lean*t,cy=.2+Math.sin(t*Math.PI*.68)*height,cz=z-t*7;
    for(const side of [-1,1])vertices.push(cx+side*width/2,cy,cz+side*Math.sin(t*Math.PI)*.7);
    if(i<n){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
  const surface=mesh(parent,g,m);surface.material.side=THREE.DoubleSide;
  tube(parent,Array.from({length:n+1},(_,i)=>V(vertices[i*6],vertices[i*6+1],vertices[i*6+2])),.018,m);
}
export function createAtelier(m){
  const root=new THREE.Group();floor(root,m,[25,.35,20],[5,-.65,-2]);
  // The canopy leaves the reading side open.
  for(let i=0;i<9;i++)ribbon(root,i%3===0?m.gold:m.silver,-1+i*.8,-5-i*.7,.66,10.5+i*.3,-i*.15);
  const monolith=block(root,m.stone,[10.5,1.3,4.4],[6,.18,1]);monolith.castShadow=true;
  block(root,m.gold,[10.15,.045,.035],[6,.86,3.22]);
  const hero=bottle(root,m,[7,.84,.8],1.45),toy=stackingToy(root,m,[2,.85,1],1.22);bottle(root,m,[11.8,.84,-.6],.73,m.rose);
  block(root,m.navy,[6.4,.28,2.8],[4.4,.05,6]);
  for(let i=0;i<6;i++){const swatch=block(root,[m.glass,m.silver,m.rose,m.blue,m.gold,m.stone][i],[.6,1.2,1.7],[1.9+i*.96,.75,6]);swatch.rotation.z=-.13;}
  const filaments=[];for(let i=0;i<2;i++)filaments.push(flow(root,[[0,.2,8],[10,1,-2],[14,8,-7],[7,12,-10]],{color:i?'#a4d5e1':'#e0c28d',radius:i?.009:.015,offset:i*.45,speed:.025}));
  return {root,update(t){hero.rotation.y=Math.sin(t*.13)*.13;toy.rotation.y=t*.06;filaments.forEach(f=>f.update(t));}};
}
export function robot(parent,m,p,mirrored=false){
  const root=new THREE.Group();root.position.set(...p);root.rotation.y=mirrored?Math.PI:0;parent.add(root);
  cylinder(root,m.navy,1.12,.6,[0,.3,0]);cylinder(root,m.gold,.82,.16,[0,.67,0]);
  const yaw=new THREE.Group();yaw.position.y=.85;root.add(yaw);cylinder(yaw,m.silver,.58,1.5,[0,.75,0]);
  const upper=new THREE.Group();upper.position.y=1.6;yaw.add(upper);
  const joint=cylinder(upper,m.navy,.65,.72,[0,0,0]);joint.rotation.x=Math.PI/2;
  block(upper,m.stone,[.6,2.8,.74],[0,1.4,0]);block(upper,m.gold,[.07,2.3,.77],[-.18,1.4,0]);
  const elbow=new THREE.Group();elbow.position.y=2.8;upper.add(elbow);
  const bearing=cylinder(elbow,m.silver,.48,.82,[0,0,0]);bearing.rotation.x=Math.PI/2;
  block(elbow,m.stone,[.48,2.3,.62],[0,1.15,0]);cylinder(elbow,m.navy,.25,.6,[0,2.55,0]);
  for(const x of [-.23,.23])block(elbow,m.silver,[.08,.6,.13],[x,3.1,0]);
  return t=>{yaw.rotation.y=Math.sin(t*.23)*.17;upper.rotation.z=-.55+Math.sin(t*.34)*.18;elbow.rotation.z=-1.2+Math.cos(t*.34)*.15;};
}
export function createPrecisionHall(m){
  const root=new THREE.Group(),motions=[];floor(root,m,[29,.5,46],[6,-.75,-12]);
  // Receding ribs, light strips and safety walls form a full-depth production hall.
  for(let i=0;i<9;i++){
    const z=6-i*4.8;const points=[V(-1,0,z),V(-1,7.6,z),V(1,10,z),V(14,10,z),V(16,7.6,z),V(16,0,z)];
    tube(root,points,.24,m.navy);tube(root,points.map(p=>p.clone().add(V(0,.05,.2))),.065,m.silver);tube(root,[V(1,9.7,z),V(7.5,9.9,z),V(14,9.7,z)],.032,m.light);
    for(const x of [-1.8,16.8])block(root,m.smoke,[.045,6,3.8],[x,3,z-2]);
  }
  for(const x of [4.1,10.5]){
    block(root,m.silver,[3.5,.5,33],[x,1.2,-10]);block(root,m.navy,[3.1,.06,32.7],[x,1.51,-10]);
    for(const side of [-1,1]){block(root,m.gold,[.04,.16,32.7],[x+side*1.5,1.65,-10]);block(root,m.navy,[.22,.78,32.7],[x+side*1.62,1.12,-10]);block(root,m.ice,[.025,.025,31],[x+side*1.74,1.1,-10]);}
    for(let i=0;i<8;i++)block(root,m.navy,[.26,1.35,1.2],[x,.45,4-i*4.2]);
    const bodies=new THREE.InstancedMesh(new THREE.CylinderGeometry(.36,.44,1.35,32),m.blue,19),caps=new THREE.InstancedMesh(new THREE.CylinderGeometry(.31,.31,.38,24),m.gold,19);root.add(bodies,caps);
    const matrix=new THREE.Matrix4();motions.push(t=>{for(let i=0;i<19;i++){const z=5-((t*.48+i*1.73)%32.5);matrix.makeTranslation(x,2.24,z);bodies.setMatrixAt(i,matrix);matrix.makeTranslation(x,3.1,z);caps.setMatrixAt(i,matrix);}bodies.instanceMatrix.needsUpdate=true;caps.instanceMatrix.needsUpdate=true;});
  }
  motions.push(robot(root,m,[.4,0,2]),robot(root,m,[14.4,0,-8],true));
  const portal=[V(2.2,1.6,-5),V(2.2,4.8,-5),V(4.1,5.4,-5),V(6,4.8,-5),V(6,1.6,-5)];tube(root,portal,.16,m.navy);tube(root,portal.map(p=>p.clone().add(V(0,.025,.1))),.023,m.ice);
  const scanner=block(root,m.smoke,[3.5,.03,1.1],[4.1,3.8,-5]);motions.push(t=>scanner.position.y=3.5+Math.sin(t*.9)*.8);
  for(let i=0;i<4;i++){const panel=block(root,m.navy,[3,3.6,2.1],[13.9,1.4,-17-i*4]);block(root,m.smoke,[2.7,2.9,.07],[13.9,1.75,-15.92-i*4]);block(root,m.light,[.045,2.65,.04],[15,1.75,-15.84-i*4]);panel.castShadow=true;}
  return {root,update:t=>motions.forEach(fn=>fn(t))};
}
export function createExchange(m){
  const root=new THREE.Group(),routes=[];
  m.silver.roughness=.4;m.silver.clearcoat=.1;m.silver.envMapIntensity=.5;
  m.glass.color.set('#aacbd7');m.glass.transmission=.78;m.glass.roughness=.19;m.glass.thickness=.35;m.glass.opacity=.65;
  floor(root,m,[32,.42,26],[6,-.7,-5]);
  // Translucent sails and open sightlines give market collaboration a different scale.
  for(let i=0;i<6;i++)ribbon(root,i===0||i===5?m.silver:m.glass,-5+i*2.7,-6-i*.65,1.9,12.5+i*.55,i*.55);
  const path=new THREE.CatmullRomCurve3([V(-1,0,4),V(5,0,5),V(11,0,2.5),V(15,0,-2)]);
  const counter=mesh(root,new THREE.TubeGeometry(path,96,.66,16,false),m.stone,[0,.4,0]);counter.scale.y=.7;
  tube(root,path.getPoints(96).map(p=>p.add(V(0,.8,0))),.027,m.gold);
  bottle(root,m,[3,.95,4.65],.66,m.blue);stackingToy(root,m,[7,.95,4.25],.9);bottle(root,m,[10.5,.95,2.7],.9);
  for(let i=0;i<7;i++){
    const end=V(-12+i*6,3+Math.sin(i)*2,-27-Math.abs(i-3)*2);
    routes.push(flow(root,[[7,2,0],[8+(i-3)*1.5,8,-7],[end.x,8,-18],end],{radius:.018,color:i%2?'#e0c18c':'#7ebbd4',offset:i/7,speed:.04}));
    cylinder(root,m.silver,.16,2,[end.x,end.y-1,end.z]);mesh(root,new THREE.SphereGeometry(.19,24,16),m.light,end.toArray());
  }
  return {root,update:t=>routes.forEach(r=>r.update(t))};
}
