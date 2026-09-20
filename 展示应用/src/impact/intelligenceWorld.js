import * as THREE from 'three';
import {journeyFrame,ramp,lerp,stageFrames,intelligencePresentation} from './intelligenceTimeline.js';
import {presenceAt,typedCount,typeMesh} from './intelligencePresence.js';
import {createJourneyObjects,alpha} from './intelligenceJourneyObjects.js';
export const intelligenceLayout={heroX:.70,heroY:.44,detailX:.70,detailY:.44};
const HEIGHT=2*Math.tan(THREE.MathUtils.degToRad(23))*32,TAU=Math.PI*2;
const reportStarts=[[-2.6,1.3],[0,1.8],[2.6,1.3],[-2.6,-1.3],[0,-1.8],[2.6,-1.3]];
const reviewSlots=[[0,0],[3.1,1.6],[-3.1,1.6],[0,2.4],[-3.1,-1.7],[3.1,-1.7]];
const feedbackSlots=[[-3.35,1.95],[0,2.55],[3.5,2],[-3.5,-2.1],[0,-2.55],[3.5,-2.1]];
const feedbackFocus=(t,i)=>i===1?ramp(t,95.7,96.4)*(1-ramp(t,97.7,98.4)):i===2?ramp(t,98.5,99.2)*(1-ramp(t,100.4,101.1)):0;
// Each report receives its own two-column stream. Matching source and target
// order preserves reading gaps during convergence, as well as at rest.
const streamColumns=[[-4.15,-2.49],[-.83,.83],[2.49,4.15]];
const streamRows=[[3.15,2.45,1.05],[3.15,1.75,1.05],[3.15,2.45,1.05],[-1.05,-2.45,-3.15],[-1.05,-1.75,-2.45],[-1.05,-2.45,-3.15]];
const informationSlots=streamRows.flatMap((rows,group)=>rows.flatMap(y=>streamColumns[group%3].map(x=>[x,y])));
// Each of the six source cards has one destination on a broad cube face.
const cardSeats=[[0,0,1.48,0,0],[1.48,0,0,0,Math.PI/2],[0,0,-1.48,0,Math.PI],[-1.48,0,0,0,-Math.PI/2],[0,1.48,0,-Math.PI/2,0],[0,-1.48,0,Math.PI/2,0]];
export function intelligenceWorld(quality,manager){
 const root=new THREE.Group();root.name='intelligence-continuous-exhibit';
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(240,160),new THREE.MeshBasicMaterial({color:'#030b16',fog:false}));backdrop.position.z=-12;root.add(backdrop);
 const o=createJourneyObjects(manager,quality);root.add(o.root);
 const temp=new THREE.Vector3(),position=new THREE.Vector3(0,0,32),origin=new THREE.Vector3(),cardRotation=new THREE.Quaternion(),seatRotation=new THREE.Quaternion(),flatRotation=new THREE.Quaternion(),seatEuler=new THREE.Euler();
 const scanTarget=new THREE.Object3D();scanTarget.name='file-scan-target';o.root.add(scanTarget);
 const purchaseInkColor=new THREE.Color('#171c21'),exhibitInkColor=new THREE.Color('#ffffff');
 let activeLanguage=null;
 let idlePhase=0,idleMix=0,lastMotion=null;
 const pose=()=>({position:position.clone(),target:origin.clone()});
 return {root,
  update({camera,target,aspect=16/9,intelligence=null,time=null,lang="en"}){
   if(lang!==activeLanguage){o.setLanguage(lang);activeLanguage=lang;}
   const t=intelligence?.time??stageFrames[intelligence?.stage??0],f=journeyFrame(t),width=HEIGHT*aspect,scale=Math.min(width*.049,HEIGHT*.093);
   const pageScroll=ramp(t,86,91);
   const presentation=intelligencePresentation(t),composition=presentation.composition;
   o.root.position.set(width*.20*composition,HEIGHT*.045*composition,0);o.root.scale.setScalar(scale*lerp(1.4,1,composition));
   const presence=ramp(t,5,16)*(1-ramp(t,99,105));alpha(o.ambience,presence*.26);
   const dt=Number.isFinite(time)&&lastMotion!==null?Math.max(0,Math.min(.1,time-lastMotion)):0;lastMotion=time;
   idlePhase+=dt;const idleTarget=intelligence?.mode==='manual'&&!intelligence?.seeking?1:0;idleMix+=(idleTarget-idleMix)*(1-Math.exp(-dt*4));
   const idleSway=Math.sin(idlePhase*.55)*.13*idleMix*ramp(t,8,14)*(1-ramp(t,49,54));
   const presencePose=presenceAt(t);
   const glassVisibility=ramp(t,13,16)*(1-ramp(t,29.5,31.2)),dock=ramp(t,33,37);
   o.body.position.set(lerp(0,3.25,dock),lerp(.2,.18,dock)+presencePose.float.lift+Math.sin(t*.65)*.065*ramp(t,8,13)*(1-f.crystal),0);o.body.scale.setScalar(lerp(1.22,.78,dock));
   // Continue the cube's turn into the nearest front-facing orientation. Raw
   // Euler interpolation would reverse through nearly a full revolution.
   const cubeTurn=.45+.24*(t-8)*ramp(t,7,12),turnDelta=Math.atan2(Math.sin(.12-cubeTurn),Math.cos(.12-cubeTurn)),bodyTurn=cubeTurn+turnDelta*f.crystal;
   o.body.rotation.set(lerp(.17,.025,f.crystal)+presencePose.float.x*.4,Math.atan2(Math.sin(bodyTurn),Math.cos(bodyTurn))-presencePose.turn*.7+presencePose.float.y*.6+Math.sin((t-38)*1.15-.35)*.20*presencePose.search,lerp(-.04,-.02,f.crystal)+presencePose.float.z);o.body.rotation.y+=idleSway;o.body.position.y+=idleSway*.35;
   o.crystal.morph(f.crystal,t);alpha(o.crystal.shell,glassVisibility*lerp(.12,.34,ramp(t,25,28.6)));alpha(o.crystal.edges,glassVisibility*.23*(1-ramp(t,29.2,30.5)));
   alpha(o.crystal.cells,ramp(t,13,16)*(1-ramp(t,26,29))*.48*lerp(1,.38,ramp(t,20,24)));
   const robotAlpha=ramp(t,28.6,31.2)*(1-ramp(t,86,88));
   // The same robot stays beside the files and product, then docks as the page logo.
   const logoDock=ramp(t,79,85),reviewDock=ramp(t,34,38);
   // An upper arc keeps the whole face clear of the product on its way to the
   // header. A straight line would send the eyes through the palette mirror.
   const logoRest=1-logoDock,logoTravel=ramp(logoDock,.12,1);
   o.body.position.x=lerp(o.body.position.x+.16*ramp(t,70,76),-3.65,logoTravel);o.body.position.y=o.body.position.y*logoRest**3+13.2*logoRest*logoDock+2.67*logoDock**3;o.body.position.z=lerp(0,.34,logoDock);
   o.body.scale.setScalar(lerp(lerp(1.22,.64,reviewDock),.17,logoDock));
   o.body.rotation.x*=1-logoDock;o.body.rotation.y*=1-logoDock;o.body.rotation.z*=1-logoDock;
   o.robot.root.scale.setScalar(1);o.cursor.visible=false;
   o.floor.position.set(o.body.position.x,lerp(-2.45,-1.67,dock),-.3);o.floor.scale.set(lerp(5.5,2.9,dock),.55,1);alpha(o.floor,Math.max(glassVisibility,robotAlpha)*.22*(1-ramp(t,79,83)));
   const scanPhase=ramp(t,18.8,24);o.scan.position.y=lerp(1.5,-1.5,scanPhase);const scanAlpha=ramp(t,18,19)*(1-ramp(t,24,25));alpha(o.scan,scanAlpha*.07);alpha(o.scanEdge,scanAlpha*.55);
   // The scanning slice opens the same report surface and reveals connected
   // information underneath. Every line shares its endpoints with live nodes.
   o.analysis.height.value=o.scan.position.y;o.analysis.strength.value=ramp(t,18.6,19.4);o.body.updateWorldMatrix(true,false);o.analysis.toBody.value.copy(o.body.matrixWorld).invert();
   o.relationships.update(t,o.scan.position.y);
   o.records.forEach((mesh,i)=>{
    let a=0,x=0,y=0,z=0,s=1,framing=0,purchase=0,reframe=1,focus=0;const count=(t<34||i===0)?typedCount(t,mesh.userData.typing.text.length,i):mesh.userData.typing.text.length;const letterOffset=typeMesh(mesh,count);
    if(t<34){
     const onset=i===0?1:ramp(t,2.8+i*.36,3.2+i*.36),localGather=ramp(t,7.8+i*.10,10+i*.10);
     const [scatterX,scatterY]=reviewSlots[i];
     // Each source returns to its own report: use feedback, sales / stock, or
     // business knowledge. Internal records never become customer reviews.
     const report=reportStarts[mesh.userData.reportIndex];temp.set(report[0],report[1]+.22,.56);
     const bow=Math.sin(localGather*Math.PI);
     x=lerp(scatterX,temp.x,localGather)+(i%2?-.38:.38)*bow;
     y=lerp(scatterY,temp.y,localGather)+.48*bow;z=lerp(0,temp.z,localGather);
     s=lerp(i===0?1:.55,.08,localGather);a=onset*(1-ramp(localGather,.40,.92));
     framing=ramp(t,4.6+i*.12,6.5+i*.12)*.72*(1-ramp(t,7.2,7.9));
     mesh.rotation.set(0,Math.sin(localGather*Math.PI)*(i%2?-.12:.12),0);
    }else if(t>=89&&i===0){
     const emerge=ramp(t,89,90),outward=ramp(t,93.2,95.4),closing=ramp(t,101.2,103.8);
     const [slotX,slotY]=feedbackSlots[0];
     x=lerp(lerp(-2.05,slotX,outward),0,closing);
     y=lerp(lerp(1.1-(1-pageScroll)*5.86,slotY,outward),0,closing);z=lerp(.3,0,closing);
     s=lerp(lerp(.65,.48,outward),1,closing);a=emerge;
     reframe=ramp(t,93.2,95.2);framing=reframe*(1-ramp(t,101,104));purchase=1-reframe;
    }else if(t>=89){
     // The website has retired before any internal operating record enters.
     // Sales and replenishment take turns in the same reading position.
     const enter=ramp(t,95.3+(i-1)*.1,96+(i-1)*.1),closing=ramp(t,102.4,104.6);
     const [slotX,slotY]=feedbackSlots[i];focus=feedbackFocus(t,i);
     s=lerp(.42,1,focus)*lerp(.92,1,enter)*lerp(1,.12,closing);
     x=lerp(slotX*(1-focus),slotX*.12,closing);
     const centreY=lerp(slotY*(1-focus)**2,slotY*.12,closing);
     y=centreY+.6*s;z=.25+focus*.35;
     a=enter*(1-closing)*lerp(.72,1,focus);framing=1-ramp(t,101.2,102.4);
    }
    if(i===0)x+=letterOffset*s;
    const {exhibitInk,purchaseInk,purchase:purchaseFrame,businessInk,actionInk}=mesh.userData.reviewSkins,card=mesh.children[0];
    if(i===0){
     // The first avatar review and its glass frame share one changing outline.
     card.scale.set(lerp(5.8/4.2,1,reframe),lerp(2.2/1.31,1,reframe),1);
     purchaseFrame.scale.set(lerp(1,4.2/5.8,reframe),lerp(1,1.31/2.2,reframe),1);
     alpha(purchaseFrame,a*purchase);alpha(purchaseInk,a*purchase*(1-ramp(reframe,.12,.46)));
     alpha(exhibitInk,a*framing*ramp(reframe,.54,.88));
    }else{
     const expanded=t>=89;
     card.scale.set(expanded?4.4/3.2:1,expanded?2.8:1,1);card.position.y=expanded?-.6:0;
     alpha(exhibitInk,expanded?0:a*framing);
     alpha(businessInk,expanded?a*framing:0);
     const action=i===1?ramp(t,96.7,97.3):i===2?ramp(t,99.3,99.9):ramp(t,96.7,97.3);
     alpha(actionInk,expanded?a*framing*action:0);
    }
    mesh.position.set(x,y,z);mesh.scale.setScalar(s);if(t>=34)mesh.rotation.set(0,0,0);
    alpha(mesh,a*(count>0?1:0));alpha(card,a*framing);
    mesh.material.color.copy(purchaseInk?purchaseInkColor:exhibitInkColor).lerp(exhibitInkColor,1-ramp(purchase,.12,.6));
    mesh.userData.feedbackFocus=focus;
   });
   o.purchaseCompanions.forEach((mesh,i)=>{
    const exit=ramp(t,93.2,95.2),pageScale=lerp(1,.90,exit),enter=ramp(t,90.1+i*.4,90.7+i*.4);
    mesh.position.set((i===1?-2.05:2.05)*pageScale,((i===0?1.1:-.52)-(1-pageScroll)*5.86)*pageScale,.3);
    mesh.scale.setScalar(.65*pageScale);mesh.traverse(part=>{if(part.material)alpha(part,enter*(1-exit));});
   });
   o.reportFaces.forEach((face,i)=>{
    const seat=cardSeats[i],g=ramp(t,13+i*.09,16),shrink=ramp(t,25,29),start=reportStarts[i];
    temp.set(seat[0],seat[1],seat[2]).multiplyScalar(o.body.scale.x*(1-shrink*.85)).applyEuler(o.body.rotation).add(o.body.position);
    face.position.set(lerp(start[0],temp.x,g),lerp(start[1],temp.y,g),lerp(.5,temp.z,g));face.scale.setScalar(lerp(.74,o.body.scale.x,g)*(1-shrink*.82));
    seatRotation.setFromEuler(seatEuler.set(seat[3],seat[4],0));cardRotation.copy(o.body.quaternion).multiply(seatRotation);face.quaternion.slerpQuaternions(flatRotation,cardRotation,g);
    face.userData.reportReveal.value=ramp(t,9.6+i*.09,11.3+i*.07);alpha(face,ramp(t,8.6+i*.09,10.5+i*.09)*(1-ramp(t,26,28.8))*.94);
    // Crossing pages must occlude one another while folding into cube faces.
    face.material.depthWrite=face.material.opacity>.90&&o.analysis.strength.value<.001;
   });
   o.dataFragments.forEach((mesh,i)=>{
    const group=mesh.userData.category,g=ramp(t,7.8+group*.08,10.3+group*.08),[startX,startY]=informationSlots[i],order=(i*13)%36;
    const [rx,ry]=reportStarts[group];mesh.position.set(lerp(startX,rx+(i%2?.18:-.18),g),lerp(startY,ry+.25-Math.floor(i%6/2)*.25,g),lerp(0,.65,g));mesh.scale.setScalar(lerp(.63,.14,g));alpha(mesh,ramp(t,3.8+order*.055,4.8+order*.055)*(1-ramp(g,.48,.94))*.82);
   });
   const first=o.records[0],typing=first.userData.typing;
   const cursorVisible=(1-ramp(t,2.3,2.8))+ramp(t,104,107.5);
   o.cursor.position.copy(first.position);o.cursor.position.x+=(typing.widths[first.userData.typedCount]-typing.total/2)/1024*typing.width+.08;o.cursor.scale.setScalar(first.scale.x);alpha(o.cursor,cursorVisible*.85);
   // Files take the foreground in Insights; the robot becomes their reviewer.
   const reviewing=Math.min(4,Math.max(0,Math.floor((t-38)/2.5)));
   const reviewFocus=ramp(t,38+reviewing*2.5,38.6+reviewing*2.5)*(1-ramp(t,40+reviewing*2.5,40.5+reviewing*2.5));
   o.cards.forEach((card,i)=>{
    const appear=ramp(t,35+i*.45,38+i*.45),ring=ramp(t,48,53),focus=i===4?ramp(t,50,56):0;
    const angle=(i-4)*TAU/5;
    const fanX=-1.25+Math.sin(angle)*2.35,fanY=.10-Math.cos(angle)*1.58;
    const x=lerp(fanX,Math.sin(angle)*2.8-.55,ring),y=lerp(fanY,-Math.cos(angle)*1.12,ring),z=lerp(.25,Math.cos(angle)*.65,ring);
    const attention=ramp(t,38+i*2.5,38.6+i*2.5)*(1-ramp(t,40+i*2.5,40.5+i*2.5));
    const size=lerp(.76,.89,ring)+attention*.86;
    card.position.set(lerp(lerp(-.8,x,appear),-1.25,attention*.86)*(1-focus),lerp(lerp(.2,y,appear),.10,attention*.86)*(1-focus),lerp(lerp(-.4,z,appear)+attention*.9,1.8,focus));card.scale.setScalar(lerp(size,1.65,focus));
    card.rotation.set(.035*(1-focus),Math.sin(angle)*.12*(1-focus),Math.sin(angle)*-.025*(1-ring)*(1-focus));
    const visible=appear*(1-ramp(t,i===4?50.8:50,53));
    const rejected=(i===1?ramp(t,41,42):i===2?ramp(t,44,45):0),dim=(i===4?1:lerp(1,.30,Math.max(rejected*(1-attention),ramp(t,48,51))))*(1-(reviewFocus-attention)*.58);
    alpha(card,visible*dim);card.material.depthWrite=visible>.99;alpha(o.cardDepths[i],visible*.7*dim);
    if(i<4)o.directionModels[i].update(visible*dim);
    o.reviewBadges[i].forEach((badge,j)=>{const status=j===0?Number(reviewing===i)*(1-ramp(rejected,0,.4))*(1-ramp(t,47.6,48)):j===1?ramp(rejected,.6,1)*(1-ramp(t,64,68)):Number(i===4)*ramp(t,48.2,49);alpha(badge,visible*status*(1-ramp(t,51,54)));});
    card.userData.reviewState=i===4&&t>=49?'selected':rejected>.5?'rejected':reviewing===i&&t<48?'reviewing':'waiting';
   });
   o.reviewNotes.forEach((note,i)=>{
    const start=38+i*2.5,end=i===4?51.4:start+2.5,enter=ramp(t,start,start+.3),leave=ramp(t,end-.3,end);
    note.position.set(-.65,-3.10+.16*leave-.16*(1-enter),.7);alpha(note,enter*(1-leave));
   });
   // The authored product is resolved at a fixed matching camera before the page pull-back.
   const imageToHero=ramp(t,68,75),imageToPage=ramp(t,79,85);
   o.product.position.set(lerp(-.65,-2.26,imageToPage),lerp(.25,.18,imageToPage),lerp(2,.3,imageToPage));o.product.scale.setScalar(lerp(lerp(4.15,4.9,imageToHero),3.48,imageToPage));o.product.rotation.set(0,0,0);alpha(o.product,ramp(t,73,75.5)*(1-ramp(t,88,91)));
   o.craft.update(t,o.cards[4],o.product);
   // The scan is attached to the current file, then follows the same colour pans during craft.
   const reviewed=o.cards[reviewing],previous=o.cards[Math.max(0,reviewing-1)],scanTravel=ramp(t,38+reviewing*2.5,38.6+reviewing*2.5);
   scanTarget.position.lerpVectors(previous.position,reviewed.position,scanTravel);scanTarget.quaternion.slerpQuaternions(previous.quaternion,reviewed.quaternion,scanTravel);scanTarget.scale.lerpVectors(previous.scale,reviewed.scale,scanTravel);
   const craftScan=ramp(t,50,55);temp.set(-.85,.18,1.2);scanTarget.position.lerp(temp,craftScan);scanTarget.quaternion.slerp(flatRotation,craftScan);scanTarget.scale.lerp(origin.set(1,1,1),craftScan);
   const preciseScan=ramp(t,57,59)*(1-ramp(t,67,70));o.craft.focusAt(t,temp);scanTarget.position.lerp(temp,preciseScan);
   const scanOffset=Math.sin((t-38)*2.5)*lerp(.7,.10,preciseScan);
   o.scanLine.position.set(scanOffset,0,.15).applyQuaternion(scanTarget.quaternion).multiply(scanTarget.scale).add(scanTarget.position);o.scanLine.quaternion.copy(scanTarget.quaternion);o.scanLine.rotateZ(Math.PI/2);o.scanLine.scale.set(lerp(1.6,.64,preciseScan)/6.42,1,1);
   const gaze=ramp(t,35,38)*(1-ramp(t,77,83));
   const gazeX=THREE.MathUtils.clamp((o.scanLine.position.x-o.body.position.x)*.13,-.62,.38)+presencePose.rejected*.33;
   const gazeY=THREE.MathUtils.clamp((o.scanLine.position.y-o.body.position.y)*.18,-.25,.25);
   presencePose.eyeX=lerp(presencePose.eyeX,gazeX,gaze);presencePose.eyeY=lerp(presencePose.eyeY,gazeY,gaze);
   o.robot.update(presencePose,robotAlpha);
   const process=ramp(t,52,55)*(1-ramp(t,68,71));
   const scanVisibility=Math.max(ramp(t,37,39)*(1-ramp(t,49,51)),process*.65);alpha(o.beam,scanVisibility*.009);
   o.projection.aim(o.robot.projector,scanTarget,o.root,0,.25,scanOffset,lerp(.80,.32,preciseScan));alpha(o.scanLine,scanVisibility*.30);
   const hero=ramp(t,73,77)*(1-ramp(t,80,84));alpha(o.heroLight,hero*.25);o.reflection.position.set(o.product.position.x,-2.85,1);o.reflection.scale.set(4.7,-.65,1);alpha(o.reflection,hero*.065);
   o.productCaption.position.set(0,-3.12,1);alpha(o.productCaption,ramp(t,76,77)*(1-ramp(t,79,82)));
   o.body.position.y+=pageScroll*5.86;o.page.material.map.offset.y=(1-1080/2100)*(1-pageScroll);for(const mesh of [o.product,o.details])mesh.userData.pageClip.value.set(t>=79?o.root.position.y-3.03*scale:-1e6,t>=79?o.root.position.y+3.1*scale:1e6);o.details.position.y=.15+pageScroll*5.86;o.product.position.y+=pageScroll*5.86;
   // Once docked, the same robot belongs to the scrolling page viewport.
   // Keep the free flight unclipped, including its upper approach arc.
   o.robotPageClip.value.set(t>=85?o.root.position.y-3.03*scale:-1e6,t>=85?o.root.position.y+3.1*scale:1e6);
   const commerceAlpha=ramp(t,80,85)*(1-ramp(t,93.2,95.2));o.commerce.scale.setScalar(lerp(1,.90,ramp(t,93.2,95.2)));o.commerce.visible=commerceAlpha>.001;o.commerce.children.forEach(child=>alpha(child,commerceAlpha));alpha(o.details,commerceAlpha*(1-ramp(t,87,90)));const metricIndex=Math.min(3,Math.max(0,Math.floor((t-90)/1.6)));o.commerceMetrics.forEach((mesh,i)=>alpha(mesh,commerceAlpha*ramp(t,91,93)*Number(i===metricIndex)));
   origin.set(0,0,0);camera.copy(position);target.copy(origin);root.userData.stage=f.stage;root.userData.mode=intelligence?.mode??'auto';root.userData.journeyTime=t;root.userData.morph=f.crystal;
  },isMoving:()=>false,focusPose:pose,prepare(){root.visible=true;},project:()=>[],pick:()=>null,
 };
}
