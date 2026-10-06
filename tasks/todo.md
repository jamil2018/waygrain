# Waygrain task register

Source of task definitions, dependencies, acceptance criteria, and verification requirements: [plan.md](plan.md).

A01 is `verified`; A02 is `verified`; A03 is `verified`; A04 is `verified`; A05 is `verified`; A06 is `verified`; B01 is `verified`; B02 and later tasks remain `pending`. Saving the plan alone does not verify a task. Task definitions below incorporate the dependencies, scope, acceptance criteria, and verification requirements in [plan.md](plan.md), section 4; sections 3 and 5 govern execution and checks.

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
- [ ] B02 — Implement redaction and normalization — pending
- [ ] B03 — Implement schema and basic transactional store — pending
- [ ] B04 — Implement complete and partial capture ingestion — pending
- [ ] B05 — Expose status and evidence retrieval — pending
- [ ] B06 — Capture checkpoint — pending

## Stage C — Bundled browser

- [ ] C01 — Implement browser session lifecycle — pending
- [ ] C02 — Implement sanitized structured snapshots — pending
- [ ] C03 — Implement current target resolution and navigation — pending
- [ ] C04 — Implement bounded browser actions and attempt receipts — pending
- [ ] C05 — Browser checkpoint — pending

## Stage D — Evidence graph and recall

- [ ] D01 — Implement guarded annotations and identity reconciliation — pending
- [ ] D02 — Implement actions, events, and observed transitions — pending
- [ ] D03 — Implement flows and test-run evidence — pending
- [ ] D04 — Implement lexical search and neighbors — pending
- [ ] D05 — Implement path and flow retrieval — pending
- [ ] D06 — Recall checkpoint — pending

## Stage E — Changes and recovery

- [ ] E01 — Implement capture and revision comparisons — pending
- [ ] E02 — Implement freshness and refresh plans — pending
- [ ] E03 — Implement export, backup, and restore — pending
- [ ] E04 — Implement scoped deletion, undo, purge, and storage cap — pending
- [ ] E05 — Verify concurrency, crash, and migration recovery — pending
- [ ] E06 — Recovery checkpoint — pending

## Stage F — Plugin and Blogen pilot

- [ ] F01 — Package plugin skills and setup workflow — pending
- [ ] F02 — Add Blogen profile and pilot fixtures — pending
- [ ] F03 — Verify three Blogen journeys — pending
- [ ] F04 — Verify new-session recall in Codex — pending
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
