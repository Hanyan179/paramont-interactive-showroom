// Authored, local demonstration UI textures. No business measurements are implied.
import * as THREE from 'three';
import {proposalDirections,researchReports} from './intelligenceResearch.js';
const zh={"Reviewing":"审查中","Passed over":"暂不采用","Selected":"已选中","VOICE OF CUSTOMER":"用户声音","Customer voice":"用户声音","Product design":"商品设计","Market signals":"市场信号","Colour trends":"色彩趋势","Usage occasions":"使用场景","Quality feedback":"品质反馈","Sales Trend": "销售趋势", "Customer Sentiment": "用户感受", "Sales Forecast": "销售预测", "Market Opportunity": "市场机会", "Recommendation": "设计建议", "Market Trend": "市场趋势", "Customer Preference": "用户偏好", "Opportunity": "机会方向", "Recommended Product": "推荐设计", "Growing interest": "关注度上升", "Soft texture": "柔和质感", "Wearable": "日常百搭", "Gift appeal": "礼赠需求", "Directional outlook": "趋势展望", "Everyday neutrals": "日常中性色", "Coordinated colour": "协调的色彩", "Gift-ready format": "精致礼赠形式", "SOFT HAZE": "柔雾系列", "Soft Haze": "柔雾系列", "Four-shade eye palette": "四色眼影盘", "A considered colour story": "让色彩形成完整表达", "A consistent upward signal": "持续出现的上升信号", "DISCOVER": "发现", "CONSIDER": "比较", "CHOOSE": "选择", "VOICE": "倾听", "OF CUSTOMER": "用户声音", "Wearable shades": "百搭色调", "Themes drawn from feedback": "从反馈中提炼偏好", "OBSERVED": "已观察", "DIRECTIONAL OUTLOOK": "趋势展望", "A versatile starting point": "从适合日常的设计出发", "Four shades, one considered edit": "四种色彩，一体表达", "A clear product proposition": "清晰的商品主张", "FOUR-SHADE EYE PALETTE": "四色眼影盘", "CONCEPT STUDY  ·  ILLUSTRATIVE DATA": "概念研究 · 演示数据", "PRODUCT INTELLIGENCE": "产品洞察", "BEAUTY  /  COLOUR COSMETICS": "美妆 / 色彩设计", "INSIGHT STUDY    01": "洞察研究 01", "ILLUSTRATIVE RESEARCH  /  HUMAN REVIEW": "概念研究 / 人工复核", "CUSTOMER FEEDBACK": "用户反馈", "SOFT HAZE  ·  COLOUR COLLECTION": "柔雾系列 · 色彩作品", "THE BEAUTY EDIT": "美妆精选", "COLLECTION     /     COLOUR     /     OUR STORY": "系列 / 色彩 / 品牌故事", "BEAUTY  /  EYES  /  SOFT HAZE": "美妆 / 眼部 / 柔雾系列", "THE NEUTRAL EDIT": "自然色彩系列", "CUSTOMER REVIEWS": "购买者评价", "CONCEPT COLLECTION  ·  DEMONSTRATION": "概念系列 · 展示示例", "COLOUR COLLECTION": "色彩系列", "4.8 / 5    ·    Customer rating": "4.8 / 5 · 用户评分", "Warm neutrals, softly considered.": "温暖中性色，柔和而有分寸。", "Champagne · rose · taupe · ivory": "香槟 · 玫瑰 · 灰褐 · 象牙白", "ADD TO BAG": "加入购物袋", "CONCEPT PRODUCT   /   NO LIVE CHECKOUT": "概念商品 / 无实际交易", "Great product.": "很棒的产品。", "Perfect gift.": "很适合送礼。", "Love it.": "非常喜欢。", "Good quality.": "品质很好。", "Beautiful colours.": "配色很好看。", "Soft texture.": "质感很柔和。", "SOFT HAZE  /  FOUR-SHADE EYE PALETTE": "柔雾系列 / 四色眼影盘", "DESIGN DIRECTION": "设计方向", "COLOUR / FORM / FEEL": "色彩 / 形态 / 触感", "Warm neutrals": "温暖中性色", "Satin finish": "缎光质感", "Everyday ritual": "日常仪式感", "A quiet statement": "含蓄的风格表达", "VERIFIED PURCHASE": "已购买", "Shade / Soft Haze": "款式 / 柔雾系列", "First impressions": "初次体验", "DESIGN SYNTHESIS": "设计汇总", "Colour harmony": "色彩协调", "Considered form": "精致形态", "Soft-touch finish": "柔和触感", "A modern essential": "现代日常之选", "REVIEWS": "评价", "DISCOVER THE COLLECTION": "探索系列"};
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
   line(cn?'色彩与光泽':'COLOUR + SHINE',445,245,29,direction.accent);
   direction.facts.forEach((v,i)=>{line(v[l],445,321+i*91,cn?32:26);rule(c,445,347+i*91,520);});
   [0,1,2].forEach(i=>{c.fillStyle=['#b86d78','#9f6777','#cc9790'][i];rounded(c,475+i*145,571,115,25,12);c.fill();});
  }else if(index===1){
   [cn?'点涂':'DOT',cn?'晕开':'BLEND',cn?'叠色':'LAYER'].forEach((v,i)=>{c.fillStyle=['#be8c87','#926e70','#64565f'][i];c.beginPath();c.arc(150+i*350,255,42-i*5,0,Math.PI*2);c.fill();line(v,101+i*350,332,30);});
   line(direction.facts[0][l],48,459,cn?33:28);line(direction.facts[1][l],48,518,cn?33:28);line(cn?'边界柔和，保留层次':'Diffuse edges. Keep dimension.',48,589,29,direction.accent);
  }else if(index===2){
   line(cn?'覆盖程度':'COVERAGE',48,244,28,direction.accent);
   [cn?'透':'SHEER',cn?'薄':'LIGHT',cn?'匀':'EVEN'].forEach((v,i)=>{c.fillStyle=['#d5c0aa','#b9997d','#7f6457'][i];rounded(c,48,276+i*94,420,52,5);c.fill();line(v,68,312+i*94,27,'#182330');});
   line(direction.facts[1][l],48,601,28);line(cn?'需验证分层与取用':'Test settling and dispensing',48,650,25);
  }else if(index===3){
   c.strokeStyle='#77776f';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(318,406,105+i*46,133+i*29,-.32,0,Math.PI*2);c.stroke();}
   line(cn?'颧骨':'CHEEK',573,300,31,direction.accent);rule(c,466,319,390);
   line(cn?'眉骨':'BROW',573,406,31,direction.accent);rule(c,466,425,390);
   line(cn?'局部点亮，轻推边缘':'Place light. Soften the edge.',48,609,30);line(direction.facts[0][l],48,657,25);
  }else{
   line(cn?'日常配色提案':'EVERYDAY COLOUR STUDY',565,229,23,direction.accent);
   const labels=cn?['香槟 · 提亮','灰褐 · 加深','玫瑰 · 过渡','象牙 · 打底']:['Champagne / light','Taupe / define','Rose / blend','Ivory / base'];
   labels.forEach((v,i)=>line(v,565,309+i*71,cn?32:27));
   rule(c,48,586,w-96);line(cn?'四种用途 · 镜面盒盖 · 随行收纳':'Four roles · mirror lid · portable case',48,638,cn?29:27,direction.accent);
  }
  line(cn?'原创概念 / 需样品验证':'AUTHORED CONCEPT / SAMPLE TESTING REQUIRED',48,h-23,18,'#8099ad');
 },1024,720);
}
export function reviewNoteTexture(index){return canvasTexture((c,w)=>{
 const l=c.journeyLang==='zh'?0:1;c.textAlign='center';
 label(c,l===0?'随行彩妆 / 概念评审':'PORTABLE BEAUTY / CONCEPT REVIEW',w/2,45,25,MUTED);
 label(c,proposalDirections[index].review[l],w/2,126,49,INK);
},1280,170);}
export function reviewPaperTexture(){return canvasTexture(surface,768,240);}
export function reviewDetailsTexture(){return canvasTexture((c,w,h)=>{label(c,'CUSTOMER FEEDBACK',42,52,21,BLUE);label(c,'5.0  /  5',w-170,52,22,INK);rule(c,42,79,w-84);label(c,'SOFT HAZE  ·  COLOUR COLLECTION',42,h-32,19,MUTED);},768,240);}
export function commerceTexture(){return canvasTexture((c,w,h)=>{
 rounded(c,3,3,w-6,h-6,24);c.fillStyle='#eeeae3';c.fill();c.strokeStyle='#bcb7b0';c.lineWidth=3;c.stroke();
 label(c,'THE BEAUTY EDIT',220,86,42,'#272725',500);label(c,'COLLECTION     /     COLOUR     /     OUR STORY',745,81,22,'#77736b');rule(c,60,122,w-120,'#d1cbc1');
 label(c,'BEAUTY  /  EYES  /  SOFT HAZE',65,175,19,'#858077');
 rounded(c,62,217,618,546,12);c.fillStyle=gradient(c,60,220,680,760,[[0,'#dfd7cc'],[1,'#f5f1eb']]);c.fill();
 ['#c0aa91','#967258','#ba8d80','#e6dbc7'].forEach((color,i)=>{rounded(c,80+i*77,790,57,57,5);c.fillStyle=color;c.fill();});label(c,'THE NEUTRAL EDIT',411,827,20,'#7c756c');
 label(c,'DISCOVER THE COLLECTION',65,930,24,'#77736b');rule(c,65,1060,w-130,'#d1cbc1');label(c,'CUSTOMER REVIEWS',65,1135,35,'#3c3832');label(c,'CONCEPT COLLECTION  ·  DEMONSTRATION',65,h-31,17,'#8b857c');
},1536,2100);}
export function commerceDetails(){return canvasTexture((c)=>{
 label(c,'COLOUR COLLECTION',30,65,21,'#8c7762');label(c,'Soft Haze',30,151,80,'#302b25');label(c,'Four-shade eye palette',30,206,32,'#6e665c');
 label(c,'4.8 / 5    ·    Customer rating',30,270,25,'#8d7257');rule(c,30,305,605,'#cec6ba');label(c,'$28.00',30,380,57,'#332d26');
 label(c,'Warm neutrals, softly considered.',30,447,26,'#6e665c');label(c,'Champagne · rose · taupe · ivory',30,491,24,'#82786c');
 rounded(c,30,545,610,76,6);c.fillStyle='#38362f';c.fill();label(c,'ADD TO BAG',220,595,25,'#f7f3ec');
 label(c,'CONCEPT PRODUCT   /   NO LIVE CHECKOUT',30,674,19,'#8a8174');
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
 const details=c.journeyLang==='zh'?['上脸很自然，日常出门也很好搭配。','包装很用心，收到礼物的人很喜欢。','比想象中更细腻，会继续使用。','质感扎实，细节做得很到位。','几种颜色搭在一起，轻松完成日常妆。','触感轻柔，使用体验很舒服。']:['Natural colour, easy to wear every day.','Thoughtful packaging. A lovely gift.','Finer texture than I expected. Love it.','Beautifully made, with considered details.','The shades work beautifully together.','Soft to the touch and lovely to use.'];
 label(c,details[index],38,289,34,'#6b6f72');label(c,'Shade / Soft Haze',38,350,29,'#84878a');label(c,c.journeyLang==='zh'?'有帮助 · '+(12-index):'Helpful · '+(12-index),w-235,350,29,'#677b64');
},1024,390);}
export function reportTexture(index){return canvasTexture((c,w,h)=>{
 const report=researchReports[index],l=c.journeyLang==='zh'?0:1;
 rounded(c,3,3,w-6,h-6,26);c.fillStyle='#102337';c.fill();c.strokeStyle='#6d8fa8';c.lineWidth=2;c.stroke();
 label(c,`0${index+1} / `+report.kind[l],38,64,l===0?23:18,BLUE);label(c,report.title[l],38,136,l===0?47:36,INK,500);rule(c,38,175,w-76);
 if(index===3){['#c3a287','#92735d','#b8847e','#e4d0b9'].forEach((v,i)=>{c.fillStyle=v;rounded(c,39+i*166,206,147,72,5);c.fill();});}
 if(index===4){c.strokeStyle='#829caf';c.lineWidth=2;rounded(c,235,204,250,77,8);c.stroke();rule(c,248,248,224);}
 const start=(index===3||index===4)?335:247;
 report.lines.forEach((line,i)=>{label(c,`0${i+1}`,39,start+i*93,20,BLUE);label(c,line[l],88,start+i*93,l===0?27:23,INK);rule(c,88,start+26+i*93,w-129);});
 label(c,l===0?'研究边界 / 下一步':'RESEARCH BOUNDARY / NEXT STEP',39,605,19,BLUE);label(c,report.question[l],39,651,l===0?23:20,MUTED);
},768,720);}
