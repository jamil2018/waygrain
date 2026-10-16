# Descriptor history portability

The local editor's **Export history** button returns a `waygrain-descriptor-history` JSON archive, schema version 1. Copy the JSON into a private file. The archive retains every immutable descriptor bundle revision in order: target/mapping IDs, source excerpts/locators/hashes, claim classes, verification records, documentation and revision/supersedes identities. It excludes configuration, credentials, legacy capture data and host field values. Only synthetic knowledge is supported in this local demo.

Export requires author access to every scope of every retained revision. Partial-scope exports are refused rather than silently dropping history. Archives are bounded to 64 bundle revisions and the existing 1 MiB UTF-8 request limit (including commit receipt); larger exports fail explicitly. Global store revision numbers are local concurrency counters and are reallocated during restore; retained semantic and evidence revision IDs stay identical.

Restore requires an **empty descriptor app with the same project/app identities**. It never overwrites or merges into existing descriptor history, including older history. Keep the original private synthetic `config.json` to retain those identities; it is separate from the archive. Never delete an existing store to make room for an import.

A separate empty workspace can be started from the repository root after `npm run build`:

```sh
mkdir -m 700 /private/tmp/waygrain-descriptor-replay
mkdir -m 700 /private/tmp/waygrain-descriptor-replay/storage
cp .waygrain-descriptor/config.json /private/tmp/waygrain-descriptor-replay/config.json
chmod 600 /private/tmp/waygrain-descriptor-replay/config.json
node dist/descriptor/http/main.js --config /private/tmp/waygrain-descriptor-replay/config.json --empty --port 0 --author-port 0
```

Use a new unused directory. The service prints its allocated reader and authoring addresses. `--empty` suppresses fixture seeding; it does not clear existing data. In that editor, paste the archive into **History archive (JSON)**, choose **Preview history restore**, review the validated revision count, then **Commit history restore**. Editing the JSON invalidates the preview. The commit rechecks scope, expected global revision, receipt digest, all bundle schemas and the entire successor chain; all rows and the new head commit atomically. Any error leaves the destination unchanged. Reload saved documentation after success. Stop with Ctrl-C; restart with the same command and configuration to inspect the same data.

The author-only API is `GET /api/archive`, `POST /api/archive/preview` with `{expected_revision, archive}`, and `POST /api/archive/commit` with the returned `{candidate, digest}`. Mutations require the exact local author Origin and `application/json`. The read-only listener exposes none of these operations. A digest binds reviewed bytes; it does not grant access. Preview does not write. Sources remain subject to normal retrieval and inspector authorization after restoration.

Verification: `npm run build`, `node --test tests/descriptor/restart.test.mjs`, and `node --test tests/descriptor/archive.browser.mjs`. The restart test uses two separate service processes and checks restored descriptions, exact source provenance and re-exported history. Browser testing requires explicitly installed Playwright Chromium; tests save no screenshots, traces or profiles. Public release remains HOLD.
