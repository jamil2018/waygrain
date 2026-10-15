# Version 0.3 · 15 October 2026

## Current direction and decision status

Waygrain is a standalone app descriptor: a product that explains what an application does, what its pages and components mean, and the rules behind its actions. Its knowledge can come from documentation, notes, prior exploration and supplied code evidence. Persistent memory supports the product; it is not the product’s entire purpose.

User-confirmed direction: preserve semantic knowledge, including hidden calculations and business rules; provide living documentation at component/section and whole-page levels; allow contextual agent clarification at both levels; keep Waygrain standalone. Selected capabilities may later be ported to AppraiseJS, without making AppraiseJS a prerequisite.

The user has requested that implementation begin. The defaults below are proposed engineering choices for a bounded first slice, not additional confirmed product decisions. Open-source/self-host-friendly architecture is a proposed default; the exact license and any public release remain undecided. Do not change a license or publish anything as part of this slice.

This revision supersedes v0.2’s memory-plugin-only positioning, MCP-only delivery, prohibition on model-backed clarification, and requirement for another implementation go-ahead. Keep useful existing contracts and evidence safeguards. The original v0.2 remains below for history; its broader graph, CLI and benchmark work is not a prerequisite for this slice. No repository compatibility, performance or market-uniqueness claim is established.

## 1. First working slice

Deliver one runnable local Waygrain experience with a small synthetic application, a documentation editor/import path and a reusable read-only documentation surface. Demonstrate the complete loop: describe a component, explain the whole page, ask a follow-up question, update evidence and retain the result after reload.

The pilot has one calculation page, a result section, an editable input and a Calculate button. Include two role contexts and two application versions as test fixtures. Use synthetic data throughout. Choose the least invasive integration supported by the existing repository: a small embedded adapter or wrapper is sufficient. Do not build a browser extension or universal automatic integration first.

The target user should be able to learn both visible behavior and less visible semantics: purpose, inputs, formulas, conditions, outputs, side effects, permissions, limitations and failure cases. Unknowns are valid outcomes. A button label alone cannot establish its business logic.

## 2. Living documentation experience

Component or section: hovering an annotated target displays its name, purpose, key inputs and action summary. An explicit “Details” action opens a stable panel containing rules, conditions, outcomes, caveats, provenance and freshness. Hover is a convenience, not the only route: keyboard focus and a touch/click affordance must expose the same information. Escape dismisses the panel; opening it must not activate the underlying application action.

Page: a persistent “Page documentation” entry opens a structured overview of the current page’s purpose, sections, inputs, workflows, outputs and known rules. Link each section to its component documentation. Clearly separate documented intent from behavior actually observed or verified.

Clarification: both surfaces provide an “Ask about this” interaction. Component questions start with the selected component and applicable page context; page questions start with the page and its included components. Follow-up questions retain that scope. Show the active page/component, role, application version and cited evidence so users can understand why an answer applies.

Use readable summaries with progressive detail. Provide loading, empty, unavailable-provider, missing-target and stale-evidence states. Preserve host layout and interaction; documentation must not submit forms, change application data or capture unrelated input.

## 3. Knowledge and identity model

Use stable opaque IDs for project, app, page, component, source, claim and documentation revision. Associate targets through explicit stable application keys where possible; accessible names or selectors are fallbacks with visible mapping status, not unique identity. Missing or ambiguous mappings must not attach explanations to the wrong control.

Each claim and query carries applicable environment, application version, role, tenant/account alias and UI state, including relevant tabs, modals or feature variants. Unknown values remain explicit. Unknown role is never a wildcard. Keep page/component identity separate from a particular observed state or version.

A documentation record contains target ID, summary, purpose, inputs, rules, conditions, outputs, side effects, errors, related targets and claim references. Structured fields may be empty; never fabricate content to complete a template.

Every substantive claim records:

- Text or structured rule; target and applicability scope

- Evidence class: documented, observed, code-verified or inferred

- Source references and precise locators, such as document section, observation ID, or supplied file/revision/symbol

- Source/content hash, recorded time and last verification time when known

- Qualitative confidence with a reason, plus unknown, conflict and freshness flags

- Revision and supersedes link, retaining earlier evidence

“Documented” means a source states the rule. “Observed” requires evidence of the actual behavior and is limited to the tested inputs/state. “Code-verified” requires an exact supplied code reference and recorded verification method; merely importing source text is insufficient. “Inferred” is an interpretation with its rationale. These labels are not interchangeable, and none means universal correctness. Test evidence supplements the relevant claim; passing Waygrain’s own tests does not verify a host app’s business rules.

Conflicting claims coexist visibly until resolved. Do not silently select the newest statement as true. Scope may explain an apparent conflict; unresolved same-scope disagreement must appear in both documentation and answers.

## 4. Authoring, ingestion and persistence

Minimum authoring supports creating or editing page/component descriptions and claims, assigning targets and sources, and reviewing unresolved mappings. Import a small documented JSON bundle and plain Markdown/text sources with an explicit preview and validation result. Retain source title, origin/reference, selected content and revision. No crawler, PDF parsing suite or external connector is required.

Prior exploration can enter through existing ingestion/API contracts if present, or a small structured observation import. Accept supplied code evidence without building repository-wide analysis. Treat all imported content as untrusted data, never as executable instructions or permissions.

Persist documentation, sources, mappings, revisions and scoped conversation context locally. Reuse the repository’s suitable store; otherwise prefer a small transactional store such as SQLite. Provide schema versioning, atomic writes and a documented export/import path that preserves IDs and provenance. Validate an import before committing it, reject dangling/cross-project references, and avoid silently overwriting a newer revision. A reload or restart must preserve the authored state.

Do not retain credentials, tokens, arbitrary form values or live customer records. Use sanitized product knowledge and synthetic fixtures. Diagnostic logs must omit source bodies and question content by default.

## 5. Clarification and retrieval contract

Keep retrieval deterministic and separate from answer generation. A request includes question, conversation ID, target/page IDs and trusted application scope. Retrieve only compatible, authorized records first; pass the bounded evidence package to an interchangeable answer-provider interface.

An answer includes text, cited claim/source IDs, applicable scope, evidence classes, unresolved conflicts and missing information. Citations must open the retained source excerpt or precise locator. Validate that returned citation IDs belong to the retrieved evidence. Unsupported assertions must not appear as established facts.

The default development/test adapter is deterministic and exercises the same contract without paid keys or network access. It can answer the fixture’s supported questions and clearly identify unsupported ones. A model adapter is optional, explicitly configured and labeled; the demo must not imply that a deterministic adapter is a general-purpose AI. No hard dependency on one model vendor.

When evidence is missing, respond with what is known and the specific missing evidence. When sources conflict, cite both and explain the disagreement without inventing a reconciliation. Questions that request application actions receive an explanation only. A clarification answer never executes a tool or changes application state.

## 6. Freshness and access boundaries

“Living” initially means editable, versioned, evidence-linked documentation with explicit verification. Support manual verification and invalidation when a supplied source hash, application version or mapped target changes. A change marks affected claims as needing review; it does not automatically discover the correct replacement.

Reading documentation or asking a question never advances verification time. UI structure hashes cannot prove that hidden business rules are unchanged. Show unknown version, stale evidence and unresolved mapping plainly. Automatic crawling and continuous re-verification are later possibilities.

Treat role/state applicability and authorization as different concerns. A caller’s claimed role is not permission. In the local single-user pilot, use trusted configuration for accessible scopes; in an embedded host, require a trusted host-provided access context. Filter unauthorized sources before retrieval, rendering, citations and provider calls. Switching role, project or tenant must clear incompatible cached results and conversation context. Do not reveal restricted content through search snippets, source titles, errors or hidden panel data.

Keep the overlay read-only. Do not add host permissions, collect unrelated DOM data, create telemetry or send sources to a remote provider by default.

## 7. Architecture and phased delivery

First inspect the existing repository, runtime, tests, storage and public interfaces. Record what exists before choosing dependencies. Reuse sound MCP/CLI/ingestion contracts and data structures where useful; extend them additively or provide explicit migrations. Avoid a rewrite merely to match a new diagram.

Separate five small concerns: knowledge schemas/store, scoped retrieval, authoring/import, documentation UI/target adapter, and answer providers. Use existing framework conventions and minimal dependencies. Keep the core portable enough for self-hosting and later AppraiseJS reuse, without adding those delivery projects now.

Phase A: inspect the repository; record implementation choices and baseline tests; add the versioned schema and synthetic Calculate fixture. Exit: persisted fixture queries distinguish claim classes and scopes.

Phase B: implement authoring/import plus hover/focus/touch details and whole-page documentation. Exit: a user can edit one rule, inspect its sources and reload without losing it.

Phase C: add scoped clarification with deterministic adapter, citations, follow-ups, missing-evidence and conflict behavior. Exit: component and page questions pass the acceptance cases below.

Phase D: integrate regression, accessibility, isolation and freshness tests; document local setup and limitations. Exit: one reproducible command starts the demo and another runs the test suite, without external paid credentials. Report actual commands/results and remaining gaps.

## 8. Acceptance criteria

Use an explicitly synthetic rule: total = quantity × unit price, with a 10% discount at quantity ≥ 10 and rounding to two decimals. It is fixture behavior, not a claim about a real application.

1. Hover, keyboard and touch/click reveal equivalent Calculate documentation; opening details never triggers Calculate.

2. Whole-page documentation explains inputs, result section, rule, validation and limitations, with links to component evidence.

3. “Why is the total 90 for 10 items at 10 each?” cites the applicable rule; “What about 9?” retains scope and explains 90 without a discount.

4. An unsupported tax question explicitly identifies missing evidence. Seed conflicting discount rules and require both sources to be surfaced.

5. Visible UI evidence alone cannot produce a code-verified formula. Supplied verification retains the exact revision and method.

6. Role/version/tenant fixtures never contaminate each other’s documentation, answers, citations or caches.

7. Editing/importing, restarting and reloading preserve mappings, sources and revisions. Invalid imports leave no partial writes.

8. Source/version changes mark affected claims for review; a question does not clear the warning or update verification time.

9. Malicious source instructions remain inert; injected citation IDs, unauthorized evidence and unsupported assertions are rejected.

10. Existing applicable tests still pass, and the demo works with the deterministic adapter and no paid API key.

## 9. Non-goals and open decisions

Out of scope: autonomous application actions, exhaustive crawling, universal app discovery, test orchestration, billing, marketing website, hosted accounts, collaboration, vector infrastructure and public launch. Existing graph/path functionality may remain, but completing the old graph roadmap must not delay this slice.

Still open: first real pilot, final delivery packaging, production answer provider, deployment model and license/public release. Resolve only choices blocking this slice after repository inspection. Competitors overlap with parts of the concept; validate usefulness through the working experience rather than claiming uniqueness.
