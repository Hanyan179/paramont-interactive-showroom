import * as THREE from 'three';
import {createMediaExhibits} from './MediaExhibits';
import {visibleBounds,frameBounds} from './rendering/sceneFraming.js';

export function createCompanyNewsWorld(manager){
  const root=new THREE.Group(),media=createMediaExhibits(manager);root.name='company-news-studio';
  root.add(media.tv,media.journal);media.tv.userData.newsMode='films';media.journal.userData.newsMode='journal';
  media.tv.position.set(.7,.15,-.35);media.tv.rotation.y=-.16;
  media.journal.position.set(-2.1,-.12,1.75);media.journal.scale.setScalar(.7);media.journal.rotation.y=.24;
  const poster=media.screen.material.map,videoPlane=new THREE.Mesh(media.screen.geometry.clone(),new THREE.MeshBasicMaterial({toneMapped:false}));
  videoPlane.position.z=.002;videoPlane.visible=false;media.screen.add(videoPlane);let currentVideo=null,videoTexture=null;
  return {root,
    update({mix,time,reduced,yaw,tilt}){root.visible=mix>.002;root.scale.setScalar(Math.max(.001,mix));root.position.set(3,-.6,0);root.rotation.set(tilt*.25,yaw*.22,0);media.update(time,reduced);},
    bounds:()=>visibleBounds([root]),
    mediaView(mode,aspect,frame){
      const surface=mode==='journal'?media.page:media.screen;
      const direction=new THREE.Vector3(0,0,1).applyQuaternion(surface.getWorldQuaternion(new THREE.Quaternion()));
      return frameBounds(visibleBounds([surface]),{aspect,frame,direction});
    },
    pick(raycaster){const hit=raycaster.intersectObject(root,true)[0];let node=hit?.object;while(node&&!node.userData.newsMode)node=node.parent;return node?.userData.newsMode||null;},
    setVideo(element){
      const next=element?.readyState>=2?element:null;if(next===currentVideo)return;
      videoTexture?.dispose();videoTexture=null;currentVideo=next;
      videoPlane.visible=!!next;media.screen.material.map=next?null:poster;media.screen.material.color.set(next?'#01090e':'#ffffff');media.screen.material.needsUpdate=true;
      if(next){videoTexture=new THREE.VideoTexture(next);videoTexture.colorSpace=THREE.SRGBColorSpace;videoPlane.material.map=videoTexture;videoPlane.material.needsUpdate=true;const ratio=(next.videoWidth/next.videoHeight)/(4.46/2.51);videoPlane.scale.set(Math.min(1,ratio),Math.min(1,1/ratio),1);}
    },
    dispose(){videoTexture?.dispose();},
  };
}
