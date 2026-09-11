export const CHANNEL='paramont-explorer';
export const VERSION=1;
const params=new URLSearchParams(location.search);
export const embedded=window.parent!==window && params.get('embed')==='1';
export const sharedShell=embedded&&params.get('shell')==='showroom';
// The declared parent is checked against the referrer; without one, only same-origin embedding is allowed.
let declared;try{declared=new URL(params.get('parentOrigin')||location.origin).origin;}catch{declared=location.origin;}
let referrer;try{referrer=new URL(document.referrer).origin;}catch{referrer=location.origin;}
export const parentOrigin=declared===referrer?declared:location.origin;
export const initialLanguage=['zh','en'].includes(params.get('lang'))?params.get('lang'):null;
export function sendHost(type,payload={}){if(embedded)window.parent.postMessage({channel:CHANNEL,version:VERSION,type,...payload},parentOrigin);}
export function subscribeHost(onMessage){const handler=e=>{if(embedded&&e.source===window.parent&&e.origin===parentOrigin&&e.data?.channel===CHANNEL&&e.data.version===VERSION)onMessage(e.data);};window.addEventListener('message',handler);return()=>window.removeEventListener('message',handler);}
