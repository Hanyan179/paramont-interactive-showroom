import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {safeDocumentURL} from '../src/documents/reading.js';
const text=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('public exhibition reads only the published endpoint and authenticates no upstream request',()=>{
 const source=text('../src/advertising.js');assert.match(source,/sampleAdvertisingPublic:get/);assert.match(source,/credentials: 'omit'/);assert.doesNotMatch(source,/localStorage.*token|Authorization/);
 assert.match(source,/event.origin !== location.origin/);assert.match(source,/event.source !== window.parent/);
});
test('same-origin temporary preview media are allowed, foreign blobs and active URLs are refused',()=>{
 globalThis.location={origin:'https://dsr.example'};
 assert.equal(safeDocumentURL('blob:https://dsr.example/asset'),'blob:https://dsr.example/asset');
 assert.equal(safeDocumentURL('blob:https://evil.example/asset'),null);assert.equal(safeDocumentURL('javascript:alert(1)'),null);delete globalThis.location;
});
