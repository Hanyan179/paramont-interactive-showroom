import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {distributionRegions,distributionLinks,footprintCountries,footprintScene,footprintKind} from '../src/impact/distributionContent.js';

const data=JSON.parse(await readFile(new URL('../public/data/business-footprint.json',import.meta.url),'utf8'));
const country=code=>data.countries.find(item=>item.code===code);

test('real country aggregates reconcile every source row, including blank countries',()=>{
  for(const [key,total,located,missing,coverage] of [['customers',983,947,36,59],['suppliers',6421,6323,98,22]]){
    const source=data.sources[key],shown=footprintCountries(data,key);
    assert.equal(source.totalRecords,total);assert.equal(source.locatedRecords,located);assert.equal(source.missingCountryRecords,missing);
    assert.equal(source.countryCount,coverage);assert.equal(shown.length,coverage);
    assert.equal(data.countries.reduce((sum,country)=>sum+country[key],0),located);
    assert.equal(located+missing,total);
    assert.equal(Object.values(source.rawCountryCodes).reduce((sum,value)=>sum+value,0),total);
    assert.ok(shown.every(item=>Number.isInteger(item[key])&&item[key]>0));
  }
  assert.equal(data.countries.length,65);assert.equal(new Set(data.countries.map(item=>item.code)).size,65);
  assert.equal(data.reportingPeriod,null,'the spreadsheets do not provide a reporting period or active status');
});

test('country codes, not names, drive geographic coverage and alias normalization',()=>{
  assert.equal(country('GB').customers,23);assert.equal(country('GB').suppliers,5);
  assert.equal(data.sources.customers.rawCountryCodes.UK,17);assert.equal(data.sources.customers.rawCountryCodes.GB,6);
  assert.equal(country('UK'),undefined);assert.deepEqual(footprintCountries(data,'all',' UK ').map(item=>item.code),['GB']);
  assert.equal(country('PA').customers,1);assert.deepEqual(country('PA').name,['巴拿马','Panama']);
  assert.equal(country('PA').mapId,'591');
  assert.equal(country('VN').suppliers,65);assert.equal(country('KH').suppliers,35);
  assert.deepEqual(footprintCountries(data,'suppliers','越南').map(item=>item.code),['VN']);
  assert.deepEqual(footprintCountries(data,'customers','Kyrgyzstan'),[]);
  assert.deepEqual(footprintCountries(data,'all','not-a-country'),[]);
});

test('European suppliers and other coverage points never become company factories or fallback models',()=>{
  assert.equal(footprintScene(country('CN')),'china');assert.equal(footprintScene(country('US')),'usa');assert.equal(footprintScene(country('KH')),'cambodia');
  for(const item of data.countries.filter(item=>!['CN','US','KH'].includes(item.code)))assert.equal(footprintScene(item),null);
  assert.equal(footprintScene(null),null);assert.ok(country('DE').suppliers>0);assert.equal(footprintScene(country('DE')),null);
  assert.equal(footprintKind(country('GB'),'all'),'both');assert.equal(footprintKind(country('CA'),'all'),'customers');assert.equal(footprintKind(country('IT'),'all'),'suppliers');
  assert.equal(footprintKind(country('GB'),'suppliers'),'suppliers');
});

test('Vietnam is a featured supply partner without borrowing another country factory scene',()=>{
  const vietnam=distributionRegions.find(region=>region.countryCode===country('VN').mapId);
  assert.ok(vietnam);assert.equal(vietnam.name[0],'越南');
  assert.equal(vietnam.sceneId,null);assert.equal(footprintScene(country('VN')),null);
  assert.ok(distributionLinks.some(([from,to])=>from==='china'&&to===vietnam.id));
  assert.equal(country('VN').suppliers,65);
});

test('oblique map keeps all coverage points visible and regional entrances on their country anchors',async()=>{
  const {mapLayout}=await import('../src/impact/distributionLayout.js');
  for(const [width,height] of [[1339,406],[1882,648],[3763,1296],[1254,482]]){
    const layout=mapLayout(width,height);
    assert.equal(layout.coveragePoints.length,65);
    assert.ok(layout.silhouette.length>0&&!/NaN|Infinity/.test(layout.silhouette));
    for(const country of layout.coveragePoints){
      const [x,y]=country.center;
      assert.ok(Number.isFinite(x)&&Number.isFinite(y),country.code);
      assert.ok(x>=0&&x<=width&&y>=0&&y<=height,`${country.code} remains in the map at ${width} x ${height}`);
    }
    for(const [region,code] of [['china','CN'],['cambodia','KH'],['vietnam','VN'],['usa','US']]){
      assert.deepEqual(layout.points[region],layout.coveragePoints.find(country=>country.code===code).center,`${region} uses the same projection for its label, hit area and data point`);
    }
  }
});

test('all covered regions resolve to local map geometry and public output contains aggregates only',async()=>{
  const world=JSON.parse(await readFile(new URL('../public/data/world-50m.json',import.meta.url),'utf8'));
  const ids=new Set(world.objects.countries.geometries.map(item=>item.id));
  for(const item of data.countries){
    assert.ok(ids.has(item.mapId),item.code);
    assert.deepEqual(Object.keys(item).sort(),['code','customers','mapId','name','suppliers']);
    assert.ok(item.name.every(name=>name&&!name.includes('#N/A')));
  }
  const shared=JSON.parse(await readFile(new URL('../../共享数据/business-footprint.json',import.meta.url),'utf8'));
  assert.deepEqual(shared,data,'all frontends can reference the same aggregate source');
  assert.ok(!JSON.stringify(data).includes('/Users/'),'public data does not expose personal source paths');
});

test('both projections use exactly the same country set and points within its boundaries',async()=>{
  const {visibleFootprint,footprintAt}=await import('../src/impact/footprintGeography.js');
  const {globePoint}=await import('../src/impact/globeFootprint.js');
  for(const layer of ['all','customers','suppliers']){
    const shown=visibleFootprint(layer);
    assert.deepEqual(shown.map(c=>c.code).sort(),footprintCountries(data,layer).map(c=>c.code).sort());
    for(const country of shown){
      assert.equal(footprintAt(country.coordinate,layer),country.code,country.code);
      const point=globePoint(country.coordinate).normalize(),coordinate=[Math.atan2(point.x,point.z)*180/Math.PI,Math.asin(point.y)*180/Math.PI];
      assert.equal(footprintAt(coordinate,layer),country.code,'a sphere hit resolves back to the shared country');
    }
  }
  assert.equal(footprintAt([0,-50],'all'),null,'ocean taps cannot invent a manufacturing region');
  assert.equal(footprintAt([2,46],'suppliers'),'FR');
});

test('projection filters reuse country meshes and highlight textures without replacing the scene',async()=>{
  const THREE=await import('three');
  const {createGlobeFootprint}=await import('../src/impact/globeFootprint.js');
  let allocated=0;
  const world=createGlobeFootprint(7.5,(_layer,_selected,existing)=>{if(existing)return existing;allocated++;return new THREE.Texture();});
  const ids=world.nodes.map(node=>[node.marker.uuid,node.marker.geometry.uuid]);
  assert.equal(world.nodes.length,65);assert.equal(allocated,4);
  for(const [layer,selected,count] of [['all',null,65],['customers','GB',59],['suppliers','VN',22],['all','KH',65],['suppliers',null,22]]){
    world.update(layer,selected);
    assert.equal(world.nodes.filter(node=>node.marker.visible).length,count);
    assert.deepEqual(world.nodes.map(node=>[node.marker.uuid,node.marker.geometry.uuid]),ids);
    assert.equal(allocated,4,'selection and filtering keep the same textures');
  }
  world.dispose();
  const geometries=new Set(),materials=new Set();world.root.traverse(node=>{if(node.geometry)geometries.add(node.geometry);if(node.material)materials.add(node.material);});
  geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>{material.map?.dispose();material.dispose();});
});
