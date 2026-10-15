import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import process from 'node:process';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const base = 'tasks/evidence/g08';
const old = JSON.parse(
  await readFile(join(base, 'preserved-inputs-sha256.json'), 'utf8'),
);
const appendable = new Set([
  'tasks/plan.md',
  'tasks/todo.md',
  'docs/evaluation.md',
  'docs/release-readiness.md',
]);
const changed = [];
for (const [path, record] of Object.entries(old.files)) {
  const bytes = await readFile(path);
  const checked = appendable.has(path)
    ? bytes.subarray(0, record.bytes)
    : bytes;
  if (digest(checked) !== record.sha256) changed.push(path);
}
if (changed.length)
  throw new Error('historical_bytes_changed:' + changed.join(','));
async function walk(path) {
  const info = await stat(path);
  if (!info.isDirectory()) return [path];
  const out = [];
  for (const entry of await readdir(path))
    out.push(...(await walk(join(path, entry))));
  return out;
}
const paths = [
  ...(await walk('scripts/evaluation/g08')),
  ...(await walk(base)),
  ...(await walk('dist')),
  'tests/g08-evaluation.test.mjs',
  'docs/decisions/003-product-specialist-study.md',
  ...appendable,
].filter(
  (p) =>
    !p.endsWith('/' + process.argv[2]) &&
    !p.endsWith('/artifact-manifest.json'),
);
const files = {};
for (const path of paths.sort()) {
  const bytes = await readFile(path);
  files[path] = { sha256: digest(bytes), bytes: bytes.length };
}
await writeFile(
  join(base, process.argv[2] || 'artifact-manifest.json'),
  JSON.stringify(
    {
      preservation:
        'All frozen inputs unchanged, historical document prefixes preserved',
      files,
    },
    null,
    2,
  ) + '\n',
);
process.stdout.write(
  JSON.stringify({
    preserved: Object.keys(old.files).length,
    artifact_files: Object.keys(files).length,
  }) + '\n',
);
