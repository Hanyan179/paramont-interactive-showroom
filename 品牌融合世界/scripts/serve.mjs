import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const index = process.argv.indexOf('--port');
const port = index >= 0 ? Number(process.argv[index + 1]) : 5208;
const url = `http://127.0.0.1:${port}/`;
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.webm':'video/webm', '.woff2':'font/woff2' };
const open = () => { if (!process.argv.includes('--no-open') && process.platform === 'darwin') spawn('open', [url], {stdio:'ignore'}); };
await stat(resolve(root, 'index.html')).catch(() => { console.error('离线包尚未构建，请先运行「更新离线包.command」。'); process.exit(1); });
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, url).pathname);
    const target = resolve(root, pathname === '/' ? 'index.html' : '.' + pathname);
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(target);
    const contentType = mime[extname(target)] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.headers.range) {
      const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      if (!range) { res.writeHead(416); res.end(); return; }
      const start = Number(range[1]), end = Math.min(range[2] ? Number(range[2]) : data.length - 1, data.length - 1);
      if (start > end) { res.writeHead(416, {'Content-Range':`bytes */${data.length}`}); res.end(); return; }
      res.writeHead(206, {'Content-Range':`bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1});
      res.end(req.method === 'HEAD' ? undefined : data.subarray(start, end + 1));
    } else {
      res.writeHead(200, {'Content-Length':data.length});
      res.end(req.method === 'HEAD' ? undefined : data);
    }
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    const existing = await fetch(url).then(r => r.text()).catch(() => '');
    if (existing.includes('PARAMONT · 品牌融合世界')) { console.log(`展厅已在运行：${url}`); open(); process.exit(0); }
    console.error(`端口 ${port} 已被其他应用占用；未停止其他项目。可用 --port 选择另一端口。`);
  } else console.error(error.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => { console.log(`品牌融合世界：${url}\n全部内容从本地离线包读取。关闭本窗口或按 Control+C 停止。`); open(); });
