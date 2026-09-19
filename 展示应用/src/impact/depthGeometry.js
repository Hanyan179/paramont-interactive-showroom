import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export function trace(parent,points,color='#a9d9ef',opacity=.3){
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));parent.add(line);return line;
}
export function circle(parent,r,color='#9ac7de',opacity=.3){return trace(parent,Array.from({length:161},(_,i)=>V(Math.cos(i/160*Math.PI*2)*r,0,Math.sin(i/160*Math.PI*2)*r)),color,opacity);}
export function block(parent,material,size,position){const mesh=new THREE.Mesh(Math.min(...size)>.25?new RoundedBoxGeometry(...size,2,Math.min(.12,Math.min(...size)*.12)):new THREE.BoxGeometry(...size),material);mesh.position.set(...position);parent.add(mesh);return mesh;}
export function flow(parent,points,{color='#f4cd91',radius=.035,speed=.09,offset=0}={}){
  const path=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p));
  trace(parent,path.getPoints(96),color,.24);
  const uniforms={time:{value:0},color:{value:new THREE.Color(color).multiplyScalar(2.2)},speed:{value:speed},offset:{value:offset}};
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,96,radius,5,false),new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;uniform vec3 color;uniform float time;uniform float speed;uniform float offset;void main(){float tail=fract(time*speed+offset-vUv.x);float glow=pow(1.-smoothstep(0.,.24,tail),2.);gl_FragColor=vec4(color,glow);}',
  }));parent.add(mesh);return {path,update(time){uniforms.time.value=time;}};
}
export function projectAnchors(root,anchors,camera,width,height){root.updateWorldMatrix(true,true);return anchors.map(({id,point})=>{const p=root.localToWorld(point.clone()).project(camera);return {id,x:(p.x+1)*width/2,y:(1-p.y)*height/2,visible:p.z<1&&p.z>0&&Math.abs(p.x)<.95&&p.y<.76&&p.y>-.55};});}
export function createDepthPicker(root,hits){const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();return (x,y,w,h,camera)=>{root.updateWorldMatrix(true,true);ray.setFromCamera(ndc.set(x/w*2-1,1-y/h*2),camera);return ray.intersectObjects(hits,true)[0]?.object.userData.focusId;};}
