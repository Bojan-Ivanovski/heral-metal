import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';
import { serveDist } from './serve-dist.mjs';
const { server, url } = await serveDist();
await mkdir('test-results', { recursive: true });
let chrome;
const results = [];
try {
  chrome = await chromeLauncher.launch({ chromePath: process.env.BROWSER_EXECUTABLE || undefined, chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] });
  for (const route of ['', 'about/', 'quote/', 'en/services/']) {
    const audit = await lighthouse(url + route, { port: chrome.port, output: ['json', 'html'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
    const name = route.replace(/\//g, '-') || 'home';
    await writeFile(`test-results/lighthouse-${name}.json`, audit.report[0]);
    await writeFile(`test-results/lighthouse-${name}.html`, audit.report[1]);
    results.push({ route: route || 'home', scores: Object.fromEntries(Object.entries(audit.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])), metrics: { lcp: audit.lhr.audits['largest-contentful-paint'].numericValue, cls: audit.lhr.audits['cumulative-layout-shift'].numericValue, tbt: audit.lhr.audits['total-blocking-time'].numericValue } });
  }
  await writeFile('test-results/performance-summary.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { chrome?.kill(); await new Promise(resolve => server.close(resolve)); }
