# Explicit configuration and initialization (A03)

A03 adds setup and configuration loading. SQLite opening, MCP serving and browser installation/launch remain A04 or later work. Configuration is a local version 1 setup format, not the A05 public tool contract.

Build with `npm run build`. Prepare an operator-authored settings JSON file using nonidentifying synthetic/local aliases and reviewed product labels. Do not generate configuration from page text or include credentials, real account identifiers, personal record labels or input values.

```json
{
  "project_alias": "sample",
  "apps": [
    {
      "alias": "fixture",
      "allowed_origins": ["http://localhost:3000"],
      "scopes": [
        {
          "alias": "local-viewer",
          "environment": "local",
          "origin": "http://localhost:3000",
          "role": "viewer",
          "account_scope": "sample",
          "locale": "en-US"
        }
      ],
      "route_mappings": [
        {
          "view_key": "members",
          "origin": "http://localhost:3000",
          "route_template": "/members/:id"
        }
      ],
      "redaction_profiles": [
        {
          "alias": "product-labels",
          "version": 1,
          "allowed_labels": ["Members", "Cancel"],
          "ignored_fields": [],
          "unknown_text": "drop"
        }
      ]
    }
  ],
  "storage_limit_bytes": 104857600
}
```

Run setup explicitly; replace the paths with absolute locations on your machine:

```sh
node dist/cli.js init --config /absolute/private-waygrain/config.json --settings /absolute/settings.json
node dist/cli.js check-config --config /absolute/private-waygrain/config.json
```

The config basename must be `config.json`. Its parent must be a new dedicated directory whose parent already exists. Initialization creates that directory and `storage/` with mode 0700 and `config.json` with mode 0600. It generates an opaque UUID for the project and each app, validates before creating entries, refuses every existing destination directory and never overwrites config. Repeated setup cannot remint identities. A concurrent attempt permits only one initializer. Hand-editing IDs creates a different identity and must not be used to rename an existing project.

Defaults are a 100 MiB storage cap and `unknown` role when omitted. Missing role never means unrestricted scope. A positive cap can be configured without deleting data; actual byte accounting and cap enforcement belong to E04. Redaction profiles require explicit positive versions and `unknown_text: "drop"`; this task defines configuration only, with redaction enforcement assigned to B02. Labels and aliases require operator review: syntactic validation cannot certify that user-authored strings contain no personal data.

All objects reject unknown fields, including caller-supplied IDs in initialization and path overrides. Aliases use lowercase letters, digits, underscores and hyphens (start with a letter, maximum 64 characters). Origins are exact HTTP(S) origins without paths, queries, fragments, credentials or trailing slash. Scope and route origins must be allowlisted. Route templates contain only structural path characters and placeholder segments such as `:id`; queries, fragments, percent escapes and traversal segments are rejected. App, scope, view-key and profile aliases must be unique in their owning configuration. Settings and stored config are bounded to 64 KiB.

`loadConfiguration(absolutePath)` is the startup boundary. It validates the selected config and returns a deeply frozen configuration and fixed derived locations: `storage/knowledge.sqlite` and `storage/coordination.sqlite`. Neither initialization input nor the stored schema has a filesystem redirection field. Future tools must use this selected configuration, rather than accepting a path from tool arguments. No SQLite files are created in A03; the coordination file's locking behavior is B03 work.

Setup/load reject relative paths, tilde expansion, traversal components, symlink ancestors and symlink files. Loading requires owned 0700 directories and an owned 0600 regular config file with one hard link. Existing database/WAL/SHM entries must also be owned 0600 regular files with one hard link. Config is opened with no-follow and nonblocking protection (special files are rejected) and read with a bounded buffer. These checks are tested on this macOS development host; other platforms remain unattested. Ancestor checks are not a sandbox against another process that can replace user-owned parent directories during an operation. Keep the parent under your control. A crash during initialization may leave an incomplete directory; it is refused on retry and must be inspected and removed explicitly by its owner. No crash recovery or adversarial filesystem-race proof is claimed here.

CLI success output contains status and generated IDs; failure stderr contains only a configuration error code, never paths, raw settings or filesystem error details. Current setup codes are `INVALID_CONFIG`, `INVALID_PATH`, `ALREADY_INITIALIZED` and `CONFIG_IO`; these do not define A05 MCP errors. `check-config` reports configuration validity, not runtime availability.

Host settings, ignore files and unrelated repository files are never edited. Keep the dedicated directory outside version control, or explicitly add its location to your own ignore rules. Nothing is stored in a default home folder or cwd. There is no automatic discovery, browser launch, authentication profile or database creation.

`npm test` builds before running the focused synthetic configuration and CLI tests. `npm run check` also runs typecheck, lint and formatting. Historical A01/A02 receipts identify their own artifacts and do not attest these later bytes.
