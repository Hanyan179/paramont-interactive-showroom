import {exhibitionShots} from '../src/config/presentation.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import * as THREE from 'three';
import {playableFilms,nextFilm} from '../src/media/library.js';
import {overviewPositions,overviewVisibility} from '../src/components/rendering/overviewLayout.js';
import {homeStops} from '../src/components/homeStoryContent.js';
import {advanceMediaJourney,mediaJourneyEase} from '../src/media/cameraJourney.js';
import {createExhibitionDirector} from '../src/exhibitionDirector.js';

test('film library uses existing local media and cycles without a dead end',async()=>{
 const data=JSON.parse(await readFile(new URL('../public/data/exhibition-media.json',import.meta.url),'utf8')),films=playableFilms(data.films);
 assert.equal(films.length,2);
 for(const film of films){await access(new URL('../public'+film.src,import.meta.url));assert.ok(film.status.every(s=>s.length));}
 assert.equal(nextFilm(films,films.at(-1).id).id,films[0].id);
 assert.equal(nextFilm(films,films[0].id,-1).id,films.at(-1).id);
 assert.equal(nextFilm([],''),null);
 assert.deepEqual(playableFilms([{id:'bad',src:'javascript:alert(1).mp4'},{id:'bad2',src:'//evil.test/x.mp4'}]),[]);
});
test('a selected exhibit retires all other bays, with no stale focus when changing',()=>{
 for(let i=0;i<4;i++){const weights=Array.from({length:4},(_,j)=>i===j?1:0);assert.deepEqual(weights.map((_,j)=>overviewVisibility(weights,j)),weights);}
 assert.equal(overviewVisibility([0,0,.5,.5],0),0);
});
test('the four business exhibits orbit as one world while keeping their physical spacing',()=>{
 const root=new THREE.Group(),subjects=overviewPositions.map(p=>{const g=new THREE.Object3D();g.position.set(...p);root.add(g);return g;});
 const origins=subjects.map(s=>s.position.clone()),start=origins[1].clone();let moved=false;
 for(const tilt of [-.38,0,.65])for(let degrees=0;degrees<=720;degrees+=15){
  root.rotation.set(tilt,degrees*Math.PI/180,0);root.updateMatrixWorld(true);
  const centers=subjects.map(s=>s.getWorldPosition(new THREE.Vector3()));
  if(centers[1].distanceTo(start)>5)moved=true;
  for(let i=1;i<4;i++)for(let j=0;j<i;j++)assert.ok(Math.abs(centers[i].distanceTo(centers[j])-origins[i].distanceTo(origins[j]))<1e-8);
 }
 assert.ok(moved,'satellites must travel around the center, not counter-rotate into fixed bays');
 assert.equal(homeStops(0,{}).length,4);assert.deepEqual(homeStops(4,{}),[]);
});
test('media camera approach and withdrawal reach their endpoints without overshoot',()=>{
 let progress=0,previous=0;
 for(let i=0;i<120;i++){progress=advanceMediaJourney(progress,'approaching',1/60);assert.ok(progress>=previous&&progress<=1);previous=progress;}
 assert.equal(progress,1);assert.equal(mediaJourneyEase(progress),1);
 for(let i=0;i<100;i++){progress=advanceMediaJourney(progress,'returning',1/60);assert.ok(progress<=previous&&progress>=0);previous=progress;}
 assert.equal(progress,0);assert.equal(mediaJourneyEase(progress),0);
 assert.equal(advanceMediaJourney(.3,'approaching',1/60,true),1);
 assert.equal(advanceMediaJourney(.7,'returning',1/60,true),0);
 assert.equal(advanceMediaJourney(.4,'approaching',-1),.4);
});
test('automatic film and journal shots have bounded dwell and continue to the next scene',()=>{
 let time=0;const d=createExhibitionDirector({now:()=>time});d.start();
 for(const shot of exhibitionShots){assert.equal(d.state.shot.id,shot.id);if(shot.media){assert.equal(shot.page,'home');assert.equal(shot.chapter,4);assert.equal(shot.focus,undefined);assert.ok(shot.seconds>2.2&&shot.seconds<=60);}time+=shot.seconds*1000;d.tick();}
 assert.equal(d.state.index,0);
});
