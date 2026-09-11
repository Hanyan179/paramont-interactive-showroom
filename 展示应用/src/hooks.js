import { resolveRoute } from './config/areas.js';
import { useEffect, useRef, useState } from 'react';

export function useRoute() {
  const read = () => resolveRoute(location.hash);
  const [route, setRoute] = useState(read);
  useEffect(() => { const update = () => setRoute(read()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  return [route, (variant, page = 'home') => { location.hash = `/${variant}/${page}`; setRoute(read()); }];
}

export function useDialog(ref, onClose, enabled=true) {
  const close=useRef(onClose);close.current=onClose;
  useEffect(() => {
    if(!enabled)return;
    const previous = document.activeElement;
    const target = ref.current;
    const focusables = () => [...target.querySelectorAll('button:not([disabled]),a[href],video,input,select,summary,[tabindex="0"]')].filter(el=>el.getClientRects().length);
    focusables()[0]?.focus();
    const handler = e => {
      if (e.key === 'Escape' && !document.fullscreenElement) { e.preventDefault(); e.stopPropagation(); close.current(); }
      if (e.key === 'Tab') {
        const els = focusables(); if (!els.length) return;
        const first = els[0], last = els.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    target.addEventListener('keydown', handler);
    return () => { target.removeEventListener('keydown', handler); previous?.focus?.(); };
  }, [enabled]);
}
