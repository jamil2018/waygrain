import { spawn, execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdtemp, writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { setTimeout, clearTimeout } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import process from 'node:process';
import { z } from 'zod';
import { limits, packetSchema, workSchema, prompt } from './protocol.mjs';
import { worlds } from './corpus.mjs';
import { sensitive } from '../../../tests/fixtures/ui/index.mjs';
const root = await mkdtemp('/private/tmp/waygrain-g08-');
const output = resolve(process.argv[2] || '/private/tmp/waygrain-g08.json');
const smoke = process.argv.includes('--smoke');
const server = fileURLToPath(new URL('./server.mjs', import.meta.url));
for (const [stage, shape] of [
  ['investigate', packetSchema],
  ['work', workSchema],
])
  await writeFile(
    join(root, stage + '.schema.json'),
    JSON.stringify(z.toJSONSchema(shape)),
    { mode: 0o600 },
  );
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
  execution_mode: { headless: true, investigation_workers: 3, work_workers: 2 },
  maximum_workers: 0,
};
const report = { schema_version: 1, smoke, runtime, results: [] };
const cohortBegan = performance.now();
async function host(trial, stage) {
  const started = performance.now();
  let final = null,
    invalidFinal = null,
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
    join(root, stage + '.schema.json'),
    '-C',
    join(trial, 'host'),
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
  child.stdin.end(prompt(stage));
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
          const candidate = JSON.parse(e.item.text);
          if (
            Object.values(sensitive).some((s) =>
              JSON.stringify(candidate).includes(s),
            )
          )
            throw new Error('privacy_failed');
          const p = (
            stage === 'investigate' ? packetSchema : workSchema
          ).safeParse(candidate);
          final = p.success ? p.data : null;
          invalidFinal = p.success
            ? null
            : {
                sha256: createHash('sha256').update(e.item.text).digest('hex'),
                value: candidate,
              };
          if (
            Object.values(sensitive).some((s) =>
              JSON.stringify(final).includes(s),
            )
          ) {
            final = null;
            error = 'privacy_failed';
          }
        } catch (e) {
          final = null;
          if (e.message === 'privacy_failed') {
            invalidFinal = null;
            error = 'privacy_failed';
          }
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
    unaccepted_final: error ? final : null,
    invalid_final: invalidFinal,
    receipt,
  };
}
async function trial(world, repetition, condition, shared = [], packet = null) {
  const dir = await mkdtemp(join(root, 'trial-')),
    began = performance.now(),
    session_id = `${world}_${repetition}_${condition}`;
  await mkdir(join(dir, 'host'), { mode: 0o700 });
  await writeFile(
    join(dir, 'options.json'),
    JSON.stringify({
      world,
      repetition,
      condition,
      session_id,
      shared,
      packet,
    }),
    { mode: 0o600 },
  );
  let result;
  try {
    result = await host(
      dir,
      condition === 'investigate' ? 'investigate' : 'work',
    );
  } catch {
    result = {
      error: 'worker_pipeline_failed',
      final: null,
      receipt: null,
      tokens: null,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  const row = {
    world,
    repetition,
    condition,
    session_id,
    total_ms: performance.now() - began,
    ...result,
  };
  report.results.push(row);
  process.stdout.write(
    JSON.stringify({
      completed: report.results.length,
      session: session_id,
      error: row.error,
      calls: row.receipt?.tool_calls.length,
    }) + '\n',
  );
  // A single sequential checkpoint after each worker group avoids concurrent overwrites.
  return row;
}
try {
  const repetitions = smoke ? 1 : 3,
    selected = smoke ? ['cobalt'] : worlds;
  for (let repetition = 1; repetition <= repetitions; repetition++) {
    const investigators = await Promise.all(
      selected.map((world) => trial(world, repetition, 'investigate')),
    );
    runtime.maximum_workers = Math.max(
      runtime.maximum_workers,
      selected.length,
    );
    await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
      mode: 0o600,
    });
    for (const inv of investigators) {
      const shared = [
        ...(inv.receipt?.owner_replies ?? []),
        ...(inv.receipt?.observations ?? []),
      ];
      const order =
        (repetition + worlds.indexOf(inv.world)) % 2
          ? ['raw', 'organized']
          : ['organized', 'raw'];
      await Promise.all(
        order.map((condition) =>
          trial(
            inv.world,
            repetition,
            condition,
            shared,
            condition === 'organized' ? inv.final : null,
          ),
        ),
      );
      runtime.maximum_workers = Math.max(runtime.maximum_workers, 2);
      await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
        mode: 0o600,
      });
    }
  }
  runtime.finished_at = new Date().toISOString();
  runtime.cohort_elapsed_ms = performance.now() - cohortBegan;
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
    mode: 0o600,
  });
} finally {
  await rm(root, { recursive: true, force: true });
}
