import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {readingEstimate,isLocationDetailActive,isReaderActive,safeDocumentURL,documentPictures,sectionBlocks} from '../src/documents/reading.js';
import {analysisDocument,companyDocument,locationDocument,productDocument} from '../src/documents/content.js';
import {createExhibitionDirector} from '../src/exhibitionDirector.js';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));

test('reading estimate counts only the chosen language, including image viewing time',()=>{
  const doc={sections:[{paragraphs:[['中'.repeat(400),'word '.repeat(400)]],images:Array.from({length:6},()=>({caption:''}))}]};
  assert.deepEqual(readingEstimate(doc,'zh'),{minutes:2,images:6});
  assert.deepEqual(readingEstimate(doc,'en'),{minutes:3,images:6});
  assert.equal(readingEstimate({sections:[]}).minutes,1);
});
test('factory detail and documents cannot leak into another route even with retained state',()=>{
  const route={variant:'atlas',page:'locations'},reader={owner:'atlas/locations'};
  assert.equal(isLocationDetailActive(route,true),true);assert.equal(isReaderActive(route,reader),true);
  for(const page of ['home','analytics','products','brands']){
    assert.equal(isLocationDetailActive({...route,page},true),false);
    assert.equal(isReaderActive({...route,page},reader),false);
  }
  assert.equal(isLocationDetailActive({variant:'studio',page:'locations'},true),false);
});
test('inline images and albums preserve content order and count toward reading time',()=>{
  const doc={sections:[{blocks:[{type:'paragraph',text:['中'.repeat(400),'word '.repeat(200)]},{type:'image',src:'/one.png'},{type:'paragraph',text:['后文','After']},{type:'gallery',images:[{src:'/two.png'},{src:'/three.png'}]}]}]};
  assert.deepEqual(sectionBlocks(doc.sections[0]).map(b=>b.type),['paragraph','image','paragraph','gallery']);
  assert.deepEqual(documentPictures(doc).map(i=>i.src),['/one.png','/two.png','/three.png']);
  assert.equal(readingEstimate(doc).images,3);assert.equal(readingEstimate(doc).minutes,2);
});
test('reading prevents idle presentation, and closing starts a fresh 90-second interval',()=>{
  let time=0;const director=createExhibitionDirector({now:()=>time});
  time=88000;director.tick();
  for(let i=0;i<600;i++){time+=1000;director.tick({blocked:true});}
  assert.equal(director.state.active,false);
  time+=89999;director.tick();assert.equal(director.state.active,false);
  time+=1;director.tick();assert.equal(director.state.active,true);
});
test('document files allow local and web sources but never executable URLs',()=>{
  for(const input of ['javascript:alert(1)','data:text/html,test','//outside.test/a','/\\outside.test','file:///tmp/a',''])assert.equal(safeDocumentURL(input),null);
  assert.equal(safeDocumentURL('/documents/a.pdf'),'/documents/a.pdf');
  assert.equal(safeDocumentURL('https://example.com/a.pdf'),'https://example.com/a.pdf');
});
test('four area documents retain provenance and use existing, nonempty bilingual content',()=>{
  const official=json('../public/data/official-content.json'),locations=json('../public/data/showroom.json').locations;
  const concepts=json('../../共享数据/concepts.json'),skus=json('../../共享数据/product-skus.json'),media=json('../../共享数据/explorer-media.json');
  const docs=[companyDocument(official),...Array.from({length:4},(_,i)=>analysisDocument(i)),...locations.map(l=>locationDocument(l,'overview')),...concepts.items.map(p=>productDocument(p,skus.items.find(s=>s.productId===p.id),media.items[p.id]))];
  for(const doc of docs){assert.ok(doc.id);assert.ok(doc.sections.length);assert.ok(doc.sources.length);assert.ok(doc.status[0]&&doc.status[1]);
    const images=documentPictures(doc);
    for(const image of images)assert.ok(existsSync(new URL('../public'+image.src,import.meta.url)),image.src);
    for(const lang of ['zh','en'])assert.ok(readingEstimate(doc,lang).minutes>=1);
  }
  assert.equal(productDocument(null),null);assert.equal(analysisDocument(20),null);
});
