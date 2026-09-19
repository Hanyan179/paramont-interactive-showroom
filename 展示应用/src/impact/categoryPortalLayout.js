// The same dimensions drive the exhibit geometry, camera fit and click surfaces.
export const portalSize={width:4.6,height:10,faceWidth:4.38,faceHeight:9.78,faceZ:.10,floor:-4.7};
// Scheme 2 is retained as an unadopted study. The approved category gallery is
// used even when a previously opened preview still has ?categoryScheme=2.
export const isPortalScheme=false;

export function portalPose(index){
  const angle=(index-2.5)*.145,radius=37;
  return {x:Math.sin(angle)*radius,y:portalSize.floor+portalSize.height/2,z:radius*(1-Math.cos(angle)),yaw:-angle};
}

export function portalCamera(aspect){
  return {z:Math.max(24.5,43/Math.max(.8,aspect)),y:.3};
}

export function portalSelection(current,step){return (current+step+6)%6;}

export function portalFocusPose(aspect){
  const camera=portalCamera(aspect),height=2*camera.z*Math.tan(23*Math.PI/180),width=height*aspect;
  const z=3.2,depth=(camera.z-z)/camera.z;
  return {x:width*.20*depth,y:camera.y,z,scale:Math.min(height*.64/portalSize.height,width*.33/portalSize.width)*depth};
}
