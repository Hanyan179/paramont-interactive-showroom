import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {resolveQuality} from '../../共享组件/renderQuality.js';
import {createIntelligenceDirector,intelligenceCycle,intelligenceTiming} from '../src/impact/intelligenceDirector.js';
import {journeyFrame,stageStarts,stageFrames,intelligencePresentation} from '../src/impact/intelligenceTimeline.js';
import {intelligenceWorld} from '../src/impact/intelligenceWorld.js';
import {intelligenceStages} from '../src/impact/intelligenceContent.js';
import {proposalBrands} from '../src/impact/intelligenceBrands.js';
import {reportTexture} from '../src/impact/intelligenceSurfaces.js';
import {blinkAt} from '../src/impact/intelligencePresence.js';
const worldSource=readFileSync(new URL('../src/impact/worlds.js',import.meta.url),'utf8');
const {disposeTree}=await import(`data:text/javascript,${encodeURIComponent(worldSource.split('\n').find(line=>line.startsWith('export function disposeTree')))}`);
const near=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const advance=(d,seconds,options)=>{for(let i=0;i<Math.round(seconds/.05);i++)d.tick(.05,options);return d.snapshot();};
test('six authored stages cover 108 seconds and repeat deterministically',()=>{
 assert.equal(intelligenceTiming.cycle,108);
 stageStarts.slice(0,6).forEach((t,i)=>assert.equal(journeyFrame(t).stage,i));
 for(let t=0;t<324;t+=.25){const a=journeyFrame(t),b=journeyFrame(t+108);assert.deepEqual(a,b);assert.ok(a.progress>=0&&a.progress<1);}
});
test('all animation channels are finite at boundaries and invalid external time is safe',()=>{
 for(const t of [-108,0,18,34,50,70,90,108,Infinity,NaN])for(const v of Object.values(journeyFrame(t)))assert.ok(Number.isFinite(v));
});
test('the shared clock advances automatically and wraps without resetting accumulated state',()=>{const d=createIntelligenceDirector();advance(d,86.3);const before=d.snapshot();d.tick(.1);near(d.snapshot().time,0);assert.equal(before.stage,5);assert.equal(d.snapshot().stage,0);});
test('manual selection keeps the current frame and approaches the target along the same timeline',()=>{const d=createIntelligenceDirector();advance(d,9);const before=d.snapshot().time;d.select(3);near(d.snapshot().time,before);advance(d,12);near(d.snapshot().time,stageFrames[3]);assert.equal(d.snapshot().mode,'manual');});
test('rapid retargets never reset the visible timestamp',()=>{const d=createIntelligenceDirector();for(const stage of [4,2,5,0,3]){const t=d.snapshot().time;d.select(stage);near(d.snapshot().time,t);advance(d,.3);}advance(d,12);near(d.snapshot().time,stageFrames[3]);});
test('pause freezes playback, and explicitly selecting a stage while paused remains possible',()=>{const d=createIntelligenceDirector();advance(d,20);const t=d.snapshot().time;advance(d,120,{playing:false});near(d.snapshot().time,t);d.select(2);advance(d,12,{playing:false});near(d.snapshot().time,stageFrames[2]);});
for(const gate of [{active:false},{held:true},{suspended:true}])test(`scene gate freezes playback and seeking: ${JSON.stringify(gate)}`,()=>{const d=createIntelligenceDirector();d.select(4);const before=d.snapshot();advance(d,120,gate);assert.deepEqual(d.snapshot(),before);});
test('case reading protects the exact time and returns to the prior playback mode',()=>{const d=createIntelligenceDirector();advance(d,42.3);const t=d.snapshot().time;d.openExample();advance(d,200);near(d.snapshot().time,t);d.closeExample();assert.equal(d.snapshot().mode,'auto');near(d.snapshot().time,t);});
test('manual inactivity resumes after 90 seconds and activity restarts the interval',()=>{const d=createIntelligenceDirector();d.select(3);advance(d,12);advance(d,60);d.activity();advance(d,89);assert.equal(d.snapshot().mode,'manual');advance(d,1.1);assert.equal(d.snapshot().mode,'auto');});
test('reduced motion remains static and allows direct stage selection',()=>{const d=createIntelligenceDirector({reduced:true});advance(d,200);near(d.snapshot().time,16);d.select(5);near(d.snapshot().time,100);d.resume();advance(d,200);near(d.snapshot().time,100);});
test('entering a paused journey exposes a complete stage and retains usable navigation',()=>{
 const d=createIntelligenceDirector();advance(d,20);d.select(4);d.reset({playing:false});
 const frame=d.snapshot();near(frame.time,stageFrames[0]);assert.equal(frame.mode,'auto');assert.equal(frame.seeking,false);
 assert.deepEqual(intelligencePresentation(frame.time),{composition:1,copy:1,navigation:1,frame:1});
 advance(d,120,{playing:false});near(d.snapshot().time,frame.time);advance(d,1,{playing:true});near(d.snapshot().time,frame.time+intelligenceTiming.playbackRate);
 d.reset({playing:true});near(d.snapshot().time,0);assert.equal(d.snapshot().mode,'auto');
});
test('invalid selections and modified snapshots cannot corrupt the clock',()=>{const d=createIntelligenceDirector();for(const x of [-1,6,NaN,null,'2'])assert.equal(d.select(x),false);const s=d.snapshot();s.weights.fill(9);s.time=22;near(d.snapshot().time,0);assert.deepEqual(d.snapshot().weights,[1,0,0,0,0,0]);});
function rig(aspect=16/9,{deferAssets=false}={}){
 const originalDocument=globalThis.document,load=THREE.TextureLoader.prototype.load;
 const context=new Proxy({getImageData:()=>({data:new Uint8ClampedArray(0)}),createLinearGradient:()=>({addColorStop(){}}),measureText:text=>({width:text.length*55})},{get:(o,key)=>o[key]??(()=>{}),set:(o,key,v)=>(o[key]=v,true)});
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 const loaded=[],pending=[];THREE.TextureLoader.prototype.load=function(path,onLoad){const data=readFileSync(new URL(`../public${path}`,import.meta.url));assert.equal(data.toString('ascii',12,16),'IHDR');const texture=new THREE.Texture({width:data.readUInt32BE(16),height:data.readUInt32BE(20)});const image=texture.image;if(deferAssets)texture.image=undefined;pending.push(()=>{texture.image=image;onLoad?.(texture);});loaded.push(texture);return texture;};
 let world;try{world=intelligenceWorld(resolveQuality(),new THREE.LoadingManager());}finally{THREE.TextureLoader.prototype.load=load;if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;}
 const camera=new THREE.PerspectiveCamera(46,aspect,.1,480),position=new THREE.Vector3(),target=new THREE.Vector3();
 const update=(t,lang="en")=>{world.update({lang,intelligence:{...intelligenceCycle(t),mode:'auto'},camera:position,target,aspect});camera.position.copy(position);camera.lookAt(target);camera.updateMatrixWorld();world.root.updateMatrixWorld(true);};
 const finishAsset=index=>{const previous=globalThis.document;globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};try{pending[index]();}finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}};
 return {world,camera,loaded,update,finishAsset};
}
function visibleState(root){const a=[];root.traverseVisible(o=>{if(o.material)a.push([o.name,...o.matrixWorld.elements,o.material.opacity]);});return a;}
test('image reports retain all three crops after the product receives its canvas brand print',()=>{
 const previous=globalThis.document,draws=[];
 const context=new Proxy({drawImage:(...args)=>draws.push(args),createLinearGradient:()=>({addColorStop(){}}),measureText:text=>({width:text.length*20})},{get:(o,key)=>o[key]??(()=>{}),set:(o,key,value)=>(o[key]=value,true)});
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 try{
  for(const [image,ready]of [[{width:1024,height:1024},true],[{width:1024,height:1024,complete:true,naturalWidth:1024},true],[{width:1024,height:1024,complete:false,naturalWidth:0},false],[{width:1024,height:1024,complete:true,naturalWidth:0},false]]){
   const map=reportTexture(4,{image});
   for(const language of ['zh','en']){draws.length=0;map.userData.redraw(language);assert.equal(draws.length,ready?3:0);for(const args of draws)assert.equal(args[0],image);}
   map.dispose();
  }
 }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
test('the cube surface reconstructs into the approved mountain shell before its material handoff',()=>{
 const {world,update}=rig(),glass=world.root.getObjectByName('persistent-data-crystal'),robot=world.root.getObjectByName('robot-silver-shell');
 const source=glass.geometry.attributes.position,target=glass.geometry.morphAttributes.position[0],bounds=new THREE.Box3().setFromBufferAttribute(target);
 robot.geometry.computeBoundingBox();const shellBounds=robot.geometry.boundingBox.clone().applyMatrix4(robot.matrix);
 assert.equal(source.count,target.count);assert.ok(Array.from(target.array).every(Number.isFinite));
 for(const axis of ['x','y','z']){near(bounds.min[axis],shellBounds.min[axis],.065);near(bounds.max[axis],shellBounds.max[axis],.065);}
 update(24);near(glass.morphTargetInfluences[0],0);update(30.5);near(glass.morphTargetInfluences[0],1);
 assert.ok(glass.visible&&robot.parent.visible);near(robot.parent.scale.x,1);
 update(29);assert.equal(world.root.getObjectByName('data-lattice').visible,false);
 update(31.2);assert.equal(glass.visible,false);assert.ok(robot.material.opacity>.99);
 disposeTree(world.root);
});
test('reconstruction continues the cube rotation and settles without a backwards revolution',()=>{
 const {world,update}=rig(),body=world.root.getObjectByName('data-to-assistant');update(24);let previous=body.rotation.y,total=0;
 for(let t=24.05;t<=30.5;t+=.05){
  update(t);const delta=Math.atan2(Math.sin(body.rotation.y-previous),Math.cos(body.rotation.y-previous));
  assert.ok(delta>-.003&&delta<.06,`abrupt reconstruction turn at ${t}: ${delta}`);total+=delta;previous=body.rotation.y;
 }
 assert.ok(total>1&&total<3);disposeTree(world.root);
});
test('product and original brand assets remain reachable for shared disposal',()=>{const {world,loaded}=rig();assert.equal(loaded.length,6);const reachable=new Set();world.root.traverse(o=>{if(o.material?.map)reachable.add(o.material.map);});assert.ok(loaded.every(map=>reachable.has(map)));for(let i=1;i<5;i++)for(let status=0;status<3;status++)assert.equal(world.root.getObjectByName(`file-status-${i}-${status}`).material.map,world.root.getObjectByName(`file-status-0-${status}`).material.map);const resources=new Map();world.root.traverse(o=>{for(const r of [o.geometry,o.material,o.material?.map])if(r)resources.set(r,0);});resources.forEach((_,r)=>r.addEventListener('dispose',()=>resources.set(r,resources.get(r)+1)));disposeTree(world.root);assert.ok([...resources.values()].every(n=>n===1));});
test('brand print waits for both assets in either load order and never rebuilds a disposed product',()=>{
 for(const order of [[0,5],[5,0]]){
  const {world,loaded,finishAsset}=rig(16/9,{deferAssets:true});
  for(let i=1;i<5;i++)finishAsset(i);
  assert.equal(loaded[0].image?.getContext,undefined,'an unselected brand must not be printed on the product');
  finishAsset(order[0]);assert.equal(loaded[0].image?.getContext,undefined);
  finishAsset(order[1]);const print=loaded[0].image;assert.equal(typeof print.getContext,'function');
  const product=world.root.getObjectByName('persistent-drawing-product');
  for(const name of ['kit-paper-lid','kit-case','product-reflection'])assert.equal(world.root.getObjectByName(name).material.map,product.material.map);
  assert.equal(product.material.map.image,print);disposeTree(world.root);
 }
 const {world,loaded,finishAsset}=rig(16/9,{deferAssets:true});disposeTree(world.root);loaded.forEach((_,i)=>finishAsset(i));
 assert.equal(loaded[0].image.getContext,undefined);
 assert.ok(loaded.slice(1).every(texture=>texture.userData.printImage===undefined));
});
test('brand signatures follow their file fades, language and scrolling page clip',()=>{
 const {world,update}=rig();
 const parents=[...Array.from({length:5},(_,i)=>world.root.getObjectByName(`analysis-card-${i}`)),world.root.getObjectByName('commerce-details')];
 assert.equal(new Set(parents.slice(0,5).map(parent=>parent.userData.brandMark.userData.brandId)).size,5);
 const first=parents[0].userData.brandMark;
 for(let i=0;i<5;i++){
  const mark=parents[i].userData.brandMark;assert.deepEqual(mark.position.toArray(),first.position.toArray());assert.deepEqual(mark.geometry.parameters,first.geometry.parameters);
  mark.geometry.computeBoundingBox();const bounds=mark.geometry.boundingBox.clone().translate(mark.position);
  assert.ok(bounds.min.y>.69&&bounds.max.y<.93&&bounds.max.x<1.30,'the mark must remain in the header, clear of the title and frame');
  if(i<4){const print=world.root.getObjectByName(`proposal-model-${i}-brand`);assert.equal(print.material.map,mark.material.map);assert.equal(print.userData.brandId,mark.userData.brandId);}
 }
 assert.equal(parents[5].userData.brandMark.material.map,parents[4].userData.brandMark.material.map);
 for(const lang of ['zh','en'])for(const t of [0,37,39.2,42,49,51,54,67,77,83,85,88,91,100,107.9999]){
  update(t,lang);
  for(const parent of parents){const mark=parent.userData.brandMark;assert.equal(mark.parent,parent);near(mark.material.opacity,parent.material.opacity);assert.equal(mark.visible,parent.visible);assert.equal(mark.userData.brandId,proposalBrands[Math.min(parents.indexOf(parent),4)].id);}
 }
 const details=parents[5],mark=details.userData.brandMark;assert.equal(mark.userData.pageClip,details.userData.pageClip);
 update(88);assert.ok(mark.userData.pageClip.value.y<1e6);disposeTree(world.root);
});
test('three complete loops reuse every object, geometry, index buffer and product texture',()=>{const {world,update}=rig(),before=[];world.root.traverse(o=>before.push([o,o.geometry,o.material]));for(let t=0;t<324;t+=.5){update(t);let n=0;world.root.traverse(o=>{assert.equal(o,before[n][0]);assert.equal(o.geometry,before[n][1]);assert.equal(o.material,before[n][2]);assert.ok(o.matrixWorld.elements.every(Number.isFinite));n++;});assert.equal(n,before.length);}disposeTree(world.root);});
test('the exact visual loop seam retains one identical review, with no foreign visible objects',()=>{const {world,update}=rig();update(0);const first=visibleState(world.root);update(107.9999);const last=visibleState(world.root);assert.equal(last.length,first.length);first.forEach((record,i)=>record.forEach((v,j)=>typeof v==='number'?near(v,last[i][j],.0001):assert.equal(v,last[i][j])));assert.ok(first.some(v=>v[0]==='record-0'));disposeTree(world.root);});
test('the centre letter and surrounding interface share an exact opening and closing envelope',()=>{
 const hidden={composition:0,copy:0,navigation:0,frame:0};assert.deepEqual(intelligencePresentation(0),hidden);assert.deepEqual(intelligencePresentation(107.9999),hidden);
 for(const t of stageFrames)assert.deepEqual(intelligencePresentation(t),{composition:1,copy:1,navigation:1,frame:1});
 for(const channel of Object.keys(hidden)){
  let previous=0;for(let t=0;t<=8;t+=.1){const value=intelligencePresentation(t)[channel];assert.ok(value>=previous-1e-10);previous=value;}
  previous=1;for(let t=100;t<108;t+=.1){const value=intelligencePresentation(t)[channel];assert.ok(value<=previous+1e-10);previous=value;}
 }
 const {world,camera,update}=rig();for(const lang of ['zh','en'])for(const t of [0,107.9999]){
  update(t,lang);const record=world.root.getObjectByName('record-0'),q=record.userData.typing;
  const point=new THREE.Vector3((q.widths[record.userData.typedCount]-q.total)/2048*q.width,0,0).applyMatrix4(record.matrixWorld).project(camera);
  near(point.x,0);near(point.y,0);
 }
 disposeTree(world.root);
});
test('every temporal boundary has continuous visible object transforms and opacity',()=>{const {world,update}=rig();for(const time of [2.6,4.2,4.6,6.5,7,7.2,7.9,17,18,25,27,28.6,29,29.2,29.5,30,30.5,31.2,32,33,34,37,39,40.5,43,45.5,48,49,50,51,54,55,56,56.5,58.7,59,59.3,60.5,61.5,62.9,64,65,66.5,68,70,73,75.5,76,79,85,90,93,95,96,97,98,100,106]){update(time-.00001);const before=new Map();world.root.traverse(o=>before.set(o,{matrix:[...o.matrixWorld.elements],opacity:o.material?.opacity,color:o.material?.color?.toArray(),visible:o.visible}));update(time+.00001);world.root.traverse(o=>{const b=before.get(o);if(o.visible&&b.visible&&o.material?.opacity>.01){o.matrixWorld.elements.forEach((v,i)=>near(v,b.matrix[i],.003));near(o.material.opacity,b.opacity,.003);o.material.color?.toArray().forEach((v,i)=>near(v,b.color[i],.003));}});}disposeTree(world.root);});
for(const [w,h] of [[1366,768],[1920,1080],[3840,2160],[1200,900]])test(`hero contents stay in the right-side safe area at ${w}x${h}`,()=>{const {world,camera,update}=rig(w/h);for(const t of [0,16,31,47,67,77,85,100,107]){update(t);for(const name of ['record-0','persistent-drawing-product','continuous-drawing-kit-craft']){const object=world.root.getObjectByName(name);if(!object.visible)continue;const center=new THREE.Vector3();object.getWorldPosition(center);const p=center.project(camera);assert.ok(p.x>=-.22&&p.x<=.94,`${name} at ${t}: ${p.x}`);assert.ok(p.y>-.57&&p.y<.7,`${name} at ${t}: ${p.y}`);}}disposeTree(world.root);});
test('all six stages retain distinct bilingual business examples without invented business outcomes',()=>{assert.equal(intelligenceStages.length,6);assert.equal(new Set(intelligenceStages.map(s=>s.id)).size,6);for(const s of intelligenceStages){for(const value of [s.name,s.description,s.example.title,s.example.summary,s.example.outcome,...s.example.steps])assert.ok(value.length===2&&value.every(t=>typeof t==='string'&&t.length));assert.doesNotMatch(JSON.stringify(s.example),/儿童|香水|\d+%/);}});

test('data lattice converges, reconstructs and retires without replacing its instances',()=>{const {world,update}=rig();const lattice=world.root.getObjectByName('data-lattice');assert.equal(lattice.count,8);update(9);const spread=[...lattice.instanceMatrix.array];update(16);const cube=[...lattice.instanceMatrix.array];assert.notDeepEqual(spread,cube);update(28);assert.notDeepEqual([...lattice.instanceMatrix.array],cube);update(33);assert.equal(lattice.visible,false);assert.ok([...lattice.instanceMatrix.array].every(Number.isFinite));disposeTree(world.root);});
test('insights foreground the same files that carry the selected design into decisioning',()=>{const {world,update}=rig(),card=world.root.getObjectByName('analysis-card-4');update(40);assert.ok(world.root.getObjectByName('analysis-card-0').visible);update(42);assert.equal(world.root.getObjectByName('file-status-1-0').visible,false);assert.ok(world.root.getObjectByName('file-status-1-1').visible);update(49);assert.equal(card.userData.reviewState,'selected');assert.equal(world.root.getObjectByName('analysis-card-1').userData.reviewState,'rejected');update(67);assert.equal(world.root.getObjectByName('analysis-card-4'),card);assert.equal(card.visible,false);assert.ok(world.root.getObjectByName('continuous-drawing-kit-craft').visible);disposeTree(world.root);});
test('one review explanation follows the active proposal and retires before processing captions',()=>{
 const {world,update}=rig(),notes=Array.from({length:5},(_,i)=>world.root.getObjectByName(`proposal-review-note-${i}`));
 [39,41.8,44.3,46.6,49.3].forEach((t,i)=>{update(t);assert.ok(notes[i].material.opacity>.9);assert.equal(notes.filter(o=>o.visible).length,1);});
 for(let t=35;t<=53;t+=.05){update(t);assert.ok(notes.filter(o=>o.visible).length<=1,`overlapping explanations at ${t}`);}
 update(53);assert.ok(notes.every(o=>!o.visible));assert.ok(world.root.getObjectByName('craft-step-0').visible);disposeTree(world.root);
});
test('review explanations stay above the navigation across exhibition screen proportions',()=>{
 for(const aspect of [1366/768,1920/1080,3840/2160,1200/900]){
  const {world,camera,update}=rig(aspect);update(49.3);const note=world.root.getObjectByName('proposal-review-note-4'),p=new THREE.Vector3();
  for(let i=0;i<4;i++){p.fromBufferAttribute(note.geometry.attributes.position,i).applyMatrix4(note.matrixWorld).project(camera);assert.ok(p.x>-.22&&p.x<.94&&p.y>-.65);}
  disposeTree(world.root);
 }
});
test('emerging proposals stay clear of the mountain face as it moves into the review role',()=>{
 const {world,update}=rig();for(let t=35;t<=38;t+=.1){update(t);const face=new THREE.Box3().setFromObject(world.root.getObjectByName('robot-blue-face'));for(let i=0;i<5;i++){
  const card=world.root.getObjectByName(`analysis-card-${i}`);if(card.material.opacity<.05)continue;
  const bounds=new THREE.Box3().setFromObject(card);assert.ok(bounds.max.x<face.min.x,`proposal ${i} covers the face at ${t}`);
 }}disposeTree(world.root);
});
test('development inspection parks the common clock without affecting normal playback contracts',()=>{const d=createIntelligenceDirector();d.select(4);d.inspect(28.4);near(d.snapshot().time,28.4);assert.equal(d.snapshot().seeking,false);advance(d,8,{playing:false});near(d.snapshot().time,28.4);d.resume();advance(d,1);near(d.snapshot().time,29.65);d.inspect(NaN);near(d.snapshot().time,29.65);});
test('the same drawing kit leaves the proposal, separates its tools and assembles before photography',()=>{
 const {world,update}=rig(),craft=world.root.getObjectByName('continuous-drawing-kit-craft'),pan=world.root.getObjectByName('kit-tray-0'),photo=world.root.getObjectByName('persistent-drawing-product');
 update(47);assert.ok(craft.visible);assert.equal(craft.userData.phase,'proposal');assert.ok(pan.material.opacity<=world.root.getObjectByName('analysis-card-4').material.opacity+.001);const initial=craft.scale.x;
 update(57);assert.ok(craft.scale.x>initial*2);assert.ok(pan.userData.seated<.1);assert.equal(photo.visible,false);const spread=pan.position.clone();
 update(67);assert.equal(craft.userData.phase,'finish');assert.ok(pan.userData.seated>.99);assert.ok(pan.position.distanceTo(spread)>.2);assert.ok(world.root.getObjectByName('kit-paper-lid').material.opacity>.99);
 update(74);assert.ok(craft.visible&&photo.visible);near(craft.position.x,photo.position.x);near(craft.position.y,photo.position.y);update(77);assert.equal(craft.visible,false);assert.ok(photo.visible);disposeTree(world.root);
});
test('independently pivoted tool trays and hinge register exactly with the finished photograph',()=>{
 const {world,update}=rig(),photo=world.root.getObjectByName('persistent-drawing-product'),point=new THREE.Vector3(),reference=new THREE.Vector3();
 update(57);for(let i=0;i<4;i++){
  const pan=world.root.getObjectByName(`kit-tray-${i}`);assert.ok(Math.abs(pan.rotation.y)>.1);assert.ok(world.root.getObjectByName(`kit-tray-wall-${i}`).visible);
 }
 for(const t of [73,74,75.4]){
  update(t);for(const name of ['kit-tray-0','kit-tray-1','kit-tray-2','kit-tray-3','kit-paper-lid','kit-case']){
   const part=world.root.getObjectByName(name);
   for(let v=0;v<part.geometry.attributes.position.count;v++){
    point.fromBufferAttribute(part.geometry.attributes.position,v).applyMatrix4(part.matrixWorld);
    reference.fromBufferAttribute(photo.geometry.attributes.position,v).applyMatrix4(photo.matrixWorld);
    assert.ok(point.distanceTo(reference)<1e-6,`${name} loses image registration at ${t}`);
   }
  }
  for(let i=0;i<4;i++)assert.equal(world.root.getObjectByName(`kit-tray-wall-${i}`).visible,false);
 }
 disposeTree(world.root);
});
test('the palette belongs to its proposal plane before turning toward the processing view',()=>{
 const {world,update}=rig(),craft=world.root.getObjectByName('continuous-drawing-kit-craft'),card=world.root.getObjectByName('analysis-card-4'),front=new THREE.Quaternion();
 for(const t of [40,47,50,51]){update(t);near(craft.quaternion.angleTo(card.quaternion),0);}
 update(53);assert.ok(craft.quaternion.angleTo(front)<card.quaternion.angleTo(front));
 update(57);near(craft.quaternion.angleTo(front),0);disposeTree(world.root);
});
test('proposal writing retires before the expanding palette reaches its heading',()=>{
 const {world,update}=rig(),palette=world.root.getObjectByName('kit-tray-0');
 for(const t of [51.2,52,52.8,53.5]){update(t);assert.ok(palette.material.opacity>.99,`product faded with the printed proposal at ${t}`);}
 update(52.8);for(let i=0;i<5;i++)assert.ok(world.root.getObjectByName(`analysis-card-${i}`).material.opacity<.02);
 update(53.5);for(let i=0;i<5;i++)assert.equal(world.root.getObjectByName(`analysis-card-${i}`).visible,false);
 disposeTree(world.root);
});

test('opening types from G into the review and reverses to the identical letter at the seam',()=>{const {world,update}=rig(),text=world.root.getObjectByName('record-0');update(0);assert.equal(text.userData.typedCount,1);const cut=text.userData.typing.cut.value;update(1);assert.ok(text.userData.typedCount>1&&text.userData.typedCount<14);update(3);assert.equal(text.userData.typedCount,14);update(107.9999);assert.equal(text.userData.typedCount,1);near(text.userData.typing.cut.value,cut);disposeTree(world.root);});
test('robot blinks, floats and turns toward the product proposals',()=>{const {world,update}=rig(),eye=world.root.getObjectByName('robot-eyes'),bot=world.root.getObjectByName('data-to-assistant');update(31.94);assert.ok(eye.scale.y<.2);update(33);assert.ok(eye.scale.y>.99);const first=bot.position.y;update(43);assert.notEqual(bot.position.y,first);assert.ok(bot.rotation.y<-.2);const gaze=eye.position.toArray();update(41);assert.notDeepEqual(eye.position.toArray(),gaze);assert.ok(eye.position.x<0);disposeTree(world.root);});
test('scan volume originates at the moving eye and follows the reviewed file in 3D',()=>{const {world,update}=rig(),beam=world.root.getObjectByName('right-to-left-projection');update(42);const root=world.root.getObjectByName('continuous-value-journey'),core=world.root.getObjectByName('robot-projector'),eye=root.worldToLocal(core.getWorldPosition(new THREE.Vector3()));beam.userData.source.forEach((v,i)=>near(v,eye.getComponent(i)));assert.ok(beam.userData.target[0]<beam.userData.source[0]);const zs=Array.from(beam.geometry.attributes.position.array).filter((_,i)=>i%3===2);assert.ok(zs.every(Number.isFinite));const file=world.root.getObjectByName('analysis-card-1'),hit=file.worldToLocal(root.localToWorld(new THREE.Vector3(...beam.userData.target)));assert.ok(Math.abs(hit.x)<1.325&&Math.abs(hit.y)<.93);const before=beam.userData.target[1];update(44);assert.notEqual(beam.userData.target[1],before);disposeTree(world.root);});
test('the eyes follow the moving scan contact within a stationary foreground proposal',()=>{
 const {world,update}=rig(),eyes=world.root.getObjectByName('robot-eyes'),contact=world.root.getObjectByName('screen-scan-contact');
 update(39.2);const eyeX=eyes.position.x,contactX=contact.position.x;update(39.7);
 assert.ok(Math.abs(eyes.position.x-eyeX)>.008);assert.equal(Math.sign(eyes.position.x-eyeX),Math.sign(contact.position.x-contactX));disposeTree(world.root);
});

test('source reviews feed six authored reports rather than remaining cube stickers',()=>{const {world,update}=rig();const records=[];world.root.traverse(o=>{if(/^record-\d+$/.test(o.name))records.push(o);assert.ok(!o.name.startsWith('product-record-'));});assert.equal(records.length,6);assert.equal(new Set(records.map(o=>o.userData.typing.text)).size,6);update(6);const source=records[0].matrixWorld.clone();update(16);assert.notDeepEqual(records[0].matrixWorld,source);assert.equal(records[0].visible,false);assert.ok(world.root.getObjectByName('report-face-0').material.opacity>.8);assert.equal(world.root.getObjectByName('record-0'),records[0]);disposeTree(world.root);});
test('the assembled cube visibly rotates and its eight large cells reorganize',()=>{const {world,update}=rig(),body=world.root.getObjectByName('data-to-assistant'),cells=world.root.getObjectByName('data-lattice');update(16);const angle=body.rotation.y,matrix=[...cells.instanceMatrix.array];update(22);assert.ok(Math.abs(body.rotation.y-angle)>.3);assert.notDeepEqual([...cells.instanceMatrix.array],matrix);assert.equal(cells.count,8);disposeTree(world.root);});
test('the mountain robot replaces the crystal and its solid shell stays stable while the eyes blink',()=>{
 const {world,update}=rig(),robot=world.root.getObjectByName('mountain-robot'),shell=world.root.getObjectByName('robot-silver-shell'),face=world.root.getObjectByName('robot-blue-face');
 update(16);assert.equal(robot.visible,false);update(33);assert.ok(robot.visible);assert.equal(world.root.getObjectByName('persistent-data-crystal').visible,false);
 shell.geometry.computeBoundingBox();const size=shell.geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(size.x>size.y*1.5&&size.z>.5);
 assert.equal(face.material.map,null);const scale=shell.scale.toArray();update(31.94);assert.deepEqual(shell.scale.toArray(),scale);assert.ok(world.root.getObjectByName('robot-eyes').scale.y<.2);
 disposeTree(world.root);
});
test('the original silver mountain ridge remains fixed beneath the expressive eyes',()=>{
 const {world,update}=rig(),face=world.root.getObjectByName('robot-blue-face'),shell=world.root.getObjectByName('robot-silver-shell'),ray=new THREE.Raycaster();
 const geometry=face.geometry,vertices=Array.from(geometry.attributes.position.array);
 for(const t of [31,41.8,44.6,49,76]){
  update(t);ray.set(face.localToWorld(new THREE.Vector3(0,-.40,1)),new THREE.Vector3(0,0,-1).transformDirection(face.matrixWorld));
  assert.equal(ray.intersectObject(face,false).length,0,`the original ridge is covered at ${t}`);
  assert.ok(ray.intersectObject(shell,false).length>0);
  assert.equal(face.geometry,geometry);assert.deepEqual(Array.from(geometry.attributes.position.array),vertices);
 }
 disposeTree(world.root);
});
test('reports and relationships finish gathering before the newborn robot expresses joy',()=>{
 const {world,update}=rig(),links=world.root.getObjectByName('analysis-connections'),node=world.root.getObjectByName('analysis-node-0'),eye=world.root.getObjectByName('robot-left-eye');
 update(24);const spread=node.position.length();update(28);assert.ok(node.position.length()<spread*.3);const wakingEye=eye.material.opacity;
 update(30.8);assert.equal(links.visible,false);for(let i=0;i<6;i++)assert.equal(world.root.getObjectByName(`report-face-${i}`).visible,false);
 assert.ok(eye.material.opacity>wakingEye);assert.equal(world.root.getObjectByName('mountain-robot').userData.expression,'happy');disposeTree(world.root);
});
test('the scanning slice reveals nodes from top to bottom before all links connect and gather',()=>{
 const {world,update}=rig(),links=world.root.getObjectByName('analysis-connections'),nodes=Array.from({length:6},(_,i)=>world.root.getObjectByName(`analysis-node-${i}`)),p=new THREE.Vector3();
 let count=0;for(const t of [19.5,20.4,21.4,22.4,24]){update(t);const shown=nodes.filter(n=>n.material.opacity>.5).length;assert.ok(shown>=count);count=shown;for(let i=1;i<nodes.length;i++)assert.ok(nodes[i-1].material.opacity>=nodes[i].material.opacity-.001);}
 assert.equal(count,6);
 for(const t of [24,25.8,27.5]){update(t);const positions=links.geometry.attributes.position;assert.equal(positions.count,14);
  for(let i=0;i<positions.count;i++){p.fromBufferAttribute(positions,i);assert.ok(nodes.some(n=>n.position.distanceTo(p)<1e-6),`a relation ends in empty space at ${t}`);}
 }
 update(29);assert.equal(links.visible,false);assert.ok(nodes.every(n=>!n.visible));disposeTree(world.root);
});
test('all six report surfaces share the moving scan plane in the rotated cube coordinate system',()=>{
 const {world,update}=rig(),scan=world.root.getObjectByName('analysis-scan'),faces=Array.from({length:6},(_,i)=>world.root.getObjectByName(`report-face-${i}`)),p=new THREE.Vector3();
 update(16);assert.ok(faces.every(f=>f.material.depthWrite));near(faces[0].userData.analysis.strength.value,0);
 for(const t of [19.5,21.5,24,26]){update(t);const analysis=faces[0].userData.analysis;scan.getWorldPosition(p);p.applyMatrix4(analysis.toBody.value);near(p.y,analysis.height.value);
  assert.ok(faces.every(f=>f.userData.analysis===analysis&&!f.material.depthWrite));assert.ok(analysis.strength.value>.99);
 }
 disposeTree(world.root);
});


test('manual stage dwell retains subtle motion while the paused shared clock freezes it',()=>{const {world}=rig(),camera=new THREE.Vector3(),target=new THREE.Vector3(),body=world.root.getObjectByName('data-to-assistant'),frame={...intelligenceCycle(16),mode:'manual',seeking:false};for(let i=0;i<=60;i++)world.update({camera,target,intelligence:frame,time:i*.05});const moving=body.rotation.y;for(let i=61;i<=120;i++)world.update({camera,target,intelligence:frame,time:i*.05});assert.ok(Math.abs(body.rotation.y-moving)>.02);const stopped=body.rotation.y;for(let i=0;i<20;i++)world.update({camera,target,intelligence:frame,time:6});near(body.rotation.y,stopped);disposeTree(world.root);});


test('language changes repaint text without replacing scene objects or resetting time',()=>{const {world,update}=rig();update(47,'zh');const record=world.root.getObjectByName('record-0'),map=record.material.map,cut=record.userData.typing.cut;assert.equal(record.userData.typing.text,'很棒的产品。');update(47,'en');assert.equal(record.userData.typing.text,'Great product.');assert.equal(record.material.map,map);assert.equal(record.userData.typing.cut,cut);near(world.root.userData.journeyTime,47);disposeTree(world.root);});
test('product stays out of analysis and decision, then appears from the design synthesis',()=>{const {world,update}=rig(),product=world.root.getObjectByName('persistent-drawing-product');for(const t of [40,47,58,67,72]){update(t);assert.equal(product.visible,false);}update(77);assert.equal(product.visible,true);disposeTree(world.root);});
test('commerce scrolls before purchase reviews arrive and those same reviews become exhibit cards',()=>{const {world,update}=rig(),record=world.root.getObjectByName('record-0'),page=world.root.getObjectByName('commerce-frame');update(85);assert.equal(record.visible,false);const initialOffset=page.material.map.offset.y;update(88);assert.equal(record.visible,false);assert.ok(page.material.map.offset.y<initialOffset);update(90);assert.equal(record.visible,true);assert.ok(record.children[1].material.opacity>.9);assert.equal(record.children[0].visible,false);update(98);assert.equal(record.children[1].visible,false);assert.ok(record.children[0].material.opacity>.9);update(107.99);assert.equal(record.children[0].visible,false);disposeTree(world.root);});
test('new purchase reviews scroll with their section and never cover its heading',()=>{
 const {world,update}=rig(),root=world.root.getObjectByName('continuous-value-journey'),page=world.root.getObjectByName('commerce-frame'),top=new THREE.Vector3();
 for(let t=89.1;t<=91.1;t+=.1){update(t);
  // The heading baseline is at pixel 1135 of the authored 2100-pixel page.
  const map=page.material.map,headingY=((1-1135/2100-map.offset.y)/map.repeat.y-.5)*6.2;
  for(let i=0;i<1;i++){const record=world.root.getObjectByName(`record-${i}`),purchase=record.userData.reviewSkins.purchase;if(purchase.material.opacity<.05)continue;
   top.set(0,1.1,0).applyMatrix4(purchase.matrixWorld);root.worldToLocal(top);assert.ok(headingY-top.y>.4,`review ${i} covers its heading at ${t}`);
  }
 }
 update(91);near(world.root.getObjectByName('record-0').position.y,1.1);disposeTree(world.root);
});
test('the docked robot shares the page clip while its earlier flight remains unrestricted',()=>{
 for(const aspect of [1366/768,1920/1080,3840/2160,1200/900]){
  const {world,update}=rig(aspect),robot=world.root.getObjectByName('mountain-robot'),product=world.root.getObjectByName('persistent-drawing-product'),parts=[];robot.traverse(o=>{if(o.isMesh)parts.push(o);});
  update(83);assert.ok(parts.every(o=>o.userData.pageClip.value.y===1e6));
  update(85);assert.ok(parts.every(o=>o.userData.pageClip===parts[0].userData.pageClip&&o.userData.pageClip.value.equals(product.userData.pageClip.value)));
  update(87);const band=parts[0].userData.pageClip.value,partial=new THREE.Box3().setFromObject(robot);assert.ok(partial.min.y<band.y&&partial.max.y>band.y);
  update(87.4);assert.ok(robot.visible);assert.ok(new THREE.Box3().setFromObject(robot).min.y>band.y);disposeTree(world.root);
 }
});
test('purchase and exhibit review frames share the same changing outline during their handoff',()=>{
 const {world,update}=rig();for(const t of [93.2,93.8,94.2,94.8,95.2]){update(t);for(let i=0;i<1;i++){
  const record=world.root.getObjectByName(`record-${i}`),[exhibit,purchase]=record.children;
  for(const part of [exhibit,purchase])part.geometry.computeBoundingBox();
  const a=exhibit.geometry.boundingBox.clone().applyMatrix4(exhibit.matrix),b=purchase.geometry.boundingBox.clone().applyMatrix4(purchase.matrix);
  for(const axis of ['x','y']){near(a.min[axis],b.min[axis]);near(a.max[axis],b.max[axis]);}
 }}disposeTree(world.root);
});
test('the avatar review retains its sentence while metadata changes skins without overlap',()=>{
 const {world,update}=rig(),record=world.root.getObjectByName('record-0');
 update(92.5);assert.ok(record.userData.reviewSkins.purchaseInk.material.opacity>.99);assert.equal(record.userData.reviewSkins.exhibitInk.visible,false);
 for(let t=93.2;t<=95.2;t+=.04){update(t);const {exhibitInk,purchaseInk}=record.userData.reviewSkins;assert.ok(!(exhibitInk.visible&&purchaseInk.visible),`double metadata at ${t}`);assert.ok(record.visible&&record.material.opacity>.99);}
 update(94.2);assert.equal(record.userData.reviewSkins.exhibitInk.visible,false);assert.equal(record.userData.reviewSkins.purchaseInk.visible,false);
 update(95.2);near(record.userData.reviewSkins.exhibitInk.material.opacity,record.material.opacity);assert.equal(record.userData.reviewSkins.purchaseInk.visible,false);disposeTree(world.root);
});
test('internal operating records enter only after the consumer page retires and never wear avatar skins',()=>{
 const {world,update}=rig(),page=world.root.getObjectByName('commerce-frame'),records=Array.from({length:5},(_,i)=>world.root.getObjectByName(`record-${i+1}`));
 assert.deepEqual(records.map(o=>o.userData.source),['sales','inventory','margin','delivery','quality']);
 for(let t=85;t<95.3;t+=.1){update(t);for(const record of records){assert.equal(record.visible,false);assert.equal(record.userData.reviewSkins.purchase,null);assert.equal(record.userData.reviewSkins.purchaseInk,null);}}
 for(let t=95.3;t<102;t+=.05){update(t);if(records.some(o=>o.visible))assert.equal(page.visible,false);}
 update(97.4);assert.ok(records.every(o=>o.visible&&o.userData.reviewSkins.businessInk.visible));disposeTree(world.root);
});
test('companion avatar reviews follow the first purchase review and retire with the consumer page',()=>{
 const {world,update}=rig(),first=world.root.getObjectByName('record-0'),page=world.root.getObjectByName('commerce-frame'),reviews=Array.from({length:3},(_,i)=>world.root.getObjectByName(`purchase-companion-${i}`));
 update(90);assert.ok(first.visible);assert.ok(reviews.every(o=>!o.visible));
 update(92);const cards=[first,...reviews];assert.ok(reviews.every(o=>o.visible));
 const boxes=cards.map(o=>new THREE.Box3().setFromObject(o.userData.reviewSkins?.purchase??o.children[0]));
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert.equal(boxes[i].intersectsBox(boxes[j]),false);
 for(const t of [93.2,94,94.8,95.2]){update(t);for(const review of reviews){near(review.material.opacity,page.material.opacity);near(review.scale.x,.65*page.parent.scale.x);}}
 update(95.3);assert.ok(reviews.every(o=>!o.visible));assert.ok(world.root.getObjectByName('record-1').userData.reviewSkins.purchase===null);disposeTree(world.root);
});
test('sales and inventory get separate readable focus beats with adjustments following the comparison',()=>{
 const {world,update}=rig(),sales=world.root.getObjectByName('record-1'),inventory=world.root.getObjectByName('record-2');
 update(96.4);near(sales.userData.feedbackFocus,1);assert.equal(sales.userData.reviewSkins.actionInk.visible,false);assert.ok(sales.userData.reviewSkins.businessInk.visible);
 update(97.4);near(sales.userData.reviewSkins.actionInk.material.opacity,1);
 update(99.2);near(inventory.userData.feedbackFocus,1);near(sales.userData.feedbackFocus,0);assert.equal(inventory.userData.reviewSkins.actionInk.visible,false);
 update(100);near(inventory.userData.reviewSkins.actionInk.material.opacity,1);
 for(let t=95;t<102;t+=.025){update(t);assert.ok(sales.userData.feedbackFocus<.01||inventory.userData.feedbackFocus<.01);}
 disposeTree(world.root);
});
test('business records become text and rejoin their matching sources on the next cycle',()=>{
 const {world,update}=rig(),records=Array.from({length:6},(_,i)=>world.root.getObjectByName(`record-${i}`));
 update(103);for(const record of records.slice(1)){assert.ok(record.visible);assert.equal(record.children[0].visible,false);assert.equal(record.userData.reviewSkins.businessInk.visible,false);assert.equal(record.userData.reviewSkins.actionInk.visible,false);}
 update(105);assert.ok(records[0].visible);assert.ok(records.slice(1).every(o=>!o.visible));
 update(6,'zh');assert.deepEqual(records.map(o=>o.userData.reportIndex),[0,3,3,5,5,5]);assert.equal(records[1].userData.typing.text,'预测销量与实际销售差异');assert.equal(records[2].userData.typing.text,'缺货影响与库存周转分析');
 assert.ok(records.every(o=>o.visible));for(let i=0;i<6;i++)assert.equal(world.root.getObjectByName(`record-${i}`),records[i]);
 for(const record of records.slice(1)){near(record.children[0].scale.x,1);near(record.children[0].scale.y,record.userData.reviewSkins.sourceHeight);near(record.children[0].position.y,0);assert.equal(record.userData.reviewSkins.businessInk.visible,false);}
 disposeTree(world.root);
});
test('source cards and focused comparisons remain separated in screen space',()=>{
 for(const aspect of [1366/768,1920/1080,3840/2160,1200/900]){
  const {world,camera,update}=rig(aspect),records=Array.from({length:6},(_,i)=>world.root.getObjectByName(`record-${i}`)),p=new THREE.Vector3(),collisions=[];
  for(let t=93;t<=104;t+=.025){update(t);const bounds=records.map(record=>{
   const card=record.children[0];if(!record.visible||card.material.opacity<.05)return null;const box=new THREE.Box2();for(let v=0;v<4;v++){p.fromBufferAttribute(card.geometry.attributes.position,v).applyMatrix4(card.matrixWorld).project(camera);assert.ok(p.x>-.22&&p.x<.94&&p.y>-.65&&p.y<.7,`${record.name} leaves the exhibit safe area at ${t}`);box.expandByPoint(new THREE.Vector2(p.x,p.y));}return box;
  });
   for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){const a=bounds[i],b=bounds[j];if(!a||!b)continue;const gapX=Math.max(b.min.x-a.max.x,a.min.x-b.max.x),gapY=Math.max(b.min.y-a.max.y,a.min.y-b.max.y);if(Math.max(gapX,gapY)<.003)collisions.push({t:Number(t.toFixed(3)),i,j,gapX,gapY});}
  }
  assert.equal(collisions.length,0,JSON.stringify(collisions.slice(0,6)));disposeTree(world.root);
 }
});
test('automatic playback is 25 percent faster while inactivity remains real time',()=>{const d=createIntelligenceDirector();advance(d,8);near(d.snapshot().time,10);});

test('source-specific UI grows around the same sentence and retires before reports and commerce',()=>{
 const {world,update}=rig(),records=Array.from({length:6},(_,i)=>world.root.getObjectByName(`record-${i}`));
 const maps=records.map(r=>r.userData.reviewSkins.sourceInk.material.map);assert.equal(new Set(maps).size,6);
 update(2.3);assert.ok(records[0].visible);assert.ok(records.every(r=>!r.userData.reviewSkins.sourceInk.visible));
 update(4.2);assert.ok(records[0].userData.reviewSkins.sourceInk.material.opacity>.7);assert.ok(records.slice(1).every(r=>!r.userData.reviewSkins.sourceInk.visible));
 for(const lang of ['zh','en']){
  update(7,lang);for(const record of records){const {sourceInk,exhibitInk}=record.userData.reviewSkins;assert.ok(sourceInk.visible);assert.ok(!exhibitInk?.visible);near(sourceInk.material.opacity,record.children[0].material.opacity);}
  for(const t of [8,16,49,85,92,95.2,99,107.9999]){update(t,lang);assert.ok(records.every(r=>!r.userData.reviewSkins.sourceInk.visible));}
 }
 assert.deepEqual(records.map(r=>r.userData.reviewSkins.sourceInk.material.map),maps);disposeTree(world.root);
});
test('dense information becomes six report panels before the cube is reconstructed',()=>{const {world,update}=rig();update(6);const fragments=[];world.root.traverseVisible(o=>{if(o.name.startsWith('data-fragment-'))fragments.push(o);});assert.equal(fragments.length,36);update(17);for(let i=0;i<6;i++){const face=world.root.getObjectByName(`report-face-${i}`);assert.ok(face.visible);assert.equal(face.material.side,THREE.FrontSide);}assert.ok(fragments.every(o=>!o.visible));update(33);for(let i=0;i<6;i++)assert.equal(world.root.getObjectByName(`report-face-${i}`).visible,false);disposeTree(world.root);});
test('the dense information field preserves readable gaps between text and reviews',()=>{
 const {world,update}=rig();update(6);const bounds=[];
 world.root.traverseVisible(object=>{if(!/^data-fragment-|^feedback-frame$/.test(object.name))return;object.geometry.computeBoundingBox();bounds.push({name:object.name,box:object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld)});});
 assert.equal(bounds.length,42);
 for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
  const a=bounds[i].box,b=bounds[j].box;
  const overlapX=Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),overlapY=Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y);
  assert.ok(overlapX<0||overlapY<0,`${bounds[i].name} overlaps ${bounds[j].name}`);
 }
 disposeTree(world.root);
});
test('source text retires before the six reports hold a clear reading beat',()=>{
 const {world,update}=rig();
 for(const time of [11.8,12.3,12.9]){
  update(time);const bounds=[];
  world.root.traverse(object=>{
   if(/^record-\d+$|^data-fragment-/.test(object.name))assert.equal(object.visible,false,`${object.name} obscures the reports at ${time}`);
   if(/^report-face-/.test(object.name)){
    assert.ok(object.material.opacity>.9);object.geometry.computeBoundingBox();
    bounds.push(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
   }
  });
  assert.equal(bounds.length,6);
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++)assert.equal(bounds[i].intersectsBox(bounds[j]),false,`reports overlap at ${time}`);
  assert.equal(world.root.getObjectByName('data-lattice').visible,false);
 }
 disposeTree(world.root);
});
test('the six information streams preserve reading gaps throughout convergence',()=>{
 const {world,camera,update}=rig(),point=new THREE.Vector3(),collisions=new Map();
 for(let t=5.8;t<=11;t+=.05){
  update(t);const bounds=[];world.root.traverseVisible(object=>{
   if(!object.name.startsWith('data-fragment-')||object.material.opacity<.2)return;
   const box=new THREE.Box2(),vertices=object.geometry.attributes.position;
   for(let v=0;v<vertices.count;v++){point.fromBufferAttribute(vertices,v).applyMatrix4(object.matrixWorld).project(camera);box.expandByPoint(new THREE.Vector2(point.x,point.y));}
   bounds.push({name:object.name,box});
  });
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
   const a=bounds[i].box,b=bounds[j].box,overlapX=Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),overlapY=Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y);
   if(overlapX>=0&&overlapY>=0){const pair=`${bounds[i].name} / ${bounds[j].name}`;if(!collisions.has(pair))collisions.set(pair,Number(t.toFixed(2)));}
  }
 }
 assert.equal(collisions.size,0,JSON.stringify([...collisions]));disposeTree(world.root);
});
test('the Data Assets stage stop holds six completed cube faces',()=>{
 const {world,update}=rig();update(stageFrames[0]);const body=world.root.getObjectByName('data-to-assistant'),point=new THREE.Vector3();
 for(let i=0;i<6;i++){
  const face=world.root.getObjectByName(`report-face-${i}`);face.getWorldPosition(point);body.worldToLocal(point);
  near(Math.max(Math.abs(point.x),Math.abs(point.y),Math.abs(point.z)),1.48);near(point.length(),1.48);
  assert.ok(face.material.depthWrite);near(face.userData.reportReveal.value,1);
 }
 disposeTree(world.root);
});
test('mountain eye geometry continuously acts through inspection, doubt, delight and selection',()=>{
 const {world,update}=rig(),robot=world.root.getObjectByName('mountain-robot'),left=world.root.getObjectByName('robot-left-eye'),right=world.root.getObjectByName('robot-right-eye'),geometry=left.geometry;
 assert.equal(world.root.getObjectByName('robot-eyes').children.filter(o=>o.isMesh).length,2);
 assert.equal(left.children.length,0);assert.equal(right.children.length,0);
 assert.equal(world.root.getObjectByName('robot-pupil-0'),undefined);assert.equal(world.root.getObjectByName('robot-eye-glint-0'),undefined);
 update(36);assert.equal(robot.userData.expression,'focused');const focused=Array.from(geometry.attributes.position.array);
 update(41.6);assert.equal(robot.userData.expression,'skeptical');assert.ok(left.userData.strokeWidth<right.userData.strokeWidth);assert.ok(Math.abs(robot.rotation.z)>.001);
 update(44.6);assert.equal(robot.userData.expression,'impatient');assert.ok(left.userData.strokeWidth<.04);update(32.5);assert.equal(robot.userData.expression,'happy');assert.ok(left.userData.curvature>.99);assert.ok(robot.position.y>.09);assert.notDeepEqual(Array.from(geometry.attributes.position.array),focused);
 update(49);assert.equal(robot.userData.expression,'selected');assert.equal(left.geometry,geometry);assert.ok(left.userData.curvature>.4);disposeTree(world.root);
});
test('the robot blinks between reactions without hiding their expressive peaks',()=>{
 for(const t of [41.4,41.6,42,44.5,47.9,48.6,49,69.8])assert.ok(blinkAt(t)>.99,`expression hidden at ${t}`);
 for(const t of [40.8,55.35,62.55,70.75,76.25])assert.ok(blinkAt(t)<.2,`missing natural blink at ${t}`);
});
test('recognition follows the palette focus and one confirming nod settles before craft',()=>{
 const {world,update}=rig(),robot=world.root.getObjectByName('mountain-robot'),eye=world.root.getObjectByName('robot-left-eye'),palette=world.root.getObjectByName('analysis-card-4'),previous=world.root.getObjectByName('analysis-card-3');
 const bounds=()=>new THREE.Box3().setFromBufferAttribute(eye.geometry.attributes.position).getSize(new THREE.Vector3());
 for(const t of [46.6,47.4,47.8,47.99]){update(t);near(bounds().x,.32);near(eye.userData.curvature,0);}
 update(48.35);assert.ok(palette.position.z>previous.position.z);assert.ok(bounds().x>.35);assert.ok(bounds().y<.06);near(robot.rotation.x,0);
 update(49);assert.equal(robot.userData.expression,'selected');assert.ok(eye.userData.curvature>.65);assert.ok(robot.rotation.x>.09);
 for(let t=49.6;t<53;t+=.1){update(t);near(robot.rotation.x,0);}
 update(60.2);const gaze=world.root.getObjectByName('robot-eyes').position.toArray();update(61.5);assert.notDeepEqual(world.root.getObjectByName('robot-eyes').position.toArray(),gaze);near(robot.rotation.x,0);
 disposeTree(world.root);
});

test('one robot remains alongside the selected product and becomes the commerce header logo',()=>{const {world,update}=rig(),robot=world.root.getObjectByName('mountain-robot'),body=robot.parent,product=world.root.getObjectByName('persistent-drawing-product');update(77);assert.ok(robot.visible&&product.visible);assert.equal(robot.userData.expression,'happy');const size=body.scale.x;update(85);assert.equal(world.root.getObjectByName('mountain-robot'),robot);assert.ok(robot.visible&&product.visible);assert.ok(body.scale.x<size*.3);assert.ok(body.position.x<-3&&body.position.y>2.5);update(90);assert.equal(robot.visible,false);disposeTree(world.root);});
test('the complete robot clears the product silhouette throughout its flight into the header',()=>{
 // Project the actual model outline; the hero sits in front of the robot.
 for(const aspect of [1366/768,1920/1080,3840/2160,1200/900]){
  const {world,camera,update}=rig(aspect),robot=world.root.getObjectByName('robot-silver-shell'),product=world.root.getObjectByName('persistent-drawing-product');
  product.geometry.computeBoundingBox();const productBounds=product.geometry.boundingBox;
  robot.geometry.computeBoundingBox();
  const projected=(mesh,box)=>{
   const result=new THREE.Box2();for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const p=new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(camera);result.expandByPoint(new THREE.Vector2(p.x,p.y));
   }return result;
  };
  for(let t=79;t<=85;t+=.05){
   update(t);const a=projected(robot,robot.geometry.boundingBox),b=projected(product,productBounds);
   assert.ok(!a.intersectsBox(b),`robot crosses product at ${t} with aspect ${aspect}`);
   assert.ok(a.min.x>-.22&&a.max.x<.94&&a.max.y<.90,`robot leaves the clear stage area at ${t}`);
  }
  disposeTree(world.root);
 }
});

test('five proposal pages retain five distinct physical product silhouettes',()=>{const {world,update}=rig();update(47);for(const name of ['pencil-travel-sleeve','drawing-gift-box','drawing-size-case-0','desk-organiser-base','kit-paper-lid']){const object=world.root.getObjectByName(name);assert.ok(object);assert.ok(object.material.opacity>.1);}assert.equal(world.root.getObjectByName('forecast-relief'),undefined);disposeTree(world.root);});
test('fading products render after their own page instead of disappearing behind it',()=>{
 const {world,update}=rig();for(const time of [37.8,39.1,40.4,41.8,42.8,46.3]){
  update(time);for(let i=0;i<4;i++){
   const card=world.root.getObjectByName(`analysis-card-${i}`),model=world.root.getObjectByName(`proposal-model-${i}`);
   assert.ok(card.children.find(o=>o.name==='decision-card-depth').renderOrder<card.renderOrder);
   model.traverse(mesh=>{if(mesh.isMesh)assert.ok(mesh.renderOrder>card.renderOrder,`${mesh.name} draws behind proposal ${i} at ${time}`);});
  }
 }disposeTree(world.root);
});

test('product previews stay below page headings and within their editorial card',()=>{const {world,update}=rig();update(39.1);for(let i=0;i<4;i++){const model=world.root.getObjectByName(`proposal-model-${i}`),card=world.root.getObjectByName(`analysis-card-${i}`),inverse=card.matrixWorld.clone().invert(),bounds=new THREE.Box3();model.traverse(mesh=>{if(!mesh.geometry)return;mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])bounds.expandByPoint(new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse));});assert.ok(bounds.max.y<.50,`heading collision in ${i}: ${bounds.max.y}`);assert.ok(bounds.min.y>-.89,`footer collision in ${i}: ${bounds.min.y}`);assert.ok(bounds.min.x>-1.3&&bounds.max.x<1.3);const badge=world.root.getObjectByName(`file-status-${i}-0`);badge.geometry.computeBoundingBox();const status=badge.geometry.boundingBox.clone().applyMatrix4(badge.matrix);assert.ok(bounds.max.x<status.min.x||bounds.min.x>status.max.x||bounds.max.y<status.min.y||bounds.min.y>status.max.y,`status collision in ${i}`);}disposeTree(world.root);});

// An opaque source photograph must never expose its rectangular background.
test('the drawing kit silhouette excludes background margins and keeps all four tool modules',()=>{
 const {world,update}=rig();update(77);const product=world.root.getObjectByName('persistent-drawing-product');
 const ray=new THREE.Raycaster(),target=new THREE.Vector3(),normal=new THREE.Vector3(0,0,-1).transformDirection(product.matrixWorld);
 const hit=(u,v)=>{target.set(u-.5,v-.5,1).applyMatrix4(product.matrixWorld);ray.set(target,normal);return ray.intersectObject(product,false).length>0;};
 for(const [u,v]of [[.08,.5],[.92,.5],[.5,.97],[.5,.02],[.15,.10]])assert.equal(hit(u,v),false);
 for(const [u,v]of [[.35,.5],[.65,.5],[.35,.27],[.65,.27],[.5,.76]])assert.equal(hit(u,v),true);
 disposeTree(world.root);
});
