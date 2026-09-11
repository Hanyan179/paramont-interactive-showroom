import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createProduct,disposeProduct } from './models.js';

const lerp=T.MathUtils.lerp;
export class BrandScene {
 constructor(canvas,onSelect,onReady){
  this.canvas=canvas;this.onSelect=onSelect;this.mode='home';this.active=null;this.domain='beauty';this.memory={};this.filters={};this.running=true;this.rotation={x:0,y:0};this.zoom=1;this.pointers=new Map();this.moves=0;this.hover=new T.Vector2();this.targetPos=new T.Vector3(2.75,.1,0);this.targetScale=1;
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true});this.renderer.setPixelRatio(1);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
  this.scene=new T.Scene();this.scene.background=new T.Color('#071b30');this.scene.fog=new T.FogExp2('#071b30',.027);this.camera=new T.PerspectiveCamera(34,1,.1,100);this.camera.position.set(0,3.7,16);this.camera.lookAt(0,.15,0);
  const pmrem=new T.PMREMGenerator(this.renderer);const room=new RoomEnvironment();this.env=pmrem.fromScene(room,.04).texture;this.scene.environment=this.env;room.dispose();pmrem.dispose();this.scene.environmentIntensity=.75;
  this.scene.add(new T.HemisphereLight('#d6e7ff','#142033',.65));const key=new T.DirectionalLight('#ffe5ce',3.2);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-12,right:12,top:9,bottom:-9});key.shadow.bias=-.001;key.shadow.normalBias=.035;key.shadow.radius=4;this.scene.add(key);
  const rim=new T.DirectionalLight('#a8cfff',4);rim.position.set(4,4,-5);this.scene.add(rim);const pink=new T.PointLight('#d4a5c8',30,20);pink.position.set(5,1,4);this.scene.add(pink);
  this.world=new T.Group();this.world.position.copy(this.targetPos);this.scene.add(this.world);this.models={};
  const positions={lipstick:[-1.95,.35,.7],serum:[-.52,1.35,-1.0],compact:[-2.25,-1.12,-1.6],rings:[.35,-.1,1.4],maraca:[1.85,.55,-.35],puzzle:[1.8,-1.3,.55],balloon:[2.6,1.5,-2.5],gift:[-.18,-1.45,-2.1]};
  this.ids=Object.keys(positions);this.ids.forEach((id,i)=>{const object=createProduct(id);const holder=new T.Group();holder.add(object);holder.userData.id=id;holder.position.set(...positions[id]);holder.userData.home=holder.position.clone();holder.userData.target=holder.position.clone();holder.userData.scale=id==='lipstick'?1.18:id==='balloon'?.85:id==='compact'?.68:.85;holder.scale.setScalar(holder.userData.scale);holder.userData.targetScale=holder.userData.scale;holder.userData.phase=i*.9;this.world.add(holder);this.models[id]={holder,object};});
  this.stage=new T.Group();this.stage.position.set(2.75,-2.65,0);this.scene.add(this.stage);
  const platform=new T.Mesh(new T.CylinderGeometry(5.5,5.55,.18,120),new T.MeshStandardMaterial({color:'#08243b',metalness:.35,roughness:.42,envMapIntensity:.2}));platform.receiveShadow=true;this.stage.add(platform);
  const ring=new T.Mesh(new T.TorusGeometry(5.25,.016,8,160),new T.MeshBasicMaterial({color:'#657883',transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.11;this.stage.add(ring);
  const floor=new T.Mesh(new T.PlaneGeometry(1000,1000),new T.MeshStandardMaterial({color:'#06172a',metalness:0,roughness:.95,envMapIntensity:.03}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.78;floor.receiveShadow=true;this.scene.add(floor);
  const dustPositions=[];let seed=29;for(let i=0;i<100;i++){seed=(seed*16807)%2147483647;dustPositions.push((seed%1000)/1000*35-17.5,(seed%721)/721*18-5,-4-(seed%397)/397*20);}
  const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(dustPositions,3));this.dust=new T.Points(dg,new T.PointsMaterial({color:'#a8c8d3',size:.023,transparent:true,opacity:.4,depthWrite:false}));this.scene.add(this.dust);
  this.ray=new T.Raycaster();this.down=this.pointerDown.bind(this);this.move=this.pointerMove.bind(this);this.up=this.pointerUp.bind(this);this.cancel=this.pointerCancel.bind(this);canvas.addEventListener('pointerdown',this.down);canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.cancel);this.wheel=e=>{e.preventDefault();this.zoom=T.MathUtils.clamp(this.zoom-e.deltaY*.0007,.75,1.3);};canvas.addEventListener('wheel',this.wheel,{passive:false});
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();this.start=performance.now();this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);onReady?.();
 }
 resize(){const r=this.canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.25,Math.sqrt(3100000/(r.width*r.height))));this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.fov=this.camera.aspect>1.9?33:this.camera.aspect<1.45?43:36;this.camera.updateProjectionMatrix();}
 save(){const key=this.mode==='detail'?this.active:this.mode==='home'?'home':this.domain;this.memory[key]={...this.rotation,zoom:this.zoom};}
 setFilter(id){if(this.mode!=='domain'||this.filters[this.domain]===id)return;this.filters[this.domain]=id;this.setView(this.mode,this.domain,this.active,true);}
 setView(mode,domain,active,force=false){if(!force&&this.mode===mode&&this.domain===domain&&this.active===active)return;this.save();this.mode=mode;this.domain=domain;this.active=active;const key=mode==='detail'?active:mode==='home'?'home':domain;const memory=this.memory[key]||{x:0,y:0,zoom:1};this.rotation={x:memory.x,y:memory.y};this.zoom=memory.zoom;
  const groups={beauty:['lipstick','serum','compact'],play:['rings','maraca','puzzle'],party:['balloon','gift']};const chosen=(groups[domain]||groups.beauty).filter(id=>!this.filters[domain]||this.filters[domain]==='all'||this.filters[domain]===id);
  this.targetPos.set(mode==='detail'?-2.1:mode==='domain'?1.6:2.75,mode==='detail'?.3:.1,0);
  for(const [id,{holder,object}]of Object.entries(this.models)){
   if(mode==='home'){holder.userData.target.copy(holder.userData.home);holder.userData.targetScale=holder.userData.scale;}
   else if(mode==='domain'){let idx=chosen.indexOf(id);holder.userData.target.set(chosen.length===1?1:idx===0?-1.9:idx===1?1:2.35,idx===1?.2:-.15,idx===0?.8:idx===1?-.2:1.1);holder.userData.targetScale=idx>=0?(chosen.length===1?1.55:idx===0?1.3:1.0):0;}
   else{holder.userData.target.set(0,0,0);holder.userData.targetScale=id===active?(id==='balloon'?1.36:1.85):0;}
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
 tick(now){if(!this.running)return;const elapsed=(now-this.start)/1000;const dt=Math.min((now-(this.lastFrame||now))/1000,.05);this.lastFrame=now;const factor=1-Math.exp(-dt*5);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.world.position.lerp(this.targetPos,factor);const sc=this.zoom;this.world.scale.lerp(new T.Vector3(sc,sc,sc),factor);
  this.world.rotation.y=lerp(this.world.rotation.y,this.rotation.y+(this.mode==='detail'?0:-.17)+(!reduced&&!this.pointers.size?this.hover.x*.08:0),factor);this.world.rotation.x=lerp(this.world.rotation.x,this.rotation.x,factor);
  for(const [id,{holder,object}]of Object.entries(this.models)){
   const target=holder.userData.target;holder.position.lerp(target,factor);const s=holder.userData.targetScale;holder.scale.lerp(new T.Vector3(s,s,s),factor);holder.visible=holder.scale.x>.005;
   if(!reduced){object.position.y=this.mode==='detail'?0:Math.sin(elapsed*.65+holder.userData.phase)*.09;object.rotation.z=this.mode==='detail'?0:Math.sin(elapsed*.32+holder.userData.phase)*.075;}
  }
  this.stage.position.x=lerp(this.stage.position.x,this.targetPos.x,factor);this.dust.rotation.y=elapsed*.004;
  if(!document.hidden){this.renderer.render(this.scene,this.camera);this.renderFrames=(this.renderFrames||0)+1;}
  this.frame=requestAnimationFrame(this.tick);
 }
 diagnostic(){return {mode:this.mode,domain:this.domain,active:this.active,rotation:{...this.rotation},zoom:this.zoom,memory:this.memory,frames:this.renderFrames,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,canvas:[this.canvas.width,this.canvas.height]};}
 destroy(){this.running=false;cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();this.canvas.removeEventListener('pointerdown',this.down);this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('pointerup',this.up);this.canvas.removeEventListener('pointercancel',this.cancel);this.canvas.removeEventListener('wheel',this.wheel);Object.values(this.models).forEach(v=>disposeProduct(v.object));this.env.dispose();this.renderer.dispose();}
}
