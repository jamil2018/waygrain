# Packed runtime feasibility (A04)

A04 exercises the shipped ESM files and npm executable from a clean tarball installation. It adds a feasibility-only MCP endpoint and explicit browser setup/probe commands. These are development checks; the public knowledge/browser contracts arrive in A05 and their implementations in later tasks.

```sh
npm run check
npm run smoke:packed
```

The historical A04 packed harness exercised a clean consumer, MCP initialize/ping/EOF, explicit Chromium download and blank headed launch, plus a private disposable disk SQLite WAL/integrity/read probe. A05 added imports of all 13 public contracts and generated JSON Schema equality. A04–A06 expected empty configured storage afterwards; B05 changes that expectation because the endpoint now opens real configured storage. Each historical receipt attests its own artifact, separately from current source. The current harness still removes its scratch consumer, settings/configuration, browser installation and npm cache in a `finally` block, emits archive and host/runtime identities, and retains no raw browser content or authentication. See the B05 section below for its tool/storage checks.

Run with Node 24 LTS on PATH; repeat with Node 26 for smoke coverage. Headed testing needs a usable desktop session and browser-launch permission. It deliberately cannot substitute a headless pass. Downloads need network access. Installation/launch failure is a failed probe, with no compatibility claim. A clean packed install resolves transitive dependencies from npm; the repository's development install remains locked by `package-lock.json`.

For separate explicit setup, build or install the packed package, initialize configuration as described in [configuration.md](configuration.md), then run:

```sh
waygrain serve --config /absolute/private-waygrain/config.json
waygrain install-browser --config /absolute/private-waygrain/config.json
waygrain smoke-runtime --config /absolute/private-waygrain/config.json
```

The source checkout equivalent is `node dist/cli.js` in place of `waygrain`. In the historical A04 artifact, `serve` validated the explicit config, advertised no product capabilities/tools and created no database or browser. The current B05 endpoint opens fixed configured storage and advertises three knowledge tools; see the later-artifact section below. It launches no browser. Stdout is MCP traffic only. EOF closes transport; SIGINT/SIGTERM request server closure. The probe uses MCP protocol version 2025-11-25; this does not attest Codex or Claude Code integration.

`install-browser` invokes the installed Playwright CLI using the current Node executable, without a shell. It installs regular Chromium (`--no-shell`), explicitly and separately from npm installation. Set an absolute `PLAYWRIGHT_BROWSERS_PATH` when you want a dedicated location; otherwise Playwright uses its documented shared cache. No host settings or ignore rules are changed. Browser binaries remain outside the npm tarball. Playwright's installation notices and Chromium third-party notices remain with the downloaded browser; broader redistribution/license review remains a release gate.

`smoke-runtime` validates config, opens only a disposable database beneath its fixed storage directory, then runs a separate child process to launch headed Chromium with a new nonpersistent context and downloads disabled. The page stays at `about:blank`; there are no caller URLs, snapshots, screenshots, inputs, authentication, storage-state exports, or evidence writes. It closes context/browser on success and normal errors. SQLite/launch/install failures use fixed codes (`SQLITE_UNAVAILABLE`, `BROWSER_UNAVAILABLE`, `BROWSER_INSTALL_FAILED`); protocol diagnostics use `MCP_FAILED`. Child stdout/stderr is bounded and never forwarded as raw diagnostics.

The probe has a 30-second child timeout and Playwright has a 15-second launch timeout; browser installation has a three-minute timeout. These bounds do not prove crash, signal, parent-loss, worker-timeout cleanup or hostile filesystem-race safety. Temporary Chromium profiles are necessary during execution; their normal cleanup is delegated to Playwright. C01/C05 must prove browser lifecycle/privacy behavior. B03 must implement real graph schemas, persistence and maintenance coordination. A04 does not populate the knowledge or coordination databases. Browser/native distribution notices, cross-platform support, product privacy and host integration remain unattested by this smoke.

API references: [MCP SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/), [Playwright browser installation](https://playwright.dev/docs/browsers), [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md). The code was checked against the actual pinned package exports and type declarations; older SDK deep-import examples are not used.

## Later B05 artifact

The historical A04–A06 receipts remain unchanged. The current packed/protocol
probe exercises the later B05 endpoint: three implemented tools, truthful
capabilities, sanitized rejection of unknown private argument keys/values,
status, and normal EOF connection cleanup. The configured knowledge and
coordination files remain; only the disposable runtime probe is removed. This
changed probe does not reuse historical archive identities or attest browser
lifecycle, privacy mapping or coding-host support.
