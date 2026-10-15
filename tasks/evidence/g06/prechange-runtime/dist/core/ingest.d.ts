import type { z } from 'zod';
import { contracts } from '../contracts/index.js';
import { Store } from '../store/database.js';
import { type AppConfiguration } from './normalize.js';
type IngestResponse = z.output<typeof contracts.wg_ingest.output>;
export declare function selectedApp(store: Store, request: {
    project_id: string;
    app_id: string;
}): AppConfiguration;
export declare function ingest(store: Store, input: unknown, now?: number): IngestResponse;
export {};
