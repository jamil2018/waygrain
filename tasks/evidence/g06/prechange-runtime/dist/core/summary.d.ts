import type { Responses } from '../contracts/index.js';
import { Store } from '../store/database.js';
import { type Annotation } from './graph.js';
export declare const visibleSql: (alias: string) => string;
export declare function visible(store: Store, id: string): boolean;
export declare function activeAnnotations(store: Store, target: string): {
    id: string;
    annotation: Annotation;
}[];
export declare function summary(store: Store, app: string, id: string, now: number, maxAge: number): Extract<Responses['wg_query']['data'], {
    status: 'complete';
}>['records'][number];
