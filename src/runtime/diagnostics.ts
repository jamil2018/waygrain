import { access, constants } from 'node:fs/promises';
import { chromium } from 'playwright';
import { loadConfiguration } from '../config/index.js';
import { smokeSqlite } from './index.js';

/** Explicit disposable SQLite probe; no graph migration or browser launch. */
export async function diagnose(configPath: string) {
  const { configuration, storageDirectory } =
    await loadConfiguration(configPath);
  await smokeSqlite(storageDirectory);
  let browserInstalled = false;
  try {
    await access(chromium.executablePath(), constants.X_OK);
    browserInstalled = true;
  } catch {
    // Only a bounded availability flag leaves this probe, never host paths.
  }
  return {
    status: browserInstalled
      ? 'ready_for_runtime_probe'
      : 'needs_browser_install',
    node_supported: /^(24|26)\./.test(process.versions.node),
    configuration: 'valid',
    project_id: configuration.project_id,
    sqlite: 'disk_wal',
    browser_installed: browserInstalled,
    browser_launch: 'not_tested',
    host_integration: 'not_tested',
  };
}
