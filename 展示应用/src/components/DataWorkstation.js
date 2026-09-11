import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import * as THREE from 'three';
import {createAnalysisInstrument} from '../analytics/AnalysisInstrument.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// An original, inspectable workstation. Screen geometry illustrates a workflow;
// it does not encode measured market values or an operating AI service.
export function createDataWorkstation({expanded=false}={}) {
  const precision=modelDetail('analytics');
  const root=new THREE.Group();root.name='data-workstation';root.userData.qualityModel='analytics';root.userData.analysisStep=0;
  const material=(color,metalness,roughness)=>new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.45,envMapIntensity:.55});
  const navy=material('#173858',.35,.27),silver=material('#a6b8c7',.8,.28),pearl=material('#d5dcdf',.25,.34),gold=material('#b89762',.72,.29);
  const glow=new THREE.MeshBasicMaterial({color:'#86cddd'}),dark=new THREE.MeshBasicMaterial({color:'#0c213c'});
  if(expanded)return createAnalysisInstrument(root,{navy,silver,pearl,gold,glow});
  const rounded=(w,h,d,m,x,y,z,r=.06,parent=root)=>{const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,precision.segment(3,'rounded'),Math.min(r,w/3,h/3,d/3)),m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;};
  rounded(2.65,.14,1.6,silver,0,.18,0);rounded(2.6,.05,1.55,navy,0,.26,0);
  rounded(.42,1.02,.16,silver,0,.81,-.47);rounded(.92,.08,.48,silver,0,.33,-.38);
  const monitor=new THREE.Group();monitor.position.set(0,1.62,-.5);monitor.rotation.x=-.08;root.add(monitor);
  rounded(2.75,1.64,.13,navy,0,0,0,.075,monitor);
  rounded(2.61,1.46,.018,dark,0,.035,.077,.035,monitor);
  rounded(.13,.018,.015,glow,0,-.763,.075,.006,monitor);
  const bars=[];
  for(let i=0;i<12;i++){const h=.15+Math.sin(i*.55)**2*.67;const b=rounded(.105,h,.028,i>8?gold:glow,-1.07+i*.187,-.55+h/2,.105,.01,monitor);b.userData.base=h;bars.push(b);}
  for(let i=0;i<3;i++)rounded(.55-i*.11,.025,.02,i===0?pearl:silver,-.78+i*.025,.54-i*.095,.104,.008,monitor);
  const keyboard=new THREE.Group();keyboard.position.set(-.14,.32,.36);root.add(keyboard);
  rounded(1.46,.05,.49,silver,0,0,0,.025,keyboard);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++)rounded(.087,.022,.067,navy,-.625+col*.113,.04,-.164+row*.094,.009,keyboard);
  rounded(.24,.08,.39,pearl,.98,.36,.4,.07);
  const core=new THREE.Group();core.position.set(1.87,.59,-.08);core.userData.analysisStep=2;root.add(core);
  rounded(.5,.74,.56,navy,0,0,0,.075,core);
  for(let i=0;i<7;i++)rounded(.51,.025,.59,silver,0,-.24+i*.07,0,.009,core);
  rounded(.29,.29,.025,glow,0,.05,.296,.025,core);
  applySurfaceFinish(THREE,root,precision);
  let phase=0;
  return {root,update(time,stage=0,dt=.016,reduced=false,detail=null){
    time*=precision.motionScale;
    phase=THREE.MathUtils.lerp(phase,stage, reduced?1:1-Math.exp(-dt*3));
    bars.forEach((b,i)=>{const h=.12+(.24+.44*Math.sin(i*.47+phase*.73)**2);b.scale.y=THREE.MathUtils.lerp(b.scale.y,h/b.userData.base,.08);b.position.y=-.55+b.userData.base*b.scale.y/2;});
    monitor.rotation.y=Math.sin(phase*.65)*.10;
    core.rotation.y=reduced?.2:time*.10;
  }};
}
