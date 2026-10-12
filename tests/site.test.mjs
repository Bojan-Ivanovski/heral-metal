import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const dist = path.resolve('dist');
const repository = process.env.GITHUB_REPOSITORY || 'Bojan-Ivanovski/heral-metal';
const [owner, name] = repository.split('/');
const base = process.env.BASE_PATH || (name === `${owner}.github.io` ? '' : `/${name}`);
const site = new URL(process.env.SITE_URL || `https://${owner}.github.io`).origin;
async function walk(dir) { return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat(); }
const files = await walk(dist);
const htmlFiles = files.filter(f => f.endsWith('.html'));
const html = await Promise.all(htmlFiles.map(async f => [f, await readFile(f, 'utf8')]));
test('all 20 language routes and custom 404 are built with unique metadata', () => {
  assert.equal(htmlFiles.length, 21);
  const titles = new Set();
  for (const [file, text] of html) {
    assert.equal((text.match(/<h1(?:\s|>)/g) || []).length, 1, `${file}: one h1`);
    assert.match(text, /<html lang="(?:mk|en)"/);
    const title = text.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title); assert.ok(!titles.has(title), `duplicate title: ${title}`); titles.add(title);
    assert.match(text, /<meta name="description" content="[^"]+"/);
    assert.ok(text.includes(`rel="canonical" href="${site}${base}/`), `${file}: canonical path`);
    assert.match(text, /property="og:image"/);
    assert.match(text, /name="twitter:card"/);
    const json = text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(json); assert.equal(JSON.parse(json)['@context'], 'https://schema.org');
  }
});
test('every local link, image source, responsive image and script resolves under the repository path', async () => {
  for (const [file, text] of html) {
    const links = [...text.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
    for (const match of text.matchAll(/srcset="([^"]+)"/g)) links.push(...match[1].split(',').map(s => s.trim().split(/\s+/)[0]));
    for (const link of links) {
      if (/^(https?:|mailto:|data:)/.test(link)) continue;
      if (link.startsWith('#')) { assert.ok(text.includes(`id="${link.slice(1)}"`), `${file}: missing anchor ${link}`); continue; }
      assert.ok(link.startsWith(`${base}/`), `${file}: incorrect base in ${link}`);
      const url = new URL(link, site);
      let local = path.join(dist, decodeURIComponent(url.pathname.slice(base.length)));
      if (url.pathname.endsWith('/')) local = path.join(local, 'index.html');
      assert.ok((await stat(local)).size > 0, `${file}: missing ${link}`);
    }
  }
});
test('sitemap lists all localized pages and the correct hosting URL', async () => {
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 20);
  assert.ok(sitemap.includes(`${site}${base}/en/quote/`));
  assert.ok(!sitemap.includes('404'));
  assert.ok((await readFile(path.join(dist, 'robots.txt'), 'utf8')).includes(`${site}${base}/sitemap.xml`));
});
test('every original Figma asset is present and all style assets resolve', async () => {
  const sources = (await walk(path.resolve('src/assets'))).filter(f => f.endsWith('.png'));
  assert.equal(sources.length, 11);
  for (const source of sources) assert.ok((await stat(source)).size > 0);
  for (const css of files.filter(f => f.endsWith('.css'))) {
    const text = await readFile(css, 'utf8');
    for (const m of text.matchAll(/url\(([^)]+)\)/g)) {
      const url = m[1].replace(/["']/g, '');
      if (url.startsWith('data:')) continue;
      assert.ok(url.startsWith(`${base}/`), `CSS asset missing base: ${url}`);
      assert.ok((await stat(path.join(dist, url.slice(base.length)))).size > 0);
    }
  }
});
