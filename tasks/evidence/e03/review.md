# E03 independent verification and exact-artifact review

Reviewer: `/root/e_review`, separate from implementation writer. Date: 7 October 2026. Verdict: **PASS**, no unresolved Critical or Required findings. Applied code-review-and-quality to storage, backup, export, restore, CLI and cursor generation boundaries against baseline recovery requirements.

## Actual verification

- Independent `npm run check` on Node 24.20.0 and 26.5.0: PASS, typecheck/lint/format/build and 89 tests each, zero failures/skips.
- `node --test tests/recovery.test.mjs tasks/evidence/e03/independent.mjs`: initial four focused tests PASS both runtimes. Added actual CLI maintenance exercise and ran the final independent harness on both: three own tests PASS each. Writer tests exercise graph flow round trip, corrupt-live-image recovery and invalid hash/input refusal; own probes add full query equivalence, IDs/revision, actual CLI backup/export/restore, archival JSON rows, seeded privacy marker absence in export/backup, 0600 modes, checksum equality, journal DELETE image, quick_check, live-peer refusal, equal-revision restore invalidation of all query/evidence/changes cursors, and rejection of WAL overlays, future schema and altered schema triggers while preserving the live store.
- Static review confirms fixed generated archive paths within startup-selected private storage; no caller-provided filesystem output destinations; exact schema/project/apps/FK/integrity checks before replacement; exclusive coordination authority before opening current knowledge files; staged verified image, checkpointed valid old WAL, atomic replacement and synced directory. The retained old set is correctly documented as forensic data, not a guaranteed consistent backup. JSON export is archival with no import.

## Initial grouped review feedback

Writer addressed checkpoint-before-sidecar-removal safety and standalone backup journal handling while the initial sweep was in progress. Reviewer also requested cleanup of staging on backup failure and durable restore generation binding of cursors: restore can reuse a historical revision, so revision alone is insufficient. Final code uses a private persisted cursor epoch and invalidates all three cursor families after replacement, even when product revision is identical. Own equal-revision probes pass. There were no further Required findings in the final frozen artifact sweep. No production/test implementation was edited by this reviewer.

## Exact accepted artifact

Manifest algorithm: lexically sorted `path + space + SHA256(bytes)` lines joined with LF and no trailing LF; SHA256 of UTF-8 manifest.

```
a68d6b4eae0c2ce45122f8a4e17b67f36b446c03e9c5287c10568b8ee5d30724  src/ manifest, 39 files
c5cade0f8c8bd0ce50a09f78b45b3953257235f9e9ac56593b4aadb873fd0293  tests/ manifest, 31 files
e6354c71ea200578bdbaeab6b5573ff2584d2761dc6082e37f5e007b5d9e3876  dist/ manifest, 79 files
f8e7f0ca41349e067412d904d84c525543320783c4054e9fcb9bb171c609a6ed  src/store/recovery.ts
ced96a2eb57a9ce704b82604a3acc87624d39a2dc0ada21776da5f899c6ad81e  src/store/database.ts
a06ddabd4a1b6520768bce37da4fc2994e9c9ce7bd4d716df6e4f041971f4319  src/config/index.ts
f3fceeac3e6f742c90c05de45083b6cd204f0aa5851fed0d31ff39aa7e176a41  docs/changes-and-recovery.md
eeec1c5a3fba4631b23fff6178c6de1cbf89baf5fe9ea8cad61ebae14e94d229  tasks/evidence/e03/independent.mjs
```

## Limits

Synthetic local macOS arm64 Node24/26 only. This task verifies deterministic maintenance behavior and static crash ordering; process kills, competing writers, migration recovery and timing windows require E05 evidence. It does not attest power-loss/filesystem hardware durability, network/synced storage, encryption, cross-platform support, browser/host compatibility or clean packed consumer behavior. Exports and backups intentionally retain redacted historical/tombstoned evidence; separate artifacts retain data after a later purge. Existing browser/host limitations remain.
