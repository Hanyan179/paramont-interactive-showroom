import * as THREE from 'three';
import {V,projectAnchors,createDepthPicker} from './depthGeometry.js';
import {createSupplyInfrastructure} from './supplyInfrastructure.js';
import {createChinaDevelopment} from './chinaDevelopment.js';
import {createUSAMarket} from './usaMarket.js';
import {supplyLocation} from './supplyRegionsContent.js';

// Three complete environments are constructed and warmed together, never loaded on entry.
export function createSupplyDepth(quality){
  const root=new THREE.Group(),campus=createSupplyInfrastructure(quality);
  campus.root.userData.region='cambodia';
  campus.anchors=[{id:'production',point:V(10,30,-10)},{id:'quality',point:V(7,17,20)},{id:'dispatch',point:V(20,12,-47)}];
  const scenes={china:createChinaDevelopment(quality),cambodia:campus,usa:createUSAMarket(quality)};
  const views={
    china:{overview:[V(88,35,99),V(-7,9,-4)],supply:[V(99,25,52),V(33,7,0)],materials:[V(33,25,16),V(-17,12,-15)],design:[V(42,20,59),V(-5,7,20)],prototype:[V(70,16,16),V(13,6,-21)]},
    cambodia:{overview:[V(75,30,87),V(-10,9,-15)],production:[V(12,7,9),V(-7,8,-26)],quality:[V(36,15,62),V(-8,7,17)],dispatch:[V(84,30,-23),V(1,5,-50)]},
    usa:{overview:[V(72,31,86),V(-5,9,-3)],portfolio:[V(28,19,-8),V(-8,13,-34)],brandstage:[V(43,15,60),V(-7,10,14)],customers:[V(85,21,33),V(29,6,0)]},
  };
  const regions=Object.entries(scenes).map(([id,scene])=>{
    root.add(scene.root);const hits=[],materials=new Set();
    scene.anchors.forEach(anchor=>{const hit=new THREE.Mesh(new THREE.SphereGeometry(7,16,12),new THREE.MeshBasicMaterial({visible:false}));hit.position.copy(anchor.point).add(V(0,-4,0));hit.userData.focusId=`${id}:${anchor.id}`;scene.root.add(hit);hits.push(hit);});
    scene.root.traverse(o=>{if(o.material&&o.material.visible!==false)materials.add(o.material);});
    const fades=[...materials].map(material=>{
      if(material.isShaderMaterial){material.uniforms.regionOpacity={value:1};material.fragmentShader='uniform float regionOpacity;\n'+material.fragmentShader.replace(/}\s*$/,'gl_FragColor.a *= regionOpacity; }');}
      material.transparent=true;return {material,opacity:material.opacity};
    });
    return {id,scene,fades,weight:id==='china'?1:0,pick:createDepthPicker(scene.root,hits)};
  });
  let selected=supplyLocation(null),detailAmount=0;
  const fade=(entry,mix)=>entry.fades.forEach(({material,opacity})=>{if(material.isShaderMaterial)material.uniforms.regionOpacity.value=mix;else material.opacity=opacity*mix;});
  return {root,
    update(time,mix,selection=null,dt=1/60){
      selected=supplyLocation(selection);root.visible=mix>0;root.position.y=-12*(1-mix);
      detailAmount=THREE.MathUtils.lerp(detailAmount,selected.area?1:0,dt===0?1:1-Math.exp(-Math.min(dt,.05)*5));
      const k=dt===0?1:1-Math.exp(-Math.min(dt,.05)*8);
      for(const entry of regions){
        entry.weight=THREE.MathUtils.lerp(entry.weight,entry.id===selected.region?1:0,k);
        if(entry.weight<.001)entry.weight=0;entry.scene.root.visible=entry.weight>0;
        if(entry.scene.root.visible){entry.scene.update(time,null,1,dt);fade(entry,mix*entry.weight);}
      }
    },
    get detailAmount(){return detailAmount;},
    pose(selection,aspect=16/9){
      const {region,area}=supplyLocation(selection),view=views[region]||views.china;
      const [p,t]=view[area]||view.overview,position=p.clone(),target=t.clone();
      position.sub(target).multiplyScalar(Math.max(1,Math.min(1.25,(16/9)/aspect))).add(target);return {position,target};
    },
    project(camera,w,h){const entry=regions.find(r=>r.id===selected.region);return projectAnchors(entry.scene.root,entry.scene.anchors,camera,w,h).map(p=>({...p,id:`${entry.id}:${p.id}`,visible:p.visible&&!selected.area}));},
    pick(...args){return selected.area?null:regions.find(r=>r.id===selected.region).pick(...args);},
    prepare(){root.visible=true;regions.forEach(entry=>{entry.scene.root.visible=true;entry.scene.prepare?.();fade(entry,1);});},
  };
}
