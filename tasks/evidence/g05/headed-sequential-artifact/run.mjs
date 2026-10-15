import { spawn, execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { setTimeout, clearTimeout } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import process from 'node:process';
import {
  conditions,
  cases,
  tasks,
  limits,
  jsonSchema,
  answerSchema,
  prompt,
} from './protocol.mjs';
import { sensitive } from '../../../tests/fixtures/ui/index.mjs';
const root = await mkdtemp('/private/tmp/waygrain-g05-');
const output = resolve(process.argv[2] || '/private/tmp/waygrain-g05.json');
const smoke = process.argv.includes('--smoke');
const selected = smoke
  ? tasks.filter((t) =>
      ['invite-cancel', 'settings-compare', 'detail-change'].includes(t.id),
    )
  : tasks;
const selectedCases = smoke ? ['changed'] : cases;
const repetitions = smoke ? 1 : 3;
const schema = join(root, 'answer.schema.json');
await writeFile(schema, JSON.stringify(jsonSchema), { mode: 0o600 });
const server = fileURLToPath(new URL('./server.mjs', import.meta.url));
const cwd = join(root, 'host');
await import('node:fs/promises').then((fs) => fs.mkdir(cwd, { mode: 0o700 }));
const runtime = {
  node: process.version,
  codex: execFileSync(process.env.WAYGRAIN_CODEX || 'codex', ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim(),
  model: 'gpt-6.1-sol',
  reasoning: 'low',
  started_at: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  protocol_sha256: createHash('sha256')
    .update(await readFile(new URL('./protocol.mjs', import.meta.url)))
    .digest('hex'),
};
const report = { schema_version: 1, smoke, runtime, results: [] };
async function host(trial, task) {
  const started = performance.now();
  let final = null,
    tokens = null,
    error = null,
    forbidden = 0;
  const args = [
    '--no-daemon',
    'exec',
    '--ephemeral',
    '--ignore-user-config',
    '--skip-git-repo-check',
    '--sandbox',
    'read-only',
    '--color',
    'never',
    '--json',
    '--model',
    runtime.model,
    '-c',
    'model_reasoning_effort="low"',
    '-c',
    'features.shell_tool=false',
    '-c',
    'mcp_servers.study.command=' + JSON.stringify(process.execPath),
    '-c',
    'mcp_servers.study.args=' + JSON.stringify([server, trial]),
    '-c',
    'mcp_servers.study.startup_timeout_sec=45',
    '-c',
    'mcp_servers.study.default_tools_approval_mode="approve"',
    '-c',
    'mcp_servers.study.required=true',
    '-c',
    'mcp_servers.study.tool_timeout_sec=20',
    '--output-schema',
    schema,
    '-C',
    cwd,
    '-',
  ];
  const child = spawn(process.env.WAYGRAIN_CODEX || 'codex', args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: true,
  });
  const stop = (signal) => {
    try {
      process.kill(-child.pid, signal);
    } catch {
      /* owned group already exited */
    }
  };
  const closed = new Promise((resolve) => {
    child.once('error', () => {
      error = 'host_start_failed';
      resolve(null);
    });
    child.once('close', resolve);
  });
  child.stdin.on('error', () => {
    error = 'host_input_failed';
  });
  child.stdin.end(prompt(task));
  child.stderr.on('data', () => {});
  const lines = createInterface({ input: child.stdout });
  lines.on('line', (line) => {
    if (line.length > 1024 * 1024) {
      error = 'host_event_limit';
      stop('SIGTERM');
      return;
    }
    try {
      const e = JSON.parse(line);
      if (e.type === 'turn.completed' && e.usage) {
        const u = e.usage;
        if (
          ['input_tokens', 'output_tokens'].every(
            (k) => Number.isSafeInteger(u[k]) && u[k] >= 0,
          )
        )
          tokens = {
            input: u.input_tokens,
            output: u.output_tokens,
            cached_input: Number.isSafeInteger(u.cached_input_tokens)
              ? u.cached_input_tokens
              : null,
          };
      }
      if (
        e.item &&
        !['reasoning', 'agent_message', 'todo_list', 'mcp_tool_call'].includes(
          e.item.type,
        )
      ) {
        forbidden++;
        error = 'unexpected_tool';
        stop('SIGTERM');
      }
      if (e.type === 'item.completed' && e.item?.type === 'agent_message') {
        try {
          const p = answerSchema.safeParse(JSON.parse(e.item.text));
          final = p.success ? p.data : null;
          if (
            Object.values(sensitive).some((s) =>
              JSON.stringify(final).includes(s),
            )
          ) {
            final = null;
            error = 'privacy_failed';
          }
        } catch {
          final = null;
        }
      }
      if (e.type === 'turn.failed' || e.type === 'error')
        error = 'host_turn_failed';
    } catch {
      error = 'invalid_host_event';
      stop('SIGTERM');
    }
  });
  const timer = setTimeout(() => {
    error = 'host_timeout';
    stop('SIGTERM');
  }, limits.seconds * 1000);
  const hard = setTimeout(() => stop('SIGKILL'), (limits.seconds + 10) * 1000);
  const code = await closed;
  clearTimeout(timer);
  clearTimeout(hard);
  lines.close();
  // Explicitly terminate only this owned group so MCP/browser cleanup is bounded.
  stop('SIGTERM');
  let receipt = null;
  for (let i = 0; i < 100; i++) {
    try {
      receipt = JSON.parse(await readFile(join(trial, 'receipt.json'), 'utf8'));
    } catch {
      /* may not have started */
    }
    if (receipt?.cleanup) break;
    await delay(100);
  }
  if (!receipt?.cleanup) {
    error ??= 'cleanup_unconfirmed';
    stop('SIGKILL');
  }
  if (code !== 0) error ??= 'host_nonzero_exit';
  if (!final) error ??= 'invalid_final';
  if (receipt?.error) error ??= receipt.error;
  if (
    receipt?.cleanup &&
    Object.values(receipt.cleanup).some((v) => v !== 'complete')
  )
    error ??= 'cleanup_failed';
  return {
    host_ms: performance.now() - started,
    tokens,
    error,
    forbidden_items: forbidden,
    final: error ? null : final,
    receipt,
  };
}
try {
  for (let repetition = 1; repetition <= repetitions; repetition++)
    for (const caseName of selectedCases)
      for (const task of selected) {
        const offset =
          (repetition - 1 + tasks.indexOf(task)) % conditions.length;
        const order = conditions
          .slice(offset)
          .concat(conditions.slice(0, offset));
        for (const condition of order) {
          const trial = await mkdtemp(join(root, 'trial-'));
          const started = performance.now();
          await writeFile(
            join(trial, 'options.json'),
            JSON.stringify({ condition, case: caseName }),
            { mode: 0o600 },
          );
          const result = await host(trial, task);
          const row = {
            task: task.id,
            group: task.group,
            condition,
            case: caseName,
            repetition,
            ...result,
          };
          row.residual_host_ms = Math.max(
            0,
            row.host_ms -
              (row.receipt?.setup_ms ?? 0) -
              (row.receipt?.priming_ms ?? 0),
          );
          await rm(trial, { recursive: true, force: true });
          row.total_ms = performance.now() - started;
          report.results.push(row);
          await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
            mode: 0o600,
          });
          process.stdout.write(
            JSON.stringify({
              completed: report.results.length,
              task: task.id,
              condition,
              case: caseName,
              error: row.error,
              calls: row.receipt?.tool_calls.length,
            }) + '\n',
          );
        }
      }
  report.runtime.finished_at = new Date().toISOString();
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
    mode: 0o600,
  });
} finally {
  await rm(root, { recursive: true, force: true });
}
