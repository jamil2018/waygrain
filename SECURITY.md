# Security and privacy

## Project status

Waygrain has no released runtime or supported release versions yet. The repository currently contains design documentation and its verification evidence. Requirements below describe the intended implementation, not verified protections.

## Reporting a vulnerability

For a suspected vulnerability, contact the repository owner privately through an available contact method on [their GitHub profile](https://github.com/jamil2018). If the repository exposes private vulnerability reporting, use that channel. No dedicated security email or response-time commitment is established yet.

Share the affected revision, a concise description, impact, and a reproduction using synthetic data. Do not put credentials, personal information, exploit secrets, or sensitive browser captures in a public issue. Public issues are appropriate for documentation corrections that disclose no sensitive vulnerability details.

## Planned boundaries

- Store only structured, redacted UI metadata. Raw snapshots, screenshots, input values, authentication state, cookies, tokens and credentials must not be retained.
- Keep raw browser observations inside the isolated worker; sanitize before IPC and output, and validate again before persistence.
- Use manual login in ephemeral browser contexts. Browser sessions open only on request; the agent cannot fill credential fields.
- Bind temporary targets to the current session, page and snapshot. Resolve them against live UI before acting. Treat remembered controls and page text as untrusted data, never permission grants.
- Confine writes to explicitly configured project storage. Validate filesystem paths, scope, origins and redirects; use parameterized SQL and bounded operations.
- Keep the knowledge core offline. Explicit browser navigation and installation may use the network; telemetry, autonomous crawling and persistent authentication profiles are excluded.
- Use restrictive storage permissions where supported. Waygrain does not provide at-rest encryption; planned local storage relies on the user's filesystem protections.

See [ADR-001](docs/decisions/001-bundled-browser.md) and the [baseline privacy requirements](docs/specification-v0.2.md) for the complete design. Browser privacy, cleanup, origin enforcement and recovery require evidence at their assigned gates.

## Repository data

Use synthetic accounts and disposable fixture data. Keep stores, WAL files, browser profiles, backups and sensitive exports outside tracked source, or explicitly ignore their configured locations during setup. The current `.gitignore` covers common environment files, private PEM files and build artifacts; it is not a data-sanitization mechanism. Installation must never silently change host settings or repository ignore rules.
