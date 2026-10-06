# A01 independent verification and review

Date: 6 October 2026. Reviewer/verifier: `/root/a01_review`, independent of the implementation writer. Verdict: **PASS — no Required findings** for A01 documentation acceptance only.

## Exact reviewed artifact

SHA-256 hashes identify the final bytes. The report itself is a review receipt outside this artifact set, avoiding a self-referential hash. Later changes to any listed file invalidate this review.

| File | SHA-256 |
| --- | --- |
| `tasks/plan.md` (authority input) | `e410847bc85a1ed473db6c0ee01fd11810bf7578c832eb58b23ede9d70c75af7` |
| `tasks/todo.md` | `3fc7e86d2eddbb25ef85474b81a56b03611e71e26f39734f5521948ee5ad2425` |
| `docs/specification-v0.2.md` (baseline snapshot) | `21025f4e0543114fd10f31f19c0e83e6c96761da776e4217656dacab84197c7f` |
| `docs/decisions/001-bundled-browser.md` | `0e12f5f9088325be3c1a6413a96847f35e98658a9feecd595e31a90b5aa53c75` |
| `tasks/evidence/a01/check-documents.py` | `a4ac94c1bc67d43cab83c14daf0e1feaaaaf1ac758907a41f7543fc8da851181` |

## Substantive baseline comparison

- The baseline explicitly excludes browser control and uses the host's scout. ADR-001 explicitly amends this with six separately versioned tools, one requested headed ephemeral session per MCP process, current snapshot-bound targets and bounded authorized actions. It does not claim access to another server's authenticated session. Host/user action authority is preserved.
- The baseline has no network egress by default. The amendment permits explicit allowed-origin browser navigation and browser installation downloads, retains an offline knowledge core and excludes telemetry/background activity. Redirect and scope enforcement remains an implementation obligation.
- Bundled browser trace IDs/sequences replace the host as their producer only for that component. External structured ingestion remains supported. Matching app/scope/session/tab/trace, ordered captures/action events, complete endpoints and source-state controls remain required. Partial captures retain no state ID and cannot establish transitions.
- All seven knowledge tools, strict/versioned contracts, opaque identity, immutable states, scope isolation, provenance, revision guards, sanitized idempotency, bounded queries/cursors and historical flows remain baseline requirements. Stored locator hints remain descriptive rather than executable.
- Raw observation confinement, sanitization before worker IPC/output and repeated ingest validation strengthen the bundled-browser boundary while preserving no credential/input/authentication-state retention. Attempt markers are sanitized metadata; application actions and graph writes are explicitly not one transaction.
- The amendment records the selected stack, separate browser worker, explicit configuration, storage coordination, packaging and three skills without claiming feasibility. Dependency availability, the selected JSON snapshot API and packed native runtime remain deferred checks with no silent substitutions.
- Baseline limits and the 24-hour retrieval default remain explicit. A fresh screen does not verify transitions/flows. Release comparison still counts all overhead, uses ten tasks/three repetitions and the stronger baseline, retains 20% warm/15% cold thresholds, no correctness regression/extra wrong actions and second application/host checks.
- The register incorporates plan definitions by reference, lists all 39 tasks in order and records A01 scope, acceptance, verifier identity, artifact receipt and limitations. Only A01 is verified. A02 remains pending and needs user selection. Independent review applies to exact bytes; commit/push/publication require separate authorization.

## Review axes

Correctness: the amendment and register meet A01's document acceptance criteria and preserve the unamended baseline contracts. Readability: precedence, amendments, preserved invariants and deferred proofs are explicit. Architecture: browser ownership remains separate from deterministic knowledge services and no new model loop or hosted service is introduced. Security: credentials, permission grants and durable browser handles are excluded; origin, privacy and cleanup behavior require later evidence. Performance: no executable product runtime is introduced; the original bounded-query and measurement gates remain requirements.

## Independent commands and results

Working directory: `/Users/jamil/Personal Projects/waygrain`.

`python3 tasks/evidence/a01/check-documents.py` was independently executed on the implemented artifact, then rerun against final register bytes after this receipt existed. Final result recorded below.

Exit code: `0`.

```text
PASS: 39 unique tasks match in order; dependencies reference earlier tasks; definitions are nonempty.
PASS: all relative links in plan, register and docs resolve.
PASS: A01-only scope; 38 later tasks pending and package bootstrap has not started.
Build/typecheck/runtime tests: NOT APPLICABLE to A01; no package exists before A02.
```

`shasum -a 256 tasks/plan.md tasks/todo.md docs/specification-v0.2.md docs/decisions/001-bundled-browser.md tasks/evidence/a01/check-documents.py` produced the exact hashes above.

## Limits

The Python checker tests structural task coverage/order/dependencies, local relative links and later-task status/package absence. It cannot prove semantic consistency; that was separately reviewed against the local baseline. The reviewer did not independently retrieve the live source Page or attest snapshot fidelity. No package exists before A02: build, typecheck, runtime, browser, packaging, license availability and compatibility tests are **not applicable to A01**, rather than passed. No runtime, product value, privacy enforcement, browser cleanup or cross-platform support claim is accepted here. The workspace is not Git initialized; file hashes identify the reviewed artifact.
