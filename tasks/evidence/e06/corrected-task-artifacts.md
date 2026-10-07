# Corrected Phase E task artifacts

Reviewer: `/root/e_review`, independent of the implementation writer. Date: 7 October 2026. Verdict: **PASS** for all five corrected task snapshots. No unresolved Critical or Required findings. Historical original commits and E01–E05 receipts remain unchanged; these additive snapshots incorporate the later feature-variant semantic correction.

Each exact commit was independently `git archive` extracted into a separate disposable private/tmp directory. The existing pinned dependency directory was symlinked, with no checkout or dependency mutation. Ran `npm run check` and own `node --test tasks/evidence/e06/semantic-correction.mjs` sequentially on Node24.20.0 and Node26.5.0 for every snapshot. Every command exited 0. Full checks include typecheck/lint/format/build and the actual test counts below; zero failures/skips. Own two probes verify unsupported variants remain explicit without inventing application outcomes or bypassing capture/revision byte limits, same-variant structure stays comparable, and actual action-event outcomes retain evidence. Temporary archives/builds removed.

| Task | Exact corrected commit | Tests passed on each runtime |
| --- | --- | --- |
| E01 | `8240debc47db4a83a1358077165cc50fd7b11738` | 86, plus 2 independent probes |
| E02 | `964afc45bad957930c4df27f221fec0fdcf02940` | 88, plus 2 independent probes |
| E03 | `e0ee469ace2eff0c6ddd85d97809b070d6349774` | 90, plus 2 independent probes |
| E04 | `7803f509ca20bf733002a21e20b6434a51aed36c` | 93, plus 2 independent probes |
| E05 | `cd855b64af973508769f569e89676734cfaf093c` | 96, plus 2 independent probes |

Manifest algorithm for these snapshots: lexically/codepoint-sorted paths, LF-join `path + space + SHA256(bytes)` without trailing LF, SHA256 of UTF-8 manifest. The separate E06 checkpoint explicitly uses localeCompare ordering; compare bytes and stated ordering rather than conflating the two algorithms.

## E01: codex/phase-e-comparisons

```
57616c9ead2bd077b495779f775965d224a769630b910c1f7356d7ab110e38e1  src/, 37 files
1760efd6f3f1e64177aade3226c8815653b54db9d7d6135696e8aa64051303ff  tests/, 29 files
679d0f36c1e8cd5aeca5359355c121de204eaba56cb008080b140189ce913482  dist/, 75 files
9fa19560757d5b1ba105919ba8309239c4698d57b67e99d68388b6a93e938c57  src/core/changes.ts
3529e071d7e6da4b18007c60a3f9d31c2bb96dfbcffe75e4c7e113632e6df345  tests/changes.test.mjs
```

## E02: codex/phase-e-refresh

```
d01ba05bc0cce8e85f582cb8f9c49260e78a1802e6071e12e9eb69347e218ed2  src/, 38 files
2dd2f631518e2b02acf913847c261b2984ca90f45cbbea4adb678654c8b358fb  tests/, 30 files
f6fbe29e8069f905af43f0bd6378ca1edd5449baf99d256a1217ec26a96e9e9c  dist/, 77 files
9fa19560757d5b1ba105919ba8309239c4698d57b67e99d68388b6a93e938c57  src/core/changes.ts
3529e071d7e6da4b18007c60a3f9d31c2bb96dfbcffe75e4c7e113632e6df345  tests/changes.test.mjs
```

## E03: codex/phase-e-recovery

```
d1b11f38b4b244cc625c0cd866a792526d4fc17a75366dfc9becd87dc8e6b63b  src/, 39 files
eedd56b099e08af58b955a7073c493e3b9b369247811cba8ce7581a5f36717a5  tests/, 31 files
d7176962b90f40ac45ab8b33d0f1ee578df82687e052d82120fa411ea1646dc3  dist/, 79 files
21c060576ecd10068c22ab015d5a4f68bd475d0986fdb5944cd8d15dff79fc6d  src/core/changes.ts
3529e071d7e6da4b18007c60a3f9d31c2bb96dfbcffe75e4c7e113632e6df345  tests/changes.test.mjs
```

## E04: codex/phase-e-deletion

```
e916d678f1ab52b4da0eb44dc125d9a79aa2164fd9352bdf2ed04329d61eb58d  src/, 40 files
160c6408229f493ed277386d54da72c6caca97fdc7d8be29b3f9f9fe238ad0e4  tests/, 32 files
3ed5b5db44b5001fc9a89b33349bd4a910dcfa16e60fbfd5322bb610847f1c12  dist/, 81 files
21c060576ecd10068c22ab015d5a4f68bd475d0986fdb5944cd8d15dff79fc6d  src/core/changes.ts
3529e071d7e6da4b18007c60a3f9d31c2bb96dfbcffe75e4c7e113632e6df345  tests/changes.test.mjs
```

## E05: codex/phase-e-crash

```
e916d678f1ab52b4da0eb44dc125d9a79aa2164fd9352bdf2ed04329d61eb58d  src/, 40 files
d53bfeab40103a5f9380a7844ce5c2a515ed6d2f3568e85c2c869e5bb7c7fa1d  tests/, 34 files
3ed5b5db44b5001fc9a89b33349bd4a910dcfa16e60fbfd5322bb610847f1c12  dist/, 81 files
21c060576ecd10068c22ab015d5a4f68bd475d0986fdb5944cd8d15dff79fc6d  src/core/changes.ts
3529e071d7e6da4b18007c60a3f9d31c2bb96dfbcffe75e4c7e113632e6df345  tests/changes.test.mjs
```

## Limits

These are isolated source-built task snapshots using shared pinned dependencies, not clean dependency-install or per-task packed-consumer claims. Full final E06 clean installed consumers are attested separately by its checkpoint verifier. Local macOS arm64 Node24/26 only; existing browser/coding-host and hardware-power-loss limits remain. GitHub CI, shipment and merge identities are owned by the coordinator and not inferred from these local passes. The additive correction intentionally returns incomparable coverage for feature-variant changes because the existing v1 subject vocabulary lacks a precise representation. Historical outcomes and earlier review evidence are retained.

Machine-readable execution results: [corrected-results.json](corrected-results.json).
