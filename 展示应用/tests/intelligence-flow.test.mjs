import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { getRenderQuality } from '../../共享组件/renderQuality.js';
import { createIntelligenceDirector, intelligenceCycle, intelligenceTiming } from '../src/impact/intelligenceDirector.js';
import { intelligenceWorld, intelligenceLayout } from '../src/impact/intelligenceWorld.js';
import { createIntelligenceFlow } from '../src/impact/intelligenceFlow.js';
import { createIntelligenceCase } from '../src/impact/intelligenceCase.js';
import { intelligenceStages } from '../src/impact/intelligenceContent.js';
import {createIntelligenceEvolution,evolutionPoint} from '../src/impact/intelligenceEvolution.js';
import {createIntelligenceCrystal} from '../src/impact/intelligenceCrystal.js';
import { createIntelligenceAssets, intelligenceAssetSources } from '../src/impact/intelligenceAssets.js';
import {proposalSample,proposalCase,intelligenceProposals} from '../src/impact/intelligenceProposalsContent.js';

const frame = .05;
const advance = (director, seconds, options) => {
  for (let i = 0; i < Math.round(seconds / frame); i++) director.tick(frame, options);
  return director.snapshot();
};
const near = (actual, expected, message = '') => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} ≠ ${expected}`);
const validWeights = weights => {
  assert.equal(weights.length, 6);
  assert.ok(weights.every(value => Number.isFinite(value) && value >= 0 && value <= 1));
  near(weights.reduce((sum, value) => sum + value, 0), 1, 'material remains normalized');
};
const focused = (state, stage) => {
  assert.equal(state.stage, stage);
  state.weights.forEach((weight, i) => near(weight, Number(i === stage), `stage ${stage}, material ${i}`));
};

test('six stages occupy a 48 second cycle, with five seconds to read and three to morph', () => {
  assert.equal(intelligenceTiming.cycle, 48);
  assert.equal(intelligenceTiming.stages, 6);
  assert.equal(intelligenceTiming.hold, 5);
  assert.equal(intelligenceTiming.morph, 3);
  for (let stage = 0; stage < 6; stage++) {
    for (const offset of [0, .05, 2.5, 4.95, 5]) {
      const state = intelligenceCycle(stage * 8 + offset);
      focused(state, stage);
      near(state.transition, 0);
    }
    const middle = intelligenceCycle(stage * 8 + 6.5);
    near(middle.weights[stage], .5);
    near(middle.weights[(stage + 1) % 6], .5);
    assert.equal(middle.stage, stage, 'the current label remains readable while its material transforms');
  }
});

test('every frame blends only adjacent stages and conserves material throughout repeated loops', () => {
  for (let sample = 0; sample < 3 * 48 / frame; sample++) {
    const state = intelligenceCycle(sample * frame);
    validWeights(state.weights);
    state.weights.forEach((weight, i) => {
      if (i !== state.stage && i !== (state.stage + 1) % 6) near(weight, 0);
    });
    const repeated = intelligenceCycle(sample * frame + 48);
    repeated.weights.forEach((weight, i) => near(weight, state.weights[i]));
  }
});

test('knowledge returns continuously into data at the 47.999 to zero second seam', () => {
  const before = intelligenceCycle(47.999);
  const after = intelligenceCycle(0);
  assert.ok(before.weights[0] > .999999);
  before.weights.forEach((weight, i) => near(weight, after.weights[i], `loop seam ${i}`));
  assert.deepEqual(intelligenceCycle(48).weights, after.weights);
  assert.deepEqual(intelligenceCycle(96).weights, after.weights);
  validWeights(before.weights);
});

test('automatic playback follows the shared frame clock and keeps its loop continuous', () => {
  const director = createIntelligenceDirector();
  advance(director, 47.95);
  const before = director.snapshot();
  assert.equal(before.mode, 'auto');
  assert.ok(before.weights[0] > .9999);
  const after = director.tick(frame);
  assert.ok(after.weights[0] > .999999999);
  validWeights(after.weights);
  focused(advance(director, .05), 0);
});

test('selecting an arbitrary stage preserves the current material and reaches it in 1.6 seconds', () => {
  const director = createIntelligenceDirector();
  const moving = advance(director, 6.5);
  assert.equal(director.select(4), true);
  assert.deepEqual(director.snapshot().weights, moving.weights, 'selection itself cannot snap to a new shape');
  assert.equal(director.snapshot().mode, 'manual');
  let previous = director.snapshot().weights[4];
  for (let i = 0; i < 32; i++) {
    const state = director.tick(frame);
    validWeights(state.weights);
    assert.ok(state.weights[4] >= previous, 'focus keeps moving toward the requested stage');
    previous = state.weights[4];
  }
  focused(director.snapshot(), 4);
  assert.equal(director.isMoving(), false);
  focused(advance(director, 30), 4);
});

test('rapid retargeting starts each new transition from the visible material, without jumps', () => {
  const director = createIntelligenceDirector();
  advance(director, 7);
  for (const target of [4, 2, 5, 1]) {
    const before = director.snapshot().weights;
    director.select(target);
    assert.deepEqual(director.snapshot().weights, before);
    const state = advance(director, .35);
    validWeights(state.weights);
    assert.equal(state.stage, target);
  }
  focused(advance(director, 1.6), 1);
  assert.equal(director.snapshot().mode, 'manual');
});

test('a business example protects its selected stage and return keeps that stage selected', () => {
  const director = createIntelligenceDirector();
  director.select(3);
  advance(director, 1.6);
  director.openExample();
  const reading = advance(director, 180);
  focused(reading, 3);
  assert.equal(reading.mode, 'case', 'reading longer than the idle limit must not change the scene');
  director.closeExample();
  assert.equal(director.snapshot().mode, 'manual');
  focused(director.snapshot(), 3);
  assert.equal(advance(director, 89.95).mode, 'manual', 'return starts a fresh inactivity interval');
});

test('90 seconds of inactivity resumes from the selected stage, and activity restarts that interval', () => {
  const director = createIntelligenceDirector();
  director.select(4);
  advance(director, 80);
  director.activity();
  focused(advance(director, 89.95), 4);
  assert.equal(director.snapshot().mode, 'manual');
  const resumed = advance(director, .1);
  assert.equal(resumed.mode, 'auto');
  focused(resumed, 4);
  focused(advance(director, 1.6 + 4), 4);
  const next = advance(director, 4.1);
  assert.equal(next.stage, 5, 'resuming continues toward the next stage rather than resetting to data');
});

for (const options of [{ playing: false }, { active: false }, { suspended: true }, { held: true }]) {
  test(`${JSON.stringify(options)} prevents unattended stage and idle clocks from advancing`, () => {
    const director = createIntelligenceDirector();
    advance(director, 6.5);
    const before = director.snapshot();
    assert.deepEqual(advance(director, 120, options), before);
    director.select(2);
    advance(director, 1.6);
    const manual = director.snapshot();
    assert.deepEqual(advance(director, 120, options), manual);
    assert.equal(advance(director, 20).mode, 'manual', 'blocked time must not count toward inactivity');
  });
}

test('a visitor can explicitly select and focus a stage while automatic playback is paused', () => {
  const director = createIntelligenceDirector();
  advance(director, 6.5);
  const before = director.snapshot();
  director.select(5);
  assert.deepEqual(director.snapshot().weights, before.weights);
  focused(advance(director, 1.6, { playing: false }), 5);
  assert.equal(director.snapshot().mode, 'manual');
  focused(advance(director, 120, { playing: false }), 5);
});

test('suspended, inactive and held scenes freeze even an explicit focus until interaction resumes', () => {
  for (const options of [{ active: false }, { suspended: true }, { held: true }]) {
    const director = createIntelligenceDirector();
    director.select(4);
    advance(director, .4);
    const before = director.snapshot();
    assert.deepEqual(advance(director, 120, options), before);
    focused(advance(director, 1.2), 4);
  }
});

test('reduced motion keeps stage selection available without animated or idle-driven progression', () => {
  const director = createIntelligenceDirector({ reduced: true });
  assert.equal(director.snapshot().mode, 'manual');
  for (const stage of [5, 2, 0, 4]) {
    assert.equal(director.select(stage), true);
    focused(director.snapshot(), stage);
    assert.equal(director.isMoving(), false);
    focused(advance(director, 120), stage);
    focused(advance(director, 120, { playing: false }), stage);
  }
});

test('invalid selections and caller-mutated snapshots cannot corrupt the running scene', () => {
  const director = createIntelligenceDirector();
  advance(director, 6.5);
  const before = director.snapshot();
  for (const input of [-1, 6, 1.5, '2', NaN, undefined]) {
    assert.equal(director.select(input), false);
    assert.deepEqual(director.snapshot(), before);
  }
  const external = director.snapshot();
  external.weights.fill(0);
  assert.deepEqual(director.snapshot(), before);
});

test('all six entry points have distinct bilingual business examples without invented numeric outcomes', () => {
  assert.deepEqual(intelligenceStages.map(stage => stage.id), ['assets', 'analytics', 'insights', 'decisioning', 'impact', 'evolution']);
  const titles = new Set();
  const bilingual = value => {
    assert.equal(value.length, 2);
    assert.ok(value.every(text => typeof text === 'string' && text.trim().length > 0));
  };
  for (const stage of intelligenceStages) {
    [stage.name, stage.action, stage.description, stage.example.title, stage.example.summary, stage.example.outcome].forEach(bilingual);
    assert.ok(stage.example.steps.length >= 2, `${stage.id} needs an explorable business sequence`);
    stage.example.steps.forEach(bilingual);
    titles.add(stage.example.title[0]);
    assert.doesNotMatch(JSON.stringify(stage.example), /[+−-]?\d[\d,.]*\s*(?:%|％|倍|万元|亿美元|million|billion)/iu, `${stage.id} must not present invented measured performance`);
  }
  assert.equal(titles.size, 6);
});

function imageAsset(url) {
  const bytes = readFileSync(new URL(`../public${url}`, import.meta.url));
  if (/\.jpe?g$/i.test(url)) {
    assert.equal(bytes.readUInt16BE(0), 0xffd8, `${url} is a real JPEG`);
    for (let offset = 2; offset + 9 < bytes.length;) {
      assert.equal(bytes[offset], 0xff);
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      const length = bytes.readUInt16BE(offset);
      if ([0xc0, 0xc1, 0xc2].includes(marker)) {
        return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
    assert.fail(`${url} has no JPEG dimensions`);
  }
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${url} is a real PNG`);
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function sceneRig(width, height) {
  const loaded = [], manager = new THREE.LoadingManager();
  const originalLoad = THREE.TextureLoader.prototype.load;
  let world;
  // Node has no DOM image decoder. Preserve actual local dimensions and the
  // real texture objects; the browser acceptance verifies image decoding.
  THREE.TextureLoader.prototype.load = function(url, onLoad) {
    assert.equal(this.manager, manager, 'all layers participate in the shared loading manager');
    const texture = new THREE.Texture(imageAsset(url));
    loaded.push({ url, texture });
    onLoad?.(texture);
    return texture;
  };
  try { world = intelligenceWorld(getRenderQuality(), manager); }
  finally { THREE.TextureLoader.prototype.load = originalLoad; }
  const scene = new THREE.Scene();
  scene.add(world.root);
  const camera = new THREE.PerspectiveCamera(46, width / height, .1, 480);
  const position = new THREE.Vector3(), target = new THREE.Vector3();
  const update = (state, { time = 0, depthMix = 0, reduced = false, proposal = {} } = {}) => {
    world.update({ intelligence: state, intelligenceProposal:proposal, time, depthMix, camera: position, target, aspect: width / height, dt: frame, overviewImmediate: true, homeImmediate: reduced });
    camera.position.copy(position);
    camera.lookAt(target);
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    assert.ok([...position.toArray(), ...target.toArray()].every(Number.isFinite));
  };
  const projected = point => {
    const p = point.clone().project(camera);
    return { x: (p.x + 1) * width / 2, y: (1 - p.y) * height / 2 };
  };
  const subjects = intelligenceStages.map(stage => {
    const subject = world.root.getObjectByName(`intelligence-${stage.id}`);
    assert.ok(subject, `the ${stage.id} entry has a visible subject`);
    return subject;
  });
  const pointFor = subject => projected(subject.getWorldPosition(new THREE.Vector3()));
  const pick = point => world.pick(point.x, point.y, width, height, camera);
  return { world, camera, update, loaded, subjects, pointFor, pick };
}

function inspectGeometry(root) {
  const records = [];
  root.traverse(object => {
    if (!object.geometry) return;
    const geometry = object.geometry;
    const position = geometry.getAttribute('position');
    assert.ok(position, 'each drawn object has geometric positions');
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      assert.ok(attribute.array.every(Number.isFinite), `${object.type} ${name} must remain finite`);
    }
    if (geometry.index) {
      assert.ok(geometry.index.array.every(index => Number.isInteger(index) && index >= 0 && index < position.count), 'every triangle or line index addresses an existing vertex');
      if (object.isMesh) assert.equal(geometry.index.count % 3, 0, 'mesh topology contains complete triangles');
    }
    if (object.isInstancedMesh) assert.ok(object.instanceMatrix.array.every(Number.isFinite), 'fragment transforms stay finite');
    assert.ok(object.matrixWorld.elements.every(Number.isFinite));
    records.push({ object, geometry, positions: position.array, indices: geometry.index?.array });
  });
  return records;
}

for (const [width, height] of [[1920, 1080], [1366, 768], [3840, 2160], [1200, 900]]) {
  test(`one product protagonist and six selectable details retain their protected cases at ${width}×${height}`, () => {
    const { world, update, loaded, subjects, pointFor, pick } = sceneRig(width, height);
    const state = (stage, mode = 'manual') => ({ stage, mode, weights: Array.from({ length: 6 }, (_, i) => Number(i === stage)) });
    update(state(0, 'auto'));
    const original = inspectGeometry(world.root);
    const initialLoads = loaded.length;
    assert.ok(initialLoads > 0, 'the backdrop and globe surfaces are preloaded');
    const assertRetained = () => {
      const current = inspectGeometry(world.root);
      assert.equal(current.length, original.length);
      current.forEach((record, i) => {
        assert.equal(record.object, original[i].object);
        assert.equal(record.geometry, original[i].geometry);
        assert.equal(record.positions, original[i].positions);
        assert.equal(record.indices, original[i].indices);
      });
      assert.equal(loaded.length, initialLoads, 'navigation does not reload image resources');
    };
    for (let stage = 0; stage < 6; stage++) {
      update(state(stage, 'auto'), { time: stage * 8 });
      subjects.forEach((subject, i) => {
        assert.equal(subject.children[0].visible,i===4,'only the selected proposal is exhibited in the overview');
      });
      const point=pointFor(subjects[4]);
      near(point.x/width,width/height<=1.5?.63:intelligenceLayout.heroX,'fixed hero composition');
      assert.deepEqual(pick(point),{intelligence:true,focusId:'impact'});
      assert.ok(world.root.getObjectByName('intelligence-proposal-exhibit').visible,'the volumetric proposal is the protagonist');
      assert.equal(world.root.getObjectByName('product-orbit-exhibit'),undefined,'flat product satellites are absent from the active scene');
      if (width / height > 1.5) assert.equal(pick({ x: width * .1, y: height * .4 }), null, 'the left reading column is not clickable scenery');
      assert.equal(pick({ x: width * .5, y: height * .92 }), null, 'the fixed footer is outside all scene targets');
      update(state(stage), { depthMix: .5 });
      subjects.forEach(subject => assert.equal(pick(pointFor(subject)), null, 'entry and return transitions cannot open a different layer'));
      update(state(stage), { depthMix: 1 });
      subjects.forEach((subject, i) => assert.equal(subject.children[0].visible, i === stage, 'settled detail shows only its selected model'));
      assert.deepEqual(pick(pointFor(subjects[stage])), { intelligence: true, focusId: intelligenceStages[stage].id });
      assert.equal(pick({ x: width * .1, y: height * .4 }), null);
      for (let x = .25; x < 1; x += .05) {
        const hit = pick({ x: x * width, y: intelligenceLayout.detailY * height });
        if (hit) assert.equal(hit.focusId, intelligenceStages[stage].id, 'hidden overlapping subjects cannot steal a detail hit');
      }
      update(state(stage, 'case'), { depthMix: 1 });
      subjects.forEach((subject,i) => {
        assert.equal(subject.children[0].visible, [2,3,4,5].includes(stage)&&i===stage, 'refined models retain their identity in their business cases');
        assert.equal(pick(pointFor(subject)), null, 'case mode cannot reopen itself');
      });
      update(state(stage), { depthMix: 1 });
      assert.deepEqual(pick(pointFor(subjects[stage])), { intelligence: true, focusId: intelligenceStages[stage].id });
      update(state(stage), { depthMix: 0 });
      assertRetained();
    }
  });
}

test('candidate products open, compose and keep their identity through review without fetching replacement imagery', () => {
  const {world,loaded,update}=sceneRig(1920,1080),loads=loaded.length;
  const state={stage:4,mode:'manual',weights:[0,0,0,0,1,0]};
  const initial=inspectGeometry(world.root);
  for(const scheme of ['A','B','C']){
    const candidate=world.root.getObjectByName(`intelligence-proposal-${scheme}`);
    const kit=candidate.getObjectByName('portable-creative-kit');
    update(state,{proposal:{scheme,step:0,variant:1,region:2},time:0});
    assert.ok(candidate.visible);
    const closed=kit.userData.lidAngle;
    update(state,{proposal:{scheme,step:1,variant:1,region:2},time:4,depthMix:1});
    assert.ok(kit.userData.lidAngle<closed-.8,'opening is articulated at the hinge');
    const selectedGeometry=kit.children[0].geometry;
    update({...state,mode:'case'},{proposal:{scheme,step:1,variant:1,region:2},time:4,depthMix:1});
    assert.equal(kit.children[0].geometry,selectedGeometry,'the review retains the same product');
    if(scheme==='B'){
      assert.equal(candidate.getObjectByName('decorative-land-lights').visible,false);
      assert.equal(candidate.getObjectByName('gold-light-orbit-1').visible,false);
      assert.equal(candidate.getObjectByName('research-region-2').visible,true);
    }
    if(scheme==='C'){
      assert.equal(candidate.getObjectByName('assortment-tool-cup').visible,true);
      update(state,{proposal:{scheme,step:1,variant:0},time:4});
      assert.equal(candidate.getObjectByName('assortment-tool-cup').visible,false,'the portable brief removes the desktop accessory');
    }
    const matrices=()=>{world.root.updateMatrixWorld(true);const entries=[];candidate.traverse(object=>entries.push(...object.matrixWorld.elements));return entries;};
    update(state,{proposal:{scheme,step:1},time:2,reduced:true});const still=matrices();
    update(state,{proposal:{scheme,step:1},time:500,reduced:true});assert.deepEqual(matrices(),still,'reduced motion has no hidden time progression');
  }
  assert.equal(loaded.length,loads);
  const after=inspectGeometry(world.root);assert.equal(after.length,initial.length);
  after.forEach((item,i)=>assert.equal(item.geometry,initial[i].geometry));
  for(const entry of intelligenceProposals){
    const example=proposalCase(entry.id);assert.equal(example.steps.length,3);
    assert.ok(example.steps.flat().every(text=>text.length>5));
  }
  assert.equal(proposalSample(24).phase,0);
  assert.equal(proposalSample(500,1).phase,1);
  assert.deepEqual(proposalSample(10,null,true),proposalSample(900,null,true));
});

test('all six models remain volumetric and the retired knowledge image cards are no longer loaded', () => {
  const { world, loaded, subjects, update } = sceneRig(1920, 1080);
  assert.deepEqual(new Set(loaded.map(item => item.url)), new Set(['/media/materials/earth/blue-marble-july-5400.jpg', '/media/materials/earth/earth-normal.jpg', '/media/materials/earth/ocean-mask.jpg']));
  for (const { url, texture } of loaded) {
    assert.ok(texture.image.width >= 1024 && texture.image.height >= 512, `${url} should not be a low-resolution reference thumbnail`);
    if (/backdrop|blue-marble|categories/.test(url)) assert.equal(texture.colorSpace, THREE.SRGBColorSpace);
  }
  update({ stage: 0, mode: 'auto', weights: [1, 0, 0, 0, 0, 0] });
  for (const subject of [...subjects, world.root.getObjectByName('intelligence-business-case')]) {
    assert.ok(subject);
    let physicalSurfaces = 0;
    subject.traverse(object => {
      assert.ok(!object.isSprite, 'the full scene cannot be a camera-facing sprite');
      if (!object.geometry || !object.material?.isMeshPhysicalMaterial) return;
      physicalSurfaces++;
      const box = new THREE.Box3().setFromBufferAttribute(object.geometry.attributes.position);
      assert.ok(box.max.z - box.min.z > .001, 'physical surfaces have actual depth');
      if (object.material.map) assert.ok(object.geometry.type === 'SphereGeometry', 'a surface image may wrap the globe but may not replace a stage');
    });
    assert.ok(physicalSurfaces > 0, 'each subject includes light-reactive physical surfaces');
  }
});

test('all loaded texture resources remain reachable by the parent scene disposer', () => {
  const { world, loaded } = sceneRig(1920, 1080);
  const ownedTextures = new Set();
  world.root.traverse(object => {
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material) for (const value of Object.values(material)) if (value?.isTexture) ownedTextures.add(value);
    }
  });
  assert.deepEqual(ownedTextures, new Set(loaded.map(item => item.texture)), 'the parent disposer can discover all source textures through material fields');
});

test('data assets gather external sources and expert knowledge with persistent, pausable geometry', () => {
  const { world, update, subjects } = sceneRig(1920, 1080);
  const state = {stage:0,mode:'manual',weights:[1,0,0,0,0,0]};
  update(state,{depthMix:1});
  assert.deepEqual(intelligenceAssetSources.map(source=>source.id), ['internet','reports','trends','industry-experts','business-experts']);
  assert.equal(subjects[0].getObjectByName('product-records-archive'), undefined);
  for(const source of intelligenceAssetSources) assert.ok(subjects[0].getObjectByName(`asset-source-${source.id}`));
  subjects[0].traverse(object=>assert.ok(!object.material?.map,'the asset stage conveys research through geometry, not product images'));
  const packets=subjects[0].getObjectByName('source-to-knowledge-packets');
  const geometry=packets.geometry,matrices=packets.instanceMatrix.array;
  const initial=[...matrices];
  update(state,{depthMix:1,time:2});
  assert.ok(matrices.some((value,i)=>value!==initial[i]),'source information visibly travels toward the knowledge core');
  update(state,{depthMix:1,time:2,reduced:true});
  const held=[...matrices];
  update(state,{depthMix:1,time:40,reduced:true});
  assert.deepEqual([...matrices],held,'reduced motion freezes source movement');
  assert.equal(packets.geometry,geometry,'animation retains source geometry');
  update({...state,mode:'case'},{depthMix:1});
  assert.ok(world.root.getObjectByName('asset-research-case').visible,'the asset case stays about sources and expert review');
  assert.equal(world.root.getObjectByName('intelligence-business-case').visible,false,'product output scenes do not replace source research');
});

test('each asset model has local motion beyond the connecting particles, and all effects freeze together', () => {
  const exhibit=createIntelligenceAssets(getRenderQuality());
  const names=['knowledge-reading-scan-0','knowledge-reading-scan-2','knowledge-reading-scan-4','expert-review-inlay-3','expert-review-inlay-4'];
  const capture=()=>names.map(name=>{
    const object=exhibit.root.getObjectByName(name);assert.ok(object,name);
    return {matrix:[...object.matrix.elements],positions:[...object.geometry.attributes.position.array],opacity:object.material.opacity};
  });
  const update=(time,reduced=false)=>{exhibit.update({time,reduced});exhibit.root.updateMatrixWorld(true);};
  update(0);const initial=capture();
  update(1.8);const animated=capture();
  names.forEach((name,i)=>assert.notDeepEqual(animated[i],initial[i],`${name} animates inside its own model`));
  const geometry=exhibit.root.getObjectByName('knowledge-leaf-2').geometry;
  const positions=geometry.attributes.position.array;
  for(let n=0;n<40;n++){update(n*.23);inspectGeometry(exhibit.root);}
  assert.equal(exhibit.root.getObjectByName('knowledge-leaf-2').geometry,geometry);
  assert.equal(geometry.attributes.position.array,positions,'wave deformation reuses the same buffer');
  update(2,true);const held=capture();update(50,true);assert.deepEqual(capture(),held);
  update(4);const paused=capture();update(4);assert.deepEqual(capture(),paused,'an unchanged parent clock freezes geometry and micro-effects');
});

test('the global exhibit has real moving feedback particles, with a frozen reduced-motion state', () => {
  const { world, update } = sceneRig(1920, 1080);
  const state = { stage: 0, mode: 'auto', weights: [1, 0, 0, 0, 0, 0] };
  const particles = [];
  world.root.traverse(object => { if (object.isPoints) particles.push(object.geometry.attributes.position); });
  assert.ok(particles.length > 0);
  update(state);
  const atStart = particles.map(attribute => [...attribute.array]);
  update(state, { time: 1 });
  assert.ok(particles.some((attribute, i) => attribute.array.some((value, j) => value !== atStart[i][j])));
  update(state, { time: 1, reduced: true });
  const held = particles.map(attribute => [...attribute.array]);
  update(state, { time: 20, reduced: true });
  particles.forEach((attribute, i) => assert.deepEqual([...attribute.array], held[i]));
});

test('the same matter crosses every morph and the loop seam without a reset or replacement', () => {
  const { world, update } = sceneRig(1920, 1080);
  const matter = world.root.getObjectByName('continuous-intelligence-matter');
  assert.ok(matter, 'the shared particle field carries material between every stage');
  const points = matter.children.find(object => object.isPoints);
  assert.ok(points && points.geometry.attributes.position.count >= 1000, 'one substantial particle batch carries the transformation');
  const positions = points.geometry.attributes.position.array;
  const particleObject = points, geometry = points.geometry;
  let previous;
  for (let sample = 0; sample <= 48 / frame; sample++) {
    const time = sample * frame;
    update(intelligenceCycle(time), { time, depthMix: 1 });
    assert.equal(points, particleObject);
    assert.equal(points.geometry, geometry);
    assert.equal(points.geometry.attributes.position.array, positions);
    assert.ok(positions.every(Number.isFinite));
    if (previous) {
      let largestStep = 0;
      for (let i = 0; i < positions.length; i += 3) {
        largestStep = Math.max(largestStep, Math.hypot(positions[i] - previous[i], positions[i + 1] - previous[i + 1], positions[i + 2] - previous[i + 2]));
      }
      assert.ok(largestStep < .8, `50 ms movement must remain continuous at ${time}s: ${largestStep}`);
    }
    previous = positions.slice();
  }
  // An explicit selection must start from the actual material on screen, even
  // when the visitor changes their mind in the middle of the previous move.
  const director = createIntelligenceDirector();
  advance(director, 6.5);
  for (const stage of [5, 3, 1]) {
    update(director.snapshot(), { time: 10, depthMix: 1 });
    const before = positions.slice();
    director.select(stage);
    update(director.snapshot(), { time: 10, depthMix: 1 });
    assert.deepEqual(positions, before, 'selecting does not instantly move the particle field');
    advance(director, .35);
  }
});

test('the case provides three spatial analysis panels and creative products without image planes', () => {
  const exhibit = createIntelligenceCase(getRenderQuality());
  const panels = ['case-records-panel', 'case-analysis-panel', 'case-options-panel'].map(name => exhibit.root.getObjectByName(name));
  const products = ['case-geometric-blocks', 'case-stacking-rings', 'case-brushes-and-pencils'].map(name => exhibit.root.getObjectByName(name));
  assert.ok([...panels, ...products].every(Boolean));
  assert.equal(exhibit.root.userData.illustrative, true);
  exhibit.root.traverse(object => {
    assert.ok(!object.isSprite);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material) assert.ok(Object.values(material).every(value => !value?.isTexture), 'the case is built from spatial geometry, not a panel-sized image');
    }
  });
  const original = inspectGeometry(exhibit.root);
  const resourceCount = original.length;
  const position = new THREE.Vector3();
  for (let stage = 0; stage < 6; stage++) {
    for (const time of [0, 8.05, 23.95, 47.95, 48, 60]) {
      exhibit.update({ stage, time });
      exhibit.root.updateMatrixWorld(true);
      const current = inspectGeometry(exhibit.root);
      assert.equal(current.length, resourceCount);
      current.forEach((record, i) => {
        assert.equal(record.object, original[i].object);
        assert.equal(record.geometry, original[i].geometry);
        assert.equal(record.positions, original[i].positions);
      });
      const size = new THREE.Box3().setFromObject(exhibit.root).getSize(position);
      assert.ok(size.x > 8 && size.x < 12 && size.y > 6 && size.y < 10 && size.z > 3 && size.z < 5.5, 'the case fits the reserved right-hand scene volume');
    }
  }
  const snapshot = () => {
    const values = [];
    exhibit.root.updateMatrixWorld(true);
    exhibit.root.traverse(object => {
      values.push(...object.matrixWorld.elements);
      if (object.isInstancedMesh) values.push(...object.instanceMatrix.array);
    });
    return values;
  };
  exhibit.update({ stage: 2, time: 1, reduced: true });
  const held = snapshot();
  exhibit.update({ stage: 2, time: 25, reduced: true });
  assert.deepEqual(snapshot(), held, 'reduced-motion viewing does not drift');
  exhibit.update({ stage: 2, time: 25 });
  assert.notDeepEqual(snapshot(), held, 'normal viewing keeps gentle scene motion');
});

test('the retained procedural flow still conserves its topology across all six targets', () => {
  const flow = createIntelligenceFlow(getRenderQuality());
  try {
    const original = inspectGeometry(flow.root);
    for (let stage = 0; stage < 6; stage++) {
      for (const blend of [0, .5, 1]) {
        const weights = Array(6).fill(0);
        weights[stage] = 1 - blend;
        weights[(stage + 1) % 6] = blend;
        flow.update({ time: stage + blend, weights });
        const current = inspectGeometry(flow.root);
        assert.equal(current.length, original.length);
        current.forEach((record, i) => {
          assert.equal(record.object, original[i].object);
          assert.equal(record.positions, original[i].positions);
          assert.equal(record.indices, original[i].indices);
        });
      }
    }
  } finally { flow.dispose(); }
});

test('flow disposal releases every unique geometry and material exactly once', () => {
  const world = createIntelligenceFlow(getRenderQuality());
  const resources = new Map();
  world.root.traverse(object => {
    if (object.geometry) resources.set(object.geometry, 0);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (material) resources.set(material, 0);
    }
  });
  assert.ok(resources.size > 0);
  resources.forEach((_, resource) => resource.addEventListener('dispose', () => resources.set(resource, resources.get(resource) + 1)));
  world.dispose();
  world.dispose();
  assert.ok([...resources.values()].every(count => count === 1));
});
