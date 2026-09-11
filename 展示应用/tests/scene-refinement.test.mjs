import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {regionLayouts,regionPoint} from '../src/components/regionLayouts.js';
import {locationProfiles,getLocationProfile} from '../src/components/locationProfiles.js';
import {withCatalogLabels} from '../../共享组件/catalogLabels.js';

test('every exhibit focus and touch anchor follows the actual room transform',()=>{
  for(const [id,profile] of Object.entries(locationProfiles))for(const stops of Object.values(profile.stops))for(const {point} of stops){
    const i=Math.max(0,Math.min(2,Math.round(point[0]/12)+1)),layout=regionLayouts[id][i];
    const room=new THREE.Object3D();room.position.fromArray(layout.position);room.rotation.y=layout.yaw;room.updateMatrixWorld();
    const expected=room.localToWorld(new THREE.Vector3(point[0]-(i-1)*12,point[1],point[2]));
    assert.ok(expected.distanceTo(new THREE.Vector3(...regionPoint(id,point)))<1e-8,`${id}: ${point}`);
  }
});
test('unconfirmed regions expose neither another country business nor its geometry anchors',()=>{
  for(const id of ['europe','australia','future-region']){
    const p=getLocationProfile(id);assert.equal(p.id,id);assert.deepEqual(p.stops,{overview:[]});assert.match(p.role[0],/待确认/);
    assert.deepEqual(regionPoint(id,[1,2,3]),[1,2,3]);assert.equal(regionLayouts[id],undefined);
  }
});
test('catalog translations cover all categories without changing source identities',()=>{
  const source=JSON.parse(readFileSync(new URL('../../共享数据/catalog.json',import.meta.url)));
  const original=JSON.stringify(source),result=withCatalogLabels(source);
  assert.equal(JSON.stringify(source),original);
  assert.equal(result.subcategories.length,327);
  for(let i=0;i<result.subcategories.length;i++){
    const a=source.subcategories[i],b=result.subcategories[i];assert.equal(b.id,a.id);assert.equal(b.name,a.name);assert.equal(b.label[1],a.name);assert.ok(b.label[0]?.trim());
  }
});

// Three.js deliberately raycasts hidden objects; transitions must reject them.
import {firstVisibleHit} from '../src/components/rendering/visibleHit.js';
test('a retained, invisible scene never intercepts a click on the current model',()=>{
 const root=new THREE.Group(),hidden=new THREE.Group();hidden.visible=false;root.add(hidden);
 const old=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());hidden.add(old);
 const current=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());root.add(current);
 assert.equal(firstVisibleHit([{object:old,distance:1},{object:current,distance:2}]).object,current);
 root.visible=false;assert.equal(firstVisibleHit([{object:old},{object:current}]),undefined);
 for(const m of [old,current]){m.geometry.dispose();m.material.dispose();}
});
