import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {V,block,flow} from './depthGeometry.js';
import {craftMaterials,mesh,floor} from './supplyCraft.js';
import {createNetworkApron} from './supplyArchitecture.js';

export function regionalStage(quality,id){
  const root=new THREE.Group(),m=craftMaterials(quality,id),motions=[];root.userData.region=id;
  m.navy.color.set('#071b30');m.navy.envMapIntensity=.35;m.navy.clearcoat=.15;
  m.blue.color.set('#1c648c');m.blue.emissive.set('#072d48');m.blue.emissiveIntensity=.4;
  m.silver.color.set('#a3c3cf');m.silver.roughness=.32;
  floor(root,m,[110,.4,115],[10,-1,-12]);const ground=root.children.at(-1);ground.material.color.set('#020e1a');ground.material.roughnessMap=null;ground.material.metalness=.08;ground.material.roughness=.82;
  const apron=createNetworkApron(root);motions.push(t=>apron.update(t));
  return {root,m,motions,update(time){motions.forEach(fn=>fn(time));}};
}
export function slab(parent,mat,size,p,r=.5){return mesh(parent,new RoundedBoxGeometry(...size,3,Math.min(r,Math.min(...size)/2)),mat,p);}
export function repeatBoxes(parent,mat,poses){
  const object=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,poses.length),matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
  poses.forEach((p,i)=>{q.setFromAxisAngle(V(0,1,0),p.angle||0);matrix.compose(V(...p.p),q,V(...p.s));object.setMatrixAt(i,matrix);});object.castShadow=object.receiveShadow=true;parent.add(object);return object;
}
export function productArray(parent,m,poses){
  const objects=[];
  for(const variant of new Set(poses.map(p=>p.variant||0))){
    const items=poses.filter(p=>(p.variant||0)===variant);let body,cap,bodyMaterial=m.blue,capMaterial=m.gold,capY=1.65;
    if(variant===1){body=new THREE.CylinderGeometry(.62,.66,.75,24).translate(0,.4,0);cap=new THREE.CylinderGeometry(.65,.65,.18,24);bodyMaterial=m.rose;capY=.9;}
    else if(variant===2){body=new RoundedBoxGeometry(.72,1.6,.52,2,.1).translate(0,.98,0);cap=new THREE.CylinderGeometry(.3,.3,.25,16);bodyMaterial=m.stone;capMaterial=m.navy;capY=.13;}
    else if(variant===3){
      const rings=Array.from({length:4},(_,i)=>new THREE.TorusGeometry(.58-i*.11,.16,12,24).rotateX(Math.PI/2).translate(0,.2+i*.32,0));body=mergeGeometries(rings);rings.forEach(g=>g.dispose());cap=new THREE.SphereGeometry(.23,16,12);bodyMaterial=m.stone;capMaterial=m.rose;capY=1.45;
    }else{const profile=[[0,0],[.32,0],[.43,.12],[.43,1.05],[.3,1.25],[.2,1.3],[.2,1.5],[0,1.5]].map(p=>new THREE.Vector2(...p));body=new THREE.LatheGeometry(profile,24);cap=new THREE.CylinderGeometry(.24,.24,.35,16);}
    const bodies=new THREE.InstancedMesh(body,bodyMaterial,items.length),caps=new THREE.InstancedMesh(cap,capMaterial,items.length),matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
    items.forEach((p,i)=>{const scale=p.scale||1;matrix.compose(V(...p.p),q,V(scale,scale,scale));bodies.setMatrixAt(i,matrix);matrix.compose(V(p.p[0],p.p[1]+capY*scale,p.p[2]),q,V(scale,scale,scale));caps.setMatrixAt(i,matrix);});parent.add(bodies,caps);objects.push(bodies,caps);
  }
  return objects;
}
export function ribbonDeck(parent,m,points,width=3){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),vertices=[],indices=[];
  for(let i=0;i<=100;i++){const p=curve.getPoint(i/100),t=curve.getTangent(i/100),n=V(-t.z,0,t.x).normalize();for(const side of [-1,1]){const v=p.clone().addScaledVector(n,side*width/2);vertices.push(...v.toArray());}if(i<100){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mat=m.silver.clone();mat.side=THREE.DoubleSide;mesh(parent,geometry,mat);
  const lines=[];for(const side of [-1,1])lines.push(flow(parent,Array.from({length:61},(_,i)=>{const p=curve.getPoint(i/60),t=curve.getTangent(i/60);return p.addScaledVector(V(-t.z,0,t.x).normalize(),side*width/2).add(V(0,.05,0));}),{color:side===1?'#98deef':'#ebcc97',radius:.05,speed:.08}));
  return t=>lines.forEach(l=>l.update(t));
}
export function desk(parent,m,x,z,angle=0){
  const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=angle;parent.add(root);
  slab(root,m.stone,[5.8,.25,3],[0,2.3,0]);for(const side of [-1,1])block(root,m.navy,[.18,2.3,2.4],[side*2.1,1.1,0]);
  block(root,m.blue,[3.3,1.6,.08],[0,3.2,-.65]);block(root,m.gold,[3.1,.035,.04],[0,2.4,.7]);
  for(let i=0;i<4;i++)block(root,[m.rose,m.silver,m.gold,m.blue][i],[.5,.09,.7],[-1.3+i*.8,2.51,.65]);
  return root;
}
