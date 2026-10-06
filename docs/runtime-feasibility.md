# Packed runtime feasibility (A04)

A04 exercises the shipped ESM files and npm executable from a clean tarball installation. It adds a feasibility-only MCP endpoint and explicit browser setup/probe commands. These are development checks; the public knowledge/browser contracts arrive in A05 and their implementations in later tasks.

```sh
npm run check
npm run smoke:packed
```

`smoke:packed` builds through `prepack`, checks the package file inventory, installs the tarball into an isolated consumer with install scripts disabled, initializes synthetic configuration through its npm bin, exchanges MCP initialize/ping messages and closes stdin, explicitly downloads Chromium, and opens a blank headed window. It opens a private disposable disk SQLite database, verifies WAL and quick integrity checking, runs a read, closes it, and removes its temporary storage. It verifies that the configured storage directory is empty afterwards. A05 extends the current harness to import all 13 public contract definitions and compare the packaged generated JSON Schema to its source definitions. Historical A04 receipts attest their earlier packed files separately. The script removes its consumer, synthetic settings/configuration, browser installation and npm cache in a `finally` block. A tarball SHA-256 and host/runtime identity are emitted with the fixed result. No raw browser content or authentication is used or retained.

Run with Node 24 LTS on PATH; repeat with Node 26 for smoke coverage. Headed testing needs a usable desktop session and browser-launch permission. It deliberately cannot substitute a headless pass. Downloads need network access. Installation/launch failure is a failed probe, with no compatibility claim. A clean packed install resolves transitive dependencies from npm; the repository's development install remains locked by `package-lock.json`.

For separate explicit setup, build or install the packed package, initialize configuration as described in [configuration.md](configuration.md), then run:

```sh
waygrain serve --config /absolute/private-waygrain/config.json
waygrain install-browser --config /absolute/private-waygrain/config.json
waygrain smoke-runtime --config /absolute/private-waygrain/config.json
```

The source checkout equivalent is `node dist/cli.js` in place of `waygrain`. `serve` validates the explicit config, advertises no product capabilities/tools and creates no database or browser. Stdout is MCP traffic only. EOF closes transport; SIGINT/SIGTERM request server closure. The probe uses MCP protocol version 2025-11-25; this does not attest Codex or Claude Code integration.

`install-browser` invokes the installed Playwright CLI using the current Node executable, without a shell. It installs regular Chromium (`--no-shell`), explicitly and separately from npm installation. Set an absolute `PLAYWRIGHT_BROWSERS_PATH` when you want a dedicated location; otherwise Playwright uses its documented shared cache. No host settings or ignore rules are changed. Browser binaries remain outside the npm tarball. Playwright's installation notices and Chromium third-party notices remain with the downloaded browser; broader redistribution/license review remains a release gate.

`smoke-runtime` validates config, opens only a disposable database beneath its fixed storage directory, then runs a separate child process to launch headed Chromium with a new nonpersistent context and downloads disabled. The page stays at `about:blank`; there are no caller URLs, snapshots, screenshots, inputs, authentication, storage-state exports, or evidence writes. It closes context/browser on success and normal errors. SQLite/launch/install failures use fixed codes (`SQLITE_UNAVAILABLE`, `BROWSER_UNAVAILABLE`, `BROWSER_INSTALL_FAILED`); protocol diagnostics use `MCP_FAILED`. Child stdout/stderr is bounded and never forwarded as raw diagnostics.

The probe has a 30-second child timeout and Playwright has a 15-second launch timeout; browser installation has a three-minute timeout. These bounds do not prove crash, signal, parent-loss, worker-timeout cleanup or hostile filesystem-race safety. Temporary Chromium profiles are necessary during execution; their normal cleanup is delegated to Playwright. C01/C05 must prove browser lifecycle/privacy behavior. B03 must implement real graph schemas, persistence and maintenance coordination. A04 does not populate the knowledge or coordination databases. Browser/native distribution notices, cross-platform support, product privacy and host integration remain unattested by this smoke.

API references: [MCP SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/), [Playwright browser installation](https://playwright.dev/docs/browsers), [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md). The code was checked against the actual pinned package exports and type declarations; older SDK deep-import examples are not used.
