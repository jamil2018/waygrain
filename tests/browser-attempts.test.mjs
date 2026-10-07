import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { AttemptJournal } from '../dist/browser/attempts.js';
import { storageFixture } from './fixtures/storage.mjs';

test('C03 durable attempt markers precede dispatch, survive reopen as unknown and reject conflicting execution metadata', async (t) => {
  const { store, base } = await storageFixture(t);
  const journal = new AttemptJournal(store, base.app_id);
  const receipt = {
    execution_id: 'navigate_one',
    session_id: randomUUID(),
    page_id: randomUUID(),
    snapshot_id: randomUUID(),
    target_id: null,
    trace_id: 'trace',
    trace_seq: 2,
    action_kind: 'navigate',
    occurred_at: new Date().toISOString(),
    after_snapshot_id: null,
    state: 'pending',
    dispatch: 'not_dispatched',
    error_code: null,
  };
  const metadata = { scope: 'synthetic', route: '/members' };
  journal.reserve('one', 'wg_browser_navigate', metadata, receipt);
  assert.equal(store.revision, 1);
  assert.equal(
    journal.replay('navigate_one', 'wg_browser_navigate', metadata).state,
    'unknown',
  );
  assert.throws(
    () =>
      journal.replay('navigate_one', 'wg_browser_navigate', {
        route: '/settings',
      }),
    { code: 'EXECUTION_CONFLICT' },
  );
  const terminal = { ...receipt, state: 'succeeded', dispatch: 'dispatched' };
  journal.finish('one', terminal);
  assert.deepEqual(
    journal.replay('navigate_one', 'wg_browser_navigate', metadata),
    terminal,
  );
  assert.equal(store.revision, 2);
  assert(
    !JSON.stringify(store.db.prepare('SELECT * FROM receipts').all()).includes(
      'http',
    ),
  );
});
