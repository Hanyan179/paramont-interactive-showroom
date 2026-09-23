import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, copyFile, cp, lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.dirname(app);
const output = path.join(repo, '交付');
const version = '24.21.0';
const expectedNodeHash = 'ba4e6d110e8c1592a1ecd390f6b05f3da124b13871a5be62b341a07a853c6c32';
const nodeURL = `https://nodejs.org/dist/v${version}/win-x64/node.exe`;
const hashFile = async file => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
};
async function filesIn(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw Error(`Deployment must not contain symlinks: ${name}`);
    if (entry.isDirectory()) result.push(...await filesIn(path.join(dir, entry.name), name + '/'));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort();
}

await access(path.join(app, 'dist/client/index.html'));
await access(path.join(app, 'dist/client/modules/product-explorer/index.html'));
await mkdir(output, { recursive: true });
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const packageName = `Paramont-Showroom-Windows-x64-${timestamp}-${commit}`;
const target = path.join(output, packageName);
await mkdir(target); // Never overwrite an existing delivery.
await cp(path.join(app, 'dist/client'), path.join(target, 'site'), { recursive: true, dereference: true, filter: src => path.basename(src) !== '.DS_Store' });
const template = path.join(app, 'scripts/offline');
for (const name of await readdir(template)) await copyFile(path.join(template, name), path.join(target, name === '使用说明.txt' ? 'README.txt' : name));
for (const [name, script] of [['START.cmd', 'launch.mjs'], ['VERIFY.cmd', 'verify.mjs']]) {
  const body = [
    '@echo off', 'setlocal', 'chcp 65001 >nul', 'title PARAMONT Offline Showroom',
    'pushd "%~dp0"',
    'if not exist "runtime\\node.exe" (',
    '  echo Missing runtime\\node.exe. Extract the complete ZIP before running.',
    '  pause', '  popd', '  exit /b 1', ')',
    `"%~dp0runtime\\node.exe" "%~dp0${script}"`,
    'set "SHOWROOM_EXIT=%ERRORLEVEL%"',
    ...(name === 'VERIFY.cmd' ? ['pause'] : ['if not "%SHOWROOM_EXIT%"=="0" pause']),
    'popd', 'exit /b %SHOWROOM_EXIT%', '',
  ].join('\r\n');
  await writeFile(path.join(target, name), body);
}
await mkdir(path.join(target, 'runtime'));
await mkdir(path.join(target, 'licenses'));
const cache = path.join(os.tmpdir(), `paramont-node-${version}-win-x64.exe`);
if (await hashFile(cache).catch(() => '') !== expectedNodeHash) {
  console.log(`Downloading official Windows runtime: ${nodeURL}`);
  execFileSync('curl', ['--fail', '--location', '--silent', '--show-error', '--retry', '2', '--connect-timeout', '20', '--max-time', '300', nodeURL, '--output', cache], { stdio: 'inherit' });
}
if (await hashFile(cache) !== expectedNodeHash) throw Error('Node.js SHA-256 verification failed');
await copyFile(cache, path.join(target, 'runtime/node.exe'));
execFileSync('curl', ['--fail', '--location', '--silent', '--show-error', '--connect-timeout', '20', '--max-time', '60', `https://nodejs.org/dist/v${version}/SHASUMS256.txt`, '--output', path.join(target, 'licenses/node-SHASUMS256.txt')]);
const officialSums = await readFile(path.join(target, 'licenses/node-SHASUMS256.txt'), 'utf8');
if (!officialSums.includes(`${expectedNodeHash}  win-x64/node.exe`)) throw Error('Pinned runtime hash differs from official release manifest');
execFileSync('curl', ['--fail', '--location', '--silent', '--show-error', '--connect-timeout', '20', '--max-time', '60', `https://raw.githubusercontent.com/nodejs/node/v${version}/LICENSE`, '--output', path.join(target, 'licenses/node-LICENSE.txt')]);
await copyFile(path.join(app, 'THIRD_PARTY_NOTICES.md'), path.join(target, 'THIRD_PARTY_NOTICES.md'));
const packages = ['react', 'react-dom', 'scheduler', 'three', '@phosphor-icons/react', 'd3-geo', 'd3-array', 'internmap', 'topojson-client'];
const dependencyLicenses = [];
for (const name of packages) {
  const dir = path.join(app, 'node_modules', name);
  const metadata = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
  const license = (await readdir(dir)).find(name => /^licen[sc]e(?:\.|$)/i.test(name));
  if (!license) throw Error(`Missing dependency license: ${name}`);
  const dest = name.replaceAll('/', '_').replace('@', '') + '-LICENSE.txt';
  await copyFile(path.join(dir, license), path.join(target, 'licenses', dest));
  dependencyLicenses.push({ name, version: metadata.version, license: metadata.license, file: dest });
}
await writeFile(path.join(target, 'licenses/dependencies.json'), JSON.stringify(dependencyLicenses, null, 2) + '\n');
// Human-readable instructions also open correctly in older Windows Notepad.
const instructions = await readFile(path.join(target, 'README.txt'), 'utf8');
await writeFile(path.join(target, 'README.txt'), '\uFEFF' + instructions.replace(/\r?\n/g, '\r\n'));
const files = {};
for (const name of await filesIn(target)) {
  if (name === 'settings.json') continue; // Operator-editable, deliberately excluded.
  files[name] = await hashFile(path.join(target, name));
}
const manifest = {
  packageId: packageName, createdAt: new Date().toISOString(), sourceCommit: commit,
  sourceHasUncommittedChanges: !!execFileSync('git', ['status', '--porcelain'], { cwd: repo, encoding: 'utf8' }).trim(),
  target: 'Windows 10/11 x64', runtime: { version, url: nodeURL, sha256: expectedNodeHash },
  files,
};
await writeFile(path.join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
execFileSync(process.execPath, [path.join(target, 'verify.mjs')], { stdio: 'inherit' });
const zip = path.join(output, packageName + '.zip');
execFileSync('zip', ['-q', '-r', zip, packageName], { cwd: output, stdio: 'inherit' });
const zipHash = await hashFile(zip);
await writeFile(zip + '.sha256', `${zipHash}  ${path.basename(zip)}\n`);
console.log(JSON.stringify({ directory: target, zip, bytes: (await lstat(zip)).size, sha256: zipHash, files: Object.keys(files).length }, null, 2));
