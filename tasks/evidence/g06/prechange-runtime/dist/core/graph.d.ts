import type { z } from 'zod';
import { scope, recordKind, reference } from '../contracts/common.js';
import { annotation, RELATION_ENDPOINTS } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { type AppConfiguration } from './normalize.js';
export type Scope = z.output<typeof scope>;
export type RecordKind = z.output<typeof recordKind>;
export type Reference = z.output<typeof reference>;
export interface RecordRow {
    id: string;
    app_id: string;
    scope_id: string;
    kind: RecordKind;
    created_revision: number;
}
type AnnotationInput = z.output<typeof annotation>;
export type Annotation = Omit<AnnotationInput, 'target_id' | 'evidence_ids' | 'test_run_id'> & {
    target_id: string;
    evidence_ids: string[];
    test_run_id?: string;
    revision: number;
    supersedes_id: string | null;
};
export declare function record(store: Store, app: string, id: string, kind?: RecordKind): RecordRow;
export declare function scopeId(store: Store, app: AppConfiguration, value: Scope, allowEmpty?: boolean): string;
export declare function safeProse(app: AppConfiguration, value: string): string;
export declare function graphPayload<T>(store: Store, id: string): T;
export declare function putGraph(store: Store, app: string, scope: string, kind: RecordKind, payload: unknown, revision: number, now: number, id?: string): string;
export declare function relate(store: Store, app: string, source: string, target: string, type: keyof typeof RELATION_ENDPOINTS): void;
export declare function supports(store: Store, app: string, evidence: string, target: string): boolean;
export {};
