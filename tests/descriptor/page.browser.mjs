/* global document, window */
import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import {
  descriptorFixture,
  fixtureTargets,
  fixtureId,
} from '../../dist/descriptor/fixture.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { writeBundle } from '../../dist/descriptor/store.js';
import { storageFixture } from '../fixtures/storage.mjs';
test('W11 page/component/source navigation is authorized, inert and keyboard dismissible', async (t) => {
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
  const entry = page.getByRole('button', {
    name: 'Page documentation',
    exact: true,
  });
  await entry.click();
  const panel = page.getByRole('region', {
    name: 'Page documentation',
    exact: true,
  });
  await panel
    .getByRole('heading', { name: 'Purpose', exact: true })
    .first()
    .waitFor();
  for (const field of [
    'Inputs',
    'Rules',
    'Outputs',
    'Workflows',
    'Limitations',
  ])
    assert(
      await panel
        .getByRole('heading', { name: field, exact: true })
        .first()
        .count(),
    );
  await panel.locator('summary').filter({ hasText: 'Calculate' }).click();
  assert((await panel.textContent()).includes('Authored documentation'));
  await panel
    .getByRole('button', { name: 'Open component: Calculate', exact: true })
    .click();
  const component = page.getByRole('region', {
    name: 'Component documentation',
    exact: true,
  });
  await component
    .getByRole('heading', { name: 'code-verified · current', exact: true })
    .waitFor();
  const citation = component
    .getByRole('button')
    .filter({ hasText: 'Synthetic code-verified' });
  await citation.click();
  const source = page.getByRole('region', { name: 'Source inspector' });
  await source.getByText('Retained excerpt', { exact: true }).waitFor();
  assert((await source.textContent()).includes('calculate.mjs#calculate'));
  assert((await source.textContent()).includes('Supplied revision:'));
  assert(
    (await source.locator('pre').textContent()).includes(
      'export function calculate',
    ),
  );
  await page.keyboard.press('Escape');
  assert(await source.isHidden());
  assert(await citation.evaluate((el) => el === document.activeElement));
  assert(await component.isVisible());
  await page.keyboard.press('Escape');
  assert(await component.isHidden());
  assert(await panel.isVisible());
  await page.keyboard.press('Escape');
  assert(await panel.isHidden());
  assert(await entry.evaluate((el) => el === document.activeElement));
  const foreign = await page.request.get(
    `${service.readURL}/api/source?context=0&target=${fixtureTargets.calculate}&source=${fixtureId('scope-2:documented:source')}`,
  );
  assert.equal(foreign.status(), 404);
  assert(!JSON.stringify(await foreign.json()).includes('editor'));
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  await component
    .getByRole('heading', { name: 'Calculate', exact: true })
    .waitFor();
  await page.route('**/api/source?*', (route) =>
    route.fulfill({ status: 404, json: { error: 'NOT_FOUND' } }),
  );
  await component
    .getByRole('button')
    .filter({ hasText: 'Synthetic documented' })
    .click();
  await source
    .getByText('Source unavailable or restricted.', { exact: true })
    .waitFor();
  assert(!(await source.textContent()).includes('Synthetic documented'));
  await page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('2');
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  assert(await source.isHidden());
  assert.equal(await source.locator('pre').count(), 0);
  assert.equal(await page.locator('#total').textContent(), 'Not calculated');
  assert.equal(f.store.revision, 1);
  assert.equal(errors, 0);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
});
