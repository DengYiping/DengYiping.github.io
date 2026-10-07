import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.split('/').some(segment => segment.startsWith('.'))) throw new Error('Private path');
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(path)).isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        return response.end();
      }
      path = resolve(path, 'index.html');
    }
    const body = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    const body = await readFile(resolve(root, '404.html')).catch(() => Buffer.from('Not found'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : body);
  }
}).listen(port, '127.0.0.1', () => console.log(`Loudcoder preview: http://127.0.0.1:${port}`));
