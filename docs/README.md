# Waygrain documentation

## Read the project

| Document | Purpose |
| --- | --- |
| [Repository README](../README.md) | Product intent, actual implementation status and available commands |
| [Descriptor setup](descriptor-setup.md) | Runnable local demo, complete tests, authoring, questions and recovery |
| [Descriptor history](descriptor-data.md) | Immutable revisions, export and same-identity empty-store restore |
| [Product specification v0.3](specification-v0.3.md) | Active app-descriptor baseline; exact Page provenance in specification-v0.3-source.json |
| [ADR-004: standalone app descriptor](decisions/004-standalone-app-descriptor.md) | Pivot, additive reuse and autonomous batch execution |
| [Product specification v0.2](specification-v0.2.md) | Historical baseline, retained unchanged |
| [ADR-001: bundled browser](decisions/001-bundled-browser.md) | Explicit amendment for session ownership, bounded browser operations, stack and execution rules |
| [Implementation plan](../tasks/plan.md) | Ordered tasks, dependencies, acceptance criteria and release gates |
| [Runtime feasibility](runtime-feasibility.md) | A04 packed installation and explicit stdio/SQLite/headed Chromium probes |
| [Public contracts](contracts.md) | A05 strict versioned schemas, generated JSON Schema, fixtures and enforcement boundaries |
| [Changes and recovery](changes-and-recovery.md) | Comparisons, freshness, declarative plans, backup/restore, scoped deletion and cap semantics |
| [E06 recovery checkpoint](../tasks/evidence/e06/review.md) | Independent integrated and packed recovery acceptance with exact artifacts and limits |
| [Task register](../tasks/todo.md) | Current task states, results and evidence links |
| [A01 independent review](../tasks/evidence/a01/review.md) | Exact reviewed hashes, verification commands and limits for A01 |
| [Contributing](../CONTRIBUTING.md) | Scope, verification, independent review and change delivery |
| [Security](../SECURITY.md) | Reporting guidance and intended privacy boundaries |
| [Agent instructions](../AGENTS.md) | Repository workflow for coding agents |
| [Codex evaluation](evaluation.md) | Reproducible matched constrained-study methodology and limits |
| [Release readiness](release-readiness.md) | Private candidate review and explicit unmet public release requirements |

## Authority and history

Current user instructions and the v0.3 snapshot govern the app-descriptor slice. Use ADR-004 and the plan for engineering choices, and the register for actual task status. README summaries do not create capabilities or advance gates. The register records independently accepted implementation tasks and exact-artifact receipts.

The [prechange archive](../tasks/history/2026-10-16-v0.2/INDEX.md) preserves the old roadmap and register byte-for-byte, including prior uncommitted results. Historical A01–G08 evidence and ADR-001–003 remain in place. Their failed/unqualified release, benefit and portability verdicts are not erased by the new direction, and do not become prerequisites for the bounded local demo.

Existing setup, contracts and runtime documents describe the older implementation. Use the descriptor setup and data-format guides above for the new local demo. Do not infer new UI or provider support from historical checks. The A01 checker applies only to its original pre-bootstrap artifact.
