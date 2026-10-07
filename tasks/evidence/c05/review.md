# C05 independent browser and privacy checkpoint

Reviewer: `/root/c05_checkpoint`; implementation writer: `/root` only. Date: 7 October 2026. Implementation commit `642cfb57897a6968cc99f2501617b10c458ffb6f`, shipped C04 merge `1c860b3`. C01–C04 historical receipts are preserved. This receipt is outside its own identified artifact set. No implementation edits, commits or remote operations by this reviewer.

## Verdict

PASS for the exact unchanged browser implementation and reviewed checkpoint limits. No unresolved Critical or Required findings. Final document and strengthened packed-artifact acceptance is recorded separately below when complete.

## Checkpoint evidence

Independent authority review: AGENTS.md, tasks/plan.md, tasks/todo.md, specification v0.2 privacy/evidence/contract requirements, ADR-001, and historical C03/C04 findings and repaired receipts. Fresh source review covers every browser module, MCP forwarding/error/cancellation handling, runtime ownership/shutdown, strict public contracts, configuration scope selection, ingestion's repeated normalization, and SQLite journal persistence. No source/package/test/script/browser-guide differences from `642cfb5` during testing.

- `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run check` and `npm run check`: PASS, Node24.20.0 and Node26.5.0, 61 tests each; typecheck, lint, formatting, deterministic tests and build. No browser launched by quality commands.
- Both runtimes: `npm run test:browser:lifecycle`, `npm run test:browser:snapshots`, `npm run test:browser:navigation`, `npm run test:browser:actions`, `npm run test:fixtures`: PASS with approved headed Chromium escalation on macOS arm64. Node24 commands use the PATH prefix above. Lifecycle includes explicit open/status/replay/conflict/close, signals, parent loss and three startup IPC-loss timings; synthetic same-origin form login/fresh-context isolation. Snapshot checks use actual public JSON mapping, redaction and ingestion; unsupported editing/coverage is explicit. Navigation checks original element identity, replacement/ambiguity/change refusal, exact scope, allowed mapped routes, same-origin redirects and foreign-origin zero requests. Seven action kinds, credential refusal, option replacement/value/disabled-group refusal, one-effect replay, consumed snapshots and actual interrupted SDK operation with unknown result pass. Fixture matrix covers 32 synthetic cases.
- Independent expanded Node26 actual-engine redirect probe (`node /private/tmp/c05-network-verified.mjs`): foreign-origin HTTP302 reached through an image, page fetch and dedicated-worker fetch yields zero forbidden-origin requests, in addition to top-level redirect containment. To reproduce, extend `tests/browser/navigation.mjs` with a same-origin page that appends an image with `/redirect`, calls page fetch(`/redirect`) and creates a Blob dedicated worker fetching the absolute synthetic origin plus `/redirect`; wait 1000ms, assert the allowed redirect endpoint receives three additional requests and forbidden server count stays zero. A strengthened rerun independently confirmed all three fetch paths reached the allowed redirect endpoint before blocking the foreign hop. Terminate worker and close browser/servers/store, remove scratch. Initial extra probe raced blocked-navigation error-page recovery; a 300ms settle before loading the fixture repaired the harness. This was an extra-harness sequencing issue, source unchanged, not a product pass inferred from failure.
- Independent Node24/26 real-store synthetic-controller probe (`PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH node /private/tmp/c05-controller.mjs` and `node /private/tmp/c05-controller.mjs`): controlled BrowserSession RPC returns prepared marker, then verifies journal.read is unknown at first dispatch; an active AbortSignal sends one cancel and transport loss resolves unknown. Queued foreign-session close sends zero cancel and later rejects SESSION_CLOSED. Replaying same execution with changed synthetic fill text returns unknown, leaves dispatch count one, and DB/WAL/receipt rows contain no seeded fill value. Store close/reopen retrieves unknown. Reproduce with `storageFixture`, actual BrowserSession/AttemptJournal, a connected fake child and RPC override; the fixture preserves actual SQLite transaction behavior, while cancellation transport is intentionally synthetic. Temporary probe files removed after verification.
- Source inspection confirms safe receipt reservation before dispatch, strict scoped bindings, twice-checked worker-owned live target eligibility, original option identity/value retained only in worker/browser memory, no input hashes, no caller selectors/JavaScript or automatic dialog acceptance, and conservative unknown post-dispatch errors. Durable pending markers read unknown and never authorize automatic replay. Output errors omit rejected values; worker stdout/stderr are ignored; raw JSON/URL/body/option values remain transient inside worker/browser paths.
- `git diff --check`: PASS. Current C05 in-progress register accurately scopes an independent read-only checkpoint and does not prematurely mark it verified. Final verified README/register will receive separate acceptance.

## Packed evidence before final result documents

`npm run smoke:packed` uses a fresh temporary npm cache, `npm install --ignore-scripts`, explicit initialization, explicit Chromium installation, packed public schemas, MCP lifecycle and privacy/error/EOF checks, private disk SQLite WAL and blank headed runtime smoke; scratch removed by harness. No package publication. Node26 PASS: 62 packed files, tarball SHA256 `28249adb68f827a783c2ecb30d413dadad270b3cd9659e20e5d0d656b03429c4`. Node24 PASS: 62 packed files, tarball SHA256 `fded1650f1c2589a73e16d2cd4e573881c441f261e350dd0e8734097f91dc25f`. Final README changes are packed and require distinct final archive evidence.

## Boundaries and limitations

This checkpoint qualifies bundled Chromium behavior locally on macOS arm64, Node24/26. Scope is explicit operator-declared context; it cannot certify backend role/account permissions or detect arbitrary application semantic role changes. Strict navigation rejects requested scope changes, and network policy blocks foreign-origin handoff. Snapshot completeness covers supported accessibility structure, with explicit partial unsupported coverage; static allowlists require application review. No real credentials/MFA or auth data retained.

Actual driver interruption is exercised by closing Chromium during a slow application action; controller cancellation/close/marker sequencing is independently checked with synthetic RPC. MCP schema/list/lifecycle/invalid requests/EOF are checked from packed stdio. Full positive MCP snapshot/navigation/actions after human-owned initial navigation, real MCP host cancellation UI, coding-host installation, second host and cross-platform support are unverified and not acceptance claims. The initial blank session deliberately needs human navigation before obtaining an actionable snapshot.

Action success means an SDK operation returned; business effects, rollback and future graph transitions are not established. Unknown outcomes require inspection and separately authorized new execution. Cleanup evidence covers owned normal close, signals, owner loss and startup IPC loss; hard killed worker, simultaneous owner/worker loss, hostile filesystem ancestors and OS failure do not have confirmed cleanup. No persisted PID authorizes cleanup. These explicit failure limits are reviewed and do not imply complete host attestation.

No Critical or Required findings identified in fresh checkpoint source/behavior review. C05 checkpoint verdict: PASS for the exact unchanged implementation and documented limits; later final documentation/archive acceptance remains separate. No later phase is authorized by this checkpoint.

## Exact checkpoint artifact SHA-256

| File | SHA-256 |
|---|---|
| `src/browser/actions.ts` | `56cae5e917cb87a9cf682442d3c83f6f00cad4e296f85d4f8616ee29239ebbfc` |
| `src/browser/attempts.ts` | `fe93f1f588fb799ea3d11c594a7d173fef08e6e12f0915aedf41b24f77047ad5` |
| `src/browser/driver.ts` | `1f0306c20fff0ae4d8c356b94381aba88605bb20d0404da2f3587b7b41f5f460` |
| `src/browser/engine.ts` | `7d18c9bd656a0c255bd50db8c5bff1c9ccc9c8d24b269aac64b0bd27a9216476` |
| `src/browser/protocol.ts` | `1ca439f57d2775d482eed90bc62bf71e2bff60bbe467e4d0fa7da0fe5bbf00a6` |
| `src/browser/session.ts` | `8f4d1d610417f8820d2166305f7d05f31251590a305423e07fe82a88ef102878` |
| `src/browser/snapshot.ts` | `ac1607ef954a87b3623adc0c3edda788c6ff98020b1997b9d6ce9a67cf670d2a` |
| `src/browser/worker.ts` | `87c948eefed6e775637419723270fad3d3f047195e9ea5872d27ca600bdbd16c` |
| `src/cli.ts` | `3cf92bd3e81668885601c531a1d98a7ca3ffb7823b853573742ecc35360c83d9` |
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
| `src/core/ingest.ts` | `932ef0926b8afdc4035ec8d9a6efea52097bd7904132819a6e815abe9cd4ea1e` |
| `src/core/normalize.ts` | `b64ad106240ba84e52430b8252cd9b50d506445e719eff9ebcf0263a055ec07a` |
| `src/core/retrieval.ts` | `b2e2497ce083c740e732a03876723865b196af566895bb73ed55348dd16c970e` |
| `src/index.ts` | `ed5dea2f526c07728eae059293b4e878c0916d59ca2ef7ad910a5685b401bd1e` |
| `src/mcp/index.ts` | `d8b415c3e1a11a77591f7f6ecf2eeb5d153f92b96820b45e4ec03dbdef14da33` |
| `src/runtime/browser-probe.ts` | `4ef6a75e3258d0f93a1da2fe5ed9545ba360131a8ccae76d4dae384c5a9593aa` |
| `src/runtime/index.ts` | `f002c8af9999882ecf154c1b5154d81de2d71a7cd99ce6a46fe91e69a880e97a` |
| `src/store/database.ts` | `12360aa54e568faaa4337e6e5495b63d13ef8f4cc4510c910bac47f3f5a6f5f2` |
| `src/store/schema.ts` | `fa260d068be51144acb15a622cc620262c07d65de2307b41c8f1e08af313f1d7` |
| `package.json` | `748eab170b023fd1952a9647892f7033ca14a29c2683760c18ec994d77ede33d` |
| `package-lock.json` | `94b7eb03dcc322c629dd9e63a142eeb727659524fed94783fb3a89ed648edcd6` |
| `scripts/protocol-probe.mjs` | `42512834bc2c281875070b9ab5cf4987927f21acf319c5aa886f5a45cac34c48` |
| `scripts/smoke-packed.mjs` | `11b73674ce514754f1b83851e9848b68d0305d2b83ae0b707a6087002b4730dc` |
| `docs/browser.md` | `fb43193f55d2d112d08c00e131ef3757c7de9ba6ba3400bc4edd4cee8e68cc3e` |
| `README.md` | `8b28db596748c7acd3c94c25591feb4132b8b54078b132c9c5b9262e33e02286` |
| `tasks/todo.md` | `e16743a5a944bb840b6a799a455a0572adf737e3182c90e1fb98f6c01885aefe` |
| `tests/browser/actions.mjs` | `5a3c680de69637bc9cc6d4c2f481a87427d9334bad4d36b14c4faa869e14a4ed` |
| `tests/browser/fixtures.mjs` | `a796be2d83b4038e31d57df6b9be47438a9cce1c4245c50971a52265fbf850c0` |
| `tests/browser/lifecycle.mjs` | `98239caa992045c289d0b3479120b0ba8e599747bd27149b26e3da22a96950ae` |
| `tests/browser/login.mjs` | `77ac8f721211ab8fea1f12093cc2e77bd54bb7b6ab8186000941248d5b76f0e3` |
| `tests/browser/navigation.mjs` | `baa54b258e33b092d92c1f80b7eb84920d193a638072818ac705b3aa1be98f19` |
| `tests/browser/snapshots.mjs` | `fe306ce35b20305ab5f2462dec4ed25f293287fb05d4065fe8101e3bb582f0ed` |
| `tests/browser-attempts.test.mjs` | `622c3945aba091d0bc34d7401fc76db27f0bc80569ce730431725f875a248fd9` |
| `dist/contracts/schemas.json` | `5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a` |

## Final result documents and strengthened packed follow-up

Final README.md and tasks/todo.md independently accepted: they accurately mark C05 and Phase C verified with fresh assigned evidence, keep D01/later phases pending, retain positive full post-bootstrap MCP/coding-host/platform and hard-loss cleanup limits, and distinguish later final archives. All implementation/generated/test/package hashes above were recomputed unchanged.

| File | Final SHA-256 |
|---|---|
| `README.md` | `9d03d957a0121583e453566c6a49af816825d1a50fd29f06dc15dfc460befafc` |
| `tasks/todo.md` | `108ac491d585482c93f7e6fb65845ff9c543f258ca1f0fbb4a5ce80ea96f76c2` |

A temporary strengthened copy of smoke-packed/protocol-probe adds actual clean installed worker MCP open/status, safe blank snapshot ORIGIN_NOT_ALLOWED, still-open status, complete close, EOF and empty owned scratch; all work remains synthetic and no source files change. Initial final-archive follow-up on both Node24/26 returned BROWSER_INSTALL_FAILED during explicit browser installation, before that worker callback. Thus those runs do not establish worker failure or pass, and their final archives are unaccepted. Initial successful archives above remain historical. Sequential diagnostic retry is in progress; final shipping acceptance is pending this follow-up, with no source fix inferred from a download failure.

Sequential strengthened Node26 retry (`node /private/tmp/c05-final-packed.mjs`) PASS, 62 packed files, final README archive SHA256 `0ec9c12e62af83ac2101f14bb5259fc476ec6cff63c3ffc2bc8f399ea14c64e7`. Actual clean installed packed worker initializes Chromium/CDP and IPC, opens/statuses successfully, safely rejects blank snapshot with ORIGIN_NOT_ALLOWED while remaining open, closes with confirmed complete cleanup, leaves owned scratch empty and exits cleanly on EOF. Existing clean-install/public-schema/private SQLite/runtime checks also pass. The earlier explicit-install failures were transient for this runtime; no source change was needed. Node24 sequential retry remains pending.

Sequential strengthened Node24 retry (`PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH node /private/tmp/c05-final-packed.mjs`) PASS, 62 packed files, final README archive SHA256 `57a8c22f54ed8a8d7156ff86c03784bdb5b3c3bab696ed491b52c3f8b9fb22c3`. It passes the same actual clean installed packed worker/CDP/IPC lifecycle, safe blank snapshot refusal, complete close, empty scratch, EOF, schemas, SQLite and runtime checks. Both sequential retries use fresh binary downloads and fresh npm consumers; no copied cache fallback was used. The temporary harness restores process environment and removes all consumer/browser/cache scratch.

Final checkpoint and shipping-artifact review: PASS, with no unresolved Critical or Required findings or assigned checkpoint blockers. Both final document hashes match above, every implementation/generated/test/package hash in the checkpoint artifact table matches, and `git diff --check` and receipt formatting checks pass. Successful final archives are distinct from the earlier successful archives and the two historical failed browser-install follow-ups. No source changes or unsupported full post-bootstrap MCP/host/platform/business/guaranteed hard-loss cleanup claims are implied. Temporary strengthened harness/protocol files were removed after recording these results. Remote CI and shipping operations remain the coordinator's responsibility.
