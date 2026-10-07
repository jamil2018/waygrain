# E02 independent verification and exact-artifact review

Reviewer: `/root/e_review`, independent of the implementation writer. Date: 7 October 2026. Verdict: **PASS**. No unresolved Critical or Required findings. Read assigned freshness/refresh requirements and applied code-review-and-quality across correctness, bounded behavior, architecture and privacy.

## Actual checks

- Independent `npm run check` on Node 24.20.0 and 26.5.0: PASS, typecheck/lint/format/build and 87 deterministic tests each; zero failures/skips.
- Final `node --test tests/refresh.test.mjs tasks/evidence/e02/independent.mjs` on both runtimes: PASS, seven tests each. Own five tests exercise 60 newer partial observations, independent observed/check times, null unknown application version, replay and read-only planning, older complete arrivals after a new check, original transition/weakest-flow times, deduplicated transition expansion, immutable historical expected view despite changed tabs/modal, missing targets, step cutoff, wrong-scope refusal, actual CLI and stdio refresh plans, mixed ISO timestamp precision, and actual test-verified flow assertion/conflict requirements.
- Own flow probe records a valid targeted passed test-run assertion using action-event evidence; its flow remains test_verified, stale refresh contains the flow's own passed_assertion step, a one-step limit reports the unresolved flow, and supported conflicting flow annotations add resolve_conflicting_annotations. Synthetic stores removed after each test.
- Static review confirms no browser invocation, scripts, grants of authority or persistence writes in planning. Scope and visibility checks apply before summary/steps. Every historical state target uses its retained view. Flows expand transitions and separately preserve flow-owned assertions/conflicts. Complete check dates consult all visible evidence rather than the 51-item summary cap; partial fragments do not overwrite them.

## Findings and repairs

Required chronological ordering defect found independently: valid `...00Z` sorted lexically after newer `...00.500Z`, leaving screen/state/control checks behind and selecting the wrong latest state. Writer repaired changed SQL paths using julianday ordering and JS Date.parse ordering; own mixed-precision test now passes. Required flow requirement defect found independently: expansion discarded flow-owned test assertions/conflicts when transitions were merely observed. Writer added a separately bounded flow step, retained shared-transition/dedup applicability and unresolved handling, and own assertions/conflict/cutoff probes pass. Expected-view feedback was incorporated before final review. Verifier-only initial fixtures were repaired for equivalent ISO string representations, reused trace sequence and valid flow evidence type; all final assertions rerun.

## Exact accepted artifact

Manifest algorithm: sorted `path + space + SHA256(bytes)` lines joined by LF without trailing LF, SHA256 of UTF-8 manifest.

```
12c7216b9f472bb7a1f6bff1ab8991a5459effd1bafac41ae847dd8bd90eba73  src/ manifest, 38 files
8cb021c7aea0466caeffa5372c2d1ed8291dda77091e9bda3efd9f96abd03501  tests/ manifest, 30 files
c91e0c2bc0a763107e209a4946a5f183aeeb50a091c2d05dbe3d910879ec8ddc  dist/ manifest, 77 files
dfb550ea727ced3025a93f92b3365e7cccf3c00aa7401fd582b683e1487679fb  src/core/refresh.ts
29a760e3b0b937cd3ae67d90313df66d919c9a53225a65dab0915cdd5a365dea  src/core/summary.ts
e23731f84cec7194be6fdeddb89b6cf7eaa78c29f98b6c92ba1e082c76380800  src/core/query.ts
1ac3390ddd7db3722fb4295e35648a7cf04b6cf90039d274fb446ad740377908  docs/changes-and-recovery.md
67eb81059a0086bfaf4364eb9e1e2a44f26a36171ffecdee181278eb6d783115  tasks/evidence/e02/independent.mjs
```

## Limits

Local synthetic macOS arm64 Node24/26 evidence. Capture reports and test-run reports remain caller attestations; freshness is an age/scope policy, not proof of current correctness or safe action. Existing capture schema has no application-version field; unknown stays null except when matching test evidence provides it. Annotation and test-run targets may remain unsupported/unresolved. No new browser/coding-host qualification, clean packed consumer, recovery/deletion/concurrency, cross-platform or publication claim.
