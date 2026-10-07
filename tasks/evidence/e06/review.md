# E06 independent recovery checkpoint

Reviewer/verifier: `/root/e_checkpoint`, independent of the production/test writer `/root`. Date: 7 October 2026. Applied code-review-and-quality. **PASS** for the implemented Stage E recovery scope; no unresolved Critical or Required findings. Final corrected implementation is identified below, separately from historical E01–E05 receipts. E01–E05 verified dependencies and their process evidence were read before acceptance. Phase F is not started.

## Actual verification

- Independently ran `npm run check` with Node 24.20.0 and 26.5.0 on local macOS arm64: strict typecheck, lint, formatting, build and **96 tests PASS each**, zero failures/skips. Commands used `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH` for Node24. The final feature-variant correction and its regression are included; a descriptive variant change returns explicit incomparable coverage instead of an application outcome.
- Independently authored and ran `node tasks/evidence/e06/integrated.mjs` on both runtimes. Synthetic external complete observations create exact capture/state/control IDs, an observed action/event/transition and flow, and a separate viewer scope. Capture comparison cites structural changes; refresh planning requires original before/action/after evidence without revision mutation. Scope deletion hides selected recall while the other scope remains equal, and undo restores exact search/path data and original transition identity. CLI backup/export record the saved revision, private modes and verified hashes, with archival-only JSON, graph histories and no seeded sensitive markers. CLI preview/purge hides the selected graph, then verified offline restore recovers exact complete query envelopes, IDs, revision and foreign-key integrity. Query/evidence/changes cursors issued at the restored revision are stale after replacement; an additional equal-revision restore invalidates a newly issued query cursor. All original store connections close before fresh CLI path recall and a fresh stdio MCP process exercises **all seven implemented knowledge tools**, including safe replay of ingest/commit receipts. MCP EOF exits cleanly with no diagnostics. No browser session is involved.
- Independently ran `node tasks/evidence/e06/packed.mjs` on both runtimes. Each creates a fresh private npm cache and temporary installed consumer, packs the frozen source, installs dependencies with scripts disabled, explicitly rebuilds the native SQLite binding offline, validates public exports and generated schema equality, byte-compares every installed `dist/` file to the frozen runtime, then runs the entire integrated lifecycle using only installed package runtime and CLI. **Both PASS**. All 84 packed paths are dist/LICENSE/README/package.json; no fixtures, config, private stores, credentials or history artifacts enter the archive. Package remains private at 0.0.0 and this is no plugin installation or publication claim.
- Reviewed changes/refresh/summary/cursor call paths, deletion/purge receipts and retained dependencies, store lifetime coordination and migration transactions, restore standalone hash/schema/FK verification and exclusive atomic replacement, CLI dispatch and archival privacy boundary. Parameterized record scope IDs and fixed internal table names preserve the SQL boundary. Historical E05 actual process tests remain in the final suites: competing writers, bounded busy refusal, real SIGKILL before transaction/migration commit and before/after atomic replacement, unsupported schema preservation and live peer maintenance refusal. Process-crash evidence is accepted within its stated local limits.

`/root/e_review` independently reviewed the checkpoint harness. It found an initial test assertion requesting flow evidence from the capture/annotation tool; that assertion was corrected to both endpoint captures with exact IDs, available status and envelope budget checks before final execution. The initial harness also corrected local request-object aliasing and response field assumptions before acceptance. No production bypass/test hook was introduced. Source review identified the feature-variant semantic issue; the writer's correction and separate regression are now included in this final accepted artifact. A second independent artifact receipt is [artifact-review.md](artifact-review.md).

## Exact final artifact

Manifest algorithm: sort full paths with JavaScript `localeCompare`, join `path + space + SHA256(bytes)` lines with LF and no trailing LF, SHA256 the UTF-8 manifest. This explicitly identifies the ordering, preserving the historical receipts as written.

```
e916d678f1ab52b4da0eb44dc125d9a79aa2164fd9352bdf2ed04329d61eb58d  src/ manifest, 40 files
3ed5b5db44b5001fc9a89b33349bd4a910dcfa16e60fbfd5322bb610847f1c12  dist/ manifest, 81 files
6d5d91892bb189ed407a1aab1b4d2db92f109e02dd186d53ecb171bce39830ff  tests/ manifest, 34 files
5d44bb5625f07456f2d77f6af2244b7904f3b253f005cfdb5c1901c85ef6840a  dist/contracts/schemas.json
abb592a456b3c4081632027f8dcd5e7e3acee5da2f819f77e7885250cccaafe1  docs/changes-and-recovery.md
21c060576ecd10068c22ab015d5a4f68bd475d0986fdb5944cd8d15dff79fc6d  src/core/changes.ts
3529e071d7e6da4b18007c60a3f9d31c2bb96dfbcffe75e4c7e113632e6df345  tests/changes.test.mjs
```

Final harness identities and actual consumer receipts are listed below. Temporary synthetic stores, images, exports, installation directories and caches are removed after execution; their hashes identify observed ephemeral bytes, not retained recovery files.

## Limits

Synthetic local macOS arm64 Node24/26 execution only. E05 barriers attest the observed transaction/migration/rename boundaries, not all interleavings, hardware power loss, disk failure, synced/network storage or other operating systems. No new browser, coding-host, Blogen, plugin or Claude Code qualification occurred: C05/D06 browser and host limitations remain in force. Capture comparison lacks a precise v1 feature-variant subject and therefore returns incomparable coverage. Positional control comparison is descriptive, not identity inference.

Backups/exports are unencrypted, private archival files and retain historical/tombstoned evidence. Purge of selected live database records does not erase separate backups, exports, retained pre-restore forensic sets, journal/receipt safety markers or physical media. JSON import is deferred. Fresh npm cache/network fetching was needed after the first attempted default cache failed with EPERM; no shared cache ownership was altered. Native rebuild emitted an npm allowScripts warning but the installed SQLite operations passed. Browser downloads/installations were unnecessary for this recovery gate. No Phase F gate or public npm/plugin publication is accepted here.

## Final harness and run identities

```
06b7bc4fb1489d062db425cc66072cf67c52b91075ce082c98aa277db01e1a19  tasks/evidence/e06/integrated.mjs
da70259853b193dd06b216e4aac555262eb4364f2f9266ea24d0ad62613a7371  tasks/evidence/e06/packed.mjs
```

Actual final receipts (each packed manifest equals the frozen dist manifest above):

```json
{"run":"integrated24","status":"e06_integrated_passed","node":"v24.20.0","packed":false,"revision":6,"backup_sha256":"fd09ce08857785f04cc536dee16cbd87af2abe50d37fdf0869667df1dd01094b","export_sha256":"810d32530dec3ccb08aa0a9e6b1dac54defa3929b1342456c2ac3a24822b64d9","checks":"graph_changes_refresh_scope_undo_backup_export_privacy_purge_restore_exact_queries_same_revision_cursor_fresh_CLI_MCP_seven_tools"}
{"run":"integrated26","status":"e06_integrated_passed","node":"v26.5.0","packed":false,"revision":6,"backup_sha256":"884d173e9dc6a026aa962aa9dd7fb14e27b6edae63417a963cda070ef6c4abc2","export_sha256":"af07386a87642d3761ce70f5fe2acccea9ddb09d3c36cbe33065dd1f3d781f16","checks":"graph_changes_refresh_scope_undo_backup_export_privacy_purge_restore_exact_queries_same_revision_cursor_fresh_CLI_MCP_seven_tools"}
{"run":"packed24","status":"e06_packed_passed","node":"v24.20.0","tarball_sha256":"8d29a5d93b5a769066bc3f7e654016a4de84ba2f4acd09b93f4be57cc030d61e","packed_files":84,"runtime_manifest_sha256":"3ed5b5db44b5001fc9a89b33349bd4a910dcfa16e60fbfd5322bb610847f1c12","integrated":{"status":"e06_integrated_passed","node":"v24.20.0","packed":true,"revision":6,"backup_sha256":"1a8d44ae0a6830e1334c721adee91b992a611a5efb5ac704522a3148113bac13","export_sha256":"b14f1b96f09638e2516d4e6a7e62fa6120ce4dfab5cdab097f10e4a7540c06ba","checks":"graph_changes_refresh_scope_undo_backup_export_privacy_purge_restore_exact_queries_same_revision_cursor_fresh_CLI_MCP_seven_tools"}}
{"run":"packed26","status":"e06_packed_passed","node":"v26.5.0","tarball_sha256":"d2e7a2bfe8dd5c682c625bd2d160235ca62cbf508f509d5464d625f267a41a33","packed_files":84,"runtime_manifest_sha256":"3ed5b5db44b5001fc9a89b33349bd4a910dcfa16e60fbfd5322bb610847f1c12","integrated":{"status":"e06_integrated_passed","node":"v26.5.0","packed":true,"revision":6,"backup_sha256":"a3cb5573b4b96ced9bc6c7cfe8f5d759484611c4853ebec29e70f7c5a53fc97d","export_sha256":"848590ac8fb70291df39e2071ba0ff504486b459de995e3f789db9a7234d994d","checks":"graph_changes_refresh_scope_undo_backup_export_privacy_purge_restore_exact_queries_same_revision_cursor_fresh_CLI_MCP_seven_tools"}}
```
