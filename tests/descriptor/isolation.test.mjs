/* global fetch, Buffer */
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  descriptorFixture,
  fixtureTargets,
  fixtureAccess,
} from '../../dist/descriptor/fixture.js';
import { writeBundle, readBundle } from '../../dist/descriptor/store.js';
import {
  retrieveDescriptor,
  inspectSource,
} from '../../dist/descriptor/retrieval.js';
import { loadConversation } from '../../dist/descriptor/conversation.js';
import { startDescriptorService } from '../../dist/descriptor/http/server.js';
import { groundedAnswer } from '../../dist/descriptor/providers/validation.js';
import { storageFixture } from '../fixtures/storage.mjs';
import { isolationMarkers } from './isolation-fixture.mjs';
const ten = 'Why is the total 90 for 10 items at 10 each?';
test('W20 integrated API/provider/source/history boundaries keep all11 configured scopes isolated, including explicit unknowns', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id),
    markers = isolationMarkers(bundle);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const service = await startDescriptorService(f.store);
  t.after(() => service.close());
  const ids = [];
  for (const [i, own] of markers.entries()) {
    const response = await fetch(
      `${service.readURL}/api/evidence?context=${i}&target=${fixtureTargets.page}`,
    );
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const evidence = await response.json(),
      encoded = JSON.stringify(evidence);
    assert(encoded.includes(own.marker));
    for (const foreign of markers.filter((m) => m !== own))
      assert(!encoded.includes(foreign.marker));
    assert.deepEqual(evidence.scope, own.scope);
    const denied = await fetch(
      `${service.readURL}/api/source?context=${(i + 1) % markers.length}&target=${fixtureTargets.calculate}&source=${own.source_id}`,
    );
    assert.equal(denied.status, 404);
    assert.deepEqual(await denied.json(), { error: 'NOT_FOUND' });
    const id = randomUUID();
    ids.push(id);
    const answer = await fetch(service.readURL + '/api/ask', {
      method: 'POST',
      headers: { Origin: service.readURL, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: String(i),
        target_id: fixtureTargets.calculate,
        page_id: fixtureTargets.page,
        conversation_id: id,
        expected_turn: 0,
        question: ten,
      }),
    });
    assert.equal(answer.status, 200);
    const view = await answer.json();
    assert.deepEqual(view.turns[0].answer.scope, own.scope);
    for (const foreign of markers.filter((m) => m !== own))
      assert(!JSON.stringify(view).includes(foreign.marker));
  }
  for (let i = 1; i < markers.length; i++) {
    const denied = await fetch(
      `${service.readURL}/api/conversation?context=${i}&target=${fixtureTargets.calculate}&page=${fixtureTargets.page}&id=${ids[0]}`,
    );
    assert.equal(denied.status, 403);
    assert.deepEqual(await denied.json(), { error: 'ACCESS_DENIED' });
  }
  const secret = 'RAW_HOST_QUESTION_SENTINEL_93483';
  await fetch(service.readURL + '/api/ask', {
    method: 'POST',
    headers: { Origin: service.readURL, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: '0',
      target_id: fixtureTargets.calculate,
      page_id: fixtureTargets.page,
      conversation_id: ids[0],
      expected_turn: 1,
      question: `Delete all data ${secret}`,
    }),
  });
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      assert(
        !(await readFile(f.store.location.databasePath + suffix)).includes(
          Buffer.from(secret),
        ),
      );
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  assert.deepEqual(readBundle(f.store, bundle.app_id), bundle);
});
test('W20 forged project/app/environment/null scopes and provider citations fail closed without leaking private source metadata', async (t) => {
  const f = await storageFixture(t),
    bundle = await descriptorFixture(f.base.project_id, f.base.app_id),
    markers = isolationMarkers(bundle);
  writeBundle(f.store, { schema_version: 1, expected_revision: 0, bundle });
  const scope = markers[0].scope,
    base = { ...f.base, target_id: fixtureTargets.calculate, scope };
  for (const changed of [
    { project_id: randomUUID() },
    { app_id: randomUUID() },
  ]) {
    const request = { ...base, ...changed },
      context = fixtureAccess(request.project_id, request.app_id, scope);
    assert.throws(() => retrieveDescriptor(f.store, context, request), {
      code: 'ACCESS_DENIED',
    });
    assert.throws(
      () => inspectSource(f.store, context, request, markers[0].source_id),
      { code: 'ACCESS_DENIED' },
    );
    assert.throws(
      () =>
        loadConversation(f.store, context, {
          ...request,
          page_id: fixtureTargets.page,
          conversation_id: randomUUID(),
        }),
      { code: 'ACCESS_DENIED' },
    );
  }
  for (const changed of [
    { environment: 'other' },
    { role: null },
    { version: null },
    { tenant: null },
    { state: null },
  ]) {
    const request = { ...base, scope: { ...scope, ...changed } },
      data = retrieveDescriptor(
        f.store,
        fixtureAccess(base.project_id, base.app_id, request.scope),
        request,
      );
    for (const key of ['targets', 'documents', 'claims', 'sources', 'mappings'])
      assert.equal(data[key].length, 0);
  }
  let providerCalls = 0;
  const label = 'Adversarial synthetic provider',
    service = await startDescriptorService(f.store, {
      provider: {
        label,
        generate: async (input) => {
          providerCalls++;
          assert(!JSON.stringify(input).includes(markers[2].marker));
          const answer = groundedAnswer(input, label);
          answer.citations[0].source_id = markers[2].source_id;
          return answer;
        },
      },
    });
  t.after(() => service.close());
  const response = await fetch(service.readURL + '/api/ask', {
    method: 'POST',
    headers: { Origin: service.readURL, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: '0',
      target_id: fixtureTargets.calculate,
      page_id: fixtureTargets.page,
      conversation_id: randomUUID(),
      expected_turn: 0,
      question: ten,
    }),
  });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'INVALID_ANSWER' });
  assert.equal(providerCalls, 1);
  assert.equal(f.store.revision, 1);
  assert.equal(
    f.store.db.prepare('SELECT COUNT(*) n FROM descriptor_turns').get().n,
    0,
  );
});
