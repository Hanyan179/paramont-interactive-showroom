import * as THREE from 'three';
import {ConvexGeometry} from 'three/addons/geometries/ConvexGeometry.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {V,TAU,fract,addMesh,opticalPalette,edgeGlass} from './intelligenceOptics.js';

function cutCrystal(){
  const vertices=[];
  // Small crown, shoulder facets, a narrow girdle and a tapered pavilion give
  // the silhouette actual cut surfaces instead of eight oversized triangles.
  for(const [y,r,offset] of [[1.75,.07,0],[1.41,.38,0],[.11,1.12,0],[-.035,1.12,0],[-1.53,.16,.125],[-1.76,.045,.125]]){
    for(let i=0;i<8;i++){const a=(i/8+offset)*TAU;vertices.push(V(Math.cos(a)*r,y,Math.sin(a)*r));}
  }
  return new ConvexGeometry(vertices);
}

export function createIntelligenceCrystal(quality){
  const detail=modelDetail('analytics',quality),root=new THREE.Group(),body=new THREE.Group(),m=opticalPalette();
  root.name='cut-insight-crystal';root.add(body);
  const crystalMaterial=edgeGlass(m.glass.clone());crystalMaterial.opacity=.68;crystalMaterial.thickness=1.4;crystalMaterial.ior=1.7;crystalMaterial.color.set('#5b8fb5');crystalMaterial.envMapIntensity=1.3;
  const cut=addMesh(body,'insight-polished-crown',cutCrystal(),crystalMaterial);cut.rotation.y=.22;
  const innerMaterial=edgeGlass(m.glass.clone());innerMaterial.opacity=.58;innerMaterial.color.set('#377fb5');
  const inner=addMesh(cut,'insight-inner-facets',cut.geometry,innerMaterial);inner.scale.set(.43,.61,.43);inner.rotation.y=Math.PI/8;
  const lightGlass=edgeGlass(m.glass.clone());lightGlass.opacity=.36;
  const secondary=addMesh(cut,'insight-optical-depth',cut.geometry,lightGlass);secondary.scale.set(.74,.81,.74);secondary.rotation.y=Math.PI/8;
  // The girdle is a tiny bevel, not a wireframe wrapped around the model.
  const belt=[];for(let i=0;i<=8;i++){const a=i/8*TAU;belt.push(V(Math.cos(a)*1.125,.04,Math.sin(a)*1.125));}
  const girdle=new THREE.CatmullRomCurve3(belt,false,'catmullrom',.05);
  addMesh(cut,'insight-silver-girdle',new THREE.TubeGeometry(girdle,detail.segment(64),.011,6,false),m.silver);
  const core=addMesh(body,'insight-opportunity-core',new THREE.OctahedronGeometry(.22,0),m.warm);core.scale.y=1.22;core.position.z=.16;
  const light=new THREE.PointLight('#efc997',.9,4,2);body.add(light);
  const facetGlints=[];
  for(let i=0;i<8;i++){
    const a=i/8*TAU,curve=new THREE.CatmullRomCurve3([V(Math.cos(a)*.08,1.71,Math.sin(a)*.08),V(Math.cos(a)*.39,1.41,Math.sin(a)*.39),V(Math.cos(a)*1.125,.12,Math.sin(a)*1.125)]);
    const rail=addMesh(cut,`insight-crown-bevel-${i}`,new THREE.TubeGeometry(curve,detail.segment(32),.005,5,false),m.silver);rail.material=m.silver;
    const glint=addMesh(cut,`insight-facet-glint-${i}`,new THREE.SphereGeometry(.016,10,8),m.light);facetGlints.push({curve,glint});
  }
  const orbitGroups=[],orbits=[],satellites=[],paths=[];
  for(let i=0;i<2;i++){
    const group=new THREE.Group();group.rotation.set(i?1.20:.66,i?.35:.12,i?-.62:.30);body.add(group);orbitGroups.push(group);
    const radius=i?2.02:1.96,points=Array.from({length:129},(_,n)=>V(Math.cos(n/128*TAU)*radius,0,Math.sin(n/128*TAU)*radius));
    const path=new THREE.CatmullRomCurve3(points);orbits.push(path);
    addMesh(group,`insight-orbit-${i}`,new THREE.TubeGeometry(path,detail.segment(128),.009,6,false),i?m.silver:m.gold);
  }
  for(let i=0;i<5;i++){
    const satellite=addMesh(body,`insight-evidence-lens-${i}`,new THREE.SphereGeometry(.105,detail.segment(24),detail.segment(18)),edgeGlass(m.glass.clone()));
    addMesh(satellite,`insight-evidence-core-${i}`,new THREE.IcosahedronGeometry(.038,1),i===2?m.warm:m.light);satellites.push(satellite);
    const angle=i/5*TAU,from=V(Math.cos(angle)*1.65,Math.sin(angle)*1.2,Math.sin(angle*2)*.8);
    paths.push(new THREE.CatmullRomCurve3([from,from.clone().multiplyScalar(.68).add(V(0,.1,.4)),V(0,.05,.22),V(.12,1.0,.24),V(.06,1.83,.06)]));
  }
  const packets=new THREE.InstancedMesh(new THREE.SphereGeometry(.028,12,8),m.light,30);packets.name='insight-evidence-focus';packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);packets.frustumCulled=false;body.add(packets);
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),p=V(),scale=V();
  function update(time=0){
    cut.rotation.y=.22+Math.sin(time*.18)*.13;
    secondary.rotation.y=Math.PI/8+Math.sin(time*.22)*.09;
    core.rotation.set(time*.18,time*.11,0);core.scale.setScalar(.94+Math.sin(time*.9)*.065);
    light.intensity=.75+.2*Math.sin(time*.9);
    facetGlints.forEach(({curve,glint},i)=>{curve.getPoint(fract(time*.12+i/8),glint.position);});
    satellites.forEach((satellite,i)=>{orbits[i%2].getPoint(fract(i/5+time*.025),p);p.applyEuler(orbitGroups[i%2].rotation);satellite.position.copy(p);});
    for(let i=0;i<packets.count;i++){
      const progress=fract(time*.16+i/packets.count);paths[i%5].getPoint(progress,p);scale.setScalar(.4+.45*Math.sin(progress*Math.PI));matrix.compose(p,q,scale);packets.setMatrixAt(i,matrix);
    }
    packets.instanceMatrix.needsUpdate=true;
  }
  update();return {root,update};
}
