import settings from './qualityConfig.js';

export const QUALITY_PRESETS = Object.freeze({
  fluid: {
    render: {maxPixels: 3100000, maxDpr: 1.5, msaa: 2, shadowMapSize: 1024, shadows: true, anisotropy: 4, ao: false, aoScale: .5, aoSamples: 8, bloom: .18, exposure: .96, environment: 1, transmissionScale: .5},
    model: {geometry: .8, surfaceDetail: false, surfaceStrength: .2, textureSize: 128, screenScale: 1, screenFps: 30, motionScale: 1},
  },
  exhibition: {
    render: {maxPixels: 8294400, maxDpr: 2, msaa: 4, shadowMapSize: 2048, shadows: true, anisotropy: 8, ao: true, aoScale: .6, aoSamples: 12, bloom: .22, exposure: .96, environment: 1, transmissionScale: .75},
    model: {geometry: 1.25, surfaceDetail: true, surfaceStrength: .25, textureSize: 256, screenScale: 1.5, screenFps: 60, motionScale: 1},
  },
  studio: {
    render: {maxPixels: 14745600, maxDpr: 2, msaa: 4, shadowMapSize: 4096, shadows: true, anisotropy: 16, ao: true, aoScale: .8, aoSamples: 16, bloom: .22, exposure: .96, environment: 1, transmissionScale: 1},
    model: {geometry: 1.75, surfaceDetail: true, surfaceStrength: .25, textureSize: 512, screenScale: 2, screenFps: 60, motionScale: 1},
  },
});
export const MODEL_IDS = Object.freeze(['monument','story','globe','samples','china','cambodia','usa','news','analytics','products','lipstick','serum','compact','rings','maraca','puzzle','balloon','gift']);
const productIds = new Set(MODEL_IDS.slice(10));
const renderRanges = {maxPixels:[1e6,16777216],maxDpr:[.75,3],msaa:[0,8],shadowMapSize:[512,4096],anisotropy:[1,16],aoScale:[.25,1],aoSamples:[4,32],bloom:[0,.5],exposure:[.6,1.4],environment:[.3,2],transmissionScale:[.25,1]};
const modelRanges = {geometry:[.5,2],surfaceStrength:[0,.6],textureSize:[64,512],screenScale:[.5,2],screenFps:[8,60],motionScale:[.25,1.5]};
const pow2 = n => 2 ** Math.floor(Math.log2(n));
function normalize(defaults, overrides, ranges, warnings, prefix) {
  const result = {...defaults};
  for (const [key,value] of Object.entries(overrides || {})) {
    if (!(key in defaults)) {warnings.push(`${prefix}.${key}: unknown option`);continue;}
    if (typeof defaults[key] === 'boolean') {
      if (typeof value === 'boolean') result[key] = value;
      else warnings.push(`${prefix}.${key}: expected boolean`);
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      const [min,max] = ranges[key];result[key] = Math.max(min,Math.min(max,value));
      if (result[key] !== value) warnings.push(`${prefix}.${key}: limited to ${result[key]}`);
    } else warnings.push(`${prefix}.${key}: expected finite number`);
  }
  return result;
}
export function resolveQuality(config=settings, requested) {
  const warnings=[];
  const preset=requested || config.preset || 'exhibition';
  const id=Object.hasOwn(QUALITY_PRESETS,preset)?preset:'exhibition';
  if (id!==preset) warnings.push(`Unknown quality preset: ${preset}`);
  const base=QUALITY_PRESETS[id];
  const render=normalize(base.render,config.render,renderRanges,warnings,'render');
  render.shadowMapSize=pow2(render.shadowMapSize);render.msaa=Math.floor(render.msaa);render.aoSamples=Math.round(render.aoSamples);
  const models={};
  for (const key of Object.keys(config.models||{})) if(!MODEL_IDS.includes(key)) warnings.push(`Unknown model: ${key}`);
  for (const key of MODEL_IDS) {
    const inherited=productIds.has(key)?config.models?.products:{};
    const value=normalize(base.model,{...inherited,...config.models?.[key]},modelRanges,warnings,key);
    value.textureSize=pow2(value.textureSize);models[key]=Object.freeze(value);
  }
  return Object.freeze({preset:id,render:Object.freeze(render),models:Object.freeze(models),warnings:Object.freeze(warnings)});
}
// Same-origin embedded modules inherit their owner's choice; no unvalidated messages.
export function requestedPreset(win=globalThis.window) {
  if(!win) return undefined;
  let search=win.location.search;
  try {if(win.parent!==win && win.parent.location.origin===win.location.origin) search=win.parent.location.search;} catch { /* Standalone/cross-origin owner: use own URL. */ }
  return new URLSearchParams(search).get('quality') || undefined;
}
let currentQuality;
export function getRenderQuality() {return currentQuality??=resolveQuality(settings,requestedPreset());}
export function modelDetail(id,quality=getRenderQuality()) {
  if(!quality.models[id]) throw new Error(`Unregistered quality model: ${id}`);
  const detail=quality.models[id];
  return {...detail,segment(base,kind='curve') {
    const limits=kind==='rounded'?[1,6]:kind==='bevel'?[1,8]:kind==='radial'?[4,32]:[8,256];
    return Math.max(limits[0],Math.min(limits[1],Math.round(base*detail.geometry)));
  }};
}
export function modelIdOf(object,fallback) {
  for(let o=object;o;o=o.parent) if(o.userData.qualityModel) return o.userData.qualityModel;
  return fallback;
}
export function pixelRatioFor(width,height,dpr,render,maxTextureSize=Infinity) {
  const w=Math.max(1,width),h=Math.max(1,height);
  return Math.min(Math.max(.1,dpr||1),render.maxDpr,Math.sqrt(render.maxPixels/(w*h)),maxTextureSize/w,maxTextureSize/h);
}
export function applyRendererQuality(renderer,THREE,quality=getRenderQuality()) {
  const q=quality.render,c=renderer.capabilities;
  renderer.toneMappingExposure=q.exposure;
  renderer.shadowMap.enabled=q.shadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.transmissionResolutionScale=q.transmissionScale;
  const applied={preset:quality.preset,shadowMapSize:Math.min(q.shadowMapSize,c.maxTextureSize),anisotropy:Math.min(q.anisotropy,c.getMaxAnisotropy()),msaa:Math.min(q.msaa,c.maxSamples),warnings:quality.warnings};
  renderer.domElement.dataset.quality=JSON.stringify(applied);
  if(quality.warnings.length) console.warn('[Showroom quality]',quality.warnings.join('; '));
  return applied;
}
export function tuneTextures(root,anisotropy) {
  const seen=new Set();root.traverse(o=>{
    const materials=Array.isArray(o.material)?o.material:[o.material];
    for(const m of materials) if(m) for(const value of Object.values(m)) if(value?.isTexture&&!seen.has(value)) {
      seen.add(value);if(!value.isVideoTexture&&value.anisotropy!==anisotropy){value.anisotropy=anisotropy;value.needsUpdate=true;}
    }
  });
}
