import * as THREE from 'three';
import {DecalGeometry} from 'three/addons/geometries/DecalGeometry.js';
import mark from '../media/brand-mountain.json';

// The official silhouette is inlaid into the terrain itself. Projecting onto its
// actual triangles preserves the rock face and avoids a floating sign or plinth.
export function createMountainIdentity(terrain){
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=840;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.beginPath();
  for(const polygon of [mark.outer,mark.cutout]){
    polygon.forEach(([x,y],i)=>{const px=(x-89.4)/425.4*2048,py=y/174.4*840;i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.closePath();
  }
  ctx.fill('evenodd');
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  terrain.updateMatrixWorld(true);
  const geometry=new DecalGeometry(terrain,new THREE.Vector3(1,17.5,9),new THREE.Euler(-.28,0,0),new THREE.Vector3(11.8,11.8*174.4/425.4,22));
  const material=new THREE.MeshStandardMaterial({map,color:'#ceb57e',metalness:.55,roughness:.38,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,emissive:'#8c642c',emissiveIntensity:.16});
  const inlay=new THREE.Mesh(geometry,material);inlay.name='paramont-rock-face-inlay';inlay.renderOrder=2;return inlay;
}
