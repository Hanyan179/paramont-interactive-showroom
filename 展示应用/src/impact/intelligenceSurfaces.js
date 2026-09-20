// Authored, local demonstration UI textures. No business measurements are implied.
import * as THREE from 'three';
import {proposalDirections,researchReports} from './intelligenceResearch.js';
const zh={
 'Reviewing':'审查中','Passed over':'暂缓验证','Selected':'选中打样',
 'CUSTOMER FEEDBACK':'客户反馈','INTEGRATED SET  ·  USE & DELIVERY':'一体组合款 · 使用与交付',
 'THE PRODUCT EDIT':'产品精选','PRODUCTS     /     DELIVERY     /     OUR STORY':'产品 / 交付 / 品牌故事',
 'PRODUCTS  /  PORTABLE  /  INTEGRATED SET':'产品 / 便携设计 / 一体组合',
 'DETAILS & FINISHES':'细节与材质','PRODUCT DETAILS & DELIVERY':'产品详情与交付',
 'CUSTOMER REVIEWS':'购买者评价','CONCEPT COLLECTION  ·  DEMONSTRATION':'概念系列 · 展示示例',
 'SELECTED FOR DEVELOPMENT':'选中开发方向','Integrated set':'一体组合款','Divided storage. Ready to carry.':'分区组合 · 随行收纳',
 '4.8 / 5    ·    Illustrative rating':'4.8 / 5 · 演示评分','Complementary uses in one compact.':'互补用途，集中收纳。',
 'Check specs, packaging and delivery.':'确认规格、包装与交付要求。','ADD TO BAG':'加入购物袋',
 'CONCEPT PRODUCT / ILLUSTRATIVE PRICE':'概念商品 / 演示价格',
 'Great product.':'很棒的产品。','Perfect gift.':'很适合送礼。','Love it.':'非常喜欢。','Good quality.':'品质很好。','Easy to carry.':'携带很方便。','Easy to store.':'收纳很方便。',
 'INTEGRATED SET  /  CONCEPT SAMPLE':'一体组合款 / 概念样品',
 'VERIFIED PURCHASE':'已购买','Style / Integrated set':'款式 / 一体组合款',
};
export function translate(text,lang){if(lang!=="zh")return text;if(zh[text])return zh[text];return text.replace(/INSIGHT/g,"洞察").replace(/DECISION/g,"决策").replace(/ orders/g," 笔订单").replace(/ reviews/g," 条评价");}
export const INK='#e2edf5',MUTED='#91a7bc',BLUE='#9edaff';
export function canvasTexture(draw,w=1536,h=1024){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const context=canvas.getContext('2d');draw(context,w,h);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.userData.redraw=lang=>{context.clearRect(0,0,w,h);context.journeyLang=lang;draw(context,w,h);texture.needsUpdate=true;};return texture;
}
export function label(c,text,x,y,size=36,color=INK,weight=400){
 const translated=translate(text,c.journeyLang);c.fillStyle=color;c.font=`${weight} ${size}px Arial, sans-serif`;
 const width=c.canvas?.width,available=c.textAlign==='center'?Math.min(x,width-x)*2-24:width-x-28;
 const measured=c.measureText(translated).width;
 if(Number.isFinite(available)&&available>0&&measured>available)c.font=`${weight} ${size*available/measured}px Arial, sans-serif`;
 c.fillText(translated,x,y);
}
export function rounded(c,x,y,w,h,r=24){c.beginPath();c.roundRect(x,y,w,h,r);}
function gradient(c,x,y,w,h,stops){const g=c.createLinearGradient(x,y,w,h);stops.forEach(([p,color])=>g.addColorStop(p,color));return g;}
function rule(c,x,y,w,color='#294053'){c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();}
function surface(c,w,h){
 rounded(c,3,3,w-6,h-6,26);c.fillStyle=gradient(c,0,0,w,h,[[0,'#20394e'],[.45,'#101e2e'],[1,'#0a1421']]);c.fill();
 c.strokeStyle=gradient(c,0,0,w,h,[[0,'#a7c9dc'],[.25,'#405a70'],[.7,'#314254'],[1,'#80a9c1']]);c.lineWidth=3;c.stroke();
 rounded(c,12,12,w-24,h-24,21);c.strokeStyle='rgba(155,201,225,.07)';c.lineWidth=1;c.stroke();
}
// Each direction has its own editorial composition; the open areas host real geometry.
export function cardTexture(index){
 const direction=proposalDirections[index];
 return canvasTexture((c,w,h)=>{
  const cn=c.journeyLang==='zh',l=cn?0:1;
  surface(c,w,h);label(c,`0${index+1}`,48,61,25,direction.accent);label(c,direction.tag[l],112,61,22,MUTED);
  label(c,direction.title[l],48,135,cn?58:52,INK,500);rule(c,48,167,w-96);
  const line=(text,x,y,size=30,color=MUTED)=>label(c,text,x,y,size,color);
  if(index===0){
   line(cn?'需求与成本':'NEED + COST',445,245,29,direction.accent);
   direction.facts.forEach((v,i)=>{line(v[l],445,321+i*91,cn?31:25);rule(c,445,347+i*91,520);});
   line(cn?'轻量 · 取用 · 保护':'LIGHT · ACCESS · PROTECT',445,591,26,direction.accent);
  }else if(index===1){
   [cn?'保护':'PROTECT',cn?'内托':'INSERT',cn?'外包装':'OUTER PACK'].forEach((v,i)=>{c.fillStyle=['#be8c87','#926e70','#64565f'][i];c.beginPath();c.arc(150+i*350,255,42-i*5,0,Math.PI*2);c.fill();line(v,85+i*350,332,29);});
   direction.facts.forEach((v,i)=>line(v[l],48,459+i*61,cn?31:25));
  }else if(index===2){
   line(cn?'规格与备货':'SIZES + STOCK',48,244,28,direction.accent);
   [cn?'基础规格':'CORE SIZE',cn?'扩展规格':'LARGER SIZE',cn?'组合规格':'BUNDLE'].forEach((v,i)=>{c.fillStyle=['#d5c0aa','#b9997d','#7f6457'][i];rounded(c,48,276+i*94,420,52,5);c.fill();line(v,68,312+i*94,27,'#182330');});
   line(direction.facts[1][l],48,601,28);line(direction.facts[2][l],48,650,25);
  }else if(index===3){
   line(cn?'核心用途':'CORE USE',573,277,31,direction.accent);rule(c,566,303,390);
   line(cn?'结构简化':'SIMPLER FORM',573,375,31,direction.accent);rule(c,566,401,390);
   line(cn?'成本复核':'COST REVIEW',573,473,31,direction.accent);rule(c,566,499,390);
   line(direction.facts[0][l],48,609,cn?31:27);line(direction.facts[2][l],48,657,25);
  }else{
   line(cn?'选中后的验证重点':'SELECTED / NEXT CHECKS',565,229,23,direction.accent);
   const labels=cn?['用途 · 互补组合','成本 · 完整核算','结构 · 分区收纳','交付 · 打样评审']:['Use / complementary','Cost / full estimate','Form / divided storage','Delivery / sample review'];
   labels.forEach((v,i)=>line(v,565,309+i*71,cn?31:25));
   rule(c,48,586,w-96);line(cn?'组合开发 · 样品验证 · 报价与备货':'Combine · sample · quote · plan stock',48,638,cn?29:27,direction.accent);
  }
  line(cn?'原创概念 / 需样品验证':'AUTHORED CONCEPT / SAMPLE TESTING REQUIRED',48,h-23,18,'#8099ad');
 },1024,720);
}
export function reviewNoteTexture(index){return canvasTexture((c,w)=>{
 const l=c.journeyLang==='zh'?0:1;c.textAlign='center';
 label(c,l===0?'产品方向 / 需求 · 成本 · 交付':'PRODUCT REVIEW / NEED · COST · DELIVERY',w/2,45,25,MUTED);
 label(c,proposalDirections[index].review[l],w/2,126,49,INK);
},1280,170);}
export function reviewPaperTexture(){return canvasTexture(surface,768,240);}
export function reviewDetailsTexture(){return canvasTexture((c,w,h)=>{label(c,'CUSTOMER FEEDBACK',42,52,21,BLUE);label(c,'5.0  /  5',w-170,52,22,INK);rule(c,42,79,w-84);label(c,'INTEGRATED SET  ·  USE & DELIVERY',42,h-32,19,MUTED);},768,240);}
export function commerceTexture(){return canvasTexture((c,w,h)=>{
 rounded(c,3,3,w-6,h-6,24);c.fillStyle='#eeeae3';c.fill();c.strokeStyle='#bcb7b0';c.lineWidth=3;c.stroke();
 label(c,'THE PRODUCT EDIT',220,86,42,'#272725',500);label(c,'PRODUCTS     /     DELIVERY     /     OUR STORY',745,81,22,'#77736b');rule(c,60,122,w-120,'#d1cbc1');
 label(c,'PRODUCTS  /  PORTABLE  /  INTEGRATED SET',65,175,19,'#858077');
 rounded(c,62,217,618,546,12);c.fillStyle=gradient(c,60,220,680,760,[[0,'#dfd7cc'],[1,'#f5f1eb']]);c.fill();
 ['#c0aa91','#967258','#ba8d80','#e6dbc7'].forEach((color,i)=>{rounded(c,80+i*77,790,57,57,5);c.fillStyle=color;c.fill();});label(c,'DETAILS & FINISHES',411,827,20,'#7c756c');
 label(c,'PRODUCT DETAILS & DELIVERY',65,930,24,'#77736b');rule(c,65,1060,w-130,'#d1cbc1');label(c,'CUSTOMER REVIEWS',65,1135,35,'#3c3832');label(c,'CONCEPT COLLECTION  ·  DEMONSTRATION',65,h-31,17,'#8b857c');
},1536,2100);}
export function commerceDetails(){return canvasTexture((c)=>{
 label(c,'SELECTED FOR DEVELOPMENT',30,65,21,'#8c7762');label(c,'Integrated set',30,151,80,'#302b25');label(c,'Divided storage. Ready to carry.',30,206,32,'#6e665c');
 label(c,'4.8 / 5    ·    Illustrative rating',30,270,25,'#8d7257');rule(c,30,305,605,'#cec6ba');label(c,'$28.00',30,380,57,'#332d26');
 label(c,'Complementary uses in one compact.',30,447,26,'#6e665c');label(c,'Check specs, packaging and delivery.',30,491,24,'#82786c');
 rounded(c,30,545,610,76,6);c.fillStyle='#38362f';c.fill();label(c,'ADD TO BAG',220,595,25,'#f7f3ec');
 label(c,'CONCEPT PRODUCT / ILLUSTRATIVE PRICE',30,674,19,'#8a8174');
},720,720);}

export function purchaseReviewPaperTexture(){return canvasTexture((c,w,h)=>{
 rounded(c,2,2,w-4,h-4,24);c.fillStyle='#fffdf9';c.fill();c.strokeStyle='#d5cfc5';c.lineWidth=2;c.stroke();
},1024,390);}
export function purchaseReviewDetailsTexture(index=0){return canvasTexture((c,w,h)=>{
 // Authored editorial avatars: illustration, not a real customer endorsement.
 const palette=['#acb7a8','#b8a79f','#b0b9c1','#c3b49b','#aab6b0','#bca5a9'],cx=76,cy=72;
 c.save();c.beginPath();c.arc(cx,cy,39,0,Math.PI*2);c.clip();c.fillStyle=palette[index];c.fillRect(cx-40,cy-40,80,80);
 c.fillStyle=['#514940','#373e46','#655349'][index%3];c.beginPath();c.ellipse(cx,cy+46,37,34,0,0,Math.PI*2);c.fill();
 c.fillStyle=['#dfbca0','#cda285','#e8c9ac'][index%3];c.beginPath();c.ellipse(cx,cy-2,18,25,0,0,Math.PI*2);c.fill();
 c.fillStyle=['#3c3532','#604a3c','#292e33'][index%3];c.beginPath();c.ellipse(cx-4,cy-20,21,14,-.2,0,Math.PI*2);c.fill();c.restore();
 label(c,c.journeyLang==='zh'?['林女士','陈女士','周女士','吴女士','许女士','苏女士'][index]:['Emma L.','Sophie C.','Mia Z.','Olivia W.','Lily X.','Ava S.'][index],137,62,42,'#292d32',600);
 label(c,'VERIFIED PURCHASE',137,108,29,'#677b64');label(c,'★★★★★',w-228,64,29,'#a8894e');label(c,c.journeyLang==='zh'?'9月18日':'18 Sep',w-139,107,28,'#85898c');
 rule(c,36,135,w-72,'#e5e1da');
 const details=c.journeyLang==='zh'?['用途很清楚，日常用起来很方便。','包装完好，收到礼物的人很喜欢。','几种用途放在一起，少带了几件。','做工扎实，开合和取用都很顺手。','出门方便携带，希望说明更清楚。','分区收纳很方便，尺寸比预想稍大。']:['Clear purpose and easy to use every day.','Arrived intact. A thoughtful gift.','Several uses together, fewer pieces to carry.','Solid build. Easy to open and use.','Easy to carry; clearer instructions would help.','Easy to store; a little larger than expected.'];
 label(c,details[index],38,289,34,'#6b6f72');label(c,'Style / Integrated set',38,350,29,'#84878a');label(c,c.journeyLang==='zh'?'有帮助 · '+(12-index):'Helpful · '+(12-index),w-235,350,29,'#677b64');
},1024,390);}
// These are qualitative studies, so their visual language is comparison,
// quotation, construction and open questions—not invented quantitative charts.
function reportParagraph(c,text,x,y,width,size,color=INK){
 const tokens=c.journeyLang==='zh'?Array.from(text):text.split(/(?<=\s)/),lines=[];let line='';
 c.font=`400 ${size}px Arial, sans-serif`;
 for(const token of tokens){if(line&&c.measureText(line+token).width>width){lines.push(line.trim());line='';}line+=token;}
 if(line)lines.push(line.trim());
 lines.forEach((value,i)=>label(c,value,x,y+i*size*1.25,size,color));
}
function drawFeedbackReport(c,report,l){
 report.lines.slice(0,2).forEach((line,i)=>{
  const y=210+i*146;rounded(c,39,y,690,129,10);c.fillStyle='#152c40';c.fill();
  rule(c,39,y+13,4,BLUE);reportParagraph(c,line[l],67,y+49,630,l===0?34:32);
 });
 label(c,report.lines[2][l],39,553,l===0?32:27,BLUE);
}
function drawRecordReport(c,report,l){
 label(c,l===0?'同一商品编码，关联完整资料':'ONE PRODUCT ID / CONNECTED RECORDS',39,232,l===0?30:25,BLUE);
 report.lines.forEach((line,i)=>{
  const y=276+i*91,parts=line[l].split(l===0?'：':': ');
  rounded(c,39,y-27,112,54,7);c.fillStyle='#213d52';c.fill();label(c,parts[0],54,y+9,l===0?32:26,BLUE);
  label(c,parts[1],178,y+9,l===0?32:26);rule(c,178,y+33,549);
 });
 label(c,l===0?'档案 → 设计 → 报价 → 订单':'RECORD → DESIGN → QUOTE → ORDER',39,555,l===0?29:25,MUTED);
}
function drawTrendReport(c,report,l){
 report.lines.forEach((line,i)=>{
  const y=221+i*115,parts=line[l].split(l===0?'：':': ');
  c.strokeStyle='#567992';c.lineWidth=2;c.beginPath();c.arc(62,y+22,18,0,Math.PI*2);c.stroke();
  if(i<2){c.beginPath();c.moveTo(62,y+43);c.lineTo(62,y+111);c.stroke();}
  label(c,parts[0],106,y+32,l===0?39:33,BLUE);label(c,parts[1],106,y+76,l===0?30:25);
 });
}
function drawDemandReport(c,report,l){
 const headings=l===0?['历史销售','需求预测','备货计划']:['HISTORY','FORECAST','STOCK PLAN'];
 headings.forEach((heading,i)=>{
  const x=39+i*238;rounded(c,x,213,214,123,10);c.fillStyle=['#1d364b','#25445b','#1d364b'][i];c.fill();
  label(c,`0${i+1}`,x+18,251,23,BLUE);label(c,heading,x+18,306,l===0?35:26);
  if(i<2)label(c,'→',x+211,284,25,BLUE);
 });
 report.lines.forEach((line,i)=>label(c,line[l],39,398+i*66,l===0?31:26));
}
function drawCostReport(c,report,l){
 const costs=l===0?['材料','加工','包装','运输']:['MATERIALS','PROCESSING','PACKAGING','FREIGHT'];
 const details=l===0?['材料与用量','工序与装配','内托与外箱','体积与路径']:['Type and quantity','Process and assembly','Insert and outer pack','Volume and route'];
 costs.forEach((name,i)=>{
  const x=39+i%2*354,y=207+Math.floor(i/2)*139;
  rounded(c,x,y,336,121,9);c.fillStyle=i===0?'#27475c':'#1a3349';c.fill();
  label(c,name,x+23,y+47,l===0?37:27,BLUE);label(c,details[i],x+23,y+92,l===0?28:24);
 });
 label(c,report.lines[2][l],39,551,l===0?31:27,INK);
}
function drawValidationReport(c,report,l){
 report.lines.forEach((line,i)=>{
  const y=217+i*118,parts=line[l].split(l===0?'：':': ');
  rounded(c,43,y+8,34,34,4);c.strokeStyle='#7896ad';c.lineWidth=2;c.stroke();
  label(c,parts[0],106,y+38,l===0?42:35,BLUE);reportParagraph(c,parts[1],106,y+83,610,l===0?31:28);
  if(i<2)rule(c,106,y+106,618);
 });
}
export function reportTexture(index){return canvasTexture((c,w,h)=>{
 const report=researchReports[index],l=c.journeyLang==='zh'?0:1;c.textAlign='left';
 rounded(c,3,3,w-6,h-6,26);c.fillStyle=gradient(c,0,0,w,h,[[0,'#132b40'],[1,'#0c1d30']]);c.fill();c.strokeStyle='#6d8fa8';c.lineWidth=2;c.stroke();
 label(c,`0${index+1} / `+report.kind[l],39,66,l===0?24:19,BLUE);label(c,report.title[l],39,143,l===0?53:46,INK,500);rule(c,39,179,w-78);
 if(index===0)drawFeedbackReport(c,report,l);
 else if(index===1)drawRecordReport(c,report,l);
 else if(index===2)drawTrendReport(c,report,l);
 else if(index===3)drawDemandReport(c,report,l);
 else if(index===4)drawCostReport(c,report,l);
 else drawValidationReport(c,report,l);
 rule(c,39,588,w-78);label(c,l===0?'业务判断 / 下一步':'BUSINESS REVIEW / NEXT STEP',39,625,20,BLUE);label(c,report.question[l],39,672,l===0?25:23,MUTED);
},768,720);}
