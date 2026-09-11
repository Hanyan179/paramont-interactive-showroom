import * as THREE from 'three';

// One moving highlight carries attention from the company to the selected role.
// It is a scene object, so the light is occluded by the real mountain geometry.
export function createStoryLight(parent) {
  const group=new THREE.Group();group.name='company-to-world-story-light';parent.add(group);
  const targets=[new THREE.Vector3(.65,4.6,.5),new THREE.Vector3(5.5,1.4,3.2),new THREE.Vector3(-7.9,.65,2.7),new THREE.Vector3(5.7,3,-2.5)];
  const routes=targets.map((target,index)=>{
    const start=new THREE.Vector3(.6,.25,2.9);
    const curve=new THREE.CubicBezierCurve3(start,start.clone().add(new THREE.Vector3(index===2?-4:2,1.5,1.2)),target.clone().add(new THREE.Vector3(index===2?2:-1,1.2,1.1)),target);
    const uniforms={time:{value:0},weight:{value:0},reduced:{value:0}};
    const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'varying vec2 vLightUv;void main(){vLightUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec2 vLightUv;uniform float time,weight,reduced;
        void main(){float head=mix(fract(time*.115),.72,reduced);float d=mod(head-vLightUv.x+1.,1.);float trail=exp(-d*24.);float a=weight*(.07+trail*.9);gl_FragColor=vec4(mix(vec3(.36,.74,1.3),vec3(2.8,1.95,.94),trail),a);}`});
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,120,.014,6,false),material);mesh.raycast=()=>{};group.add(mesh);return {mesh,uniforms};
  });
  return {update(time,focus,visibility,reduced,dt){group.visible=visibility>.01;routes.forEach(({uniforms},i)=>{const active=i===(focus??1);uniforms.time.value=time;uniforms.reduced.value=reduced?1:0;uniforms.weight.value=THREE.MathUtils.lerp(uniforms.weight.value,active?visibility:0,reduced?1:1-Math.exp(-dt*4));});}};
}
