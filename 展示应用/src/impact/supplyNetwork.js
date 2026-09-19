import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {supplyRegions} from './content.js';

// A single conceptual network: the three known business roles remain connected.
// Architecture and transport are visual metaphors, not a model of actual sites.
export function createSupplyNetwork(quality){
  const root=new THREE.Group();root.name='three-region-supply-network';
  const d=modelDetail('cambodia',quality),moving=[],hits=[],anchors=[];
  const navy=new THREE.MeshStandardMaterial({color:'#14375a',metalness:.42,roughness:.42});
  const steel=new THREE.MeshStandardMaterial({color:'#92afbf',metalness:.72,roughness:.34});
  const light=new THREE.MeshStandardMaterial({color:'#d1dce0',metalness:.3,roughness:.4});
  const dark=new THREE.MeshStandardMaterial({color:'#091c2c',metalness:.5,roughness:.4});
  const blue=new THREE.MeshStandardMaterial({color:'#416e8b',metalness:.38,roughness:.4});
  const gold=new THREE.MeshStandardMaterial({color:'#b39a72',metalness:.64,roughness:.42});
  const glow=new THREE.MeshBasicMaterial({color:new THREE.Color('#a4dff7').multiplyScalar(1.6)});
  const warm=new THREE.MeshBasicMaterial({color:new THREE.Color('#e2bd83').multiplyScalar(1.5)});
  const box=(p,w,h,z,x,y,dz,m=steel)=>{const o=new THREE.Mesh(Math.min(w,h,z)>.24?new RoundedBoxGeometry(w,h,z,2,Math.min(.06,w/12,h/12,z/12)):new THREE.BoxGeometry(w,h,z),m);o.position.set(x,y,dz);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
  const cylinder=(p,r,h,x,y,z,m=steel)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,d.segment(24)),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
  const beam=(p,a,b,width=.13,m=steel)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),o=new THREE.Mesh(new THREE.CylinderGeometry(width,width,start.distanceTo(end),8),m);o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());p.add(o);return o;};
  const group=(p,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
  const frame=(p,x,z,width,height)=>{
    for(const side of [-1,1])box(p,.25,height,.28,x+side*width/2,height/2,z,steel);
    box(p,width+.3,.28,.35,x,height,z,steel);box(p,width,.035,.045,x,height-.22,z+.2,glow);
  };
  const road=box(root,110,.22,46,0,-.3,0,dark);road.receiveShadow=true;
  for(const z of [-15,14]){box(root,98,.024,.10,0,-.17,z,glow);for(let i=-45;i<46;i+=3)box(root,1.3,.025,.06,i,-.165,z+1.4,light);}
  for(let i=-45;i<48;i+=3)box(root,.035,.025,26,i,-.165,-.8,navy);
  const positions={china:[-27,0,-3],cambodia:[0,0,-4],usa:[27,0,-3]};
  const hubs=Object.fromEntries(supplyRegions.map(region=>{
    const g=group(root,...positions[region.id]);g.userData.locationId=region.id;
    const platform=box(g,22,.32,18,0,.02,0,navy);
    const pick=box(g,22,13,18,0,6.5,0,new THREE.MeshBasicMaterial({visible:false}));pick.userData.locationId=region.id;hits.push(pick);
    anchors.push({id:region.id,point:new THREE.Vector3(positions[region.id][0],13,positions[region.id][2])});
    for(const side of [-1,1])box(g,.07,.035,18,side*10.8,.205,0,warm);
    return [region.id,g];
  }));
  // China: an open atelier, material library and elevated sample studies.
  const china=hubs.china;
  for(const z of [-7,-2,3,7])frame(china,0,z,19,10.4);
  for(const x of [-9,9])box(china,.16,.25,15,x,10.4,0,steel);
  for(let col=0;col<8;col++)for(let row=0;row<4;row++){
    box(china,1.35,1.5,.65,-6.4+col*1.84,2+row*1.8,-7.2,[blue,light,gold,navy][(col+row)%4]);
  }
  for(const x of [-5,3.8]){
    box(china,6,.25,4,x,2.1,.5,light);for(const side of [-1,1])box(china,.16,2,3,x+side*2.6,1.05,.5,steel);
    for(let i=0;i<4;i++){cylinder(china,.25,.9+(i%2)*.4,x-1.3+i*.85,2.8,.3,[navy,blue,gold,light][i]);}
  }
  const study=group(china,0,5.7,1);const rings=[];
  for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.25,.035,8,d.segment(64)),i===1?warm:glow);r.rotation.set(.4+i*.45,.1,.3);study.add(r);rings.push(r);}
  moving.push(t=>rings.forEach((r,i)=>r.rotation.y=t*(.07+i*.018)));
  // Cambodia: a long manufacturing hall with repeated gantries, moving work,
  // robot cells, inspection, racking and an outbound transfer lane.
  const plant=hubs.cambodia;
  for(const z of [-7,-3,1,5,8]){
    frame(plant,0,z,21,12);
    for(let i=-9;i<9;i+=3)beam(plant,[i,12,z],[i+1.5,13.3,z],.075);
    beam(plant,[-10.5,13.3,z],[10.5,13.3,z],.1);
  }
  for(const x of [-10.5,10.5])box(plant,.25,.25,16,x,12.05,.5,steel);
  const belt=box(plant,4,.45,17,-4.2,1.6,.5,navy);
  for(const z of [-6,-2,2,6])for(const x of [-5.8,-2.6])box(plant,.14,1.5,.18,x,.85,z,steel);
  for(const x of [-6.1,-2.3])box(plant,.09,.19,17,x,2.05,.5,steel);
  for(let i=0;i<29;i++){const r=cylinder(plant,.13,3.5,-4.2,1.9,-7.2+i*.56,steel);r.rotation.z=Math.PI/2;}
  for(let i=0;i<6;i++){
    const part=box(plant,1.5,.75,1.25,-4.2,2.4,0,i%2?light:blue);
    moving.push(t=>part.position.z=-7.2+((t*.06+i/6)%1)*15.5);
  }
  for(const z of [-4,3]){
    const robot=group(plant,.2,.2,z);cylinder(robot,.85,.65,0,.35,0,navy);
    cylinder(robot,.32,2.8,0,1.8,0,gold);const arm=group(robot,0,3,0);
    beam(arm,[0,0,0],[-2,1.6,0],.25,steel);cylinder(arm,.38,.45,-2,1.6,0,navy);
    beam(arm,[-2,1.6,0],[-3.4,.6,0],.18,gold);box(arm,.7,.5,.8,-3.4,.3,0,steel);
    moving.push(t=>arm.rotation.y=Math.sin(t*.45+z)*.38);
  }
  for(const z of [-6,-1,4])for(let row=0;row<4;row++){
    box(plant,6.5,.16,2,6,1.5+row*2,z,steel);
    for(let col=0;col<3;col++)box(plant,1.55,1.55,1.5,3.9+col*2.1,2.3+row*2,z,(col+row)%2?blue:light);
  }
  for(const x of [2.7,9.4])for(const z of [-7,5])box(plant,.14,9,.15,x,4.65,z,steel);
  const inspection=group(plant,.3,.3,7.1);
  cylinder(inspection,1.5,.3,0,.25,0,navy);cylinder(inspection,.7,1.4,0,1.1,0,steel);cylinder(inspection,.24,.9,0,2.25,0,blue);
  for(let i=0;i<2;i++){const hoop=new THREE.Mesh(new THREE.TorusGeometry(2.45,.07,10,d.segment(64),Math.PI*1.55),steel);hoop.position.set(0,2.6,-i*.32);hoop.rotation.z=-Math.PI*.275;inspection.add(hoop);}
  const scan=new THREE.Mesh(new THREE.CylinderGeometry(.76,.76,.028,32),new THREE.MeshBasicMaterial({color:'#aee5fa',transparent:true,opacity:.5,depthWrite:false}));scan.position.set(0,2,0);inspection.add(scan);moving.push(t=>scan.position.y=1.8+Math.sin(t*.85)*.8);
  // US: an open market pavilion. The product displays and meeting area represent
  // market/customer collaboration, not a claimed US manufacturing site.
  const market=hubs.usa;
  for(const z of [-7,-1,6])frame(market,0,z,19,10.5);
  for(let i=0;i<5;i++){
    const x=-7.6+i*3.8;box(market,2.8,5,.45,x,4.5,-7,blue);box(market,2.9,.045,.05,x,7.1,-6.7,warm);
    cylinder(market,1.1,1.7,x,1.1,-2,navy);cylinder(market,.35,1.6,x,2.7,-2,[light,gold,blue][i%3]);
  }
  box(market,9,.25,3.8,0,1.7,4,steel);
  for(const x of [-3,0,3])for(const z of [1,6.8]){box(market,1.3,1.2,1.2,x,.8,z,navy);box(market,1.3,1.5,.18,x,1.5,z+(z>3?.6:-.6),blue);}
  // A shared transfer spine makes creation → making → markets legible in space.
  const flows=[];
  for(const z of [-12,10]){
    const path=new THREE.CatmullRomCurve3([[-40,.4,z],[-25,.4,z],[0,.4,z],[25,.4,z],[40,.4,z]].map(p=>new THREE.Vector3(...p)));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(160)),new THREE.LineBasicMaterial({color:'#ceaf7a',transparent:true,opacity:.55}));root.add(line);
    for(let i=0;i<12;i++){
      const carrier=group(root);box(carrier,1.5,.3,.9,0,.15,0,navy);box(carrier,1.1,.65,.7,0,.62,0,i%3?light:gold);box(carrier,1.2,.045,.045,0,.13,.48,glow);
      flows.push({carrier,path,offset:i/12});
    }
  }
  // Long-distance routes rise from the campus into the global backdrop.
  for(const x of [-27,0,27]){
    const path=new THREE.CatmullRomCurve3([[x,.5,-12],[x,8,-22],[x*.45,24,-35],[0,31,-42]].map(p=>new THREE.Vector3(...p)));
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints(100)),new THREE.LineBasicMaterial({color:'#719dbd',transparent:true,opacity:.42})));
    for(let i=0;i<3;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),warm);root.add(dot);moving.push(t=>dot.position.copy(path.getPoint((t*.08+i/3)%1)));}
  }
  const raycaster=new THREE.Raycaster();
  return {root,
    update(time,mix){root.visible=mix>.001;root.position.set(0,-37+mix*24,20);moving.forEach(fn=>fn(time));flows.forEach(({carrier,path,offset})=>carrier.position.copy(path.getPoint((time*.045+offset)%1)));},
    pose(region,chapter){
      const x=positions[region]?.[0]??0;
      if(!region)return {position:new THREE.Vector3(24,9,91),target:new THREE.Vector3(0,-5,12)};
      const stage=['manufacturing','quality','delivery'].indexOf(chapter);
      if(stage>=0){const offset=[-5,0,6][stage];return {position:new THREE.Vector3(x+offset+(stage===0?-9:9),-1,50),target:new THREE.Vector3(x+offset,-7,stage===1?24:18)};}
      return {position:new THREE.Vector3(x+(region==='china'?-8:10),0,57),target:new THREE.Vector3(x,-7,16)};
    },
    project(camera,width,height){root.updateWorldMatrix(true,true);return anchors.map(a=>{const p=root.localToWorld(a.point.clone()).project(camera);return {id:a.id,x:(p.x+1)*width/2,y:(1-p.y)*height/2,visible:p.z<1&&Math.abs(p.x)<.94&&p.y>-.6&&p.y<.82};});},
    pick(x,y,width,height,camera){raycaster.setFromCamera(new THREE.Vector2(x/width*2-1,1-y/height*2),camera);return raycaster.intersectObjects(hits,false)[0]?.object.userData.locationId;},
  };
}
