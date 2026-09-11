import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {asset} from './content.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fit={scale:1,x:0,y:0};
export function PhotoViewer({product,images,value,onChange,lang}){
 const l=lang==='zh'?0:1,t=(zh,en)=>l===0?zh:en,viewport=useRef(),points=useRef(new Map()),gesture=useRef(),[failure,setFailure]=useState(false);
 const transform=value.transforms?.[value.photo]||fit,current=useRef(transform);current.current=transform;
 const update=next=>{const r=viewport.current?.getBoundingClientRect();const scale=clamp(next.scale,1,4);const x=clamp(next.x,-(r?.width||0)*(scale-1)/2,(r?.width||0)*(scale-1)/2);const y=clamp(next.y,-(r?.height||0)*(scale-1)/2,(r?.height||0)*(scale-1)/2);current.current={scale,x,y};onChange({transforms:{...value.transforms,[value.photo]:current.current}});};
 const zoom=(scale,cx=0,cy=0)=>{const old=current.current,ratio=scale/old.scale;update({scale,x:cx-(cx-old.x)*ratio,y:cy-(cy-old.y)*ratio});};
 function start(e){if(e.button>0)return;e.currentTarget.setPointerCapture(e.pointerId);points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});resetGesture();}
 function resetGesture(){const p=[...points.current.values()];gesture.current={points:p,transform:{...current.current}};}
 function move(e){if(!points.current.has(e.pointerId))return;points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...points.current.values()],g=gesture.current;if(p.length===2&&g.points.length===2){const a=g.points,b=p,dist=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),scale=clamp(g.transform.scale*Math.hypot(b[0].x-b[1].x,b[0].y-b[1].y)/Math.max(dist,1),1,4),r=viewport.current.getBoundingClientRect(),cx=(a[0].x+a[1].x)/2-r.left-r.width/2,cy=(a[0].y+a[1].y)/2-r.top-r.height/2;update({scale,x:cx-(cx-g.transform.x)*scale/g.transform.scale+(b[0].x+b[1].x-a[0].x-a[1].x)/2,y:cy-(cy-g.transform.y)*scale/g.transform.scale+(b[0].y+b[1].y-a[0].y-a[1].y)/2});}else if(p.length===1)update({...g.transform,x:g.transform.x+p[0].x-g.points[0].x,y:g.transform.y+p[0].y-g.points[0].y});}
 function end(e){points.current.delete(e.pointerId);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);resetGesture();}
 useEffect(()=>{setFailure(false);points.current.clear();},[value.photo,product.id]);
 useLayoutEffect(()=>{const el=viewport.current;const wheel=e=>{e.preventDefault();const r=el.getBoundingClientRect();zoom(clamp(current.current.scale-e.deltaY*.002,1,4),e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);});
 const image=images[value.photo];
 return <div className="media-view photo-viewer">
  <div className="photo-viewport" ref={viewport} tabIndex={0} role="group" aria-label={t('产品图片，可缩放与移动','Product image, zoomable and pannable')} data-scale={transform.scale.toFixed(2)} data-x={Math.round(transform.x)} data-y={Math.round(transform.y)} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onDoubleClick={()=>update(transform.scale>1?fit:{scale:2,x:0,y:0})} onKeyDown={e=>{if(e.key==='+'||e.key==='='){e.preventDefault();zoom(transform.scale+.4);}else if(e.key==='-'){e.preventDefault();zoom(transform.scale-.4);}else if(e.key==='0'){e.preventDefault();update(fit);}else if(e.key.startsWith('Arrow')){e.preventDefault();update({...transform,x:transform.x+(e.key==='ArrowLeft'?-35:e.key==='ArrowRight'?35:0),y:transform.y+(e.key==='ArrowUp'?-35:e.key==='ArrowDown'?35:0)});}}}>
   {!failure?<img key={image.src} draggable="false" src={asset(image.src)} alt={`${product.name[l]} · ${image.label[l]} · ${t('概念图片','Concept image')}`} style={{transform:`translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`}} onError={()=>setFailure(true)}/>:<div className="image-error"><p>{t('这张图片暂时无法加载','This image could not load')}</p><button onClick={()=>setFailure(false)}>{t('重试','Retry')}</button></div>}
  </div>
  <div className="image-controls"><button aria-label={t('缩小图片','Zoom out')} disabled={transform.scale<=1} onClick={()=>zoom(transform.scale-.4)}>−</button><button onClick={()=>update(fit)} aria-label={t('图片复位','Reset image')}>{Math.round(transform.scale*100)}%</button><button aria-label={t('放大图片','Zoom in')} disabled={transform.scale>=4} onClick={()=>zoom(transform.scale+.4)}>＋</button></div>
  <div className="photo-thumbnails" aria-label={t('多角度图片','Image views')}>{images.map((im,i)=><button aria-label={t('查看','View ')+im.label[l]} aria-pressed={value.photo===i} className={value.photo===i?'selected':''} key={im.src} onClick={()=>onChange({photo:i})}><img src={asset(im.src)} alt=""/><span>{im.label[l]}</span></button>)}</div>
 </div>;
}
