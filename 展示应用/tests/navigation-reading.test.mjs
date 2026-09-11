import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sceneNavigation} from '../src/config/navigation.js';
import {resolveExplorerView,sectionForView} from '../../共享组件/explorerViews.js';
import {captureReadingAnchor,restoreReadingAnchor} from '../src/documents/reading.js';
import {companyStoryDocument} from '../src/documents/content.js';

test('sample room and product directory share a public area without sharing navigation intent',()=>{
  assert.equal(sectionForView('room'),'products');
  assert.equal(sectionForView('products'),'products');
  assert.equal(resolveExplorerView('products','room'),'room');
  assert.equal(resolveExplorerView('products','products'),'products');
  assert.equal(resolveExplorerView('brands','products'),'brands');
  assert.equal(resolveExplorerView('products'),'room');
  const navigation=sceneNavigation({page:'products',explorerView:'products'});
  assert.equal(navigation.active,'products');
  assert.deepEqual(navigation.items.map(x=>x.id),['room','brands','categories','products']);
});
test('the single scene bar replaces regions with their own capability chapters',()=>{
  const options={page:'locations',locations:[{id:'china',name:['中国','China']}],selectedLocation:'china',locationRevealed:true,profile:{chapters:[{id:'research',name:['创研','Research']}]} ,capability:'research'};
  assert.equal(sceneNavigation(options).active,'china');
  const inside=sceneNavigation({...options,locationActive:true});
  assert.equal(inside.active,'research');assert.deepEqual(inside.items.map(x=>x.id),['research']);
});
test('language and text size changes restore the same section and its relative reading point',()=>{
  const zh=[{id:'first',top:200},{id:'second',top:600},{id:'third',top:1000}];
  const en=[{id:'first',top:300},{id:'second',top:1000},{id:'third',top:1800}];
  const anchor=captureReadingAnchor(800,zh,1600);
  assert.deepEqual(anchor,{sectionId:'second',fraction:.5});
  assert.equal(restoreReadingAnchor(anchor,en,2600,2200),1400);
  assert.equal(restoreReadingAnchor(captureReadingAnchor(1400,en,2600),zh,1600,1300),800);
  assert.equal(restoreReadingAnchor({sectionId:'third',fraction:1},zh,1600,1100),1100);
  assert.equal(restoreReadingAnchor(captureReadingAnchor(0,zh,1600),en,2600,2200),0);
});
test('company chapter documents have distinct identities, sources and matching bilingual sections',()=>{
  const official=JSON.parse(readFileSync(new URL('../public/data/official-content.json',import.meta.url)));
  const network=companyStoryDocument(official,2),history=companyStoryDocument(official,3),profile=companyStoryDocument(official,1);
  assert.equal(new Set([network.id,history.id,profile.id]).size,3);
  assert.equal(network.sections[0].id,'company-0');assert.equal(history.sections[0].id,'year-0');
  assert.equal(network.sections.length,official.company_groups.length);assert.equal(history.sections.length,official.history.length);
  for(const doc of [network,history])for(const section of doc.sections)assert.ok(section.paragraphs[0][0]&&section.paragraphs[0][1]);
  assert.ok(network.sources[0].url.endsWith('/OurCompanies'));
  assert.ok(history.sources[0].url.endsWith('/ParmontHistory'));
});
