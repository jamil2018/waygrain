# D04 independent verification and review

Reviewer: `/root/d_review`, separate from writer. Date: 7 October 2026. Base: `f57fa7b` (D03). Verdict: **PASS** for D04. No unresolved Critical or Required findings.

Read D04 and baseline query/freshness/privacy requirements; reviewed new query/summary services, migration and dispatch changes, final tests/docs. Applied code-review-and-quality across deterministic correctness, contracts, scope/visibility, provenance, bounded work and clarity. Historical receipts remain preserved and this identifies later source bytes separately.

## Actual independent evidence

- Final `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run check`: PASS, Node 24.20.0, 80 tests, zero failures/skips; typecheck, lint, formatting, build/schema generation and deterministic suite.
- Final `npm run check`: PASS, Node 26.5.0, 80 tests, zero failures/skips; same checks. Earlier 78/79-test runs were preliminary and do not replace this final artifact check.
- Own both-runtime freshness probe: PASS. Complete observation 48 hours old followed by same-screen partial observation one second old returns stale whole-screen status/age and the original qualifying complete check time.
- Own both-runtime warning boundary: PASS. Twenty-six valid controls each with 51 independently conflicting active descriptions returns all 26 controls, two warning codes, and complete affected-ID sets; no warning-cap exception or evidence loss.
- Own both-runtime 600-control neighbor probe: PASS. One-hop discovery respects the 500-visited-node bound (including origin); distinct bounded pages end explicitly incomplete without a misleading continuation after work exhaustion. Four hops reject with LIMIT_EXCEEDED. Reads preserve store revision.
- Own both-runtime actual-v2 migration probe: PASS. A v2 store without the v3 table/migration upgrades to v3 retaining revision, 600 controls and foreign-key integrity. Disposable synthetic stores cleaned.
- Independently read and ran repository tests for exact-ID/name/tag precedence and stable ties, exact scope isolation and empty scopes, active semantic annotations without provenance rewriting, supersession/history, tombstoned results/evidence, byte/record pagination, cursor filter/revision binding, conflicts, annotation limit warnings, CLI/MCP read-only query parity, and flow/test summaries with exact targeted promotion. Query paths make no browser call and do not persist query text.

## Findings repaired before acceptance

1. Partial observation incorrectly refreshed whole-screen retrieval recency when an older complete observation existed: status recent/age one second alongside last_checked_at 48 hours old. Writer bases whole-screen age/status on qualifying complete observations; regression and own probe pass.
2. Independent valid-data boundary produced 52 warnings for 26 records, violating the fixed 50-warning envelope and being misreported as STORE_CORRUPT. Writer aggregates warnings by code while preserving all affected IDs, with candidate rollback before byte-budget decisions. Regression and own 26-record boundary pass.

## Limits

D04 supports scoped lexical search and typed neighbors, not D05 paths/flow mode. Names/tags supplied through annotations remain attributed semantic evidence; they do not rewrite structural identity. Conflicts and bounded annotation/evidence summaries remain explicit. Neighbors may return descriptive inferred annotation records and never promise an executable route. Tombstone storage/read visibility is qualified; no scoped delete/undo/purge command or recovery gate is claimed. Status counts include retained hidden history.

Caller reports remain attestations. Query summaries are retrieval policy, not application/backend guarantees. This is local macOS arm64 Node 24/26 source-build evidence. No new browser, host integration, cross-platform, packed-artifact, recovery stress or performance claim. Later freshness/change/recovery and release gates remain separate.

## Exact reviewed artifact

SHA-256:

```
a700d65431b3956adda3bc0cb006b93347ca092d8c3220966a7a21538002d013  src/core/query.ts
d6080c893a748a13d8e72ad11aebac1121c789943ce40756fd5d977a5b6e7d44  src/core/summary.ts
6802d4cddd21ad4fae1cc9ab5745f62bfcf8fde1b077f93772671527e127e0b9  src/core/graph.ts
bb11247fc8e933d09b679597d97c464a5466e4862a961d631d7ec80aba1287ee  src/core/retrieval.ts
45454790969d3201b0ce98e0589cfda4b866cd21c80c8fb8cd6b76acb459e23d  src/cli.ts
2c2485d57b250af2f424073cc216ab99909fd8cdcd34b07eee020413ffab7a73  src/index.ts
c4f0f9ff4857090aadfb04204042d23155c58692a33870f356ad3cd101a1b921  src/mcp/index.ts
2cf171c650ddf68c23ce8bb9986128cfc87908691167990d7959218b33746b66  src/store/database.ts
fe8ef9640b76096822344d819d2bccd2a18e1233b856b0f03ba0d4ff2fa9422c  src/store/schema.ts
1718b3dd0e883bcfd8811fa4b933d7238fc22b26c454bf12e43265af4416d521  scripts/protocol-probe.mjs
6553e37258f2b7922e35c93b7c5248e9865e9c92f875233815e91179b44a0b69  tests/query.test.mjs
0386371a344c3779803c81fabb075e5fca936cdc6689ad9bbbacc22f601cee4d  tests/commit.test.mjs
fd233693121d17819ac6a98dbe4b93d7cb3837e5030a787c9fde866cec63b106  tests/retrieval.test.mjs
bc8411ae082cc294e6d2f507b778e94f3da12b9201c874ee5724802cdde96c2d  README.md
764ba4c801b88ddbb58ca63c95366802e84cb14ab6f4402f654e54415238c317  docs/graph-and-recall.md
17f05dcbb403d206e6caa35f3953ca5caa57be86695fd0218d33f57599c6ec08  tasks/todo.md
```

Task register is implemented/pending-review; final verified-only record requires separate acceptance.

## Final task record acceptance

Separately read and accepted the D04 verified-only register update; actual final checks and repaired findings match this receipt. Source/tests/other documentation identities above are unchanged. Final `tasks/todo.md` SHA-256: `94e9892132ba09b2499cc13dcd5d23a1b0ba6eac2f98da616497b8e7f7e505e5`.
