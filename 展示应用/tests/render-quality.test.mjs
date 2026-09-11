import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveQuality,modelDetail,pixelRatioFor,requestedPreset,applyRendererQuality} from '../../共享组件/renderQuality.js';
import {createProduct,disposeProduct} from '../../品牌融合世界/src/models.js';
import {createDataWorkstation} from '../src/components/DataWorkstation.js';
import * as T from '../node_modules/three/build/three.module.js';

test('exhibition renders native 4K; fluid only scales the drawing buffer',()=>{
  const high=resolveQuality({preset:'exhibition'}),low=resolveQuality({preset:'fluid'});
  assert.equal(pixelRatioFor(3840,2160,1,high.render),1);
  assert.ok(pixelRatioFor(3840,2160,1,low.render)<.62);
  assert.equal(pixelRatioFor(0,0,2,high.render),2);
  assert.ok(pixelRatioFor(7680,2160,2,high.render,4096)<=4096/7680);
});
test('per-product overrides inherit the family and cannot mutate other models',()=>{
  const q=resolveQuality({preset:'exhibition',models:{products:{geometry:1.5},lipstick:{geometry:2},china:{surfaceDetail:false}}});
  assert.equal(q.models.serum.geometry,1.5);assert.equal(q.models.lipstick.geometry,2);
  assert.equal(q.models.monument.geometry,1.25);assert.equal(q.models.china.surfaceDetail,false);
  assert.equal(q.models.cambodia.surfaceDetail,true);
  assert.throws(()=>modelDetail('missing',q),/Unregistered/);
});
test('invalid settings are reported and bounded before reaching WebGL',()=>{
  const q=resolveQuality({preset:'invalid',render:{maxDpr:Infinity,shadowMapSize:9999,ao:'true',maxPixels:0},models:{globe:{geometry:100},mars:{}}});
  assert.equal(q.preset,'exhibition');assert.equal(q.render.shadowMapSize,4096);
  assert.equal(q.render.maxDpr,2);assert.equal(q.render.maxPixels,1e6);
  assert.equal(modelDetail('globe',q).segment(999,'rounded'),6);
  assert.equal(modelDetail('globe',q).segment(999),256);assert.ok(q.warnings.length>=6);
});
test('child renderer uses the same-origin owner quality, cross-origin stays independent',()=>{
  const win={location:{origin:'http://local',search:'?quality=fluid'},parent:{location:{origin:'http://local',search:'?quality=studio'}}};
  assert.equal(requestedPreset(win),'studio');
  Object.defineProperty(win.parent,'location',{get(){throw new Error('cross-origin');}});
  assert.equal(requestedPreset(win),'fluid');
});
test('hardware constraints apply once and retain requested limits for future devices',()=>{
  const renderer={capabilities:{maxTextureSize:2048,maxSamples:2,getMaxAnisotropy:()=>4},shadowMap:{},domElement:{dataset:{}}};
  const q=resolveQuality({preset:'studio'}),actual=applyRendererQuality(renderer,T,q);
  assert.equal(actual.msaa,2);assert.equal(actual.shadowMapSize,2048);assert.equal(actual.anisotropy,4);
  assert.equal(q.render.shadowMapSize,4096);assert.equal(renderer.transmissionResolutionScale,1);
});

// Canvas pixels are not evaluated here; browser review covers appearance.
// This supplies only the authoring surface for the real Three.js model factories.
function canvasDocument(){return {createElement:()=>({width:1,height:1,getContext:()=>({scale(){},fillRect(){},fillText(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}})})};}
function triangles(root){let count=0;root.traverse(o=>{if(o.isMesh)count+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});return count;}
test('all eight product factories gain real geometry, keeping proportions and picking identities',()=>{
  const before=globalThis.document;globalThis.document=canvasDocument();
  try {
    for(const id of ['lipstick','serum','compact','rings','maraca','puzzle','balloon','gift']){
      const low=createProduct(id,resolveQuality({preset:'fluid'})),high=createProduct(id,resolveQuality({preset:'studio'}));
      assert.ok(triangles(high)>triangles(low),id);
      const a=new T.Box3().setFromObject(low).getSize(new T.Vector3()),b=new T.Box3().setFromObject(high).getSize(new T.Vector3());
      assert.ok(a.distanceTo(b)<.08,`${id} changed silhouette: ${a.distanceTo(b)}`);
      high.traverse(o=>{if(o.isMesh){assert.equal(o.userData.productId,id);assert.ok(Number.isFinite(o.geometry.boundingSphere.radius));}});
      disposeProduct(low);disposeProduct(high);
    }
  } finally {globalThis.document=before;}
});
test('shared fine-finish textures are released exactly once per model',()=>{
  const before=globalThis.document;globalThis.document=canvasDocument();
  try {
    const root=createProduct('lipstick',resolveQuality({preset:'studio'})),counts=new Map();
    root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)for(const t of Object.values(m))if(t?.isTexture&&!counts.has(t)){counts.set(t,0);t.addEventListener('dispose',()=>counts.set(t,counts.get(t)+1));}});
    assert.ok(counts.size>=2);disposeProduct(root);assert.ok([...counts.values()].every(n=>n===1));
  } finally {globalThis.document=before;}
});
test('both data models keep their stage updates working with an empty content selection',()=>{
  const before=globalThis.document;
  const ctx=new Proxy({measureText:text=>({width:text.length*14}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,key)=>o[key]??(()=>{})});
  globalThis.document={createElement:()=>({getContext:()=>ctx})};
  try {
    for(const expanded of [false,true]){
      const model=createDataWorkstation({expanded});
      for(let stage=0;stage<4;stage++)for(const reduced of [false,true]){
        model.update(stage+1,stage,1/60,reduced,null,{path:null},'zh');
        if(expanded){const version=model.screen.material.map.version;model.update(stage+1.1,stage,1/60,reduced,null,{path:null},'zh');assert.equal(model.screen.material.map.version,version,'unchanged text must not re-upload its texture for a moving tracer');}
        model.root.updateMatrixWorld(true);const box=new T.Box3().setFromObject(model.root);
        assert.ok([box.min.x,box.min.y,box.max.x,box.max.y].every(Number.isFinite));
      }
      disposeProduct(model.root);
    }
  } finally {globalThis.document=before;}
});
