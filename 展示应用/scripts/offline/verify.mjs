import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
try {
  const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
  const failures = [];
  for (const [name, expected] of Object.entries(manifest.files)) {
    try {
      const file = path.resolve(root, name);
      if (!file.startsWith(root + path.sep)) throw Error('Invalid path');
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(file)) hash.update(chunk);
      if (hash.digest('hex') !== expected) failures.push(name);
    } catch { failures.push(name); }
  }
  if (failures.length) throw Error(`文件缺失或已改变，请重新完整解压部署包：\n${failures.join('\n')}`);
  console.log(`校验通过：${Object.keys(manifest.files).length} 个文件完整。settings.json 为可修改设置，不参与校验。`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
