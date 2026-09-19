import * as THREE from 'three';

const TAU=Math.PI*2;
const fract=x=>x-Math.floor(x);
const random=i=>fract(Math.sin(i*127.1+311.7)*43758.5453);

// Particle identity survives every stage. The same pieces become a lattice,
// analytical sphere, crystal, decision panels, globe and accumulated knowledge.
export function createIntelligenceMatter(quality){
  const root=new THREE.Group();root.name='continuous-intelligence-matter';
  const count=quality?.preset==='fluid'?1400:2400,fragmentCount=108;
  const targets=Array.from({length:6},()=>new Float32Array(count*3));
  const position=new Float32Array(count*3),sizes=new Float32Array(count),colors=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const u=random(i+3),v=random(i+61),w=random(i+721),phi=u*TAU,z=v*2-1,r=Math.sqrt(1-z*z),sphere=[Math.cos(phi)*r,Math.sin(phi)*r,z];
    const sheet=i%3;
    // The source streams condense into one knowledge core before it unfolds
    // into the analytical sphere. Particle identities persist across both.
    const knowledgeRadius=.35+Math.cbrt(w)*.58;
    targets[0].set([sphere[0]*knowledgeRadius,sphere[1]*knowledgeRadius*1.15,sphere[2]*knowledgeRadius*.74+.12],i*3);
    targets[1].set(sphere.map(n=>n*(1.85+w*.24)),i*3);
    const oct=2.55/(Math.abs(sphere[0])+Math.abs(sphere[1])+Math.abs(sphere[2]));
    targets[2].set(sphere.map(n=>n*oct),i*3);
    const panel=i%3;
    targets[3].set([(u-.5)*1.7+(panel-1)*1.55,(v-.5)*3.25+.15*panel,(panel-1)*-.6],i*3);
    targets[4].set(sphere.map(n=>n*2.29),i*3);
    targets[5].set([(sheet-1)*1.12+(u-.5)*1.35,(v-.5)*1.85,sheet===1?.5:-.05],i*3);
    sizes[i]=.55+Math.pow(w,5)*1.5;
    const gold=i%19===0;colors.set(gold?[1,.72,.32]:[.35+w*.45,.64+w*.3,1],i*3);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const pointMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,
    uniforms:{alpha:{value:1},resolutionScale:{value:1}},
    vertexShader:'attribute float aSize;uniform float resolutionScale;varying vec3 tint;void main(){tint=color;vec4 p=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*p;gl_PointSize=clamp(95.0*aSize*resolutionScale/-p.z,1.0,18.0);}',
    fragmentShader:'uniform float alpha;varying vec3 tint;void main(){float d=length(gl_PointCoord-.5)*2.0;float core=exp(-d*d*10.0);gl_FragColor=vec4(tint*1.4,core*alpha);}'
  });
  const points=new THREE.Points(geometry,pointMaterial);points.frustumCulled=false;root.add(points);
  const fragmentMaterial=new THREE.MeshPhysicalMaterial({color:'#a6d9ff',metalness:.72,roughness:.14,clearcoat:1,emissive:'#165294',emissiveIntensity:.45});
  const fragments=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.5,0),fragmentMaterial,fragmentCount);fragments.frustumCulled=false;root.add(fragments);
  const dummy=new THREE.Object3D();
  return {root,points,fragments,targets,
    update({time=0,weights,placements,alpha=1,detailMix=0,reduced=false,pixelHeight=1080}){
      const clock=reduced?0:time;
      const strongest=Math.max(...weights),changing=(1-strongest)*2;
      // Readable material surfaces during a hold; the shared particles become
      // visible primarily while carrying a shape into the next stage.
      pointMaterial.uniforms.alpha.value=alpha*(.035+changing*.23);pointMaterial.uniforms.resolutionScale.value=Math.max(.8,pixelHeight/1080);
      fragments.visible=changing>.06;
      root.visible=alpha>.003;
      // No geometry allocation or normal recomputation in the shared frame loop.
      for(let i=0;i<count;i++){
        let x=0,y=0,z=0;
        const k=i*3,pulse=Math.sin(clock*.42+i*2.39)*.055;
        for(let stage=0;stage<6;stage++){
          const weight=weights[stage];if(weight<.00001)continue;
          const data=targets[stage],p=placements[stage],spin=clock*(stage===1?.09:stage===4?.04:0);
          const c=Math.cos(spin),s=Math.sin(spin),px=data[k]*c+data[k+2]*s,pz=data[k+2]*c-data[k]*s;
          const bob=Math.sin(clock*.7+i*.17)*.035;
          const cy=Math.cos(p.yaw||0),sy=Math.sin(p.yaw||0),cx=Math.cos(p.tilt||0),sx=Math.sin(p.tilt||0);
          const rotatedX=(px+pulse)*cy+pz*sy,rotatedZ=pz*cy-(px+pulse)*sy,py=data[k+1]+bob;
          x+=(p.x+rotatedX*p.scale)*weight;
          y+=(p.y+(py*cx-rotatedZ*sx)*p.scale)*weight;
          z+=(p.z+(rotatedZ*cx+py*sx)*p.scale)*weight;
        }
        // Knowledge returns below the exhibit instead of crossing through peers.
        const returnArc=4*weights[5]*weights[0]*(1-detailMix);
        position[k]=x;position[k+1]=y-4.4*returnArc;position[k+2]=z-.4*returnArc;
      }
      geometry.attributes.position.needsUpdate=true;
      let scale=0,peak=0;for(let j=0;j<6;j++){scale+=placements[j].scale*weights[j];peak=Math.max(peak,weights[j]);}
      const reorganization=1+(1-peak)*4.5;
      for(let i=0;i<fragmentCount;i++){
        const index=Math.floor(i/fragmentCount*count),k=index*3;
        dummy.position.set(position[k],position[k+1],position[k+2]);dummy.rotation.set(clock*.13+i,clock*.17+i*2,clock*.08+i*.7);
        dummy.scale.setScalar((.027+random(i+12)*.026)*scale*alpha*reorganization);dummy.updateMatrix();fragments.setMatrixAt(i,dummy.matrix);
      }
      fragments.instanceMatrix.needsUpdate=true;

    },
  };
}
