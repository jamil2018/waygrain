import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  writeFile,
  copyFile,
  symlink,
  rm,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import process from 'node:process';
const candidate = JSON.parse(
  await readFile(new URL('./candidate.json', import.meta.url)),
);
const tar = await readFile(candidate.local_tarball);
assert.equal(createHash('sha256').update(tar).digest('hex'), candidate.sha256);
const root = await mkdtemp('/private/tmp/waygrain-g04-doc-');
let receipt;
try {
  execFileSync('tar', ['-xzf', candidate.local_tarball, '-C', root]);
  // This checks the documented requests against exact packed code with existing locked dependencies.
  // Fresh independent dependency installation/runtime qualification is in packed24/packed26 receipts.
  await symlink(resolve('node_modules'), join(root, 'node_modules'));
  const cli = join(root, 'package/dist/cli.js'),
    config = join(root, 'private/config.json');
  const run = (args, input) =>
    execFileSync(process.execPath, args, {
      cwd: root,
      input,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
  const settings = resolve('tasks/evidence/g03/settings.json');
  const init = JSON.parse(
    run([cli, 'init', '--config', config, '--settings', settings]),
  );
  assert.equal(init.status, 'initialized');
  await copyFile(
    resolve('tasks/evidence/g03/capture.json'),
    join(root, 'capture.json'),
  );
  const guide = await readFile(join(root, 'package/PLUGIN_SETUP.md'), 'utf8');
  const marker = 'node --input-type=module - "$WAYGRAIN_CONFIG" <<\'JS\'\n';
  const start = guide.indexOf(marker);
  assert(start >= 0);
  const code = guide.slice(start + marker.length).split('\nJS\n')[0];
  run(['--input-type=module', '-', config], code);
  const ingest = JSON.parse(
    run(
      [cli, 'ingest', '--config', config],
      await readFile(join(root, 'ingest-request.json')),
    ),
  );
  assert(ingest.data.capture_id);
  const query = JSON.parse(
    run(
      [cli, 'query', '--config', config],
      await readFile(join(root, 'query-request.json')),
    ),
  );
  assert.equal(query.data.status, 'complete');
  assert(
    query.data.records.some((r) => r.name === 'Invite' && r.kind === 'control'),
  );
  receipt = {
    status: 'passed',
    node: process.version,
    candidate_sha256: candidate.sha256,
    exact_packaged_guide_code_executed: true,
    existing_locked_dependencies: true,
    fresh_install_claim: false,
    ingest_capture_id: ingest.data.capture_id,
    query_status: query.data.status,
    answer: 'Invite',
    scope: 'admin-staging-synthetic',
  };
} finally {
  await rm(root, { recursive: true, force: true });
}

receipt.cleanup = 'temporary_prefix_removed';
await writeFile(
  new URL('./documentation-check.json', import.meta.url),
  JSON.stringify(receipt, null, 2) + '\n',
);
