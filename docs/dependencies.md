# Dependency versions and licenses

A02 registry and lockfile inventory, recorded 6 October 2026. Versions are exact npm pins. Licenses below are package-declared metadata, not a legal opinion or browser-binary license review. Apache-2.0 is the Waygrain package license. No browser binaries are included. Native packed-runtime feasibility and browser notices remain A04/later work.

TypeScript 6.0.3 is selected because typescript-eslint 8.71.1 declares TypeScript `>=4.8.4 <6.1.0`; the registry latest TypeScript 7.0.2 falls outside that range. The plan did not specify a TypeScript patch version. All three explicit runtime pins match the plan.

## Direct dependencies

| Package                      | Exact version | Use         | Declared license |
| ---------------------------- | ------------- | ----------- | ---------------- |
| @modelcontextprotocol/server | 2.3.1         | Runtime     | Apache-2.0       |
| better-sqlite3               | 13.0.3        | Runtime     | MIT              |
| playwright                   | 1.63.0        | Runtime     | Apache-2.0       |
| zod                          | 4.6.5         | Runtime     | MIT              |
| @eslint/js                   | 10.0.1        | Development | MIT              |
| @playwright/test             | 1.63.0        | Development | Apache-2.0       |
| @types/node                  | 24.19.1       | Development | MIT              |
| eslint                       | 10.12.0       | Development | MIT              |
| prettier                     | 3.9.9         | Development | MIT              |
| typescript                   | 6.0.3         | Development | Apache-2.0       |
| typescript-eslint            | 8.71.1        | Development | MIT              |

## Complete resolved package graph

`package-lock.json` records registry tarball URLs and integrity digests. This table includes optional platform packages; presence in the lockfile does not mean execution or platform support was verified. Entries are sorted by installation path, including nested versions. Installed packages also carry their upstream license/notice files where provided.

| Lockfile path                                                                | Version | Declared license |
| ---------------------------------------------------------------------------- | ------- | ---------------- |
| node_modules/@cacheable/memory                                               | 2.2.0   | MIT              |
| node_modules/@cacheable/utils                                                | 2.5.0   | MIT              |
| node_modules/@eslint-community/eslint-utils                                  | 4.10.1  | MIT              |
| node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys | 3.4.3   | Apache-2.0       |
| node_modules/@eslint-community/regexpp                                       | 4.12.2  | MIT              |
| node_modules/@eslint/config-array                                            | 0.23.5  | Apache-2.0       |
| node_modules/@eslint/config-helpers                                          | 0.7.0   | Apache-2.0       |
| node_modules/@eslint/core                                                    | 1.2.1   | Apache-2.0       |
| node_modules/@eslint/js                                                      | 10.0.1  | MIT              |
| node_modules/@eslint/object-schema                                           | 3.0.5   | Apache-2.0       |
| node_modules/@eslint/plugin-kit                                              | 0.7.3   | Apache-2.0       |
| node_modules/@humanfs/core                                                   | 0.19.2  | Apache-2.0       |
| node_modules/@humanfs/node                                                   | 0.16.8  | Apache-2.0       |
| node_modules/@humanfs/types                                                  | 0.15.0  | Apache-2.0       |
| node_modules/@humanwhocodes/module-importer                                  | 1.0.1   | Apache-2.0       |
| node_modules/@humanwhocodes/retry                                            | 0.4.3   | Apache-2.0       |
| node_modules/@keyv/bigmap                                                    | 1.3.1   | MIT              |
| node_modules/@keyv/serialize                                                 | 1.1.1   | MIT              |
| node_modules/@modelcontextprotocol/core                                      | 2.3.1   | Apache-2.0       |
| node_modules/@modelcontextprotocol/server                                    | 2.3.1   | Apache-2.0       |
| node_modules/@playwright/test                                                | 1.63.0  | Apache-2.0       |
| node_modules/@types/esrecurse                                                | 4.3.1   | MIT              |
| node_modules/@types/estree                                                   | 1.0.9   | MIT              |
| node_modules/@types/json-schema                                              | 7.0.15  | MIT              |
| node_modules/@types/node                                                     | 24.19.1 | MIT              |
| node_modules/@typescript-eslint/eslint-plugin                                | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/eslint-plugin/node_modules/ignore            | 7.0.12  | MIT              |
| node_modules/@typescript-eslint/parser                                       | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/project-service                              | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/scope-manager                                | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/tsconfig-utils                               | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/type-utils                                   | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/types                                        | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/typescript-estree                            | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/utils                                        | 8.71.1  | MIT              |
| node_modules/@typescript-eslint/visitor-keys                                 | 8.71.1  | MIT              |
| node_modules/acorn                                                           | 8.19.0  | MIT              |
| node_modules/acorn-jsx                                                       | 5.3.2   | MIT              |
| node_modules/ajv                                                             | 6.15.0  | MIT              |
| node_modules/balanced-match                                                  | 4.0.4   | MIT              |
| node_modules/better-sqlite3                                                  | 13.0.3  | MIT              |
| node_modules/brace-expansion                                                 | 5.0.12  | MIT              |
| node_modules/cacheable                                                       | 2.5.0   | MIT              |
| node_modules/cross-spawn                                                     | 7.0.6   | MIT              |
| node_modules/debug                                                           | 4.4.3   | MIT              |
| node_modules/deep-is                                                         | 0.1.4   | MIT              |
| node_modules/escape-string-regexp                                            | 4.0.0   | MIT              |
| node_modules/eslint                                                          | 10.12.0 | MIT              |
| node_modules/eslint-scope                                                    | 9.1.2   | BSD-2-Clause     |
| node_modules/eslint-visitor-keys                                             | 5.0.1   | Apache-2.0       |
| node_modules/espree                                                          | 11.2.0  | BSD-2-Clause     |
| node_modules/esquery                                                         | 1.7.0   | BSD-3-Clause     |
| node_modules/esrecurse                                                       | 4.3.0   | BSD-2-Clause     |
| node_modules/estraverse                                                      | 5.3.0   | BSD-2-Clause     |
| node_modules/esutils                                                         | 2.0.3   | BSD-2-Clause     |
| node_modules/fast-deep-equal                                                 | 3.1.3   | MIT              |
| node_modules/fast-json-stable-stringify                                      | 2.1.0   | MIT              |
| node_modules/fast-levenshtein                                                | 2.0.6   | MIT              |
| node_modules/fdir                                                            | 6.5.0   | MIT              |
| node_modules/file-entry-cache                                                | 11.1.5  | MIT              |
| node_modules/find-up                                                         | 5.0.0   | MIT              |
| node_modules/flat-cache                                                      | 6.1.23  | MIT              |
| node_modules/flatted                                                         | 3.4.4   | ISC              |
| node_modules/glob-parent                                                     | 6.0.2   | ISC              |
| node_modules/hashery                                                         | 1.5.1   | MIT              |
| node_modules/hookified                                                       | 1.15.1  | MIT              |
| node_modules/ignore                                                          | 5.3.2   | MIT              |
| node_modules/imurmurhash                                                     | 0.1.4   | MIT              |
| node_modules/is-extglob                                                      | 2.1.1   | MIT              |
| node_modules/is-glob                                                         | 4.0.3   | MIT              |
| node_modules/isexe                                                           | 2.0.0   | ISC              |
| node_modules/json-schema-traverse                                            | 0.4.1   | MIT              |
| node_modules/json-stable-stringify-without-jsonify                           | 1.0.1   | MIT              |
| node_modules/keyv                                                            | 5.6.0   | MIT              |
| node_modules/levn                                                            | 0.4.1   | MIT              |
| node_modules/locate-path                                                     | 6.0.0   | MIT              |
| node_modules/minimatch                                                       | 10.2.6  | BlueOak-1.0.0    |
| node_modules/ms                                                              | 2.1.3   | MIT              |
| node_modules/natural-compare                                                 | 1.4.0   | MIT              |
| node_modules/node-addon-api                                                  | 8.9.2   | MIT              |
| node_modules/optionator                                                      | 0.9.4   | MIT              |
| node_modules/p-limit                                                         | 3.1.0   | MIT              |
| node_modules/p-locate                                                        | 5.0.0   | MIT              |
| node_modules/path-exists                                                     | 4.0.0   | MIT              |
| node_modules/path-key                                                        | 3.1.1   | MIT              |
| node_modules/picomatch                                                       | 4.0.7   | MIT              |
| node_modules/playwright                                                      | 1.63.0  | Apache-2.0       |
| node_modules/playwright-core                                                 | 1.63.0  | Apache-2.0       |
| node_modules/prelude-ls                                                      | 1.2.1   | MIT              |
| node_modules/prettier                                                        | 3.9.9   | MIT              |
| node_modules/punycode                                                        | 2.3.1   | MIT              |
| node_modules/qified                                                          | 0.10.1  | MIT              |
| node_modules/qified/node_modules/hookified                                   | 2.2.0   | MIT              |
| node_modules/semver                                                          | 7.8.5   | ISC              |
| node_modules/shebang-command                                                 | 2.0.0   | MIT              |
| node_modules/shebang-regex                                                   | 3.0.0   | MIT              |
| node_modules/tinyglobby                                                      | 0.2.17  | MIT              |
| node_modules/ts-api-utils                                                    | 2.5.0   | MIT              |
| node_modules/type-check                                                      | 0.4.0   | MIT              |
| node_modules/typescript                                                      | 6.0.3   | Apache-2.0       |
| node_modules/typescript-eslint                                               | 8.71.1  | MIT              |
| node_modules/undici-types                                                    | 7.24.6  | MIT              |
| node_modules/uri-js                                                          | 4.4.1   | BSD-2-Clause     |
| node_modules/which                                                           | 2.0.2   | ISC              |
| node_modules/word-wrap                                                       | 1.2.5   | MIT              |
| node_modules/yocto-queue                                                     | 0.1.0   | MIT              |
| node_modules/zod                                                             | 4.6.5   | MIT              |

## Sources and limits

Metadata was fetched directly from the [npm registry](https://registry.npmjs.org/). Planned dependency sources: [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk), [better-sqlite3](https://github.com/WiseLibs/better-sqlite3), [Playwright](https://github.com/microsoft/playwright), and [Zod](https://github.com/colinhacks/zod). License data is not an audit of all bundled native components. Later public packaging must review distribution notices and browser/native licensing alongside its exact artifact.
