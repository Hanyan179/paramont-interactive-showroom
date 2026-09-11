import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=async file=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const content=await read('public/data/showroom.json'), catalog=await read('public/data/catalog.json');
const unique=(rows,name)=>assert.equal(new Set(rows.map(r=>r.id)).size,rows.length,`${name}: duplicate identifiers`);
const media=async url=>{assert(!/^https?:/.test(url),`External media dependency: ${url}`);await access(path.join(root,'public',url));};
for(const [name,rows] of Object.entries({brands:content.brands,samples:content.samples,locations:content.locations,categories:catalog.categories,subcategories:catalog.subcategories,archive:catalog.brands}))unique(rows,name);
for(const sample of content.samples){assert(content.brands.some(b=>b.id===sample.brand),`Unknown sample brand: ${sample.id}`);assert(content.categories.some(c=>c.id===sample.category),`Unknown sample category: ${sample.id}`);assert.equal(sample.name.length,2);await media('/media/generated/'+sample.image);if(sample.video)await media(sample.video);}
for(const brand of content.brands){assert.equal(brand.descriptor.length,2);assert.equal(brand.description.length,2);await media('/media/brand/'+brand.logo);await media('/media/generated/'+brand.image);}
for(const loc of content.locations){assert(loc.lat>=-90&&loc.lat<=90);assert(loc.lng>=-180&&loc.lng<=180);for(const image of loc.media||[])await media(image.src);}
for(const sub of catalog.subcategories)assert(catalog.categories.some(c=>c.id===sub.parent),`Missing category parent: ${sub.id}`);
assert(catalog.brands.every(b=>b.sourceRow>1));assert(!catalog.brands.some(b=>b.owner||b.categories),'Do not infer ownership or category mappings from the archive');
assert(content.settings.idleSeconds>=90);
await media('/media/generated/concept-factory-campus.png');
const model=await read('public/media/models/mountainside/scene.gltf');
for(const record of [...model.buffers,...model.images])if(record.uri)await media('/media/models/mountainside/'+record.uri);
console.log(JSON.stringify({result:'passed',brands:catalog.brands.length,undefinedRecords:catalog.brands.filter(b=>b.undefined).length,categories:catalog.categories.length,subcategories:catalog.subcategories.length,conceptSamples:content.samples.length,checks:['unique identifiers','category parent links','sample relationships','bilingual display copy','local media files','model dependencies','location coordinates','source row provenance','no inferred ownership or brand-category mapping']},null,2));
