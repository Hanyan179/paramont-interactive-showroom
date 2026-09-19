import * as THREE from 'three';
import {brandFlowPose} from './brandLayout.js';
import {wrapReel} from './content.js';

function identity(brand,loader){
  const isKokoMilo=brand.id==='koko-milo';
  const paperRange=brand.id==='crafty-creations'?'.80,.96':null;
  const markAlpha=paperRange?`c.a*(1.-smoothstep(${paperRange},min(c.r,min(c.g,c.b))))`:'c.a';
  const root=new THREE.Group();
  const ink=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false});
  const shape=new THREE.PlaneGeometry(1,1);
  const logo=new THREE.Mesh(shape,ink);root.add(logo);
  const map=loader.load('/media/brand/'+brand.logo,texture=>{
    const ratio=texture.image.width/texture.image.height,width=Math.min(10.1,5.4*ratio);
    logo.scale.set(width,width/ratio,1);edge.scale.copy(logo.scale);outlineTexel.set(1/texture.image.width,1/texture.image.height);
  });map.colorSpace=THREE.SRGBColorSpace;ink.map=map;
  if(paperRange)ink.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\n diffuseColor.a*=1.-smoothstep(${paperRange},min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)));`);
  };
  ink.customProgramCacheKey=()=>`brand-ink-${paperRange||'alpha'}`;
  // A very narrow silhouette edge separates dark official ink from the navy
  // stage. It follows the mark exactly; there is no pale backdrop or bloom cloud.
  const outlineTexel=new THREE.Vector2(1/1024,1/512);
  const outline=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false,color:'#bdd3e2'});
  outline.onBeforeCompile=shader=>{
    shader.uniforms.brandTexel={value:outlineTexel};
    shader.fragmentShader='uniform vec2 brandTexel;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('void main() {',`float markAlpha(vec2 p){vec4 c=texture2D(map,p);return ${markAlpha};}\nvoid main() {`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', `
      float center=markAlpha(vMapUv),coverage=center;
      for(int i=0;i<8;i++){float a=float(i)*.785398;coverage=max(coverage,markAlpha(vMapUv+vec2(cos(a),sin(a))*brandTexel*2.2));}
      diffuseColor.a*=max(0.,coverage-center)*.88;
    `);
  };
  outline.customProgramCacheKey=()=>`brand-silhouette-${paperRange?'paper':'alpha'}`;
  const edge=new THREE.Mesh(shape,outline);edge.position.z=-.005;
  // The cleaned Koko & Milo asset is shared with the reader and zoom view.
  // Its fine inner loops stay open, without an extra shader cutout or grey rim.
  edge.visible=!isKokoMilo;root.add(edge);
  root.userData={ink,outline};return root;
}
export function brandsWorld(manager,_quality,brands){
  const root=new THREE.Group(),loader=new THREE.TextureLoader(manager);
  const exhibits=brands.map(brand=>{const object=identity(brand,loader);root.add(object);return object;});
  let mix=1;
  return {root,prepare(){exhibits.forEach(object=>object.visible=true);},
    update({time,camera,target,reelPosition=0,brandOverview=false,brandFlow,aspect=16/9,dt=.016,overviewImmediate=false}){
      mix=overviewImmediate?Number(brandOverview):THREE.MathUtils.damp(mix,Number(brandOverview),7,dt);
      const height=2*27*Math.tan(THREE.MathUtils.degToRad(23)),width=height*aspect;
      exhibits.forEach((object,index)=>{
        const pose=brandFlowPose(index,brands.length,brandFlow.offsets),delta=wrapReel(index-reelPosition+brands.length/2,brands.length)-brands.length/2;
        const opacity=THREE.MathUtils.lerp(Math.abs(delta)<.99?1:0,pose.visible?1:0,mix);
        object.visible=opacity>.001;if(!object.visible)return;
        const edge=Math.min(1,Math.abs(pose.x-.5)*1.3),z=-edge*2.2,compensation=(27-z)/27;
        const scale=Math.min(width*.29/10.1,height*.205/5.4)*compensation;
        object.position.set(THREE.MathUtils.lerp(4+delta*19,(pose.x-.5)*width*compensation,mix),THREE.MathUtils.lerp(.7,(.5-pose.y)*height*compensation,mix),THREE.MathUtils.lerp(-Math.abs(delta)*5,z,mix));
        object.scale.setScalar(THREE.MathUtils.lerp(.98,scale,mix));
        object.rotation.y=THREE.MathUtils.lerp(-.12-delta*.22,(pose.x-.5)*-.25,mix)+Math.sin(time*.18+index)*.012;
        object.rotation.z=Math.sin(time*.12+index)*.008;
        object.userData.ink.opacity=opacity;object.userData.outline.opacity=opacity;
      });
      camera.set(0,THREE.MathUtils.lerp(1.2,0,mix),THREE.MathUtils.lerp(19,27,mix));target.set(0,0,0);
    },
    projectBrands(camera,width,height){return exhibits.map((object,index)=>{
      const p=object.getWorldPosition(new THREE.Vector3()).project(camera);
      return {index,x:(p.x+1)*width/2,y:(1-p.y)*height/2,visible:object.visible&&p.x>-.98&&p.x<.98};
    });},
  };
}
