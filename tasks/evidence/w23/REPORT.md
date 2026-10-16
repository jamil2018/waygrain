# W23 final local-demo artifact

Authorized scope: implement W00–W23 in dependency order, independently verify/review each exact task artifact, commit and push each accepted task. Preexisting authorized runtime/study and planning work was preserved in `1b401ee` and `52324b7`, shipped to `main` before the W series began. Implementation is on `codex/w-series-descriptor`; W00–W22 are independently accepted and committed. W23 is frozen for final independent acceptance; the external review receipt records its final verdict. This closes only the v0.3 synthetic local descriptor slice.

## Delivered behavior

The local synthetic calculator provides component hover/focus/keyboard/touch Details, whole-page documentation, precise retained source inspection, separate authoring, atomic previewed imports and history export/restore. Claims retain documented/observed/code-verified/inferred distinctions, exact provenance, conflicts, unknowns and freshness. Source/version/mapping changes require review; questions and reads never certify evidence. Append-only bundle and conversation revisions survive process restart.

The offline provider answers the bounded 10-item calculation and same-conversation 9-item follow-up, reports missing tax evidence and surfaces both conflicting rules. Trusted exact-scope retrieval, source authorization, provider validation and UI generation guards prevent cross-context evidence reuse. The explicit adapter reads no host field values and exposes no application-action or authoring capability. Hostile imported content stays inert. This is a finite deterministic fixture, not general-purpose production AI.

## Reproduction and independent evidence

From a source checkout with Node 24 or 26 and npm:

```sh
npm ci
npx playwright install chromium
npm run test:descriptor
npm run demo:descriptor
```

Browser installation is an explicit prerequisite; neither demo nor test command silently downloads a browser. The service prints separate loopback reader/authoring addresses and preserves private ignored synthetic state. See [setup](../../../docs/descriptor-setup.md) for allocated ports, unused disposable configurations, import/export and failure recovery.

The W22 independent replay used a clean disposable copy without `.git`, `node_modules` or ignored fixture state. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci` installed 107 packages and audited 108 with zero reported vulnerabilities. Explicit Chromium installation reused the installed cache. `npm run test:descriptor` passed typecheck, lint, formatting, build, **183 Node tests and 18 real-Chromium tests**, zero failures/skips. The actual npm demo wrapper ran twice with an unused synthetic configuration and allocated ports; reader/editor validation/save and exact bundle plus visible purpose persistence passed after restart. Browsers and processes closed; scratch data was removed. W23 requires the final frozen artifact's own independent replay, recorded separately in `review.json`.

[MATRIX.json](MATRIX.json) maps all ten specification cases and negative variants to executable assertions. Tests span API/store/provider contracts, separate-process restart, atomic import/restore, retained citation/freshness, project/app/environment/role/version/tenant/state including nulls, forged assertions/citations, unavailable providers, scope switches during generation, keyboard/Escape/focus, narrow touch layouts and zero host activation/unrelated reads. They retain no screenshots/videos/traces/raw snapshots/browser profiles. [dependencies.json](dependencies.json) binds W00–W22 acceptance receipts and commits. Historical manifests describe each accepted revision; the final `artifact.json` binds current bytes across the entire tracked repository plus new final evidence, excluding itself and later review/CI receipts.

## Preservation and limits

[preserved-history.json](preserved-history.json) binds all **440** baseline evidence, historical roadmap/navigation and study files; each is byte-identical to `52324b742fa77ee448b489f77f126c802fec7870`. Earlier required findings, corrected manifests and historical failed/unqualified results remain retained. No unrelated work was reset or cleaned. Dependency pins, lockfile, engine range, private flag and Apache-2.0 licensing remain unchanged. Shared migrations are additive and tested on synthetic stores; no real customer store was used.

Actual independent local environment: macOS arm64, Node 26.11.0, npm 11.20.0 and pinned Playwright Chromium. CI is configured for macOS Node 24/26 with explicit Chromium installation; actual final CI observations belong to the separate CI receipt, not a portability inference. No screen-reader study, full WCAG certification, other operating system, universal host, production authentication/provider, real pilot, adoption/benefit or public packaging claim is made. The descriptor archive excludes conversations and configuration; whole-store maintenance backups retain conversations. It restores only into an empty app with matching project/app identities.

Public release remains **HOLD**. Hosted deployment, production providers, real customer integration, universal discovery, AppraiseJS port, final packaging/licensing decisions and public launch remain deferred. No next implementation phase is implicitly authorized by local-demo completion.
