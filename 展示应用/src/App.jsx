import { showroomAreas, isExplorerPage } from './config/areas.js';
import { SceneLoading } from './components/SceneLoading.jsx';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CornersOut, SquaresFour, Play, Pause } from '@phosphor-icons/react';
const WorldScene = lazy(() => import('./components/WorldScene').then(m => ({ default:m.WorldScene })));
const ConnectedScene = lazy(() => import('./components/ConnectedScene').then(m => ({ default:m.ConnectedScene })));
const ImpactTheatre = lazy(() => import('./impact/ImpactTheatre').then(m => ({default:m.ImpactTheatre})));
import { BrandCarousel, SampleWall } from './components/Galleries';
import { Modal, SampleViewer, Switcher } from './components/Dialogs';
import { fallbackContent, variants } from './content';
import { useRoute } from './hooks';
import {useExhibition} from './useExhibition';
import { CompanyStory } from './components/CompanyStory';
import { CatalogBrowser } from './components/CatalogBrowser';
import { FactoryDetail } from './components/FactoryDetail';
import { getLocationProfile } from './components/locationProfiles';
import { ProductExplorer } from './components/ProductExplorer';
import { SystemBar } from './components/SystemBar';
import { ExhibitCaption } from './components/ExhibitCaption';
import { sceneNavigation } from './config/navigation.js';
import { isExplorerView, sectionForView } from '../../共享组件/explorerViews.js';
import { DataStory, analysisSteps } from './components/DataStory';
import {initialStudySelection,presentedStudySelection,studySelection,selectedStudyPath,linkedStudyProduct,studyDocument} from './analytics/caseStudy.js';
import {MediaTheatre} from './components/MediaTheatre';
import {playableFilms} from './media/library';
import {DocumentReader} from './components/DocumentReader';
import {companyDocument,companyStoryDocument,locationDocument,analysisDocument,productDocument} from './documents/content';
import {impactDocument} from './impact/documents.js';
import {isLocationDetailActive,isReaderActive,routeKey} from './documents/reading';

export function App() {
  const [route, rawGo] = useRoute();
  const [impactOpen,setImpactOpen]=useState(()=>route.variant==='atlas'&&route.page==='home');
  const [mediaPanel,setMediaPanel]=useState(null),[mediaLibrary,setMediaLibrary]=useState({films:[],publications:[]});
  const [mediaPhase,setMediaPhase]=useState('closed');
  const manualMedia=!!mediaPanel&&!mediaPanel.automatic;
  const mediaReturn=useRef(null);
  const openMedia=mode=>{mediaReturn.current=document.activeElement;setMediaPanel({mode,arrival:mode,automatic:false});setMediaPhase('approaching');};
  const closeMedia=()=>setMediaPhase('returning');
  const mediaArrived=phase=>{setMediaPhase(phase);if(phase==='closed'){setMediaPanel(null);requestAnimationFrame(()=>{const target=mediaReturn.current;if(target?.isConnected&&!target.closest('[inert]'))target.focus({preventScroll:true});});}};
  const [reader,setReader]=useState(null),[readingOverrides,setReadingOverrides]=useState({}),[productReading,setProductReading]=useState(null);
  const readingMemory=useRef({}),readingReturn=useRef(null);
  const readingActive=isReaderActive(route,reader);
  const explorerOpen = route.variant === 'atlas' && isExplorerPage(route.page);
  const [explorerNavigation,setExplorerNavigation]=useState(()=>({section:isExplorerPage(route.page)?route.page:'products',id:0}));
  function go(variant,page='home',preserve=false) {setReader(null);if(variant==='atlas'&&isExplorerPage(page))setExplorerNavigation(previous=>({section:page,id:previous.id+1,preserve}));rawGo(variant,page);} 
  useEffect(()=>{if(explorerOpen)setExplorerNavigation(previous=>previous.section===route.page?previous:{section:route.page,id:previous.id+1});},[route.variant,route.page]);
  const explorerReturn = useRef({variant:'atlas',page:'home'}), wasExplorer = useRef(explorerOpen);
  useEffect(()=>{if(explorerOpen){wasExplorer.current=true;return;}explorerReturn.current=route;},[route.variant,route.page]);
  const [lang, setLang] = useState(() => localStorage.getItem('showroom-language') || 'zh');
  const [content, setContent] = useState(fallbackContent), [switcher, setSwitcher] = useState(false), [selectedLocation, setSelectedLocation] = useState('china');
  const [activeBrand, setActiveBrand] = useState(0), [enteredBrand, setEnteredBrand] = useState(null), [filter, setFilter] = useState('all');
  const [sample, setSample] = useState(null), [locationOpen, setLocationOpen] = useState(false), [videoPlaying, setVideoPlaying] = useState(false), [notice, setNotice] = useState('');
  const [explorerAttention,setExplorerAttention]=useState(false),[navigationOpen,setNavigationOpen]=useState(false);
  const [explorerView,setExplorerView]=useState(()=>route.page==='brands'||route.page==='categories'?route.page:'room');
  const locationActive=isLocationDetailActive(route,locationOpen);
  const [focusKey, setFocusKey] = useState(0);
  const [capability,setCapability]=useState('overview'),[capabilityFocus,setCapabilityFocus]=useState(null);
  const enterLocation=()=>{setCapability('overview');setCapabilityFocus(null);setLocationOpen(true);};
  const changeCapability=id=>{setCapability(id);setCapabilityFocus(null);setVideoPlaying(false);};
  const [storySelection,setStorySelection]=useState({capability:0,company:0,year:0,detail:null});
  const [cameraRequest,setCameraRequest]=useState(0);
  const changeStory=value=>{setStorySelection(previous=>({...previous,...value}));setCameraRequest(n=>n+1);};
  const changeChapter=value=>{setChapter(value);if(value===0)setOverviewFocus(null);setCameraRequest(n=>n+1);};
  const [overviewFocus,setOverviewFocus]=useState(null);
  const [analysisStage,setAnalysisStage]=useState(null),[analysisDetail,setAnalysisDetail]=useState(null);
  const [analysisPhase,setAnalysisPhase]=useState('closed'),[analysisSelection,setAnalysisSelection]=useState(initialStudySelection),[analysisReturn,setAnalysisReturn]=useState(false);
  const updateAnalysis=patch=>setAnalysisSelection(previous=>studySelection(previous,patch));
  const analysisArrived=phase=>{setAnalysisPhase(phase);if(phase==='closed')setAnalysisStage(null);};
  const [globeMode,setGlobeMode]=useState('distribution'),[locationRevealed,setLocationRevealed]=useState(false);
  const changeAnalysis=stage=>{if(stage===null){setAnalysisPhase('returning');return;}setAnalysisStage(stage);setAnalysisDetail(null);setAnalysisPhase(previous=>previous==='open'?'open':'approaching');};
  const selectAnalysisObject=()=>changeAnalysis(analysisStage??0);
  const enterOverview=index=>{if(index===0)setChapter(1);else go('atlas',showroomAreas[index].id);};
  const selectStoryNode=index=>{if(chapter===0){if(overviewFocus===index)enterOverview(index);else setOverviewFocus(index);}else if(chapter===1)changeStory({detail:storySelection.detail===index?null:index});else if(chapter===2)changeStory({company:index});else changeStory({year:index});};
  const [chapter, setChapter] = useState(0), [official, setOfficial] = useState(null), [catalog, setCatalog] = useState(null), [archive, setArchive] = useState(null);
  const archiveMemory = useRef({brands:{}, categories:{}});
  const [closingLayer,setClosingLayer]=useState(false), closeTimer=useRef(null);
  const closeOverlay=(setter,value=false)=>{if(closeTimer.current)clearTimeout(closeTimer.current);setClosingLayer(true);closeTimer.current=setTimeout(()=>{setter(value);setClosingLayer(false);closeTimer.current=null;},220);};
  useEffect(()=>()=>clearTimeout(closeTimer.current),[]);
  const selectLocation = id => { setSelectedLocation(id); setFocusKey(v => v + 1);setLocationRevealed(true);setGlobeMode('network'); };
  const wallPosition = useRef({ x: 0, y: 0 });
  const l = lang === 'zh' ? 0 : 1, t = (zh, en) => l === 0 ? zh : en;
  const variant = variants.find(v => v.id === route.variant), home = route.page === 'home';
  const loc = content.locations.find(v => v.id === selectedLocation) || content.locations[0];
  const locationProfile=getLocationProfile(loc.id);
  const brand = content.brands.find(b => b.id === enteredBrand);
  const wallItems = brand ? content.samples.filter(s => s.brand === brand.id) : content.samples.filter(s => filter === 'all' || s.category === filter);
  const viewerItems = locationActive ? content.samples : (route.variant === 'studio' || route.page === 'brands') ? wallItems : content.samples.filter(s => filter === 'all' || s.category === filter);
  useEffect(() => { Promise.all([['showroom',setContent],['official-content',setOfficial],['catalog',setCatalog],['reading-documents',setReadingOverrides],['exhibition-media',setMediaLibrary]].map(async ([file,save])=>{const r=await fetch(`/data/${file}.json`);if(!r.ok)throw Error(file);save(await r.json());})).catch(()=>setNotice(t('部分内容未能加载，请重新打开页面。','Some content could not load. Please reload the page.'))); }, []);
  useEffect(()=>{let alive=true;Promise.all(['concepts','product-skus','explorer-media'].map(async file=>{const response=await fetch(`/modules/product-explorer/shared/${file}.json`);if(!response.ok)throw Error(file);return response.json();})).then(([concepts,skus,media])=>{if(alive)setProductReading({concepts,skus,media});}).catch(()=>{});return()=>{alive=false;};},[]);
  const openDocument=(doc,initialSection)=>{if(!doc){setNotice(t('资料正在准备，请稍后重试。','This document is being prepared. Please try again.'));return;}readingReturn.current=document.activeElement;wake();setVideoPlaying(false);setReader({document:{...doc,...readingOverrides[doc.id]},initialSection,owner:routeKey(route)});};
  const closeDocument=()=>{const trigger=readingReturn.current;setReader(null);requestAnimationFrame(()=>{if(trigger?.isConnected&&!trigger.closest('[inert]')&&trigger.getClientRects().length)trigger.focus({preventScroll:true});});};
  const enterAnalysisProduct=()=>{const target=linkedStudyProduct(selectedStudyPath(analysisSelection),productReading);if(!target)return;setAnalysisReturn(true);setExplorerNavigation(previous=>({section:'products',view:'room',id:previous.id+1,preserve:false,...target}));rawGo('atlas','products');};
  const backToAnalysis=()=>{wake();setAnalysisReturn(false);setAnalysisPhase('open');rawGo('atlas','analytics');};
  const openProductDocument=({productId,skuId})=>{const product=productReading?.concepts.items.find(p=>p.id===productId),sku=productReading?.skus.items.find(s=>s.id===skuId&&s.productId===productId);openDocument(productDocument(product,sku,productReading?.media.items[productId]));};
  useEffect(()=>{setReader(previous=>isReaderActive(route,previous)?previous:null);},[route.variant,route.page]);
  useEffect(() => { localStorage.setItem('showroom-language', lang); document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; }, [lang]);
  useEffect(() => { if(restoring.current){restoring.current=false;wasExplorer.current=explorerOpen;return;}if(explorerOpen)return;if(wasExplorer.current){wasExplorer.current=false;return;}setSample(null); setLocationOpen(false); setEnteredBrand(null); setVideoPlaying(false); setArchive(null); }, [route.variant, route.page]);
  const closeLocation=()=>{setVideoPlaying(false);setLocationOpen(false);};
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);
  const savedExploration=useRef(null),restoring=useRef(false);
  const {presenting,quiet,cinematic,shot,wake,leavePresentation,toggle,activityFromChild}=useExhibition({seconds:content.settings.idleSeconds,
    blocked:(route.variant==='atlas'&&((impactOpen&&home)||route.page==='locations'))||navigationOpen||manualMedia||videoPlaying||switcher||readingActive||!!sample||!!archive||(explorerOpen&&explorerAttention),
    onStart:()=>{savedExploration.current={route,explorerNavigation,chapter,overviewFocus,storySelection,selectedLocation,locationRevealed,globeMode,locationOpen,capability,capabilityFocus,analysisStage,analysisDetail,analysisPhase,analysisSelection,sample,archive};},
    onShot:shot=>{
      setMediaPanel(null);setMediaPhase('closed');setSample(null);setArchive(null);setVideoPlaying(false);setLocationOpen(false);setOverviewFocus(shot.focus??null);setAnalysisDetail(null);
      if(shot.page==='home'){setChapter(shot.chapter??0);if(shot.selection)setStorySelection(previous=>({...previous,...shot.selection}));}
      if(shot.page==='locations'){setLocationOpen(!!shot.capability);setCapability(shot.capability||'overview');setCapabilityFocus(null);setGlobeMode(shot.mode);setLocationRevealed(!!shot.location);if(shot.location){setSelectedLocation(shot.location);setFocusKey(k=>k+1);}}
      if(shot.page==='analytics'){setAnalysisStage(shot.stage);setAnalysisSelection(presentedStudySelection(shot.stage));setAnalysisPhase(previous=>previous==='open'?'open':'approaching');}
      go('atlas',shot.page,true);
    },
    onStop:({restore=true}={})=>{
      setMediaPanel(null);setMediaPhase('closed');const prev=savedExploration.current;savedExploration.current=null;if(!prev||!restore)return;setExplorerNavigation(current=>({...prev.explorerNavigation,id:current.id+1,preserve:true}));
      restoring.current=route.page!==prev.route.page||route.variant!==prev.route.variant;rawGo(prev.route.variant,prev.route.page);setChapter(prev.chapter);setOverviewFocus(prev.overviewFocus);setStorySelection(prev.storySelection);
      setSelectedLocation(prev.selectedLocation);setLocationRevealed(prev.locationRevealed);setGlobeMode(prev.globeMode);
      setCapability(prev.capability);setCapabilityFocus(prev.capabilityFocus);setLocationOpen(prev.locationOpen);setAnalysisStage(prev.analysisStage);setAnalysisDetail(prev.analysisDetail);setAnalysisPhase(prev.analysisPhase);setAnalysisSelection(prev.analysisSelection);setSample(prev.sample);setArchive(prev.archive);
    },
  });
  // Global home is a destination, not a restore/back operation. Product browsing
  // memory remains owned by the embedded explorer; transient scene layers close.
  function returnHome(){
    setImpactOpen(true);
    leavePresentation();savedExploration.current=null;restoring.current=false;
    clearTimeout(closeTimer.current);closeTimer.current=null;setClosingLayer(false);
    setReader(null);setSample(null);setArchive(null);setSwitcher(false);
    setMediaPanel(null);setMediaPhase('closed');setVideoPlaying(false);
    setLocationOpen(false);setCapability('overview');setCapabilityFocus(null);
    setLocationRevealed(false);setGlobeMode('distribution');
    setAnalysisStage(null);setAnalysisDetail(null);setAnalysisPhase('closed');setAnalysisReturn(false);
    setExplorerAttention(false);setNavigationOpen(false);
    changeChapter(0);go('atlas','home');
    if(document.fullscreenElement?.closest('.media-theatre'))document.exitFullscreen().catch(()=>{});
    requestAnimationFrame(()=>document.querySelector('.system-brand')?.focus({preventScroll:true}));
  }
  useEffect(()=>{
    if(!presenting||!shot?.media)return;
    const timer=setTimeout(()=>{setMediaPanel({mode:shot.media,arrival:shot.media,automatic:true});setMediaPhase('approaching');},2200);
    return()=>clearTimeout(timer);
  },[presenting,shot?.id]);
  useEffect(()=>{setMediaPanel(null);setMediaPhase('closed');},[route.variant,route.page]);
  useEffect(()=>{
    const elements=document.querySelectorAll('.company-story,.story-chapters,.home-scene-caption,.story-destinations,.home-scene-node,.connected-location-copy,.location-controls,.globe-pin,.scene-stop,.capability-experience,.analysis-copy,.analysis-stages,.analysis-note,.analysis-intro,.system-bar');
    elements.forEach(el=>{el.inert=cinematic;});
    return()=>elements.forEach(el=>{el.inert=false;});
  },[cinematic,route.page,chapter,capability,locationActive]);
  // Route cleanup is bypassed on a restored exploration; otherwise it could erase
  // the detail layer that the visitor had open before automatic presentation.
  async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setNotice(t('当前浏览器未开放全屏，可使用系统全屏。', 'Fullscreen is unavailable here. Use your browser fullscreen control.')); } }
  const openBrand = b => { setEnteredBrand(b.id); wallPosition.current = { x: 0, y: 0 }; };
  const activeHomeAction = () => go(variant.id, variant.page);
  if(variant.id==='atlas'&&((home&&impactOpen)||route.page==='locations'))return <>
    <div style={{display:'contents'}} inert={readingActive?true:undefined}><Suspense fallback={<SceneLoading lang={lang}/>}><ImpactTheatre key={route.page} initialState={route.page==='locations'?{index:1}:null} lang={lang} onLanguage={setLang} brands={content.brands} catalog={catalog} companyFacts={official} onFullscreen={fullscreen} suspended={readingActive} onRead={(moment,payload)=>openDocument(impactDocument(moment,payload,{official,productReading,catalog}),payload?.locationId)}/></Suspense></div>
    {readingActive&&<DocumentReader key={reader.document.id} document={reader.document} initialSection={reader.initialSection} lang={lang} onLanguage={setLang} onClose={closeDocument} wallControls memory={readingMemory.current[reader.document.id]} onRemember={value=>{readingMemory.current[reader.document.id]=value;}}/>}
    {notice&&<div className="notice" role="status">{notice}</div>}
  </>;
  return <main className={`showroom ${variant.id==='atlas'?'atrium':''} theme-${variant.theme} variant-${variant.id} ${home ? 'is-home' : 'is-capability'} ${locationActive?'has-location-detail':''} ${home&&chapter>0?'has-story':''} ${home&&chapter===0?'is-overview':''} ${overviewFocus!==null?'has-overview-focus':''} ${route.page==='analytics'?'is-analytics':''} ${closingLayer?'closing-layer':''} ${mediaPanel?'has-news-media':''} ${presenting?'is-presenting':''} ${cinematic?'is-cinematic':''}`} data-presentation={presenting?'playing':quiet?'quiet':'interactive'} data-presentation-shot={shot?.id||''}>
    <div style={{display:'contents'}} inert={readingActive||manualMedia?true:undefined}>
    <div style={{display:'contents'}} inert={explorerOpen?true:undefined}>
    {variant.id!=='atlas'&&<header className="topbar"><button className="brand-lockup" aria-label={t('返回公司首页', 'Company home')} onClick={() => go(variant.id, 'home')}><img className="corporate-logo" src={variant.theme === 'dark' ? '/media/brand/logo-w.png' : '/media/brand/logo.svg'} alt="PARAMONT GROUP" /><span>{t('数字展厅', 'DIGITAL SHOWROOM')}</span></button><div className="top-actions"><div className="language-switch" aria-label={t('语言', 'Language')}><button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')} aria-pressed={lang === 'zh'}>中文</button><span>/</span><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button></div><button className="icon-button fullscreen" onClick={fullscreen} aria-label={t('切换全屏', 'Toggle fullscreen')}><CornersOut size={25} /></button></div></header>}
    {variant.id === 'atlas' && <Suspense fallback={(home||route.page==='locations')?<SceneLoading lang={lang}/>:null}><ConnectedScene cameraRequest={cameraRequest} newsMedia={mediaPanel} mediaPhase={mediaPhase} onMediaStage={mediaArrived} onNews={openMedia} cinematic={cinematic} presenting={presenting} overviewFocus={overviewFocus} onOverviewFocus={setOverviewFocus} analysisStage={analysisStage} analysisDetail={analysisDetail} analysisPhase={analysisPhase} analysisSelection={analysisSelection} onAnalysisPhase={analysisArrived} onAnalysisSelect={selectAnalysisObject} globeMode={globeMode} page={route.page} chapter={chapter} storySelection={storySelection} onStorySelect={selectStoryNode} paused={!(home||route.page==='locations'||route.page==='analytics')||switcher||!!sample||!!archive||videoPlaying||readingActive||mediaPhase==='open'} locations={content.locations} selected={selectedLocation} focusKey={focusKey} onSelect={id=>{if(id===selectedLocation&&locationRevealed)enterLocation();else selectLocation(id);}} onEnter={page => go('atlas',page)} lang={lang} capability={locationActive?capability:null} capabilityFocus={capabilityFocus} onCapability={changeCapability} onCapabilityFocus={setCapabilityFocus} /></Suspense>}
    {variant.id === 'atlas' && (home || route.page === 'locations') && <>
      {home ? <CompanyStory onNews={openMedia} onDocument={()=>openDocument(companyStoryDocument(official,chapter),chapter===1?official?.capabilities[storySelection.capability]?.id:chapter===2?`company-${storySelection.company}`:chapter===3?`year-${storySelection.year}`:null)} overviewFocus={overviewFocus} onOverviewEnter={enterOverview} onOverviewClear={()=>setOverviewFocus(null)} selection={storySelection} onSelection={changeStory} chapter={chapter} onChapter={changeChapter} official={official} lang={lang} onEnter={page=>go('atlas',page)}/> : <section className="atlas-copy connected-location-copy" key={locationRevealed?selectedLocation:globeMode}><p className="eyebrow">{t('工厂能力 / 全球布局与供应链','FACTORY / GLOBAL SUPPLY NETWORK')}</p><h1>{locationRevealed?loc.name[l]:t('让创意，\n走向世界。','Made to connect.\nAcross the world.')}</h1>{locationRevealed?<><p className="location-role">{(Array.isArray(loc.type)?loc.type[l]:loc.type)||locationProfile.role[l]}</p><button className="primary-link" onClick={()=>enterLocation()}>{locationProfile.enter[l]}<ArrowRight size={28}/></button><button className="text-button globe-overview-back" onClick={()=>setLocationRevealed(false)}><ArrowLeft/>{t('回到全球视野','Back to global view')}</button></>:<><p className="location-role">{globeMode==='distribution'?t('研发 · 制造 · 全球流通','Design · Manufacturing · Global movement'):t('创研、制造与市场团队，连接协作。','Design, manufacturing and market teams, connected.')}</p><p className="globe-concept-note">{globeMode==='distribution'?t('流向为概念演绎，非实际订单或物流线路。','Conceptual flows, not actual orders or shipping routes.'):t('选择基地，进入对应空间。','Choose a base to explore its space.')}</p></>}</section>}
      {!home && <div className="location-controls"><div className="globe-layers" aria-label={t('地球展示层','Globe layers')}>{[['distribution','商品流向','Product flows'],['network','团队与基地','Teams & bases']].map(([id,zh,en])=><button key={id} aria-pressed={globeMode===id} onClick={()=>{setGlobeMode(id);setLocationRevealed(false);}}>{t(zh,en)}</button>)}</div></div>}

    </>}
    {variant.id==='atlas'&&route.page==='analytics'&&<DataStory lang={lang} stage={analysisStage} phase={analysisPhase} selection={analysisSelection} onSelection={updateAnalysis} onStage={changeAnalysis} onDocument={section=>openDocument(studyDocument(analysisSelection),section)} onProducts={enterAnalysisProduct} productAvailable={!!linkedStudyProduct(selectedStudyPath(analysisSelection),productReading)} cinematic={cinematic} paused={readingActive}/> }
    {variant.id === 'studio' && home && <><Suspense fallback={null}><WorldScene mode="mountain" variant="studio" lang={lang} /></Suspense><section className="studio-home-copy"><p className="eyebrow">PARAMONT / CREATIVE MATTER</p><h1>{t('灵感，有了形状。', 'Ideas take shape.')}</h1><p>{t('用设计连接品牌，用产品传递创意。', 'Design connects brands. Products bring ideas to life.')}</p><button className="pill-button" onClick={activeHomeAction}>{t('进入品牌世界', 'Enter our brand world')}<ArrowUpRight size={25} /></button></section></>}
    {(variant.id === 'studio' && !home) && <>
      {!brand ? <><section className="gallery-heading"><p className="eyebrow">WEVEEL / BRAND COLLECTION</p><h1>{t('每个品牌，一个创意世界。', 'A world behind every brand.')}</h1></section>{catalog&&<button className="archive-entry" onClick={()=>setArchive('brands')}><SquaresFour size={22}/>{t('全部品牌档案','All brand records')}<span>{catalog.brands.length}</span><ArrowUpRight size={20}/></button>}<BrandCarousel brands={content.brands} active={activeBrand} onActive={setActiveBrand} onEnter={openBrand} lang={lang} /><p className="concept-note">{t('品牌信息来自官网 · 配图为视觉概念', 'Brand information from the official site · Concept artwork')}</p></> : <div className="brand-room"><button className="text-button brand-room-back" onClick={() => { setEnteredBrand(null); setSample(null); }}><ArrowLeft size={22} />{t('返回品牌画廊', 'Back to brand gallery')}</button><aside className="brand-room-story"><p className="eyebrow">WEVEEL / BRAND IN FOCUS</p><div className="brand-room-logo"><img src={`/media/brand/${brand.logo}`} alt={brand.name}/></div><h1>{brand.descriptor[l]}</h1><p>{brand.description[l]}</p><div className="brand-room-caption"><span>{String(wallItems.length).padStart(2,'0')}</span><div>{t('概念样品','Concept studies')}<small>{t('用于探索视觉与交互，非实际产品。','Visual and interaction studies, not actual products.')}</small></div></div>{catalog&&<button className="text-button" onClick={()=>setArchive('brands')}>{t('打开全部品牌档案','Open brand archive')}<ArrowRight size={22}/></button>}</aside><SampleWall samples={wallItems} lang={lang} onSelect={setSample} savedPosition={wallPosition} /></div>}
    </>}
    {variant.id === 'gallery' && home && <><section className="gallery-home-title"><p className="eyebrow">PARAMONT / INFINITE EDITIONS</p><h1>{t('让日常，充满可能。', 'Everyday, reimagined.')}</h1><p>{t('在品类之间，发现下一份灵感。', 'Find your next idea across our creative categories.')}</p></section><BrandCarousel brands={content.brands} active={activeBrand} onActive={setActiveBrand} onEnter={() => go('gallery', 'categories')} lang={lang} home /><button className="gallery-home-cta pill-button" onClick={activeHomeAction}>{t('探索品类与样品', 'Explore categories')}<ArrowRight size={24} /></button><p className="concept-note">{t('图片为本轮视觉概念', 'Artwork created for this visual study')}</p></>}
    {(variant.id === 'gallery' && !home) && <><section className="wall-heading categories-heading"><div><p className="eyebrow">PARAMONT / MATERIAL LIBRARY</p><h1>{t('灵感，触手可及。', 'Ideas within reach.')}</h1></div><span className="concept-tag">{t('概念样品 · 非实际产品', 'CONCEPT SAMPLES · NOT PRODUCT LISTINGS')}</span></section>{catalog&&<button className="archive-entry category-archive-entry" onClick={()=>setArchive('categories')}><SquaresFour size={22}/>{t('品类总览','Category index')}<span>{catalog.categories.length}</span><ArrowUpRight size={20}/></button>}<SampleWall samples={wallItems} lang={lang} onSelect={setSample} savedPosition={wallPosition} /><div className="category-controls segmented-control">{content.categories.map(c => <button key={c.id} className={c.id === filter ? 'active' : ''} aria-pressed={c.id === filter} onClick={() => setFilter(c.id)}>{c.name[l]}</button>)}</div></>}
    {variant.id!=='atlas'&&<footer className="bottom-bar"><button className="switch-variant" aria-label={t('切换方案','Choose a direction')} onClick={() => setSwitcher(true)}><SquaresFour size={24} /><span>{t('切换方案', 'Directions')}</span></button><nav aria-label={t('章节导航', 'Chapter navigation')}>{variant.id === 'atlas' ? [['home','公司世界','Company world'],['locations','全球布局','Global presence'],['brands','品牌世界','Brand worlds'],['products','产品探索','Product discovery']].map(([page,zh,en])=><button key={page} className={route.page===page?'active':''} aria-current={route.page===page?'page':undefined} onClick={()=>{if(page==='locations')setLocationOpen(false);go('atlas',page);}}>{t(zh,en)}</button>) : <><button className={home ? 'active' : ''} onClick={() => go(variant.id, 'home')} aria-current={home ? 'page' : undefined}>{t('公司介绍', 'Company')}</button><button className={!home ? 'active' : ''} onClick={activeHomeAction} aria-current={!home ? 'page' : undefined}>{variant.pageLabel[l]}</button></>}</nav><button className="tour-button" onClick={toggle} aria-label={t('开始或停止自动展示', 'Start or stop presentation')}>{presenting ? <Pause size={18} /> : <Play size={18} />}<span>{t('自动展示', 'Presentation')}</span></button></footer>}


    {sample && <SampleViewer samples={viewerItems} selected={sample} onChange={setSample} onClose={() => closeOverlay(setSample,null)} lang={lang} onVideoPlaying={setVideoPlaying} />}
    {locationActive && <FactoryDetail key={loc.id} onDocument={()=>openDocument(locationDocument(loc,capability,capabilityFocus))} location={loc} samples={content.samples} lang={lang} tab={capability} onTab={changeCapability} focus={capabilityFocus} onFocus={setCapabilityFocus} onClose={closeLocation} onVideoPlaying={setVideoPlaying} onSample={id=>setSample(id)}/>}
    {archive&&catalog&&<CatalogBrowser key={archive} type={archive} catalog={catalog} featured={content.brands} lang={lang} remembered={archiveMemory.current[archive]} onRemember={value=>archiveMemory.current[archive]=value} onClose={()=>closeOverlay(setArchive,null)} onBrand={b=>{setArchive(null);openBrand(b);}}/>}
    </div>
    <ProductExplorer onView={setExplorerView} cinematic={cinematic} onAttention={setExplorerAttention} onDocument={openProductDocument} suspended={readingActive} open={explorerOpen} lang={lang} navigation={explorerNavigation} directedPresentation={presenting} onActivity={activityFromChild} onPlayback={setVideoPlaying} onSection={section=>{if(!presenting&&explorerOpen&&isExplorerPage(section)){setExplorerNavigation(previous=>previous.section===section?previous:{...previous,section});rawGo('atlas',section);};}} onLanguage={setLang} onClose={()=>{if(analysisReturn){backToAnalysis();return;}wake();const target=explorerReturn.current;go(target.variant,target.page);}}/>
    {variant.id==='atlas'&&<SystemBar page={route.page} lang={lang} context={(()=>{const context=sceneNavigation({page:route.page,chapter,locations:content.locations,locationActive,locationRevealed,selectedLocation,profile:locationProfile,capability,analysisSteps,analysisStage,explorerView});return explorerOpen&&analysisReturn?{...context,items:[{id:'return-analysis',label:['返回分析','Back to analysis']},...context.items]}:context;})()} onSelect={id=>{
      wake();
      if(id==='return-analysis'){backToAnalysis();return;}
      if(home)changeChapter(id);
      else if(route.page==='locations'){if(locationActive)changeCapability(id);else selectLocation(id);}
      else if(explorerOpen&&isExplorerView(id)){const section=sectionForView(id);setExplorerNavigation(previous=>({section,view:id,id:previous.id+1,preserve:false}));rawGo('atlas',section);}
      else if(route.page==='analytics')changeAnalysis(id);
    }} onAttention={setNavigationOpen} onHome={returnHome} onNavigate={page=>{if(page==='home'){returnHome();return;}wake();go('atlas',page==='products'?explorerNavigation.section:page,page==='products');}} onLanguage={setLang} onFullscreen={fullscreen} onPresentation={toggle} presenting={presenting}/>}
    {notice && <div className="toast" role="status">{notice}</div>}
    {switcher && <Switcher current={variant.id} lang={lang} sampleImages={['a3-paper-mountains.png', 'a1-markers.png', 'b1-wooden-arches.png']} onClose={() => setSwitcher(false)} onChoose={id => { go(id); setSwitcher(false); }} />}
    </div>
    {cinematic&&<button ref={el=>el?.focus({preventScroll:true})} className="presentation-cover" aria-label={t('恢复触摸探索','Resume touch exploration')} onClick={wake}><span className="presentation-boundary">{route.page==='products'?t('原创产品概念','Original product studies'):route.page==='analytics'?t('分析流程概念','Analysis workflow concept'):route.page==='locations'?t('空间与流向概念','Spatial and flow concepts'):''}</span></button>}
    {mediaPanel&&<div style={{display:'contents'}} inert={readingActive?true:undefined}><MediaTheatre onHome={returnHome} phase={mediaPhase} onMode={mode=>setMediaPanel(previous=>({...previous,mode}))} mode={mediaPanel.mode} automatic={mediaPanel.automatic} films={playableFilms(mediaLibrary.films)} publications={mediaLibrary.publications?.length?mediaLibrary.publications:[companyDocument(official),analysisDocument(2)].filter(Boolean)} lang={lang} onClose={closeMedia} onRead={openDocument}/></div>}
    {variant.id==='atlas'&&cinematic&&!mediaPanel&&!readingActive&&<ExhibitCaption page={route.page} chapter={chapter} focus={overviewFocus} location={loc} profile={locationProfile} locationActive={locationActive} locationRevealed={locationRevealed} capability={capability} lang={lang}/>}
    {readingActive&&<DocumentReader key={reader.document.id} document={reader.document} initialSection={reader.initialSection} lang={lang} onLanguage={setLang} onHome={returnHome} onClose={closeDocument} memory={readingMemory.current[reader.document.id]} onRemember={value=>{readingMemory.current[reader.document.id]=value;}}/>}
  </main>;
}
