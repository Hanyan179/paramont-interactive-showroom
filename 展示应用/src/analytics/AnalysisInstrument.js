import {modelDetail} from '../../../共享组件/renderQuality.js';
import {applySurfaceFinish} from '../../../共享组件/surfaceFinish.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {frameBounds,visibleBounds} from '../components/rendering/sceneFraming.js';
import {graphLayout,graphNodeActive} from './graph.js';
import {paths,studyStages} from './caseStudy.js';

// The physical display and the readable graph use the same authored relationships.
// Drawn content is a canvas texture, not a screenshot or a generated backdrop.
export function createAnalysisInstrument(root,{navy,silver,gold,glow}){
 const precision=modelDetail('analytics');
 const edge=new T.MeshPhysicalMaterial({color:'#829fae',metalness:.83,roughness:.23,clearcoat:.7});
 const dark=new T.MeshPhysicalMaterial({color:'#071d2b',metalness:.36,roughness:.24,clearcoat:.8});
 const instrument=new T.Group();root.add(instrument);instrument.rotation.y=-.08;
 const box=(parent,w,h,d,mat,x,y,z,r=.05)=>{const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,precision.segment(4,'rounded'),Math.min(r,w/3,h/3,d/3)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 box(instrument,4.9,.16,2.45,navy,0,.1,.35,.1);box(instrument,4.78,.04,2.35,edge,0,.19,.35,.08);box(instrument,4.66,.025,2.22,dark,0,.23,.35,.07);
 box(instrument,1.45,.015,.025,glow,0,.248,1.48,.006);box(instrument,1.6,.12,.58,silver,0,.31,-.32,.06);box(instrument,.46,1.1,.2,silver,0,.81,-.7,.055);
 const frame=new T.Group();frame.position.set(0,2.57,-.48);frame.rotation.x=-.035;instrument.add(frame);
 box(frame,5.12,3.31,.13,edge,0,0,-.09,.12);box(frame,5.02,3.21,.09,navy,0,0,-.025,.10);box(frame,4.87,3.06,.023,dark,0,.018,.025,.075);
 box(frame,.34,.014,.01,gold,0,-1.57,.034,.003);
 const canvas=document.createElement('canvas');canvas.width=Math.round(1536*precision.screenScale);canvas.height=Math.round(960*precision.screenScale);const ctx=canvas.getContext('2d');ctx.scale(precision.screenScale,precision.screenScale);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const screen=new T.Mesh(new T.PlaneGeometry(4.78,2.9875),new T.MeshBasicMaterial({map:texture,toneMapped:false}));screen.position.set(0,.025,.043);frame.add(screen);
 let lastDraw=-1,lastKey='',screenPaths=[];
 const tracers=[];
 const screenPoint=(x,y)=>new T.Vector3((x/1536-.5)*4.78,(.5-y/960)*2.9875,.003);
 function updatePaths(stage,selection){
  const layout=graphLayout(stage===0?0:2),positions=layout.nodes.map(n=>({...n,x:n.x/100*1536,y:960*.08+n.y/100*960*.84}));
  screenPaths=layout.links.map(link=>{
   const [aId,bId]=link.id.split('/'),a=positions.find(n=>n.id===aId),b=positions.find(n=>n.id===bId),x1=a.x+65,x2=b.x-65,middle=(x1+x2)/2;
   return {curve:new T.CubicBezierCurve3(screenPoint(x1,a.y),screenPoint(middle,a.y-45),screenPoint(middle,b.y+45),screenPoint(x2,b.y)),color:link.color,visible:!selection.path||link.path===selection.path,phase:paths.findIndex(p=>p.id===link.path)*.23};
  });
  while(tracers.length<screenPaths.length){const dot=new T.Mesh(new T.CircleGeometry(.015,16),new T.MeshBasicMaterial({color:'#b8deed',transparent:true,opacity:.85,depthWrite:false,toneMapped:false}));screen.add(dot);tracers.push(dot);}
  tracers.forEach((dot,i)=>{dot.visible=!!screenPaths[i]?.visible;if(screenPaths[i])dot.material.color.set(screenPaths[i].color);});
 }
 const write=(text,x,y,width,font=25,color='#d3e4ec')=>{ctx.fillStyle=color;ctx.font=`400 ${font}px Arial, "PingFang SC", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';if(ctx.measureText(text).width<=width){ctx.fillText(text,x,y);return;}const words=/[\u4e00-\u9fa5]/.test(text)?[...text]:text.split(' ');let line='',rows=[];for(const word of words){const next=line+(/\s/.test(text)?' ':'')+word;if(ctx.measureText(next).width>width&&line){rows.push(line.trim());line=word;}else line=next;}rows.push(line.trim());rows.slice(0,2).forEach((r,i)=>ctx.fillText(r,x,y+(i-(Math.min(2,rows.length)-1)/2)*font*1.25));};
 function draw(time,stage,selection,lang,reduced){
  const l=lang==='zh'?0:1,w=1536,h=960,layout=graphLayout(stage===0?0:2);
  ctx.clearRect(0,0,w,h);const gradient=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.75);gradient.addColorStop(0,'#173d53');gradient.addColorStop(1,'#071b2b');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  write(studyStages[stage??0].title[l],w*.5,h*.09,w*.8,35,'#d7e9f1');
  const positions=layout.nodes.map(n=>({...n,x:n.x/100*w,y:h*.08+n.y/100*h*.84}));
  layout.links.forEach(link=>{const [aId,bId]=link.id.split('/'),a=positions.find(n=>n.id===aId),b=positions.find(n=>n.id===bId),active=!selection.path||link.path===selection.path;ctx.globalAlpha=active?.65:.12;ctx.strokeStyle=link.color;ctx.lineWidth=3;ctx.beginPath();const x1=a.x+65,x2=b.x-65;ctx.moveTo(x1,a.y);ctx.bezierCurveTo((x1+x2)/2,a.y-45,(x1+x2)/2,b.y+45,x2,b.y);ctx.stroke();});
  positions.forEach(n=>{const active=graphNodeActive(layout,n,selection.path),width=stage===0?330:240;ctx.globalAlpha=active?1:.35;ctx.fillStyle=active&&selection.path?'#234657':'#133046';ctx.strokeStyle=active&&selection.path?n.color:'#58788d';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(n.x-width/2,n.y-44,width,88,14);ctx.fill();ctx.stroke();write(n.label[l],n.x,n.y,width-24,stage===0?30:23);});
  ctx.globalAlpha=1;write(l===0?'关系示例 · 非实时市场数据':'Illustrative relationships · No live market data',w/2,h*.955,w*.9,19,'#7b9fb4');texture.needsUpdate=true;
 }
 applySurfaceFinish(T,root,precision);root.userData.qualityModel='analytics';
 return {root,screen,
  update(time,stage=0,dt,reduced,detail,selection={path:null},lang='zh'){
   const key=`${stage}/${selection.path}/${lang}`,changed=key!==lastKey;
   if(changed){draw(0,stage??0,selection,lang,true);updatePaths(stage??0,selection);lastKey=key;}
   if(changed||(!reduced&&time-lastDraw>=1/precision.screenFps)){
    tracers.forEach((dot,i)=>{const path=screenPaths[i];if(path&&dot.visible)dot.position.copy(path.curve.getPoint(reduced?.5:(time*precision.motionScale*.12+path.phase)%1));});lastDraw=time;
   }
   root.userData.analysisStep=stage??0;
  },
  screenView(aspect,viewport){const direction=new T.Vector3(0,0,1).applyQuaternion(screen.getWorldQuaternion(new T.Quaternion()));return frameBounds(visibleBounds([screen]),{aspect,frame:viewport,direction});},
 };
}
