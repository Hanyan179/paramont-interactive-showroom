import * as THREE from 'three';
import {journeyFrame,ramp,lerp,stageFrames} from './intelligenceTimeline.js';
import {presenceAt,typedCount,typeMesh} from './intelligencePresence.js';
import {createJourneyObjects,alpha} from './intelligenceJourneyObjects.js';
export const intelligenceLayout={heroX:.70,heroY:.44,detailX:.70,detailY:.44};
const HEIGHT=2*Math.tan(THREE.MathUtils.degToRad(23))*32,TAU=Math.PI*2;
const reviewSlots=[[0,0],[-3.1,1.65],[0,1.8],[3.1,1.65],[-3.3,0],[3.3,0],[-3.1,-1.7],[0,-1.8],[3.1,-1.7],[-1.6,2.65],[1.6,2.65],[0,-2.7]];
export function intelligenceWorld(quality,manager){
 const root=new THREE.Group();root.name='intelligence-continuous-exhibit';
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(240,160),new THREE.MeshBasicMaterial({color:'#030b16',fog:false}));backdrop.position.z=-12;root.add(backdrop);
 const o=createJourneyObjects(manager);root.add(o.root);
 const temp=new THREE.Vector3(),position=new THREE.Vector3(0,0,32),origin=new THREE.Vector3(),panelPivot=new THREE.Vector3(-1.35,.05,0),panelRotation=new THREE.Quaternion(),panelEuler=new THREE.Euler();
 const pose=()=>({position:position.clone(),target:origin.clone()});
 return {root,
  update({camera,target,aspect=16/9,intelligence=null}){
   const t=intelligence?.time??stageFrames[intelligence?.stage??0],f=journeyFrame(t),width=HEIGHT*aspect,scale=Math.min(width*.049,HEIGHT*.093);
   o.root.position.set(width*.20,HEIGHT*.045,0);o.root.scale.setScalar(scale);
   const presence=ramp(t,5,16)*(1-ramp(t,99,105));alpha(o.ambience,presence*.26);
   const presencePose=presenceAt(t);
   const glassVisibility=ramp(t,11,17)*(1-ramp(t,49,54)),dock=ramp(t,33,37),collapse=ramp(t,24,32);
   o.body.position.set(lerp(0,3.25,dock),lerp(.2,.18,dock)+presencePose.float.lift,0);o.body.scale.setScalar(lerp(1.22,.78,dock));
   o.body.rotation.set(lerp(.17,.025,f.crystal)+presencePose.float.x*.4,lerp(.57,.12,f.crystal)-presencePose.look*.48+presencePose.float.y*.6,lerp(-.04,-.02,f.crystal)+presencePose.float.z);
   o.crystal.morph(f.crystal,t);alpha(o.crystal.shell,glassVisibility*lerp(.18,.18,f.crystal));alpha(o.crystal.inner,glassVisibility*f.crystal*.82);alpha(o.crystal.edges,glassVisibility*lerp(.3,.09,f.crystal));
   alpha(o.crystal.cells,ramp(t,8,15)*(1-ramp(t,28,32))*.73);
   o.thumbnails.forEach((tile,i)=>{
    const gather=ramp(t,8+(i%12)*.15,16),col=i%5,row=Math.floor(i/5)%5,side=i>=25;
    const px=side?-1.42:(col-2)*.55,py=(row-2)*.55,pz=side?(col-2)*.55:1.42;
    tile.position.set(lerp(Math.sin(i*2.4)*3.2,px,gather)*(1-collapse*.8),lerp(Math.cos(i*1.7)*2,py,gather)*(1-collapse*.8),lerp(0,pz,gather)*(1-collapse*.8));tile.rotation.y=side?-Math.PI/2:0;tile.scale.setScalar(lerp(1.4,1,gather)*(1-collapse*.85));alpha(tile,ramp(t,5+(i%12)*.2,7+(i%12)*.2)*(1-ramp(t,26,30))*.9);
   });
   const coreAlpha=ramp(t,27,34)*(1-ramp(t,49,54));o.eye.visible=coreAlpha>.001;o.eye.children.forEach(part=>alpha(part,coreAlpha));o.cursor.visible=false;alpha(o.core,coreAlpha);alpha(o.coreRim,coreAlpha*.8);alpha(o.halo,coreAlpha*(.45+.06*Math.sin(t*.7)));o.core.scale.setScalar(.42+.08*Math.sin(t*.7));
   o.eye.position.set(presencePose.eyeX,presencePose.eyeY,1.0);o.eye.scale.set(1,presencePose.blink,1);o.eye.rotation.y=-presencePose.look*.22;
   for(const part of [o.housing,o.iris,o.pupil,o.glint])alpha(part,coreAlpha);
   o.iris.scale.setScalar(1+.08*Math.sin(t*1.4));o.pupil.position.x=presencePose.eyeX*.25;o.pupil.position.y=presencePose.eyeY*.2;
   o.core.position.set(presencePose.eyeX,presencePose.eyeY,1.22);o.coreRim.position.set(presencePose.eyeX,presencePose.eyeY,1.0);o.coreRim.scale.set(1,presencePose.blink,1);o.halo.position.set(presencePose.eyeX,presencePose.eyeY,1.1);
   o.floor.position.set(o.body.position.x,lerp(-2.45,-1.67,dock),-.3);o.floor.scale.set(lerp(5.5,2.9,dock),.55,1);alpha(o.floor,glassVisibility*.32);
   const scanPhase=ramp(t,18.8,24);o.scan.position.y=lerp(1.5,-1.5,scanPhase);const scanAlpha=ramp(t,18,19)*(1-ramp(t,24,25));alpha(o.scan,scanAlpha*.12);alpha(o.scanEdge,scanAlpha*.8);
   const relation=ramp(t,21,24)*(1-ramp(t,29,33));alpha(o.links,relation*.6);o.nodes.forEach((node,i)=>alpha(node,relation*(.45+.4*Math.sin(t*.8+i)**2)));
   o.records.forEach((mesh,i)=>{
    let a=0,x=0,y=0,z=0,s=1,framing=0;const count=(t<34||i===0)?typedCount(t,mesh.userData.typing.text.length,i):mesh.userData.typing.text.length;const letterOffset=typeMesh(mesh,count);
    if(t<34){
     const onset=i===0?1:ramp(t,2.8+Math.min(i,12)*.36,3.2+Math.min(i,12)*.36),localGather=ramp(t,7+(i%6)*.27,15.7+(i%5)*.22);
     const scatterX=i===0?0:Math.sin(i*2.399)*lerp(1.5,4,(i%7)/6),scatterY=i===0?0:Math.cos(i*1.71)*2.5;
     temp.set((i%4-1.5)*.72,(Math.floor(i/4)%4-1.5)*.7,(Math.floor(i/16)-1)*.88).multiplyScalar((1-collapse*.84)*o.body.scale.x).applyEuler(o.body.rotation);
     const bow=Math.sin(localGather*Math.PI)*.55;
     x=lerp(scatterX,temp.x,localGather)+Math.sin(i)*bow;y=lerp(scatterY,temp.y+.2,localGather)+Math.cos(i)*bow;z=lerp(0,temp.z,localGather);
     s=lerp(i===0?1:.55,.22,localGather);a=onset*(1-ramp(t,25.5,32));if(i>12)a*=.45;
     framing=ramp(t,4.6+i*.12,6.5+i*.12)*(1-ramp(t,10,16))*(i<12?.7:.3);
    }else if(t>=85&&i<12){
     const emerge=i===0?ramp(t,85,87):ramp(t,89+(i%6)*.55,91+(i%6)*.55),release=ramp(t,93,99),closing=ramp(t,100,106);
     const pageX=-2.3+(i%2)*4,pageY=-2.52-Math.floor(i/2)*.42;
     const [spreadX,spreadY]=reviewSlots[i];
     x=lerp(pageX,spreadX,release);y=lerp(pageY,spreadY,release);z=lerp(.3,i===0?.35:(i%3-1)*.7,release);
     if(i===0){x=lerp(x,0,closing);y=lerp(y,0,closing);z=lerp(z,0,closing);s=lerp(.3,1,release);a=emerge;}
     else{s=lerp(.3,i>8?.38:.6,release);a=emerge*(1-ramp(t,99+i*.37,101+i*.4));if(i>3)a*=.78;}
     if(i>1)a*=ramp(t,93,95);framing=1-ramp(t,99,104);
    }
    if(i===0)x+=letterOffset*s;
    mesh.position.set(x,y,z);mesh.scale.setScalar(s);mesh.rotation.y=(t>=85&&i>0)?Math.sin(i)*.08*ramp(t,93,99):0;alpha(mesh,a*(count>0?1:0));alpha(mesh.children[0],a*framing);
   });
   const first=o.records[0],typing=first.userData.typing;
   const cursorVisible=(1-ramp(t,2.3,2.8))+ramp(t,104,107.5);
   o.cursor.position.copy(first.position);o.cursor.position.x+=(typing.widths[first.userData.typedCount]-typing.total/2)/1024*typing.width+.08;o.cursor.scale.setScalar(first.scale.x);alpha(o.cursor,cursorVisible*.85);
   const screenAlpha=ramp(t,37,39)*(1-ramp(t,56,59));o.screen.position.set(lerp(lerp(1.9,-1.35,f.project),0,f.zoom),.05,0);o.screen.rotation.set(.065*(1-f.zoom),.53*(1-f.zoom),-.025*(1-f.zoom));o.screen.scale.set(lerp(.015,lerp(1,1.38,f.zoom),f.project),lerp(1,1.18,f.zoom),1);alpha(o.screen,screenAlpha);alpha(o.screenBody,screenAlpha*.45);o.scanLine.visible=false;o.projection.aim(o.core,o.screen,o.root,0,f.project);alpha(o.screenBody,screenAlpha*.7);
   o.scanLine.position.y=presencePose.scanY;alpha(o.scanLine,ramp(t,38,39)*(1-ramp(t,49,51))*.7);
   alpha(o.beam,ramp(t,36,39)*(1-ramp(t,49,53))*.14);
   panelRotation.setFromEuler(panelEuler.set(.065*(1-f.zoom),.53*(1-f.zoom),-.025*(1-f.zoom)));
   let recommended={x:0,y:0,z:0,scale:1};
   const grid=[[-.7,.75],[.97,.75],[-.7,-.66],[.97,-.66],[-3.05,-1.42]];
   o.cards.forEach((card,i)=>{
    const angle=(i-4)*TAU/5+(1-ramp(t,59,66))*1.65;
    const rowX=lerp(grid[i][0],grid[i][0]*1.35+1.35,f.zoom),rowY=grid[i][1]*lerp(1,1.18,f.zoom);
    const spreadX=(i-2)*1.9,rx=Math.sin(angle)*3.2,ry=-Math.cos(angle)*1.0+.1,rz=Math.cos(angle)*1.15;
    const x=lerp(lerp(rowX,spreadX,f.spread),rx,f.ring),y=lerp(lerp(rowY,(i%2)*.25,f.spread),ry,f.ring),z=lerp(.15,rz,f.ring);
    const focus=i===4?ramp(t,70,74):0,expand=ramp(t,51,59),sx=lerp(lerp((i===4?.76:.60)*lerp(1,1.3,f.zoom),.72,expand),1.04,f.ring)*lerp(1,2.25,focus),sy=lerp(lerp((i===4?.48:.69)*lerp(1,1.18,f.zoom),.72,expand),1,f.ring)*lerp(1,2.25,focus);
    card.position.set(lerp(x,0,focus),lerp(y,0,focus),lerp(z,1.8,focus));card.scale.set(sx,sy,1);card.rotation.y=Math.sin(angle)*f.ring*.25*(1-focus);
    const visible=ramp(t,39+i*1.7,40.2+i*1.7)*(1-ramp(t,i===4?73:69,i===4?76:73));card.visible=visible>.001;card.material.opacity=visible*expand*(i===4?1:lerp(1,.28,ramp(t,66,70)));alpha(card.children[0],visible*(1-expand));card.children[0].userData.reveal.value=ramp(t,39+i*1.7,41+i*1.7);
    if(t<55){card.position.sub(panelPivot).applyQuaternion(panelRotation).add(panelPivot);card.quaternion.copy(panelRotation);}
    if(i===4)recommended={x:card.position.x,y:card.position.y,z:card.position.z,scale:sx};
   });
   alpha(o.orbit,ramp(t,60,65)*(1-ramp(t,70,74))*.38);
   const imageToCard=ramp(t,50,55),imageToHero=ramp(t,71,77),imageToPage=ramp(t,79,85);
   const x1=lerp(-3.12,recommended.x,imageToCard),y1=lerp(.33,recommended.y-.08,imageToCard),z1=lerp(.3,recommended.z+.08,imageToCard),size1=lerp(2.15,1.2*recommended.scale,imageToCard);
   o.product.position.set(lerp(lerp(x1,0,imageToHero),-2.26,imageToPage),lerp(lerp(y1,.25,imageToHero),.18,imageToPage),lerp(lerp(z1,2,imageToHero),.3,imageToPage));o.product.scale.setScalar(lerp(lerp(size1,5.9,imageToHero),3.48,imageToPage));alpha(o.product,ramp(t,38,40)*(1-ramp(t,93,97)));
   if(t<55){const attachment=ramp(t,50,55);temp.set(-3.12,.33,.3).sub(panelPivot).applyQuaternion(panelRotation).add(panelPivot);o.product.position.lerpVectors(temp,origin.set(recommended.x,recommended.y-.08,recommended.z+.08),attachment);o.product.quaternion.copy(panelRotation);}else{o.product.rotation.set(0,0,0);}
   o.projection.aim(o.core,o.screen,o.root,presencePose.scanY,f.project);
   const hero=ramp(t,73,77)*(1-ramp(t,80,84));alpha(o.heroLight,hero*.25);o.reflection.position.set(o.product.position.x,-2.85,1);o.reflection.scale.set(4.7,-.65,1);alpha(o.reflection,hero*.065);
   o.productCaption.position.set(0,-3.12,1);alpha(o.productCaption,ramp(t,76,77)*(1-ramp(t,79,82)));
   const commerceAlpha=ramp(t,80,85)*(1-ramp(t,93,97));o.commerce.visible=commerceAlpha>.001;o.commerce.children.forEach(child=>alpha(child,commerceAlpha));const metricIndex=Math.min(3,Math.max(0,Math.floor((t-90)/1.6)));o.commerceMetrics.forEach((mesh,i)=>alpha(mesh,commerceAlpha*Number(i===metricIndex)));
   origin.set(0,0,0);camera.copy(position);target.copy(origin);root.userData.stage=f.stage;root.userData.mode=intelligence?.mode??'auto';root.userData.journeyTime=t;root.userData.morph=f.crystal;
  },isMoving:()=>false,focusPose:pose,prepare(){root.visible=true;},project:()=>[],pick:()=>null,
 };
}
