import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrameLoop } from '../../共享组件/frameLoop.js';
import { bindScenePointer } from '../src/interaction/scenePointer.js';
import { resolveRoute, activeArea, showroomAreas } from '../src/config/areas.js';
import { exhibitionShots } from '../src/config/presentation.js';

test('route aliases keep their product view and the same global navigation area', () => {
  for (const page of ['brands', 'categories', 'products']) {
    assert.deepEqual(resolveRoute(`#/atlas/${page}`), { variant: 'atlas', page });
    assert.equal(activeArea(page), 'products');
  }
  assert.deepEqual(resolveRoute('#/studio/brands'), { variant: 'studio', page: 'brands' });
  for (const hash of ['', '#/atlas/missing', '#/constructor/nope']) {
    assert.deepEqual(resolveRoute(hash), { variant: 'atlas', page: 'home' });
  }
  const areas = new Set(showroomAreas.map(area => area.id));
  for (const shot of exhibitionShots) assert.ok(areas.has(shot.page), shot.id);
});

test('paused/hidden renderers schedule no frames and resume without elapsed-time jumps', () => {
  const pending = new Map(), frames = []; let id = 0;
  const loop = createFrameLoop({ render: (time, dt) => frames.push({ time, dt }),
    request: callback => { pending.set(++id, callback); return id; }, cancel: key => pending.delete(key) });
  const tick = time => { const [key, callback] = pending.entries().next().value; pending.delete(key); callback(time); };
  loop.setActive(true); loop.setActive(true); assert.equal(pending.size, 1);
  tick(1000); tick(1016); assert.equal(frames.at(-1).dt, .016);
  loop.setActive(false); assert.equal(pending.size, 0);
  loop.setVisible(false); loop.setActive(true); assert.equal(pending.size, 0);
  loop.setVisible(true); tick(600000); assert.equal(frames.at(-1).dt, 0);
  tick(600016); assert.equal(frames.at(-1).dt, .016);
  loop.dispose(); loop.setActive(true); loop.setVisible(true); assert.equal(pending.size, 0);
});

function pointerRig(options = {}) {
  const host = new EventTarget(), captured = new Set(), calls = [];
  host.ownerDocument = { defaultView: new EventTarget() };
  host.closest = () => null;
  host.setPointerCapture = id => captured.add(id);
  host.hasPointerCapture = id => captured.has(id);
  host.releasePointerCapture = id => captured.delete(id);
  const controls = bindScenePointer(host, { ...options, onStart: () => calls.push('start'), onMove: () => calls.push('move'),
    onTap: (...args) => { calls.push('tap'); options.onTap?.(...args); }, onEnd: result => { calls.push(result.cancelled ? 'cancel' : 'end'); options.onEnd?.(result); } });
  const send = (type, x = 0, pointerId = 1, extras = {}) => {
    const event = new Event(type,{cancelable:true}); Object.assign(event, { clientX: x, clientY: 0, pointerId, isPrimary: true, button: 0, ...extras }); host.dispatchEvent(event);return event;
  };
  return { host, controls, calls, captured, send };
}

test('a drag stays a drag after returning to its start; the next tap still works', () => {
  const r = pointerRig(); r.send('pointerdown'); r.send('pointermove', 40); r.send('pointermove', 0); r.send('pointerup');
  assert.ok(!r.calls.includes('tap')); assert.equal(r.captured.size, 0);
  r.send('pointerdown'); r.send('pointerup', 2); assert.equal(r.calls.at(-1), 'tap'); r.controls.dispose();
});

test('secondary touches do not finish the active gesture and cancellation never selects a model', () => {
  const r = pointerRig(); r.send('pointerdown'); r.send('pointerdown', 0, 2, { isPrimary: false }); r.send('pointerup', 0, 2);
  assert.equal(r.captured.size, 1); r.send('pointercancel'); assert.deepEqual(r.calls, ['start', 'cancel']);
  r.send('pointerdown'); r.host.ownerDocument.defaultView.dispatchEvent(new Event('blur'));
  assert.equal(r.calls.at(-1), 'cancel'); assert.equal(r.captured.size, 0);
  r.controls.dispose(); r.send('pointerdown'); assert.equal(r.captured.size, 0);
});

test('a release far from the press is not a tap even if no move event arrived', () => {
  const r = pointerRig(); r.send('pointerdown'); r.send('pointerup', 100); assert.ok(!r.calls.includes('tap'));
  r.host.closest = () => ({}); r.send('pointerdown'); assert.equal(r.captured.size, 0); r.controls.dispose();
});

test('graph buttons use the same gesture threshold without treating a swipe or cancellation as selection',()=>{
 const r=pointerRig({includeControls:true});r.host.closest=()=>({});
 r.send('pointerdown');r.send('pointermove',50);r.send('pointerup',0);assert.equal(r.calls.includes('tap'),false);
 r.send('pointerdown');r.send('pointercancel');assert.equal(r.calls.includes('tap'),false);
 r.send('pointerdown');r.send('pointerup',2);assert.equal(r.calls.filter(c=>c==='tap').length,1);r.controls.dispose();
});

for(const pointerType of ['touch','mouse','pen'])test(`${pointerType} hotspot taps activate once, swipes never click, keyboard activation stays available`,()=>{
 let activated=0,target;
 const r=pointerRig({includeControls:true,claimClick:true,onTap:(event,gesture)=>{activated++;target=gesture.target;}});
 r.host.closest=()=>({});
 r.send('pointerdown',0,1,{pointerType});r.send('pointerup',2,1,{pointerType});
 assert.equal(activated,1);assert.equal(target,r.host);
 assert.equal(r.send('click',2,1,{detail:1,pointerType}).defaultPrevented,true);
 r.send('pointerdown',0,1,{pointerType});r.send('pointermove',80,1,{pointerType});r.send('pointerup',0,1,{pointerType});
 assert.equal(activated,1);assert.equal(r.send('click',0,1,{detail:1,pointerType}).defaultPrevented,true);
 r.send('pointerdown',0,1,{pointerType});r.send('pointercancel',0,1,{pointerType});
 assert.equal(r.send('click',0,-1,{detail:0}).defaultPrevented,false);
 assert.equal(activated,1);r.controls.dispose();
});
