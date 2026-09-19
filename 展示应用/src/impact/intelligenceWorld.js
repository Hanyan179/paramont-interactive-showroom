import * as THREE from 'three';
import {journeyFrame,ramp,lerp,stageFrames} from './intelligenceTimeline.js';
import {presenceAt,typedCount,typeMesh} from './intelligencePresence.js';
import {createJourneyObjects,alpha} from './intelligenceJourneyObjects.js';
export const intelligenceLayout={heroX:.70,heroY:.44,detailX:.70,detailY:.44};
const HEIGHT=2*Math.tan(THREE.MathUtils.degToRad(23))*32,TAU=Math.PI*2;
const reviewSlots=[[0,0],[3.1,1.6],[-3.1,1.6],[0,2.4],[-3.1,-1.7],[3.1,-1.7]];
// Each of the six source cards has one destination on a broad cube face.
const cardSeats=[[0,0,1.48,0,0],[1.48,0,0,0,Math.PI/2],[0,0,-1.48,0,Math.PI],[-1.48,0,0,0,-Math.PI/2],[0,1.48,0,-Math.PI/2,0],[0,-1.48,0,Math.PI/2,0]];
export function intelligenceWorld(quality,manager){
 const root=new THREE.Group();root.name='intelligence-continuous-exhibit';
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(240,160),new THREE.MeshBasicMaterial({color:'#030b16',fog:false}));backdrop.position.z=-12;root.add(backdrop);
 const o=createJourneyObjects(manager);root.add(o.root);
 const temp=new THREE.Vector3(),position=new THREE.Vector3(0,0,32),origin=new THREE.Vector3(),panelPivot=new THREE.Vector3(-1.35,.05,0),panelRotation=new THREE.Quaternion(),panelEuler=new THREE.Euler(),cardRotation=new THREE.Quaternion(),seatRotation=new THREE.Quaternion(),flatRotation=new THREE.Quaternion(),seatEuler=new THREE.Euler();
 let activeLanguage=null;
 let idlePhase=0,idleMix=0,lastMotion=null;
 const pose=()=>({position:position.clone(),target:origin.clone()});
 return {root,
  update({camera,target,aspect=16/9,intelligence=null,time=null,lang="en"}){
   if(lang!==activeLanguage){o.setLanguage(lang);activeLanguage=lang;}
   const t=intelligence?.time??stageFrames[intelligence?.stage??0],f=journeyFrame(t),width=HEIGHT*aspect,scale=Math.min(width*.049,HEIGHT*.093);
   o.root.position.set(width*.20,HEIGHT*.045,0);o.root.scale.setScalar(scale);
   const presence=ramp(t,5,16)*(1-ramp(t,99,105));alpha(o.ambience,presence*.26);
   const dt=Number.isFinite(time)&&lastMotion!==null?Math.max(0,Math.min(.1,time-lastMotion)):0;lastMotion=time;
   idlePhase+=dt;const idleTarget=intelligence?.mode==='manual'&&!intelligence?.seeking?1:0;idleMix+=(idleTarget-idleMix)*(1-Math.exp(-dt*4));
   const idleSway=Math.sin(idlePhase*.55)*.13*idleMix*ramp(t,8,14)*(1-ramp(t,49,54));
   const presencePose=presenceAt(t);
   const glassVisibility=ramp(t,11,17)*(1-ramp(t,49,54)),dock=ramp(t,33,37),collapse=ramp(t,24,32);
   o.body.position.set(lerp(0,3.25,dock),lerp(.2,.18,dock)+presencePose.float.lift+Math.sin(t*.65)*.065*ramp(t,8,13)*(1-f.crystal),0);o.body.scale.setScalar(lerp(1.22,.78,dock));
   o.body.rotation.set(lerp(.17,.025,f.crystal)+presencePose.float.x*.4,lerp(.45+.24*(t-8)*ramp(t,7,12),.12,f.crystal)-presencePose.turn*.7+presencePose.float.y*.6+Math.sin((t-38)*1.15-.35)*.20*presencePose.look,lerp(-.04,-.02,f.crystal)+presencePose.float.z);o.body.rotation.y+=idleSway;o.body.position.y+=idleSway*.35;
   o.crystal.morph(f.crystal,t);alpha(o.crystal.shell,glassVisibility*.12*(1-ramp(t,27,32)));alpha(o.crystal.inner,glassVisibility*f.crystal*.4*(1-ramp(t,28,32)));alpha(o.crystal.edges,glassVisibility*.23*(1-ramp(t,27,32)));
   const robotReveal=ramp(t,26,33),robotAlpha=robotReveal*(1-ramp(t,49,54));o.robot.group.visible=robotAlpha>.001;o.robot.group.scale.setScalar(lerp(.74,1,robotReveal));for(const part of o.robot.group.children)alpha(part,robotAlpha);
   alpha(o.crystal.cells,ramp(t,9,15)*(1-ramp(t,28,32))*.48);
   const coreAlpha=ramp(t,27,34)*(1-ramp(t,49,54));o.eye.visible=coreAlpha>.001;o.eye.children.forEach(part=>alpha(part,coreAlpha));o.cursor.visible=false;alpha(o.core,0);alpha(o.coreRim,0);alpha(o.halo,coreAlpha*.06*presencePose.blink);const pupilSize=.42+.08*Math.sin(t*.7);o.core.scale.set(pupilSize,pupilSize*presencePose.blink,pupilSize);
   o.eye.position.set(presencePose.eyeX*.55,.12+presencePose.eyeY*.5,.87);o.eye.scale.set(1.55,1.55*presencePose.blink,1.1);o.eye.rotation.y=-presencePose.look*.22;
   for(const part of [o.housing,o.iris,o.pupil,o.glint])alpha(part,coreAlpha);
   o.iris.scale.setScalar(1+.025*Math.sin(t*1.4));o.pupil.position.x=presencePose.eyeX*.25;o.pupil.position.y=presencePose.eyeY*.2;
   o.core.position.set(presencePose.eyeX*.55,.12+presencePose.eyeY*.5,1.14);o.coreRim.position.set(presencePose.eyeX,presencePose.eyeY,1.0);o.coreRim.scale.set(1,presencePose.blink,1);o.halo.position.set(presencePose.eyeX,presencePose.eyeY,1.1);
   o.floor.position.set(o.body.position.x,lerp(-2.45,-1.67,dock),-.3);o.floor.scale.set(lerp(5.5,2.9,dock),.55,1);alpha(o.floor,glassVisibility*.32);
   const scanPhase=ramp(t,18.8,24);o.scan.position.y=lerp(1.5,-1.5,scanPhase);const scanAlpha=ramp(t,18,19)*(1-ramp(t,24,25));alpha(o.scan,scanAlpha*.12);alpha(o.scanEdge,scanAlpha*.8);
   const relation=ramp(t,21,24)*(1-ramp(t,29,33));alpha(o.links,relation*.6);o.nodes.forEach((node,i)=>alpha(node,relation*(.45+.4*Math.sin(t*.8+i)**2)));
   o.records.forEach((mesh,i)=>{
    let a=0,x=0,y=0,z=0,s=1,framing=0,purchase=0;const count=(t<34||i===0)?typedCount(t,mesh.userData.typing.text.length,i):mesh.userData.typing.text.length;const letterOffset=typeMesh(mesh,count);
    if(t<34){
     const onset=i===0?1:ramp(t,2.8+i*.36,3.2+i*.36),localGather=ramp(t,8+i*.55,12.1+i*.55);
     const [scatterX,scatterY]=reviewSlots[i],seat=cardSeats[i];
     temp.set(seat[0],seat[1],seat[2]).multiplyScalar((1-collapse*.84)*o.body.scale.x).applyEuler(o.body.rotation).add(o.body.position);
     // One ordered arc per card, never a second, duplicated stream of images.
     const bow=Math.sin(localGather*Math.PI);
     x=lerp(scatterX,temp.x,localGather)+(i%2?-.38:.38)*bow;
     y=lerp(scatterY,temp.y,localGather)+.48*bow;z=lerp(0,temp.z,localGather);
     s=lerp(i===0?1:.55,i===0?.60:.78,localGather);a=onset*(1-ramp(t,25.5,30.5));
     framing=ramp(t,4.6+i*.12,6.5+i*.12)*.72;
     seatRotation.setFromEuler(seatEuler.set(seat[3],seat[4],0));cardRotation.copy(o.body.quaternion).multiply(seatRotation);mesh.quaternion.slerpQuaternions(flatRotation,cardRotation,localGather);
    }else if(t>=89){
     const emerge=ramp(t,89+i*.65,90+i*.65),release=ramp(t,95,100),closing=ramp(t,100,106);
     const pageX=(i%2?1.85:-1.85),pageY=.9-Math.floor(i/2)*.95;
     const [spreadX,spreadY]=reviewSlots[i];
     x=lerp(pageX,spreadX,release);y=lerp(pageY,spreadY,release);z=lerp(.3,i===0?.35:(i%3-1)*.7,release);
     if(i===0){x=lerp(x,0,closing);y=lerp(y,0,closing);z=lerp(z,0,closing);s=lerp(.65,1,release);a=emerge;}
     else{s=lerp(.60,i>8?.38:.6,release);a=emerge*(1-ramp(t,99+i*.37,101+i*.4));if(i>3)a*=.78;}
     framing=ramp(t,94,98)*(1-ramp(t,101,104));purchase=1-ramp(t,94,98);
    }
    if(i===0)x+=letterOffset*s;
    mesh.position.set(x,y,z);mesh.scale.setScalar(s);if(t>=34)mesh.rotation.set(0,t>=85&&i>0?Math.sin(i)*.08*ramp(t,93,99):0,0);alpha(mesh,a*(count>0?1:0));alpha(mesh.children[0],a*framing);alpha(mesh.children[1],a*purchase);alpha(mesh.children[2],a*ramp(t,9,14)*(1-ramp(t,25,30)));mesh.material.color.set(purchase>.5?"#37302b":"#ffffff");
   });
   const first=o.records[0],typing=first.userData.typing;
   const cursorVisible=(1-ramp(t,2.3,2.8))+ramp(t,104,107.5);
   o.cursor.position.copy(first.position);o.cursor.position.x+=(typing.widths[first.userData.typedCount]-typing.total/2)/1024*typing.width+.08;o.cursor.scale.setScalar(first.scale.x);alpha(o.cursor,cursorVisible*.85);
   const screenAlpha=ramp(t,37,39)*(1-ramp(t,56,59));o.screen.position.set(lerp(lerp(1.9,-1.35,f.project),0,f.zoom),.05,0);o.screen.rotation.set(.065*(1-f.zoom),.53*(1-f.zoom),-.025*(1-f.zoom));o.screen.scale.set(lerp(.015,lerp(1,1.38,f.zoom),f.project),lerp(1,1.18,f.zoom),1);alpha(o.screen,screenAlpha);alpha(o.screenBody,screenAlpha*.7);
   o.scanLine.rotation.z=Math.PI/2;o.scanLine.scale.x=.60;o.scanLine.position.set(presencePose.scanX,0,.15);alpha(o.scanLine,ramp(t,38,39)*(1-ramp(t,49,51))*.7);
   alpha(o.beam,ramp(t,36,39)*(1-ramp(t,49,53))*.045);
   panelRotation.setFromEuler(panelEuler.set(.065*(1-f.zoom),.53*(1-f.zoom),-.025*(1-f.zoom)));
   o.designBoard.position.set(-3.05,.60,.25);o.designBoard.position.sub(panelPivot).applyQuaternion(panelRotation).add(panelPivot);o.designBoard.quaternion.copy(panelRotation);alpha(o.designBoard,ramp(t,38,41)*(1-ramp(t,51,56)));
   let recommended={x:0,y:0,z:0,scale:1};
   const grid=[[-.7,.75],[.97,.75],[-.7,-.66],[.97,-.66],[-3.05,-1.42]];
   o.cards.forEach((card,i)=>{
    const angle=(i-4)*TAU/5+(1-ramp(t,59,66))*1.65;
    const rowX=lerp(grid[i][0],grid[i][0]*1.35+1.35,f.zoom),rowY=grid[i][1]*lerp(1,1.18,f.zoom);
    const spreadX=(i-2)*1.9,rx=Math.sin(angle)*3.2,ry=-Math.cos(angle)*1.0+.1,rz=Math.cos(angle)*1.15;
    const x=lerp(lerp(rowX,spreadX,f.spread),rx,f.ring),y=lerp(lerp(rowY,(i%2)*.25,f.spread),ry,f.ring),z=lerp(.15,rz,f.ring);
    const focus=i===4?ramp(t,70,74):0,expand=ramp(t,51,59),sx=lerp(lerp((i===4?.76:.60)*lerp(1,1.3,f.zoom),.72,expand),1.04,f.ring)*lerp(1,2.25,focus),sy=lerp(lerp((i===4?.48:.69)*lerp(1,1.18,f.zoom),.72,expand),1,f.ring)*lerp(1,2.25,focus);
    card.position.set(lerp(x,0,focus),lerp(y,0,focus),lerp(z,1.8,focus));card.scale.set(sx,sy,1);card.rotation.y=Math.sin(angle)*f.ring*.25*(1-focus);
    const visible=ramp(t,39+i*1.7,40.2+i*1.7)*(1-ramp(t,i===4?73:69,i===4?76:73));card.visible=visible>.001;card.material.depthWrite=expand>.99&&visible>.95;card.material.opacity=visible*expand*(i===4?1:lerp(1,.28,ramp(t,66,70)));alpha(card.children[0],visible*(1-expand));alpha(card.children[1],visible*.65);card.position.z+=Math.sin(t*.65+i)*.11*ramp(t,41,45)*(1-ramp(t,51,55));card.children[0].userData.reveal.value=ramp(t,39+i*1.7,41+i*1.7);
    if(i===2){const bars=card.children[2];bars.children.forEach((bar,j)=>{const growth=ramp(t,42.4+j*.18,45+j*.18);bar.scale.y=bar.userData.height*growth;bar.position.y=-.55+bar.scale.y/2;alpha(bar,visible*(i===4?1:lerp(1,.28,ramp(t,66,70))));});}
    if(t<55){card.position.sub(panelPivot).applyQuaternion(panelRotation).add(panelPivot);card.quaternion.copy(panelRotation);}
    if(i===4)recommended={x:card.position.x,y:card.position.y,z:card.position.z,scale:sx};
   });
   alpha(o.orbit,ramp(t,60,65)*(1-ramp(t,70,74))*.38);
   const imageToCard=ramp(t,50,55),imageToHero=ramp(t,71,77),imageToPage=ramp(t,79,85);
   const x1=lerp(-3.12,recommended.x,imageToCard),y1=lerp(.33,recommended.y-.08,imageToCard),z1=lerp(.3,recommended.z+.08,imageToCard),size1=lerp(2.15,1.2*recommended.scale,imageToCard);
   o.product.position.set(lerp(lerp(x1,0,imageToHero),-2.26,imageToPage),lerp(lerp(y1,.25,imageToHero),.18,imageToPage),lerp(lerp(z1,2,imageToHero),.3,imageToPage));o.product.scale.setScalar(lerp(lerp(size1,5.9,imageToHero),3.48,imageToPage));alpha(o.product,ramp(t,73,77)*(1-ramp(t,88,91)));
   if(t<55){const attachment=ramp(t,50,55);temp.set(-3.12,.33,.3).sub(panelPivot).applyQuaternion(panelRotation).add(panelPivot);o.product.position.lerpVectors(temp,origin.set(recommended.x,recommended.y-.08,recommended.z+.08),attachment);o.product.quaternion.copy(panelRotation);}else{o.product.rotation.set(0,0,0);}
   o.projection.aim(o.core,o.screen,o.root,0,f.project,presencePose.scanX);
   const hero=ramp(t,73,77)*(1-ramp(t,80,84));alpha(o.heroLight,hero*.25);o.reflection.position.set(o.product.position.x,-2.85,1);o.reflection.scale.set(4.7,-.65,1);alpha(o.reflection,hero*.065);
   o.productCaption.position.set(0,-3.12,1);alpha(o.productCaption,ramp(t,76,77)*(1-ramp(t,79,82)));
   const pageScroll=ramp(t,86,91);o.page.material.map.offset.y=(1-1080/2100)*(1-pageScroll);for(const mesh of [o.product,o.details])mesh.userData.pageClip.value.set(t>=79?o.root.position.y-3.03*scale:-1e6,t>=79?o.root.position.y+3.1*scale:1e6);o.details.position.y=.15+pageScroll*5.86;o.product.position.y+=pageScroll*5.86;
   const commerceAlpha=ramp(t,80,85)*(1-ramp(t,95,98));o.commerce.visible=commerceAlpha>.001;o.commerce.children.forEach(child=>alpha(child,commerceAlpha));alpha(o.details,commerceAlpha*(1-ramp(t,87,90)));const metricIndex=Math.min(3,Math.max(0,Math.floor((t-90)/1.6)));o.commerceMetrics.forEach((mesh,i)=>alpha(mesh,commerceAlpha*ramp(t,91,93)*Number(i===metricIndex)));
   origin.set(0,0,0);camera.copy(position);target.copy(origin);root.userData.stage=f.stage;root.userData.mode=intelligence?.mode??'auto';root.userData.journeyTime=t;root.userData.morph=f.crystal;
  },isMoving:()=>false,focusPose:pose,prepare(){root.visible=true;},project:()=>[],pick:()=>null,
 };
}
