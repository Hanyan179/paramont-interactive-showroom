import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
const detail=modelDetail('news');
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const box=(parent,w,h,d,x,y,z,material,r=.07)=>{const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,detail.segment(4,'rounded'),Math.min(r,w/3,h/3,d/3)),material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
export function createMediaExhibits(manager){
 const silver=new THREE.MeshPhysicalMaterial({color:'#a4bacb',metalness:.92,roughness:.23,clearcoat:.4}),navy=new THREE.MeshPhysicalMaterial({color:'#112b45',metalness:.5,roughness:.27}),paper=new THREE.MeshStandardMaterial({color:'#f1eee3',roughness:.75});
 const tv=new THREE.Group();tv.name='company-film-display';
 box(tv,4.8,2.88,.24,0,1.83,0,silver);box(tv,4.64,2.72,.05,0,1.83,.14,navy,.05);
 const texture=new THREE.TextureLoader(manager).load('/media/generated/a3-paper-mountains.png',loaded=>{
   const aspect=loaded.image.width/loaded.image.height,target=4.46/2.51;
   if(aspect>target){loaded.repeat.x=target/aspect;loaded.offset.x=(1-loaded.repeat.x)/2;}
   else{loaded.repeat.y=aspect/target;loaded.offset.y=(1-loaded.repeat.y)/2;}
 });texture.colorSpace=THREE.SRGBColorSpace;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.46,2.51),new THREE.MeshBasicMaterial({map:texture}));screen.position.set(0,1.83,.172);tv.add(screen);
 box(tv,.2,.65,.18,0,.24,-.03,silver);box(tv,1.8,.10,.86,0,-.05,0,navy);
 box(tv,3.9,2.1,.055,0,1.83,-.15,navy,.08);
 for(let i=0;i<9;i++)box(tv,.22,.028,.016,(i-4)*.31,2.7,-.185,silver,.006);
 box(tv,.55,.68,.1,0,.82,-.22,silver,.08);
 const led=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),new THREE.MeshBasicMaterial({color:'#87e7f3'}));led.position.set(2.05,.48,.14);tv.add(led);
 const journal=new THREE.Group();journal.name='company-journal';
 const book=new THREE.Group();book.rotation.set(-.9,0,0);book.position.y=.65;journal.add(book);
 box(book,3.6,2.45,.22,0,0,0,navy);box(book,3.45,2.3,.17,.045,.025,.10,paper,.025);
 // Typeset real document navigation on a paper surface, not a fabricated news story.
 const c=document.createElement('canvas');c.width=Math.round(1440*detail.screenScale);c.height=Math.round(1000*detail.screenScale);const ctx=c.getContext('2d');ctx.scale(detail.screenScale,detail.screenScale);ctx.fillStyle='#eeeade';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#163b55';ctx.font='500 50px Georgia';ctx.fillText('PARAMONT',86,115);ctx.font='24px sans-serif';ctx.fillText('JOURNAL / COMPANY & IDEAS',86,170);ctx.fillRect(86,205,1260,3);ctx.font='italic 100px Georgia';ctx.fillText('Ideas,',86,370);ctx.fillText('made tangible.',86,480);ctx.fillStyle='#59798b';ctx.font='26px sans-serif';ctx.fillText('COMPANY   /   CULTURE   /   PERSPECTIVES',86,900);
 const cover=new THREE.CanvasTexture(c);cover.colorSpace=THREE.SRGBColorSpace;const page=new THREE.Mesh(new THREE.PlaneGeometry(3.43,2.28),new THREE.MeshBasicMaterial({map:cover,color:'#a7afb4',toneMapped:false}));page.position.set(.045,.025,.192);book.add(page);
 for(let i=0;i<4;i++)box(book,3.38,.012,.025,.045,-1.12+i*.04,.205,paper,.002);
 applySurfaceFinish(THREE,tv,detail);applySurfaceFinish(THREE,journal,detail);tv.userData.qualityModel=journal.userData.qualityModel='news';
 return {tv,journal,screen,page,update(time,reduced){time*=detail.motionScale;if(!reduced){led.material.color.setHSL(.52,.65,.55+Math.sin(time*.6)*.12);book.rotation.y=Math.sin(time*.16)*.035;}}};
}
