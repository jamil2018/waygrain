#!/usr/bin/env node
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
  } else {
    throw new ConfigurationError('INVALID_CONFIG');
  }
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  // No raw filesystem errors, settings content or caller arguments in diagnostics.
  process.stderr.write(
    JSON.stringify({ error: filesystemError(error).code }) + '\n',
  );
  process.exitCode = 1;
}
