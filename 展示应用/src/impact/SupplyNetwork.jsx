import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Plus,Minus,ArrowsInSimple,MapTrifold,MagnifyingGlass,X} from '@phosphor-icons/react';
import {footprint} from './footprintGeography.js';
import {mapLayout} from './distributionLayout.js';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {distributionRegions,distributionLinks,distributionLayers,footprintCountries,footprintKind,clampMapView,mapJourneyFrame} from './distributionContent.js';
import './distribution.css';

export function SupplyNetwork({active,lang,playing,suspended,depthActive=false,network,onChange,journeyRef,onEnter,onInteract,onHold}){
  const t=(zh,en)=>lang==='zh'?zh:en,l=lang==='zh'?0:1,n=value=>value.toLocaleString(lang==='zh'?'zh-CN':'en-US');
  const host=useRef(),root=useRef(),surface=useRef(),gesturesRef=useRef(),wasDepth=useRef(false),lastScene=useRef(),latest=useRef(),directoryButton=useRef(),directorySearch=useRef();
  const [size,setSize]=useState([1600,650]),[view,setView]=useState({zoom:1,x:0,y:0}),[query,setQuery]=useState('');
  const {layer,selected,directory}=network;
  const data=useMemo(()=>mapLayout(...size),[size]),countries=footprintCountries(footprint,layer),chosen=countries.find(country=>country.code===selected),listed=footprintCountries(footprint,layer,query),coverage=Object.fromEntries(countries.map(country=>[country.mapId,country]));
  const selectCountry=code=>{if(!active||depthActive||suspended||!countries.some(country=>country.code===code))return;onChange({selected:code});onInteract();};
  const enterRegion=id=>{
    const region=distributionRegions.find(region=>region.id===id);
    if(!active||depthActive||suspended||!region)return;
    if(!region.sceneId){selectCountry(footprint.countries.find(country=>country.mapId===region.countryCode)?.code);return;}
    if(onEnter(region.sceneId)){lastScene.current=id;onInteract();}
  };
  latest.current={active,suspended,depthActive,directory,view,selectCountry,enterRegion,onInteract,onHold};
  journeyRef.current={frame(progress,region,mapDepth=false){
    if(!root.current||!surface.current)return;
    const pose=mapJourneyFrame(view,data.points[region]||[size[0]/2,size[1]/2],size,mapDepth?progress:0);
    surface.current.style.transform=`translate(${pose.x}px,${pose.y}px) scale(${pose.zoom})`;
    root.current.style.opacity=String(1-progress);root.current.style.setProperty('--map-copy-opacity',String(mapDepth?pose.copyOpacity:1));
    root.current.dataset.mapJourney=progress.toFixed(3);
    root.current.parentElement.style.setProperty('--map-model-opacity',String(mapDepth?pose.modelOpacity:1));
  }};
  useEffect(()=>{
    const el=host.current,observer=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;if(width>0&&height>0)setSize([width,height]);});observer.observe(el);
    let origin;
    const gestures=bindScenePointer(el,{claimClick:true,includeControls:true,enabled:()=>latest.current.active&&!latest.current.suspended&&!latest.current.depthActive&&!latest.current.directory,
      onStart(){origin=latest.current.view;latest.current.onInteract();latest.current.onHold(true);},
      onMove(_event,{gesture}){const dx=(gesture.x-gesture.startX)/el.clientWidth,dy=(gesture.y-gesture.startY)/el.clientHeight;setView(clampMapView({...origin,x:origin.x+dx,y:origin.y+dy}));},
      onEnd({cancelled}){if(cancelled&&origin)setView(origin);latest.current.onHold(false);},
      onTap(_event,gesture){const region=gesture.target.closest?.('[data-map-region]')?.dataset.mapRegion,country=gesture.target.closest?.('[data-map-country]')?.dataset.mapCountry;if(region)latest.current.enterRegion(region);else if(country)latest.current.selectCountry(country);},
    });gesturesRef.current=gestures;return()=>{observer.disconnect();gestures.dispose();};
  },[]);
  useEffect(()=>{if(active&&host.current){const {width,height}=host.current.getBoundingClientRect();if(width>0&&height>0)setSize([width,height]);}},[active]);
  useEffect(()=>{if(!active||suspended||depthActive||directory)gesturesRef.current?.cancel();},[active,suspended,depthActive,directory]);
  useEffect(()=>{if(wasDepth.current&&!depthActive&&active)root.current?.querySelector(`.distribution-scene-nav button[data-map-region="${lastScene.current}"]`)?.focus({preventScroll:true});wasDepth.current=depthActive;},[depthActive,active]);
  useEffect(()=>{
    if(!directory||!active||depthActive||suspended)return;
    directorySearch.current?.focus({preventScroll:true});
  },[directory,active,depthActive,suspended]);
  const closeDirectory=()=>{onChange({directory:false});onInteract();directoryButton.current?.focus({preventScroll:true});};
  const changeLayer=id=>{onChange({layer:id,selected:null});onInteract();};
  const zoom=delta=>{setView(current=>clampMapView({...current,zoom:current.zoom+delta}));onInteract();};
  const reset=()=>{setView({zoom:1,x:0,y:0});onChange({selected:null});onInteract();};
  const style={transform:`translate(${view.x*size[0]}px,${view.y*size[1]}px) scale(${view.zoom})`};
  const metrics=country=><div className="distribution-metrics">{['customers','suppliers'].filter(key=>layer==='all'||key===layer).map(key=>{
    const source=footprint.sources[key],value=country?country[key]:source.totalRecords;
    return <div key={key} className={`metric-${key}`}><p>{key==='customers'?t('客户档案','CUSTOMER RECORDS'):t('供应商档案','SUPPLIER RECORDS')}{!country&&<span>{source.countryCount} {t('个国家和地区','countries / areas')}</span>}</p><strong>{n(value)}</strong></div>;
  })}</div>;
  return <section className="distribution-map" ref={root} hidden={!active} inert={depthActive||suspended} aria-hidden={depthActive||undefined} data-network-view="flat" data-map-layer={layer} data-map-selection={selected||'all'} data-map-zoom={view.zoom.toFixed(1)} data-animate={active&&playing&&!suspended&&!depthActive} aria-label={t('全球供应链','Global supply network')}>
    <header className="distribution-heading"><p>{t('全球供应链','GLOBAL SUPPLY NETWORK')}</p><h1>{t('中国核心，全球协同。','CHINA CORE. GLOBAL REACH.')}</h1>
      <nav className="distribution-layers" aria-label={t('地图展示范围','Map layers')}>{distributionLayers.map(item=><button key={item.id} aria-pressed={item.id===layer} onClick={()=>changeLayer(item.id)}>{item.name[l]}</button>)}</nav>
    </header>
    <div className="distribution-network-signature" aria-hidden="true"><span>{t('研发 · 供应链 · 市场','DEVELOPMENT · SUPPLY · MARKETS')}</span><i/>{t('创意连接世界','CREATIVITY CONNECTS.')}</div>
    <div className="distribution-legend" aria-label={t('地图图例','Map legend')}>{(layer==='all'?['customers','suppliers','both']:[layer]).map(kind=><span key={kind} className={`legend-${kind}`}><i/>{kind==='customers'?t('客户覆盖','Customer coverage'):kind==='suppliers'?t('供应商覆盖','Supplier coverage'):t('双方均有记录','Both recorded')}</span>)}</div>
    <div className="distribution-cartography" ref={host} inert={directory} aria-label={t('可放大和拖动的世界地图','Zoomable and draggable world map')}>
      <div className="distribution-transform" ref={surface} style={style}>
        <svg viewBox={`0 0 ${size[0]} ${size[1]}`} className="distribution-land" aria-hidden="true">
          <defs>
            <linearGradient id="distribution-land-fill" x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#183c57"/><stop offset=".5" stopColor="#102b42"/><stop offset="1" stopColor="#061727"/></linearGradient>
            <linearGradient id="distribution-customer-fill" x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#255369"/><stop offset=".5" stopColor="#15394f"/><stop offset="1" stopColor="#0b263b"/></linearGradient>
            <linearGradient id="distribution-supplier-fill" x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#655a43"/><stop offset="1" stopColor="#2a3034"/></linearGradient>
            <linearGradient id="distribution-both-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#345966"/><stop offset="1" stopColor="#62543b"/></linearGradient>
            <linearGradient id="distribution-edge-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#365e7a"/><stop offset="1" stopColor="#10283f"/></linearGradient>
            <radialGradient id="distribution-hub-light"><stop stopColor="#ffe6b2" stopOpacity=".52"/><stop offset=".25" stopColor="#ebc689" stopOpacity=".17"/><stop offset="1" stopColor="#ebc689" stopOpacity="0"/></radialGradient>
          </defs>
          <ellipse className="distribution-ocean-ring" cx={size[0]*.51} cy={size[1]*.65} rx={size[0]*.44} ry={size[1]*.33}/>
          <path d={data.grid} className="distribution-grid"/>
          <path d={data.silhouette} className="distribution-land-shadow" transform={`translate(0 ${10*data.scale})`}/>
          <path d={data.silhouette} className="distribution-land-depth" transform={`translate(0 ${5*data.scale})`}/>
          {data.countries.map(country=>{const record=coverage[country.id];return <path key={country.key} d={country.path} className={`distribution-country ${record?`is-present footprint-${footprintKind(record,layer)}`:''} ${record?.code===selected?'is-selected':''}`} data-country={country.id} data-map-country={record?.code}/>;})}
          <path d={data.silhouette} className="distribution-coastline"/>
          {distributionRegions.map(region=><circle key={region.id} className="distribution-hub-light" cx={data.points[region.id][0]} cy={data.points[region.id][1]} r={(region.id==='china'?64:32)*data.scale}/>)}
          {layer==='all'&&distributionLinks.map(([from,to])=>{const a=data.points[from],b=data.points[to],d=`M${a[0]},${a[1]} Q${(a[0]+b[0])/2},${Math.min(a[1],b[1])-Math.max(64,Math.abs(a[0]-b[0])*.25)} ${b[0]},${b[1]}`;return <g key={`${from}-${to}`} className="distribution-link"><path d={d} className="distribution-route-glow"/><path d={d}/><path d={d} className="distribution-flow" pathLength="100"/></g>;})}
          {data.coveragePoints.filter(country=>coverage[country.mapId]).map(country=><circle key={country.code} data-map-country={country.code} className={`distribution-coverage-dot footprint-${footprintKind(country,layer)} ${country.code===selected?'is-selected':''}`} cx={country.center[0]} cy={country.center[1]} r={2.1*data.scale}/>)}
          {distributionRegions.map(region=>{const [x,y]=data.points[region.id],nearest=Math.min(...distributionRegions.filter(other=>other.id!==region.id).map(other=>Math.hypot(x-data.points[other.id][0],y-data.points[other.id][1])));return <circle key={region.id} className="distribution-hit" data-map-region={region.id} cx={x} cy={y} r={Math.min(Math.max(24,24*data.scale),nearest*.45)}/>;})}
        </svg>
        {distributionRegions.map(region=>{const [x,y]=data.points[region.id],offset=region.id==='china'?[35,-100]:region.id==='cambodia'?[48,50]:region.id==='vietnam'?[-205,0]:[-175,32];return <div key={region.id} data-map-region={region.id} className={`distribution-marker kind-${region.kind} ${coverage[region.countryCode]?.code===selected?'is-selected':''}`} style={{left:x,top:y,'--label-x':`${offset[0]*data.scale}px`,'--label-y':`${offset[1]*data.scale}px`}}>
          <svg className="distribution-leader" aria-hidden="true"><path d={`M0,0 L${offset[0]*data.scale},${offset[1]*data.scale+24*data.scale}`}/></svg><i className="distribution-dot"/>
          <button className="distribution-region-action exhibit-action" data-map-region={region.id} aria-label={`${region.name[l]} · ${region.sceneId?t('进入三维空间','Explore in 3D'):t('查看供应链分布','View supply chain coverage')}`} onClick={event=>{if(event.detail===0)enterRegion(region.id);}}><span className="distribution-region-copy"><strong>{region.name[l]}{region.id==='china'&&<small>{t('核心枢纽','CORE HUB')}</small>}</strong><span>{region.role[l]}</span></span><ArrowRight className="distribution-enter-icon" aria-hidden="true"/></button>
        </div>;})}
      </div>
    </div>
    <div className="distribution-map-tools"><button aria-label={t('缩小地图','Zoom out map')} disabled={view.zoom<=1} onClick={()=>zoom(-.35)}><Minus/></button><button aria-label={t('放大地图','Zoom in map')} disabled={view.zoom>=2.4} onClick={()=>zoom(.35)}><Plus/></button><button aria-label={t('恢复世界全景','Reset world view')} onClick={reset}><ArrowsInSimple/></button></div>
    <div className="distribution-reading" aria-live="polite"><p>{chosen?<><button className="distribution-back" onClick={()=>{onChange({selected:null});onInteract();}}><ArrowLeft/>{t('全球覆盖','Global reach')}</button><b>{chosen.name[l]}</b><span>{chosen.code}</span></>:<>{t('全球覆盖','GLOBAL REACH')}<span>{countries.length} {t('个国家和地区','countries / areas')}</span></>}</p>{metrics(chosen)}</div>
    <div className="distribution-country-nav" aria-label={t('选择业务地区','Choose a business region')}>
      <button className="distribution-directory-entry" ref={directoryButton} aria-expanded={directory} onClick={()=>{onChange({directory:true});onInteract();}}><MagnifyingGlass/>{t('国家与地区','COUNTRY DIRECTORY')} <span>{countries.length}</span></button>
      <div className="distribution-scene-nav"><span>{t('区域协作','REGIONAL NETWORK')}</span>{distributionRegions.filter(region=>!chosen||!distributionRegions.some(item=>item.countryCode===chosen.mapId)||region.countryCode===chosen.mapId).map(region=><button className="exhibit-action" key={region.id} data-map-region={region.id} onClick={()=>enterRegion(region.id)}>{lang==='en'&&region.id==='usa'?'USA':region.name[l]}<ArrowRight/></button>)}</div>
    </div>
    <p className="distribution-caption"><MapTrifold/>{t('客户与供应商覆盖 · 区域协作网络','Customer & supplier coverage · Regional collaboration')}</p>
    {directory&&<aside className="distribution-directory" aria-label={t('国家与地区目录','Country and area directory')} onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();closeDirectory();}}}>
      <header><div><p>{t('国家与地区','COUNTRIES & AREAS')}</p><h2>{t('探索业务足迹','EXPLORE OUR REACH')}<span>{countries.length}</span></h2></div><button onClick={closeDirectory} aria-label={t('关闭国家目录','Close country directory')}><X/></button></header>
      <label className="distribution-search"><MagnifyingGlass/><input ref={directorySearch} aria-label={t('搜索国家或地区','Search country or area')} placeholder={t('国家、地区或代码','Country, area or code')} value={query} onChange={event=>{setQuery(event.target.value);onInteract();}}/>{query&&<button onClick={()=>{setQuery('');directorySearch.current?.focus();onInteract();}} aria-label={t('清空搜索','Clear search')}><X/></button>}</label>
      <div className="distribution-directory-list">{listed.map(country=><button key={country.code} aria-pressed={country.code===selected} onClick={()=>{selectCountry(country.code);closeDirectory();}}><div><strong>{country.name[l]}</strong><span>{country.code}</span></div><p>{layer!=='suppliers'&&<span>{t('客户','Customers')} <b>{n(country.customers)}</b></span>}{layer!=='customers'&&<span>{t('供应商','Suppliers')} <b>{n(country.suppliers)}</b></span>}</p></button>)}{!listed.length&&<p className="distribution-no-results">{t('本图层没有匹配的国家或地区。','No matching country or area in this layer.')}</p>}</div>
      <footer><p>{t('按客户与供应商主档汇总。中国、柬埔寨、美国入口展示公司协作场景，越南入口展示供应链覆盖；国家覆盖不代表自有工厂。','Customer and supplier master records. China, Cambodia and the US open company scenes; Vietnam shows supply chain coverage. Country coverage does not imply owned factories.')}</p><button className="exhibit-action" onClick={closeDirectory}><ArrowLeft/>{t('返回世界地图','BACK TO WORLD MAP')}</button></footer>
    </aside>}
  </section>;
}
