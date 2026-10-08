# Waygrain task register

Source of task definitions, dependencies, acceptance criteria, and verification requirements: [plan.md](plan.md).

A01 is `verified`; A02 is `verified`; A03 is `verified`; A04 is `verified`; A05 is `verified`; A06 is `verified`; B01 is `verified`; B02 is `verified`; B03 is `verified`; B04 is `verified`; B05 is `verified`; B06 is `verified`; C01 is `verified`; C02 is `verified`; C03 is `verified`; C04 is `verified`; C05 is `verified`; D01 is `verified`; D02 is `verified`; D03 is `verified`; D04 is `verified`; D05 is `verified`; D06 is `verified`; E01 is `verified`; E02 is `verified`; E03 is `verified`; E04 is `verified`; E05 is `verified`; E06 is `verified`; F01 is `verified`; F02 is `verified`; F03 is `verified`; F04 is `verified`; F05 is deferred by the user and F06 awaits its dependencies. Saving the plan alone does not verify a task. Task definitions below incorporate the dependencies, scope, acceptance criteria, and verification requirements in [plan.md](plan.md), section 4; sections 3 and 5 govern execution and checks.

Specification authority: [v0.2 baseline snapshot](../docs/specification-v0.2.md) plus [ADR-001 amendment](../docs/decisions/001-bundled-browser.md).

## Execution rules

- Execute one user-selected task per run, verify and review its exact artifact, record the result, then stop.
- Status progression: `pending → in_progress → implemented → verified`; use `blocked` only with a concrete reason.
- Only verified dependencies permit a task to start. Mark a checkbox complete only when its task is verified.
- For each started task, append a record using the template below. Record verification commands and actual results; do not infer passes.
- Later changes to a reviewed artifact invalidate that review. Commit, push, and publication require separate authorization.

## Stage A — Foundation

- [x] A01 — Record specification amendment and task register — verified
- [x] A02 — Bootstrap package and quality commands — verified
- [x] A03 — Define explicit configuration and initialization — verified
- [x] A04 — Prove packaging and runtime feasibility — verified
- [x] A05 — Define public knowledge and browser contracts — verified
- [x] A06 — Foundation checkpoint — verified

## Stage B — Capture and persistence

- [x] B01 — Build synthetic UI and privacy fixtures — verified
- [x] B02 — Implement redaction and normalization — verified
- [x] B03 — Implement schema and basic transactional store — verified
- [x] B04 — Implement complete and partial capture ingestion — verified
- [x] B05 — Expose status and evidence retrieval — verified
- [x] B06 — Capture checkpoint — verified

## Stage C — Bundled browser

- [x] C01 — Implement browser session lifecycle — verified
- [x] C02 — Implement sanitized structured snapshots — verified
- [x] C03 — Implement current target resolution and navigation — verified
- [x] C04 — Implement bounded browser actions and attempt receipts — verified
- [x] C05 — Browser checkpoint — verified

## Stage D — Evidence graph and recall

- [x] D01 — Implement guarded annotations and identity reconciliation — verified
- [x] D02 — Implement actions, events, and observed transitions — verified
- [x] D03 — Implement flows and test-run evidence — verified
- [x] D04 — Implement lexical search and neighbors — verified
- [x] D05 — Implement path and flow retrieval — verified
- [x] D06 — Recall checkpoint — verified

## Stage E — Changes and recovery

- [x] E01 — Implement capture and revision comparisons — verified
- [x] E02 — Implement freshness and refresh plans — verified
- [x] E03 — Implement export, backup, and restore — verified
- [x] E04 — Implement scoped deletion, undo, purge, and storage cap — verified
- [x] E05 — Verify concurrency, crash, and migration recovery — verified
- [x] E06 — Recovery checkpoint — verified

## Stage F — Plugin and Blogen pilot

- [x] F01 — Package plugin skills and setup workflow — verified
- [x] F02 — Add Blogen profile and pilot fixtures — verified
- [x] F03 — Verify three Blogen journeys — verified
- [x] F04 — Verify new-session recall in Codex — verified
- [ ] F05 — Verify Claude Code portability on macOS — pending
- [ ] F06 — Pilot checkpoint — pending

## Stage G — Evaluation and release readiness

- [ ] G01 — Build reproducible evaluation harness — pending
- [ ] G02 — Run efficiency and correctness evaluation — pending
- [ ] G03 — Run unfamiliar-developer installation trial — pending
- [ ] G04 — Complete release-readiness review — pending

## Task record template

Copy this template when a task starts; replace every placeholder with observed information.

```markdown
### <Task ID> — <Title>

- Status: <pending | in_progress | implemented | verified | blocked>
- Authorized scope: <user-selected task and boundaries>
- Dependencies: <IDs and verified evidence>
- Acceptance criteria: <criteria from plan.md>
- Implementation artifact: <commit or exact file/diff hashes>
- Verification commands and results: <actual commands, outcomes, and evidence links>
- Independent reviewer and reviewed artifact: <identity and matching artifact>
- Review outcome: <findings, fixes, and final verdict>
- Remaining limitations or blocking reason: <specific facts, or none>
- Next eligible task: <ID; do not start automatically>
```

## Task results

### A01 — Record specification amendment and task register

- Status: verified.
- Authorized scope: first task selected by the user on 6 October 2026; document the browser amendment, stack, architecture, execution rules and register only.
- Dependencies: none.
- Acceptance criteria: documents the agreed browser boundary, stack, architecture and task execution rules; review for consistency with the product spec.
- Implementation artifact: ADR-001, local v0.2 source snapshot, this register and the reproducible document check; exact SHA-256 identities are recorded in [independent review evidence](evidence/a01/review.md). The existing plan is an unchanged authority input. The evidence report is a receipt, outside its own hashed artifact set.
- Verification commands and results: `python3 tasks/evidence/a01/check-documents.py` checks task coverage/order/dependencies, local links and A01-only scope. PASS from the implementation writer and independently from `/root/a01_review`: 39 unique tasks, valid earlier-task dependencies, resolving local links, 38 later tasks pending, no package bootstrap. Build/typecheck/runtime tests are not applicable: no package exists until A02.
- Independent verifier/reviewer and reviewed artifact: `/root/a01_review`; reviewed the v0.2 baseline snapshot and amendment, independently ran document checks, and reviewed the final register bytes; hashes and results are in [review.md](evidence/a01/review.md).
- Review outcome: PASS; no Required findings. Browser ownership/control, network access and trace generation are explicit amendments; knowledge, privacy and evidence invariants remain intact. See the independent report for verification scope and limitations.
- Remaining limitations or blocking reason: documentation does not prove dependency availability, public APIs, packaging, browser privacy/cleanup or host compatibility; assigned to A02/A04/A05 and later gates. The workspace has no Git repository, so file hashes identify artifacts; no Git initialization, commit, push or publication is included.
- Next eligible task: A02 — Bootstrap package and quality commands. Not started; needs user selection.

### A02 — Bootstrap package and quality commands

- Status: verified.
- Authorized scope: user selected the next task on 6 October 2026; A02 package scaffold and quality tooling only.
- Dependencies: A01 verified with historical exact-artifact review in evidence/a01/review.md.
- Acceptance criteria: Apache-2.0 package builds; typecheck, lint and empty test harness run; exact dependency versions and licenses recorded.
- Implementation artifact: A02 package, lockfile, quality configuration, empty ESM module, development docs and register; exact SHA-256 identities are in the [independent review receipt](evidence/a02/review.md), outside its own hashed artifact set. A01 historical evidence and authority sources remain unchanged.
- Verification commands and results: writer PASS for `npm install`, clean `npm ci` on Node 24.21.0, and `npm run check` on Node 24.21.0 and Node 26.5.0. Strict typecheck, lint, formatting and build pass; Node harness explicitly reports zero tests. Exact runtime pins were confirmed through npm registry metadata; complete declared license inventory is in [dependencies.md](../docs/dependencies.md). Independent `npm run check` PASS on both versions; isolated nested test probes on each discovered a real test and rejected a failing assertion with exit 1. Built ESM scaffold imports with zero exports.
- Independent verifier/reviewer and reviewed artifact: `/root/a02_review`; reviewed all A02 files and preserved authority/history, independently ran both runtime quality checks and harness probes. Exact hashes and commands are in [review.md](evidence/a02/review.md).
- Review outcome: PASS; no Critical or Required findings. Strict ESM scaffold, compatible exact tool pins, lockfile/license inventory and quality commands satisfy A02 only.
- Remaining limitations or blocking reason: empty scaffold has no product behavior tests. Product runtime, configuration, packed stdio/SQLite/headed-browser feasibility, browser licenses/privacy/cleanup, public contracts and host support remain later tasks. Clean installation emitted an npm allow-scripts warning for better-sqlite3; native loading is not attested by these quality checks and remains A04. CI workflow is configured but has not run remotely. Node 24 and 26 checks here attest only this macOS development scaffold. No commit, push or publication.
- Next eligible task: A03 — Define explicit configuration and initialization. Not started; requires user selection.

### A03 — Define explicit configuration and initialization

- Status: verified.
- Authorized scope: user selected the next eligible task on 7 October 2026; explicit configuration, initialization and restricted local storage setup only.
- Dependencies: A02 verified; exact-artifact independent receipt in evidence/a02/review.md. A01/A02 authority and historical evidence preserved.
- Acceptance criteria: init creates validated project/app configuration and restricted local storage; invalid paths and silent host edits are rejected.
- Implementation artifact: strict configuration schema, explicit initialization/loading, minimal setup CLI, synthetic tests, setup documentation, package command updates and register; exact SHA-256 identities are in the [independent review receipt](evidence/a03/review.md), outside its own hashed artifact set. The receipt separately identifies this final verified-register artifact.
- Verification commands and results: writer PASS for `npm run check` on Node 26.5.0 and `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check` on Node 24.21.0 (initial six tests). A later named-pipe guard added a seventh test. Independent final `npm run check` PASS on Node 26.5.0 and Node 24.21.0: strict typecheck, lint, formatting, build and all seven synthetic tests. Additional independent probes passed for config size bounds before writes, all six database/WAL/SHM paths' permissions and hard links, deep freezing, read-only load and oversized CLI settings. Details and historical FIFO reproduction are in the receipt.
- Independent verifier/reviewer and reviewed artifact: `/root/a03_review`; independently ran final checks, reviewed the exact source and documentation, compared preserved authority/history with HEAD, and identified the implemented and final verified register bytes separately in [review.md](evidence/a03/review.md).
- Review outcome: PASS; no Critical or Required findings. Initialization mints UUIDs into a new private configuration directory, validates explicit scopes/origins/routes/profiles/cap, derives fixed storage paths, refuses invalid/linked/unsafe destinations and avoids host or ignore-file edits. Special files fail without blocking; failures emit sanitized codes.
- Remaining limitations or blocking reason: reviewed labels/nonidentifying aliases remain operator responsibilities. Filesystem checks assume controlled parent directories; concurrent hostile ancestor replacement and init crash recovery are not attested. Only this macOS setup artifact was exercised; remote CI and other platforms remain unverified. A04 packed stdio/SQLite/headed-browser feasibility and later redaction, locking, cap enforcement and host compatibility remain outside A03. No commit, push or publication.
- Next eligible task: A04 — Prove packaging and runtime feasibility. Not started; requires user selection.


### A04 — Prove packaging and runtime feasibility

- Status: verified.
- Authorized scope: user selected the next eligible task and shipping on 7 October 2026; A04 feasibility only. Delivery authorization covers branch, commit, push, PR, CI, merge and local sync, without package publication.
- Dependencies: A03 verified; historical exact-artifact review in evidence/a03/review.md; A01/A02 authority/history preserved.
- Acceptance criteria: packed artifact launches stdio, opens SQLite and launches headed Chromium through explicit setup; retain reproducible smoke results.
- Implementation artifact: feasibility-only serve/install-browser/smoke-runtime commands, disposable SQLite and browser probes, clean tarball harness, focused tests and docs. Exact source and packed file hashes are recorded in the [independent receipt](evidence/a04/review.md), outside its own artifact set. The receipt separately identifies the later final verified-register bytes.
- Verification commands and results: writer `npm run check` PASS on Node 26.5.0 (10 tests); Node 24.21.0 PASS before the final missing-browser test (9 tests). `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run smoke:packed` PASS on macOS arm64: clean tarball install with scripts disabled, npm bin initialization, MCP 2025-11-25 initialize/ping/unsupported tools/EOF, private disposable disk SQLite WAL/quick-check/read, explicit Chromium download and blank headed launch, no configured storage left. Preliminary tarball SHA-256 `5f97cd00fd25ed08fb9e1629e0816975f5b85fc0a9adcaa92a24642b51eadd9d` predates README updates and is historical smoke evidence, not the final artifact. Writer Node 26 packed smoke PASS with SHA-256 `83867814b17ef263f2f700584547aeae19979256cb67a20ff33bde18e35fe4e0`. Independent final quality checks PASS on Node 24.21.0 and Node 26.5.0 (all 10 tests each); independent packed smoke PASS on both. Final Node 24 archive SHA-256 `820021281bc478e5f7eddfb5b38b14897d743398c87c387d7c1f35398e78a810`; final Node 26 archive matches the writer. Independent comparison confirms identical content identities for all 17 packed files across both archives, with archive hashes reproduced on their respective runtimes.
- Independent verifier/reviewer and reviewed artifact: `/root/a04_review`; independently ran both runtime quality/packed checks and reviewed exact source, documentation, tests, authority preservation and artifact content identities. See [review.md](evidence/a04/review.md).
- Review outcome: PASS; no Critical or Required findings. The accepted feasibility evidence permits A04 verification only.
- Remaining limitations or blocking reason: no graph persistence/migrations/coordination, public tool contracts, live product capture/privacy, forced browser cleanup, cross-platform or coding-host compatibility claim. Normal disposable resource cleanup is exercised; forced termination/parent-loss and timeout cleanup remain C01/C05. Clean consumer transitive dependencies resolve at install time. Distribution notices and broader native/browser license review remain release work. Remote CI remains unverified until shipping checks finish.
- Next eligible task: A05 — Define public knowledge and browser contracts. Not started.


### A05 — Define public knowledge and browser contracts

- Status: verified.
- Authorized scope: user explicitly selected the remaining Phase A tasks (A05, then A06) and shipping on 7 October 2026, overriding the one-task-per-run default for this bounded batch. No Stage B work or package publication is authorized.
- Dependencies: A04 verified, exact source/packed receipts in evidence/a04/review.md; shipped via PR #2. Historical authority/evidence preserved.
- Acceptance criteria: versioned strict schemas cover tools, envelopes, errors, limits and browser attempt states; contract fixtures validate.
- Implementation artifact: src/contracts modules, package exports/generated JSON Schema build command, synthetic fixtures/tests, contract documentation and register. The packed harness also checks public contract exports/generated schemas; its guide records this later artifact separately. Exact repaired artifact hashes are recorded in [evidence/a05/review.md](evidence/a05/review.md); the receipt is outside its own artifact set.
- Verification commands and results: writer `npm run check` PASS on Node 26.5.0 and `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check` PASS on Node 24.21.0: typecheck, lint, formatting, build and all 33 tests before independent findings. Writer repaired Node 26 quality check PASS (36 tests); Final independent quality checks PASS on Node 24.21.0 and Node 26.5.0 (36 tests each). Fixtures validate all 13 tool request/response pairs through Zod and SDK AJV, record kinds, mode/operation/action/attempt variants, strict unknown fields, byte/node/depth/time limits, partial identities and generated artifact equality.
- Independent verifier/reviewer and reviewed artifact: `/root/a05_review`; exact repaired source/docs/tests/package/harness identities, generated schema hash, commands, findings and limits in [review.md](evidence/a05/review.md). The receipt separately identifies the final verified-register bytes.
- Review outcome: PASS; no unresolved Critical or Required findings. Historical Required findings (structured evidence tree bounds and missing annotation/capture metadata) were repaired; partial/complete capture identity and bounded error paths were also checked independently.
- Remaining limitations or blocking reason: contracts do not implement tool behavior, persistence, redaction or browser enforcement.
- Next eligible task: A06 — Foundation checkpoint; authorized in this batch, not yet started.


### A06 — Foundation checkpoint

- Status: verified.
- Authorized scope: remaining Phase A batch selected on 7 October 2026; independent read-only foundation acceptance and result recording, followed by shipping. No Stage B implementation or package publication.
- Dependencies: A01–A05 verified with distinct historical exact-artifact receipts in evidence/a01 through evidence/a05. A05 accepted and committed as `3cfa1adef6a49044c598eb790beb34db0969e710` before this checkpoint starts.
- Acceptance criteria: independent review accepts contracts and packaging evidence; unresolved feasibility issues block later tasks.
- Implementation artifact: unchanged A05 implementation commit plus this checkpoint record and status documentation; later artifact identities are recorded separately in [evidence/a06/review.md](evidence/a06/review.md). The receipt distinguishes the in-progress checkpoint from final verified-register bytes. Historical receipts remain unchanged.
- Verification commands and results: independent `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check` and `npm run check` PASS (Node 24.21.0/26.5.0, 36 tests each); independent `npm run smoke:packed` on both runtimes PASS on macOS arm64: 34 packed files, clean install with scripts disabled, 13 public contract exports/generated schema equality, MCP initialize/ping/unsupported-tools/EOF, disposable disk SQLite WAL/integrity/read and explicit blank headed Chromium. A06 Node 24 tarball SHA-256 `61b22891130729b7a8a665c5e3d45b8462a656105772a74901159cec0b654a90`; Node 26 `ca54e300a0156c978ff168bb1a0d2d2373ed8a9b9d9f7a364aa251404c5e7fab`; generated schema `5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a`. Independent pinned API metadata/type review, unchanged authority/history/source comparisons, local links and diff checks PASS. Full details and source identities are in the receipt.
- Independent verifier/reviewer and reviewed artifact: `/root/a06_checkpoint`; fresh reviewer independently ran current foundation checks and reviewed complete A05/A06 artifact against authority and origin/main. Exact identities and reviewed limits are in [review.md](evidence/a06/review.md).
- Review outcome: PASS; no Critical or Required findings or unresolved foundation feasibility blockers. Phase A is complete; accepted contracts and current packed evidence satisfy A06 only.
- Remaining limitations or blocking reason: no unresolved foundation blocker. Public JSON snapshot methods are confirmed in pinned types, not live mapped/redacted capture; C02 owns mapping/privacy. macOS arm64 Node 24/26 blank-runtime feasibility does not attest product browser policy, authentication, replay/dispatch, temporary-profile deletion, forced cleanup or coding-host/cross-platform support. Graph persistence/recovery and comprehensive native/browser distribution review remain later gates. Remote shipping CI is separate from these local checks; no package publication.
- Next eligible task: B01 — Build synthetic UI and privacy fixtures. Not authorized by this Phase A request and not started.


### B01 — Build synthetic UI and privacy fixtures

- Status: verified.
- Authorized scope: user selected all Phase B tasks and shipping on 7 October 2026; this explicitly overrides the one-task-per-run default for B01–B06 only. Ship includes commits, push, PR, CI, merge and local sync; package publication remains excluded.
- Dependencies: A06 verified at the shipped foundation checkpoint, commit cf3fffc, with historical evidence/a06/review.md preserved.
- Acceptance: four screens, two roles/environments, modal/tab states, changed UI version and synthetic sensitive markers.
- Artifact: synthetic UI/capture/settings fixtures, corpus test, explicit headed-browser test, package command and capture-persistence guide.
- Verification: writer and independent npm run check PASS on Node 26.5.0; independent Node 24.21.0 PASS, 37 tests each. Writer and independent npm run test:fixtures PASS, 32 headed cases, using approved escalation after sandbox OS launch restriction. Independent verifier/reviewer /root/b01_review reports no required findings; exact source identities and limitations in evidence/b01/review.md.
- Remaining limits: fixtures do not implement the Waygrain browser, capture mapping or privacy enforcement. No retained browser artifacts; DevTools MCP unavailable, so live checks use Playwright.


### B02 — Implement redaction and normalization

- Status: verified.
- Authorized scope: selected Phase B batch and shipping, 7 October 2026.
- Dependencies: B01 verified, independent exact-artifact receipt evidence/b01/review.md; implementation commit 81a4d83.
- Acceptance: deterministic safe structure, preserved meaningful order, forbidden values absent before output and persistence.
- Artifact: core redaction/canonical projection functions, negative/identity tests, reviewed synthetic alias extension and guide.
- Verification: writer and independent npm run check PASS on Node 26.5.0; independent Node 24.21.0 PASS, 39 tests each. Independent /root/b02_review accepted exact artifact with no Critical or Required findings; additional immutability, partial/variant, ignored-field, hints and safe-name probes PASS. Exact identities and actual limitations in evidence/b02/review.md.
- Remaining limits: B02 has no persistence or browser mapping. Opaque nonidentifying provenance keys are caller metadata; labels require operator review. Unknown fields fail strict validation; test IDs are conservatively dropped.


### B03 — Implement schema and basic transactional store

- Status: verified.
- Authorized scope: selected Phase B batch and shipping, 7 October 2026.
- Dependencies: B02 verified, exact-artifact evidence/b02/review.md, commit 3657332.
- Acceptance: foreign keys, migrations, revision guards, bounded busy handling and maintenance coordination; failed writes leave no partial records.
- Artifact: initial normalized schema, private fixed-path SQLite store and lifetime coordination, focused synthetic rollback/peer/version tests and guide.
- Verification: writer and independent Node 26.5.0 npm run check PASS; independent Node 24.21.0 PASS, 44 tests each. Independent /root/b03_review accepted exact artifact without Required findings. Additional probes passed initial-migration backup integrity/private mode, cross-scope/kind FK rollback, and injected mid-migration schema/version rollback. Exact identities/results in evidence/b03/review.md.
- Remaining limits: initial schema migration only; E03 owns public backup/restore, E05 owns full migration/crash matrix. Local filesystems/private controlled parents required; no cross-platform attestation.


### B04 — Implement complete and partial capture ingestion

- Status: verified.
- Authorized scope: selected Phase B batch and shipping, 7 October 2026.
- Dependencies: B03 verified, independent evidence/b03/review.md, commit db598f8.
- Acceptance: repeated captures preserve history, compatible state identity reused, partial captures remain fragments, identical replay has one effect.
- Artifact: atomic redacted ingest core, synthetic identity/scope/replay/partial/disk-privacy/rollback tests and guide.
- Verification: writer and independent Node 26.5.0 npm run check PASS; independent Node 24.21.0 PASS, 51 tests each. Independent /root/b04_review accepted artifact with no Critical/Required findings. Extra maximum-node/depth, input immutability, before-write rejection and receipt-insert rollback probes PASS on both runtimes. Exact identities and results in evidence/b04/review.md.
- Remaining limits: public transport integration is B05; annotations/actions/transitions/freshness/query/changes and cap remediation remain later tasks. No product behavior or browser mapping claim.


### B05 — Expose status and evidence retrieval

- Status: verified.
- Authorized scope: selected Phase B batch and shipping, 7 October 2026.
- Dependencies: B04 verified, independent evidence/b04/review.md, commit 4f33784.
- Acceptance: CLI/core/MCP return consistent bounded status and evidence without leaking rejected values.
- Artifact: bounded read services, shared dispatch, three-tool MCP endpoint, explicit stdin/status CLI, parity/privacy/cursor tests, later packed/protocol harness expectations and updated guides.
- Verification: writer and independent Node 26.5.0 npm run check PASS; independent Node 24.21.0 PASS, 54 tests each. Independent /root/b05_review accepted artifact without Critical/Required findings; 271 byte-budget boundaries, cross-app separation, cursor binding/corruption, malformed MCP privacy and EOF maintenance-release probes PASS. Independent clean packed smoke PASS on Node 24/26 (46 packed files) with disposable explicit browser setup. Exact source/packed identities and later document identities in evidence/b05/review.md.
- Remaining limits: capture evidence only; semantic annotations and query/changes/freshness/recovery/browser features remain later. Envelope budgets exclude transport wrappers; unfit single items are explicitly incomplete and require larger budgets. No coding-host or cross-platform claim.


### B06 — Capture checkpoint

- Status: verified.
- Authorized scope: selected Phase B batch and shipping, 7 October 2026; read-only capture/persistence acceptance and recording only. Stage C is not authorized.
- Dependencies: B01–B05 verified with distinct evidence/b01 through evidence/b05 receipts. B05 implementation accepted and committed at 8b3d44a before checkpoint starts.
- Acceptance: independent tests verify identity, scope separation, redaction, partial coverage and stored evidence.
- Artifact: unchanged B05 implementation plus this checkpoint record; later final register/README identities will be recorded separately in evidence/b06/review.md.
- Verification: fresh independent /root/b06_checkpoint npm run check PASS on Node 24.21.0 and 26.5.0, 54 tests each; headed fixture matrix PASS, 32 cases. Independent current packed smoke PASS on both runtimes, 46 packed files, with disposable explicit setup. Both-runtime identity/noise/order, app/environment/role separation and unknown-role refusal, partial no-state/evidence, replay/history/rollback, retrieval and private SQLite API backup/DB/WAL seeded-marker absence probes PASS. Exact identities, reproducible checker and artifact-specific archive hashes in evidence/b06/review.md. No Critical/Required findings or unresolved capture checkpoint blockers.
- Remaining limits: no unresolved Phase B blocker. Phase B does not prove browser mapping/ownership, actions/transitions, recall/change/freshness semantics, full recovery/cap remediation, coding-host or cross-platform support. Backup probe uses the SQLite API and does not attest later backup/restore CLI behavior. Opaque nonidentifying provenance and reviewed operator labels remain prerequisites. Publication remains excluded.
- Next eligible task: C01 — Implement browser session lifecycle. Not authorized by this Phase B request and not started.


### C01 — Implement browser session lifecycle

- Status: verified.
- Authorized scope: user asked to start Phase C and ship individually on 7 October 2026. This run implements and ships its first eligible task, C01, under the repository one-task-per-run rule. C02–C05 remain pending; no later phase or package publication.
- Dependencies: B06 verified and shipped at a08fe16; historical receipt tasks/evidence/b06/review.md remains unchanged.
- Acceptance: explicit open/status/close owns one headed ephemeral session; manual login works; shutdown and parent-loss cleanup are tested.
- Artifact: isolated browser engine/worker/controller, three MCP lifecycle tools, runtime shutdown integration, deterministic and explicit headed synthetic tests, protocol harness and lifecycle guide.
- Verification: writer final Node 26 npm run check PASS (57 tests). Independent final npm run check PASS on Node 24.20.0 and Node 26.5.0 (57 tests each); final Node 24 headed lifecycle/login suite PASS including open/status/replay/conflict/close, signal and killed-parent cleanup, three startup IPC-loss timings, synthetic same-origin form login and fresh-context isolation. Independent final Node 26 active-MCP EOF and startup-loss probes PASS. The historical concurrent cleanup finding was repaired with shared cleanup and truthful exit status.
- Independent verifier/reviewer: /root/c01_review; PASS with no unresolved Critical/Required findings. Exact hashes and actual evidence are in [tasks/evidence/c01/review.md](evidence/c01/review.md); later final register/README bytes are accepted separately in that receipt. Historical authority and review evidence preserved.
- Remaining limits: no C02 snapshots, C03 target/navigation or C04 actions/attempts. Human login qualification uses synthetic form-entry simulation only. Real credentials/MFA, host/cross-platform support and complete cleanup after simultaneous worker/owner loss are unverified.

- Next eligible task: C02 — Implement sanitized structured snapshots; not started in this C01 run.


### C02 — Implement sanitized structured snapshots

- Status: verified.
- Authorized scope: user explicitly requested continuation until all Phase C tasks are done and continued shipping, overriding one-task-per-run for C02–C05. No later phases or package publication.
- Dependencies: C01 verified and shipped in PR10, f72f58d; historical exact-artifact review preserved.
- Acceptance: public Playwright JSON snapshots map to ingest schema; raw observations remain worker-local; unsupported coverage explicit.
- Artifact: worker-local public JSON mapper, scoped route projection, snapshot MCP integration, root partial coverage ingestion, synthetic deterministic/live checks and guide.
- Verification: final writer npm run check PASS Node26.5.0 (59 tests). Independent final npm run check PASS Node24.20.0 and Node26.5.0 (59 tests each); final headed public JSON/redaction/ingestion/modal/unsupported editing harness PASS, plus independent same-URL navigation and newly appearing editing-host probes.
- Independent verifier/reviewer: /root/c02_review; PASS, no unresolved Critical/Required findings. Exact artifact hashes, historical findings/repairs and limitations in [review.md](evidence/c02/review.md); final register/README bytes accepted separately.
- Remaining limits: no executable target resolution/navigation/actions; frames and unsupported state yield partial captures. One reviewed profile required; aliases remain operator-declared. No host/cross-platform or backend authorization claim.


### C03 — Implement current target resolution and navigation

- Status: verified.
- Authorized scope: remaining Phase C batch and continued shipping selected by user, 7 October 2026.
- Dependencies: C02 verified and shipped PR11 at 60fecea; historical evidence preserved.
- Acceptance: allowed navigation; strict current temporary target resolution; changed/ambiguous UI cannot use stale targets.
- Artifact: worker-local snapshot driver/element identities, guarded navigation and sanitized durable attempt journal in existing receipts, MCP integration, focused deterministic/headed tests and guide.
- Verification: writer final npm run check PASS Node26.5.0 (60 tests); headed navigation/target/redirect harness PASS. Independent final quality checks PASS Node24.20.0 and Node26.5.0 (60 tests each), headed navigation PASS on both; Node26 lifecycle/login regression PASS. Independent redirected navigation/image/fetch/worker-fetch tests saw zero forbidden-origin requests after repair; durable pending markers reopen as unknown with nondispatching replay.
- Independent verifier/reviewer: /root/c03_review; PASS, no unresolved Critical/Required findings. Historical redirect failure, repaired exact artifact hashes and limits in [review.md](evidence/c03/review.md); final register/README accepted separately.
- Remaining limits: no C04 actions. Initial navigation from blank is human-owned; snapshots and scope aliases describe observations/operator context, not backend authorization. No host/platform claim.


### C04 — Implement bounded browser actions and attempt receipts

- Status: verified.
- Authorized scope: remaining Phase C batch and continued shipping, 7 October 2026.
- Dependencies: C03 verified and shipped PR12 at 693958b; historical evidence preserved.
- Acceptance: seven supported actions against current targets; credentials fail closed; duplicate/interrupted execution cannot silently replay.
- Artifact: worker-local action policy/dispatch, safe option mapping, capability reporting, durable journal integration, close/MCP cancellation and synthetic action matrix.
- Verification: final writer Node26 npm run check PASS (61 tests); headed actions and lifecycle PASS. Independent final quality PASS Node24.20.0/26.5.0 (61 each); Node24 action matrix with credential/option/mid-dispatch interruption regressions PASS; Node26 navigation/lifecycle PASS. Independent label/autocomplete/value/replacement/disabled-group probes and both-runtime synthetic controller before-dispatch marker, scoped close, cancellation, replay and value-absence probes PASS.
- Independent verifier/reviewer: /root/c01_review (C04 assignment); PASS, no unresolved Critical/Required findings. All five historical Required findings repaired; exact hashes/results/limits in [review.md](evidence/c04/review.md). Final register/README accepted separately.
- Remaining limits: no application rollback/business guarantee, graph transitions, coding-host or cross-platform claim. Unknown outcomes require inspection and separate authorization for a new execution.


### C05 — Browser checkpoint

- Status: verified.
- Authorized scope: selected remaining Phase C batch and continued shipping, 7 October 2026. This checkpoint is read-only browser/privacy acceptance and recording; no later phase or package publication.
- Dependencies: C01–C04 verified with distinct historical receipts. C04 implementation accepted at 642cfb5 and shipped in PR13; source bytes remain unchanged for this checkpoint.
- Acceptance: independent browser/privacy review covers redirects, scope changes, cancellation, stale targets and uncertain outcomes.
- Artifact: unchanged final C04 implementation plus this checkpoint record; final document identities and packed artifacts recorded separately.
- Verification: fresh /root/c05_checkpoint npm run check PASS on Node24.20.0 and Node26.5.0 (61 tests each). Both-runtime headed lifecycle/login, snapshots, navigation, actions and 32-fixture matrices PASS. Own both-runtime real-store synthetic controller/journal marker-before-dispatch, cancellation, foreign-close refusal, unknown replay/reopen and DB/WAL input-absence probes PASS. Expanded redirected navigation/image/page-fetch/worker-fetch proofs saw zero forbidden-origin requests. Initial clean packed smoke PASS on both runtimes (62 files); initial Node24 archive fded1650f1c2589a73e16d2cd4e573881c441f261e350dd0e8734097f91dc25f, Node26 archive 28249adb68f827a783c2ecb30d413dadad270b3cd9659e20e5d0d656b03429c4. Final documentation packed/worker checks are recorded separately in the receipt.
- Independent verifier/reviewer: /root/c05_checkpoint; PASS, no unresolved Critical/Required findings or assigned browser checkpoint blockers. Exact artifacts, generated-schema identity, commands/probes and later final documentation/packed identities in [review.md](evidence/c05/review.md). C04 source at 642cfb5 remains byte-identical.
- Remaining limits: local macOS arm64 only. Driver/journal positive capture/action paths and synthetic transport cancellation are qualified; positive full MCP capture/action after initial human navigation and actual coding-host cancellation remain unverified. Initial blank bootstrap is human-owned. Backend privileges/business outcomes, disguised credentials, cross-platform/host integration and guaranteed cleanup after simultaneous hard worker/owner loss are not attested. Unknown/unconfirmed outcomes remain non-replaying and do not authorize persisted-PID cleanup. No later graph/recall/recovery gate or package publication.
- Next eligible task: D01 — Implement guarded annotations and identity reconciliation; not selected by this Phase C batch and not started.


### D01 — Implement guarded annotations and identity reconciliation

- Status: verified.
- Authorized scope: user selected all Phase D tasks and shipping on 7 October 2026, overriding the one-task-per-run stop rule for D01–D06. No Phase E or package publication.
- Dependencies: C05 verified and shipped in PR14 at 325eff1; historical evidence retained.
- Acceptance: atomic guarded annotations preserve provenance, conflicts and supersession history; aliases explicit and audited; revision conflicts reject without mutation.
- Artifact: schema v2 migration, guarded commit service, CLI/MCP dispatch, annotation evidence projection, synthetic tests and graph guide.
- Verification: writer Node26 npm run check PASS (66 tests), including actual v1 migration and CLI/MCP replay. Independent Node24.20.0 and Node26.5.0 checks PASS (66 tests each); own privacy/provenance/cursor/revision/migration refusal and rollback probes PASS on both.
- Independent verifier/reviewer: /root/d_review; PASS, no unresolved Critical/Required findings. Exact hashes, commands and limits in [review.md](evidence/d01/review.md). Final verified register bytes accepted separately.
- Remaining limits: arbitrary prose is refused unless explicitly reviewed in configuration labels. Partial evidence supports only annotations on that capture. Local references require earlier operations. Claims remain caller-attested. Later graph/recall/recovery tasks and coding-host/cross-platform qualification remain separate.


### D02 — Implement actions, events, and observed transitions

- Status: verified.
- Authorized scope: all Phase D tasks and shipping selected on 7 October 2026.
- Dependencies: D01 verified at a2bd25f, PR15 submitted; source-artifact review preserved.
- Acceptance: complete ordered before/action/after traces succeed; scope/session/tab/trace/sequence/time mismatch, incomplete endpoints, unrelated visits and source-control mismatch reject atomically.
- Artifact: typed action/event/transition services, capture/event sequence collision checks, typed relations, reviewed guards/preconditions and synthetic trace matrix.
- Verification: writer final Node26 npm run check PASS (69 tests). Independent final Node24.20.0/Node26.5.0 checks PASS (69 each), plus own both-runtime trace integrity, source-control, sequence, atomicity, guard privacy and graph-support probes.
- Independent verifier/reviewer: /root/d_review; PASS, no unresolved Critical/Required findings. Exact identities and limitations in [review.md](evidence/d02/review.md); final verified register accepted separately.
- Remaining limits: caller-attested reports; no application rollback, arbitrary input values, executable graph controls, flows or test-verification claim.


### D03 — Implement flows and test-run evidence

- Status: verified.
- Authorized scope: all Phase D and shipping selected on 7 October 2026.
- Dependencies: D02 verified at 5fb2db6 and shipped PR16; historical evidence retained.
- Acceptance: flows preserve ordered scoped transitions; only matching passed assertions in passed runs confer test-verified provenance; failed runs remain evidence.
- Artifact: flow/test-run operations, deferred atomic test-run links and assertion targets, target/trace/time evidence validators, reviewed assertion/version text and synthetic matrix.
- Verification: writer final Node26 check PASS (73 tests). Independent final Node24.20.0/Node26.5.0 checks PASS (73 each); both-runtime multi-edge flow, forward refs, time bounds, failed/unrelated assertion, atomicity and prose-privacy probes PASS. Per-item unrelated-evidence finding repaired and regression added.
- Independent verifier/reviewer: /root/d_review; PASS with no unresolved Critical/Required findings. Exact identities, repaired findings and limitations in [review.md](evidence/d03/review.md); final verified register accepted separately.
- Remaining limits: caller attests runner/application version and reports. No independently certified UI business rule, host compatibility or later recall/recovery gate.


### D04 — Implement lexical search and neighbors

- Status: verified.
- Authorized scope: all Phase D and shipping selected on 7 October 2026.
- Dependencies: D03 verified at f57fa7b and shipped PR17; historical evidence retained.
- Acceptance: deterministic lexical ranking, exact scope/tombstone visibility, explicit record/byte/hop/node budgets and stale/filter-bound cursors.
- Artifact: scoped search/typed neighbors, all-record summaries/provenance/coverage/conflicts, schema v3 visibility migration, CLI/MCP query integration and synthetic tests.
- Verification: writer final Node26 check PASS (80 tests). Independent final Node24.20.0/Node26.5.0 checks PASS (80 each); both-runtime old-complete/new-partial freshness, 26-record warning boundary, 600-control node/hop pagination, revision and actual v2→v3 migration probes PASS. Freshness and warning-cap findings repaired with regressions.
- Independent verifier/reviewer: /root/d_review; PASS, no unresolved Critical/Required findings. Exact identities, repaired history and limits in [review.md](evidence/d04/review.md); final verified register accepted separately.
- Remaining limits: lexical substring matching, no embeddings; local macOS evidence only. Tombstone commands, freshness/change comparisons and recovery stress remain Phase E; path/flow retrieval D05.


### D05 — Implement path and flow retrieval

- Status: verified.
- Authorized scope: all Phase D and shipping selected on 7 October 2026.
- Dependencies: D04 independently verified at 83e2183, exact commit uploaded through API after Git receive 5xx (all blob/tree/commit hashes identical), submitted PR18.
- Acceptance: bounded directed traversal excludes inferred/hidden evidence; unevaluated guards/preconditions remain conditional; no-path and incomplete searches differ; exact flow order preserved.
- Artifact: path/flow selectors, explicit depth/node/edge cutoffs, pagination, conditional guards and historical changed-state applicability checks.
- Verification: writer final Node26 check PASS (83 tests). Independent final Node24.20.0/Node26.5.0 checks PASS (83 each); both-runtime two-edge/shortcut shortest BFS, directed conditional guards/preconditions, depth/visit/no-path distinction, exact flow array, hidden dependency fallback, pagination and stale-cursor probes PASS.
- Independent verifier/reviewer: /root/d_review; PASS, no unresolved Critical/Required findings. Exact identities/results/limits in [review.md](evidence/d05/review.md); final verified register accepted separately.
- Remaining limits: declarative evidence only; no executable path/guard evaluation, application action or browser refresh. Phase E and host/cross-platform/public release remain unselected.


### D06 — Recall checkpoint

- Status: verified.
- Authorized scope: complete Phase D and shipping selected on 7 October 2026. Read-only acceptance/recording; no Phase E or package publication.
- Dependencies: D01–D05 independently verified with distinct historical receipts; final implementation at 882de1b. All implementation tasks shipped PR15–PR19, main at f4db1d2 before this checkpoint.
- Acceptance: fresh independent final-artifact review verifies trace integrity, provenance, conditional paths and bounded queries.
- Artifact: unchanged final D05 implementation plus checkpoint evidence and final documentation identities recorded separately.
- Verification: fresh /root/d_checkpoint final npm run check PASS on Node24.20.0 and Node26.5.0 (83 tests each). Both-runtime actual headed sanitized snapshot→ingest→durable marker before one click→after ingest→targeted graph/test commit→closed browser/store→fresh CLI/MCP recall PASS. Own 510-edge cutoff, populated v2→v3 migration, tombstone/cursor/prose privacy probes PASS on both. Clean packed consumers PASS on both (76 files each), including explicit disposable browser installation, headed SQLite smoke and installed-package actual browser/graph/fresh-process recall. Runtime manifests match built bytes. Strict whole-envelope budget assertion repaired after separate harness review; affected source and clean installed checks rerun PASS on both.
- Independent verifier/reviewer: fresh /root/d_checkpoint; PASS, no unresolved Critical/Required production findings. /root/d_review independently reviewed verifier harnesses and final artifact and identified the strict-budget evidence weakness; /root/d_checkpoint repaired the harness and reran all four affected checks. Exact source/generated-schema/runtime/archive identities, actual commands, repair history and limits in [review.md](evidence/d06/review.md) and [artifact-review.md](evidence/d06/artifact-review.md); final documentation identities accepted separately.
- Remaining limits: caller-attested reports; local macOS arm64 only. C05 actual coding-host/full MCP browser/cancellation and simultaneous hard-loss cleanup limitations remain. Later freshness/recovery/host/pilot/release evaluation gates remain unselected.

- Phase D result: D01–D06 verified; this checkpoint completes the selected phase. No Phase E task or public package release started.
- Next eligible task: E01 — Implement capture and revision comparisons; unselected and not started.


### Phase E authorization

- User selected all E01–E06 and shipping on 7 October 2026, overriding the default one-task stop rule within this phase. D06 is verified at 6b29af9; Phase F and package publication remain outside scope.

### E01 — Implement capture and revision comparisons

- Status: verified.
- Authorization: entire Phase E and shipping selected 7 October 2026; D06 verified at 6b29af9.
- Artifact: evidence-backed scoped capture/revision comparisons, reference invalidation, bounded CLI/MCP dispatch and guide.
- Verification: writer Node26 check PASS (85 tests). Independent /root/e_review Node24/26 checks PASS (85 each), independent reordered/partial/incompatible-normalizer/annotation/cursor/budget and fresh CLI/MCP probes PASS.
- Review: PASS, no unresolved Required findings. Byte-limit bypass and shared coverage-object findings repaired. Exact artifacts and results: [review.md](evidence/e01/review.md).
- Limits: positional comparisons do not infer identity across reordered controls; 500-capture/graph-record range cutoff and 50-reference output cap remain explicitly incomplete. Historical edges preserved; no browser action or publication.

### E02 — Implement freshness and refresh plans

- Status: verified; depends on independently verified E01 at f6e26dc. Phase E and shipping authorized 7 October 2026.
- Artifact: read-only refresh plans, all-observation qualifying check times, chronological timestamp comparisons and CLI/MCP dispatch.
- Verification: writer Node26 check PASS (87). Independent /root/e_review Node24/26 checks PASS (87 each) and own chronological precision, partial-volume, historical endpoint, flow assertion/conflict, scope/budget and fresh CLI/MCP probes PASS.
- Review: PASS, no unresolved Required findings; timestamp ordering and flow-owned assertion/conflict findings repaired. Exact identities in [review.md](evidence/e02/review.md).
- Limits: declarative plans only; passed reports caller-attested; partial/read/replay never reverify states/edges/flows. Missing records and step cutoffs remain explicit.

### E03 — Implement export, backup, and restore

- Status: verified; depends on E02 at b050c47. All Phase E/shipping authorized 7 October 2026.
- Artifact: private archival export, consistent online backup, verified offline staged restore, pre-image retention and restore-bound cursor epochs. Lifetime lock acquired before database connection.
- Verification: writer Node26 check PASS (89). Independent /root/e_review Node24/26 checks PASS (89 each); own full query round trip, CLI maintenance, privacy/permissions, schema/hash/WAL overlay refusals, live-peer and all-cursor epoch probes PASS.
- Review: PASS, no unresolved Required findings. Checkpoint/standalone archive/epoch/cleanup feedback addressed before freeze. Exact artifacts/results: [review.md](evidence/e03/review.md).
- Limits: exports archival only, no import/encryption; previous corrupt images retained as forensic sets, not certified backups. Process crash/migration stress belongs to E05, hardware failure and other platforms unverified.

### E04 — Implement scoped deletion, undo, purge, and storage cap

- Status: verified; depends on E03 at 52c79bf. Phase E and shipping authorized 7 October 2026.
- Artifact: schema v4 deletion batches, scoped tombstones/undo, fresh preview-bound exclusive purge, hidden-reference/replay safeguards and transactional conservative ingestion cap.
- Verification: writer Node26 check PASS (92). Independent /root/e_review Node24/26 checks PASS (92 each), own scope/history/replay/CLI/preview/peer/privacy/backup retention and post-write cap rollback probes PASS.
- Review: PASS, no unresolved Required findings. Exact identities and separately accepted E01–E03 register: [review.md](evidence/e04/review.md).
- Limits: cap reserves conservative WAL upper bound and can reject early; actual DB+WAL reported. Purge does not erase separate backups/exports/forensic sets or safe request/attempt markers; physical-media erasure unclaimed. Reclaim verdict distinct from committed deletion. Other scopes/history preserved.

### E05 — Verify concurrency, crash, and migration recovery

- Status: verified; depends on E04 at 376c2f4. Whole Phase E/shipping authorized 7 October 2026.
- Artifact: process stress harness and recovery guide; production bytes unchanged from E04.
- Verification: writer final Node26 check PASS (95). Independent /root/e_review Node24/26 checks PASS (95 each), own competing-process ingestion, killed write and killed real migration probes PASS. Reviewed writer harness confirms bounded busy, failed migration rollback, future-schema exact bytes, live-peer migration/restore refusal and actual SIGKILL before/after real restore rename; whole query results preserved.
- Review: PASS, no unresolved Required findings. Exact source/runtime/test identities, actual kill signals and harness correction history in [review.md](evidence/e05/review.md).
- Limits: deterministic test-only native/builtin barriers, no production hooks. Actual local macOS process crash evidence; no hardware power loss or cross-platform attestation. Migration pre-images remain distinct from public current-schema backups.

### E06 — Recovery checkpoint

- Status: verified. Authorized scope: finish E01–E06 and ship, selected 7 October 2026. Phase F/public package publication not selected.
- Dependencies: E01–E05 independently verified with historical exact-artifact receipts; implementation/task commits f6e26dc, b050c47, 52c79bf, 376c2f4, a78eae9 preserved.
- Artifact: final source correction at ea70ac0 plus separately identified checkpoint evidence/documentation. Final review found feature variants incorrectly classified as action outcomes; the corrected comparison reports explicit incomparable coverage because the unchanged v1 vocabulary lacks a precise variant subject. Regression and additive corrected task snapshots preserve historical evidence; see [corrected-task-artifacts.md](evidence/e06/corrected-task-artifacts.md).
- Verification: writer final Node26 check PASS (96 tests). Fresh /root/e_checkpoint Node24.20.0/26.5.0 checks PASS (96 each), own integrated scope/changes/refresh/graph/deletion/undo/backup/export/purge/restore/closed-store fresh CLI and stdio MCP all-seven-knowledge-tool probes PASS. Clean packed installed consumers PASS on both, all runtime bytes equal reviewed dist, exact query envelopes/IDs/revisions/FKs round-trip and all cursor generations invalidate after restore.
- Independent review: /root/e_checkpoint PASS; /root/e_review separately reviewed checkpoint evidence assertions and independently reran integrated lifecycle on both runtimes; /root/e_checkpoint repaired the identified harness assertions and reran before acceptance. No unresolved Critical/Required findings. Exact source/generated-schema/runtime/archive/harness identities, actual commands and initial harness repair history in [review.md](evidence/e06/review.md) and [artifact-review.md](evidence/e06/artifact-review.md). Final documentation acceptance recorded separately.
- Limits: local macOS arm64 process crashes, no hardware power-loss or cross-platform claim. Caller-attested product/test reports and earlier C05 coding-host/browser/cancellation/cleanup limits remain. Archival export has no import; backups/forensic sets/safe attempt receipts retain separately described data. Conservative cap can refuse early. No plugin pilot, host portability, performance/release evaluation or publication claim.

- Phase E result: E01–E06 verified; selected implementation phase is complete. Shipping is tracked through individual E01–E06 PRs; completion report waits for merge and local base sync.
- Next eligible task: F01 — Package plugin skills and setup workflow; unselected and not started.

### Phase F authorization

- User selected all F01–F06 and individual shipping on 7 October 2026, overriding the default one-task stop rule within this phase. E06 independently verified and shipped at f2db1d9. No Phase G or public publication is selected.
- On 8 October the user selected Codex for this run and deferred Claude compatibility (F05) until later. F06 full two-host acceptance remains open; do not waive F05 or claim full Phase F completion.
- Blogen runs at http://localhost:3000. User confirmed the local instance/data are disposable and all actions are authorized. Authentication remains manual, with no retained credentials or auth state.

### F01 — Package plugin skills and setup workflow

- Status: verified; E06 verified at f2db1d9.
- Scope: portable manifests, generated Codex compatibility files, three evidence workflows, explicit startup configuration, diagnostic and packed setup checks.
- Verification: writer Node26.5.0 check PASS (99). Independent /root/f_review Node24.20.0/26.5.0 checks PASS (99 each), own diagnostic/privacy/env probes PASS, clean packed consumers PASS on both (94 files), all 13 contracts/tools, explicit native SQLite rebuild, explicit Chromium install and headed smoke. All three skills pass the bundled skill validator.
- Review: PASS with no unresolved Required findings. Unintended directory README packing and absent native rebuild corrected before acceptance. Exact implementation/generated compatibility/skill/setup identities and distinct packed archive hashes in [independent-review.md](evidence/f01/independent-review.md) and [artifact-sha256.json](evidence/f01/artifact-sha256.json). Final register accepted separately.
- Limits: no actual plugin-host installation, Blogen journey, new-chat recall, Claude compatibility or public publication claim.


### Phase F resumption

- User resumed on 8 October 2026 after the explicit F01 pause. F01 shipped PR27 at main 4b74d32. Continue eligible F02–F04 with prior shipping authorization; Claude Code F05 remains deferred and full F06 acceptance remains open. Preserve the historical [pause checkpoint](evidence/f02/PAUSED.md).

### F02 — Add Blogen profile and pilot fixtures

- Status: verified; dependency F01 verified at 6134b56 and shipped at 4b74d32.
- Scope: source-reviewed localhost Blogen label/route configuration, synthetic structured profile fixtures, packed profile inclusion and pilot instructions. No knowledge/browser core or Blogen source changes.
- Verification: writer Node26 check PASS (101). Independent /root/f_review Node24.20.0/26.11.0 checks PASS (101 each); own privacy/modal/partial-ingestion/scope/origin probes PASS both; actual packed profile bytes/schema/initialization/load PASS both (95 intended files).
- Review: PASS, no unresolved Required findings. Exact profile/fixtures/package/smoke/documentation identities and static Blogen source review in [independent-review.md](evidence/f02/independent-review.md) and [artifact-sha256.json](evidence/f02/artifact-sha256.json); final register accepted separately.
- Limits: invented fixtures do not attest live Blogen coverage or outcomes. Unsupported table roles stay partial; partial captures cannot support transitions. Scope aliases are operator declarations, not backend authorization proof. Actual journeys, coding-host installation/recall and Claude compatibility remain unverified.


### F03 — Verify three Blogen journeys

- Status: verified; dependency F02 independently verified at a72b1ef and shipped PR28, main a67a469.
- Artifact: actual packed F02 runtime/profile in a dedicated private disposable prefix, Node24.20.0/macOS arm64, with explicit native rebuild and Chromium installation. All 83 installed runtime files equal source build bytes; hashes in [pilot-artifact.json](evidence/f03/pilot-artifact.json).
- Independent harness preflight accepted at b077b5a7d7db22c9c30905994986ad18404ba9fa035f06e42ff99e44cf226a25; [preflight-review.json](evidence/f03/preflight-review.json). Startup/malformed-input/privacy/EOF probe PASS without opening a browser. Error echo, uncertain dispatch reuse, startup/finally/timeout and piped-input handling corrected before live execution.
- Historical preflight and manual-login wait remain preserved; the user subsequently authorized all modifications to the disposable local Blogen instance.
- Final run `79d5cb30-e224-4a71-aa60-1795796e193d` observed open/cancel, disposable category creation, and public browse/filter/clear through public MCP. Thirteen partial scoped captures and eight durable dispatched attempts; complete browser cleanup and MCP EOF shutdown. No complete states, graph transitions, backend/authentication claims or retained input values. [Results and limits](evidence/f03/RESULTS.md), [final artifact](evidence/f03/final-pilot-artifact.json).
- Actual Blogen UI used an independently reviewed temporary loopback-only synthetic adapter, production mode, fallback/metadata fixes and a unique submit label. All fourteen source files restored to their exact original bytes, own flag removed and own server stopped; unrelated Blogen work preserved. Original duplicate submit labels remain an unsupported ambiguity, and development HMR requires a blocked WebSocket.
- Parent Node24 `npm run check` PASS: typecheck, lint, format and 101 tests. [Independent live review](evidence/f03/independent-live-review.json) accepts scoped partial-observation F03: all thirteen immutable capture payloads and eight receipts match the authoritative store, safe labels/schema and ordered trace verified, no graph mutations. Shipment exact-artifact review is recorded separately.
- Shipped commit `e953fad` through PR29, merged at `0691d22`; reviewed bytes unchanged, Node24/26 CI and security checks passed, local main synchronized before F04.

### F04 — Verify new-session recall in Codex

- Status: verified; dependency F03 verified and shipped at `0691d22`.
- Used the declared project/app/admin synthetic scope in a fresh ephemeral Codex CLI session after browser/original MCP closure and local Blogen source restoration. No prior journey outcome facts or evidence IDs were supplied; product recall used native MCP reads and cited scoped evidence.
- Actual ephemeral Codex CLI `0.162.0-alpha.2` run `0b9b66a2-ed04-4ce1-b44c-78e58e36c2b0` used native status, two queries and two evidence reads through explicit session-scoped stdio registration. Six final citations (two screens/four partial captures), times, scope and revision independently verified; no browser, writes or direct evidence-file reads. [Results](evidence/f04/RESULTS.md), [independent live review](evidence/f04/independent-live-review.json), [final host artifact](evidence/f04/final-host-artifact.json).
- Three earlier CLI discovery probes were rejected and preserved; automatic plugin MCP discovery and desktop UI installation remain unqualified. Temporary host selector/cache removed to restore prior uninstalled state; original-source local Blogen dev service restored with no application actions. F05 remains user-deferred and full F06 remains open.
- Historical Node24 check passed 101 tests; this evidence/setup documentation slice has no runtime changes. Independent exact shipment review and CI are recorded separately.
