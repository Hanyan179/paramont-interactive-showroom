import {useLayoutEffect,useRef,useState} from 'react';
import {asset,hasModel} from './content.js';
import {productResults,skusFor} from './product-data.js';

export function ProductRail({results,data,lang,onProduct,memory,memoryKey='products',query=''}){
 const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en,rail=useRef(),drag=useRef(),[position,setPosition]=useState(0),[extent,setExtent]=useState(0);
 const key=memoryKey+'/'+results.map(r=>r.product.id).join(',')+'/'+query;
 useLayoutEffect(()=>{const el=rail.current;if(!el)return;el.scrollLeft=memory.current[key]||0;const measure=()=>{setPosition(el.scrollLeft);setExtent(el.scrollWidth-el.clientWidth);};measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();},[key]);
 function start(e){if(e.pointerType!=='mouse'||e.button!==0)return;drag.current={x:e.clientX,left:rail.current.scrollLeft,moved:false,id:e.pointerId};}
 function move(e){const d=drag.current;if(!d)return;if(Math.abs(e.clientX-d.x)>8){d.moved=true;rail.current.setPointerCapture(e.pointerId);rail.current.classList.add('dragging');}if(d.moved){e.preventDefault();rail.current.scrollLeft=d.left+d.x-e.clientX;}}
 function end(e){if(rail.current.hasPointerCapture(e.pointerId))rail.current.releasePointerCapture(e.pointerId);rail.current.classList.remove('dragging');drag.current=null;}
 const nudge=direction=>rail.current.scrollBy({left:direction*rail.current.clientWidth*.7,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 return <div className="product-gallery"><div className="collection-rail" ref={rail} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onScroll={e=>{memory.current[key]=e.currentTarget.scrollLeft;setPosition(e.currentTarget.scrollLeft);}}>
  {results.map(({product:p,sku,count},index)=><button className="collection-object" key={p.id} onClick={()=>{if(drag.current?.moved)return;onProduct(p.id,query.trim()?sku?.id:undefined);}}>
   <div className="collection-image"><span className="object-index">{String(data.items.indexOf(p)+1).padStart(2,'0')}</span><img draggable="false" src={asset((sku?.media||data.media[p.id]).images[0].src)} alt={p.name[l]}/><span className="object-media">{hasModel(sku?.media||data.media[p.id])?t('三维 · 图片 · 短片','3D · IMAGES · FILM'):t('图片 · 短片','IMAGES · FILM')}</span><span className="object-open">→</span></div>
   <div className="collection-caption"><span>{data.domains.find(d=>d.id===p.domain)?.name[l]}</span><h3>{p.name[l]}</h3><p>{query.trim()&&sku?sku.name[l]:p.topic[l]}</p><div className="collection-variants"><span className="mini-swatches">{skusFor(data,p.id).map(s=><i key={s.id} style={{background:s.colors[0]}}/>)}</span><small>{count} {t('款式','styles')}</small></div></div>
  </button>)}
 </div>{results.length>0&&<div className="gallery-bottom"><p>{t('概念产品 · 款式编号为演示用途','Concept products · Style codes are illustrative')}</p><div className="gallery-progress"><i style={{width:`${extent>1?Math.max(12,100/(results.length||1)):100}%`,left:`${extent>1?Math.min(100-100/results.length,position/extent*(100-100/results.length)):0}%`}}/></div><div><button disabled={position<2} onClick={()=>nudge(-1)} aria-label={t('向前浏览产品','Previous products')}>←</button><button disabled={position>=extent-2} onClick={()=>nudge(1)} aria-label={t('向后浏览产品','Next products')}>→</button></div></div>}</div>;
}

export function ProductCollection({data,lang,state,onChange,onProduct,memory}){
 const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en,categoryId=state.productCategoryId||'all';
 const results=productResults(data,{query:state.query,categoryId,brandId:state.productBrandId||'all'}),count=results.reduce((n,r)=>n+r.count,0);
 const changeCategory=id=>onChange({...state,productCategoryId:id});
 return <section className="product-directory"><header className="directory-heading"><div><div className="eyebrow">{t('产品与款式','PRODUCTS & STYLES')}</div><h2>{t('发现，每一种可能。','Find your possibilities.')}</h2></div><p><strong>{String(results.length).padStart(2,'0')}</strong>{t('产品','products')}<span>/</span><strong>{String(count).padStart(2,'0')}</strong>{t('款式','styles')}</p></header>
 <div className="collection-filters"><div className="filter-pills"><button aria-pressed={categoryId==='all'} onClick={()=>changeCategory('all')}>{t('全部产品','All products')}</button>{data.domains.map(d=><button key={d.id} aria-pressed={categoryId===d.categoryId} onClick={()=>changeCategory(d.categoryId)}>{d.name[l]}</button>)}</div><select aria-label={t('按品类筛选产品','Filter products by category')} value={categoryId} onChange={e=>changeCategory(e.target.value)}><option value="all">{t('全部 18 大类','All 18 categories')}</option>{data.catalog.categories.map(c=><option key={c.id} value={c.id}>{c.label?.[l]||c.name}</option>)}</select></div>
 {results.length?<ProductRail results={results} data={data} lang={lang} onProduct={onProduct} memory={memory} memoryKey={'products/'+categoryId} query={state.query}/>:<div className="collection-empty"><span>○</span><h3>{t('还没有匹配的产品','No matching products')}</h3><p>{t('试试其他分类、产品名称或款式编号。','Try another category, product name or style code.')}</p><button onClick={()=>onChange({...state,query:'',productCategoryId:'all',productBrandId:'all'})}>{t('浏览全部产品','Browse all products')} →</button></div>}
 </section>;
}
