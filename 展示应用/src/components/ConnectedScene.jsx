import {getRenderQuality,modelDetail,applyRendererQuality,pixelRatioFor,tuneTextures} from '../../../共享组件/renderQuality.js';
import { SceneLoading } from './SceneLoading.jsx';
import { createFrameLoop } from '../../../共享组件/frameLoop.js';
import { bindScenePointer } from '../interaction/scenePointer.js';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { createCapabilityWorld } from './CapabilityWorld';
import { getLocationProfile } from './locationProfiles';
import { createHomeStoryWorld } from './HomeStoryWorld';
import { createConnectedOverviewWorld } from './ConnectedOverviewWorld';
import { createCinematicAtmosphere } from './rendering/CinematicAtmosphere';
import { loadEarthSurface, configureEarthMaterial } from './rendering/EarthSurface';
import { createDataWorkstation } from './DataWorkstation';
import {createCompanyNewsWorld} from './CompanyNewsWorld';
import {advanceMediaJourney,mediaJourneyEase} from '../media/cameraJourney';
import {createInspectionPose,homeInspection,nearestAngle} from './rendering/inspectionPose.js';
import { homeStops } from './homeStoryContent';
import {firstVisibleHit} from './rendering/visibleHit.js';
import {frameBounds,visibleBounds,turnHome} from './rendering/sceneFraming.js';

const pointOnGlobe = (lat,lng,r) => new THREE.Vector3(r*Math.cos(lat*Math.PI/180)*Math.sin(lng*Math.PI/180),r*Math.sin(lat*Math.PI/180),r*Math.cos(lat*Math.PI/180)*Math.cos(lng*Math.PI/180));
const smooth = (a,b,t) => THREE.MathUtils.lerp(a,b,t);
function curveBetween(a,b,radius) {
  const pts=[];
  for(let i=0;i<=72;i++) {const t=i/72;pts.push(a.clone().lerp(b,t).normalize().multiplyScalar(radius+Math.sin(Math.PI*t)*radius*.22));}
  return new THREE.CatmullRomCurve3(pts);
}

export function ConnectedScene({cameraRequest=0,newsMedia=null,mediaPhase='closed',onMediaStage,onNews,cinematic=false,presenting=false,overviewFocus=null,onOverviewFocus,analysisStage=null,analysisDetail=null,analysisPhase='closed',analysisSelection={path:null},onAnalysisPhase,onAnalysisSelect,globeMode='distribution',page, chapter=0, paused=false, locations,selected,onSelect,focusKey,onEnter,lang,capability=null,capabilityFocus=null,onCapability,onCapabilityFocus,storySelection,onStorySelect}) {
  const mount=useRef(null), runtime=useRef(null), latest=useRef({page,selected,onSelect,onEnter,locations});
  latest.current={cameraRequest,newsMedia,mediaPhase,onMediaStage,onNews,cinematic,presenting,overviewFocus,onOverviewFocus,analysisStage,analysisDetail,analysisPhase,analysisSelection,onAnalysisPhase,onAnalysisSelect,lang,globeMode,page,chapter,paused,selected,onSelect,onEnter,locations,capability,capabilityFocus,onCapability,onCapabilityFocus,storySelection,onStorySelect};
  const portalRefs=useRef([]),pinRefs=useRef([]),stopRefs=useRef([]),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{
    let disposed=false, renderer, announced=false, assetsReady=false, mapReady=false;
    const manager=new THREE.LoadingManager();manager.onLoad=()=>{assetsReady=true;};
    const host=mount.current,quality=getRenderQuality(),q=quality.render,globeDetail=modelDetail('globe',quality);
    try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
    renderer.setPixelRatio(1);renderer.setClearColor('#e4e2dd');renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;const applied=applyRendererQuality(renderer,THREE,quality);host.dataset.quality=JSON.stringify(applied);renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.info.autoReset=false;
    renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
    const scene=new THREE.Scene();scene.background=new THREE.Color('#e4e2dd');scene.fog=new THREE.FogExp2('#e4e2dd',.009);
    const sky=createCinematicAtmosphere(scene);scene.background=null;
    const analytics=createDataWorkstation({expanded:true});scene.add(analytics.root);analytics.root.visible=false;
    const camera=new THREE.PerspectiveCamera(40,1,.1,140);camera.position.set(0,6.5,17);
    const look=new THREE.Vector3(0,1,0);camera.lookAt(look);
    const renderTarget=new THREE.WebGLRenderTarget(1,1,{samples:applied.msaa,type:THREE.HalfFloatType});
    const composer=new EffectComposer(renderer,renderTarget);composer.addPass(new RenderPass(scene,camera));
    const ambientOcclusion=new GTAOPass(scene,camera,1,1,undefined,{radius:.85,thickness:.65,distanceExponent:1.8,samples:q.aoSamples},{radius:6,samples:8});
    const resizeAO=ambientOcclusion.setSize.bind(ambientOcclusion);ambientOcclusion.setSize=(w,h)=>resizeAO(Math.max(1,Math.round(w*q.aoScale)),Math.max(1,Math.round(h*q.aoScale)));
    const renderAO=ambientOcclusion.render.bind(ambientOcclusion);ambientOcclusion.render=(...args)=>{const glass=[];scene.traverse(o=>{if(o.isMesh&&o.visible&&o.material?.transparent){o.visible=false;glass.push(o);}});try{renderAO(...args);}finally{glass.forEach(o=>o.visible=true);}};
    ambientOcclusion.enabled=false;composer.addPass(ambientOcclusion);
    const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),q.bloom,.65,1.1);composer.addPass(bloom);const outputPass=new OutputPass();composer.addPass(outputPass);
    const pmrem=new THREE.PMREMGenerator(renderer), room=new RoomEnvironment();let env=pmrem.fromScene(room,.03);scene.environment=env.texture;scene.environmentIntensity=.6*q.environment;room.dispose();
    new HDRLoader(manager).load('/media/materials/studio.hdr',texture=>{if(disposed){texture.dispose();return;}const next=pmrem.fromEquirectangular(texture);texture.dispose();env.dispose();env=next;scene.environment=env.texture;scene.environmentIntensity=.85*q.environment;},undefined,()=>{});
    scene.add(new THREE.HemisphereLight('#dce9f4','#15233b',.38));
    const key=new THREE.DirectionalLight('#fff0d6',2.8);key.position.set(-8,10,2);key.castShadow=true;key.shadow.mapSize.set(applied.shadowMapSize,applied.shadowMapSize);Object.assign(key.shadow.camera,{left:-12,right:12,top:10,bottom:-10,near:.1,far:35});key.shadow.bias=-.0005;key.shadow.normalBias=.04;scene.add(key);
    const rim=new THREE.DirectionalLight('#9fcfff',3.5);rim.position.set(4,7,-5);scene.add(rim);
    const fill=new THREE.DirectionalLight('#bbd6ed',1.1);fill.position.set(7,3,8);scene.add(fill);
    const focusLight=new THREE.SpotLight('#f8e0bc',0,45,.42,.8,1.2);focusLight.position.set(-1,8,7);scene.add(focusLight,focusLight.target);
    const overviewWorld=createConnectedOverviewWorld(manager);host.dataset.model='brand-monument';
    const assembly=overviewWorld.root;scene.add(assembly);
    const globePlace=overviewWorld.globeSocket;
    const homeWorld=createHomeStoryWorld();scene.add(homeWorld.root);
    const newsWorld=createCompanyNewsWorld(manager);scene.add(newsWorld.root);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.ShadowMaterial({color:'#18314e',opacity:.16,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.5;floor.receiveShadow=true;scene.add(floor);
    const globeGroup=new THREE.Group();globeGroup.position.y=1.3;globePlace.add(globeGroup);
    const geoRotation=new THREE.Group();globeGroup.add(geoRotation);
    const earthMaterial=new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:.14,roughness:.65,clearcoat:.28,envMapIntensity:.55,transparent:true});
    const earth=new THREE.Mesh(new THREE.SphereGeometry(1.17,globeDetail.segment(96),globeDetail.segment(64)),earthMaterial);earth.rotation.y=-Math.PI/2;earth.castShadow=false;geoRotation.add(earth);
    loadEarthSurface(manager).then(maps=>{if(disposed){Object.values(maps).forEach(t=>t.dispose());return;}Object.values(maps).forEach(t=>t.anisotropy=applied.anisotropy);configureEarthMaterial(earthMaterial,maps);mapReady=true;}).catch(()=>{if(!disposed)setFailed(true);});
    const halo=new THREE.Mesh(new THREE.SphereGeometry(1.188,globeDetail.segment(64),globeDetail.segment(48)),new THREE.ShaderMaterial({uniforms:{journeyOpacity:{value:1}},transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 N;varying vec3 V;void main(){vec4 p=modelViewMatrix*vec4(position,1.);N=normalize(normalMatrix*normal);V=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform float journeyOpacity;varying vec3 N;varying vec3 V;void main(){float a=pow(1.-abs(dot(normalize(N),normalize(V))),3.);gl_FragColor=vec4(.35,.63,1.,a*.65*journeyOpacity);}'}));globeGroup.add(halo);
    const countryPoints=locations.map(l=>pointOnGlobe(l.lat,l.lng,1.185)), routes=[];
    countryPoints.forEach(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.013,12,8),new THREE.MeshBasicMaterial({color:'#e8f5ff'}));m.position.copy(p);geoRotation.add(m);});
    [[0,1],[0,2],[1,2]].forEach(([a,b])=>{const c=curveBetween(countryPoints[a],countryPoints[b],1.185),path=new THREE.Mesh(new THREE.TubeGeometry(c,globeDetail.segment(80),.0035,globeDetail.segment(6,'radial'),false),new THREE.MeshBasicMaterial({color:'#597598',transparent:true,opacity:.75}));geoRotation.add(path);const dot=new THREE.Mesh(new THREE.SphereGeometry(.009,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color('#fff1d8').multiplyScalar(2)}));geoRotation.add(dot);routes.push({a,b,c,dot,path});});
    const distribution=new THREE.Group();distribution.name='conceptual-product-flows';geoRotation.add(distribution);
    const flowTrails=[];
    // Broad geographic directions illustrate distribution; no endpoint claims a company site or customer.
    const destinations=[[46,-95],[30,-106],[51,-118],[35,-78],[49,8],[55,19],[44,-1],[40,28],[-27,135],[-36,151],[20,80],[1,107],[35,138],[-17,-50],[-31,22]];
    destinations.forEach(([lat,lng],i)=>{
      const c=curveBetween(countryPoints[i%2],pointOnGlobe(lat,lng,1.185),1.185);
      const points=c.getPoints(80),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:i%3===0?'#bb945e':'#709db9',transparent:true,opacity:.34,depthWrite:false}));distribution.add(line);
      const beads=[];for(let j=0;j<5;j++){const bead=new THREE.Mesh(new THREE.SphereGeometry(.007*(1-j*.11),8,6),new THREE.MeshBasicMaterial({color:i%3===0?'#e4c591':'#b7e2e9',transparent:true,opacity:1-j*.17,depthWrite:false}));distribution.add(bead);beads.push(bead);}
      flowTrails.push({c,beads});
    });
    const capabilityWorld=createCapabilityWorld(manager);scene.add(capabilityWorld.root);const raycaster=new THREE.Raycaster();
    const globeMaterials=new Map();geoRotation.traverse(o=>{if(o.material&&o!==earth){globeMaterials.set(o.material,o.material.opacity);o.material.transparent=true;}});
    const s={inspection:createInspectionPose(),overviewYaw:0,overviewTilt:0,elapsed:0,ambientMix:0,savedPose:null,focusMix:0,focusedIndex:null,interactedAt:performance.now(),analysisMix:0,capabilityMix:0,homeMix:page==='locations'?1:0,storyMix:0,newsMix:0,mediaTravel:0,analysisTravel:0,newsYaw:0,targetNewsYaw:0,newsTilt:0,targetNewsTilt:0,homeYaw:0,targetHomeYaw:0,homeTilt:0,targetHomeTilt:0,homeVelocity:0,yaw:0,targetYaw:0,tilt:0,targetTilt:0,earthY:-104*Math.PI/180,targetEarthY:-104*Math.PI/180,earthX:.3,targetEarthX:.3,drag:null,moved:false,velocityX:0,velocityY:0,geoRotation,assembly};runtime.current=s;
    const resize=()=>{const w=host.clientWidth,h=host.clientHeight;const ratio=pixelRatioFor(w,h,devicePixelRatio,q,renderer.capabilities.maxTextureSize);renderer.setPixelRatio(ratio);composer.setPixelRatio(ratio);renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();host.dataset.renderScale=ratio.toFixed(2);host.dataset.renderPixels=`${renderer.domElement.width}×${renderer.domElement.height}`;};const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
    const gestures=bindScenePointer(host,{
      includeControls:true,claimClick:true,
      enabled:()=>!latest.current.paused&&(latest.current.page!=='analytics'||latest.current.analysisPhase==='closed'),
      onStart:(_event,gesture)=>{host.dataset.gestureState='held';host.dataset.pointerType=_event.pointerType;host.dataset.gestureMoves='0';s.interactedAt=performance.now();s.drag=gesture;s.velocityX=0;s.velocityY=0;s.homeVelocity=0;},
      onMove:(_event,{dx,dy,elapsed,gesture})=>{
        host.dataset.gestureState='dragging';host.dataset.gestureMoves=String(Number(host.dataset.gestureMoves)+1);host.dataset.gestureDelta=`${dx},${dy}`;
        if(latest.current.capability){capabilityWorld.drag(dx,dy);}else if(latest.current.page==='locations'){s.targetEarthY+=dx*.006;s.targetEarthX=THREE.MathUtils.clamp(s.targetEarthX+dy*.004,-.9,.9);s.velocityX=THREE.MathUtils.clamp(dx/elapsed*.006,-.009,.009);s.velocityY=THREE.MathUtils.clamp(dy/elapsed*.004,-.004,.004);}else if(latest.current.page==='home'&&latest.current.chapter===4){s.targetNewsYaw=THREE.MathUtils.clamp(s.targetNewsYaw+dx*.002,-.7,.7);s.targetNewsTilt=THREE.MathUtils.clamp(s.targetNewsTilt+dy*.002,-.3,.3);}else if(latest.current.page==='home'&&(latest.current.chapter>0||latest.current.overviewFocus!==null)){s.inspection.drag(dx,dy,host.clientWidth,host.clientHeight);}else if(latest.current.page==='home'){const turn=turnHome({yaw:s.targetHomeYaw,tilt:s.targetHomeTilt},dx,dy,host.clientWidth,host.clientHeight);s.homeVelocity=THREE.MathUtils.clamp((turn.yaw-s.targetHomeYaw)/elapsed,-.004,.004);s.targetHomeYaw=turn.yaw;s.targetHomeTilt=turn.tilt;}else{s.targetYaw=THREE.MathUtils.clamp(s.targetYaw+dx*.002,-.38,.38);s.targetTilt=THREE.MathUtils.clamp(s.targetTilt+dy*.001,-.12,.12);}
        s.drag=gesture;
      },
      onEnd:({cancelled})=>{host.dataset.gestureState=cancelled?'cancelled':'released';s.drag=null;if(cancelled){s.homeVelocity=0;s.velocityX=0;s.velocityY=0;}},
      onTap:(e,gesture)=>{
      const control=gesture.target.closest?.('button');
      if(control&&host.contains(control)){
        const r=control.getBoundingClientRect();
        if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&!control.disabled&&control.getAttribute('aria-hidden')!=='true')control.click();
        return;
      }
      if(latest.current.page==='home'&&s.homeMix<.03){
        const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
        if(latest.current.chapter===4){const mode=newsWorld.pick(raycaster);if(mode)latest.current.onNews(mode);}
        const index=latest.current.chapter===4?null:latest.current.chapter===0?(s.storyMix<.03?overviewWorld.pick(raycaster):null):(s.storyMix>.97?homeWorld.pick(raycaster,latest.current.chapter,latest.current.storySelection):null);if(index!==null)latest.current.onStorySelect(index);else if(latest.current.chapter===0)latest.current.onOverviewFocus(null);
      }
      if(latest.current.capability&&s.capabilityMix>.97){
        const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
        const hit=raycaster.intersectObjects(capabilityWorld.interactive,false).find(h=>latest.current.capability==='overview'||h.object.userData.chapter===latest.current.capability);
        if(hit){const obstruction=raycaster.intersectObjects(capabilityWorld.occluders,false)[0];if(!obstruction||obstruction.distance>hit.distance-.05){if(latest.current.capability==='overview')latest.current.onCapability(hit.object.userData.chapter);else latest.current.onCapabilityFocus(hit.object.userData.exhibit);}}
      }
      if(latest.current.page==='analytics'){
        const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);
        const hit=firstVisibleHit(raycaster.intersectObject(analytics.root,true));let target=hit?.object;while(target&&target.userData.analysisStep===undefined)target=target.parent;
        if(target)latest.current.onAnalysisSelect(target.userData.analysisStep);
      }
      },
    });
    s.gestures=gestures;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let measureAt=performance.now(),frames=0;
    const screenPoint=(p,element,visible=true)=>{if(!element)return;const projected=p.project(camera);element.style.transform=`translate(-50%,-50%) translate(${(projected.x*.5+.5)*host.clientWidth}px,${(-projected.y*.5+.5)*host.clientHeight}px)`;element.style.opacity=visible?1:0;element.style.pointerEvents=visible?'auto':'none';element.tabIndex=visible?0:-1;element.setAttribute('aria-hidden',String(!visible));};
    function animate(now,dt){s.elapsed+=dt;const sceneTime=s.elapsed*1000;const k=reduced?1:1-Math.exp(-dt*3.5),global=latest.current.page==='locations';s.homeMix=smooth(s.homeMix,global?1:0,k);s.storyMix=smooth(s.storyMix,!global&&latest.current.page==='home'&&latest.current.chapter>0&&latest.current.chapter<4?1:0,k);const isNews=latest.current.page==='home'&&latest.current.chapter===4;s.newsMix=smooth(s.newsMix,isNews?1:0,k);const newsMix=s.newsMix,m=s.homeMix,story=s.storyMix;const inCapability=global&&!!latest.current.capability;s.capabilityMix=smooth(s.capabilityMix,inCapability?1:0,reduced?1:1-Math.exp(-dt*2.5));const journey=s.capabilityMix;
      s.cinemaMix=smooth(s.cinemaMix||0,latest.current.cinematic?1:0,reduced?1:1-Math.exp(-dt*(latest.current.cinematic?.72:2.8)));
      s.cinemaTime=(s.cinemaTime||0)+(latest.current.cinematic?dt:0);
      if(s.cinemaMix<.001)s.cinemaTime=0;
      const cinemaYaw=reduced?0:Math.sin(s.cinemaTime*.09)*.26*s.cinemaMix;
      const cinemaTilt=reduced?0:Math.sin(s.cinemaTime*.065)*.06*s.cinemaMix;
      const isAnalysis=latest.current.page==='analytics';s.analysisMix=smooth(s.analysisMix,isAnalysis?1:0,k);const aMix=s.analysisMix;
      capabilityWorld.root.visible=journey>.003;
      if(journey>.003&&Math.abs(journey-(inCapability?1:0))>.0002){key.shadow.camera.left=-24;key.shadow.camera.right=24;key.shadow.camera.top=16;key.shadow.camera.bottom=-16;key.shadow.camera.far=70;key.shadow.camera.updateProjectionMatrix();renderer.shadowMap.needsUpdate=true;}
      if(!s.drag&&!reduced){s.targetEarthY+=s.velocityX*dt*1000;s.targetEarthX=THREE.MathUtils.clamp(s.targetEarthX+s.velocityY*dt*1000,-.9,.9);s.velocityX*=Math.exp(-dt*6);s.velocityY*=Math.exp(-dt*6);}
      if(Math.abs(s.targetHomeYaw-s.homeYaw)+Math.abs(s.targetHomeTilt-s.homeTilt)+Math.abs(s.targetYaw-s.yaw)+Math.abs(s.targetTilt-s.tilt)>.0001||Math.abs(s.homeMix-(global?1:0))>.0001||Math.abs(story-(!global&&latest.current.page==='home'&&latest.current.chapter>0?1:0))>.0001)renderer.shadowMap.needsUpdate=true;
      if((global&&latest.current.globeMode==='distribution'||latest.current.page==='home'&&latest.current.chapter===0)&&!s.drag&&!reduced&&now-s.interactedAt>5000)s.targetEarthY+=dt*.026;
      if(!s.drag&&!reduced&&latest.current.page==='home'&&latest.current.chapter===0&&latest.current.overviewFocus===null&&!latest.current.presenting){s.targetHomeYaw+=s.homeVelocity*dt*1000;s.homeVelocity*=Math.exp(-dt*9);}
      s.homeYaw=smooth(s.homeYaw,s.targetHomeYaw,k);s.homeTilt=smooth(s.homeTilt,s.targetHomeTilt,k);
      s.yaw=smooth(s.yaw,s.targetYaw,k);s.tilt=smooth(s.tilt,s.targetTilt,k);
      const inspection=latest.current.page==='home'?homeInspection(latest.current.chapter,latest.current.storySelection,latest.current.overviewFocus):null;
      if(inspection)s.homeVelocity=0;
      const inspected=s.inspection.update(inspection,latest.current.cameraRequest,dt,reduced,latest.current.chapter===0?{yaw:s.homeYaw,tilt:s.homeTilt}:undefined);
      if(Math.abs(inspected.yaw-(s.lastInspectedYaw??inspected.yaw))+Math.abs(inspected.tilt-(s.lastInspectedTilt??inspected.tilt))>.0001)renderer.shadowMap.needsUpdate=true;
      s.lastInspectedYaw=inspected.yaw;s.lastInspectedTilt=inspected.tilt;
      const overviewTarget=latest.current.chapter===0&&inspection?inspected:{yaw:s.homeYaw,tilt:s.homeTilt};
      s.overviewYaw=smooth(s.overviewYaw,nearestAngle(s.overviewYaw,overviewTarget.yaw),k);s.overviewTilt=smooth(s.overviewTilt,overviewTarget.tilt,k);
      host.dataset.inspection=inspection?.key||'free';host.dataset.inspectionYaw=inspected.yaw.toFixed(4);host.dataset.inspectionTilt=inspected.tilt.toFixed(4);host.dataset.overviewYaw=s.homeYaw.toFixed(4);
      overviewWorld.update({mix:m,story:Math.max(story,aMix,newsMix),journey,yaw:s.overviewYaw+cinemaYaw,tilt:s.overviewTilt+cinemaTilt,time:sceneTime,reduced,focus:latest.current.overviewFocus,dt});
      const earthFade=1-THREE.MathUtils.smoothstep(journey,.08,.68);earthMaterial.opacity=earthFade;halo.material.uniforms.journeyOpacity.value=earthFade;globeMaterials.forEach((opacity,material)=>{material.opacity=opacity*earthFade;});
      s.earthY=smooth(s.earthY,s.targetEarthY,k);s.earthX=smooth(s.earthX,s.targetEarthX,k);geoRotation.rotation.set(s.earthX,s.earthY,0);
      const homeView=homeWorld.update({chapter:Math.min(3,latest.current.chapter),selection:latest.current.storySelection,mix:m,reveal:story,dt,time:sceneTime,reduced,aspect:camera.aspect,yaw:inspected.yaw+cinemaYaw,tilt:inspected.tilt+cinemaTilt});
      homeWorld.root.visible=homeWorld.root.visible&&aMix<.8&&newsMix<.8;
      s.newsYaw=smooth(s.newsYaw,s.targetNewsYaw,k);s.newsTilt=smooth(s.newsTilt,s.targetNewsTilt,k);
      newsWorld.update({mix:newsMix,time:s.elapsed,reduced,yaw:s.newsYaw+cinemaYaw,tilt:s.newsTilt});
      if(homeView.changed)renderer.shadowMap.needsUpdate=true;
      if(journey>.97&&!reduced&&sceneTime-(s.shadowTick||0)>120){renderer.shadowMap.needsUpdate=true;s.shadowTick=sceneTime;}
      camera.position.set(0,6.5,Math.max(camera.aspect<1.5?20:17,27/camera.aspect)).lerp(homeView.position,story).lerp(new THREE.Vector3(0,3.2,camera.aspect<1.5?20:17),m);look.set(0,1,0).lerp(homeView.look,story).lerp(new THREE.Vector3(0,.55,0),m);
      const focusIndex=latest.current.overviewFocus;
      const focused=latest.current.page==='home'&&latest.current.chapter===0&&focusIndex!==null;
      if(focused)s.focusedIndex=focusIndex;
      if(Math.abs(s.focusMix-(focused?1:0))>.001)renderer.shadowMap.needsUpdate=true;
      s.focusMix=smooth(s.focusMix,focused?1:0,k);
      // Keep the selected subject inside the model area at every rotation.
      // Measure the existing UI, so the frame also respects compact/4K layouts.
      if((1-m)*(1-aMix)>.01){
        const width=host.clientWidth,height=host.clientHeight,hostRect=host.getBoundingClientRect();
        const reading=host.parentElement.querySelector('.company-story')?.getBoundingClientRect();
        const bar=host.parentElement.querySelector('.system-bar')?.getBoundingClientRect();
        const caption=host.parentElement.querySelector('.home-scene-caption')?.getBoundingClientRect();
        const bottom=Math.min(.84,bar?(bar.top-hostRect.top-26)/height:.84);
        const overviewBounds=overviewWorld.bounds();
        if(!overviewBounds.isEmpty()){
          const overviewView=frameBounds(overviewBounds,{aspect:camera.aspect,frame:{left:.05,right:.95,top:.18,bottom},direction:new THREE.Vector3(.12,.52,1),minimumDistance:18});
          camera.position.lerp(overviewView.position,(1-m)*(1-story)*(1-aMix));
          look.lerp(overviewView.look,(1-m)*(1-story)*(1-aMix));
        }
        const left=Math.max(latest.current.chapter>0?.47:.40,reading?(reading.right-hostRect.left+28)/width:.40);
        if(s.focusMix>.001&&s.focusedIndex!==null){
          const bounds=overviewWorld.bounds(s.focusedIndex);
          if(!bounds.isEmpty()){
            const view=frameBounds(bounds,{aspect:camera.aspect,frame:{left,right:.94,top:.20,bottom:Math.min(bottom,.80)},direction:new THREE.Vector3(0,.40,1)});
            if(!s.focusView||s.focusView.index===s.focusedIndex){s.focusView={...view,index:s.focusedIndex};}
            else{s.focusView.position.lerp(view.position,k);s.focusView.look.lerp(view.look,k);if(s.focusView.position.distanceTo(view.position)<.03)s.focusView.index=s.focusedIndex;}
            camera.position.lerp(s.focusView.position,s.focusMix*(1-m)*(1-story)*(1-aMix));
            look.lerp(s.focusView.look,s.focusMix*(1-m)*(1-story)*(1-aMix));
            const lightTarget=bounds.getCenter(new THREE.Vector3());focusLight.target.position.copy(lightTarget);focusLight.position.copy(lightTarget).add(new THREE.Vector3(-3,8,5));
          }
        }
        if(story>.02){
          const bounds=homeWorld.bounds();
          if(!bounds.isEmpty()){
            const view=frameBounds(bounds,{aspect:camera.aspect,frame:{left,right:.955,top:.21,bottom:Math.min(.72,caption?(caption.top-hostRect.top-20)/height:.72)},direction:homeView.position.clone().sub(homeView.look)});
            camera.position.lerp(view.position,story*(1-m)*(1-aMix));look.lerp(view.look,story*(1-m)*(1-aMix));
          }
        }
      }
      focusLight.intensity=smooth(focusLight.intensity,focused?16:0,k);
      host.dataset.focusMix=s.focusMix.toFixed(3);
      analytics.root.visible=aMix>.002;
      analytics.root.position.set(4.0,-.45,0);analytics.root.scale.setScalar(Math.max(.001,aMix*1.48));analytics.root.rotation.y=-.12+s.yaw+cinemaYaw*.65;
      if(aMix>.002&&(latest.current.analysisPhase!=='open'||(s.analysisOpenTime||0)<.65))analytics.update(s.elapsed,latest.current.analysisStage??0,dt,reduced,latest.current.analysisDetail,latest.current.analysisSelection,latest.current.lang);
      if(aMix>.002){camera.position.lerp(new THREE.Vector3(0,5.7,Math.max(17,24/camera.aspect)),aMix);look.lerp(new THREE.Vector3(0,1.4,0),aMix);if(Math.abs(aMix-(isAnalysis?1:0))>.0001)renderer.shadowMap.needsUpdate=true;}
      host.dataset.analysisShape=String(analytics.root.userData.analysisStep);host.dataset.analysisStage=String(latest.current.analysisStage);host.dataset.analysisReveal=aMix.toFixed(3);host.dataset.globeMode=latest.current.globeMode;
      host.dataset.overview=String(latest.current.page==='home'&&latest.current.chapter===0);host.dataset.storyReveal=story.toFixed(3);
      host.dataset.story=String(latest.current.chapter);host.dataset.storySelection=JSON.stringify(latest.current.storySelection);host.dataset.growth=(homeView.growth||0).toFixed(3);
      const roomView=capabilityWorld.update({locationId:latest.current.selected,chapter:latest.current.capability||'overview',focus:latest.current.capabilityFocus,mix:journey,dt,time:sceneTime,reduced,aspect:camera.aspect});
      if(journey>.003){camera.position.lerp(roomView.position.clone().add(new THREE.Vector3(0,-1.9,0)),journey);look.lerp(roomView.look.clone().add(new THREE.Vector3(0,-1.9,0)),journey);}
      if(newsMix>.003){const view=frameBounds(newsWorld.bounds(),{aspect:camera.aspect,frame:{left:.41,right:.95,top:.20,bottom:.79},direction:new THREE.Vector3(.06,.32,1)});camera.position.lerp(view.position,newsMix);look.lerp(view.look,newsMix);renderer.shadowMap.needsUpdate=true;}
      if(s.cinemaMix>.001){
        // Full-wall framing is derived from the live model, never from a CSS zoom.
        // The cinematic pose is a render offset; the visitor's orientation is retained.
        const frame={left:.075,right:.925,top:.095,bottom:.885};
        let bounds,direction=new THREE.Vector3(.08, .34, 1);
        if(global&&journey>.7){
          bounds=capabilityWorld.bounds(latest.current.capability);direction.copy(roomView.position).sub(roomView.look);
          if(!reduced)direction.x+=Math.sin(s.cinemaTime*.07)*2.2;
        }else if(global){bounds=visibleBounds([globeGroup]);direction.set(.04,.13,1);}
        else if(isAnalysis){bounds=visibleBounds([analytics.root]);direction.set(.06,.24,1);}
        else if(isNews){bounds=newsWorld.bounds();direction.set(.08,.3,1);}
        else if(latest.current.chapter>0){bounds=homeWorld.bounds();direction.copy(homeView.position).sub(homeView.look);}
        else bounds=overviewWorld.bounds(focused?focusIndex:null);
        if(bounds&&!bounds.isEmpty()){
          let view=frameBounds(bounds,{aspect:camera.aspect,fov:camera.fov,frame,direction});
          if(global&&journey<.7){
            // A sphere's empty box corners should not make the globe tiny on a wall.
            const center=earth.getWorldPosition(new THREE.Vector3()),radius=1.17*earth.getWorldScale(new THREE.Vector3()).x;
            const extent=Math.min(.74,camera.aspect*.80),angle=Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5)*extent);
            view={look:center,position:center.clone().addScaledVector(direction.clone().normalize(),radius/Math.sin(angle))};
          }
          if(!s.cinemaView)s.cinemaView=view;
          else {s.cinemaView.position.lerp(view.position,reduced?1:1-Math.exp(-dt*1.45));s.cinemaView.look.lerp(view.look,reduced?1:1-Math.exp(-dt*1.45));}
          camera.position.lerp(s.cinemaView.position,s.cinemaMix);look.lerp(s.cinemaView.look,s.cinemaMix);
        }
        renderer.shadowMap.needsUpdate=true;
      }else s.cinemaView=null;
      host.dataset.cinematic=s.cinemaMix.toFixed(3);
      floor.position.y=smooth(-2.5,-.12,story*(1-m));scene.background=null;sky.update(s.elapsed,camera.aspect,reduced,m,journey,story,s.yaw);scene.fog.color.set('#122b3f');scene.fog.density=smooth(.006,.004,journey);key.intensity=smooth(2.8,2.3,journey);rim.intensity=smooth(3.5,2.6,journey);bloom.strength=smooth(q.bloom,q.bloom*.59,journey);bloom.enabled=q.bloom>0;ambientOcclusion.enabled=q.ao&&journey>.8&&latest.current.capability!=='overview';ambientOcclusion.blendIntensity=.65*THREE.MathUtils.smoothstep(journey,.8,1);host.dataset.contactShadow=String(ambientOcclusion.enabled);
      const calm=!s.drag&&!reduced&&(!inspection||latest.current.cinematic)&&now-s.interactedAt>4500;
      s.ambientMix=smooth(s.ambientMix,calm?1:0,1-Math.exp(-dt*2));
      camera.position.x+=Math.sin(s.elapsed*.16)*.14*s.ambientMix;
      camera.position.y+=Math.sin(s.elapsed*.11)*.065*s.ambientMix;
      camera.position.z+=Math.sin(s.elapsed*.09)*.10*s.ambientMix;
      host.dataset.ambient=s.ambientMix.toFixed(3);host.dataset.sceneTime=s.elapsed.toFixed(2);
      // Move the real camera onto the TV surface before the DOM player appears.
      // The target comes from the actual player rectangle, so the two images align.
      const media=latest.current.newsMedia,mediaPhase=latest.current.mediaPhase;
      if(media&&mediaPhase==='approaching'&&newsMix>.94&&!s.mediaSession){
        const panel=host.closest('.showroom').querySelector(media.arrival==='films'?'.film-screen':'.publication-cover');
        if(panel){const r=panel.getBoundingClientRect(),h=host.getBoundingClientRect(),border=panel.clientLeft;s.mediaFrame={left:(r.left-h.left+border)/h.width,right:(r.right-h.left-border)/h.width,top:(r.top-h.top+border)/h.height,bottom:(r.bottom-h.top-border)/h.height};s.mediaFrom={position:camera.position.clone(),look:look.clone()};s.mediaSession=true;s.mediaReturnDelay=0;}
      }
      if(s.mediaSession){
        if(media&&mediaPhase==='approaching')s.mediaTarget=newsWorld.mediaView(media.arrival,camera.aspect,s.mediaFrame);
        // Let the player dissolve onto the same screen before withdrawing.
        if(mediaPhase==='returning')s.mediaReturnDelay+=dt;
        if(mediaPhase!=='returning'||reduced||s.mediaReturnDelay>=.65)s.mediaTravel=advanceMediaJourney(s.mediaTravel,mediaPhase,dt,reduced);
        if(s.mediaTarget){const easing=mediaJourneyEase(s.mediaTravel);camera.position.lerpVectors(s.mediaFrom.position,s.mediaTarget.position,easing);look.lerpVectors(s.mediaFrom.look,s.mediaTarget.look,easing);}
        if(s.mediaTravel===1&&mediaPhase==='approaching')latest.current.onMediaStage('open');
        if(s.mediaTravel===0){s.mediaSession=false;s.mediaTarget=null;if(mediaPhase==='returning')latest.current.onMediaStage('closed');}
      }
      newsWorld.setVideo(media?.arrival==='films'?host.closest('.showroom').querySelector('.media-theatre video'):null);
      host.dataset.newsReveal=newsMix.toFixed(3);host.dataset.mediaTravel=s.mediaTravel.toFixed(3);
      // A real camera approaches the display. The graph then takes over its aperture.
      // Returning reveals that same screen before pulling back to the saved view.
      if(isAnalysis){
        const phase=latest.current.analysisPhase;
        s.analysisOpenTime=phase==='open'?(s.analysisOpenTime||0)+dt:0;
        s.analysisReturnDelay=phase==='returning'?(s.analysisReturnDelay||0)+dt:0;
        if(phase==='closed'){s.analysisTravel=0;s.analysisSession=null;}
        else if(aMix>.97){
          const panel=host.closest('.showroom').querySelector('.analysis-visual');
          if(panel){
            const r=panel.getBoundingClientRect(),h=host.getBoundingClientRect();
            const frame={left:(r.left-h.left)/h.width,right:(r.right-h.left)/h.width,top:(r.top-h.top)/h.height,bottom:(r.bottom-h.top)/h.height};
            if(!s.analysisSession)s.analysisSession={position:camera.position.clone(),look:look.clone()};
            const target=analytics.screenView(camera.aspect,frame);
            if(phase!=='returning'||reduced||s.analysisReturnDelay>.45)s.analysisTravel=phase==='open'?1:advanceMediaJourney(s.analysisTravel,phase,dt,reduced);
            const amount=mediaJourneyEase(s.analysisTravel);
            camera.position.lerpVectors(s.analysisSession.position,target.position,amount);look.lerpVectors(s.analysisSession.look,target.look,amount);
            if(s.analysisTravel===1&&phase==='approaching')latest.current.onAnalysisPhase?.('open');
            if(s.analysisTravel===0&&phase==='returning'){s.analysisSession=null;latest.current.onAnalysisPhase?.('closed');}
          }
        }
        analytics.root.visible=aMix>.002&&(phase!=='open'||s.analysisOpenTime<.65);
      }else{s.analysisTravel=0;s.analysisSession=null;}
      host.dataset.analysisPhase=latest.current.analysisPhase;host.dataset.analysisTravel=s.analysisTravel.toFixed(3);
      camera.lookAt(look);scene.updateMatrixWorld();
      const stops=getLocationProfile(latest.current.selected).stops[latest.current.capability]||[],occupied=[];
      stops.forEach((stop,i)=>{
        const element=stopRefs.current[i],point=capabilityWorld.worldPoint(stop.point),projected=point.clone().project(camera);
        const px=(projected.x*.5+.5)*host.clientWidth,py=(-projected.y*.5+.5)*host.clientHeight,half=(element?.offsetWidth||130)/2;
        const rectangle={left:px-half-5,right:px+half+5,top:py-30,bottom:py+30};
        let safe=rectangle.left>host.clientWidth*.03&&rectangle.right<host.clientWidth*.648&&rectangle.top>host.clientHeight*.23&&rectangle.bottom<host.clientHeight*.75&&projected.z<1;
        if(safe){raycaster.set(camera.position,point.clone().sub(camera.position).normalize());const obstruction=raycaster.intersectObjects(capabilityWorld.occluders,false)[0];safe=!obstruction||obstruction.distance>camera.position.distanceTo(point)-.15;}
        if(safe)safe=!occupied.some(r=>rectangle.left<r.right&&rectangle.right>r.left&&rectangle.top<r.bottom&&rectangle.bottom>r.top);
        if(safe)occupied.push(rectangle);
        screenPoint(point,element,inCapability&&journey>.97&&safe);
      });
      host.dataset.locationProfile=capabilityWorld.root.userData.locationId;host.dataset.returning=String(!inCapability&&journey>.025);host.dataset.capability=latest.current.capability||'globe';host.dataset.journey=journey.toFixed(3);host.dataset.camera=camera.position.toArray().map(n=>n.toFixed(2)).join(',');
      const homeOccupied=[];
      const activeStop=latest.current.chapter===1?latest.current.storySelection.detail:latest.current.chapter===2?latest.current.storySelection.company:latest.current.chapter===3?latest.current.storySelection.year:-1;
      homeStops(latest.current.chapter,latest.current.storySelection).sort((a,b)=>a.index===activeStop?-1:b.index===activeStop?1:0).forEach(stop=>{
        const i=stop.index;
        const prelude=latest.current.chapter===0,point=prelude?overviewWorld.point(i):homeWorld.point(i),projected=point.clone().project(camera),element=portalRefs.current[i];
        const px=(projected.x*.5+.5)*host.clientWidth,py=(-projected.y*.5+.5)*host.clientHeight,w=element?.offsetWidth||130,h=element?.offsetHeight||52;
        const r={left:px-w/2,right:px+w/2,top:py-h/2,bottom:py+h/2};
        let safe=r.left>host.clientWidth*(prelude?.03:.465)&&r.right<host.clientWidth*.974&&r.top>host.clientHeight*(prelude?.145:.2)&&r.bottom<host.clientHeight*.755&&projected.z<1;
        if(safe&&prelude){const reading=host.parentElement.querySelector('.story-page')?.getBoundingClientRect(),bounds=host.getBoundingClientRect();if(reading)safe=!(r.left<reading.right-bounds.left+12&&r.right>reading.left-bounds.left-12&&r.top<reading.bottom-bounds.top+12&&r.bottom>reading.top-bounds.top-12);}
        if(safe&&prelude){raycaster.set(camera.position,point.clone().sub(camera.position).normalize());safe=!overviewWorld.occluded(raycaster,point,i);}
        if(safe)safe=!homeOccupied.some(a=>r.left<a.right+8&&r.right>a.left-8&&r.top<a.bottom+8&&r.bottom>a.top-8);
        if(safe)homeOccupied.push(r);
        screenPoint(point,element,!global&&m<.03&&(prelude?story<.03:story>.97)&&latest.current.page==='home'&&(latest.current.chapter!==3||i<=latest.current.storySelection.year)&&safe);
      });
      countryPoints.forEach((p,i)=>{const world=p.clone().applyMatrix4(geoRotation.matrixWorld),normal=p.clone().normalize().transformDirection(geoRotation.matrixWorld);screenPoint(world,pinRefs.current[i],global&&latest.current.globeMode==='network'&&m>.9&&journey<.02&&normal.dot(camera.position.clone().sub(world).normalize())>.12);});
      distribution.visible=global&&journey<.65&&latest.current.globeMode==='distribution';
      flowTrails.forEach(({c,beads},i)=>beads.forEach((bead,j)=>bead.position.copy(c.getPointAt(((reduced?i*.11:sceneTime*globeDetail.motionScale*.000018+i*.137)-j*.012+2)%1))));
      const selectedIndex=locations.findIndex(l=>l.id===latest.current.selected);
      routes.forEach(({a,b,c,dot,path},i)=>{
        const active=(selectedIndex===2?a===1&&b===2:a===0&&b===1);
        path.material.color.set(active?'#9bc9e5':'#67809b').multiplyScalar(active?1.6:1);
        path.material.opacity=(active?.85:.18)*earthFade;
        dot.material.color.set(active?'#ffe1ac':'#c3dcea').multiplyScalar(active?3.2:1);
        dot.scale.setScalar(active?1.65:.65);
        dot.position.copy(c.getPointAt((reduced?.55:sceneTime*.00007+i*.3)%1));
      });
      renderer.info.reset();composer.render();host.dataset.rotation=s.earthY.toFixed(3);host.dataset.phase=m.toFixed(3);if(!announced&&!disposed&&assetsReady&&mapReady){announced=true;host.dataset.ready='true';setReady(true);}frames++;if(now-measureAt>2000){host.dataset.fps=(frames*1000/(now-measureAt)).toFixed(0);host.dataset.triangles=renderer.info.render.triangles;measureAt=now;frames=0;}
    }
    tuneTextures(scene,applied.anisotropy);
    const loop=createFrameLoop({render:animate});s.loop=loop;
    const visibility=()=>{loop.setVisible(!document.hidden);if(document.hidden)gestures.cancel();};
    document.addEventListener('visibilitychange',visibility);visibility();loop.setActive(!latest.current.paused);
    const lost=e=>{e.preventDefault();loop.setActive(false);gestures.cancel();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
    return()=>{disposed=true;overviewWorld.dispose();newsWorld.dispose();sky.dispose();loop.dispose();gestures.dispose();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(x=>materials.add(x));});materials.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());env.dispose();pmrem.dispose();ambientOcclusion.dispose();bloom.dispose();outputPass.dispose();composer.dispose();renderer.dispose();renderer.domElement.remove();runtime.current=null;};
  },[]);
  useEffect(()=>{const s=runtime.current;if(!s)return;s.loop.setActive(!paused);if(paused)s.gestures.cancel();},[paused]);
  useEffect(()=>{runtime.current?.gestures.cancel();},[page,chapter,capability,cameraRequest]);
  useEffect(()=>{const s=runtime.current,l=locations.find(l=>l.id===selected);if(!s||!l)return;s.interactedAt=performance.now();s.velocityX=0;s.velocityY=0;const target=-l.lng*Math.PI/180;s.targetEarthY=s.earthY+Math.atan2(Math.sin(target-s.earthY),Math.cos(target-s.earthY));s.targetEarthX=l.lat*Math.PI/180*.7;},[selected,focusKey,locations]);
  useEffect(()=>{const s=runtime.current;if(!s)return;
    const keys=['targetYaw','targetTilt','targetHomeYaw','targetHomeTilt','targetEarthY','targetEarthX'];
    if(presenting){s.savedInspection=s.inspection.snapshot();s.savedPose=Object.fromEntries(keys.map(k=>[k,s[k]]));s.targetYaw=0;s.targetTilt=0;s.targetHomeYaw=s.homeYaw+Math.atan2(Math.sin(-s.homeYaw),Math.cos(-s.homeYaw));s.targetHomeTilt=0;s.homeVelocity=0;}
    else if(s.savedPose){if(s.savedInspection){s.inspection.restore(s.savedInspection);s.savedInspection=null;}Object.assign(s,s.savedPose);s.targetHomeYaw=s.homeYaw+Math.atan2(Math.sin(s.targetHomeYaw-s.homeYaw),Math.cos(s.targetHomeYaw-s.homeYaw));s.savedPose=null;s.homeVelocity=0;s.velocityX=0;s.velocityY=0;s.interactedAt=performance.now();}
  },[presenting]);
  const portals=homeStops(chapter,storySelection);
  return <div ref={mount} className={`connected-scene ${ready?'ready':''} ${!['home','locations','analytics'].includes(page)?'is-dormant':''}`} data-testid="connected-scene" data-media-phase={mediaPhase} aria-label={lang==='zh'?'可拖动的公司三维世界':'Draggable company world'}>
    {page==='home'&&portals.map(({index,name},i)=><button ref={el=>portalRefs.current[i]=el} key={`${chapter}-${index}`} className={`home-scene-node ${chapter===0?'overview-node':''} ${chapter===0&&overviewFocus===index?'is-selected':''} ${(chapter===1?storySelection.detail:chapter===2?storySelection.company:chapter===3?storySelection.year:-1)===index?'active':''}`} aria-label={name[lang==='zh'?0:1]} onClick={()=>onStorySelect(index)} aria-pressed={chapter===0?overviewFocus===index:undefined}><span className="home-node-number">{String(i+1).padStart(2,'0')}</span><span>{name[lang==='zh'?0:1]}</span></button>)}
    {page==='locations'&&locations.map((l,i)=><button ref={el=>pinRefs.current[i]=el} key={l.id} className={`globe-pin ${selected===l.id?'selected':''}`} onClick={()=>onSelect(l.id)} aria-label={`${lang==='zh'?'定位':'Locate'} ${l.name[lang==='zh'?0:1]}`}><i/><span>{l.name[lang==='zh'?0:1]}</span></button>)}
    {page==='locations'&&capability&&(getLocationProfile(selected).stops[capability]||[]).map((stop,i)=><button ref={el=>stopRefs.current[i]=el} key={`${selected}-${stop.id}`} className={`scene-stop ${capabilityFocus===stop.id?'active':''}`} aria-label={stop.name[lang==='zh'?0:1]} aria-pressed={capabilityFocus===stop.id} onClick={()=>stop.chapter?onCapability(stop.chapter):onCapabilityFocus(capabilityFocus===stop.id?null:stop.id)}><i aria-hidden="true"/><span>{stop.name[lang==='zh'?0:1]}</span></button>)}
    {!ready&&!failed&&<SceneLoading lang={lang}/>}
    {failed&&<div className="scene-error">{lang==='zh'?'场景加载遇到问题':'The scene could not load'}<button onClick={()=>location.reload()}>{lang==='zh'?'重新加载':'Reload'}</button></div>}
  </div>;
}
