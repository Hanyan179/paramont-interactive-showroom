import * as THREE from 'three';

export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export const TAU=Math.PI*2;
export const fract=t=>t-Math.floor(t);
export function addMesh(parent,name,geometry,material,p=[0,0,0]){
  const object=new THREE.Mesh(geometry,material);object.name=name;object.position.set(...p);parent.add(object);return object;
}
export function opticalPalette(){
  return {
    glass:new THREE.MeshPhysicalMaterial({color:'#7eb9df',metalness:.12,roughness:.085,clearcoat:1,clearcoatRoughness:.04,transparent:true,opacity:.46,depthWrite:false,transmission:.3,thickness:.55,ior:1.47,envMapIntensity:1.65}),
    silver:new THREE.MeshPhysicalMaterial({color:'#a8c9e1',metalness:.92,roughness:.19,clearcoat:1,envMapIntensity:1.35}),
    blue:new THREE.MeshPhysicalMaterial({color:'#174a76',metalness:.72,roughness:.17,clearcoat:1,envMapIntensity:1.5}),
    gold:new THREE.MeshPhysicalMaterial({color:'#c7aa75',metalness:.82,roughness:.22,clearcoat:1,envMapIntensity:1.1}),
    light:new THREE.MeshStandardMaterial({color:'#c6efff',emissive:'#6dbfff',emissiveIntensity:1.4,roughness:.2,metalness:.35}),
    warm:new THREE.MeshStandardMaterial({color:'#ffe2b0',emissive:'#f6c575',emissiveIntensity:1.15,roughness:.23,metalness:.4}),
  };
}

export function edgeGlass(material){
  // Dark transparent face centres, crisp light-reactive grazing angles. Avoid
  // transmission sampling a neighbouring satellite as a large blurred blob.
  material.transmission=0;material.depthWrite=false;
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float edgeFresnel=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.1);
      diffuseColor.a*=0.18+0.82*edgeFresnel;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      totalEmissiveRadiance+=vec3(0.025,0.13,0.30)*edgeFresnel;`);
  };
  material.customProgramCacheKey=()=> 'refined-optical-edge-v1';return material;
}

/** A closed, rounded rectangular ribbon. Its frame follows the path; thickness
 * and normals are genuine geometry, including the over/under loop crossing. */
export function ribbonGeometry(detail,sample,{width=.25,depth=.035,steps=180,twist=0,offset=0}={}){
  const count=detail.segment(steps),sides=16,positions=[],uvs=[],indices=[];
  const p=V(),before=V(),after=V(),tangent=V(),across=V(),normal=V(),axis=V(0,0,1);
  for(let i=0;i<=count;i++){
    const t=i/count;sample(t,p);sample(t-.0001,before);sample(t+.0001,after);
    tangent.subVectors(after,before).normalize();across.crossVectors(tangent,axis).normalize();
    if(across.lengthSq()<.1)across.set(1,0,0);
    normal.crossVectors(tangent,across).normalize();
    const angle=typeof twist==='function'?twist(t):twist,c=Math.cos(angle),s=Math.sin(angle);
    const a=across.clone().multiplyScalar(c).addScaledVector(normal,s),b=normal.clone().multiplyScalar(c).addScaledVector(across,-s);
    for(let j=0;j<=sides;j++){
      const theta=j/sides*TAU;
      const w=Math.sign(Math.cos(theta))*Math.pow(Math.abs(Math.cos(theta)),.42)*width+offset;
      const d=Math.sign(Math.sin(theta))*Math.pow(Math.abs(Math.sin(theta)),.42)*depth;
      positions.push(p.x+a.x*w+b.x*d,p.y+a.y*w+b.y*d,p.z+a.z*w+b.z*d);uvs.push(t,j/sides);
      if(i<count&&j<sides){const n=i*(sides+1)+j;indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

/** Metallic emission travels through a surface instead of rotating its texture. */
export function flowingSurface(material,{speed=.065,warm=false}={}){
  const clock={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.opticalClock=clock;
    shader.vertexShader='varying vec2 opticalUv;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nopticalUv=uv;');
    shader.fragmentShader='uniform float opticalClock;varying vec2 opticalUv;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float pulse=pow(max(0.0,cos((opticalUv.x-opticalClock*${speed.toFixed(4)})*18.84956)),20.0);
      float core=pow(abs(sin(opticalUv.y*6.28318)),5.0);
      totalEmissiveRadiance+=vec3(${warm?'1.0,0.56,0.20':'0.18,0.65,1.0'})*pulse*core*1.6;`);
  };
  material.customProgramCacheKey=()=>`optical-flow-${speed}-${warm}`;
  return {material,clock};
}
