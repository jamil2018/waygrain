# Waygrain documentation

## Read the project

| Document | Purpose |
| --- | --- |
| [Repository README](../README.md) | Product intent, actual implementation status and available commands |
| [Product specification v0.2](specification-v0.2.md) | Local baseline snapshot from 4 October 2026; source Page provenance is recorded in the file |
| [ADR-001: bundled browser](decisions/001-bundled-browser.md) | Explicit amendment for session ownership, bounded browser operations, stack and execution rules |
| [Implementation plan](../tasks/plan.md) | Ordered tasks, dependencies, acceptance criteria and release gates |
| [Task register](../tasks/todo.md) | Current task states, results and evidence links |
| [A01 independent review](../tasks/evidence/a01/review.md) | Exact reviewed hashes, verification commands and limits for A01 |
| [Contributing](../CONTRIBUTING.md) | Scope, verification, independent review and change delivery |
| [Security](../SECURITY.md) | Reporting guidance and intended privacy boundaries |
| [Agent instructions](../AGENTS.md) | Repository workflow for coding agents |

## Authority and history

The baseline specification remains authoritative except where the plan and ADR-001 explicitly amend it. Use the plan for task definitions and the register for actual status. README summaries and this index do not create new capabilities or advance gates.

The A01 register entry and review report describe the workspace at that task's verification time, before Git initialization and package bootstrap. Subsequent repository setup does not turn those historical statements into current environment claims. Later artifact changes need their own verification record.

## Documentation to add with implementation

Package setup and quality commands belong to A02; configuration and storage setup to A03; reproducible packed-runtime evidence to A04; public contracts to A05. Installation and host guides, dependency license inventories, maintenance commands and release evaluation results should describe verified behavior when their respective tasks introduce it. Do not provide guessed CLI usage or claim untested support.
