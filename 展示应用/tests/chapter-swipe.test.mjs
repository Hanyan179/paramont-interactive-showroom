import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindScenePointer} from '../src/interaction/scenePointer.js';
import {chapterSwipeDirection} from '../src/interaction/chapterSwipe.js';

function rig() {
  const host=new EventTarget(),window=new EventTarget(),captured=new Set();
  host.ownerDocument={defaultView:window};host.closest=()=>null;
  host.setPointerCapture=id=>captured.add(id);
  host.hasPointerCapture=id=>captured.has(id);
  host.releasePointerCapture=id=>captured.delete(id);
  let index=0,taps=0,enabled=true,accepted=true;
  const pointer=bindScenePointer(host,{claimClick:true,cancelOnMultiple:true,
    enabled:()=>enabled,acceptStart:()=>accepted,
    onTap:()=>taps++,onEnd:result=>{index=(index+chapterSwipeDirection(result,1366)+5)%5;},
  });
  const send=(type,x=500,y=200,extras={})=>{
    const event=new Event(type,{cancelable:true});
    Object.assign(event,{clientX:x,clientY:y,pointerId:1,pointerType:'touch',isPrimary:true,button:0,...extras});
    if(type==='pointerdown')window.dispatchEvent(event);
    host.dispatchEvent(event);return event;
  };
  return {send,pointer,captured,get index(){return index;},get taps(){return taps;},
    set enabled(value){enabled=value;},set accepted(value){accepted=value;}};
}

test('left/right touch swipes move one chapter, wrap, and consume the compatibility click',()=>{
  const r=rig();
  r.send('pointerdown');r.send('pointermove',350);assert.equal(r.index,0);
  r.send('pointerup',300);assert.equal(r.index,1);assert.equal(r.taps,0);
  assert.equal(r.send('click',300,200,{detail:1}).defaultPrevented,true);
  r.send('pointerdown');r.send('pointerup',700);assert.equal(r.index,0);
  r.send('pointerdown');r.send('pointerup',700);assert.equal(r.index,4);
  assert.equal(r.send('click',700,200,{detail:0}).defaultPrevented,false);
  r.pointer.dispose();
});

test('taps, short jitter, vertical/diagonal movement and returning to the origin never change chapter',()=>{
  const r=rig();
  for(const [x,y] of [[502,201],[540,204],[515,450],[610,320]]){
    r.send('pointerdown');r.send('pointerup',x,y);assert.equal(r.index,0);
  }
  assert.equal(r.taps,1);
  r.send('pointerdown');r.send('pointermove',100);r.send('pointerup',500);
  assert.equal(r.index,0);assert.equal(r.taps,1);r.pointer.dispose();
});

test('cancellation, lost capture, suspension and a second finger never complete a pending swipe',()=>{
  for(const reason of ['pointercancel','lostpointercapture','suspended','multiple','dispose']){
    const r=rig();r.send('pointerdown');r.send('pointermove',200);
    if(reason==='suspended')r.enabled=false;
    else if(reason==='multiple')r.send('pointerdown',400,200,{pointerId:2,isPrimary:false});
    else if(reason==='dispose')r.pointer.dispose();
    else r.send(reason,200);
    r.send('pointerup',100);assert.equal(r.index,0,reason);assert.equal(r.taps,0,reason);
    assert.equal(r.captured.size,0,reason);r.pointer.dispose();
  }
});

test('nested interactive surfaces can reject a swipe without capturing or consuming their click',()=>{
  const r=rig();r.accepted=false;r.send('pointerdown');r.send('pointermove',150);r.send('pointerup',100);
  assert.equal(r.index,0);assert.equal(r.captured.size,0);
  assert.equal(r.send('click',100,200,{detail:1}).defaultPrevented,false);r.pointer.dispose();
});

test('distance works across tablet and wall-screen sizes; pen swipes work while mouse drags stay local',()=>{
  for(const width of [1024,1366,1920,3840]){
    const result={cancelled:false,gesture:{pointerType:'touch',startX:300,startY:100},event:{clientX:120,clientY:105}};
    assert.equal(chapterSwipeDirection(result,width),1);
    result.gesture.pointerType='pen';assert.equal(chapterSwipeDirection(result,width),1);
    result.gesture.pointerType='mouse';assert.equal(chapterSwipeDirection(result,width),0);
  }
});
