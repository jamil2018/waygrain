# B04 independent verification and review

Reviewer: `/root/b04_review`, 7 October 2026. Implementation writer: parent coordinator. Verdict: **PASS for B04**, no Critical or Required findings. B03 is verified at `db598f8`; this receipt identifies the later B04 working artifact separately. The reviewer made no implementation edits.

The review applies AGENTS.md, tasks/plan.md B04 and the v0.2 specification's ingestion, identity, privacy, partial-coverage and atomic persistence requirements. The code-review-and-quality skill was used for correctness, readability, architecture, security and performance review.

## Exact implementation artifact

SHA-256 identities; the receipt and mutable task register are outside this implementation set:

| Path | SHA-256 |
| --- | --- |
| src/core/ingest.ts | 932ef0926b8afdc4035ec8d9a6efea52097bd7904132819a6e815abe9cd4ea1e |
| tests/fixtures/storage.mjs | 31112d7fb24add833b8c69a26a452e5293dfaad82072a16f1a541fa84d1fa4c5 |
| tests/ingest.test.mjs | 172045ca31175404a13a5233bc1173acb62f05fa97af63c46ebea427ed34082e |
| docs/capture-persistence.md | 74eff9c12d6b363c16f2d00fc56c87771158211e525aca7291fb0853b432e8c2 |

The separately reviewed implemented-state `tasks/todo.md` SHA-256 is `476ee2dc31cdcb132aa081ed53080defdbc05c19b283e6c9e4beca6d315d3d0a`. Final verified-register bytes are identified separately after the writer records acceptance.

## Independent observed results

- `npm run check`, Node 26.5.0: PASS, typecheck, lint, formatting, build and all 51 tests.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check`, Node 24.21.0: PASS, the same gates and all 51 tests.
- Independent synthetic probes on both runtimes: PASS. Forbidden input fields, unconfigured scope, unsupported format/role and timestamps beyond the future tolerance fail before entering any store transaction. Revision remains zero.
- Independent boundary probes on both runtimes: PASS. A 5,000-node tree creates 4,999 controls and a second compatible capture returns the exact ordered control IDs. A 5,001-node tree fails before a transaction. Depth 64 succeeds; depth 65 fails with LIMIT_EXCEEDED without advancing revision. No truncation occurs.
- Independent replay/immutability probe on both runtimes: PASS. Original receipt replay changes neither input nor revision. A synthetic trigger rejecting receipt insertion, after screen/state/control/capture/evidence work, rolls back all table counts and revision to their previous values.
- Repository tests independently establish distinct observation history, complete state/control reuse, meaningful changed UI identity, conservative screen matching, configured view keys, application/role/environment separation, stale revision and duplicate sequence rejection, partial fragments with null state and no controls, screen-only partial evidence, reopen replay, numeric control order, forbidden-field rejection, absence of synthetic sensitive markers in database/WAL, and rollback after capture insertion failure.
- `git diff --check`: PASS. Scope/history comparison against db598f8 shows B04 additions and scoped guide/register updates; earlier authority, source and historical receipts are preserved.

The independent probe's first attempt modified a shared synthetic fixture source object and therefore contaminated its own subsequent request. The probe was corrected to clone every request before mutation and rerun successfully on both runtimes. This was a probe setup issue, not an ingestion failure.

## Acceptance reasoning and limits

Every accepted capture is validated and normalized before persistence. Sanitized request digests support identical replay without retaining rejected text. Scope-bound screen identity is explicit; matching names/routes do not silently merge. Projection equality protects immutable reuse; ordered controls use bounded fixed-width path segments. New observations produce new captures/evidence and one new revision. Partial coverage creates only a screen-linked fragment, with no complete state or control identity. Receipt insertion shares the same short transaction as all graph writes, so even late failure leaves no partial records.

Prepared SQL binds caller values; request/tree/depth limits bound loops and recursive work. No new dependency or browser operation is introduced. This evidence attests synthetic core ingestion on this macOS setup only. Public CLI/MCP ingestion, status and evidence transport belong to B05. Browser mapping/privacy, semantic annotations, action/transition trace validation, freshness, change detection, querying and storage-cap remediation remain their assigned later tasks. B03's trace sequence uniqueness is scoped to application/scope/session/tab/trace; this review does not claim global cross-session trace ordering or D02 transition integrity. Operator-reviewed labels and nonidentifying caller provenance keys remain prerequisites inherited from B02. No live product data, browser artifacts or credentials were used or retained.

## Final register recording

The reviewer separately inspected the later verified B04 register: `tasks/todo.md` SHA-256 `19f1769764a5adea83b61dd4f63acafd1d67d31bea425e08f81433d7b04c106d`. It accurately records the independent results and retained limitations. All four implementation artifact hashes above were rechecked and remain identical. B03 was subsequently delivered with merge commit `342c81d`; its implementation content is unchanged from the stated review baseline. Later B05 guide/register changes require their own receipt and do not retroactively change these B04 identities.
