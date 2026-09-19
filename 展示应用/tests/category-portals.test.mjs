import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {categoryThemes,categoryThemeId} from '../src/impact/categoryTheme.js';
import {portalSize,portalPose,portalCamera,portalFocusPose,portalSelection} from '../src/impact/categoryPortalLayout.js';

function corners(pose,aspect,scale=1){
  const frame=portalCamera(aspect),camera=new THREE.PerspectiveCamera(46,aspect,.1,480);
  camera.position.set(0,frame.y,frame.z);camera.lookAt(0,frame.y,0);camera.updateMatrixWorld();
  const panel=new THREE.Object3D();panel.position.set(pose.x,pose.y,pose.z);panel.rotation.y=pose.yaw||0;panel.scale.setScalar(scale);panel.updateMatrixWorld();
  return [[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>{
    const p=panel.localToWorld(new THREE.Vector3(x*portalSize.width/2,y*portalSize.height/2,.12)).project(camera);
    return {x:(p.x+1)/2,y:(1-p.y)/2};
  });
}

test('all six windows fit above the fixed navigation at desktop, wall and narrow sizes',()=>{
  for(const [width,height] of [[1366,768],[1920,1080],[3840,2160],[1024,768],[2560,1080]]){
    const boxes=[];
    for(let index=0;index<6;index++){
      // Include both extremes of the ambient camera sway and intentional drag.
      for(const sway of [-.115,0,.115]){
        const pose=portalPose(index);pose.x+=Math.sin(sway)*2;pose.yaw+=sway;
        const p=corners(pose,width/height);
        assert.ok(p.every(v=>v.x>.005&&v.x<.995&&v.y>.20&&v.y<.80),`${width} ${index} ${JSON.stringify(p)}`);
        if(!sway)boxes.push({left:Math.min(...p.map(v=>v.x)),right:Math.max(...p.map(v=>v.x))});
      }
    }
    for(let index=1;index<6;index++)assert.ok(boxes[index].left>boxes[index-1].right,'window hit areas must remain separate');
  }
});

test('a focused portrait leaves the text column and footer unobstructed',()=>{
  for(const aspect of [16/9,4/3,21/9]){
    const pose=portalFocusPose(aspect),p=corners({...pose,yaw:-.035},aspect,pose.scale);
    assert.ok(p.every(v=>v.x>.5&&v.x<.94&&v.y>.16&&v.y<.84));
  }
});

test('portrait assets match the six confirmed category identities and retain portrait framing',()=>{
  const entries=JSON.parse(readFileSync(new URL('../../共享数据/featured-categories.json',import.meta.url))).categories;
  assert.equal(entries.length,6);
  for(const {id} of entries){
    const bytes=readFileSync(new URL(`../public/media/categories/portraits-v3/${id}.png`,import.meta.url));
    assert.equal(bytes.toString('ascii',1,4),'PNG');
    const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);
    assert.ok(w>=900&&h>=1600&&Math.abs(w/h-4/7)<.005,`${id}: ${w}x${h}`);
  }
  assert.equal(portalSelection(5,1),0);assert.equal(portalSelection(0,-1),5);
});

// Theme choices must stay readable without changing the product imagery.
test('both room palettes preserve readable navigation and safe theme selection',()=>{
  const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
  const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>a-b);return (values[1]+.05)/(values[0]+.05);};
  for(const theme of Object.values(categoryThemes)){
    assert.ok(contrast(theme.ink,theme.background)>7);
    assert.ok(contrast(theme.muted,theme.background)>4.5);
    assert.ok(contrast(theme.captionInk,theme.caption)>7);
    assert.ok(contrast(theme.captionMuted,theme.caption)>4.5);
  }
  assert.equal(categoryThemeId('light'),'light');assert.equal(categoryThemeId('dark'),'dark');assert.equal(categoryThemeId('invalid'),'dark');assert.equal(categoryThemeId(null),'dark');
});
