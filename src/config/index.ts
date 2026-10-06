import { randomUUID } from 'node:crypto';
import { lstat, mkdir, rmdir, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import {
  checkDirectoryChain,
  checkPrivateEntry,
  filesystemError,
  readJsonFile,
  validateAbsolutePath,
} from './filesystem.js';
import {
  ConfigurationError,
  MAX_CONFIGURATION_BYTES,
  validateConfiguration,
  validateSettings,
} from './schema.js';

function paths(configPath: string) {
  validateAbsolutePath(configPath);
  if (basename(configPath) !== 'config.json')
    throw new ConfigurationError('INVALID_PATH');
  const directory = dirname(configPath);
  const storageDirectory = join(directory, 'storage');
  return {
    configPath,
    directory,
    storageDirectory,
    databasePath: join(storageDirectory, 'knowledge.sqlite'),
    coordinationPath: join(storageDirectory, 'coordination.sqlite'),
  };
}

/** Explicitly creates a new dedicated directory. Existing locations are never adopted. */
export async function initializeConfiguration(
  configPath: string,
  input: unknown,
) {
  try {
    const location = paths(configPath);
    const settings = validateSettings(input);
    const configuration = validateConfiguration({
      ...settings,
      schema_version: 1,
      project_id: randomUUID(),
      apps: settings.apps.map((app) => ({ ...app, app_id: randomUUID() })),
    });
    const serialized = JSON.stringify(configuration, null, 2) + '\n';
    if (Buffer.byteLength(serialized) > MAX_CONFIGURATION_BYTES)
      throw new ConfigurationError('INVALID_CONFIG');
    await checkDirectoryChain(dirname(location.directory));
    await mkdir(location.directory, { mode: 0o700 });
    let storageCreated = false;
    let configCreated = false;
    try {
      await checkPrivateEntry(location.directory, true);
      await mkdir(location.storageDirectory, { mode: 0o700 });
      storageCreated = true;
      await checkPrivateEntry(location.storageDirectory, true);
      await writeFile(configPath, serialized, { mode: 0o600, flag: 'wx' });
      configCreated = true;
      await checkPrivateEntry(configPath, false);
    } catch (error) {
      // Remove only entries created by this call, never recursively delete neighbors.
      if (configCreated) await unlink(configPath).catch(() => undefined);
      if (storageCreated)
        await rmdir(location.storageDirectory).catch(() => undefined);
      await rmdir(location.directory).catch(() => undefined);
      throw error;
    }
    return Object.freeze({
      project_id: configuration.project_id,
      app_ids: configuration.apps.map((app) => app.app_id),
    });
  } catch (error) {
    throw filesystemError(error);
  }
}

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Startup-only selection. No tool input is accepted or used to choose storage paths. */
export async function loadConfiguration(configPath: string) {
  try {
    const location = paths(configPath);
    await checkDirectoryChain(location.storageDirectory);
    await checkPrivateEntry(location.directory, true);
    await checkPrivateEntry(location.storageDirectory, true);
    const configuration = validateConfiguration(
      await readJsonFile(configPath, true),
    );
    for (const name of [
      'knowledge.sqlite',
      'knowledge.sqlite-wal',
      'knowledge.sqlite-shm',
      'coordination.sqlite',
      'coordination.sqlite-wal',
      'coordination.sqlite-shm',
    ]) {
      const path = join(location.storageDirectory, name);
      try {
        await lstat(path);
      } catch (error) {
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'ENOENT'
        )
          continue;
        throw error;
      }
      await checkPrivateEntry(path, false);
    }
    return freeze({ configuration, ...location });
  } catch (error) {
    throw filesystemError(error);
  }
}
