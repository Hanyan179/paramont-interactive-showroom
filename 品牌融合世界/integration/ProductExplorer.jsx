import {useEffect,useRef,useState} from 'react';
import './ProductExplorer.css';
const CHANNEL='paramont-explorer',VERSION=1;
// Keep this component mounted when closed to preserve the explorer's position and media state.
export function ProductExplorer({open,lang='zh',onClose,onLanguage,src='/modules/product-explorer/index.html'}){
 const frame=useRef(),previousFocus=useRef(),[started,setStarted]=useState(open),[ready,setReady]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const [url]=useState(()=>{const value=new URL(src,location.href);value.searchParams.set('embed','1');value.searchParams.set('parentOrigin',location.origin);value.searchParams.set('lang',lang);return value;});
 const latest=useRef();latest.current={open,lang,onClose,onLanguage};
 const send=(type,payload={})=>frame.current?.contentWindow?.postMessage({channel:CHANNEL,version:VERSION,type,...payload},url.origin);
 useEffect(()=>{if(open){setStarted(true);previousFocus.current=document.activeElement;frame.current?.focus();}else previousFocus.current?.focus?.();send('visibility',{visible:open});},[open]);
 useEffect(()=>{if(ready)send('language',{language:lang});},[lang,ready]);
 useEffect(()=>{const receive=e=>{if(e.origin!==url.origin||e.source!==frame.current?.contentWindow||e.data?.channel!==CHANNEL||e.data?.version!==VERSION)return;const value=e.data;if(value.type==='ready'){setReady(true);setFailed(false);send('visibility',{visible:latest.current.open});send('language',{language:latest.current.lang});if(latest.current.open)frame.current?.focus();}if(value.type==='close'&&latest.current.open)latest.current.onClose();if(value.type==='language'&&['zh','en'].includes(value.language)&&latest.current.open)latest.current.onLanguage?.(value.language);};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[url]);
 useEffect(()=>{if(!started||ready)return;const timer=setTimeout(()=>setFailed(true),15000);return()=>clearTimeout(timer);},[started,ready,attempt]);
 if(!started)return null;
 const zh=lang==='zh';
 return <div className="paramont-explorer-host" hidden={!open} role="dialog" aria-modal="true" aria-label={zh?'品牌与产品探索':'Brand and product explorer'}>
  <iframe ref={frame} key={attempt} src={url.href} title={zh?'品牌与产品探索':'Brand and product explorer'} allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" tabIndex={open?0:-1}/>
  {!ready&&<div className="paramont-explorer-status"><p>{failed?(zh?'探索模块暂时无法打开':'The explorer could not open'):(zh?'正在进入品牌与产品世界':'Entering the brand and product world')}</p><div>{failed&&<button onClick={()=>{setFailed(false);setReady(false);setAttempt(a=>a+1);}}>{zh?'重试':'Retry'}</button>}<button onClick={onClose}>← {zh?'返回企业展厅':'Back to showroom'}</button></div></div>}
 </div>;
}
