import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { serveDist } from './serve-dist.mjs';

const stage = process.argv[2] || 'before';
if (!['before', 'after'].includes(stage)) throw new Error('Choose before or after');
const output = `test-results/consistency/${stage}`;
const pages = ['', 'services/', 'services/metal-structures/', 'services/machine-maintenance/', 'services/gas-pipelines/', 'projects/', 'about/', 'contact/', 'quote/', 'privacy/'];
const routes = [...pages, ...pages.map(route => `en/${route}`), '404.html'];
const widths = [375, 768, 1440];
await mkdir(output, { recursive: true });
const { server, url } = await serveDist();
let browser;
const report = { stage, completed: false, capturedAt: new Date().toISOString(), sourceHash: createHash('sha256').update(await readFile('src/styles/global.css')).digest('hex'), pages: [] };
try {
  browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(url + route, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(async image => { image.loading = 'eager'; await image.decode().catch(() => {}); })); });
      const file = `${route.replaceAll('/', '-') || 'home'}-${width}.png`;
      await page.screenshot({ path: `${output}/${file}`, fullPage: true });
      const measurements = await page.evaluate(() => {
        const measure = element => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element); return { text: element.textContent.trim().slice(0, 110), x: rect.x, y: rect.y, width: rect.width, height: rect.height, fontSize: style.fontSize, lineHeight: style.lineHeight, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom }; };
        return { headings: [...document.querySelectorAll('h1,h2,h3')].map(measure), nav: measure(document.querySelector('.desktop-nav')), containers: [...document.querySelectorAll('main .container')].map(measure), cards: [...document.querySelectorAll('.service-card,.certificate-card')].map(measure) };
      });
      report.pages.push({ route, width, file, ...measurements });
    }
    // Contact sheets retain the whole rendered page for a route-by-route visual audit.
    for (let group = 0; group < routes.length; group += 4) {
      const cards = await Promise.all(report.pages.filter(p => p.width === width).slice(group, group + 4).map(async entry => {
        const buffer = await sharp(`${output}/${entry.file}`).resize({ width: 480 }).png().toBuffer();
        const metadata = await sharp(buffer).metadata();
        return { input: buffer, height: metadata.height };
      }));
      const height = Math.max(...cards.map(card => card.height));
      await sharp({ create: { width: cards.length * 480, height, channels: 3, background: '#deddd7' } }).composite(cards.map((card, index) => ({ input: card.input, left: index * 480, top: 0 }))).png().toFile(`${output}/sheet-${width}-${group / 4}.png`);
    }
    await writeFile(`${output}/manifest.json`, JSON.stringify(report, null, 2));
    console.log(`Captured ${routes.length} routes at ${width}px (${stage})`);
  }
  report.completed = true;
} finally {
  await writeFile(`${output}/manifest.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
