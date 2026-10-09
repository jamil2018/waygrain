// Real headed synthetic observation/retention comparison; no raw browser or host logs retained.
import { execFileSync } from 'node:child_process';
import { platform, arch } from 'node:os';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID, createHash } from 'node:crypto';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  readdir,
  stat,
} from 'node:fs/promises';
import { URL } from 'node:url';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import { openBrowser } from '../../dist/browser/engine.js';
import { snapshotPage } from '../../dist/browser/snapshot.js';
import {
  initializeConfiguration,
  loadConfiguration,
} from '../../dist/config/index.js';
import { Store } from '../../dist/store/database.js';
import { ingest, query, evidence } from '../../dist/index.js';
import {
  fixtureSettings,
  fixtureHtml,
  sensitive,
} from '../../tests/fixtures/ui/index.mjs';
import {
  conditions,
  cases,
  observations,
  grade,
  jsonSchema,
  median,
} from './protocol.mjs';
import { evaluate } from './codex.mjs';
const output = resolve(
  process.argv[2] || '/private/tmp/waygrain-evaluation.json',
);
const repetitions = process.argv.includes('--smoke') ? 1 : 3;
const selectedCases = process.argv.includes('--smoke') ? ['cold'] : cases;
const root = await mkdtemp('/private/tmp/waygrain-g-eval-');
const schemaPath = join(root, 'answers.schema.json');
await writeFile(schemaPath, JSON.stringify(jsonSchema), { mode: 0o600 });
const results = [];
const runtime = {
  node: process.version,
  platform: platform(),
  arch: arch(),
  codex: execFileSync(process.env.WAYGRAIN_CODEX || 'codex', ['--version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim(),
  playwright: JSON.parse(
    await readFile(
      new URL('../../node_modules/playwright/package.json', import.meta.url),
      'utf8',
    ),
  ).version,
  harness_sha256: createHash('sha256')
    .update(await readFile(new URL('./run.mjs', import.meta.url)))
    .digest('hex'),
  started_at: new Date().toISOString(),
};
const settings = fixtureSettings();
let active = { screen: 'members', role: 'admin', version: 1 };
const server = createServer((_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(fixtureHtml(active));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
settings.apps[0].allowed_origins = [origin];
for (const s of settings.apps[0].scopes) s.origin = origin;
for (const r of settings.apps[0].route_mappings) r.origin = origin;
async function bytes(path) {
  let total = 0;
  for (const e of await readdir(path, { withFileTypes: true })) {
    const p = join(path, e.name);
    total += e.isDirectory() ? await bytes(p) : (await stat(p)).size;
  }
  return total;
}
const projection = (capture) => ({
  scope: { role: capture.scope.role, environment: capture.scope.environment },
  view: capture.view,
  coverage: capture.coverage,
  tree: capture.tree,
});
try {
  for (let repetition = 1; repetition <= repetitions; repetition++)
    for (const caseName of selectedCases) {
      // Rotate arms to reduce fixed-order drift; repetitions remain independent.
      const order = conditions
        .slice(repetition - 1)
        .concat(conditions.slice(0, repetition - 1));
      for (const condition of order) {
        const trialRoot = join(root, randomUUID());
        const started = performance.now();
        await mkdir(trialRoot, { mode: 0o700 });
        let owned, store;
        const m = {
          condition,
          case: caseName,
          repetition,
          browser_calls: 0,
          knowledge_calls: 0,
          setup_ms: 0,
          priming_ms: 0,
          retained_bytes: 0,
          error: null,
        };
        try {
          const config = join(trialRoot, 'private/config.json');
          await initializeConfiguration(config, settings);
          const location =
            condition === 'waygrain' ? await Store.open(config) : null;
          store = location;
          // Configuration is shared fixture harness overhead in every arm, not counted as product retained evidence.
          const app =
            store?.location.configuration.apps[0] ||
            (await loadConfiguration(config)).configuration.apps[0];
          const binding = {
            session_id: randomUUID(),
            page_id: randomUUID(),
            scope: app.scopes[0],
          };
          owned = await openBrowser(binding, () => {});
          m.browser_calls++;
          m.setup_ms = performance.now() - started;
          const base = store
            ? {
                schema_version: 1,
                project_id: store.location.configuration.project_id,
                app_id: app.app_id,
              }
            : null;
          let seq = 0,
            ids = [],
            captured = [];
          async function observe(version) {
            captured = [];
            ids = [];
            for (const options of observations) {
              active = { ...options, version };
              const scope = app.scopes.find(
                (s) => s.role === options.role && s.environment === 'staging',
              );
              const { alias: _alias, ...declaredScope } = scope;
              void _alias;
              await owned.page.goto(
                origin +
                  (options.screen === 'detail'
                    ? '/members/fixture'
                    : '/' + options.screen),
              );
              m.browser_calls++;
              const snapshot = await snapshotPage(
                owned.page,
                app,
                { ...binding, scope: declaredScope },
                'evaluation',
                ++seq,
              );
              m.browser_calls++;
              captured.push(snapshot.capture);
              if (store) {
                m.knowledge_calls++;
                const r = ingest(store, {
                  ...base,
                  request_id: randomUUID(),
                  screen_ref: {
                    kind: 'new',
                    name: options.screen,
                    view_key: options.screen,
                  },
                  capture: snapshot.capture,
                });
                ids.push(r.data.capture_id);
              }
            }
            if (condition === 'notes-folder')
              await writeFile(
                join(trialRoot, 'notes.json'),
                JSON.stringify(captured),
                { mode: 0o600 },
              );
          }
          if (caseName !== 'cold') {
            const p = performance.now();
            await observe(1);
            m.priming_ms = performance.now() - p;
          }
          const taskStart = performance.now();
          if (
            caseName === 'cold' ||
            caseName === 'changed' ||
            condition === 'browser-only'
          )
            await observe(caseName === 'changed' ? 2 : 1);
          let context;
          if (condition === 'notes-folder')
            context = JSON.parse(
              await readFile(join(trialRoot, 'notes.json'), 'utf8'),
            ).map(projection);
          else if (store) {
            context = [];
            for (let i = 0; i < ids.length; i++) {
              m.knowledge_calls++;
              const q = query(store, {
                ...base,
                mode: 'search',
                scope: captured[i].scope,
                filters: { ids: [ids[i]], kinds: ['capture'] },
                budget: { records: 10, bytes: 60000 },
              });
              if (
                q.data.status !== 'complete' ||
                !q.data.records.some((r) => r.id === ids[i])
              )
                throw new Error('query_incomplete');
              m.knowledge_calls++;
              const e = evidence(store, {
                ...base,
                ids: [ids[i]],
                projection: 'structured',
              });
              if (e.data.status !== 'available')
                throw new Error('evidence_incomplete');
              context.push(projection(e.data.items[0].capture));
            }
          } else context = captured.map(projection);
          for (const v of Object.values(sensitive))
            if (JSON.stringify(context).includes(v))
              throw new Error('privacy_check_failed');
          m.context_sha256 = createHash('sha256')
            .update(JSON.stringify(context))
            .digest('hex');
          m.pre_model_ms = performance.now() - taskStart;
          m.host = await evaluate(context, schemaPath, root);
          m.task_results = grade(
            m.host.answers,
            caseName === 'changed' ? 2 : 1,
          );
          m.error = m.host.error;
          m.task_batch_ms = performance.now() - taskStart;
          m.retained_bytes =
            condition === 'notes-folder'
              ? (await stat(join(trialRoot, 'notes.json'))).size
              : store
                ? (await bytes(join(trialRoot, 'private'))) -
                  (await stat(config)).size
                : 0;
        } catch (error) {
          const codes = [
            'query_incomplete',
            'evidence_incomplete',
            'privacy_check_failed',
            'INVALID_PATH',
            'INVALID_CONFIG',
            'UNKNOWN_SCOPE',
            'BROWSER_UNAVAILABLE',
            'STORE_BUSY',
          ];
          m.error = codes.includes(error?.code || error?.message)
            ? error.code || error.message
            : 'trial_failed';
          m.task_results = grade(null, 1);
        } finally {
          m.cleanup = {};
          for (const [name, action] of [
            ['store', () => store?.close()],
            ['context', () => owned?.context.close()],
            ['browser', () => owned?.browser.close()],
            ['files', () => rm(trialRoot, { recursive: true, force: true })],
          ]) {
            try {
              await action();
              m.cleanup[name] = 'complete';
            } catch {
              m.cleanup[name] = 'failed';
              m.error ??= 'cleanup_failed';
            }
          }
          if (owned) m.browser_calls++;
          m.total_ms = performance.now() - started;
        }
        results.push(m);
        process.stdout.write(
          JSON.stringify({
            condition,
            case: caseName,
            repetition,
            error: m.error,
            correct: m.task_results.filter((t) => t.correct && t.grounded)
              .length,
          }) + '\n',
        );
        const report = {
          schema_version: 1,
          runtime,
          host: { model: 'gpt-6.1-sol', reasoning: 'low', ephemeral: true },
          repetitions,
          batch_size: 10,
          results,
        };
        await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
          mode: 0o600,
        });
      }
    }
  const distributions = conditions.flatMap((condition) =>
    selectedCases.map((caseName) => {
      const rows = results.filter(
        (r) => r.condition === condition && r.case === caseName,
      );
      return {
        condition,
        case: caseName,
        total_ms: rows.map((r) => r.total_ms),
        task_batch_ms: rows.map((r) => r.task_batch_ms),
        browser_calls: rows.map((r) => r.browser_calls),
        retained_bytes: rows.map((r) => r.retained_bytes),
        median_total_ms: median(rows.map((r) => r.total_ms)),
      };
    }),
  );
  const report = JSON.parse(await readFile(output, 'utf8'));
  report.distributions = distributions;
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
    mode: 0o600,
  });
} finally {
  server.close();
  await once(server, 'close');
  await rm(root, { recursive: true, force: true });
}
