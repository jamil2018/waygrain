# Waygrain task register

Source of task definitions, dependencies, acceptance criteria, and verification requirements: [plan.md](plan.md).

A01 is `verified`; all other tasks remain `pending`. Saving the plan alone does not verify a task. Task definitions below incorporate the dependencies, scope, acceptance criteria, and verification requirements in [plan.md](plan.md), section 4; sections 3 and 5 govern execution and checks.

Specification authority: [v0.2 baseline snapshot](../docs/specification-v0.2.md) plus [ADR-001 amendment](../docs/decisions/001-bundled-browser.md).

## Execution rules

- Execute one user-selected task per run, verify and review its exact artifact, record the result, then stop.
- Status progression: `pending → in_progress → implemented → verified`; use `blocked` only with a concrete reason.
- Only verified dependencies permit a task to start. Mark a checkbox complete only when its task is verified.
- For each started task, append a record using the template below. Record verification commands and actual results; do not infer passes.
- Later changes to a reviewed artifact invalidate that review. Commit, push, and publication require separate authorization.

## Stage A — Foundation

- [x] A01 — Record specification amendment and task register — verified
- [ ] A02 — Bootstrap package and quality commands — pending
- [ ] A03 — Define explicit configuration and initialization — pending
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
