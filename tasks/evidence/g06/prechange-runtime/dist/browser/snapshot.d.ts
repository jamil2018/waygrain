import type { Page } from 'playwright';
import { type Responses } from '../contracts/index.js';
import { type AppConfiguration } from '../core/normalize.js';
import { type PageBinding } from './protocol.js';
type Snapshot = Responses['wg_browser_snapshot']['data'];
/** Returns only a configured template; actual paths/query/fragment never leave worker memory. */
export declare function mappedRoute(url: string, app: AppConfiguration, origin: string): string;
/** Public Playwright JSON only, never YAML parsing. Pure mapper is tested with synthetic input. */
export declare function mapSnapshot(raw: unknown, app: AppConfiguration, binding: PageBinding, route: string, trace: string, seq: number, now?: string, frames?: boolean): Snapshot;
export declare function snapshotPage(page: Page, app: AppConfiguration, binding: PageBinding, trace: string, seq: number): Promise<Snapshot>;
export {};
