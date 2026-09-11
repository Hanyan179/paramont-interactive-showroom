// Shared, continuous scene atmosphere. Time is supplied by the active renderer.
export function createSpaceAtmosphere(THREE,scene) {
  const uniforms={time:{value:0},aspect:{value:1},globalMix:{value:0},detail:{value:0},yaw:{value:0},
    deep:{value:new THREE.Color('#071725')},blue:{value:new THREE.Color('#315873')},silver:{value:new THREE.Color('#557082')}};
  const material=new THREE.ShaderMaterial({depthWrite:false,depthTest:false,toneMapped:false,uniforms,
    vertexShader:'varying vec2 pUv;void main(){pUv=uv;gl_Position=vec4(position.xy,1.,1.);}',
    fragmentShader:`
      varying vec2 pUv;uniform float time,aspect,globalMix,detail,yaw;uniform vec3 deep,blue,silver;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.03+13.7;a*=.5;}return s;}
      float stars(vec2 p,float scale,float seed){vec2 q=p*scale,id=floor(q),v=fract(q)-.5;float h=hash(id+seed);return step(.986,h)*exp(-dot(v,v)*mix(420.,1700.,h))*(.3+.4*h);}
      float meteor(vec2 p,float offset){
        float clock=time+offset,epoch=floor(clock/23.),age=mod(clock,23.);
        float visible=smoothstep(0.,.25,age)*(1.-smoothstep(1.5,2.2,age));
        vec2 origin=vec2(.48+hash(vec2(epoch,offset))*.4,.94);
        vec2 head=origin+vec2(-.16,-.075)*age;
        vec2 v=p-head,dir=normalize(vec2(.16,.075));float along=dot(v,dir);
        float crossTrail=abs(v.x*dir.y-v.y*dir.x);
        float trail=exp(-crossTrail*1400.)*exp(-along*32.)*step(0.,along)*step(along,.14);
        float spark=exp(-dot(v,v)*950000.);
        return (trail*.30+spark*.75)*visible*smoothstep(.69,.81,p.y);
      }
      void main(){
        vec2 p=pUv,q=vec2(p.x*aspect,p.y);float t=time*.037;
        vec2 drift=vec2(t*.22+yaw*.025,t*.09);
        float cloud=fbm(q*2.2+drift),fine=fbm(q*6.-drift*.65);
        float height=.50+.14*sin(p.x*3.1+t*.42)+cloud*.19;
        float canopy=exp(-pow((p.y-height)/.25,2.));
        float veil=exp(-pow((p.y-.22-.09*cloud)/.13,2.));
        vec3 col=deep+blue*canopy*(.16+.48*cloud);
        col+=silver*veil*(.065+.095*fine);
        col+=blue*.075*pow(fine,2.);
        float reading=mix(1.-smoothstep(.19,.48,p.x),smoothstep(.56,.84,p.x),globalMix);
        col*=1.-reading*.12;
        float specks=stars(q+drift*.06,51.,1.)+stars(q+drift*.11,28.,17.);
        col+=vec3(.34,.50,.64)*specks*(1.-reading*.7)*(1.-detail*.35);
        col+=vec3(.25,.40,.54)*meteor(p,8.);
        float edge=1.-smoothstep(.25,.9,length((p-.5)*vec2(.95,1.)));
        col*=.78+.22*edge;
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);mesh.name='unified-flowing-space';mesh.frustumCulled=false;mesh.renderOrder=-1000;scene.add(mesh);
  return {update(seconds,ratio,reduced=false,globalMix=0,detail=0,story=0,yaw=0){uniforms.time.value=reduced?0:seconds;uniforms.aspect.value=ratio;uniforms.globalMix.value=globalMix;uniforms.detail.value=detail;uniforms.yaw.value=yaw;},dispose(){scene.remove(mesh);mesh.geometry.dispose();material.dispose();}};
}
