import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {sampleLogoFace, createStarlightLogo} from '../src/impact/starlightLogo.js';

const mark = JSON.parse(readFileSync(new URL('../src/media/brand-mountain.json', import.meta.url)));
const points = ring => ring.slice(0, -1).map(([x,y]) => new THREE.Vector2((x-302.1)*.12,(174.4-y)*.12));
const shape = new THREE.Shape(points(mark.outer));
shape.holes.push(new THREE.Path(points(mark.cutout)));
function inside(x,y,ring) {
  let found=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const a=ring[i],b=ring[j];
    if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)found=!found;
  }
  return found;
}
const quality={models:{monument:{geometry:1}}};
const input={active:true,time:1,dt:0,animate:true,immediate:false,pixelHeight:720,pointer:new THREE.Vector3(0,-100,7),response:0,pulse:4,reform:0};

test('all sampled stars preserve the original brand face and its negative space',()=>{
  const geometry=sampleLogoFace(shape,8000),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i)-.08;
    assert.ok(inside(x,y,points(mark.outer)),'inside original outer mark');
    assert.ok(!inside(x,y,points(mark.cutout)),'leave the original cutout empty');
    assert.ok(Number.isFinite(p.getZ(i)));
  }
  assert.deepEqual(geometry.attributes.position.array,sampleLogoFace(shape,8000).attributes.position.array,'stable arrangement when returning');
});

test('pause freezes an in-progress assembly and resume continues from that point',()=>{
  const logo=createStarlightLogo(shape,quality);
  logo.update({...input,dt:.4});const formation=logo.root.userData.formation;
  assert.ok(formation>0&&formation<1);
  logo.update({...input,dt:20,animate:false});
  assert.equal(logo.root.userData.formation,formation);
  logo.update({...input,dt:.4});assert.ok(logo.root.userData.formation>formation);
  logo.update({...input,dt:3});assert.equal(logo.root.userData.formation,1);
  logo.update({...input,dt:0,reform:1});assert.equal(logo.root.userData.formation,1,'regroup starts without a jump');
  logo.update({...input,dt:.65,reform:1});assert.equal(logo.root.userData.formation,0);
  logo.update({...input,dt:3,reform:1});assert.equal(logo.root.userData.formation,1);
});

test('reduced motion and a paused style switch show the settled logo without allocating new geometry',()=>{
  const logo=createStarlightLogo(shape,quality),stars=logo.root.children[0],geometry=stars.geometry;
  logo.update({...input,immediate:true,response:1});
  assert.equal(logo.root.userData.formation,1);
  assert.equal(stars.material.uniforms.motion.value,0);
  assert.equal(stars.material.uniforms.response.value,0);
  logo.update({...input,active:false});assert.equal(logo.root.visible,false);
  logo.update({...input,animate:false});assert.equal(logo.root.userData.formation,1);
  assert.equal(logo.root.visible,true);assert.equal(stars.geometry,geometry);
});
