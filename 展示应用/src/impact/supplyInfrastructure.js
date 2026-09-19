import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {V,block,flow} from './depthGeometry.js';
import {craftMaterials,mesh,cylinder,tube,floor,robot} from './supplyCraft.js';
import {createProductionCanopy,createNetworkApron} from './supplyArchitecture.js';

// A spatial explanation of an end-to-end system, not a measured site or capacity model.
export function createSupplyInfrastructure(quality){
  const root=new THREE.Group(),m=craftMaterials(quality,'cambodia'),motions=[],routes=[],sections=[];
  m.navy.color.set('#061a2b');m.navy.roughness=.32;m.stone.color.set('#7696a7');
  m.navy.envMapIntensity=.26;m.navy.clearcoat=.12;
  m.silver.color.set('#7eacbf');m.silver.roughness=.28;
  m.blue.color.set('#16476a');m.blue.emissive.set('#083351');m.blue.emissiveIntensity=.45;m.blue.roughness=.17;m.blue.clearcoat=.9;
  m.light.color.set('#ffcc83').multiplyScalar(1.8);m.ice.color.set('#a5def1').multiplyScalar(1.25);
  floor(root,m,[91,.4,124],[10,-1,-18]);
  const ground=root.children.at(-1);ground.material.color.set('#020e1a');ground.material.metalness=.06;ground.material.roughness=.84;ground.material.roughnessMap=null;
  const apron=createNetworkApron(root);motions.push(t=>apron.update(t));
  let sectionStart=root.children.length;
  function finishSection(id){
    const children=root.children.slice(sectionStart),group=new THREE.Group(),copies=new Map();group.userData.zone=id;root.add(group);group.add(...children);
    group.traverse(object=>{if(object.material&&!object.material.isShaderMaterial){if(!copies.has(object.material))copies.set(object.material,object.material.clone());object.material=copies.get(object.material);object.material.transparent=true;}});
    sections.push({id,group,weight:1,materials:[...copies.values()].map(material=>({material,opacity:material.opacity}))});sectionStart=root.children.length;
  }
  function instances(geometry,material,poses){
    const object=new THREE.InstancedMesh(geometry,material,poses.length),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();
    poses.forEach((p,i)=>{rotation.setFromAxisAngle(V(0,1,0),p.angle||0);matrix.compose(V(...p.position),rotation,V(...(p.scale||[1,1,1])));object.setMatrixAt(i,matrix);});
    object.castShadow=true;object.receiveShadow=true;root.add(object);return object;
  }
  function building(x,z,w,d,h,levels=3){
    mesh(root,new RoundedBoxGeometry(w,h,d,5,.65),m.blue,[x,h/2,z]);
    const windows=[],frames=[],lights=[],fins=[];
    for(let y=0;y<levels;y++)for(let col=0;col<Math.floor(w/1.55);col++){
      const px=x-w/2+.9+col*1.55,py=1.2+y*(h-1)/levels;
      for(const side of [-1,1]){
        windows.push({position:[px,py,z+side*(d/2+.045)],scale:[1.36,(h-1)/levels-.3,.06]});
        if((y+col)%4===0)lights.push({position:[px,py+.48,z+side*(d/2+.095)],scale:[1.1,.027,.025]});
      }
    }
    for(let col=0;col<Math.floor(w/1.55);col++)for(const side of [-1,1])fins.push({position:[x-w/2+.9+col*1.55, h/2,z+side*(d/2+.12)],scale:[.055,h-.3,.24]});
    for(let col=0;col<Math.floor(d/1.55);col++)for(const side of [-1,1])fins.push({position:[x+side*(w/2+.12),h/2,z-d/2+.9+col*1.55],scale:[.24,h-.3,.055]});
    for(let y=0;y<levels;y++)for(let col=0;col<Math.floor(d/1.55);col++){
      const pz=z-d/2+.9+col*1.55,py=1.2+y*(h-1)/levels;
      for(const side of [-1,1]){
        windows.push({position:[x+side*(w/2+.045),py,pz],scale:[.06,(h-1)/levels-.3,1.36]});
        if((y+col)%4===1)lights.push({position:[x+side*(w/2+.095),py+.48,pz],scale:[.025,.027,1.1]});
      }
    }
    for(let y=0;y<=levels;y++)frames.push({position:[x,.4+y*(h-.4)/levels,z],scale:[w+.12,.11,d+.12]});
    instances(new THREE.BoxGeometry(1,1,1),m.blue,windows);instances(new THREE.BoxGeometry(1,1,1),m.navy,frames);instances(new THREE.BoxGeometry(1,1,1),m.silver,fins);instances(new THREE.BoxGeometry(1,1,1),m.light,lights);
    mesh(root,new RoundedBoxGeometry(w+.55,.3,d+.55,3,.14),m.navy,[x,h+.12,z]);
    for(const side of [-1,1])block(root,m.gold,[w+.25,.035,.045],[x,h+.25,z+side*(d/2+.13)]);
    for(let i=0;i<Math.floor(w/2.1);i++){
      const panel=block(root,m.blue,[1.8,.12,d*.55],[x-w/2+1.3+i*2.1,h+.4,z]);panel.rotation.z=-.08;
      block(root,m.gold,[.03,.03,d*.53],[panel.position.x-.85,h+.46,z]);
    }
  }
  // Quality administration and sample review within the Cambodia manufacturing environment.
  building(7,20,15,11,14,6);building(22,19,9,9,8,4);building(-5,23,7,9,6,3);
  block(root,m.smoke,[16,4.8,.06],[7,3,25.57]);
  for(let i=0;i<5;i++){
    block(root,m.stone,[1.8,.18,2.8],[1+i*2.8,1.45,27.6]);
    block(root,m.navy,[.18,1.4,2],[1+i*2.8,.7,27.6]);
    mesh(root,new THREE.IcosahedronGeometry(.5,1),i%2?m.gold:m.silver,[1+i*2.8,2.05,27.6]);
  }
  finishSection('quality');
  // The main manufacturing hall has an open side and a split roof for the camera to enter.
  const canopy=createProductionCanopy(root,m);motions.push(t=>canopy.update(t));
  // Suspended services and galleries give the tall volume a believable operating scale.
  const galleryPosts=[];
  for(const x of [-2.8,26.2]){
    block(root,m.navy,[1.6,.26,41],[x,5.8,-11]);
    for(const side of [-1,1])block(root,m.gold,[.055,.07,41],[x+side*.75,7,-11]);
    for(let i=0;i<12;i++)for(const side of [-1,1])galleryPosts.push({position:[x+side*.75,6.4,9-i*3.65],scale:[.07,1.3,.07]});
    for(let i=0;i<6;i++)galleryPosts.push({position:[x,2.85,8-i*7.6],scale:[.15,5.7,.2]});
  }
  instances(new THREE.BoxGeometry(1,1,1),m.silver,galleryPosts);
  for(const x of [5,17]){
    block(root,m.navy,[.55,.6,40],[x,9,-11]);block(root,m.ice,[.16,.045,39],[x,8.68,-11]);
    for(let i=0;i<6;i++)block(root,m.silver,[.035,12,.035],[x,15,8-i*7.6]);
  }
  const productProfiles=[[0,0],[.3,0],[.4,.1],[.4,.9],[.32,1.1],[.2,1.16],[.2,1.3],[0,1.3]].map(p=>new THREE.Vector2(...p));
  const bodyGeometry=new THREE.LatheGeometry(productProfiles,32),capGeometry=new THREE.CylinderGeometry(.24,.24,.32,24);
  for(let lane=0;lane<4;lane++){
    const x=1.9+lane*5.7;
    block(root,m.navy,[3.7,1,39],[x,.65,-11]);block(root,m.silver,[3.7,.16,39],[x,1.23,-11]);
    for(const side of [-1,1]){block(root,m.gold,[.035,.04,39],[x+side*1.77,1.36,-11]);block(root,m.ice,[.025,.04,37],[x+side*1.86,.7,-11]);}
    const bodies=new THREE.InstancedMesh(bodyGeometry,lane%2?m.blue:m.stone,25),caps=new THREE.InstancedMesh(capGeometry,m.gold,25);root.add(bodies,caps);
    const matrix=new THREE.Matrix4();motions.push(t=>{for(let i=0;i<25;i++){const z=7-((t*.9+i*1.53+lane*.4)%37.5);matrix.makeTranslation(x,1.32,z);bodies.setMatrixAt(i,matrix);matrix.makeTranslation(x,2.75,z);caps.setMatrixAt(i,matrix);}bodies.instanceMatrix.needsUpdate=true;caps.instanceMatrix.needsUpdate=true;});
    for(let station=0;station<3;station++){
      const z=2-station*11;
      const animateRobot=robot(root,m,[x-2.2,0,z],false);
      motions.push(time=>animateRobot(time+lane*2.2+station*3.1));
      block(root,m.navy,[1.25,2.1,1.8],[x+2.1,1.05,z]);block(root,m.smoke,[.06,1.6,1.5],[x+1.45,1.1,z]);
    }
  }
  // Quality is a legible operation in the same continuous flow.
  const scanSheets=[];
  for(let lane=0;lane<4;lane++){
    const x=1.9+lane*5.7,z=-20;
    for(const side of [-1,1])block(root,m.navy,[.28,4,.7],[x+side*1.6,3,z]);
    block(root,m.silver,[3.5,.25,.7],[x,5.05,z]);block(root,m.ice,[2.9,.025,.04],[x,4.9,z+.36]);
    const scan=block(root,m.smoke,[3,.02,2.1],[x,3,z]);scanSheets.push(scan);
  }
  motions.push(t=>scanSheets.forEach((s,i)=>s.position.y=3+Math.sin(t*1.3+i*.5)*.8));
  finishSection('production');
  // Warehousing and dispatch form a substantial background district, not a product pedestal.
  building(9,-49,32,17,9,2);building(33,-39,11,20,6,2);
  for(let i=0;i<6;i++){
    const x=-3+i*4.9;
    block(root,m.navy,[3.7,3.8,.15],[x,2,-40.38]);
    for(let k=0;k<8;k++)block(root,m.silver,[3.55,.026,.03],[x,.45+k*.43,-40.25]);
    block(root,m.light,[3.75,.04,.04],[x,4.05,-40.2]);
  }
  const containers=[],corrugations=[];
  for(let row=0;row<3;row++)for(let col=0;col<5;col++)for(let level=0;level<(col%3===0?2:1);level++){
    const x=30+col*3.1,y=1.2+level*2.45,z=-57+row*7;
    containers.push({position:[x,y,z],scale:[2.7,2.3,6.1]});
    for(let rib=0;rib<9;rib++)corrugations.push({position:[x-1.38,y,z-2.7+rib*.67],scale:[.035,2.15,.04]});
  }
  instances(new THREE.BoxGeometry(1,1,1),m.navy,containers);instances(new THREE.BoxGeometry(1,1,1),m.silver,corrugations);
  // A gantry traverses the dispatch apron; its movement is conceptual, not live telemetry.
  for(const x of [28,47]){block(root,m.silver,[.42,12,1],[x,6,-48]);block(root,m.gold,[.065,11,.08],[x,6,-47.45]);}
  block(root,m.silver,[20,.5,1.1],[37.5,12,-48]);
  const hoist=new THREE.Group();hoist.position.set(37,10,-48);root.add(hoist);block(hoist,m.gold,[2.5,.45,1.5],[0,0,0]);
  for(const x of [-.9,.9])block(hoist,m.silver,[.025,4,.025],[x,-2,0]);block(hoist,m.navy,[2.5,.3,2.6],[0,-4,0]);
  motions.push(t=>hoist.position.x=37.5+Math.sin(t*.22)*6);
  finishSection('dispatch');
  // One illuminated artery ties research, manufacture, inspection and delivery together.
  const spine=[[-9,0,30],[-9,0,12],[-9,0,-18],[0,0,-35],[25,0,-35],[47,0,-35],[50,0,-57]];
  for(let lane=0;lane<3;lane++)routes.push(flow(root,spine.map(p=>[p[0]+lane*.24,.15,p[2]]),{color:lane===1?'#f3cd8c':'#519bbb',radius:lane===1?.12:.032,speed:.07,offset:lane*.05}));
  for(const x of [-14,52])block(root,m.navy,[5,.035,105],[x,-.82,-14]);
  const road=new THREE.CatmullRomCurve3([V(-14,-.4,34),V(-14,-.4,-61),V(53,-.4,-61),V(53,-.4,34)],true,'catmullrom',.01);
  const trucks=new THREE.InstancedMesh(new THREE.BoxGeometry(1.8,1.25,4),m.silver,9),cabs=new THREE.InstancedMesh(new THREE.BoxGeometry(1.8,1.5,1.25),m.navy,9),lights=new THREE.InstancedMesh(new THREE.BoxGeometry(.28,.12,.05),m.light,18);root.add(trucks,cabs,lights);
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),p=new THREE.Vector3(),tangent=new THREE.Vector3();
  motions.push(t=>{for(let i=0;i<9;i++){road.getPoint((t*.013+i/9)%1,p);road.getTangent((t*.013+i/9)%1,tangent);rotation.setFromUnitVectors(V(0,0,1),tangent);matrix.compose(p.clone().add(V(0,1,0)),rotation,V(1,1,1));trucks.setMatrixAt(i,matrix);matrix.compose(p.clone().addScaledVector(tangent,2.55).add(V(0,1.1,0)),rotation,V(1,1,1));cabs.setMatrixAt(i,matrix);for(let side=0;side<2;side++){const head=V(side?.57:-.57,.88,3.2).applyQuaternion(rotation).add(p);matrix.compose(head,rotation,V(1,1,1));lights.setMatrixAt(i*2+side,matrix);}}trucks.instanceMatrix.needsUpdate=true;cabs.instanceMatrix.needsUpdate=true;lights.instanceMatrix.needsUpdate=true;});
  const tyre=new THREE.MeshStandardMaterial({color:'#03070d',roughness:.82}),wheels=new THREE.InstancedMesh(new THREE.CylinderGeometry(.45,.45,.22,16).rotateZ(Math.PI/2),tyre,54),windows=new THREE.InstancedMesh(new THREE.BoxGeometry(1.45,.58,.05),m.blue,9),strips=new THREE.InstancedMesh(new THREE.BoxGeometry(.025,.055,3.7),m.gold,18);root.add(wheels,windows,strips);
  motions.push(t=>{
    for(let i=0;i<9;i++){
      road.getPoint((t*.013+i/9)%1,p);road.getTangent((t*.013+i/9)%1,tangent);rotation.setFromUnitVectors(V(0,0,1),tangent);
      for(let axle=0;axle<3;axle++)for(let side=0;side<2;side++){
        const wheel=V(side?.97:-.97,.05,[-1.35,-.4,2.65][axle]).applyQuaternion(rotation).add(p);matrix.compose(wheel,rotation,V(1,1,1));wheels.setMatrixAt(i*6+axle*2+side,matrix);
      }
      matrix.compose(V(0,1.43,3.19).applyQuaternion(rotation).add(p),rotation,V(1,1,1));windows.setMatrixAt(i,matrix);
      for(let side=0;side<2;side++){matrix.compose(V(side?.91:-.91,1.32,0).applyQuaternion(rotation).add(p),rotation,V(1,1,1));strips.setMatrixAt(i*2+side,matrix);}
    }wheels.instanceMatrix.needsUpdate=true;windows.instanceMatrix.needsUpdate=true;strips.instanceMatrix.needsUpdate=true;
  });
  // Narrow pools of light describe the grounds without covering the models in effects.
  for(let i=0;i<12;i++)for(const x of [-12,50]){const z=28-i*7.8;block(root,m.navy,[.11,5,.11],[x,1.7,z]);block(root,m.light,[.65,.05,.18],[x,4.22,z]);}
  root.userData.qualityModel='cambodia';
  return {root,update(time,selection,mix=1,dt=1/60){
    const k=dt===0?1:1-Math.exp(-Math.min(dt,.05)*6);
    sections.forEach(section=>{
      section.weight=THREE.MathUtils.lerp(section.weight,!selection||selection===section.id?1:0,k);
      if(section.weight<.001)section.weight=0;section.group.visible=section.weight>0;
      section.materials.forEach(({material,opacity})=>material.opacity=opacity*section.weight*mix);
    });
    motions.forEach(fn=>fn(time));routes.forEach(route=>route.update(time));
  },prepare(){sections.forEach(section=>{section.group.visible=true;section.materials.forEach(({material,opacity})=>material.opacity=opacity);});}};
}
