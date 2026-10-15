import type { Responses } from '../contracts/index.js';
import { Store } from '../store/database.js';
export declare function changes(store: Store, input: unknown): Responses['wg_changes'];
