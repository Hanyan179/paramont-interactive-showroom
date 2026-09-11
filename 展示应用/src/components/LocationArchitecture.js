import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import {getRenderQuality,modelDetail,modelIdOf} from '../../../共享组件/renderQuality.js';
import * as THREE from 'three';
import {regionLayouts} from './regionLayouts';

// One brand palette, three architectural silhouettes. Country roles are expressed
// at the scale of the environment, not only through interchangeable furniture.
export function addLocationArchitecture({root,box,cylinder,tube,materials}) {
  const quality=getRenderQuality(),detailFor=p=>modelDetail(modelIdOf(p,'china'),quality);
  const {white,stone,silver,navy,dark,glass,glow,warm}=materials;
  const roots={},occluders={china:[],usa:[],cambodia:[]};
  for(const id of Object.keys(occluders)){const g=new THREE.Group();g.name=`${id}-architecture`;g.userData.qualityModel=id;root.add(g);roots[id]=g;}
  const wall=(parent,r,h,x,y,z,scaleZ,mat,start=Math.PI/2,length=Math.PI)=>{
    const material=mat.clone();material.side=THREE.DoubleSide;
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,detailFor(parent).segment(96),1,true,start,length),material);m.position.set(x,y,z);m.scale.z=scaleZ;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  };
  const band=(parent,outer,inner,x,y,z,sx,sz,mat)=>{
    const m=new THREE.Mesh(new THREE.RingGeometry(inner,outer,detailFor(parent).segment(96)),mat);m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.scale.set(sx,sz,1);parent.add(m);return m;
  };

  // CHINA: staggered, terraced atelier. Each deck has a distinct silhouette.
  const china=roots.china;
  regionLayouts.china.forEach((layout,i)=>{
    const deck=new THREE.Group();deck.position.fromArray(layout.position);deck.rotation.y=layout.yaw;deck.userData.roomIndex=i;china.add(deck);
    box(deck,10.7,.3,9.6,0,-.03,-.25,navy,.12);
    box(deck,10.5,.11,9.4,0,.17,-.25,i===1?silver:stone,.05);
    box(deck,10.35,.02,.035,0,.237,4.40,glow,.005);
    if(i===0){
      // Sloping drafting canopy: one plane, a warm edge and exposed structure.
      const canopy=box(deck,7.2,.11,4.2,-.65,5.05,-2.25,silver);canopy.rotation.z=-.09;occluders.china.push(canopy);
      box(deck,6.9,.025,.06,-.65,4.83,-.23,warm,.006);
      for(const x of [-3.75,2.45])occluders.china.push(box(deck,.10,4.8,.10,x,2.65,-3.9,silver));
    }else if(i===1){
      // Tall research vault on the raised, rear terrace.
      for(let j=0;j<4;j++)tube(deck,[[-4.7,.3,-2+j*.68],[-4.4,4.8,-2+j*.68],[0,7.0,-2+j*.68],[4.4,4.8,-2+j*.68],[4.7,.3,-2+j*.68]],.043,j===1?glow:silver);
      occluders.china.push(box(deck,9.5,2.4,.13,0,1.53,-4.55,navy));
    }else{
      // Open sample wall, with slim vertical framing, no repeated roof.
      for(const x of [-4.75,4.75])occluders.china.push(box(deck,.13,5.5,.13,x,3,-4.2,silver));
      box(deck,9.6,.14,.14,0,5.74,-4.2,white);
      for(let j=0;j<5;j++)box(deck,.065,4.6,.05,-4+j*2,2.9,-4.25,navy);
    }
  });
  tube(china,[[-6,.32,3],[-3,.7,-.5],[0,1.8,-7],[5,1.05,-1],[10,.55,3]],.026,glow);
  for(let i=0;i<6;i++)box(china,3.1,.16,.50,-4+i*.58,.25+i*.23,-1-i*.61,silver,.025);

  // USA: a horseshoe customer forum. A stepped centre and two rear wings
  // surround the conversation, rather than lining three rooms up on a tray.
  const usa=roots.usa;
  const outline=new THREE.Shape();outline.moveTo(-17,-10);outline.lineTo(17,-10);outline.quadraticCurveTo(19,6,11,9);outline.quadraticCurveTo(0,13,-11,9);outline.quadraticCurveTo(-19,6,-17,-10);
  const geo=new THREE.ExtrudeGeometry(outline,{depth:.3,bevelEnabled:true,bevelSegments:detailFor(usa).segment(3,'bevel'),curveSegments:detailFor(usa).segment(12),steps:1,bevelSize:.08,bevelThickness:.05});geo.rotateX(-Math.PI/2);
  const base=new THREE.Mesh(geo,navy);base.position.y=-.12;base.receiveShadow=true;usa.add(base);
  const top=new THREE.Mesh(geo.clone(),stone);top.position.y=.03;top.scale.set(.992,.33,.992);top.receiveShadow=true;usa.add(top);
  for(let i=0;i<3;i++){const terrace=cylinder(usa,5.5-i*.42,.15,0,.21+i*.15,3,i===2?white:silver);terrace.scale.z=.9;}
  const bronze=new THREE.MeshPhysicalMaterial({color:'#a68a64',metalness:.78,roughness:.36});
  for(const layout of [regionLayouts.usa[0],regionLayouts.usa[2]]){
    const wing=new THREE.Group();wing.position.fromArray(layout.position);wing.rotation.y=layout.yaw;wing.userData.roomIndex=layout.position[0]<0?0:2;usa.add(wing);
    box(wing,10.5,.10,8.9,0,.21,0,stone);
    occluders.usa.push(box(wing,10.4,5.5,.14,0,3,-4.5,navy));
    for(let i=0;i<26;i++)box(wing,.095,5.4,.15,-5+i*.4,3,-4.38,i%5?bronze:silver,.02);
    box(wing,10.6,.12,2.8,0,5.78,-3.25,bronze);
    box(wing,10.3,.025,.04,0,5.68,-1.90,warm,.005);
  }
  const halo=band(usa,5.9,5.6,0,6.5,3,1,.92,bronze);halo.material.side=THREE.DoubleSide;
  band(usa,5.64,5.60,0,6.43,3,1,.92,warm);
  for(const x of [-4.7,4.7])occluders.usa.push(box(usa,.08,6.1,.08,x,3.5,.1,bronze));
  tube(usa,[[-14,.26,1],[-9,.3,5],[-5,.5,7],[0,.61,8.2],[5,.5,7],[9,.3,5],[14,.26,1]],.023,warm);

  // CAMBODIA: one long factory cutaway. Steel columns, exposed roof trusses,
  // clerestory glazing and a single service aisle replace individual pavilions.
  const cambodia=roots.cambodia;
  box(cambodia,37.8,.46,12.5,0,-.12,-.2,navy,.10);
  box(cambodia,37.4,.11,12.1,0,.17,-.2,stone,.028);
  for(let x=-18;x<19;x+=2.5)box(cambodia,.011,.018,11.8,x,.237,-.2,silver,.003);
  occluders.cambodia.push(box(cambodia,36.7,4.75,.20,0,2.68,-4.95,navy));
  box(cambodia,36.4,1.0,.045,0,5.33,-4.81,glass,.01);
  for(let x=-17.5;x<=17.5;x+=1.75)box(cambodia,.043,5.5,.045,x,3.05,-4.80,silver,.012);
  for(const x of [-17.5,-6,6,17.5]){
    for(const z of [-4.6,3.5]){
      occluders.cambodia.push(box(cambodia,.23,5.84,.29,x,3.12,z,navy));
      box(cambodia,.56,.16,.61,x,.38,z,silver);
    }
    const beam=box(cambodia,.20,.24,8.5,x,6.12,-.5,silver);occluders.cambodia.push(beam);
    // Triangulated webs make the roof read as industrial structure.
    for(let i=0;i<6;i++){
      const z=-4.1+i*1.32;
      tube(cambodia,[[x,6.16,z],[x,6.8,z+.66],[x,6.16,z+1.32]],.04,silver);
    }
    box(cambodia,.12,.13,8.0,x,6.81,-.15,navy);
  }
  for(const z of [-4.2,-1.35,1.5,3.45])box(cambodia,35.4,.13,.14,0,6.34,z,silver);
  occluders.cambodia.push(box(cambodia,35.6,.075,1.9,0,6.57,-3.78,navy,.02));
  for(const z of [-2.4,.6])box(cambodia,34.8,.018,.075,0,5.94,z,glow,.005);
  for(const z of [3.95,5.28])box(cambodia,35.8,.017,.045,0,.24,z,warm,.007);
  for(let x=-17;x<=17;x+=1.5)box(cambodia,.65,.018,.10,x,.245,4.62,silver,.01);

  for(const [id,g] of Object.entries(roots)){const copies=new Map();g.traverse(o=>{if(o.material){if(!copies.has(o.material))copies.set(o.material,o.material.clone());o.material=copies.get(o.material);}});applySurfaceFinish(THREE,g,modelDetail(id,quality));}
  const accents=[];
  for(const region of Object.values(roots))region.traverse(group=>{
    if(group.userData.roomIndex===undefined)return;
    const copies=new Map();group.traverse(o=>{if(!o.material||!o.material.color)return;const original=o.material;if(!copies.has(original)){const m=original.clone();copies.set(original,m);accents.push({material:m,colour:original.color.clone(),index:group.userData.roomIndex});}o.material=copies.get(original);});
  });
  return {roots,occluders,select(id){for(const [key,g] of Object.entries(roots))g.visible=key===id;},focus(index,dt){for(const a of accents)a.material.color.lerp(a.colour.clone().multiplyScalar(index<0||a.index===index?1:.12),1-Math.exp(-dt*3));}};
}
