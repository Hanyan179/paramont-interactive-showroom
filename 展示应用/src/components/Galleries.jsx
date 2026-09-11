import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { asset } from '../content';

export function BrandCarousel({ brands, active, onActive, onEnter, lang, home = false }) {
  const drag = useRef(null), [offset, setOffset] = useState(0), wheelTime = useRef(0);
  const l = lang === 'zh' ? 0 : 1;
  const step = delta => onActive((active + delta + brands.length) % brands.length);
  const down = e => { if(e.isPrimary===false)return;drag.current = { x: e.clientX, moved: false, started:performance.now() }; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.classList.add('is-dragging'); };
  const move = e => { if (!drag.current) return; const dx = e.clientX - drag.current.x; setOffset(dx * .5); if (Math.abs(dx) > 12) drag.current.moved = true; };
  const up = e => { if (!drag.current) return; const dx = e.clientX - drag.current.x,velocity=Math.abs(dx)/(performance.now()-drag.current.started); if (Math.abs(dx) > 45 || (Math.abs(dx)>18&&velocity>.4)) step(dx < 0 ? 1 : -1); else if (!drag.current.moved) { const button = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-brand-index]'); if (button) { const i = Number(button.dataset.brandIndex); i === active ? onEnter(brands[i]) : onActive(i); } } drag.current = null; e.currentTarget.classList.remove('is-dragging'); setOffset(0); };
  return <section className={`brand-gallery ${home ? 'home-gallery' : ''}`} style={{ '--mood': brands[active].color }} aria-label={l === 0 ? '可拖动品牌画廊' : 'Draggable brand gallery'}>
    <div className="gallery-atmosphere" />
    <div className="brand-orbit" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={e => { drag.current = null; setOffset(0); e.currentTarget.classList.remove('is-dragging'); }} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}}} onWheel={e => { if (Date.now() - wheelTime.current > 650 && Math.abs(e.deltaY + e.deltaX) > 15) { step(e.deltaY + e.deltaX > 0 ? 1 : -1); wheelTime.current = Date.now(); } }}>
      {brands.map((brand, i) => {
        let d = i - active; if (d > brands.length / 2) d -= brands.length; if (d < -brands.length / 2) d += brands.length;
        if(Math.abs(d)>2)return null;
        return <button key={brand.id} data-brand-index={i} className={`brand-plane ${d === 0 ? 'active' : ''}`} style={{ '--d': d, '--drag': `${offset}px`, zIndex: 10 - Math.abs(d) }} onClick={e=>{if(e.detail===0)i===active?onEnter(brand):onActive(i);}} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); i === active ? onEnter(brand) : onActive(i); } }} aria-label={`${brand.name} · ${l === 0 ? (d===0?(home?'探索品类':'进入品牌'):'选中品牌') : (d===0?(home?'Explore categories':'Open brand'):'Select brand')}`} aria-current={d === 0 ? 'true' : undefined}>
          <img className="brand-art" src={asset(brand.image)} alt="" draggable="false" />
          <span className="brand-topline"><span>WEVEEL</span><span>{String(i + 1).padStart(2, '0')}</span></span>
          <span className="brand-title"><img src={`/media/brand/${brand.logo}`} alt={brand.name} /><small>{brand.descriptor[l]}</small></span>
          <span className="brand-enter"><span>{l === 0 ? (home?'探索品类':'探索品牌') : (home?'Explore categories':'Discover brand')}</span><ArrowUpRight size={24} /></span>
        </button>;
      })}
    </div>
    <div className="carousel-controls"><button className="icon-button" onClick={() => step(-1)} aria-label={l === 0 ? '上一个品牌' : 'Previous brand'}><ArrowLeft /></button><span>{String(active + 1).padStart(2, '0')} <i>/</i> {String(brands.length).padStart(2, '0')}</span><button className="icon-button" onClick={() => step(1)} aria-label={l === 0 ? '下一个品牌' : 'Next brand'}><ArrowRight /></button></div>
  </section>;
}

export function SampleWall({ samples, onSelect, lang, savedPosition }) {
  const [rotation, setRotation] = useState(savedPosition.current || { x: 0, y: 0 });
  const drag = useRef(null), l = lang === 'zh' ? 0 : 1;
  useEffect(() => { savedPosition.current = rotation; }, [rotation]);
  const up = e => { if (!drag.current) return; if (!drag.current.moved) { const card = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-sample]'); if (card) onSelect(card.dataset.sample); } drag.current = null; };
  return <section className="sample-wall" aria-label={l === 0 ? '样品空间' : 'Sample space'} data-testid="sample-wall"
    onPointerDown={e => { drag.current = { x: e.clientX, y: e.clientY, origin: rotation, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (!drag.current) return; const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y; if (Math.hypot(dx, dy) > 8) drag.current.moved = true; setRotation({ x: Math.max(-15, Math.min(15, drag.current.origin.x - dy * .045)), y: Math.max(-22, Math.min(22, drag.current.origin.y + dx * .05)) }); }} onPointerUp={up} onPointerCancel={() => drag.current = null}>
    <div className={`sample-spatial-grid count-${samples.length}`} style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
      {samples.map((sample, i) => <button key={sample.id} data-sample={sample.id} className="sample-object" style={{ '--lift': `${[20, 85, 10, 55, 0, 75][i % 6]}px` }} onClick={e=>{if(e.detail===0)onSelect(sample.id);}} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(sample.id); } }} aria-label={`${sample.name[l]} · ${l === 0 ? '放大查看' : 'View details'}`}>
        <img src={asset(sample.image)} alt={sample.name[l]} draggable="false" /><span><small>{String(i + 1).padStart(2, '0')}</small>{sample.name[l]}<ArrowUpRight size={18} /></span>
      </button>)}
    </div>
    {!samples.length && <div className="empty-state">{l === 0 ? '这个分类的样品稍后补充' : 'Samples for this category will be added soon'}</div>}
  </section>;
}
