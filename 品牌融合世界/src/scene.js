import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {getRenderQuality,applyRendererQuality,pixelRatioFor,tuneTextures} from '../../共享组件/renderQuality.js';
import { createFrameLoop } from '../../共享组件/frameLoop.js';
import {createFlowSky} from '../../共享组件/flowSky.js';
import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createProduct,disposeProduct,variantMaterials } from './models.js';
import {asset} from './content.js';
function imageExhibit(id,media){
 const group=new T.Group();
 const texture=new T.TextureLoader().load(asset(media.images[0].src));texture.colorSpace=T.SRGBColorSpace;
 const image=new T.Mesh(new T.PlaneGeometry(2.5,2),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));image.position.z=.052;
 const backing=new T.Mesh(new T.BoxGeometry(2.56,2.06,.09),new T.MeshStandardMaterial({color:'#b8b3a5',metalness:.65,roughness:.34}));
 group.add(backing,image);group.traverse(o=>{o.userData.productId=id;});return group;
}

const lerp=T.MathUtils.lerp;
export class BrandScene {
 constructor(canvas,onSelect,onReady,media={},options={}){
  const atrium=options.atrium===true;this.quality=getRenderQuality();const q=this.quality.render;
  this.canvas=canvas;this.onSelect=onSelect;this.mode='home';this.active=null;this.domain='beauty';this.memory={};this.filters={};this.running=true;this.rotation={x:0,y:0};this.zoom=1;this.pointers=new Map();this.moves=0;this.hover=new T.Vector2();this.targetPos=new T.Vector3(3.0,.1,0);this.targetScale=1;this.atrium=atrium;
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true});this.renderer.setPixelRatio(1);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.appliedQuality=applyRendererQuality(this.renderer,T,this.quality);
  
  this.scene=new T.Scene();this.scene.background=new T.Color(atrium?'#071725':'#071b30');if(atrium){this.sky=createFlowSky(T,this.scene);this.scene.background=null;}this.scene.fog=new T.FogExp2(atrium?'#071725':'#071b30',.027);this.camera=new T.PerspectiveCamera(34,1,.1,100);this.camera.position.set(0,3.7,16);this.camera.lookAt(0,.15,0);
  const target=new T.WebGLRenderTarget(1,1,{samples:this.appliedQuality.msaa,type:T.HalfFloatType});this.composer=new EffectComposer(this.renderer,target);this.composer.addPass(new RenderPass(this.scene,this.camera));this.outputPass=new OutputPass();this.composer.addPass(this.outputPass);this.renderer.info.autoReset=false;
  const pmrem=new T.PMREMGenerator(this.renderer);const room=new RoomEnvironment();this.env=pmrem.fromScene(room,.04).texture;this.scene.environment=this.env;room.dispose();pmrem.dispose();this.scene.environmentIntensity=.75*q.environment;
  this.scene.add(new T.HemisphereLight(atrium?'#fffaf0':'#d6e7ff','#142b40',atrium?.65:.65));const key=new T.DirectionalLight('#ffe5ce',3.2);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(this.appliedQuality.shadowMapSize,this.appliedQuality.shadowMapSize);Object.assign(key.shadow.camera,{left:-12,right:12,top:9,bottom:-9});key.shadow.bias=-.001;key.shadow.normalBias=.035;key.shadow.radius=4;this.scene.add(key);
  const rim=new T.DirectionalLight('#a8cfff',atrium?2.3:4);rim.position.set(4,4,-5);this.scene.add(rim);const pink=new T.PointLight('#d4a5c8',atrium?9:30,20);pink.position.set(5,1,4);this.scene.add(pink);
  this.world=new T.Group();this.world.position.copy(this.targetPos);this.scene.add(this.world);this.models={};
  const positions={lipstick:[-1.95,.35,.7],serum:[-.52,1.35,-1.0],compact:[-2.25,-1.12,-1.6],rings:[.35,-.1,1.4],maraca:[1.85,.55,-.35],puzzle:[1.8,-1.3,.55],balloon:[2.6,1.5,-2.5],gift:[-.18,-1.45,-2.1]};
  this.ids=Object.keys(positions);this.ids.forEach((id,i)=>{const object=media[id]&&!media[id].model?imageExhibit(id,media[id]):createProduct(id,this.quality);const holder=new T.Group();holder.add(object);holder.userData.id=id;holder.position.set(...positions[id]);holder.userData.home=holder.position.clone();holder.userData.target=holder.position.clone();holder.userData.scale=id==='lipstick'?1.18:id==='balloon'?.85:id==='compact'?.68:.85;holder.scale.setScalar(.001);holder.userData.targetScale=0;holder.userData.phase=i*.9;this.world.add(holder);this.models[id]={holder,object};});
  this.stage=new T.Group();this.stage.position.set(2.75,-2.65,0);this.scene.add(this.stage);
  const platform=new T.Mesh(new T.CylinderGeometry(1.85,1.93,.12,120),new T.MeshStandardMaterial({color:atrium?'#102839':'#08243b',metalness:.35,roughness:.42,envMapIntensity:.2}));platform.receiveShadow=true;this.stage.add(platform);
  const ring=new T.Mesh(new T.TorusGeometry(1.77,.008,8,160),new T.MeshBasicMaterial({color:'#657883',transparent:true,opacity:.28}));ring.rotation.x=Math.PI/2;ring.position.y=.11;this.stage.add(ring);
  const floor=new T.Mesh(new T.PlaneGeometry(1000,1000),atrium?new T.ShadowMaterial({color:'#18314e',opacity:.16,depthWrite:false}):new T.MeshStandardMaterial({color:'#06172a',metalness:0,roughness:.95,envMapIntensity:.03}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.78;floor.receiveShadow=true;this.scene.add(floor);
  const dustPositions=[];let seed=29;for(let i=0;i<100;i++){seed=(seed*16807)%2147483647;dustPositions.push((seed%1000)/1000*35-17.5,(seed%721)/721*18-5,-4-(seed%397)/397*20);}
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(dustPositions,3));this.dust=new T.Points(dg,new T.PointsMaterial({color:'#a8c8d3',size:.023,transparent:true,opacity:.4,depthWrite:false}));this.scene.add(this.dust);
  this.ray=new T.Raycaster();this.down=this.pointerDown.bind(this);this.move=this.pointerMove.bind(this);this.up=this.pointerUp.bind(this);this.cancel=this.pointerCancel.bind(this);canvas.addEventListener('pointerdown',this.down);canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.cancel);this.wheel=e=>{e.preventDefault();this.zoom=T.MathUtils.clamp(this.zoom-e.deltaY*.0007,.75,1.3);};canvas.addEventListener('wheel',this.wheel,{passive:false});
  tuneTextures(this.scene,this.appliedQuality.anisotropy);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();this.setView('home','beauty',null,true);
  this.loop=createFrameLoop({render:(now,dt)=>this.tick(now,dt)});
  this.visibility=()=>this.loop.setVisible(!document.hidden);
  document.addEventListener('visibilitychange',this.visibility);this.visibility();this.loop.setActive(true);onReady?.();
 }
 setMedia(mode){this.world.visible=this.mode!=='detail'||mode==='model';}
 setCinematic(value){this.cinematic=value;}
 setSuspended(value){this.suspended=value;this.loop.setActive(!value);}
 setVariant(id,palette={}){this.colorTargets=Object.entries(this.models).flatMap(([key,{object}])=>variantMaterials(object,key===id?palette:{}));}
 resize(){const r=this.canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;this.width=r.width;this.height=r.height;this.renderer.setPixelRatio(pixelRatioFor(r.width,r.height,devicePixelRatio,this.quality.render,this.renderer.capabilities.maxTextureSize));this.renderer.setSize(r.width,r.height,false);this.composer.setPixelRatio(this.renderer.getPixelRatio());this.composer.setSize(r.width,r.height);this.camera.aspect=r.width/r.height;this.camera.fov=this.camera.aspect>1.9?33:this.camera.aspect<1.45?43:36;this.camera.updateProjectionMatrix();}
 save(){const key=this.mode==='detail'?this.active:this.mode==='home'?'home':this.domain;this.memory[key]={...this.rotation,zoom:this.zoom};}
 setFilter(id){if(this.mode!=='domain'||this.filters[this.domain]===id)return;this.filters[this.domain]=id;this.setView(this.mode,this.domain,this.active,true);}
 setView(mode,domain,active,force=false){if(!force&&this.mode===mode&&this.domain===domain&&this.active===active)return;this.save();this.mode=mode;this.domain=domain;this.active=active;const key=mode==='detail'?active:mode==='home'?'home':domain;const memory=this.memory[key]||{x:0,y:0,zoom:1};this.rotation={x:memory.x,y:memory.y};this.zoom=memory.zoom;
  const groups={beauty:['lipstick','serum','compact'],play:['rings','maraca','puzzle'],party:['balloon','gift']};const chosen=(groups[domain]||groups.beauty).filter(id=>!this.filters[domain]||this.filters[domain]==='all'||this.filters[domain]===id);
  this.targetPos.set(mode==='detail'?-2.1:3.0,mode==='detail'?.3:mode==='domain'?.9:0,0);
  const focalId=mode==='home'?'serum':mode==='domain'?chosen[0]:active;
  this.nextFocal=focalId;this.focalScale=mode==='home'?1.92:mode==='domain'?(focalId==='balloon'?1.0:1.32):(focalId==='balloon'?1.36:1.85);
  this.transitioning=this.focalId!==focalId;
  for(const [id,{holder,object}]of Object.entries(this.models)){
   holder.userData.target.set(0,0,0);
   holder.userData.targetScale=!this.transitioning&&id===focalId?this.focalScale:0;
   object.rotation.set(0,0,0);
  }
 }
 pointerDown(e){this.canvas.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.moves=0;this.origin={x:e.clientX,y:e.clientY};this.last={x:e.clientX,y:e.clientY};if(this.pointers.size===2)this.pinch=this.pinchDistance();}
 pinchDistance(){const p=[...this.pointers.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
 pointerMove(e){const r=this.canvas.getBoundingClientRect();this.hover.set((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5);
  if(this.pointers.has(e.pointerId)){this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size>1){const next=this.pinchDistance();if(this.pinch)this.zoom=T.MathUtils.clamp(this.zoom*next/this.pinch,.75,1.3);this.pinch=next;this.moves+=10;}else{this.rotation.y+=(e.clientX-this.last.x)*.006;this.rotation.x=T.MathUtils.clamp(this.rotation.x+(e.clientY-this.last.y)*.003,-.5,.5);this.moves+=Math.abs(e.clientX-this.last.x)+Math.abs(e.clientY-this.last.y);}this.last={x:e.clientX,y:e.clientY};this.canvas.style.cursor='grabbing';}
  else{const hit=this.pick(e);this.canvas.style.cursor=hit?'pointer':'grab';}
 }
 pointerUp(e){const click=this.pointers.size===1&&this.moves<10;this.pointers.delete(e.pointerId);if(this.canvas.hasPointerCapture(e.pointerId))this.canvas.releasePointerCapture(e.pointerId);this.pinch=0;if(click){const id=this.pick(e);if(id)this.onSelect(id);}this.canvas.style.cursor='grab';this.save();}
 pointerCancel(e){this.pointers.delete(e.pointerId);this.pinch=0;this.moves=100;this.canvas.style.cursor='grab';this.save();}
 pick(e){const r=this.canvas.getBoundingClientRect();this.ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),this.camera);const meshes=[];for(const v of Object.values(this.models)){if(v.holder.scale.x>.2)v.object.traverse(o=>{if(o.isMesh)meshes.push(o);});}return this.ray.intersectObjects(meshes,false)[0]?.object.userData.productId;}
 orient(angle){this.rotation.y=angle;this.rotation.x=0;}
 reset(){this.rotation={x:0,y:0};this.zoom=1;}
 tick(now,dt){if(!this.running)return;this.elapsed??=0;const elapsed=this.elapsed;this.elapsed+=dt;const factor=1-Math.exp(-dt*5);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.cinemaMix=lerp(this.cinemaMix||0,this.cinematic?1:0,reduced?1:1-Math.exp(-dt*(this.cinematic?.72:2.8)));
  if(!this.suspended&&!document.hidden)this.cinemaTime=(this.cinemaTime||0)+(this.cinematic?dt:0);
  if(this.cinemaMix<.001)this.cinemaTime=0;
  const cinematicPosition=this.targetPos.clone();cinematicPosition.x*=1-this.cinemaMix;
  this.world.position.lerp(cinematicPosition,factor);const sc=lerp(this.zoom,1.18,this.cinemaMix);this.world.scale.lerp(new T.Vector3(sc,sc,sc),factor);
  this.colorTargets?.forEach(({material,color})=>material.color.lerp(color,factor));
  this.world.rotation.y=lerp(this.world.rotation.y,this.rotation.y+(this.mode==='detail'?0:-.17)+(!reduced?Math.sin((this.cinemaTime||0)*.12)*.48*this.cinemaMix:0)+(!reduced&&!this.pointers.size?this.hover.x*.08:0),factor);this.world.rotation.x=lerp(this.world.rotation.x,this.rotation.x,factor);
  if(this.transitioning&&Object.values(this.models).every(({holder})=>holder.scale.x<.065)){
   this.focalId=this.nextFocal;this.transitioning=false;
   if(this.models[this.focalId])this.models[this.focalId].holder.userData.targetScale=this.focalScale;
  }
  for(const [id,{holder,object}]of Object.entries(this.models)){
   const target=holder.userData.target;holder.position.lerp(target,factor);const s=holder.userData.targetScale;holder.scale.lerp(new T.Vector3(s,s,s),factor);holder.visible=holder.scale.x>.005;
   if(!reduced){object.position.y=this.mode==='detail'?0:Math.sin(elapsed*this.quality.models[id].motionScale*.35+holder.userData.phase)*.035;object.rotation.z=this.mode==='detail'?0:Math.sin(elapsed*this.quality.models[id].motionScale*.18+holder.userData.phase)*.018;}
  }
  this.canvas.dataset.focusedProduct=this.focalId||'';this.canvas.dataset.visibleProducts=Object.entries(this.models).filter(([,m])=>m.holder.visible&&m.holder.scale.x>.065).map(([id])=>id).join(',');
  this.stage.position.x=lerp(this.stage.position.x,cinematicPosition.x,factor);this.stage.position.y=lerp(this.stage.position.y,this.mode==='home'?-2.2:this.mode==='domain'?-1.02:-2.65,factor);this.dust.rotation.y=elapsed*.004;
  this.canvas.dataset.cinematic=this.cinemaMix.toFixed(3);
  if(!document.hidden&&!this.suspended){this.sky?.update(elapsed,this.camera.aspect,reduced);this.renderer.info.reset();this.composer.render();this.renderFrames=(this.renderFrames||0)+1;}
 }
 diagnostic(){return {quality:this.appliedQuality,mode:this.mode,domain:this.domain,active:this.active,rotation:{...this.rotation},zoom:this.zoom,memory:this.memory,frames:this.renderFrames,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,canvas:[this.canvas.width,this.canvas.height]};}
 destroy(){this.sky?.dispose();this.running=false;this.loop.dispose();document.removeEventListener('visibilitychange',this.visibility);this.resizeObserver.disconnect();this.canvas.removeEventListener('pointerdown',this.down);this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('pointerup',this.up);this.canvas.removeEventListener('pointercancel',this.cancel);this.canvas.removeEventListener('wheel',this.wheel);disposeProduct(this.scene);this.outputPass.dispose();this.composer.dispose();this.env.dispose();this.renderer.dispose();}
}
