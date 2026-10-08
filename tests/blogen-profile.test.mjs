import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { URL } from 'node:url';
import { validateSettings } from '../dist/config/schema.js';
import { mapSnapshot, mappedRoute } from '../dist/browser/snapshot.js';
import { normalizeCapture } from '../dist/core/normalize.js';
import { storageFixture } from './fixtures/storage.mjs';

const settings = JSON.parse(
  await readFile(
    new URL('../assets/pilot/blogen-settings.json', import.meta.url),
    'utf8',
  ),
);

test('Blogen profile sanitizes synthetic unknown content and preserves category/dialog structure', async (t) => {
  validateSettings(settings);
  const fixture = await storageFixture(t, settings);
  const app = fixture.store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert.equal(alias, 'local-admin');
  const binding = { session_id: randomUUID(), page_id: randomUUID(), scope };
  const raw = [
    { role: 'heading', name: 'Categories' },
    {
      role: 'textbox',
      name: 'Search categories',
      value: 'SYNTHETIC_SEARCH_INPUT',
      children: ['SYNTHETIC_SEARCH_INPUT'],
    },
    { role: 'text', text: 'SYNTHETIC_PERSONAL_TITLE' },
    { role: 'text', text: 'SYNTHETIC_IGNORE_RULES_INSTRUCTION' },
    {
      role: 'dialog',
      name: 'Create category',
      children: [
        {
          role: 'textbox',
          name: 'Title',
          value: 'SYNTHETIC_FORM_INPUT',
          children: ['SYNTHETIC_FORM_INPUT'],
        },
        { role: 'button', name: 'Create' },
      ],
    },
  ];
  const snapshot = mapSnapshot(
    raw,
    app,
    binding,
    '/admin/categories',
    randomUUID(),
    1,
  );
  assert.equal(snapshot.capture.coverage.kind, 'complete');
  assert.deepEqual(snapshot.capture.view.modal_stack, ['create_category']);
  assert(!JSON.stringify(snapshot).includes('SYNTHETIC_'));
  assert(snapshot.targets.some((target) => target.name === 'Title'));
  assert(snapshot.targets.some((target) => target.name === 'Create'));
  const normalized = normalizeCapture(snapshot.capture, app);
  assert(!JSON.stringify(normalized).includes('SYNTHETIC_'));
  for (const path of ['/categories', '/admin/categories', '/login', '/admin'])
    assert.equal(mappedRoute(scope.origin + path, app, scope.origin), path);
  assert.throws(
    () => mappedRoute(scope.origin + '/admin/users', app, scope.origin),
    { code: 'INCOMPATIBLE_CAPTURE' },
  );
  assert.throws(
    () => mappedRoute('https://outside.test/categories', app, scope.origin),
    { code: 'ORIGIN_NOT_ALLOWED' },
  );
  assert.throws(
    () =>
      normalizeCapture(
        { ...snapshot.capture, scope: { ...scope, role: 'owner' } },
        app,
      ),
    { code: 'UNKNOWN_SCOPE' },
  );
});

test('Blogen unsupported table semantics stay partial without extending core contracts', async (t) => {
  const fixture = await storageFixture(t, settings);
  const app = fixture.store.location.configuration.apps[0];
  const { alias, ...scope } = app.scopes[0];
  assert(alias);
  const snapshot = mapSnapshot(
    [
      {
        role: 'table',
        name: 'Categories',
        children: [{ role: 'columnheader', name: 'Category' }],
      },
    ],
    app,
    { session_id: randomUUID(), page_id: randomUUID(), scope },
    '/admin/categories',
    randomUUID(),
    1,
  );
  assert.equal(snapshot.capture.coverage.kind, 'partial');
});
