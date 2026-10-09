import {isStandaloneAdvertising} from './advertising-standalone.js';
import { useEffect, useState } from 'react';

export const previewChannel = 'dsr-advertising-preview';
export function validAdvertisingSnapshot(snapshot) {
  return snapshot?.schemaVersion === 1 && ['pdm','mock'].includes(snapshot.source) &&
    ['documents','brands','categories','productsData','assets'].every(key => Array.isArray(snapshot[key]));
}
export function publicAssetUrl(id) { return id ? `/api/sampleAdvertisingPublic:asset?id=${encodeURIComponent(id)}` : null; }
export function useAdvertising() {
  const isPreview = new URLSearchParams(location.search).get('advertisingPreview') === '1';
  const [state, setState] = useState({ loading: true, snapshot: null, assetUrls: {}, revision: null, error: '', legacy: false });
  useEffect(() => {
    let active = true;
    if (isStandaloneAdvertising() && !isPreview) { setState({ loading: false, snapshot: null, assetUrls: {}, revision: null, error: '', legacy: true }); return; }
    if (isPreview) {
      const receive = event => {
        if (event.origin !== location.origin || event.source !== window.parent || window.parent === window || event.data?.channel !== previewChannel || event.data.version !== 1 || !validAdvertisingSnapshot(event.data.snapshot)) return;
        // Only sanitized exhibition data and temporary media blobs cross this channel, never login credentials.
        const assetUrls = Object.fromEntries(Object.entries(event.data.assetUrls || {}).filter(([id,url]) => event.data.snapshot.assets.some(a => a.id === id) && typeof url === 'string' && url.startsWith(`blob:${location.origin}/`)));
        setState({ loading: false, snapshot: event.data.snapshot, assetUrls, revision: 'preview', error: '', legacy: false });
      };
      window.addEventListener('message', receive);
      window.parent.postMessage({ channel: 'dsr-advertising-preview-ready', version: 1 }, location.origin);
      return () => window.removeEventListener('message', receive);
    }
    async function load() {
      try {
        const response = await fetch('/api/sampleAdvertisingPublic:get', { credentials: 'omit', cache: 'no-store' });
        // Online mode never substitutes the offline archive when publication is unavailable.
        if (response.status === 404) throw Error('No published content');
        if (!response.ok) throw Error('published content unavailable');
        const body = await response.json(), data = body.data || body;
        if (!validAdvertisingSnapshot(data.snapshot)) throw Error('invalid published content');
        if (active) setState({ loading: false, snapshot: data.snapshot, assetUrls: Object.fromEntries(data.snapshot.assets.map(a => [a.id, publicAssetUrl(a.id)])), revision: data.id, error: '', legacy: false });
      } catch { if (active) setState({ loading: false, snapshot: null, assetUrls: {}, revision: null, error: 'Published content unavailable', legacy: false }); }
    }
    load(); return () => { active = false; };
  }, [isPreview]);
  return { ...state, isPreview };
}
const pair = value => [value?.zh || '', value?.en || ''];
export function advertisingDocuments(snapshot, urls) {
  return Object.fromEntries(snapshot.documents.map(doc => [doc.id, {
    id: doc.id, title: pair(doc.title), summary: pair(doc.summary), updated: doc.source.date,
    status: ['已发布展示资料','Published exhibition content'],
    cover: doc.coverAssetId ? { src: urls[doc.coverAssetId], caption: pair(doc.title) } : undefined,
    sections: doc.sections.map(section => ({ id: section.id, title: pair(section.title), blocks: [
      { type: 'paragraph', text: pair(section.text) },
      ...(section.imageAssetId ? [{ type: 'image', src: urls[section.imageAssetId], caption: pair(section.title) }] : []),
    ] })),
    sources: [{ label: [doc.source.label,doc.source.label], description: [doc.source.date,doc.source.date] }],
    attachments: doc.attachments.map(a => ({ title: pair(a.title), format: snapshot.assets.find(asset => asset.id === a.assetId)?.contentType === 'application/pdf' ? 'PDF' : 'IMAGE', url: urls[a.assetId] })),
  }]));
}
export function advertisingBrands(snapshot, urls) {
  return snapshot.brands.map(brand => ({ id: brand.sourceId, name: brand.name, logoUrl: urls[brand.logoAssetId], descriptor: pair(brand.description), description: pair(brand.description), ownership: 'upstream-brand' }));
}
