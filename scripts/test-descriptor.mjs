import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

const cwd = fileURLToPath(new URL('../', import.meta.url));
function run(command, args) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error || result.signal || result.status !== 0)
    process.exit(result.status || 1);
}
// Keep the established legacy quality gates, then exercise every descriptor UI suite.
// Chromium must be explicitly installed beforehand; this runner never downloads it.
run('npm', ['run', 'check']);
const browserTests = readdirSync(
  new URL('../tests/descriptor/', import.meta.url),
)
  .filter((name) => name.endsWith('.browser.mjs'))
  .sort()
  .map((name) => `tests/descriptor/${name}`);
if (!browserTests.length) throw new Error('No descriptor browser suites found');
run(process.execPath, ['--test', '--test-concurrency=1', ...browserTests]);
