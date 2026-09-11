import {skusFor} from './product-data.js';

export function ProductDetail({sharedShell=false,data,product,sku,viewing,lang,panelRef,onScroll,onSku,onPresentation,onCategory,onBrand,onProducts,onNext,onDocument}){
 const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en,skus=skusFor(data,product.id);
 const sub=data.catalog.subcategories.find(c=>c.id===product.subcategoryId),category=data.catalog.categories.find(c=>c.id===sub?.parent),brand=data.brands.find(b=>b.id===product.brandId);
 const section=viewing.infoTab||'story';
 return <>
  <div className="object-edition" aria-hidden="true"><span>{String(data.items.indexOf(product)+1).padStart(2,'0')}</span><small>{t('概念样品集','THE OBJECT COLLECTION')}</small></div>
  <div className="product-breadcrumb"><button onClick={onCategory}>{category?.label?.[l]||category?.name}</button><span>/</span><button onClick={onCategory}>{sub?.label?.[l]||sub?.name}</button></div>
  <section ref={panelRef} className="detail-panel product-dossier" onScroll={onScroll}>
   <div className="dossier-heading"><div className="eyebrow">{brand?<button onClick={()=>onBrand(brand.id)}>{brand.name} →</button>:t('独立概念设计','INDEPENDENT DESIGN STUDY')}</div><span className="dossier-number">{String(data.items.indexOf(product)+1).padStart(2,'0')} / {String(data.items.length).padStart(2,'0')}</span></div>
   <h1>{product.name[l]}</h1><p className="product-subtitle">{product.topic[l]}</p>
   <div className="sku-picker"><div className="section-heading"><span>{t('款式与配色','Style & color')}</span><small>{skus.length} {t('款概念',skus.length===1?'concept style':'concept styles')}</small></div>
    <div className="sku-options" role="group" aria-label={t('选择款式','Choose a style')}>{skus.map(s=><button key={s.id} className={s.id===sku?.id?'selected':''} aria-pressed={s.id===sku?.id} onClick={()=>onSku(s.id)}><span className="sku-color" style={{background:`conic-gradient(${s.colors.map((c,i)=>`${c} ${i/s.colors.length*100}% ${(i+1)/s.colors.length*100}%`).join(',')})`}}/><span>{s.name[l]}</span></button>)}</div>
    <div className="sku-current"><span>{sku?.name[l]}</span><code>{sku?.code}</code></div>
   </div>
   <div className="dossier-tabs" role="tablist" aria-label={t('产品信息','Product information')}>{[['story','产品介绍','Overview'],['specs','款式详情','Style details']].map(([id,zh,en])=><button role="tab" aria-selected={section===id} key={id} onClick={()=>onPresentation({infoTab:id})}>{t(zh,en)}</button>)}</div>
   <div className="dossier-content" role="tabpanel" aria-label={section==='story'?t('产品介绍','Overview'):t('款式详情','Style details')} key={section+sku?.id}>
    {section==='story'?<><p className="detail-description">{product.description[l]}</p><div className="application-line"><span>{t('应用场景','Designed for')}</span><p>{product.application[l]}</p></div></>:<dl className="sku-specs">{[[t('所属产品','Product'),product.name[l]],[t('款式编号','Style code'),sku?.code],[t('配色','Colorway'),sku?.name[l]],[t('材质表现','Material study'),sku?.material[l]],[t('组合形式','Composition'),sku?.form[l]]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
   </div>
   {onDocument&&<button className="product-document-entry" onClick={onDocument}>{t('阅读样品档案','Read sample dossier')} ↗</button>}
   <p className="detail-disclaimer">{t('概念设计 · 非真实商品，编号与材质为演示设定','Concept design · Codes and materials are illustrative')}</p>
   <div className="dossier-footer">{!sharedShell&&<button onClick={onProducts}>{t('浏览产品目录','Product collection')} →</button>}<button onClick={onNext}>{t('下一件产品','Next product')} →</button></div>
  </section>
  <div className="stage-caption"><span>{sku?.name[l]}</span><small>{sku?.code} · {t('概念款式','CONCEPT STYLE')}</small></div>
 </>;
}
