# E05 independent verification and exact-artifact review

Reviewer: `/root/e_review`, separate from implementation/test writer. Date: 7 October 2026. Verdict: **PASS**, no unresolved Critical or Required findings. Applied code-review-and-quality to exact process harnesses, production call paths and evidence claims. Production/runtime bytes remain identical to accepted E04.

## Actual independent checks

- Final independent `npm run check` on Node 24.20.0 and 26.5.0: PASS, typecheck/lint/format/build and 95 tests each, zero failures/skips. Final tests include explicit [null, SIGKILL] checks for all crash barriers.
- `node --test tests/recovery-process.test.mjs tasks/evidence/e05/independent.mjs`: six focused process tests PASS on each runtime before the final explicit-exit assertion addition; final full suites exercise that final addition. Own three probes separately PASS on both runtimes: four actual competing processes serialize four complete captures to revision 4 and one screen with FK integrity; actual SIGKILL of an uncommitted revision mutation leaves revision 1/capture intact; actual SIGKILL after real native v3→v4 migration SQL before COMMIT leaves schema 3/revision 1/capture/FKs intact, a consistent schema3 pre-migration backup, and subsequent successful ordinary migration to schema4 with revision unchanged.
- Independently ran the writer's process probes on both runtimes. They exercise 40 attempted writes with exact success/busy accounting, bounded STORE_BUSY response while a child owns an uncommitted write, killed pending scope/revision rollback, actual killed and failed migration rollback, legacy lifetime-lock refusal, future-schema byte preservation, live-peer restore/maintenance refusal, and exclusive restore crashes before/after the real main-file rename. Entire reopened query envelopes equal the last committed old image before replacement and the verified backup image after replacement; FKs remain valid. Normal opens refuse while the restore owns exclusive coordination.

## Harness review

Native exec barrier first calls the real deletionMigration inside its transaction, then signals/pauses before COMMIT; the assertion verifies schema/table rollback and data preservation. Restore shim wraps the actual builtin rename via syncBuiltinESMExports and identifies only restore-stage to knowledge-file replacement; it pauses immediately before or after the real atomic rename. Its IPC listener keeps the pending async barrier alive. These are test-only process shims, with no production hooks or bypassed restore verification. Worker failures surface via IPC; process test timeouts and cleanup kill surviving fixture children.

Requested explicit SIGKILL exit assertions for migration/restore, which the writer added before final acceptance. The writer reported and fixed an initial async barrier lifetime problem before the frozen candidate; independent actual final checks use the corrected listener. No implementation changes requested during final review.

## Exact accepted artifact

Manifest algorithm: lexically sorted `path + space + SHA256(bytes)` lines joined by LF without trailing LF; SHA256 of UTF-8 manifest.

```
3036ec7ac8bfa36c726f41f49a64e6704a3f11f569c560e92225799013fea688  src/ manifest, 40 files
ed5c5918a73b1a2fcba6ebc9d3c31a5e7fb37c1b9d2e1422e20bc227a4c812c4  tests/ manifest, 34 files
89eb391911091ee52d52faf58ca53e220393d6ad872d8135f89ecd3902f73dba  dist/ manifest, 81 files
c0239ab4120d688e61b66b0ec167325af1f2369a989d7d87bfb8e29c0c92f116  tests/recovery-process.test.mjs
3d491eb022cc0d82cd02b91a4b158bdba1407a2d16f5f60bdbe902119a2f6cad  tests/fixtures/recovery-worker.mjs
f7ed7a6f9ee4d23093cbcb41bc08ee183656e58284fad6bbcaa69513c5442f6f  docs/changes-and-recovery.md
682d3cae2d7b9cbde7fd1a540673584d637e4bf3509acebc04051e61dd84f9e5  tasks/evidence/e05/independent.mjs
89ed785af420de7337a31a6890b8d455b4b7b0fd2911319df6d4b0454715633e  tasks/evidence/e05/child.mjs
```

## Limits

Actual local macOS arm64 synthetic Node24/26 processes and SIGKILL only. Deterministic barriers attest these observed write/migration/restore boundaries, not every possible interleaving, hardware power loss, filesystem failure, network/synced storage or other operating systems. Existing browser/coding-host limitations remain. Clean packed consumers and fresh checkpoint acceptance belong to E06; no Phase F or public package publication claim.
