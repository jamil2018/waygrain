# D03 independent verification and review

Reviewer: `/root/d_review`, separate from implementation writer. Date: 7 October 2026. Base: `5fb2db6` (D02). Verdict: **PASS** for D03. No unresolved Critical or Required findings.

Reviewed D03 authority and the baseline flow, scope, annotation, test-run and privacy contracts. Applied code-review-and-quality to the changed source/tests/docs, including later changes to the previously reviewed graph and trace services. Earlier receipts remain historical evidence, not approval of these later bytes.

## Actual independent checks

- Final `PATH=/Users/jamil/.nvm/versions/node/v24.20.0/bin:$PATH npm run check`: PASS, Node 24.20.0, 73 tests, zero failures/skips; typecheck, lint, formatting, build/schema generation and full deterministic suite.
- Final `npm run check`: PASS, Node 26.5.0, 73 tests, zero failures/skips; same checks.
- Own disposable synthetic two-edge flow on both runtimes: PASS, ordered linked transitions and a forward assertion target referring to a later flow in the same atomic batch; complete per-edge event evidence supports a matching test-verified annotation.
- Own negative matrix on both runtimes: PASS, missing one edge's evidence, failed assertion, finished-before-event interval, disconnected flow order, unrelated extra same-scope capture, unknown application-version/assertion prose all refuse atomically. Original revision and zero new graph rows preserved after each failure. Rejected synthetic prose sentinel absent DB/WAL.
- Read and independently ran repository tests for atomic forward test-run links, exact target matching, failed/skipped run and assertion nonpromotion, incomplete endpoint evidence, retained failed runs, typed graph relations and structured test-verified annotation retrieval. Earlier D01/D02 tests run as regressions.

## Historical findings and repairs

1. Both-runtime initial typecheck failed because a later `t.kind !== 'flow'` comparison was unreachable after an earlier flow return. Writer removed the redundant comparison; final checks pass.
2. Own adversarial probe found legitimate event evidence plus an unrelated same-scope capture accepted in one assertion. Writer added an actual per-cited-item `supports()` check alongside collective trace coverage, and a regression. Both-runtime own probes and final suite confirm refusal now.
3. Initial new regression used a capture sequence already occupied by its after capture, so it failed before exercising the intended evidence validator. Writer assigned a free sequence; final regression reaches and checks the validator.

## Limits and assessment

Flows retain their declared scope and exact ordered transitions; structural connectivity is enforced. Guards remain unevaluated. Test reports are caller attestations. Waygrain retains runner/application versions, bounds timestamps and validates target/evidence/scope/assertion results; it does not certify runner truthfulness or business behavior. Passed run alone cannot promote unrelated records. Failed/skipped runs remain evidence. Actions require actual event evidence for test verification; transition/flow support collectively covers the trace for every edge. All cited evidence must individually support the target and lie in the declared interval.

Forward references are narrowly deferred for test-run links and assertion targets and validated before commit; ordinary evidence and graph refs still refer to existing/earlier records. Arbitrary flow names, assertion text and application-version prose fail before digest/persistence unless operator-reviewed.

Local macOS arm64 Node 24/26 only. No new browser, host integration, cross-platform, packed-artifact, recovery stress, performance or later recall gate claim. D04/D05 retrieval remains separate.

## Exact reviewed artifact

SHA-256:

```
1ae5f386cc0ab5541c99326a7951019a7a99f05ebfa6fae84901a39f49a33534  src/core/commit.ts
9a2112b604307b17a2b6070dc5628653da1a5bc32a9540e04560c74b097396bb  src/core/graph.ts
bd84351bf53370cbadc10ba34f5fe1af8ab18a5f890af70816cb21a6d2710d6d  src/core/traces.ts
248d9254c1a214aa5d4c347865a95617bd030101da9a5bbe397337b15538f218  src/core/test-evidence.ts
c05c302ece24614f44920f0d744176236ea290b29736a36dd0c532ea27445123  tests/test-evidence.test.mjs
0677c40a3d5a7984f7a41672382a07845bb82088ed3d1dfc3674f9f202cbe9c7  tests/commit.test.mjs
f0a843d4e858c25a15d8050f693f4ec10c008fc739e2b9d7f4fcf7604035026e  docs/graph-and-recall.md
e3596d9bbaa4f662bbe7afd512de79b719da59f1e1777c45245931535ab8a157  README.md
4361e502546fddf43b748fe64a057dbb27ffb5eb33d1e1e09319c168126e8c1d  tasks/todo.md
```

Register identity is implemented/pending-review. Later verified-only register changes require separate acceptance.

## Final task record acceptance

Separately read and accepted D03 verified-only register record, which accurately describes final results and repaired findings. Implementation/tests/other documentation identities above are unchanged. Final `tasks/todo.md` SHA-256: `1413beeb5dba781bc3005ec8f6697a60d10181c8a48c68d84ab871584707c516`.
