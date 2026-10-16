/* global window, document */
import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import {
  descriptorFixture,
  fixtureTargets,
} from '../../dist/descriptor/fixture.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W10 component hover/focus/Details are read-only, keyboard dismissible and scope isolated', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  let errors = 0;
  page.on('pageerror', () => errors++);
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors++;
  });
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page.evaluate(() => {
    window.actions = 0;
    window.privateReads = 0;
    document.addEventListener('fixture-calculated', () => window.actions++);
    const input = document.createElement('input');
    input.id = 'unrelated';
    input.value = 'PRIVATE_FIELD_SENTINEL';
    Object.defineProperty(input, 'value', {
      get() {
        window.privateReads++;
        throw new Error('UNRELATED_VALUE_READ');
      },
    });
    document.body.append(input);
  });
  await page.getByRole('button', { name: 'Calculate', exact: true }).hover();
  const summary = page.getByRole('region', { name: 'Component summary' });
  // Native section has an accessible name and exposes name, purpose, inputs and action summary.
  await summary.getByText('Calculate', { exact: true }).waitFor();
  assert((await summary.textContent()).includes('Inputs:'));
  await page.getByRole('button', { name: 'Calculate', exact: true }).focus();
  await summary.getByText('Calculate', { exact: true }).waitFor();
  const details = page.getByRole('button', {
    name: 'Details for calculate',
    exact: true,
  });
  await details.click();
  const panel = page.getByRole('region', { name: 'Component documentation' });
  await panel
    .getByRole('heading', { name: 'Calculate', exact: true })
    .waitFor();
  assert((await panel.textContent()).includes('code-verified'));
  assert((await panel.textContent()).includes('supplied revision'));
  assert.equal(await page.evaluate(() => window.actions), 0);
  assert.equal(await page.evaluate(() => window.privateReads), 0);
  await page.keyboard.press('Escape');
  assert(await panel.isHidden());
  assert(await details.evaluate((el) => el === document.activeElement));
  await page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('8');
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  await panel.getByText('documented · needs_review', { exact: true }).waitFor();
  assert((await panel.textContent()).includes('Needs review:'));
  await page
    .getByRole('button', { name: 'Close documentation', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('5');
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  await panel
    .getByText(
      'Unresolved conflict: related claims disagree; no reconciliation is established.',
      { exact: true },
    )
    .first()
    .waitFor();
  assert.equal(
    await panel
      .getByText(
        'Unresolved conflict: related claims disagree; no reconciliation is established.',
        { exact: true },
      )
      .count(),
    2,
  );
  await page
    .getByRole('button', { name: 'Close documentation', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('6');
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  assert.equal(
    await page
      .getByRole('button', { name: 'Details for calculate', exact: true })
      .count(),
    0,
  );
  assert(
    (
      await page
        .getByRole('list', { name: 'Documentation target mappings' })
        .textContent()
    ).includes('missing'),
  );
  assert.equal(f.store.revision, 1);
  assert(
    !JSON.stringify(readBundle(f.store, f.base.app_id)).includes(
      'PRIVATE_FIELD_SENTINEL',
    ),
  );
  assert.equal(errors, 0);
});
test('W10 touch Details exposes the same component without firing Calculate', async (t) => {
  const f = await storageFixture(t);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 0,
    bundle: await descriptorFixture(f.base.project_id, f.base.app_id),
  });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 320, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .tap();
  await page
    .getByRole('region', { name: 'Component documentation' })
    .getByRole('heading', { name: 'Calculate', exact: true })
    .waitFor();
  assert.equal(await page.locator('#total').textContent(), 'Not calculated');
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
});

test('W10 loading, empty and failed reads remain explicit without host effects', async (t) => {
  const f = await storageFixture(t);
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 0,
    bundle: await descriptorFixture(f.base.project_id, f.base.app_id),
  });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  let errors = 0;
  page.on('pageerror', () => errors++);
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  let mode = 'held';
  const releases = [];
  await page.route(
    (url) =>
      url.pathname === '/api/evidence' &&
      url.searchParams.get('target') === fixtureTargets.calculate,
    async (route) => {
      if (mode === 'error') {
        await route.fulfill({
          status: 503,
          json: { error: 'SERVICE_UNAVAILABLE' },
        });
        return;
      }
      const response = await route.fetch(),
        data = await response.json();
      if (mode === 'held')
        await new Promise((resolve) => releases.push(resolve));
      await route.fulfill({
        json: {
          ...data,
          documents: [],
          claims: [],
          sources: [],
          missing: ['APPLICABLE_CLAIMS_MISSING'],
        },
      });
    },
  );
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  const panel = page.getByRole('region', { name: 'Component documentation' });
  await panel
    .getByText('Loading component documentation…', { exact: true })
    .waitFor();
  mode = 'empty';
  releases.forEach((release) => release());
  await panel
    .getByText(
      'Documentation is empty or unavailable for this target and scope.',
      { exact: true },
    )
    .waitFor();
  await page
    .getByRole('button', { name: 'Close documentation', exact: true })
    .click();
  mode = 'error';
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  await panel
    .getByText(
      'Component documentation unavailable. Retry after checking the local service.',
      { exact: true },
    )
    .waitFor();
  assert.equal(await page.locator('#total').textContent(), 'Not calculated');
  assert.equal(f.store.revision, 1);
  assert.equal(errors, 0);
});
