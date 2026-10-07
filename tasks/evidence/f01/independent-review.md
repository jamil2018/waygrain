# F01 independent verification and review

Reviewer/verifier: `/root/f_review`, independent of the single implementation writer `/root`. Date: 8 October 2026 (Asia/Dhaka). Verdict: **ACCEPT F01** for the exact 15 source, manifest, skill and setup files in `artifact-sha256.json` (manifest SHA256 `c38a93910c2e1888ac7f2ede58db34d1d0c8fa9cc075f61dbce0b9be7a587479`). This verdict establishes F01 only.

Authority reviewed: `tasks/plan.md`, `tasks/todo.md`, the v0.2 baseline's packaging/privacy/tool boundaries, and ADR-001. E06 is independently verified at `f2db1d9`. The user's selected Phase F work permits dependent tasks, while Claude compatibility remains deferred.

## Independent results

- Node 24.20.0 and Node 26.5.0: `npm run check` PASS, including strict typecheck, lint, formatting, build and 99/99 tests. Commands and counts are in `checks.json`.
- `node tasks/evidence/f01/independent-probes.mjs`, repeated on both runtimes: PASS. From an initialized configuration without graph databases, `doctor` leaves storage empty and the configuration checksum unchanged, reports missing Chromium and untested browser/host behavior, and emits no host paths. Missing, relative and nonexistent environment configuration fail closed. An invalid synthetic configuration emits only `INVALID_CONFIG`, with no settings contents.
- `npm run smoke:packed` on both runtimes with authorized network/browser execution: PASS from separate disposable prefixes/caches/browser installations. Both artifacts contain exactly 94 intended paths, including the four manifests, three skills and setup guide. Explicit SQLite rebuild succeeds. All thirteen public contract exports/generated schemas, explicit and environment-based stdio startup, missing-browser diagnostics, explicit Chromium installation and a headed blank Chromium launch pass. Logs are `packed-node24.log` and `packed-node26.log`.
- Node 24 packed artifact SHA256: `942ee802e7f3430b747e6caab7ea421b227ab38682cfc6d1471c3326293c9b65`. Node 26 packed artifact SHA256: `6d56edf7baaec289e90cd02dc59289381f6f40216da8d7d5226e57534f00e2b5`. These identify the independently generated runtime-specific packages; the source artifact hashes are the common review authority.
- Portable `plugin.json` and `mcp.json` inspected against the actual published [plugin schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json) and [MCP schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json), fetched this run. Allowed keys, required identity/schema markers, extension object shape, stdio type/command/argument shape and absence of unknown keys conform. This is source/schema inspection, not an automated JSON Schema validator claim.

## Review findings and resolution

Initial packed smoke refused an unintended automatically included `docs/README.md`. The writer moved the intended setup guide to `PLUGIN_SETUP.md`, updated package files and the strict packed allowlist, and reran checks. The setup and packed test initially lacked an explicit native SQLite rebuild after `--ignore-scripts`; the writer added the scoped offline rebuild to both. The final packed checks validate both resolutions. No required finding remains.

Correctness: diagnostics report availability separately from runtime or host certification; startup requires explicit absolute operator configuration. Generated overlays preserve portable identity and launch arguments. The three skills correctly distinguish recall, observed exploration and coverage-aware comparison, preserve scope/provenance/partial coverage, use current temporary browser targets, retain uncertain side-effect outcomes, and prohibit raw/auth/input retention.

Readability/architecture: the diagnostic helper is small and separate from command dispatch; overlay generation is deterministic and adds no core knowledge contract or dependency. Security: configuration errors remain sanitized, browser installation remains explicit, no repository/host settings are silently edited, and remembered page content cannot authorize actions. Performance: no background launch, network work or unbounded new processing is added; the SQLite diagnostic is a disposable explicit probe.

## Limitations

Sandbox-only clean installation attempts could not resolve `registry.npmjs.org` (`ENOTFOUND`); network-authorized repetitions passed. Default npm cache writes also require a disposable cache in this sandbox. npm emits an informational native-script review warning; the explicit scoped rebuild and subsequent disk-WAL probes succeed. These observations are environment/installer facts, not waived checks.

No actual Codex plugin discovery/invocation, fresh-chat recall, Blogen journey, Claude Code compatibility, other platform compatibility, efficiency, release readiness or public publication is established here. Those remain their assigned task/gate evidence. Only sanitized synthetic probes and bounded verification summaries are retained.
