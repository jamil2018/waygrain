# G01 harness acceptance

Dependency F06 is verified for the amended Codex-only pilot at main `7ba2f63`. The selected G01 harness implements a matched, repeatable synthetic observation/answer study using actual Codex sessions and the existing headed Playwright mapper. Its bounded methodology and excluded release claims are in [evaluation.md](../../../docs/evaluation.md).

Writer Node 24.20.0 `npm run check`: PASS, 103 tests. Independent verifier `/root/g_verify` ran Node 26.11.0 `npm run check`: PASS, 103 tests; independently checked twelve headed fixture combinations against the oracle. An initial sandbox-only browser probe failed from macOS Mach/Crashpad EPERM; its authorized elevated probe passed. That environment limitation is not a product failure or cross-platform qualification.

The final three-arm cold smoke returned 30/30 correct, grounded constrained answers, equal evidence context digests and complete cleanup in each arm. It used Codex CLI 0.162.0-alpha.17.2, explicitly requested gpt-6.1-sol with low reasoning, Playwright 1.63.0 and Node 24.20.0 on macOS arm64. CLI usage events supplied input/output token counts. `accepted-smoke.json` is the final smoke; earlier failed setup and pre-fix grading receipts remain separately named and are not overwritten or promoted to final evidence. The smoke is not the required G02 matrix.

Independent review found and the writer corrected: an overly strict citation oracle for lack of backend proof, omitted directory-deletion timing, cleanup failures losing trial receipts and collapsed failure categories. The final exact artifact is bound by `artifact-sha256.json`; its independent acceptance is recorded separately in `independent-review.json`.

This verifies the harness, not general agent-directed scout efficiency, automatic stale-evidence detection, executed UI actions, human adoption, second-application/second-host portability or public release. No application core changes, publication, persistent host edits or retained raw browser/host logs occurred.
