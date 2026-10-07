# C01 independent verification and review

Reviewer: `/root/c01_review`; 7 October 2026. Writer: coordinator `/root` only. Baseline: shipped B06 `a08fe16`; authority is AGENTS.md, tasks/plan.md, specification v0.2 and ADR-001. Those authority files and historical B06 evidence are unchanged. This receipt is outside its own identified artifact set.

## Verdict

PASS for C01, subject to the explicit limits below. No unresolved Critical or Required findings. This accepts lifecycle implementation only; C02 snapshots, C03 navigation/targets, C04 action receipts and C05 browser checkpoint are not implemented or verified by this receipt. The register below is the implemented-state artifact, not final verification status; subsequent final register/document bytes must be accepted separately.

## Actual independent evidence

- `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run check`: PASS, Node 24.20.0, 57 tests, strict typecheck/lint/format/build. `npm run check`: PASS, Node 26.5.0, 57 tests. Renewed after disposal/cleanup and worker ownership-guard repairs; standalone refusal preserves caller temporary storage, exits one and emits no diagnostics on both runtimes.
- `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run test:browser:lifecycle`: PASS on the final repaired artifact, with approved escalation for Chromium OS launch. Normal open/status, same-request replay, competing-open conflict, normal close, SIGTERM owner loss, SIGKILL parent loss, and direct worker startup IPC disconnect at 10/150/500 ms all passed; startup workers exited zero and private roots were absent. Earlier Node 26 headed lifecycle/login passed before the final cleanup regression repair and is historical evidence, not the final headed qualification.
- Independent active-MCP probe: initialize/list/status, explicit browser open/status, then stdio EOF through `probeStdio`; process exit zero, empty diagnostics and scratch removal PASS on Node 26.5.0 after final worker and ownership-guard repair. Independent startup IPC-loss probe at 150 ms also PASS with exit zero and private-root deletion. Temporary probe was removed after use. Reproduce active EOF by calling `probeStdio(dist/cli.js, syntheticConfig, exercise)` with exercise sending `wg_browser_open` and `wg_browser_status`, leaving the session open for the harness's stdin end; use a private TMPDIR and assert its `waygrain-browser-*` children disappear.
- Synthetic headed form-path test passed: same-origin form submit and cookie-assisted signed-in page, fresh context returned to login, foreign-origin server observed zero requests. This is automated simulation of the human form path, not real human, account, credential, MFA or host qualification. Values stayed in test/worker/browser memory; no request body, authentication state, page snapshot, screenshot or profile was retained by the test or exposed through Waygrain.
- Source review and `git diff --check` PASS. Read-only construction/status do not launch workers; strict configured app/scope validation precedes launch. Only explicit open starts a headed, nonpersistent context. Knowledge capabilities are unchanged; only three lifecycle tools are added. RPC output has status/cleanup metadata and opaque binding, no URL/body/page data. Action/key capability arrays are empty. Closed/stale sessions, replay after closure and competing opens fail closed. Downloads, service workers, extra pages, dialogs, foreign-origin HTTP(S) and WebSockets are constrained as documented.

## Historical findings and repair

Required startup cleanup finding: disconnecting the worker IPC 150 ms after an open reproducibly exited one, although the scratch root disappeared. `stop()` and the open error handler ran cleanup concurrently after awaiting the same launch. Writer repaired this with a shared cleanup promise and an explicit exit code on cleanup success/failure. The cleanup exit code also prevents a failed close from exiting zero and overriding controller uncertainty. The final independent startup regression and extra probe pass; finding resolved. A final defensive worker guard rejects standalone invocation without owned IPC and an absolute private root basename, and handles IPC loss before module initialization. The independently executed standalone-refusal regression passes on both runtimes. Coordinator also repaired disposal to share one promise, set disposed immediately, wait lifecycle dispatch and use dispose for runtime signals. Review confirms concurrent EOF/signal disposal shares teardown.

## Limits

Local macOS arm64 and Node 24/26 quality evidence only. Final headed evidence is Node 24; Node 26 final active MCP/startup probes add local process evidence. No packed lifecycle, coding-host, cross-platform, real-account/MFA or browser snapshot privacy qualification. The login test calls the browser engine directly rather than a real MCP host/human session; it tests the same nonpersistent engine policy used by the worker. Origin routing tests one synthetic foreign-origin case, not the full redirect/pop-up/protocol/egress matrix reserved for C05. Scope role/account aliases are operator declarations, not proof of backend privileges.

Normal and IPC-loss cleanup waits for the in-flight launch and closes live owned resources. RPCs time out at 25 seconds and disconnect for worker-owned cleanup; there is no PID-based authority. A malicious or stuck worker after a successful reply, hard worker kill, simultaneous worker/owner loss, OS failure or hostile ancestor replacement is not proven to clean completely. The controller refuses a new session while cleanup/ownership is uncertain. No runtime claim expands beyond this evidence. No commits, push, merge or remote checks performed by this reviewer.

## Exact reviewed artifact SHA-256

| File | SHA-256 |
| --- | --- |
| `README.md` | `0852baaa0214321a6df3f984e66c5aeb8197f85614bb8d86b8aa66155a2b410a` |
| `package.json` | `df705240b44153d3ceab11adc5e6c0dfd67d2a495b11d1ce1f8e3f0a01b4475b` |
| `scripts/protocol-probe.mjs` | `82149ed320ef71c82b642bdf27b1ffe6808a667590ef784f36d67a814c15df22` |
| `src/mcp/index.ts` | `b6027ddf0518410cf1d963d1eb8d4c1783d9a945e710155af71d08115431ba4d` |
| `src/runtime/index.ts` | `f002c8af9999882ecf154c1b5154d81de2d71a7cd99ce6a46fe91e69a880e97a` |
| `tasks/todo.md` | `4721201bbebeebdc8e4a89603531eef8f0cbb664ced4287e9bed2bab281c75db` |
| `docs/browser.md` | `f35ca1e0c6f73ccdcbc6ef9def54247f9fb5a9ba0ab6c16cd44c765f5b40b3ba` |
| `src/browser/engine.ts` | `551d17b85d254e2d90a37c1387044d18496039d4a4663317b32602aed102a7db` |
| `src/browser/protocol.ts` | `b2a421987bf67160775740c4b554f0ea2e95d41675376a02ba8660742ec3815e` |
| `src/browser/session.ts` | `f3619563eaa7479ca3a43e472a4c718751760cfdf6c7d68339271a2657d350ed` |
| `src/browser/worker.ts` | `80cfa02b481f00b25f2a0406a08b29b369cc69a9faa3da080f334b16b8abf5f6` |
| `tests/browser-session.test.mjs` | `30444b256e91b3a44997791188e502d1bb101afc1155be112cd0faca568a5ff1` |
| `tests/browser/lifecycle.mjs` | `98239caa992045c289d0b3479120b0ba8e599747bd27149b26e3da22a96950ae` |
| `tests/browser/login.mjs` | `77ac8f721211ab8fea1f12093cc2e77bd54bb7b6ab8186000941248d5b76f0e3` |

## Later final verified documents

Independently accepted final README.md and tasks/todo.md after coordinator recorded C01 verified. They accurately summarize this receipt and preserve the synthetic-login, host/platform and later-task limits. All implementation, test, lifecycle guide, protocol harness and package identities above were recomputed and match; only these two final documents differ from their implemented-state hashes. This later acceptance does not rewrite historical artifact evidence. Final C01 artifact verdict remains PASS; C02 may satisfy its C01 dependency, while shipping CI and delivery remain separate.

| File | Final SHA-256 |
| --- | --- |
| `README.md` | `a06e6a5a8784b70176d298c9603f8d366696932cfd5fd9d1cf964598ee3a620e` |
| `tasks/todo.md` | `716474b1eeb693d670a82d23a41a316a216055c1b114de5eba7842c63afa7823` |
