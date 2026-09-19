import * as THREE from 'three';
import {intelligenceStages} from './intelligenceContent.js';
import {createIntelligenceArtifacts} from './intelligenceArtifacts.js';
import {createIntelligenceMatter} from './intelligenceMatter.js';
import {createIntelligenceCase} from './intelligenceCase.js';
import {createIntelligenceEvolution} from './intelligenceEvolution.js';
import {createIntelligenceDecision} from './intelligenceDecision.js';
import {createIntelligenceAssets} from './intelligenceAssets.js';
import {createIntelligenceProposals} from './intelligenceProposals.js';

export const intelligenceLayout={heroX:.66,heroY:.415,detailX:.685,detailY:.47};
const HEIGHT=2*Math.tan(THREE.MathUtils.degToRad(46/2))*32;
const smooth=t=>t*t*(3-2*t);

// Dissolve real mesh surfaces while their persistent matter continues to move.
function visibilityController(group){
  const visibility={value:1},materials=new Set();
  group.traverse(object=>{if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>materials.add(material));});
  const declaration='uniform float exhibitVisibility;\n';
  const discard='if(exhibitVisibility < fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)) discard;';
  materials.forEach(material=>{
    if(material.isShaderMaterial){
      material.uniforms.exhibitVisibility=visibility;
      material.fragmentShader=declaration+material.fragmentShader.replace(/void\s+main\s*\(\s*\)\s*\{/,match=>match+discard);
    }else{
      const original=material.onBeforeCompile,previousKey=material.customProgramCacheKey();
      material.onBeforeCompile=shader=>{
        original.call(material,shader);shader.uniforms.exhibitVisibility=visibility;
        shader.fragmentShader=declaration+shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>\n${discard}`);
      };
      material.customProgramCacheKey=()=>previousKey+'-exhibit-dissolve';
    }
  });
  return value=>{visibility.value=value;group.visible=value>.003;};
}


export function intelligenceWorld(quality,manager){
  const root=new THREE.Group();root.name='intelligence-spatial-exhibit';
  // Candidate prototypes replace the old globe and flat product satellites.
  // The prior factories remain available until the visual comparison is settled.
  const artifacts=createIntelligenceArtifacts(quality),proposals=createIntelligenceProposals(manager,quality),evolution=createIntelligenceEvolution(quality),decision=createIntelligenceDecision(quality),assets=createIntelligenceAssets(quality);
  artifacts.roots[0].add(assets.root);artifacts.roots[5].add(evolution.root);artifacts.roots[3].add(decision.root);artifacts.roots[4].add(proposals.root);
  const subjects=artifacts.roots.map((artifact,index)=>{
    const container=new THREE.Group();container.name=`intelligence-${intelligenceStages[index].id}`;container.add(artifact);root.add(container);
    const hit=new THREE.Mesh(new THREE.SphereGeometry(index===4?2.95:2.35,12,8),new THREE.MeshBasicMaterial({visible:false}));hit.userData.stage=index;container.add(hit);
    return {container,artifact,hit,fade:visibilityController(artifact)};
  });
  const matter=createIntelligenceMatter(quality);root.add(matter.root);
  const businessCase=createIntelligenceCase(quality),caseContainer=new THREE.Group();caseContainer.add(businessCase.root);root.add(caseContainer);
  const fadeCase=visibilityController(businessCase.root);
  const assetCase=createIntelligenceAssets(quality);assetCase.root.name='asset-research-case';assetCase.root.scale.setScalar(1.72);caseContainer.add(assetCase.root);
  const fadeAssetCase=visibilityController(assetCase.root);
  const placements=Array.from({length:6},()=>({x:0,y:0,z:0,scale:1}));
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let mode='auto',mix=0,caseMix=0,selected=0,proposalSelection={};
  const pose=()=>({position:new THREE.Vector3(0,0,32),target:new THREE.Vector3(0,0,0)});
  return {root,
    update({time=0,camera,target,aspect=16/9,depthMix=0,intelligence=null,intelligenceProposal={},intelligencePointer=[0,0],dt=1/60,overviewImmediate=false,homeImmediate=false,homePixelHeight=1080}){
      const state=intelligence||{stage:0,weights:[1,0,0,0,0,0],mode:'auto'};
      mode=state.mode;selected=state.stage??0;mix=THREE.MathUtils.clamp(depthMix,0,1);
      const focus=smooth(mix),width=HEIGHT*aspect,clock=homeImmediate?0:time,narrow=aspect<=1.5;
      caseMix=overviewImmediate?Number(mode==='case'):THREE.MathUtils.damp(caseMix,Number(mode==='case'),7,dt);
      const visible=1-caseMix,weights=state.weights||[1,0,0,0,0,0];
      artifacts.update({time:clock,weights,detailMix:focus,selected,reduced:homeImmediate});
      proposalSelection=intelligenceProposal;
      proposals.update({time:clock,selection:proposalSelection,dt,reduced:homeImmediate,immediate:overviewImmediate});
      evolution.update({time:clock,reduced:homeImmediate});decision.update({time:clock,choice:intelligenceProposal.decision??0,dt,reduced:homeImmediate,immediate:overviewImmediate});assets.update({time:clock,reduced:homeImmediate});
      // The chosen business protagonist persists from overview into value and its case.
      const heroX=narrow?.63:intelligenceLayout.heroX,heroY=narrow?.41:.38;
      const heroScale=Math.min(width*.062,HEIGHT*.100);
      subjects.forEach(({container,fade},i)=>{
        const x=THREE.MathUtils.lerp(heroX,intelligenceLayout.detailX,focus),y=i===4?heroY:THREE.MathUtils.lerp(heroY,intelligenceLayout.detailY,focus);
        const detailScale=i===4?heroScale:i===3?Math.min(width*.060,HEIGHT*.15):Math.min(width*.065,HEIGHT*.185);
        const scale=THREE.MathUtils.lerp(heroScale,detailScale,focus);
        container.position.set((x-.5)*width,(.5-y)*HEIGHT,0);container.scale.setScalar(scale);
        container.rotation.set(intelligencePointer[1]*focus*.44,intelligencePointer[0]*focus*.44,0);
        const retainedCase=[2,3,4,5].includes(selected);
        fade(i===4?THREE.MathUtils.lerp(1,weights[i],focus)*(selected===4?1:visible):focus*weights[i]*(retainedCase?1:visible));
        Object.assign(placements[i],{x:container.position.x,y:container.position.y,z:0,scale,yaw:container.rotation.y,tilt:container.rotation.x});
      });
      matter.update({time:clock,weights,placements,alpha:visible*focus*(1-weights[4]),detailMix:focus,reduced:homeImmediate,pixelHeight:homePixelHeight});
      businessCase.update({time:clock,reduced:homeImmediate,stage:selected});fadeCase(selected===1?caseMix:0);
      assetCase.update({time:clock,reduced:homeImmediate});fadeAssetCase(selected===0?caseMix:0);
      const caseScale=Math.min(width*.039,HEIGHT*.057);caseContainer.position.set(width*.20,.6,0);caseContainer.scale.setScalar(caseScale);caseContainer.rotation.set(intelligencePointer[1]*.3,intelligencePointer[0]*.3,0);
      const view=pose();camera.copy(view.position);target.copy(view.target);
      root.userData.stage=selected;root.userData.mode=mode;root.userData.morphWeights=weights;root.userData.proposalPhase=proposals.root.userData.phase;
    },
    isMoving:()=>Math.abs(caseMix-Number(mode==='case'))>.001||proposals.isMoving(proposalSelection)||decision.isMoving(proposalSelection.decision??0),
    focusPose:pose,prepare(){root.visible=true;},project:()=>[],
    pick(x,y,w,h,camera){
      if(mode==='case'||caseMix>.01||(mix>.001&&mix<.999))return null;
      root.updateMatrixWorld(true);ray.setFromCamera(pointer.set(x/w*2-1,1-y/h*2),camera);
      const candidates=subjects.filter((_s,i)=>i===(mix<.5?4:selected));
      const hits=ray.intersectObjects(candidates.map(subject=>subject.hit),false);
      if(!hits.length)return null;
      return {intelligence:true,focusId:intelligenceStages[hits[0].object.userData.stage].id};
    },
  };
}
