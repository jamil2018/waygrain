/* global window, document */
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import {
  descriptorFixture,
  fixtureTargets,
} from '../../dist/descriptor/fixture.js';
import { contentHash } from '../../dist/descriptor/contracts.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import { groundedAnswer } from '../../dist/descriptor/providers/validation.js';
import { storageFixture } from '../fixtures/storage.mjs';
const ten = 'Why is the total 90 for 10 items at 10 each?';
async function setup(t, options = {}) {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store, options);
  t.after(() => service.close());
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  let errors = 0;
  page.on('pageerror', () => errors++);
  await page.goto(service.readURL);
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  return { f, bundle, service, browser, page, errors: () => errors };
}
async function component(page) {
  await page
    .getByRole('button', { name: 'Details for calculate', exact: true })
    .click();
  const panel = page.getByRole('region', {
    name: 'Component documentation',
    exact: true,
  });
  const section = panel.getByRole('region', {
    name: 'Ask about this',
    exact: true,
  });
  await section
    .getByRole('status')
    .filter({ hasText: 'Ready for a scoped' })
    .waitFor();
  return section;
}
async function ask(section, question) {
  await section.getByLabel('Product question', { exact: true }).fill(question);
  await section
    .getByRole('button', { name: 'Ask about this', exact: true })
    .click();
  await section
    .getByRole('status')
    .filter({ hasText: 'Answer ready.' })
    .waitFor();
}
test('W18 component/page clarification supports scoped 10/9/tax/conflict citations without host effects or unrelated input capture', async (t) => {
  const { f, bundle, page, errors } = await setup(t);
  await page.evaluate(() => {
    window.actions = 0;
    window.privateReads = 0;
    document.addEventListener('fixture-calculated', () => window.actions++);
    const unrelated = document.createElement('input');
    unrelated.value = 'UNRELATED_QUESTION_SENTINEL';
    Object.defineProperty(unrelated, 'value', {
      get() {
        window.privateReads++;
        throw new Error('PRIVATE_READ');
      },
    });
    document.body.append(unrelated);
  });
  let section = await component(page);
  assert((await section.textContent()).includes('offline, no model'));
  await ask(section, ten);
  assert((await section.textContent()).includes('10% of 100 is 10'));
  await ask(section, 'What about 9?');
  assert(
    (await section.textContent()).includes('no quantity discount applies'),
  );
  await ask(section, 'What tax applies?');
  assert((await section.textContent()).includes('supported tax policy'));
  const citation = section
    .getByRole('button', {
      name: 'Open cited documented source 1',
      exact: true,
    })
    .first();
  await citation.click();
  await page
    .getByRole('region', { name: 'Source inspector' })
    .getByText('Retained excerpt', { exact: true })
    .waitFor();
  await page.keyboard.press('Escape');
  assert(await citation.evaluate((el) => el === document.activeElement));
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Page documentation', exact: true })
    .click();
  section = page
    .getByRole('region', { name: 'Page documentation', exact: true })
    .getByRole('region', { name: 'Ask about this', exact: true });
  await section
    .getByRole('status')
    .filter({ hasText: 'Ready for a scoped' })
    .waitFor();
  await ask(section, ten);
  await ask(section, 'What about 9?');
  assert(
    (await section.textContent()).includes('no quantity discount applies'),
  );
  await ask(section, 'What tax applies?');
  assert((await section.textContent()).includes('supported tax policy'));
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('5');
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  section = await component(page);
  await ask(section, ten);
  assert((await section.textContent()).includes('Conflicting evidence'));
  assert((await section.textContent()).includes('20%'));
  assert.equal(
    await section
      .getByRole('button')
      .filter({ hasText: 'Open cited documented source' })
      .count(),
    2,
  );
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Page documentation', exact: true })
    .click();
  section = page
    .getByRole('region', { name: 'Page documentation', exact: true })
    .getByRole('region', { name: 'Ask about this', exact: true });
  await section
    .getByRole('status')
    .filter({ hasText: 'Ready for a scoped' })
    .waitFor();
  await ask(section, ten);
  assert((await section.textContent()).includes('20%'));
  assert.equal(
    await section
      .getByRole('button')
      .filter({ hasText: 'Open cited documented source' })
      .count(),
    2,
  );
  await page.keyboard.press('Escape');
  await page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('8');
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  section = await component(page);
  await ask(section, ten);
  assert(
    (await section.textContent()).includes('Warnings: evidence needs review'),
  );
  assert.equal(await page.evaluate(() => window.actions), 0);
  assert.equal(await page.evaluate(() => window.privateReads), 0);
  assert.equal(await page.locator('#total').textContent(), 'Not calculated');
  assert.deepEqual(readBundle(f.store, bundle.app_id), bundle);
  assert.equal(errors(), 0);
});
test('W18 historical answer citation opens retained authorized revision after source update; restricted history source remains hidden', async (t) => {
  const { bundle, page, service } = await setup(t);
  let section = await component(page);
  await ask(section, ten);
  const next = JSON.parse(JSON.stringify(bundle));
  next.revision_id = randomUUID();
  next.supersedes_revision_id = bundle.revision_id;
  const claim = next.claims.find(
      (c) =>
        c.evidence_class === 'documented' &&
        c.scope.role === 'reader' &&
        c.scope.version === '1' &&
        c.scope.state === 'default',
    ),
    source = next.sources.find((s) => s.id === claim.sources[0].source_id),
    oldExcerpt = source.excerpt;
  source.supersedes_revision_id = source.revision_id;
  source.revision_id = randomUUID();
  source.excerpt = 'Replacement synthetic source after conversation';
  source.content_hash = contentHash(source.excerpt);
  claim.supersedes_revision_id = claim.revision_id;
  claim.revision_id = randomUUID();
  claim.sources[0] = {
    source_id: source.id,
    revision_id: source.revision_id,
    content_hash: source.content_hash,
    locator: source.locator,
  };
  const write = await page.request.post(service.authorURL + '/api/bundle', {
    headers: { Origin: service.authorURL, 'Content-Type': 'application/json' },
    data: { schema_version: 1, expected_revision: 2, bundle: next },
  });
  assert.equal(write.status(), 200);
  await page.reload();
  await page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  section = await component(page);
  await section
    .getByText(
      'Historical answer: documentation revision changed. Ask again for current evidence.',
      { exact: true },
    )
    .waitFor();
  await section
    .getByRole('button', {
      name: 'Open cited documented source 1',
      exact: true,
    })
    .click();
  const inspector = page.getByRole('region', { name: 'Source inspector' });
  await inspector.locator('pre').waitFor();
  assert.equal(await inspector.locator('pre').textContent(), oldExcerpt);
  assert(
    !(await inspector.textContent()).includes('Replacement synthetic source'),
  );
  const denied = await page.request.get(
    `${service.readURL}/api/source?context=2&target=${fixtureTargets.calculate}&source=${source.id}&revision=${bundle.revision_id}&source_revision=${bundle.sources.find((s) => s.id === source.id).revision_id}`,
  );
  assert.equal(denied.status(), 404);
  assert.deepEqual(await denied.json(), { error: 'NOT_FOUND' });
});
test('W18 provider unavailable and scope switch during generation stay distinct and discard incompatible UI', async (t) => {
  const failed = await setup(t, {
    provider: {
      label: 'Unavailable synthetic provider',
      generate: async () => {
        throw new Error('PRIVATE_DETAIL');
      },
    },
  });
  let section = await component(failed.page);
  await section.getByLabel('Product question').fill(ten);
  await section
    .getByRole('button', { name: 'Ask about this', exact: true })
    .click();
  await section
    .getByRole('status')
    .filter({ hasText: 'Provider unavailable. No turn was saved; retry.' })
    .waitFor();
  assert.equal(failed.f.store.revision, 1);
  const invalid = await setup(t, {
    provider: {
      label: 'Invalid synthetic provider',
      generate: async () => ({ text: 'Unsupported free-form output' }),
    },
  });
  const invalidSection = await component(invalid.page);
  await invalidSection.getByLabel('Product question').fill(ten);
  await invalidSection
    .getByRole('button', { name: 'Ask about this', exact: true })
    .click();
  await invalidSection
    .getByRole('status')
    .filter({
      hasText: 'Provider response failed validation. No turn was saved.',
    })
    .waitFor();
  assert.equal(invalid.f.store.revision, 1);
  let release;
  const gate = new Promise((r) => (release = r));
  const live = await setup(t, {
    provider: {
      label: 'Held synthetic provider',
      generate: async (input) => {
        await gate;
        return groundedAnswer(input, 'Held synthetic provider');
      },
    },
  });
  section = await component(live.page);
  const done = live.page.waitForResponse((r) => r.url().endsWith('/api/ask'));
  await section.getByLabel('Product question').fill(ten);
  await section
    .getByRole('button', { name: 'Ask about this', exact: true })
    .click();
  await section
    .getByRole('status')
    .filter({ hasText: 'Preparing cited answer…' })
    .waitFor();
  await live.page
    .getByRole('combobox', { name: 'Documentation scope' })
    .selectOption('2');
  await live.page
    .getByRole('status')
    .filter({ hasText: 'Documentation ready' })
    .waitFor();
  const current = await component(live.page);
  release();
  await (await done).finished();
  assert.equal(await current.locator('li').count(), 0);
  assert((await current.textContent()).includes('Role editor'));
  assert.equal(
    await live.page.locator('#total').textContent(),
    'Not calculated',
  );
});
