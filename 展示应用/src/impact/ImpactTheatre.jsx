import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ArrowLeft,ArrowRight,Play,Pause,CornersOut} from '@phosphor-icons/react';
import {createFrameLoop} from '../../../共享组件/frameLoop.js';
import {getRenderQuality,applyRendererQuality,pixelRatioFor,tuneTextures} from '../../../共享组件/renderQuality.js';
import {createStarOceanAtmosphere} from '../../../共享组件/spaceAtmosphere.js';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {chapterSwipeDirection} from '../interaction/chapterSwipe.js';
import {createImpactWorlds,disposeTree} from './worlds.js';
import {impactMoments,advanceMoment,momentDuration,reelEntries,wrapReel,automaticReelPosition,settleReel,isReelMoment,reelDwell} from './content.js';
import {DepthExperience} from './DepthExperience.jsx';
import {IntelligenceExperience} from './IntelligenceExperience.jsx';
import {intelligenceStages} from './intelligenceContent.js';
import {createIntelligenceDirector} from './intelligenceDirector.js';
import {intelligencePresentation} from './intelligenceTimeline.js';
import {depthContent,depthHotspots,transitionProgress,depthSceneId} from './depthContent.js';
import {supplyLocation,validSupplySelection} from './supplyRegionsContent.js';
import {theatreMotion} from './theatreMotion.js';
import {SupplyNetwork} from './SupplyNetwork.jsx';
import {visibleFootprint} from './footprintGeography.js';
import {CategoryOverview} from './CategoryOverview.jsx';
import {BrandOverview} from './BrandOverview.jsx';
import confirmedBrands from '../../../共享数据/featured-brands.json';
import './impact.css';
import {CompanyEntrance} from './CompanyEntrance.jsx';
import {ImpactNavigation} from './ImpactNavigation.jsx';
import './star-ocean-theme.css';
import './intelligence-overview.css';
import '../components/exhibit-action.css';

export function ImpactTheatre({lang,onLanguage,onRead,onFullscreen,catalog,companyFacts,suspended=false,initialState=null}){
  const brands=confirmedBrands.brands;
  const brandFlow=useRef({offsets:[0,.17],heldRow:null}),brandJourney=useRef();
  const [featuredCategory,setFeaturedCategory]=useState(0),featuredOffset=useRef(0);
  const [index,setIndex]=useState(initialState?.index??0),[playing,setPlaying]=useState(()=>initialState?.playing??!matchMedia('(prefers-reduced-motion: reduce)').matches),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[reel,setReel]=useState(null);
  const host=useRef(),runtime=useRef(),latest=useRef(),scrub=useRef(),hotspots=useRef({}),mapJourney=useRef();
  const [detail,setDetail]=useState(null);
  const [intelligence,setIntelligence]=useState({stage:0,mode:'auto',progress:0});
  const [network,setNetwork]=useState({layer:'all',selected:null,directory:false});
  const [categoryOverview,setCategoryOverview]=useState(true),[brandOverview,setBrandOverview]=useState(true);
  latest.current={setIntelligence,lang,playing,brands,setIndex,setReel,setPlaying,onRead,suspended,setDetail,categoryOverview,brandOverview,brandFlow,featuredCategory,setFeaturedCategory,featuredOffset,network,setNetwork};
  const l=lang==='zh'?0:1,moment=impactMoments[index];
  const select=i=>{runtime.current?.select((i+impactMoments.length)%impactMoments.length);};
  useEffect(()=>{
    const mount=host.current,quality=getRenderQuality(),q=quality.render;
    let disposed=false,loaded=false,renderer,loop,dirtyFrames=2;
    const wake=()=>{dirtyFrames=2;loop?.setActive(true);};
    try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
    const applied=applyRendererQuality(renderer,THREE,quality);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=q.exposure;
    renderer.domElement.setAttribute('aria-hidden','true');mount.prepend(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(46,1,.1,480);
    const cameraPosition=new THREE.Vector3(),look=new THREE.Vector3();scene.fog=new THREE.FogExp2('#082339',.004);
    const target=new THREE.WebGLRenderTarget(1,1,{samples:applied.msaa,type:THREE.HalfFloatType}),composer=new EffectComposer(renderer,target);
    composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),q.bloom,.7,.95);composer.addPass(bloom);composer.addPass(new OutputPass());
    const key=new THREE.DirectionalLight('#fff0d9',3.4);key.position.set(-25,38,14);key.castShadow=q.shadows;key.shadow.mapSize.setScalar(applied.shadowMapSize);Object.assign(key.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:.5,far:140});key.shadow.bias=-.00015;key.shadow.normalBias=.12;scene.add(key);
    const rim=new THREE.DirectionalLight('#9dcfff',3.7);rim.position.set(18,28,-23);scene.add(rim);
    const fill=new THREE.DirectionalLight('#88bee7',1.15);fill.position.set(10,6,18);scene.add(fill);
    const hemisphere=new THREE.HemisphereLight('#d4e8ff','#071321',.75);scene.add(hemisphere);
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();let environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.9*q.environment;room.dispose();
    const manager=new THREE.LoadingManager();manager.onLoad=async()=>{
      if(disposed)return;
      // Warm all visual worlds once. Articles keep this renderer mounted.
      worlds.forEach(w=>{w.root.visible=true;w.prepare?.();});
      try{
        await renderer.compileAsync(scene,camera);
        if(disposed)return;
        // Upload geometry and initialise render-only material paths before a touch.
        // The tiny offscreen target never changes the visitor's visible canvas.
        const warmTarget=new THREE.WebGLRenderTarget(16,16),savedPosition=camera.position.clone(),savedQuaternion=camera.quaternion.clone();
        const culling=[];
        scene.traverse(object=>{if(object.isMesh||object.isLine||object.isPoints){culling.push([object,object.frustumCulled]);object.frustumCulled=false;}});
        try{
          renderer.setRenderTarget(warmTarget);
          for(let i=0;i<worlds.length;i++){
            worlds.forEach((world,j)=>world.root.visible=i===j);
            worlds[i].update({time:1,progress:0,camera:cameraPosition,target:look,aspect:camera.aspect,brands,brandFlow:latest.current.brandFlow.current,lang:latest.current.lang,reelPosition:0,depthMix:worlds[i].focusPose?1:0,detailTime:0});
            worlds[i].prepare?.();
            const pose=worlds[i].focusPose?.(null,camera.aspect);camera.position.copy(pose?.position||cameraPosition);camera.lookAt(pose?.target||look);
            renderer.render(scene,camera);
          }
        }finally{
          culling.forEach(([object,enabled])=>object.frustumCulled=enabled);
          renderer.setRenderTarget(null);warmTarget.dispose();camera.position.copy(savedPosition);camera.quaternion.copy(savedQuaternion);
        }
      }catch(error){console.error("Scene preparation failed",error);if(!disposed)setFailed(true);return;}
      if(disposed)return;loaded=true;tuneTextures(scene,applied.anisotropy);setReady(true);wake();
    };manager.onError=()=>{if(!disposed)setFailed(true);};
    new HDRLoader(manager).load('/media/materials/studio.hdr',texture=>{if(disposed){texture.dispose();return;}const next=pmrem.fromEquirectangular(texture);texture.dispose();environment.dispose();environment=next;scene.environment=next.texture;});
    const sky=createStarOceanAtmosphere(THREE,scene,manager,q.exposure);
    const worlds=createImpactWorlds(manager,quality,brands,pmrem,sky);worlds.forEach(w=>{scene.add(w.root);w.root.visible=false;});
    const state={index:initialState?.index??0,time:initialState?.time??1,motionTime:1,homeTouch:false,homeHover:false,homeCursor:[.507,.65],homeImpulse:0,touring:(initialState?.index??0)!==0,idleSeconds:0,held:false,yaw:initialState?.yaw??0,tilt:initialState?.tilt??0,liveYaw:initialState?.yaw??0,liveTilt:initialState?.tilt??0,reelPosition:0,reelMotion:null,drag:null,depth:null,depthMix:0,detailTime:0,transition:null,snapshot:null,regionViews:new Map(),reelPositions:{brands:0,categories:0}};
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intelligenceDirector=createIntelligenceDirector({reduced});
    const publishIntelligence=()=>latest.current.setIntelligence(intelligenceDirector.snapshot());
    const interact=()=>{state.touring=false;state.idleSeconds=0;wake();};
    const worldIndex=()=>impactMoments.findIndex(moment=>moment.id===(state.depth?.id||impactMoments[state.index].id));
    const count=()=>reelEntries(impactMoments[state.index].id,latest.current.brands).length;
    const duration=()=>momentDuration(impactMoments[state.index],count());
    const read=(payload)=>{
      if(!loaded||state.reelMotion||latest.current.suspended)return;
      interact();
      const item=isReelMoment(impactMoments[state.index].id)?reelEntries(impactMoments[state.index].id,latest.current.brands)[wrapReel(Math.round(state.reelPosition),count())]:payload;
      if(isReelMoment(impactMoments[state.index].id)&&!item)return;
      latest.current.onRead(impactMoments[state.index].id,item);wake();
    };
    const openIntelligence=(selection=null)=>{
      if(!loaded||latest.current.suspended||state.transition?.returning)return false;
      if(selection!==null){
        const next=intelligenceStages.findIndex(item=>item.id===selection);
        if(next<0)return false;
        intelligenceDirector.select(next);
      }else intelligenceDirector.select(intelligenceDirector.snapshot().stage);
      if(!state.depth){
        state.snapshot={time:state.time,yaw:state.liveYaw,tilt:state.liveTilt,position:camera.position.clone(),target:look.clone()};
        state.depth={id:'intelligence',selection:null,origin:'intelligence',originView:null};
        state.transition={elapsed:0,duration:reduced?.01:1.2,fromMix:state.depthMix,toMix:1,fromPosition:camera.position.clone(),fromTarget:look.clone(),to:worlds[4].focusPose(null,camera.aspect),returning:false};
        state.yaw=state.liveYaw=state.tilt=state.liveTilt=0;
        latest.current.setDetail(state.depth);
      }
      state.held=false;publishIntelligence();interact();return true;
    };
    const intelligenceExample=()=>{if(!state.depth||state.depth.id!=='intelligence'||state.transition?.returning)return;intelligenceDirector.openExample();publishIntelligence();interact();};
    const openDepth=(selection=null)=>{
      const origin=state.depth?.origin||impactMoments[state.index].id,id=depthSceneId(origin),originView=state.depth?.originView||(id==='supply'?'flat':null);
      if(id==='intelligence')return openIntelligence(selection);
      if(!loaded||!depthContent[id]||latest.current.suspended||state.transition?.returning)return false;
      if(id==='supply'){
        selection=selection||'china';if(!validSupplySelection(selection))return;
        const next=supplyLocation(selection),previous=supplyLocation(state.depth?.selection);
        if(state.depth?.id==='supply'&&next.area&&!previous.area&&next.region===previous.region)state.regionViews.set(next.region,{position:camera.position.clone(),target:look.clone(),yaw:state.liveYaw,tilt:state.liveTilt});
      }
      const sceneIndex=impactMoments.findIndex(moment=>moment.id===id),to=worlds[sceneIndex].focusPose(selection,camera.aspect);
      let fromPosition=camera.position.clone(),fromTarget=look.clone();
      if(!state.snapshot){
        state.snapshot={time:state.time,yaw:state.liveYaw,tilt:state.liveTilt,position:fromPosition.clone(),target:fromTarget.clone(),mapRegion:originView==='flat'?selection:null};
        if(originView==='flat'){
          fromTarget=to.target.clone();fromPosition=to.position.clone().sub(to.target).multiplyScalar(1.28).add(to.target);fromPosition.y+=10;
          state.snapshot.entryPosition=fromPosition.clone();state.snapshot.entryTarget=fromTarget.clone();
          mount.parentElement.style.setProperty('--map-model-opacity','0');
        }
      }
      state.depth={id,selection,origin,originView};state.transition={elapsed:0,duration:reduced?.01:state.depthMix>0?1.65:1.85,fromMix:state.depthMix,toMix:1,fromPosition,fromTarget,to,returning:false};
      state.yaw=state.liveYaw=state.tilt=state.liveTilt=0;state.held=false;
      latest.current.setDetail(state.depth);interact();return true;
    };
    const closeDepth=()=>{
      if(!state.depth||state.transition?.returning)return;
      if(state.depth.id==='supply'){const {region,area}=supplyLocation(state.depth.selection);if(area){const saved=state.regionViews.get(region);openDepth(region);if(saved){state.transition.to={position:saved.position.clone(),target:saved.target.clone()};state.yaw=state.liveYaw=saved.yaw;state.tilt=state.liveTilt=saved.tilt;}return;}}
      if(state.depth.id==='intelligence'&&intelligenceDirector.snapshot().mode==='case'){intelligenceDirector.closeExample();publishIntelligence();interact();return;}
      if(state.depth.id==='intelligence'){state.depth=null;state.depthMix=0;state.snapshot=null;state.transition=null;state.index=0;state.time=1;state.touring=false;latest.current.setIndex(0);latest.current.setDetail(null);interact();return;}
      const saved=state.snapshot;
      state.transition={elapsed:0,duration:reduced?.01:1.5,fromMix:state.depthMix,toMix:0,fromPosition:camera.position.clone(),fromTarget:look.clone(),to:{position:saved.entryPosition||saved.position,target:saved.entryTarget||saved.target},returning:true};
      interact();
    };
    const snap=to=>{
      state.reelMotion={from:state.reelPosition,to,elapsed:0,duration:reduced?.01:.62};
      interact();
    };
    runtime.current={wake,read,openDepth,closeDepth,interact,intelligenceExample,
      intelligenceInspect(seconds){intelligenceDirector.inspect(seconds);latest.current.setPlaying(false);publishIntelligence();interact();},
      intelligenceSelect(index){if(!state.depth||state.depth.id!=='intelligence')return;intelligenceDirector.select(index);publishIntelligence();state.yaw=state.tilt=0;interact();},
      intelligenceResume(){intelligenceDirector.resume();latest.current.setPlaying(true);publishIntelligence();interact();},
      intelligenceActivity(){intelligenceDirector.activity();interact();},
      pulseHome(){if(state.index!==0||!loaded||latest.current.suspended)return;state.homeCursor=[.507,.65];state.homeImpulse++;interact();},
      enterSupply(id){if(impactMoments[state.index].id!=='supply'||state.depth)return false;return openDepth(id);},
      networkChange(patch){
        if(state.depth||state.transition||latest.current.suspended)return false;
        if(patch.layer&&!['all','customers','suppliers'].includes(patch.layer))return false;
        if(patch.selected&&!visibleFootprint(patch.layer||latest.current.network.layer).some(country=>country.code===patch.selected))return false;
        if(Object.hasOwn(patch,'selected')&&patch.selected!==latest.current.network.selected)state.yaw=state.liveYaw=state.tilt=state.liveTilt=0;
        latest.current.setNetwork(current=>({...current,...patch}));interact();return true;
      },
      focusReel(slot){state.reelPosition=slot;state.reelMotion=null;state.time=slot*reelDwell+1;infoKey='';interact();},
      step(direction){if(!isReelMoment(impactMoments[state.index].id)||!loaded||latest.current.suspended||count()<2)return;snap(Math.round(state.reelMotion?.to??state.reelPosition)+direction);},
      select(i){
        if(latest.current.suspended||state.depth)return;
        gestures.cancel();chapterGestures.cancel();
        const previous=impactMoments[state.index].id,next=impactMoments[i].id;
        if(previous==='company'){worlds[0].reset?.();state.homeTouch=false;state.homeHover=false;}
        if(isReelMoment(previous))state.reelPositions[previous]=wrapReel(Math.round(state.reelMotion?.to??state.reelPosition),count());
        state.index=i;state.reelPosition=state.reelPositions[next]||0;state.time=isReelMoment(next)?state.reelPosition*reelDwell+1:1;
        state.yaw=state.liveYaw=state.tilt=state.liveTilt=0;state.reelMotion=null;state.drag=null;infoKey='';
        latest.current.setIndex(i);latest.current.setReel(null);interact();
      },
      seek(value){if(state.depth)return;state.time=Number(value)/1000*duration();state.reelMotion=null;state.reelPosition=automaticReelPosition(state.time);interact();},
      hold(value){state.held=value;wake();},
    };
    const homePoint=event=>{
      const rect=mount.getBoundingClientRect();
      return [THREE.MathUtils.clamp((event.clientX-rect.left)/rect.width,0,1),THREE.MathUtils.clamp((event.clientY-rect.top)/rect.height,0,1)];
    };
    const overview=()=>!state.depth&&(impactMoments[state.index].id==='supply'||(impactMoments[state.index].id==='brands'&&latest.current.brandOverview)||(impactMoments[state.index].id==='categories'&&latest.current.categoryOverview));
    const directoryOpen=()=>impactMoments[state.index].id==='supply'&&latest.current.network.directory;
    const swipeChapter=result=>{
      if(state.depth||state.transition||latest.current.suspended||directoryOpen())return;
      const step=chapterSwipeDirection(result,mount.clientWidth);
      if(step)runtime.current.select((state.index+step+impactMoments.length)%impactMoments.length);
    };
    const gestures=bindScenePointer(mount,{claimClick:true,includeControls:true,cancelOnMultiple:true,enabled:()=>loaded&&!latest.current.suspended&&!state.transition&&!directoryOpen(),
      onStart(event){state.held=true;if(state.index===4)intelligenceDirector.activity();if(state.index===0){state.homeTouch=true;state.homeCursor=homePoint(event);state.homeImpulse++;}state.drag=isReelMoment(impactMoments[state.index].id)&&!overview()?{origin:state.reelPosition,distance:0,moved:false}:null;state.reelMotion=null;interact();},
      onMove(_event,{dx,dy,gesture}){
        if(state.index===0)state.homeCursor=homePoint(_event);
        if(state.depth?.id==='intelligence')intelligenceDirector.activity();
        if(Math.hypot(gesture.x-gesture.startX,gesture.y-gesture.startY)<=7)return;
        interact();
        if(state.index===4){
          if(state.depth){
            state.yaw=THREE.MathUtils.clamp(state.yaw-dx*.003,-1.1,1.1);
            state.tilt=THREE.MathUtils.clamp(state.tilt-dy*.0015,-.35,.35);
            state.liveYaw=state.yaw;state.liveTilt=state.tilt;wake();
          }
          return;
        }
        if(overview())return;
        if(state.drag){
          const drag=state.drag;drag.moved=true;
          drag.distance=-(gesture.x-gesture.startX)/Math.max(260,mount.clientWidth*.45);
          state.reelPosition=drag.origin+THREE.MathUtils.clamp(drag.distance,-1.1,1.1);
        }else{
          state.yaw-=dx*.003;state.tilt=THREE.MathUtils.clamp(state.tilt-dy*.0015,-.3,.3);
          if(state.index===0){state.yaw=THREE.MathUtils.clamp(state.yaw,-.15,.15);state.tilt=THREE.MathUtils.clamp(state.tilt,-.06,.06);}
          if(state.index!==0){state.liveYaw=state.yaw;state.liveTilt=state.tilt;}
        }
        wake();
      },
      onEnd(result){
        const {cancelled}=result,canSwipe=!state.depth&&(!isReelMoment(impactMoments[state.index].id)||overview());
        if(state.drag?.moved)snap(settleReel(state.drag.origin,state.drag.distance,cancelled));
        state.drag=null;state.held=false;if(state.index===0){state.homeTouch=false;state.yaw=state.tilt=0;}wake();
        if(canSwipe)swipeChapter(result);
      },
      onTap(event,gesture){
        if(overview()){interact();return;}
        if(Boolean(depthContent[depthSceneId(impactMoments[state.index].id)])){
          const pointId=gesture.target.closest?.('[data-location]')?.dataset.location;
          const rect=mount.getBoundingClientRect(),picked=pointId?{focusId:pointId}:worlds[worldIndex()].pick(event.clientX-rect.left,event.clientY-rect.top,rect.width,rect.height,camera);
          if(picked?.countryCode){runtime.current.networkChange({selected:picked.countryCode});return;}
          if(picked){if(picked.intelligence&&state.depth)intelligenceExample();else openDepth(picked.focusId||picked.locationId||null);return;}
        }
        if(isReelMoment(impactMoments[state.index].id)){read();return;}
        interact();
      },
    });
    // Nested maps, reels and reading controls own their gestures. The shell
    // and chapter bar provide a consistent swipe surface around those views.
    const chapterGestures=bindScenePointer(mount.parentElement,{claimClick:true,includeControls:true,cancelOnMultiple:true,
      enabled:()=>loaded&&!latest.current.suspended&&!state.depth&&!state.transition&&!directoryOpen(),
      acceptStart:event=>['touch','pen'].includes(event.pointerType)&&!event.target.closest('.impact-stage,.distribution-cartography,.distribution-directory,.brand-overview nav,.category-overview')&&
        (Boolean(event.target.closest('[data-chapter-navigation]'))||!event.target.closest('button,a,input,select,textarea,[role="dialog"]')),
      onStart(){state.held=true;interact();},
      onEnd(result){state.held=false;wake();swipeChapter(result);},
      onTap(_event,gesture){const button=gesture.target.closest('[data-chapter-index]');if(button)runtime.current.select(Number(button.dataset.chapterIndex));},
    });
    const cancelPointers=()=>{gestures.cancel();chapterGestures.cancel();};
    runtime.current.cancelPointers=cancelPointers;
    const homePointer=event=>{
      if(state.index!==0||reduced||latest.current.suspended||!latest.current.playing||state.held)return;
      const rect=mount.getBoundingClientRect();
      state.homeCursor=homePoint(event);state.homeHover=mount.contains(event.target);
      state.yaw=THREE.MathUtils.clamp((event.clientX-rect.left)/rect.width*2-1,-1,1)*.15;
      state.tilt=THREE.MathUtils.clamp(1-(event.clientY-rect.top)/rect.height*2,-1,1)*.06;
      interact();
    };
    const homeLeave=()=>{if(state.index===0&&!state.held){state.yaw=state.tilt=0;state.homeHover=false;wake();}};
    mount.parentElement.addEventListener('pointermove',homePointer,{passive:true});
    mount.parentElement.addEventListener('pointerleave',homeLeave);
    const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight,ratio=pixelRatioFor(w,h,devicePixelRatio,q,renderer.capabilities.maxTextureSize);renderer.setPixelRatio(ratio);composer.setPixelRatio(ratio);renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();wake();};
    const observer=new ResizeObserver(resize);observer.observe(mount);resize();
    let infoKey='',diagnosticAt=0;
    loop=createFrameLoop({render(_now,dt){
      if(loaded&&state.index===4&&!state.depth){state.depth={id:'intelligence',selection:null,origin:'intelligence'};state.depthMix=1;state.transition=null;state.touring=false;intelligenceDirector.reset({playing:latest.current.playing});latest.current.setDetail(state.depth);publishIntelligence();}
      const motion=theatreMotion({loaded,playing:latest.current.playing,suspended:latest.current.suspended,held:state.held||(impactMoments[state.index].id==='supply'&&latest.current.network.directory),touring:state.touring,depth:!!state.depth,movingReel:!!state.reelMotion});
      const networkHeld=(impactMoments[state.index].id==='supply'&&latest.current.network.directory);
      if(motion.animate){state.motionTime+=dt;if(!state.held&&!networkHeld)state.idleSeconds+=dt;}
      if(state.idleSeconds>90&&!state.depth&&!state.held&&!networkHeld)state.touring=true;
      if(motion.advanceTour){const next=advanceMoment(state.index,state.time,dt,duration());if(next.index!==state.index){state.index=next.index;state.yaw=state.tilt=0;latest.current.setIndex(next.index);}state.time=next.time;}
      if(motion.animate&&impactMoments[state.index].id==='brands'&&latest.current.brandOverview){const flow=latest.current.brandFlow.current;for(let row=0;row<2;row++)if(flow.heldRow!==row)flow.offsets[row]+=dt*(row===0?-.017:.017);}
      if(motion.advanceTour&&impactMoments[state.index].id==='categories'&&latest.current.categoryOverview){const selected=Math.floor(state.time/4)%6;if(selected!==latest.current.featuredCategory)latest.current.setFeaturedCategory(selected);}
      if(state.reelMotion&&!latest.current.suspended){
        const motion=state.reelMotion;motion.elapsed+=dt;
        const t=Math.min(1,motion.elapsed/motion.duration),eased=1-Math.pow(1-t,4);
        state.reelPosition=THREE.MathUtils.lerp(motion.from,motion.to,eased);
        if(t===1){state.reelPosition=wrapReel(motion.to,count());state.time=state.reelPosition*reelDwell+1;state.reelMotion=null;}
      }else if(!state.drag&&motion.advanceTour)state.reelPosition=automaticReelPosition(state.time);
      const transition=state.transition;
      if(transition&&!latest.current.suspended){transition.elapsed+=dt;const t=transitionProgress(transition.elapsed,transition.duration);state.depthMix=THREE.MathUtils.lerp(transition.fromMix,transition.toMix,t);}
      if(state.depth&&!latest.current.suspended&&(motion.animate||transition))state.detailTime+=dt;
      const intelligenceFrame=intelligenceDirector.tick(dt,{active:loaded&&state.index===4,playing:motion.animate,held:state.held,suspended:latest.current.suspended});
      if(state.index===4){
        const presentation=intelligencePresentation(intelligenceFrame.time),caseOpen=intelligenceFrame.mode==='case';
        for(const channel of ['copy','navigation','frame']){
          const value=caseOpen?1:presentation[channel];
          mount.parentElement.style.setProperty(`--intelligence-${channel}-alpha`,String(value));
          mount.parentElement.style.setProperty(`--intelligence-${channel}-visibility`,value>.025?'visible':'hidden');
        }
      }
      const {index,time}=state,moment=impactMoments[index],chapterDuration=duration(),progress=THREE.MathUtils.clamp(time/chapterDuration,0,1),sceneIndex=worldIndex(),mapDepth=state.depth?.originView==='flat';
      worlds.forEach((w,i)=>{w.root.visible=i===sceneIndex;});
      scene.environment=worlds[sceneIndex].environment||environment.texture;
      worlds[sceneIndex].update({intelligence:intelligenceFrame,intelligencePointer:[state.liveYaw,state.liveTilt],time:state.motionTime,cameraTime:time,progress,camera:cameraPosition,target:look,aspect:camera.aspect,lang:latest.current.lang,brands:latest.current.brands,reelPosition:state.reelPosition,categoryOverview:latest.current.categoryOverview,brandOverview:latest.current.brandOverview,brandFlow:latest.current.brandFlow.current,featuredCategory:latest.current.featuredCategory,featuredOffset:latest.current.featuredOffset.current,homePointer:[state.liveYaw/.15,state.liveTilt/.06],homeCursor:state.homeCursor,homeTouch:state.homeTouch,homeHover:state.homeHover,homePixelHeight:renderer.domElement.height,homeImpulse:state.homeImpulse,homeSuspended:latest.current.suspended,homeImmediate:reduced,overviewImmediate:reduced||!latest.current.playing,depthMix:mapDepth?1:state.depthMix,detailTime:state.detailTime,depthSelection:state.depth?.selection??null,network:latest.current.network,animate:motion.animate,dt:reduced?0:dt});
      if(state.depth&&!transition){const pose=worlds[sceneIndex].focusPose(state.depth.selection,camera.aspect);cameraPosition.copy(pose.position);look.copy(pose.target);}
      const k=1-Math.exp(-dt*6);state.liveYaw=THREE.MathUtils.lerp(state.liveYaw,state.yaw,k);state.liveTilt=THREE.MathUtils.lerp(state.liveTilt,state.tilt,k);
      if(sceneIndex===0||sceneIndex===4){camera.position.copy(cameraPosition);}else {
      const offset=cameraPosition.clone().sub(look);offset.applyAxisAngle(new THREE.Vector3(0,1,0),state.liveYaw);offset.applyAxisAngle(new THREE.Vector3(1,0,0),state.liveTilt);camera.position.copy(look).add(offset);
      }
      if(transition){const t=transitionProgress(transition.elapsed,transition.duration);camera.position.lerpVectors(transition.fromPosition,transition.to.position,t);look.lerpVectors(transition.fromTarget,transition.to.target,t);}
      camera.lookAt(look);camera.updateMatrixWorld();
      Object.values(hotspots.current).forEach(button=>{if(button)button.hidden=true;});
      if(state.depth&&!transition)worlds[sceneIndex].project(camera,mount.clientWidth,mount.clientHeight).forEach(point=>{
        const button=hotspots.current[point.id];if(!button)return;
        button.hidden=!point.visible||(!!state.depth&&point.x<mount.clientWidth*.43&&point.y<mount.clientHeight*.66);button.classList.toggle('align-left',point.x+button.offsetWidth-(mount.clientWidth>=2500?40:24)>mount.clientWidth*.96);button.style.left=point.x+'px';button.style.top=point.y+'px';
      });
      if(moment.id==='brands'&&latest.current.brandOverview)brandJourney.current?.frame(worlds[sceneIndex].projectBrands(camera,mount.clientWidth,mount.clientHeight));
      mapJourney.current?.frame(state.depth?.id==='supply'?state.depthMix:0,state.snapshot?.mapRegion,mapDepth);
      sky.update(state.motionTime,camera.aspect,reduced,sceneIndex!==0,camera,renderer.domElement.height,state.liveYaw);
      scene.fog.density=sceneIndex===0?.0026:.001;key.intensity=sceneIndex===0?1.7:sceneIndex===1?(state.depth?1.8:3.6):isReelMoment(moment.id)?2.2:3.4;rim.intensity=sceneIndex===0?1.1:sceneIndex===1?2.8:isReelMoment(moment.id)?2:3.7;fill.intensity=sceneIndex===0?.24:sceneIndex===1?(state.depth?.55:.2):isReelMoment(moment.id)?.7:1.15;scene.environmentIntensity=(state.depth?(sceneIndex===1?.9:.65):sceneIndex===1?.16:isReelMoment(moment.id)?.7:.9)*q.environment;key.position.set(sceneIndex===1?-28:-25,38,sceneIndex===0?35:sceneIndex===1?2:14);
      // All objects share the night sea: blue sky fill and a restrained
      // champagne edge from the far-right horizon.
      const home=sceneIndex===0;
      key.color.set(home?'#fff0d9':'#e1e5e9');rim.color.set(home?'#9dcfff':'#a8c9e6');fill.color.set(home?'#88bee7':'#99b9d8');
      hemisphere.color.set(home?'#d4e8ff':'#c4d6e5');hemisphere.groundColor.set('#071321');
      scene.fog.color.set('#082339');
      if(!home)key.position.set(24,32,sceneIndex===1?8:20);
      const fade=state.depth||reduced||!motion.advanceTour?1:Math.min(THREE.MathUtils.smoothstep(time,0,.8),1-THREE.MathUtils.smoothstep(time,chapterDuration-.8,chapterDuration));
      mount.style.opacity=loaded?String(fade):'0';if(scrub.current&&!state.held)scrub.current.value=String(Math.round(progress*1000));
      mount.parentElement.style.setProperty('--moment-progress',`${progress*100}%`);
      if(isReelMoment(moment.id)&&count()){const entries=reelEntries(impactMoments[state.index].id,latest.current.brands),slot=wrapReel(Math.round(state.reelPosition),entries.length),item={...entries[slot],slot},key=`${item.type}-${item.index}`;if(key!==infoKey){infoKey=key;latest.current.setReel(item);}}else if(infoKey){infoKey='';latest.current.setReel(null);}
      diagnosticAt+=dt;if(diagnosticAt>.25||!latest.current.playing){diagnosticAt=0;if(state.index===4){publishIntelligence();mount.dataset.intelligenceStage=String(intelligenceFrame.stage);mount.dataset.intelligenceMode=intelligenceFrame.mode;mount.dataset.intelligenceWeights=intelligenceFrame.weights.map(v=>v.toFixed(4)).join(',');mount.dataset.journeyTime=intelligenceFrame.time.toFixed(3);mount.dataset.journeySeeking=String(intelligenceFrame.seeking);}mount.dataset.depth=state.depth?(state.depth.selection||'overview'):'outer';mount.dataset.transition=transition?(transition.returning?'returning':'entering'):'settled';mount.dataset.depthMix=state.depthMix.toFixed(3);mount.dataset.geometries=String(renderer.info.memory.geometries);mount.dataset.textures=String(renderer.info.memory.textures);mount.dataset.reelPosition=state.reelPosition.toFixed(3);mount.dataset.moment=moment.id;mount.dataset.time=time.toFixed(2);mount.dataset.camera=camera.position.toArray().map(v=>v.toFixed(2)).join(',');}
      composer.render();
      if(transition&&transition.elapsed>=transition.duration){
        if(transition.returning){const saved=state.snapshot;state.time=saved.time;state.yaw=state.liveYaw=saved.yaw;state.tilt=state.liveTilt=saved.tilt;state.depth=null;state.snapshot=null;latest.current.setDetail(null);}
        state.transition=null;dirtyFrames=2;
      }
      mount.dataset.logoStyle='crystal';
      mount.dataset.homeTouch=String(state.homeTouch);mount.dataset.homeResponse=(worlds[0].root.userData.lightResponse||0).toFixed(3);mount.dataset.homePulse=(worlds[0].root.userData.lightPulse??4).toFixed(3);
      const homeMoving=(state.index===0&&worlds[0].isMoving?.())||(state.index===4&&worlds[4].isMoving());
      mount.dataset.homeParallax=[state.liveYaw/.15,state.liveTilt/.06].map(v=>v.toFixed(3)).join(',');
      mount.dataset.motionTime=state.motionTime.toFixed(2);mount.dataset.detailTime=state.detailTime.toFixed(2);mount.dataset.animation=motion.animate?'running':'paused';mount.dataset.touring=String(state.touring);
      if(latest.current.suspended||(!homeMoving&&!state.transition&&!state.reelMotion&&!(state.index===4&&intelligenceDirector.isMoving())&&!motion.animate&&Math.abs(state.liveYaw-state.yaw)+Math.abs(state.liveTilt-state.tilt)<.0001&&--dirtyFrames<=0))loop.setActive(false);
    }});
    const visibility=()=>{mount.parentElement.dataset.pageVisible=String(!document.hidden);loop.setVisible(!document.hidden);if(document.hidden)cancelPointers();};document.addEventListener('visibilitychange',visibility);visibility();loop.setActive(true);
    return()=>{disposed=true;loop.dispose();observer.disconnect();gestures.dispose();chapterGestures.dispose();runtime.current=null;mount.parentElement.removeEventListener('pointermove',homePointer);mount.parentElement.removeEventListener('pointerleave',homeLeave);document.removeEventListener('visibilitychange',visibility);worlds.forEach(w=>w.dispose?.());sky.dispose();disposeTree(scene);composer.passes.forEach(p=>p.dispose?.());composer.dispose();environment.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  useEffect(()=>{runtime.current?.wake();},[ready,index,playing,lang,suspended,categoryOverview,brandOverview,featuredCategory,network]);
  useEffect(()=>{runtime.current?.cancelPointers();},[index,suspended,detail,network.directory]);
  useEffect(()=>{if(detail?.id==='supply')host.current?.focus({preventScroll:true});},[detail?.id]);
  let title=moment.title[l],description=moment.description[l],eyebrow=['PARAMONT GLOBAL','PARAMONT GLOBAL'][l],note=moment.id==='company'?['PARAMONT GLOBAL · 创意连接世界','PARAMONT GLOBAL · CREATIVITY CONNECTS.'][l]:moment.note[l];
  if(isReelMoment(moment.id)&&reel){if(reel.type==='brand'){title=reel.item.name;description=reel.item.descriptor[l];eyebrow=['品牌世界','BRAND WORLDS'][l];note=['品牌介绍来自官方资料','Brand information from official sources'][l];}else{title=reel.item.name[l];description=reel.item.description[l];eyebrow=['品类世界','CATEGORY WORLDS'][l];note=['业务品类展示 · 产品形态为原创概念','Business categories · Original concept product forms'][l];}}
  return <main className={`impact-theatre moment-${moment.id} ${ready?'is-ready':''} ${detail?'is-depth-open':''} ${detail?.originView==='flat'?'is-map-depth':''} ${moment.id==='supply'?'network-flat':''} ${moment.id==='brands'&&brandOverview?'is-brand-overview':''} ${moment.id==='categories'&&categoryOverview?'is-category-overview':''}`} data-mode="visual-theatre" data-action-motion={playing&&!suspended?'running':'paused'} onKeyDown={e=>{if(e.key==='Escape'&&moment.id==='brands'&&!brandOverview){e.preventDefault();setBrandOverview(true);runtime.current?.interact();return;}if(e.key==='Escape'&&detail){e.preventDefault();runtime.current?.closeDepth();return;}if(e.target.closest('button,input,a'))return;if(moment.id==='company'&&e.key==='Enter'){e.preventDefault();runtime.current?.pulseHome();return;}if(detail?.id==='intelligence'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();runtime.current?.intelligenceSelect((intelligence.stage+(e.key==='ArrowRight'?1:5))%6);return;}if(detail&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();const list=depthHotspots(detail);const current=list.findIndex(item=>item.id===detail.selection),next=current<0?(e.key==='ArrowRight'?0:list.length-1):(current+(e.key==='ArrowRight'?1:-1)+list.length)%list.length;runtime.current?.openDepth(list[next].id);return;}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const step=e.key==='ArrowRight'?1:-1;isReelMoment(moment.id)&&!(moment.id==='brands'&&brandOverview)&&!(moment.id==='categories'&&categoryOverview)?runtime.current?.step(step):select(index+step);}if(e.code==='Space'){e.preventDefault();setPlaying(v=>!v);}}}>
    <div ref={host} className="impact-stage" role="group" aria-label={moment.id==='supply'&&!detail?['平面地图背景','Flat map background'][l]:isReelMoment(moment.id)?(moment.id==='brands'?['左右滑动浏览品牌','Swipe to browse brands'][l]:['左右滑动浏览品类','Swipe to browse categories'][l]):moment.id==='company'?['品牌标志互动场景','Interactive brand symbol'][l]:moment.id==='intelligence'?['智能与洞察互动场景','Interactive intelligence exhibit'][l]:['可拖动的三维品牌展演','Draggable 3D brand experience'][l]} tabIndex={0}>
      {ready&&detail?.id==='supply'&&<div className="impact-hotspots">{depthHotspots(detail).map(point=><button key={point.id} ref={element=>{hotspots.current[point.id]=element;}} hidden className="impact-region" data-location={point.id} aria-label={`${point.name[l]} · ${l===0?'进入三维空间':'Explore in 3D'}`} onFocus={()=>runtime.current?.hold(true)} onBlur={()=>runtime.current?.hold(false)} onClick={e=>{if(e.detail===0)runtime.current?.openDepth(point.id);}}><i/><span><strong>{point.name[l]}</strong>{!detail&&<small>{point.role[l]}</small>}</span><ArrowRight/></button>)}</div>}
    </div><div className="impact-vignette"/>
    <header className="impact-header"><svg className="impact-logo" viewBox="0 99 406 210" role="img" aria-label="PARAMONT GLOBAL"><defs><filter id="impact-remove-white" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -4.252 -14.304 -1.444 0 10"/></filter></defs><image href="/media/brand/paramont-global-original.png" width="406" height="407" filter="url(#impact-remove-white)"/></svg><span className="impact-edition">{moment.id==='company'?<>{['更好的产品','BETTER PRODUCTS'][l]}<br/>{['更美好的生活','BRIGHTER LIVES'][l]}<br/>{['携手共创','TOGETHER'][l]}</>:['创意 · 品牌 · 世界','CREATIVITY · BRANDS · WORLD'][l]}</span></header>
    {!ready&&<div className="impact-loading" role="status">{failed?['部分场景资源加载失败，请重新打开。','Some scene assets could not load. Please reload.'][l]:['正在构筑品牌世界','Preparing the brand experience'][l]}</div>}
    {ready&&moment.id==='company'&&<CompanyEntrance lang={lang} onRead={()=>runtime.current?.read()} onLanguage={onLanguage}/>}
    {ready&&moment.id!=='company'&&moment.id!=='intelligence'&&<section className="impact-copy" key={`${index}-${reel?.type}-${reel?.index}-${lang}`} aria-live="polite"><p className="impact-eyebrow"><i/>{eyebrow}</p><h1>{title}</h1><p className="impact-description">{description}</p>{moment.id==='categories'&&reel?.type==='category'&&<ul className="impact-category-facets">{reel.item.facets.map((facet,i)=><li key={i}>{facet[l]}</li>)}</ul>}</section>}
    {ready&&moment.id!=='company'&&moment.id!=='intelligence'&&<div className="impact-reading-entry">{moment.id==='categories'&&!categoryOverview&&<button className="exhibit-action" onClick={()=>{setCategoryOverview(true);runtime.current?.interact();}}><ArrowLeft/><span>{['全部品类','All categories'][l]}</span></button>}<button className={`exhibit-action ${depthContent[moment.id]?'depth-enter':''}`} onClick={()=>Boolean(depthContent[moment.id])?runtime.current?.openDepth():runtime.current?.read()}><span>{index===1?['进入全球供应链','Explore the supply network'][l]:moment.id==='intelligence'?['探索六种形态','Explore the six stages'][l]:(moment.id==='categories'?['了解这一品类','About this category']:['阅读介绍','Read the story'])[l]}</span><ArrowRight aria-hidden="true"/></button></div>}
    {ready&&isReelMoment(moment.id)&&<div className="impact-reel-control" role="group" aria-label={(moment.id==='brands'?['品牌轮播','Brand reel']:['品类轮播','Category reel'])[l]}><button aria-label={(moment.id==='brands'?['上一个品牌','Previous brand']:['上一个品类','Previous category'])[l]} onClick={()=>runtime.current?.step(-1)}><ArrowLeft/></button><span><small>{['左右滑动探索','SWIPE TO EXPLORE'][l]}</small><b>{String((reel?.slot??0)+1).padStart(2,'0')}<i> / {String(reelEntries(moment.id,brands).length).padStart(2,'0')}</i></b></span><button aria-label={(moment.id==='brands'?['下一个品牌','Next brand']:['下一个品类','Next category'])[l]} onClick={()=>runtime.current?.step(1)}><ArrowRight/></button></div>}
    <footer className="impact-footer has-chapter-navigation"><ImpactNavigation moments={impactMoments} index={index} onSelect={select} lang={lang}/><div className="impact-tools"><button onClick={()=>setPlaying(v=>!v)} aria-label={playing?['暂停动画','Pause animation'][l]:['继续动画','Resume animation'][l]}>{playing?<Pause/>:<Play/>}</button><input ref={scrub} className="impact-scrub" type="range" min="0" max="1000" defaultValue="0" aria-label={['当前镜头进度','Current chapter progress'][l]} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);runtime.current?.hold(true);}} onPointerUp={()=>runtime.current?.hold(false)} onPointerCancel={()=>runtime.current?.hold(false)} onLostPointerCapture={()=>runtime.current?.hold(false)} onInput={e=>runtime.current?.seek(e.currentTarget.value)} onChange={e=>runtime.current?.seek(e.target.value)}/><button className="impact-language" onClick={()=>onLanguage(lang==='zh'?'en':'zh')} aria-label={['切换英文','Switch to Chinese'][l]}>{lang==='zh'?'EN':'中'}</button><button onClick={onFullscreen} aria-label={['切换全屏','Toggle fullscreen'][l]}><CornersOut/></button></div></footer>
    <SupplyNetwork active={ready&&moment.id==='supply'} lang={lang} playing={playing} suspended={suspended} depthActive={detail?.id==='supply'} network={network} onChange={patch=>runtime.current?.networkChange(patch)} journeyRef={mapJourney} onEnter={id=>runtime.current?.enterSupply(id)} onInteract={()=>runtime.current?.interact()} onHold={value=>runtime.current?.hold(value)}/>
    {ready&&moment.id==='brands'&&(brandOverview?<BrandOverview brands={brands} lang={lang} flow={brandFlow} journeyRef={brandJourney} onHold={value=>runtime.current?.hold(value)} onInteract={()=>runtime.current?.interact()} onSelect={slot=>{brandFlow.current.heldRow=null;setBrandOverview(false);runtime.current?.focusReel(slot);}}/>:['left','right'].map(side=><button key={side} className={`brand-return exhibit-action ${side}`} onClick={()=>{setBrandOverview(true);runtime.current?.interact();}} aria-label={lang==='zh'?`${side==='left'?'左侧':'右侧'}返回品牌总览`:`Back to brands ${side}`}><ArrowLeft/>{['品牌总览','ALL BRANDS'][l]}</button>))}
    {ready&&moment.id==='categories'&&(categoryOverview?<CategoryOverview catalog={catalog} lang={lang} selected={featuredCategory} onSelect={value=>{setFeaturedCategory(value);runtime.current?.interact();}} onHold={value=>runtime.current?.hold(value)} onDrag={value=>{featuredOffset.current=value;runtime.current?.wake();}} onRead={item=>{runtime.current?.interact();onRead('categories',{type:'catalog-category',item});}} onScene={slot=>{setCategoryOverview(false);runtime.current?.focusReel(slot);}}/>:<button className="category-return exhibit-action" onClick={()=>{setCategoryOverview(true);runtime.current?.interact();}}><ArrowLeft/>{['全部品类','All categories'][l]}</button>)}
    {import.meta.env.DEV&&new URLSearchParams(location.search).has('motionReview')&&detail?.id==='intelligence'&&<label hidden style={{position:'absolute',top:24,left:'40%',zIndex:100,color:'#b8d0e3',fontSize:12,background:'#132336',padding:'8px 12px',borderRadius:6}}>{lang==='zh'?'动画审阅 · 秒':'Motion review · seconds'} <input aria-label="动画审阅时间" type="number" min="0" max="107.99" step="0.1" value={Number((intelligence.time??0).toFixed(2))} onChange={e=>runtime.current?.intelligenceInspect(Number(e.target.value))} style={{width:85,marginLeft:10,color:'#fff',background:'#0a1420',border:'1px solid #486077'}}/></label>}
    {detail?.id==='intelligence'&&<IntelligenceExperience playing={playing} lang={lang} stage={intelligence.stage} mode={intelligence.mode} progress={intelligence.progress} onSelect={value=>runtime.current?.intelligenceSelect(value)} onResume={()=>runtime.current?.intelligenceResume()} onExample={()=>runtime.current?.intelligenceExample()} onBack={()=>runtime.current?.closeDepth()} onActivity={()=>runtime.current?.intelligenceActivity()} onHold={value=>runtime.current?.hold(value)}/>}
    {detail?.id==='supply'&&<DepthExperience view={detail} lang={lang} companyFacts={companyFacts} onSelect={id=>runtime.current?.openDepth(id)} onBack={()=>runtime.current?.closeDepth()}/>}
    <div className="impact-note">{note}</div>
  </main>;
}
