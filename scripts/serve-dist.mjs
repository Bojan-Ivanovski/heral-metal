import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
export async function serveDist(port = 0, base = '/heral-metal') {
  const root = path.resolve('dist');
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
  const server = http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === base) { response.writeHead(301, { Location: `${base}/` }); response.end(); return; }
    let filename = path.join(root, pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : '404.html');
    if (filename.endsWith('/')) filename += 'index.html';
    if (!filename.startsWith(`${root}/`)) { response.writeHead(403); response.end(); return; }
    try { response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream' }); response.end(await readFile(filename)); }
    catch { response.writeHead(404, { 'Content-Type': 'text/html' }); response.end(await readFile(path.join(root, '404.html'))); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}${base}/` };
}
