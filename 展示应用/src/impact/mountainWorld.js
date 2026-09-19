import * as THREE from 'three';
import {ImprovedNoise} from 'three/addons/math/ImprovedNoise.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

const curve=points=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.35);

export function mountainWorld(manager,quality,disposeTree){
  const root=new THREE.Group(),noise=new ImprovedNoise(),detail=modelDetail('monument',quality);
  const geometry=new THREE.PlaneGeometry(100,88,detail.segment(220),detail.segment(220));geometry.rotateX(-Math.PI/2);
  const position=geometry.attributes.position;
  function height(x,z){
    let n=0,a=1.6,f=.15;for(let i=0;i<5;i++){n+=a*(1-Math.abs(noise.noise(x*f,z*f,3.7)));a*=.48;f*=2.13;}
    const peak=(px,pz,h,sx,sz)=>h*Math.exp(-((x-px)**2/sx+(z-pz)**2/sz));
    const body=peak(1,-3,27,190,110)+peak(-24,-18,16,135,130)+peak(27,-22,19,135,95)+peak(3,-39,12,220,75);
    const ridge=(1-Math.abs(Math.sin(x*.36+z*.15+noise.noise(x*.06,z*.06,7)*2)))*1.5;
    return -9+body+n*(.6+body*.12)+ridge*Math.min(1,body/7);
  }
  for(let i=0;i<position.count;i++)position.setY(i,height(position.getX(i),position.getZ(i)));
  geometry.computeVertexNormals();
  const snowCoverage=new Float32Array(position.count),colors=new Float32Array(position.count*3),normal=geometry.attributes.normal,stone=new THREE.Color('#5c7387'),snow=new THREE.Color('#e2eff5');
  for(let i=0;i<position.count;i++){const h=position.getY(i),slope=normal.getY(i),cover=THREE.MathUtils.smoothstep(h+noise.noise(position.getX(i)*.5,position.getZ(i)*.5,4)*2,17,28)*THREE.MathUtils.smoothstep(slope,.30,.72);snowCoverage[i]=cover;const c=stone.clone().lerp(snow,cover);c.toArray(colors,i*3);}
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.setAttribute('snowCoverage',new THREE.BufferAttribute(snowCoverage,1));
  const loader=new THREE.TextureLoader(manager),map=loader.load('/media/models/mountainside/textures/mountainside_diff_1k.jpg');map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(8,8);
  const normalMap=loader.load('/media/materials/rock-normal.jpg');normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;normalMap.repeat.set(12,12);
  const material=new THREE.MeshStandardMaterial({map,normalMap,normalScale:new THREE.Vector2(.38,.38),vertexColors:true,roughness:.84,metalness:.12});
  material.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float snowCoverage;varying float vSnow;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSnow=snowCoverage;');
    shader.fragmentShader='varying float vSnow;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
      vec4 rock=texture2D(map,vMapUv);float shade=dot(rock.rgb,vec3(.2126,.7152,.0722));
      diffuseColor.rgb*=mix(vec3(shade*1.4),vec3(.96),vSnow*.9);
    `);
  };
  const terrain=new THREE.Mesh(geometry,material);terrain.castShadow=terrain.receiveShadow=true;terrain.name='sculpted-alpine-terrain';root.add(terrain);
  let abandoned=false;
  new GLTFLoader(manager).load('/media/models/mountainside/scene.gltf',gltf=>{
    if(abandoned){disposeTree(gltf.scene);return;}
    const cliff=gltf.scene;cliff.position.set(-20,-11,12);cliff.scale.set(1.15,1.4,1.2);cliff.rotation.y=.32;
    cliff.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.material.color.set('#7197b0');o.material.roughness=.83;o.material.metalness=.12;}});root.add(cliff);
  });
  const cameraPath=curve([[13,7,57],[7,10,54],[-5,19,53],[-10,32,55],[4,37,57],[16,22,59],[13,7,57]]);
  const targetPath=curve([[-5,11,-3],[-5,13,-3],[-4,14,-3],[-3,12,-4],[-3,12,-4],[-4,12,-3],[-5,11,-3]]);
  return {root,update({time,progress,camera,target}){camera.copy(cameraPath.getPoint(progress));target.copy(targetPath.getPoint(progress));},dispose(){abandoned=true;}};
}
