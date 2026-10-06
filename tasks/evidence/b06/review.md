# B06 independent capture checkpoint

Reviewer: `/root/b06_checkpoint`, 7 October 2026. Verdict: **PASS for B06**, no Critical or Required findings. The coordinator is the sole implementation writer; this reviewer changed only this evidence receipt. A06 at `cf3fffc` is the Phase B comparison baseline; B01–B05 have separately verified historical receipts. Product implementation is frozen at B05 `8b3d44ac30bc31fbd46126423c52ffdc3f5af70b`. This checkpoint independently accepts capture and persistence only.

AGENTS.md, tasks/plan.md, the v0.2 baseline and ADR-001 were applied. The code-review-and-quality skill supplied the correctness, readability, architecture, security and bounded-performance review. User authorization covers B01–B06 and shipping, overriding the one-task default for this batch; Stage C and package publication remain outside this checkpoint.

## Independent observed results

- `npm run check`, Node 26.5.0: PASS, typecheck, lint, formatting, build, all 54 tests.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check`, Node 24.21.0: PASS, same gates, all 54 tests.
- `npm run test:fixtures`: PASS, 32 headed synthetic Chromium cases on macOS arm64, four screens, role/environment/version matrix, modal open/cancel and selected tabs, zero page errors. Authorized escalation enabled headed launch. No screenshot, snapshot, trace, persistent profile or authentication artifact was retained.
- Fresh `npm run smoke:packed`, Node 26.5.0: PASS, archive SHA-256 `eb7ed9d21b5276480783deda644c78d19dd2d084b304ca3d59a808971c7d2164`, 46 files.
- Fresh Node 24.21.0 `npm run smoke:packed`: PASS, archive SHA-256 `30d8673bf194227efe634866725e229c66912e1ea39c01217ec01caace72a1d7`, 46 files. Both archives include the final B05 README identified below. These identities supersede the pre-final-document B05 packed observations for checkpoint use, preserving historical identities. Each run exercised clean consumer installation with scripts disabled, 13 public contract exports/generated schema equality, three advertised tools, sanitized private argument rejection, stdio initialize/ping/status/EOF, private disposable SQLite WAL/integrity/read, explicit Chromium download and blank headed launch. Authorized escalation enabled network and headed launch. Both harness scratch roots were removed in finally blocks.
- The independent synthetic checker retained below: PASS on Node 26.5.0 and Node 24.21.0. Compatible captures preserve ordered control IDs and state identity while minting observation history; timestamp, session, source-version and locator-hint noise do not alter state hash. Modal, tab, UI version, meaningful order, role and enabled changes do alter identity. App/environment/role scopes separate screens. Unconfigured scope role, unknown accessibility role and forbidden value/private-key fields reject without revision changes. Partial evidence neither creates/reuses states or controls nor attaches a state evidence link; summaries retain null check time. Wrong-app evidence is withheld. Injected late receipt failure rolls back all table counts and revision. Identical replay survives reopen without mutation. Structured evidence remains identical after reopen.
- Checker also used the SQLite binding's backup API on an active WAL store to create a private 0600 consistent backup. The backup quick-checks as `ok`, retains revision and complete capture rows, and contains none of the corpus's four seeded sensitive markers. Independent raw byte inspection of database, WAL, coordination database and backup, plus emitted core status/ingest/evidence/error envelopes, found none of those markers. All were synthetic, disposable and removed; this is a scoped absence check, not an unlimited privacy guarantee or public backup/restore acceptance.
- `git diff --check`: PASS. AGENTS.md, tasks/plan.md, baseline and ADR-001 are byte-identical to A06. Historical b01–b05 receipts are byte-identical to B05 commit. No authority or historical check was weakened.

The first checker setup reused the same in-memory source object inside a locator hint and omitted the required partial reason; strict validation rejected those malformed synthetic probes. The reviewer cloned the hint source and supplied `subtree_only`, then reran the final checker on both runtimes. These were checker setup corrections; product bytes were unchanged.

## Review reasoning and limitations

The implementation keeps schema validation/redaction, identity projections, transactional persistence and public transport in separate modules. Redaction preserves only reviewed labels and configured UI aliases; unknown text and arbitrary test IDs disappear before canonical hashing and SQLite writes. Explicit app/scope/view-key identity prevents name/route merges. Immutable projections preserve meaningful hierarchy/order and safe flags, independent of observation-specific hints. Short parameterized transactions serialize writes, guard revision, persist sanitized replay receipts and roll back late failures. Partial captures have fragment identity only and link their screen; full-state evidence never comes from incomplete coverage. Strict public limits bound trees, recursive depth and serialized inputs.

Store startup and coordination use fixed private paths, foreign keys, WAL, bounded busy handling and SQLite lifetime locks rather than persisted process identifiers. Fresh tests reproduce separate-process maintenance exclusion and future-schema refusal. Evidence reads hold a consistent snapshot, bind cursors to selected app/project/IDs/projection/revision, enforce JSON envelope budgets and explicitly identify unavailable/incomplete results. CLI/core/MCP parity and sanitized rejected transport values are independently exercised by the fresh 54-test runs; status declares only implemented capabilities and does not promise UI verification. No new dependency, knowledge-core browser action or network listener enters Phase B.

Opaque request/trace/session/tab/source metadata must be caller-minted and nonidentifying; approved operator labels/route/scope aliases require review. The tests do not certify arbitrary operator allowlists or dishonest callers. Controlled private parent directories and local filesystems remain prerequisites; hostile concurrent ancestor replacement is untested. Only this macOS arm64 Node 24/26 artifact is attested. Browser capture mapping, origin/action authority, forced session cleanup, authentication, transitions, semantic annotations, richer recall, changes/freshness, cap remediation and full crash/migration/restore matrices remain their assigned C/D/E tasks. This private API backup probe does not implement E03 commands. Coding-host/cross-platform/distribution compatibility and remote shipping CI remain separate evidence. Blank browser feasibility and fixture rendering do not establish product browser privacy. No later gate or public package publication is approved here.

## Exact checkpoint artifact

The entire Phase B diff against A06 was reviewed, including tests and guides. Source/test/document SHA-256 identities below are the exact unchanged B05 bytes; this receipt and mutable register are excluded. Current generated schema SHA-256 is `5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a`. The separately accepted final B06 register/README are identified below; the earlier archive observations above cover the B05 README.

| Path | SHA-256 |
| --- | --- |
| README.md (B05) | 8e4917885582bb00ff272d485b3b39fefefb7aa2a366eddbd0fcc8b05bf10a88 |
| docs/capture-persistence.md | 9e76ee1c74c032d43b66797f511663a450e3387fcbbb1e7bf113aad56b2fb72a |
| docs/configuration.md | 887fb13b9b2b68655223232967aba93ec0eab8ccaac3e5a14fb879e66c9a49cf |
| docs/contracts.md | e261b2ccb8cf2007ad95f8b96ad8ea0476c83ccf8fc82c6baac316328f23f9a8 |
| docs/runtime-feasibility.md | b5454aa1482fed47c88d2bd73552fb00a5cd763cb9ba7f41136a272f4c1bcb8a |
| package.json | d23aaecf54405d6efe4d6aa2da83c33dd762883798ced58d9f351691bf8ff0cd |
| scripts/protocol-probe.mjs | 8c4301fe68f4e04badf268aa19b345cfd9cdfa32f0bd63e6f553b26512e9899e |
| scripts/smoke-packed.mjs | 11b73674ce514754f1b83851e9848b68d0305d2b83ae0b707a6087002b4730dc |
| src/cli.ts | 3cf92bd3e81668885601c531a1d98a7ca3ffb7823b853573742ecc35360c83d9 |
| src/core/ingest.ts | 932ef0926b8afdc4035ec8d9a6efea52097bd7904132819a6e815abe9cd4ea1e |
| src/core/normalize.ts | 5a9a4c792c09fd66de9a94d0872e2ae77b74c31af493d2bf27a9a0b6472f7fac |
| src/core/retrieval.ts | b2e2497ce083c740e732a03876723865b196af566895bb73ed55348dd16c970e |
| src/index.ts | ed5dea2f526c07728eae059293b4e878c0916d59ca2ef7ad910a5685b401bd1e |
| src/mcp/index.ts | 1de8c63a9a3b6eb95e8a668219dc1c08134380f3161816bf570934846a2e633d |
| src/runtime/index.ts | 8e157cbf387785f5eb5202627b99ccbf2e0845a15217fed16e252e596703d7ce |
| src/store/database.ts | 12360aa54e568faaa4337e6e5495b63d13ef8f4cc4510c910bac47f3f5a6f5f2 |
| src/store/schema.ts | fa260d068be51144acb15a622cc620262c07d65de2307b41c8f1e08af313f1d7 |
| tests/README.md | ae7ce662c7d7f5fcbe64cf7a4a2fe5f71ed5592908e5a736df115f1a01827076 |
| tests/browser/fixtures.mjs | a796be2d83b4038e31d57df6b9be47438a9cce1c4245c50971a52265fbf850c0 |
| tests/fixtures/storage.mjs | 31112d7fb24add833b8c69a26a452e5293dfaad82072a16f1a541fa84d1fa4c5 |
| tests/fixtures/ui/index.mjs | 755c5678b3d8231c348ee409abffe3b3dc1601e20e99b15a9d0c64abee09b6fc |
| tests/ingest.test.mjs | 172045ca31175404a13a5233bc1173acb62f05fa97af63c46ebea427ed34082e |
| tests/normalization.test.mjs | 90dd572ab8ed7fd13ebb74c22b6c9dc3fdcb45ab28a27e02d25ab9e5cfb3e00e |
| tests/retrieval.test.mjs | 0da613480fc074cd05503d622585e8eded406b941110d62061a95f094ab46c13 |
| tests/runtime.test.mjs | 49660fdfc0a3703aefcea76bcc9886c8676417a1aa83183ac87bd10d07396995 |
| tests/store.test.mjs | 903567f1c53ba015f6b46f3c29563c42e767c1484f32dc01ec13b7e3f422d035 |
| tests/ui-fixtures.test.mjs | cca41b0bb3bd58a2bb63784d98dfc7906ba5378da435584f1f69a29bab02ccdd |

## Reproducible independent synthetic checker

This fenced JavaScript is evidence-only, outside product/test commands. Extract it to a disposable `.mjs` path, run from the repository root after `npm run build` with each runtime, then remove the script. It creates and removes private synthetic storage in a finally block. Exact checker SHA-256 including its final newline: `73ccb5dec3d1490483493f73fc6bd3018b7e176c533496bbf67fe53fb8471480`.

```javascript
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const rootUrl = pathToFileURL(resolve(".") + "/");
const load = (path) => import(new URL(path, rootUrl));
const { initializeConfiguration } = await load("dist/config/index.js");
const { Store } = await load("dist/store/database.js");
const { ingest } = await load("dist/core/ingest.js");
const { evidence, status } = await load("dist/core/retrieval.js");
const { errorResponse } = await load("dist/core/normalize.js");
const { fixtureSettings, fixtureCapture, sensitive } = await load(
  "tests/fixtures/ui/index.mjs",
);
const Sqlite = createRequire(new URL("package.json", rootUrl))(
  "better-sqlite3",
);
const dir = await mkdtemp("/private/tmp/waygrain-b06-probe-");
let store;
const captured = [];
try {
  const settings = fixtureSettings();
  settings.apps.push({ ...structuredClone(settings.apps[0]), alias: "second" });
  const config = join(dir, "private/config.json");
  await initializeConfiguration(config, settings);
  store = await Store.open(config);
  const base = {
    schema_version: 1,
    project_id: store.location.configuration.project_id,
    app_id: store.location.configuration.apps[0].app_id,
  };
  let seq = 0;
  const now = Date.parse("2026-10-07T00:00:00Z");
  const req = (options = {}) => ({
    ...base,
    request_id: "b06_" + ++seq,
    screen_ref: { kind: "new", name: "Members", view_key: "members" },
    capture: structuredClone(fixtureCapture({ ...options, seq })),
  });
  const run = (request) => {
    const out = ingest(store, request, now);
    captured.push(JSON.stringify(out));
    return out;
  };
  const aReq = req();
  const a = run(aReq);
  const noisy = req();
  noisy.capture.captured_at = "2026-10-06T23:00:00Z";
  noisy.capture.source.producer_version = "2";
  noisy.capture.session_id = "other_synthetic_session";
  noisy.capture.tree.children[1].locator_hint = {
    kind: "accessible_name",
    hint: "Active",
    source: structuredClone(noisy.capture.source),
    observed_at: noisy.capture.captured_at,
  };
  const b = run(noisy);
  assert.equal(a.data.state_id, b.data.state_id);
  assert.equal(a.data.state_hash, b.data.state_hash);
  assert.deepEqual(a.data.control_ids, b.data.control_ids);
  assert.notEqual(a.data.capture_id, b.data.capture_id);
  for (const options of [{ modal: true }, { tab: "pending" }, { version: 2 }])
    assert.notEqual(run(req(options)).data.state_id, a.data.state_id);
  for (const modify of [
    (c) => c.tree.children.reverse(),
    (c) => (c.tree.children[1].enabled = false),
    (c) => (c.tree.children[1].role = "button"),
  ]) {
    const q = req();
    modify(q.capture);
    assert.notEqual(run(q).data.state_hash, a.data.state_hash);
  }
  for (const options of [{ role: "viewer" }, { environment: "production" }])
    assert.notEqual(run(req(options)).data.screen_id, a.data.screen_id);
  const second = req();
  second.app_id = store.location.configuration.apps[1].app_id;
  assert.notEqual(run(second).data.screen_id, a.data.screen_id);
  const revisionBeforeErrors = store.revision;
  for (const modify of [
    (q) => (q.capture.scope.role = "unknown"),
    (q) => (q.capture.tree.role = "unknown_role"),
    (q) => (q.capture.tree.value = sensitive.secret),
    (q) => (q.capture.tree[sensitive.secret] = sensitive.secret),
  ]) {
    const q = req();
    modify(q);
    assert.throws(
      () => run(q),
      (error) => {
        captured.push(JSON.stringify(errorResponse(error)));
        return true;
      },
    );
  }
  assert.equal(store.revision, revisionBeforeErrors);
  const statesBeforePartial = store.db
    .prepare("SELECT COUNT(*) AS n FROM states")
    .get().n;
  const controlsBeforePartial = store.db
    .prepare("SELECT COUNT(*) AS n FROM controls")
    .get().n;
  const partial = req();
  partial.capture.coverage = {
    kind: "partial",
    subtree: "members",
    reason: "subtree_only",
  };
  const partialOut = run(partial);
  assert.equal(partialOut.data.state_id, null);
  assert.equal(partialOut.data.state_hash, null);
  assert.deepEqual(partialOut.data.control_ids, []);
  assert(partialOut.data.fragment_hash);
  assert.equal(
    store.db.prepare("SELECT COUNT(*) AS n FROM states").get().n,
    statesBeforePartial,
  );
  assert.equal(
    store.db.prepare("SELECT COUNT(*) AS n FROM controls").get().n,
    controlsBeforePartial,
  );
  assert.deepEqual(
    store.db
      .prepare("SELECT target_id FROM evidence_links WHERE capture_id=?")
      .all(partialOut.data.capture_id)
      .map((r) => r.target_id),
    [a.data.screen_id],
  );
  const eReq = {
    ...base,
    ids: [a.data.capture_id, partialOut.data.capture_id],
    projection: "structured",
    budget: { records: 20, bytes: 65536 },
  };
  const ev = evidence(store, eReq, now);
  captured.push(JSON.stringify(ev));
  assert.equal(ev.data.items[1].state_id, null);
  assert.equal(ev.data.items[1].capture.coverage.kind, "partial");
  const summary = evidence(store, { ...eReq, projection: "summary" }, now);
  captured.push(JSON.stringify(summary));
  for (const item of summary.data.items)
    assert.equal(item.source_summary.freshness.last_checked_at, null);
  const wrongApp = evidence(store, { ...eReq, app_id: second.app_id }, now);
  assert.equal(wrongApp.data.status, "unavailable");
  assert.deepEqual(wrongApp.data.items, []);
  captured.push(JSON.stringify(status(store, base)));
  const tables = [
    "records",
    "scopes",
    "screens",
    "states",
    "controls",
    "captures",
    "evidence_links",
    "receipts",
  ];
  const counts = () =>
    tables.map(
      (t) => store.db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n,
    );
  const originalCounts = counts();
  const before = store.revision;
  store.db.exec(
    "CREATE TEMP TRIGGER b06_fail BEFORE INSERT ON receipts BEGIN SELECT RAISE(ABORT,'b06 synthetic late failure'); END;",
  );
  assert.throws(
    () => run(req({ modal: true, tab: "pending" })),
    (error) => {
      captured.push(JSON.stringify(errorResponse(error)));
      return true;
    },
  );
  assert.deepEqual(counts(), originalCounts);
  assert.equal(store.revision, before);
  store.db.exec("DROP TRIGGER b06_fail");
  assert.deepEqual(run(aReq), a);
  assert.deepEqual(counts(), originalCounts);
  assert.equal(store.revision, before);
  const backup = join(dir, "private/storage/checkpoint-backup.sqlite");
  await writeFile(backup, "", { flag: "wx", mode: 0o600 });
  await store.db.backup(backup);
  assert.equal((await stat(backup)).mode & 0o777, 0o600);
  const backupDb = new Sqlite(backup, { readonly: true });
  assert.equal(backupDb.pragma("quick_check", { simple: true }), "ok");
  assert.equal(
    backupDb.prepare("SELECT revision FROM meta").get().revision,
    before,
  );
  assert.deepEqual(
    backupDb
      .prepare("SELECT id,state_id,capture_json FROM captures ORDER BY id")
      .all(),
    store.db
      .prepare("SELECT id,state_id,capture_json FROM captures ORDER BY id")
      .all(),
  );
  backupDb.close();
  const paths = [
    store.location.databasePath,
    store.location.databasePath + "-wal",
    store.location.coordinationPath,
    backup,
  ];
  for (const path of paths) {
    const bytes = await readFile(path);
    for (const marker of Object.values(sensitive))
      assert(!bytes.includes(Buffer.from(marker)));
  }
  for (const output of captured)
    for (const marker of Object.values(sensitive))
      assert(!output.includes(marker));
  store.close();
  store = await Store.open(config);
  assert.deepEqual(run(aReq), a);
  assert.equal(store.revision, before);
  assert.deepEqual(counts(), originalCounts);
  assert.deepEqual(evidence(store, eReq, now), ev);
  console.log(
    JSON.stringify({
      status: "passed",
      node: process.version,
      identity_noise_order: true,
      scope_and_unknown_roles: true,
      partial_nonconfirmation: true,
      safe_evidence: true,
      replay_history_rollback: true,
      private_api_backup_db_wal_outputs_marker_absence: true,
    }),
  );
} finally {
  store?.close();
  await rm(dir, { recursive: true, force: true });
}
```

## Separate final checkpoint documentation acceptance

After the coordinator recorded the checkpoint verdict, this reviewer independently reread and accepted the final B06 documentation. `tasks/todo.md` SHA-256 `2e27e11f9724a785f3ed1b789bd51d8cc8c753a0d215168c492f8384235b5ba0` and `README.md` SHA-256 `508f943985e8bd35d74f8825e1ed03665ac488cbe25469cb7383fb4107876c2a` accurately record B01–B06 verified, actual checks/limits, and C01 pending without authorization. All 26 non-README source/script/test/guide/package identities in the table above remain byte-identical to B05 `8b3d44a`. B05 shipping merge `b3dd059` changes no implementation content.

Because README is packed, fresh final-document packed checks were repeated separately. Node 26.5.0 PASS: 46 files, archive SHA-256 `4ea5fd7e2c98c2e08d6b9cdd1be34c8525cc4116b1ad22aa7c415ae7d396a04c`. This later archive includes the final B06 README; earlier packed identities remain historical B05 README observations. Node 24.21.0 PASS: 46 files, archive SHA-256 `92d307ff3c0c826e0d8facebcea2a576e99b7f44c3ecba565b9564c7722271b5`, also including the final B06 README. Both final harness scratch roots were removed. All packed checks use the same assigned feasibility/contract/stdio checks and retain the same limitations above. Source bytes were frozen throughout. The receipt's exact embedded checker hash was verified after formatting; its scratch script was removed.
