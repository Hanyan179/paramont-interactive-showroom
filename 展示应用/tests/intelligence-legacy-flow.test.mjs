import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createIntelligenceFlow} from '../src/impact/intelligenceFlow.js';
import {getRenderQuality} from '../../共享组件/renderQuality.js';
function inspectGeometry(root){const records=[];root.traverse(object=>{if(object.geometry){const geometry=object.geometry;const p=geometry.attributes.position;assert.ok(p.array.every(Number.isFinite));records.push({object,positions:p.array,indices:geometry.index?.array});}});return records;}
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
