import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.pdf': 'application/pdf',
  '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const policy = "default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; font-src 'self' data:; frame-src 'self' blob:; worker-src 'self' blob:; object-src 'self' blob:; base-uri 'self'";

// Bound to loopback by the launcher. Serve only real files inside site/.
export async function createShowroomServer(site, identity) {
  const root = await realpath(site);
  return http.createServer(async (req, res) => {
    const reply = (code, body) => { res.writeHead(code); res.end(req.method === 'HEAD' ? undefined : body); };
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Security-Policy', policy);
    try {
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.setHeader('Allow', 'GET, HEAD'); return reply(405, 'Method not allowed');
      }
      const name = decodeURIComponent((req.url || '/').split('?')[0]);
      if (name === '/__offline/health') {
        res.setHeader('Content-Type', 'application/json');
        return reply(200, JSON.stringify({ app: 'paramont-offline', identity }));
      }
      if (!name.startsWith('/') || /[\\\0:]/.test(name) || name.split('/').some(p => p === '..' || p.startsWith('.'))) {
        return reply(403, 'Forbidden');
      }
      const file = await realpath(path.join(root, name === '/' ? 'index.html' : name));
      if (!file.startsWith(root + path.sep)) return reply(403, 'Forbidden');
      const info = await stat(file);
      if (!info.isFile()) return reply(404, 'Not found');
      let start = 0, end = info.size - 1, status = 200;
      if (req.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (match && (match[1] || match[2])) {
          start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
          end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
        }
        if (!match || !(match[1] || match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
          res.setHeader('Content-Range', `bytes */${info.size}`); return reply(416, 'Invalid range');
        }
        status = 206;
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`);
      }
      res.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', Math.max(0, end - start + 1));
      res.writeHead(status);
      if (req.method === 'HEAD' || !info.size) return res.end();
      const stream = createReadStream(file, { start, end });
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) {
      if (res.headersSent) return res.destroy();
      reply(error instanceof URIError ? 400 : ['ENOENT', 'ENOTDIR'].includes(error.code) ? 404 : 500, 'File unavailable');
    }
  });
}
