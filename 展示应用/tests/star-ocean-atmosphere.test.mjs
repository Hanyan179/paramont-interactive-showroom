import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStarOceanAtmosphere,createSpaceAtmosphere} from '../../共享组件/spaceAtmosphere.js';

function setup(spaceOnly=false){
  const textures=[],urls=[];
  class TextureLoader{load(url,callback){
    const texture=new THREE.Texture();texture.image={width:1672,height:941};
    textures.push(texture);urls.push(url);callback?.(texture);return texture;
  }}
  const scene=new THREE.Scene(),api={...THREE,TextureLoader};
  const sky=spaceOnly?createSpaceAtmosphere(api,scene,{exposure:1}):createStarOceanAtmosphere(api,scene,null,1);
  return {scene,sky,textures,urls,stars:scene.getObjectByName('depth-layered-stars')};
}

test('switching a chapter camera preserves the constellation and cover crop',()=>{
  const {sky,stars}=setup(),a=new THREE.PerspectiveCamera(46,16/9,.1,480),b=a.clone();
  a.position.set(-9,7,78);a.lookAt(-9,7,0);b.position.set(27,38,115);b.lookAt(3,12,-20);
  a.updateMatrixWorld();b.updateMatrixWorld();
  const point=new THREE.Vector3().fromBufferAttribute(stars.geometry.attributes.position,17);
  sky.update(0,16/9,false,false,a);stars.updateMatrixWorld();
  const first=point.clone().applyMatrix4(stars.matrixWorld).project(a);
  sky.update(0,16/9,false,true,b);stars.updateMatrixWorld();
  const next=point.clone().applyMatrix4(stars.matrixWorld).project(b);
  assert.ok(first.distanceTo(next)<1e-10);
  sky.update(0,1024/900,false,true,b);
  assert.equal(sky.uniforms.cover.value.y,1);
  assert.ok(sky.uniforms.cover.value.x<1,'narrow layouts crop without stretching');
  sky.dispose();
});

test('the shared sky follows supplied motion time and reduced motion',()=>{
  const {sky}=setup();
  sky.update(17,16/9);assert.equal(sky.uniforms.time.value,17);
  sky.update(17,16/9);assert.equal(sky.uniforms.time.value,17,'paused input does not advance');
  sky.update(80,16/9,true);assert.equal(sky.uniforms.time.value,0);
  sky.dispose();
});

test('meteor groups alternate single, double and triple trails without advancing while paused',()=>{
  const {sky,scene}=setup(),meteors=scene.getObjectByName('occasional-meteor-shower'),seen=new Set();
  for(let time=0;time<220;time+=.1){sky.update(time,16/9);seen.add(meteors.userData.activeCount);}
  assert.deepEqual([...seen].sort(),[0,1,2,3]);
  sky.update(7,16/9);assert.equal(meteors.userData.activeCount,2);
  const before=meteors.material.uniforms.meteorHeads.value.map(value=>value.toArray());
  sky.update(7,16/9);assert.deepEqual(meteors.material.uniforms.meteorHeads.value.map(value=>value.toArray()),before);
  sky.update(7,16/9,true);assert.equal(meteors.visible,false);
  sky.update(7,16/9);assert.equal(meteors.visible,true);
  assert.equal(meteors.geometry.attributes.position.count,18,'three ribbons share a fixed geometry');
  sky.dispose();
});

test('unmount releases the background texture and all geometry layers',()=>{
  const {scene,sky,textures,stars}=setup();let textureDisposed=0,geometryDisposed=0,materialDisposed=0;
  textures.forEach(texture=>texture.addEventListener('dispose',()=>textureDisposed++));
  for(const node of scene.children){node.geometry.addEventListener('dispose',()=>geometryDisposed++);node.material.addEventListener('dispose',()=>materialDisposed++);}
  assert.ok(new Set(Array.from(stars.geometry.attributes.position.array).filter((_v,i)=>i%3===2)).size>1,'stars occupy independent depths');
  sky.dispose();
  assert.equal(scene.children.length,0);assert.equal(textureDisposed,2);assert.equal(geometryDisposed,3);assert.equal(materialDisposed,3);
});

test('embedded scenes share the nebula, constellation and animation clock without loading an ocean',()=>{
  const main=setup(),embedded=setup(true);
  assert.deepEqual(embedded.urls,['/assets/intelligence-v2/nebula-starless-v1.png']);
  assert.deepEqual(Array.from(main.stars.geometry.attributes.position.array),Array.from(embedded.stars.geometry.attributes.position.array));
  assert.equal(main.stars.material.vertexShader,embedded.stars.material.vertexShader);
  main.sky.update(38,16/9,false,true,undefined,2160);
  embedded.sky.update(38,16/9,false,0,0,0,0,2160);
  for(const name of ['time','quiet','starAspect','starViewport','plateExposure'])assert.equal(main.sky.uniforms[name].value,embedded.sky.uniforms[name].value,name);
  assert.deepEqual(main.sky.uniforms.nebulaCover.value.toArray(),embedded.sky.uniforms.nebulaCover.value.toArray());
  embedded.sky.update(38,16/9,false);assert.equal(embedded.sky.uniforms.time.value,38);
  embedded.sky.update(80,16/9,true);assert.equal(embedded.sky.uniforms.time.value,0);
  main.sky.dispose();embedded.sky.dispose();
});

test('flow retains geometry across chapters and fits narrow and wall viewports without stretching the nebula',()=>{
  const {sky,stars}=setup(),position=stars.geometry.attributes.position.array;
  for(const [width,height] of [[1366,768],[1920,1080],[3840,2160],[1024,900]]){
    const aspect=width/height;
    sky.update(120,aspect,false,true,undefined,height);
    assert.equal(sky.uniforms.starAspect.value,aspect);
    assert.equal(sky.uniforms.starViewport.value,height);
    const cover=sky.uniforms.nebulaCover.value;
    assert.ok(Math.abs(cover.x/cover.y-aspect/(1672/941))<1e-10);
    assert.equal(stars.geometry.attributes.position.array,position);
  }
  sky.dispose();
});

test('the starless nebula stays fixed while stars have individual depth-dependent drift',()=>{
  const {sky,stars}=setup();
  const {position,drift}=stars.geometry.attributes;
  assert.equal(drift.count,position.count);
  const speeds=Array.from({length:drift.count},(_,i)=>Math.hypot(drift.getX(i),drift.getY(i)));
  assert.ok(Math.max(...speeds)>Math.min(...speeds)*8,'near and far stars do not move as a single image');
  const vertex=stars.material.vertexShader;
  assert.match(vertex,/drift\*time/);
  assert.doesNotMatch(vertex,/mat2|rotate|pivot/,'no orbit or bulk rotation');
  const skyShader=sky.sampleGLSL.split('vec3 nightSky')[1].split('vec3 photographicColor')[0];
  assert.doesNotMatch(skyShader,/time|sin|cos|mat2/,'background image does not rotate, wave or translate');
  sky.dispose();
});
