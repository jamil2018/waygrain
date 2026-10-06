# Capture and persistence (Phase B)

B01 supplies synthetic fixtures in `tests/fixtures/ui/index.mjs`: Home, Settings,
Members and Member detail; admin/viewer and staging/production; selected tabs,
Invite modal, and UI v2's renamed invitation and removed member control. Seeded
personal, secret, payment and instruction-like strings are synthetic test data.
They are negative privacy cases, never real credentials or copied page content.

`npm test` validates the structured corpus. `npm run test:fixtures` explicitly
launches disposable headed Chromium to assert fixture rendering, role/version
controls, tab selection and modal open/cancel. Install Chromium explicitly through
the documented setup first. The browser check retains no snapshots, screenshots,
profiles, traces or authentication state. DevTools MCP is unavailable in the
implementation environment; Playwright assertions supply the live DOM evidence.
These checks do not attest the future Waygrain browser component or mapping.

B02 adds strict-input redaction and canonical state projections. Names survive
only when their normalized whitespace matches a reviewed profile label. Unknown
text becomes empty; roles must be recognized accessibility roles. Routes must
match configured templates. Tab, modal, feature-variant and partial-subtree
aliases also require profile approval. Unknown profiles/formats fail closed.
Forbidden unknown fields (including values, cookies, tokens and temporary refs)
are rejected by public validation, before normalization or storage.

Only allowlisted accessible-name hints survive; unconfigured test IDs are dropped.
Hints and observation/provenance timestamps do not affect state hashes. Hashes
include screen identity, scope, normalization/profile version and ordered UI
structure. Hashes never contain raw rejected text. Only `locator_hint` may be a
configured ignored field in this version; rules that erase semantic fields fail.
Opaque trace/session/source/request keys must be caller-minted nonidentifying
metadata, not copied page values. Operator allowlists still require review;
redaction cannot guarantee that an operator's approved label is safe.
