# Waygrain

Persistent product knowledge for coding agents: remember explored screens, controls, states, and journeys, then retrieve the evidence behind an answer.

Waygrain is being designed as a local plugin with a stdio MCP server, SQLite knowledge store, and an isolated browser for agent-directed capture and interaction. The goal is to help developers explain features, prepare journeys, and identify UI changes across sessions. Its value and compatibility still need to be tested.

## Current status

This repository currently contains the specification, implementation plan, and reviewed architecture documentation. **A01 is verified; the runtime has not been implemented.** There is no npm package, runnable MCP server, CLI, or browser integration yet. A02, package bootstrap and quality commands, is the next eligible task.

The [task register](tasks/todo.md) is the source for current progress. Support for Codex and Claude Code on macOS is planned, not established.

## Get started

Clone the repository and read the plan:

```sh
git clone https://github.com/jamil2018/waygrain.git
cd waygrain
```

With Python 3 installed, run the existing documentation check:

```sh
python3 tasks/evidence/a01/check-documents.py
```

This checks task ordering, dependencies, local document links, and the original A01 scope. It intentionally asserts that package bootstrap has not started; it is historical A01 evidence, not the future project test suite. npm installation, build, lint, typecheck, and runtime commands will be documented when A02 introduces them.

## Planned workflow

1. Query remembered knowledge for the required application, role, and environment.
2. Open an ephemeral browser session on request and obtain a current sanitized snapshot.
3. Ingest a before capture, perform an authorized action, and ingest the after capture.
4. Commit a supported trace and retrieve scoped evidence in later sessions.

Saved controls are descriptions, not executable handles. A fresh screen observation does not verify every transition or flow. Browser actions remain subject to the user's and host's authorization.

## Architecture

The planned package separates schemas, redaction and normalization, graph operations, SQLite persistence, MCP transport, CLI, and the isolated Playwright browser worker. The deterministic knowledge core accepts plain JSON and cannot invoke the browser. External structured ingestion remains supported.

The selected stack is TypeScript/ESM, Node.js 24 with Node 26 smoke testing, the official MCP SDK, Zod, better-sqlite3, and Playwright. Exact dependencies, licenses, public APIs, native packaging, and host compatibility need their assigned feasibility checks. See [ADR-001](docs/decisions/001-bundled-browser.md) for choices, boundaries, and consequences.

## Documentation

- [Documentation index](docs/README.md) — source precedence and reading guide.
- [Implementation plan](tasks/plan.md) — architecture, task dependencies, acceptance criteria, and release gates.
- [Task register](tasks/todo.md) — actual status and evidence.
- [Product specification snapshot](docs/specification-v0.2.md) — v0.2 baseline.
- [Bundled browser amendment](docs/decisions/001-bundled-browser.md) — explicit changes to that baseline.
- [Contributing](CONTRIBUTING.md) — task scope, verification, and review workflow.
- [Security](SECURITY.md) — reporting and planned privacy boundaries.

## License

Licensed under [Apache-2.0](LICENSE). Dependency licenses will be inventoried during package bootstrap.
