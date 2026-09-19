import * as THREE from 'three';
import {createProduct} from '../../../品牌融合世界/src/models.js';
import {categoryReel} from './categoryContent.js';
import {wrapReel} from './content.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {createCategoryGallery} from './categoryGallery.js';

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
function partyTableware(parent,quality){
  const detail=modelDetail('balloon',quality),gold=new THREE.MeshStandardMaterial({color:'#d7b983',metalness:.75,roughness:.3}),paper=new THREE.MeshStandardMaterial({color:'#e4b9c0',roughness:.66});
  const mint=new THREE.MeshStandardMaterial({color:'#abd0cc',roughness:.62});
  const place=(geometry,material,p,r=[0,0,0])=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...p);mesh.rotation.set(...r);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  for(let i=0;i<3;i++){
    place(new THREE.CylinderGeometry(1.1,1.05,.06,detail.segment(64)),i%2?mint:paper,[1.5,-1.35+i*.09,.75]);
    place(new THREE.TorusGeometry(1.045,.025,8,detail.segment(64)),gold,[1.5,-1.3+i*.09,.75],[Math.PI/2,0,0]);
  }
  const profile=[[.32,0],[.32,.02],[.43,1.1],[.40,1.1],[.30,.07]].map(p=>new THREE.Vector2(...p));
  place(new THREE.LatheGeometry(profile,detail.segment(48)),mint,[1.9,-1.1,-.4],[.03,0,-.12]);
  place(new THREE.ConeGeometry(.68,1.7,detail.segment(48),1,true),paper,[2.9,-.25,-1.1],[.03,0,-.16]);
  place(new THREE.SphereGeometry(.1,16,12),gold,[3.05,.57,-1.1]);
  for(let i=0;i<3;i++)place(new THREE.CylinderGeometry(.06,.06,.8,16),i%2?mint:gold,[.45+i*.22,-1.0,1.8],[.6,0,.15]);
}
export function categoryWorld(quality,manager){
  const root=new THREE.Group(),models=[],compositions=[];
  const gallery=createCategoryGallery(manager);root.add(gallery.root);
  let overviewMix=1;
  const accents=['#d4a7b1','#a5cfc7','#c1b0db'];
  categoryReel.forEach((entry,index)=>{
    const group=new THREE.Group(),objects=[];root.add(group);compositions.push(group);group.userData.categoryId=entry.catalogId;
    entry.scene.forEach(recipe=>{
      const model=createProduct(recipe.id,quality);model.position.set(...recipe.p);model.scale.setScalar(recipe.scale);model.rotation.set(...recipe.r);group.add(model);objects.push({model,recipe});
    });
    if(entry.id==='party')partyTableware(group,quality);
    // A single curved material sheet frames the collection without fragmenting it into cards.
    const geometry=new THREE.PlaneGeometry(10,2.8,120,20),positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),y=positions.getY(i);positions.setXYZ(i,x,Math.sin(x*.5)*.85+y*.3-1.5,Math.cos(x*.37)*1.4+y*.7-1.8);
    }
    geometry.computeVertexNormals();
    const sheet=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color:accents[index],metalness:.32,roughness:.4,clearcoat:.5,side:THREE.DoubleSide,envMapIntensity:.65}));group.add(sheet);
    const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:161},(_,i)=>V(Math.cos(i/160*Math.PI*2)*4.1,-2,Math.sin(i/160*Math.PI*2)*3))),new THREE.LineBasicMaterial({color:accents[index],transparent:true,opacity:.23}));group.add(orbit);
    models.push(objects);group.visible=false;
  });
  return {root,
    update({time,camera,target,reelPosition=0,aspect=16/9,categoryOverview=false,overviewImmediate=false,dt=.016,featuredCategory=0,featuredOffset=0}){
      gallery.root.visible=categoryOverview;if(categoryOverview)gallery.update({time,featuredCategory,featuredOffset,aspect,dt,overviewImmediate});
      const count=compositions.length;
      overviewMix=overviewImmediate?(categoryOverview?1:0):THREE.MathUtils.damp(overviewMix,categoryOverview?1:0,5,dt);
      compositions.forEach((group,slot)=>{
        const delta=wrapReel(slot-reelPosition+count/2,count)-count/2,depth=Math.min(1,Math.abs(delta));group.visible=!categoryOverview&&(overviewMix>.002||Math.abs(delta)<1);
        const party=categoryReel[slot].id==='party';
        group.position.set(THREE.MathUtils.lerp(3.5+delta*32,[1,7,12][slot],overviewMix),THREE.MathUtils.lerp(party?-.3:1.1,party?3.1:4.5,overviewMix),THREE.MathUtils.lerp(-depth*4,-.5,overviewMix));
        group.scale.setScalar(THREE.MathUtils.lerp(2.15*(1-depth*.16),party?.68:.83,overviewMix));group.rotation.y=-.13-delta*.3*(1-overviewMix)+Math.sin(time*.11)*.055;
        if(group.visible)models[slot].forEach(({model,recipe},i)=>{model.position.y=recipe.p[1]+Math.sin(time*.42+i*1.5)*.055;model.rotation.y=recipe.r[1]+Math.sin(time*.17+i)*.08;});
      });
      const fit=Math.max(1,Math.min(1.16,1.58/aspect));camera.set(categoryOverview?0:-.5,categoryOverview?0:2.4,categoryOverview?27:22.5*fit);target.set(0,categoryOverview?0:.2,0);
    },
    prepare(){gallery.prepare();compositions.forEach(group=>group.visible=true);},
  };
}
