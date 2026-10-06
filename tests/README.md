# Test harness

`npm test` uses the Node test runner to discover `tests/**/*.test.mjs`.
A02 intentionally has zero product tests; zero tests passing proves only that
this empty harness runs. Later tasks add focused tests and may import compiled
modules from `dist/` after `npm run build`. Playwright Test is pinned for later
browser scenarios; A02 installs and launches no browser.
