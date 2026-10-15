import { type Responses } from '../contracts/index.js';
import { Store } from '../store/database.js';
export declare function planRefresh(store: Store, input: unknown, now?: number): Responses['wg_plan_refresh'];
