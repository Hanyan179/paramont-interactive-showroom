export const localText = (value, lang = 'zh') => {
  if (Array.isArray(value)) return value[lang === 'zh' ? 0 : 1] || value[0] || '';
  if (value && typeof value === 'object') return value[lang] || value.zh || value.en || '';
  return typeof value === 'string' ? value : '';
};

export function sectionBlocks(section) {
  if (Array.isArray(section.blocks)) return section.blocks;
  return [...(section.paragraphs || []).map(text=>({type:'paragraph',text})),
    ...(section.items?.length?[{type:'list',items:section.items}]:[]),
    ...(section.images?.length?[{type:'gallery',images:section.images}]:[])];
}
export function documentPictures(document) {
  return [document.cover,...(document.sections||[]).flatMap(section=>sectionBlocks(section).flatMap(block=>block.type==='image'?[block]:block.type==='gallery'?block.images||[]:[]))].filter(Boolean);
}
// An editorial estimate, never a deadline or a timer that closes the document.
export function readingEstimate(document, lang = 'zh') {
  const sections = document.sections || [];
  const text = [document.title, document.summary, ...sections.flatMap(s => [s.title,...sectionBlocks(s).flatMap(b=>b.type==='paragraph'?[b.text]:b.type==='list'?b.items||[]:[])]),...documentPictures(document).map(i=>i.caption)].map(v => localText(v, lang)).join(' ');
  const characters = (text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
  const words = (text.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, ' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length;
  const images = documentPictures(document).length;
  return { minutes: Math.max(1, Math.ceil(characters / 400 + words / 200 + images / 6)), images };
}

export const routeKey = route => `${route.variant}/${route.page}`;
export const isLocationDetailActive = (route, open) => route.variant === 'atlas' && route.page === 'locations' && open === true;
export const isReaderActive = (route, reader) => !!reader && reader.owner === routeKey(route);

// Keep a semantic reading position when translated text has a different height.
export function captureReadingAnchor(top,sections,end) {
  const section=sections.findLast(item=>item.top<=top+24);
  const start=section?.top||0,next=sections.find(item=>item.top>(section?.top??-1));
  const span=Math.max(1,(next?.top??end)-start);
  return {sectionId:section?.id??null,fraction:Math.max(0,Math.min(1,(top-start)/span))};
}
export function restoreReadingAnchor(anchor,sections,end,max) {
  const section=sections.find(item=>item.id===anchor?.sectionId);
  const start=section?.top||0,next=sections.find(item=>item.top>(section?.top??-1));
  return Math.max(0,Math.min(max,start+Math.max(0,(next?.top??end)-start)*(anchor?.fraction||0)));
}

// Content is local, but file links can be supplied later. Never execute a URL as code.
export function safeDocumentURL(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const url = value.trim();
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url;
  try { const parsed = new URL(url); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null; } catch { return null; }
}
