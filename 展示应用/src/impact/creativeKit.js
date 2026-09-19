import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp;
function mesh(parent,geometry,material,p=[0,0,0]){
  const object=new THREE.Mesh(geometry,material);object.position.set(...p);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
}
function outline(w,h,r){
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}

/** Original concept hardware: millimetre-like seams, wall thickness, a real
 * hinged lid and individual tools. No product photographs or billboard mesh. */
export function createCreativeKit(quality){
  const detail=modelDetail('products',quality),root=new THREE.Group();
  root.name='portable-creative-kit';root.userData.illustrative=true;
  const rounded=detail.segment(3,'rounded'),radial=detail.segment(36);
  const box=(w,h,d,r=.055)=>new RoundedBoxGeometry(w,h,d,rounded,Math.min(r,w/2,h/2,d/2));
  const finish=(color,roughness=.32)=>new THREE.MeshPhysicalMaterial({color:new THREE.Color(color).multiplyScalar(.72),roughness,metalness:.025,specularIntensity:.3,clearcoat:.18,clearcoatRoughness:.4,envMapIntensity:.6});
  const shell=finish('#659b98'),cream=finish('#e8dfcc'),inside=finish('#bdc7b7',.48),dark=finish('#233d40',.58);
  const metal=new THREE.MeshPhysicalMaterial({color:'#d2b68b',metalness:.84,roughness:.26,envMapIntensity:.9});
  const paper=finish('#c7bfaa',.9),wood=finish('#b38c61',.65);
  const pigments=['#c94628','#d29123','#3c8561','#2c6d97','#665788','#973e57'].map(c=>finish(c,.28));
  // Extruded annulus: a true open shell, not a solid rounded box covering tools.
  function wall(w,d,r,thickness,height,material){
    const shape=outline(w,d,r),hole=outline(w-thickness*2,d-thickness*2,r-thickness);
    shape.holes.push(new THREE.Path(hole.getPoints(48).reverse()));
    const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:rounded,steps:1,bevelSize:.022,bevelThickness:.022,curveSegments:detail.segment(10)});
    g.rotateX(-Math.PI/2);return mesh(root,g,material);
  }
  mesh(root,box(5,.14,3.35,.065),shell,[0,-.08,0]);
  wall(5,3.35,.31,.12,.48,shell);
  mesh(root,box(4.72,.07,3.07,.035),inside,[0,.015,0]);
  const rim=wall(4.84,3.19,.24,.035,.025,metal);rim.position.y=.485;
  // Each tool bay has a recess and an independent divider with rounded edges.
  mesh(root,box(.055,.33,2.91,.025),cream,[-.50,.19,0]);
  mesh(root,box(1.64,.25,.055,.025),cream,[-1.40,.15,.12]);
  const pad=new THREE.Group();pad.name='removable-sketchbook';pad.position.set(.95,.16,-.02);root.add(pad);
  mesh(pad,box(2.51,.065,2.69,.028),shell,[0,0,0]);
  for(let i=0;i<5;i++)mesh(pad,box(2.41,.025,2.56,.011),paper,[.02,.054+i*.026,0]);
  mesh(pad,box(.14,.18,2.68,.045),cream,[-1.18,.083,0]);
  // A quiet embossed circle and fine bands are a concept cover design, not a logo.
  const coverSeal=mesh(pad,new THREE.TorusGeometry(.37,.012,8,radial),metal,[.05,.188,-.15]);coverSeal.rotation.x=-Math.PI/2;coverSeal.castShadow=false;
  for(let i=0;i<3;i++)mesh(pad,box(.52-i*.1,.007,.019,.003),metal,[.05,.192,.43+i*.09]).castShadow=false;
  const tools=[];
  for(let i=0;i<6;i++){
    const tool=new THREE.Group();tool.name=`individual-pencil-${i}`;tool.position.set(-2.04+i*.235,.23,-.72);root.add(tool);
    tool.rotation.x=Math.PI/2;
    mesh(tool,new THREE.CylinderGeometry(.081,.081,1.04,6),pigments[i]);
    mesh(tool,new THREE.ConeGeometry(.081,.24,6),wood,[0,.64,0]);
    mesh(tool,new THREE.ConeGeometry(.027,.09,6),pigments[i],[0,.798,0]);
    mesh(tool,new THREE.CylinderGeometry(.083,.083,.12,radial),cream,[0,-.57,0]);
    for(let j=0;j<2;j++)mesh(tool,new THREE.TorusGeometry(.083,.008,6,radial),metal,[0,-.49+j*.03,0]).rotation.x=Math.PI/2;
    tools.push({tool,y:tool.position.y,z:tool.position.z});
  }
  for(let i=0;i<4;i++){
    const x=-1.93+i%2*.68,z=.56+Math.floor(i/2)*.64;
    mesh(root,new THREE.CylinderGeometry(.28,.24,.16,radial),cream,[x,.15,z]);
    mesh(root,new THREE.CylinderGeometry(.224,.224,.02,radial),pigments[i],[x,.239,z]);
    mesh(root,new THREE.TorusGeometry(.253,.018,8,radial),metal,[x,.238,z]).rotation.x=Math.PI/2;
  }
  // Hinge barrels, pin ends and the lip stay attached when the lid moves.
  for(const x of [-1.7,1.7]){
    for(let i=0;i<5;i++){
      const barrel=mesh(root,new THREE.CylinderGeometry(.093,.093,.14,radial),i%2?metal:shell,[x+(i-2)*.14,.49,-1.59]);barrel.rotation.z=Math.PI/2;
    }
  }
  const lid=new THREE.Group();lid.name='art-kit-hinged-lid';lid.position.set(0,.51,-1.59);root.add(lid);
  mesh(lid,box(5,.17,3.34,.08),shell,[0,.105,1.59]);
  mesh(lid,box(4.72,.042,3.02,.02),cream,[0,.002,1.59]);
  mesh(lid,box(4.35,.018,2.64,.009),inside,[0,-.028,1.59]);
  // A held drawing sheet makes the lid a working surface. This original concept
  // flower study sits on physical paper, not on a floating picture card.
  mesh(lid,box(3.7,.012,2.37,.005),paper,[0,-.045,1.59]);
  const printColors=['#c26b55','#d5a340','#6c987f','#537d9a'].map(color=>new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
  const artwork=new THREE.Group();artwork.rotation.y=Math.PI;artwork.position.z=3.18;lid.add(artwork);
  const ink=new THREE.MeshBasicMaterial({color:'#456c65',side:THREE.DoubleSide});
  const stem=new THREE.CatmullRomCurve3([V(-.15,-.058,2.39),V(.10,-.058,1.94),V(-.02,-.058,1.57),V(.05,-.058,1.20)]);
  mesh(artwork,new THREE.TubeGeometry(stem,48,.011,6,false),ink);
  for(let i=0;i<7;i++){
    const angle=i/7*Math.PI*2;
    const petal=mesh(artwork,new THREE.CircleGeometry(.17,32),printColors[i%2?0:1],[.05+Math.cos(angle)*.25,-.080-i*.002,1.20+Math.sin(angle)*.25]);petal.rotation.x=Math.PI/2;
  }
  mesh(artwork,new THREE.CircleGeometry(.13,32),printColors[1],[.05,-.10,1.2]).rotation.x=Math.PI/2;
  for(const [x,z,angle] of [[-.16,1.77,-.4],[.23,2.05,.5]]){
    const leaf=mesh(artwork,new THREE.CircleGeometry(.19,32),printColors[2],[x,-.059,z]);leaf.rotation.set(Math.PI/2,0,angle);leaf.scale.set(.6,1.3,1);
  }
  for(let i=0;i<4;i++)mesh(artwork,new THREE.CircleGeometry(.042,20),printColors[i],[-1.26+i*.15,-.059,2.44]).rotation.x=Math.PI/2;
  artwork.traverse(object=>{object.castShadow=false;object.receiveShadow=false;});
  // Elastic straps hold paper on the inside. Geometry is visible from the side.
  for(const z of [.60,2.59])mesh(lid,box(4.10,.031,.13,.014),shell,[0,-.080,z]);
  const emblem=mesh(lid,new THREE.TorusGeometry(.51,.014,8,radial),metal,[0,.197,1.59]);emblem.rotation.x=Math.PI/2;
  for(const x of [-1.59,1.59]){
    mesh(root,box(.30,.23,.15),metal,[x,.33,1.67]);
    mesh(root,box(.16,.12,.024,.012),dark,[x,.34,1.755]);
  }
  // U-shaped carry handle with two mounted pivots.
  const path=new THREE.CatmullRomCurve3([V(-.65,.17,1.65),V(-.68,.14,1.98),V(-.49,.14,2.12),V(.49,.14,2.12),V(.68,.14,1.98),V(.65,.17,1.65)]);
  mesh(root,new THREE.TubeGeometry(path,detail.segment(52),.068,12,false),shell);
  for(const x of [-.64,.64])mesh(root,box(.21,.16,.12),metal,[x,.16,1.67]);
  for(const x of [-1.9,1.9])for(const z of [-1.15,1.15])mesh(root,box(.38,.055,.32,.025),dark,[x,-.175,z]);
  // Grounding is a soft procedural contact shadow, never a picture of a product.
  const shadow=mesh(root,new THREE.PlaneGeometry(6.7,4.9),new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 v;void main(){float d=length((v-.5)*2.);gl_FragColor=vec4(.005,.012,.021,exp(-d*d*4.)*.45);}'
  }),[0,-.22,0]);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
  function update({open=.85,activity=0,time=0,variant=0,reduced=false}={}){
    lid.rotation.x=-clamp(open,0,1)*1.93;
    const t=reduced?0:time;
    tools.forEach(({tool,y,z},i)=>{
      const lift=i===3?activity*(.58+.12*Math.sin(t*.85)):0;
      tool.position.y=y+lift;tool.position.z=z+lift*.15;
      tool.rotation.z=i===3?lift*-.15:0;
    });
    pad.position.y=.16+activity*.05;
    shell.color.set(variant?'#b97668':'#659b98').multiplyScalar(.72);inside.color.set(variant?'#d8be9d':'#bdc7b7').multiplyScalar(.72);
    root.userData.lidAngle=lid.rotation.x;root.userData.toolLift=tools[3].tool.position.y;
  }
  update();return {root,update,lid};
}

export function createStudioAccessories(quality){
  const detail=modelDetail('products',quality),root=new THREE.Group(),radial=detail.segment(40),rounded=detail.segment(3,'rounded');
  root.name='creative-assortment-companions';
  const mat=c=>new THREE.MeshPhysicalMaterial({color:new THREE.Color(c).multiplyScalar(.65),roughness:.42,specularIntensity:.3,clearcoat:.15,metalness:.03,envMapIntensity:.6});
  const cream=mat('#e4d9c4'),mint=mat('#78a69d'),coral=mat('#c28371'),gold=new THREE.MeshPhysicalMaterial({color:'#b79d75',metalness:.8,roughness:.3});
  const book=new THREE.Group();book.name='assortment-sketchbook';root.add(book);
  mesh(book,new RoundedBoxGeometry(1.7,.15,2.3,rounded,.05),coral);
  for(let i=0;i<5;i++)mesh(book,new RoundedBoxGeometry(1.58,.022,2.16,rounded,.009),cream,[.015,.09+i*.023,0]);
  for(let i=0;i<8;i++){const binding=mesh(book,new THREE.TorusGeometry(.09,.017,8,radial),gold,[-.82,.10,-.85+i*.24]);binding.rotation.y=Math.PI/2;}
  const cup=new THREE.Group();cup.name='assortment-tool-cup';root.add(cup);
  // A lathed section includes both inner and outer walls of the ceramic cup.
  const profile=[[.01,0],[.43,0],[.49,.08],[.56,1.22],[.55,1.30],[.48,1.30],[.41,.14],[.01,.14]].map(([x,y])=>new THREE.Vector2(x,y));
  mesh(cup,new THREE.LatheGeometry(profile,radial),mint);
  const rim=mesh(cup,new THREE.TorusGeometry(.514,.02,8,radial),gold,[0,1.295,0]);rim.rotation.x=Math.PI/2;
  for(let i=0;i<5;i++){
    const tool=new THREE.Group();tool.position.set((i-2)*.16,.20,Math.sin(i)*.14);tool.rotation.z=(i-2)*-.085;cup.add(tool);
    mesh(tool,new THREE.CylinderGeometry(.053,.053,1.76,6),i%2?coral:cream,[0,1.03,0]);
    mesh(tool,new THREE.ConeGeometry(.057,.24,6),gold,[0,2.03,0]);
  }
  return {root,book,cup};
}
