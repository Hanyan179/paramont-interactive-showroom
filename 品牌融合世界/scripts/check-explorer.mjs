import fs from 'node:fs';
import assert from 'node:assert/strict';
import {availableViews,presentation} from '../src/content.js';
const shared=new URL('../../共享数据/',import.meta.url);
const json=name=>JSON.parse(fs.readFileSync(new URL(name,shared)));
const media=json('explorer-media.json').items,items=json('concepts.json').items,official=json('official-content.json');
for(const item of items){const m=media[item.id];assert(m,item.id+' has media');assert(availableViews(m).length>0);for(const src of [...m.images.map(i=>i.src),m.video].filter(Boolean)){assert(!/^(https?:|\/)/.test(src),'portable local paths');assert(fs.existsSync(new URL('../public/'+src,import.meta.url)),src+' exists');}assert.equal(item.brandId,null,'No inferred brand-to-concept assignments');}
assert.deepEqual(availableViews(media.gift),['photos','video']);
assert.equal(presentation(media.gift,{mode:'model',photo:99}).mode,'photos');
assert.equal(presentation(media.gift,{mode:'model',photo:99}).photo,2);
assert.equal(presentation({images:[{src:'image.png'}]},{}).mode,'photos');
assert.equal(presentation({video:'movie.webm'},{}).mode,'video');
assert.deepEqual(presentation(media.lipstick,{mode:'photos',photo:2,transforms:{2:{scale:2,x:30,y:0}}}).transforms,{2:{scale:2,x:30,y:0}});
for(const b of official.brands){assert(b.parent&&b.source_url);assert(fs.existsSync(new URL('brand/'+b.logo.split('/').at(-1),shared)));}
console.log('Explorer verified: media fallbacks, image-only entry, portable assets, preserved image state and source boundaries.');
