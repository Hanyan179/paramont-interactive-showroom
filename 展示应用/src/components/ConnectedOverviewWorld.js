import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import * as THREE from 'three';
import {createDataWorkstation} from './DataWorkstation';
import {createBrandMonument} from './BrandMonument';
import {visibleBounds} from './rendering/sceneFraming.js';
import {overviewPositions, overviewVisibility} from './rendering/overviewLayout.js';

export function createConnectedOverviewWorld(manager) {
  const detail=modelDetail('samples');
  const root=new THREE.Group();root.name='connected-brand-overview';
  const monument=createBrandMonument(),core=monument.root;core.userData.homeEntry=0;core.rotation.y=-.22;root.add(core);
  const silver=new THREE.MeshPhysicalMaterial({color:'#c4cdd6',metalness:.94,roughness:.2,clearcoat:.3,envMapIntensity:1.1});
  const islandMaterial=new THREE.MeshStandardMaterial({color:'#213f6b',metalness:.4,roughness:.35});
  const accent=new THREE.MeshPhysicalMaterial({color:'#274979',metalness:.3,roughness:.32,clearcoat:.7});
  const brass=new THREE.MeshPhysicalMaterial({color:'#c4a578',metalness:.88,roughness:.24});
  const white=new THREE.MeshPhysicalMaterial({color:'#cad7e2',metalness:.65,roughness:.34});
  const satellite=()=>{
    const g=new THREE.Group(),base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.17,.15,detail.segment(64)),islandMaterial);base.receiveShadow=true;g.add(base);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(1.47,.01,detail.segment(5,'radial'),detail.segment(96)),silver);edge.rotation.x=Math.PI/2;edge.position.y=.08;g.add(edge);root.add(g);return g;
  };
  const products=satellite();products.name='product-workdesk';products.userData.homeEntry=2;products.position.set(-7.3,.80,2.1);
  for(let i=0;i<5;i++){const book=new THREE.Mesh(new THREE.BoxGeometry(1.35,.036,.96),i===4?accent:white);book.position.set(-.22,.15+i*.052,.18);book.rotation.y=-.15+i*.035;products.add(book);}
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.23,.22,.58,detail.segment(32)),brass);pot.position.set(.66,.4,-.28);products.add(pot);
  for(let i=0;i<5;i++){
    const pencil=new THREE.Group(),shaft=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.85,6),i%2?accent:brass),tip=new THREE.Mesh(new THREE.ConeGeometry(.025,.13,6),white);tip.position.y=.49;pencil.add(shaft,tip);pencil.position.set(.66+(i-2)*.05,.94,-.28);pencil.rotation.z=(i-2)*.12;products.add(pencil);
  }
  const smallOrb=new THREE.Mesh(new THREE.SphereGeometry(.22,detail.segment(32),detail.segment(24)),silver);smallOrb.position.set(.55,.32,.55);products.add(smallOrb);
  const brands=new THREE.Group();root.add(brands);brands.name='data-analysis-workstation';brands.userData.homeEntry=3;brands.position.set(5.7,1.6,-2.5);
  const workstation=createDataWorkstation();workstation.root.scale.setScalar(.83);brands.add(workstation.root);
  const globeSocket=satellite();globeSocket.name='overview-globe';globeSocket.userData.homeEntry=1;
  const globeBase=[...globeSocket.children];

  const subjects=[core,globeSocket,products,brands];
  const anchors=[[0,4.9,0],[0,2.7,0],[0,1.85,0],[0,2.9,0]].map(p=>new THREE.Vector3(...p));
  const bases=overviewPositions.map(p=>new THREE.Vector3(...p)),focusLift=subjects.map(()=>0);
  const ringPoints=Array.from({length:201},(_,i)=>{const a=i/200*Math.PI*2;return new THREE.Vector3(Math.cos(a)*8.4,-.34,Math.sin(a)*5.9);});
  const orbit=new THREE.CatmullRomCurve3(ringPoints,true),ringMaterial=new THREE.LineBasicMaterial({color:'#99becf',transparent:true,opacity:.34});
  const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPoints),ringMaterial);root.add(ring);
  const travelers=Array.from({length:3},()=>{const dot=new THREE.Mesh(new THREE.SphereGeometry(.032,12,8),new THREE.MeshBasicMaterial({color:'#c3e7f7'}));root.add(dot);return dot;});
  applySurfaceFinish(THREE,products,detail);products.userData.qualityModel='samples';
  return {
    root,globeSocket,get modelReady(){return true;},
    update({mix,story,journey,yaw,tilt,time,reduced,focus=null,dt=.016}){
      const overview=(1-mix)*(1-story),seconds=time/1000;
      monument.update(seconds,reduced);workstation.update(seconds,0,dt,reduced);
      focusLift.forEach((v,i)=>focusLift[i]=THREE.MathUtils.lerp(v,i===focus?1:0,reduced?1:1-Math.exp(-dt*4)));
      const focusTotal=focusLift.reduce((sum,v)=>sum+v,0);
      root.visible=journey<.997&&(mix>.002||overview>.002);
      root.position.set(THREE.MathUtils.lerp(1.55,-1.5,mix),-1.1*(1-mix),0);root.rotation.set((tilt+.08)*(1-mix),(yaw-.28)*(1-mix),0);
      subjects.forEach((subject,i)=>{
        // A single orbital transform preserves front/back depth and physical spacing.
        subject.position.copy(bases[i]);
        const visibility=overviewVisibility(focusLift,i);
        subject.scale.setScalar(Math.max(.001,overview*visibility));
        subject.visible=overview*visibility>.012;
      });
      const globeOverview=bases[1].clone();
      globeSocket.position.copy(globeOverview).lerp(new THREE.Vector3(-.3,-1.8,0),mix).add(new THREE.Vector3(-journey*9,0,journey*7));
      globeSocket.scale.setScalar(Math.max(.001,THREE.MathUtils.lerp(overview*overviewVisibility(focusLift,1),3,mix)*(1+Math.sin(journey*Math.PI)*1.25)));
      globeSocket.visible=mix>.003||globeSocket.scale.x>.012;globeBase.forEach(o=>o.visible=mix<.5);
      ring.visible=overview>.01&&focusTotal<.97;ringMaterial.opacity=.34*overview*(1-focusTotal);
      travelers.forEach((dot,i)=>{dot.visible=ring.visible;dot.position.copy(orbit.getPointAt(reduced?i/3:(seconds*.012+i/3)%1));dot.scale.setScalar(Math.max(.001,overview*(1-focusTotal)));});
    },
    point:index=>anchors[index].clone().applyMatrix4(subjects[index].matrixWorld),
    bounds:index=>visibleBounds(index==null?subjects:[subjects[index]]),
    pick(raycaster){
      const hit=raycaster.intersectObjects(subjects.filter(g=>g.visible&&g.scale.x>.2),true)[0];if(!hit)return null;
      let object=hit.object;while(object&&object.userData.homeEntry===undefined)object=object.parent;return object?.userData.homeEntry??null;
    },
    occluded(raycaster,point,index){const hit=raycaster.intersectObjects(subjects.filter((g,i)=>i!==index&&g.visible&&g.scale.x>.2),true)[0];return !!hit&&hit.distance<raycaster.ray.origin.distanceTo(point)-.12;},
    dispose(){},
  };
}
