# Waygrain v0.3 task register

Updated: 16 October 2026. Scope: the standalone app-descriptor local slice in [the plan](plan.md) and [specification v0.3](../docs/specification-v0.3.md).

**Current execution:** W00–W01 independently verified; W00–W23 authorized for autonomous dependency-order execution, independent review and per-task commit/push. **Next eligible task:** W02. **Public release:** HOLD. Old task IDs/results are preserved in [history](history/2026-10-16-v0.2/INDEX.md), not reset or credited to this roadmap.

## Agent operating contract

- The user selects a task, phase or batch. Execute only that scope. For an authorized batch, continue after accepted tasks without routine confirmation; a single-task request still stops after that task. This planning turn selects no implementation.
- States: `pending → in_progress → implemented → verified`; `blocked` requires a concrete reason and resume condition. Only independently verified dependencies satisfy the graph. Review failure returns work to `in_progress`.
- One implementation writer; a separate reviewer performs independent verification and exact-artifact review. Split larger tasks into bounded suffixed tasks if needed, retaining parent acceptance. Each task should fit one focused session; listed file areas are ownership hints, not a license for unrelated changes.
- Use the plan's execution/evidence rules. All implementation tasks require focused meaningful checks, typecheck and build; shared contracts/storage/build changes require applicable full regressions. Checkpoints add integrated independent replay, not a new user approval gate.
- Record commands only after running them. Proposed commands are introduced by W06/W22. Do not rerun the pre-bootstrap A01 checker against this package or expensive historical provider cohorts as routine gates.
- No commit/push/merge/publication, license change, paid provider or real-data integration without scope-specific authorization. Preserve unrelated dirty work and historical evidence.

## Execution queue

| ID | Phase | Task | Depends on | Status |
| --- | --- | --- | --- | --- |
| W00 | A | Baseline and freeze implementation choices | None | verified |
| W01 | A | Semantic identity and claim contracts | W00 | verified |
| W02 | A | Transactional descriptor persistence | W01 | pending |
| W03 | A | Trusted scoped retrieval | W02 | pending |
| W04 | A | Synthetic Calculate fixture and evidence | W03 | pending |
| W05 | A | Phase A independent checkpoint | W04 | pending |
| W06 | B | Local demo service and safe transport | W05 | pending |
| W07 | B | Page and component authoring editor | W06 | pending |
| W08 | B | Validated source and bundle import | W07 | pending |
| W09 | B | Reusable target adapter | W06 | pending |
| W10 | B | Component summary and details panel | W09, W07 | pending |
| W11 | B | Whole-page documentation and source inspection | W10 | pending |
| W12 | B | Export, import and restart durability | W08, W11 | pending |
| W13 | B | Freshness and explicit verification | W12 | pending |
| W14 | B | Phase B independent checkpoint | W13 | pending |
| W15 | C | Bounded evidence package and answer validation | W14 | pending |
| W16 | C | Deterministic clarification provider | W15 | pending |
| W17 | C | Scoped persistent conversations | W16 | pending |
| W18 | C | Ask about this on both surfaces | W17 | pending |
| W19 | C | Phase C independent checkpoint | W18 | pending |
| W20 | D | Integrated isolation and adversarial acceptance | W19 | pending |
| W21 | D | Integrated accessibility, freshness and recovery | W20 | pending |
| W22 | D | Reproducible demo commands and user documentation | W21 | pending |
| W23 | D | Final independent local-demo acceptance | W22 | pending |

## Start or resume an autonomous batch

Copy this when ready to execute the local slice:

> Implement W00–W23 from tasks/todo.md in dependency order. Continue autonomously within this batch, with one implementation writer and separate independent verification/review of each exact artifact. Resolve routine engineering choices within the plan, preserve unrelated dirty work and historical evidence, and update task receipts and the register as you go. Use synthetic fixtures and the offline deterministic provider. Stop only for a genuine blocker or at W23; do not commit, push, merge, publish, change licensing, use paid providers or integrate real customer data. Save a precise resumable handoff if interrupted.

For a smaller batch substitute a phase/range; do not skip its dependencies. On resumption, authorization must be present in the conversation or a recorded user instruction with its scope; the template above alone is not authorization.

## Definition of done and task receipt

A checked queue item means `verified`, never merely implemented. Append one result per task here and place detailed evidence under `tasks/evidence/wNN/`. Include:

- User-selected scope and dependency evidence/identities.
- Implementation summary and changed-file manifest hash; actual commands, exit codes, counts and environment.
- Independent reviewer identity, exact reviewed manifest, verdict and findings/fixes.
- Acceptance-case coverage, remaining limitations, baseline regressions and next eligible task within the authorized batch.
- If blocked/interrupted: last durable state, pending review, exact next action and resume condition. Never discard failed attempts or overwrite review evidence for a different artifact.

## Task definitions

### W00 — Baseline and freeze implementation choices

**Status:** verified. **Dependencies:** None. **Phase:** A. **Size:** M.

Inspect the working tree, actual store migrations, public exports, CLI/MCP and browser test commands; record current hashes and a keep/extend/bridge map. Freeze the five module boundaries, API access-context contract, limits, frontend/build choice and migration approach without changing product behavior.

**Likely areas:** `src/store, src/contracts, package.json; docs/descriptor-architecture.md`.

**Acceptance:**

- [x] Record actual Node/npm versions and baseline build/typecheck/lint/format/test results; classify existing failures without weakening tests.
- [x] Document additive migration/compatibility strategy, trusted scope origin, read-only versus authoring boundary, safe rendering and proposed command ownership.
- [x] Identify unrelated dirty files and historical fixtures; no reset, implicit migration, dependency upgrade or implementation claim.

**Verification:** Run existing npm run check and npm run build with recorded environment; inspect existing browser commands without blindly launching all studies. Independent reviewer checks choices against source and v0.3. Block only on failures relevant to safe implementation; record unrelated baseline regressions.

Acceptance: [W00 exact artifact and independent review](evidence/w00/review.json).

### W01 — Semantic identity and claim contracts

**Status:** verified. **Dependencies:** W00. **Phase:** A. **Size:** M.

Define versioned descriptor schemas and the shared read/write envelopes before persistence or UI consumers.

**Likely areas:** `src/descriptor/contracts; tests/descriptor/contracts.test.mjs`.

**Acceptance:**

- [x] Stable opaque IDs distinguish project/app/page/component/source/claim/revision from UI state/version; scope includes environment, version, role, tenant and UI variants with explicit unknowns.
- [x] Documentation and claims cover every v0.3 field; four evidence classes survive serialization; code verification requires exact revision/locator and method.
- [x] Reject malformed references/envelopes, invalid confidence/freshness and unsupported schema versions; limits and errors are explicit.

**Verification:** Focused schema round-trip and negative tests, generated schema/export checks if exposed, typecheck/build and applicable contract regression suite.

Acceptance: [W01 exact artifact and independent review](evidence/w01/review.json).

### W02 — Transactional descriptor persistence

**Status:** pending. **Dependencies:** W01. **Phase:** A. **Size:** M.

Add versioned storage for semantic targets, sources, claims, mappings and documentation revisions, reusing suitable existing transaction/locking primitives.

**Likely areas:** `src/descriptor/store; src/store migration wiring; tests/descriptor/store.test.mjs`.

**Acceptance:**

- [ ] Fresh and upgraded synthetic stores retain stable IDs/history and pass integrity checks; old data remains readable under its supported interface.
- [ ] Expected-revision writes are atomic; concurrent/stale writes fail explicitly; supersession never deletes earlier evidence.
- [ ] Failed/interrupted migration or write leaves a consistent store; unsupported future schemas fail closed and private-file behavior is retained.

**Verification:** Temporary SQLite migration/restart/rollback/concurrent-write tests, legacy store tests, npm run check and build. Never migrate a real user store for qualification.

### W03 — Trusted scoped retrieval

**Status:** pending. **Dependencies:** W02. **Phase:** A. **Size:** M.

Implement deterministic page/component/source retrieval that separates access authorization from claim applicability.

**Likely areas:** `src/descriptor/retrieval; tests/descriptor/retrieval.test.mjs`.

**Acceptance:**

- [ ] Trusted configured access is enforced before titles, snippets, source locators or claim content leave the service; forged caller roles cannot expand access.
- [ ] Unknown role is not wildcard; all scope dimensions and targets are matched; bounded ordering/truncation and missing-evidence results are explicit.
- [ ] Results retain evidence classes, unknowns, conflicts, revision and freshness without upgrading imported observations.

**Verification:** Table-driven allow/deny tests across project/app/role/tenant/environment/version/UI state, unknowns and bounds; sentinel restricted data must be absent from every response field; typecheck/build.

### W04 — Synthetic Calculate fixture and evidence

**Status:** pending. **Dependencies:** W03. **Phase:** A. **Size:** M.

Build the small calculation page, result section, editable quantity and Calculate button with explicit target keys and matching knowledge fixtures.

**Likely areas:** `assets/descriptor-demo; tests/descriptor/fixture.test.mjs`.

**Acceptance:**

- [ ] Fixture computes quantity × unit price, discounts 10% at quantity ≥ 10 and rounds to two decimals; validation/limits are documented and tested.
- [ ] Seed two roles and two versions plus isolation sentinels for tenant/project/state; fixtures include documented, observed, inferred and supplied code verification with exact revision/method.
- [ ] Seed unsupported tax, conflicting discount sources, unknown scope, missing/duplicate mappings and changed source/version cases; defaults remain the specified rule and fixtures never claim real-app semantics.

**Verification:** Persisted fixture queries assert scope and classes; calculation boundary/decimal/invalid-input tests; exact synthetic source identity checks; typecheck/build. Input values remain only transient demo state.

### W05 — Phase A independent checkpoint

**Status:** pending. **Dependencies:** W04. **Phase:** A. **Size:** S.

Verify the foundation as one integrated artifact before web authoring consumes it.

**Likely areas:** `tasks/evidence/w05`.

**Acceptance:**

- [ ] A fresh synthetic store returns the seeded page/component rules with distinct evidence classes and scopes after restart.
- [ ] Migration, failed writes, access-denial and legacy API tests have actual passing results or an explicit blocking relevant failure.
- [ ] Independent acceptance binds W00–W04 artifacts; remaining host/platform limitations are stated.

**Verification:** Independent npm run check/build and focused persisted-fixture, migration and isolation probes; no paid providers or historical full model cohorts.

### W06 — Local demo service and safe transport

**Status:** pending. **Dependencies:** W05. **Phase:** B. **Size:** M.

Serve the fixture and documentation API locally with separate authoring and read-only capabilities; introduce npm run demo:descriptor.

**Likely areas:** `src/descriptor/http; src/cli integration; package.json; tests/descriptor/http.test.mjs`.

**Acceptance:**

- [ ] Loopback-only default, validated Host/Origin, bounded payloads and controlled filesystem roots prevent cross-origin mutation or arbitrary file access.
- [ ] Server-selected trusted scope cannot be escalated by query/body fields; the read-only adapter client cannot call authoring operations.
- [ ] One command starts the fixture and local app shell, reports a usable address and shuts down cleanly; no paid keys, silent browser download or raw-content logs.

**Verification:** HTTP negative tests for forged origins/roles/paths/oversized input, start/stop smoke and npm run check/build. Browser compatibility remains for later UI tasks.

### W07 — Page and component authoring editor

**Status:** pending. **Dependencies:** W06. **Phase:** B. **Size:** M.

Deliver a complete create/edit/save/reload path for structured documentation and claims with explicit source and target assignment.

**Likely areas:** `src/descriptor/authoring; src/descriptor/ui/editor; tests/descriptor/authoring.test.mjs`.

**Acceptance:**

- [ ] Editor supports page/component fields, claims, sources, applicability and mapping review; empty fields stay empty instead of invented text.
- [ ] Save creates revisions with optimistic conflict feedback; previewed validation errors do not mutate storage and unsafe markup remains inert.
- [ ] Reload displays the saved content, source provenance and unresolved/conflicting/missing mapping states.

**Verification:** Service tests and real-browser edit/save/reload, keyboard and conflict tests; source-body/question-free diagnostics; typecheck/build.

### W08 — Validated source and bundle import

**Status:** pending. **Dependencies:** W07. **Phase:** B. **Size:** M.

Add explicit preview, validation result and atomic confirmation for documented JSON bundles and selected Markdown/plain-text sources.

**Likely areas:** `src/descriptor/authoring/import; editor import view; tests/descriptor/import.test.mjs`.

**Acceptance:**

- [ ] Preview retains title, origin/reference, selected content and revision; users assign targets/sources; structured observations and supplied code references import without auto-verification.
- [ ] Reject dangling/cross-project links, duplicate IDs, stale overwrites, invalid schema and oversized payloads before any write; errors do not leak content.
- [ ] Successful import commits once atomically; imported instructions/scripts stay inert; source class and exact provenance survive a reload.

**Verification:** Valid and invalid import round-trips, transaction failure and stale-preview tests, browser preview/cancel/commit checks; full applicable store/contract regressions.

### W09 — Reusable target adapter

**Status:** pending. **Dependencies:** W06. **Phase:** B. **Size:** M.

Attach a read-only documentation surface through explicit stable keys and trusted host scope, independently of the synthetic app internals.

**Likely areas:** `src/descriptor/ui/adapter; tests/descriptor/adapter browser tests`.

**Acceptance:**

- [ ] Register/update/unmount lifecycle handles duplicate, missing and ambiguous mappings visibly without binding to the wrong control.
- [ ] Stable IDs survive label/layout/version changes; accessible-name/selector fallbacks, if supported, remain visibly provisional and fail on ambiguity.
- [ ] Only registered target metadata is read; no form values, unrelated DOM data, host writes or new host permissions; lifecycle cleanup removes handlers.

**Verification:** Real-browser duplicate-key, remount, label-change and input-sentinel tests with host-action counters; inspect adapter API separation; typecheck/build.

### W10 — Component summary and details panel

**Status:** pending. **Dependencies:** W09, W07. **Phase:** B. **Size:** M.

Display concise hover/focus summaries and an explicit stable Details panel for components and sections.

**Likely areas:** `src/descriptor/ui/component-panel; tests/descriptor/component browser tests`.

**Acceptance:**

- [ ] Hover, keyboard and touch/click expose equivalent name/purpose/input/action content, with progressive rules/conditions/outcomes/caveats/provenance/freshness.
- [ ] Details never activates Calculate or submits a form; Escape closes, focus returns appropriately, and layout/input behavior remains usable.
- [ ] Loading/empty/missing-target/stale/error states are accessible; unknowns/conflicts remain visible and unauthorized material never enters hidden UI data.

**Verification:** Real-browser pointer, keyboard, touch emulation, event-count and restricted-data assertions; responsive checks without retained screenshots/traces; typecheck/build.

### W11 — Whole-page documentation and source inspection

**Status:** pending. **Dependencies:** W10. **Phase:** B. **Size:** M.

Add the persistent Page documentation entry, component links and evidence inspector shared by both surfaces.

**Likely areas:** `src/descriptor/ui/page-panel and source-inspector; tests/descriptor/page browser tests`.

**Acceptance:**

- [ ] Page overview covers purpose/sections/inputs/workflows/outputs/rules/validation/limitations and links to component documentation.
- [ ] Documented intent is visibly distinct from observed/code-verified/inferred evidence; conflicts/unknowns are not collapsed into one asserted truth.
- [ ] Citations open retained excerpts or exact locators after authorization; missing/restricted references expose no source titles or hidden content.

**Verification:** Browser page-to-component-to-source navigation and unauthorized citation tests, keyboard dismiss/focus checks and typecheck/build.

### W12 — Export, import and restart durability

**Status:** pending. **Dependencies:** W08, W11. **Phase:** B. **Size:** M.

Finish the portable documented local data round-trip using the validated import boundary.

**Likely areas:** `src/descriptor/authoring/export; tests/descriptor/restart.test.mjs; docs/descriptor-data.md`.

**Acceptance:**

- [ ] Export includes schema version and all authorized mappings/sources/claims/revisions with IDs/provenance; no credentials, arbitrary form data or unrelated scopes.
- [ ] Export into a clean synthetic store reproduces documentation and history; conflicts/newer revisions cannot be silently overwritten.
- [ ] Stop/start/reload preserves authored state, mapping status and source inspection; failure leaves no partial restoration.

**Verification:** Process restart and clean-store round-trip tests, invalid export/import fixture checks and legacy backup/restore regression; document actual format and commands.

### W13 — Freshness and explicit verification

**Status:** pending. **Dependencies:** W12. **Phase:** B. **Size:** M.

Track affected claim invalidation and provide explicit scoped manual verification with retained history.

**Likely areas:** `src/descriptor/freshness; editor verification UI; tests/descriptor/freshness.test.mjs`.

**Acceptance:**

- [ ] Source-hash, application-version and mapped-target changes mark affected claims for review; unknown versions/mappings stay visible.
- [ ] Reading/documentation questions do not advance verification time; UI structure similarity cannot clear hidden-rule staleness.
- [ ] Manual verification records method/time/scope and new revision without deleting prior evidence or arbitrarily resolving conflicts.

**Verification:** Controlled-clock source/version/mapping change tests, unchanged read timestamps, unaffected-claim checks and browser warning/verification tests; typecheck/build.

### W14 — Phase B independent checkpoint

**Status:** pending. **Dependencies:** W13. **Phase:** B. **Size:** S.

Verify a user can author one rule, inspect it at component and page levels, and retain it across restart.

**Likely areas:** `tasks/evidence/w14`.

**Acceptance:**

- [ ] Independent real-browser replay covers editor/import, hover/focus/touch Details, whole-page evidence and export/restart.
- [ ] Host action counts and unrelated field sentinels prove no accidental activation/capture in covered cases; access and stale states are checked.
- [ ] Accepted exact artifacts and actual accessibility/host limitations are recorded; no claim of universal integration.

**Verification:** Independent npm run check/build plus phase B browser/store/isolation suite and a fresh startup replay.

### W15 — Bounded evidence package and answer validation

**Status:** pending. **Dependencies:** W14. **Phase:** C. **Size:** M.

Define vendor-neutral clarification request/result and prepare an authorized bounded evidence package without invoking a model.

**Likely areas:** `src/descriptor/providers/contracts and evidence; tests/descriptor/answer-contract.test.mjs`.

**Acceptance:**

- [ ] Request binds question/conversation/target/page and trusted scope; component context includes applicable page facts and page context includes permitted components.
- [ ] Answer validation enforces scope, retrieved citation membership, evidence classes, conflict/missing fields and bounded content; restricted source metadata cannot reach a provider.
- [ ] Provider gets no application action/tool capability; malicious source instructions remain data and unsupported/forged outputs fail visibly.

**Verification:** Adversarial fake-provider tests for injected IDs, unauthorized records, class upgrades and unsupported assertions plus bounded selection and typecheck/build.

### W16 — Deterministic clarification provider

**Status:** pending. **Dependencies:** W15. **Phase:** C. **Size:** M.

Implement the honest offline fixture provider using only evidence-backed supported templates and the same interface as optional future models.

**Likely areas:** `src/descriptor/providers/deterministic; tests/descriptor/provider.test.mjs`.

**Acceptance:**

- [ ] The 10 × 10 question cites the applicable discount rule and explains 90; the nine-item case explains 90 without discount using the applicable evidence.
- [ ] Tax returns specific missing evidence; conflicting discounts surface both sources without invented reconciliation; unsupported questions return an explicit limitation.
- [ ] UI/result metadata labels deterministic demo behavior; provider is offline, no-key and cannot execute actions or manufacture established facts.

**Verification:** Frozen supported/unsupported/conflict question matrix, altered/missing evidence tests and no-network/no-action assertions; typecheck/build.

### W17 — Scoped persistent conversations

**Status:** pending. **Dependencies:** W16. **Phase:** C. **Size:** M.

Persist bounded sanitized product clarification context and preserve follow-up scope across reload without leaking across contexts.

**Likely areas:** `src/descriptor/conversation; tests/descriptor/conversation.test.mjs`.

**Acceptance:**

- [ ] What about 9? resolves within the established target/page/role/version scope, with retained cited provenance and no promotion of old answers into evidence.
- [ ] Project/app/role/tenant/version/state or target changes reauthorize and clear incompatible caches/context; cancel or discard stale in-flight responses.
- [ ] Restart restores only authorized compatible history; source revisions trigger retrieval/freshness reevaluation; diagnostic logs omit question/source bodies.

**Verification:** Restart, cross-scope forged-conversation IDs, out-of-order response and source-change tests, storage/log privacy sentinel checks; full relevant store/contract suite.

### W18 — Ask about this on both surfaces

**Status:** pending. **Dependencies:** W17. **Phase:** C. **Size:** M.

Wire component and page clarification, follow-ups and clickable citations into the documentation panels.

**Likely areas:** `src/descriptor/ui/clarification; tests/descriptor/clarification browser tests`.

**Acceptance:**

- [ ] Both surfaces show active target/page, role/version, provider label and cited evidence; follow-ups retain their intended scope.
- [ ] Loading, missing evidence, conflict, stale evidence and unavailable/failed provider states are distinct, readable and keyboard accessible.
- [ ] Asking never invokes Calculate, changes host data or clears verification warnings; switching scope mid-request cannot render the old response.

**Verification:** Real-browser acceptance questions on both surfaces, source opening, unavailable-provider injection, input/host event counters and scope-switch race tests; typecheck/build.

### W19 — Phase C independent checkpoint

**Status:** pending. **Dependencies:** W18. **Phase:** C. **Size:** S.

Independently verify contextual clarification and persisted follow-up behavior against the frozen fixture evidence.

**Likely areas:** `tasks/evidence/w19`.

**Acceptance:**

- [ ] Both component/page conversations pass supported calculation, nine-item follow-up, tax unknown and conflicting-source cases with correct citations.
- [ ] Adversarial citation/source/scope attempts and action requests do not leak evidence, fabricate established rules or act on the app.
- [ ] Exact implementation and validation evidence accepted; deterministic demo is not described as production general-purpose AI.

**Verification:** Independent provider/contract/conversation/browser suite and npm run check/build with external providers disabled.

### W20 — Integrated isolation and adversarial acceptance

**Status:** pending. **Dependencies:** W19. **Phase:** D. **Size:** M.

Close cross-layer security/privacy gaps using hostile imports, provider outputs and scope changes in the actual service and UI.

**Likely areas:** `tests/descriptor/isolation; tasks/evidence/w20`.

**Acceptance:**

- [ ] Exercise project/app/environment/role/tenant/version/state isolation through API, UI, source inspector, conversation storage, cache and provider boundary, including unknowns.
- [ ] Injected markup/instructions/citations and fabricated supported assertions are rejected or presented as unsupported; no source/question bodies in diagnostics.
- [ ] Validate origin/access boundaries, import atomicity and no-action/no-unrelated-input behavior through integrated negative cases; fix only discovered bounded defects.

**Verification:** Fresh synthetic sentinel corpus, real service/browser adversarial suite, storage/log inspection with sanitized findings, full npm run check/build.

### W21 — Integrated accessibility, freshness and recovery

**Status:** pending. **Dependencies:** W20. **Phase:** D. **Size:** M.

Exercise the ten v0.3 acceptance cases as a complete user journey, including restart and interaction failure modes.

**Likely areas:** `tests/descriptor/acceptance; tasks/evidence/w21`.

**Acceptance:**

- [ ] Pointer/keyboard/touch-equivalent documentation and source navigation work without host activation; focus/escape, narrow viewport and readable state messaging pass.
- [ ] Editing/importing/restart/export preserves history; source/version/mapping change warnings survive questions and reload.
- [ ] Acceptance matrix records every case with actual commands and results; existing applicable tests pass and unresolved failures remain explicit.

**Verification:** Real-browser E2E plus fresh-process persistence/import failure suite, applicable legacy regressions and npm run check/build; retain no screenshots/videos/raw snapshots/traces.

### W22 — Reproducible demo commands and user documentation

**Status:** pending. **Dependencies:** W21. **Phase:** D. **Size:** M.

Finalize one startup command and one complete deterministic test command, including explicit prerequisites and documented limitations.

**Likely areas:** `package.json; README.md; docs/descriptor-setup.md; scripts/descriptor test runner`.

**Acceptance:**

- [ ] npm run demo:descriptor and npm run test:descriptor work from a clean disposable checkout with documented npm/browser prerequisites, no paid keys and no silent external effects.
- [ ] Guide covers editor/import/export, component/page documentation, scoped questions, freshness, reset of disposable fixture only, provider label and failure recovery.
- [ ] Package scripts/build/CI integration preserve existing applicable quality checks; license/private flags unchanged; broader packaging/host/real-pilot claims remain unqualified.

**Verification:** Independent clean-disposable-install command replay, npm run test:descriptor and npm run check/build; inspect generated assets and exported read-only adapter boundary.

### W23 — Final independent local-demo acceptance

**Status:** pending. **Dependencies:** W22. **Phase:** D. **Size:** S.

Close only the bounded v0.3 local descriptor roadmap after independent review of the exact final artifact.

**Likely areas:** `tasks/evidence/w23; tasks/todo.md`.

**Acceptance:**

- [ ] Reviewer replays the complete ten-case acceptance matrix and startup/test commands from the frozen artifact; no unresolved required finding or relevant failing test.
- [ ] Final report lists artifact hashes, commands/results, dependency acceptance, preserved history, actual supported environment and unqualified limits.
- [ ] Record local-demo completion separately from public release HOLD, production provider/real pilot/portability/benefit claims; stop without starting deferred work.

**Verification:** Independent exact-artifact review, clean-start demo/test replay, full applicable regression results and preservation check. No runtime success is inferred from documentation review.

## Specification coverage

| v0.3 requirement | Implementation owners | Integrated acceptance |
| --- | --- | --- |
| §1 runnable synthetic calculation, two roles/versions | W04, W06 | W05, W21, W23 |
| §2 component hover/focus/touch Details; AC1 | W09, W10 | W14, W21 |
| §2 whole-page semantics/source links; AC2 | W11 | W14, W21 |
| §2 contextual Ask and state UX; AC3–4 | W15–W18 | W19, W21 |
| §3 all identity/scope/claim fields and evidence classes; AC5 | W01–W04 | W05, W20, W21 |
| §4 editor, JSON/Markdown/text/observation/code import | W07, W08 | W14, W21 |
| §4 persistence, atomicity, export/import; AC7 | W02, W08, W12, W17 | W14, W21 |
| §5 bounded retrieval, providers, grounded citations; AC3–5, AC9 | W03, W15–W18 | W19, W20, W21 |
| §6 trusted access versus applicability, cache/race isolation; AC6 | W03, W06, W09, W17 | W20, W21 |
| §6 freshness/manual verification; AC8 | W13, W17, W18 | W21 |
| §4/§6 privacy, inert input, read-only host boundary; AC9 | W06–W10, W15–W18 | W20, W21 |
| §7 phased delivery and §8 no-key regression/demo; AC10 | W00, W05, W14, W19, W22 | W23 |
| §9 non-goals and open decisions | Plan boundaries; W00 choice log | W23 limitations |

## Results

No implementation task has started. Planning validation and independent review are recorded under `tasks/evidence/descriptor-plan/`; that review does not satisfy W00 or any runtime acceptance case.
