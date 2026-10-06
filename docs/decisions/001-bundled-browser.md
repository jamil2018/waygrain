# ADR-001: Bundle an isolated browser beside the knowledge core

Status: Accepted design for implementation; runtime feasibility is unverified.
Date: 6 October 2026.
Task: [A01](../../tasks/todo.md). Execution authority: [implementation plan](../../tasks/plan.md).

## Baseline and precedence

The baseline is the [Waygrain Product and Technical Specification v0.2](https://chatgpt.com/space/page_262002eefff08191b791867eb0eb32f2), dated 4 October 2026. A [local source snapshot](../specification-v0.2.md) preserves the content read at Page sequence 2 for independent review.

The user selected the first task in the 6 October implementation plan. This amendment records that plan's agreed choices. For the explicit changes below, the plan and this amendment supersede the baseline; all other knowledge contracts, evidence invariants, privacy requirements, limits, and release gates remain in force. The source Page is unchanged. This document records a design, not functioning software or measured product value.

## Context and decision

The baseline leaves capture and interaction to the host's existing scout. The selected plan instead delivers a standalone local plugin with bundled browser capture and agent-directed interaction, while continuing to accept external structured observations. Use one npm package with internal modules rather than a hosted service or separate model-driven exploration loop.

| Baseline boundary | Explicit amendment |
| --- | --- |
| Browser control and task execution excluded | Add six separately versioned browser tools for authorized, bounded interaction; autonomous exploration and autonomous task execution remain excluded |
| Existing scout owns capture/session | Waygrain owns one headed, ephemeral Chromium session per MCP process, opened only on request; it cannot borrow another MCP server's authenticated session or promise access to an existing tab |
| Server makes no outbound calls; no egress by default | Knowledge core still makes no outbound calls. Explicit browser navigation may contact configured allowed origins; redirects and scope changes require enforcement. Explicit browser installation may download browser binaries. No telemetry or background network activity |
| Host supplies trace IDs and sequence | Bundled browser generates trace IDs and increasing sequence numbers. External ingestion retains host-supplied provenance, subject to the same trace validation |
| Minimal SDK/schema/SQLite dependency budget | Add Playwright as the browser dependency, isolated from graph services; verify exact package availability, licenses, APIs, and packed runtime separately |
| Generic host, scout and pilot choices undecided | Blogen with local disposable data; Codex first and Claude Code second on macOS; synthetic fixtures cover a second application before release |
| Broad implementation work packages | Use the A01–G04 dependency graph and one selected task per run, with independent verification and review |

## Browser contract and authority

Retain all seven knowledge tools unchanged: `wg_status`, `wg_ingest`, `wg_commit`, `wg_query`, `wg_evidence`, `wg_changes`, `wg_plan_refresh`. Queries and refresh plans never invoke the browser or authorize an action.

Add `wg_browser_open`, `wg_browser_snapshot`, `wg_browser_navigate`, `wg_browser_act`, `wg_browser_status`, and `wg_browser_close`. Declare actual browser capabilities and ownership separately; their availability is not permission to perform consequential application actions. The host and user's authorization still govern actions. Public strict schemas and error/attempt contracts are A05 work.

Permit click, noncredential fill, select, check/uncheck, scroll, and a small navigation-key allowlist. Exclude arbitrary JavaScript, caller-provided selectors, shell execution, file transfer, and automatic dialog acceptance. Use manual login in a nonpersistent context; the agent cannot fill credentials. Session, page, and snapshot bind each temporary target. Resolve a strict live locator immediately before dispatch; stale or ambiguous targets require a new snapshot. Stored graph controls and locator hints remain descriptive evidence, never executable handles or permission grants.

The workflow is snapshot → ingest before capture → authorized action → ingest after capture → commit supported trace. Persist a sanitized attempt marker before dispatch. Reusing an execution ID never repeats an action; interrupted attempts may be `unknown`. Application side effects and graph writes are not one transaction. A failed ingestion or commit cannot imply that the application action was rolled back. Trace validation still requires matching app, scope, session, tab and trace, ordered sequences/timestamps, complete endpoints, and a source-state action/control. Partial captures have no state ID and cannot establish transitions.

Keep raw browser observations inside worker memory. Sanitize before worker IPC and MCP output, then validate/redact again at ingestion. Never save raw snapshots, screenshots, traces, authentication state, credentials, cookies, tokens, or input values. Durable attempt markers contain only sanitized metadata, not raw browser traces. Reviewed label allowlists, route mappings, scope aliases, and versioned redaction profiles remain required. Clean temporary browser resources on shutdown and parent-process loss; actual cleanup and privacy behavior require browser gate evidence.

## Architecture, stack, and operations

MCP/CLI → knowledge services → schemas/redaction/normalization → typed graph operations → SQLite. MCP → isolated Playwright worker → ephemeral headed Chromium → sanitized observations → MCP. Knowledge core accepts plain JSON and cannot invoke the browser. Protocol traffic uses stdout; sanitized diagnostics use stderr. No network listener is introduced.

| Area | Planned choice; verification task |
| --- | --- |
| Runtime/build | Node.js 24 LTS, Node 26 smoke testing; strict TypeScript, ESM, compiler output without bundling (A02/A04) |
| MCP/schema | Official `@modelcontextprotocol/server` 2.3.1, stdio; Zod 4 as the schema/type/JSON Schema source (A02/A05) |
| Storage | `better-sqlite3` 13.0.3, parameterized SQL and WAL (A02/A04) |
| Browser | Playwright 1.63.0, headed Chromium, public structured JSON accessibility snapshots rather than a text parser (A02/A04/C02) |
| Quality | npm lockfile, ESLint, Prettier checks, Node test runner, Playwright Test for browser scenarios, GitHub Actions (A02 and relevant gates) |
| License | Apache-2.0 for the package; exact dependency versions and license inventory recorded during A02 |

These are plan selections, not confirmed package/API availability or compatibility. Zod and development tooling require exact patch pins during A02. A04 must prove packed stdio, SQLite and headed Chromium feasibility; A06 blocks downstream work on unresolved feasibility or contract issues. Any unavailable planned dependency needs a recorded resolution rather than a silent substitution.

Explicit initialization configures project/app IDs, scope aliases, allowed origins, route mappings, redaction profiles, and storage limits. Startup selects an absolute configuration path; tool input cannot redirect filesystem writes. Use one knowledge SQLite database per project plus a separate coordination SQLite file for shared lifetime locks and exclusive migration/restore access; coordination stores no product evidence. Backup is consistent, restore verified and offline, JSON export archival, JSON import deferred. Deletion is recoverable; permanent purge requires a distinct preview. Storage caps never silently prune history.

Package root `plugin.json`, `mcp.json`, skills and assets, with a generated Codex compatibility overlay. Ship Understand product, Explore and remember, and Explain changes skills. CLI covers explicit initialization, diagnostics, browser installation, serving and maintenance. Installation never silently edits host settings or repository ignore rules. Plugin packaging and both host integrations remain unverified until their assigned tasks pass.

## Preserved contracts and acceptance gates

Preserve opaque identity, scope isolation, immutable states, typed relations, provenance classes, revision guards, sanitized idempotency, bounded queries/cursors, coverage-aware changes and freshness. Retrieval defaults to 24 hours; a fresh screen does not reverify outgoing transitions or entire flows. UI observations cannot prove backend authorization or business rules.

Preserve specification limits: 1 MiB ingest, 5,000 nodes, depth 64, 4 KiB safe text fields; 100 commit operations; query default 20 records/8 KiB, maximum 50 records, neighbor cap three hops, path depth eight/500 visited nodes; five-minute future timestamp tolerance; proposed default store cap 100 MiB. A05 formalizes these rather than inventing replacements.

Evaluation uses the same browser driver and host/model configuration for browser-only, notes-folder, and Waygrain conditions; count all capture/annotation/query/refresh overhead. Preserve ten tasks and three repetitions per condition across cold, warm and changed-UI cases, 20% warm improvement against the stronger baseline, no correctness regression or extra wrong actions, change detection before stale use, 15% cold overhead or justified repeated-use break-even, three unfamiliar developers within ten minutes, and second-application/second-host checks. Missing token measurements stay unmeasured. All value and portability claims remain provisional.

## Task execution and consequences

The [register](../../tasks/todo.md) imports each task's dependencies, scope, acceptance and verification requirements from the plan. A task record adds commands/results, exact artifact hashes, independent verifier/reviewer identities and verdicts, and limitations. Only `verified` satisfies dependencies. A01 has none; A02 cannot start until A01 is verified and selected by the user.

Use one implementation writer, with specialist independent verification and exact-artifact review; an author cannot approve their own work. Progress `pending → in_progress → implemented → verified`, or record a concrete blocking reason. Review applies only to the identified bytes; later changes require review again. For documentation tasks before A02 provides a package, meaningful checks are document/source consistency, local links, task graph and artifact identity; build/typecheck/runtime tests are unavailable and must be marked not applicable, never passed. Record the result and stop after one task. Commit, push, and publication remain separately authorized. G04 produces a reviewable release candidate only.

Keeping the bring-your-own-observations design alone would minimize browser ownership and dependencies, but would not deliver the selected standalone browser workflow. Bundling improves control over capture format and trace provenance while adding session cleanup, native packaging, origin enforcement, privacy and uncertain-action recovery obligations. Those obligations must pass their assigned gates before claims of supported behavior. Hosted services, embeddings, model calls, synchronization, dashboards, autonomous crawling, and persistent authentication profiles remain outside v1.
