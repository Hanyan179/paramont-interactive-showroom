import {canvasTexture,label,rounded,drawReviewAvatar,INK,MUTED,BLUE} from './intelligenceSurfaces.js';

// Source-specific UI surrounds the persistent sentence. Keep the centre band
// empty: that sentence is the same object before, inside and after its card.
export function sourceDetailsTexture(index){
 return canvasTexture((c,w,h)=>{
  const cn=c.journeyLang==='zh';
  const text=(zh,en,x,y,size=29,color=MUTED)=>label(c,cn?zh:en,x,y,size,color);
  const line=(x,y,width,color='#395163')=>{c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+width,y);c.stroke();};
  const field=(x,y,width,title,value)=>{
   rounded(c,x,y,width,94,8);c.fillStyle='#1c3345';c.fill();
   label(c,title,x+18,y+34,27,BLUE);label(c,value,x+18,y+73,25,MUTED);
  };
  if(index===0){
   drawReviewAvatar(c,0,74,67);
   text('林女士','Emma L.',136,61,35,INK);
   text('用户评价 · 演示','CUSTOMER REVIEW / DEMO',136,103,23);
   label(c,'★★★★★',w-233,66,30,'#c6b797');text('使用体验','USE EXPERIENCE',w-233,103,22);
   line(38,127,w-76);
   text('笔和纸放在一起，出门画画更方便。','Pencils and paper together, ready for a sketch.',38,307,30,INK);
   text('款式 / 深蓝绘画收纳盒','STYLE / SLATE BLUE DRAWING KIT',38,363,23);
   text('有帮助','HELPFUL',w-175,363,23,'#a9c1b0');
   return;
  }
  const titles=cn?['','销售分析','库存状态','成本拆解','履约记录','质量检查']:['','SALES ANALYSIS','STOCK STATUS','COST BREAKDOWN','DELIVERY RECORD','QUALITY CHECK'];
  const captions=cn?['','商品 · 期间 · 渠道','商品 · 仓库 · 库龄','报价口径 · 实际费用','计划交期 · 实际节点','验收标准 · 整改复核']:['','PRODUCT / PERIOD / CHANNEL','PRODUCT / LOCATION / STOCK AGE','QUOTED / ACTUAL COST','PLANNED / ACTUAL MILESTONES','ACCEPTANCE / CORRECTIVE ACTION'];
  label(c,titles[index],38,56,35,INK);label(c,captions[index],38,101,24,MUTED);line(38,127,w-76);
  if(index===1){
   // A comparison sheet, with business fields instead of made-up chart values.
   text('预测记录','FORECAST RECORD',38,312,27,BLUE);text('实际销售','ACTUAL SALES',552,312,27,BLUE);
   text('预测销量 / 预计销售额','FORECAST UNITS / REVENUE',38,358,25);
   text('实销数量 / 销售金额','UNITS SOLD / REVENUE',552,358,25);
   c.strokeStyle='#3c5567';c.beginPath();c.moveTo(512,288);c.lineTo(512,378);c.stroke();
  }else if(index===2){
   const titles=cn?['可用库存','在途到货','缺货记录']:['AVAILABLE','INCOMING','STOCKOUTS'];
   const values=cn?['可销售数量','数量与到货日期','持续天数']:['SELLABLE UNITS','UNITS / ARRIVAL','STOCKOUT DAYS'];
   titles.forEach((title,i)=>field(38+i*321,284,305,title,values[i]));
  }else if(index===3){
   const parts=cn?['材料成本','加工费用','包装成本','运输费用']:['MATERIAL','PROCESSING','PACKAGING','FREIGHT'];
   parts.forEach((part,i)=>{
    const x=38+i*244;rounded(c,x,292,208,70,5);c.fillStyle=i%2?'#203649':'#172d3e';c.fill();label(c,part,x+19,337,27,BLUE);
    if(i<3)label(c,'+',x+221,337,25,MUTED);
   });
  }else if(index===4){
   line(112,302,766,'#496175');
   const steps=cn?['完工日期','出货日期','签收日期']:['COMPLETION','DISPATCH','RECEIPT'];
   steps.forEach((step,i)=>{
    const x=112+i*383;c.beginPath();c.arc(x,302,9,0,Math.PI*2);c.fillStyle='#13283a';c.fill();c.strokeStyle=BLUE;c.stroke();
    c.textAlign='center';label(c,step,x,356,26,INK);c.textAlign='left';
   });
  }else{
   const items=cn?['验收标准与检验结果','整改措施与复核记录']:['ACCEPTANCE CRITERIA / RESULTS','CORRECTIVE ACTION / RECHECK'];
   items.forEach((item,i)=>{
    const y=300+i*61;rounded(c,38,y-18,23,23,3);c.strokeStyle='#96b4c6';c.lineWidth=2;c.stroke();label(c,item,81,y+4,28,INK);
    line(81,y+20,905,'#243c4e');
   });
  }
  text('业务字段结构 · 演示','BUSINESS RECORD STRUCTURE / DEMO',38,h-25,22,'#829bad');
 },1024,index===0?402:460);
}
