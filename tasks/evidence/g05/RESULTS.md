# G05 Codex-only agent-directed evaluation results

Status: verified for the user-amended headless/parallel study procedure after independent exact-artifact acceptance. The full user-amended headless/parallel study is complete, and its efficiency and success/grounding/freshness criteria **failed**. Public release remains **HOLD**. This is a later artifact; it does not replace historical G01–G04 evidence or the stopped headed G05 cohort.

## Method and artifact identity

The user selected G05 on 12 October 2026 and subsequently requested headless mode and parallel workers. The original headed sequential run stopped at 76 completed sessions, with its in-flight session separately interrupted and cleaned. Its original code/protocol, partial matrix, review, two context-cleanup failures and one true-but-uncited claim remain in [headed history](headed-sequential-partial.json), `headed-sequential-artifact/`, and the original semantic checkpoints. These records were never pooled into the new cohort or silently retried.

The amended [protocol](PROTOCOL.md) and [independent headless preflight](independent-headless-preflight.json) bind a new allocation of ten tasks × three repetitions × three arms × cold/warm/changed = **270 separately timed actual Codex sessions**. One implementation writer; independent reviewer `/root/g05_review`. Codex CLI `0.162.0-alpha.17.2`, model `gpt-6.1-sol`, low reasoning, fresh ephemeral sessions, ignored user configuration, read-only/shell-disabled host with explicitly authorized session-local study MCP. Node24.20.0, macOS arm64. The exact 83 compiled production files remained frozen.

Three isolated workers ran matched-arm triads with separate host working directories, fixture servers, configurations, headless browser contexts and private storage. All 270 receipts confirmed headless mode; actual maximum concurrency was three and all 90 triads overlapped (minimum overlap 12.556 seconds). Cohort execution took 1,956.443 seconds (32.607 minutes), including the timeout. This is throughput metadata, not individual task latency. Individual wall times include shared-host/model-service contention.

The evaluation-only launcher overrides headless mode and delegates SIGTERM/SIGINT cleanup solely to the adapter. Production runtime and browser guards were unchanged. Initial sandbox/startup and approval-blocked smokes, the successful headed smoke, the failed nine-session headless signal-race smoke and its source snapshot, and the successful ordered-cleanup headless smoke are retained separately. Competing Playwright/adapter signal handlers were corrected before amended full preflight, without weakening the cleanup criterion. [Successful amended smoke](smoke-headless-ordered-cleanup.json).

## Efficiency

Values below are medians of ten task medians, each task median using all three repetitions. Each actual individual record and distribution is retained in [matrix](matrix.json) and [reviewed summary](summary.json). Times include per-arm configuration, browser/store setup, priming, capture, retention, retrieval, model/host work and cleanup. Common coordinator/schema/temp-container orchestration is outside individual product timing; aggregate cohort elapsed is recorded separately. Residual host time after subtracting setup/priming is not exact task-window or pure inference latency.

| Arm | Cold total seconds | Warm total seconds | Changed total seconds | Warm logical browser calls | Warm input + output tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| Browser-only | 17.306 | 17.886 | 17.181 | 16.5 | 100,188.5 |
| Notes-folder | 16.912 | 17.508 | 17.516 | 16.5 | 93,991 |
| Waygrain | 17.917 | 17.722 | 17.836 | 16.5 | 100,855.5 |

- Warm browser-call reduction is **0%**, tied against both ordinary baselines. The assessor selects browser-only on the tie; comparison with notes is also exactly zero.
- Warm total wall time is **1.218% worse than notes**; total tokens are **7.303% worse than notes**. Notes is the stronger measured time/token baseline. The required 20% call improvement AND 20% time or token improvement failed.
- Cold total overhead is **5.946% against notes**, within the bounded 15% criterion. No repeated-use break-even is established.
- One timeout has no token receipt; its tokens remain null. The Waygrain cold token aggregate consequently remains unmeasured. No estimate or invented zero is substituted. Cached input is recorded separately; total tokens include measured input plus output, not billing cost or hidden provider work.

Logical calls include bootstrap/lifecycle, five priming navigation/snapshot pairs where applicable, and agent task operations. Internal mapper/CDP calls are not counted as logical scout calls. All priming and actual ingest/query/read/write costs are charged; no graph annotations or prose notes were primed, so their preparation cost is zero rather than omitted. Ordinary notes can search full matching captures, read them and write free text; Waygrain searches summaries before structured evidence retrieval. The stronger practical notes interface was not restricted to manufacture a gain.

## Correctness, actions and freshness

Independent semantic adjudication read all 270 full answers/claims against the scoped reduced observations and frozen fixture oracle. It is bound to every exact final-answer hash in [semantic bindings](semantic-bindings.json) and nine separate headless checkpoints. [Diagnostic summary](diagnostic-summary.json) retains canonical-value machine scores, which often reject semantically correct prose or supported additional subjects. These diagnostics are not reported as false factual assertions. Reproducible analysis is `scripts/evaluation/g05/analyze.mjs`; pass the semantic bindings as its fourth command-line argument.

| Arm | Substantively correct | Grounded successful sessions | Wrong attempted/dispatched clicks | Invalid/refused click attempts |
| --- | ---: | ---: | ---: | ---: |
| Browser-only | 90/90 | 90/90 | 0 / 0 | 0 |
| Notes-folder | 90/90 | 90/90 | 0 / 0 | 0 |
| Waygrain | 89/90 | 86/90 | 0 / 0 | 0 |

All 135 model-selected reversible clicks had the expected observed intermediate/final outcomes (45 per arm). Current targets and action receipts alone were insufficient: dialog opening/cancellation and Pending→Active required separate supporting observations. No inferred path or backend outcome was certified. No false factual assertion was found in usable final answers.

Four Waygrain sessions failed acceptance and remain in the denominator:

| Task / case / repetition | Actual failure |
| --- | --- |
| viewer-no-act / cold / 1 | 180-second host timeout; final unscorable, tokens unmeasured; all cleanup stages completed |
| detail-change / warm / 1 | True coverage_limits claim with empty explicit evidence references; grounding failed |
| detail-change / changed / 1 | True remove_changed claim with empty explicit evidence references; grounding/current-applicability criterion failed |
| invite-cancel / changed / 2 | True dialog_open claim with empty explicit evidence references; grounding/current-applicability criterion failed |

Nearby prose citations did not waive the pre-registered per-claim reference requirement. These three citation gaps are not false statements. In the two changed gaps, current version-two observations and valid action outcomes were present, but the required cited claim did not qualify. No stale wrong action was observed. Overall success/evidence grounding was worse than the stronger baseline, and the changed evidence criterion failed. No-additional-wrong-actions passed only for these scoped reversible synthetic clicks. All 270 sessions completed confirmed driver/context/browser/store/server cleanup, including the timed-out session; cleanup completion does not waive its timeout.

## Verification, preservation and limits

Writer final Node24 `npm run check` passed typecheck, lint, formatting, build and 112 tests. The independent reviewer ran nine meaningful focused assessor/scheduling/identity checks and independently recomputed the allocation, model answer bindings, concurrency, action outcomes and gate metrics. [Quality receipt](headless-preflight-quality.json), [preservation check](preservation-check.json), and [independent exact-artifact review](independent-review.json) identify actual verification separately. The implemented manifest/report/register bytes are retained in implemented-artifact-sha256.json and implemented-artifact/; the later verified-document bytes receive separate final acceptance. No Node26, cross-platform or new host compatibility claim is made for G05.

This is a representative study of one small synthetic capture-memory application and bounded reversible journeys, not rich preverified graphs or broad product tasks. Capture-only priming is scripted; task-window navigation, observations, retrieval, refresh and clicks are agent selected. The common prompt warns that retained observations may be obsolete, and a visible revision signal is available equally. This tests response to that task/context, not general unsolicited change detection. Three repetitions are practical gate evidence, not statistical proof. Headless adapter results do not qualify production headed-browser behavior or native plugin discovery. The shared-worker wall-time result does not attest isolated latency. Reduced safe facts plus the frozen fixture oracle support semantic review; no full/raw browser snapshots are retained.

Only synthetic safe answer content, bounded facts/action labels, timestamps, metrics and hashes persist. Raw host progress/reasoning/commands/stderr, screenshots/traces, input values, browser profiles and authentication state were not retained by the harness. Seed checks guard its projections; this is not a hidden-host/provider privacy attestation or a guarantee under simultaneous hard loss. Those historical limits remain.

Original source, G01–G04 evidence, candidate identity and historical document prefixes are preserved; later additions are identified separately. F05 Claude Code/Cursor remain deferred/unverified. Original human adoption and second-application requirements remain unmet/unverified. The package remains private 0.0.0, public release HOLD, with no commit, push, merge, tag, npm/plugin publication or subsequent task.
