import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { format } from 'prettier';

const plugin = JSON.parse(await readFile('plugin.json', 'utf8'));
const portable = JSON.parse(await readFile('mcp.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (plugin.name !== pkg.name || plugin.version !== pkg.version)
  throw new Error('Plugin/package identity mismatch');
await mkdir('.codex-plugin', { recursive: true });
await writeFile(
  '.codex-plugin/plugin.json',
  await format(
    JSON.stringify(
      {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        skills: './skills/',
        mcpServers: './.mcp.json',
        ...plugin.extensions['com.openai'],
      },
      null,
      2,
    ),
    { parser: 'json' },
  ),
);
await writeFile(
  '.mcp.json',
  await format(
    JSON.stringify(
      {
        mcpServers: Object.fromEntries(
          Object.entries(portable.mcpServers).map(([name, entry]) => {
            const { type, ...server } = entry;
            if (type !== 'stdio')
              throw new Error('Unsupported bundled transport');
            return [name, server];
          }),
        ),
      },
      null,
      2,
    ),
    { parser: 'json' },
  ),
);
