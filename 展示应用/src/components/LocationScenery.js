import {modelDetail} from '../../../共享组件/renderQuality.js';
import * as THREE from 'three';

// Concept interiors, not reconstructions of actual company sites or equipment.
// The three regions share the architectural language, but have separate objects.
export function addLocationScenery({profiles,box,cylinder,tube,image,interactiveGroup,materials}) {
  const {white,silver,navy,stone,dark,glass,glow,warm}=materials;
  const group=(parent,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const desk=(parent,x,z,w=2.8,d=1.35)=>{
    const g=group(parent,x,0,z);box(g,w,.14,d,0,1.47,0,white,.06);
    for(const side of [-1,1])box(g,.075,1.12,d*.8,side*(w/2-.18),.84,0,silver,.025);
    box(g,w-.3,.018,.028,0,1.36,d/2-.05,warm,.005);return g;
  };
  const display=(parent,x,y,z,w=1.45,h=.95)=>{
    const g=group(parent,x,y,z);box(g,w,h,.065,0,h/2,0,dark,.045);
    box(g,w-.11,h-.11,.018,0,h/2,.046,navy,.018);
    box(g,.065,.23,.06,0,-.1,0,silver);box(g,.55,.035,.32,0,-.22,.02,silver);
    // Quiet graphic lines suggest a presentation without inventing business data.
    for(let i=0;i<3;i++)box(g,w*.5,.018,.007,-w*.12,h*.7-i*.13,.06,i?stone:glow,.003);
    return g;
  };
  const chair=(parent,x,z,angle=0)=>{
    const g=group(parent,x,0,z);g.rotation.y=angle;
    box(g,.78,.17,.8,0,.83,0,navy,.075);box(g,.78,.85,.13,0,1.3,-.34,navy,.06);
    cylinder(g,.065,.56,0,.47,0,silver);box(g,.73,.055,.1,0,.21,0,silver);box(g,.1,.055,.73,0,.21,0,silver);
    return g;
  };
  const notebook=(parent,x,y,z,scale=1)=>{
    const g=group(parent,x,y,z);g.scale.setScalar(scale);
    box(g,.88,.10,1.1,0,0,0,navy,.035);box(g,.82,.055,1.04,.01,.01,.01,white,.015);
    box(g,.88,.035,1.1,0,.065,0,navy,.022);box(g,.035,.009,1.06,.27,.087,0,stone,.003);return g;
  };
  const pendant=(parent,x,z,length=3)=>{box(parent,length,.055,.13,x,4.08,z,silver);box(parent,length-.14,.012,.09,x,4.045,z,glow,.005);for(const side of [-1,1])box(parent,.014,.65,.014,x+side*(length/2-.2),4.42,z,silver,.004);};
  const animate=[];

  // CHINA — a research island and a model-development workshop, alongside the
  // existing inspiration/material atelier in the first bay.
  const research=profiles.china[1];
  const island=group(research,-1.3,0,.8);
  const researchTop=cylinder(island,2.04,.18,0,1.42,0,white);researchTop.scale.z=.7;
  const researchBase=cylinder(island,1.35,1.0,0,.83,0,navy);researchBase.scale.z=.7;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.67,.018,modelDetail('china').segment(8,'radial'),modelDetail('china').segment(96)),glow);ring.rotation.x=-Math.PI/2;ring.scale.y=.70;ring.position.y=1.525;island.add(ring);
  const orb=group(island,0,1.64,0);
  for(let i=0;i<3;i++){
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(.73,.028,modelDetail('china').segment(10,'radial'),modelDetail('china').segment(64)),i===1?silver:navy);hoop.rotation.set(Math.PI/2+i*.52,i*.65,0);orb.add(hoop);
  }
  cylinder(orb,.16,.035,0,-.08,0,silver);
  for(let i=0;i<6;i++)notebook(island,Math.cos(i*Math.PI/3)*1.25,1.57,Math.sin(i*Math.PI/3)*.75,.35).rotation.y=-i*Math.PI/3;
  interactiveGroup(island,'inspection','quality');
  const researchBoard=group(research,3,0,-2.7);
  box(researchBoard,2.7,2.65,.16,0,2.75,-.4,white,.09);
  for(let i=0;i<9;i++){
    const x=(i%3-1)*.74,y=2.04+Math.floor(i/3)*.69;
    const swatch=box(researchBoard,.53,.48,.12,x,y,-.27,[navy,stone,silver][i%3],.025);swatch.rotation.z=(i%3-1)*.04;
  }
  box(researchBoard,3.1,.14,1.3,0,1.26,0,silver);
  for(const x of [-1.3,1.3])box(researchBoard,.075,.92,1,x,.74,0,silver);
  interactiveGroup(researchBoard,'standards','quality');
  for(let i=0;i<3;i++)image(research,['a1-markers.png','a2-sketchbook.png','a1-markers.png'][i],1.2,1.05,-3.2+i*1.7,3.24,-4.02);
  pendant(research,-1.3,.8,4.2);
  animate.push({region:'china',chapter:'quality',update:t=>{orb.rotation.y=t*.00015;}});

  const development=profiles.china[2];
  const modelDesk=desk(development,-1.8,1,4.1,2.05),prototype=group(modelDesk,-.45,1.63,0);
  cylinder(prototype,.90,.06,0,0,0,silver);
  const layers=[];
  for(let i=0;i<4;i++){const layer=notebook(prototype,0,.25+i*.28,0,1.2);layers.push(layer);}
  for(let i=0;i<3;i++)cylinder(modelDesk,.09,.78,.95+i*.22,1.92,.18,i%2?silver:navy);
  interactiveGroup(modelDesk,'packaging','delivery');
  const developmentDesk=desk(development,3,-.45,2.9,1.75);
  const drafting=display(developmentDesk,0,1.83,-.2,1.9,1.15);drafting.rotation.x=-.1;
  notebook(developmentDesk,-.85,1.6,.4,.45);chair(development,3,1.5,Math.PI);
  interactiveGroup(developmentDesk,'collaboration','delivery');
  for(let col=0;col<4;col++){
    box(development,1.7,.09,.95,-3.7+col*2.25,1.2,-3.4,silver);
    box(development,1.65,.035,.9,-3.7+col*2.25,1.27,-3.4,white);
    for(let row=0;row<2;row++)notebook(development,-3.7+col*2.25,1.36+row*.15,-3.4,.68+col*.08).rotation.y=(col-1.5)*.15;
    box(development,1.5,1.5,.065,-3.7+col*2.25,3.1,-4.01,col%2?stone:navy);
  }
  pendant(development,-1.8,1,4.1);
  animate.push({region:'china',chapter:'delivery',update:t=>{prototype.rotation.y=Math.sin(t*.00018)*.16;layers.forEach((m,i)=>m.position.y=.25+i*(.28+(Math.sin(t*.00065)+1)*.055));}});

  // USA — a product showroom, a conversation room and a local team studio.
  const market=profiles.usa[0],channel=group(market,-2.55,0,-2.8);
  for(let i=0;i<3;i++){
    const x=(i-1)*1.58;
    box(channel,1.4,2.6,.7,x,1.6,0,navy,.13);
    for(let j=0;j<3;j++){
      box(channel,1.25,.07,.77,x,.67+j*.85,.10,silver);
      for(let k=0;k<3;k++)notebook(channel,x+(k-1)*.31,.78+j*.85,.13,.25);
      box(channel,1.15,.018,.025,x,.77+j*.85,.5,glow,.005);
    }
  }
  interactiveGroup(channel,'materials','manufacturing');
  const proposals=group(market,-.9,0,1.45);
  for(let i=0;i<3;i++){
    const x=(i-1)*1.4,h=1.02+i*.26;
    cylinder(proposals,.62,h,x,.32+h/2,0,i===1?navy:white);
    cylinder(proposals,.65,.055,x,.35+h,0,silver);
    if(i===1){for(let k=0;k<5;k++)cylinder(proposals,.055,.68,x+(k-2)*.17,h+.72,0,k%2?white:navy);}
    else notebook(proposals,x,h+.44,0,.68);
  }
  interactiveGroup(proposals,'samples','manufacturing');
  const marketScreen=group(market,3.25,0,-.3);
  cylinder(marketScreen,.72,.10,0,.35,0,navy);box(marketScreen,.12,1.4,.13,0,1.02,0,silver);
  display(marketScreen,0,1.84,0,1.7,1.2);interactiveGroup(marketScreen,'process','manufacturing');
  image(market,'a1-markers.png',1.85,1.38,3.3,3.26,-4.02);
  pendant(market,-.9,1.4,4.2);

  const forum=profiles.usa[1],meeting=group(forum,-1.5,0,.8);
  const meetingTop=cylinder(meeting,1.58,.13,0,1.48,0,white);meetingTop.scale.set(1.28,1,.76);
  cylinder(meeting,.58,1.05,0,.90,0,navy);cylinder(meeting,.91,.10,0,.36,0,silver);
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.cos(a)*2.35,z=Math.sin(a)*1.58;chair(meeting,x,z,Math.atan2(-x,-z));}
  notebook(meeting,-.75,1.6,-.05,.50);notebook(meeting,.65,1.6,.08,.50);cylinder(meeting,.2,.06,0,1.6,0,silver);
  interactiveGroup(meeting,'inspection','quality');
  const shared=group(forum,3,0,-2.0);
  display(shared,0,1.91,0,2.4,1.45);box(shared,.095,1.15,.1,0,.89,0,silver);box(shared,1.7,.07,.72,0,.34,0,navy);
  interactiveGroup(shared,'standards','quality');
  // A curved acoustic backdrop distinguishes this room from the workshop bays.
  const slats=group(forum,-1.5,0,-.05);
  for(let i=0;i<17;i++){
    const a=Math.PI*.17+i*Math.PI*.039,x=Math.cos(a)*3.35,z=-Math.sin(a)*3.48;
    const slat=box(slats,.16,2.8,.10,x,2.06,z,i%4===0?silver:stone,.035);slat.rotation.y=-a;
  }
  const halo=new THREE.Mesh(new THREE.TorusGeometry(1.8,.038,modelDetail('usa').segment(10,'radial'),modelDetail('usa').segment(96)),warm);halo.rotation.x=-Math.PI/2;halo.scale.y=.72;halo.position.set(-1.5,4.05,.8);forum.add(halo);
  for(const x of [-2.7,-.3])box(forum,.013,.89,.013,x,4.5,.8,silver,.003);

  const team=profiles.usa[2],localTeam=group(team,-1.9,0,.65);
  for(const z of [-1,1]){
    const work=desk(localTeam,0,z,3.8,1.4);
    for(const x of [-.9,.9]){display(work,x,1.77,-.20,.91,.61);box(work,.62,.028,.22,x,1.57,.30,dark,.01);chair(localTeam,x,z+1.05,Math.PI);}
  }
  interactiveGroup(localTeam,'packaging','delivery');
  const connect=group(team,3,0,-.2);
  display(connect,0,2.05,0,2.3,1.55);box(connect,.1,1.37,.11,0,1.02,0,silver);box(connect,1.7,.08,.9,0,.34,0,navy);
  // Three connected discs echo the company network without suggesting metrics.
  const network=group(connect,0,0,.065);
  for(let i=0;i<3;i++){const disc=cylinder(network,.14,.028,-.65+i*.65,2.56,0,silver);disc.rotation.x=Math.PI/2;}
  box(network,1.27,.012,.012,0,2.56,0,glow,.004);
  interactiveGroup(connect,'collaboration','delivery');
  for(let i=0;i<5;i++)box(team,1.68,1.65,.40,-3.75+i*1.88,1.15,-3.7,i%2?navy:stone,.05);
  image(team,'a2-sketchbook.png',2.5,1.46,-2.9,3.12,-4.02);pendant(team,-1.9,.7,4.1);

  // CAMBODIA — an actual spatial production motif: roller line, fixtures and a
  // moving overhead carriage. It remains visibly labelled a conceptual scene.
  const factory=profiles.cambodia[0],materialsBay=group(factory,-3,0,-2.65);
  for(let row=0;row<3;row++){
    box(materialsBay,2.4,.1,1.0,0,.72+row*1.04,0,silver);
    for(let col=0;col<3;col++)box(materialsBay,.55,.68,.72,(col-1)*.76,1.11+row*1.04,0,col%2?stone:navy,.045);
  }
  for(const x of [-1.24,1.24])box(materialsBay,.08,3.48,1.04,x,1.97,0,silver);
  interactiveGroup(materialsBay,'materials','manufacturing');
  const line=group(factory,-.65,0,1.45);
  box(line,6.2,.36,1.55,0,1.06,0,navy);
  for(const x of [-2.5,0,2.5])box(line,.14,.70,1.4,x,.64,0,silver);
  for(let i=0;i<27;i++){const r=cylinder(line,.067,1.34,-2.98+i*.23,1.3,0,silver);r.rotation.x=Math.PI/2;}
  for(const z of [-.81,.81])box(line,6.25,.065,.065,0,1.43,z,silver);
  const workpieces=[];for(let i=0;i<4;i++){const piece=box(line,.58,.19,.76,-2.2+i*1.3,1.48,0,white,.04);workpieces.push(piece);}
  interactiveGroup(line,'samples','manufacturing');
  const cell=group(factory,3.18,0,-.55);
  box(cell,2.24,1.24,2.05,0,.93,0,navy,.1);box(cell,2.4,.13,2.15,0,1.63,0,silver);
  for(const x of [-1,1])box(cell,.17,2.2,.19,x,2.8,-.55,white);
  box(cell,2.3,.24,.29,0,3.86,-.55,silver);
  const carriage=group(cell,0,0,0);box(carriage,.49,.58,.52,0,3.48,-.55,white);cylinder(carriage,.085,.51,0,2.98,-.55,silver);
  box(cell,2.2,1.91,.022,0,2.65,.80,glass,.008);display(cell,1.22,1.94,.74,.63,.72);
  interactiveGroup(cell,'process','manufacturing');
  for(let i=0;i<3;i++){
    box(factory,1.52,1.20,.18,-.84+i*1.67,2.9,-4.0,dark);
    for(let j=0;j<4;j++)box(factory,.83,.018,.012,-.98+i*1.67,3.20-j*.19,-3.90,j?stone:glow,.004);
  }
  pendant(factory,-.6,1.45,5.7);
  animate.push({region:'cambodia',chapter:'manufacturing',update:t=>{carriage.position.x=Math.sin(t*.0006)*.64;workpieces.forEach((p,i)=>p.position.x=-2.8+((t*.00018+i/4)%1)*5.6);}});
  // A transfer spine and articulated handling cell make manufacturing legible
  // in the overview as well as the close view; these are process concepts.
  const transfer=group(factory,3.0,0,3.15);
  box(transfer,9.4,.30,1.0,0,1.04,0,navy);
  for(let i=0;i<38;i++){const roller=cylinder(transfer,.055,.91,-4.45+i*.24,1.24,0,silver);roller.rotation.x=Math.PI/2;}
  const cartons=[];for(let i=0;i<5;i++)cartons.push(box(transfer,.54,.35,.57,-3.8+i*1.65,1.48,0,stone,.035));
  interactiveGroup(transfer,'samples','manufacturing');
  const robot=group(factory,1.15,0,.38);
  cylinder(robot,.55,.28,0,.40,0,navy);cylinder(robot,.34,.50,0,.77,0,silver);
  const arm=group(robot,0,1.05,0);arm.rotation.z=-.35;
  box(arm,.26,1.50,.32,0,.65,0,white,.065);cylinder(arm,.23,.38,0,1.40,0,silver).rotation.x=Math.PI/2;
  const forearm=group(arm,0,1.40,0);forearm.rotation.z=-.95;
  box(forearm,.22,1.25,.26,0,.57,0,navy,.055);box(forearm,.55,.16,.30,0,1.26,0,silver,.03);
  for(const side of [-1,1])box(forearm,.08,.40,.24,side*.22,1.45,0,silver,.02);
  interactiveGroup(robot,'process','manufacturing');
  // Full height racking creates a recognisable logistics silhouette.
  const warehouse=profiles.cambodia[2];
  for(let row=0;row<2;row++)for(let bay=0;bay<3;bay++){
    const rack=group(warehouse,-3.8+bay*2.25,0,-1.65-row*2.4);
    for(const x of [-.92,.92])box(rack,.08,4.65,1.36,x,2.58,0,navy,.02);
    for(let level=0;level<4;level++){box(rack,1.95,.07,1.3,0,.7+level*1.1,0,silver);for(const side of [-1,1])box(rack,.73,.73,.93,side*.43,1.1+level*1.1,0,stone,.03);}
    interactiveGroup(rack,'packaging','delivery');
  }
  animate.push({region:'cambodia',chapter:'manufacturing',update:t=>{arm.rotation.y=Math.sin(t*.00035)*.4;forearm.rotation.z=-.95+Math.sin(t*.0005)*.16;cartons.forEach((p,i)=>p.position.x=-4.25+((t*.00006+i/5)%1)*8.5);}});
  return {update(region,chapter,time){for(const a of animate)if(a.region===region&&(a.chapter===chapter||chapter==='overview'))a.update(time);}};
}
