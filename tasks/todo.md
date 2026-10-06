# Waygrain task register

Source of task definitions, dependencies, acceptance criteria, and verification requirements: [plan.md](plan.md).

A01 is `verified`; A02 is `verified`; A03 is `verified`; all later tasks remain `pending`. Saving the plan alone does not verify a task. Task definitions below incorporate the dependencies, scope, acceptance criteria, and verification requirements in [plan.md](plan.md), section 4; sections 3 and 5 govern execution and checks.

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
- [ ] A04 — Prove packaging and runtime feasibility — pending
- [ ] A05 — Define public knowledge and browser contracts — pending
- [ ] A06 — Foundation checkpoint — pending

## Stage B — Capture and persistence

- [ ] B01 — Build synthetic UI and privacy fixtures — pending
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
