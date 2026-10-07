# D01 independent verification and review

Reviewer: `/root/d_review`, separate from the implementation writer. Date: 7 October 2026. Base: `325eff1b59c46ec0ecedbca43676a7d02474cd92`.

Verdict: **PASS** for D01. No unresolved Critical or Required findings. This review applies to the exact implementation and documentation identities below. Later implementation changes require fresh review. Historical Phase A/B/C receipts remain separate.

Read authority: AGENTS.md, tasks/plan.md, tasks/todo.md, baseline specification v0.2 and ADR-001. Applied code-review-and-quality across correctness, architecture, readability, privacy and bounded execution. User authorization selects D01–D06 and shipping; this receipt approves only D01 requirements.

## Actual independent checks

- Final `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run check`: PASS, Node 24.20.0, 66 tests, zero failures/skips. Includes typecheck, lint, format, build/schema generation and unit/stdio/CLI tests.
- Final `npm run check`: PASS, Node 26.5.0, 66 tests, zero failures/skips. Same checks. Initial 65-test runs passed separately before the final transport/projection test was added.
- Own synthetic adversarial script on both runtimes: PASS for inferred-annotation evidence refusing promotion to observed; unknown inferred rationales including a zero-width phrase rejected before digest/write; rejected sentinel bytes absent in database/WAL; duplicate local client references rejected; bounded summary pagination and stale cursor refusal; peer writer stale revision refusal.
- Own actual-v1 database script on both runtimes: PASS for live coordination peer refusing migration with v1 version and no graph table unchanged; invalid historical foreign key causing migration refusal/rollback with original v1 rows/version and no graph table retained. Disposable synthetic stores cleaned.
- Read tests and source independently: atomic valid-first/invalid-later rollback, sanitized replay and request conflicts, same-app/scope references, direct capture support, explicit alias endpoints/cycles, immutable annotation supersession, migration history and private backups, and CLI/MCP dispatch/projections. No extra dependencies or caller filesystem selectors introduced.

## Findings and limits

A suggested commit capability addition was withdrawn after checking the fixed status capability enum: MCP tool advertisement declares the implemented commit operation without changing that baseline enum. No Required repair was necessary.

D01 supports only annotation/supersession/alias commit operations. Test-verified annotations remain rejected pending D03 test evidence support. Prose must match a whitespace-normalized operator-reviewed label; arbitrary prose cannot be retained. Partial captures support annotations on the capture fragment itself only. Supported contradictory annotations coexist; supersession preserves immutable previous records. Aliases remain audited links and do not retarget ingestion or erase histories. Caller reports and semantic wording remain untrusted attestations, not backend or business guarantees.

This is local macOS arm64 Node 24/26 evidence. No new browser, host integration, cross-platform, later graph/recall/recovery, public packaging or performance claim is made. Runtime tests operated on source-built code; D01 packed-artifact smoke was not assigned or run here. Recovery stress qualification remains Phase E.

## Exact reviewed identities

SHA-256:

```
6a9d55ebc815bccbe6c7492fd531122fbed142720254fde9bd890e9296f351af  README.md
e0b9900ee573a3e961d5c8a6be9e428c010fb5d32d645cddc17b44e1b0772f27  scripts/protocol-probe.mjs
74a2098cf8c4348137e39df70c4da507d3b946d23d17c4d7114847d91260119c  src/cli.ts
36e33d69877d31f3d41df4c83ab09b9acdeb5520a2467c59bf17258d3c37fe51  src/core/ingest.ts
86848ea13ba0536eca4a69dc4c2be6fb7a7fc61159287856ac4f53870b501ebe  src/core/retrieval.ts
8ae7eab385259e3a0cb9e237a17e67cb7f7e4cc9f7bfc9104d2488f3ea90b968  src/index.ts
335483bc7da7ab97fe4fd1b61f789fc5240f7be1bd333e7ebd48e7a5d7357774  src/store/database.ts
2dedf5866df1100a629329dba643c865c33c91d137f1dc2daf220ec347afdddc  src/store/schema.ts
4bd2b78f4bd6171948c1660df41f704a369ee28aa986d204e31a9648d6279937  tasks/todo.md
c21b8ab1ea02ac4f4e83f978ecf062ed201524341655b76c75cd7a0cdf0d6489  tests/store.test.mjs
d7484c91892769a26dffc4db9e2ab3bd67788e6a94d57c05439be460661a867f  docs/graph-and-recall.md
b3a2beed522f165fdc3bb057c8e007bf406f4006a7d5da962e6e6cf9f31d71d3  src/core/commit.ts
e107bcf2b952f5caa57e4ad430f20b765e1db6555a82cdf19aadbd60faf728e1  src/core/graph.ts
67c75edadedbae366c96b4f974f03872209333f8c16727a5a96a8cefb95a51a6  tests/commit.test.mjs
```

The task register identity above is the implemented/pending-review record. Its later verification-only update must be accepted separately.

## Final task record acceptance

Separately read and accepted the D01 verified-only task register update. It accurately records the independent 66-test results, probes, verdict and limits. All implementation and other reviewed documentation hashes above remain unchanged. Final `tasks/todo.md` SHA-256: `c142bc3f0fcd08cad03c0dd51699d724bc82f24c231bb61a974c0c9b032dc08f`.
