import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import {
  initializeConfiguration,
  loadConfiguration,
} from '../../config/index.js';
import { Store } from '../../store/database.js';
import { descriptorFixture } from '../fixture.js';
import { readBundle, writeBundle } from '../store.js';
import { startDescriptorService } from './server.js';

const args = process.argv.slice(2);
let configPath = resolve(process.cwd(), '.waygrain-descriptor/config.json'),
  empty = false,
  port = 4317,
  authorPort = 4318;
function options() {
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--empty') {
      empty = true;
      continue;
    }
    const value = args[++i];
    if (!value) throw new Error('INVALID_OPTIONS');
    if (flag === '--config') {
      if (!value.startsWith('/')) throw new Error('INVALID_OPTIONS');
      configPath = value;
    } else if (flag === '--port' || flag === '--author-port') {
      if (!/^\d+$/.test(value) || Number(value) > 65535)
        throw new Error('INVALID_OPTIONS');
      if (flag === '--port') port = Number(value);
      else authorPort = Number(value);
    } else throw new Error('INVALID_OPTIONS');
  }
}
async function main() {
  options();
  if (!existsSync(configPath))
    await initializeConfiguration(configPath, {
      project_alias: 'descriptor_demo',
      apps: [
        {
          alias: 'calculator',
          allowed_origins: ['http://127.0.0.1:4317'],
          scopes: [
            {
              alias: 'demo',
              environment: 'demo',
              origin: 'http://127.0.0.1:4317',
              role: 'reader',
              account_scope: 'synthetic',
              locale: 'en',
            },
          ],
          route_mappings: [],
          redaction_profiles: [
            {
              alias: 'synthetic',
              version: 1,
              allowed_labels: [],
              ignored_fields: [],
              unknown_text: 'drop',
            },
          ],
        },
      ],
    });
  const { configuration } = await loadConfiguration(configPath);
  if (
    configuration.project_alias !== 'descriptor_demo' ||
    configuration.apps.length !== 1 ||
    configuration.apps[0]!.alias !== 'calculator'
  )
    throw new Error('DEMO_CONFIGURATION_REQUIRED');
  const store = await Store.open(configPath);
  let service: Awaited<ReturnType<typeof startDescriptorService>> | undefined;
  try {
    const app = configuration.apps[0]!.app_id;
    if (!empty && !readBundle(store, app))
      writeBundle(store, {
        schema_version: 1,
        expected_revision: store.revision,
        bundle: await descriptorFixture(configuration.project_id, app),
      });
    service = await startDescriptorService(store, {
      port,
      authorPort,
    });
    process.stdout.write(
      `Waygrain synthetic local demo: ${service.readURL}\nAuthoring: ${service.authorURL}\nDeterministic offline fixture; public release HOLD.\n`,
    );
    const stop = async () => {
      await service!.close();
      store.close();
    };
    process.once('SIGINT', () => {
      void stop();
    });
    process.once('SIGTERM', () => {
      void stop();
    });
  } catch (error) {
    await service?.close();
    store.close();
    throw error;
  }
}
void main().catch(() => {
  process.stderr.write(
    'Descriptor demo unavailable. Check local ports and private fixture configuration.\n',
  );
  process.exitCode = 1;
});
