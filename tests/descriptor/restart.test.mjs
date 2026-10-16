/* global structuredClone, URL, fetch, Buffer */
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import {
  contentHash,
  DESCRIPTOR_LIMITS,
} from '../../dist/descriptor/contracts.js';
import { mkdtemp, mkdir, copyFile, chmod, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { Store } from '../../dist/store/database.js';
import {
  writeBundle,
  readBundle,
  bundleHistory,
} from '../../dist/descriptor/store.js';
import {
  exportDescriptor,
  previewRestore,
  commitRestore,
} from '../../dist/descriptor/portable.js';
import { storageFixture } from '../fixtures/storage.mjs';
import { contractFixture, scope } from './contract-fixture.mjs';
const author = (f) => ({
  principal: 'synthetic-author',
  author: true,
  grants: [{ project_id: f.base.project_id, app_id: f.base.app_id, scope }],
});
async function destination(t, f) {
  const root = await mkdtemp('/private/tmp/waygrain-restore-');
  await mkdir(join(root, 'storage'), { mode: 0o700 });
  const config = join(root, 'config.json');
  await copyFile(f.configPath, config);
  await chmod(config, 0o600);
  const store = await Store.open(config);
  t.after(async () => {
    store.close();
    await rm(root, { recursive: true, force: true });
  });
  return { store, config };
}
async function chain(t) {
  const f = await storageFixture(t),
    b = {
      ...contractFixture(),
      project_id: f.base.project_id,
      app_id: f.base.app_id,
    };
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle: b });
  const next = structuredClone(b);
  next.supersedes_revision_id = b.revision_id;
  next.revision_id = randomUUID();
  next.documents[0].supersedes_revision_id = next.documents[0].revision_id;
  next.documents[0].revision_id = randomUUID();
  next.documents[0].purpose = 'Retained authored rule';
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 1,
    bundle: next,
  });
  return {
    f,
    b,
    next,
    archive: exportDescriptor(f.store, author(f), b.app_id),
  };
}
test('W12 history export/preview/atomic clean restore preserves identities and process restart inspection', async (t) => {
  const { f, b, next, archive } = await chain(t),
    d = await destination(t, f);
  const preview = previewRestore(d.store, author(f), {
    expected_revision: 0,
    archive,
  });
  assert.equal(d.store.revision, 0);
  assert.equal(readBundle(d.store, b.app_id), null);
  const receipt = { candidate: preview.candidate, digest: preview.digest };
  commitRestore(d.store, author(f), receipt);
  assert.deepEqual(bundleHistory(d.store, b.app_id), [b, next]);
  assert.throws(() => commitRestore(d.store, author(f), receipt), {
    code: 'CONFLICT',
  });
  assert.equal(d.store.revision, 2);
  d.store.close();
  async function replay() {
    const child = fork(
      new URL('./restart-worker.mjs', import.meta.url),
      [d.config],
      { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] },
    );
    const exited = once(child, 'exit');
    t.after(() => {
      if (child.exitCode === null && child.signalCode === null)
        child.kill('SIGKILL');
    });
    const [urls] = await once(child, 'message');
    const evidence = await fetch(
      `${urls.readURL}/api/evidence?context=0&target=${next.targets[1].id}`,
    ).then((r) => r.json());
    assert.equal(evidence.documents[0].purpose, 'Retained authored rule');
    const source = await fetch(
      `${urls.readURL}/api/source?context=0&target=${next.targets[1].id}&source=${b.sources[0].id}`,
    ).then((r) => r.json());
    assert.equal(source.excerpt, b.sources[0].excerpt);
    assert.equal(source.revision_id, b.sources[0].revision_id);
    const exported = await fetch(`${urls.authorURL}/api/archive`).then((r) =>
      r.json(),
    );
    assert.deepEqual(exported, archive);
    child.send('stop');
    assert.equal((await exited)[0], 0);
  }
  await replay();
  await replay();
});
test('W12 invalid chain, forged receipt, scope mismatch, existing history and transaction failure never partially restore', async (t) => {
  const { f, b, archive } = await chain(t),
    d = await destination(t, f),
    context = author(f);
  assert.throws(
    () =>
      exportDescriptor(
        f.store,
        {
          ...context,
          grants: [
            {
              project_id: f.base.project_id,
              app_id: f.base.app_id,
              scope: { ...scope, role: 'editor' },
            },
          ],
        },
        b.app_id,
      ),
    { code: 'ACCESS_DENIED' },
  );
  for (const edit of [
    (x) => {
      x.history[1].supersedes_revision_id = randomUUID();
    },
    (x) => {
      x.history[1].documents[0].revision_id =
        x.history[0].documents[0].revision_id;
    },
    (x) => {
      x.history[1].project_id = randomUUID();
    },
    (x) => {
      x.schema_version = 2;
    },
    (x) => {
      x.history[1].sources[0].excerpt = 'bad hash';
    },
  ]) {
    const bad = structuredClone(archive);
    edit(bad);
    assert.throws(() =>
      previewRestore(d.store, context, { expected_revision: 0, archive: bad }),
    );
    assert.equal(d.store.revision, 0);
    assert.deepEqual(bundleHistory(d.store, b.app_id), []);
  }
  const preview = previewRestore(d.store, context, {
    expected_revision: 0,
    archive,
  });
  assert.throws(
    () =>
      commitRestore(d.store, context, {
        candidate: preview.candidate,
        digest: '0'.repeat(64),
      }),
    { code: 'CONFLICT' },
  );
  d.store.db.exec(
    "CREATE TRIGGER fail_restore BEFORE INSERT ON descriptor_heads BEGIN SELECT RAISE(ABORT,'synthetic failure');END;",
  );
  assert.throws(() =>
    commitRestore(d.store, context, {
      candidate: preview.candidate,
      digest: preview.digest,
    }),
  );
  assert.equal(d.store.revision, 0);
  assert.deepEqual(bundleHistory(d.store, b.app_id), []);
  d.store.db.exec('DROP TRIGGER fail_restore');
  writeBundle(d.store, { schema_version: 1, expected_revision: 0, bundle: b });
  assert.throws(
    () => previewRestore(d.store, context, { expected_revision: 1, archive }),
    { code: 'CONFLICT' },
  );
  assert.deepEqual(bundleHistory(d.store, b.app_id), [b]);
});

test('W12 successful near-limit exports fit complete restore envelopes; oversized envelope export fails early', async (t) => {
  const f = await storageFixture(t),
    context = author(f);
  function historyAt(bytes) {
    const base = {
      ...contractFixture(),
      project_id: f.base.project_id,
      app_id: f.base.app_id,
    };
    function historyFor(excerpt, purpose = '') {
      base.sources[0].excerpt = excerpt;
      base.sources[0].content_hash = contentHash(excerpt);
      base.claims[0].sources[0].content_hash = base.sources[0].content_hash;
      const history = [];
      for (let i = 0; i < 64; i++) {
        const b = structuredClone(base);
        b.revision_id = randomUUID();
        b.supersedes_revision_id = history.at(-1)?.revision_id ?? null;
        if (i === 63 && purpose) {
          b.documents[0].purpose = purpose;
          b.documents[0].supersedes_revision_id = b.documents[0].revision_id;
          b.documents[0].revision_id = randomUUID();
        }
        history.push(b);
      }
      return history;
    }
    let history = historyFor('x', 'x'),
      archive = {
        format: 'waygrain-descriptor-history',
        schema_version: 1,
        history,
      };
    const gap = bytes - Buffer.byteLength(JSON.stringify(archive)),
      padding = Math.floor(gap / 64);
    history = historyFor('x'.repeat(1 + padding), 'x'.repeat(1 + (gap % 64)));
    return history;
  }
  const fake = (history) => ({
    location: f.store.location,
    transaction: (fn) => fn(),
    db: {
      prepare: () => ({
        all: () =>
          history.map((b) => ({
            schema_version: 1,
            bundle_json: JSON.stringify(b),
          })),
      }),
    },
  });
  const tooLarge = historyAt(DESCRIPTOR_LIMITS.requestBytes - 20);
  assert.throws(
    () => exportDescriptor(fake(tooLarge), context, f.base.app_id),
    { code: 'LIMIT_EXCEEDED' },
  );
  const good = exportDescriptor(
    fake(historyAt(DESCRIPTOR_LIMITS.requestBytes - 1024)),
    context,
    f.base.app_id,
  );
  const preview = previewRestore(f.store, context, {
    expected_revision: 0,
    archive: good,
  });
  commitRestore(f.store, context, {
    candidate: preview.candidate,
    digest: preview.digest,
  });
  assert.deepEqual(bundleHistory(f.store, f.base.app_id), good.history);
});
