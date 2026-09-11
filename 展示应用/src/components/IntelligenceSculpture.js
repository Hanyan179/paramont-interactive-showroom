import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// One instrument with sequential states. Signals, categories, AI and product
// direction never become four competing sculptures in the same composition.
export function createIntelligenceSculpture(root,materials){
 const {navy,silver,pearl,gold,glow}=materials;
 const dark=new T.MeshPhysicalMaterial({color:'#081b2e',metalness:.35,roughness:.26,clearcoat:.7});
 const edge=new T.MeshPhysicalMaterial({color:'#718da1',metalness:.8,roughness:.24});
 const mesh=(g,geo,mat,p=[0,0,0])=>{const m=new T.Mesh(geo,mat);m.position.fromArray(p);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 const box=(g,w,h,d,mat,p,r=.05)=>mesh(g,new RoundedBoxGeometry(w,h,d,3,r),mat,p);
 const line=(g,points,mat)=>{const l=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),mat);g.add(l);return l;};
 const quietLine=new T.LineBasicMaterial({color:'#82a7ba',transparent:true,opacity:.35});
 const instrument=new T.Group();root.add(instrument);instrument.rotation.y=-.12;
 // Low dock, milled rim, hinge and a single glass analysis surface.
 box(instrument,4.9,.18,2.8,navy,[0,.08,.45],.12);
 box(instrument,4.8,.035,2.7,edge,[0,.188,.45],.08);
 box(instrument,4.7,.025,2.6,dark,[0,.216,.45],.07);
 box(instrument,1.5,.017,.035,glow,[0,.239,1.71],.006);
 for(const x of [-2,2])box(instrument,.06,.018,.63,silver,[x,.24,.76],.015);
 const display=new T.Group();display.position.set(0,.47,-.30);instrument.add(display);
 mesh(display,new T.CylinderGeometry(.16,.16,3.55,48),silver,[0,0,0]).rotation.z=Math.PI/2;
 box(display,.5,.85,.21,silver,[0,.40,-.06],.06);
 const frame=new T.Group();frame.position.set(0,2.2,-.2);display.add(frame);
 box(frame,5.12,3.32,.14,edge,[0,0,-.10],.15);
 box(frame,4.99,3.19,.075,navy,[0,0,0],.13);
 box(frame,4.77,2.98,.015,dark,[0,0,.047],.09);
 box(frame,.48,.018,.018,gold,[0,-1.52,.048],.005);
 // The geometry lives within the same viewing aperture and unfolds one stage at a time.
 const groups=Array.from({length:4},(_,i)=>{const g=new T.Group();g.userData.analysisStep=i;g.name=['trend-surface','category-surface','ai-association','product-direction'][i];g.scale.setScalar(.001);g.visible=false;frame.add(g);return g;});
 const signals=groups[0],waves=[],tracers=[];
 for(let row=0;row<6;row++){
  const points=[];for(let j=0;j<=80;j++){const x=-2.07+j*.052;points.push(new T.Vector3(x,Math.sin(x*1.8+row*.60)*(.30+row*.025)+(row-2.5)*.19,.12+(Math.cos(x*1.1+row*.6)+1)*.07));}
  const curve=new T.CatmullRomCurve3(points);
  const mat=row===3?gold:row===2?glow:silver;
  mesh(signals,new T.TubeGeometry(curve,96,row===3?.014:.008,6,false),mat);waves.push({curve,row});
  const dot=mesh(signals,new T.SphereGeometry(row===3?.044:.026,12,8),mat);tracers.push(dot);
 }
 for(let row=0;row<4;row++)line(signals,[[-2.05,-1.04+row*.62,.07],[2.05,-1.04+row*.62,.07]],quietLine);
 const categories=groups[1],tiles=[];
 for(let i=0;i<16;i++){
  const col=i%4,row=Math.floor(i/4);const tile=new T.Group();tile.position.set((col-1.5)*.85,(1.5-row)*.59,.17);categories.add(tile);
  box(tile,.72,.46,.085,[navy,pearl,gold,navy][col],[0,0,0],.045);
  box(tile,.44,.012,.01,col===1?navy:silver,[-.045,-.09,.05],.005);
  tiles.push(tile);
 }
 const ai=groups[2];instrument.add(ai);ai.position.set(0,2.45,.40);
 const lattice=new T.Group();ai.add(lattice);
 const nodes=[],links=[];
 for(let layer=0;layer<3;layer++)for(let j=0;j<5;j++){
  const p=[(layer-1)*1.35,(j-2)*.43,Math.sin(j*.9+layer)*.50];
  const n=mesh(lattice,new T.SphereGeometry(layer===1?.11:.065,20,16),layer===1?gold:glow,p);nodes.push(n);
  if(layer)for(let k=0;k<5;k++){if((k+j)%3===0)continue;const a=nodes[(layer-1)*5+k].position.clone();const points=[a,new T.Vector3(...p)];const curve=new T.LineCurve3(...points);line(lattice,points.map(v=>v.toArray()),quietLine);links.push(curve);}
 }
 const pulse=mesh(lattice,new T.SphereGeometry(.050,14,10),glow);
 // One focused central compute element; no surrounding planets, cards or bottles.
 const compute=mesh(lattice,new T.OctahedronGeometry(.40,0),gold,[0,0,0]);
 const review=new T.Group();ai.add(review);review.position.set(0,-1.03,.4);
 box(review,1.35,.17,.05,silver,[0,0,0],.025);box(review,.93,.025,.015,glow,[0,0,.03],.006);
 const product=groups[3];instrument.add(product);product.position.set(0,1.37,.65);
 const bottleGlass=new T.MeshPhysicalMaterial({color:'#406e88',metalness:.16,roughness:.15,clearcoat:1,transmission:.22,thickness:.15,ior:1.45});
 box(product,1.05,1.55,.62,bottleGlass,[0,-.05,0],.15);
 box(product,.82,1.26,.45,navy,[0,-.04,0],.10);
 mesh(product,new T.CylinderGeometry(.30,.33,.24,40),gold,[0,.84,0]);
 box(product,.24,.24,.22,silver,[0,1.06,0],.035);
 box(product,.45,.10,.18,silver,[.12,1.19,0],.035);
 box(product,.54,.32,.013,pearl,[0,.08,.322],.025);
 for(let i=0;i<3;i++)box(product,.24-i*.04,.012,.01,navy,[-.025,.12-i*.055,.334],.003);
 const plinth=mesh(product,new T.CylinderGeometry(.98,1.05,.07,80),silver,[0,-.88,0]);plinth.scale.z=.67;
 let current=0,reveal=.001,selected=0,detailMix=0,reviewMix=0,rotation=0;
 return {update(time,stage,dt,reduced,detail){
  selected=stage===null?0:stage;
  const k=reduced?1:1-Math.exp(-dt*4.3);
  if(current!==selected){reveal=T.MathUtils.lerp(reveal,0,k*1.45);if(reveal<.025){groups[current].visible=false;current=selected;}}
  else reveal=T.MathUtils.lerp(reveal,1,k);
  groups.forEach((g,i)=>{g.visible=i===current;g.scale.setScalar(i===current?Math.max(.001,reveal):.001);});
  const tilt=[-.025,-.43,-1.05,-1.20][current];display.rotation.x=T.MathUtils.lerp(display.rotation.x,tilt,k);
  frame.rotation.y=T.MathUtils.lerp(frame.rotation.y,current===1?-.08:current===3?.10:0,k);
  detailMix=T.MathUtils.lerp(detailMix,detail===1?1:0,k);
  reviewMix=T.MathUtils.lerp(reviewMix,current===2&&detail===2?1:0,k);
  review.scale.setScalar(Math.max(.001,reviewMix));
  lattice.scale.z=1+detailMix*.9;lattice.rotation.y=Math.sin(time*.15)*.065*(1-reviewMix);
  tiles.forEach((tile,i)=>{const col=i%4,row=Math.floor(i/4);tile.position.x=T.MathUtils.lerp(tile.position.x,(col-1.5)*.85+(detail===1?(row-1.5)*.08:0),k);tile.position.z=.17+(detail===2?col*.065:0);});
  if(!reduced){
   tracers.forEach((dot,i)=>dot.position.copy(waves[i].curve.getPointAt((time*.052+i*.14)%1)));
   rotation+=dt*.16*(1-reviewMix*.95);compute.rotation.set(rotation*.5,rotation,0);
   const travel=(time*.44)%links.length;pulse.position.copy(links[Math.floor(travel)].getPointAt(travel%1));
   product.rotation.y=Math.sin(time*.18)*.16;
  }
  root.userData.analysisStep=current;
 }};
}
