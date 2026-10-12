import { chromium } from 'playwright';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { serveDist } from './serve-dist.mjs';
const widths = [320, 375, 430, 768, 1024, 1280, 1440, 1920, 2560, 3440];
const routes = ['', 'services/', 'services/metal-structures/', 'services/machine-maintenance/', 'services/gas-pipelines/', 'projects/', 'about/', 'contact/', 'quote/', 'privacy/'];
const allRoutes = [...routes, ...routes.map(route => `en/${route}`)];
const output = 'test-results';
await mkdir(output, { recursive: true });
const { server, url } = await serveDist();
let browser;
const results = { completed: false, error: null, viewports: widths, routes: allRoutes, overflowChecks: 0, accessibilityChecks: 0, runtimeErrors: [], failedResources: [], violations: [], layoutFailures: [], functional: [] };
try {
  browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  page.on('pageerror', error => results.runtimeErrors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(url) && response.status() >= 400 && !response.url().includes('missing-page')) results.failedResources.push(response.url()); });
  const axe = await readFile('node_modules/axe-core/axe.min.js', 'utf8');
  await writeFile(`${output}/browser-qa.json`, JSON.stringify(results, null, 2));
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(url);
  const menu = page.locator('.mobile-menu');
  await menu.locator('summary').click();
  await page.waitForFunction(() => document.querySelector('.mobile-menu').open);
  assert.equal(await menu.getAttribute('open'), '');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.mobile-menu').open);
  assert.equal(await menu.getAttribute('open'), null);
  assert.equal(await menu.locator('summary').evaluate(el => el === document.activeElement), true);
  await menu.locator('summary').click();
  await menu.locator('a[href$="about/"]').click();
  await page.waitForURL('**/about/');
  assert.ok(page.url().endsWith('/about/'));
  results.functional.push('Mobile menu, keyboard Escape, focus restoration and navigation');
  await page.goto(url + 'en/projects/');
  const trigger = page.locator('[data-gallery-index="0"]');
  await trigger.click();
  assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#gallery-position').textContent(), '2 / 6');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog').open);
  assert.equal(await page.locator('dialog').evaluate(el => el.open), false);
  await page.waitForFunction(() => document.activeElement?.matches('[data-gallery-index="0"]'));
  assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
  results.functional.push('Gallery open, arrow navigation, Escape and focus restoration');
  await page.goto(url + 'en/quote/?service=gas-pipelines');
  assert.equal(await page.locator('[value="gas-pipelines"]').isChecked(), true);
  await page.locator('.quote-anchor').click();
  let submissions = 0;
  await page.route('https://api.web3forms.com/submit', async intercepted => { submissions++; await intercepted.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
  await page.locator('[type="submit"]').click();
  assert.equal(submissions, 0, 'Invalid forms must not submit');
  async function fillForm() {
    await page.locator('#full-name').fill('QA Test');
    await page.locator('#email').fill('qa@example.com');
    await page.locator('#description').fill('Automated test of validation and submission states. No real email is sent.');
    await page.locator('#consent').check();
  }
  await fillForm();
  await page.locator('#attachment').setInputFiles({ name: 'bad.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('invalid attachment') });
  assert.ok(await page.locator('#file-status').textContent());
  await page.locator('[type="submit"]').click();
  assert.equal(submissions, 0);
  await page.locator('#remove-file').click();
  await page.locator('#attachment').setInputFiles({ name: 'drawing.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  await page.locator('[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#form-status').classList.contains('success-text'));
  assert.equal(submissions, 1);
  assert.equal(await page.locator('#full-name').inputValue(), '');
  await page.unroute('https://api.web3forms.com/submit');
  await page.route('https://api.web3forms.com/submit', intercepted => intercepted.fulfill({ status: 400, contentType: 'application/json', body: '{"success":false}' }));
  await fillForm();
  await page.locator('[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#form-status').classList.contains('error-text'));
  assert.equal(await page.locator('#full-name').inputValue(), 'QA Test');
  assert.equal(await page.locator('[type="submit"]').isEnabled(), true);
  await page.unroute('https://api.web3forms.com/submit');
  await page.route('https://api.web3forms.com/submit', intercepted => intercepted.abort('failed'));
  await page.locator('[type="submit"]').click();
  await page.waitForFunction(() => document.querySelector('#quote-form').getAttribute('aria-busy') === null);
  assert.equal(await page.locator('#full-name').inputValue(), 'QA Test');
  results.functional.push('Service preselection; required-field and file validation; mocked success, provider rejection and network failure; values retained after failure');
  await page.goto(url + 'en/contact/');
  const faq = page.locator('.faq details').first();
  await faq.locator('summary').click();
  assert.equal(await faq.getAttribute('open'), '');
  const missingPage = await page.goto(url + 'missing-page/');
  assert.equal(missingPage.status(), 404);
  assert.equal(await page.locator('h1').textContent(), 'Страницата не е пронајдена.');
  results.functional.push('FAQ disclosure and 404 response');
  await page.setViewportSize({ width: 720, height: 500 });
  for (const route of ['', 'quote/', 'about/']) {
    await page.goto(url + route);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  results.functional.push('Layout at 720 CSS pixels, equivalent to 200% zoom on a 1440px viewport');
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of allRoutes) {
      await page.goto(url + route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => { await Promise.all([...document.images].map(async img => { img.loading = 'eager'; try { await img.decode(); } catch {} })); });
      const layout = await page.evaluate(() => {
        const root = document.documentElement;
        const overflow = root.scrollWidth > root.clientWidth + 1;
        const broken = [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
        const images = [...document.images].filter(img => img.getBoundingClientRect().width > 0).map(img => ({ src: img.currentSrc, width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height }));
        // Text ranges exclude decorative pseudo-elements; scrollWidth includes them.
        const clippedText = [...document.querySelectorAll('h1,h2,h3,p,a.button')].filter(el => {
          const bounds = el.getBoundingClientRect();
          if (!bounds.width || !bounds.height || el.closest('details:not([open])')) return false;
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            if (!node.textContent.trim()) continue;
            const range = document.createRange(); range.selectNodeContents(node);
            for (const rect of range.getClientRects()) if (rect.left < bounds.left - 2 || rect.right > bounds.right + 2) return true;
          }
          return false;
        }).map(el => ({ text: el.textContent, width: el.clientWidth, scrollWidth: el.scrollWidth }));
        return { overflow, broken, images, clippedText };
      });
      if (layout.overflow || layout.broken.length || layout.clippedText.length) {
        results.layoutFailures.push({ route, width, layout });
        await page.screenshot({ path: `${output}/failure-${route.replace(/\//g, '-') || 'home'}-${width}.png`, fullPage: true });
      }
      results.overflowChecks++;
      if ([375, 1440].includes(width)) {
        await page.addScriptTag({ content: axe });
        const audit = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
        results.accessibilityChecks++;
        if (audit.violations.length) results.violations.push({ route, width, violations: audit.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) });
      }
      if ([375, 1440, 3440].includes(width) && ['', 'about/', 'quote/', 'services/', 'projects/'].includes(route)) await page.screenshot({ path: `${output}/${route.replace(/\//g, '-') || 'home'}-${width}.png`, fullPage: true });
    }
    await writeFile(`${output}/browser-qa.json`, JSON.stringify(results, null, 2));
    console.log(`Checked all routes at ${width}px`);
  }
  assert.deepEqual(results.runtimeErrors, [], 'No browser runtime errors');
  assert.deepEqual(results.failedResources, [], 'No failed local resources');
  assert.deepEqual(results.layoutFailures, [], 'No horizontal overflow, clipped text or broken images');
  assert.deepEqual(results.violations, [], 'No automated WCAG violations');
  results.completed = true;
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  results.error = error.message;
  const pages = browser?.contexts().flatMap(context => context.pages());
  if (pages?.length) await pages[0].screenshot({ path: `${output}/functional-failure.png`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${output}/browser-qa.json`, JSON.stringify(results, null, 2));
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
