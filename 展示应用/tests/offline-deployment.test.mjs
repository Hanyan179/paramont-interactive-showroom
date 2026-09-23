import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink, cp } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import { createShowroomServer } from '../scripts/offline/server.mjs';
import { browserArguments, launch } from '../scripts/offline/launch.mjs';

test('offline server serves built assets, byte ranges and HEAD while containing filesystem access', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'showroom offline 中文 '));
  const site = path.join(root, 'site');
  await mkdir(site);
  await writeFile(path.join(site, 'index.html'), '<h1>Offline</h1>');
  await writeFile(path.join(site, 'video.mp4'), '0123456789');
  await writeFile(path.join(site, '应用.js'), 'export const ready = true;');
  await writeFile(path.join(root, 'private.txt'), 'outside');
  await symlink(path.join(root, 'private.txt'), path.join(site, 'escape.txt'));
  const server = await createShowroomServer(site, 'test-package');
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true }); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const home = await fetch(origin);
  assert.match(await home.text(), /Offline/);
  assert.match(home.headers.get('content-security-policy'), /connect-src 'self'/);
  assert.equal((await fetch(origin + '/%E5%BA%94%E7%94%A8.js')).headers.get('content-type'), 'text/javascript; charset=utf-8');
  for (const [range, body] of [['bytes=2-5', '2345'], ['bytes=7-', '789'], ['bytes=-3', '789'], ['bytes=8-99', '89']]) {
    const response = await fetch(origin + '/video.mp4', { headers: { range } });
    assert.equal(response.status, 206); assert.equal(await response.text(), body);
  }
  for (const range of ['bytes=20-', 'bytes=5-2', 'bytes=-0', 'bytes=0-1,4-5']) assert.equal((await fetch(origin + '/video.mp4', { headers: { range } })).status, 416);
  const head = await fetch(origin + '/video.mp4', { method: 'HEAD' });
  assert.equal(head.headers.get('content-length'), '10'); assert.equal(await head.text(), '');
  assert.equal((await fetch(origin + '/missing.js')).status, 404);
  assert.equal((await fetch(origin + '/escape.txt')).status, 403);
  assert.equal((await fetch(origin + '/%ZZ')).status, 400);
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  for (const name of ['/%2e%2e/private.txt', '/..%5cprivate.txt', '/file.txt:stream', '/.env']) {
    const status = await new Promise((resolve, reject) => { http.get(origin + '/unused', { path: name }, res => { res.resume(); resolve(res.statusCode); }).on('error', reject); });
    assert.equal(status, 403, name);
  }
  assert.deepEqual(await (await fetch(origin + '/__offline/health')).json(), { app: 'paramont-offline', identity: 'test-package' });
});

test('launcher reuses only the same package and rejects another service on its port', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'showroom-launch-'));
  await mkdir(path.join(root, 'site'));
  await writeFile(path.join(root, 'site/index.html'), 'ready');
  await writeFile(path.join(root, 'settings.json'), JSON.stringify({ port: 5183, quality: 'studio', fullscreen: true, browserPath: '' }));
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify({ packageId: 'test-release' }));
  const probe = http.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
  const server = await launch({ packageRoot: root, noBrowser: true, portOverride: port });
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true }); });
  assert.equal(await launch({ packageRoot: root, noBrowser: true, portOverride: port }), null);
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify({ packageId: 'different-release' }));
  await assert.rejects(launch({ packageRoot: root, noBrowser: true, portOverride: port }), /端口.*占用/);
});

test('browser startup isolates its profile and requests display kiosk without shell interpolation', () => {
  const args = browserArguments('msedge.exe', 'http://127.0.0.1:5183/', 'C:/Users/中文 User/profile', true);
  assert.ok(args.includes('--kiosk')); assert.ok(args.includes('--edge-kiosk-type=fullscreen'));
  assert.ok(args.includes('--user-data-dir=C:/Users/中文 User/profile'));
  assert.equal(args.at(-1), 'http://127.0.0.1:5183/');
  assert.ok(!browserArguments('chrome.exe', 'url', 'profile', false).includes('--kiosk'));
});

test('the actual launcher entry point runs from a relocated folder reached through a symlink', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'showroom 中文 cli '));
  const folder = path.join(root, 'package');
  await cp(new URL('../scripts/offline/', import.meta.url), folder, { recursive: true });
  await mkdir(path.join(folder, 'site'));
  await writeFile(path.join(folder, 'site/index.html'), 'relocated');
  await writeFile(path.join(folder, 'manifest.json'), JSON.stringify({ packageId: 'cli-test' }));
  await symlink(folder, path.join(root, 'alias'), 'junction');
  const probe = http.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, [path.join(root, 'alias/launch.mjs'), '--no-browser'], { env: { ...process.env, SHOWROOM_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
    await rm(root, { recursive: true });
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error('Launcher did not start')), 5000);
    child.stdout.on('data', data => { if (data.toString().includes('127.0.0.1:')) { clearTimeout(timeout); resolve(); } });
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); reject(Error(`Launcher exited early: ${code}`)); });
  });
  assert.equal(await (await fetch(`http://127.0.0.1:${port}/`)).text(), 'relocated');
});
