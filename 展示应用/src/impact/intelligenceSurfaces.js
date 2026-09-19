// Authored, local demonstration UI textures. No business measurements are implied.
import * as THREE from 'three';
export const INK='#e2edf5',MUTED='#91a7bc',BLUE='#9edaff';
export function canvasTexture(draw,w=1536,h=1024){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;
}
export function label(c,text,x,y,size=36,color=INK,weight=400){c.fillStyle=color;c.font=`${weight} ${size}px Arial, sans-serif`;c.fillText(text,x,y);}
export function rounded(c,x,y,w,h,r=24){c.beginPath();c.roundRect(x,y,w,h,r);}
function gradient(c,x,y,w,h,stops){const g=c.createLinearGradient(x,y,w,h);stops.forEach(([p,color])=>g.addColorStop(p,color));return g;}
function rule(c,x,y,w,color='#294053'){c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();}
function surface(c,w,h){
 rounded(c,3,3,w-6,h-6,26);c.fillStyle=gradient(c,0,0,w,h,[[0,'#20394e'],[.45,'#101e2e'],[1,'#0a1421']]);c.fill();
 c.strokeStyle=gradient(c,0,0,w,h,[[0,'#a7c9dc'],[.25,'#405a70'],[.7,'#314254'],[1,'#80a9c1']]);c.lineWidth=3;c.stroke();
 rounded(c,12,12,w-24,h-24,21);c.strokeStyle='rgba(155,201,225,.07)';c.lineWidth=1;c.stroke();
}
const values=[.17,.23,.20,.39,.34,.52,.48,.64,.58,.72,.76,.91];
function trend(c,x,y,w,h){
 for(let i=0;i<4;i++)rule(c,x,y+i*h/3,w,'#294053');
 const pts=values.map((v,i)=>[x+i*w/11,y+h-v*h]);
 c.beginPath();c.moveTo(x,y+h);pts.forEach(p=>c.lineTo(...p));c.lineTo(x+w,y+h);c.closePath();c.fillStyle=gradient(c,0,y,0,y+h,[[0,'rgba(116,193,229,.34)'],[1,'rgba(116,193,229,0)']]);c.fill();
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle='#a8d9ef';c.lineWidth=5;c.lineJoin='round';c.stroke();
 c.beginPath();c.arc(...pts.at(-1),6,0,Math.PI*2);c.fillStyle='#effaff';c.fill();
}
export function cardTexture(index,analysis=false){
 const titles=analysis?['Sales Trend','Customer Sentiment','Sales Forecast','Market Opportunity','Recommendation']:['Market Trend','Customer Preference','Sales Forecast','Opportunity','Recommended Product'];
 return canvasTexture((c,w,h)=>{
  surface(c,w,h);
  if(analysis){
   label(c,titles[index],48,110,index===1||index===3?65:78,INK,500);rule(c,48,154,w-96);
   if(index===0){trend(c,64,240,w-128,310);label(c,'Growing interest',48,635,47,MUTED);}
   if(index===1){c.lineWidth=46;c.beginPath();c.strokeStyle='#344f66';c.arc(275,376,142,0,Math.PI*2);c.stroke();c.beginPath();c.strokeStyle='#a5d5ee';c.arc(275,376,142,-1.57,3.3);c.stroke();label(c,'Soft texture',490,326,51);label(c,'Wearable',490,400,51);label(c,'Gift appeal',490,474,51);}
   if(index===2){[160,235,210,290,350,390].forEach((v,i)=>{c.fillStyle=i<3?'#618aa8':'#b1d8ec';rounded(c,68+i*151,570-v,85,v,6);c.fill();});label(c,'Directional outlook',48,650,44,MUTED);}
   if(index===3){['Everyday neutrals','Coordinated colour','Gift-ready format'].forEach((t,i)=>{label(c,`0${i+1}`,50,283+i*133,40,BLUE);label(c,t,147,283+i*133,52);rule(c,147,320+i*133,790);});}
   if(index===4){label(c,'SOFT HAZE',48,300,104);label(c,'Four-shade eye palette',48,445,65,MUTED);label(c,'A considered colour story',48,583,51,BLUE);}
   return;
  }
  label(c,`0${index+1}   /   ${analysis?'INSIGHT':'DECISION'}`,48,65,23,BLUE);label(c,titles[index],48,130,index===4?44:48,INK,500);rule(c,48,166,w-96);
  if(index===0){label(c,'Growing interest',48,225,31);label(c,'A consistent upward signal',48,273,25,MUTED);trend(c,60,315,w-120,230);label(c,'DISCOVER',55,603,20,MUTED);label(c,'CONSIDER',430,603,20,MUTED);label(c,'CHOOSE',830,603,20,MUTED);}
  if(index===1){
   const cx=220,cy=375,r=120;c.lineWidth=26;['#a4d4e8','#739ab8','#38526d'].forEach((color,i)=>{c.beginPath();c.strokeStyle=color;c.arc(cx,cy,r,[-1.57,2.1,3.7][i], [2.03,3.63,4.66][i]);c.stroke();});
   label(c,'VOICE',cx-51,370,28,MUTED);label(c,'OF CUSTOMER',cx-85,410,22,MUTED);
   ['Soft texture','Wearable shades','Gift appeal'].forEach((t,i)=>{c.fillStyle=['#a4d4e8','#739ab8','#38526d'][i];c.fillRect(420,286+i*88,13,13);label(c,t,455,306+i*88,32);});
   label(c,'Themes drawn from feedback',48,610,25,MUTED);
  }
  if(index===2){
   [110,146,132,182,207,230,258,278,310].forEach((v,i)=>{c.fillStyle=i<5?'#54768e':'#aed4e8';rounded(c,65+i*100,550-v,57,v,6);c.fill();});rule(c,48,552,w-96);label(c,'OBSERVED',65,604,22,MUTED);label(c,'DIRECTIONAL OUTLOOK',565,604,22,MUTED);
  }
  if(index===3){
   ['Everyday neutrals','Coordinated colour','Gift-ready format'].forEach((t,i)=>{label(c,`0${i+1}`,50,254+i*119,27,BLUE);label(c,t,128,255+i*119,37);label(c,['A versatile starting point','Four shades, one considered edit','A clear product proposition'][i],128,297+i*119,24,MUTED);if(i<2)rule(c,128,328+i*119,810);});
  }
  if(index===4){label(c,'SOFT HAZE',48,224,28,BLUE);label(c,'FOUR-SHADE EYE PALETTE',48,630,25);label(c,'A considered colour story',48,674,22,MUTED);}
  if(index!==4)label(c,'CONCEPT STUDY  ·  ILLUSTRATIVE DATA',48,h-27,19,'#718da3');
 },1024,720);
}
export function screenTexture(){return canvasTexture((c,w,h)=>{
 surface(c,w,h);label(c,'PRODUCT INTELLIGENCE',55,85,38,INK,500);label(c,'BEAUTY  /  COLOUR COSMETICS',55,132,23,MUTED);label(c,'INSIGHT STUDY    01',w-365,82,22,BLUE);rule(c,55,165,w-110);
 label(c,'ILLUSTRATIVE RESEARCH  /  HUMAN REVIEW',55,h-44,20,MUTED);
},1536,1080);}
export function reviewTexture(){return canvasTexture((c,w,h)=>{surface(c,w,h);label(c,'CUSTOMER FEEDBACK',42,52,21,BLUE);label(c,'5.0  /  5',w-170,52,22,INK);rule(c,42,79,w-84);label(c,'SOFT HAZE  ·  COLOUR COLLECTION',42,h-32,19,MUTED);},768,240);}
export function commerceTexture(){return canvasTexture((c,w,h)=>{
 rounded(c,3,3,w-6,h-6,24);c.fillStyle='#eeeae3';c.fill();c.strokeStyle='#bcb7b0';c.lineWidth=3;c.stroke();
 label(c,'THE BEAUTY EDIT',65,86,42,'#272725',500);label(c,'COLLECTION     /     COLOUR     /     OUR STORY',745,81,22,'#77736b');rule(c,60,122,w-120,'#d1cbc1');
 label(c,'BEAUTY  /  EYES  /  SOFT HAZE',65,175,19,'#858077');
 rounded(c,62,217,618,546,12);c.fillStyle=gradient(c,60,220,680,760,[[0,'#dfd7cc'],[1,'#f5f1eb']]);c.fill();
 ['#c0aa91','#967258','#ba8d80','#e6dbc7'].forEach((color,i)=>{rounded(c,80+i*77,790,57,57,5);c.fillStyle=color;c.fill();});label(c,'THE NEUTRAL EDIT',411,827,20,'#7c756c');
 rule(c,65,885,w-130,'#d1cbc1');label(c,'CUSTOMER REVIEWS',65,940,27,'#3c3832');label(c,'CONCEPT COLLECTION  ·  DEMONSTRATION',65,h-31,17,'#8b857c');
},1536,1080);}
export function commerceDetails(){return canvasTexture((c)=>{
 label(c,'COLOUR COLLECTION',30,65,21,'#8c7762');label(c,'Soft Haze',30,151,80,'#302b25');label(c,'Four-shade eye palette',30,206,32,'#6e665c');
 label(c,'4.8 / 5    ·    Customer rating',30,270,25,'#8d7257');rule(c,30,305,605,'#cec6ba');label(c,'$28.00',30,380,57,'#332d26');
 label(c,'Warm neutrals, softly considered.',30,447,26,'#6e665c');label(c,'Champagne · rose · taupe · ivory',30,491,24,'#82786c');
 rounded(c,30,545,610,76,6);c.fillStyle='#38362f';c.fill();label(c,'ADD TO BAG',220,595,25,'#f7f3ec');
 label(c,'CONCEPT PRODUCT   /   NO LIVE CHECKOUT',30,674,19,'#8a8174');
},720,720);}
