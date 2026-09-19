import * as THREE from 'three';
import {V,block,flow} from './depthGeometry.js';
import {mesh,cylinder,tube,bottle,stackingToy} from './supplyCraft.js';
import {regionalStage,slab,repeatBoxes,productArray,ribbonDeck} from './regionalCraft.js';

// A complete market-facing environment, with concept products and no invented clients.
export function createUSAMarket(quality){
  const scene=regionalStage(quality,'usa'),{root,m,motions}=scene;
  m.blue.color.set('#285777');m.rose.color.set('#c4a490');m.gold.color.set('#d4b77c');
  // Panoramic merchandising gallery: four storeys of product exploration.
  const panels=[],fins=[],products=[],gallery=new THREE.Group();root.add(gallery);
  for(let col=0;col<29;col++){
    const a=-1.25+col/28*2.5,x=9+Math.sin(a)*33,z=-8-Math.cos(a)*33;
    panels.push({p:[x,13,z],s:[2.5,26,.24],angle:-a});
    fins.push({p:[9+Math.sin(a)*32.6,13,-8-Math.cos(a)*32.6],s:[.08,27,.46],angle:-a});
    for(let level=0;level<4;level++){
      const px=9+Math.sin(a)*29.8,pz=-8-Math.cos(a)*29.8,y=2+level*5.2;
      products.push({p:[px,y,pz],scale:1.55,variant:(col+level)%4});
      const plinth=slab(gallery,m.navy,[2.7,.24,2.1],[px,y-.13,pz]);plinth.rotation.y=-a;
      const light=block(gallery,m.light,[2.35,.035,.04],[px,y+.04,pz+1.07]);light.rotation.y=-a;
    }
  }
  repeatBoxes(gallery,m.blue,panels);repeatBoxes(gallery,m.gold,fins);productArray(gallery,m,products);
  for(let level=0;level<6;level++)tube(gallery,Array.from({length:65},(_,i)=>{const a=-1.27+i/64*2.54;return V(9+Math.sin(a)*33,level*5.2,-8-Math.cos(a)*33);}),.16,m.silver);
  const catalogue=flow(root,[[ -24,1,-18],[-17,10,-34],[9,26,-40],[37,17,-28],[42,2,-12]],{color:'#e2c499',radius:.1,speed:.055});motions.push(t=>catalogue.update(t));
  // The brand stage is a large layered forum with a floating, folded canopy.
  const stage=new THREE.Group();stage.position.set(7,0,18);root.add(stage);
  for(let step=0;step<4;step++){
    slab(stage,step===3?m.stone:m.navy,[38-step*2,.6,20-step*1.7],[0,step*.58,0],.29);
    block(stage,m.gold,[36-step*2,.035,.06],[0,step*.58+.32,9.7-step*.85]);
  }
  const hero=bottle(stage,m,[-6,2.15,-1],2.2,m.glass),toy=stackingToy(stage,m,[7,2.15,0],3.2);motions.push(t=>{hero.rotation.y=Math.sin(t*.13)*.5;toy.rotation.y=t*.1;});
  for(let i=0;i<4;i++){
    const z=10-i*4.7;
    motions.push(ribbonDeck(root,m,[[-18,7,z],[-9,18,z-3],[9,25,z-5],[27,20,z],[35,8,z+3]],3.5));
  }
  for(const x of [-18,35])for(const z of [-3,10]){const column=block(root,m.navy,[.4,12,.7],[x,6,z]);column.rotation.z=x<0?-.14:.14;}
  // Customer collaboration pavilion: an open conference suite with a market wall.
  const forum=new THREE.Group();forum.position.set(44,0,0);root.add(forum);
  cylinder(forum,m.navy,14,.6,[0,.2,0]);cylinder(forum,m.silver,12.8,.16,[0,.59,0]);
  const table=cylinder(forum,m.stone,5,.4,[0,2.4,1]);table.scale.z=.6;cylinder(forum,m.navy,2.7,2,[0,1.2,1]);
  const seats=[];
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,x=Math.cos(a)*7.4,z=1+Math.sin(a)*5.2;
    seats.push({p:[x,1.4,z],s:[1.4,.22,1.5],angle:-a},{p:[x,2.2,z+.7*Math.sin(a)],s:[1.4,1.5,.2],angle:-a});
    block(forum,m.gold,[.035,1.2,.035],[x,1,z]);
  }
  repeatBoxes(forum,m.rose,seats);
  for(let i=0;i<8;i++){
    const a=-1.1+i/7*2.2,x=Math.sin(a)*12,z=-Math.cos(a)*12;
    const panel=slab(forum,m.blue,[3.3,12,.24],[x,6.5,z]);panel.rotation.y=-a;
    const light=block(forum,m.light,[.045,11,.06],[x,6.5,z+.2]);light.rotation.y=-a;
  }
  for(let i=0;i<5;i++){slab(forum,m.navy,[3,.15,1.6],[-4+i*2,2.69,1]);block(forum,m.blue,[2.3,.03,1.1],[-4+i*2,2.78,1]);}
  // Sample preparation and review, separate from the launch stage.
  const review=new THREE.Group();review.position.set(-22,0,8);root.add(review);
  slab(review,m.navy,[12,.65,30],[0,0,0]);
  for(let bay=0;bay<4;bay++){
    const z=-10+bay*7;
    slab(review,m.stone,[8,.35,4],[0,2,z]);
    for(const side of [-1,1])block(review,m.silver,[.18,7,.18],[side*4.7,3.5,z]);
    block(review,m.navy,[10,.4,4.7],[0,7.2,z]);block(review,m.light,[8,.04,.04],[0,6.96,z]);
    productArray(review,m,Array.from({length:5},(_,i)=>({p:[-3+i*1.5,2.2,z],scale:.85,variant:i%4})));
  }
  const link=flow(root,[[44,3,0],[29,5,13],[7,3,18],[-15,4,16],[-22,3,3]],{color:'#f4cb91',radius:.09,speed:.09});motions.push(t=>link.update(t));
  return {...scene,anchors:[{id:'portfolio',point:V(25,28,-35)},{id:'brandstage',point:V(9,17,21)},{id:'customers',point:V(44,15,0)}]};
}
