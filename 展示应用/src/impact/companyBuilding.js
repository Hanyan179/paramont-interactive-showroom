import * as THREE from 'three';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import mark from '../media/brand-mountain.json';

// Photo-based architectural interpretation, not a measured survey. The rounded
// corners, continuous floor bands, glazing, fins and roof sign follow the five
// company photos supplied on 2026-09-14. Hidden elevations are simplified.
const FLOORS=11,STOREY=3.35,WIDTH=43,DEPTH=24,RADIUS=9.5,FACADE_BOW=1.2;
function plan(width,depth,radius){
  const x=width/2,z=depth/2,r=radius,s=new THREE.Shape();
  s.moveTo(-x+r,-z);s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);
  s.lineTo(x,z-r);s.quadraticCurveTo(x,z,x-r,z);s.lineTo(-x+r,z);
  s.quadraticCurveTo(-x,z,-x,z-r);s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);
  return s;
}
// The photographed facade has broad, continuous turns rather than small
// rounded-box corners. Keep glass, fascia and mullions on the same bowed plan.
function buildingPlan(width=WIDTH,depth=DEPTH,radius=RADIUS){
  const x=width/2,z=depth/2,r=radius,k=.5522847498,s=new THREE.Shape();
  s.moveTo(-x+r,-z);
  s.bezierCurveTo(-x+r+4,-z,-5,-z-FACADE_BOW,0,-z-FACADE_BOW);
  s.bezierCurveTo(5,-z-FACADE_BOW,x-r-4,-z,x-r,-z);
  s.bezierCurveTo(x-r+k*r,-z,x,-z+r-k*r,x,-z+r);
  s.lineTo(x,z-r);
  s.bezierCurveTo(x,z-r+k*r,x-r+k*r,z,x-r,z);
  s.lineTo(-x+r,z);
  s.bezierCurveTo(-x+r-k*r,z,-x,z-r+k*r,-x,z-r);
  s.lineTo(-x,-z+r);
  s.bezierCurveTo(-x,-z+r-k*r,-x+r-k*r,-z,-x+r,-z);
  s.closePath();return s;
}
function extrudePlan(shape,height,segments){
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelThickness:.065,bevelSize:.13,bevelSegments:4,curveSegments:segments,steps:1});
  geometry.rotateX(-Math.PI/2);return geometry;
}
function slabGeometry(width,depth,radius,height,segments){
  return extrudePlan(plan(width,depth,radius),height,segments);
}
function instanced(geometry,material,placements,root){
  const mesh=new THREE.InstancedMesh(geometry,material,placements.length),dummy=new THREE.Object3D();
  placements.forEach((p,i)=>{dummy.position.set(...p.position);dummy.rotation.set(...(p.rotation||[0,0,0]));dummy.scale.set(...(p.scale||[1,1,1]));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
  mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
}
function roofSign(root){
  const shape=new THREE.Shape();
  mark.outer.forEach(([x,y],i)=>i?shape.lineTo(x,-y):shape.moveTo(x,-y));shape.closePath();
  const hole=new THREE.Path();mark.cutout.forEach(([x,y],i)=>i?hole.lineTo(x,-y):hole.moveTo(x,-y));hole.closePath();shape.holes.push(hole);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:20,bevelEnabled:true,bevelThickness:2,bevelSize:1,bevelSegments:2});geometry.translate(-89.4,174.4,0);geometry.scale(.009,.009,.009);
  const mountainMark=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#bacbd4',metalness:.68,roughness:.3,emissive:'#7892a4',emissiveIntensity:.1}));mountainMark.position.set(-9.6,FLOORS*STOREY+.38,DEPTH/2+FACADE_BOW+.1);root.add(mountainMark);
  // The real roof lettering visible in the supplied photographs.
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=384;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1536,384);ctx.font='600 270px "PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#d6e1e5';ctx.fillText('高山集团',768,193);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const name=new THREE.Mesh(new THREE.PlaneGeometry(12,3),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false}));name.position.set(.4,FLOORS*STOREY+1.16,DEPTH/2+FACADE_BOW+.2);root.add(name);
}
function landscape(root,detail){
  const stone=new THREE.MeshStandardMaterial({color:'#172c36',roughness:.82,metalness:.15});
  const plaza=new THREE.Mesh(slabGeometry(76,48,6,.3,detail.segment(20)),stone);plaza.position.y=-.5;plaza.receiveShadow=true;root.add(plaza);
  const seams=[];
  for(let x=-30;x<=30;x+=3)seams.push(new THREE.Vector3(x,-.14,10),new THREE.Vector3(x,-.14,20));
  for(let z=11;z<21;z+=2.5)seams.push(new THREE.Vector3(-29,-.14,z),new THREE.Vector3(29,-.14,z));
  root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seams),new THREE.LineBasicMaterial({color:'#667b82',transparent:true,opacity:.2})));
  const pots=[],foliage=[],trunks=[];
  const leafMaterial=new THREE.MeshStandardMaterial({color:'#224745',roughness:.95,metalness:0});
  // Planting frames the photographed architecture without replicating neighbours.
  [-1,1].forEach(side=>{
    pots.push({position:[side*27,.35,4],scale:[3.6,1.0,24]});
    for(let i=0;i<15;i++)foliage.push({position:[side*27,1.0,16-i*1.7],scale:[1.65,.9,1.2]});
    for(let i=0;i<3;i++){
      const x=side*(28+(i%2)*1.1),z=11-i*9;
      trunks.push({position:[x,2.9,z],scale:[.13,5.8,.13]});
      for(let j=0;j<18;j++){
        const a=j*2.4,r=.65+(j%4)*.4;
        foliage.push({position:[x+Math.cos(a)*r,5.6+Math.sin(j*1.8)*1.1,z+Math.sin(a)*r],scale:[.9+(j%3)*.18,.85,1.0]});
      }
    }
  });
  instanced(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#263b41',roughness:.7}),pots,root);
  instanced(new THREE.SphereGeometry(1,detail.segment(12),detail.segment(8)),leafMaterial,foliage,root);
  instanced(new THREE.CylinderGeometry(.7,1,1,8),new THREE.MeshStandardMaterial({color:'#334346',roughness:.9}),trunks,root);
  const bollards=[],lights=[];
  for(const x of [-16,-8,8,16]){bollards.push({position:[x,.7,18],scale:[.18,1.6,.18]});lights.push({position:[x,1.49,18],scale:[.2,.05,.2]});}
  instanced(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#334a53',metalness:.5,roughness:.4}),bollards,root);
  instanced(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:new THREE.Color('#b5ceca').multiplyScalar(1.3)}),lights,root);
}
export function companyBuilding(quality){
  const root=new THREE.Group();root.name='paramont-photographic-building';
  const detail=modelDetail('monument',quality);
  const cladding=new THREE.MeshPhysicalMaterial({color:'#a9b8bf',metalness:.42,roughness:.38,clearcoat:.35,envMapIntensity:.7});
  const frames=new THREE.MeshStandardMaterial({color:'#75919f',metalness:.72,roughness:.3});
  const slab=extrudePlan(buildingPlan(WIDTH+1.4,DEPTH+1.4,RADIUS+.7),.4,detail.segment(36));
  instanced(slab,cladding,Array.from({length:FLOORS+1},(_,i)=>({position:[0,i*STOREY,0]})),root);
  const outline=buildingPlan().getSpacedPoints(128),vertices=[],colors=[],uvs=[],indices=[],mullions=[],horizontal=[],openWindows=[],louvers=[];
  const palette=['#395365','#496578','#567386','#304d60','#60798a','#405f73','#4c6577'].map(c=>new THREE.Color(c));
  const frontAt=x=>{
    for(let i=0;i<outline.length-1;i++){
      const a=outline[i],b=outline[i+1];
      if(a.y<0&&b.y<0&&x>=a.x&&x<=b.x){
        const t=(x-a.x)/(b.x-a.x);return {z:-(a.y+(b.y-a.y)*t),angle:-Math.atan2(a.y-b.y,b.x-a.x)};
      }
    }
    return {z:DEPTH/2,angle:0};
  };
  for(let floor=0;floor<FLOORS;floor++){
    const y=floor*STOREY+.4;
    for(let panel=0;panel<outline.length-1;panel++){
      const a=outline[panel],b=outline[panel+1],x=(a.x+b.x)/2,z=-(a.y+b.y)/2,width=a.distanceTo(b),angle=Math.atan2(a.y-b.y,b.x-a.x),color=palette[(panel*7+floor*11+Math.floor(panel/3))%palette.length];
      const offset=vertices.length/3;
      vertices.push(a.x,y,-a.y,b.x,y,-b.y,b.x,y+STOREY-.4,-b.y,a.x,y+STOREY-.4,-a.y);
      for(let i=0;i<4;i++)colors.push(color.r,color.g,color.b);
      uvs.push(0,0,1,0,1,1,0,1);indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
      mullions.push({position:[a.x,y+(STOREY-.4)/2,-a.y],scale:[.047,STOREY-.4,.047]});
      horizontal.push({position:[x,y+STOREY-.42,z],scale:[width,.045,.065],rotation:[0,-angle,0]});
      if(z>DEPTH/2-.15&&panel%4===1&&floor>0&&floor<FLOORS-1){
        openWindows.push({position:[x+.26,y+1.85,z+.22],rotation:[0,.5,0],scale:[.36,1.35,.05]});
      }
    }
    for(const x of [-7.5,5.8])for(let i=0;i<14;i++){
      if((floor+Math.floor(x))%3===0)continue;
      const px=x+i*.16,face=frontAt(px);louvers.push({position:[px,y+1.5,face.z+.12],rotation:[0,face.angle,0],scale:[.055,2.85,.15]});
    }
  }
  const facade=new THREE.BufferGeometry();facade.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));facade.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));facade.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));facade.setIndex(indices);facade.computeVertexNormals();
  const glass=new THREE.MeshPhysicalMaterial({vertexColors:true,metalness:.35,roughness:.22,clearcoat:1,clearcoatRoughness:.14,envMapIntensity:1.05,emissive:'#1b3244',emissiveIntensity:.24,side:THREE.DoubleSide});
  const windows=new THREE.Mesh(facade,glass);windows.name='rounded-curtain-wall';windows.castShadow=true;windows.receiveShadow=true;root.add(windows);
  instanced(new THREE.BoxGeometry(1,1,1),frames,mullions,root);
  instanced(new THREE.BoxGeometry(1,1,1),frames,horizontal,root);
  instanced(new THREE.BoxGeometry(1,1,1),new THREE.MeshPhysicalMaterial({color:'#41657a',metalness:.76,roughness:.16,clearcoat:1}),openWindows,root);
  instanced(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#293c48',metalness:.45,roughness:.4}),louvers,root);
  // Recessed entrance and a thin curved canopy echo the photographed lobby.
  const doors=[],doorFrames=[];
  for(let i=0;i<4;i++){
    const x=(i-1.5)*1.35;doors.push({position:[x,1.6,DEPTH/2+FACADE_BOW+.06],scale:[1.3,2.8,.08]});doorFrames.push({position:[x-.66,1.6,DEPTH/2+FACADE_BOW+.15],scale:[.07,2.8,.09]});
  }
  instanced(new THREE.BoxGeometry(1,1,1),new THREE.MeshPhysicalMaterial({color:'#516877',metalness:.65,roughness:.12}),doors,root);
  instanced(new THREE.BoxGeometry(1,1,1),frames,doorFrames,root);
  const canopy=new THREE.Mesh(slabGeometry(8.2,3.3,1.1,.14,detail.segment(18)),cladding);canopy.position.set(0,3.5,DEPTH/2+FACADE_BOW+.95);root.add(canopy);
  const roofFrames=[];
  for(const x of [-10,-5,0,5,10]){
    roofFrames.push({position:[x,FLOORS*STOREY+1.1,-2.8],scale:[.13,2,.13]},{position:[x,FLOORS*STOREY+1.1,-5.8],scale:[.13,2,.13]},{position:[x,FLOORS*STOREY+2.1,-4.3],scale:[.13,.13,3.2]});
  }
  instanced(new THREE.BoxGeometry(1,1,1),cladding,roofFrames,root);
  const roofCore=new THREE.Mesh(slabGeometry(10,5,1,.9,detail.segment(12)),new THREE.MeshStandardMaterial({color:'#577181',roughness:.56,metalness:.35}));roofCore.position.set(0,FLOORS*STOREY+.1,-2);root.add(roofCore);
  roofSign(root);landscape(root,detail);applySurfaceFinish(THREE,root,detail);
  root.userData.photoBased=true;root.userData.floors=FLOORS;return root;
}
export function companyWorld(_manager,quality){
  const root=new THREE.Group(),building=companyBuilding(quality);root.add(building);root.position.set(10,-18.5,0);
  const groundLight=new THREE.PointLight('#b3d8e8',25,40,2);groundLight.position.set(10,-10,15);root.add(groundLight);
  return {root,update({time,camera,target,aspect=16/9}){
    const angle=.82+Math.sin(time*.055)*.10,distance=aspect<1.5?97:89,push=Math.sin(time*.075)*1.8;
    target.set(-6,1.5+Math.sin(time*.05)*.7,0);
    camera.set(target.x+Math.sin(angle)*(distance-push),-8.2+Math.sin(time*.07)*1.2,Math.cos(angle)*(distance-push));
  }};
}
