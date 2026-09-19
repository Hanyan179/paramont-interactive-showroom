import * as THREE from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

// The mountain is the body itself: one rounded shell, one inset face, two eyes.
// No image maps, limb assembly or separate animation clock.
function mountainShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.53, -.72);
  shape.quadraticCurveTo(-1.76, -.72, -1.58, -.49);
  shape.lineTo(-.17, .98);
  shape.quadraticCurveTo(0, 1.15, .17, .98);
  shape.lineTo(1.58, -.49);
  shape.quadraticCurveTo(1.76, -.72, 1.53, -.72);
  shape.closePath();
  return shape;
}

function smoothSolid(shape, depth, radius, detail) {
  const raw = new THREE.ExtrudeGeometry(shape, {
    depth, steps: 1, bevelEnabled: true, bevelThickness: radius,
    bevelSize: radius, bevelSegments: detail.segment(6, 'bevel'),
    curveSegments: detail.segment(24),
  });
  raw.deleteAttribute('normal');
  raw.deleteAttribute('uv');
  const geometry = mergeVertices(raw);
  raw.dispose();
  geometry.computeVertexNormals();
  return geometry;
}

export function createMountainRobot(quality) {
  const detail = modelDetail('analytics', quality);
  const root = new THREE.Group();
  root.name = 'mountain-robot';
  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: '#e4e9ed', metalness: .55, roughness: .28,
    clearcoat: .45, clearcoatRoughness: .25, envMapIntensity: 1.05,
    transparent: true,
  });
  const shell = new THREE.Mesh(smoothSolid(mountainShape(), .42, .12, detail), shellMaterial);
  shell.name = 'robot-silver-shell';
  shell.position.z = -.28;
  root.add(shell);

  const faceMaterial = new THREE.MeshPhysicalMaterial({
    color: '#071a2c', metalness: .26, roughness: .18,
    clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: .8,
    transparent: true,
  });
  // The silhouette carries the mountain identity. Keep the face uninterrupted:
  // the two eyes perform every expression without a mouth or a second ridge.
  const face = new THREE.Mesh(smoothSolid(mountainShape(), .035, .025, detail), faceMaterial);
  face.name = 'robot-blue-face';
  face.scale.set(.87, .87, 1);
  face.position.set(0, .005, .262);
  root.add(face);

  const eyes = new THREE.Group();
  eyes.name = 'robot-eyes';
  root.add(eyes);
  // Two continuous ribbons change curvature, aperture and asymmetry; no icon swapping.
  const eyeMaterial=new THREE.MeshBasicMaterial({color:'#bce3f4',transparent:true,depthWrite:false,depthTest:false,toneMapped:false,side:THREE.DoubleSide});
  const eyeMeshes=[-.37,.37].map((x,i)=>{
    const geometry=new THREE.BufferGeometry(),vertices=new Float32Array(42*3),indices=[];
    for(let n=0;n<20;n++){const k=n*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));geometry.setIndex(indices);
    const mesh=new THREE.Mesh(geometry,eyeMaterial);mesh.name=i?'robot-right-eye':'robot-left-eye';mesh.position.x=x;mesh.renderOrder=20;mesh.frustumCulled=false;eyes.add(mesh);return mesh;
  });
  const projector = new THREE.Object3D();projector.name='robot-projector';projector.position.set(-.37,0,.028);eyes.add(projector);
  const pupils=eyeMeshes.map((eye,i)=>{const pupil=new THREE.Mesh(new THREE.CircleGeometry(.025,24),new THREE.MeshBasicMaterial({color:'#183747',transparent:true,depthWrite:false,depthTest:false}));pupil.name=`robot-pupil-${i}`;pupil.position.z=.01;pupil.renderOrder=21;eye.add(pupil);return pupil;});
  const glints=eyeMeshes.map((eye,i)=>{const glint=new THREE.Mesh(new THREE.CircleGeometry(.010,16),new THREE.MeshBasicMaterial({color:'#effcff',transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));glint.name=`robot-eye-glint-${i}`;glint.renderOrder=22;glint.position.set(-.023,.033,.018);eye.add(glint);return glint;});
  const materials=[shellMaterial,faceMaterial];
  return {root,shell,eyes,projector,
    update(pose,opacity){
      root.visible=opacity>.001;for(const mat of materials)mat.opacity=opacity;
      const eyeOpacity=opacity*(pose.awake??1);eyeMaterial.opacity=eyeOpacity;
      const happy=pose.happy||0,rejected=pose.rejected||0,selected=pose.selected||0,thinking=pose.thinking||0,impatient=pose.impatient||0,t=pose.reactionTime||0;
      const joy=Math.max(happy,selected*.50),surprise=pose.surprise||0;
      eyes.position.set(pose.eyeX*.38+impatient*.035,.13+pose.eyeY*.24+impatient*.028,.385);eyes.scale.y=pose.blink;
      eyeMeshes.forEach((mesh,i)=>{
        const p=mesh.geometry.attributes.position,halfWidth=.160-surprise*.018;
        const aperture=(.066+surprise*.050)*(1-rejected*(i===0?.73:.42))*(1-thinking*.16)*(1-impatient*.68);
        const tilt=rejected*(i===0?-.045:.024);
        for(let n=0;n<=20;n++){
          const u=n/20,edge=Math.pow(Math.max(0,Math.sin(u*Math.PI)),.42),curve=Math.sin(u*Math.PI)*(joy*.116-impatient*.025)+tilt*(u-.5);
          const thickness=lerpEye(aperture,.017,joy)*edge;
          p.setXYZ(n*2,(u-.5)*halfWidth*2,curve+thickness,0);p.setXYZ(n*2+1,(u-.5)*halfWidth*2,curve-thickness,0);
        }
        p.needsUpdate=true;mesh.userData.aperture=aperture;mesh.userData.curvature=joy;
        pupils[i].position.x=pose.eyeX*.034+impatient*.023;pupils[i].position.y=pose.eyeY*.04;
        pupils[i].scale.y=1-rejected*.45;pupils[i].material.opacity=eyeOpacity*(1-joy)*(1-rejected*.35)*(1-impatient*.6);pupils[i].visible=pupils[i].material.opacity>.001;
        glints[i].material.opacity=eyeOpacity*surprise*(1-joy);glints[i].visible=glints[i].material.opacity>.001;
      });
      // Anticipation, reaction and settle have different timing; movements remain restrained.
      const nod=selected*Math.sin((t-48)*5)*Math.exp(-Math.max(0,t-48)*.55);
      root.position.y=happy*.10+selected*.055+surprise*.025-impatient*.045;
      root.rotation.z=rejected*Math.sin((t-40.8)*7)*.026+thinking*Math.sin(t*1.2)*.012-impatient*.024;
      root.rotation.x=nod*.12;
      root.userData.expression=selected>.5?'selected':happy>.5?'happy':rejected>.5?'skeptical':impatient>.5?'impatient':thinking>.4?'focused':'neutral';
    }
  };
}
const lerpEye=(a,b,t)=>a+(b-a)*t;
