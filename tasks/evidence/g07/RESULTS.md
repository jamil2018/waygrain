# G07 — End-to-end compact retrieval against notes

Status: verified completed study after independent exact-artifact acceptance. Both the notes-specific benefit and original notes-specific efficiency criteria **FAILED**. Product runtime/G01–G06 history remain frozen; public release **HOLD**. This is a new cohort, not pooled historical evidence.

## Execution and identity

User selected G07 on 15 October 2026, Codex-only, dependent on verified G06. [Protocol](PROTOCOL.md) freezes ten unchanged G05 tasks × three repetitions × cold/warm/changed × notes-folder/legacy-waygrain/compact-waygrain = **270 fresh actual CLI sessions**. Both Waygrain arms use the same frozen G06 runtime; only search projection differs. Ordinary notes retain practical full-content search/read and free-text writing. No forced memory use, model-generated summaries, runtime tuning, retries or replacement sessions. Agents choose navigation, snapshots, memory, refresh and reversible clicks.

Node24.20.0/macOS arm64, Codex CLI0.162.0-alpha.17.2, requested gpt-6.1-sol/low reasoning, ephemeral sessions with user configuration ignored, read-only/shell-disabled, required session-local study MCP. Headless adapter and three isolated matched-arm workers; all **270 headless and cleanup receipts confirmed**, maximum three workers and all90 triads overlapped (minimum12.451 seconds). UTC18:36:18.213–19:20:57.625 on14 October (15 October locally); elapsed **44.657 minutes**, throughput only. Individual times include shared-host/model-service contention, not isolated latency. [Matrix](matrix.json) SHA256 `16a88ae84155806f9936aa00761f746de73d999a5c411f88fefecc78b742876a`.

Independent [initial preflight](independent-preflight.json) and [nine-session smoke review](independent-smoke-review.json) preserved8/9 grounded smoke successes with one true-but-uncited notes claim. Original smoke/code/protocol retained in `initial-smoke-artifact/`. A receipt-only correction added bounded synthetic agent-written note/source lineage so prose-note citations could be fairly reviewed. Model-facing prompts, tools and responses were unchanged. Independent actual stdio notes_write/read/search lineage probe and [renewed cohort preflight](independent-cohort-preflight.json) accepted the correction before the full allocation; no smoke failure was retried or pooled. No prose notes were written in the actual270 cohort; this capability was available, not forced.

## Measured performance

Medians are across ten equally weighted task medians, each using all three allocated repetitions. Total time includes per-arm setup, all capture priming/retention, model/host work and cleanup. Complete individual distributions and tool metrics are in [reviewed summary](summary.json); common orchestration and setup/priming/task-ready-to-shutdown approximation are reported separately. Task-window/residual measurements are not pure inference time and never replace total gate timing. Input+output tokens are measured CLI usage, including cached-input tokens within input totals; not priced billing or hidden provider work.

| Arm | Cold seconds | Warm seconds | Changed seconds | Warm browser calls | Warm input+output tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ordinary notes | 22.628 | 20.740 | 20.357 | 16.5 | 84,548.5 |
| Legacy Waygrain | 23.073 | 22.761 | 21.711 | 16.5 | 97,876 |
| Compact Waygrain | 22.028 | 19.726 | 23.155 | 16.5 | 103,311 |

- Compact warm time **4.890% lower than notes**, below the20% criterion; tokens **22.191% higher**. Browser-call reduction **0%**. Notes-specific benefit FAIL; original calls-plus-time/token criterion FAIL.
- Against concurrent legacy retrieval, compact warm time **13.335% lower**, tokens **5.553% higher**, browser calls unchanged. This comparison does not establish a20% benefit or general causal attribution to projection.
- Cold compact total time **2.651% lower than notes**, within the15% overhead criterion. Repeated-use break-even not established.
- All270 sessions reported token usage, including the three host-error-event qualification failures. No missing usage was substituted or estimated.

## What memory actually changed

Only **3/30 warm sessions per arm** consulted memory. Warm tool totals:

| Arm | Live snapshots | Memory searches | Evidence reads | Compact read fallbacks |
| --- | ---: | ---: | ---: | ---: |
| Notes | 51 | 3 | 0 | — |
| Legacy | 50 | 5 | 6 | — |
| Compact | 51 | 6 | 0 | 0 |

Compact excerpts avoided the legacy full-read sequence in these sessions, but the agents still browsed and sometimes searched repeatedly. Aggregate warm tool-response JSON bytes were159,684 notes/164,731 legacy/161,196 compact (descriptive sums, not token estimates); compact did not deliver G06's25.493% two-call microbenchmark byte reduction against notes. Response bytes count serialized tool values, excluding MCP transport wrapping. Measured total tokens include the whole model interaction; these data do not isolate why token usage differed.

Warm/changed cases paid ten priming browser operations plus four setup/return/close operations per session in every arm. This **14-call common floor** leaves little room under the original criterion:20% below the observed notes median16.5 would require13.2 calls, below that floor even with no task-window browsing. This is a disclosed limitation of the frozen full-cost priming method, not a weakened gate or a general impossibility result. Priming was not amortized over a sustained multi-task use cycle; no rich preverified graphs/prose notes were primed. The separate time-or-token benefit criterion was still testable and failed. New measurements would be required for a different workload or cost-allocation method.

## Correctness, actions and current evidence

Independent review read all270 safe finals/claims against exact reduced observations, actual exposure ledgers, path-subject eligibility and action receipts. [Semantic bindings](semantic-bindings.json) bind every exact final answer and final matrix hash to nine immutable checkpoints. [Strict diagnostic summary](diagnostic-summary.json) retains canonical-value scores separately; semantically correct prose/extra subjects were independently adjudicated rather than falsely labeled factual errors.

| Arm | Substantively correct usable answers | Grounded successful sessions |
| --- | ---: | ---: |
| Notes | 89/90 | 86/90 |
| Legacy | 88/90 | 81/90 |
| Compact | 90/90 | 84/90 |

All **267 usable answers were substantively correct**; no false factual assertion was found in those answers. All **135 scoped reversible clicks** had expected intermediate/final observed outcomes (45/arm), with no wrong attempted/dispatched/refused clicks. This does not qualify arbitrary actions or general autonomous freshness.

The19 failed sessions consist of three conservative host-error-event qualifications and16 reference/grounding qualifications. Three host events (notes settings/cold2; legacy active-return/cold2; legacy invite-change/warm3) invalidate the row under the frozen runner even when later usage is reported; final answers were discarded and are unscorable. Actual UI outcomes/usage/cleanup remain. Underlying host-event details were intentionally not retained, so no specific provider/transport/retrieval cause or recovery is inferred. No replacement trials.

The sixteen reference failures are true claims with invalid optional dot/bracket paths where JSON Pointers were required, empty explicit references, or UUID references not resolvable in the retained capture/note ledger. Nearby prose IDs do not waive structured per-claim qualification. Reduced action receipts do not retain execution-ID lineage; unresolved UUIDs are not asserted to be invented. Exact failed subjects/rows and independent reasons remain in the checkpoints and summary. This sensitivity to formal citation syntax and retained ledger scope is a methodological limit; it is not observed false UI facts.

Compact cold grounded success **26/30 vs notes28/30**, so no-regression FAIL. Warm29/30 each; changed29/30 each, but compact's one invalid-path changed claim means current-claim qualification FAIL. Current version-two snapshots and actual correct actions existed; no stale wrong dispatch was observed. No-additional-wrong-actions PASS only for these synthetic journeys.

## Verification, preservation and stop

Writer Node24 `npm run check` PASS typecheck/lint/format/build and133 tests after the receipt-only amendment; independent13 focused preflight tests, actual notes lineage probe, all270 semantic bindings and independent Python metric/concurrency recomputation passed. [Quality](cohort-quality.json), [execution check](execution-check.json), [preservation check](preservation-check.json), independent metric receipt and final exact review identify assigned evidence. [Independent implementation review](independent-review.json) accepted the exact601-file implemented manifest with no Required findings; implementation report/register/manifest identities are archived separately. [Final document review](final-document-review.json) binds the later verified-status bytes. Original copied-test arm-index setup failure preserved separately; no criterion or validation rule weakened.

All85 compiled product files, original source, G01–G06 evidence and G05/G06 harnesses/tests remain unchanged. Pre-G07 document prefixes are retained separately; later notes are additive. G04 candidate identity/private0.0.0 unchanged. Browser-only is omitted, so this is a notes-specific comparison, not superiority over every original baseline or public-release approval. Small synthetic capture-memory workload, three repetitions, scripted priming/equal revision cues, adapter tool/shape differences and shared-worker contention limit generality. No native-host/discovery, production-headed, second-app, new platform or global host/provider privacy qualification.

Claude Code/Cursor remain deferred/unverified; original human adoption and second application unmet/unverified. G05 failures and public HOLD remain intact. No commit, push, merge, tag, npm/plugin publication or subsequent task. Record G07 actual results and stop.
