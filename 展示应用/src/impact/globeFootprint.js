import * as THREE from 'three';
import {geoEquirectangular,geoPath} from 'd3-geo';
import {footprintGeography,visibleFootprint,footprintColors} from './footprintGeography.js';
import {footprintKind} from './distributionContent.js';

export function globePoint([longitude,latitude],radius=7.56){
  const lat=latitude*Math.PI/180,lng=longitude*Math.PI/180;
  return new THREE.Vector3(radius*Math.cos(lat)*Math.sin(lng),radius*Math.sin(lat),radius*Math.cos(lat)*Math.cos(lng));
}

function paintCoverage(layer,selected=null,existing=null){
  const canvas=existing?.image||document.createElement('canvas');canvas.width=2048;canvas.height=1024;
  const context=canvas.getContext('2d'),projection=geoEquirectangular().translate([1024,512]).scale(2048/(2*Math.PI)),path=geoPath(projection,context);
  for(const country of visibleFootprint(layer)){
    if(selected&&selected!==country.code)continue;
    context.beginPath();path(country.shape);context.fillStyle=selected?'#f4dab1':footprintColors[footprintKind(country,layer)];context.globalAlpha=selected?.7:.38;context.fill();
    context.globalAlpha=selected?.95:.66;context.strokeStyle=selected?'#fff2ce':footprintColors[footprintKind(country,layer)];context.lineWidth=selected?2.2:.85;context.stroke();
  }
  const texture=existing||new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
  return texture;
}

export function createGlobeFootprint(radius=7.5,textureFactory=paintCoverage){
  const root=new THREE.Group();root.name='shared-business-footprint';
  const geometry=new THREE.SphereGeometry(radius*1.003,128,80),textures=Object.fromEntries(['all','customers','suppliers'].map(layer=>[layer,textureFactory(layer)]));
  const surface=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:textures.all,transparent:true,depthWrite:false,opacity:.78,toneMapped:false}));surface.rotation.y=-Math.PI/2;root.add(surface);
  const selectedMaterial=new THREE.MeshBasicMaterial({map:textureFactory('all','__none__'),transparent:true,depthWrite:false,opacity:.9,toneMapped:false});
  const selectedSurface=new THREE.Mesh(geometry,selectedMaterial);selectedSurface.rotation.copy(surface.rotation);selectedSurface.scale.setScalar(1.001);selectedSurface.visible=false;root.add(selectedSurface);
  const dotGeometry=new THREE.SphereGeometry(.029,10,8),materials=Object.fromEntries(Object.entries(footprintColors).map(([kind,color])=>[kind,new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(1.8)})]));
  const nodes=footprintGeography.map(country=>{
    const marker=new THREE.Mesh(dotGeometry,materials[footprintKind(country,'all')]);marker.position.copy(globePoint(country.coordinate,radius*1.01));marker.userData.country=country.code;root.add(marker);return {...country,marker};
  });
  let currentLayer,currentSelection;
  return {root,nodes,
    update(layer='all',selected=null){
      if(layer===currentLayer&&selected===currentSelection)return;
      surface.material.map=textures[layer];
      const shown=new Set(visibleFootprint(layer).map(country=>country.code));
      nodes.forEach(node=>{node.marker.visible=shown.has(node.code);node.marker.material=materials[footprintKind(node,layer)];node.marker.scale.setScalar(node.code===selected?2.1:1);});
      textureFactory(layer,selected&&shown.has(selected)?selected:'__none__',selectedMaterial.map);selectedSurface.visible=!!selected&&shown.has(selected);
      currentLayer=layer;currentSelection=selected;
    },
    prepare(){selectedSurface.visible=true;},
    dispose(){Object.values(textures).filter(texture=>texture!==surface.material.map).forEach(texture=>texture.dispose());},
  };
}
