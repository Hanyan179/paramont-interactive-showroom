import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createDecisionRobot} from './intelligenceRobot.js';
import {createProjection,installTyping} from './intelligencePresence.js';
import {crystalVertex,lerp,ramp} from './intelligenceTimeline.js';
import {canvasTexture,label,rounded,cardTexture,screenTexture,reviewTexture,commerceTexture,commerceDetails} from './intelligenceSurfaces.js';
export {canvasTexture,label,rounded};
export function texturePlane(texture,w,h,name){const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.name=name;return mesh;}
export function alpha(mesh,value){mesh.visible=value>.001;if(mesh.material){mesh.material.opacity=value;if(mesh.material.uniforms?.opacity)mesh.material.uniforms.opacity.value=value;}}
export function textPlane(text,name,width=3.2){const texture=canvasTexture((ctx,w,h)=>{ctx.textAlign='center';ctx.textBaseline='middle';label(ctx,text,w/2,h/2,Math.min(108,1500/Math.max(1,text.length)));},1024,160);return texturePlane(texture,width,width*160/1024,name);}
function glow(name,color='#76bce9'){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{opacity:{value:0},tint:{value:new THREE.Color(color)}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float opacity;uniform vec3 tint;void main(){float d=length((v-.5)*2.);float a=exp(-d*d*5.)*smoothstep(1.,.7,d);gl_FragColor=vec4(tint,a*opacity);}'}));mesh.name=name;return mesh;
}
export function createCrystal(){
 // Each cube surface triangle retains its identity as its vertices become crystal facets.
 const geometry=new THREE.BoxGeometry(2.8,2.8,2.8,2,2,2).toNonIndexed(),position=geometry.attributes.position;
 const target=geometry.clone();for(let i=0;i<position.count;i++)target.attributes.position.setXYZ(i,...crystalVertex(position.getX(i),position.getY(i),position.getZ(i),1));target.computeVertexNormals();
 geometry.setAttribute('gemTarget',target.attributes.position.clone());geometry.morphAttributes.position=[target.attributes.position.clone()];geometry.morphAttributes.normal=[target.attributes.normal.clone()];target.dispose();
 const material=new THREE.MeshPhysicalMaterial({color:'#c4dcf1',metalness:.12,roughness:.065,transmission:.96,thickness:1.7,ior:1.68,clearcoat:1,envMapIntensity:1.8,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false,flatShading:true});
 const shell=new THREE.Mesh(geometry,material);shell.name='persistent-data-crystal';
 const cutMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{opacity:{value:0},morph:{value:0}},vertexShader:`attribute vec3 gemTarget;uniform float morph;varying vec3 viewP;void main(){vec4 p=modelViewMatrix*vec4(mix(position,gemTarget,morph),1.);viewP=p.xyz;gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec3 viewP;uniform float opacity;void main(){vec3 N=normalize(cross(dFdx(viewP),dFdy(viewP)));vec3 V=normalize(-viewP);if(dot(N,V)<0.)N=-N;vec3 R=reflect(-V,N);float f=pow(1.-abs(dot(N,V)),3.);float strip=pow(max(0.,1.-abs(R.x*.75+R.y*.4-.12)),34.);float second=pow(max(0.,1.-abs(R.x*.6-R.y*.8+.4)),26.);vec3 tint=vec3(.008,.019,.035)+vec3(.045,.09,.16)*(R.y*.5+.5)+vec3(.85,.94,1.)*strip+vec3(.3,.38,.46)*second;gl_FragColor=vec4(tint+vec3(.25,.45,.6)*f,opacity*(.3+.7*f+.75*strip+.3*second));}`});
 const inner=new THREE.Mesh(geometry,cutMaterial);inner.name='crystal-inner-facets';inner.scale.set(.92,.93,.90);inner.rotation.y=.14;shell.add(inner);
 const corners=[[-1.4,-1.4,-1.4],[1.4,-1.4,-1.4],[-1.4,1.4,-1.4],[1.4,1.4,-1.4],[-1.4,-1.4,1.4],[1.4,-1.4,1.4],[-1.4,1.4,1.4],[1.4,1.4,1.4]],segments=[];
 for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(corners[i].filter((v,k)=>v!==corners[j][k]).length===1)for(let s=0;s<8;s++)for(const v of [s/8,(s+1)/8])segments.push(corners[i].map((p,k)=>lerp(p,corners[j][k],v)));
 const edgeGeometry=new THREE.BufferGeometry();edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(segments.flat(),3));
 const edges=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:'#c9e8fa',transparent:true,opacity:.7,depthWrite:false}));edges.name='persistent-crystal-edges';shell.add(edges);
 // One instanced lattice, no object or material creation during playback.
 const cellPositions=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])cellPositions.push(new THREE.Vector3(x*.69,y*.69,z*.69));
 const cells=new THREE.InstancedMesh(new RoundedBoxGeometry(1.31,1.31,1.31,3,.045),new THREE.MeshPhysicalMaterial({color:'#a4c5df',metalness:.08,roughness:.08,transmission:.8,thickness:.7,ior:1.5,transparent:true,opacity:.7,depthWrite:false,envMapIntensity:1.3}),cellPositions.length);cells.name='data-lattice';cells.frustumCulled=false;
 cellPositions.forEach((v,i)=>cells.setColorAt(i,new THREE.Color().setHSL(.57+(i%4)*.012,.16,.58+(i%3)*.06)));
 const dummy=new THREE.Object3D();
 return {shell,inner,edges,cells,morph(value,time){
  shell.morphTargetInfluences[0]=value;inner.morphTargetInfluences[0]=value;inner.material.uniforms.morph.value=value;
  const p=edgeGeometry.attributes.position;segments.forEach((v,i)=>p.setXYZ(i,...crystalVertex(...v,value)));p.needsUpdate=true;
  const gather=ramp(time,8,17),collapse=ramp(time,24,32);
  cellPositions.forEach((v,i)=>{
   const g=ramp(time,9+i*.35,12.3+i*.35),to=crystalVertex(v.x,v.y,v.z,value);
   const breathing=(.025+.025*Math.sin(time*.75+i*.45))*(1-collapse);
   const scanned=ramp(time,19+(1-v.y)*1.3,20+(1-v.y)*1.3)*(1-ramp(time,23,25));
   const spread=1+breathing+scanned*.17;
   dummy.position.set(lerp(to[0]*1.16,to[0]*spread,g)*(1-collapse*.82),lerp(to[1]*1.16,to[1]*spread,g)*(1-collapse*.82),lerp(to[2]*1.16,to[2]*spread,g)*(1-collapse*.82));
   dummy.rotation.set(0,scanned*(v.y>0?.12:-.12),0);dummy.scale.setScalar(g*(1-collapse*.94));dummy.updateMatrix();cells.setMatrixAt(i,dummy.matrix);
  });cells.instanceMatrix.needsUpdate=true;
 }};
}
export function createJourneyObjects(manager){
 const root=new THREE.Group();root.name='continuous-value-journey';
 const crystal=createCrystal(),body=new THREE.Group();body.name='data-to-diamond';body.add(crystal.shell,crystal.cells);root.add(body);const robot=createDecisionRobot();body.add(robot.group);
 const core=new THREE.Mesh(new THREE.SphereGeometry(.15,32,24),new THREE.MeshBasicMaterial({color:new THREE.Color('#c9f1ff').multiplyScalar(3),transparent:true,depthWrite:false}));core.name='diamond-core';core.position.z=1.03;core.renderOrder=12;core.material.depthTest=false;body.add(core);
 const coreRim=new THREE.Mesh(new THREE.TorusGeometry(.27,.018,12,80),new THREE.MeshBasicMaterial({color:'#9dcce8',transparent:true,depthWrite:false}));coreRim.position.z=1.01;coreRim.renderOrder=13;body.add(coreRim);
 const halo=glow('core-optical-halo');halo.position.z=1.04;halo.scale.setScalar(1.5);halo.renderOrder=11;body.add(halo);
 const eye=new THREE.Group();eye.name='robot-eye';eye.position.z=1.0;body.add(eye);
 const housing=new THREE.Mesh(new THREE.SphereGeometry(.36,40,24),new THREE.MeshPhysicalMaterial({color:'#061424',metalness:.55,roughness:.19,clearcoat:1,transparent:true,depthWrite:false}));housing.scale.z=.38;housing.name='eye-housing';housing.renderOrder=9;eye.add(housing);
 const iris=new THREE.Mesh(new THREE.TorusGeometry(.215,.012,16,64),new THREE.MeshBasicMaterial({color:'#82aec4',transparent:true,depthWrite:false}));iris.position.z=.15;iris.name='eye-iris';iris.renderOrder=10;eye.add(iris);
 const irisDetail=new THREE.Mesh(new THREE.RingGeometry(.09,.205,80),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{opacity:{value:1}},vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 p;uniform float opacity;void main(){float r=length(p),a=atan(p.y,p.x);float ribs=.5+.5*sin(a*96.);float rim=smoothstep(.11,.2,r);vec3 c=mix(vec3(.025,.06,.10),vec3(.17,.30,.40),rim);c+=ribs*.025;gl_FragColor=vec4(c,opacity);}'}));irisDetail.name='eye-optical-iris';irisDetail.position.z=.16;irisDetail.renderOrder=10;eye.add(irisDetail);

 const pupil=new THREE.Mesh(new THREE.SphereGeometry(.115,32,20),new THREE.MeshBasicMaterial({color:'#071322',transparent:true,depthWrite:false}));pupil.position.z=.18;pupil.scale.z=.35;pupil.name='eye-pupil';pupil.renderOrder=11;eye.add(pupil);
 const glint=new THREE.Mesh(new THREE.SphereGeometry(.019,12,12),new THREE.MeshBasicMaterial({color:'#f1fbff',transparent:true,depthWrite:false}));glint.position.set(-.065,.085,.23);glint.name='eye-glint';glint.renderOrder=12;eye.add(glint);
 const ambience=glow('exhibit-light-pool','#2d6094');ambience.position.set(.5,.1,-2);ambience.scale.set(12,9,1);root.add(ambience);
 const floor=glow('contact-light','#6191ae');floor.position.set(0,-2.4,-.5);floor.scale.set(6,.6,1);root.add(floor);
 const scan=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({color:'#b3e3ff',transparent:true,side:THREE.DoubleSide,depthWrite:false}));scan.rotation.x=Math.PI/2;scan.name='analysis-scan';body.add(scan);
 const scanEdge=new THREE.LineSegments(new THREE.EdgesGeometry(scan.geometry),new THREE.LineBasicMaterial({color:'#d0eeff',transparent:true,depthWrite:false}));scan.add(scanEdge);
 const linkPoints=[];for(let i=0;i<6;i++){const a=i*1.04;linkPoints.push(Math.cos(a)*.95,Math.sin(a)*1.1,(i%3-1)*.6,Math.cos(a+1.4)*.95,Math.sin(a+1.4)*1.1,((i+1)%3-1)*.6);}
 const links=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(linkPoints,3)),new THREE.LineBasicMaterial({color:'#91c5e6',transparent:true,depthWrite:false}));body.add(links);
 const nodeGeometry=new THREE.SphereGeometry(.035,10,8),nodeMaterial=new THREE.MeshBasicMaterial({color:'#c7ebff',transparent:true,depthWrite:false});const nodes=Array.from({length:6},(_,i)=>{const m=new THREE.Mesh(nodeGeometry,nodeMaterial.clone());m.position.fromArray(linkPoints,i*6);body.add(m);return m;});
 const reviews=['Great product.','Perfect gift.','Love it.','Good quality.','Beautiful colours.','Soft texture.'];
 const texts=reviews;
 const reviewMap=reviewTexture();
 const records=Array.from({length:texts.length},(_,i)=>{const text=texts[i%texts.length],mesh=textPlane(text,`record-${i}`,i===0?3.8:2.5);installTyping(mesh,text,mesh.material.map.image.getContext('2d'),i===0?3.8:2.5);const card=texturePlane(reviewMap,i===0?4.2:3.2,i===0?1.31:1,'feedback-frame');card.position.z=-.03;mesh.add(card);root.add(mesh);return mesh;});
 const projection=createProjection(),beam=projection.mesh;root.add(beam);
 const cursor=new THREE.Mesh(new THREE.PlaneGeometry(.025,.35),new THREE.MeshBasicMaterial({color:'#bdeaff',transparent:true,depthWrite:false}));cursor.name='typing-cursor';root.add(cursor);
 const screen=texturePlane(screenTexture(),6.6,4.65,'analysis-screen');screen.renderOrder=2;root.add(screen);
 const screenBody=new THREE.Mesh(new RoundedBoxGeometry(6.68,4.73,.13,3,.06),new THREE.MeshPhysicalMaterial({color:'#183247',metalness:.65,roughness:.22,transparent:true,depthWrite:false}));screenBody.position.z=-.09;screenBody.name='analysis-screen-depth';screenBody.renderOrder=1;screen.add(screenBody);
 const scanLine=new THREE.Mesh(new THREE.PlaneGeometry(6.42,.025),new THREE.MeshBasicMaterial({color:'#b7eaff',transparent:true,depthWrite:false}));scanLine.name='screen-scan-contact';scanLine.renderOrder=11;scanLine.position.z=.15;screen.add(scanLine);
 const cards=Array.from({length:5},(_,i)=>{const mesh=texturePlane(cardTexture(i),2.65,1.86,`analysis-card-${i}`);const analysis=texturePlane(cardTexture(i,true),2.65,1.86,`analysis-content-${i}`);mesh.renderOrder=3;analysis.renderOrder=4;analysis.position.z=.008;analysis.userData.reveal={value:1};analysis.material.onBeforeCompile=shader=>{shader.uniforms.journeyReveal=analysis.userData.reveal;shader.fragmentShader='uniform float journeyReveal;\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vMapUv.x>journeyReveal) discard;');};analysis.material.customProgramCacheKey=()=> 'journey-reveal';mesh.add(analysis);root.add(mesh);return mesh;});
 const loader=new THREE.TextureLoader(manager),productTexture=loader.load('/media/intelligence-v3/beauty-palette.png');productTexture.colorSpace=THREE.SRGBColorSpace;
 const product=texturePlane(productTexture,1,1,'persistent-beauty-product');product.renderOrder=10;root.add(product);
 const reflection=texturePlane(productTexture,1,1,'product-reflection');reflection.renderOrder=2;root.add(reflection);
 const heroLight=glow('product-studio-light','#bd9a7e');heroLight.position.set(0,0,.5);heroLight.scale.set(8,7,1);root.add(heroLight);
 const productCaption=textPlane('SOFT HAZE  /  FOUR-SHADE EYE PALETTE','product-caption',5.3);root.add(productCaption);
 const orbitPoints=Array.from({length:129},(_,i)=>new THREE.Vector3(Math.sin(i/128*Math.PI*2)*3.5,-1.35+Math.cos(i/128*Math.PI*2)*.48,Math.cos(i/128*Math.PI*2)*1.5));const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),new THREE.LineBasicMaterial({color:'#76a3c5',transparent:true,depthWrite:false}));root.add(orbit);
 const commerce=new THREE.Group();commerce.name='product-detail-page';root.add(commerce);
 const page=texturePlane(commerceTexture(),8.8,6.2,'commerce-frame');commerce.add(page);
 const details=texturePlane(commerceDetails(),3.6,3.6,'commerce-details');details.position.set(1.8,.15,.05);commerce.add(details);
 const commerceMetrics=[];for(let i=0;i<4;i++){const mesh=textPlane(`${[128,136,148,162][i]} orders   /   ${[24,27,31,36][i]} reviews`,`commerce-metrics-${i}`,3.0);mesh.material.color.set('#594c3f');mesh.position.set(1.8,-2.3,.12);commerce.add(mesh);commerceMetrics.push(mesh);}
 return {root,body,robot,crystal,core,coreRim,halo,eye,iris,pupil,glint,housing,cursor,projection,screenBody,scanLine,ambience,floor,scan,scanEdge,links,nodes,records,beam,screen,cards,product,reflection,heroLight,productCaption,orbit,commerce,details,commerceMetrics};
}
