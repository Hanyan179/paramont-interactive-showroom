// Authored, local demonstration UI textures. No business measurements are implied.
import * as THREE from 'three';
import {proposalDirections,researchReports} from './intelligenceResearch.js';
const zh={
 'Reviewing':'审查中','Passed over':'暂缓验证','Selected':'选中打样',
 'CUSTOMER FEEDBACK':'客户反馈','DRAWING KIT  ·  USE & DELIVERY':'绘画收纳盒 · 使用与交付',
 'THE PRODUCT EDIT':'产品精选','PRODUCTS     /     DELIVERY     /     OUR STORY':'产品 / 交付 / 品牌故事',
 'PRODUCTS  /  DRAWING  /  PORTABLE KIT':'产品 / 绘画工具 / 随行收纳',
 'DETAILS & FINISHES':'细节与材质','PRODUCT DETAILS & DELIVERY':'产品详情与交付',
 'CUSTOMER REVIEWS':'购买者评价','CONCEPT COLLECTION  ·  DEMONSTRATION':'概念系列 · 展示示例',
 'SELECTED FOR DEVELOPMENT':'选中开发方向','Portable drawing kit':'随行绘画收纳盒','Drawing tools, each in its own place.':'绘画工具各有其位，合上就能带走。',
 '4.8 / 5    ·    Illustrative rating':'4.8 / 5 · 演示评分','Pencils, paints, tools and drawing cards.':'笔组、颜料、小工具与绘画纸卡。',
 'Divided trays keep tools ready to use.':'分区内托，让每次取用和归位都顺手。','ADD TO BAG':'加入购物袋',
 'CONCEPT PRODUCT / ILLUSTRATIVE PRICE':'概念商品 / 演示价格',
 'Great product.':'很棒的产品。','Perfect gift.':'很适合送礼。','Love it.':'非常喜欢。','Good quality.':'品质很好。','Easy to carry.':'携带很方便。','Easy to store.':'收纳很方便。',
 'PORTABLE DRAWING KIT  /  CONCEPT SAMPLE':'随行绘画收纳盒 / 概念样品',
 'PURCHASE REVIEW / DEMO':'购买评价 / 演示','Style / Slate blue drawing kit':'款式 / 深蓝绘画收纳盒',
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
  const paragraph=(text,x,y,width,size=29,color=MUTED)=>reportParagraph(c,text,x,y,width,size,color);
  if(index===0){
   line(cn?'使用与保护':'USE + PROTECTION',445,235,27,direction.accent);
   direction.facts.forEach((v,i)=>{paragraph(v[l],445,302+i*97,507,cn?29:27);rule(c,445,362+i*97,510);});
   line(cn?'保留便携方向，继续验证':'RETAIN / TEST THE DETAILS',445,599,23,direction.accent);
  }else if(index===1){
   [cn?'外盒':'BOX',cn?'内托':'INSERT',cn?'装饰':'FINISH'].forEach((v,i)=>{c.fillStyle=['#9bafa9','#70888f','#465e71'][i];c.beginPath();c.arc(150+i*350,247,35-i*4,0,Math.PI*2);c.fill();line(v,91+i*350,315,27);});
   direction.facts.forEach((v,i)=>paragraph(v[l],48,400+i*81,570,cn?28:26));
  }else if(index===2){
   line(cn?'每种规格分别核对需求':'REVIEW DEMAND FOR EACH SIZE',48,233,25,direction.accent);
   direction.facts.forEach((v,i)=>{rounded(c,48,263+i*80,450,55,5);c.fillStyle=['#a9c0cd','#88a6b6','#607f93'][i];c.fill();line(v[l],68,301+i*80,28,'#182330');});
   paragraph(cn?'对照各规格历史销量，再决定备多少货。':'Compare sales by size before deciding stock levels.',48,555,906,cn?30:28);
   line(cn?'尚待销售与库存记录支持':'PENDING SALES AND STOCK RECORDS',48,644,23,direction.accent);
  }else if(index===3){
   direction.facts.slice(0,2).forEach((v,i)=>{paragraph(v[l],573,269+i*130,380,cn?29:27);rule(c,573,352+i*130,380);});
   paragraph(direction.facts[2][l],48,565,918,cn?30:28);
  }else{
   line(cn?'把保留的要素组合起来':'COMBINE THE RETAINED ELEMENTS',565,229,23,direction.accent);
   direction.facts.forEach((v,i)=>paragraph(v[l],565,297+i*92,391,cn?28:27));
   rule(c,48,566,w-96);line(cn?'结构打样 → 完整报价 → 交付评审':'SAMPLE → COMPLETE QUOTE → DELIVERY REVIEW',48,602,cn?27:25,direction.accent);
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
export function reviewDetailsTexture(){return canvasTexture((c,w,h)=>{label(c,'CUSTOMER FEEDBACK',42,52,21,BLUE);label(c,'5.0  /  5',w-170,52,22,INK);rule(c,42,79,w-84);label(c,'DRAWING KIT  ·  USE & DELIVERY',42,h-32,19,MUTED);},768,240);}
export function commerceTexture(){return canvasTexture((c,w,h)=>{
 rounded(c,3,3,w-6,h-6,24);c.fillStyle='#eeeae3';c.fill();c.strokeStyle='#bcb7b0';c.lineWidth=3;c.stroke();
 label(c,'THE PRODUCT EDIT',220,86,42,'#272725',500);label(c,'PRODUCTS     /     DELIVERY     /     OUR STORY',745,81,22,'#77736b');rule(c,60,122,w-120,'#d1cbc1');
 label(c,'PRODUCTS  /  DRAWING  /  PORTABLE KIT',65,175,19,'#858077');
 rounded(c,62,217,618,546,12);c.fillStyle=gradient(c,60,220,680,760,[[0,'#dfd7cc'],[1,'#f5f1eb']]);c.fill();
 ['#29475e','#849588','#bc8260','#e6dbc7'].forEach((color,i)=>{rounded(c,80+i*77,790,57,57,5);c.fillStyle=color;c.fill();});label(c,'DETAILS & FINISHES',411,827,20,'#7c756c');
 label(c,'PRODUCT DETAILS & DELIVERY',65,930,24,'#77736b');rule(c,65,1060,w-130,'#d1cbc1');label(c,'CUSTOMER REVIEWS',65,1135,35,'#3c3832');label(c,'CONCEPT COLLECTION  ·  DEMONSTRATION',65,h-31,17,'#8b857c');
},1536,2100);}
export function commerceDetails(){return canvasTexture((c)=>{
 label(c,'SELECTED FOR DEVELOPMENT',30,65,21,'#8c7762');label(c,'Portable drawing kit',30,151,80,'#302b25');label(c,'Drawing tools, each in its own place.',30,206,32,'#6e665c');
 label(c,'4.8 / 5    ·    Illustrative rating',30,270,25,'#8d7257');rule(c,30,305,605,'#cec6ba');label(c,'$28.00',30,380,57,'#332d26');
 label(c,'Pencils, paints, tools and drawing cards.',30,447,26,'#6e665c');label(c,'Divided trays keep tools ready to use.',30,491,24,'#82786c');
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
 label(c,'PURCHASE REVIEW / DEMO',137,108,29,'#677b64');label(c,'★★★★★',w-228,64,29,'#a8894e');label(c,c.journeyLang==='zh'?'9月18日':'18 Sep',w-139,107,28,'#85898c');
 rule(c,36,135,w-72,'#e5e1da');
 const details=c.journeyLang==='zh'?['出门画画不用再找几个袋子，笔和纸都在一起。','送给喜欢画画的朋友，打开就能找到常用工具。','笔组和颜料放在一起，临时想画点什么很方便。','内托分区清楚，橡皮和削笔器不会在盒子里乱跑。','放进背包很方便，希望补充颜料的说明更清楚。','纸卡收得很平整，不过整盒比我预想的稍厚。']:['No more separate bags. My pencils and paper stay together.','A gift for a friend who draws. The tools are easy to find.','Pencils and paints together make a quick sketch easier.','Dividers keep the eraser and sharpener from moving around.','Easy to pack; clearer paint refill instructions would help.','The paper stays flat, though the case is thicker than I expected.'];
 reportParagraph(c,details[index],38,270,938,31,'#6b6f72');label(c,'Style / Slate blue drawing kit',38,350,29,'#84878a');label(c,c.journeyLang==='zh'?'有帮助 · '+(12-index):'Helpful · '+(12-index),w-235,350,29,'#677b64');
},1024,390);}
// These are qualitative studies, so their visual language is comparison,
// quotation, construction and open questions—not invented quantitative charts.
function reportParagraph(c,text,x,y,width,size,color=INK){
 const tokens=c.journeyLang==='zh'?Array.from(text):text.split(/(?<=\s)/),lines=[];let line='';
 c.font=`400 ${size}px Arial, sans-serif`;
 for(const token of tokens){if(line&&c.measureText(line+token).width>width&&!/^[，。；：！？、”）]$/.test(token)){lines.push(line.trim());line='';}line+=token;}
 if(line)lines.push(line.trim());
 // Balance short Chinese endings instead of leaving punctuation or two characters alone.
 if(c.journeyLang==='zh'&&lines.length>1){const last=lines.length-1;if(lines[last].length<lines[last-1].length*.45){const pair=lines[last-1]+lines[last];let cut=Math.ceil(pair.length/2);while(/[，。；：！？、”）]/.test(pair[cut]||''))cut++;lines[last-1]=pair.slice(0,cut);lines[last]=pair.slice(cut);}}
 lines.forEach((value,i)=>label(c,value,x,y+i*size*1.25,size,color));
}
function drawFeedbackReport(c,report,l){
 report.lines.slice(0,2).forEach((line,i)=>{
  const y=208+i*146;rounded(c,39,y,690,131,10);c.fillStyle='#152c40';c.fill();
  reportParagraph(c,line[l],62,y+42,638,l===0?31:29);
 });
 reportParagraph(c,report.lines[2][l],39,533,690,l===0?27:25,BLUE);
}
function drawRecordReport(c,report,l){
 label(c,l===0?'文具品类 14 / 已收录细类':'STATIONERY 14 / RECORDED SUBCATEGORIES',39,226,l===0?28:25,BLUE);
 report.lines.forEach((line,i)=>{
  const y=278+i*83,parts=line[l].split(l===0?'：':': ');
  rounded(c,39,y-26,118,53,7);c.fillStyle='#213d52';c.fill();label(c,parts[0],56,y+10,31,BLUE);
  label(c,parts[1],182,y+10,36);rule(c,182,y+34,540);
 });
 reportParagraph(c,l===0?'同一份档案继续关联尺寸、材料、图片和包装规格。':'Link dimensions, materials, images and packaging to each product record.',39,543,690,27,MUTED);
}
function drawNoteReport(c,report,l){
 report.lines.forEach((line,i)=>{
  const y=219+i*118,parts=line[l].split(l===0?'：':': ');
  label(c,`0${i+1}`,39,y+4,24,BLUE);
  label(c,parts[0],99,y+4,l===0?32:29,BLUE);
  reportParagraph(c,parts.slice(1).join(': '),99,y+47,623,l===0?29:27);
  if(i<2)rule(c,99,y+91,623);
 });
}
function drawDemandReport(c,report,l){
 const headings=l===0?['实销记录','可用库存','在途与缺货']:['ACTUAL SALES','AVAILABLE','INCOMING / GAPS'];
 headings.forEach((heading,i)=>{const x=39+i*235;rounded(c,x,209,220,74,8);c.fillStyle='#213d52';c.fill();label(c,heading,x+13,254,l===0?28:20,BLUE);});
 report.lines.forEach((line,i)=>reportParagraph(c,line[l],39,333+i*86,690,l===0?28:26));
}
function drawImageReport(c,report,l,productTexture){
 const image=productTexture?.image;
 // Crop only interior product details. The image is a concept source, never a sales result.
 const crops=[[.22,.14,.58,.17],[.235,.421,.238,.185],[.527,.421,.227,.178]];
 crops.forEach(([sx,sy,sw,sh],i)=>{const x=39+i*235;
  rounded(c,x,207,218,150,8);c.fillStyle='#213d52';c.fill();
  if(image?.complete&&image.naturalWidth)c.drawImage(image,sx*image.width,sy*image.height,sw*image.width,sh*image.height,x+7,214,204,136);
  label(c,(l===0?['纸面与上盖','绘画笔组','上色部件']:['PAPER / LID','PENCIL SET','PAINT TRAY'])[i],x,391,l===0?26:22,BLUE);
 });
 report.lines.slice(1).forEach((line,i)=>reportParagraph(c,line[l],39,456+i*71,690,l===0?28:26));
}
export function reportTexture(index,productTexture){return canvasTexture((c,w,h)=>{
 const report=researchReports[index],l=c.journeyLang==='zh'?0:1;c.textAlign='left';
 rounded(c,3,3,w-6,h-6,26);c.fillStyle=gradient(c,0,0,w,h,[[0,'#132b40'],[1,'#0c1d30']]);c.fill();c.strokeStyle='#6d8fa8';c.lineWidth=2;c.stroke();
 label(c,`0${index+1} / `+report.kind[l],39,66,l===0?24:19,BLUE);label(c,report.title[l],39,143,l===0?51:43,INK,500);rule(c,39,179,w-78);
 if(index===0)drawFeedbackReport(c,report,l);
 else if(index===1)drawRecordReport(c,report,l);
 else if(index===3)drawDemandReport(c,report,l);
 else if(index===4)drawImageReport(c,report,l,productTexture);
 else drawNoteReport(c,report,l);
 rule(c,39,599,w-78);label(c,report.source[l],39,636,l===0?22:20,BLUE);label(c,report.question[l],39,683,l===0?24:22,MUTED);
},768,720);}
