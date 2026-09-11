import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {study,paths,studyStages,initialStudySelection,studySelection,linkedStudyProduct,studyDocument,presentedStudySelection} from '../src/analytics/caseStudy.js';
import {graphLayout,graphNodeActive} from '../src/analytics/graph.js';
import {resolveExplorerTarget} from '../../共享组件/explorerTarget.js';
import {createExhibitionDirector} from '../src/exhibitionDirector.js';
import {exhibitionShots} from '../src/config/presentation.js';
const json=name=>JSON.parse(readFileSync(new URL(`../public/modules/product-explorer/shared/${name}.json`,import.meta.url)));
const records={concepts:json('concepts'),skus:json('product-skus')};

test('all study paths have traceable local illustrations and bilingual, non-quantitative relationships',()=>{
 for(const p of paths){assert.ok(existsSync(new URL('../public'+p.image,import.meta.url)));assert.equal(p.matrix.length,3);assert.equal(p.notes.length,3);for(const field of ['theme','question','finding','reason','review'])assert.ok(p[field][0]&&p[field][1]);}
 for(const stage of [0,2]){const graph=graphLayout(stage);const ids=new Set(graph.nodes.map(n=>n.id));for(const link of graph.links){const [a,b]=link.id.split('/');assert.ok(ids.has(a)&&ids.has(b));assert.ok(paths.some(p=>p.id===link.path));assert.equal('weight' in link,false);}assert.ok(graph.links.length>paths.length);}
 const graph=graphLayout(2),source=graph.nodes.find(n=>n.id==='source-discover');assert.equal(graphNodeActive(graph,source,'together'),true);assert.equal(graphNodeActive(graph,source,'portable'),false);
});
test('study selection keeps market and design lens while changing phases, and refuses invalid comparisons',()=>{
 const start=studySelection(initialStudySelection,{path:'discover',market:'eu',lens:2,compare:'together'});
 const review=studySelection(start,{node:'review'});assert.equal(review.market,'eu');assert.equal(review.lens,2);assert.equal(review.path,'discover');
 const another=studySelection(review,{path:'together'});assert.equal(another.compare,null);assert.equal(another.market,'eu');
 assert.equal(studySelection(start,{market:'made-up'}).market,'all');assert.equal(studySelection(start,{path:'missing'}).path,null);
 assert.deepEqual(initialStudySelection,{path:null,market:'all',lens:0,compare:null,node:'theme'});
});
test('linked concepts resolve exact products and styles; missing records never open unrelated samples',()=>{
 for(const p of paths){const target=linkedStudyProduct(p,records);if(!p.productId){assert.equal(target,null);continue;}assert.deepEqual(target,{productId:p.productId,skuId:p.skuId});const view=resolveExplorerTarget({section:'products',view:'room',...target},records.concepts.items,records.skus.items);assert.equal(view.product,p.productId);assert.equal(view.sku,p.skuId);assert.equal(view.domain,'play');}
 assert.equal(resolveExplorerTarget({section:'products',view:'room',productId:'rings',skuId:'puzzle-01'},records.concepts.items,records.skus.items),null);
 assert.equal(resolveExplorerTarget({section:'products',view:'room',productId:'unknown'},records.concepts.items,records.skus.items),null);
 assert.equal(linkedStudyProduct(paths[0],null),null);
});
test('selected evidence keeps its own question, planned market and explicit verification boundary',()=>{
 for(const p of paths)for(const market of study.markets){const doc=studyDocument({...initialStudySelection,path:p.id,market:market.id});assert.deepEqual(doc.title,p.direction);assert.ok(doc.id.includes(p.id)&&doc.id.endsWith(market.id));assert.deepEqual(doc.sections.map(s=>s.id),['source','interpretation','reasoning','review']);assert.ok(doc.sections[0].paragraphs[2][1].includes(market.label[1]));assert.ok(doc.sections[2].paragraphs[1][1].includes('without a live model run'));assert.ok(!doc.updated);}
 assert.equal(studyDocument(initialStudySelection),null);
});
test('global tour tells one coherent study and restores the visitor selection without mutating it',()=>{
 let time=0,selection=studySelection(initialStudySelection,{path:'portable',market:'au',lens:2,compare:'together'}),saved=null,seen=[];
 const before=structuredClone(selection);
 const director=createExhibitionDirector({now:()=>time,onStart:()=>{saved=selection;},onShot:shot=>{if(shot.page==='analytics'){selection=presentedStudySelection(shot.stage);seen.push({stage:shot.stage,path:selection.path});}},onStop:()=>{selection=saved;}});
 director.start();for(const shot of exhibitionShots.slice(0,-1)){time+=shot.seconds*1000;director.tick();}
 assert.deepEqual(seen.map(s=>s.stage),studyStages.map((_,i)=>i));assert.deepEqual([...new Set(seen.map(s=>s.path))],['discover']);
 director.activity();assert.deepEqual(selection,before);assert.deepEqual(saved,before);
});
