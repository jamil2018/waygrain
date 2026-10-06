# B05 independent verification and review

Reviewer: `/root/b05_review`. Date: 7 October 2026. Verdict: **PASS**, no Critical or Required findings. This reviewer made no implementation edits. Review covers B05 against implementation baseline `4f33784` and verified B04 evidence; the one writer remains the coordinator. The user authorized the B01–B06 batch and shipping; this receipt accepts B05 only.

## Actual verification

- `npm run check`: PASS on Node 26.5.0, macOS arm64, 54 tests; typecheck, lint, formatting, build and tests.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check`: PASS on Node 24.21.0, 54 tests, same quality commands.
- `npm run smoke:packed`: PASS on Node 26.5.0, clean consumer installation with scripts disabled, all 13 public contract exports/generated schemas, three advertised knowledge tools, sanitized unknown private argument rejection, stdio initialize/ping/status/EOF, disposable SQLite disk WAL integrity/read, explicit Chromium install and blank headed launch. 46 packed files; archive SHA-256 `dc8a1445417d1c92dd8175476ba112ddacb98643db759dd038278bb90bacfafc`.
- Node 24.21.0 `npm run smoke:packed`: PASS with the same assigned checks, 46 files; archive SHA-256 `31c60f8a8d0647d27aa1c53bf4d493ce5a02411c41b137aef89367be582956d7`. Both disposable smoke roots were removed by the harness. Network/headed launch used authorized escalation.
- Independent synthetic edge probe on Node 26.5.0: PASS across 271 requested byte budgets from 1 through 9991 bytes, verifying serialized envelope bounds, maximum two items, explicit budget errors and nonoverlapping continuation. Also PASS: wrong-app evidence withheld and counts zero, duplicate IDs collapse, reordered IDs/changed app/corrupt cursor rejected, reads preserve revision, malformed MCP arguments (omitted/object/string/array/bad app/cursor) never echo synthetic rejected marker, and post-EOF exclusive maintenance open succeeds. The first probe invocation used an encoded file URL pathname as a subprocess path and failed before the handshake; correcting the reviewer path with `resolve()` passed. No product defect was inferred from that invocation.
- `git diff --check`: PASS. Existing authority documents and historical evidence were not modified by this slice.

## Review evidence

The five review axes (correctness, readability, architecture, security and bounded performance) pass for the assigned B05 slice. Shared dispatch gives CLI and MCP the same ingest/status/evidence core. Strict validation precedes scope selection; SQL is parameterized. Evidence reads use a transaction snapshot and bind cursor digests to app/project, ordered deduplicated IDs, projection and store revision. Budget changes are permitted on continuation; writes make old cursors stale. Both successful items and incomplete envelope metadata are charged against the JSON envelope byte budget. An unfit individual item produces explicit empty incompleteness without an unusable continuation. Missing IDs withhold the whole requested evidence set, and wrong-app IDs disclose no capture body. App counts include all ten public kinds with currently unsupported kinds zero. Status byte accounting is database plus WAL against the configured cap; reads never claim a UI check or application version.

Tests independently exercise CLI/core ingest replay and structured retrieval parity, MCP/core structured retrieval and replay parity, schema advertisements, sanitized errors and transport EOF. The pinned SDK 2.3.1 low-level `setRequestHandler` and `projectCallToolResult` implementations were read locally: this use is supported, preserves object structured content in MCP 2025-11-25, and avoids the high-level tool validator's caller-derived error diagnostics. Malformed tool argument shapes were exercised through the real stdio endpoint. Generic protocol validation remains SDK-owned; stdin transport is bounded separately from the 1 MiB public request parser.

## Limits

Only `wg_status`, `wg_ingest` and `wg_evidence` are implemented/advertised; capabilities declare ingest and evidence. The other ten contracts remain definitions. Capture evidence is implemented; annotations, richer recall, changes, freshness rechecking and recovery remain later tasks. Output budgets apply to the knowledge JSON envelope, excluding transport wrappers and MCP's text compatibility copy. Opaque nonidentifying provenance keys and reviewed operator labels retain their established B02/B04 boundary. Blank Chromium feasibility does not attest browser mapping/privacy, session cleanup under forced loss, product interaction, coding-host compatibility or other operating systems. No screenshots, input values, profiles or authentication state were retained. Consumer transitive dependency resolution and remote CI remain separate from these local checks.

## Exact artifact identity

SHA-256 of reviewed source/test/docs files below. This receipt excludes itself and the changing task register from the implementation table. Any later source changes require renewed review. The implemented-register SHA-256 observed at review was `86b727be0989438225d530063048a1eda9c653aa11fd2f163d4818c0987ffc84`; a later verified-register or README update must be separately identified.

| File | SHA-256 |
| --- | --- |
| `README.md` | `8e4917885582bb00ff272d485b3b39fefefb7aa2a366eddbd0fcc8b05bf10a88` |
| `docs/capture-persistence.md` | `9e76ee1c74c032d43b66797f511663a450e3387fcbbb1e7bf113aad56b2fb72a` |
| `docs/configuration.md` | `887fb13b9b2b68655223232967aba93ec0eab8ccaac3e5a14fb879e66c9a49cf` |
| `docs/contracts.md` | `e261b2ccb8cf2007ad95f8b96ad8ea0476c83ccf8fc82c6baac316328f23f9a8` |
| `docs/runtime-feasibility.md` | `b5454aa1482fed47c88d2bd73552fb00a5cd763cb9ba7f41136a272f4c1bcb8a` |
| `scripts/protocol-probe.mjs` | `8c4301fe68f4e04badf268aa19b345cfd9cdfa32f0bd63e6f553b26512e9899e` |
| `scripts/smoke-packed.mjs` | `11b73674ce514754f1b83851e9848b68d0305d2b83ae0b707a6087002b4730dc` |
| `src/cli.ts` | `3cf92bd3e81668885601c531a1d98a7ca3ffb7823b853573742ecc35360c83d9` |
| `src/core/retrieval.ts` | `b2e2497ce083c740e732a03876723865b196af566895bb73ed55348dd16c970e` |
| `src/mcp/index.ts` | `1de8c63a9a3b6eb95e8a668219dc1c08134380f3161816bf570934846a2e633d` |
| `src/index.ts` | `ed5dea2f526c07728eae059293b4e878c0916d59ca2ef7ad910a5685b401bd1e` |
| `src/runtime/index.ts` | `8e157cbf387785f5eb5202627b99ccbf2e0845a15217fed16e252e596703d7ce` |
| `tests/README.md` | `ae7ce662c7d7f5fcbe64cf7a4a2fe5f71ed5592908e5a736df115f1a01827076` |
| `tests/retrieval.test.mjs` | `0da613480fc074cd05503d622585e8eded406b941110d62061a95f094ab46c13` |
| `tests/runtime.test.mjs` | `49660fdfc0a3703aefcea76bcc9886c8676417a1aa83183ac87bd10d07396995` |

## Later final documentation/register acceptance

The coordinator subsequently updated README to B05 verified/B06 pending and corrected historical-versus-current setup wording in configuration/contracts/runtime guides. Independent reread accepts those changes and the final verified B05 register: no runtime/test changes, no broader checkpoint or host claim. All other reviewed artifact table hashes were recomputed and remained identical. `git diff --check` passed. These later files are separately identified below; they supersede their earlier documentation table entries only. The packed smoke archive hashes above predate the later README bytes, so they do not attest that final README's archive; B06 must rerun packed smoke for its final artifact. The other three guides and register are excluded from the package file set.

| File | Later SHA-256 |
| --- | --- |
| `README.md` | `8e4917885582bb00ff272d485b3b39fefefb7aa2a366eddbd0fcc8b05bf10a88` |
| `docs/configuration.md` | `887fb13b9b2b68655223232967aba93ec0eab8ccaac3e5a14fb879e66c9a49cf` |
| `docs/contracts.md` | `e261b2ccb8cf2007ad95f8b96ad8ea0476c83ccf8fc82c6baac316328f23f9a8` |
| `docs/runtime-feasibility.md` | `b5454aa1482fed47c88d2bd73552fb00a5cd763cb9ba7f41136a272f4c1bcb8a` |
| `tasks/todo.md` | `19935e12f778779f2376d3fea4e1a7bbb4bc478aea45bff6f49a284bbc29f3b9` |
