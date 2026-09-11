import * as THREE from 'three';

// Geometry and the camera share world coordinates, including a user's full turn.
// Invisible descendants must not enlarge the frame during a scene transition.
export function visibleBounds(objects, target = new THREE.Box3()) {
  target.makeEmpty();
  // Keep individual mesh corners too: a single union box contains empty corners
  // between distant islands and would unnecessarily shrink the whole world.
  target.framePoints = [];
  const box = new THREE.Box3();
  function visit(object) {
    if (!object.visible) return;
    if (object.geometry) {
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      box.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);
      target.union(box);
      const local=object.geometry.boundingBox;
      for(const x of [local.min.x,local.max.x])for(const y of [local.min.y,local.max.y])for(const z of [local.min.z,local.max.z])target.framePoints.push(new THREE.Vector3(x,y,z).applyMatrix4(object.matrixWorld));
    }
    object.children.forEach(visit);
  }
  for (const object of objects) {
    object.updateWorldMatrix(true, true);
    visit(object);
  }
  return target;
}

// Fit every corner into a viewport rectangle without cropping or changing FOV.
// The camera keeps a fixed viewing direction; its screen offset reserves the UI.
export function frameBounds(bounds, {
  aspect, fov = 40, direction = new THREE.Vector3(0, .38, 1),
  frame = {left: .04, right: .96, top: .12, bottom: .82},
  minimumDistance = 0,
}) {
  const center = bounds.getCenter(new THREE.Vector3());
  const back = direction.clone().normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), back).normalize();
  const up = new THREE.Vector3().crossVectors(back, right);
  const tanY = Math.tan(THREE.MathUtils.degToRad(fov) / 2), tanX = tanY * aspect;
  const minX = frame.left * 2 - 1, maxX = frame.right * 2 - 1;
  const minY = 1 - frame.bottom * 2, maxY = 1 - frame.top * 2;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  let distance = minimumDistance;
  const corners=bounds.framePoints||[0,1,2,3,4,5,6,7].map(i=>new THREE.Vector3(i&1?bounds.max.x:bounds.min.x,i&2?bounds.max.y:bounds.min.y,i&4?bounds.max.z:bounds.min.z));
  for (const corner of corners) {
    const p = corner.clone().sub(center);
    const px = p.dot(right), py = p.dot(up), depth = p.dot(back);
    distance = Math.max(distance, depth + .2,
      (px / tanX + maxX * depth) / (maxX - cx),
      (-px / tanX - minX * depth) / (cx - minX),
      (py / tanY + maxY * depth) / (maxY - cy),
      (-py / tanY - minY * depth) / (cy - minY));
  }
  const look = center.clone().addScaledVector(right, -cx * distance * tanX).addScaledVector(up, -cy * distance * tanY);
  return {position: look.clone().addScaledVector(back, distance), look};
}

export function turnHome(pose, dx, dy, width, height) {
  return {
    yaw: pose.yaw + dx / width * Math.PI * 1.6,
    tilt: THREE.MathUtils.clamp(pose.tilt + dy / height * .9, -.38, .65),
  };
}
