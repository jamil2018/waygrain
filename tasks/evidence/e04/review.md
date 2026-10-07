# E04 independent verification and exact-artifact review

Reviewer: `/root/e_review`, independent of the sole writer. Date: 7 October 2026. Verdict: **PASS**, no unresolved Critical or Required findings. Applied code-review-and-quality against scoped deletion, recoverability, purge-preview and cap requirements.

## Actual verification

- Independent `npm run check` on Node 24.20.0 and 26.5.0: PASS, typecheck/lint/format/build and 92 tests each, zero failures/skips.
- Writer deletion tests plus the initial own two probes: five tests PASS both runtimes. Final own `node --test tasks/evidence/e04/independent.mjs`: three tests PASS both, including actual CLI delete/undo/preview/purge.
- Own tests verify deletion and undo idempotency; hidden ingest replay refusal and exact original replay after undo; equal ID/history query results; repeated deletion batches; other role scope unchanged; maintenance refused while normal peer lives; valid scoped preview; exclusive physical purge; FK integrity; undo and ingest replay refusal after purge; selected synthetic marker absent in live DB/WAL after successful reclaim while separately retained backup contains it; stale preview refusal without revision change; and post-write cap refusal after preflight passed with 1,000-node capture, preserving all record counts, revision and single earlier receipt.
- The cap fixture initially tried to mutate a frozen configuration. Repaired the harness to persist a new cap and reopen the store, then reran both runtimes. This was a verifier fixture issue; no production repair required.
- Static review confirms deletion selects exactly current visible records in required app/scope, preserves links for undo and validates request digests/revisions. New commits and ingestion cannot revive hidden references. Purge binds exact preview to revision/restore epoch, requires exclusive authority and refuses unexpected retained graph dependencies. Secure delete and vacuum/checkpoint reclaim only selected tombstoned records; failed/busy cleanup returns storage_reclaimed false after the completed logical purge. Intake cap reserves a conservative WAL bound and never silently prunes existing history.

## Exact artifact

Manifest algorithm: sorted `path + space + SHA256(bytes)` lines, LF-joined without trailing LF, SHA256 of UTF-8 manifest.

```
3036ec7ac8bfa36c726f41f49a64e6704a3f11f569c560e92225799013fea688  src/ manifest, 40 files
5f03eb32d327ef29f17a564601d76eb6a1b56bd8a00b9bd363de06ce1ae8a6b7  tests/ manifest, 32 files
89eb391911091ee52d52faf58ca53e220393d6ad872d8135f89ecd3902f73dba  dist/ manifest, 81 files
01b0d09a844af495df07549a892a66e08435561b3458bf06971eab0911708754  src/store/deletion.ts
066278844e0099bdbc68cf1158b7483eb289d2514f1cae8b3c0312408716f54d  src/store/schema.ts
8e6e65807be25e7ce45ae6c8dfe325cb4fc795108ac4f8697eced0459039982e  docs/changes-and-recovery.md
3700f05c42331f81bfd1ab828d2ca6874c786779f1d889b11304f6c95b15d5ee  tasks/evidence/e04/independent.mjs
```

## Separate register acceptance and limits

Read the later E01–E03 verified records in tasks/todo.md and accepted their descriptions, evidence links, independent attribution and limitations. They accurately reflect the respective receipts and do not expand browser/platform/recovery stress claims. Accepted this later register SHA-256 separately: `bc1133f095f9b15d7a2753c4c8adb148bbfce897a3053bfc87240bc13a7000af`. Historical earlier receipt identities remain historical.

Evidence is synthetic local macOS arm64 Node24/26. Conservative intake reservation can reject before actual DB+WAL reaches the cap. Safe receipts/digests and browser attempt markers remain to preserve no-replay safety; backups/exports/pre-images retain their data separately. Marker absence in the current DB/WAL after successful reclaim is not forensic physical-media erasure. Process-kill, concurrent-writer and migration stress remain E05; platform, host and clean packed consumer qualifications remain separate.
