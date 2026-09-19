import * as THREE from 'three';
import {V,block,flow} from './depthGeometry.js';
import {mesh,cylinder,robot,bottle,createPrecisionHall} from './supplyCraft.js';
import {regionalStage,slab,repeatBoxes,productArray,ribbonDeck,desk} from './regionalCraft.js';

// An entire design-development environment; architecture and products are concepts.
export function createChinaDevelopment(quality){
  const scene=regionalStage(quality,'china'),{root,m,motions}=scene;
  const library=new THREE.Group();library.position.set(-3,0,-13);root.add(library);
  // A terraced materials archive with an open, luminous central spine.
  const chips=[[],[],[],[]],mullions=[];
  for(let level=0;level<9;level++){
    const y=level*2.3,w=20-level*.85,d=13-level*.35;
    slab(library,m.navy,[w,.35,d],[0,y,0]);
    slab(library,m.blue,[w-.7,1.7,d-.7],[0,y+1.1,0],.65);
    for(let k=0;k<9;k++)chips[(level+k)%4].push({p:[(-.5+k/8)*(w-2),y+1,d/2+.13],s:[(w-2)/12,1.25,.1]});
    for(const side of [-1,1])block(library,m.light,[w-.6,.045,.055],[0,y+.24,side*d/2]);
  }
  for(let k=0;k<13;k++)mullions.push({p:[-9.6+k*1.6,10,6.6],s:[.05,20,.14]});
  repeatBoxes(library,m.gold,mullions);chips.forEach((poses,i)=>repeatBoxes(library,[m.rose,m.silver,m.gold,m.blue][i],poses));
  // Material blades catch light in a slow sequence above the archive.
  const crown=new THREE.Group();crown.position.y=21.8;library.add(crown);
  for(let i=0;i<17;i++){const blade=slab(crown,[m.rose,m.gold,m.silver,m.blue][i%4],[.45,8,4],[Math.sin(i*.4)*3,i*.26,-4+i*.52]);blade.rotation.z=-.22+i*.022;}
  motions.push(t=>crown.rotation.y=Math.sin(t*.11)*.14);
  // Product design atelier: an open stepped building with working surfaces and prototypes.
  const atelier=new THREE.Group();atelier.position.set(8,0,22);root.add(atelier);
  for(let level=0;level<3;level++)slab(atelier,m.navy,[30-level*2,.55,17-level*.8],[0,level*.55,0]);
  const posts=[];for(const x of [-13,13])for(const z of [-6,6])posts.push({p:[x,6,z],s:[.3,12,.3]});repeatBoxes(atelier,m.silver,posts);
  for(let i=0;i<9;i++){
    const roof=slab(atelier,i%3?m.silver:m.blue,[3.25,.35,17],[ -13+i*3.25,12.3+Math.sin(i*.45)*2,0]);roof.rotation.z=-.1+Math.cos(i*.45)*.1;
    block(atelier,m.light,[.06,.035,16],[-13+i*3.25,12.04+Math.sin(i*.45)*2,0]);
  }
  for(let row=0;row<2;row++)for(let col=0;col<4;col++)desk(atelier,m,-9+col*6,3-row*7);
  const chairs=[];for(let row=0;row<2;row++)for(let col=0;col<4;col++){const x=-9+col*6,z=5.3-row*7;chairs.push({p:[x,1.55,z],s:[1.6,.22,1.55]},{p:[x,2.25,z+.68],s:[1.6,1.5,.18]});for(const dx of [-.55,.55])block(atelier,m.silver,[.07,1.5,.07],[x+dx,.75,z]);}repeatBoxes(atelier,m.rose,chairs);
  for(const x of [-13,13]){block(atelier,m.smoke,[.08,5,13],[x,4,0]);block(atelier,m.gold,[.06,.06,13],[x,6.6,0]);}
  const hero=bottle(atelier,m,[0,1.8,-5.2],1.3,m.glass);motions.push(t=>hero.rotation.y=t*.13);
  const designRoute=flow(root,[[-4,24,-15],[4,28,-1],[9,19,14],[9,6,22]],{color:'#99dbef',radius:.11,speed:.08});motions.push(t=>designRoute.update(t));
  // A full prototype laboratory: print cells, robot finishing, inspection and sample shelves.
  const lab=new THREE.Group();lab.position.set(32,0,-18);root.add(lab);
  slab(lab,m.navy,[22,.8,37],[0,0,0]);
  for(let i=0;i<7;i++){
    const z=15-i*5;
    for(const side of [-1,1])block(lab,m.silver,[.2,13,.2],[side*10,6.5,z]);
    block(lab,m.silver,[20,.25,.4],[0,13,z]);block(lab,m.light,[16,.04,.04],[0,12.8,z]);
  }
  const specimenPos=[];
  for(let cell=0;cell<6;cell++){
    const x=cell%2?-4.5:4.5,z=11-Math.floor(cell/2)*10;
    slab(lab,m.navy,[6.6,1,7],[x,.85,z]);
    for(const dx of [-2.7,2.7])for(const dz of [-2.8,2.8])block(lab,m.silver,[.13,5.8,.13],[x+dx,4,z+dz]);
    block(lab,m.blue,[5.3,.2,5.7],[x,1.48,z]);
    for(const dx of [-2.7,2.7])block(lab,m.silver,[.12,.16,5.8],[x+dx,6,z]);
    block(lab,m.silver,[5.7,.12,.16],[x,6.2,z]);block(lab,m.smoke,[5.1,4.2,.04],[x,3.8,z-2.75]);
    block(lab,m.navy,[1.1,2.1,.9],[x+3.2,2.5,z+2]);block(lab,m.blue,[.9,.65,.03],[x+3.2,3,z+2.47]);
    const carriage=new THREE.Group();carriage.position.set(x,6,z);lab.add(carriage);
    block(carriage,m.gold,[1.1,.7,1.2],[0,0,0]);block(carriage,m.silver,[.12,1.1,.12],[0,-.8,0]);
    for(const dx of [-2.7,2.7])block(lab,m.light,[.035,4.8,.04],[x+dx,4,z+2.9]);
    motions.push(t=>{carriage.position.x=x+Math.sin(t*.75+cell)*1.7;carriage.position.z=z+Math.cos(t*.65+cell)*1.8;});
    cylinder(lab,cell%2?m.rose:m.stone,1.1,2,[x,2.5,z],.65);specimenPos.push({p:[x,1.5,z+2],scale:.5});
  }
  productArray(lab,m,specimenPos);
  for(let i=0;i<3;i++){const fn=robot(lab,m,[-9,0,8-i*10]);motions.push(t=>fn(t+i*2.4));}
  for(let i=0;i<4;i++){slab(root,m.navy,[17,.4,4],[17,1+i*2.6,-43]);block(root,m.light,[16,.035,.04],[17,1.23+i*2.6,-40.96]);}
  productArray(root,m,Array.from({length:40},(_,i)=>({p:[9.5+i%10*1.65,1.24+Math.floor(i/10)*2.6,-42],scale:.8,variant:i%4})));
  motions.push(ribbonDeck(root,m,[[-10,6,-10],[1,8,10],[23,7,7],[33,6,-14]],3.2));
  // China's own production/supplier hub complements its development buildings.
  // This is conceptual architecture, not a claim about actual site size or output.
  const supply=createPrecisionHall(m);supply.root.position.set(44,0,15);supply.root.userData.zone='core-supply';root.add(supply.root);motions.push(t=>supply.update(t));
  const stocks=[];
  for(let row=0;row<4;row++)for(let col=0;col<6;col++){
    stocks.push({p:[47+col*2.4,1.5+row*2.5,-33],s:[1.9,2,3.4]});
    if(col===0)block(root,m.silver,[16,.15,4],[53,2.65+row*2.5,-33]);
  }
  repeatBoxes(root,m.blue,stocks);
  for(const x of [45.8,60.2])block(root,m.gold,[.12,11,.15],[x,5.5,-30.9]);
  const supplyRoute=flow(root,[[8,5,22],[28,9,31],[48,7,17],[53,4,-14],[54,5,-32]],{color:'#ebce99',radius:.09,speed:.06});motions.push(t=>supplyRoute.update(t));
  return {...scene,anchors:[{id:'materials',point:V(-3,29,-13)},{id:'design',point:V(8,15,22)},{id:'prototype',point:V(32,15,-18)},{id:'supply',point:V(53,17,4)}]};
}
