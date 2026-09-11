import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {skusFor,resolveSku,productResults} from '../src/product-data.js';
import {availableViews,presentation} from '../src/content.js';
const shared=new URL('../../共享数据/',import.meta.url),read=n=>JSON.parse(fs.readFileSync(new URL(n,shared)));
const data={catalog:read('catalog.json'),items:read('concepts.json').items,skus:read('product-skus.json').items,brands:read('official-content.json').brands};
test('each concept style has one existing product and distinct local media',()=>{
 assert.equal(new Set(data.skus.map(s=>s.id)).size,data.skus.length);
 assert.equal(new Set(data.skus.map(s=>s.code)).size,data.skus.length);
 for(const sku of data.skus){assert(data.items.some(p=>p.id===sku.productId));assert(sku.concept);assert.match(sku.code,/^STUDY-/);assert(sku.colors.length);for(const src of [...sku.media.images.map(i=>i.src),sku.media.video]){assert(!/^(https?:|\/)/.test(src));assert(fs.statSync(new URL('../public/'+src,import.meta.url)).size>1000);}}
 for(const product of data.items){assert(skusFor(data,product.id).length>0);assert.equal(product.brandId,null);}
});
test('a foreign or invalid style cannot be selected under another product',()=>{
 assert.equal(resolveSku(data,'rings','gift-02').id,'rings-01');assert.equal(resolveSku(data,'rings','rings-03').id,'rings-03');assert.equal(resolveSku(data,'missing','rings-01'),null);
});
test('a style code finds its parent product and selects the exact style',()=>{
 const result=productResults(data,{query:' study-rg-02 '});assert.equal(result.length,1);assert.equal(result[0].product.id,'rings');assert.equal(result[0].sku.id,'rings-02');assert.equal(result[0].count,3);
 assert.equal(productResults(data,{query:'study-rg-02',categoryId:'15'}).length,0);
 assert.equal(productResults(data,{query:'美妆'}).length,3);
 assert.equal(productResults(data,{categoryId:'13',subcategoryId:'266'})[0].product.id,'rings');
 assert.equal(productResults(data,{brandId:'yay-hooray'}).length,0);
});
test('image-only styles never expose a model and preserve independent image transforms',()=>{
 for(const sku of skusFor(data,'gift'))assert.deepEqual(availableViews(sku.media),['photos','video']);
 const saved={mode:'photos',photo:2,transforms:{2:{scale:1.8,x:30,y:10}}};assert.deepEqual(presentation(resolveSku(data,'rings','rings-02').media,saved),saved);assert.equal(presentation(resolveSku(data,'rings','rings-03').media).photo,0);
});
