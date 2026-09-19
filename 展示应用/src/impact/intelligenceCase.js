import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {modelDetail} from '../../../共享组件/renderQuality.js';

const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);

function materials() {
  const finish = color => new THREE.MeshPhysicalMaterial({color,metalness:.08,roughness:.3,clearcoat:.5,clearcoatRoughness:.23});
  return {
    glass: new THREE.MeshPhysicalMaterial({color:'#6197bd',metalness:.14,roughness:.13,clearcoat:1,clearcoatRoughness:.1,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.3}),
    silver: new THREE.MeshPhysicalMaterial({color:'#a7c5d5',metalness:.86,roughness:.22,clearcoat:.5,envMapIntensity:1.35}),
    gold: new THREE.MeshPhysicalMaterial({color:'#c7a370',metalness:.8,roughness:.25,clearcoat:.4,envMapIntensity:1.2}),
    azure: new THREE.MeshStandardMaterial({color:'#72b2d6',metalness:.58,roughness:.25,emissive:'#153d59',emissiveIntensity:.4}),
    muted: new THREE.MeshStandardMaterial({color:'#31536b',metalness:.5,roughness:.35}),
    light: new THREE.MeshStandardMaterial({color:'#cbeaf7',emissive:'#73c7ef',emissiveIntensity:1.25,metalness:.25,roughness:.22}),
    warmLight: new THREE.MeshStandardMaterial({color:'#e6c691',emissive:'#967143',emissiveIntensity:.7,metalness:.36,roughness:.25}),
    tray: new THREE.MeshPhysicalMaterial({color:'#142f43',metalness:.55,roughness:.28,clearcoat:.6}),
    ivory: finish('#d9d6c6'),
    wood: finish('#bb966e'),
    coral: finish('#cf8275'),
    blue: finish('#608fae'),
    mint: finish('#87aaa1'),
    ochre: finish('#cbb379'),
    lilac: finish('#a49bb8'),
  };
}

function add(parent,geometry,material,position=[0,0,0],scale=null) {
  const object=new THREE.Mesh(geometry,material);
  object.position.set(...position);
  if(scale) object.scale.set(...scale);
  parent.add(object);
  return object;
}

function tube(parent,points,radius,material,detail) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p));
  const object=add(parent,new THREE.TubeGeometry(curve,detail.segment(48),radius,6,false),material);
  return {curve,object};
}

function roundedFrame(width,height,detail) {
  const halfW=width/2,halfH=height/2,radius=.15,points=[];
  const corners=[[halfW-radius,halfH-radius,0],[-halfW+radius,halfH-radius,Math.PI/2],[-halfW+radius,-halfH+radius,Math.PI],[halfW-radius,-halfH+radius,Math.PI*1.5]];
  for(const [x,y,start] of corners) for(let i=0;i<=8;i++) {
    const angle=start+i/8*Math.PI/2;
    points.push(V(x+Math.cos(angle)*radius,y+Math.sin(angle)*radius,.085));
  }
  points.push(points[0].clone());
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),detail.segment(96),.025,6,false);
}

function instances(parent,geometry,material,entries) {
  const mesh=new THREE.InstancedMesh(geometry,material,entries.length);
  const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion();
  const position=V(),scale=V();
  entries.forEach(({p,s=[1,1,1]},i)=>{
    position.set(...p);scale.set(...s);matrix.compose(position,quaternion,scale);mesh.setMatrixAt(i,matrix);
  });
  mesh.instanceMatrix.needsUpdate=true;
  parent.add(mesh);
  return mesh;
}

/** A spatial business example. All marks are authored illustration, not measured data. */
export function createIntelligenceCase(quality) {
  const detail=modelDetail('analytics',quality),m=materials();
  const root=new THREE.Group();
  root.name='intelligence-business-case';
  root.userData.qualityModel='analytics';
  root.userData.illustrative=true;
  const rounded=detail.segment(2,'rounded');
  const radial=detail.segment(28,'radial');
  const blockGeometry=new RoundedBoxGeometry(1,1,1,rounded,.08);
  const slabGeometry=new RoundedBoxGeometry(1,1,1,rounded,.035);
  const dotGeometry=new THREE.SphereGeometry(.06,detail.segment(12,'radial'),detail.segment(8,'radial'));
  const panelGeometry=new RoundedBoxGeometry(3.4,5.35,.13,rounded,.06);
  const frameGeometry=roundedFrame(3.41,5.36,detail);
  const panels=[];
  const panelPoses=[[-3.65,1.32,-1.42,.2],[0,1.65,-.98,-.04],[3.65,1.27,-1.36,-.2]];

  for(let i=0;i<3;i++) {
    const panel=new THREE.Group(),pose=panelPoses[i];
    panel.name=['case-records-panel','case-analysis-panel','case-options-panel'][i];
    panel.position.set(pose[0],pose[1],pose[2]);panel.rotation.y=pose[3];root.add(panel);panels.push(panel);
    const glass=add(panel,panelGeometry,m.glass);glass.renderOrder=5+i;
    add(panel,frameGeometry,m.silver);
    instances(panel,dotGeometry,m.light,[{p:[-1.36,2.28,.13]},{p:[-1.12,2.28,.13],s:[.7,.7,.7]},{p:[-.91,2.28,.13],s:[.7,.7,.7]}]);
    instances(panel,slabGeometry,m.muted,[{p:[.67,2.28,.13],s:[1.15,.035,.035]},{p:[0,1.93,.13],s:[2.78,.015,.025]}]);
  }

  // A small, physical stack of research records. No labels, metric axes or
  // invented percentages are baked into the scene.
  const recordRows=[],recordDetails=[],recordChips=[];
  for(let row=0;row<5;row++) {
    const y=1.41-row*.66;
    recordRows.push({p:[0,y,.15],s:[2.6,.47,.07]});
    recordChips.push({p:[-1.02,y,.22],s:[.23,.23,.1]});
    recordDetails.push({p:[-.17,y+.075,.21],s:[1.05,.025,.025]},{p:[-.34,y-.075,.21],s:[.72,.021,.021]});
  }
  instances(panels[0],slabGeometry,m.muted,recordRows);
  instances(panels[0],blockGeometry,m.azure,recordChips);
  instances(panels[0],slabGeometry,m.silver,recordDetails);
  const recordsLight=instances(panels[0],dotGeometry,m.warmLight,[{p:[1.01,1.41,.23]},{p:[1.01,.09,.23]},{p:[1.01,-1.23,.23]}]);

  // Relationships become a gently rising path. This is a schematic gesture,
  // deliberately without numeric ticks, units or a quantitative claim.
  const chart=tube(panels[1],[[-1.22,-.27,.2],[-.78,-.04,.2],[-.33,-.16,.2],[.14,.46,.2],[.58,.67,.2],[1.15,1.26,.2]],.033,m.light,detail);
  const knots=[.04,.25,.49,.72,.97].map(t=>({p:chart.curve.getPoint(t).toArray(),s:[1.4,1.4,1.4]}));
  instances(panels[1],dotGeometry,m.silver,knots);
  const barEntries=Array.from({length:6},(_,i)=>({p:[-1.14+i*.45,-1.5+(.36+i*.1)/2,.18],s:[.25,.36+i*.1,.12]}));
  instances(panels[1],slabGeometry,m.azure,barEntries);
  instances(panels[1],slabGeometry,m.muted,[{p:[0,-1.72,.15],s:[2.7,.02,.035]},{p:[-.66,1.46,.17],s:[1.2,.04,.04]}]);
  const chartBeacon=add(panels[1],dotGeometry,m.warmLight);chartBeacon.scale.setScalar(2);

  // Three candidates have a shared origin; the middle route is emphasized as
  // an illustrative review choice, not an automated recommendation.
  const origins=[[-1.17,-.15,.18],[-.58,-.15,.18]];
  for(let i=0;i<3;i++) {
    const y=(1-i)*1.22;
    tube(panels[2],[...origins,[.1,y*.65,.18],[.72,y,.18]],i===1?.032:.018,i===1?m.gold:m.muted,detail);
    add(panels[2],blockGeometry,i===1?m.gold:m.azure,[1.02,y,.19],[.38,.38,.14]);
  }
  add(panels[2],dotGeometry,m.light,[-1.17,-.15,.2],[1.65,1.65,1.65]);
  instances(panels[2],slabGeometry,m.muted,[{p:[-.22,-1.89,.16],s:[1.97,.035,.035]},{p:[-.57,-2.04,.16],s:[1.27,.025,.025]}]);

  const products=new THREE.Group();products.name='case-creative-products';root.add(products);
  add(products,new RoundedBoxGeometry(10.35,.15,3.15,rounded,.07),m.tray,[0,-3.65,1.45]);
  add(products,new RoundedBoxGeometry(9.93,.035,2.77,rounded,.015),m.muted,[0,-3.556,1.45]);

  const blocks=new THREE.Group();blocks.name='case-geometric-blocks';blocks.position.set(-3.4,-3.53,1.5);blocks.rotation.y=.19;products.add(blocks);
  add(blocks,blockGeometry,m.ivory,[-.49,.37,.06],[.72,.72,.8]);
  add(blocks,blockGeometry,m.blue,[.36,.37,.06],[.72,.72,.8]);
  add(blocks,blockGeometry,m.ochre,[-.06,1.12,.06],[1.56,.72,.8]);
  const roofGeometry=new THREE.CylinderGeometry(.85,.85,.78,3,1);
  roofGeometry.rotateX(Math.PI/2);roofGeometry.rotateZ(Math.PI);
  add(blocks,roofGeometry,m.coral,[-.06,1.95,.04]);
  const looseBlock=add(blocks,blockGeometry,m.mint,[1.08,.28,.52],[.51,.51,.58]);looseBlock.rotation.y=.31;
  const barrel=add(blocks,new THREE.CylinderGeometry(.28,.28,.77,radial),m.lilac,[-1.22,.29,.48]);barrel.rotation.z=Math.PI/2;

  const stack=new THREE.Group();stack.name='case-stacking-rings';stack.position.set(.02,-3.49,1.37);products.add(stack);
  add(stack,new RoundedBoxGeometry(2.05,.2,1.87,rounded,.09),m.ivory,[0,.08,0]);
  add(stack,new THREE.CylinderGeometry(.1,.13,2.1,radial),m.wood,[0,1.17,0]);
  add(stack,new THREE.SphereGeometry(.17,radial,detail.segment(18,'radial')),m.wood,[0,2.23,0]);
  const rings=[];
  const ringMaterials=[m.blue,m.coral,m.ochre,m.mint];
  for(let i=0;i<4;i++) {
    const ring=add(stack,new THREE.TorusGeometry(.69-i*.13,.15,detail.segment(12,'radial'),detail.segment(40)),ringMaterials[i],[0,.41+i*.42,0]);
    ring.rotation.x=Math.PI/2;rings.push(ring);
  }

  const creative=new THREE.Group();creative.name='case-brushes-and-pencils';creative.position.set(3.32,-3.49,1.3);creative.rotation.y=-.14;products.add(creative);
  const cupMaterial=m.ivory.clone();cupMaterial.side=THREE.DoubleSide;
  const cupGeometry=new THREE.CylinderGeometry(.58,.46,1.21,radial,1,true);
  add(creative,cupGeometry,cupMaterial,[0,.68,0]);
  add(creative,new THREE.CylinderGeometry(.465,.465,.06,radial),m.ivory,[0,.105,0]);
  const lip=add(creative,new THREE.TorusGeometry(.575,.035,detail.segment(8,'radial'),detail.segment(36)),m.silver,[0,1.285,0]);lip.rotation.x=Math.PI/2;
  const shaftGeometry=new THREE.CylinderGeometry(.059,.059,1.85,8);
  const woodTipGeometry=new THREE.ConeGeometry(.063,.24,8);
  const pigmentTipGeometry=new THREE.ConeGeometry(.027,.095,8);
  const colors=[m.coral,m.blue,m.ochre,m.mint,m.lilac];
  for(let i=0;i<5;i++) {
    const pencil=new THREE.Group();creative.add(pencil);
    pencil.position.set((i-2)*.135,.57,Math.sin(i*2)*.17);
    pencil.rotation.z=(i-2)*-.105;pencil.rotation.x=Math.sin(i*1.7)*.12;
    add(pencil,shaftGeometry,colors[i],[0,1.09,0]);
    add(pencil,woodTipGeometry,m.wood,[0,2.13,0]);
    add(pencil,pigmentTipGeometry,colors[i],[0,2.263,0]);
  }
  const brush=new THREE.Group();creative.add(brush);brush.position.set(.41,.62,.15);brush.rotation.z=-.24;
  add(brush,new THREE.CylinderGeometry(.065,.045,1.6,radial),m.wood,[0,.91,0]);
  add(brush,new THREE.CylinderGeometry(.105,.075,.29,radial),m.silver,[0,1.81,0]);
  const bristles=new THREE.LatheGeometry([new THREE.Vector2(.085,0),new THREE.Vector2(.117,.11),new THREE.Vector2(.105,.3),new THREE.Vector2(.058,.46),new THREE.Vector2(.008,.59)],radial);
  add(brush,bristles,m.muted,[0,1.95,0]);
  const sampleBook=add(creative,new RoundedBoxGeometry(1.17,.14,.84,rounded,.045),m.coral,[-1.13,.07,.62]);sampleBook.rotation.y=-.25;
  const bookPages=add(creative,new RoundedBoxGeometry(1.1,.085,.78,rounded,.026),m.ivory,[-1.13,.085,.62]);bookPages.rotation.y=-.25;

  // Three signals move on actual spatial paths from analysis into products.
  const links=[
    [[-3.62,-1.5,-1.22],[-3.83,-1.8,-.14],[-3.4,-2.07,1.04]],
    [[0,-1.24,-.68],[.5,-1.8,.1],[.06,-1.57,1.13]],
    [[3.6,-1.61,-1.11],[3.85,-1.8,.12],[3.32,-2.12,1.3]],
  ].map(points=>tube(root,points,.014,m.muted,detail));
  const signals=new THREE.InstancedMesh(dotGeometry,m.warmLight,3);root.add(signals);
  signals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);signals.frustumCulled=false;
  const matrix=new THREE.Matrix4(),position=V(),quaternion=new THREE.Quaternion(),signalScale=V(1.35,1.35,1.35);

  function update({time=0,reduced=false,stage=0}={}) {
    const clock=reduced?0:Number.isFinite(time)?time:0;
    const selected=Number.isInteger(stage)?THREE.MathUtils.clamp(stage,0,5):0;
    for(let i=0;i<3;i++) panels[i].position.y=panelPoses[i][1]+Math.sin(clock*.17+i)*.035;
    for(let i=0;i<rings.length;i++) rings[i].position.y=.41+i*.42+Math.sin(clock*.32+i*.65)*.023;
    blocks.rotation.y=.19+Math.sin(clock*.14)*.04;
    chart.curve.getPoint(.5+.46*Math.sin(clock*.18-.2),position);chartBeacon.position.copy(position);
    for(let i=0;i<links.length;i++) {
      // Ease in and out of the visible signal to avoid a bright reset at the path ends.
      const t=(clock*.065+i/3)%1;
      links[i].curve.getPoint(t,position);
      const envelope=Math.max(0,Math.sin(t*Math.PI));
      signalScale.setScalar(1.35*envelope);
      matrix.compose(position,quaternion,signalScale);signals.setMatrixAt(i,matrix);
    }
    signals.instanceMatrix.needsUpdate=true;
    const emphasis=selected===2||selected===3;
    chartBeacon.scale.setScalar(emphasis?2.05:1.55);
    recordsLight.visible=selected!==5;
  }
  update();
  return {root,update};
}
