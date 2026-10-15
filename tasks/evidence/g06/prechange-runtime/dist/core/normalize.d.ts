import type { z } from 'zod';
import { capture as captureSchema } from '../contracts/capture.js';
import type { Configuration } from '../config/schema.js';
export declare const NORMALIZATION_VERSION = 1;
export type Capture = z.output<typeof captureSchema>;
export type AppConfiguration = Configuration['apps'][number];
export declare class KnowledgeError extends Error {
    readonly code: 'UNKNOWN_SCOPE' | 'NOT_FOUND' | 'INCOMPATIBLE_CAPTURE' | 'UNSUPPORTED_FORMAT' | 'UNSUPPORTED_SCHEMA' | 'STORE_BUSY' | 'STORE_CORRUPT' | 'STORAGE_LIMIT' | 'CONFLICT' | 'IDEMPOTENCY_CONFLICT' | 'BUDGET_EXCEEDED' | 'CURSOR_STALE' | 'INVALID_INPUT';
    constructor(code: 'UNKNOWN_SCOPE' | 'NOT_FOUND' | 'INCOMPATIBLE_CAPTURE' | 'UNSUPPORTED_FORMAT' | 'UNSUPPORTED_SCHEMA' | 'STORE_BUSY' | 'STORE_CORRUPT' | 'STORAGE_LIMIT' | 'CONFLICT' | 'IDEMPOTENCY_CONFLICT' | 'BUDGET_EXCEEDED' | 'CURSOR_STALE' | 'INVALID_INPUT');
    toJSON(): {
        schema_version: number;
        error: {
            code: "INVALID_INPUT" | "UNKNOWN_SCOPE" | "NOT_FOUND" | "INCOMPATIBLE_CAPTURE" | "UNSUPPORTED_FORMAT" | "UNSUPPORTED_SCHEMA" | "STORE_BUSY" | "STORE_CORRUPT" | "STORAGE_LIMIT" | "CONFLICT" | "IDEMPOTENCY_CONFLICT" | "BUDGET_EXCEEDED" | "CURSOR_STALE";
            message: string;
            field_paths: never[];
        };
    };
}
export declare function canonical(value: unknown): string;
export declare const digest: (value: unknown) => string;
/** Input must pass strict public validation first. No raw fields or input values are accepted. */
export declare function normalizeCapture(input: Capture, app: AppConfiguration): {
    capture: {
        captured_at: string;
        trace_id: string;
        trace_seq: number;
        session_id: string;
        tab_id: string;
        source: {
            producer: string;
            producer_version: string;
            format: string;
            format_version: string;
        };
        scope: {
            environment: string;
            origin: string;
            role: string;
            account_scope: string;
            locale: string;
        };
        view: {
            route_template: string;
            selected_tabs: string[];
            modal_stack: string[];
            feature_variants: {
                name: string;
                variant: string;
            }[];
        };
        tree: {
            role: string;
            name: string;
            enabled: boolean;
            visible: boolean;
            children: /*elided*/ any[];
            selected?: boolean | undefined;
            locator_hint?: {
                kind: "accessible_name" | "test_id";
                hint: string;
                source: {
                    producer: string;
                    producer_version: string;
                    format: string;
                    format_version: string;
                };
                observed_at: string;
            } | undefined;
        };
        coverage: {
            kind: "complete";
            subtree: "root";
        } | {
            kind: "partial";
            subtree: string;
            reason: "truncated" | "unsupported" | "subtree_only";
        };
        redaction_profile: {
            alias: string;
            version: number;
        };
    };
    redaction_summary: {
        dropped_fields: number;
        dropped_texts: number;
        profile: {
            alias: string;
            version: number;
        };
    };
};
export declare function stateProjection(capture: Capture, screenId: string): {
    normalization_version: number;
    redaction_profile: {
        alias: string;
        version: number;
    };
    screen_id: string;
    scope: {
        environment: string;
        origin: string;
        role: string;
        account_scope: string;
        locale: string;
    };
    view: {
        route_template: string;
        selected_tabs: string[];
        modal_stack: string[];
        feature_variants: {
            name: string;
            variant: string;
        }[];
    };
    tree: unknown;
};
export declare function safeScreenName(name: string, app: AppConfiguration, profile: Capture['redaction_profile']): string;
export declare function errorResponse(error: unknown): {
    schema_version: number;
    error: {
        code: "INVALID_INPUT" | "UNKNOWN_SCOPE" | "NOT_FOUND" | "INCOMPATIBLE_CAPTURE" | "UNSUPPORTED_FORMAT" | "UNSUPPORTED_SCHEMA" | "STORE_BUSY" | "STORE_CORRUPT" | "STORAGE_LIMIT" | "CONFLICT" | "IDEMPOTENCY_CONFLICT" | "BUDGET_EXCEEDED" | "CURSOR_STALE";
        message: string;
        field_paths: never[];
    };
} | {
    schema_version: number;
    error: {
        code: "INVALID_INPUT" | "UNSUPPORTED_SCHEMA" | "LIMIT_EXCEEDED";
        message: "Contract request rejected";
        field_paths: (string | number)[][];
    };
};
