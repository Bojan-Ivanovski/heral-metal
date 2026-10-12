import { mkdir, writeFile } from 'node:fs/promises';
const [owner, name] = (process.env.GITHUB_REPOSITORY || 'Bojan-Ivanovski/heral-metal').split('/');
const site = process.env.SITE_URL || `https://${owner}.github.io`;
const base = process.env.BASE_PATH || (name === `${owner}.github.io` ? '' : `/${name}`);
const root = new URL(`${base}/`, site).href;
const pages = ['', 'services/', 'services/metal-structures/', 'services/machine-maintenance/', 'services/gas-pipelines/', 'projects/', 'about/', 'contact/', 'quote/', 'privacy/'];
const routes = [...pages, ...pages.map(page => `en/${page}`), 'sitemap.xml', 'robots.txt', 'fonts/arimo.woff2', 'fonts/roboto-condensed.woff2'];
await mkdir('test-results', { recursive: true });
const results = [];
for (const route of routes) {
  const url = root + route;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  results.push({ url, status: response.status });
  if (!response.ok) throw new Error(`Live request failed: ${url} returned ${response.status}`);
  if (pages.includes(route) || route.startsWith('en/')) {
    const text = await response.text();
    if (!text.includes('<h1') || !text.includes('Heral Metal') || !text.includes(`rel="canonical" href="${url}"`)) throw new Error(`Incorrect live HTML or canonical URL: ${url}`);
    if (!route) await writeFile('test-results/live-home.html', text);
  }
}
await writeFile('test-results/live-check.json', JSON.stringify({ verified: true, root, results }, null, 2));
console.log(`Verified ${results.length} live routes and resources at ${root}`);
