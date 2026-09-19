// Adapted from pmndrs/drei Float.tsx and SpotLightMaterial.tsx (MIT).
// Copyright (c) 2020 react-spring. See /licenses/drei-MIT.txt.
// Use the exhibit's deterministic clock, not a second frame loop or random phase.
import * as THREE from 'three';
export function floatPose(t, intensity=1) {
 return {x:Math.cos(t/4)/8*intensity,y:Math.sin(t/4)/8*intensity,z:Math.sin(t/4)/20*intensity,lift:Math.sin(t/4)/10*intensity};
}
export function volumeMaterial(){
 return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
  uniforms:{opacity:{value:0},anglePower:{value:1.4},lightColor:{value:new THREE.Color('#8acbff')}},
  vertexShader:`varying vec3 vNormal;varying float vIntensity;void main(){vNormal=normalize(normalMatrix*normal);vIntensity=1.-uv.y*.6;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vNormal;varying float vIntensity;uniform float opacity;uniform float anglePower;uniform vec3 lightColor;void main(){vec3 normal=vec3(vNormal.x,vNormal.y,abs(vNormal.z));float angleIntensity=pow(max(0.,dot(normal,vec3(0.,0.,1.))),anglePower);gl_FragColor=vec4(lightColor,vIntensity*angleIntensity*opacity);}`
 });
}
