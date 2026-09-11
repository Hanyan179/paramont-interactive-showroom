import fs from 'node:fs';
import assert from 'node:assert/strict';
const load=n=>JSON.parse(fs.readFileSync(new URL('../../共享数据/'+n,import.meta.url)));
const c=load('catalog.json'),d=load('domains.json'),p=load('concepts.json');
assert.equal(c.brands.length,67);assert.equal(c.categories.length,18);assert.equal(c.subcategories.length,327);
for(const domain of d.domains)assert(c.categories.some(x=>x.id===domain.categoryId));
for(const item of p.items){const domain=d.domains.find(x=>x.id===item.domain);assert(domain);assert(c.subcategories.some(x=>x.id===item.subcategoryId&&x.parent===domain.categoryId),item.id+' category');assert.equal(item.concept,true);assert.equal(item.brandId,null);}
assert.equal(new Set(p.items.map(x=>x.id)).size,p.items.length);
console.log('Shared source verified: 67 brand records, 18 categories, 327 subcategories, '+p.items.length+' explicitly labelled concepts.');
