import type { z } from 'zod';
import { actionEvent, operation } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { type Scope, type Reference } from './graph.js';
import type { AppConfiguration } from './normalize.js';
type Operation = z.output<typeof operation>;
export type Action = Omit<Extract<Operation, {
    op: 'create_action';
}>, 'op' | 'client_ref' | 'state_id' | 'control_id'> & {
    state_id: string;
    control_id: string | null;
};
export type ActionEvent = Omit<z.output<typeof actionEvent>, 'action_id' | 'before_capture_id' | 'after_capture_id'> & {
    action_id: string;
    before_capture_id: string;
    after_capture_id: string | null;
};
export type Transition = Omit<Extract<Operation, {
    op: 'create_transition';
}>, 'op' | 'client_ref' | 'source_state_id' | 'action_id' | 'target_state_id' | 'before_capture_id' | 'after_capture_id' | 'action_event_id' | 'test_run_id'> & {
    source_state_id: string;
    action_id: string;
    target_state_id: string;
    before_capture_id: string;
    after_capture_id: string;
    action_event_id: string;
    test_run_id?: string;
};
interface CaptureRow {
    id: string;
    app_id: string;
    scope_id: string;
    state_id: string | null;
    coverage: string;
    trace_id: string;
    trace_seq: number;
    session_id: string;
    tab_id: string;
    captured_at: string;
}
export declare function captureRow(store: Store, app: string, id: string): CaptureRow;
export declare function requireTraceSlot(store: Store, app: string, scope: string, trace: {
    trace_id: string;
    trace_seq: number;
    session_id: string;
    tab_id: string;
}): void;
export declare function traceOperation(store: Store, app: AppConfiguration, op: Operation, resolve: (ref: Reference) => string, revision: number, now: number, id: string, deferred: (ref: Reference) => string): string;
export declare function scopeForRecord(store: Store, id: string): Scope;
export declare function sameScope(a: Scope, b: Scope): boolean;
export {};
