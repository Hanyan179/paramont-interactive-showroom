import {getRenderQuality,modelDetail} from '../../共享组件/renderQuality.js';
import {createFinishTexture} from '../../共享组件/surfaceFinish.js';
import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Original procedural concept models. No third-party product designs or brand associations.
const palettes={navy:'#143c60',rose:'#d78c99',mint:'#98cbb5',cream:'#eee2c9',lilac:'#aaa5d4',gold:'#d7b983'};
export function createProduct(id,quality=getRenderQuality()){
 const detail=modelDetail(id,quality);
let texture,metalTexture;const createdMaterials=new Set();
function mat(color,roughness=.32,metalness=0,extra={}){if(detail.surfaceDetail){if(metalness>.45)metalTexture??=createFinishTexture(T,detail,true);else texture??=createFinishTexture(T,detail);}const material=new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.4,clearcoatRoughness:.22,roughnessMap:(metalness>.45?metalTexture:texture)||null,...extra});createdMaterials.add(material);return material;}
function add(parent,geo,material,pos=[0,0,0],rotation=[0,0,0]){const mesh=new T.Mesh(geo,material);mesh.position.set(...pos);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function instances(parent,geometry,material,poses){const mesh=new T.InstancedMesh(geometry,material,poses.length),dummy=new T.Object3D();poses.forEach((p,i)=>{dummy.position.set(...p.position);dummy.rotation.set(0,p.angle||0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function box(parent,size,color,pos,r=.08,rotation=[0,0,0]){return add(parent,new RoundedBoxGeometry(...size,detail.segment(4,'rounded'),Math.min(r,...size.map(x=>x/3))),typeof color==='string'?mat(color):color,pos,rotation);}
function cyl(parent,r1,r2,h,m,pos,rotation=[0,0,0]){return add(parent,new T.CylinderGeometry(r1,r2,h,detail.segment(64)),m,pos,rotation);}
function sphere(parent,r,m,pos,scale=[1,1,1]){const o=add(parent,new T.SphereGeometry(r,detail.segment(48),detail.segment(32)),m,pos);o.scale.set(...scale);return o;}
function torus(parent,r,t,m,pos,rot=[Math.PI/2,0,0]){return add(parent,new T.TorusGeometry(r,t,detail.segment(14,'radial'),detail.segment(80)),m,pos,rot);}
function tube(parent,points,r,m){return add(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),detail.segment(80),r,detail.segment(8,'radial'),false),m);}
function label(parent,lines,pos,width,height,color='#eadbbf',bg='#153b58'){
 const c=document.createElement('canvas');c.width=c.height=Math.round(512*detail.screenScale);const ctx=c.getContext('2d');ctx.scale(detail.screenScale,detail.screenScale);ctx.fillStyle=bg;ctx.fillRect(0,0,512,512);ctx.fillStyle=color;ctx.textAlign='center';
 ctx.font='500 45px Arial';ctx.fillText('P A R A M O N T',256,172);ctx.fillRect(200,207,112,2);ctx.font='24px Arial';lines.forEach((s,i)=>ctx.fillText(s,256,270+i*44));ctx.font='17px Arial';ctx.fillText('D E S I G N   S T U D Y',256,440);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return add(parent,new T.PlaneGeometry(width,height),new T.MeshStandardMaterial({map:tex,roughness:.5,metalness:.05}),pos);
}

 const g=new T.Group();g.name=id;g.userData.qualityModel=id;
 const gold=mat(palettes.gold,.24,.85),navy=mat(palettes.navy,.24,.32),cream=mat(palettes.cream,.54,.04),rose=mat(palettes.rose,.35,.04),mint=mat(palettes.mint,.42,.01),lilac=mat(palettes.lilac,.36,.04);
 if(id==='lipstick'){
  cyl(g,.36,.36,1.25,navy,[0,-.66,0]);cyl(g,.368,.368,.08,gold,[0,-.08,0]);cyl(g,.34,.34,.3,gold,[0,.13,0]);cyl(g,.285,.285,.46,mat('#cba675',.2,.85),[0,.4,0]);
  if(detail.surfaceDetail)instances(g,new T.BoxGeometry(.012,.93,.008),gold,Array.from({length:40},(_,i)=>{const a=i*Math.PI*2/40;return {position:[Math.cos(a)*.359,-.67,Math.sin(a)*.359],angle:-a+Math.PI/2};}));
  const points=[new T.Vector2(0,0),new T.Vector2(.251,0),new T.Vector2(.255,.8),new T.Vector2(.24,.96),new T.Vector2(.19,1.03),new T.Vector2(0,1.06)];const geo=new T.LatheGeometry(points,detail.segment(80));const p=geo.attributes.position;for(let i=0;i<p.count;i++){if(p.getY(i)>.6)p.setY(i,p.getY(i)-p.getX(i)*.66*((p.getY(i)-.6)/.46));}geo.computeVertexNormals();add(g,geo,mat('#bf506e',.28,.02),[0,.39,0]);
  const cap=new T.Group();cyl(cap,.385,.385,1.43,navy,[0,0,0]);cyl(cap,.394,.394,.07,gold,[0,-.65,0]);cyl(cap,.34,.36,.06,gold,[0,.71,0]);cap.position.set(.9,-.63,.25);cap.rotation.set(.05,.1,-.2);g.add(cap);
  label(g,['LUSTRE','LIP COLOR'],[0,-.66,.363],.43,.75);
 }else if(id==='serum'){
  const glass=mat('#5c98b0',.17,.06,{transmission:.38,thickness:.38,ior:1.46,clearcoat:1});box(g,[1.06,1.46,.78],glass,[0,-.24,0],.18);box(g,[.88,1.2,.62],mat('#0c5375',.2,.1),[0,-.22,0],.14);
  cyl(g,.31,.37,.21,gold,[0,.56,0]);cyl(g,.33,.33,.36,gold,[0,.82,0]);if(detail.surfaceDetail)instances(g,new T.BoxGeometry(.008,.3,.008),mat('#a58458',.4,.75),Array.from({length:44},(_,i)=>{const a=i*Math.PI*2/44;return {position:[Math.cos(a)*.335,.82,Math.sin(a)*.335]};}));
  cyl(g,.205,.24,.36,navy,[0,1.18,0]);sphere(g,.203,navy,[0,1.37,0],[1,.76,1]);label(g,['BLUE RITUAL','SKINCARE'],[0,-.24,.407],.73,1.06,'#ece4d4','#123d5d');
 }else if(id==='compact'){
  cyl(g,1.03,1,.3,navy,[0,-.61,0]);cyl(g,1.035,1.035,.045,gold,[0,-.45,0]);cyl(g,.945,.945,.04,gold,[0,-.418,0]);
  const cols=['#c69678','#e4c8aa','#ae586c','#785468'];for(let i=0;i<4;i++)cyl(g,.33,.33,.05,mat(cols[i],.82,0),[(i%2?1:-1)*.39,-.376,(i<2?1:-1)*.39]);
  const lid=new T.Group();cyl(lid,1.035,1.035,.12,gold,[0,0,0]);cyl(lid,.953,.953,.018,mat('#bacbd3',.025,1),[0,.067,0]);lid.position.set(0,.4,-.77);lid.rotation.x=1.08;g.add(lid);cyl(g,.1,.1,.48,gold,[0,-.45,-.96],[0,0,Math.PI/2]);
 }else if(id==='rings'){
  cyl(g,.74,.85,.25,cream,[0,-1.16,0]);cyl(g,.075,.075,2.17,cream,[0,-.01,0]);
  const layers=[['#8aa6a9',.83],['#d99796',.71],['#e2c487',.59],['#a7bfd4',.47],['#bbc9a3',.35]];
  layers.forEach(([c,r],i)=>{const mesh=torus(g,r*.72,r*.28,mat(c,.42,.02),[0,-.88+i*.39,0]);mesh.scale.z=.9;});sphere(g,.22,cream,[0,1.05,0]);
 }else if(id==='maraca'){
  for(let i=0;i<2;i++){
   const m=new T.Group();cyl(m,.125,.18,1.15,cream,[0,-.54,0]);sphere(m,.18,cream,[0,-1.1,0],[1,.7,1]);sphere(m,.55,i?mint:rose,[0,.44,0],[1,1.3,1]);torus(m,.545,.032,gold,[0,.36,0]);
   instances(m,new T.SphereGeometry(.038,16,12),cream,Array.from({length:9},(_,j)=>{const a=j*Math.PI*2/9;return {position:[Math.sin(a)*.52,.69,Math.cos(a)*.52]};}));
   m.position.set(i?.48:-.43,i?.14:-.03,i?-.2:.2);m.rotation.z=i?-.24:.22;g.add(m);
  }
 }else if(id==='puzzle'){
  box(g,[2.26,.27,1.54],cream,[0,-.69,0],.14);cyl(g,.41,.41,.36,rose,[-.61,-.37,.12]);box(g,[.72,.4,.72],mint,[.52,-.35,.13],.09,[0,.1,0]);
  const tr=new T.Shape();tr.moveTo(0,.44);tr.lineTo(-.45,-.35);tr.lineTo(.45,-.35);tr.closePath();const triangle=add(g,new T.ExtrudeGeometry(tr,{depth:.26,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:detail.segment(3,'bevel'),steps:1}),lilac,[-.02,.48,-.35],[Math.PI/2,.12,.16]);triangle.rotation.z=.25;
  sphere(g,.075,gold,[-.61,-.12,.12]);sphere(g,.075,gold,[.52,-.1,.13]);
 }else if(id==='balloon'){
  const specs=[[-.55,.7,.2,rose],[.38,1.15,-.3,mat('#c0b3e4',.17,.47)],[.65,.02,.1,mat('#dbc78f',.2,.62)]];
  specs.forEach(([x,y,z,m])=>{sphere(g,.58,m,[x,y,z],[1,1.26,1]);cyl(g,.02,.07,.12,m,[x,y-.75,z]);tube(g,[[x,y-.8,z],[x+.1,y-1.2,z-.02],[x-.08,-1.5,z+.12],[.05,-1.9,.1]],.01,cream);});
 }else if(id==='gift'){
  box(g,[1.6,1.3,1.42],navy,[0,-.37,0],.065);box(g,[1.67,.22,1.49],navy,[0,.37,0],.065);box(g,[.21,1.57,1.5],gold,[0,-.26,.008],.01);box(g,[1.7,1.57,.2],gold,[0,-.26,0],.01);
  for(let side of [-1,1])tube(g,[[0,.56,0],[side*.45,.98,-.1],[side*.66,.7,.03],[0,.58,.1]],.073,gold);
  tube(g,[[0,.58,0],[.38,.49,.48],[.51,.19,.78],[.65,-.4,.77]],.055,gold);
 }
 const retained=new Set();g.traverse(o=>{if(o.isMesh){o.userData.productId=id;o.geometry.computeBoundingSphere();for(const m of Array.isArray(o.material)?o.material:[o.material])retained.add(m);}});for(const m of createdMaterials)if(!retained.has(m))m.dispose();for(const t of [texture,metalTexture])if(t&&![...retained].some(m=>m.roughnessMap===t))t.dispose();return g;
}

export function disposeProduct(g){const geometries=new Set(),materials=new Set(),textures=new Set();g.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(v=>v.dispose());materials.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();});textures.forEach(t=>t.dispose());}

// Reuse the original geometry; colors always resolve from the original palette.
export function variantMaterials(group,palette={}){
 const materials=new Set();group.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.color&&!m.map)materials.add(m);});});
 return [...materials].map(material=>{material.userData.originalColor??=material.color.getHexString();return {material,color:new T.Color('#'+(palette[material.userData.originalColor]||material.userData.originalColor))};});
}
export function applyPalette(group,palette={}){variantMaterials(group,palette).forEach(({material,color})=>material.color.copy(color));}
