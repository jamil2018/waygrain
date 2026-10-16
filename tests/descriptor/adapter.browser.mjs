/* global window, document */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import test from 'node:test';
import { chromium } from 'playwright';
test('W09 explicit registrations fail on duplicate/missing keys, retain identity and leave host inputs/actions untouched', async (t) => {
  const code = await readFile(
    new URL('../../dist/descriptor/ui/adapter.js', import.meta.url),
  );
  const server = createServer((req, res) => {
    res.setHeader(
      'Content-Type',
      req.url === '/adapter.js' ? 'text/javascript' : 'text/html',
    );
    res.end(
      req.url === '/adapter.js'
        ? code
        : '<!doctype html><html lang="en"><button id="host" type="button">Calculate</button><input id="private" value="synthetic-private-sentinel"><div id="docs"></div></html>',
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(async () => {
    const { mountTargetAdapter } = await import('/adapter.js');
    window.hostActions = 0;
    window.inputReads = 0;
    window.summaries = [];
    window.details = [];
    const host = document.querySelector('#host'),
      input = document.querySelector('#private');
    host.addEventListener('click', () => window.hostActions++);
    Object.defineProperty(input, 'value', {
      get() {
        window.inputReads++;
        throw new Error('HOST_VALUE_READ');
      },
    });
    window.adapter = mountTargetAdapter(
      document.querySelector('#docs'),
      { read: async (id) => ({ target_id: id }) },
      {
        summary: (id) => window.summaries.push(id),
        details: (id) => window.details.push(id),
        reset: () => {},
      },
    );
    window.unregister = window.adapter.register('calculate', host);
    window.adapter.register('quantity', input);
    window.mappings = [
      {
        target_id: 'stable-calculate-id',
        target_key: 'calculate',
        status: 'resolved',
      },
      {
        target_id: 'stable-quantity-id',
        target_key: 'quantity',
        status: 'resolved',
      },
      { target_id: 'missing-id', target_key: 'absent', status: 'resolved' },
    ];
    window.adapter.update(window.mappings);
  });
  assert(
    (
      await page
        .getByRole('list', { name: 'Documentation target mappings' })
        .textContent()
    ).includes('absent: missing'),
  );
  await page.getByRole('button', { name: 'Calculate', exact: true }).hover();
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  assert.equal(await page.evaluate(() => window.hostActions), 0);
  assert.equal(
    await page.evaluate(() => window.details.at(-1)),
    'stable-calculate-id',
  );
  await page.evaluate(() => {
    document.querySelector('#host').textContent = 'Calculate total';
  });
  await page
    .getByRole('button', { name: 'Calculate total', exact: true })
    .focus();
  assert.equal(
    await page.evaluate(() => window.summaries.at(-1)),
    'stable-calculate-id',
  );
  await page.evaluate(() => {
    const duplicate = document.createElement('button');
    duplicate.id = 'duplicate';
    document.body.append(duplicate);
    window.removeDuplicate = window.adapter.register('calculate', duplicate);
  });
  assert(
    (
      await page
        .getByRole('list', { name: 'Documentation target mappings' })
        .textContent()
    ).includes('calculate: ambiguous'),
  );
  assert.equal(
    await page
      .getByRole('button', { name: 'Details for calculate', exact: true })
      .count(),
    0,
  );
  await page.evaluate(() => window.removeDuplicate());
  assert.equal(
    await page
      .getByRole('button', { name: 'Details for calculate', exact: true })
      .count(),
    1,
  );
  await page.evaluate(() => {
    window.adapter.update([
      ...window.mappings,
      { target_id: 'other-id', target_key: 'calculate', status: 'resolved' },
    ]);
  });
  assert.equal(
    await page
      .getByRole('button', { name: 'Details for calculate', exact: true })
      .count(),
    0,
  );
  await page.evaluate(async () => {
    window.adapter.update(window.mappings, {
      read: () =>
        new Promise((resolve) => {
          window.finishRead = resolve;
        }),
    });
    const pending = window.adapter.describe('stable-calculate-id');
    window.adapter.update(window.mappings);
    window.finishRead({ target_id: 'stable-calculate-id' });
    window.stale = await pending;
  });
  assert.equal(await page.evaluate(() => window.stale), null);
  await page
    .getByRole('button', { name: 'Details for quantity', exact: true })
    .focus();
  assert.equal(await page.evaluate(() => window.inputReads), 0);
  await page.evaluate(() => {
    window.adapter.unmount();
    window.summaries = [];
  });
  await page
    .getByRole('button', { name: 'Calculate total', exact: true })
    .hover();
  assert.equal(await page.evaluate(() => window.summaries.length), 0);
  await page
    .getByRole('button', { name: 'Calculate total', exact: true })
    .click();
  assert.equal(await page.evaluate(() => window.hostActions), 1);
  assert.equal(
    await page
      .getByRole('list', { name: 'Documentation target mappings' })
      .count(),
    0,
  );
  await page.evaluate(async () => {
    const { mountTargetAdapter } = await import('/adapter.js');
    window.adapter = mountTargetAdapter(
      document.querySelector('#docs'),
      { read: async (id) => ({ target_id: id }) },
      {
        summary: (id) => window.summaries.push(id),
        details: () => {},
        reset: () => {},
      },
    );
    window.adapter.register('calculate', document.querySelector('#host'));
    window.adapter.update(window.mappings);
    const removed = document.querySelector('#host');
    removed.remove();
    window.adapter.refresh();
    window.removedHost = removed;
  });
  assert(
    (
      await page
        .getByRole('list', { name: 'Documentation target mappings' })
        .textContent()
    ).includes('calculate: missing'),
  );
  await page.evaluate(() => {
    const wrapper = document.createElement('section');
    document.body.append(wrapper);
    wrapper.append(window.removedHost);
    window.adapter.register('page', wrapper);
    window.adapter.update([
      ...window.mappings,
      { target_id: 'page-id', target_key: 'page', status: 'resolved' },
    ]);
    window.summaries = [];
  });
  await page
    .getByRole('button', { name: 'Calculate total', exact: true })
    .focus();
  assert.deepEqual(await page.evaluate(() => window.summaries), [
    'stable-calculate-id',
  ]);
  await page.evaluate(() => window.adapter.unmount());
});
