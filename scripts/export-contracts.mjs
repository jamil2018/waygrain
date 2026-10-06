import { URL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { contractJsonSchemas, LIMITS } from '../dist/contracts/index.js';

// Dist-only generated artifact; definitions and TypeScript types live in src/contracts.
await writeFile(
  new URL('../dist/contracts/schemas.json', import.meta.url),
  JSON.stringify(
    {
      schema_version: 1,
      browser_schema_version: 1,
      limits: LIMITS,
      tools: contractJsonSchemas(),
    },
    null,
    2,
  ) + '\n',
);
