#!/usr/bin/env node
import {
  installBrowser,
  smokeRuntime,
  serve,
  RuntimeError,
} from './runtime/index.js';
import { dirname } from 'node:path';
import { initializeConfiguration, loadConfiguration } from './config/index.js';
import {
  checkDirectoryChain,
  filesystemError,
  readJsonFile,
} from './config/filesystem.js';
import { ConfigurationError } from './config/schema.js';
import { Store } from './store/database.js';
import { dispatch } from './core/retrieval.js';
import { KnowledgeError, errorResponse } from './core/normalize.js';
import { ContractError } from './contracts/validation.js';

async function stdinRequest(): Promise<unknown> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    const buffer = Buffer.from(chunk as Uint8Array);
    bytes += buffer.length;
    if (bytes > 1024 * 1024) throw new ContractError('LIMIT_EXCEEDED');
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new ContractError('INVALID_INPUT');
  }
}

async function main(args: string[]): Promise<void> {
  const [command, configFlag, configPath, settingsFlag, settingsPath] = args;
  if (configFlag !== '--config' || !configPath)
    throw new ConfigurationError('INVALID_CONFIG');
  if (
    command === 'init' &&
    args.length === 5 &&
    settingsFlag === '--settings' &&
    settingsPath
  ) {
    await checkDirectoryChain(dirname(settingsPath));
    const receipt = await initializeConfiguration(
      configPath,
      await readJsonFile(settingsPath),
    );
    process.stdout.write(
      JSON.stringify({ status: 'initialized', ...receipt }) + '\n',
    );
  } else if (command === 'check-config' && args.length === 3) {
    const { configuration } = await loadConfiguration(configPath);
    process.stdout.write(
      JSON.stringify({
        status: 'configured',
        project_id: configuration.project_id,
      }) + '\n',
    );
  } else if (
    (command === 'ingest' || command === 'evidence') &&
    args.length === 3
  ) {
    const input = await stdinRequest();
    const store = await Store.open(configPath);
    try {
      process.stdout.write(
        JSON.stringify(
          dispatch(
            store,
            command === 'ingest' ? 'wg_ingest' : 'wg_evidence',
            input,
          ),
        ) + '\n',
      );
    } finally {
      store.close();
    }
  } else if (
    command === 'status' &&
    args.length === 5 &&
    settingsFlag === '--app' &&
    settingsPath
  ) {
    const store = await Store.open(configPath);
    try {
      const app = store.location.configuration.apps.find(
        (app) => app.alias === settingsPath,
      );
      if (!app) throw new KnowledgeError('UNKNOWN_SCOPE');
      process.stdout.write(
        JSON.stringify(
          dispatch(store, 'wg_status', {
            schema_version: 1,
            project_id: store.location.configuration.project_id,
            app_id: app.app_id,
          }),
        ) + '\n',
      );
    } finally {
      store.close();
    }
  } else if (args.length === 3 && command === 'serve') {
    await serve(configPath);
  } else if (args.length === 3 && command === 'install-browser') {
    await loadConfiguration(configPath);
    await installBrowser();
    process.stdout.write('{"status":"browser_installed"}\n');
  } else if (args.length === 3 && command === 'smoke-runtime') {
    const receipt = await smokeRuntime(configPath);
    process.stdout.write(JSON.stringify(receipt) + '\n');
  } else {
    throw new ConfigurationError('INVALID_CONFIG');
  }
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  // No raw filesystem errors, settings content or caller arguments in diagnostics.
  process.stderr.write(
    JSON.stringify(
      error instanceof KnowledgeError || error instanceof ContractError
        ? errorResponse(error)
        : {
            error:
              error instanceof RuntimeError
                ? error.code
                : filesystemError(error).code,
          },
    ) + '\n',
  );
  process.exitCode = 1;
}
