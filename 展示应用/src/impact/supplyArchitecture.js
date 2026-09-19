import * as THREE from 'three';
import {V,flow} from './depthGeometry.js';

// A light-filled industrial nave. The open crown keeps the operating lines visible.
export function createProductionCanopy(parent,materials){
  const root=new THREE.Group(),routes=[];parent.add(root);
  const profile=new THREE.Shape();profile.moveTo(-.24,-1.1);profile.lineTo(.24,-1.1);profile.lineTo(.24,1.1);profile.lineTo(-.24,1.1);profile.closePath();
  const ribPath=z=>new THREE.CatmullRomCurve3([V(-4.3,0,z),V(-4.3,14,z),V(-1,25,z),V(10,28,z),V(23,24,z),V(28,12,z),V(28,0,z)]);
  const ribGeometry=new THREE.ExtrudeGeometry(profile,{steps:64,bevelEnabled:false,extrudePath:ribPath(0)});
  for(let i=0;i<12;i++){
    const z=11-i*4.1,rib=new THREE.Mesh(ribGeometry,materials.silver);rib.position.z=z;rib.castShadow=rib.receiveShadow=true;root.add(rib);
    const path=ribPath(z),points=path.getPoints(100);
    const edge=new THREE.Mesh(new THREE.TubeGeometry(path,100,.035,5,false),materials.light);edge.position.z=1.14;root.add(edge);
    // Restrained louvres along one shoulder leave the centre open to the sky.
    const positions=[],indices=[];
    for(let n=0;n<=40;n++){
      const p=path.getPoint(.17+n/40*.2);positions.push(p.x,p.y+.18,p.z-.45,p.x,p.y+.18,p.z-3.55);
      if(n<40){const k=n*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
    }
    const surface=new THREE.BufferGeometry();surface.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));surface.setIndex(indices);surface.computeVertexNormals();
    const louvre=new THREE.Mesh(surface,materials.navy);louvre.material.side=THREE.DoubleSide;louvre.castShadow=true;root.add(louvre);
    if(i%3===0)routes.push(flow(root,points,{color:'#b9e9ff',radius:.08,speed:.09,offset:i*.16}));
  }
  for(const x of [-4.3,28]){
    const rail=new THREE.Mesh(new THREE.BoxGeometry(.2,.24,47),materials.gold);rail.position.set(x,9,-12);root.add(rail);
  }
  return {root,update:time=>routes.forEach(route=>route.update(time))};
}

export function createNetworkApron(parent){
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float time;
      void main(){
        vec2 p=(vUv-.5)*vec2(150.,170.);vec2 cell=abs(fract(p/5.-.5)-.5)/fwidth(p/5.);
        float grid=1.-min(min(cell.x,cell.y),1.);
        float falloff=1.-smoothstep(.14,.53,length(vUv-.5));
        float sweep=exp(-pow((p.y+75.-mod(time*3.,160.))*.1,2.));
        gl_FragColor=vec4(mix(vec3(.14,.34,.47),vec3(.34,.7,.88),sweep),grid*falloff*(.045+sweep*.08));
      }`});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(150,170),material);plane.rotation.x=-Math.PI/2;plane.position.set(10,-.8,-18);parent.add(plane);
  return {update:time=>material.uniforms.time.value=time};
}

// Three streams express the confirmed collaboration roles, not measured freight routes.
export function createGlobalStreams(parent){
  const root=new THREE.Group(),materials=[];root.visible=false;parent.add(root);
  const paths=[
    [V(-36,51,-117),V(-32,49,-58),V(-18,35,9),V(7,15,20)],
    [V(2,67,-111),V(29,56,-68),V(39,41,-29),V(10,28,-10)],
    [V(29,26,-104),V(51,29,-76),V(43,23,-47),V(20,10,-47)],
  ];
  paths.forEach((points,i)=>{
    const path=new THREE.CatmullRomCurve3(points);
    for(let lane=0;lane<3;lane++){
      const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},strength:{value:0},offset:{value:i*.25+lane*.065},color:{value:new THREE.Color(lane===1?'#f6d293':'#80d7ff').multiplyScalar(lane===1?2.6:1.5)}},
        vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:'varying vec2 vUv;uniform float time;uniform float strength;uniform float offset;uniform vec3 color;void main(){float wave=pow(1.-smoothstep(0.,.4,fract(time*.075+offset-vUv.x)),2.);float edge=smoothstep(0.,.08,vUv.x)*smoothstep(0.,.04,1.-vUv.x);gl_FragColor=vec4(color,(.065+wave*.85)*edge*strength);}',
      });
      const stream=new THREE.Mesh(new THREE.TubeGeometry(path,120,lane===1?.15:.045,6,false),material);stream.position.x=(lane-1)*.33;root.add(stream);materials.push(material);
    }
  });
  return {root,update(time,strength){root.visible=strength>.001;materials.forEach(m=>{m.uniforms.time.value=time;m.uniforms.strength.value=strength;});}};
}
