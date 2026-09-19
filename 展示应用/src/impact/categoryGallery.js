import * as THREE from 'three';
import featured from '../../../共享数据/featured-categories.json';
import {wrapReel} from './content.js';

export function createCategoryGallery(manager){
  const root=new THREE.Group(),loader=new THREE.TextureLoader(manager),items=[];
  const imageHeight=16/1.5;
  const imageGeometry=new THREE.PlaneGeometry(16,imageHeight,32,12);
  for(const [index,entry] of featured.categories.entries()){
    const group=new THREE.Group();root.add(group);
    const image=loader.load(entry.sceneImage);image.colorSpace=THREE.SRGBColorSpace;
    // Retain the visitor-approved high-resolution concepts. Their black studio
    // matte dissolves into the live space without a rectangular image card.
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{map:{value:image},opacity:{value:1}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z-=pow(p.x/8.,2.)*.22;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform sampler2D map;uniform float opacity;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv);float value=max(c.r,max(c.g,c.b));float a=smoothstep(.0003,.0025,value);float edge=smoothstep(0.,.035,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));gl_FragColor=vec4(c.rgb,a*edge*opacity);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`});
    material.map=image; // Explicit texture ownership for the shared disposal walker.
    const picture=new THREE.Mesh(imageGeometry,material);picture.position.y=1.2;group.add(picture);
    const baseMaterial=new THREE.MeshPhysicalMaterial({color:'#0a273c',metalness:.08,roughness:.74,clearcoat:.12,envMapIntensity:.12,transparent:true});
    const base=new THREE.Mesh(new THREE.CylinderGeometry(7.65,7.8,.15,128),baseMaterial);base.scale.z=.56;base.position.y=-3.88;group.add(base);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(7.7,.018,8,160),new THREE.MeshBasicMaterial({color:'#6c9fbb',transparent:true,opacity:.2}));edge.rotation.x=Math.PI/2;edge.scale.y=.56;edge.position.y=-3.80;group.add(edge);
    items.push({group,picture,material,baseMaterial,edge,index});
  }
  let position=0;
  return {root,update({time,featuredCategory=0,featuredOffset=0,aspect=16/9,dt=.016,overviewImmediate=false}){
    const count=items.length;
    const difference=wrapReel(featuredCategory-position+count/2,count)-count/2;
    position=overviewImmediate?featuredCategory:position+difference*(1-Math.exp(-dt*7));
    const live=position-featuredOffset*2.8;
    const height=2*27*Math.tan(THREE.MathUtils.degToRad(23)),width=height*aspect;
    items.forEach(({group,picture,material,baseMaterial,edge,index})=>{
      const delta=wrapReel(index-live+count/2,count)-count/2,distance=Math.abs(delta);
      group.visible=distance<1.8;if(!group.visible)return;
      const z=-distance*13,comp=(27-z)/27,focus=1-THREE.MathUtils.smoothstep(distance,0,1);
      const x=.64+delta*.57,y=.47+distance*.13;
      group.position.set((x-.5)*width*comp,(.5-y)*height*comp,z);
      const scale=Math.min(height*.56/imageHeight,width*.59/16)*(1-distance*.56)*comp;group.scale.setScalar(scale);
      group.rotation.y=-delta*.27+Math.sin(time*.16)*.025;
      picture.position.y=1.2+Math.sin(time*.45+index)*.06;
      // Keep the category selector's left-hand reading space clear as reels pass.
      const stageVisibility=THREE.MathUtils.smoothstep(x,.32,.50);
      material.uniforms.opacity.value=(.27+focus*.73)*stageVisibility;baseMaterial.opacity=(.30+focus*.5)*stageVisibility;edge.material.opacity=(.08+focus*.12)*stageVisibility;
    });
  },prepare(){items.forEach(({group})=>group.visible=true);}};
}
