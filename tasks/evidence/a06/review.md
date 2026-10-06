# A06 independent foundation checkpoint

Date: 7 October 2026. Independent verifier/reviewer: `/root/a06_checkpoint`; implementation writer: `/root`. This reviewer edited only this receipt. The receipt is outside its own artifact hash set.

## Verdict and authority

**PASS for A06; no unresolved Critical or Required findings or foundational feasibility blockers.** A01–A05 are verified with distinct historical receipts. Read AGENTS.md, tasks/plan.md, tasks/todo.md, docs/specification-v0.2.md, ADR-001, dependency inventory, A01–A05 receipts, complete contracts/tests and the intended `origin/main` diff. The user explicitly authorized the bounded remaining-Phase-A batch and shipping, overriding the normal one-task default. Stage B and package publication remain outside this authorization.

The reviewed implementation is A05 commit `3cfa1adef6a49044c598eb790beb34db0969e710`, with later README/checkpoint-register bytes separately identified below. Every src file matches that commit. All 18 non-README/non-register hashes in the accepted A05 artifact still match its receipt. Authority sources, lockfile and historical A01–A04 evidence remain byte-identical to origin/main (`c06a1d462c4fe49e20193c970605ac39ff7a3db3`). The historical A01 checker was preserved and deliberately not run against a package it asserts must not exist.

## Independent checks and observed results

Commands ran sequentially in `/Users/jamil/Personal Projects/waygrain`:

- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check`: PASS, exit 0 on Node 24.21.0; strict typecheck, ESLint, Prettier, build and all 36 tests passed, zero skips/failures.
- `npm run check`: PASS, exit 0 on Node 26.5.0; the same commands and 36 tests passed.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run smoke:packed`: PASS, exit 0 on macOS arm64/Node 24.21.0. Tarball SHA-256 `61b22891130729b7a8a665c5e3d45b8462a656105772a74901159cec0b654a90`; 34 packed files.
- `npm run smoke:packed`: PASS, exit 0 on macOS arm64/Node 26.5.0. Tarball SHA-256 `ca54e300a0156c978ff168bb1a0d2d2373ed8a9b9d9f7a364aa251404c5e7fab`; 34 packed files.
- `git diff --check`: PASS; Python local-link inspection: PASS for README/docs/register; SHA-256/source comparisons: PASS as described above.

Both packed runs used approved escalation for the explicitly authorized disposable download/headed launch. The clean consumer installs with scripts disabled and a scratch npm cache/browser location. Each exercises npm-bin initialization, MCP initialize/ping/unsupported-tools/EOF, no configured storage effects, private disposable disk SQLite WAL/quick_check/read, explicit Chromium download and a blank headed launch. Each imports the 13 public contracts and compares packaged generated JSON Schema against source generation. The harness finally removes consumer, tarball, settings/config, browser install and npm cache. These are new A06 archive identities; historical A04 archive receipts are not reused for this changed package.

Generated `dist/contracts/schemas.json` SHA-256 after both builds: `5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a`, matching the accepted A05 source-schema identity. Archive hash differences are identified separately; no assertion of byte-identical archives is made.

## Foundation review

Correctness: all seven knowledge and six browser tool definitions preserve baseline envelopes, strict objects, versions, limits/defaults, partial-null identities, metadata/provenance, typed operations and uncertain-attempt distinctions. Tests exercise both Zod and SDK AJV plus boundaries and repairs. Services remain responsible for graph/reference/trace matching and other explicitly deferred semantics; schema validity is not permission or privacy proof.

Readability/architecture: small data-only modules separate common primitives, capture, operations, records, knowledge, browser and parser. Generated JSON Schema has one source and public packed exports. Knowledge contracts import no browser runtime and validation has no network, filesystem or graph effects. The feasibility endpoint still registers no public product tools; no Stage B implementation was introduced.

Security/performance: fixed sanitized errors reject caller keys/values and bound paths. JSON/type/byte/tree checks precede recursive parsing; record, operation and traversal budgets are explicit. Transient fill input has no durable receipt slot; executable selectors/code, arbitrary edges, filesystem overrides and credential flags are rejected. Actual redaction/credential detection/output accounting and browser authority still require later assigned tests. This is a focused foundation review, not an exhaustive security audit or product-performance measurement.

Installed package metadata independently confirms MCP server 2.3.1, better-sqlite3 13.0.3, Playwright 1.63.0 and Zod 4.6.5; the packed checks establish clean-consumer availability/native loading on the two stated runtimes. An initial metadata probe through MCP's package.json export failed `ERR_PACKAGE_PATH_NOT_EXPORTED`; direct read-only package metadata inspection resolved that probe limitation, not a runtime defect.

The installed public `node_modules/playwright-core/types/types.d.ts` (SHA-256 `2806f6d7810fba0306066d500cd716a6d1128d90af2c3cf71723e3ea0a8904c4`) declares page ariaSnapshotJSON at line 2149 and locator ariaSnapshotJSON at line 14585. It documents free-form JSON role/name/text/children/state properties and optional URL/placeholder/ref/box fields. This is evidence of the pinned public API surface, not a live snapshot-mapping/privacy test. C02 must safely map and sanitize it; no raw snapshot or page content was obtained or saved here.

## Limits and downstream boundary

Accepted feasibility is macOS arm64 with Node 24.21.0/26.5.0 only. The blank headed probe does not attest product capture, privacy, origin/redirect policy, manual authentication, credential refusal, target freshness, dispatch/idempotency or forced cleanup. Normal context/browser closure is exercised, but temporary-profile deletion and crash/signal/parent-loss/timeout cleanup are not independently attested; C01/C05 retain those assigned obligations. Graph persistence, durability, migration/maintenance, host integration, comprehensive native/browser distribution notices and cross-platform compatibility remain their later gates. Clean consumers resolve transitive dependencies at install time. No raw snapshots/screenshots/input values/authentication state were retained. No remote CI, commit/push/merge or publication outcome is attested by this receipt.

These assigned future obligations are explicit limitations, not unresolved foundation API or packaging blockers. A06 acceptance permits B01 eligibility after the writer records verification; this request does not authorize B01 to start.

## Exact reviewed artifact SHA-256

The register below is the in-progress checkpoint artifact. Later final verified-register bytes require an independent addendum. README is the A06 status document and differs from A05's historical reviewed README. All other implementation bytes remain frozen.

| File | SHA-256 |
| --- | --- |
| `.github/workflows/quality.yml` | `3116464be4b46cc27428cfcde916e718c58cb82fd1843d069c544b41fd201bff` |
| `.prettierignore` | `b6d2ca0d961057ff04fe6533a0cd13e606dbdc1c72a0447d6df4fb451df7f654` |
| `.prettierrc.json` | `ee08eafb70d51b338abcd3bee438ba3cbb57147c6b66ba3d818d84f9e7069dd5` |
| `AGENTS.md` | `e91c183120925c7ef5e707e713205af31ca81f30ccf4ce8c0314701b2db5bb83` |
| `CONTRIBUTING.md` | `8b8ba0186cd7003544e4a8ebda8d302ee500f43aa74807f121945ca3dc44c6f4` |
| `LICENSE` | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| `README.md` | `b1f94775876b8006ed05687d8c84dd88fbef638e3f03d4367170597aa637717d` |
| `SECURITY.md` | `ceaf3398fd18b2fd00388154fd170fbce224c2c5333e66c8948231436e6f5836` |
| `docs/README.md` | `a79bb7af98b26aa6251f1bdb85d5cff605c7e486753dc28b572bc522351adf54` |
| `docs/configuration.md` | `91dfb945a84ee92452c4cf700e62cfc13eee504ea136a7996a4736c92ace07b8` |
| `docs/contracts.md` | `cb77336bda3c0bad1547fae865e10a42b875926358a508d2e5299f1ba0e592d4` |
| `docs/decisions/001-bundled-browser.md` | `0e12f5f9088325be3c1a6413a96847f35e98658a9feecd595e31a90b5aa53c75` |
| `docs/dependencies.md` | `3a83d316533fd2e67393e08dc0ddce21c853406db01ceb32fafaa2a69ab07365` |
| `docs/runtime-feasibility.md` | `9e212ea79ba1d7d74c919d620ed13b81e6816ef1c35a34a8389cc6a9155331b2` |
| `docs/specification-v0.2.md` | `21025f4e0543114fd10f31f19c0e83e6c96761da776e4217656dacab84197c7f` |
| `eslint.config.mjs` | `f87d2d18848a6ca21221cd64da9f850a94fc86d36eb73b7fac6a6dde6184ebf5` |
| `package-lock.json` | `94b7eb03dcc322c629dd9e63a142eeb727659524fed94783fb3a89ed648edcd6` |
| `package.json` | `5fbc03b06155da8230840b8b3183abff29280fad5d75c0b4e146e23086d05ef9` |
| `scripts/export-contracts.mjs` | `de6149eea837893386827c45657e6772b1467d1b804927059567a5ceaf65559e` |
| `scripts/protocol-probe.mjs` | `6f0d11bc4c13581e5e02c55815c843b9b176a837b3a3624ddb9bbe94c911efb7` |
| `scripts/smoke-packed.mjs` | `ecd7d76ec62ddf7f2ff118ef6d79dfd07610b64ad24126af976c20ee415d5643` |
| `src/cli.ts` | `538cfda4713173152f6515a717a27c1fdee6f64bdc556534f932bd05a4cabffd` |
| `src/config/filesystem.ts` | `58a10b343e71779733cd62f3baa37b81889f25afa46b5221956c7c325df8bae8` |
| `src/config/index.ts` | `c81eff82d78013f281948220dd883a826238962c17e289ed79e0419e4c2b1eac` |
| `src/config/schema.ts` | `ce274e212ff3e35d1dbc87d34ab3ae4dc8554fd28637168bc9df349c9cdc4040` |
| `src/contracts/browser.ts` | `ded28a9e661899308339b1da9ce2139903239a1e6021e93ef92efaf9ba243cae` |
| `src/contracts/capture.ts` | `b0c347b4e7c812736b743ba9e3924cc1a8d592ed538cb10c96a68f0300ab9b64` |
| `src/contracts/common.ts` | `459777f9f1a3c3047cc21662f0e93f04473dfdaf0604dfbd78a940ea6863faa2` |
| `src/contracts/index.ts` | `baee3cf2b87488abd6d1e11a6bef305a3432203c06ae2060988c345d57e9f18a` |
| `src/contracts/knowledge.ts` | `e6505f1c2426e3f5d23928ed538070c7ac6b1a63281d06cc14ef9e7b53b0cb54` |
| `src/contracts/operations.ts` | `db62348e606d301ba094aa65275c46ccd8a875f6af0a12cb06d8629fc00192ce` |
| `src/contracts/records.ts` | `35930dc1d46e0e851fa29fb49dd4f71a65940e4d25d509fea2805cbcb3f5641c` |
| `src/contracts/validation.ts` | `b2c52b89c36ac8aea2b389e21adf975330540daae420a5d3bfcd7592fc6766a5` |
| `src/index.ts` | `618a51e3a15099002ccbaf2799cefa8289727e5feee209e4a77f4ea2cd9217c5` |
| `src/runtime/browser-probe.ts` | `4ef6a75e3258d0f93a1da2fe5ed9545ba360131a8ccae76d4dae384c5a9593aa` |
| `src/runtime/index.ts` | `c47890a3a4b10f23a3241e3bc55f3e7d9112fb6a006378d986040f559d0054f0` |
| `tasks/plan.md` | `e410847bc85a1ed473db6c0ee01fd11810bf7578c832eb58b23ede9d70c75af7` |
| `tasks/todo.md` | `8a30d03a520095da9201ef53979d1eeec7660968e30ee0d1b85364ee16a9be6c` |
| `tests/README.md` | `6a45c25bc92a03269a09e6c1e0e776f4a6dff9764d86ead6e68a316b59a64765` |
| `tests/cli.test.mjs` | `1673769531d729e5821cf6efcad4081e9c9f62c44fa62cb027f028499fc8b9cc` |
| `tests/configuration.test.mjs` | `d483580656c77b5915ef8fdaa929ffc0117dc6fed21c333e0af8b4ec0fc88fcd` |
| `tests/contracts.test.mjs` | `090b5165b6b6bb5e15bd712b8f747de05e5a2154a217c2914a32520900cd4493` |
| `tests/fixtures/contracts.mjs` | `6e76ea225a8659ec577e3837eb55cf8706c6c4b67365ec19eb05ef8e8afd13e5` |
| `tests/runtime.test.mjs` | `1a11aae598a567fd80825d57add898856fd34b0c2f56426632496d209156747f` |
| `tsconfig.json` | `e25339659779aebef9aa1b9cf057c42f7c17b79f694e331725fb2bc227e5d29d` |

## Final verified-register acceptance addendum

Independently reviewed final tasks/todo.md after the writer recorded A06 verified. PASS; no Critical or Required findings. The record accurately reports the independent two-runtime 36-test checks, new 34-file packed runs and both archive/source-schema identities, public API evidence limits, no unresolved foundation blockers and all assigned future obligations. A01–A05 historical task results remain unchanged; A01–A06 are checked/verified and all 33 later tasks remain pending. B01 is not started or authorized.

Final tasks/todo.md SHA-256: `a988590d01b39c3c654d422fcc13a4f2480c18506d890d56c8477cd283850dd1`. The initial in-progress register hash above remains historical. Independent SHA-256 comparison confirms every other file in the artifact table remains byte-identical, including the README used by both packed runs. The accepted artifact is those unchanged files plus this final register identity; the receipt remains outside its own hash set. No source bytes changed after passing commands, so their evidence applies to the final artifact. Remote CI and shipping outcomes still require separate delivery evidence.
