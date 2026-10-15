# G06 — One-call compact capture retrieval results

Status: verified for the bounded retrieval simplification after independent exact-artifact acceptance. User-selected Codex-only slice, authorized 14 October 2026 and completed across the 14/15 October session. G05 procedure was independently accepted; its failed efficiency/grounding/current-claim gates remain unchanged. Public release HOLD.

## Change

`wg_query` search accepts opt-in `projection: "compact"` with `filters.kinds: ["capture"]`. Existing defaults, ranking, other modes and `wg_evidence` are unchanged. Each matching capture summary includes a small sanitized view/tree excerpt, immutable source ID and JSON Pointer citations, while preserving source scope, coverage, provenance and freshness. Up to 16 stored preorder nodes; names over 256 UTF-8 bytes omitted intact. Omissions remain visible independently of outer query pagination. This is a prefix projection, not a generated answer or full-tree text search. [ADR-002](../../../docs/decisions/002-compact-capture-retrieval.md) is the explicit contract amendment; [protocol](PROTOCOL.md) and [preflight](independent-preflight.json) bind scope and acceptance.

Search remains `requires_check`; recent does not prove current applicability. Partial source coverage and omitted nodes cannot establish absence. No browser invocation, executable target, store write, refresh, graph/ranking redesign, migration or model summary introduced. Capture-only first slice does not cover graph/annotation excerpts.

## Actual bounded comparison

Frozen four synthetic cases, five paired warmups and thirty alternating sequential paired repetitions per case: **120 measured pairs**, no retries/failures. Compare the saved unchanged pre-G06 query plus structured evidence read with one compact query, on identical ingested captures, fixed fixture time and records=20/bytes=8192 budgets. Full serialized response envelopes are counted; both old envelopes are summed. Setup/configuration/ingest time is recorded separately and equal to both arms; no setup savings claimed. All synthetic stores closed and temporary roots removed. [Individual records/distributions](comparison.json), reproducible script `scripts/evaluation/g06/run.mjs`.

| Case | Old combined bytes | Compact bytes | Old median ms | Compact median ms |
| --- | ---: | ---: | ---: | ---: |
| Admin Members | 2612 | 2023 | 0.6210 | 0.5004 |
| Viewer Settings | 2284 | 1618 | 0.5705 | 0.4773 |
| Admin Member detail | 2307 | 1642 | 0.5723 | 0.4467 |
| Invite dialog | 2934 | 2455 | 0.5349 | 0.4537 |

Median of four case medians: **2459.5→1832.5 bytes (25.493% lower)**; **2→1 retrieval calls (50% fewer)**. Local core+JSON serialization **0.5714→0.4655 ms (18.540% lower)** in this writer run. All four cases returned the required supporting control/tab/dialog fields with exact citation paths and unchanged enclosing metadata. Default query and structured evidence outputs matched the archived runtime on the same stores.

Measured timing excludes MCP transport, model inference, browser work and end-to-end tasks. Submillisecond same-host timings are limited microbenchmarks; independent execution has separate distributions. Tokens are **unmeasured**, not estimated from bytes. No reduction in actual agent browsing, cost or task time is established; no advantage over ordinary notes is established. G05's full agent study was not rerun or pooled. The scoped acceptance criteria (one-call usefulness, bounded truthfulness, fewer retrieval calls and lower combined median bytes) passed in writer checks and independent exact-artifact acceptance.

## Checks, preservation and boundaries

Writer Node24.20.0/macOS arm64 `npm run check` PASS: typecheck, lint, formatting, build and **120 tests**. Eight focused G06 checks cover exact citation/view resolution, unchanged default/read behavior, read-only revision, stale/partial/older captures, contradiction, scope/missing/tombstones, unsupported modes/kinds, UTF-8/node omissions and byte/record/projection/revision cursors. [Quality receipt](quality.json). Initial writer fixture setup failures and lint import failures are preserved separately; validation, lint rules and acceptance criteria were not weakened.

Historical G01–G05 evidence and G05 harness/tests remain byte-identical. The old compiled runtime is archived separately under `prechange-runtime/dist/`; its original hashes remain valid there, while current dist is a later G06 artifact. Pre-G06 document prefixes are preserved, with additive G06 notes; three authorized original source files and one skill guidance file changed, with a new compact helper/test/script/ADR. [Input identities](preserved-inputs-sha256.json) and final preservation receipt identify the boundary. Original G04 private candidate identity is unchanged; no new packed artifact or packaging/host qualification claimed.

Independent preflight accepted the exact protocol before source implementation. [Independent implementation review](independent-review.json) accepted the exact 536-file implemented manifest with no Required findings; 44 independent focused/compatibility checks, generated schemas/actual stdio MCP and independent benchmark recomputation/rerun passed. Its original report/register/manifest bytes are archived under implemented-artifact/ and implemented-artifact-sha256.json. Final status-document bytes are separately bound by [final document review](final-document-review.json). Independent final review must bind code, generated schemas/runtime, tests, comparison records and documentation to the same final manifest; later status-only documentation requires separate review and original implementation review snapshots retained.

Claude Code/Cursor remain deferred/unverified. Original human adoption and second application unmet/unverified. Production-headed/native-host/global privacy and portability qualifications unchanged. Package private 0.0.0/public HOLD. No commit, push, merge, tag, npm/plugin publication or later task; record G06 and stop.
