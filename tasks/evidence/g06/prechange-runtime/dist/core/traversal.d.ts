import type { z } from 'zod';
import { contracts } from '../contracts/index.js';
import { Store } from '../store/database.js';
import type { Selection } from './query.js';
type Query = z.output<typeof contracts.wg_query.input>;
type Traversal = Extract<Query, {
    mode: 'path' | 'flow';
}>;
export declare function traverse(store: Store, q: Traversal, scope: string): Selection;
export {};
