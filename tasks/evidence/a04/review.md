# A04 independent verification and review

Date: 7 October 2026. Independent verifier/reviewer: `/root/a04_review`. Implementation writer: parent coordinator. This reviewer changed no implementation files. This receipt is outside its own hashed artifact set.

## Verdict and reviewed scope

PASS for A04 acceptance; no Critical or Required findings. Reviewed the exact A04 changes against `origin/main` (`ef3e9caf9009a7bd3dc024a08c524d25bcc8698d`), including new files. Read AGENTS.md, plan, task register, v0.2 baseline and ADR-001 amendment. A03 is verified and meets the dependency requirement. Only A04 is implemented; A05 and later tasks remain pending. Authority files, package lock, historical A01/A02/A03 evidence and existing CI workflow are unchanged against that base.

The change satisfies feasibility: explicit configuration-gated stdio handshake without public tools/storage effects, isolated temporary SQLite WAL/quick-check/read, explicit Playwright Chromium installation and blank headed child probe, and clean consumer tarball/bin execution. Reviewed correctness, error paths, bounded subprocesses, readability, module boundaries, fixed diagnostic codes, no shell interpolation, scoped filesystem writes and package inventory. No caller navigation/content or credentials are accepted by the probe. No new dependency is added. The package stays private and no package publication is authorized by this receipt.

## Independent commands and observed results

- `npm run check` on Node 26.5.0: PASS, exit 0; typecheck, lint, formatting, build, all 10 tests.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run check` on Node 24.21.0: PASS, exit 0; same checks and all 10 tests.
- `npm run smoke:packed` on Node 26.5.0, darwin arm64: PASS, exit 0. Clean tarball consumer installed with scripts disabled; npm executable init; MCP 2025-11-25 initialize/ping, unsupported tools/list, clean EOF; disk SQLite WAL/quick-check/read; explicit Chromium download and blank headed launch; configured storage empty afterwards. Tarball SHA-256: `83867814b17ef263f2f700584547aeae19979256cb67a20ff33bde18e35fe4e0`.
- `PATH=/private/tmp/waygrain-node24/node_modules/node/bin:$PATH npm run smoke:packed` on Node 24.21.0, darwin arm64: PASS, exit 0; same assertions. Tarball SHA-256: `820021281bc478e5f7eddfb5b38b14897d743398c87c387d7c1f35398e78a810`.

Both packed runs used approved escalation for the authorized download/headed launch. Both smoke scripts completed their `finally` cleanup of temporary consumer, synthetic settings/configuration, browser installation and npm cache. No browser screenshots, snapshots, real input values, credentials or authentication state were retained.

Independent follow-up packs under both runtimes reproduced those exact archive hashes. Both PATHs used npm 11.17.0. All 17 entries have identical content SHA-256, modes, mtime, uid and gid across the two archives. Different archive bytes therefore do not indicate different shipped source content. The follow-up tarballs/cache were removed after comparison. An initial follow-up pack without a private cache failed with sandbox EPERM against the home npm cache; using a disposable `npm_config_cache` succeeded without changing host cache permissions.

## Limitations

These checks attest this macOS arm64 packed feasibility artifact on the two stated Node versions only. They do not attest Codex/Claude Code integration or another platform. The headed probe uses only about:blank, so this is not live product capture, redaction/privacy, origin enforcement or authentication evidence. Normal context/browser closure is exercised; no independent proof of Chromium temporary-profile deletion, crash/signal/parent-loss/timeout cleanup is claimed. Those lifecycle/privacy properties remain C01/C05. No graph schemas, persistence, migrations, maintenance coordination or public tool contracts are implemented or verified here. Consumer transitive dependencies resolve from npm at install time; development dependencies remain locked. Browser/native distribution and comprehensive license review remain later release work. Remote CI and shipping outcomes are not attested by these local commands.

## Exact implementation artifact SHA-256

The initial register bytes below have A04 `implemented`. The later verified-register artifact requires a separately identified addendum; the implementation files remain frozen.

| File | SHA-256 |
| --- | --- |
| `README.md` | `42b286b69bbc9b42ce1fbd2db5c8625c197fc26d5d663de66983ec0f3d04b3d1` |
| `docs/README.md` | `0a43b4fb55e250c8c423df88a9d9fce00a96f9d34aa908cd1bbad0098a66ed50` |
| `docs/configuration.md` | `91dfb945a84ee92452c4cf700e62cfc13eee504ea136a7996a4736c92ace07b8` |
| `docs/runtime-feasibility.md` | `d17b17ab332251c9a17692907f6efc8162033ed93e5201ab9193daeef743b448` |
| `package.json` | `1c632e2a503a24555e219d2402e1ac87f00ef9e80ec9d2eceb3c0286ac7669fd` |
| `scripts/protocol-probe.mjs` | `6f0d11bc4c13581e5e02c55815c843b9b176a837b3a3624ddb9bbe94c911efb7` |
| `scripts/smoke-packed.mjs` | `9cb806f2872214f2ebb9e04acb9c5831a19d2a14146884fbfc41d5306dc91382` |
| `src/cli.ts` | `538cfda4713173152f6515a717a27c1fdee6f64bdc556534f932bd05a4cabffd` |
| `src/runtime/browser-probe.ts` | `4ef6a75e3258d0f93a1da2fe5ed9545ba360131a8ccae76d4dae384c5a9593aa` |
| `src/runtime/index.ts` | `c47890a3a4b10f23a3241e3bc55f3e7d9112fb6a006378d986040f559d0054f0` |
| `tasks/todo.md` | `62f6a34b2cfb7f31efeb206876d41b969644b52b22a0c4664f90ee1dd8f371d4` |
| `tests/README.md` | `8eed5dea366dce3cb0123a2cdc1a0227d21ae61937a9e41e9c350442df0f16db` |
| `tests/cli.test.mjs` | `1673769531d729e5821cf6efcad4081e9c9f62c44fa62cb027f028499fc8b9cc` |
| `tests/runtime.test.mjs` | `1a11aae598a567fd80825d57add898856fd34b0c2f56426632496d209156747f` |

## Common packed file identities

Each tarball contains only dist output, LICENSE, README.md and package.json; 17 files, no browser binaries, test fixtures, evidence, configuration or browser profiles.

| Packed file | SHA-256 |
| --- | --- |
| `package/LICENSE` | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| `package/dist/runtime/browser-probe.js` | `1dad856ae83f20201c4ec0df706c409898662646aa0f984e1dfa80c7b1ff279b` |
| `package/dist/cli.js` | `d2a75a718d7f8113793114bd23f704fce29547bc6f871e4519c6bb5d751e87fd` |
| `package/dist/config/filesystem.js` | `30a2862c81522925b009dce7769d30b5daa63c212511b97d7b080896ce0c6e2a` |
| `package/dist/config/index.js` | `72374d9323ce45269e215744bfea9529c270c646d623ac86c3f3433fbee63bc6` |
| `package/dist/index.js` | `8d1e2b3ad39d66ffc2ed7b9b3990fce3241950ac194cd337c4b7443afea639bb` |
| `package/dist/runtime/index.js` | `d65d6b0c6349a821ce7b4ae5216ced17af7318d78608be2fa75f792ffee04599` |
| `package/dist/config/schema.js` | `0bb88e3d981d7de8f1e9380db72999350ef916a0f3af0bfc454765b76ab7ed4c` |
| `package/package.json` | `1c632e2a503a24555e219d2402e1ac87f00ef9e80ec9d2eceb3c0286ac7669fd` |
| `package/README.md` | `42b286b69bbc9b42ce1fbd2db5c8625c197fc26d5d663de66983ec0f3d04b3d1` |
| `package/dist/runtime/browser-probe.d.ts` | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |
| `package/dist/cli.d.ts` | `43e818adf60173644896298637f47b01d5819b17eda46eaa32d0c7d64724d012` |
| `package/dist/config/filesystem.d.ts` | `c1474b9c2c54fab9ec92cadb706e06adad6cd4a332f07d2467def7b21a527032` |
| `package/dist/config/index.d.ts` | `1a93e1d28661a0bba02a6f1e5cef37e0d622aba01ab49b350874fe9c8ce36339` |
| `package/dist/index.d.ts` | `a1458aa3b699bb56c2a4342e423da463c67e41a0cc2dc6a2c9794fdc6f63a302` |
| `package/dist/runtime/index.d.ts` | `5287674afa6fc8d4413bb05f63fbe6698a0aaad63f5e5834dbdf5e1407972a15` |
| `package/dist/config/schema.d.ts` | `5558a36d331e8ea2b5c9c8cf8dff3e269f38c53f9341554b1c300c0b3909f859` |

## Final verified-register acceptance addendum

Independently reviewed the later final `tasks/todo.md` bytes after the writer recorded A04 as verified. Final register SHA-256: `5955567892bbc0feb44772c279174548289e74196b96daac51b380464729d6f2`. The initial implemented-register hash above remains historical evidence. All 13 non-register A04 source/documentation/test file hashes remain identical to the accepted implementation set.

PASS; no Critical or Required findings. The final record accurately distinguishes the writer's preliminary checks from independent final 10-test runs on both runtimes, identifies both final tarballs and identical packed contents, retains explicit limitations and leaves A05 and all later tasks pending. Historical records and authority remain unchanged. This addendum accepts the final register and unchanged implementation before shipping; it does not attest later remote CI or merge outcomes.
