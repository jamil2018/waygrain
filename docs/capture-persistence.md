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
