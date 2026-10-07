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

test('C04 public action dispatch replays without a browser and never hashes changed fill text', async (t) => {
  const { BrowserSession } = await import('../dist/browser/session.js');
  const { store, base } = await storageFixture(t);
  const journal = new AttemptJournal(store, base.app_id);
  const action = {
    kind: 'fill',
    session_id: randomUUID(),
    page_id: randomUUID(),
    snapshot_id: randomUUID(),
    target_id: randomUUID(),
    text: 'SYNTHETIC_INPUT_ORIGINAL_NEVER_RETAIN',
  };
  const { text, ...metadata } = action;
  assert(text);
  const receipt = {
    execution_id: 'fill_one',
    session_id: action.session_id,
    page_id: action.page_id,
    snapshot_id: action.snapshot_id,
    target_id: action.target_id,
    trace_id: 'trace',
    trace_seq: 2,
    action_kind: 'fill',
    occurred_at: new Date().toISOString(),
    after_snapshot_id: null,
    state: 'pending',
    dispatch: 'not_dispatched',
    error_code: null,
  };
  journal.reserve('one', 'wg_browser_act', metadata, receipt);
  journal.finish('one', {
    ...receipt,
    state: 'succeeded',
    dispatch: 'dispatched',
  });
  const browser = new BrowserSession(store);
  const q = {
    ...base,
    browser_schema_version: 1,
    request_id: 'one',
    execution_id: 'fill_one',
    action,
  };
  const replay = await browser.dispatch('wg_browser_act', {
    ...q,
    action: { ...action, text: 'SYNTHETIC_INPUT_CHANGED_NEVER_RETAIN' },
  });
  assert.equal(replay.data.state, 'succeeded');
  assert.equal(store.revision, 2);
  await assert.rejects(
    browser.dispatch('wg_browser_act', {
      ...q,
      action: {
        kind: 'click',
        session_id: action.session_id,
        page_id: action.page_id,
        snapshot_id: action.snapshot_id,
        target_id: action.target_id,
      },
    }),
    { code: 'EXECUTION_CONFLICT' },
  );
  const aborted = new globalThis.AbortController();
  aborted.abort();
  await assert.rejects(
    browser.dispatch(
      'wg_browser_act',
      { ...q, execution_id: 'new' },
      aborted.signal,
    ),
    { code: 'ACTION_CANCELLED' },
  );
  assert(
    !JSON.stringify(store.db.prepare('SELECT * FROM receipts').all()).includes(
      'SYNTHETIC_INPUT_',
    ),
  );
  await browser.dispose();
});
