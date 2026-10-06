# Contributing to Waygrain

Start with the [README](README.md), [implementation plan](tasks/plan.md), and [task register](tasks/todo.md). This repository is at the documentation foundation stage; executable setup and quality commands arrive in A02.

## Select a bounded change

For roadmap work, have the product owner select one task. Confirm that every dependency is verified before starting. Complete that task's implementation, checks, independent verification and review, record the result, then stop. Documentation and repository maintenance requested separately should remain within that request and should not advance unrelated roadmap tasks.

Keep unrelated working-tree changes intact. Commit, push, merge, and publication require user authorization; completing an implementation task does not grant it.

## Specification and decisions

The [v0.2 specification snapshot](docs/specification-v0.2.md) defines the baseline. The [browser amendment](docs/decisions/001-bundled-browser.md) and implementation plan supersede it only for their explicit changes. Preserve the remaining knowledge and evidence contracts.

Record consequential design changes in a numbered ADR under `docs/decisions/`. Explain the requirement, decision, alternatives and consequences. Preserve historical decisions and review receipts; use new evidence for later artifacts rather than rewriting a historical verification claim.

## Verification and review

Use the selected task's acceptance criteria and record actual commands and results. Once the package exists, implementation tasks require focused meaningful tests, typecheck and build; checkpoints and shared-contract changes require broader checks. Before A02, document/source consistency and link/task-graph checks are applicable; unavailable runtime checks must not be reported as passed.

The existing A01 check is:

```sh
python3 tasks/evidence/a01/check-documents.py
```

It is specific to the pre-bootstrap A01 artifact, including an assertion that `package.json` is absent. Future package work must introduce its own appropriate checks rather than treating this historical check as a permanent gate.

An implementation author cannot approve their own artifact. Independent verification and review must identify the same final files or commit. Record hashes, commands, reviewer identity, findings, verdict and remaining limitations in task evidence. Later implementation changes invalidate review of the earlier bytes. Only a task with accepted checks and review becomes `verified`.

## Pull requests

Keep changes focused. Explain the concrete problem, resulting behavior, validation and relevant limitations. Link the task and evidence where applicable. Avoid installation, portability, privacy-enforcement or performance claims before their gates pass. Use synthetic fixtures and sanitized examples; never include real credentials, raw captures, personal data, stores or backups.

Report suspected vulnerabilities through the [security guidance](SECURITY.md).
