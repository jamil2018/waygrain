# B03 independent verification and review

Reviewer: `/root/b03_review`, 7 October 2026. Implementation writer: parent coordinator. Verdict: **PASS for B03**, no unresolved Critical or Required findings. B02 dependency is verified at `3657332`; this receipt reviews the later working artifact against that commit. The reviewer made no implementation edits.

The review applies AGENTS.md, tasks/plan.md B03 and docs/specification-v0.2.md persistence requirements, within the phase boundaries in the plan. The code-review-and-quality skill was used for correctness, architecture, security, maintainability and verification review.

## Exact implementation artifact

SHA-256 identities (the receipt and mutable register are outside this implementation set):

| Path | SHA-256 |
| --- | --- |
| src/store/schema.ts | fa260d068be51144acb15a622cc620262c07d65de2307b41c8f1e08af313f1d7 |
| src/store/database.ts | 12360aa54e568faaa4337e6e5495b63d13ef8f4cc4510c910bac47f3f5a6f5f2 |
| tests/store.test.mjs | 903567f1c53ba015f6b46f3c29563c42e767c1484f32dc01ec13b7e3f422d035 |
| docs/capture-persistence.md | 6489232bd5435f54f51a73b08a3f6189f50a65ab3629f867aff0cbd5c5add923 |

The separately reviewed implemented-state `tasks/todo.md` SHA-256 was `d2d7f3b86b2b717b7df3dddb7192b42508ea5a306cced11ea93becd25caef62f`. Final verified-register bytes must be identified separately after the coordinator records acceptance.

## Observed independent results

- `npm run check`, Node 26.5.0: PASS, typecheck/lint/format/build and all 44 tests.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check`, Node 24.21.0: PASS, same gates and all 44 tests.
- Independent synthetic probe on both runtimes: PASS, a nonempty eligible schema-v0 database creates a 0600 backup through SQLite's backup API. The backup opens, quick-checks as `ok`, remains version 0, and has the same empty logical schema. Backup byte equality was not required: the API can change header metadata while preserving logical content.
- Independent synthetic probe on both runtimes: PASS, a state referencing a screen in another scope and a state whose record kind is capture both fail FK constraints. Each failed write leaves no partial record and does not advance the revision.
- Independent synthetic failure injection on both runtimes: PASS, throwing after creating a table during the initial migration leaves user_version 0 with no migrated tables. A subsequent open of that fresh database succeeds at revision 0. Probes used disposable synthetic configurations/databases only and removed them in finally blocks.
- Repository tests independently exercise transaction failure after an insert, stale expected revisions, writer contention, same-process lifetime locks, separate-process normal peer maintenance refusal, allowed peer writes, peer exit/release, future-schema byte preservation and unversioned unrelated-table refusal without changing knowledge bytes.
- `git diff --check`: PASS before this receipt. Review of scope confirms only the B03 source/test additions, guide and task register change relative to the B02 baseline; historical authority/evidence was preserved.

## Acceptance reasoning and limits

The initial schema enforces record kinds, app/scope relationships, complete versus partial capture state linkage, evidence endpoint scope, trace and receipt uniqueness, and immutable observation updates. Store startup selects fixed configuration-derived paths, enables foreign keys and a 250 ms SQLite busy timeout, validates schema and integrity, and enters WAL. Write guards run inside BEGIN IMMEDIATE and advance revision once; failures roll back records and revision together. Reads can use an explicit snapshot transaction. Callbacks are internal synchronous operations; Promise callbacks are rejected.

Normal owners hold a rollback-journal read transaction on the separate coordination database for their lifetimes. Maintenance and migration acquire an exclusive transaction, so normal peers and exclusive owners exclude one another through SQLite locks rather than PID claims. The observed separate-process test establishes meaningful B03 maintenance coordination, not the entire E05 crash/concurrency matrix.

Only schema 0 to 1 is implemented. Existing unversioned product tables are refused; future versions are refused, never downgraded. A pre-migration backup filename is created exclusively; if an earlier failed attempt already left that file, another migration attempt refuses rather than overwrites it. Recovery/remediation for that case, numbered upgrades, killed-process tests and full migration/restore matrices remain E05. Public backup/restore operations remain E03. No cross-platform, network filesystem, coding-host, hostile ancestor replacement, raw browser privacy, browser lifecycle or package distribution claim is made by B03. The private controlled parent-directory/local filesystem prerequisites remain explicit.

## Separate final register acceptance

After the coordinator recorded B03 as verified, the reviewer accepted final `tasks/todo.md` SHA-256 `2a6c6337fb5dc16bb69d9446d1ac547e6e837f7e6cc0f114038f135f2dd06c33`. Its B03 status/checks/probes/limits match these observations. All four implementation hashes above remain unchanged. This later register identity is separate from the implemented-state identity; subsequent authorized Phase B records create later register artifacts without altering this historical receipt.
