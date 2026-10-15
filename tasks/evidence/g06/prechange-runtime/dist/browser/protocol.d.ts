import type { Responses, Requests } from '../contracts/index.js';
import type { AppConfiguration, Capture } from '../core/normalize.js';
export declare const LIFECYCLE_TOOLS: readonly ["wg_browser_open", "wg_browser_status", "wg_browser_snapshot", "wg_browser_navigate", "wg_browser_act", "wg_browser_close"];
export type LifecycleTool = (typeof LIFECYCLE_TOOLS)[number];
export type PageBinding = Responses['wg_browser_open']['data']['page'];
export declare const capabilities: {
    ownership: "ephemeral_owned";
    headed: true;
    persistent_authentication: false;
    actions: ("click" | "fill" | "select" | "check" | "uncheck" | "scroll" | "key")[];
    navigation_keys: ("Tab" | "Shift+Tab" | "ArrowUp" | "ArrowDown" | "Escape")[];
};
export declare class BrowserError extends Error {
    readonly code: import('zod').z.output<typeof import('../contracts/common.js').errorCode>;
    constructor(code: import('zod').z.output<typeof import('../contracts/common.js').errorCode>);
    toJSON(): {
        schema_version: number;
        error: {
            code: "INVALID_INPUT" | "UNKNOWN_SCOPE" | "NOT_FOUND" | "INCOMPATIBLE_CAPTURE" | "UNSUPPORTED_FORMAT" | "UNSUPPORTED_SCHEMA" | "STORE_BUSY" | "STORE_CORRUPT" | "STORAGE_LIMIT" | "LIMIT_EXCEEDED" | "CONFLICT" | "IDEMPOTENCY_CONFLICT" | "BUDGET_EXCEEDED" | "CURSOR_STALE" | "BROWSER_UNAVAILABLE" | "SESSION_CLOSED" | "STALE_TARGET" | "AMBIGUOUS_TARGET" | "ORIGIN_NOT_ALLOWED" | "CREDENTIAL_FIELD" | "ACTION_NOT_ALLOWED" | "EXECUTION_CONFLICT" | "UNKNOWN_OUTCOME" | "APPLICATION_ERROR" | "ACTION_TIMEOUT" | "ACTION_CANCELLED";
            message: string;
            field_paths: never[];
        };
    };
}
export interface WorkerRequest {
    id: number;
    command: 'open' | 'status' | 'close' | 'snapshot' | 'prepare_navigate' | 'navigate' | 'prepare_act' | 'act' | 'cancel';
    action?: Requests['wg_browser_act'];
    navigation?: Requests['wg_browser_navigate'];
    execution_id?: string;
    app?: AppConfiguration;
    page?: PageBinding;
}
export interface WorkerReply {
    id: number;
    data?: {
        status: 'open' | 'closed';
        cleanup?: 'complete' | 'unconfirmed';
        snapshot?: Responses['wg_browser_snapshot']['data'];
        receipt?: Responses['wg_browser_navigate']['data'];
    };
    error?: BrowserError['code'];
}
export type SanitizedCapture = Capture;
