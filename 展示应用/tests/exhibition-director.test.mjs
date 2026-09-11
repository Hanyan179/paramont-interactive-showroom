import {exhibitionShots} from '../src/config/presentation.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createExhibitionDirector} from '../src/exhibitionDirector.js';

function rig(){let time=0;const events=[];const d=createExhibitionDirector({now:()=>time,onStart:()=>events.push('start'),onShot:s=>events.push(s.id),onStop:o=>events.push(o.restore===false?'takeover':'restore')});return {d,events,advance(ms,flags){time+=ms;d.tick(flags);}};}
test('late-loaded timing applies without resetting activity or the current tour',()=>{
 const r=rig();r.advance(20000);r.d.configureTiming({idleSeconds:120});r.advance(70000);assert.equal(r.d.state.active,false);
 r.d.configureTiming({idleSeconds:NaN});r.advance(30000);assert.equal(r.d.state.active,true);
 r.advance(5000);r.d.configureTiming({idleSeconds:180});r.advance(13000);assert.equal(r.d.state.shot.id,'company-close');
});
test('90 seconds begins a held opening shot; normal input resets the idle clock',()=>{const r=rig();r.advance(89999);assert.equal(r.d.state.active,false);r.d.activity();r.advance(89999);assert.equal(r.d.state.active,false);r.advance(1);assert.deepEqual(r.events,['start','company-world']);r.advance(17999);assert.equal(r.d.state.index,0);r.advance(1);assert.equal(r.d.state.shot.id,'company-close');});
test('a resting finger and video/hidden states block the idle transition',()=>{const r=rig();r.d.pointer(12,true);r.advance(120000);assert.equal(r.d.state.active,false);r.d.pointer(12,false);r.advance(100000,{blocked:true});assert.equal(r.d.state.active,false);r.advance(100000,{hidden:true});assert.equal(r.d.state.active,false);r.advance(90000);assert.equal(r.d.state.active,true);});
test('hidden or blocked presentation does not catch up with a burst of shots',()=>{const r=rig();r.d.start();r.advance(600000,{hidden:true});r.advance(1000);assert.equal(r.d.state.index,0);r.advance(600000,{blocked:true});r.advance(1000);assert.equal(r.d.state.index,0);});
test('touch restores once; explicit navigation takes over without restoring a stale detail',()=>{const r=rig();r.d.start();r.d.activity();r.d.activity();assert.equal(r.d.state.active,false);assert.equal(r.events.filter(e=>e==='restore').length,1);r.advance(89999);assert.equal(r.d.state.active,false);r.d.start();r.d.stop({restore:false});assert.equal(r.events.at(-1),'takeover');});
test('the full tour visits all four areas, leaves products, and loops coherently',()=>{const r=rig();r.d.start();for(const s of exhibitionShots)r.advance(s.seconds*1000);assert.equal(r.d.state.index,0);assert.equal(r.events.at(-1),'company-world');const product=r.events.indexOf('product-world');assert.equal(r.events[product+1],'insight-world');assert.equal(new Set(exhibitionShots.map(s=>s.page)).size,4);});

test('quiet mode starts at 30 seconds without changing a visitor selection, then tours at 90',()=>{
 let time=0;const quiet=[],shots=[];const d=createExhibitionDirector({now:()=>time,onQuiet:v=>quiet.push(v),onShot:s=>shots.push(s.id)});
 time=29999;d.tick();assert.equal(d.state.quiet,false);
 time=30000;d.tick();assert.equal(d.state.quiet,true);assert.deepEqual(shots,[]);
 time=89999;d.tick();assert.equal(d.state.active,false);
 time=90000;d.tick();assert.equal(d.state.active,true);assert.deepEqual(shots,['company-world']);assert.deepEqual(quiet,[true]);
 d.activity();assert.equal(d.state.quiet,false);assert.equal(d.state.active,false);assert.deepEqual(quiet,[true,false]);
});
test('a reading overlay, hidden page or held touch postpones quiet mode and resets its timer',()=>{
 for(const flags of [{blocked:true},{hidden:true}]){let time=0;const d=createExhibitionDirector({now:()=>time});time=30000;d.tick();assert.equal(d.state.quiet,true);time=60000;d.tick(flags);assert.equal(d.state.quiet,false);time+=29999;d.tick();assert.equal(d.state.quiet,false);time++;d.tick();assert.equal(d.state.quiet,true);}
 const r=rig();r.d.pointer(4,true);r.advance(60000);assert.equal(r.d.state.quiet,false);r.d.pointer(4,false);r.advance(29999);assert.equal(r.d.state.quiet,false);r.advance(1);assert.equal(r.d.state.quiet,true);
});
