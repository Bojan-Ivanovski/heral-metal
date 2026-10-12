import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
export function createHandler(root = path.resolve('dist'), base = '/heral-metal') {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
  return async (request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); response.end(); return; }
    if (pathname === base) { response.writeHead(301, { Location: `${base}/` }); response.end(); return; }
    const inBase = pathname.startsWith(`${base}/`);
    let filename = path.join(root, inBase ? pathname.slice(base.length) : '404.html');
    if (filename.endsWith('/')) filename += 'index.html';
    if (!filename.startsWith(`${root}/`)) { response.writeHead(403); response.end(); return; }
    let body;
    let status = inBase ? 200 : 404;
    let type = types[path.extname(filename)] || 'application/octet-stream';
    try { body = await readFile(filename); }
    catch {
      status = 404;
      type = types['.html'];
      try { body = await readFile(path.join(root, '404.html')); }
      catch { status = 500; type = 'text/plain'; body = 'Production build is missing. Run npm run build.'; }
    }
    response.writeHead(status, { 'Content-Type': type });
    response.end(request.method === 'HEAD' ? undefined : body);
  };
}
export async function serveDist(port = 0, base = '/heral-metal') {
  const server = http.createServer(createHandler(path.resolve('dist'), base));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}${base}/` };
}
