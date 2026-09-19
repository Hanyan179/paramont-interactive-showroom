import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createDirectionModel,createPaletteCraft} from './intelligenceCraft.js';
import {informationFragments} from './intelligenceResearch.js';
import {createMountainRobot} from './intelligenceRobot.js';
import {createProjection,installTyping} from './intelligencePresence.js';
import {lerp,ramp} from './intelligenceTimeline.js';
import {canvasTexture,label,rounded,cardTexture,reviewNoteTexture,reviewTexture,commerceTexture,commerceDetails,purchaseReviewTexture,reportTexture,translate} from './intelligenceSurfaces.js';
export {canvasTexture,label,rounded};
export function texturePlane(texture,w,h,name){const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.name=name;return mesh;}
export function alpha(mesh,value){mesh.visible=value>.001;if(mesh.material){mesh.material.opacity=value;if(mesh.material.uniforms?.opacity)mesh.material.uniforms.opacity.value=value;}}
function textTexture(text){return canvasTexture((ctx,w,h)=>{ctx.textAlign='center';ctx.textBaseline='middle';label(ctx,text,w/2,h/2,Math.min(108,1500/Math.max(1,text.length)));},1024,160);}
export function textPlane(text,name,width=3.2){return texturePlane(textTexture(text),width,width*160/1024,name);}
function glow(name,color='#76bce9'){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{opacity:{value:0},tint:{value:new THREE.Color(color)}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float opacity;uniform vec3 tint;void main(){float d=length((v-.5)*2.);float a=exp(-d*d*5.)*smoothstep(1.,.7,d);gl_FragColor=vec4(tint,a*opacity);}'}));mesh.name=name;return mesh;
}
function shellMapping(shell){
 // Sample the approved shell once, before it joins the animated body. A radial
 // mapping preserves the cube surface topology and its correspondence with the
 // rounded mountain; no geometry or raycasts are created during playback.
 shell.updateMatrixWorld(true);shell.geometry.computeBoundingBox();
 const bounds=shell.geometry.boundingBox.clone().applyMatrix4(shell.matrixWorld),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()).multiplyScalar(.5);
 const ray=new THREE.Raycaster(),direction=new THREE.Vector3(),from=new THREE.Vector3(),cache=new Map();
 return (x,y,z)=>{
  const key=`${x},${y},${z}`;if(cache.has(key))return cache.get(key);
  const radius=Math.max(Math.abs(x),Math.abs(y),Math.abs(z))/1.4;
  direction.set(x*size.x,y*size.y,z*size.z).normalize();from.copy(center).addScaledVector(direction,16);ray.set(from,direction.negate());
  const hit=ray.intersectObject(shell,false)[0];if(!hit)throw new Error('The cube-to-mountain surface projection missed its shell');
  const point=hit.point.sub(center).multiplyScalar(radius).add(center).toArray();cache.set(key,point);return point;
 };
}
export function createCrystal(robotShell){
 // Each cube surface triangle becomes part of the same mountain silhouette.
 const project=shellMapping(robotShell),geometry=new THREE.BoxGeometry(2.8,2.8,2.8,12,12,12).toNonIndexed(),position=geometry.attributes.position;
 const target=position.clone();for(let i=0;i<position.count;i++)target.setXYZ(i,...project(position.getX(i),position.getY(i),position.getZ(i)));
 // Keep the broad glass reflections quiet during reconstruction. The approved
 // metallic shell supplies its own smooth bevels as the silhouette settles.
 geometry.morphAttributes.position=[target];
 const material=new THREE.MeshPhysicalMaterial({color:'#c4dcf1',metalness:.08,roughness:.18,transmission:.92,thickness:1.7,ior:1.45,clearcoat:.5,clearcoatRoughness:.24,envMapIntensity:1.15,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});
 const shell=new THREE.Mesh(geometry,material);shell.name='persistent-data-crystal';
 const corners=[[-1.4,-1.4,-1.4],[1.4,-1.4,-1.4],[-1.4,1.4,-1.4],[1.4,1.4,-1.4],[-1.4,-1.4,1.4],[1.4,-1.4,1.4],[-1.4,1.4,1.4],[1.4,1.4,1.4]],segments=[];
 for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(corners[i].filter((v,k)=>v!==corners[j][k]).length===1)for(let s=0;s<8;s++)for(const v of [s/8,(s+1)/8])segments.push(corners[i].map((p,k)=>lerp(p,corners[j][k],v)));
 const edgeGeometry=new THREE.BufferGeometry();edgeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(segments.flat(),3));
 const edgeTargets=segments.map(v=>project(...v));
 const edges=new THREE.LineSegments(edgeGeometry,new THREE.LineBasicMaterial({color:'#c9e8fa',transparent:true,opacity:.7,depthWrite:false}));edges.name='persistent-crystal-edges';shell.add(edges);
 // One instanced lattice, no object or material creation during playback.
 const cellPositions=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])cellPositions.push(new THREE.Vector3(x*.69,y*.69,z*.69));
 const cellTargets=cellPositions.map(v=>project(v.x,v.y,v.z));
 const cells=new THREE.InstancedMesh(new RoundedBoxGeometry(1.31,1.31,1.31,3,.045),new THREE.MeshPhysicalMaterial({color:'#a4c5df',metalness:.08,roughness:.08,transmission:.8,thickness:.7,ior:1.5,transparent:true,opacity:.7,depthWrite:false,envMapIntensity:1.3}),cellPositions.length);cells.name='data-lattice';cells.frustumCulled=false;
 cellPositions.forEach((v,i)=>cells.setColorAt(i,new THREE.Color().setHSL(.57+(i%4)*.012,.16,.58+(i%3)*.06)));
 const dummy=new THREE.Object3D();
 return {shell,edges,cells,morph(value,time){
  shell.morphTargetInfluences[0]=value;material.thickness=lerp(1.7,.66,value);
  const p=edgeGeometry.attributes.position;segments.forEach((v,i)=>p.setXYZ(i,...v.map((c,k)=>lerp(c,edgeTargets[i][k],value))));p.needsUpdate=true;
  const collapse=ramp(time,24,29);
  cellPositions.forEach((v,i)=>{
   const g=ramp(time,9+i*.35,12.3+i*.35),to=[lerp(v.x,cellTargets[i][0],value),lerp(v.y,cellTargets[i][1],value),lerp(v.z,cellTargets[i][2],value)];
   const breathing=(.025+.025*Math.sin(time*.75+i*.45))*(1-collapse);
   const scanned=ramp(time,19+(1-v.y)*1.3,20+(1-v.y)*1.3)*(1-ramp(time,23,25));
   const spread=1+breathing+scanned*.17;
   dummy.position.set(lerp(to[0]*1.16,to[0]*spread,g)*(1-collapse*.82),lerp(to[1]*1.16,to[1]*spread,g)*(1-collapse*.82),lerp(to[2]*1.16,to[2]*spread,g)*(1-collapse*.82));
   dummy.rotation.set(0,scanned*(v.y>0?.12:-.12),0);dummy.scale.setScalar(g*(1-collapse*.94));dummy.updateMatrix();cells.setMatrixAt(i,dummy.matrix);
  });cells.instanceMatrix.needsUpdate=true;
 }};
}

function clipToPage(mesh){const band={value:new THREE.Vector2(-1e6,1e6)};mesh.userData.pageClip=band;mesh.material.onBeforeCompile=shader=>{shader.uniforms.pageClip=band;shader.vertexShader='varying float pageWorldY;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\npageWorldY=(modelMatrix*vec4(transformed,1.)).y;');shader.fragmentShader='varying float pageWorldY;uniform vec2 pageClip;\n'+shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(pageWorldY<pageClip.x||pageWorldY>pageClip.y) discard;');};mesh.material.customProgramCacheKey=()=> 'journey-page-clip';}

export function createJourneyObjects(manager,quality){
 const root=new THREE.Group();root.name='continuous-value-journey';
 const robot=createMountainRobot(quality),crystal=createCrystal(robot.shell),body=new THREE.Group();body.name='data-to-assistant';body.add(crystal.shell,crystal.cells,robot.root);root.add(body);
 const ambience=glow('exhibit-light-pool','#2d6094');ambience.position.set(.5,.1,-2);ambience.scale.set(12,9,1);root.add(ambience);
 const floor=glow('contact-light','#6191ae');floor.position.set(0,-2.4,-.5);floor.scale.set(6,.6,1);root.add(floor);
 const scan=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({color:'#b3e3ff',transparent:true,side:THREE.DoubleSide,depthWrite:false}));scan.rotation.x=Math.PI/2;scan.name='analysis-scan';body.add(scan);
 const scanEdge=new THREE.LineSegments(new THREE.EdgesGeometry(scan.geometry),new THREE.LineBasicMaterial({color:'#d0eeff',transparent:true,depthWrite:false}));scan.add(scanEdge);
 const linkPoints=[];for(let i=0;i<6;i++){const a=i*1.04;linkPoints.push(Math.cos(a)*.95,Math.sin(a)*1.1,(i%3-1)*.6,Math.cos(a+1.4)*.95,Math.sin(a+1.4)*1.1,((i+1)%3-1)*.6);}
 const links=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(linkPoints,3)),new THREE.LineBasicMaterial({color:'#91c5e6',transparent:true,depthWrite:false}));links.name='analysis-connections';body.add(links);
 const nodeGeometry=new THREE.SphereGeometry(.035,10,8);const nodes=Array.from({length:6},(_,i)=>{const m=new THREE.Mesh(nodeGeometry,new THREE.MeshBasicMaterial({color:'#c7ebff',transparent:true,depthWrite:false}));m.name=`analysis-node-${i}`;m.position.fromArray(linkPoints,i*6);m.userData.anchor=m.position.clone();body.add(m);return m;});
 const reviews=['Great product.','Perfect gift.','Love it.','Good quality.','Beautiful colours.','Soft texture.'];
 const texts=reviews;
 const reviewMap=reviewTexture();
 const records=Array.from({length:texts.length},(_,i)=>{const text=texts[i%texts.length],mesh=textPlane(text,`record-${i}`,i===0?3.8:2.5);installTyping(mesh,text,mesh.material.map.image.getContext('2d'),i===0?3.8:2.5);const card=texturePlane(reviewMap,i===0?4.2:3.2,i===0?1.31:1,'feedback-frame');card.position.z=-.03;mesh.add(card);const purchase=texturePlane(purchaseReviewTexture(i),5.8,2.2,'purchase-review-frame');purchase.position.z=-.035;purchase.material.color.setScalar(.78);purchase.renderOrder=5;card.renderOrder=5;mesh.renderOrder=6;mesh.add(purchase);mesh.traverse(part=>{if(part.material)part.material.side=THREE.FrontSide;});root.add(mesh);return mesh;});
 const reportPaper=new THREE.Color('#102337');
 const reportFaces=Array.from({length:6},(_,i)=>{
  const face=texturePlane(reportTexture(i),2.65,2.65,`report-face-${i}`),reveal={value:0};face.material.side=THREE.FrontSide;face.userData.reportReveal=reveal;
  // The same page first receives the source stream, then reveals its writing
  // from heading to conclusion. The contour remains present during both steps.
  face.material.onBeforeCompile=shader=>{
   shader.uniforms.reportReveal=reveal;shader.uniforms.reportPaper={value:reportPaper};
   shader.fragmentShader='uniform float reportReveal;uniform vec3 reportPaper;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float interior=step(.04,vMapUv.x)*step(vMapUv.x,.96)*step(.04,vMapUv.y)*step(vMapUv.y,.96);
    float ink=max(1.-interior,smoothstep(1.-reportReveal,1.-reportReveal+.06,vMapUv.y));
    diffuseColor.rgb=mix(reportPaper,diffuseColor.rgb,ink);
   `);
  };face.material.customProgramCacheKey=()=> 'report-ink-reveal';root.add(face);return face;
 });
 const fragmentPairs=informationFragments;
 const dataFragments=fragmentPairs.map((pair,i)=>{const map=canvasTexture((c,w,h)=>{c.textAlign='center';c.textBaseline='middle';label(c,pair[c.journeyLang==='zh'?1:0],w/2,h/2,76);},1024,150);const mesh=texturePlane(map,2.4,.35,`data-fragment-${i}`);mesh.userData.category=Math.floor(i/6);root.add(mesh);return mesh;});
 const projection=createProjection(),beam=projection.mesh;root.add(beam);
 const cursor=new THREE.Mesh(new THREE.PlaneGeometry(.025,.35),new THREE.MeshBasicMaterial({color:'#bdeaff',transparent:true,depthWrite:false}));cursor.name='typing-cursor';root.add(cursor);
 const scanLine=new THREE.Mesh(new THREE.PlaneGeometry(6.42,.025),new THREE.MeshBasicMaterial({color:'#b7eaff',transparent:true,depthWrite:false}));scanLine.name='screen-scan-contact';scanLine.renderOrder=11;scanLine.position.z=.15;root.add(scanLine);
 const cardDepths=[];
 const cards=Array.from({length:5},(_,i)=>{
  const card=texturePlane(cardTexture(i),2.65,1.86,`analysis-card-${i}`);card.renderOrder=3;
  const depth=new THREE.Mesh(new RoundedBoxGeometry(2.68,1.89,.10,2,.045),new THREE.MeshPhysicalMaterial({color:'#122438',metalness:.38,roughness:.22,transparent:true,depthWrite:false}));
  depth.position.z=-.075;depth.renderOrder=2;depth.name='decision-card-depth';card.add(depth);cardDepths.push(depth);root.add(card);return card;
 });
 const directionModels=cards.slice(0,4).map((card,i)=>{const model=createDirectionModel(i);const positions=[[-.72,-.26,.20],[.80,-.42,.20],[.82,-.20,.20],[-.49,-.08,.20]];model.root.position.fromArray(positions[i]);model.root.scale.setScalar(i===1?.58:i===3?.67:.70);card.add(model.root);return model;});
 const statusMaps=['Reviewing','Passed over','Selected'].map(textTexture);
 const reviewBadges=cards.map((card,i)=>statusMaps.map((map,j)=>{const badge=texturePlane(map,1.15,1.15*160/1024,`file-status-${i}-${j}`);badge.position.set(i===1?-.55:.65,-.75,.15);badge.material.color.set(j===1?'#a39b97':j===2?'#b9e9df':'#aecce2');badge.renderOrder=12;card.add(badge);return badge;}));
 const reviewNotes=cards.map((_,i)=>{const note=texturePlane(reviewNoteTexture(i),6.3,6.3*170/1280,`proposal-review-note-${i}`);note.renderOrder=15;root.add(note);return note;});
 const loader=new THREE.TextureLoader(manager),productTexture=loader.load('/media/intelligence-v3/beauty-palette.png');productTexture.colorSpace=THREE.SRGBColorSpace;
 const product=texturePlane(productTexture,1,1,'persistent-beauty-product');product.renderOrder=10;clipToPage(product);root.add(product);
 const craft=createPaletteCraft(productTexture);root.add(craft.root,craft.captionRoot);
 const reflection=texturePlane(productTexture,1,1,'product-reflection');reflection.renderOrder=2;root.add(reflection);
 const heroLight=glow('product-studio-light','#bd9a7e');heroLight.position.set(0,0,.5);heroLight.scale.set(8,7,1);root.add(heroLight);
 const productCaption=textPlane('SOFT HAZE  /  FOUR-SHADE EYE PALETTE','product-caption',5.3);root.add(productCaption);
 const commerce=new THREE.Group();commerce.name='product-detail-page';root.add(commerce);
 const page=texturePlane(commerceTexture(),8.8,6.2,'commerce-frame');page.material.color.setScalar(.76);page.material.onBeforeCompile=shader=>{shader.vertexShader='varying vec2 pageUv;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\npageUv=uv;');shader.fragmentShader='varying vec2 pageUv;\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nvec2 q=abs(pageUv-.5)-vec2(.483,.477);if(length(max(q,0.))>.017)discard;');};page.material.customProgramCacheKey=()=> 'rounded-page-viewport';page.material.map.repeat.y=1080/2100;page.material.map.offset.y=1-1080/2100;commerce.add(page);
 const details=texturePlane(commerceDetails(),3.6,3.6,'commerce-details');details.position.set(1.8,.15,.05);commerce.add(details);clipToPage(details);
 const commerceMetrics=[];for(let i=0;i<4;i++){const mesh=textPlane(`${[128,136,148,162][i]} orders   /   ${[24,27,31,36][i]} reviews`,`commerce-metrics-${i}`,3.0);mesh.material.color.set('#594c3f');mesh.position.set(1.8,2.32,.12);commerce.add(mesh);commerceMetrics.push(mesh);}
 function setLanguage(lang){const maps=new Set();root.traverse(mesh=>{if(mesh.material?.map)maps.add(mesh.material.map);});maps.forEach(map=>map.userData.redraw?.(lang));records.forEach((mesh,i)=>installTyping(mesh,translate(texts[i],lang),mesh.material.map.image.getContext('2d'),i===0?3.8:2.5));root.userData.language=lang;}
 return {craft,directionModels,reviewBadges,reviewNotes,setLanguage,reportFaces,dataFragments,root,body,robot,page,crystal,cursor,projection,scanLine,ambience,floor,scan,scanEdge,links,nodes,records,beam,cards,cardDepths,product,reflection,heroLight,productCaption,commerce,details,commerceMetrics};
}
