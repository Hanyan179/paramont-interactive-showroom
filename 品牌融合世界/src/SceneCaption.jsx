import React from 'react';
import './scene-caption.css';

// Use the exploration content so each scene keeps its own meaning.
export function SceneCaption({view,domain,product,lang,visible,sharedShell,media}){
 const l=lang==='zh'?0:1;
 const home=view.mode==='home',detail=view.mode==='detail'&&product;
 const title=home?['品牌与产品世界','A world of brands & products'][l]:detail?product.name[l]:domain?.name[l];
 const description=home?[
  '从美妆护理、儿童玩具到派对庆典，探索产品的色彩、材质与形态。',
  'Explore color, materials and form across beauty, toys and celebrations.'
 ][l]:detail?product.description[l]:domain?.description[l];
 const label=home?['品牌 · 品类 · 产品','BRANDS · CATEGORIES · PRODUCTS'][l]:detail?`${domain.name[l]} · ${product.topic[l]}`:domain?.subtitle[l];
 // Wall-mode models are centered; photo and film exhibits keep their left-hand stage.
 const side=detail&&(!sharedShell||media!=='model')?'right':'left';
 return <section className={`scene-caption caption-${side} ${visible?'is-visible':''}`} aria-label={['当前画面介绍','About this scene'][l]} aria-hidden={!visible} data-scene={home?'home':detail?product.id:view.domain}>
  <div key={`${view.mode}-${view.domain}-${view.product}-${lang}`} className="scene-caption-copy" role="status" aria-live="polite" aria-atomic="true">
   <div className="scene-caption-label"><i/>{label}</div>
   <h2>{title}</h2>
   <p>{description}</p>
   {!sharedShell&&<small>{['原创视觉概念 · 非真实产品','Original visual studies · Not actual products'][l]}</small>}
  </div>
 </section>;
}
