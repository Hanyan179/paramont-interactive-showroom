import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createCreativeKit,createStudioAccessories} from './creativeKit.js';
import {createIntelligenceGlobe} from './intelligenceGlobe.js';
import {proposalSample,researchRegions} from './intelligenceProposalsContent.js';

const damp=THREE.MathUtils.damp;
/** Three retained, independently inspectable candidates under one scene clock.
 * All are constructed once. Changing a candidate never fetches a new texture. */
export function createIntelligenceProposals(manager,quality){
  const root=new THREE.Group();root.name='intelligence-proposal-exhibit';root.userData.illustrative=true;
  const variants=['A','B','C'].map(id=>{const group=new THREE.Group();group.name=`intelligence-proposal-${id}`;root.add(group);return group;});
  const a=createCreativeKit(quality),b=createCreativeKit(quality),c=createCreativeKit(quality);
  variants[0].add(a.root);variants[1].add(b.root);variants[2].add(c.root);
  const globe=createIntelligenceGlobe(manager,quality,{research:true});variants[1].add(globe.root);
  const accessories=createStudioAccessories(quality);variants[2].add(accessories.root);
  const beaconMaterial=new THREE.MeshBasicMaterial({color:'#e0c496',transparent:true,opacity:.85});
  const beacons=researchRegions.map(({longitude,latitude},i)=>{
    const lat=latitude*Math.PI/180,lon=longitude*Math.PI/180;
    const normal=new THREE.Vector3(Math.cos(lat)*Math.sin(lon),Math.sin(lat),Math.cos(lat)*Math.cos(lon));
    const group=new THREE.Group();group.name=`research-region-${i}`;group.position.copy(normal).multiplyScalar(2.235);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);globe.earth.add(group);
    const core=new THREE.Mesh(new THREE.SphereGeometry(.035,16,12),beaconMaterial);group.add(core);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.009,8,48),beaconMaterial);group.add(ring);
    return {group,ring};
  });
  // A single packet travelling back to a knowledge record means feedback,
  // rather than decorative satellites or claimed market activity.
  const feedback=new THREE.Group();feedback.name='review-question-return';root.add(feedback);
  const bead=new THREE.Mesh(new THREE.SphereGeometry(.045,16,12),new THREE.MeshStandardMaterial({color:'#f0dbb8',emissive:'#b09158',emissiveIntensity:1.1}));feedback.add(bead);
  const record=new THREE.Group();record.name='sample-review-record';record.position.set(1.8,2.4,-1.5);feedback.add(record);
  record.add(new THREE.Mesh(new RoundedBoxGeometry(.48,.61,.045,2,.015),new THREE.MeshPhysicalMaterial({color:'#b8c9cb',roughness:.6,metalness:.12})));
  const ink=new THREE.MeshBasicMaterial({color:'#45667b'});
  for(let i=0;i<4;i++){
    const line=new THREE.Mesh(new THREE.BoxGeometry(i===0?.20:.31,.017,.008),ink);line.position.set(i===0?-.055:0,.18-i*.105,.026);record.add(line);
  }
  let phase=0,open=.28,reveal=0,composition=0,angle=-.3,regionAngle=-.26,lastScheme='A';
  function update({time=0,selection={},dt=1/60,reduced=false,immediate=false}={}){
    const {scheme='A',step=null,variant=0,region=1}=selection;
    const sampled=proposalSample(time,step,reduced);phase=sampled.phase;
    const snap=immediate||reduced,clock=sampled.clock;
    const to=(value,target,speed=3.2)=>snap?target:damp(value,target,speed,Math.min(.1,Math.max(0,dt)));
    const openTarget=phase===0?.27:phase===1?.98:.12;
    open=to(open,openTarget);reveal=to(reveal,phase===0?0:1);composition=to(composition,phase===0?0:1);
    // Tiny product attitude changes reveal thickness without spinning the stage.
    angle=to(angle,-.30+(!reduced?Math.sin(clock*.17)*.055:0));
    variants.forEach((group,i)=>{group.visible=scheme===['A','B','C'][i];});
    a.root.position.set(0,-.98,0);a.root.rotation.set(.38,angle,-.025);a.root.scale.setScalar(.90);
    a.update({open,activity:phase===1?Math.sin(Math.PI*Math.min(1,sampled.local/8))**2:0,time:clock,variant,reduced});
    globe.root.position.set(-1.5*reveal,.30+.30*reveal,-.65*reveal);globe.root.scale.setScalar(1-.45*reveal);
    const selectedRegion=researchRegions[region]||researchRegions[1];
    regionAngle=to(regionAngle,-selectedRegion.longitude*Math.PI/180,2.4);
    globe.update({time:clock,reduced});globe.earth.rotation.y=regionAngle;globe.earth.rotation.z=0;
    beacons.forEach(({group,ring},i)=>{group.visible=i===region;ring.scale.setScalar(1+Math.sin(clock*.8)*.18);});
    b.root.visible=reveal>.025;b.root.scale.setScalar(.02+.71*reveal);b.root.position.set(.85+(.7*(1-reveal)),-.83,.65);b.root.rotation.set(.42,-.36,-.035);
    b.update({open,activity:phase===1?.4:0,time:clock,variant,reduced});
    c.root.position.set(-.62,-.65,-.45);c.root.rotation.set(.43,angle,-.025);c.root.scale.setScalar(.76);
    c.update({open:phase===0?.34:.92,activity:0,time:clock,variant,reduced});
    accessories.root.rotation.set(.36,-.2,0);
    accessories.book.position.set(1.8+(1-composition)*.65,-.76,.63+(1-composition)*1.1);
    accessories.book.rotation.y=-.15+composition*.24;accessories.book.scale.setScalar(variant?.86:1);
    accessories.cup.position.set(1.92+(1-composition)*.7,-.65,-1.26);accessories.cup.rotation.y=.2;
    accessories.cup.scale.setScalar(.72+variant*.18);
    // Variant alters the useful contents: compact carry tools vs a shared cup.
    accessories.cup.visible=Boolean(variant)||phase===0;
    const feedbackVisible=phase===2;feedback.visible=feedbackVisible;
    if(feedbackVisible){
      const t=(clock*.14)%1;bead.position.set(THREE.MathUtils.lerp(.5,1.8,t),THREE.MathUtils.lerp(.5,2.4,t)+Math.sin(t*Math.PI)*.4,THREE.MathUtils.lerp(.6,-1.5,t));
      record.rotation.set(.05,-.28,0);
    }
    lastScheme=scheme;
    root.userData.phase=phase;root.userData.scheme=scheme;
    root.userData.motion={open,reveal,composition,regionAngle};
  }
  update({immediate:true});
  return {root,update,isMoving(selection={}){
    const sample=proposalSample(0,selection.step??phase),target=sample.phase===0?.27:sample.phase===1?.98:.12;
    return Math.abs(open-target)>.001||Math.abs(reveal-(sample.phase===0?0:1))>.001||lastScheme!==(selection.scheme||'A');
  }};
}
