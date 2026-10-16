/* global fetch, Buffer */
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { URL } from 'node:url';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { Store } from '../../dist/store/database.js';
import {
  descriptorFixture,
  fixtureTargets,
  fixtureScopes,
  fixtureAccess,
} from '../../dist/descriptor/fixture.js';
import { contentHash } from '../../dist/descriptor/contracts.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import { markFreshness } from '../../dist/descriptor/freshness.js';
import {
  askConversation,
  loadConversation,
  latestConversation,
} from '../../dist/descriptor/conversation.js';
import { deterministicProvider } from '../../dist/descriptor/providers/deterministic.js';
import { groundedAnswer } from '../../dist/descriptor/providers/validation.js';
import { storageFixture } from '../fixtures/storage.mjs';
async function fixture(t) {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const scope = fixtureScopes()[0],
    context = fixtureAccess(f.base.project_id, f.base.app_id, scope),
    binding = {
      ...f.base,
      scope,
      conversation_id: randomUUID(),
      target_id: fixtureTargets.calculate,
      page_id: fixtureTargets.page,
    };
  return { f, bundle, context, binding };
}
const question = 'Why is the total 90 for 10 items at 10 each?';
test('W17 canonical history and What about9 persist across a separate service process; unsupported raw questions never reach disk or diagnostics', async (t) => {
  const { f, bundle, context, binding } = await fixture(t);
  let view = await askConversation(
    f.store,
    () => context,
    { ...binding, expected_turn: 0, question },
    deterministicProvider(),
  );
  assert.equal(view.turns[0].answer.status, 'supported');
  view = await askConversation(
    f.store,
    () => context,
    {
      ...binding,
      expected_turn: 1,
      question: 'PRIVATE_QUESTION_SENTINEL_6793 arbitrary host value',
    },
    deterministicProvider(),
  );
  assert.equal(
    view.turns[1].question,
    'Unsupported product clarification request.',
  );
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      const bytes = await readFile(f.store.location.databasePath + suffix);
      assert(!bytes.includes(Buffer.from('PRIVATE_QUESTION_SENTINEL_6793')));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  assert.deepEqual(readBundle(f.store, bundle.app_id), bundle);
  f.store.close();
  const child = fork(
    new URL('./restart-worker.mjs', import.meta.url),
    [f.configPath],
    { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] },
  );
  const exit = once(child, 'exit');
  let diagnostics = '';
  child.stdout.on('data', (c) => (diagnostics += c));
  child.stderr.on('data', (c) => (diagnostics += c));
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null)
      child.kill('SIGKILL');
    await exit;
  });
  const [urls] = await once(child, 'message');
  const loaded = await fetch(
    `${urls.readURL}/api/conversation?context=0&target=${binding.target_id}&page=${binding.page_id}&id=${binding.conversation_id}`,
  ).then((r) => r.json());
  assert.equal(loaded.turns.length, 2);
  const response = await fetch(`${urls.readURL}/api/ask`, {
    method: 'POST',
    headers: { Origin: urls.readURL, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: '0',
      target_id: binding.target_id,
      page_id: binding.page_id,
      conversation_id: binding.conversation_id,
      expected_turn: 2,
      question: 'What about 9?',
    }),
  });
  assert.equal(response.status, 200);
  const follow = await response.json();
  assert(follow.turns[2].answer.text.includes('no quantity discount'));
  assert.equal(follow.turns[2].answer.evidence_revision_id, bundle.revision_id);
  assert(follow.turns[2].answer.citations.length);
  assert(!diagnostics.includes('PRIVATE_QUESTION_SENTINEL_6793'));
  child.send('stop');
  assert.equal((await exit)[0], 0);
  const reopened = await Store.open(f.configPath);
  t.after(() => reopened.close());
  assert.equal(loadConversation(reopened, context, binding).turns.length, 3);
});
test('W17 forged conversation bindings and cross-principal/context reloads are denied; latest lookup and history never become evidence', async (t) => {
  const { f, context, binding } = await fixture(t);
  await askConversation(
    f.store,
    () => context,
    { ...binding, expected_turn: 0, question },
    deterministicProvider(),
  );
  for (const change of [
    { scope: fixtureScopes()[2] },
    { scope: fixtureScopes()[1] },
    { scope: fixtureScopes()[4] },
    { scope: fixtureScopes()[5] },
    { scope: { ...binding.scope, environment: 'other' } },
    { scope: { ...binding.scope, role: null } },
    { target_id: fixtureTargets.quantity },
    { page_id: fixtureTargets.quantity },
    { app_id: randomUUID() },
    { project_id: randomUUID() },
  ]) {
    const bad = { ...binding, ...change },
      other = fixtureAccess(bad.project_id, bad.app_id, bad.scope);
    assert.throws(() => loadConversation(f.store, other, bad));
  }
  assert.throws(
    () =>
      loadConversation(
        f.store,
        { ...context, principal: 'other-person' },
        binding,
      ),
    { code: 'ACCESS_DENIED' },
  );
  const { conversation_id, ...latest } = binding;
  assert.equal(
    latestConversation(f.store, context, latest).conversation_id,
    conversation_id,
  );
  const otherScope = fixtureScopes()[2],
    other = latestConversation(
      f.store,
      fixtureAccess(binding.project_id, binding.app_id, otherScope),
      { ...latest, scope: otherScope },
    );
  assert.equal(other.turns.length, 0);
  assert.notEqual(other.conversation_id, conversation_id);
  assert.equal(f.store.revision, 2);
});
function heldProvider() {
  let start, release;
  const started = new Promise((r) => (start = r)),
    gate = new Promise((r) => (release = r));
  return {
    started,
    release: () => release(),
    provider: {
      label: 'Held synthetic provider',
      generate: async (input) => {
        start();
        await gate;
        return groundedAnswer(input, 'Held synthetic provider');
      },
    },
  };
}
test('W17 in-flight source revision changes, principal revocation and out-of-order turns cannot append stale answers', async (t) => {
  const { f, context, binding, bundle } = await fixture(t),
    held = heldProvider();
  const pending = askConversation(
    f.store,
    () => context,
    { ...binding, expected_turn: 0, question },
    held.provider,
  );
  await held.started;
  const next = JSON.parse(JSON.stringify(bundle));
  next.revision_id = randomUUID();
  next.supersedes_revision_id = bundle.revision_id;
  next.documents[0].supersedes_revision_id = next.documents[0].revision_id;
  next.documents[0].revision_id = randomUUID();
  next.documents[0].purpose = 'Updated descriptor during generation';
  const changedClaim = next.claims.find(
      (c) =>
        c.target_id === binding.target_id &&
        c.evidence_class === 'documented' &&
        c.scope.role === 'reader' &&
        c.scope.version === '1' &&
        c.scope.state === 'default',
    ),
    source = next.sources.find(
      (s) => s.id === changedClaim.sources[0].source_id,
    );
  source.supersedes_revision_id = source.revision_id;
  source.revision_id = randomUUID();
  source.excerpt += ' Updated supplied source.';
  source.content_hash = contentHash(source.excerpt);
  changedClaim.supersedes_revision_id = changedClaim.revision_id;
  changedClaim.revision_id = randomUUID();
  changedClaim.sources[0] = {
    source_id: source.id,
    revision_id: source.revision_id,
    content_hash: source.content_hash,
    locator: source.locator,
  };
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 1,
    bundle: markFreshness(bundle, next),
  });
  held.release();
  await assert.rejects(() => pending, { code: 'CONFLICT' });
  assert.equal(loadConversation(f.store, context, binding).turns.length, 0);
  const delayed = heldProvider();
  let current = context;
  const revoked = askConversation(
    f.store,
    () => current,
    { ...binding, expected_turn: 0, question },
    delayed.provider,
  );
  await delayed.started;
  current = { ...context, principal: 'new-principal' };
  delayed.release();
  await assert.rejects(() => revoked, { code: 'ACCESS_DENIED' });
  assert.equal(f.store.revision, 2);
  const denied = heldProvider();
  current = context;
  const revokedGrant = askConversation(
    f.store,
    () => current,
    { ...binding, expected_turn: 0, question },
    denied.provider,
  );
  await denied.started;
  current = fixtureAccess(
    binding.project_id,
    binding.app_id,
    fixtureScopes()[2],
  );
  denied.release();
  await assert.rejects(() => revokedGrant, { code: 'ACCESS_DENIED' });
  assert.equal(f.store.revision, 2);
  const mutable = JSON.parse(JSON.stringify(context)),
    inPlace = heldProvider();
  const rebound = askConversation(
    f.store,
    () => mutable,
    { ...binding, expected_turn: 0, question },
    inPlace.provider,
  );
  await inPlace.started;
  mutable.principal = 'mutated-principal';
  inPlace.release();
  await assert.rejects(() => rebound, { code: 'ACCESS_DENIED' });
  assert.equal(f.store.revision, 2);
  const racing = heldProvider(),
    first = askConversation(
      f.store,
      () => context,
      { ...binding, expected_turn: 0, question },
      racing.provider,
    );
  await racing.started;
  await askConversation(
    f.store,
    () => context,
    { ...binding, expected_turn: 0, question },
    deterministicProvider(),
  );
  racing.release();
  await assert.rejects(() => first, { code: 'CONFLICT' });
  assert.equal(loadConversation(f.store, context, binding).turns.length, 1);
  assert.equal(f.store.revision, 3);
  const stored = readBundle(f.store, binding.app_id);
  const newer = JSON.parse(JSON.stringify(stored));
  newer.revision_id = randomUUID();
  newer.supersedes_revision_id = stored.revision_id;
  writeBundle(f.store, {
    schema_version: 1,
    expected_revision: 3,
    bundle: newer,
  });
  const old = loadConversation(f.store, context, binding);
  assert.equal(old.turns[0].evidence_current, false);
  const follow = await askConversation(
    f.store,
    () => context,
    { ...binding, expected_turn: 1, question: 'What about 9?' },
    deterministicProvider(),
  );
  assert.equal(follow.turns[1].answer.evidence_revision_id, newer.revision_id);
  assert(follow.turns[1].answer.text.includes('no quantity discount'));
  assert(follow.turns[1].answer.warnings.includes('EVIDENCE_NEEDS_REVIEW'));
  assert.equal(
    readBundle(f.store, binding.app_id).claims.find(
      (c) => c.id === changedClaim.id,
    ).verification,
    null,
  );
});

test('W17 bounded history refuses additional turns without dropping retained evidence', async (t) => {
  const { f, context, binding } = await fixture(t);
  for (let i = 0; i < 20; i++)
    await askConversation(
      f.store,
      () => context,
      {
        ...binding,
        expected_turn: i,
        question: 'An unsupported synthetic product question.',
      },
      deterministicProvider(),
    );
  await assert.rejects(
    () =>
      askConversation(
        f.store,
        () => context,
        { ...binding, expected_turn: 20, question },
        deterministicProvider(),
      ),
    { code: 'LIMIT_EXCEEDED' },
  );
  const view = loadConversation(f.store, context, binding);
  assert.equal(view.turns.length, 20);
  assert.equal(f.store.revision, 21);
  assert.throws(() => f.store.db.prepare('DELETE FROM descriptor_turns').run());
});

test('W17 HTTP conversation boundary rejects origins, forged role fields and incompatible IDs; provider failures reveal no raw details', async (t) => {
  const { f, context, binding } = await fixture(t),
    service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const input = {
    context: '0',
    target_id: binding.target_id,
    page_id: binding.page_id,
    conversation_id: binding.conversation_id,
    expected_turn: 0,
    question,
  };
  const post = (url, body = input, origin = service.readURL) =>
    fetch(url + '/api/ask', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  assert.equal(
    (await post(service.readURL, input, 'https://foreign.invalid')).status,
    403,
  );
  assert.equal(
    (await post(service.readURL, { ...input, role: 'editor' })).status,
    400,
  );
  assert.equal(
    (await post(service.authorURL, input, service.authorURL)).status,
    404,
  );
  assert.equal(f.store.revision, 1);
  assert.equal((await post(service.readURL)).status, 200);
  const foreign = await fetch(
    `${service.readURL}/api/conversation?context=2&target=${binding.target_id}&page=${binding.page_id}&id=${binding.conversation_id}`,
  );
  assert.equal(foreign.status, 403);
  assert.deepEqual(await foreign.json(), { error: 'ACCESS_DENIED' });
  assert.equal(
    (await post(service.readURL, { ...input, context: '2', expected_turn: 1 }))
      .status,
    403,
  );
  assert.equal(f.store.revision, 2);
  assert.equal(loadConversation(f.store, context, binding).turns.length, 1);
  const unavailable = await startDescriptorService(f.store, {
    provider: {
      label: 'Unavailable synthetic provider',
      generate: async () => {
        throw new Error('PRIVATE_PROVIDER_SENTINEL');
      },
    },
  });
  t.after(() => unavailable.close());
  const failed = await post(
    unavailable.readURL,
    { ...input, conversation_id: randomUUID() },
    unavailable.readURL,
  );
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { error: 'PROVIDER_UNAVAILABLE' });
  assert.equal(f.store.revision, 2);
});
