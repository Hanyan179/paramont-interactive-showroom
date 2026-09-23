import path from 'node:path';
import os from 'node:os';
import { existsSync, readFileSync, realpathSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createShowroomServer } from './server.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));

export function browserArguments(browser, url, profile, fullscreen) {
  const args = [`--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required'];
  if (fullscreen) args.push('--kiosk');
  if (fullscreen && path.basename(browser).toLowerCase() === 'msedge.exe') args.push('--edge-kiosk-type=fullscreen');
  args.push(url);
  return args;
}

function openBrowser(settings, url, identity) {
  const candidates = settings.browserPath ? [settings.browserPath] : [
    ...[process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean).map(p => path.join(p, 'Microsoft', 'Edge', 'Application', 'msedge.exe')),
    ...[process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA].filter(Boolean).map(p => path.join(p, 'Google', 'Chrome', 'Application', 'chrome.exe')),
  ];
  const browser = candidates.find(p => existsSync(p));
  if (!browser) {
    console.log('未找到 Edge（微软浏览器）或 Chrome（谷歌浏览器）。请用已安装浏览器打开上方地址，或在 settings.json 中填写 browserPath。');
    return;
  }
  const profile = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'ParamontShowroom', identity.slice(0, 16));
  mkdirSync(profile, { recursive: true });
  const child = spawn(browser, browserArguments(browser, url, profile, settings.fullscreen), { detached: true, stdio: 'ignore', shell: false });
  child.on('error', error => console.error(`浏览器启动失败：${error.message}\n请手动打开 ${url}`));
  child.unref();
}

export async function launch({ packageRoot = root, noBrowser = false, portOverride } = {}) {
  const settings = JSON.parse(readFileSync(path.join(packageRoot, 'settings.json'), 'utf8').replace(/^\uFEFF/, ''));
  const port = portOverride ?? settings.port;
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('settings.json 的 port 必须是 1–65535 的整数。');
  if (!['studio', 'exhibition', 'fluid'].includes(settings.quality)) throw Error('画质必须为 studio、exhibition 或 fluid。');
  if (typeof settings.fullscreen !== 'boolean' || typeof settings.browserPath !== 'string') throw Error('settings.json 中的 fullscreen 或 browserPath 格式错误。');
  const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'manifest.json'), 'utf8'));
  const resolved = realpathSync(packageRoot);
  const identity = createHash('sha256').update(process.platform === 'win32' ? resolved.toLowerCase() : resolved).update(manifest.packageId).digest('hex');
  const origin = `http://127.0.0.1:${port}`;
  const url = `${origin}/?quality=${settings.quality}#/atlas/home`;
  const server = await createShowroomServer(path.join(packageRoot, 'site'), identity);
  try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  } catch (error) {
    if (error.code !== 'EADDRINUSE') throw error;
    const health = await fetch(`${origin}/__offline/health`, { signal: AbortSignal.timeout(2000) }).then(r => r.json()).catch(() => null);
    if (health?.app !== 'paramont-offline' || health.identity !== identity) {
      throw Error(`端口 ${port} 已被其他程序或另一份展厅占用。关闭旧展厅控制台，或修改 settings.json 的 port 后重试。不会停止其他程序。`);
    }
    console.log(`展厅已经运行：${url}`);
    if (!noBrowser) openBrowser(settings, url, identity);
    return null;
  }
  console.log(`\nPARAMONT 企业大屏 · 离线运行\n${url}\n\n请保留此窗口，可将它最小化。Alt+F4 退出全屏浏览器；关闭此窗口或按 Ctrl+C 停止本地服务。\n`);
  if (!noBrowser) openBrowser(settings, url, identity);
  return server;
}

if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  launch({ noBrowser: process.argv.includes('--no-browser'), portOverride: process.env.SHOWROOM_PORT ? Number(process.env.SHOWROOM_PORT) : undefined })
    .catch(error => { console.error(`\n启动失败：${error.message}`); process.exitCode = 1; });
}
