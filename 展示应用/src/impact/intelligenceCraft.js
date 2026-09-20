import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ramp,lerp} from './intelligenceTimeline.js';
import {createProductGeometry} from './intelligenceProduct.js';
import {canvasTexture,label} from './intelligenceSurfaces.js';

function material(color,metalness=.1,roughness=.35){return new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.35,transparent:true,depthWrite:true});}
function box(parent,name,w,h,d,r,mat,x=0,y=0,z=0){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),mat);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function cylinder(parent,r,h,mat,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);m.position.set(x,y,z);parent.add(m);return m;}
function opacity(root,value){root.visible=value>.001;root.traverse(mesh=>{if(mesh.material){mesh.material.opacity=value;mesh.material.depthWrite=value>.98;}});}
// Four concept forms share the existing editorial positions and opacity clock.
export function createDirectionModel(index){
 const root=new THREE.Group();root.name=`proposal-model-${index}`;
 const shell=material('#547586',.12,.45),paper=material('#dbd5c6',.01,.7),wood=material('#ba9470',.02,.64),metal=material('#9da8ac',.5,.4);
 const colours=['#577e99','#879c7f','#bd8066','#c2a363'];
 function pencil(parent,x,y,z,height,colour){
  const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
  const pigment=material(colour,.03,.48);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.053,.053,height,6),pigment);group.add(body);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.053,.16,6),wood);tip.position.y=height/2+.08;group.add(tip);
  const point=new THREE.Mesh(new THREE.ConeGeometry(.020,.061,6),pigment);point.position.y=height/2+.147;group.add(point);
  cylinder(group,.054,.05,pigment,0,-height/2-.025,0);return group;
 }
 if(index===0){
  const sleeve=box(root,'pencil-travel-sleeve',.52,.58,.18,.035,shell,0,-.30,0);
  for(let i=0;i<4;i++){const tool=pencil(root,-.18+i*.12,.08,.035,.89,colours[i]);tool.rotation.z=(i-1.5)*-.028;tool.name=`travel-pencil-${i}`;}
  // Front lip makes the tools visibly sit inside their sleeve.
  box(sleeve,'sleeve-front',.53,.44,.055,.024,shell,0,-.05,.12);root.rotation.z=-.10;
 }else if(index===1){
  box(root,'drawing-gift-box',.79,.71,.29,.047,shell,0,-.08,0);
  box(root,'gift-box-lid',.84,.17,.33,.025,material('#aabbb5',.08,.55),0,.36,0);
  box(root,'gift-paper-band',.16,.73,.015,.008,paper,0,-.07,.154);
  box(root,'gift-band-top',.17,.025,.33,.005,paper,0,.459,0);root.rotation.set(.03,-.18,-.13);
 }else if(index===2){
  for(let i=0;i<3;i++){
   const w=.43+i*.14,y=.42-i*.39;
   box(root,`drawing-size-case-${i}`,w,.31,.22,.034,material(['#9ab3bc','#7291a1','#4e6e84'][i],.08,.5),0,y,0);
   box(root,`size-case-seam-${i}`,w*.89,.014,.012,.003,paper,0,y+.062,.117);
   box(root,`size-case-clasp-${i}`,.07,.054,.023,.005,metal,0,y-.024,.121);
  }
  root.rotation.y=-.15;
 }else{
  box(root,'desk-organiser-base',1.06,.10,.45,.035,shell,0,-.47,0);
  // Open compartments with real walls, not a solid block covering the contents.
  for(const x of [-.49,.03,.49])box(root,'organiser-divider',.055,.45,.43,.014,shell,x,-.23,0);
  for(const z of [-.19,.20])box(root,'organiser-wall',1.03,.45,.045,.014,shell,0,-.23,z);
  for(let i=0;i<3;i++)pencil(root,-.37+i*.12,.19,-.04,.70,colours[i]);
  box(root,'organiser-eraser',.23,.17,.15,.026,paper,.25,-.23,.025);
  box(root,'organiser-sharpener',.18,.14,.15,.017,metal,.26,-.23,-.13);
  root.rotation.set(.06,-.12,-.05);
 }
 // The page must render before its product, even while both fade. Otherwise a
 // nearly opaque page paints over non-depth-writing parts and they pop at 98%.
 root.traverse(mesh=>{if(mesh.isMesh&&!mesh.renderOrder)mesh.renderOrder=4;});
 return {root,update:value=>opacity(root,value)};
}
function stageLabel(pair,name,small=false){const map=canvasTexture((c,w,h)=>{c.textAlign='center';label(c,pair[c.journeyLang==='zh'?0:1],w/2,90,small?56:62,'#b9d3e4');},small?800:1280,140);const m=new THREE.Mesh(new THREE.PlaneGeometry(small?2.1:5.2,small?.37:.57),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));m.name=name;return m;}
// One photograph is projected into six independently moving surfaces. At assembly every
// surface uses the same UVs and transform as the product, so the handoff is pixel-aligned.
// Regions are disjoint and cover the original product; no resampling or image alteration.
export function createDrawingKitCraft(productTexture){
 const root=new THREE.Group();root.name='continuous-drawing-kit-craft';
 const rectangles=[[.215,.404,.485,.607],[.505,.404,.775,.607],[.215,.177,.485,.392],[.505,.177,.775,.392]];
 function surface(name,region){
  const mat=new THREE.MeshBasicMaterial({map:productTexture,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
  mat.onBeforeCompile=shader=>{
   const mask=rectangles.map(r=>`(vMapUv.x>${r[0]}&&vMapUv.y>${r[1]}&&vMapUv.x<${r[2]}&&vMapUv.y<${r[3]})`);
   const condition=region<4?mask[region]:region===4?'vMapUv.y>=.625':`vMapUv.y<.625&&!(${mask.join('||')})`;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nif(!(${condition}))discard;`);
  };
  mat.customProgramCacheKey=()=>`drawing-kit-part-${region}`;
  const mesh=new THREE.Mesh(createProductGeometry(),mat);mesh.name=name;mesh.renderOrder=9;root.add(mesh);return mesh;
 }
 function pivotSurface(mesh,x,y){mesh.geometry.translate(-x,-y,0);mesh.userData.pivot=new THREE.Vector3(x,y,0);mesh.position.set(x,y,0);}
 const panWalls=[];
 const pans=rectangles.map((rect,i)=>{
  const mesh=surface(`kit-tray-${i}`,i);mesh.userData.seated=1;
  pivotSurface(mesh,(rect[0]+rect[2])/2-.5,(rect[1]+rect[3])/2-.5);
  const wall=box(mesh,`kit-tray-wall-${i}`,(rect[2]-rect[0])*.97,(rect[3]-rect[1])*.94,.020,.005,material('#345466',.12,.48),0,0,-.013);wall.renderOrder=8;panWalls.push(wall);
  return mesh;
 });
 const lid=surface('kit-paper-lid',4),shell=surface('kit-case',5);
 pivotSurface(lid,0,.125);
 const labels=[['从提案中提取绘画与收纳要素','Extract drawing and storage elements'],['组合笔组、颜料、小件与纸卡','Combine pencils, paints, tools and paper'],['让工具各有其位，让结构便于携带','Give each tool a place in a portable case'],['形成概念样品，继续核对报价与交付','Concept sample ready for cost and delivery review']].map((pair,i)=>stageLabel(pair,`craft-step-${i}`));
 const captionRoot=new THREE.Group();captionRoot.name='kit-craft-captions';captionRoot.add(...labels);
 const chips=['笔组 · 勾画','颜料 · 上色','小件 · 归位','纸卡 · 收纳'].map((text,i)=>stageLabel([text,['Pencils / sketch','Paints / colour','Tools / organise','Paper / store'][i]],`craft-role-${i}`,true));captionRoot.add(...chips);
 const temp=new THREE.Vector3(),front=new THREE.Quaternion();
 return {root,captionRoot,pans,lid,
  focusAt(t,target){
   const index=Math.min(3,Math.max(0,Math.floor((t-58.7)/1.2))),previous=Math.max(0,index-1),blend=ramp(t,58.7+index*1.2,59.3+index*1.2);
   target.lerpVectors(pans[previous].position,pans[index].position,blend);target.z+=.012;target.multiplyScalar(root.scale.x).applyQuaternion(root.quaternion).add(root.position);
   target.y=lerp(target.y,root.position.y+root.scale.x*.23,ramp(t,64,67));root.userData.processingIndex=index;return target;
  },
  update(t,selected,product){
   const take=ramp(t,51,57),toHero=ramp(t,68,73);
   temp.set(-.55,-.04,.22).multiplyScalar(selected.scale.x).applyQuaternion(selected.quaternion).add(selected.position);
   root.position.set(lerp(temp.x,-.85,take),lerp(temp.y,.18,take),lerp(temp.z,1.2,take));
   root.scale.setScalar(lerp(selected.scale.x*1.10,4.15,take));root.quaternion.slerpQuaternions(selected.quaternion,front,take);
   root.position.lerp(product.position,toHero);root.scale.setScalar(lerp(root.scale.x,product.scale.x,toHero));
   // The object keeps its opacity as the printed proposal retires behind it.
   // Its growing lid and separated trays must not carry the page heading.
   const visible=ramp(t,37,40)*lerp(selected.material.opacity,1,ramp(t,50.5,51.2))*(1-ramp(t,75.5,76));root.visible=visible>.001;
   const extract=ramp(t,51,56),assemble=ramp(t,59,65);
   pans.forEach((pan,i)=>{
    const spread=extract*(1-ramp(t,59.6+i*1.05,62.45+i*1.05)),arc=Math.sin(spread*Math.PI),pivot=pan.userData.pivot;
    pan.position.set(pivot.x+(i%2?1:-1)*.235*spread,pivot.y+(i<2?.25:-.065)*spread,.025*spread+.055*arc);
    pan.rotation.set(-.11*spread,(.12*spread+.20*arc)*(i%2?1:-1),arc*.07*(i%2?1:-1));
    opacity(pan,visible);pan.userData.seated=1-spread;
    opacity(panWalls[i],visible*ramp(t,51,54)*(1-ramp(t,65,68)));
   });
   const housing=1-extract*(1-assemble);opacity(shell,visible*housing);opacity(lid,visible*housing);
   shell.position.z=-.08*extract*(1-assemble);lid.position.y=lid.userData.pivot.y+.20*extract*(1-ramp(t,62,68));lid.rotation.x=-.25*extract*(1-ramp(t,62,68));
   labels.forEach((mesh,i)=>{const at=[52,56.5,61.5,66.5][i],end=[56.5,61.5,66.5,73][i],enter=ramp(t,at,at+.7),leave=ramp(t,end-.7,end),a=enter*(1-leave);mesh.position.set(-.65,-2.72+.32*leave-.32*(1-enter),.7);mesh.visible=a>.001;mesh.material.opacity=a;});
   chips.forEach((mesh,i)=>{const a=ramp(t,54+i*.15,55+i*.15)*(1-ramp(t,60.4+i*.85,62+i*.85)),rect=rectangles[i],pan=pans[i];temp.set(0,-(rect[3]-rect[1])/2,0).applyQuaternion(pan.quaternion).add(pan.position).multiplyScalar(root.scale.x).applyQuaternion(root.quaternion).add(root.position);mesh.position.copy(temp);mesh.position.y-=.30;mesh.position.z+=.05;mesh.renderOrder=15;mesh.visible=a>.001;mesh.material.opacity=a;});
   root.userData.phase=t<51?'proposal':t<58?'extract':t<65?'compose':t<73?'finish':'photograph';
  }
 };
}
