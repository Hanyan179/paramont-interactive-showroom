import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {resolveQuality} from '../../共享组件/renderQuality.js';
import {createIntelligenceDirector,intelligenceCycle,intelligenceTiming} from '../src/impact/intelligenceDirector.js';
import {journeyFrame,stageStarts,stageFrames,intelligencePresentation} from '../src/impact/intelligenceTimeline.js';
import {intelligenceWorld} from '../src/impact/intelligenceWorld.js';
import {intelligenceStages} from '../src/impact/intelligenceContent.js';
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
test('invalid selections and modified snapshots cannot corrupt the clock',()=>{const d=createIntelligenceDirector();for(const x of [-1,6,NaN,null,'2'])assert.equal(d.select(x),false);const s=d.snapshot();s.weights.fill(9);s.time=22;near(d.snapshot().time,0);assert.deepEqual(d.snapshot().weights,[1,0,0,0,0,0]);});
function rig(aspect=16/9){
 const originalDocument=globalThis.document,load=THREE.TextureLoader.prototype.load;
 const context=new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:text=>({width:text.length*55})},{get:(o,key)=>o[key]??(()=>{}),set:(o,key,v)=>(o[key]=v,true)});
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
 const loaded=[];THREE.TextureLoader.prototype.load=function(path){const data=readFileSync(new URL(`../public${path}`,import.meta.url));assert.equal(data.toString('ascii',12,16),'IHDR');const texture=new THREE.Texture({width:data.readUInt32BE(16),height:data.readUInt32BE(20)});loaded.push(texture);return texture;};
 let world;try{world=intelligenceWorld(resolveQuality(),new THREE.LoadingManager());}finally{THREE.TextureLoader.prototype.load=load;if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;}
 const camera=new THREE.PerspectiveCamera(46,aspect,.1,480),position=new THREE.Vector3(),target=new THREE.Vector3();
 const update=(t,lang="en")=>{world.update({lang,intelligence:{...intelligenceCycle(t),mode:'auto'},camera:position,target,aspect});camera.position.copy(position);camera.lookAt(target);camera.updateMatrixWorld();world.root.updateMatrixWorld(true);};
 return {world,camera,loaded,update};
}
function visibleState(root){const a=[];root.traverseVisible(o=>{if(o.material)a.push([o.name,...o.matrixWorld.elements,o.material.opacity]);});return a;}
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
test('only the product asset is loaded; all textures stay reachable for shared disposal',()=>{const {world,loaded}=rig();assert.equal(loaded.length,1);const reachable=new Set();world.root.traverse(o=>{if(o.material?.map)reachable.add(o.material.map);});assert.ok(reachable.has(loaded[0]));for(let i=1;i<5;i++)for(let status=0;status<3;status++)assert.equal(world.root.getObjectByName(`file-status-${i}-${status}`).material.map,world.root.getObjectByName(`file-status-0-${status}`).material.map);const resources=new Map();world.root.traverse(o=>{for(const r of [o.geometry,o.material,o.material?.map])if(r)resources.set(r,0);});resources.forEach((_,r)=>r.addEventListener('dispose',()=>resources.set(r,resources.get(r)+1)));disposeTree(world.root);assert.ok([...resources.values()].every(n=>n===1));});
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
test('every temporal boundary has continuous visible object transforms and opacity',()=>{const {world,update}=rig();for(const time of [7,17,18,25,27,28.6,29,29.2,29.5,30,30.5,31.2,32,33,34,37,39,40.5,43,45.5,48,49,50,51,54,55,56,56.5,58.7,59,59.3,60.5,61.5,62.9,64,65,66.5,68,70,73,75.5,76,79,85,90,93,95,96,97,98,100,106]){update(time-.00001);const before=new Map();world.root.traverse(o=>before.set(o,{matrix:[...o.matrixWorld.elements],opacity:o.material?.opacity,color:o.material?.color?.toArray(),visible:o.visible}));update(time+.00001);world.root.traverse(o=>{const b=before.get(o);if(o.visible&&b.visible&&o.material?.opacity>.01){o.matrixWorld.elements.forEach((v,i)=>near(v,b.matrix[i],.003));near(o.material.opacity,b.opacity,.003);o.material.color?.toArray().forEach((v,i)=>near(v,b.color[i],.003));}});}disposeTree(world.root);});
for(const [w,h] of [[1366,768],[1920,1080],[3840,2160],[1200,900]])test(`hero contents stay in the right-side safe area at ${w}x${h}`,()=>{const {world,camera,update}=rig(w/h);for(const t of [0,16,31,47,67,77,85,100,107]){update(t);for(const name of ['record-0','persistent-beauty-product','continuous-palette-craft']){const object=world.root.getObjectByName(name);if(!object.visible)continue;const center=new THREE.Vector3();object.getWorldPosition(center);const p=center.project(camera);assert.ok(p.x>=-.22&&p.x<=.94,`${name} at ${t}: ${p.x}`);assert.ok(p.y>-.57&&p.y<.7,`${name} at ${t}: ${p.y}`);}}disposeTree(world.root);});
test('all six stages retain distinct bilingual beauty examples without invented business outcomes',()=>{assert.equal(intelligenceStages.length,6);assert.equal(new Set(intelligenceStages.map(s=>s.id)).size,6);for(const s of intelligenceStages){for(const value of [s.name,s.description,s.example.title,s.example.summary,s.example.outcome,...s.example.steps])assert.ok(value.length===2&&value.every(t=>typeof t==='string'&&t.length));assert.doesNotMatch(JSON.stringify(s.example),/儿童|香水|\d+%/);}});

test('data lattice converges, reconstructs and retires without replacing its instances',()=>{const {world,update}=rig();const lattice=world.root.getObjectByName('data-lattice');assert.equal(lattice.count,8);update(9);const spread=[...lattice.instanceMatrix.array];update(16);const cube=[...lattice.instanceMatrix.array];assert.notDeepEqual(spread,cube);update(28);assert.notDeepEqual([...lattice.instanceMatrix.array],cube);update(33);assert.equal(lattice.visible,false);assert.ok([...lattice.instanceMatrix.array].every(Number.isFinite));disposeTree(world.root);});
test('insights foreground the same files that carry the selected design into decisioning',()=>{const {world,update}=rig(),card=world.root.getObjectByName('analysis-card-4');update(40);assert.ok(world.root.getObjectByName('analysis-card-0').visible);update(42);assert.equal(world.root.getObjectByName('file-status-1-0').visible,false);assert.ok(world.root.getObjectByName('file-status-1-1').visible);update(49);assert.equal(card.userData.reviewState,'selected');assert.equal(world.root.getObjectByName('analysis-card-1').userData.reviewState,'rejected');update(67);assert.equal(world.root.getObjectByName('analysis-card-4'),card);assert.equal(card.visible,false);assert.ok(world.root.getObjectByName('continuous-palette-craft').visible);disposeTree(world.root);});
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
test('the same palette leaves the proposal, separates its colours and assembles before photography',()=>{
 const {world,update}=rig(),craft=world.root.getObjectByName('continuous-palette-craft'),pan=world.root.getObjectByName('palette-pan-0'),photo=world.root.getObjectByName('persistent-beauty-product');
 update(47);assert.ok(craft.visible);assert.equal(craft.userData.phase,'proposal');assert.ok(pan.material.opacity<=world.root.getObjectByName('analysis-card-4').material.opacity+.001);const initial=craft.scale.x;
 update(57);assert.ok(craft.scale.x>initial*2);assert.ok(pan.userData.seated<.1);assert.equal(photo.visible,false);const spread=pan.position.clone();
 update(67);assert.equal(craft.userData.phase,'finish');assert.ok(pan.userData.seated>.99);assert.ok(pan.position.distanceTo(spread)>.2);assert.ok(world.root.getObjectByName('palette-mirror').material.opacity>.99);
 update(74);assert.ok(craft.visible&&photo.visible);near(craft.position.x,photo.position.x);near(craft.position.y,photo.position.y);update(77);assert.equal(craft.visible,false);assert.ok(photo.visible);disposeTree(world.root);
});
test('independently pivoted colour pans and hinge register exactly with the finished photograph',()=>{
 const {world,update}=rig(),photo=world.root.getObjectByName('persistent-beauty-product'),point=new THREE.Vector3(),reference=new THREE.Vector3();
 update(57);for(let i=0;i<4;i++){
  const pan=world.root.getObjectByName(`palette-pan-${i}`);assert.ok(Math.abs(pan.rotation.y)>.1);assert.ok(world.root.getObjectByName(`palette-pan-wall-${i}`).visible);
 }
 for(const t of [73,74,75.4]){
  update(t);for(const name of ['palette-pan-0','palette-pan-1','palette-pan-2','palette-pan-3','palette-mirror','palette-case']){
   const part=world.root.getObjectByName(name);
   for(let v=0;v<4;v++){
    point.fromBufferAttribute(part.geometry.attributes.position,v).applyMatrix4(part.matrixWorld);
    reference.fromBufferAttribute(photo.geometry.attributes.position,v).applyMatrix4(photo.matrixWorld);
    assert.ok(point.distanceTo(reference)<1e-6,`${name} loses image registration at ${t}`);
   }
  }
  for(let i=0;i<4;i++)assert.equal(world.root.getObjectByName(`palette-pan-wall-${i}`).visible,false);
 }
 disposeTree(world.root);
});
test('the palette belongs to its proposal plane before turning toward the processing view',()=>{
 const {world,update}=rig(),craft=world.root.getObjectByName('continuous-palette-craft'),card=world.root.getObjectByName('analysis-card-4'),front=new THREE.Quaternion();
 for(const t of [40,47,50,51]){update(t);near(craft.quaternion.angleTo(card.quaternion),0);}
 update(53);assert.ok(craft.quaternion.angleTo(front)<card.quaternion.angleTo(front));
 update(57);near(craft.quaternion.angleTo(front),0);disposeTree(world.root);
});
test('proposal writing retires before the expanding palette reaches its heading',()=>{
 const {world,update}=rig(),palette=world.root.getObjectByName('palette-pan-0');
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
test('the mountain face stays uninterrupted below the eyes during every expression',()=>{
 const {world,update}=rig(),face=world.root.getObjectByName('robot-blue-face'),ray=new THREE.Raycaster();
 for(const t of [31,41.8,44.6,49,76]){
  update(t);ray.set(face.localToWorld(new THREE.Vector3(0,-.40,1)),new THREE.Vector3(0,0,-1).transformDirection(face.matrixWorld));
  assert.ok(ray.intersectObject(face,false).length>0,`a mouth-like cut appears at ${t}`);
 }
 disposeTree(world.root);
});
test('reports and relationships finish gathering before the newborn robot expresses joy',()=>{
 const {world,update}=rig(),links=world.root.getObjectByName('analysis-connections'),node=world.root.getObjectByName('analysis-node-0'),eye=world.root.getObjectByName('robot-left-eye');
 update(24);const spread=node.position.length();update(28);assert.ok(node.position.length()<spread*.3);const wakingEye=eye.material.opacity;
 update(30.8);assert.equal(links.visible,false);for(let i=0;i<6;i++)assert.equal(world.root.getObjectByName(`report-face-${i}`).visible,false);
 assert.ok(eye.material.opacity>wakingEye);assert.equal(world.root.getObjectByName('mountain-robot').userData.expression,'happy');disposeTree(world.root);
});


test('manual stage dwell retains subtle motion while the paused shared clock freezes it',()=>{const {world}=rig(),camera=new THREE.Vector3(),target=new THREE.Vector3(),body=world.root.getObjectByName('data-to-assistant'),frame={...intelligenceCycle(16),mode:'manual',seeking:false};for(let i=0;i<=60;i++)world.update({camera,target,intelligence:frame,time:i*.05});const moving=body.rotation.y;for(let i=61;i<=120;i++)world.update({camera,target,intelligence:frame,time:i*.05});assert.ok(Math.abs(body.rotation.y-moving)>.02);const stopped=body.rotation.y;for(let i=0;i<20;i++)world.update({camera,target,intelligence:frame,time:6});near(body.rotation.y,stopped);disposeTree(world.root);});


test('language changes repaint text without replacing scene objects or resetting time',()=>{const {world,update}=rig();update(47,'zh');const record=world.root.getObjectByName('record-0'),map=record.material.map,cut=record.userData.typing.cut;assert.equal(record.userData.typing.text,'很棒的产品。');update(47,'en');assert.equal(record.userData.typing.text,'Great product.');assert.equal(record.material.map,map);assert.equal(record.userData.typing.cut,cut);near(world.root.userData.journeyTime,47);disposeTree(world.root);});
test('product stays out of analysis and decision, then appears from the design synthesis',()=>{const {world,update}=rig(),product=world.root.getObjectByName('persistent-beauty-product');for(const t of [40,47,58,67,72]){update(t);assert.equal(product.visible,false);}update(77);assert.equal(product.visible,true);disposeTree(world.root);});
test('commerce scrolls before purchase reviews arrive and those same reviews become exhibit cards',()=>{const {world,update}=rig(),record=world.root.getObjectByName('record-0'),page=world.root.getObjectByName('commerce-frame');update(85);assert.equal(record.visible,false);const initialOffset=page.material.map.offset.y;update(88);assert.equal(record.visible,false);assert.ok(page.material.map.offset.y<initialOffset);update(90);assert.equal(record.visible,true);assert.ok(record.children[1].material.opacity>.9);assert.equal(record.children[0].visible,false);update(98);assert.equal(record.children[1].visible,false);assert.ok(record.children[0].material.opacity>.9);update(107.99);assert.equal(record.children[0].visible,false);disposeTree(world.root);});
test('purchase and exhibit review frames share the same changing outline during their handoff',()=>{
 const {world,update}=rig();for(const t of [94,95,96,97,98]){update(t);for(let i=0;i<6;i++){
  const record=world.root.getObjectByName(`record-${i}`),[exhibit,purchase]=record.children;
  for(const part of [exhibit,purchase])part.geometry.computeBoundingBox();
  const a=exhibit.geometry.boundingBox.clone().applyMatrix4(exhibit.matrix),b=purchase.geometry.boundingBox.clone().applyMatrix4(purchase.matrix);
  for(const axis of ['x','y']){near(a.min[axis],b.min[axis]);near(a.max[axis],b.max[axis]);}
 }}disposeTree(world.root);
});
test('automatic playback is 25 percent faster while inactivity remains real time',()=>{const d=createIntelligenceDirector();advance(d,8);near(d.snapshot().time,10);});

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
 const {world,update}=rig();
 for(let t=7.5;t<=11;t+=.05){
  update(t);const bounds=[];world.root.traverseVisible(object=>{
   if(!object.name.startsWith('data-fragment-')||object.material.opacity<.2)return;
   object.geometry.computeBoundingBox();bounds.push({name:object.name,box:object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld)});
  });
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
   const a=bounds[i].box,b=bounds[j].box,overlapX=Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),overlapY=Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y);
   assert.ok(overlapX<0||overlapY<0,`${bounds[i].name} crosses ${bounds[j].name} at ${t}`);
  }
 }
 disposeTree(world.root);
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
 update(36);assert.equal(robot.userData.expression,'focused');const focused=Array.from(geometry.attributes.position.array);
 update(41.6);assert.equal(robot.userData.expression,'skeptical');assert.ok(left.userData.aperture<right.userData.aperture);assert.ok(Math.abs(robot.rotation.z)>.001);
 update(44.6);assert.equal(robot.userData.expression,'impatient');assert.ok(left.userData.aperture<.03);update(32.5);assert.equal(robot.userData.expression,'happy');assert.ok(left.userData.curvature>.99);assert.ok(robot.position.y>.09);assert.notDeepEqual(Array.from(geometry.attributes.position.array),focused);
 update(49);assert.equal(robot.userData.expression,'selected');assert.equal(left.geometry,geometry);assert.ok(left.userData.curvature>.4);disposeTree(world.root);
});
test('the robot blinks between reactions without hiding their expressive peaks',()=>{
 for(const t of [41.4,41.6,42,44.5,47.9,48.6,49,69.8])assert.ok(blinkAt(t)>.99,`expression hidden at ${t}`);
 for(const t of [40.8,55.35,62.55,70.75,76.25])assert.ok(blinkAt(t)<.2,`missing natural blink at ${t}`);
});

test('one robot remains alongside the selected product and becomes the commerce header logo',()=>{const {world,update}=rig(),robot=world.root.getObjectByName('mountain-robot'),body=robot.parent,product=world.root.getObjectByName('persistent-beauty-product');update(77);assert.ok(robot.visible&&product.visible);assert.equal(robot.userData.expression,'happy');const size=body.scale.x;update(85);assert.equal(world.root.getObjectByName('mountain-robot'),robot);assert.ok(robot.visible&&product.visible);assert.ok(body.scale.x<size*.3);assert.ok(body.position.x<-3&&body.position.y>2.5);update(90);assert.equal(robot.visible,false);disposeTree(world.root);});
test('the complete robot clears the product silhouette throughout its flight into the header',()=>{
 // Alpha bounds of the authored 1254 px product image, excluding transparent
 // margins. Project both objects because the hero sits in front of the robot.
 const productBounds=new THREE.Box3(new THREE.Vector3(160/1254-.5,.5-1161/1254,0),new THREE.Vector3(1094/1254-.5,.5-78/1254,0));
 for(const aspect of [1366/768,1920/1080,3840/2160,1200/900]){
  const {world,camera,update}=rig(aspect),robot=world.root.getObjectByName('robot-silver-shell'),product=world.root.getObjectByName('persistent-beauty-product');
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

test('five proposal pages retain five distinct physical product silhouettes',()=>{const {world,update}=rig();update(47);for(const name of ['lip-oil-vial','blush-tube','skin-tint-bottle','palette-mirror']){const object=world.root.getObjectByName(name);assert.ok(object);assert.ok(object.material.opacity>.1);}assert.equal(world.root.getObjectByName('forecast-relief'),undefined);disposeTree(world.root);});
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
