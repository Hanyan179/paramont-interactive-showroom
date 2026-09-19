import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {V,fract,addMesh,opticalPalette,edgeGlass} from './intelligenceOptics.js';

export const intelligenceAssetSources=[
  {id:'internet',family:'information',name:['互联网渠道','Internet channels']},
  {id:'reports',family:'information',name:['行业报告','Industry reports']},
  {id:'trends',family:'information',name:['发展趋势','Emerging trends']},
  {id:'industry-experts',family:'expertise',name:['行业专家','Industry experts']},
  {id:'business-experts',family:'expertise',name:['业务专家','Business experts']},
];

// Curved pages have polished rims and thickness. Content is engraved into the
// same curved surface, so dragging reveals depth instead of a flat billboard.
function curvePage(geometry){
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i);positions.setXYZ(i,Math.sin(x*.48)/.48,positions.getY(i),z+.36*x*x);
  }
  geometry.computeVertexNormals();return geometry;
}
export function createIntelligenceAssets(quality){
  const detail=modelDetail('analytics',quality),m=opticalPalette(),root=new THREE.Group(),body=new THREE.Group();
  root.name='multi-source-knowledge-assets';root.userData.illustrative=true;root.add(body);
  body.rotation.set(.12,-.50,-.1);
  const glass=curvePage(new RoundedBoxGeometry(1.72,2.75,.073,detail.segment(5,'rounded'),.033));
  const spineMaterial=m.blue.clone();spineMaterial.roughness=.24;
  addMesh(body,'knowledge-bound-spine',new RoundedBoxGeometry(.16,2.76,.69,detail.segment(3,'rounded'),.067),spineMaterial,[-.96,0,-.48]);
  const pages=[],scans=[],seals=[];
  const rowGeo=new RoundedBoxGeometry(.045,.028,.018,1,.007);
  for(let i=0;i<5;i++){
    const page=new THREE.Group();page.name=`asset-source-${intelligenceAssetSources[i].id}`;
    page.position.set((i-2)*.32,(i-2)*.07,(i-2)*.34);page.rotation.y=(i-2)*.43;body.add(page);pages.push(page);
    const material=edgeGlass(m.glass.clone());material.color.set(i>2?'#8498a6':'#387ca8');material.opacity=.48+i*.065;
    addMesh(page,`knowledge-leaf-${i}`,glass,material);
    // Only the cut top/bottom edges catch silver, without diagram-like frames.
    for(const sign of [-1,1]){
      const curve=new THREE.CatmullRomCurve3(Array.from({length:33},(_,n)=>{const x=-.82+n/32*1.64;return V(Math.sin(x*.48)/.48,sign*1.335,.036+.36*x*x);}));
      addMesh(page,`leaf-cut-edge-${i}-${sign}`,new THREE.TubeGeometry(curve,detail.segment(32),.011,6,false),m.silver);
    }
    const records=new THREE.InstancedMesh(rowGeo,i>2?m.gold:m.silver,54),matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),p=V(),scale=V();
    records.name=`semantic-records-${i}`;page.add(records);
    for(let n=0;n<54;n++){
      const col=n%9,row=Math.floor(n/9),x=-.63+col*.147;
      p.set(Math.sin(x*.48)/.48,.92-row*.30,.052+.36*x*x);q.setFromAxisAngle(V(0,1,0),-Math.atan(.72*x));
      scale.set(1+fract(n*.71+i)*1.1,1,.8);matrix.compose(p,q,scale);records.setMatrixAt(n,matrix);
    }
    const scan=addMesh(page,`knowledge-reading-scan-${i}`,new RoundedBoxGeometry(1.31,.012,.016,1,.005),m.light);scans.push(scan);
    const seal=addMesh(page,`expert-review-inlay-${i}`,new THREE.TorusGeometry(.103,.015,8,detail.segment(24)),i>2?m.gold:m.blue,[-.60,-1.11,.19]);seals.push(seal);
    if(i>2){
      const check=new THREE.CatmullRomCurve3([V(-.65,-1.10,.21),V(-.61,-1.14,.21),V(-.54,-1.05,.21)]);
      addMesh(page,`expert-reviewed-mark-${i}`,new THREE.TubeGeometry(check,10,.009,6,false),m.gold);
    }
  }
  const fragmentGeometry=new RoundedBoxGeometry(.12,.075,.025,2,.011);
  const packets=new THREE.InstancedMesh(fragmentGeometry,m.light,36);packets.name='source-to-knowledge-packets';packets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);packets.frustumCulled=false;body.add(packets);
  const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),p=V(),scale=V();
  function update({time=0,reduced=false}={}){
    const clock=reduced?0:time;
    pages.forEach((page,i)=>{
      page.rotation.y=(i-2)*.43+Math.sin(clock*.34-i*.58)*.105;
      page.position.y=(i-2)*.07+Math.sin(clock*.5-i*.4)*.028;
      scans[i].position.set(0,1.17-fract(clock*.14+i*.2)*2.34,.087);
      scans[i].scale.x=.86+.12*Math.sin(clock*.7+i);
      seals[i].scale.setScalar(1+.035*Math.sin(clock*1.2+i));
    });
    for(let i=0;i<packets.count;i++){
      const progress=fract(clock*.16+i/packets.count),end=i%5,angle=i*2.4;
      const x=(i%2?1:-1)*(2.12-progress*1.9),y=Math.sin(angle)*1.75*(1-progress)+(end-2)*.12;
      p.set(x,y,-.3+progress*((end-2)*.28+.3)+Math.sin(progress*Math.PI)*.4);
      q.setFromEuler(new THREE.Euler(progress*.5,angle*.1+progress*.8,Math.sin(angle)*.3));
      scale.setScalar(Math.sin(progress*Math.PI)*(.5+fract(i*.31)*.5));matrix.compose(p,q,scale);packets.setMatrixAt(i,matrix);
    }
    packets.instanceMatrix.needsUpdate=true;
  }
  update();return {root,update};
}
