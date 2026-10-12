import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHandler } from '../scripts/serve-dist.mjs';

test('test server sends exactly one response for missing pages, assets and malformed paths', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'heral-server-'));
  try {
    await writeFile(path.join(root, '404.html'), '<h1>Not found</h1>');
    await writeFile(path.join(root, 'index.html'), '<h1>Home</h1>');
    const handler = createHandler(root);
    async function request(url, method = 'GET') {
      const result = { status: null, headers: null, body: null, writes: 0 };
      await handler({ url, method }, {
        writeHead(status, headers) { assert.equal(result.writes++, 0, 'Headers must be sent once'); result.status = status; result.headers = headers; },
        end(body) { result.body = body?.toString(); },
      });
      return result;
    }
    const home = await request('/heral-metal/');
    assert.equal(home.status, 200);
    assert.match(home.body, /Home/);
    for (const url of ['/heral-metal/missing-page/', '/heral-metal/missing.png', '/other/']) {
      const missing = await request(url);
      assert.equal(missing.status, 404);
      assert.match(missing.body, /Not found/);
    }
    assert.equal((await request('/heral-metal')).status, 301);
    assert.equal((await request('/heral-metal/%XX')).status, 400);
    assert.equal((await request('/heral-metal/', 'HEAD')).body, undefined);
    await rm(path.join(root, '404.html'));
    assert.equal((await request('/heral-metal/missing/')).status, 500);
  } finally { await rm(root, { recursive: true, force: true }); }
});
