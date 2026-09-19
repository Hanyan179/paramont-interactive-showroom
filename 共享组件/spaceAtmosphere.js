// Shared, continuous scene atmosphere. Time is supplied by the active renderer.

// At most three small ribbons share one draw. Scheduling uses the owner's
// motion time, so pauses and hidden pages never create a catch-up shower.
function createMeteorShower(THREE,scene,uniforms) {
  const positions=[],slots=[],counts=[2,1,1,3,1,2,1,1,3,1];
  for(let slot=0;slot<3;slot++)for(const [x,y] of [[0,-1],[1,-1],[1,1],[0,-1],[1,1],[0,1]]){
    positions.push(x,y,0);slots.push(slot);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('meteorSlot',new THREE.Float32BufferAttribute(slots,1));
  const heads=Array.from({length:3},()=>new THREE.Vector4()),directions=Array.from({length:3},()=>new THREE.Vector2());
  const material=new THREE.ShaderMaterial({
    uniforms:{...uniforms,meteorHeads:{value:heads},meteorDirections:{value:directions},meteorAspect:{value:16/9}},
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,
    vertexShader:`attribute float meteorSlot;uniform vec4 meteorHeads[3];uniform vec2 meteorDirections[3];uniform float meteorAspect;
      varying vec2 ribbonPoint;varying float strength,tailLength;
      void main(){int slot=int(meteorSlot);vec4 head=meteorHeads[slot];vec2 direction=meteorDirections[slot];
        float along=mix(-head.w,.009,position.x),across=position.y*.007;
        vec2 offset=direction*along+vec2(-direction.y,direction.x)*across;offset.x/=meteorAspect;
        gl_Position=vec4((head.xy+offset)*2.-1.,.99997,1.);
        ribbonPoint=vec2(along,across);strength=head.z;tailLength=head.w;}`,
    fragmentShader:`uniform float quiet,reflectionPass,starViewport;varying vec2 ribbonPoint;varying float strength,tailLength;
      void main(){if(reflectionPass>.5||strength<=0.)discard;
        float along=ribbonPoint.x,across=ribbonPoint.y,width=max(.00048,.55/max(starViewport,1.));
        float taper=smoothstep(-tailLength,-tailLength*.68,along)*exp(min(0.,along)*19.);
        float end=1.-smoothstep(0.,.003,along);
        float core=exp(-pow(across/width,2.))*taper*end;
        float halo=exp(-pow(across/.0022,2.))*taper*end*.10;
        float spark=exp(-dot(ribbonPoint,ribbonPoint)/(width*width*4.));
        float alpha=(core*.62+halo+spark*.8)*strength*(1.-quiet*.38);
        gl_FragColor=vec4(vec3(.70,.86,1.)*1.8,alpha);}`,
  });
  const mesh=new THREE.Mesh(geometry,material);mesh.name='occasional-meteor-shower';
  mesh.frustumCulled=false;mesh.renderOrder=-850;mesh.visible=false;scene.add(mesh);
  const random=(epoch,slot,salt)=>{const n=Math.sin(epoch*127.1+slot*311.7+salt*74.7)*43758.5453;return n-Math.floor(n);};
  return {
    update(seconds,aspect,reduced){
      const epoch=Math.max(0,Math.floor(seconds/22)),start=epoch*22+6+(epoch?random(epoch,0,1)*4:0);
      const count=counts[epoch%counts.length];let active=0;
      material.uniforms.meteorAspect.value=Math.max(.5,aspect);
      for(let i=0;i<3;i++){
        const delay=i*(.24+random(epoch,i,2)*.16),age=seconds-start-delay,lifetime=1.55+random(epoch,i,3)*.5;
        const direction=directions[i].set(-1,-(.32+random(epoch,i,4)*.26)).normalize();
        const speed=.18+random(epoch,i,5)*.065;
        const x=.57+random(epoch,i,6)*.29,y=.82+random(epoch,i,7)*.115;
        const fade=!reduced&&i<count&&age>0&&age<lifetime?Math.min(1,age/.14,(lifetime-age)/.42):0;
        heads[i].set(x+direction.x*speed*age/Math.max(.5,aspect),y+direction.y*speed*age,fade,.12+random(epoch,i,8)*.055);
        if(fade>0)active++;
      }
      mesh.visible=active>0;mesh.userData.activeCount=active;
    },
    dispose(){scene.remove(mesh);geometry.dispose();material.dispose();},
  };
}

// A volumetric star field and fine ocean detail share one atmosphere across
// chapters. The caller owns time; this factory owns the points and texture.
export function createStarOceanAtmosphere(THREE,scene,manager,exposure=1,{ocean=true}={}) {
  let disposed=false,plateAspect=16/9;
  const loader=new THREE.TextureLoader(manager);
  const plate=ocean?loader.load('/media/home/star-ocean-clean-plate-v1.jpg',texture=>{
    if(disposed){texture.dispose();return;}
    plateAspect=texture.image.width/texture.image.height;
  }):null;
  if(plate)plate.colorSpace=THREE.SRGBColorSpace;
  let nebulaAspect=16/9;
  const nebula=loader.load('/assets/intelligence-v2/nebula-starless-v1.png',texture=>{
    if(disposed){texture.dispose();return;}
    nebulaAspect=texture.image.width/texture.image.height;
  });
  nebula.colorSpace=THREE.SRGBColorSpace;
  const uniforms={plate:{value:plate},nebula:{value:nebula},nebulaCover:{value:new THREE.Vector2(1,1)},starAspect:{value:16/9},cover:{value:new THREE.Vector2(1,1)},time:{value:0},quiet:{value:0},starViewport:{value:941},
    reflectionPass:{value:0},plateExposure:{value:exposure},
    inverseInput:{value:new THREE.Matrix3().set(.59719,.35458,.04823,.076,.90834,.01566,.0284,.13383,.83777).invert()},
    inverseOutput:{value:new THREE.Matrix3().set(1.60475,-.53108,-.07367,-.10208,1.10813,-.00605,-.00327,-.07276,1.07602).invert()}};
  // Invert the final filmic pass so the approved plate retains its intended
  // exposure, then light/composite the genuine 3D objects in linear space.
  const sampleGLSL=`uniform sampler2D plate,nebula;uniform vec2 cover,nebulaCover;uniform float time,quiet,plateExposure;
    uniform mat3 inverseInput,inverseOutput;
    vec2 tideImageUv(vec2 screenUv){return (screenUv-.5)*cover+.5;}
    // The nebula is a stationary stage. Only separate particle geometry moves;
    // never rotate, advect or distort this image together with its stars.
    vec3 nightSky(vec2 screenUv){
      vec2 uv=(screenUv-.5)*nebulaCover+.5;
      return texture2D(nebula,uv).rgb+vec3(.00016,.00035,.00085);
    }
    vec3 photographicColor(vec3 rgb){vec3 y=clamp(inverseOutput*rgb,0.,.99);
      vec3 a=1.-y*.983729,b=.0245786-y*.432951,c=-.000090537-y*.238081;
      vec3 x=(-b+sqrt(max(vec3(0.),b*b-4.*a*c)))/(2.*a);
      return max(vec3(0.),inverseInput*x)*(.6/plateExposure);}
    // All water passes use the same travelling wave field. Its perspective
    // envelope holds the horizon still while the foreground visibly rolls.
    vec3 tideMotion(vec2 uv){
      float water=1.-smoothstep(.42,.47,uv.y);
      float depth=1.-smoothstep(.02,.47,uv.y);
      float swell=uv.y*29.+sin(uv.x*5.2)*1.4+time*.82;
      float crossing=uv.y*67.-uv.x*8.4+time*1.36+sin(swell)*.65;
      float ripple=uv.y*182.+uv.x*15.+time*2.15+sin(crossing)*.9;
      vec2 offset=vec2(
        sin(swell+uv.x*3.1)*.0055+sin(crossing)*.0017,
        sin(swell)*.0074+sin(crossing)*.0022+sin(ripple)*.00055);
      float light=sin(crossing)*.16+sin(ripple)*.10;
      return vec3(offset*(.16+depth*.84),light)*water;
    }
    vec3 tideColor(vec2 screenUv){
      vec2 uv=tideImageUv(screenUv);
      if(quiet>.5)return photographicColor(nightSky(screenUv));
      vec3 motion=tideMotion(uv);
      vec3 rgb=texture2D(plate,clamp(uv+motion.xy,.001,.999)).rgb;
      // The company chapter keeps its ocean. Its horizon meets exactly the
      // same nebula used in all other chapters, including the detail views.
      vec3 sky=nightSky(screenUv);
      sky+=vec3(.012,.026,.050)*exp(-pow((uv.y-.466)/.025,2.));
      rgb=mix(rgb,sky,smoothstep(.455,.492,uv.y));
      float glint=smoothstep(.13,.48,max(rgb.r,max(rgb.g,rgb.b)));
      rgb*=1.+motion.z*(.25+glint*.75);
      return photographicColor(rgb);
    }`;
  const material=new THREE.ShaderMaterial({uniforms,depthWrite:false,depthTest:false,
    vertexShader:'varying vec2 plateUv;void main(){plateUv=uv;gl_Position=vec4(position.xy,.99999,1.);}',
    fragmentShader:`varying vec2 plateUv;uniform float reflectionPass;${sampleGLSL}
      void main(){gl_FragColor=reflectionPass>.5?vec4(0.):vec4(tideColor(plateUv),1.);}`});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);
  mesh.name='shared-star-ocean';mesh.frustumCulled=false;mesh.renderOrder=-1000;scene.add(mesh);
  // Seeded 3D positions keep the same constellation when changing chapters.
  // Distinct depths create parallax; the camera-relative root prevents a
  // chapter's model scale or camera jump from changing the celestial setting.
  const points=[],sizes=[],phases=[],tints=[],velocities=[];
  let seed=71427;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const slope=Math.tan(THREE.MathUtils.degToRad(23));
  for(let i=0;i<2600;i++){
    const depth=100+random()*270,nearLayer=1-(depth-100)/270;
    const x=(random()-.5)*4.8,y=(random()-.5)*2.7;
    points.push(x*depth*slope,y*depth*slope,-depth);
    sizes.push(i<44?12+random()*7:i<260?4.5+random()*3:2.0+random()*2.0);
    phases.push(random()*Math.PI*2);
    const warmth=random();tints.push(warmth>.98?.84:.34,warmth>.98?.86:.64,1);
    // Quiet individual drift: varied velocities, no common pivot or vortex.
    const speed=.0018+nearLayer*nearLayer*.017,heading=.08+(random()-.5)*.44;
    velocities.push(Math.cos(heading)*speed,Math.sin(heading)*speed);
  }
  const geometry=new THREE.BufferGeometry();
  for(const [name,data,size] of [['position',points,3],['starSize',sizes,1],['phase',phases,1],['tint',tints,3],['drift',velocities,2]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(data,size));
  const starMaterial=new THREE.ShaderMaterial({uniforms,transparent:false,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute float starSize,phase;attribute vec3 tint;attribute vec2 drift;uniform float time,starViewport,starAspect;
      varying float vPhase,vSize,vHeight;varying vec3 vTint;
      void main(){
        float depth=-position.z,nearLayer=1.-clamp((depth-100.)/270.,0.,1.);
        vec2 span=vec2(max(4.8,starAspect*2.+.8),2.7);
        vec2 p=position.xy/(depth*.4244748162);
        p.x*=span.x/4.8;
        p=mod(p+drift*time+span*.5,span)-span*.5;
        p+=vec2(sin(time*.15+phase),cos(time*.12+phase))*.007*nearLayer;
        gl_Position=vec4(p.x/starAspect,p.y,.99998,1.);
        gl_PointSize=starSize*starViewport/941.*pow(230./depth,.35);
        vPhase=phase;vSize=starSize;vTint=tint;vHeight=p.y*.5+.5;}`,
    fragmentShader:`uniform float time,quiet,reflectionPass;uniform vec2 cover;
      varying float vPhase,vSize,vHeight;varying vec3 vTint;
      void main(){if(reflectionPass>.5)discard;
        float height=(vHeight-.5)*cover.y+.5;if(quiet<.5&&height<.475)discard;
        vec2 p=gl_PointCoord-.5;float radius=length(p);
        float core=exp(-radius*radius*180.),halo=exp(-radius*radius*25.)*.09;
        float crossLight=(exp(-abs(p.x)*95.)+exp(-abs(p.y)*95.))*exp(-radius*9.)*.13*step(11.,vSize);
        float twinkle=.72+.28*sin(time*(.45+vPhase*.035)+vPhase);
        float fade=mix(smoothstep(.475,.56,height),.82,quiet);
        float strength=(core+halo+crossLight)*twinkle*fade;
        gl_FragColor=vec4(vTint*(vSize>11.?2.6:1.15),strength);
      }`});
  const stars=new THREE.Points(geometry,starMaterial);stars.name='depth-layered-stars';stars.frustumCulled=false;stars.renderOrder=-900;scene.add(stars);
  const meteors=createMeteorShower(THREE,scene,uniforms);
  return {uniforms,sampleGLSL,
    update(seconds,aspect,reduced=false,content=false,camera,viewportHeight=941,yaw=0){
      uniforms.time.value=reduced?0:seconds;uniforms.quiet.value=content||!ocean?1:0;
      uniforms.cover.value.set(Math.min(1,aspect/plateAspect),Math.min(1,plateAspect/aspect));
      uniforms.starViewport.value=viewportHeight;uniforms.starAspect.value=aspect;
      uniforms.nebulaCover.value.set(Math.min(1,aspect/nebulaAspect),Math.min(1,nebulaAspect/aspect));
      meteors.update(seconds,aspect,reduced);
      if(camera){stars.position.copy(camera.position);stars.quaternion.copy(camera.quaternion);}
    },
    dispose(){disposed=true;meteors.dispose();scene.remove(mesh,stars);mesh.geometry.dispose();material.dispose();geometry.dispose();starMaterial.dispose();plate?.dispose();nebula.dispose();}
  };
}

// Legacy company/product renderers use the same atmosphere and owner clock.
// They have no ocean, and supply their existing exposure and pixel dimensions.
export function createSpaceAtmosphere(THREE,scene,{exposure=1}={}) {
  const sky=createStarOceanAtmosphere(THREE,scene,undefined,exposure,{ocean:false});
  return {uniforms:sky.uniforms,
    update(seconds,ratio,reduced=false,_globalMix=0,_detail=0,_story=0,yaw=0,viewportHeight=941){
      sky.update(seconds,ratio,reduced,true,undefined,viewportHeight,yaw);
    },
    dispose:sky.dispose,
  };
}
