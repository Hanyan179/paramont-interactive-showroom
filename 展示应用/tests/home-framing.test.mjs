import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {frameBounds, visibleBounds, turnHome} from '../src/components/rendering/sceneFraming.js';

test('the orbiting workdesk stays inside the reading/navigation safe area through a full turn',()=>{
  const root=new THREE.Group(),desk=new THREE.Mesh(new THREE.BoxGeometry(3,2.8,3),new THREE.MeshBasicMaterial());
  root.position.set(1.55,-1.1,0);desk.position.set(-7.3,1.1,2.1);desk.scale.setScalar(1.35);root.add(desk);
  const frame={left:.42,right:.94,top:.2,bottom:.8};
  for(const aspect of [1366/768,1920/1080,3840/2160,4/3,21/9])for(let degrees=0;degrees<=720;degrees+=15){
    root.rotation.set(.3,degrees*Math.PI/180,0);
    const bounds=visibleBounds([desk]),view=frameBounds(bounds,{aspect,frame});
    const camera=new THREE.PerspectiveCamera(40,aspect,.1,140);camera.position.copy(view.position);camera.lookAt(view.look);camera.updateMatrixWorld();
    for(const corner of bounds.framePoints){
      const p=corner.clone().project(camera),u=(p.x+1)/2,v=(1-p.y)/2;
      assert.ok(u>=frame.left-1e-8&&u<=frame.right+1e-8&&v>=frame.top-1e-8&&v<=frame.bottom+1e-8,`${aspect}, ${degrees}: ${u},${v}`);
      assert.ok(p.z<1&&p.z>-1);
    }
  }
  desk.geometry.dispose();desk.material.dispose();
});

test('home swipes accumulate beyond one full turn in both directions',()=>{
  let pose={yaw:0,tilt:0};
  for(let i=0;i<8;i++)pose=turnHome(pose,400,0,1280,720);
  assert.ok(pose.yaw>Math.PI*2);
  for(let i=0;i<16;i++)pose=turnHome(pose,-400,0,1280,720);
  assert.ok(pose.yaw< -Math.PI*2);
  assert.equal(turnHome(pose,0,10000,1280,720).tilt,.65);
  assert.equal(turnHome(pose,0,-10000,1280,720).tilt,-.38);
});

test('hidden transition objects do not shrink the current subject framing',()=>{
  const root=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshBasicMaterial()),hidden=mesh.clone();
  root.add(mesh,hidden);hidden.position.set(100,100,100);hidden.visible=false;
  const box=visibleBounds([root]);assert.deepEqual(box.min.toArray(),[-1,-1,-1]);assert.deepEqual(box.max.toArray(),[1,1,1]);
  mesh.geometry.dispose();mesh.material.dispose();
});
