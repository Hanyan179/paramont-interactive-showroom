import { isExplorerView, sectionForView } from '../../../共享组件/explorerViews.js';
import { isExplorerPage } from '../config/areas.js';
import { loadingMessage } from '../config/uiCopy.js';
import {useEffect,useRef,useState} from 'react';
import './ProductExplorer.css';
const CHANNEL='paramont-explorer',VERSION=1;
// Keep this component mounted when closed to preserve the explorer's position and media state.
export function ProductExplorer({open,cinematic=false,onAttention,suspended=false,onDocument,lang='zh',onClose,onLanguage,navigation={section:'products',id:0},presentation,directedPresentation=false,onActivity,onPlayback,onSection,onView,onPresentation,src='/modules/product-explorer/index.html'}){
 const frame=useRef(),previousFocus=useRef(),[started,setStarted]=useState(true),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const [retained,setRetained]=useState(open),[entered,setEntered]=useState(false);
 const [url]=useState(()=>{const value=new URL(src,location.href);value.searchParams.set('embed','1');value.searchParams.set('shell','showroom');value.searchParams.set('parentOrigin',location.origin);value.searchParams.set('lang',lang);return value;});
 const latest=useRef();latest.current={open,cinematic,onAttention,suspended,onDocument,lang,onClose,onLanguage,navigation,onSection,onView,onPresentation,onActivity,onPlayback};
 const send=(type,payload={})=>frame.current?.contentWindow?.postMessage({channel:CHANNEL,version:VERSION,type,...payload},url.origin);
 useEffect(()=>{let timer,frameId;if(open){setRetained(true);frameId=requestAnimationFrame(()=>setEntered(true));}else{setEntered(false);timer=setTimeout(()=>setRetained(false),850);}return()=>{clearTimeout(timer);cancelAnimationFrame(frameId);};},[open,ready]);
 useEffect(()=>{if(open){setStarted(true);previousFocus.current=document.activeElement;frame.current?.focus();}else{previousFocus.current?.focus?.();latest.current.onPlayback?.(false);}send('visibility',{visible:open&&!suspended});},[open]);
 useEffect(()=>{if(ready)send('visibility',{visible:open&&!suspended});},[open,suspended,ready]);
 useEffect(()=>{if(ready)send('language',{language:lang});},[lang,ready]);
 useEffect(()=>{if(ready&&open)send('navigate',{section:navigation.section,view:navigation.view,navigationId:navigation.id,preserve:navigation.preserve===true,productId:navigation.productId,skuId:navigation.skuId});},[navigation.id,ready,open]);
 useEffect(()=>{if(ready&&open&&presentation?.id)send('presentation-toggle');},[presentation?.id]);
 useEffect(()=>{if(ready)send('cinematic-set',{enabled:open&&cinematic});},[ready,open,cinematic]);
 useEffect(()=>{if(ready)send('presentation-set',{enabled:open&&directedPresentation});},[ready,open,directedPresentation,navigation.id]);
 useEffect(()=>{const receive=e=>{if(e.origin!==url.origin||e.source!==frame.current?.contentWindow||e.data?.channel!==CHANNEL||e.data?.version!==VERSION)return;const value=e.data,current=latest.current;if(value.type==='document-open'&&current.open&&!current.suspended&&typeof value.productId==='string')current.onDocument?.({productId:value.productId,skuId:value.skuId});if(value.type==='activity'&&current.open)current.onActivity?.(value);if(value.type==='attention'&&current.open)current.onAttention?.(value.busy===true);if(value.type==='playback'&&current.open)current.onPlayback?.(value.playing===true);if(value.type==='ready'){setReady(true);setFailed(false);send('visibility',{visible:current.open&&!current.suspended});send('language',{language:current.lang});if(current.open)frame.current?.focus();}if(value.type==='close'&&current.open)current.onClose();if(value.type==='language'&&['zh','en'].includes(value.language)&&current.open)current.onLanguage?.(value.language);if(value.type==='state'&&current.open&&value.navigationId===current.navigation.id){if(isExplorerView(value.view)&&sectionForView(value.view)===value.section)current.onView?.(value.view);if(isExplorerPage(value.section))current.onSection?.(value.section);current.onPresentation?.(value.presentation===true);}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[url]);
 useEffect(()=>{if(!started||ready)return;const timer=setTimeout(()=>setFailed(true),15000);return()=>clearTimeout(timer);},[started,ready,attempt]);
 if(!started)return null;
 const zh=lang==='zh';
 return <section className="paramont-explorer-host" hidden={!open&&!retained} data-entered={entered} data-open={open} inert={!open||!entered?true:undefined} aria-hidden={!open} aria-label={zh?'品牌与产品探索':'Brand and product explorer'}>
  <iframe ref={frame} key={attempt} src={url.href} title={zh?'品牌与产品探索':'Brand and product explorer'} allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" tabIndex={open?0:-1}/>
  {!ready&&<div className="paramont-explorer-status"><p>{failed?(zh?'探索模块暂时无法打开':'The explorer could not open'):loadingMessage(lang,'products')}</p><div>{failed&&<button onClick={()=>{setFailed(false);setReady(false);setAttempt(a=>a+1);}}>{zh?'重试':'Retry'}</button>}<button onClick={onClose}>← {zh?'返回企业展厅':'Back to showroom'}</button></div></div>}
 </section>;
}
