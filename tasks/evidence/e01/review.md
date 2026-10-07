# E01 independent verification and exact-artifact review

Reviewer: `/root/e_review`, separate from the sole implementation writer. Date: 7 October 2026. Verdict: **PASS**. No unresolved Critical or Required findings. Applied code-review-and-quality across correctness, clarity, architecture, privacy and bounded work, after reading the plan/register, baseline specification and ADR-001.

## Actual verification

- Independent `npm run check` on Node 24.20.0 and 26.5.0: PASS; typecheck, lint, formatting, build/schema export and 85 deterministic tests each, zero failures/skips.
- Own `node --test tasks/evidence/e01/independent.mjs` on both runtimes: PASS, three tests each. Actual CLI and stdio MCP ingest/comparison responses equal public core responses. Core probes cover unchanged captures, ordered-control reversal, partial omission as not_seen rather than removed, legacy normalizer incompatibility, tiny-byte incompatible revision refusal, recursive action/transition/flow invalidation, annotation supersession, filter-bound cursors, strict full-envelope byte budgets at 1/100/400/8192 bytes, and unchanged store revision after reads.
- Legacy-normalizer fixture temporarily removes and reinstates the immutable-state trigger only in a disposable synthetic database; production immutability is unchanged. Synthetic temporary stores are cleaned by the harness. No browser, credentials or real page content used.
- Static review confirms comparisons enforce visible same-app evidence, screen/scope/profile/version compatibility, explicit coverage limits, parameterized SQL, immutable historical endpoints, finite revision scans and revision/filter-bound cursors. Positional alignment deliberately reports altered positions rather than inferring node identity, and the documentation explains that limitation.

## Findings and repairs

Preliminary review found a Required incomparable revision path bypassing byte/cursor checks. The writer added explicit checks; the independent one-byte legacy-normalizer range now refuses with BUDGET_EXCEEDED. Independent reversal probe exposed repeated coverage object references causing STORE_CORRUPT during output validation. The writer clones each coverage object; reversal and multi-control partial omissions now pass. The writer replaced quadratic per-node control searches with a path Map after review feedback. Initial verifier fixture update failed the immutable-state trigger; the harness was repaired to explicitly construct a legacy synthetic fixture and rerun. Earlier failed evidence is superseded only for these repaired artifacts.

## Artifact identities

Manifest algorithm: lexically sorted file paths with `path + space + SHA256(bytes)`, joined by LF with no final LF, SHA256 of UTF-8 manifest. Includes all files beneath each named directory.

```
d1bfb7f8b784a930174b85bed7f6aa47772f5c574842cc4543de5fa0cfb40aac  src/ manifest, 37 files
6db83966d6c9455319313effd3c4b209b40288f793ce3136299d78d8d6b4e0e9  tests/ manifest, 29 files
ca7febb1b5d028fcfab158962dbcdeae4ec25bd976824ded4342e1c1c1e44108  dist/ manifest, 75 files
ee231b05ac5df3dce20bfd7bd13704b88d579177eeb377c2166b1e31fd88f86e  src/core/changes.ts
2f2724e746493aa0baad61bc23c3ca81946a8b9f582f849d6d6bb384f80223cd  src/core/retrieval.ts
ed00dd888653b6f2867456a169660273512f76486fcf57214f42e473ec4ff04a  src/cli.ts
ab8999d3177cc216c0afe8bfbf15a9ead4ef323803744a68f8b75c008b0402e6  src/mcp/index.ts
4469924e6f906f516b2181706f6fa7f536468889d362da265052d6fef69d4a19  src/index.ts
f191bf910349272baa4002601c4de5680b85a272e1cf22fa7e5d5371925a67b9  scripts/protocol-probe.mjs
4f6607fe654a323c41682e7d93418259a3d37aec959b40681f41b2f898eb78c7  tests/changes.test.mjs
18420111daac22381fca9cbb6813369a961e80daf4b2b25a5c856f0324e531c4  tests/retrieval.test.mjs
8040b92b6a5dbc94e95581e016c935eb9c07e728526f73a98ea2c7a038defd43  docs/changes-and-recovery.md
5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a  dist/contracts/schemas.json
0e04a6c9850c8e2e66a450c7f3adbfcfbc46a18ef69419a03e2c34a367db706e  tasks/evidence/e01/independent.mjs
```

## Limits

This is local macOS arm64 synthetic Node24/26 verification. Positional comparisons cannot distinguish identity-preserving moves from replacements; revision scan/reference cutoffs explicitly make results incomplete. Pure first observations establish a baseline, not changes from a proven prior absence. Existing browser/coding-host/platform limits remain. No E02 freshness, E03 recovery, E04 deletion, E05 stress, clean packed consumer, public publication or performance guarantee is claimed here. Later source changes need their own independent receipt.
