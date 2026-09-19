import {resolveExplorerView} from '../../共享组件/explorerViews.js';
import {resolveExplorerTarget} from '../../共享组件/explorerTarget.js';
import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {BrandScene} from './scene.js';
import {asset,loadContent,availableViews,presentation,hasModel} from './content.js';
import {Library,initialLibrary} from './Library.jsx';
import {PhotoViewer} from './PhotoViewer.jsx';
import {ProductDetail} from './ProductDetail.jsx';
import {SceneCaption} from './SceneCaption.jsx';
import {resolveSku} from './product-data.js';
import {embedded,sharedShell,initialLanguage,sendHost,subscribeHost} from './bridge.js';
import './style.css';
import './explorer.css';
import './collection.css';
import './atrium.css';

const domainOf={lipstick:'beauty',serum:'beauty',compact:'beauty',rings:'play',maraca:'play',puzzle:'play',balloon:'party',gift:'party'};
const defaults={mode:'home',domain:'beauty',product:null};
function initialView(){const parts=location.hash.replace(/^#\/?/,'').split('/');return ['beauty','play','party'].includes(parts[0])?{mode:domainOf[parts[1]]===parts[0]?'detail':'domain',domain:parts[0],product:domainOf[parts[1]]===parts[0]?parts[1]:null,sku:parts[2]||null}:defaults;}
function App(){
 const [lang,setLang]=useState(()=>initialLanguage||localStorage.getItem('paramont-world-language')||'zh'),[data,setData]=useState(null),[error,setError]=useState(''),[ready,setReady]=useState(false),[view,setView]=useState(initialView),[overlay,setOverlay]=useState(false),[auto,setAuto]=useState(false),[fullscreen,setFullscreen]=useState(false),[active,setActive]=useState(!sharedShell);
 const [library,setLibrary]=useState(initialLibrary),[filter,setFilter]=useState({beauty:'all',play:'all',party:'all'}),[presentations,setPresentations]=useState({}),[historyDepth,setHistoryDepth]=useState(0),[selectedSkus,setSelectedSkus]=useState(()=>{const first=initialView();return first.product&&first.sku?{[first.product]:first.sku}:{};});
 const [navigationId,setNavigationId]=useState(-1),[cinematic,setCinematic]=useState(false);
 const hostActions=useRef();
 const scene=useRef(),canvas=useRef(),navRef=useRef(),idle=useRef(Date.now()),autoSaved=useRef(),libraryScroll=useRef({}),panelScroll=useRef({}),detailPanel=useRef(),frameState=useRef();
 const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en;
 frameState.current={view,overlay,library,filter,presentations,selectedSkus,auto};
 const product=data?.items.find(p=>p.id===view.product),domain=data?.domains.find(d=>d.id===view.domain),items=data?.items.filter(p=>p.domain===view.domain)||[];
 const sku=resolveSku(data,view.product,view.sku||selectedSkus[view.product]),productMedia=sku?.media||data?.media[view.product],presentationKey=sku?.id||view.product;
 const viewing=presentation(productMedia,presentations[presentationKey]),media=viewing.mode;
 const updateMedia=patch=>setPresentations(prev=>({...prev,[presentationKey]:{...presentation(productMedia,prev[presentationKey]),...patch}}));
 const openProduct=(id,skuId)=>navigate({mode:'detail',domain:domainOf[id],product:id,sku:skuId||selectedSkus[id]||null});navRef.current=openProduct;
 useEffect(()=>{let alive=true;loadContent().then(d=>{if(alive)setData(d);}).catch(()=>setError(t('共享资料暂时无法读取，请重试。','Shared content could not load. Please retry.')));return()=>{alive=false;};},[]);
 useEffect(()=>{if(!data)return;try{scene.current=new BrandScene(canvas.current,id=>navRef.current(id),()=>setReady(true),data.media,{atrium:sharedShell});scene.current.setView(view.mode,view.domain,view.product);}catch(err){setError(t('三维场景未能启动，请启用浏览器的图形加速。','The 3D scene could not start. Enable browser graphics acceleration.'));console.error(err);}return()=>scene.current?.destroy();},[data]);
 useEffect(()=>{scene.current?.setView(view.mode,view.domain,view.product);scene.current?.setFilter(filter[view.domain]);},[view,filter,ready]);
 useEffect(()=>{scene.current?.setMedia(media);},[media,view,ready]);
 useEffect(()=>{scene.current?.setVariant(view.mode==='detail'?view.product:null,view.mode==='detail'?sku?.palette:{});},[sku?.id,view.mode,view.product,ready]);
 useEffect(()=>{scene.current?.setSuspended(!active||overlay);if(!active){stopAuto();document.querySelectorAll('video').forEach(v=>v.pause());}idle.current=Date.now();},[active,overlay,ready]);
 useEffect(()=>{scene.current?.setCinematic(cinematic);},[cinematic,ready]);
 useEffect(()=>{if(sharedShell&&active&&ready)sendHost('attention',{busy:!auto&&(overlay||(view.mode==='detail'&&media!=='model'))});},[active,ready,overlay,view.mode,media,auto]);
 useEffect(()=>{if(overlay)document.querySelectorAll('video').forEach(v=>v.pause());},[overlay]);
 useEffect(()=>{if(detailPanel.current)detailPanel.current.scrollTop=panelScroll.current[view.product]||0;},[view.product]);
 useEffect(()=>{document.documentElement.lang=lang==='zh'?'zh-CN':'en';localStorage.setItem('paramont-world-language',lang);sendHost('language',{language:lang});},[lang]);
 useEffect(()=>subscribeHost(message=>{if(message.type==='language'&&['zh','en'].includes(message.language))setLang(message.language);if(message.type==='visibility')setActive(message.visible===true);if(sharedShell)hostActions.current?.(message);}),[]);
 useEffect(()=>{if(ready&&data)sendHost('ready');},[ready,data]);
 useEffect(()=>{if(ready)sendHost('state',{section:overlay?library.tab:'products',view:overlay?library.tab:'room',navigationId,presentation:auto,route:location.hash,selection:{domain:view.domain,product:view.product,sku:sku?.id||null}});},[view,sku?.id,ready,auto,overlay,library.tab,navigationId]);
 useEffect(()=>{history.replaceState({view:initialView(),depth:0,library:false},'',location.href);const pop=e=>{stopAuto();idle.current=Date.now();setView(e.state?.view||initialView());setHistoryDepth(e.state?.depth||0);setOverlay(Boolean(e.state?.library));if(e.state?.library&&typeof e.state.library==='object')setLibrary(e.state.library);};window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[]);
 useEffect(()=>{const f=()=>setFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',f);return()=>document.removeEventListener('fullscreenchange',f);},[]);
 useEffect(()=>{const key=e=>{if(e.defaultPrevented||e.key!=='Escape'||overlay)return;if(auto)stopAuto();else if(view.mode!=='home')goBack();else if(embedded)sendHost('close');};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[overlay,view,auto,historyDepth]);
 function navigate(next){if(auto)return;if(!overlay&&next.mode===view.mode&&next.domain===view.domain&&next.product===view.product&&(!next.sku||next.sku===sku?.id)){setOverlay(false);return;}history.replaceState({view,depth:historyDepth,library:overlay?library:null},'',location.href);const depth=historyDepth+1;history.pushState({view:next,depth,library:false},'','#/'+(next.mode==='home'?'':next.domain+(next.product?'/'+next.product+(next.sku?'/'+next.sku:''):'')));setOverlay(false);setHistoryDepth(depth);setView(next);}
 function selectSku(id){const nextSku=data.skus.find(s=>s.id===id&&s.productId===view.product);if(!nextSku)return;setPresentations(prev=>prev[id]?prev:{...prev,[id]:presentation(nextSku.media,{mode:media})});setSelectedSkus(prev=>({...prev,[view.product]:id}));const next={...view,sku:id};setView(next);history.replaceState({view:next,depth:historyDepth,library:false},'','#/'+view.domain+'/'+view.product+'/'+id);}
 function goBack(){if(historyDepth>0)history.back();else{const next=view.mode==='detail'?{mode:'domain',domain:view.domain,product:null}:defaults;history.replaceState({view:next,depth:0,library:false},'','#/'+(next.mode==='home'?'':next.domain));setView(next);}}
 function openLibrary(tab,patch={}){setLibrary(prev=>({...prev,...(prev.tab!==tab?{query:'',record:null,subcategoryId:null,categorySearch:null}:{}),tab,...(Object.keys(patch).length?{categorySearch:null}:{}),...patch}));setOverlay(true);}
 function startAuto(){if(autoSaved.current||!scene.current)return;autoSaved.current={...frameState.current,memory:structuredClone(scene.current.memory),rotation:{...scene.current.rotation},zoom:scene.current.zoom};setOverlay(false);setAuto(true);}
 function stopAuto(){const prev=autoSaved.current;autoSaved.current=null;setAuto(false);idle.current=Date.now();if(prev){setView(prev.view);setOverlay(prev.overlay);scene.current?.setView(prev.view.mode,prev.view.domain,prev.view.product);scene.current.memory=prev.memory;scene.current.rotation=prev.rotation;scene.current.zoom=prev.zoom;}}
 useEffect(()=>{if(!sharedShell)return;let movedAt=0;const report=e=>{if(!active)return;const time=Date.now();if(e.type==='pointermove'&&time-movedAt<500)return;movedAt=time;sendHost('activity',{event:e.type,pointerId:e.pointerId});};const events=['pointerdown','pointerup','pointercancel','pointermove','keydown','wheel'];events.forEach(e=>window.addEventListener(e,report,{passive:true}));return()=>events.forEach(e=>window.removeEventListener(e,report));},[active]);
 useEffect(()=>{const activity=()=>{idle.current=Date.now();};['pointerdown','pointermove','keydown','wheel'].forEach(e=>window.addEventListener(e,activity,{passive:true}));const timer=setInterval(()=>{if(!sharedShell&&active&&!document.hidden&&!auto&&!overlay&&!scene.current?.pointers.size&&!Array.from(document.querySelectorAll('video')).some(v=>!v.paused)&&Date.now()-idle.current>90000)startAuto();},2000);return()=>{clearInterval(timer);['pointerdown','pointermove','keydown','wheel'].forEach(e=>window.removeEventListener(e,activity));};},[active,auto,overlay,media]);
 useEffect(()=>{if(!auto)return;const steps=[defaults,{mode:'domain',domain:'beauty',product:null},{mode:'detail',domain:'beauty',product:'lipstick'},{mode:'domain',domain:'play',product:null},{mode:'detail',domain:'play',product:'rings'},{mode:'domain',domain:'party',product:null}];let step=0;setView(steps[0]);const timer=setInterval(()=>setView(steps[(++step)%steps.length]),sharedShell?14000:6500);return()=>clearInterval(timer);},[auto]);
 useEffect(()=>{window.__PARAMONT__={getState:()=>({...frameState.current,scene:scene.current?.diagnostic(),language:lang,media,photo:viewing.photo,viewing,embedded,active,sharedCounts:data?{brands:data.catalog.brands.length,categories:data.catalog.categories.length,subcategories:data.catalog.subcategories.length}:null})};},[lang,media,viewing,data,active]);
 hostActions.current=message=>{
  if(message.type==='cinematic-set')setCinematic(message.enabled===true);
  if(message.type==='navigate'&&['brands','categories','products'].includes(message.section)&&Number.isInteger(message.navigationId)&&message.navigationId>=navigationId){
   stopAuto();setNavigationId(message.navigationId);
   if(!message.preserve){
    if(message.productId){const target=resolveExplorerTarget(message,data?.items,data?.skus);if(target)navigate(target);else setError(t('关联样品不存在，已保留当前浏览位置。','The linked sample is unavailable. Your current view is preserved.'));}
    else if(message.section==='brands'&&message.brandId){if(data?.brands.some(b=>b.id===message.brandId))openLibrary('brands',{scope:'official',brandId:message.brandId,query:'',record:null});else setError(t('关联品牌不存在，已保留当前浏览位置。','The linked brand is unavailable. Your current view is preserved.'));}
    else {const target=resolveExplorerView(message.section,message.view);if(target==='room')setOverlay(false);else openLibrary(target);}
   }
  }
  if(message.type==='presentation-set'){if(message.enabled)startAuto();else stopAuto();}
  if(message.type==='presentation-toggle'){if(auto)stopAuto();else startAuto();}
 };
 async function toggleFull(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setError(t('当前浏览器限制全屏，请使用窗口的全屏按钮。','This browser limits fullscreen. Use the window fullscreen control.'));}}
 const domainPicker=()=>sharedShell&&<div className="domain-picker" role="group" aria-label={t('选择产品领域','Choose product domain')}>{data.domains.map(d=><button key={d.id} aria-pressed={view.mode==='domain'&&view.domain===d.id} onClick={()=>navigate({mode:'domain',domain:d.id,product:null})}>{d.name[l]}</button>)}</div>;
 const subcategory=product&&data?.catalog.subcategories.find(c=>c.id===product.subcategoryId),productsShown=items.filter(p=>filter[view.domain]==='all'||p.id===filter[view.domain]);
 return <main className={`world mode-${view.mode} ${overlay?'has-overlay':''} ${auto?'is-auto':''} ${cinematic?'is-cinematic':''} ${embedded?'embedded':''} ${sharedShell?'shared-shell':''}`}>
 <div className="world-content" inert={overlay||auto||cinematic?true:undefined}>
  <div className="stage-canvas"><canvas ref={canvas} aria-label={t('三维产品场景，可旋转、缩放与选择产品','Interactive product scene; rotate, zoom and select products')} tabIndex={0} onKeyDown={e=>{if(e.key.startsWith('Arrow')&&scene.current){e.preventDefault();scene.current.rotation.y+=e.key==='ArrowLeft'?-.2:e.key==='ArrowRight'?.2:0;scene.current.rotation.x+=e.key==='ArrowUp'?-.1:e.key==='ArrowDown'?.1:0;}}}/></div><div className="atmosphere"/>
  {!sharedShell&&<header className="topbar"><button className="brand" onClick={()=>navigate(defaults)} aria-label={t('返回样品空间','Brand world home')}><img src={asset('shared/brand/logo-w.png')} alt="PARAMONT GROUP"/></button><div className="brand-caption">{embedded?<button onClick={()=>sendHost('close')}>← {t('返回企业展厅','Back to showroom')}</button>:t('品牌融合世界','A WORLD OF POSSIBILITIES')}</div><nav aria-label={t('主导航','Main navigation')}>{[['brands','品牌','Brands'],['categories','品类','Categories'],['products','产品','Products']].map(([id,zh,en])=><button key={id} onClick={()=>openLibrary(id)}>{t(zh,en)}</button>)}<button className="language" onClick={()=>setLang(lang==='zh'?'en':'zh')}>{lang==='zh'?'EN':'中文'}</button><button className="full" onClick={toggleFull}>{fullscreen?t('退出全屏','Exit full screen'):t('全屏','Full screen')}</button></nav></header>}
  {!ready||!data?<div className="loading"><span className="loading-ring"/><p>{error||t('正在加载样品空间','Loading the sample room')}</p>{error&&<button onClick={()=>location.reload()}>{t('重新加载','Reload')}</button>}</div>:<>
   {view.mode!=='home'&&<button className="back" onClick={goBack}>← <span>{view.mode==='detail'?t('返回探索','Back to exploring'):t('返回样品空间','Back to sample room')}</span></button>}
   {view.mode==='home'&&<section className="hero-copy" key={lang}><div className="eyebrow"><span className="line"/>{t('品牌 · 品类 · 产品','BRANDS · CATEGORIES · PRODUCTS')}</div><h1>{t(<>让灵感<br/>成为日常<span>。</span></>,<>Ideas.<br/>Made tangible<span>.</span></>)}</h1><p>{t(<>从一抹色彩，到一次惊喜。<br/>进入我们的产品世界，发现更多可能。</>,<>From a touch of color to a moment of wonder.<br/>Explore the possibilities we bring to life.</>)}</p><button className="primary" onClick={()=>navigate({mode:'domain',domain:'beauty',product:null})}>{t('开启探索','Explore samples')}<span>→</span></button>{domainPicker()}{!sharedShell&&<div className="hero-note">{t('触摸物件，即刻探索','TOUCH AN OBJECT. FOLLOW YOUR CURIOSITY.')}</div>}</section>}
   {view.mode==='domain'&&<section className="domain-copy" key={view.domain+lang}><div className="eyebrow">{String(data.domains.indexOf(domain)+1).padStart(2,'0')} / {t('领域探索','EXPLORE A WORLD')}</div><h1>{domain.name[l]}</h1><h2>{domain.subtitle[l]}</h2><p>{domain.description[l]}</p>{domainPicker()}<button className="text-link" onClick={()=>openLibrary('categories',{categoryId:domain.categoryId,subcategoryId:null,query:''})}>{t('查看领域品类','Explore category records')} <span>{data.catalog.subcategories.filter(c=>c.parent===domain.categoryId).length} →</span></button></section>}
   {view.mode==='domain'&&<div className="product-strip"><div className="strip-heading"><span>{t('概念精选','DESIGN STUDIES')}</span><select aria-label={t('筛选概念样品','Filter design studies')} value={filter[view.domain]} onChange={e=>setFilter({...filter,[view.domain]:e.target.value})}><option value="all">{t('全部形态','All forms')}</option>{items.map(p=><option key={p.id} value={p.id}>{p.name[l]}</option>)}</select></div><div className="product-links">{productsShown.map(p=><button key={p.id} onClick={()=>openProduct(p.id)}><small>{String(items.indexOf(p)+1).padStart(2,'0')}</small><span>{p.name[l]}{!hasModel(data.media[p.id])&&<em>{t('图片','IMAGES')}</em>}</span><i>→</i></button>)}</div></div>}
   {view.mode==='detail'&&product&&<>
    <div className="detail-stage-tools"><span className="concept-pill">{hasModel(productMedia)?t('原创三维概念','ORIGINAL 3D STUDY'):t('原创图片概念','ORIGINAL IMAGE STUDY')}</span><div className="media-tabs" role="tablist" aria-label={t('展示方式','Viewing mode')}>{[['model','三维模型','3D model'],['photos','多角度图片','Images'],['video','动态短片','Film']].filter(([id])=>availableViews(productMedia).includes(id)).map(([id,zh,en])=><button role="tab" aria-selected={media===id} key={id} onClick={()=>updateMedia({mode:id})}>{t(zh,en)}</button>)}</div></div>
    {media==='model'&&<div className="angle-tools"><div>{[['正面','Front',0],['侧面','Side',Math.PI/2],['背面','Back',Math.PI]].map(([zh,en,a])=><button key={en} onClick={()=>scene.current.orient(a)}>{t(zh,en)}</button>)}<button onClick={()=>scene.current.reset()}>{t('复位','Reset')}</button></div></div>}
    {media==='photos'&&<PhotoViewer key={presentationKey} product={product} images={productMedia.images} value={viewing} onChange={updateMedia} lang={lang}/>}
    {media==='video'&&<div className="media-view film-view"><video onPlay={()=>sendHost('playback',{playing:true})} onPause={()=>sendHost('playback',{playing:false})} onEnded={()=>sendHost('playback',{playing:false})} key={presentationKey} controls playsInline loop muted preload="metadata" poster={asset(productMedia.images[0].src)} src={asset(productMedia.video)} onError={e=>e.currentTarget.nextElementSibling.hidden=false}/><p hidden className="media-fallback">{t('短片暂时无法播放，请切换图片继续探索。','This film is unavailable. Continue in the Images tab.')}</p><small>{t('程序渲染概念短片 · 非实拍','Procedurally rendered concept film · Not product footage')}</small></div>}
    <ProductDetail sharedShell={sharedShell} onDocument={sharedShell?()=>sendHost('document-open',{productId:product.id,skuId:sku?.id}):undefined} data={data} product={product} sku={sku} viewing={viewing} lang={lang} panelRef={detailPanel} onScroll={e=>{panelScroll.current[view.product]=e.currentTarget.scrollTop;}} onSku={selectSku} onPresentation={updateMedia} onCategory={()=>openLibrary('categories',{categoryId:domain.categoryId,subcategoryId:product.subcategoryId,query:''})} onBrand={id=>openLibrary('brands',{scope:'official',brandId:id,query:''})} onProducts={()=>openLibrary('products',{query:''})} onNext={()=>openProduct(items[(items.indexOf(product)+1)%items.length].id)}/>

   </>}
   {!sharedShell&&view.mode!=='detail'&&<footer className="world-footer"><div className="domain-nav" aria-label={t('业务领域','Business domains')}>{data.domains.map((d,i)=><button key={d.id} className={view.mode==='domain'&&view.domain===d.id?'active':''} onClick={()=>navigate({mode:'domain',domain:d.id,product:null})}><span className="domain-index">0{i+1}</span><span>{d.name[l]}<small>{d.word}</small></span><i>→</i></button>)}</div><div className="footer-meta"><span>{t('原创视觉概念 · 非真实产品','Original visual studies · Not actual products')}</span>{!sharedShell&&<button onClick={startAuto}>{t('自动展示','Guided display')} <span>▷</span></button>}</div></footer>}
  </>}
 </div>

 {ready&&data&&<SceneCaption view={view} domain={domain} product={product} lang={lang} visible={active&&!overlay&&(auto||cinematic)} sharedShell={sharedShell} media={media}/>}
 {error&&ready&&<button className="toast" onClick={()=>setError('')}>{error} ×</button>}
 {overlay&&data&&<Library sharedShell={sharedShell} data={data} lang={lang} state={library} memory={libraryScroll} onChange={setLibrary} onClose={()=>setOverlay(false)} onProduct={openProduct} onDomain={id=>navigate({mode:'domain',domain:id,product:null})}/>}
 {auto&&!sharedShell&&<button className="auto-cover" onPointerDown={e=>{e.preventDefault();stopAuto();}} onClick={stopAuto} aria-label={t('结束自动展示，返回原浏览位置','Stop guided display and return to your previous place')}><span><i/>{t('自动展示中 · 轻触回到探索','Guided display · Touch to resume exploring')}</span></button>}
 </main>;
}
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('capture'))import('./capture.js');else{const root=createRoot(document.getElementById('root'));root.render(<App/>);if(import.meta.hot)import.meta.hot.dispose(()=>root.unmount());}
