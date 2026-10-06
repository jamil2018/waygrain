# A05 independent verification and review

Date: 7 October 2026. Independent verifier/reviewer: `/root/a05_review`. Implementation writer: parent coordinator. This reviewer changed no implementation files. This receipt is outside its own hashed artifact set.

## Verdict and authority

PASS for the repaired A05 acceptance artifact identified below; no unresolved Critical or Required findings. Reviewed changes and new files against `origin/main` at `c06a1d462c4fe49e20193c970605ac39ff7a3db3`. Read AGENTS.md, tasks/plan.md, tasks/todo.md, baseline docs/specification-v0.2.md and ADR-001. A04 is verified and satisfies the A05 dependency. The user explicitly authorized the remaining Phase A batch, sequential A05/A06 verification and shipping. This receipt does not start Stage B.

The final artifact covers seven knowledge and six browser tools, strict versioned request/response/error envelopes, baseline bounds/defaults, typed graph operations and ten record summaries, capture/view/provenance metadata and browser attempt states. Reviewed correctness, error paths, readability, separation of schema/parser/transport layers, data-only validation, fixed sanitized errors and bounded traversal. No new dependency, executable selector, arbitrary script or filesystem redirect slot is added. The packaged-contract assertion added to smoke-packed is reviewed as code here; a successful new packed run is A06 evidence.

## Historical findings and repair review

The initial review requested changes before acceptance. Initial independent checks passed 33 tests on both Node versions, but passing tests did not satisfy acceptance:

1. Required: structured wg_evidence captures bypassed the parser tree bounds. Independent synthetic probes showed depth 65 and 9,999 total nodes accepted. The writer added pre-parse evidence tree checks and regression tests. Repeated independent probes now reject both with LIMIT_EXCEEDED.
2. Required: structured annotation evidence could not represent required annotation kind/author or provenance-specific rationale/test-run linkage. Structured capture evidence also omitted its stored request ID. The repaired schemas retain these fields; observed/inferred/test_verified annotation payloads are discriminated and missing rationale/test-run linkage fails validation.
3. Follow-up local invariant: partial capture evidence and query capture summaries could claim a state identity. The repaired parser enforces null identity for partial coverage and a UUID for complete coverage, without claiming cross-record graph validation.
4. Writer-identified repair reviewed independently: deep invalid schema paths could exceed the public 128-segment error envelope. Paths are now capped; the depth-64 invalid-name regression produces a schema-valid sanitized error.

The initial observations are historical preliminary findings, not acceptance of the later bytes. The hashes below identify only the repaired final implementation and implemented-register artifact.

## Independent commands and results

- Initial `npm run check` on Node 26.5.0 and `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check` on Node 24.21.0: PASS, exit 0; 33 tests each, before repair.
- Final `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check` on Node 24.21.0: PASS, exit 0; typecheck, lint, formatting, build and all 36 tests.
- Final `npm run check` on Node 26.5.0: PASS, exit 0; the same checks and all 36 tests.
- Repeated independent transient synthetic depth-65 and 9,999-node wg_evidence probes: PASS; each returns LIMIT_EXCEEDED.
- `git diff --check`: PASS. Authority, package lock, CI and historical A01-A04 evidence remain unchanged against the base.

Fixtures cover all 13 request/response pairs through Zod and the independent SDK AJV validator, strict unknown fields, query modes, typed operation variants, browser action/attempt variants, byte/node/depth/time/operation bounds, error sanitization, partial identities, complete/partial evidence metadata, and generated-artifact equality. Only synthetic metadata was used; no raw browser captures, screenshots, input values, credentials or profiles were retained.

## Limitations

A05 validates public structural contracts; it does not implement or certify tool runtime, normalization/redaction, persistence/atomicity, scope/reference/trace identity, passed matching assertions, revision/idempotency/cursor semantics, freshness or output budget accounting. Browser origin/redirect policy, credential refusal, current live target authority, replay refusal, dispatch markers and cleanup remain later assigned browser work. JSON Schema exposes types, variants, strict objects and local lengths/numeric/array bounds; aggregate tree/UTF-8/serialized size, temporal context, local-reference uniqueness, transition test-run requirements and coverage/state consistency also require the parser. Schemas do not grant authorization or establish privacy.

No fresh packed/headed-browser run was performed by this A05 reviewer; the earlier A04 receipt remains historical and separate. The changed package and harness need the fresh independent A06 packed checkpoint. Host integration, cross-platform support and package publication remain unverified/unperformed. Remote CI/shipping is not attested here.

## Exact repaired artifact SHA-256

The task register below records A05 implemented. A later verified-register artifact requires a separate reviewed addendum. Implementation bytes must remain frozen.

| File | SHA-256 |
| --- | --- |
| `README.md` | `735a53d84a08397ffba6aea16b302eecba1b96c4c1a70a9e0d1076215573b45f` |
| `docs/README.md` | `a79bb7af98b26aa6251f1bdb85d5cff605c7e486753dc28b572bc522351adf54` |
| `docs/contracts.md` | `cb77336bda3c0bad1547fae865e10a42b875926358a508d2e5299f1ba0e592d4` |
| `docs/runtime-feasibility.md` | `9e212ea79ba1d7d74c919d620ed13b81e6816ef1c35a34a8389cc6a9155331b2` |
| `package.json` | `5fbc03b06155da8230840b8b3183abff29280fad5d75c0b4e146e23086d05ef9` |
| `scripts/export-contracts.mjs` | `de6149eea837893386827c45657e6772b1467d1b804927059567a5ceaf65559e` |
| `scripts/smoke-packed.mjs` | `ecd7d76ec62ddf7f2ff118ef6d79dfd07610b64ad24126af976c20ee415d5643` |
| `src/index.ts` | `618a51e3a15099002ccbaf2799cefa8289727e5feee209e4a77f4ea2cd9217c5` |
| `src/contracts/browser.ts` | `ded28a9e661899308339b1da9ce2139903239a1e6021e93ef92efaf9ba243cae` |
| `src/contracts/capture.ts` | `b0c347b4e7c812736b743ba9e3924cc1a8d592ed538cb10c96a68f0300ab9b64` |
| `src/contracts/common.ts` | `459777f9f1a3c3047cc21662f0e93f04473dfdaf0604dfbd78a940ea6863faa2` |
| `src/contracts/index.ts` | `baee3cf2b87488abd6d1e11a6bef305a3432203c06ae2060988c345d57e9f18a` |
| `src/contracts/knowledge.ts` | `e6505f1c2426e3f5d23928ed538070c7ac6b1a63281d06cc14ef9e7b53b0cb54` |
| `src/contracts/operations.ts` | `db62348e606d301ba094aa65275c46ccd8a875f6af0a12cb06d8629fc00192ce` |
| `src/contracts/records.ts` | `35930dc1d46e0e851fa29fb49dd4f71a65940e4d25d509fea2805cbcb3f5641c` |
| `src/contracts/validation.ts` | `b2c52b89c36ac8aea2b389e21adf975330540daae420a5d3bfcd7592fc6766a5` |
| `tasks/todo.md` | `b3e8fa86ddb02c614c3604256f5a2dfc1b51ffe8f91755ac9a27816c41d48044` |
| `tests/README.md` | `6a45c25bc92a03269a09e6c1e0e776f4a6dff9764d86ead6e68a316b59a64765` |
| `tests/contracts.test.mjs` | `090b5165b6b6bb5e15bd712b8f747de05e5a2154a217c2914a32520900cd4493` |
| `tests/fixtures/contracts.mjs` | `6e76ea225a8659ec577e3837eb55cf8706c6c4b67365ec19eb05ef8e8afd13e5` |

Generated `dist/contracts/schemas.json` SHA-256: `5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a`. It is rebuildable dist output; the source export and equality assertions were independently checked.

## Final verified-register addendum

Independently reviewed the later tasks/todo.md bytes with A05 marked verified and A06 pending. The record accurately separates initial 33-test observations from repaired final independent 36-test results, records resolved Required findings and retained limitations, and preserves A01-A04 history. All 19 other hashed implementation/document/test/package files remain byte-identical to the accepted artifact above. No new implementation or runtime claims are introduced. PASS for this final register; A06 may start under the explicit remaining-Phase-A batch authorization.

Final verified tasks/todo.md SHA-256: `a180080bafa9db4fb0af7f9b7f7b87edc0f2c9a732d729a3e3d32183d1f19d91`. The earlier implemented-register hash remains historical. This addendum is outside its own artifact set.
