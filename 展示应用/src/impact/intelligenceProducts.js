import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import categories from '../../../共享数据/featured-categories.json' with {type:'json'};
import {modelDetail} from '../../../共享组件/renderQuality.js';

// Reuse the three approved showroom illustrations. They are concept imagery,
// not photographed SKUs, measured demand or inferred brand relationships.
export const intelligenceProductImages=['kids-craft','beauty','toys'].map(id=>{
  const item=categories.categories.find(category=>category.id===id);
  return {id,src:item.sceneImage,name:item.name,illustrative:true};
});

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const add=(parent,geometry,material,position=[0,0,0])=>{
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);parent.add(mesh);return mesh;
};

/** Product cutouts are the only flat content. Their mounts, files, optical
 * edges and return stream are actual geometry sharing the scene's lighting. */
export function createIntelligenceProducts(manager,quality,{includeHero=true}={}){
  const detail=modelDetail('analytics',quality),loader=new THREE.TextureLoader(manager);
  const textures=intelligenceProductImages.map(item=>{
    const texture=loader.load(item.src);texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=quality.render.anisotropy;texture.name=`approved-category-${item.id}`;return texture;
  });
  const root=name=>{const group=new THREE.Group();group.name=name;group.userData.illustrative=true;return group;};
  const hero=root('product-orbit-exhibit'),library=root('reusable-product-knowledge');
  const metal=()=>new THREE.MeshPhysicalMaterial({color:'#87acc5',metalness:.87,roughness:.24,clearcoat:.6,envMapIntensity:1.1});
  const glass=()=>new THREE.MeshPhysicalMaterial({color:'#173247',metalness:.48,roughness:.2,clearcoat:1,envMapIntensity:.8});
  const imageMaterial=index=>{
    const material=new THREE.MeshBasicMaterial({map:textures[index],transparent:true,alphaTest:.035,depthWrite:true,toneMapped:false,side:THREE.DoubleSide});
    // The approved files carry a black matte, not an alpha channel. Reuse the
    // category gallery's linear-light matte thresholds so no black rectangle
    // can cover the globe behind a product silhouette.
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        float productValue=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
        diffuseColor.a*=smoothstep(.0003,.0025,productValue);`);
    };
    material.customProgramCacheKey=()=> 'approved-product-matte-v1';return material;
  };
  const box=(w,h,d,r=.035)=>new RoundedBoxGeometry(w,h,d,detail.segment(3,'rounded'),r);
  const floaters=[];
  const anchors=[[-2.58,.50,1.25],[2.62,1.15,-.3],[1.80,-1.55,1.8]];
  for(let i=0;i<(includeHero?3:0);i++){
    const product=root(`orbit-${intelligenceProductImages[i].id}`);hero.add(product);
    // A floating product arrangement, without a rectangular screenshot frame.
    add(product,new THREE.PlaneGeometry(1.98,1.32),imageMaterial(i),[0,.12,0]);
    const mount=add(product,box(2.02,.045,.46,.018),metal(),[0,-.59,-.1]);
    mount.rotation.x=.12;
    add(product,box(1.86,.022,.035,.008),new THREE.MeshBasicMaterial({color:'#71add1'}),[0,-.57,.13]);
    product.rotation.y=i===0?.14:-.18;
    product.scale.setScalar(.9);
    floaters.push({product,anchor:V(...anchors[i])});
  }

  function record(index,{width=1.48,height=1.89}={}){
    const file=root(`product-file-${intelligenceProductImages[index].id}`);
    add(file,box(width,height,.075,.042),metal());
    add(file,box(width-.035,height-.035,.04,.032),glass(),[0,0,.05]);
    add(file,new THREE.PlaneGeometry(width-.19,(width-.19)*2/3),imageMaterial(index),[0,.20,.078]);
    const silver=metal();
    // File tabs, material swatches and a ruled footer make this a product
    // dossier rather than an unexplained glass cube or a fake dashboard.
    add(file,box(.40,.065,.038,.013),silver,[-width*.28,height/2+.022,.005]);
    const ink=new THREE.MeshBasicMaterial({color:'#87b5ce'});
    add(file,box(width*.52,.018,.008,.003),ink,[-width*.13,-height*.31,.082]);
    add(file,box(width*.34,.013,.008,.003),ink,[-width*.22,-height*.36,.082]);
    const colors=i=>['#b4d9df','#c1a471','#cc7696'][i];
    for(let n=0;n<3;n++)add(file,new THREE.CircleGeometry(.038,24),new THREE.MeshBasicMaterial({color:colors(n)}),[width*.20+n*.105,-height*.35,.084]);
    return file;
  }
  const leaves=[];
  for(let i=0;i<3;i++){
    const leaf=record(i,{width:1.42,height:1.88});library.add(leaf);leaves.push(leaf);
  }
  // The reusable collection has a real bound spine and layered page edges.
  const binding=root('knowledge-binding');library.add(binding);
  add(binding,box(3.8,.10,1.0),metal(),[0,-1.02,0]);
  for(let i=0;i<4;i++)add(binding,box(3.68,.019,.92,.009),metal(),[0,-.93+i*.032,-.015]);
  const marker=add(binding,box(.18,.025,.95,.009),new THREE.MeshPhysicalMaterial({color:'#d4b37b',metalness:.7,roughness:.28}),[.78,-.805,.02]);
  marker.rotation.z=-.06;
  library.rotation.y=-.12;

  function update({time=0,reduced=false}={}){
    const t=reduced?0:time;
    floaters.forEach(({product,anchor},i)=>{
      product.position.copy(anchor);product.position.y+=Math.sin(t*.26+i*2.1)*.045;
      product.rotation.y=(i===0?.14:-.18)+Math.sin(t*.14+i)*.035;
      product.rotation.z=Math.sin(t*.12+i*1.6)*.014;
    });
    leaves.forEach((leaf,i)=>{
      leaf.position.set((i-1)*1.12,.05+Math.sin(t*.2+i)*.02,(i===1?.38:-.15));
      leaf.rotation.set(-.03,(i-1)*-.33,(i-1)*-.025);
    });
  }
  update();
  return {hero,library,update,textures};
}

/** A single stream wraps the hero. Sparse glints show direction without
 * turning the whole exhibition into a web of wires. */
export function createIntelligenceOrbit(quality){
  const detail=modelDetail('analytics',quality),root=new THREE.Group();root.name='continuous-return-stream';
  const points=[];
  for(let i=0;i<=160;i++){
    const a=i/160*Math.PI*2;
    points.push(V(Math.cos(a)*3.55,Math.sin(a)*.86-.22,Math.sin(a)*2.8));
  }
  const curve=new THREE.CatmullRomCurve3(points,true);
  const geometry=new THREE.TubeGeometry(curve,detail.segment(240),.016,6,true);
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{clock:{value:0},alpha:{value:1}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float clock;uniform float alpha;varying vec2 vUv;void main(){float p=pow(.5+.5*cos(vUv.x*18.85-clock*.65),20.);vec3 c=mix(vec3(.09,.28,.50),vec3(.72,.87,1.),p);gl_FragColor=vec4(c*(1.+p),(.25+p*.65)*alpha);}'
  });
  root.add(new THREE.Mesh(geometry,material));root.rotation.z=.12;
  const count=72,position=new Float32Array(count*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{alpha:{value:1},resolution:{value:1}},
    vertexShader:'uniform float resolution;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(110.*resolution/-p.z,1.,9.);}',
    fragmentShader:'uniform float alpha;void main(){float d=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(.65,.84,1.,exp(-d*d*8.)*alpha);}'
  });
  const stars=new THREE.Points(g,m);stars.frustumCulled=false;root.add(stars);const p=V();
  return {root,update({time,alpha,pixelHeight}){
    material.uniforms.clock.value=time;material.uniforms.alpha.value=alpha;m.uniforms.alpha.value=alpha;m.uniforms.resolution.value=pixelHeight/1080;root.visible=alpha>.003;
    for(let i=0;i<count;i++){curve.getPointAt((i/count+time*.018)%1,p);position[i*3]=p.x;position[i*3+1]=p.y;position[i*3+2]=p.z;}
    g.attributes.position.needsUpdate=true;
  }};
}
