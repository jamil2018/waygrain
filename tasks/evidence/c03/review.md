# C03 independent review

Reviewer: `/root/c03_review`. Base: `60fecea9e4dfa5a193209de1cea361729bf85d40`. Root is sole implementation writer. Synthetic fixtures only; no browser artifacts retained.

## Initial artifact — REQUEST CHANGES

Independent `npm run check` PASS on Node 24.20.0 and Node 26.5.0 (60 tests each). Independent headed `npm run test:browser:navigation` PASS on Node 26.5.0. Both checks include typecheck, lint, formatting and build. `git diff --check` PASS. Separate disk Store close/reopen probe confirms pending durable attempts recover as unknown without dispatch.

Required finding: an allowed-origin HTTP 302 redirect reaches a forbidden second loopback origin before final URL policy rejects it. The independent two-server synthetic probe counted **one forbidden request**. Playwright's route handler applies to the first request in redirect chains; `route.continue()` cannot prove redirect origin containment. Enforce redirect policy before following redirects and add regression coverage. This is a C03 blocker; C04 cannot start.

Inspection confirms parent RPC spreads navigation/execution extras, and worker uses BrowserDriver for snapshot/prepare/navigation. Driver retains snapshot-bound worker-only element identity, rechecks projection/generation/URL, rejects replacement and ambiguity, invalidates navigation targets, and exposes no actions. AttemptJournal uses existing private receipts, stores safe template/scope/binding metadata digests with no raw URL or input hashes, reserves before dispatch, returns recovered pending attempts as unknown, and rejects conflicting execution metadata.

Limits: initial about:blank needs human navigation to a mapped route before the first snapshot. Headed harness directly exercises actual Driver and Journal; full post-bootstrap MCP navigation has not been independently driven. Scope aliases remain operator declarations, not backend authorization. C04 actions and C05 full privacy/cancellation/failure checkpoint remain open. No coding-host/cross-platform qualification. Final register/README changes need later separate acceptance.

### Initial SHA-256 identities

| File | SHA-256 |
|---|---|
| `docs/browser.md` | `10346327735ed936047af4a30e263af11355bdafbb35a3ae65207fcf6b13851f` |
| `package.json` | `1a21afde3426c54ee357d1db3c78b87f6326b85db3cedb332d5e05ef30ea1e63` |
| `scripts/protocol-probe.mjs` | `d2fe3e8d74a2d6d23a0cb868229832cba08b7dafef888269250d6b513694770d` |
| `src/browser/protocol.ts` | `a6cad787d95ae0fbd4971867657f08b2eeccef6a43a02f3f2208e80b5f61773d` |
| `src/browser/session.ts` | `70381001a7972dbc2d3e175ff86218188e60b3336370e385dbffe42fd47c56ce` |
| `src/browser/worker.ts` | `67b8ca1716cd356f27322a0a47d763c806bd2a895bae3c7ed3dd9c50a7270646` |
| `src/browser/attempts.ts` | `fe93f1f588fb799ea3d11c594a7d173fef08e6e12f0915aedf41b24f77047ad5` |
| `src/browser/driver.ts` | `be6b61136181885f7066a93726285ae2d8ca25ef5d0da52cc3e7a1a888accb6c` |
| `tests/browser-attempts.test.mjs` | `643cbd1e53f80b4a340d93fffa3dbfce9cb3548d81ec81c085a0a004b7f57ee2` |
| `tests/browser/navigation.mjs` | `ebf4ae80aa36274c0fbdb77c2502abfbd56aa15ca5885d4fe451c0186c4ddc07` |
| `tasks/todo.md` | `e3b110e8f552e87decd22483c5fd4c8a0c060560f57341ba532c77cda8bdaf8b` |

## Repaired final implementation — PASS

The writer repaired redirect containment with a public Playwright Chromium CDP session and Fetch request-stage pauses before every HTTP request/hop is continued. Foreign origin and userinfo are failed before egress; existing routing, blocked service workers/WebSockets and extra-page restrictions remain. No request URL, response body or authentication state is recorded. The required redirect finding is resolved.

Independent renewed `npm run check` PASS on Node 24.20.0 and Node 26.5.0, 60 tests each; `git diff --check` PASS. Independent renewed headed `npm run test:browser:navigation` PASS on both runtimes, including same-origin redirect success and foreign-origin redirect zero requests. Independent Node 26 `npm run test:browser:lifecycle` PASS: normal lifecycle, signals, parent-loss/startup-loss cleanup, synthetic same-origin form login and fresh-context cookie isolation. Original independent cross-origin 302 probe now counts zero forbidden requests. Additional independent synthetic image redirect, page fetch redirect and dedicated-worker fetch redirect likewise count zero forbidden requests. No browser artifacts retained.

Correctness, architecture, security, readability and bounds reviewed against the baseline specification, ADR-001, C03 plan and verified C02. No unresolved Critical or Required findings. Only `wg_browser_navigate` becomes executable; no C04 action capabilities are exposed. The initial artifact finding and hashes above remain historical evidence. This acceptance applies to the repaired hashes below, not future edits. Final verified-register and README metadata are accepted separately after writer updates.

Remaining limits from the initial review remain accurate. In particular full post-bootstrap MCP navigation has not been independently driven; inspection confirms current request forwarding and worker dispatch. CDP containment evidence is bundled Chromium on local macOS, not other engines/platforms/hosts. This C03 acceptance does not replace the C05 browser/privacy checkpoint.

### Repaired SHA-256 identities

| File | SHA-256 |
|---|---|
| `docs/browser.md` | `1259170c94ea5b8282a431ffcbecc9a5bbd62b670780549b87ebdb0c200a3657` |
| `package.json` | `1a21afde3426c54ee357d1db3c78b87f6326b85db3cedb332d5e05ef30ea1e63` |
| `scripts/protocol-probe.mjs` | `d2fe3e8d74a2d6d23a0cb868229832cba08b7dafef888269250d6b513694770d` |
| `src/browser/protocol.ts` | `a6cad787d95ae0fbd4971867657f08b2eeccef6a43a02f3f2208e80b5f61773d` |
| `src/browser/session.ts` | `70381001a7972dbc2d3e175ff86218188e60b3336370e385dbffe42fd47c56ce` |
| `src/browser/worker.ts` | `67b8ca1716cd356f27322a0a47d763c806bd2a895bae3c7ed3dd9c50a7270646` |
| `src/browser/attempts.ts` | `fe93f1f588fb799ea3d11c594a7d173fef08e6e12f0915aedf41b24f77047ad5` |
| `src/browser/driver.ts` | `be6b61136181885f7066a93726285ae2d8ca25ef5d0da52cc3e7a1a888accb6c` |
| `src/browser/engine.ts` | `7d18c9bd656a0c255bd50db8c5bff1c9ccc9c8d24b269aac64b0bd27a9216476` |
| `tests/browser-attempts.test.mjs` | `643cbd1e53f80b4a340d93fffa3dbfce9cb3548d81ec81c085a0a004b7f57ee2` |
| `tests/browser/navigation.mjs` | `baa54b258e33b092d92c1f80b7eb84920d193a638072818ac705b3aa1be98f19` |
| `tasks/todo.md` | `e3b110e8f552e87decd22483c5fd4c8a0c060560f57341ba532c77cda8bdaf8b` |

## Final result-document acceptance — PASS

Final README and task-register edits truthfully record C03 verification, preserve pending C04/later gates, retain initial human-bootstrap and host/platform limits, and point to distinct historical/repaired evidence. All 11 repaired implementation/document/test hashes above remain unchanged; historical review files are unchanged. This later metadata acceptance does not expand C03 behavior or evidence.

| File | SHA-256 |
|---|---|
| `README.md` | `dc374a305376ff11d7afb4921f0717519fcd9eb9d834ca98dfbe2fa22762b2df` |
| `tasks/todo.md` | `ac977a86106215c9b4a9182ed9c2070b983d06534ebd98ce68b49384bbf76128` |
