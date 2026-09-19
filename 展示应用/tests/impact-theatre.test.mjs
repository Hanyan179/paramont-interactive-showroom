import test from 'node:test';
import assert from 'node:assert/strict';
import {impactMoments,advanceMoment,momentDuration,reelDwell,reelEntries,wrapReel,settleReel,automaticReelPosition} from '../src/impact/content.js';
import {categoryReel} from '../src/impact/categoryContent.js';

test('the exhibition visits separate brand and category chapters and loops to the company',()=>{
  assert.deepEqual(impactMoments.map(moment=>moment.id),['company','supply','brands','categories','intelligence']);
  for(let index=0;index<impactMoments.length;index++){
    const next=advanceMoment(index,impactMoments[index].duration-.01,.03);
    assert.equal(next.index,(index+1)%impactMoments.length);
    assert.ok(Math.abs(next.time-.02)<1e-8);
  }
});
test('a long frame gap cannot skip the visitor past a chapter',()=>{
  assert.deepEqual(advanceMoment(0,8,600),{index:0,time:8.05});
  assert.deepEqual(advanceMoment(0,8,-10),{index:0,time:8});
});
test('all twelve brand selections fit the chapter clock and resume into the next chapter normally',()=>{
  const index=impactMoments.findIndex(moment=>moment.id==='brands'),duration=momentDuration(impactMoments[index],12);
  for(let slot=0;slot<12;slot++){
    const time=slot*reelDwell+1;
    assert.ok(time/duration>=0&&time/duration<=1,`brand ${slot+1} stays inside its navigation track`);
    assert.equal(advanceMoment(index,time,.03,duration).index,index,'resuming a late brand cannot prematurely change chapters');
  }
  const next=advanceMoment(index,duration-.01,.03,duration);
  assert.equal(next.index,index+1);assert.ok(Math.abs(next.time-.02)<1e-8);
  assert.equal(momentDuration(impactMoments[0],12),impactMoments[0].duration);
});
test('brand and category browsing have independent content and never imply a relationship',()=>{
  const brands=Array.from({length:5},(_,id)=>({id,name:`brand-${id}`}));
  const brandEntries=reelEntries('brands',brands),categoryEntries=reelEntries('categories',brands);
  assert.deepEqual(brandEntries.map(entry=>entry.item),brands);
  assert.ok(brandEntries.every(entry=>entry.type==='brand'));
  assert.deepEqual(categoryEntries.map(entry=>entry.item),categoryReel);
  assert.ok(categoryEntries.every(entry=>entry.type==='category'));
  assert.deepEqual(reelEntries('brands',[]),[],'missing brand data cannot fall back to unassigned concepts');
  assert.deepEqual(reelEntries('supply',brands),[]);
});

test('manual browsing wraps either reel and cancellation returns to the original selection',()=>{
  const brands=Array.from({length:5},(_,id)=>({id}));
  for(const entries of [reelEntries('brands',brands),reelEntries('categories',brands)]){
    assert.equal(entries[wrapReel(-1,entries.length)],entries.at(-1));
    assert.equal(entries[wrapReel(entries.length,entries.length)],entries[0]);
    assert.equal(entries[wrapReel(entries.length*3+1,entries.length)],entries[1]);
  }
  assert.equal(settleReel(2,.4),3);
  assert.equal(settleReel(2,-.4),1);
  assert.equal(settleReel(2,.9,true),2);
  assert.equal(settleReel(2,.05),2);
  assert.equal(automaticReelPosition(3),0);
  assert.equal(automaticReelPosition(7),0);
  assert.ok(automaticReelPosition(7.6)>0&&automaticReelPosition(7.6)<1);
  assert.ok(Math.abs(automaticReelPosition(7.999)-automaticReelPosition(8))<.001);
});

test('category introductions resolve their scope and examples against the shared archive',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {impactDocument}=await import('../src/impact/documents.js');
  const [catalog,official]=await Promise.all(['catalog.json','official-content.json'].map(async file=>JSON.parse(await readFile(new URL(`../public/data/${file}`,import.meta.url),'utf8'))));
  for(const entry of reelEntries('categories')){
    const category=entry.item;
    assert.ok(catalog.categories.some(record=>record.id===category.catalogId));
    for(const example of category.examples)assert.ok(catalog.subcategories.some(record=>record.id===example.id&&record.parent===category.catalogId),`${category.id}/${example.id} belongs to the referenced category`);
    for(const id of category.officialIds)assert.ok(official.categories.some(record=>record.id===id));
    const article=impactDocument('categories',entry,{catalog,official});
    assert.equal(article.sections.find(section=>section.id==='families').paragraphs.length,category.examples.length);
    assert.ok(article.sources.some(source=>source.url));
    assert.equal(article.id,`impact-category-${category.id}`);
  }
});

test('the category panorama exposes every archived child under its actual parent',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {impactDocument}=await import('../src/impact/documents.js');
  const catalog=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url),'utf8'));
  const seen=new Set();
  for(const category of catalog.categories){
    const doc=impactDocument('categories',{type:'catalog-category',item:category},{catalog});
    const children=catalog.subcategories.filter(sub=>sub.parent===category.id),rows=doc.sections.flatMap(section=>(section.blocks||[]).flatMap(block=>block.items||[]));
    assert.equal(rows.length,children.length);
    for(const child of children){assert.ok(rows.some(row=>row[0].startsWith(`${child.id} · `)));assert.equal(seen.has(child.id),false);seen.add(child.id);}
    assert.ok(doc.sources[0].description[0].includes(String(category.sourceRow)));
  }
  assert.equal(seen.size,catalog.subcategories.length);
  assert.equal(impactDocument('categories',{type:'catalog-category',item:{id:'missing'}},{catalog}),null);
});

test('coverage layers feature Vietnam while keeping the three model scenes separate from supplier archives',async()=>{
  const {distributionRegions,distributionLayers,distributionLinks,clampMapView}=await import('../src/impact/distributionContent.js');
  const {footprintGeography}=await import('../src/impact/footprintGeography.js');
  assert.deepEqual(distributionRegions.map(region=>region.id),['usa','china','cambodia','vietnam']);
  assert.deepEqual(distributionRegions.filter(region=>region.sceneId).map(region=>region.id),['usa','china','cambodia']);
  assert.deepEqual(distributionLayers.map(layer=>layer.id),['all','customers','suppliers']);
  assert.equal(distributionRegions.find(region=>region.id==='usa').kind,'market');
  assert.ok(distributionRegions.every(region=>footprintGeography.find(country=>country.mapId===region.countryCode).coordinate.every(Number.isFinite)));
  assert.ok(distributionLinks.every(link=>link.every(id=>distributionRegions.some(region=>region.id===id))));
  assert.deepEqual(clampMapView({zoom:.1,x:1,y:-1}),{zoom:1,x:0,y:0});
  const moved=clampMapView({zoom:10,x:20,y:-20});assert.equal(moved.zoom,2.4);assert.ok(moved.x<=.7&&moved.y>=-.7);
});

test('theatre articles use confirmed roles and retain separate brand and product evidence',async()=>{
  const {impactDocument}=await import('../src/impact/documents.js');
  const doc=impactDocument('supply',null,{});
  assert.deepEqual(doc.sections.map(s=>s.id),['usa','china','cambodia','vietnam']);
  const brand=impactDocument('brands',{type:'brand',item:{id:'a',name:'A',logo:'a.png',descriptor:['甲','A'],description:['甲说明','About A']}},{official:{brands:[{id:'a',parent:'Parent',source_url:'https://example.com/brand'}]}});
  assert.equal(brand.sources[0].url,'https://example.com/brand');
  assert.ok(brand.sections.find(s=>s.id==='scope').paragraphs[0][0].includes('不代表本品牌'));
  const intelligence=impactDocument('intelligence',null,{});
  assert.equal(new Set(intelligence.sections.map(s=>s.id)).size,intelligence.sections.length);
  assert.ok(intelligence.sections.length>=3);
});

test('3D depth transitions have finite camera poses and retain all geometry across entry and return',async()=>{
  const THREE=await import('three');
  const {createSupplyDepth}=await import('../src/impact/supplyDepth.js');
  const {createIntelligenceDepth}=await import('../src/impact/intelligenceDepth.js');
  const {depthContent,transitionProgress}=await import('../src/impact/depthContent.js');
  const {supplyFacilities,supplyLocation}=await import('../src/impact/supplyRegionsContent.js');
  assert.equal(transitionProgress(-1,2),0);assert.equal(transitionProgress(1,2),.5);assert.equal(transitionProgress(4,2),1);
  for(const [id,create] of [['supply',createSupplyDepth],['intelligence',createIntelligenceDepth]]){
    const world=create(),scene=new THREE.Scene();scene.add(world.root);
    const before=[];world.root.traverse(object=>{if(object.geometry)before.push(object.geometry.uuid);});
    world.update(0,0);assert.equal(world.root.visible,false);
    const entries=[null,...depthContent[id].items.map(item=>item.id)];
    if(id==='supply')for(const [region,areas] of Object.entries(supplyFacilities))entries.push(...areas.map(area=>`${region}:${area.id}`));
    for(const entry of entries){
      const pose=world.pose(entry);assert.ok([...pose.position.toArray(),...pose.target.toArray()].every(Number.isFinite));
      world.update(10,1,entry,0);assert.equal(world.root.visible,true);
      if(id==='supply'){
        assert.equal(world.root.children.filter(child=>child.visible).length,1,'each supply close-up has one visible architectural scene');
        const narrow=world.pose(entry,1.37);assert.ok(narrow.position.distanceTo(narrow.target)>=pose.position.distanceTo(pose.target));
      }
      const camera=new THREE.PerspectiveCamera(46,16/9,.1,260);camera.position.copy(pose.position);camera.lookAt(pose.target);camera.updateMatrixWorld();
      const anchors=world.project(camera,1920,1080);assert.equal(anchors.length,id==='supply'?supplyFacilities[supplyLocation(entry).region].length:3);assert.ok(anchors.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
      if(id==='supply'&&entry?.includes(':'))assert.ok(anchors.every(p=>!p.visible),'facility close-ups do not retain neighbouring labels');
      if(id==='intelligence'&&entry)assert.ok(anchors.every(p=>!p.visible),'inference close-ups do not retain neighbouring labels');
    }
    world.update(20,0);const after=[];world.root.traverse(object=>{if(object.geometry)after.push(object.geometry.uuid);});assert.deepEqual(after,before);
    const geometry=new Set(),material=new Set();world.root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)material.add(o.material);});geometry.forEach(g=>g.dispose());material.forEach(m=>m.dispose());
  }
});

test('inference stages remain directly touchable and clear of the reading area across landscape sizes',async()=>{
  const THREE=await import('three');
  const {createIntelligenceDepth}=await import('../src/impact/intelligenceDepth.js');
  const world=createIntelligenceDepth();
  for(const [w,h] of [[1366,768],[1920,1080],[3840,2160],[1173,857]]){
    world.update(12,1,null);
    const camera=new THREE.PerspectiveCamera(46,w/h,.1,480),pose=world.pose(null,w/h);
    camera.position.copy(pose.position);camera.lookAt(pose.target);camera.updateMatrixWorld();
    const anchors=world.project(camera,w,h);
    assert.ok(anchors.every(p=>p.visible&&p.x>w*.43&&p.y<h*.66),'all three overview entrances remain clear of the reading column');
    for(const group of world.root.children.filter(g=>g.userData.insight)){
      const body=group.localToWorld(new THREE.Vector3(0,6,0)).project(camera);
      assert.equal(world.pick((body.x+1)*w/2,(1-body.y)*h/2,w,h,camera),group.userData.insight);
    }
    world.update(14,1,'categories');assert.equal(world.pick(w/2,h/2,w,h,camera),null);
  }
  const geometries=new Set(),materials=new Set();
  world.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
});

test('touch and manual chapter selection hold the tour without freezing scene motion',async()=>{
  const {theatreMotion}=await import('../src/impact/theatreMotion.js');
  assert.deepEqual(theatreMotion({touring:false,held:true}),{animate:true,advanceTour:false});
  assert.deepEqual(theatreMotion({touring:false,depth:true}),{animate:true,advanceTour:false});
  assert.deepEqual(theatreMotion({touring:false,movingReel:true}),{animate:true,advanceTour:false});
  assert.deepEqual(theatreMotion({playing:false}),{animate:false,advanceTour:false});
  assert.deepEqual(theatreMotion({suspended:true}),{animate:false,advanceTour:false});
  assert.deepEqual(theatreMotion({}),{animate:true,advanceTour:true});
});

test('supply strength evidence preserves shared values, source and undated reporting status',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {supplyEvidence}=await import('../src/impact/depthContent.js');
  const facts=JSON.parse(await readFile(new URL('../public/data/official-content.json',import.meta.url),'utf8'));
  for(const selection of [null,'china','cambodia','usa']){
    const evidence=supplyEvidence(facts,selection);assert.ok(evidence.length>0);
    for(const item of evidence){assert.ok(facts.official_metrics_requiring_date_confirmation.some(record=>record.value===item.value&&record.source_url===item.source_url));assert.ok(item.status.includes('日期'));}
  }
  assert.deepEqual(supplyEvidence(null,null),[]);
});


test('each country owns a complete independent environment and its own facility routes',async()=>{
  const {createSupplyDepth}=await import('../src/impact/supplyDepth.js');
  const {supplyFacilities,supplyHotspots,validSupplySelection,supplyLocation}=await import('../src/impact/supplyRegionsContent.js');
  const {depthItem}=await import('../src/impact/depthContent.js');
  const world=createSupplyDepth(),regions=world.root.children;
  assert.deepEqual(regions.map(r=>r.userData.region).sort(),['cambodia','china','usa']);
  const cambodia=regions.find(r=>r.userData.region==='cambodia');
  assert.deepEqual(cambodia.children.filter(r=>r.userData.zone).map(r=>r.userData.zone).sort(),['dispatch','production','quality']);
  for(const region of Object.keys(supplyFacilities)){
    world.update(10,1,region,0);
    assert.deepEqual(regions.filter(r=>r.visible).map(r=>r.userData.region),[region]);
    const active=regions.find(r=>r.userData.region===region);
    let meshes=0;active.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>100,`${region} retains a complete environment`);
    for(const hotspot of supplyHotspots(region)){
      assert.equal(supplyLocation(hotspot.id).region,region);assert.ok(validSupplySelection(hotspot.id));
      assert.notEqual(depthItem('supply',hotspot.id),depthItem('supply',region));
    }
  }
  assert.equal(validSupplySelection('china:dispatch'),false);assert.equal(validSupplySelection('usa:production'),false);
  assert.equal(supplyLocation(null).region,'china');
  const geometry=new Set(),material=new Set();world.root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)material.add(o.material);});geometry.forEach(g=>g.dispose());material.forEach(m=>m.dispose());
});


test('map and globe resolve the same regional scenes with source-aware returns',async()=>{
  const {distributionRegions}=await import('../src/impact/distributionContent.js');
  const {supplyRegions}=await import('../src/impact/content.js');
  const {depthSceneId,depthBack,depthItem}=await import('../src/impact/depthContent.js');
  const {supplyHotspots,validSupplySelection}=await import('../src/impact/supplyRegionsContent.js');
  assert.equal(validSupplySelection('vietnam'),false,'supplier coverage must not borrow a different country model');
  for(const region of distributionRegions.filter(region=>region.sceneId)){
    const globe=supplyRegions.find(item=>item.id===region.id);
    assert.deepEqual(region.coordinate,[globe.longitude,globe.latitude]);assert.deepEqual(region.name,globe.name);
    assert.ok(validSupplySelection(region.id));
    const mapView={id:depthSceneId('supply'),origin:'supply',originView:'flat',selection:region.id};
    assert.equal(depthItem(mapView.id,region.id),depthItem(depthSceneId('supply'),region.id));
    assert.equal(depthBack(mapView)[0],'返回世界地图');
    assert.equal(depthBack({...mapView,originView:'globe'})[0],'返回地球');
    for(const facility of supplyHotspots(region.id))assert.equal(depthBack({...mapView,selection:facility.id})[0],'返回地区总览');
  }
  assert.equal(depthSceneId('intelligence'),'intelligence');
  assert.equal(depthBack({id:'intelligence',selection:'signals'})[0],'返回推演总览');
});

test('map-to-model travel focuses the chosen anchor and reverses to the untouched view',async()=>{
  const {mapJourneyFrame}=await import('../src/impact/distributionContent.js');
  for(const size of [[1366,330],[1920,464],[3840,929],[1173,300]]){
    for(const view of [{zoom:1,x:0,y:0},{zoom:1.7,x:-.15,y:.08},{zoom:2.4,x:.4,y:-.3}]){
      const saved={...view},point=[size[0]*.72,size[1]*.4];
      const start=mapJourneyFrame(view,point,size,0),finish=mapJourneyFrame(view,point,size,1);
      assert.deepEqual({x:start.x,y:start.y,zoom:start.zoom},{x:view.x*size[0],y:view.y*size[1],zoom:view.zoom});
      assert.equal(start.opacity,1);assert.equal(start.modelOpacity,0);assert.equal(finish.opacity,0);assert.equal(finish.modelOpacity,1);
      assert.ok(Math.abs(size[0]/2+(point[0]-size[0]/2)*finish.zoom+finish.x-size[0]*.65)<1e-8);
      assert.ok(Math.abs(size[1]/2+(point[1]-size[1]/2)*finish.zoom+finish.y-size[1]*.5)<1e-8);
      let opacity=1;
      for(let step=0;step<=10;step++){
        const frame=mapJourneyFrame(view,point,size,step/10);assert.ok(Object.values(frame).every(Number.isFinite));assert.ok(frame.opacity<=opacity);opacity=frame.opacity;
      }
      assert.deepEqual(mapJourneyFrame(view,point,size,0),start);assert.deepEqual(view,saved);
    }
  }
});


test('confirmed brand identities and featured categories retain source-backed assets and distinct records',async()=>{
  const {readFile,access}=await import('node:fs/promises');
  const {impactDocument}=await import('../src/impact/documents.js');
  const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
  const brands=await read('../../共享数据/featured-brands.json'),featured=await read('../../共享数据/featured-categories.json'),catalog=await read('../public/data/catalog.json');
  assert.equal(brands.brands.length,12);assert.equal(new Set(brands.brands.map(brand=>brand.id)).size,12);
  for(const brand of brands.brands){
    assert.equal(brand.ownership,'company-confirmed');await access(new URL('../public/media/brand/'+brand.logo,import.meta.url));
    const doc=impactDocument('brands',{type:'brand',item:brand},{});assert.equal(doc.title,brand.name);assert.equal(doc.status[0],'PARAMONT 旗下品牌');assert.equal(doc.sources[0].url,brands.source);
  }
  assert.deepEqual(featured.categories.map(entry=>entry.catalogId),['01','14','06','13','15','03']);
  for(const entry of featured.categories){
    const record=catalog.categories.find(category=>category.id===entry.catalogId);assert.ok(record);await access(new URL('../public'+entry.image,import.meta.url));
    const doc=impactDocument('categories',{type:'catalog-category',item:record},{catalog});assert.equal(doc.cover.src,entry.image);assert.match(doc.cover.caption[0],/概念/);
    const sceneImage=await readFile(new URL('../public'+entry.sceneImage,import.meta.url));
    assert.equal(sceneImage.toString('ascii',1,4),'PNG');assert.ok(sceneImage.readUInt32BE(16)>=1024,'wall display uses the clear exhibit image, not portal thumbnails');
  }
});

test('China has both development and a separate core supply scene while Cambodia retains its factory areas',async()=>{
  const {createSupplyDepth}=await import('../src/impact/supplyDepth.js');
  const {supplyHotspots,validSupplySelection}=await import('../src/impact/supplyRegionsContent.js');
  const {distributionLinks}=await import('../src/impact/distributionContent.js');
  assert.ok(validSupplySelection('china:supply'));
  assert.deepEqual(supplyHotspots('china').map(point=>point.id),['china:materials','china:design','china:prototype','china:supply']);
  assert.deepEqual(supplyHotspots('cambodia').map(point=>point.id),['cambodia:production','cambodia:quality','cambodia:dispatch']);
  assert.ok(distributionLinks.every(link=>link.includes('china')));
  const world=createSupplyDepth();assert.notDeepEqual(world.pose('china:supply').position,world.pose('china:design').position);
  assert.ok(world.root.children.find(child=>child.userData.region==='china').children.some(child=>child.userData.zone==='core-supply'));
  const geometry=new Set(),material=new Set();world.root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)material.add(o.material);});geometry.forEach(g=>g.dispose());material.forEach(m=>m.dispose());
});
