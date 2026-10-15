# Contributing to Waygrain

Start with the [README](README.md), [implementation plan](tasks/plan.md), and [task register](tasks/todo.md). A02 introduces executable package setup and quality commands; product behavior remains assigned to later tasks.

## Select a bounded change

For roadmap work, have the product owner select one task. Confirm that every dependency is verified before starting. Complete that task's implementation, checks, independent verification and review, record the result, then stop. Documentation and repository maintenance requested separately should remain within that request and should not advance unrelated roadmap tasks.

Keep unrelated working-tree changes intact. Commit, push, merge, and publication require user authorization; completing an implementation task does not grant it.

## Specification and decisions

The [v0.2 specification snapshot](docs/specification-v0.2.md) defines the baseline. The [browser amendment](docs/decisions/001-bundled-browser.md) and implementation plan supersede it only for their explicit changes. Preserve the remaining knowledge and evidence contracts.

Record consequential design changes in a numbered ADR under `docs/decisions/`. Explain the requirement, decision, alternatives and consequences. Preserve historical decisions and review receipts; use new evidence for later artifacts rather than rewriting a historical verification claim.

## Verification and review

Use the selected task's acceptance criteria and record actual commands and results. Once the package exists, implementation tasks require focused meaningful tests, typecheck and build; checkpoints and shared-contract changes require broader checks. Before A02, document/source consistency and link/task-graph checks are applicable; unavailable runtime checks must not be reported as passed.

Use Node.js 24 LTS and run:

```sh
npm ci
npm run check
```

The individual typecheck, lint, formatting, test and build commands are documented in the README. Place Node tests in `tests/**/*.test.mjs`. A02's empty harness reports zero tests; later task verification must add meaningful focused assertions. Browser scenarios will use the pinned Playwright Test package at their assigned gates.

The A01 Python checker is historical evidence specific to the original pre-bootstrap artifact, including package absence. Keep it unchanged; do not use it as a gate on later implementation.

An implementation author cannot approve their own artifact. Independent verification and review must identify the same final files or commit. Record hashes, commands, reviewer identity, findings, verdict and remaining limitations in task evidence. Later implementation changes invalidate review of the earlier bytes. Only a task with accepted checks and review becomes `verified`.

## Pull requests

Keep changes focused. Explain the concrete problem, resulting behavior, validation and relevant limitations. Link the task and evidence where applicable. Avoid installation, portability, privacy-enforcement or performance claims before their gates pass. Use synthetic fixtures and sanitized examples; never include real credentials, raw captures, personal data, stores or backups.

Report suspected vulnerabilities through the [security guidance](SECURITY.md).
