import {getRenderQuality,modelDetail,modelIdOf} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import {visibleBounds} from './rendering/sceneFraming.js';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A single, continuous architectural set. Camera destinations are in world space;
// changing chapter never replaces the canvas or uses a room image as a backdrop.
import { getLocationProfile } from './locationProfiles';
import { addLocationScenery } from './LocationScenery';
import { addLocationArchitecture } from './LocationArchitecture';
import {regionLayouts,regionPoint} from './regionLayouts';

export function createCapabilityWorld(manager) {
  const root=new THREE.Group();root.name='continuous-capability-architecture';
  const white=new THREE.MeshPhysicalMaterial({color:'#9caebc',roughness:.44,metalness:.30,clearcoat:.32,clearcoatRoughness:.24});
  const stone=new THREE.MeshStandardMaterial({color:'#435b71',roughness:.66,metalness:.25});
  const silver=new THREE.MeshPhysicalMaterial({color:'#93adc2',metalness:.93,roughness:.25,clearcoat:.4});
  const navy=new THREE.MeshPhysicalMaterial({color:'#173d72',metalness:.15,roughness:.31,clearcoat:.6,envMapIntensity:.35});
  const dark=new THREE.MeshStandardMaterial({color:'#102b49',roughness:.43,metalness:.18});
  const glass=new THREE.MeshPhysicalMaterial({color:'#b5d8ec',metalness:.05,roughness:.12,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
  const glow=new THREE.MeshBasicMaterial({color:new THREE.Color('#bfdfff').multiplyScalar(2.2)});
  const warm=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffe5bc').multiplyScalar(1.35)});
  const renderQuality=getRenderQuality(),details=Object.fromEntries(['china','usa','cambodia'].map(id=>[id,modelDetail(id,renderQuality)]));
  const detailFor=parent=>details[modelIdOf(parent,'china')];
  const box=(parent,w,h,d,x,y,z,mat=white,r=.07)=>{
    const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,detailFor(parent).segment(3,'rounded'),Math.min(r,w/3,h/3,d/3)),mat);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  };
  const cylinder=(parent,r,h,x,y,z,mat=white)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,detailFor(parent).segment(64)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const tube=(parent,points,r,mat=glow)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,detailFor(parent).segment(96),r,detailFor(parent).segment(8,'radial'),false),mat);parent.add(m);return curve;};
  const image=(parent,file,w,h,x,y,z)=>{const t=new THREE.TextureLoader(manager).load('/media/generated/'+file);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;box(parent,w+.12,h+.12,.10,x,y,z,dark);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.62,metalness:.04}));m.position.set(x,y,z+.057);parent.add(m);return m;};
  const groups=[];
  const interactiveGroup=(group,id,chapter)=>group.traverse(o=>{if(o.isMesh){o.userData.exhibit=id;o.userData.chapter=chapter;}});
  const architecture=addLocationArchitecture({root,box,cylinder,tube,materials:{white,stone,silver,navy,dark,glass,glow,warm}});
  const path=new THREE.CatmullRomCurve3([[-17,.32,4.6],[-8,.32,4.6],[0,.32,4.6],[8,.32,4.6],[17,.32,4.6]].map(p=>new THREE.Vector3(...p)));
  for(const center of [-12,0,12]) {
    const g=new THREE.Group();g.position.x=center;root.add(g);groups.push(g);
    const light=new THREE.PointLight('#c7dfff',18,13,2);light.position.set(0,4.3,.2);g.add(light);
  }
  const profiles=Object.fromEntries(['china','usa','cambodia'].map(id=>[id,groups.map(parent=>{const group=new THREE.Group();group.name=`${id}-interior`;group.userData.locationId=id;group.userData.qualityModel=id;parent.add(group);return group;})]));
  // CHINA: MATERIAL & SAMPLE ATELIER.
  const making=profiles.china[0];
  for(let row=0;row<3;row++){
    box(making,5.5,.12,.68,-1.65,1.05+row*1.1,-3.35,silver);
    box(making,5.2,.028,.025,-1.65,1.14+row*1.1,-3.03,glow,.01);
    for(let i=0;i<8;i++){
      const mat=new THREE.MeshPhysicalMaterial({color:['#eee2cb','#c4d5dc','#738fa6','#24577c','#d8c2a6','#aab9c4','#d9dde1','#50718b'][(i+row)%8],roughness:.48,metalness:.12});
      const swatch=box(making,.42,.68,.16,-3.95+i*.65,1.45+row*1.1,-3.3,mat,.055);interactiveGroup(swatch,'materials','manufacturing');
    }
  }
  image(making,'a1-markers.png',1.8,1.35,3.32,3.25,-4.03);
  image(making,'a2-sketchbook.png',1.8,1.35,3.32,1.75,-4.03);
  box(making,5.3,.23,2.35,-.3,1.45,1.3,white,.10);
  for(const x of [-2.4,1.8])box(making,.15,1.2,1.9,x,.75,1.3,silver);
  box(making,4.8,.025,.055,-.3,1.28,2.46,warm,.01);
  const sampleTurntable=new THREE.Group();sampleTurntable.position.set(-.5,1.6,1.5);making.add(sampleTurntable);
  cylinder(sampleTurntable,.82,.08,0,.04,0,navy);
  const sampleColors=['#d7dce2','#9dbacb','#597f9b','#173f64','#ccb891'];
  for(let i=0;i<5;i++){
    const mat=new THREE.MeshPhysicalMaterial({color:sampleColors[i],metalness:.3,roughness:.32,clearcoat:.6});
    const marker=cylinder(sampleTurntable,.075,1.1,(i-2)*.25,.60,0,mat);
    cylinder(sampleTurntable,.081,.26,(i-2)*.25,1.13,0,silver);
    marker.rotation.z=(i-2)*.08;
  }
  for(let i=0;i<5;i++)box(making,.95,.03,1.15,1.25,1.6+i*.04,1.3,i===4?navy:white,.01);
  // A conceptual process cabinet with genuine dimensional rails and tool carriage.
  box(making,1.9,1.05,1.65,3.25,.84,.1,navy);
  box(making,2.1,.13,1.85,3.25,1.44,.1,silver);
  for(const x of [2.4,4.1])box(making,.10,1.65,.10,x,2.3,-.45,silver);
  box(making,1.8,.13,.14,3.25,3.1,-.45,white);
  const tool=box(making,.35,.6,.36,3.25,2.66,-.45,white);interactiveGroup(tool,'process','manufacturing');interactiveGroup(sampleTurntable,'samples','manufacturing');
  box(making,1.85,1.55,.028,3.25,2.3,.8,glass,.01);
  // QUALITY OBSERVATORY. Annular inspection pavilion, open towards the camera.
  const quality=profiles.cambodia[1];
  const platform=cylinder(quality,2.1,.25,-1.3,.43,.8,navy);
  const inspection=new THREE.Group();inspection.position.set(-1.3,.58,.8);quality.add(inspection);
  cylinder(inspection,.95,1.12,0,.56,0,silver);
  cylinder(inspection,1.08,.12,0,1.16,0,white);
  const sample=cylinder(inspection,.16,.9,0,1.69,0,navy);
  cylinder(inspection,.17,.23,0,2.14,0,silver);
  for(let i=0;i<3;i++){
    const arc=new THREE.Mesh(new THREE.TorusGeometry(2.1,.065,details.cambodia.segment(12,'radial'),details.cambodia.segment(96),Math.PI*1.38),silver);arc.position.set(-1.3,2.95,.8-i*.20);arc.rotation.z=-Math.PI*.19;quality.add(arc);
  }
  tube(quality,[[-3.35,.58,.8],[-3.35,2.85,.8],[-2.5,4.55,.8],[-.2,4.55,.8],[.75,2.85,.8]],.018,glow);
  const scan=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.018,details.cambodia.segment(64)),new THREE.MeshBasicMaterial({color:'#a5d9ed',transparent:true,opacity:.25,depthWrite:false}));scan.position.set(0,1.4,0);inspection.add(scan);
  interactiveGroup(inspection,'inspection','quality');
  const standardsScreen=image(quality,'a1-markers.png',2.15,1.62,3,3.05,-3.99);interactiveGroup(standardsScreen,'standards','quality');
  box(quality,2.3,.12,1.2,3,1.5,-2.95,white);
  box(quality,.15,1.2,.85,2.2,.84,-2.95,silver);box(quality,.15,1.2,.85,3.8,.84,-2.95,silver);
  for(let i=0;i<5;i++){
    cylinder(quality,.16,.1,1.65+i*.66,1.64,-2.8,i%2?navy:silver);
    box(quality,.07,.018,.8,1.65+i*.66,1.58,-2.8,glow,.004);
  }
  // DELIVERY EXCHANGE. Packing table, modular bays and a moving transfer line.
  const delivery=profiles.cambodia[2];
  for(let col=0;col<4;col++)for(let row=0;row<3;row++){
    box(delivery,1.6,.09,1.05,-2.85+col*1.9,.9+row*1.05,-3.34,silver);
    for(let side=0;side<2;side++)box(delivery,.5,.62,.63,-3.2+col*1.9+side*.7,1.26+row*1.05,-3.34,(col+row)%2?stone:navy,.04);
  }
  for(let col=0;col<5;col++)box(delivery,.055,3.8,1.1,-3.78+col*1.9,2.05,-3.3,silver,.015);
  box(delivery,4.3,.22,2.1,-1.45,1.42,1.1,white);
  for(const x of [-3.2,.3])box(delivery,.16,1.2,1.7,x,.73,1.1,silver);
  const carton=new THREE.Group();carton.position.set(-1.5,1.56,1.1);delivery.add(carton);
  box(carton,1.05,.68,.9,0,.34,0,stone);
  box(carton,.03,.02,.89,0,.69,0,navy,.006);
  const flap=box(carton,1.04,.035,.5,0,.8,-.45,stone,.014);flap.rotation.x=-.7;
  box(delivery,1.8,.2,4.5,3,1.28,-.4,navy);
  for(let i=0;i<18;i++){const roller=new THREE.Mesh(new THREE.CylinderGeometry(.057,.057,1.55,details.cambodia.segment(12)),silver);roller.rotation.z=Math.PI/2;roller.position.set(3,1.42,-2.45+i*.24);delivery.add(roller);}
  for(const z of [-2.3,1.5])box(delivery,1.7,1.1,.09,3,.7,z,silver);
  const movingPackage=box(delivery,.72,.5,.66,3,1.74,0,white);interactiveGroup(carton,'packaging','delivery');interactiveGroup(movingPackage,'collaboration','delivery');
  const regionalScenes=addLocationScenery({profiles,box,cylinder,tube,image,interactiveGroup,materials:{white,stone,silver,navy,dark,glass,glow,warm}});
  for(const [id,rooms] of Object.entries(profiles))rooms.forEach((room,i)=>{root.attach(room);room.position.fromArray(regionLayouts[id][i].position);room.rotation.y=regionLayouts[id][i].yaw;});
  // Raycasting in Three does not ignore an invisible ancestor. Keep an explicit
  // per-region hit list so objects in the other two interiors cannot intercept taps.
  const regionHits=Object.fromEntries(Object.entries(profiles).map(([id,rooms])=>{const hits=[];rooms.forEach(room=>room.traverse(o=>{if(o.isMesh&&o.userData.exhibit)hits.push(o);}));return [id,hits];}));
  const travelers=[];for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),glow);root.add(m);travelers.push(m);}
  const focusRing=new THREE.Mesh(new THREE.TorusGeometry(.3,.012,8,48),glow);focusRing.rotation.x=-Math.PI/2;root.add(focusRing);
  const unfinishedMaterials=new Set();root.traverse(o=>{if(o.material)unfinishedMaterials.add(o.material);});
  for(const [id,rooms] of Object.entries(profiles)) {
    const copies=new Map();for(const room of rooms)room.traverse(o=>{if(o.material){const m=o.material;if(!copies.has(m))copies.set(m,m.clone());o.material=copies.get(m);}});
    for(const room of rooms)applySurfaceFinish(THREE,room,details[id]);
  }
  const originals=new Set();
  const sectionMaterials=groups.map((group,index)=>{
    const copies=new Map();Object.values(profiles).forEach(rooms=>rooms[index].traverse(object=>{if(object.material){const original=object.material;originals.add(original);if(!copies.has(original)){const copy=original.clone();copy.userData.originalColour=copy.color?.clone();copy.userData.originalEnv=copy.envMapIntensity;copies.set(original,copy);}object.material=copies.get(original);}}));return [...copies.values()];
  });
  // Original shared materials are also used by the base. Any room-only originals
  // are disposed separately because they are no longer part of the scene graph.
  const retained=new Set();root.traverse(o=>{if(o.material)retained.add(o.material);});
  for(const material of new Set([...originals,...unfinishedMaterials]))if(!retained.has(material))material.dispose();
  root.visible=false;
  const poses={
    overview:{position:[24,20,45],look:[8,1.5,0]},
    manufacturing:{position:[-4,7.8,17],look:[-9,1.85,0]},
    quality:{position:[8,7.2,17],look:[3,2,0]},
    delivery:{position:[20,7.8,17],look:[15,1.85,0]},
  };
  const cameraPosition=new THREE.Vector3(...poses.overview.position),cameraLook=new THREE.Vector3(...poses.overview.look);
  const desiredPosition=new THREE.Vector3(),desiredLook=new THREE.Vector3();
  const baseColour=new THREE.Color('#e4e2dd'),roomColour=new THREE.Color('#d8d9d7');
  let previousChapter='overview',previousFocus=null,activeLocation='china',orbitX=0,orbitY=0;
  return {
    root,
    bounds(chapter){const index=['manufacturing','quality','delivery'].indexOf(chapter);return visibleBounds(index>=0&&profiles[activeLocation]?[profiles[activeLocation][index]]:[root]);},
    get occluders(){return architecture.occluders[activeLocation]||[];},
    get interactive(){return regionHits[activeLocation]||[];},
    drag(dx,dy){orbitX=THREE.MathUtils.clamp(orbitX+dx*.007,-2.6,2.6);orbitY=THREE.MathUtils.clamp(orbitY+dy*.005,-1.1,1.8);},
    update({locationId='china',chapter='overview',focus,mix,dt,time,reduced,aspect}){
      const profile=getLocationProfile(locationId),locationChanged=activeLocation!==profile.id;
      activeLocation=profile.id;time*=details[activeLocation]?.motionScale??1;
      architecture.select(activeLocation);
      if(!regionLayouts[activeLocation]){root.visible=false;return {position:cameraPosition,look:cameraLook,colour:baseColour};}
      groups.forEach((g,i)=>g.position.fromArray(regionLayouts[activeLocation][i].position));
      for(const [id,rooms] of Object.entries(profiles))for(const room of rooms)room.visible=id===activeLocation;
      root.userData.locationId=activeLocation;
      root.visible=mix>.003;
      if(!root.visible)return {position:cameraPosition,look:cameraLook,colour:baseColour};
      const regionalOverview={china:{position:[24,24,48],look:[7,1.5,0]},cambodia:{position:[31,22,45],look:[8,1.8,0]},usa:{position:[23,22,49],look:[7,1.6,0]}};
      const pose=chapter==='overview'?regionalOverview[activeLocation]:(poses[chapter]||regionalOverview[activeLocation]);
      if(locationChanged||previousChapter!==chapter||previousFocus!==focus){orbitX=0;orbitY=0;previousChapter=chapter;previousFocus=focus;}
      desiredPosition.fromArray(pose.position);desiredLook.fromArray(pose.look);
      if(chapter!=='overview'){const idx=['manufacturing','quality','delivery'].indexOf(chapter),center=(idx-1)*12;const mapped=regionPoint(activeLocation,[center,0,0]);desiredPosition.add(new THREE.Vector3(mapped[0]-center,mapped[1],mapped[2]));desiredLook.add(new THREE.Vector3(mapped[0]-center,mapped[1],mapped[2]));}
      const stop=profile.stops[chapter]?.find(s=>s.id===focus);
      if(stop&&chapter!=='overview'){
        const p=regionPoint(activeLocation,stop.point);desiredLook.set(p[0]+1.5,p[1]-.35,p[2]);
        desiredPosition.set(p[0]+6,p[1]+3.6,p[2]+13.5);
      }
      if(aspect<1.5)desiredPosition.z+=chapter==='overview'?8:3;
      desiredPosition.x+=orbitX;desiredPosition.y+=orbitY;
      const k=reduced?1:1-Math.exp(-dt*2.65);
      const selectedIndex=['manufacturing','quality','delivery'].indexOf(chapter);architecture.focus(selectedIndex,reduced?1:dt);
      sectionMaterials.forEach((materials,i)=>{const intensity=selectedIndex<0||i===selectedIndex?1:.23;for(const mat of materials){if(mat.color&&mat.userData.originalColour)mat.color.lerp(mat.userData.originalColour.clone().multiplyScalar(intensity),k);if(mat.envMapIntensity!==undefined)mat.envMapIntensity=mat.userData.originalEnv*intensity;}});
      cameraPosition.lerp(desiredPosition,k);cameraLook.lerp(desiredLook,k);
      root.position.set(0,-1.9-7*Math.pow(1-mix,2),-10*Math.pow(1-mix,2));
      root.scale.setScalar(.72+.28*mix);
      focusRing.visible=!!stop&&chapter!=='overview';
      if(focusRing.visible)focusRing.position.fromArray(regionPoint(activeLocation,[stop.point[0],.32,stop.point[2]]));
      // Only the active section animates; the others remain architectural context.
      if(!reduced){
        if(activeLocation==='china'&&chapter==='manufacturing'){sampleTurntable.rotation.y=Math.sin(time*.00016)*.22;tool.position.x=3.25+Math.sin(time*.00045)*.45;}
        if(activeLocation==='cambodia'&&chapter==='quality'){scan.position.y=1.35+(Math.sin(time*.0012)+1)*.49;sample.rotation.y=time*.00015;}
        if(activeLocation==='cambodia'&&chapter==='delivery')movingPackage.position.z=-2.15+(time*.00035%1)*3.9;
        regionalScenes.update(activeLocation,chapter,time);
        if(chapter==='overview')travelers.forEach((m,i)=>m.position.copy(new THREE.Vector3(...regionPoint(activeLocation,path.getPointAt((time*.00002+i/3)%1).toArray()))));
      }
      travelers.forEach(m=>m.visible=chapter==='overview');
      return {position:cameraPosition,look:cameraLook,colour:baseColour.clone().lerp(roomColour,mix)};
    },
    worldPoint(point){return new THREE.Vector3(...regionPoint(activeLocation,point)).applyMatrix4(root.matrixWorld);},
  };
}
