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
    JSON.stringify({
      error:
        error instanceof RuntimeError
          ? error.code
          : filesystemError(error).code,
    }) + '\n',
  );
  process.exitCode = 1;
}
