import { Store } from '../store/database.js';
import { type Responses } from '../contracts/index.js';
type Receipt = Responses['wg_browser_navigate']['data'];
/** Uses the existing private transactional receipt store; no raw inputs or hashes of input values. */
export declare class AttemptJournal {
    private readonly store;
    private readonly app;
    constructor(store: Store, app: string);
    read(execution: string): Receipt | undefined;
    replay(execution: string, tool: string, metadata: unknown): Receipt | undefined;
    reserve(request: string, tool: string, metadata: unknown, receipt: Receipt): void;
    finish(request: string, receipt: Receipt): void;
}
export {};
