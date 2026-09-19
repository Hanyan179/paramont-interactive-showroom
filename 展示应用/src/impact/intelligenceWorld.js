import * as THREE from 'three';
import {journeyFrame,ramp,lerp,stageFrames} from './intelligenceTimeline.js';
import {presenceAt,typedCount,typeMesh} from './intelligencePresence.js';
import {createJourneyObjects,alpha} from './intelligenceJourneyObjects.js';
export const intelligenceLayout={heroX:.70,heroY:.44,detailX:.70,detailY:.44};
const HEIGHT=2*Math.tan(THREE.MathUtils.degToRad(23))*32,TAU=Math.PI*2;
const reportStarts=[[-2.6,1.3],[0,1.8],[2.6,1.3],[-2.6,-1.3],[0,-1.8],[2.6,-1.3]];
const reviewSlots=[[0,0],[3.1,1.6],[-3.1,1.6],[0,2.4],[-3.1,-1.7],[3.1,-1.7]];
// Each of the six source cards has one destination on a broad cube face.
const cardSeats=[[0,0,1.48,0,0],[1.48,0,0,0,Math.PI/2],[0,0,-1.48,0,Math.PI],[-1.48,0,0,0,-Math.PI/2],[0,1.48,0,-Math.PI/2,0],[0,-1.48,0,Math.PI/2,0]];
export function intelligenceWorld(quality,manager){
 const root=new THREE.Group();root.name='intelligence-continuous-exhibit';
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(240,160),new THREE.MeshBasicMaterial({color:'#030b16',fog:false}));backdrop.position.z=-12;root.add(backdrop);
 const o=createJourneyObjects(manager,quality);root.add(o.root);
 const temp=new THREE.Vector3(),position=new THREE.Vector3(0,0,32),origin=new THREE.Vector3(),panelPivot=new THREE.Vector3(-1.35,.05,0),panelRotation=new THREE.Quaternion(),panelEuler=new THREE.Euler(),cardRotation=new THREE.Quaternion(),seatRotation=new THREE.Quaternion(),flatRotation=new THREE.Quaternion(),seatEuler=new THREE.Euler();
 const scanTarget=new THREE.Object3D();scanTarget.name='file-scan-target';o.root.add(scanTarget);
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
   const glassVisibility=ramp(t,11,17)*(1-ramp(t,25,30)),dock=ramp(t,33,37),collapse=ramp(t,24,32);
   o.body.position.set(lerp(0,3.25,dock),lerp(.2,.18,dock)+presencePose.float.lift+Math.sin(t*.65)*.065*ramp(t,8,13)*(1-f.crystal),0);o.body.scale.setScalar(lerp(1.22,.78,dock));
   o.body.rotation.set(lerp(.17,.025,f.crystal)+presencePose.float.x*.4,lerp(.45+.24*(t-8)*ramp(t,7,12),.12,f.crystal)-presencePose.turn*.7+presencePose.float.y*.6+Math.sin((t-38)*1.15-.35)*.20*presencePose.look,lerp(-.04,-.02,f.crystal)+presencePose.float.z);o.body.rotation.y+=idleSway;o.body.position.y+=idleSway*.35;
   o.crystal.morph(f.crystal,t);alpha(o.crystal.shell,glassVisibility*.12*(1-ramp(t,27,32)));alpha(o.crystal.inner,glassVisibility*f.crystal*.4*(1-ramp(t,28,32)));alpha(o.crystal.edges,glassVisibility*.23*(1-ramp(t,27,32)));
   alpha(o.crystal.cells,ramp(t,9,15)*(1-ramp(t,28,32))*.48);
   const robotAlpha=ramp(t,27,32)*(1-ramp(t,86,88));
   // The same robot stays beside the files and product, then docks as the page logo.
   const logoDock=ramp(t,79,85),reviewDock=ramp(t,34,38);
   o.body.position.x=lerp(o.body.position.x,-3.65,logoDock);o.body.position.y=lerp(o.body.position.y,2.67,logoDock);o.body.position.z=lerp(0,.34,logoDock);
   o.body.scale.setScalar(lerp(lerp(1.22,.64,reviewDock),.17,logoDock));
   o.body.rotation.x*=1-logoDock;o.body.rotation.y*=1-logoDock;o.body.rotation.z*=1-logoDock;
   o.robot.root.scale.setScalar(lerp(.7,1,ramp(t,27,32)));o.robot.update(presencePose,robotAlpha);o.cursor.visible=false;
   o.floor.position.set(o.body.position.x,lerp(-2.45,-1.67,dock),-.3);o.floor.scale.set(lerp(5.5,2.9,dock),.55,1);alpha(o.floor,Math.max(glassVisibility,robotAlpha)*.22*(1-ramp(t,79,83)));
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
     s=lerp(i===0?1:.55,i===0?.60:.78,localGather);a=onset*(1-ramp(t,11,15));
     framing=ramp(t,4.6+i*.12,6.5+i*.12)*.72*(1-ramp(t,9,12));
     seatRotation.setFromEuler(seatEuler.set(seat[3],seat[4],0));cardRotation.copy(o.body.quaternion).multiply(seatRotation);mesh.quaternion.slerpQuaternions(flatRotation,cardRotation,localGather);
    }else if(t>=89){
     const emerge=ramp(t,89+i*.65,90+i*.65),release=ramp(t,95,100),closing=ramp(t,100,106);
     const pageX=(i%2?2.05:-2.05),pageY=1.1-Math.floor(i/2)*1.48;
     const [spreadX,spreadY]=reviewSlots[i];
     x=lerp(pageX,spreadX,release);y=lerp(pageY,spreadY,release);z=lerp(.3,i===0?.35:(i%3-1)*.7,release);
     if(i===0){x=lerp(x,0,closing);y=lerp(y,0,closing);z=lerp(z,0,closing);s=lerp(.65,1,release);a=emerge;}
     else{s=lerp(.60,i>8?.38:.6,release);a=emerge*(1-ramp(t,99+i*.37,101+i*.4));if(i>3)a*=lerp(1,.78,release);}
     framing=ramp(t,94,98)*(1-ramp(t,101,104));purchase=1-ramp(t,94,98);
    }
    if(i===0)x+=letterOffset*s;
    mesh.position.set(x,y,z);mesh.scale.setScalar(s);if(t>=34)mesh.rotation.set(0,t>=85&&i>0?Math.sin(i)*.08*ramp(t,93,99):0,0);alpha(mesh,a*(count>0?1:0));alpha(mesh.children[0],a*framing);alpha(mesh.children[1],a*purchase);alpha(mesh.children[2],0);mesh.material.color.set(purchase>.5?"#171c21":"#ffffff");
   });
   o.reportFaces.forEach((face,i)=>{
    const seat=cardSeats[i],g=ramp(t,11+i*.25,16+i*.18),shrink=ramp(t,25,31),start=reportStarts[i];
    temp.set(seat[0],seat[1],seat[2]).multiplyScalar(o.body.scale.x*(1-shrink*.85)).applyEuler(o.body.rotation).add(o.body.position);
    face.position.set(lerp(start[0],temp.x,g),lerp(start[1],temp.y,g),lerp(.5,temp.z,g));face.scale.setScalar(lerp(.60,o.body.scale.x,g)*(1-shrink*.82));
    seatRotation.setFromEuler(seatEuler.set(seat[3],seat[4],0));cardRotation.copy(o.body.quaternion).multiply(seatRotation);face.quaternion.slerpQuaternions(flatRotation,cardRotation,g);alpha(face,ramp(t,9+i*.25,11.5+i*.25)*(1-ramp(t,26,31))*.94);
   });
   o.dataFragments.forEach((mesh,i)=>{
    const group=mesh.userData.category,g=ramp(t,7.8+(i%6)*.28,12.2+(i%6)*.30),startX=Math.sin(i*2.399)*4.4,startY=Math.cos(i*1.73)*2.8;
    const [rx,ry]=reportStarts[group];mesh.position.set(lerp(startX,rx+(i%3-1)*.35,g)+Math.sin(g*Math.PI)*.3,lerp(startY,ry+(i%2?-.22:.22),g),lerp((i%3-1)*.2,.65,g));mesh.scale.setScalar(lerp(.78+(i%3)*.1,.16,g));alpha(mesh,ramp(t,3.8+i*.055,4.8+i*.055)*(1-ramp(t,11+(i%6)*.2,14+(i%6)*.2))*.82);
   });
   const first=o.records[0],typing=first.userData.typing;
   const cursorVisible=(1-ramp(t,2.3,2.8))+ramp(t,104,107.5);
   o.cursor.position.copy(first.position);o.cursor.position.x+=(typing.widths[first.userData.typedCount]-typing.total/2)/1024*typing.width+.08;o.cursor.scale.setScalar(first.scale.x);alpha(o.cursor,cursorVisible*.85);
   // Files take the foreground in Insights; the robot becomes their reviewer.
   alpha(o.screen,0);alpha(o.screenBody,0);alpha(o.scanLine,0);alpha(o.designBoard,0);
   let recommended={x:0,y:0,z:0,scale:1};
   const reviewing=Math.min(4,Math.max(0,Math.floor((t-38)/2.5)));
   o.cards.forEach((card,i)=>{
    const appear=ramp(t,35+i*.45,38+i*.45),ring=ramp(t,49,57),focus=i===4?ramp(t,65,74):0;
    const angle=(i-4)*TAU/5;
    const fanX=-1.25+Math.sin(angle)*2.35,fanY=.10-Math.cos(angle)*1.58;
    const x=lerp(fanX,Math.sin(angle)*2.8-.55,ring),y=lerp(fanY,-Math.cos(angle)*1.12,ring),z=lerp(.25,Math.cos(angle)*.65,ring);
    const attention=ramp(t,38+i*2.5,38.6+i*2.5)*(1-ramp(t,40+i*2.5,40.5+i*2.5));
    const size=lerp(.76,.89,ring)+attention*.06;
    card.position.set(lerp(3,x,appear)*(1-focus),lerp(.2,y,appear)*(1-focus),lerp(z,1.8,focus));card.scale.setScalar(lerp(size,2.25,focus));
    card.rotation.set(.035*(1-focus),Math.sin(angle)*.12*(1-focus),Math.sin(angle)*-.025*(1-ring)*(1-focus));
    const visible=appear*(1-ramp(t,i===4?73:67,i===4?76:72));
    const rejected=(i===1?ramp(t,41,42):i===2?ramp(t,44,45):0),dim=i===4?1:lerp(1,.30,Math.max(rejected,ramp(t,48,51)));
    alpha(card,visible*dim);card.material.depthWrite=visible>.99;alpha(card.children[0],0);alpha(card.children[1],visible*.7*dim);card.children[0].userData.reveal.value=appear;
    if(i===2){const bars=card.children[2];bars.children.forEach((bar,j)=>{const growth=ramp(t,37+j*.18,40+j*.18);bar.scale.y=bar.userData.height*growth;bar.position.y=-.55+bar.scale.y/2;alpha(bar,visible*dim);});}
    o.reviewBadges[i].forEach((badge,j)=>{const status=j===0?Number(reviewing===i)*(1-rejected)*(1-ramp(t,48,49)):j===1?rejected*(1-ramp(t,64,68)):Number(i===4)*ramp(t,48,49);alpha(badge,visible*status);});
    card.userData.reviewState=i===4&&t>=49?'selected':rejected>.5?'rejected':reviewing===i&&t<48?'reviewing':'waiting';
    if(i===4)recommended={x:card.position.x,y:card.position.y,z:card.position.z,scale:card.scale.x};
   });
   // A narrow scan travels across the current file rather than flooding a flat screen.
   const reviewed=o.cards[reviewing],previous=o.cards[Math.max(0,reviewing-1)],scanTravel=ramp(t,38+reviewing*2.5,38.6+reviewing*2.5);
   scanTarget.position.lerpVectors(previous.position,reviewed.position,scanTravel);scanTarget.quaternion.slerpQuaternions(previous.quaternion,reviewed.quaternion,scanTravel);scanTarget.scale.lerpVectors(previous.scale,reviewed.scale,scanTravel);
   alpha(o.beam,ramp(t,37,39)*(1-ramp(t,49,51))*.028);
   o.projection.aim(o.robot.projector,scanTarget,o.root,0,.35,Math.sin((t-38)*2.5)*.7,.80);
   alpha(o.orbit,ramp(t,50,55)*(1-ramp(t,66,71))*.18);
   const imageToCard=ramp(t,50,55),imageToHero=ramp(t,71,77),imageToPage=ramp(t,79,85);
   const x1=lerp(-3.12,recommended.x,imageToCard),y1=lerp(.33,recommended.y-.08,imageToCard),z1=lerp(.3,recommended.z+.08,imageToCard),size1=lerp(2.15,1.2*recommended.scale,imageToCard);
   o.product.position.set(lerp(lerp(x1,-.65,imageToHero),-2.26,imageToPage),lerp(lerp(y1,.25,imageToHero),.18,imageToPage),lerp(lerp(z1,2,imageToHero),.3,imageToPage));o.product.scale.setScalar(lerp(lerp(size1,4.9,imageToHero),3.48,imageToPage));alpha(o.product,ramp(t,73,77)*(1-ramp(t,88,91)));
   if(t<55){const attachment=ramp(t,50,55);temp.set(-3.12,.33,.3).sub(panelPivot).applyQuaternion(panelRotation).add(panelPivot);o.product.position.lerpVectors(temp,origin.set(recommended.x,recommended.y-.08,recommended.z+.08),attachment);o.product.quaternion.copy(panelRotation);}else{o.product.rotation.set(0,0,0);}

   const hero=ramp(t,73,77)*(1-ramp(t,80,84));alpha(o.heroLight,hero*.25);o.reflection.position.set(o.product.position.x,-2.85,1);o.reflection.scale.set(4.7,-.65,1);alpha(o.reflection,hero*.065);
   o.productCaption.position.set(0,-3.12,1);alpha(o.productCaption,ramp(t,76,77)*(1-ramp(t,79,82)));
   const pageScroll=ramp(t,86,91);o.body.position.y+=pageScroll*5.86;o.page.material.map.offset.y=(1-1080/2100)*(1-pageScroll);for(const mesh of [o.product,o.details])mesh.userData.pageClip.value.set(t>=79?o.root.position.y-3.03*scale:-1e6,t>=79?o.root.position.y+3.1*scale:1e6);o.details.position.y=.15+pageScroll*5.86;o.product.position.y+=pageScroll*5.86;
   const commerceAlpha=ramp(t,80,85)*(1-ramp(t,95,98));o.commerce.visible=commerceAlpha>.001;o.commerce.children.forEach(child=>alpha(child,commerceAlpha));alpha(o.details,commerceAlpha*(1-ramp(t,87,90)));const metricIndex=Math.min(3,Math.max(0,Math.floor((t-90)/1.6)));o.commerceMetrics.forEach((mesh,i)=>alpha(mesh,commerceAlpha*ramp(t,91,93)*Number(i===metricIndex)));
   origin.set(0,0,0);camera.copy(position);target.copy(origin);root.userData.stage=f.stage;root.userData.mode=intelligence?.mode??'auto';root.userData.journeyTime=t;root.userData.morph=f.crystal;
  },isMoving:()=>false,focusPose:pose,prepare(){root.visible=true;},project:()=>[],pick:()=>null,
 };
}
