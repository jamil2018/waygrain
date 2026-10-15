// Separate deterministic adapter qualification, not a model session or study replacement.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { setTimeout, clearTimeout } from 'node:timers';
import process from 'node:process';
import { hash } from './analyze.mjs';
const smoke = JSON.parse(
  await readFile('tasks/evidence/g08/smoke.json', 'utf8'),
);
const inv = smoke.results.find((r) => r.condition === 'investigate');
const shared = [...inv.receipt.owner_replies, ...inv.receipt.observations],
  results = [];
for (const condition of ['raw', 'organized']) {
  const root = await mkdtemp('/private/tmp/waygrain-g08-probe-');
  await writeFile(
    join(root, 'options.json'),
    JSON.stringify({
      world: 'cobalt',
      condition,
      session_id: 'probe_' + condition,
      shared,
      packet: condition === 'organized' ? inv.final : null,
    }),
    { mode: 0o600 },
  );
  const child = spawn(
    process.execPath,
    [resolve('scripts/evaluation/g08/server.mjs'), root],
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  child.stderr.on('data', () => {});
  const responses = new Map(),
    lines = createInterface({ input: child.stdout });
  lines.on('line', (l) => {
    const r = JSON.parse(l);
    responses.set(r.id, r);
  });
  const closed = new Promise((r) => child.once('close', r));
  const timer = setTimeout(() => child.kill('SIGKILL'), 15000);
  async function call(id, method, params) {
    child.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n',
    );
    for (let i = 0; i < 500 && !responses.has(id); i++) await delay(10);
    assert(responses.has(id), 'missing_response');
    return responses.get(id).result;
  }
  try {
    await call(1, 'initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'g08-deterministic-probe', version: '1' },
    });
    child.stdin.write(
      '{"jsonrpc":"2.0","method":"notifications/initialized"}\n',
    );
    const tools = await call(2, 'tools/list', {});
    assert.equal(
      tools.tools.some((t) => t.name === 'knowledge_search'),
      condition === 'organized',
    );
    const packetResponse = await call(3, 'tools/call', {
      name: 'knowledge_search',
      arguments: { term: '' },
    });
    if (condition === 'raw') assert.equal(packetResponse.isError, true);
    else {
      const value = JSON.parse(packetResponse.content[0].text);
      assert.equal(value.summary, inv.final.summary);
      assert.deepEqual(
        value.claims,
        inv.final.claims.map((c) => ({
          ...c,
          id: 'packet_' + c.id,
          kind: 'agent_packet_claim',
        })),
      );
      assert.deepEqual(value.open_questions, inv.final.open_questions);
      assert.deepEqual(value.source_map, inv.final.source_map);
    }
    const traversal = await call(4, 'tools/call', {
      name: 'source_read',
      arguments: { id: '../../hidden-review-oracle.json' },
    });
    assert.equal(traversal.isError, true);
    assert.equal(
      JSON.parse(traversal.content[0].text).error,
      'unknown_evidence',
    );
    const all = await call(5, 'tools/call', {
      name: 'source_search',
      arguments: { term: '' },
    });
    const acquired = JSON.parse(all.content[0].text).records.filter(
      (r) => r.kind !== 'document',
    );
    assert.deepEqual(acquired, shared);
    child.stdin.end();
    assert.equal(await closed, 0);
    const receipt = JSON.parse(
      await readFile(join(root, 'receipt.json'), 'utf8'),
    );
    assert(Object.values(receipt.cleanup).every((v) => v === 'complete'));
    assert.equal(receipt.shared_sha256, hash(shared));
    assert.equal(
      receipt.packet_reads.length,
      condition === 'organized' ? 1 : 0,
    );
    results.push({ condition, checks: 'PASS', receipt });
  } finally {
    clearTimeout(timer);
    lines.close();
    if (child.exitCode === null) child.kill('SIGKILL');
    await closed;
    await rm(root, { recursive: true, force: true });
  }
}
await writeFile(
  'tasks/evidence/g08/adapter-probe.json',
  JSON.stringify(
    {
      smoke_sha256: hash(smoke),
      investigator_final_sha256: hash(inv.final),
      shared_sha256: hash(shared),
      results,
    },
    null,
    2,
  ) + '\n',
);
process.stdout.write('G08 deterministic adapter probe PASS\n');
