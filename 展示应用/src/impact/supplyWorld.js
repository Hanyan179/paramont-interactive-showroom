import * as THREE from 'three';
import {createSupplyDepth} from './supplyDepth.js';
import {createGlobalStreams} from './supplyArchitecture.js';

// The flat map owns the overview. This resident world only supplies regional
// spaces; no earth geometry, textures or projection transition are constructed.
export function supplyWorld(_manager,quality){
  const root=new THREE.Group();root.position.set(4,-1.4,0);
  const depth=createSupplyDepth(quality);root.add(depth.root);
  const streams=createGlobalStreams(root);let expansion=0;
  return {root,
    update({time,camera,target,depthMix=0,detailTime=0,depthSelection=null,dt=0}){
      expansion=depthMix;depth.update(detailTime,depthMix,depthSelection,dt);
      streams.update(time,depthMix*(1-depth.detailAmount));
      camera.set(-2.5,3.6,20.6);target.set(.5,-.3,0);
    },
    project(camera,width,height){return expansion>.99?depth.project(camera,width,height):[];},
    pick(x,y,width,height,camera){
      if(expansion<=.99)return null;
      const focusId=depth.pick(x,y,width,height,camera);return focusId?{focusId}:null;
    },
    focusPose(id,aspect){const pose=depth.pose(id,aspect);pose.position.add(root.position);pose.target.add(root.position);return pose;},
    prepare(){depth.prepare();streams.update(0,1);},
  };
}
