# Run the local descriptor demo

This source-checkout demo explains a synthetic calculator through living documentation and a deterministic offline answer adapter. Public release remains **HOLD**. It uses no paid key, external provider, telemetry or real customer data. The reader and authoring listeners are single-user local fixture capabilities, not production authentication.

## Prerequisites and commands

Use Node.js 24 or 26, npm and a supported local native build environment for the pinned SQLite dependency. The independently replayed host is macOS arm64 with Node 26; the CI matrix targets macOS Node 24/26. Other operating systems and hosts remain unqualified.

From the repository root:

```sh
npm ci
npx playwright install chromium
npm run test:descriptor
npm run demo:descriptor
```

`npm ci` installs the locked dependencies and may build native SQLite. The separate Playwright command explicitly downloads Chromium; on Linux, Playwright may require additional system dependencies, which this demo does not install automatically. Use your approved environment setup. The test and demo commands never silently download a browser or edit host settings.

`test:descriptor` runs the existing strict typecheck, lint, formatting, build and Node regression suite, then every `tests/descriptor/*.browser.mjs` suite sequentially in real headless Chromium. It exits nonzero on a failed step. Tests use private disposable synthetic stores and clean them up, with no saved screenshots, traces, videos or profiles. Existing expensive historical studies and separate legacy browser workflows are not part of this command; their prior verdicts remain unchanged.

`demo:descriptor` builds and starts the local service. Open the printed **reader** address (default `http://127.0.0.1:4317`) in your browser and the separate **Authoring** address (default `http://127.0.0.1:4318`) for edits. The service binds only to loopback. Keep it local; do not expose it through a tunnel. Ctrl-C stops the service. The default `.waygrain-descriptor/config.json` and SQLite store are private, ignored by Git and retained across restarts. Never place credentials, customer information or arbitrary host input values in this fixture.

If the default ports are occupied, request allocated ports:

```sh
npm run demo:descriptor -- --port 0 --author-port 0
```

For a fresh disposable fixture, choose an **unused** absolute directory whose final parent does not already exist:

```sh
npm run demo:descriptor -- --config /private/tmp/waygrain-fresh-example/config.json --port 0 --author-port 0
```

Use a different unused path if that example already exists. This creates a new synthetic identity/store; it is the safe way to reset a disposable trial without deleting existing history. Restart with the same path to preserve it. Do not delete or overwrite an existing store. `--empty` skips initial seeding and never erases existing data.

## Documentation and questions

The host calculator explicitly registers its page, quantity, Calculate and result targets. Hover or focus Calculate for a summary; the separate **Details for calculate** button supports keyboard, click and touch without pressing Calculate. Escape dismisses summaries/panels and restores focus. **Page documentation** explains the whole page and expands component sections. Evidence-source buttons open the authorized retained locator, revision, hash and excerpt. Escape closes the source inspector first.

The **Documentation scope** selector chooses preconfigured trusted role/version/tenant/state fixtures, including conflicts, changed source/version, unresolved mapping and explicit unknown dimensions. It does not grant arbitrary access. Switching scope clears incompatible documentation, drafts and history views; late responses cannot populate the new scope.

Both component and page panels have **Ask about this**. The visible provider label is **Deterministic synthetic fixture adapter · offline, no model**. Try:

1. “Why is the total 90 for 10 items at 10 each?”
2. “What about 9?” in the same conversation.
3. “What tax applies?”

The first answer cites the applicable synthetic rule, the follow-up explains 90 without a discount, and tax reports missing evidence. The conflict fixture surfaces both rules and sources without choosing a winner. This finite grammar is not general-purpose AI; other questions may be unsupported. Source membership alone never validates an invented explanation.

Only canonical product clarification context and validated answers persist. Unsupported raw text becomes a generic unsupported question. **Start new conversation** chooses a new identity while retaining old history; **Reload conversation** reauthorizes and reloads the selected history. Limits are 20 turns per conversation and 100 conversations per store. Answers are never independent evidence. Historical answers retain their old source revisions and show when documentation has changed.

## Editing, importing and retaining history

Open the printed authoring address. Choose a page/component description, edit its fields or structured knowledge JSON, **Validate draft**, then **Save revision**. Validation does not write. **Reload saved** discards only the local unsaved draft and reloads stored documentation. Mappings that are missing, ambiguous or changed remain explicit.

For an import, select the intended target/scope, format, source kind and precise origin/locator. Paste synthetic JSON, Markdown, text, observation or supplied code as appropriate. Choose **Preview import**, review the normalized evidence, then **Commit validated import**. Editing a previewed field invalidates that preview. Invalid or stale imports leave no partial writes. Imported content stays inert; imported code starts inferred and is never executed or automatically code-verified.

**Export history** populates **History archive (JSON)** with retained descriptor revisions, source provenance and stable IDs. Save it privately. Restoring requires a separate empty app with the **same project/app identities**; a fresh randomly initialized configuration will not match. Follow the [exact configuration-copy and empty-store procedure](descriptor-data.md). Preview and commit the archive in that destination; existing history is never overwritten. Descriptor archives exclude conversations and configuration. Whole-store maintenance backups retain conversations separately. Ordinary restarts preserve both automatically.

Source, supplied revision, version or mapping changes retain historical evidence and mark affected claims for review. Asking or reloading never updates verification time. After checking the actual supplied revision, an author can record explicit verification with the offered method; actor/time/revision are recorded in a new immutable revision. Unknown versions or unresolved mappings cannot be silently certified. See [freshness](descriptor-freshness.md) and [conversations](descriptor-conversations.md).

## Failure recovery and boundaries

- Missing Chromium: run the explicit installation prerequisite, then rerun `test:descriptor`.
- Startup unavailable: check the printed generic error, port conflicts and private fixture permissions; try unused allocated ports. Do not loosen permissions or repoint the demo at a real store.
- Stale revision/import receipt: reload saved state, reapply the intended edit, and preview again. Never force an overwrite.
- Provider unavailable or invalid answer: the UI reports the distinction and saves no failed turn. Retry or reload; error details/source bodies are omitted from diagnostics.
- Evidence/conversation changed during an answer: reload documentation and conversation before retrying. New questions use current evidence; old answers remain historical.
- Missing/restricted source or incomplete evidence: keep the explicit unknown/review warning; changing scope is not verification.

The reusable [target adapter](../src/descriptor/ui/adapter.ts) accepts explicit element mappings, a read capability and documentation callbacks. It neither discovers unrelated DOM nor reads field values, and exposes no authoring or application-action methods. The local fixture's scope selector is not a production host identity integration. Qualification covers semantic Chromium assertions, not a screen-reader study or full WCAG certification. Production providers, real pilots, portability, benefit claims and public packaging/release require separately authorized work.
