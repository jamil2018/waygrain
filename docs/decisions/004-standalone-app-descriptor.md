# ADR-004: Make the standalone app descriptor the active roadmap

Date: 16 October 2026.

Status: Accepted product-direction change for planning under the user's current request. Engineering defaults remain subject to the W00 repository baseline; no implementation verification or release approval is implied.

## Context

The supplied [v0.3 specification](../specification-v0.3.md) replaces memory-plugin-only positioning with living documentation and contextual clarification for component and whole-page semantics. Existing TypeScript/SQLite/MCP/browser work and G05–G08 studies are present, including unrelated dirty changes. Their evidence must survive the pivot.

## Decision

Replace active `tasks/plan.md` and `tasks/todo.md` with W00–W23 for the bounded synthetic local experience. Preserve their exact prior bytes and the old repository navigation documents in `tasks/history/2026-10-16-v0.2/`, with a hash manifest. Keep historical task evidence, v0.2 and ADR-001–003 unchanged.

v0.3 supersedes ADR-001's MCP/plugin-only product and one-task-only workflow wherever those conflict with an explicitly authorized batch. ADR-002 compact retrieval and ADR-003 study records remain historical bounded decisions, not the descriptor implementation or new release gates. Retain useful existing interfaces and evidence safeguards.

Use additive semantic knowledge schemas, trusted scoped retrieval, local authoring/import, a reusable read-only documentation adapter and interchangeable answer providers. Default to the current toolchain and a small local web surface; the deterministic fixture provider requires no paid key. The roadmap does not create production AI grounding or host compatibility claims.

## Alternatives and consequences

- Continuing the old benchmark roadmap would not deliver the requested documentation experience. Remove it from the critical path while retaining all failed/unqualified verdicts.
- A repository rewrite would discard useful storage/contracts and risk unrelated work. Prefer additive modules with explicit migrations and regression checks.
- A browser extension, hosted product or mandatory remote model would add unnecessary integration, access and spending dependencies. Defer them.

An implementation batch can run autonomously with one writer and independent exact-artifact review. Single-task authorization remains bounded. The current request is planning-only; execution selection, commits/pushes/publication and external effects are not implied by the source Page or this ADR. License and public-release decisions remain open; do not modify the existing license or private package settings.
