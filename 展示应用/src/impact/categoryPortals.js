import * as THREE from 'three';
import {categoryThemes,categoryThemeId} from './categoryTheme.js';
import featured from '../../../共享数据/featured-categories.json';
import {portalSize,portalPose,portalCamera,portalFocusPose} from './categoryPortalLayout.js';

export function createCategoryPortals(manager){
  const root=new THREE.Group(),loader=new THREE.TextureLoader(manager),items=[];
  const {width,height,faceWidth,faceHeight,faceZ,floor}=portalSize;
  const frameMaterial=new THREE.MeshStandardMaterial({color:'#263f52',metalness:.35,roughness:.5});
  const backingGeometry=new THREE.BoxGeometry(width-.04,height-.04,.18),faceGeometry=new THREE.PlaneGeometry(faceWidth,faceHeight);
  // A closed bevelled ring has no coplanar corner overlaps or hairline seams.
  const frameShape=new THREE.Shape(),hole=new THREE.Path();
  const outerW=(width-.032)/2,outerH=(height-.032)/2,innerW=faceWidth/2,innerH=faceHeight/2;
  frameShape.moveTo(-outerW,-outerH);frameShape.lineTo(outerW,-outerH);frameShape.lineTo(outerW,outerH);frameShape.lineTo(-outerW,outerH);frameShape.closePath();
  hole.moveTo(-innerW,-innerH);hole.lineTo(-innerW,innerH);hole.lineTo(innerW,innerH);hole.lineTo(innerW,-innerH);hole.closePath();frameShape.holes.push(hole);
  const frameGeometry=new THREE.ExtrudeGeometry(frameShape,{depth:.14,steps:1,bevelEnabled:true,bevelThickness:.018,bevelSize:.016,bevelSegments:2});
  const put=(geometry,material,parent,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
  // A fading ground plane ties the real exhibit geometry to the shared space,
  // without placing an unrelated interior photograph behind the windows.
  const groundMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{color:{value:new THREE.Color(categoryThemes.light.floor)},opacity:{value:.3}},vertexShader:`varying vec2 groundUv;void main(){groundUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 groundUv;uniform vec3 color;uniform float opacity;void main(){vec2 p=(groundUv-.5)*2.;float fade=pow(max(0.,1.-dot(p,p)),3.);gl_FragColor=vec4(color,fade*opacity);
  #include <colorspace_fragment>
  }`});
  const ground=put(new THREE.PlaneGeometry(82,56),groundMaterial,root,0,floor-.04,0);ground.rotation.x=-Math.PI/2;ground.renderOrder=-2;
  const faces=[];
  let focusMix=0,focusIndex=0,language=null,theme=null;
  function paintFace(face,lang,themeId){
    const {canvas,texture,entry,image}=face,ctx=canvas.getContext('2d'),palette=categoryThemes[themeId],l=lang==='en'?1:0,w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle=palette.caption;ctx.fillRect(0,0,w,h);
    if(image){
      const imageHeight=w*image.height/image.width;
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,w,imageHeight);
      const fade=ctx.createLinearGradient(0,h*.67,0,imageHeight+2);
      fade.addColorStop(0,palette.caption+'00');fade.addColorStop(.35,palette.caption+'18');fade.addColorStop(.75,palette.caption+'a8');fade.addColorStop(1,palette.caption);
      ctx.fillStyle=fade;ctx.fillRect(0,h*.67,w,h*(1-.67));
    }
    ctx.textAlign='center';ctx.fillStyle=palette.captionInk;let size=l?92:104;
    do{ctx.font=`500 ${size}px ${l?'Arial':'"PingFang SC","Microsoft YaHei"'},sans-serif`;if(ctx.measureText(entry.name[l]).width<w*.88)break;size-=2;}while(size>42);
    ctx.fillText(entry.name[l],w/2,h-250);
    ctx.fillStyle=palette.captionMuted;ctx.font=`400 54px ${l?'"PingFang SC","Microsoft YaHei"':'Arial'},sans-serif`;ctx.fillText(entry.name[1-l],w/2,h-150);
    texture.needsUpdate=true;
  }
  for(const [index,entry] of featured.categories.entries()){
    const group=new THREE.Group(),pose=portalPose(index),cardFrame=frameMaterial.clone();root.add(group);
    const backing=put(backingGeometry,cardFrame,group,0,0,-.10);backing.castShadow=true;
    put(frameGeometry,cardFrame,group).castShadow=true;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=Math.round(1024*faceHeight/faceWidth);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const face={canvas,texture,entry,image:null};faces.push(face);
    put(faceGeometry,new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),group,0,0,faceZ);
    loader.load(`/media/categories/portraits-v3/${entry.id}.png`,source=>{face.image=source.image;paintFace(face,language||'zh',theme||'dark');source.dispose();});
    const materials=new Set();group.traverse(object=>{if(object.material)materials.add(object.material);});
    items.push({group,pose,index,materials,cardFrame,weight:0});
  }
  frameMaterial.dispose();
  const shadowMaterial=new THREE.ShadowMaterial({color:'#29251e',opacity:.2,depthWrite:false});
  const shadowFloor=put(new THREE.PlaneGeometry(140,140),shadowMaterial,root,0,floor-.015,0);shadowFloor.rotation.x=-Math.PI/2;shadowFloor.receiveShadow=true;
  function captions(lang,themeId='dark'){
    const id=categoryThemeId(themeId);
    if(language===lang&&theme===id)return;language=lang;theme=id;
    const palette=categoryThemes[id];

    items.forEach(({cardFrame})=>{cardFrame.color.set(palette.frame);});
    groundMaterial.uniforms.color.value.set(palette.floor);
    faces.forEach(face=>paintFace(face,lang,id));
  }
  return {root,
    update({time=0,featuredCategory=0,categoryFocused=false,featuredOffset=0,aspect=16/9,dt=.016,overviewImmediate=false,lang='zh',categoryTheme='dark',camera,target}){
      captions(lang,categoryTheme);focusIndex=featuredCategory;
      focusMix=overviewImmediate?Number(categoryFocused):THREE.MathUtils.damp(focusMix,Number(categoryFocused),5.5,dt);
      shadowMaterial.opacity=.2*(1-focusMix);
      groundMaterial.uniforms.opacity.value=.3*Math.pow(1-focusMix,3);
      ground.visible=focusMix<.995;
      const framing=portalCamera(aspect),focus=portalFocusPose(aspect);
      camera?.set(0,framing.y,framing.z);target?.set(0,framing.y,0);
      const sway=Math.sin(time*.13)*.035+featuredOffset*.16;
      items.forEach(item=>{
        const {group,pose,index,materials}=item,selected=index===featuredCategory;
        item.weight=overviewImmediate?Number(selected):THREE.MathUtils.damp(item.weight,Number(selected),5.5,dt);
        const near=item.weight*focusMix;
        const {x:targetX,z:targetZ,scale:targetScale}=focus;
        group.position.set(THREE.MathUtils.lerp(pose.x+Math.sin(sway)*2,THREE.MathUtils.lerp(targetX+12,targetX,item.weight),focusMix),THREE.MathUtils.lerp(pose.y,framing.y,near),THREE.MathUtils.lerp(pose.z,THREE.MathUtils.lerp(-9,targetZ,item.weight),focusMix));
        group.rotation.y=THREE.MathUtils.lerp(pose.yaw+sway,-.035,near);
        group.scale.setScalar(THREE.MathUtils.lerp(1,THREE.MathUtils.lerp(.76,targetScale,item.weight),focusMix));
        const opacity=Math.min(1,Math.pow(1-focusMix,3)+item.weight*focusMix);
        materials.forEach(material=>{const transparent=opacity<.999;material.opacity=opacity;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}});
        group.visible=selected||opacity>.005;
      });
    },
    project(camera,w,h){
      root.updateWorldMatrix(true,true);
      return items.map(({group,index})=>{
        const corners=[[-width/2,height/2],[width/2,height/2],[width/2,-height/2],[-width/2,-height/2]].map(([x,y])=>{
          const p=group.localToWorld(new THREE.Vector3(x,y,.16)).project(camera);return[(p.x+1)*w/2,(1-p.y)*h/2];
        });
        const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),boundWidth=Math.max(...xs)-x,boundHeight=Math.max(...ys)-y;
        return {index,x,y,width:boundWidth,height:boundHeight,clip:corners.map(p=>`${(p[0]-x)/boundWidth*100}% ${(p[1]-y)/boundHeight*100}%`).join(','),visible:group.visible&&focusMix<.08,focused:index===focusIndex,settled:focusMix<.005||focusMix>.995};
      });
    },prepare(){captions('zh');items.forEach(({group})=>group.visible=true);}
  };
}
