import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

// The mountain is the body itself: one rounded shell, one inset face, two eyes.
// No image maps, limb assembly or separate animation clock.
function mountainShape(face = false) {
  const shape = new THREE.Shape();
  shape.moveTo(-1.53, -.72);
  shape.quadraticCurveTo(-1.76, -.72, -1.58, -.49);
  shape.lineTo(-.17, .98);
  shape.quadraticCurveTo(0, 1.15, .17, .98);
  shape.lineTo(1.58, -.49);
  shape.quadraticCurveTo(1.76, -.72, 1.53, -.72);
  if (face) {
    // The quiet silver ridge is a cut in the glass, not an added logo decal.
    shape.lineTo(.70, -.56);
    shape.lineTo(.42, -.30);
    shape.lineTo(.30, -.48);
    shape.lineTo(.08, -.20);
    shape.quadraticCurveTo(.03, -.14, -.02, -.20);
    shape.lineTo(-.29, -.45);
    shape.lineTo(-.39, -.34);
    shape.lineTo(-.70, -.56);
  }
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
  const face = new THREE.Mesh(smoothSolid(mountainShape(true), .035, .025, detail), faceMaterial);
  face.name = 'robot-blue-face';
  face.scale.set(.87, .87, 1);
  face.position.set(0, .005, .262);
  root.add(face);

  const eyes = new THREE.Group();
  eyes.name = 'robot-eyes';
  root.add(eyes);
  const eyeMaterial = new THREE.MeshPhysicalMaterial({
    color: '#b5e1f3', emissive: '#90cbec', emissiveIntensity: 1.15,
    metalness: 0, roughness: .3, transparent: true, depthWrite: false,
  });
  const eyeGeometry = new RoundedBoxGeometry(.21, .095, .035, detail.segment(3, 'rounded'), .045);
  for (const [i, x] of [-.37, .37].entries()) {
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.name = i === 0 ? 'robot-left-eye' : 'robot-right-eye';
    eye.position.x = x;
    eyes.add(eye);
  }
  // A projection source attached to the near eye follows the gaze and body pose.
  const projector = new THREE.Object3D();
  projector.name = 'robot-projector';
  projector.position.set(-.37, 0, .028);
  eyes.add(projector);
  const happyEyes=new THREE.Group(),rejectedEyes=new THREE.Group(),selectedEyes=new THREE.Group();
  happyEyes.name='robot-happy-eyes';rejectedEyes.name='robot-rejected-eyes';selectedEyes.name='robot-selected-eyes';
  const expressionMaterials=[0,1,2].map(()=>new THREE.MeshBasicMaterial({color:'#b5e1f3',transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));
  for(const x of [-.37,.37]){
    const points=Array.from({length:21},(_,i)=>{const u=i/20;return new THREE.Vector3(x+(u-.5)*.26,Math.sin(u*Math.PI)*.10-.025,.025);});
    happyEyes.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.019,8,false),expressionMaterials[0]));
    for(const angle of [-Math.PI/4,Math.PI/4]){const bar=new THREE.Mesh(new RoundedBoxGeometry(.24,.031,.035,3,.015),expressionMaterials[1]);bar.position.set(x,0,.025);bar.rotation.z=angle;rejectedEyes.add(bar);}
    const eye=new THREE.Mesh(new THREE.RingGeometry(.053,.077,32),expressionMaterials[2]);eye.position.set(x,.01,.025);selectedEyes.add(eye);
  }
  eyes.add(happyEyes,rejectedEyes,selectedEyes);
  for(const group of [happyEyes,rejectedEyes,selectedEyes])group.traverse(child=>{if(child.isMesh)child.renderOrder=20;});
  const check=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.065,-.13,.39),new THREE.Vector3(-.015,-.18,.39),new THREE.Vector3(.09,-.065,.39)]),12,.015,6,false),expressionMaterials[2]);check.name='robot-selection-check';check.renderOrder=20;root.add(check);
  const materials = [shellMaterial, faceMaterial, eyeMaterial,...expressionMaterials];
  return {
    root, eyes, projector,
    update(pose, opacity) {
      root.visible = opacity > .001;
      for (const material of materials) material.opacity = opacity;
      eyes.position.set(pose.eyeX * .45, .105 + pose.eyeY * .28, .355);
      eyes.scale.y = pose.blink;
      const happy=pose.happy||0,rejected=pose.rejected||0,selected=pose.selected||0;
      eyeMaterial.opacity=opacity*(1-Math.max(happy,rejected,selected));for(const name of ['robot-left-eye','robot-right-eye'])eyes.getObjectByName(name).visible=eyeMaterial.opacity>.001;
      [happyEyes,rejectedEyes,selectedEyes].forEach((group,i)=>{const weight=[happy,rejected,selected][i];group.visible=weight>.001;expressionMaterials[i].opacity=opacity*weight;});
      check.visible=selected>.001;
      root.position.y=happy*.10+selected*.055*Math.sin((pose.reactionTime-46)*6);
      root.rotation.z=rejected*Math.sin((pose.reactionTime-38)*16)*.06;
      root.rotation.x=selected*Math.sin((pose.reactionTime-46)*7)*.09;
      root.userData.expression=selected>.5?'selected':happy>.5?'happy':rejected>.5?'rejected':'neutral';
    },
  };
}
