import {modelDetail} from '../../../../共享组件/renderQuality.js';
import * as THREE from 'three';

// Geographic textures are local, source-attributed assets, not AI-generated geography.
export async function loadEarthSurface(manager) {
  const loader=new THREE.TextureLoader(manager);
  const textures=await Promise.allSettled(['blue-marble-july-5400.jpg','earth-normal.jpg','ocean-mask.jpg'].map(f=>loader.loadAsync('/media/materials/earth/'+f)));
  if(textures.some(t=>t.status==='rejected')){textures.forEach(t=>{if(t.status==='fulfilled')t.value.dispose();});throw new Error('Earth surface assets failed to load');}
  const [map,normal,mask]=textures.map(t=>t.value);map.colorSpace=THREE.SRGBColorSpace;
  for(const t of [map,normal,mask]){t.anisotropy=8;t.wrapS=THREE.RepeatWrapping;}
  return {map,normal,mask};
}

export function configureEarthMaterial(material,{map,normal,mask}) {
  material.map=map;material.normalMap=normal;material.normalScale.setScalar(modelDetail('globe').surfaceDetail?.48:0);
  material.roughnessMap=mask;material.roughness=1;material.metalness=.14;
  material.clearcoat=.28;material.clearcoatRoughness=.3;material.envMapIntensity=.55;
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`
      float oceanMask=texture2D(roughnessMap,vRoughnessMapUv).r;
      float roughnessFactor=mix(.80,.26,oceanMask);
    `).replace('#include <map_fragment>',`#include <map_fragment>
      float water=texture2D(roughnessMap,vMapUv).r;
      float value=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
      vec3 silverLand=mix(vec3(.075,.10,.14),vec3(.43,.48,.52),pow(clamp(value*1.9,0.,1.),.7));
      vec3 ocean=mix(vec3(.009,.027,.075),vec3(.035,.12,.24),clamp(value*6.,0.,1.));
      diffuseColor.rgb=mix(silverLand,ocean,water);
    `);
  };
  material.customProgramCacheKey=()=> 'paramont-earth-silver-land-v1';material.needsUpdate=true;
}
