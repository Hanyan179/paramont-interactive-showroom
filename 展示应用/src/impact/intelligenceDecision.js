import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';
import {createCreativeKit,createStudioAccessories} from './creativeKit.js';
import {addMesh,opticalPalette} from './intelligenceOptics.js';

/** Compare usable product configurations, retaining both alternatives and the
 * chosen sample. Choice changes layout, never creates replacement resources. */
export function createIntelligenceDecision(quality){
  const root=new THREE.Group();root.name='product-direction-comparison';root.userData.illustrative=true;
  const detail=modelDetail('analytics',quality),m=opticalPalette(),candidates=[];
  for(let i=0;i<2;i++){
    const group=new THREE.Group();group.name=i?'decision-shared-studio':'decision-portable-studio';root.add(group);
    const stage=new THREE.Group();stage.rotation.set(.30,-.18+i*.36,0);group.add(stage);
    const kit=createCreativeKit(quality);kit.root.scale.setScalar(.43);stage.add(kit.root);
    const accessory=i?createStudioAccessories(quality):null;
    if(accessory){accessory.root.scale.setScalar(.41);accessory.root.position.set(1.31,.03,-.28);stage.add(accessory.root);}
    const finish=m.blue.clone();finish.roughness=.3;
    const platform=addMesh(stage,`decision-material-plinth-${i}`,new RoundedBoxGeometry(i?3.50:2.58,.072,1.98,detail.segment(3,'rounded'),.035),finish,[i?.31:0,-.14,.05]);
    const edge=addMesh(stage,`decision-choice-edge-${i}`,new RoundedBoxGeometry(i?3.44:2.52,.025,.025,2,.012),m.silver.clone(),[i?.31:0,-.125,1.03]);
    candidates.push({group,kit,accessory,platform,edge});
  }
  let mix=0;
  function update({time=0,choice=0,dt=0,reduced=false,immediate=false}={}){
    const target=Number(choice===1),clock=reduced?0:time;
    mix=reduced||immediate?target:THREE.MathUtils.damp(mix,target,5,dt);
    candidates.forEach(({group,kit,edge},i)=>{
      const selected=i?mix:1-mix;
      group.position.set(i?1.27:-1.25,-.20+selected*.20,-.5+selected*.95);
      group.scale.setScalar(.74+selected*.25);
      group.rotation.y=(i?-.18:.18)*(1-selected);
      kit.update({time:clock,open:.58+selected*.27,activity:selected*(.30+.25*Math.sin(clock*.8)),variant:i,reduced});
      edge.material.color.copy(selected>.5?m.gold.color:m.silver.color);
      edge.material.emissive.set(selected>.5?'#7d592b':'#154a70');edge.material.emissiveIntensity=.22+selected*.34;
    });
    root.userData.choice=target;root.userData.choiceMix=mix;
  }
  update({immediate:true});return {root,update,isMoving:choice=>Math.abs(mix-Number(choice===1))>.001};
}
