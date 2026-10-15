/* global document, window */
// Real ephemeral browser; never retain screenshot/trace/video/profile/raw DOM artifacts.
import assert from 'node:assert/strict';
import { URL } from 'node:url';
import console from 'node:console';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const names = ['index.html', 'app.mjs', 'calculate.mjs', 'style.css'];
const files = new Map(
  await Promise.all(
    names.map(async (name) => [
      name,
      await readFile(
        new URL(`../../assets/descriptor-demo/${name}`, import.meta.url),
      ),
    ]),
  ),
);
const server = createServer((request, response) => {
  const name =
    request.url === '/'
      ? 'index.html'
      : request.url.replace('/assets/descriptor-demo/', '');
  if (!files.has(name)) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader(
    'Content-Type',
    name.endsWith('.html')
      ? 'text/html'
      : name.endsWith('.css')
        ? 'text/css'
        : 'text/javascript',
  );
  response.end(files.get(name));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let errors = 0;
  page.on('pageerror', () => errors++);
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  assert.equal(await page.locator('#total').textContent(), '90.00');
  await page.getByLabel('Quantity', { exact: true }).fill('9');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  assert.equal(
    await page.locator('#discount-note').textContent(),
    'No quantity discount.',
  );
  await page.getByLabel('Quantity', { exact: true }).fill('1.5');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  assert(
    (await page.getByRole('alert').textContent()).includes('whole quantity'),
  );
  assert.equal(
    await page.locator('#discount-note').textContent(),
    'Correct the inputs to calculate a total.',
  );
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
  }
  await page.getByLabel('Quantity', { exact: true }).focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator(':focus').getAttribute('id'), 'unit-price');
  assert.equal(errors, 0);
  console.log(
    'W04 real Chromium: calculation/validation, labels, keyboard and 4 viewport widths PASS; no artifacts retained.',
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
