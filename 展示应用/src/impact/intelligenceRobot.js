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
    metalness: 0, roughness: .3, transparent: true,
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
  const materials = [shellMaterial, faceMaterial, eyeMaterial];
  return {
    root, eyes, projector,
    update(pose, opacity) {
      root.visible = opacity > .001;
      for (const material of materials) material.opacity = opacity;
      eyes.position.set(pose.eyeX * .45, .105 + pose.eyeY * .28, .355);
      eyes.scale.y = pose.blink;
    },
  };
}
