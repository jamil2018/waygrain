# C04 independent verification and review

Reviewer: `/root/c01_review`; writer: coordinator `/root` only. Date: 7 October 2026. Baseline: shipped C03 `693958b`. Reviewed authority: AGENTS.md, tasks/plan.md, specification v0.2 and ADR-001. Authority and historical C03 review evidence remain unchanged. Receipt is outside its identified artifact set; later verified register/README bytes require separate acceptance.

## Verdict

PASS for the C04 repaired artifact below. No unresolved Critical or Required findings. This accepts bounded browser actions and attempt receipts only; C05 remains a separate independent browser checkpoint. No commit, push, merge or remote operation was performed by this reviewer.

## Independent evidence

- Final `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run check` and `npm run check` PASS on Node 24.20.0 and Node 26.5.0, 61 tests each: strict typecheck, lint, format, build and deterministic tests. Renewed after the final MCP annotation adjustment. Earlier lint failure and earlier repaired runs are historical.
- Final `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run test:browser:actions` PASS with approved Chromium launch escalation. Seven SDK actions succeeded on synthetic current targets; repeated execution did not repeat click or fill, and changed fill text reused the original receipt. Associated Username/One-time code labels, password/username autocomplete, payment `cc-name` and PIN placeholder fields refused. Initial disabled optgroup choices were excluded. Changed option value and replacement with identical label refused stale option IDs. Actual SDK click interrupted during its slow application handler returned unknown and remained unknown on replay. Private receipt/DB/WAL checks found no seeded fill values.
- Final Node 26 `npm run test:browser:navigation` PASS: current original element identity, replacement/ambiguity/change refusal, guarded navigation and durable replay. Final Node 26 `npm run test:browser:lifecycle` PASS: normal close, signals, killed-parent loss, startup IPC loss at three timings, synthetic login/fresh-context isolation. Earlier normal-close failure below was repaired. The final later MCP change adjusts only tool annotations and was separately inspected/typechecked; it does not change these worker SDK paths.
- Independent extra headed probes PASS after repair: associated-label-only Username and One-time code fields reject preparation with CREDENTIAL_FIELD; changing option.value without changing its label/index refuses STALE_TARGET; initial disabled optgroup does not authorize its option. Synthetic temporary probes were removed; no raw snapshots, screenshots, browser profiles, request bodies or auth state were retained or printed. To reproduce, initialize the synthetic fixture settings on a loopback origin, allow those static labels, construct the actual BrowserDriver/BrowserActions, take/decorate a snapshot, and attempt preparation before/after mutating only a native option's value. All test values are synthetic.
- Independent controller probe PASS on Node 24/26 with synthetic RPC transport: at the first act dispatch the pending SQLite marker already exists; AbortSignal sends one cancel; authorized same-session close cancels out of band while an action is queued; foreign-session close sends zero cancel; transport interruption returns unknown; changed-fill replay never dispatches and retains no fill text. This verifies parent control/marker sequencing, not a real host cancellation UI. The probe uses a real synthetic Store/BrowserSession with a controlled RPC override and fake connected child, then removes its private configuration/store.
- Source and `git diff --check` PASS. `extra.mcpReq.signal` passes the SDK request cancellation signal to BrowserSession. Snapshot reads are annotated read-only; act is conservatively destructive. Tool annotations are descriptive, never authorization. Close validates app/session before cancellation, only cancels an active execution, and blocks a newly preparing action before durable reservation/dispatch. Cleanup confirmation waits only for the live owned child, with a five-second exit bound and unconfirmed fallback.

## Findings and repair history

All findings below are resolved in the exact final artifact.

1. Required credential policy gap: visible associated-label-only Username and One-time code fields accepted fill preparation. Attribute-only policy also omitted standard payment/OTP autocomplete indicators. Repair adds the original accessible name, native labels, aria-labelledby text, placeholder and conservative credential/payment/OTP/PIN markers, rechecked before dispatch. Retained and independent headed probes pass.
2. Required native option identity gap: changing option.value with the same label/index/disabled tuple accepted an old option ID. Repair retains original option identity and value in a worker-local browser JSHandle, compares current identity/value before dispatch and selects that original element. Values are never sent through IPC or journal hashing. Replacement with identical safe text is refused. Separately acquired option handles are created only for dispatch and disposed afterward; option references release on redecorate/action completion.
3. Required effective disabled gap: an option in an initially disabled optgroup was advertised and accepted. Repair uses effective `:disabled`; retained and independent probes pass.
4. Required close regression: unconditional out-of-band cancel for idle normal close caused the existing lifecycle harness to receive unconfirmed cleanup and fail. Repair sends cancel only for active execution, coordinates close intent with preparing work, and bounds confirmation of an owned clean child exit. Renewed lifecycle suite passes.
5. Required quality failure: both initial runtime checks failed ESLint because AbortController was undeclared in the new test. Repair uses globalThis.AbortController; final checks pass.

## Boundary and limitations

Action operations resolve the original worker-owned current target twice, require strict permitted kinds/current scope and consume the public snapshot before dispatch. SDK operations use three-second timeouts; scroll delta and the five navigation keys are bounded by the unchanged A05 schemas. No caller selectors, scripts, file transfer or dialog approval are introduced. Application side effects and durable receipt/graph writes remain separate transactions; SDK success is not proof of a business result. Post-dispatch failures are unknown and never replay automatically. Pre-dispatch ineligibility returns not_started/not_dispatched. Pending records after interruption read unknown.

The parent hashes only sanitized non-input action metadata; fill text is deliberately omitted, including from replay identity. Select IDs are opaque; actual option values and references remain transient inside the worker/browser. Safe native option labels appear in the sanitized tree, preserving label order. Browser policy is conservative UI classification, not proof of backend meaning or authorization. Dynamic application behavior after the final policy check cannot be certified from UI evidence.

Local macOS arm64 evidence only. Final full action matrix is Node 24; final navigation/lifecycle and independent extra headed policy probes are Node 26. Controller cancellation sequencing uses synthetic transport; actual during-operation cancellation is exercised by direct browser closure during an SDK action, not a real MCP host's cancellation UI. Full redirects/scope/cancellation/privacy/failure matrix, hard worker loss, packed actions, graph trace/transition integration, backend authorization, real-account/MFA, coding-host and cross-platform support remain outside C04 and must not be inferred. No raw browser artifacts or authentication state retained.

## Exact repaired artifact SHA-256

| File | SHA-256 |
| --- | --- |
| `docs/browser.md` | `fb43193f55d2d112d08c00e131ef3757c7de9ba6ba3400bc4edd4cee8e68cc3e` |
| `package.json` | `748eab170b023fd1952a9647892f7033ca14a29c2683760c18ec994d77ede33d` |
| `scripts/protocol-probe.mjs` | `42512834bc2c281875070b9ab5cf4987927f21acf319c5aa886f5a45cac34c48` |
| `src/browser/actions.ts` | `56cae5e917cb87a9cf682442d3c83f6f00cad4e296f85d4f8616ee29239ebbfc` |
| `src/browser/driver.ts` | `1f0306c20fff0ae4d8c356b94381aba88605bb20d0404da2f3587b7b41f5f460` |
| `src/browser/protocol.ts` | `1ca439f57d2775d482eed90bc62bf71e2bff60bbe467e4d0fa7da0fe5bbf00a6` |
| `src/browser/session.ts` | `8f4d1d610417f8820d2166305f7d05f31251590a305423e07fe82a88ef102878` |
| `src/browser/snapshot.ts` | `ac1607ef954a87b3623adc0c3edda788c6ff98020b1997b9d6ce9a67cf670d2a` |
| `src/browser/worker.ts` | `87c948eefed6e775637419723270fad3d3f047195e9ea5872d27ca600bdbd16c` |
| `src/mcp/index.ts` | `d8b415c3e1a11a77591f7f6ecf2eeb5d153f92b96820b45e4ec03dbdef14da33` |
| `tasks/todo.md` | `cd3a5482ff6ee516bbe4fdf73b701d0350af4f0831b9eb95f477460bcf7f1300` |
| `tests/browser-attempts.test.mjs` | `622c3945aba091d0bc34d7401fc76db27f0bc80569ce730431725f875a248fd9` |
| `tests/browser/actions.mjs` | `5a3c680de69637bc9cc6d4c2f481a87427d9334bad4d36b14c4faa869e14a4ed` |

## Later final verified documents

Independently accepted final README.md and tasks/todo.md after the coordinator recorded C04 verified. The final documents accurately summarize the repaired action evidence, five resolved Required findings and remaining limits; C05 remains a separate checkpoint. All implementation, tests, package, lifecycle guide and protocol harness hashes above were recomputed and match. The later register hash identifies verified-state bytes separately from the implemented-state artifact without rewriting historical evidence. Final C04 artifact verdict remains PASS; shipping and remote CI are separate.

| File | Final SHA-256 |
| --- | --- |
| `README.md` | `8b28db596748c7acd3c94c25591feb4132b8b54078b132c9c5b9262e33e02286` |
| `tasks/todo.md` | `3ab77e36eca8be6dee50bf8fd936735ebcd83717c0a6f4c40d15f440a4d9a6c2` |
