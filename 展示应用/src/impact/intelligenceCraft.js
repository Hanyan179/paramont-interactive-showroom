import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ramp,lerp} from './intelligenceTimeline.js';
import {canvasTexture,label} from './intelligenceSurfaces.js';

function material(color,metalness=.1,roughness=.35){return new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.35,transparent:true,depthWrite:true});}
function box(parent,name,w,h,d,r,mat,x=0,y=0,z=0){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),mat);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function cylinder(parent,r,h,mat,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);m.position.set(x,y,z);parent.add(m);return m;}
function opacity(root,value){root.visible=value>.001;root.traverse(mesh=>{if(mesh.material){mesh.material.opacity=value;mesh.material.depthWrite=value>.98;}});}
// Four different product silhouettes, built as objects within their editorial pages.
export function createDirectionModel(index){
 const root=new THREE.Group();root.name=`proposal-model-${index}`;
 const porcelain=material('#d1c4b8',.22,.3),metal=material('#b3a38b',.75,.22);
 const print=(parent,pair,w,h,x,y,z)=>{const map=canvasTexture((c,cw,ch)=>{c.textAlign='center';label(c,pair[c.journeyLang==='zh'?0:1],cw/2,ch*.54,65,'#303235',500);c.fillStyle='#303235';c.fillRect(cw*.32,ch*.71,cw*.36,3);},400,240);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));m.position.set(x,y,z);m.renderOrder=5;parent.add(m);return m;};
 if(index===0){
  const vial=box(root,'lip-oil-vial',.37,1.08,.32,.07,material('#927a79',.35,.18),-.20,-.14,0);box(root,'lip-oil-glass-base',.36,.105,.31,.026,porcelain,-.20,-.65,.003);
  // Present the complete applicator beside the vial; an upright wand partly
  // inside an opaque bottle concealed the feature described by this proposal.
  const applicator=new THREE.Group();applicator.name='lip-oil-applicator';applicator.position.set(.12,.03,.035);applicator.rotation.z=-.12;root.add(applicator);
  box(applicator,'lip-oil-cap',.39,.42,.34,.035,porcelain,0,.76,0);box(applicator,'lip-oil-collar',.38,.045,.33,.010,metal,0,.54,0);
  const stem=cylinder(applicator,.019,.49,material('#343438',.12,.4),0,.30,0);stem.name='lip-oil-stem';
  const brush=cylinder(applicator,.042,.16,material('#b18e87'),0,-.02,0);brush.name='lip-oil-angled-tip';brush.rotation.z=-.20;
  print(vial,['随行','CARRY'],.30,.27,0,-.02,.168);root.rotation.z=-.13;
 }else if(index===1){
  const tube=box(root,'blush-tube',.55,.97,.20,.08,material('#bb8e87'),0,.03,0);tube.rotation.z=-.12;
  box(tube,'blush-seam',.54,.055,.20,.01,porcelain,0,.49,0);for(let i=0;i<7;i++)box(tube,`tube-crimp-${i}`,.007,.034,.008,.003,metal,-.21+i*.07,.49,.103);
  box(root,'blush-cap',.31,.29,.25,.025,porcelain,-.065,-.59,0);box(root,'blush-neck',.24,.08,.19,.015,metal,-.065,-.415,0);
  print(tube,['礼赠','GIFT'],.43,.38,0,.03,.108);root.rotation.z=-.18;
 }else if(index===2){
  box(root,'skin-tint-bottle',.60,.87,.37,.12,material('#c0a78a'),0,-.22,0);box(root,'skin-tint-base',.49,.045,.30,.016,material('#927a79',.35,.18),0,-.63,0);
  cylinder(root,.175,.18,metal,0,.30,0);cylinder(root,.16,.24,porcelain,0,.48,0);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.15,24,16),porcelain);bulb.position.y=.65;bulb.scale.set(.88,1.25,.88);root.add(bulb);
  box(root,'skin-tint-label',.40,.34,.014,.015,material('#e0d6c8'),0,-.14,.197);print(root,['多规格','RANGE'],.37,.30,0,-.14,.211);
 }else{
  const body=cylinder(root,.22,.86,porcelain,0,-.20,0);body.name='highlight-stick-case';
  cylinder(root,.224,.046,metal,0,.25,0);cylinder(root,.194,.18,material('#343438',.12,.4),0,.36,0);cylinder(root,.185,.33,material('#d9c4a2',.18,.28),0,.58,0);
  const top=new THREE.Mesh(new THREE.SphereGeometry(.185,24,16),material('#d9c4a2',.18,.28));top.position.y=.735;top.scale.y=.22;root.add(top);
  const cap=cylinder(root,.234,.56,porcelain,.46,-.28,-.01);cap.rotation.z=.22;cylinder(root,.222,.035,metal,.52,-.55,-.01);
  print(root,['精简','CORE'],.28,.32,0,-.18,.222);root.rotation.z=-.22;
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
export function createPaletteCraft(productTexture){
 const root=new THREE.Group();root.name='continuous-palette-craft';
 const rectangles=[[.215,.404,.485,.607],[.505,.404,.775,.607],[.215,.177,.485,.392],[.505,.177,.775,.392]];
 function surface(name,region){
  const mat=new THREE.MeshBasicMaterial({map:productTexture,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
  mat.onBeforeCompile=shader=>{
   const mask=rectangles.map(r=>`(vMapUv.x>${r[0]}&&vMapUv.y>${r[1]}&&vMapUv.x<${r[2]}&&vMapUv.y<${r[3]})`);
   const condition=region<4?mask[region]:region===4?'vMapUv.y>=.625':`vMapUv.y<.625&&!(${mask.join('||')})`;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\nif(!(${condition}))discard;`);
  };
  mat.customProgramCacheKey=()=>`palette-part-${region}`;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);mesh.name=name;mesh.renderOrder=9;root.add(mesh);return mesh;
 }
 function pivotSurface(mesh,x,y){mesh.geometry.translate(-x,-y,0);mesh.userData.pivot=new THREE.Vector3(x,y,0);mesh.position.set(x,y,0);}
 const panWalls=[];
 const pans=rectangles.map((rect,i)=>{
  const mesh=surface(`palette-pan-${i}`,i);mesh.userData.seated=1;
  pivotSurface(mesh,(rect[0]+rect[2])/2-.5,(rect[1]+rect[3])/2-.5);
  const wall=box(mesh,`palette-pan-wall-${i}`,(rect[2]-rect[0])*.97,(rect[3]-rect[1])*.94,.020,.005,material('#877b70',.68,.30),0,0,-.013);wall.renderOrder=8;panWalls.push(wall);
  return mesh;
 });
 const lid=surface('palette-mirror',4),shell=surface('palette-case',5);
 pivotSurface(lid,0,.125);
 const labels=[['提取产品要求与成本约束','Extract needs and cost constraints'],['把互补用途组织成产品','Combine complementary uses'],['将结构与包装落实到样品','Resolve form and packaging'],['形成样品，进入报价与交付评审','Sample ready for quote and delivery review']].map((pair,i)=>stageLabel(pair,`craft-step-${i}`));
 const captionRoot=new THREE.Group();captionRoot.name='palette-craft-captions';captionRoot.add(...labels);
 const chips=['用途 · 互补','成本 · 核算','结构 · 收纳','交付 · 验证'].map((text,i)=>stageLabel([text,['Use / combine','Cost / estimate','Form / storage','Delivery / test'][i]],`craft-role-${i}`,true));captionRoot.add(...chips);
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
   // Its growing mirror and separated pans must not carry the page heading.
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
