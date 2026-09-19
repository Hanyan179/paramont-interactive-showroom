import * as THREE from 'three';
import {createIntelligenceCrystal} from './intelligenceCrystal.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

const TAU = Math.PI * 2;
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const fract = x => x-Math.floor(x);
const blue = new THREE.Color('#62a9e0');
const pale = new THREE.Color('#c4e9ff');
const gold = new THREE.Color('#edc485');

function makeMaterials() {
  return {
    glass: new THREE.MeshPhysicalMaterial({color:'#a3d1ec',metalness:.035,roughness:.105,clearcoat:1,clearcoatRoughness:.055,ior:1.5,transparent:true,opacity:.32,depthWrite:false,envMapIntensity:1.75,emissive:'#0d2d45',emissiveIntensity:.12}),
    silver: new THREE.MeshPhysicalMaterial({color:'#9bcceb',metalness:.82,roughness:.15,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.35}),
    azure: new THREE.MeshPhysicalMaterial({color:'#76bde9',metalness:.74,roughness:.12,clearcoat:1,envMapIntensity:1.6,emissive:'#124777',emissiveIntensity:.16}),
    gold: new THREE.MeshPhysicalMaterial({color:'#e1b979',metalness:.76,roughness:.19,clearcoat:1,envMapIntensity:1.4}),
    blueLight: new THREE.MeshStandardMaterial({color:'#b0e5ff',emissive:'#61bdff',emissiveIntensity:2.6,metalness:.2,roughness:.18}),
    goldLight: new THREE.MeshStandardMaterial({color:'#ffe6b3',emissive:'#ffc566',emissiveIntensity:3.2,metalness:.2,roughness:.18}),
  };
}

function rimmedGlass(material) {
  // Keep face centres optically open while the true bevels and grazing angles
  // catch light. The world's stage-visibility hook chains this shader hook.
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float exhibitGlassFresnel=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.4);
      diffuseColor.a*=0.34+0.66*exhibitGlassFresnel;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      totalEmissiveRadiance+=vec3(0.09,0.30,0.54)*exhibitGlassFresnel*0.7;`);
  };
  material.customProgramCacheKey=()=> 'intelligence-optical-glass-rim-v1';
  return material;
}

function mesh(parent,geometry,material,position=null) {
  const object=new THREE.Mesh(geometry,material);
  if(position) object.position.copy(position);
  parent.add(object);
  return object;
}

function twistedRibbon(detail,{radius=1.95,width=.28,phase=0,arc=.86}={}) {
  const samples=detail.segment(92),sides=10;
  const positions=new Float32Array((samples+1)*sides*3);
  const indices=[];
  const point=V(),next=V(),previous=V(),tangent=V(),radial=V(),axis=V(),other=V();
  function center(t,out) {
    const angle=(t-.5)*TAU*arc+phase;
    const r=radius+.12*Math.sin(angle*2+phase);
    return out.set(Math.cos(angle)*r,Math.sin(angle)*r*.94,Math.sin(angle*2+phase)*.23);
  }
  for(let i=0;i<=samples;i++) {
    const t=i/samples;
    center(t,point);center(Math.max(0,t-.001),previous);center(Math.min(1,t+.001),next);
    tangent.subVectors(next,previous).normalize();radial.copy(point).normalize();
    axis.crossVectors(tangent,radial).normalize();other.crossVectors(tangent,axis).normalize();
    const twist=t*TAU*.6+phase;
    const c=Math.cos(twist),s=Math.sin(twist);
    const ax=axis.x*c+other.x*s,ay=axis.y*c+other.y*s,az=axis.z*c+other.z*s;
    const bx=-axis.x*s+other.x*c,by=-axis.y*s+other.y*c,bz=-axis.z*s+other.z*c;
    const taper=.5+.5*Math.sin(t*Math.PI);
    for(let j=0;j<sides;j++) {
      const a=j/sides*TAU;
      const side=Math.cos(a)*width*taper,depth=Math.sin(a)*.032;
      const n=(i*sides+j)*3;
      positions[n]=point.x+ax*side+bx*depth;
      positions[n+1]=point.y+ay*side+by*depth;
      positions[n+2]=point.z+az*side+bz*depth;
      if(i<samples) {
        const v=i*sides+j,w=i*sides+(j+1)%sides;
        indices.push(v,w,v+sides,w,w+sides,v+sides);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

function analyticalOrb(root,detail,materials,sparkGeometry) {
  const body=new THREE.Group();root.add(body);
  const shellMaterial=rimmedGlass(materials.glass.clone());
  shellMaterial.opacity=.2;shellMaterial.transmission=.3;shellMaterial.thickness=.42;
  shellMaterial.roughness=.12;shellMaterial.metalness=.04;
  const shell=mesh(body,new THREE.SphereGeometry(1.48,detail.segment(38),detail.segment(26)),shellMaterial);
  const ribbons=[];
  for(let i=0;i<5;i++) {
    const ribbon=mesh(body,twistedRibbon(detail,{radius:1.83+i*.045,width:[.27,.33,.23,.28,.18][i],phase:i*.78,arc:.79+i*.027}),i%3===1?materials.azure:materials.silver);
    ribbon.rotation.set(i*.69,i*.57,i*.48);
    ribbons.push(ribbon);
  }
  const nucleus=mesh(body,new THREE.IcosahedronGeometry(.23,1),materials.blueLight);
  const count=64,particles=new THREE.InstancedMesh(sparkGeometry,materials.blueLight,count);
  particles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);particles.frustumCulled=false;body.add(particles);
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),position=V(),scale=V();
  function update(time) {
    shell.rotation.y=time*.055;
    nucleus.scale.setScalar(1+.055*Math.sin(time*.7));
    nucleus.rotation.set(time*.09,time*.12,0);
    for(let i=0;i<ribbons.length;i++) {
      const ribbon=ribbons[i];
      ribbon.rotation.set(i*.69+Math.sin(time*.11+i)*.14,i*.57+time*(i%2?-.035:.028),i*.48+Math.sin(time*.09+i)*.10);
    }
    for(let i=0;i<count;i++) {
      const y=1-2*(i+.5)/count;
      const horizontal=Math.sqrt(Math.max(0,1-y*y));
      const radius=.52+fract(i*.61803398875)*.9;
      const angle=i*2.399963+time*.09;
      position.set(Math.cos(angle)*horizontal*radius,y*radius,Math.sin(angle)*horizontal*radius);
      scale.setScalar(.43+fract(i*.31)*.55);
      matrix.compose(position,q,scale);particles.setMatrixAt(i,matrix);
    }
    particles.instanceMatrix.needsUpdate=true;
  }
  update(0);
  return {update};
}

/** Real, orbitable model assets. The caller owns their placement and frame loop. */
export function createIntelligenceArtifacts(quality) {
  const detail=modelDetail('analytics',quality);
  const names=['data-assets','analytical-orb','insight-crystal','decision-products','market-impact-placeholder','knowledge-infinity-stage'];
  const roots=names.map(name=>{const root=new THREE.Group();root.name=name;root.userData.qualityModel='analytics';return root;});
  // Stage-local palettes let the world fade peers without affecting selection.
  const palettes=names.map((_,index)=>[0,2,3,4,5].includes(index)?null:makeMaterials());
  const sparkGeometry=new THREE.SphereGeometry(.06,detail.segment(14),detail.segment(10));
  const crystal=createIntelligenceCrystal(quality);roots[2].add(crystal.root);
  const devices=[
    null, // The world supplies the multi-source knowledge instrument.
    analyticalOrb(roots[1],detail,palettes[1],sparkGeometry),
    crystal,
    null, // The world supplies the product comparison.
    null,
    null, // The world supplies the infinity feedback instrument.
  ];
  // Leave the caller's root transforms free. Normalize only the model's own
  // content once; animated parts retain real depth and broad material surfaces.
  const vertex=V(),instance=new THREE.Matrix4(),world=new THREE.Matrix4();
  for(let i=0;i<roots.length;i++) {
    const root=roots[i];
    if(!root.children.length) continue;
    root.updateMatrixWorld(true);
    let radius=0;
    root.traverse(object=>{
      const attribute=object.geometry?.attributes.position;
      if(!attribute) return;
      const copies=object.isInstancedMesh?object.count:1;
      for(let copy=0;copy<copies;copy++) {
        if(object.isInstancedMesh) {object.getMatrixAt(copy,instance);world.multiplyMatrices(object.matrixWorld,instance);}
        else world.copy(object.matrixWorld);
        for(let n=0;n<attribute.count;n++) {vertex.fromBufferAttribute(attribute,n).applyMatrix4(world);radius=Math.max(radius,vertex.length());}
      }
    });
    const content=root.children[0];
    content.scale.multiplyScalar((i===0?2.12:2.35)/Math.max(.1,radius));
    root.userData.radius=2.5;
  }
  function update({time=0,reduced=false}={}) {
    const clock=reduced?0:Number.isFinite(time)?time:0;
    for(const device of devices) device?.update(clock);
  }
  update();
  return {roots,update};
}
