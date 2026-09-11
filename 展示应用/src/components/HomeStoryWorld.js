import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { visibleBounds } from './rendering/sceneFraming.js';
import { nearestAngle } from './rendering/inspectionPose.js';

// A continuous, abstract brand sculpture. Its growth is editorial, not a scale model.
export function createHomeStoryWorld() {
  const detail=modelDetail('story');
  const root=new THREE.Group(), sculpture=new THREE.Group();root.add(sculpture);
  const silver=new THREE.MeshPhysicalMaterial({color:'#bdc6d1',metalness:.82,roughness:.24,clearcoat:.28,envMapIntensity:.5});
  const navy=new THREE.MeshPhysicalMaterial({color:'#12376b',metalness:.12,roughness:.28,clearcoat:.8,clearcoatRoughness:.18,envMapIntensity:.28});
  const pearl=new THREE.MeshPhysicalMaterial({color:'#ede4d5',metalness:.12,roughness:.3,clearcoat:.4,envMapIntensity:.4});
  const brass=new THREE.MeshPhysicalMaterial({color:'#ba8c51',metalness:.78,roughness:.27,clearcoat:.25,envMapIntensity:.45});
  const teal=new THREE.MeshPhysicalMaterial({color:'#307582',metalness:.18,roughness:.3,clearcoat:.65,envMapIntensity:.3});
  const glass=new THREE.MeshPhysicalMaterial({color:'#819fae',metalness:.15,roughness:.18,transparent:true,opacity:.36,depthWrite:false,side:THREE.DoubleSide});
  const glow=new THREE.MeshBasicMaterial({color:new THREE.Color('#9bbbd7').multiplyScalar(1.7)});
  const dark=new THREE.MeshStandardMaterial({color:'#081a33',metalness:.18,roughness:.4});
  const shape=new THREE.Shape();shape.moveTo(-1.65,0);shape.bezierCurveTo(-1.05,.65,-.8,3.55,0,4.05);shape.bezierCurveTo(.74,3.7,.98,1.12,1.65,0);shape.lineTo(1.28,0);shape.bezierCurveTo(.66,1.05,.5,3.08,0,3.43);shape.bezierCurveTo(-.46,3.08,-.7,.62,-1.28,0);shape.closePath();
  const archGeometry=new THREE.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelThickness:.022,bevelSize:.023,bevelSegments:detail.segment(2,'bevel'),steps:1,curveSegments:detail.segment(24)});archGeometry.translate(0,0,-.0325);
  const fins=[];
  for(let i=0;i<54;i++) {const mesh=new THREE.Mesh(archGeometry,i%9===0?brass:i%5===0?pearl:i%3===0?silver:navy);mesh.castShadow=true;mesh.receiveShadow=true;sculpture.add(mesh);fins.push(mesh);}
  const base=new THREE.Mesh(new RoundedBoxGeometry(9,.24,6,detail.segment(4,'rounded'),.12),navy);base.position.y=-.23;base.castShadow=true;base.receiveShadow=true;sculpture.add(base);
  const underside=new THREE.Mesh(new RoundedBoxGeometry(8.3,.3,5.4,detail.segment(4,'rounded'),.13),dark);underside.position.y=-.5;sculpture.add(underside);
  const rings=[];
  for(let i=0;i<5;i++){const group=new THREE.Group();const shell=new THREE.Mesh(new THREE.TorusGeometry(2.9+i*.08,.035,detail.segment(8,'radial'),detail.segment(160),Math.PI*1.83),i%2?navy:silver);shell.rotation.x=Math.PI/2;group.add(shell);const light=new THREE.Mesh(new THREE.SphereGeometry(.057,12,8),glow);light.position.set(2.9+i*.08,0,0);group.add(light);sculpture.add(group);rings.push(group);}
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,.04,detail.segment(96)),glass);sculpture.add(lens);
  const satellites=[],connections=[],travelers=[];
  const nodes=[[-3.9,.4,1.9],[.2,1.1,-2.7],[3.7,.45,1.5],[.1,.1,3.4],[3.6,.2,-2.1],[0,.4,-.2]];
  for(let i=0;i<6;i++) {
    const group=new THREE.Group();const pedestal=new THREE.Mesh(new RoundedBoxGeometry(1.45,.18,1.2,detail.segment(3,'rounded'),.07),navy);pedestal.castShadow=true;group.add(pedestal);
    const inset=new THREE.Mesh(new RoundedBoxGeometry(1.2,.018,.96,detail.segment(2,'rounded'),.06),[navy,brass,teal,silver,pearl,navy][i]);inset.position.y=.11;group.add(inset);
    for(let j=0;j<5;j++){const fin=new THREE.Mesh(archGeometry,j===2?brass:j%2?navy:silver);fin.scale.set(.27,.22+j*.017,.6);fin.position.set(0,.14,(j-2)*.15);group.add(fin);}
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.58,.58,.07,detail.segment(48)),dark);foot.position.y=-.12;group.add(foot);
    group.name=`company-exhibit-${i}`;sculpture.add(group);satellites.push(group);
    const path=new THREE.CatmullRomCurve3(Array.from({length:33},(_,j)=>new THREE.Vector3(j/32,Math.sin(j/32*Math.PI)*.24,0)));
    const lineGeometry=new THREE.TubeGeometry(path,detail.segment(48),.014,detail.segment(6,'radial'),false);
    const line=new THREE.Mesh(lineGeometry,new THREE.MeshBasicMaterial({color:'#42668e',transparent:true,opacity:.68}));sculpture.add(line);connections.push(line);
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.048,12,8),glow);sculpture.add(dot);travelers.push(dot);
  }
  const targetPos=new THREE.Vector3(),targetScale=new THREE.Vector3(),targetEuler=new THREE.Euler(),targetQuaternion=new THREE.Quaternion();
  const points=Array.from({length:6},()=>new THREE.Vector3());
  let growth=0,mode=-1,lastSelection='',settled=false;
  const cameraPosition=new THREE.Vector3(0,6.2,18),cameraLook=new THREE.Vector3(0,1,0);
  function update({chapter,selection,mix,reveal=1,dt,time,reduced,aspect,yaw,tilt}) {
    time*=detail.motionScale;
    root.visible=mix<.998&&reveal>.002;if(!root.visible)return {position:cameraPosition,look:cameraLook,changed:false};
    const key=`${chapter}:${selection.capability}:${selection.company}:${selection.year}:${selection.detail}`;
    const changed=lastSelection!==key;lastSelection=key;if(changed)settled=false;
    const k=reduced?1:1-Math.exp(-dt*3.2),cap=selection.capability,network=chapter===2||chapter===1&&cap===0,development=chapter===1&&cap===1,quality=chapter===1&&cap===2,insight=chapter===1&&cap===3,timeline=chapter===3;
    growth=THREE.MathUtils.lerp(growth,timeline?(selection.year+1)/6:1,k);
    root.position.set(aspect<1.5?3.75:4.1,.65,-mix*7);root.scale.setScalar((aspect<1.5?.89:1)*(1-mix)*reveal);
    const targetRotation=nearestAngle(sculpture.rotation.y,yaw);
    let error=Math.abs(sculpture.rotation.y-targetRotation);
    sculpture.rotation.y=THREE.MathUtils.lerp(sculpture.rotation.y,targetRotation,k);sculpture.rotation.x=tilt;
    fins.forEach((fin,i)=>{
      const wing=Math.floor(i/18),u=(i%18)/17,a=(i/54)*Math.PI*2;
      let x=(wing-1)*2.08,y=0,z=(u-.5)*2.4,rx=0,ry=(wing-1)*.13,rz=(wing-1)*-.12,sx=.81,sy=(wing===1?1.27:.89)*(1-.19*Math.abs(u-.5)),sz=1;
      if(network){x=Math.sin(a)*1.38;z=Math.cos(a)*1.38;y=.15;ry=-a;sy=.46;sx=.4;}
      if(development){x=Math.sin(wing*2.1)*.22;y=u*3.7;z=(wing-1)*.68;rx=-Math.PI/2;ry=0;rz=(u-.5)*.36;sx=.75;sy=.69;sz=1.4;}
      if(quality){x=Math.sin(a)*.45;y=.05;z=Math.cos(a)*.45;ry=-a;sx=.65;sy=1.08;}
      if(insight){x=(i%9-4)*.7;y=Math.floor(i/9)*.25;z=(Math.floor(i/9)-2.5)*.65;sy=.28+.12*(Math.sin(i*.6)+1);sx=.2;ry=.12;}
      if(timeline){const revealed=THREE.MathUtils.clamp(growth*54-i,0,1);sy*=Math.max(.001,revealed);sx*=.72+.28*growth;z*=.58+.42*growth;y=-.08*(1-revealed);}
      if(chapter===1&&selection.detail!==null){const count=quality||development?5:4,bucket=Math.min(count-1,Math.floor(i/54*count)),isFocus=bucket===selection.detail;y+=isFocus?.35:0;sy*=isFocus?1.08:.93;}
      targetPos.set(x,y,z);targetScale.set(sx,sy,sz);targetEuler.set(rx,ry,rz);targetQuaternion.setFromEuler(targetEuler);
      error+=fin.position.distanceToSquared(targetPos)+fin.scale.distanceToSquared(targetScale);
      fin.position.lerp(targetPos,k);fin.scale.lerp(targetScale,k);fin.quaternion.slerp(targetQuaternion,k);fin.visible=fin.scale.y>.006;
    });
    base.scale.lerp(targetScale.set(timeline?.62+.38*growth:network?1.06:1,1,timeline?.62+.38*growth:1),k);underside.scale.copy(base.scale);
    const showRings=quality||timeline; rings.forEach((ring,i)=>{
      const amount=showRings?(timeline?THREE.MathUtils.clamp(growth*6-i,0,1):1):0;
      ring.scale.lerp(targetScale.setScalar(Math.max(.001,amount)),k);ring.visible=ring.scale.x>.01;
      ring.position.y=THREE.MathUtils.lerp(ring.position.y,quality?.35+i*.83:.12+i*.06,k);
      ring.rotation.z=quality&&!reduced?Math.sin(time*.00015+i)*.035:0;
      ring.rotation.y=reduced?i*.5:time*.00008+i*.5;
      if(quality&&selection.detail!==null)ring.children[0].material=i===selection.detail?pearl:navy;else ring.children[0].material=i%2?navy:silver;
    });
    lens.visible=quality;lens.position.y=reduced?2:(Math.sin(time*.00065)*.5+.5)*3.4+.3;
    const nodeCount=chapter===0?3:network?4:timeline?6:quality||development?5:4;
    satellites.forEach((sat,i)=>{
      let pos=nodes[i],scale=network?1:0;
      if(chapter===0){pos=[(i-1)*2.25,1.6+(i===1?1.8:0),i===1?-1.6:2.1];}
      if(network){const a=i/4*Math.PI*2+.3;pos=[Math.sin(a)*3.65,.25,Math.cos(a)*2.8];}
      if(timeline){const a=i/6*Math.PI*1.6-2.4;pos=[Math.sin(a)*3.6,.05,Math.cos(a)*2.4];scale=THREE.MathUtils.clamp(growth*6-i,0,1)*.57;}
      if(development){pos=[(i-2)*1.5,.12,2.7];scale=.43;}
      if(quality){const a=i/5*Math.PI*2+.6;pos=[Math.sin(a)*3.45,.2+i*.5,Math.cos(a)*3.05];scale=.4;}
      if(insight){pos=[(i-1.5)*1.9,.15,2.7];scale=.5;}
      const selected=network?(chapter===2?selection.company:selection.detail)===i:selection.detail===i;
      targetPos.set(...pos);if(selected&&network)targetPos.y+=.7;
      error+=sat.position.distanceToSquared(targetPos);sat.position.lerp(targetPos,k);sat.scale.lerp(targetScale.setScalar(Math.max(.001,i<nodeCount?scale:0)),k);sat.visible=sat.scale.x>.015;
      // Each company exhibit faces outward. Bringing a node to the foreground
      // must also present its face, rather than the edge of the same sculpture.
      const facing=nearestAngle(sat.rotation.y,network?i/4*Math.PI*2+.3:0);
      error+=Math.abs(facing-sat.rotation.y);sat.rotation.y=THREE.MathUtils.lerp(sat.rotation.y,facing,k);
      sat.children[1].material=selected?brass:[navy,brass,teal,silver,pearl,navy][i];
      points[i].copy(sat.position);points[i].y+=network?1.6:timeline?.85:quality?.5:development||insight?.7:.3;
      const line=connections[i],show=network||timeline;line.visible=show&&sat.visible;
      line.material.opacity=selected?.95:.55;
      line.position.y=.28;line.rotation.y=-Math.atan2(sat.position.z,sat.position.x);line.scale.set(Math.hypot(sat.position.x,sat.position.z),1+sat.position.y*2,1);
      const t=reduced?.5:(time*.00017+i*.17)%1;travelers[i].visible=line.visible;travelers[i].position.set(sat.position.x*t,.28+(sat.position.y-.28)*t+Math.sin(Math.PI*t)*.65,sat.position.z*t);
    });
    const focused=chapter===1&&selection.detail!==null||chapter===2;
    cameraPosition.lerp(targetPos.set(focused?.35:0,quality?5.2:network?6.9:6.2,Math.max(aspect<1.5?20:18,27/aspect)),k);
    cameraLook.lerp(targetPos.set(focused?.3:0,1.15,0),k);
    settled=error<.005;mode=chapter;
    return {position:cameraPosition,look:cameraLook,changed:changed||!settled,growth};
  }
  function pick(raycaster,chapter,selection) {
    const candidates=[...fins.filter(f=>f.visible),...satellites.filter(g=>g.visible).flatMap(g=>g.children)].filter(o=>o.isMesh);
    const hit=raycaster.intersectObjects(candidates,false)[0];if(!hit)return null;
    const fin=fins.indexOf(hit.object),sat=satellites.indexOf(hit.object.parent);
    if(sat>=0)return sat;
    if(chapter===0)return Math.floor(fin/18);
    if(chapter===3)return Math.floor(fin/9);
    if(chapter===2)return selection.company;
    const count=selection.capability===1||selection.capability===2?5:4;
    return Math.min(count-1,Math.floor(fin/54*count));
  }
  applySurfaceFinish(THREE,root,detail);root.userData.qualityModel='story';
  return {root,update,pick,bounds:()=>visibleBounds([root]),point:index=>points[index].clone().applyMatrix4(sculpture.matrixWorld),get mode(){return mode;}};
}
