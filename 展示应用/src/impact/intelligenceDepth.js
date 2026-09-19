import * as THREE from 'three';
import {V,trace,circle,block,flow,projectAnchors,createDepthPicker} from './depthGeometry.js';
import {createNeuralField} from './neuralField.js';

const ids=['signals','categories','direction'];
const locations=[V(-17,0,7),V(0,0,-3),V(17,0,8)];
function materials(){return {
  metal:new THREE.MeshStandardMaterial({color:'#7cacc4',metalness:.84,roughness:.28}),
  dark:new THREE.MeshPhysicalMaterial({color:'#071c31',metalness:.65,roughness:.27,clearcoat:.55}),
  glass:new THREE.MeshPhysicalMaterial({color:'#1e789e',metalness:.28,roughness:.17,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}),
  gold:new THREE.MeshStandardMaterial({color:'#d4b886',metalness:.8,roughness:.23}),
  light:new THREE.MeshBasicMaterial({color:new THREE.Color('#85dfff').multiplyScalar(2),transparent:true,opacity:.9,depthWrite:false}),
};}
function path(parent,vertices,color='#75d3ec',opacity=.6){return trace(parent,vertices.map(p=>Array.isArray(p)?V(...p):p),color,opacity);}
function frame(parent,w,h,z,color='#73bdd4',opacity=.5){return path(parent,[[-w/2,0,z],[w/2,0,z],[w/2,h,z],[-w/2,h,z],[-w/2,0,z]],color,opacity);}
function signalChamber(group,m,motions,routes){
  // Three depth layers retain the provenance -> context -> research sequence.
  const volume=new THREE.Group();volume.position.y=.8;volume.rotation.y=-.2;group.add(volume);
  const matrix=new THREE.Matrix4();
  for(let layer=0;layer<3;layer++){
    const z=(layer-1)*2.4;
    block(volume,m.glass,[8,9,.05],[0,4.5,z]);frame(volume,8,9,z);
    block(volume,m.dark,[8.4,.22,.45],[0,0,z]);block(volume,m.metal,[8.4,.08,.45],[0,9,z]);
    const records=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.045,.035),m.light,72);volume.add(records);
    for(let i=0;i<72;i++){
      const col=i%6,row=Math.floor(i/6);matrix.makeScale(.4+((i*7)%9)*.06,1,1);matrix.setPosition(-3.4+col*1.22,.65+row*.67,z+.08);records.setMatrixAt(i,matrix);
    }
    const scan=block(volume,m.light,[7.8,.035,.065],[0,2,z+.12]);motions.push(t=>{scan.position.y=.45+((t*.6+layer*2.5)%8);});
    for(let lane=0;lane<3;lane++)routes.push(flow(group,[[-4,2+lane*2,z+1],[-1,5+lane,z+1],[4,4+lane,0],[9,5,-1]],{color:lane===1?'#e2bf81':'#65c8f4',radius:.022,offset:layer*.15+lane*.07,speed:.12}));
  }
  const relay=new THREE.Group();relay.position.set(0,-.25,0);group.add(relay);
  for(let i=0;i<7;i++)block(relay,i%2?m.metal:m.dark,[9.6-i*.15,.11,6.5-i*.16],[0,-i*.25,0]);
  const lens=circle(group,5.1,'#6ee1ff',.36);lens.position.y=5;lens.rotation.x=Math.PI/2;lens.scale.x=.84;motions.push(t=>{lens.position.z=Math.sin(t*.25)*3.2;});
}
function inferenceCore(group,m,motions,routes){
  const field=createNeuralField();field.root.position.set(0,8,0);field.root.scale.setScalar(1.7);group.add(field.root);motions.push(t=>field.update(t));
  // Layered compute substrate, sockets and optical links support the neural volume.
  for(let i=0;i<5;i++){
    const size=12-i*.9,layer=block(group,i%2?m.metal:m.dark,[size,.25,size],[0,-1.9+i*.5,0]);layer.rotation.y=Math.PI/4;
    path(group,[[-size/2,-1.68+i*.5,-size/2],[size/2,-1.68+i*.5,-size/2],[size/2,-1.68+i*.5,size/2],[-size/2,-1.68+i*.5,size/2],[-size/2,-1.68+i*.5,-size/2]],'#62bcd3',.5).rotation.y=Math.PI/4;
  }
  const chip=block(group,m.dark,[5,.38,5],[0,.72,0]);chip.rotation.y=Math.PI/4;
  for(let side=0;side<4;side++)for(let i=0;i<15;i++){
    const fin=block(group,i%4===0?m.gold:m.metal,[.09,.09,.55],[-3.25+i*.46,.4,6.15]);fin.position.applyAxisAngle(V(0,1,0),side*Math.PI/2);fin.rotation.y=side*Math.PI/2;
  }
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,x=Math.cos(a)*5.3,z=Math.sin(a)*5.3;
    routes.push(flow(group,[[x,-1,z],[x,.8,z],[x*.5,3.5,z*.5],[x*.85,6,z*.85]],{radius:.025,offset:i/12,speed:.08}));
  }
  const halo=new THREE.Mesh(new THREE.TorusGeometry(9.1,.035,8,160,Math.PI*1.6),m.metal);halo.position.y=8;halo.rotation.set(.35,.3,-.35);group.add(halo);
  const halo2=new THREE.Mesh(new THREE.TorusGeometry(9.5,.018,6,160,Math.PI*1.5),m.light);halo2.position.y=8;halo2.rotation.set(.45,.3,Math.PI*.72);group.add(halo2);
  motions.push(t=>{halo.rotation.y=.3+Math.sin(t*.08)*.09;halo2.rotation.z=Math.PI*.72-t*.026;});
}
function generationChamber(group,m,motions,routes){
  const prototype=new THREE.Group();prototype.position.set(0,.4,0);group.add(prototype);
  const profile=[[0,0],[.75,0],[1,.18],[1,3.6],[.67,4.15],[.42,4.25],[.42,4.7],[0,4.7]].map(p=>new THREE.Vector2(...p));
  const bottle=new THREE.LatheGeometry(profile,40),shell=new THREE.MeshPhysicalMaterial({color:'#50b9d2',metalness:.3,roughness:.2,clearcoat:1,transparent:true,opacity:.8});
  for(let i=0;i<3;i++){
    const stage=new THREE.Group();stage.position.set((i-1)*4.1,0,(i-1)*-1.4);prototype.add(stage);
    const deck=block(stage,m.dark,[3.3,.22,3.3],[0,-.25,0]);deck.rotation.y=.15;
    for(let j=0;j<4;j++){const rim=frame(stage,3.25,6.5,-1.55-j*.4,i===2?'#d7bf90':'#63cdeb',.25-j*.035);rim.rotation.y=.15;}
    const object=i===0?new THREE.LineSegments(new THREE.WireframeGeometry(bottle),new THREE.LineBasicMaterial({color:'#62c7ef',transparent:true,opacity:.34})):new THREE.Mesh(bottle,i===1?m.glass:shell.clone());stage.add(object);
    if(i>0){
      const capMaterial=i===2?m.gold.clone():m.glass,cap=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.65,32),capMaterial);cap.position.y=4.98;object.add(cap);
      if(i===2){
        // The candidate is visibly reconstructed from its wireframe, then held for review.
        const reveal={value:0},outline=new THREE.LineSegments(new THREE.WireframeGeometry(bottle),new THREE.LineBasicMaterial({color:'#9bd5e7',transparent:true,opacity:.12}));stage.add(outline);
        object.material.onBeforeCompile=shader=>{
          shader.uniforms.reveal=reveal;
          shader.vertexShader='varying float formHeight;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nformHeight=position.y;');
          shader.fragmentShader='varying float formHeight;uniform float reveal;\n'+shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(formHeight>reveal)discard;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.3,1.5,2.)*(1.-smoothstep(0.,.10,abs(reveal-formHeight)));');
        };
        object.material.customProgramCacheKey=()=> 'insight-form-reveal';capMaterial.transparent=true;
        motions.push(t=>{const scan=(t*.5+i*1.8)%7;reveal.value=scan;capMaterial.opacity=THREE.MathUtils.smoothstep(scan,4.65,5.2);outline.rotation.copy(object.rotation);});
      }
    }
    const scanner=circle(stage,1.4,i===2?'#edd4a0':'#8ae3f7',.7);motions.push(t=>{scanner.position.y=.1+((t*.5+i*1.8)%5.2);object.rotation.y=Math.sin(t*.16)*.2;});
    routes.push(flow(group,[[-8,4,-1],[-5,6,0],[(i-1)*4.1,6,(i-1)*-1.4],[(i-1)*4.1,3,(i-1)*-1.4]],{color:i===2?'#eccb92':'#67c6ed',radius:.024,speed:.09,offset:i*.17}));
  }
  // Parallel concept branch: a toy form is a candidate, never a claimed AI result.
  const rings=new THREE.Group();rings.position.set(3,1.5,5);rings.rotation.z=.15;group.add(rings);
  for(let i=0;i<4;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05-i*.21,.18,12,44),i===3?m.gold:i%2?m.metal:shell);ring.rotation.x=Math.PI/2;ring.position.y=i*.65;rings.add(ring);
  }
  motions.push(t=>{rings.rotation.y=t*.1;rings.position.y=1.5+Math.sin(t*.5)*.16;});frame(group,3.4,5,4,'#87b9cf',.3).position.x=3;
}
export function createIntelligenceDepth(){
  const root=new THREE.Group(),m=materials(),motions=[],routes=[],hits=[];root.userData.kind='inference-space';
  const groups=locations.map((p,i)=>{const g=new THREE.Group();g.position.copy(p);g.userData.insight=ids[i];root.add(g);return g;});
  signalChamber(groups[0],m,motions,routes);inferenceCore(groups[1],m,motions,routes);generationChamber(groups[2],m,motions,routes);
  const ground=block(root,m.dark,[63,.18,37],[0,-2.6,1]);ground.material=m.dark.clone();ground.material.color.set('#020d19');ground.material.metalness=.05;ground.material.roughness=.88;ground.material.clearcoat=0;ground.material.envMapIntensity=.1;
  // Continuous optical bus makes the three operations read as a single engine.
  for(let lane=0;lane<11;lane++){
    const z=(lane-5)*1.2;
    routes.push(flow(root,[[-31,-2.42,z+8],[-22,-2.42,z+8],[-9,-2.42,z],[-5,-2.42,z-4],[6,-2.42,z-4],[12,-2.42,z+7],[31,-2.42,z+7]],{color:lane===5?'#e6bf83':'#3f92b8',radius:lane===5?.035:.018,speed:.055,offset:lane*.065}));
  }
  for(let i=0;i<28;i++){const x=-30+i*2.2;path(root,[[x,-2.38,-15],[x,-2.38,19]],'#356c91',.16);}
  for(let z=-15;z<20;z+=2.2)path(root,[[-30,-2.38,z],[30,-2.38,z]],'#356c91',.13);
  const anchors=locations.map((p,i)=>({id:ids[i],point:p.clone().add(V(i===0?7:0,i===1?19:12,0))}));
  groups.forEach((group,i)=>{const hit=new THREE.Mesh(new THREE.SphereGeometry(i===1?8:6,16,12),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=6;hit.userData.focusId=ids[i];group.add(hit);hits.push(hit);});
  let selection=null;const picker=createDepthPicker(root,hits);
  return {root,
    update(time,mix,id=null){selection=id;root.visible=mix>0;root.position.y=-7*(1-mix);root.scale.setScalar(.68+.32*mix);if(mix>0){motions.forEach(fn=>fn(time));routes.forEach(r=>r.update(time));}},
    pose(id,aspect=16/9){
      const poses={signals:[V(-7,11,30),V(-21,4,6)],categories:[V(8,11,30),V(-5,7,-3)],direction:[V(31,10,32),V(13,3.2,8)]};
      const [position,target]=poses[id]||[V(15,16,52),V(-10,5,0)];
      return {position:target.clone().add(position.clone().sub(target).multiplyScalar(Math.max(1,Math.min(1.22,1.65/aspect)))),target:target.clone()};
    },
    project:(camera,w,h)=>projectAnchors(root,anchors,camera,w,h).map(p=>({...p,visible:p.visible&&!selection})),
    pick:(...args)=>selection?null:picker(...args),prepare(){root.visible=true;},
  };
}
