# Local plugin setup

This is a private macOS pilot package. Packed tests do not establish actual Codex installation, new-chat recall or Claude Code portability; those require F04–F06 evidence. Public publication remains a later gate.

Use Node 24 LTS (26 is the smoke target). From the source checkout, run `npm ci`, `npm run build`, then `npm pack --pack-destination /absolute/existing/output`. Install the tarball explicitly into a dedicated prefix:

```sh
npm install --prefix /absolute/existing/pilot --ignore-scripts /absolute/output/waygrain-0.0.0.tgz
npm rebuild --prefix /absolute/existing/pilot better-sqlite3 --offline
export PATH="/absolute/existing/pilot/node_modules/.bin:$PATH"
export WAYGRAIN_CONFIG="/absolute/existing/pilot/private/config.json"
waygrain init --config "$WAYGRAIN_CONFIG" --settings /absolute/reviewed/settings.json
waygrain doctor --config "$WAYGRAIN_CONFIG"
waygrain install-browser --config "$WAYGRAIN_CONFIG"
waygrain smoke-runtime --config "$WAYGRAIN_CONFIG"
```

The `private` directory must not already exist; its parent must exist. Follow the source checkout's [configuration guide](https://github.com/jamil2018/waygrain/blob/main/docs/configuration.md) for strict settings, nonidentifying scopes, route mappings and reviewed labels. Use synthetic data only. Store evidence outside tracked repositories or add chosen locations to ignore rules yourself. Waygrain never edits ignore rules or host settings.

`doctor` validates private configuration, probes a disposable SQLite WAL database and checks the Chromium executable. It never opens Chromium, creates/migrates the knowledge database or certifies host integration. Missing Chromium yields `needs_browser_install`; `ready_for_runtime_probe` still needs the headed smoke. Errors are sanitized codes with no configuration contents or paths. The explicit native rebuild prepares SQLite for the selected Node runtime; changing Node major versions requires another rebuild. Browser download only occurs through `install-browser`; npm installation and building do not install or launch a browser.

The plugin root is `/absolute/existing/pilot/node_modules/waygrain`. It contains portable `plugin.json`, `mcp.json`, three skills, and generated `.codex-plugin/plugin.json`/`.mcp.json` compatibility files. The MCP command is `waygrain serve-env`. The host must inherit the prefix's bin directory in `PATH` and an absolute `WAYGRAIN_CONFIG`. Missing/relative configuration fails closed. Alternatively configure an absolute executable and `serve --config /absolute/.../config.json` arguments explicitly in host settings. Select one project configuration at startup; tools cannot redirect storage.

For a Codex local marketplace, create an operator-owned root containing `.agents/plugins/marketplace.json`. When that root is the installation prefix, its entry can point at `./node_modules/waygrain`:

```json
{
  "name": "waygrain-pilot",
  "interface": { "displayName": "Waygrain pilot" },
  "plugins": [
    {
      "name": "waygrain",
      "source": { "source": "local", "path": "./node_modules/waygrain" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Developer Tools"
    }
  ]
}
```

Register that marketplace and install/enable it in the supported host, then start a fresh chat. A running desktop app may not inherit new shell variables; set its MCP environment explicitly if needed and restart/reconnect. Codex may cache the plugin separately: retain the installed npm prefix and dependencies on `PATH`. A copied skill directory is not a dependency-installed server. Setup never silently registers a marketplace or enables a plugin. The layout follows [official OpenAI plugin packaging guidance](https://developers.openai.com/plugins/build/plugins).

The F04 macOS pilot verified fresh-session recall in Codex CLI `0.162.0-alpha.2` using explicit, session-scoped stdio registration of the installed server. Set `mcp_servers.waygrain.command` to an absolute Node 24 executable and `mcp_servers.waygrain.args` to the installed `dist/cli.js`, `serve`, `--config`, and the absolute project configuration path. For recall, `mcp_servers.waygrain.enabled_tools` can restrict the host to `wg_status`, `wg_query`, `wg_evidence`, `wg_changes`, `wg_plan_refresh`, and `wg_browser_status`. These overrides select the same public server and schemas; they do not require a browser session. The pilot used the packaged Understand product skill and retrieved scoped evidence after browser closure.

Three earlier isolated CLI probes, including an installed/enabled plugin and explicit plugin-feature enablement, exposed no native Waygrain MCP tools. Automatic plugin MCP discovery and desktop installation remain unqualified; the broad startup diagnostics do not establish their cause. See the [F04 host evidence](https://github.com/jamil2018/waygrain/tree/main/tasks/evidence/f04) for the exact tested setup and limits. Cleanup removed the newly installed pilot selector and its cache. Existing host authentication was used; credentials were not copied or entered by the pilot.

For troubleshooting, confirm `waygrain` resolves to this artifact, `WAYGRAIN_CONFIG` is absolute, `doctor` passes and the host advertises seven knowledge and six browser tools. Keep protocol stdout separate from sanitized stderr. Never retain credentials, environment dumps, raw host transcripts or browser observations. A stdio probe proves transport behavior only; record actual host discovery/invocation separately. The current pilot is Codex-only. Claude Code and Cursor compatibility are deferred under F05; neither has been qualified.

The skills support scoped recall, authorized snapshot → ingest → action → ingest → commit exploration, and evidence-backed comparisons. Recall works after browser closure. Historical controls are descriptions, never executable handles. Installing a plugin grants no application action permissions.
