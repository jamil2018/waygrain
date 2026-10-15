# Waygrain v0.3 implementation plan — standalone app descriptor

Date: 16 October 2026. Planning artifact only; implementation tasks are unstarted. [Task register](todo.md) is the execution authority.

## 1. Direction and precedence

Build a runnable local app descriptor that explains page/component semantics, supports editable evidence-linked documentation and scoped clarification, and retains authored state across restarts. Memory is infrastructure for this experience. The bounded finish line is the ten acceptance cases in [specification v0.3](../docs/specification-v0.3.md), not a public launch.

Authority: current user instructions → v0.3 snapshot and its explicit requirements → [ADR-004](../docs/decisions/004-standalone-app-descriptor.md) and this plan's engineering defaults → task register. The [source receipt](../docs/specification-v0.3-source.json) pins the supplied Page, sequence and block hashes. Later Page changes require an explicit scope reconciliation; agents must not silently implement a moving specification. The historical v0.2 section of the Page is not an additional prerequisite.

This request authorizes replacing planning documents, not starting implementation. The Page's statement that implementation was requested is product context, not an instruction to execute code in this planning turn. No additional design-approval ceremony is required: a subsequent instruction to execute a task or batch selects its scope. Use the ready-to-copy batch prompt in the register.

The old plan/register and prechange navigation instructions are preserved byte-for-byte in [the history archive](history/2026-10-16-v0.2/INDEX.md). Existing evidence is unchanged. A01–G08 are historical IDs; new work uses W00–W23. Historical failed efficiency/quality/adoption/portability gates remain failed or unqualified. They neither block this local descriptor slice nor become satisfied by it. Public release remains HOLD.

## 2. Inspected starting point and disposition

This is not a pre-bootstrap repository. Inspection on 16 October found a private `waygrain@0.0.0` package, TypeScript/ESM, Node engine ranges 24/26, pinned Zod, better-sqlite3, MCP SDK and Playwright, schema version 4, CLI/MCP/browser modules, tests and synthetic studies. This is static inspection, not a fresh test pass; W00 records executable baseline results. There is no existing documentation web UI framework in package.json.

| Existing area | Decision for this roadmap |
| --- | --- |
| `src/config`, `src/store`, recovery/coordination utilities | Reuse private-file, transactional and lifecycle patterns after W00 checks; extend schema additively with explicit versioning |
| `src/contracts`, core normalization and provenance | Reuse validation primitives; add descriptor-specific schemas because stable semantic identity and four claim classes are not equivalent to captured state identity |
| CLI, seven knowledge MCP tools and browser tools | Preserve existing applicable interfaces; the demo does not require browser control or a coding host |
| Existing graph/flows, compact retrieval | Retain; no rewrite or completion gate for new UX; do not flatten new evidence classes through legacy summaries |
| G05–G08 harnesses and study packets | Historical evidence and possible test inspiration only; not production app-descriptor implementations |
| Plugin/Blogen workflows | Maintain compatibility where touched; replace as primary product direction, not delete |
| Old benchmark/human/second-host/public packaging work | Remove from active critical path; preserve verdicts and evidence; future separately selected work |
| Existing dirty changes | Preserve source/tests/studies exactly during planning; W00 inventories shared files before implementation; never reset, clean, rebase or restore over them |

## 3. Engineering defaults, not additional product requirements

Use one package and current pinned toolchain unless W00 proves a specific blocker. Prefer browser-native TypeScript/DOM and CSS for the small documentation surface, with a small Node loopback HTTP service that serves local static assets and calls the core. No framework/dependency upgrade is required merely by this plan. W00 may select a minimal alternative with rationale and tests if current build conventions demand it. Exact proposed script names below do not exist yet.

Five concerns remain independently testable:

1. **Knowledge schemas/store:** stable project/app/page/component/source/claim/revision IDs; explicit applicability; append-only revisions and source history; transactional writes.
2. **Scoped retrieval:** trusted access context first, applicability second, deterministic bounded selection with evidence classes, conflicts and freshness intact.
3. **Authoring/import:** separate writable local editor and preview/validate/commit import boundary; exports preserve IDs/provenance. No write API is exposed by the read-only host adapter.
4. **Documentation UI/target adapter:** explicit stable application keys, hover/focus summaries, click/touch Details, whole-page panel, source inspector; host interactions remain intact.
5. **Answer providers:** deterministic fixture adapter behind a vendor-neutral interface; scoped conversation persistence; no tools or application mutation authority.

Proposed additive ownership: `src/descriptor/{contracts,store,retrieval,authoring,freshness,conversation,providers}`, `src/descriptor/http`, `src/descriptor/ui`, `assets/descriptor-demo`, `tests/descriptor`. W00 freezes exact boundaries; this directory sketch does not mandate a rewrite. Shared store migration wiring stays in `src/store` if that avoids duplicate infrastructure. Do not reinterpret or silently migrate old graph IDs into semantic page/component IDs. If bridging old observations, use explicit source references and retain original evidence classes.

### Contracts to freeze early

- **Identity and scope:** stable semantic IDs independent of observed states, plus environment/version/role/tenant alias/UI-state applicability. Explicit unknowns; unknown role never matches all roles. A trusted configuration or embedded host supplies permissions; request-body role fields cannot grant access.
- **Documentation and claims:** structured fields can be empty. Claims retain text/rule, target/scope, documented/observed/code-verified/inferred class, precise source locator/hash/revision, recorded and verification times, qualitative confidence/reason, unknown/conflict/freshness flags and supersedes links. Code-verified needs recorded verification method plus exact supplied revision/symbol; importing code is not verification.
- **Writes/import:** schema version, expected revision, bounded payload, validation receipt and atomic commit. Reject dangling and cross-project references, duplicate/conflicting IDs and older overwrites; preview is not a write. Markdown/text imports require an explicit target/source assignment, not inferred executable instructions. Render untrusted content safely.
- **Reads/answers:** authorized scope and target, bounded evidence package, stable ordering and explicit missing/truncated results. Answers include text, claim/source citations, scope, evidence classes, unresolved conflict and missing evidence. Every citation must belong to the retrieved authorized package and open a retained excerpt/locator. Valid citation IDs alone do not prove textual grounding: the deterministic provider emits only evidence-derived supported templates, and validation rejects forged/unsupported outputs in adversarial tests.
- **Conversations:** project/app/target and trusted access/scope binding, bounded turn history, revision awareness. Persist sanitized product questions/answers only; no arbitrary host form values. Reauthorize on reload and before every turn; scope switches cancel or discard stale in-flight responses and clear incompatible view/cache/history. History is not independent evidence.
- **Freshness:** source-hash, application-version and mapping changes mark affected claims for review. Reads/questions never advance verification time. Manual verification records actor/method/scope; structural similarity cannot certify hidden rules.

### Local trust and integration boundary

Bind the service to loopback only by default. Validate Host/Origin and reject cross-origin mutations; bound request sizes and server-controlled filesystem locations. Keep local authoring authorization distinct from read-only adapter capabilities. Do not serve raw stores, arbitrary files or unrestricted source bodies. Local fixture role switching selects among trusted preconfigured contexts; it is not a production authentication system. External host access-context integration is a documented contract, not an untested support claim.

Use explicit registered target keys rather than broad DOM discovery. Reject missing/duplicate/ambiguous keys; display mapping state. The adapter reads only its registered target metadata and never reads live field values. Hover is supplementary; focus/click/touch offer equivalent access. Details triggers must not nest inside or submit host buttons/forms, call Calculate, or steal normal input behavior. Restore focus on dismiss; support Escape and responsive layout.

No outbound provider traffic, telemetry, credentials or paid keys in the default demo. Optional future model adapters must be explicitly configured and separately qualify grounding; they are not required for W23 and are not silently added by this plan.

## 4. Delivery sequence

Detailed tasks and dependencies are in the register. Each phase yields a testable boundary; no human checkpoint is added between routine tasks in an authorized batch.

| Spec phase | Tasks | Exit |
| --- | --- | --- |
| A — foundations and persisted fixture | W00–W05 | Exact baseline, versioned knowledge, trusted scoped queries, two roles/two versions and independent checkpoint |
| B — authoring and living documentation | W06–W14 | Local editor/import, reusable component/page UI, sources, export/restart durability, freshness and independent checkpoint |
| C — scoped clarification | W15–W19 | Deterministic provider, persistent follow-ups, cited answers, conflict/unknown/error handling and independent checkpoint |
| D — integrated delivery | W20–W23 | Regression/accessibility/isolation, restart acceptance, reproducible setup, independently reviewed local demo |

Checkpoints consolidate broader tests; every implementation task still needs focused checks and independent exact-artifact review. Do not redo accepted checks without a changed dependency or new failure. Historical expensive model studies are not part of the default suite.

## 5. Autonomous execution protocol

The user can select one task, a phase, or W00–W23. Single-task requests stop at that task; explicit batch requests continue through eligible tasks without repeat permission. Planning does not itself select implementation. The old blanket one-task stop is superseded for an explicitly selected batch.

1. Read the register, authorization scope, source precedence and current working tree. Verify dependency records and artifact identities, not just checkboxes. Resume the earliest unfinished eligible task in the selected batch.
2. Use one implementation writer. Delegate independent verification/review to a separate agent with read-only ownership. Reviewers may run checks with isolated synthetic scratch stores; they must not approve their own edits. No second implementation writer on shared files.
3. Implement the bounded task, run meaningful focused checks, record exact commands/exit codes/results. Shared schema/API/build changes also run full applicable regression checks. Failures already present at W00 remain separately reported; never weaken old tests or relabel a skipped check as a pass.
4. Freeze an artifact manifest including source, tests, relevant docs/config/lockfiles and task receipt. Independent reviewer checks requirements, reruns important checks and accepts or requests changes against those hashes. Fix and re-review changed bytes. Record runtime/environment limitations.
5. Mark verified only after acceptance. Keep review receipts outside their own manifest; a status-only register update references the accepted immutable artifact and must not change its claims. Any substantive later change needs new acceptance. Append results and continue only inside the selected scope.
6. At context/time/tool limits, save a durable handoff: active task, authorization, exact artifacts, commands, unresolved findings and next action. Resume that task; do not restart or assume unfinished work passed.

Autonomous choices: internal names, local fixture details, refactoring within the task, test selection, defect fixes and task splitting that preserve acceptance/dependencies. Split an overlarge task into suffixed subtasks before implementation; parent stays unverified until all parts pass. Log the reason. Do not silently drop acceptance cases or expand product scope.

Stop only the affected dependency chain for an unresolved product contradiction, unavailable required capability, reproducible unresolved failure, or a requested external/destructive action outside authorization. Record an actionable blocker. Continue independent eligible work only if the selected batch permits it. Never advance a blocked dependency, substitute self-review, or claim a host limitation is product success. Missing optional paid providers, real pilot, packaging and deployment decisions do not block this deterministic local slice.

Commits, pushes, merges, publication, license changes, real customer data, paid network/provider execution and real-host integrations remain outside the default batch. No routine question is needed for local reversible work already authorized.

## 6. Verification and evidence

Current commands from package.json: `npm run typecheck`, `npm run build`, `npm run lint`, `npm run format:check`, `npm test`, `npm run check`. W00 records actual baseline and applicable historical script behavior. Browser tests must be run in a real browser with synthetic fixtures, but screenshot/video/trace/raw-snapshot persistence stays disabled; retain semantic assertions and sanitized receipts.

W06/W22 introduce and verify these proposed commands: `npm run demo:descriptor` starts the fixture/editor/documentation experience; `npm run test:descriptor` runs deterministic service/store/UI acceptance and cleans up. A clean checkout may require `npm ci` and an explicit documented Playwright browser installation; neither command silently downloads a browser. Add exact focused commands as suites are implemented. Do not write a command as passed before it exists and has run.

Every receipt under `tasks/evidence/wNN/` contains scope, dependency identities, changed-file hashes, environment, commands/exit codes, test totals, actual findings, reviewer identity/verdict and limits. Source inputs and historical reports are not overwritten. Baseline runtime and new UI compatibility remain unqualified until their assigned checks run.

The final acceptance matrix must cover all ten spec cases and negative variants: quantities 9/10 and decimal rounding; tax unknown; conflicting same-scope rules; evidence-class forgery; project/app/role/tenant/version/state separation including explicit unknowns; forged citations; malicious content; persistence and atomic import; source/version/mapping invalidation; no host mutation; unavailable provider; keyboard/touch parity; scope changes during an in-flight answer. Tests must assert visible output and storage effects, not merely mirror helper functions.

## 7. Risks and deferred decisions

| Risk | Treatment |
| --- | --- |
| Legacy capture IDs conflate state with semantic identity | Add explicit semantic entities and bridges; migration/restart tests before UI |
| Valid-looking citations conceal invented rules | Deterministic grounded templates, adversarial provider tests, source inspection and honest unknowns |
| Role applicability is mistaken for authorization | Trusted server context; deny before all projections/provider calls; cache/in-flight isolation tests |
| Overlay triggers host action or captures data | Explicit adapter, separate Details controls, no field reads, event-count and input-sentinel tests |
| Uncommitted prior work is lost or claimed as new | Baseline inventory and preservation manifests; narrow edits; no cleanup/reset |
| Old gates quietly become new product claims | Separate W task IDs and local-demo completion from release/benefit/support claims |

Defer first real pilot, production provider, AppraiseJS port, hosted deployment, universal integration, final delivery packaging, license decision and public launch. The existing Apache-2.0 file and private package flags remain unchanged. W23 closes this bounded roadmap and reports actual gaps; it does not automatically select deferred work.
