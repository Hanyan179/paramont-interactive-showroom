import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X, Minus, Plus, Play } from '@phosphor-icons/react';
import { asset, variants } from '../content';
import { useDialog } from '../hooks';

export function Modal({ onClose, title, children, className = '' }) {
  const ref = useRef(null); useDialog(ref, onClose);
  return <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) onClose(); }}><section ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`modal ${className}`}><button className="icon-button close-dialog" onClick={onClose} aria-label={document.documentElement.lang.startsWith('zh')?'关闭':'Close'}><X /></button>{children}</section></div>;
}
export function SampleViewer({ samples, selected, onChange, onClose, lang, onVideoPlaying }) {
  const l = lang === 'zh' ? 0 : 1, [zoom, setZoom] = useState(1), [pan, setPan] = useState({ x: 0, y: 0 }), [video, setVideo] = useState(false), drag = useRef(null);
  const stage=useRef(null), pointers=useRef(new Map()), pinch=useRef(null), lastTap=useRef(null), touchZoomAt=useRef(0), [interacting,setInteracting]=useState(false);
  const index = Math.max(0, samples.findIndex(s => s.id === selected)), item = samples[index];
  const step = d => onChange(samples[(index + d + samples.length) % samples.length].id);
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); setVideo(false); onVideoPlaying(false); pointers.current.clear();pinch.current=null;drag.current=null;setInteracting(false); }, [selected]);
  useEffect(() => () => onVideoPlaying(false), []);
  useEffect(() => { const fn = e => { if (e.target.tagName === 'VIDEO' || video) return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, [selected, samples, video]);
  if (!item) return null;
  const bound=(value,z=zoom)=>{const rect=stage.current.getBoundingClientRect();return {x:Math.max(-rect.width*(z-1)/2,Math.min(rect.width*(z-1)/2,value.x)),y:Math.max(-rect.height*(z-1)/2,Math.min(rect.height*(z-1)/2,value.y))};};
  const pointerDown=e=>{if(video)return;e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});setInteracting(true);drag.current={x:e.clientX,y:e.clientY,pan,zoom,moved:false};if(pointers.current.size===2){const [a,b]=[...pointers.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};drag.current.moved=true;}};
  const pointerMove=e=>{if(!pointers.current.has(e.pointerId)||video)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===2&&pinch.current){const [a,b]=[...pointers.current.values()],z=Math.min(3,Math.max(1,pinch.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance));setZoom(z);setPan(p=>bound(p,z));return;}if(!drag.current)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;if(Math.hypot(dx,dy)>10)drag.current.moved=true;if(zoom>1)setPan(bound({x:drag.current.pan.x+dx,y:drag.current.pan.y+dy}));};
  const pointerUp=e=>{const d=drag.current;pointers.current.delete(e.pointerId);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(pointers.current.size===1&&pinch.current){const remaining=[...pointers.current.values()][0];drag.current={x:remaining.x,y:remaining.y,pan,zoom,moved:true};pinch.current=null;}if(!pointers.current.size){setInteracting(false);if(d&&!pinch.current){const dx=e.clientX-d.x;if(d.zoom===1&&d.moved&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(e.clientY-d.y)*1.4)step(dx<0?1:-1);else if(!d.moved&&e.pointerType==='touch'){const now=performance.now();if(lastTap.current&&now-lastTap.current.time<320&&Math.hypot(e.clientX-lastTap.current.x,e.clientY-lastTap.current.y)<25){setZoom(z=>z>1?1:2);setPan({x:0,y:0});touchZoomAt.current=now;lastTap.current=null;}else lastTap.current={time:now,x:e.clientX,y:e.clientY};}}drag.current=null;pinch.current=null;}};
  return <Modal onClose={onClose} title={item.name[l]} className="sample-viewer">
    <div ref={stage} className={`viewer-stage ${interacting?'is-interacting':''}`} onDoubleClick={() => { if(video||performance.now()-touchZoomAt.current<500)return;setZoom(z => z > 1 ? 1 : 2); setPan({ x: 0, y: 0 }); }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={e=>{pointers.current.delete(e.pointerId);drag.current=null;pinch.current=null;setInteracting(false);}}>
      {video && item.video ? <video src={item.video} controls muted autoPlay playsInline onPlay={() => onVideoPlaying(true)} onPause={() => onVideoPlaying(false)} onEnded={() => onVideoPlaying(false)} /> : <img src={asset(item.image)} alt={item.name[l]} draggable="false" style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }} />}
    </div>
    <div className="viewer-summary"><p className="eyebrow">{l === 0 ? '概念样品' : 'CONCEPT SAMPLE'} / {String(index + 1).padStart(2, '0')}</p><h2>{item.name[l]}</h2><p>{l === 0 ? '用于本轮视觉与交互演示，非实际在售产品。' : 'A visual and interaction study, not an actual product listing.'}</p>
      <div className="zoom-controls"><button className="icon-button" onClick={() => { setZoom(z => Math.max(1, z - .5)); setPan({ x: 0, y: 0 }); }} disabled={video || zoom <= 1} aria-label={l === 0 ? '缩小' : 'Zoom out'}><Minus /></button><span>{Math.round(zoom * 100)}%</span><button className="icon-button" onClick={() => setZoom(z => Math.min(3, z + .5))} disabled={video || zoom >= 3} aria-label={l === 0 ? '放大' : 'Zoom in'}><Plus /></button></div>
      {item.video && <button className="text-button" onClick={() => { setVideo(v => !v); onVideoPlaying(false); }}><Play />{l === 0 ? (video ? '返回图片' : '播放概念短片') : (video ? 'Back to image' : 'Play concept film')}</button>}
      <div className="viewer-pagination"><button className="icon-button" onClick={() => step(-1)} aria-label={l === 0 ? '上一个样品' : 'Previous sample'}><ArrowLeft /></button><span>{index + 1} / {samples.length}</span><button className="icon-button" onClick={() => step(1)} aria-label={l === 0 ? '下一个样品' : 'Next sample'}><ArrowRight /></button></div>
    </div>
  </Modal>;
}
export function Switcher({ onClose, onChoose, current, lang, sampleImages }) {
  const l = lang === 'zh' ? 0 : 1;
  return <Modal title={l===0?'选择展示方案':'Choose a direction'} className="switcher" onClose={onClose}><p className="eyebrow">PARAMONT / DIGITAL SHOWROOM</p><h2>{l===0?'三个世界，三种探索。':'Three worlds to explore.'}</h2><div className="variant-grid">{variants.map((v,i)=><button key={v.id} className={v.id===current?'selected':''} onClick={()=>onChoose(v.id)}><div className="variant-cover"><img src={asset(sampleImages[i])} alt=""/></div><div className="variant-info"><small>0{i+1}</small><h3>{v.name[l]}</h3><p>{v.label[l]}</p><ArrowRight size={22}/></div></button>)}</div></Modal>;
}
