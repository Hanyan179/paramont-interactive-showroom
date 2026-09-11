import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createInspectionPose,homeInspection,nearestAngle} from '../src/components/rendering/inspectionPose.js';
import {createHomeStoryWorld} from '../src/components/HomeStoryWorld.js';
import {frameBounds} from '../src/components/rendering/sceneFraming.js';
const settle=(rig,preset,revision=0)=>{let pose;for(let i=0;i<220;i++)pose=rig.update(preset,revision,1/60);return pose;};
const angularError=(a,b)=>Math.abs(nearestAngle(a,b)-a);

test('every company selection returns to its presentation angle after arbitrary exploration',()=>{
  const rig=createInspectionPose();
  for(let company=0;company<4;company++){
    const preset=homeInspection(2,{company},null);
    settle(rig,preset);rig.drag(9200,-10000,1920,1080);
    const turned=settle(rig,preset);assert.ok(angularError(turned.yaw,preset.yaw)>.2);
    const restored=settle(rig,preset,company+1);
    assert.ok(angularError(restored.yaw,preset.yaw)<.0002);assert.equal(restored.tilt,0);
  }
});
test('rapid selections take the shortest turn and finish at the last selection',()=>{
  const rig=createInspectionPose();let before=rig.update(homeInspection(2,{company:0},null),0,1/60);
  for(const company of [3,1,2,0,3,2]){
    const preset=homeInspection(2,{company},null);
    const after=rig.update(preset,company+10,1/60);
    assert.ok(Math.abs(after.yaw-before.yaw)<Math.PI);before=after;
  }
  const last=homeInspection(2,{company:2},null),pose=settle(rig,last,12);
  assert.ok(angularError(pose.yaw,last.yaw)<.0002);
});
test('inspection does not mutate the saved free orbit and presentation can restore the inspected pose',()=>{
  const free={yaw:Math.PI*9+.4,tilt:.43},original={...free},rig=createInspectionPose(),preset=homeInspection(0,{},2);
  rig.update(preset,0,1/60,false,free);settle(rig,preset);assert.deepEqual(free,original);
  rig.drag(120,30,1920,1080);settle(rig,preset);const saved=rig.snapshot();
  settle(rig,homeInspection(2,{company:3},null));rig.restore(saved);
  assert.deepEqual(rig.snapshot(),saved);
  assert.equal(homeInspection(0,{},null),null);
});
test('reduced motion reaches the authored pose immediately',()=>{
  const rig=createInspectionPose(),preset=homeInspection(1,{capability:2,detail:3},null);
  const pose=rig.update(preset,1,0,true);assert.ok(angularError(pose.yaw,preset.yaw)<1e-8);assert.equal(pose.tilt,0);
});
test('selected company nodes reach the foreground, face the viewer, and fit the reading frame',()=>{
  const world=createHomeStoryWorld();
  for(let company=0;company<4;company++){
    const selection={capability:0,company,year:0,detail:null},preset=homeInspection(2,selection,null);
    for(let i=0;i<220;i++)world.update({chapter:2,selection,mix:0,reveal:1,dt:1/60,time:0,reduced:false,aspect:16/9,yaw:preset.yaw,tilt:0});
    world.root.updateMatrixWorld(true);
    const point=world.point(company),center=world.root.getWorldPosition(new THREE.Vector3());
    assert.ok(point.z>center.z+2.3,'selected node must be in front of the center');
    const exhibit=world.root.getObjectByName(`company-exhibit-${company}`);
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(exhibit.getWorldQuaternion(new THREE.Quaternion()));
    assert.ok(normal.z>.95,'selected sculpture face must be toward the viewer');
    const bounds=world.bounds(),frame={left:.47,right:.955,top:.21,bottom:.72};
    for(const aspect of [1366/768,1920/1080,3840/2160,4/3]){
      const view=frameBounds(bounds,{aspect,frame}),camera=new THREE.PerspectiveCamera(40,aspect,.1,140);
      camera.position.copy(view.position);camera.lookAt(view.look);camera.updateMatrixWorld();
      for(const corner of bounds.framePoints){const p=corner.clone().project(camera),x=(p.x+1)/2,y=(1-p.y)/2;assert.ok(x>=frame.left-1e-8&&x<=frame.right+1e-8&&y>=frame.top-1e-8&&y<=frame.bottom+1e-8);}
    }
  }
  const geometries=new Set(),materials=new Set();world.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
});
