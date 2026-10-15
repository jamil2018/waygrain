import { z } from 'zod';
export declare const KNOWLEDGE_SCHEMA_VERSION = 1;
export declare const BROWSER_SCHEMA_VERSION = 1;
export declare const LIMITS: Readonly<{
    ingest_bytes: number;
    tree_nodes: 5000;
    tree_depth: 64;
    text_bytes: 4096;
    commit_operations: 100;
    default_records: 20;
    max_records: 50;
    default_output_bytes: 8192;
    max_neighbor_hops: 3;
    max_path_depth: 8;
    max_visited_nodes: 500;
    future_tolerance_ms: 300000;
    default_max_age_seconds: 86400;
}>;
export declare const id: z.ZodUUID;
export declare const key: z.ZodString;
export declare const alias: z.ZodString;
export declare const text: z.ZodString;
export declare const timestamp: z.ZodISODateTime;
export declare const revision: z.ZodNumber;
export declare const hash: z.ZodString;
export declare const origin: z.ZodURL;
export declare const route: z.ZodString;
export declare const scope: z.ZodObject<{
    environment: z.ZodString;
    origin: z.ZodURL;
    role: z.ZodDefault<z.ZodString>;
    account_scope: z.ZodString;
    locale: z.ZodString;
}, z.core.$strict>;
export declare const baseRequest: {
    schema_version: z.ZodLiteral<1>;
    project_id: z.ZodUUID;
    app_id: z.ZodUUID;
};
export declare const writeRequest: {
    request_id: z.ZodString;
    schema_version: z.ZodLiteral<1>;
    project_id: z.ZodUUID;
    app_id: z.ZodUUID;
};
export declare const browserRequest: {
    browser_schema_version: z.ZodLiteral<1>;
    schema_version: z.ZodLiteral<1>;
    project_id: z.ZodUUID;
    app_id: z.ZodUUID;
};
export declare const evidenceClass: z.ZodEnum<{
    observed: "observed";
    inferred: "inferred";
    test_verified: "test_verified";
}>;
export declare const recordKind: z.ZodEnum<{
    state: "state";
    transition: "transition";
    screen: "screen";
    annotation: "annotation";
    action: "action";
    control: "control";
    flow: "flow";
    capture: "capture";
    action_event: "action_event";
    test_run: "test_run";
}>;
export declare const ids: z.ZodArray<z.ZodUUID>;
export declare const reference: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"existing">;
    id: z.ZodUUID;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"local">;
    client_ref: z.ZodString;
}, z.core.$strict>], "kind">;
export declare const warning: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    affected_ids: z.ZodArray<z.ZodUUID>;
}, z.core.$strict>;
export declare const errorCode: z.ZodEnum<{
    INVALID_INPUT: "INVALID_INPUT";
    UNKNOWN_SCOPE: "UNKNOWN_SCOPE";
    NOT_FOUND: "NOT_FOUND";
    INCOMPATIBLE_CAPTURE: "INCOMPATIBLE_CAPTURE";
    UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT";
    UNSUPPORTED_SCHEMA: "UNSUPPORTED_SCHEMA";
    STORE_BUSY: "STORE_BUSY";
    STORE_CORRUPT: "STORE_CORRUPT";
    STORAGE_LIMIT: "STORAGE_LIMIT";
    LIMIT_EXCEEDED: "LIMIT_EXCEEDED";
    CONFLICT: "CONFLICT";
    IDEMPOTENCY_CONFLICT: "IDEMPOTENCY_CONFLICT";
    BUDGET_EXCEEDED: "BUDGET_EXCEEDED";
    CURSOR_STALE: "CURSOR_STALE";
    BROWSER_UNAVAILABLE: "BROWSER_UNAVAILABLE";
    SESSION_CLOSED: "SESSION_CLOSED";
    STALE_TARGET: "STALE_TARGET";
    AMBIGUOUS_TARGET: "AMBIGUOUS_TARGET";
    ORIGIN_NOT_ALLOWED: "ORIGIN_NOT_ALLOWED";
    CREDENTIAL_FIELD: "CREDENTIAL_FIELD";
    ACTION_NOT_ALLOWED: "ACTION_NOT_ALLOWED";
    EXECUTION_CONFLICT: "EXECUTION_CONFLICT";
    UNKNOWN_OUTCOME: "UNKNOWN_OUTCOME";
    APPLICATION_ERROR: "APPLICATION_ERROR";
    ACTION_TIMEOUT: "ACTION_TIMEOUT";
    ACTION_CANCELLED: "ACTION_CANCELLED";
}>;
export declare const errorSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<1>;
    error: z.ZodObject<{
        code: z.ZodEnum<{
            INVALID_INPUT: "INVALID_INPUT";
            UNKNOWN_SCOPE: "UNKNOWN_SCOPE";
            NOT_FOUND: "NOT_FOUND";
            INCOMPATIBLE_CAPTURE: "INCOMPATIBLE_CAPTURE";
            UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT";
            UNSUPPORTED_SCHEMA: "UNSUPPORTED_SCHEMA";
            STORE_BUSY: "STORE_BUSY";
            STORE_CORRUPT: "STORE_CORRUPT";
            STORAGE_LIMIT: "STORAGE_LIMIT";
            LIMIT_EXCEEDED: "LIMIT_EXCEEDED";
            CONFLICT: "CONFLICT";
            IDEMPOTENCY_CONFLICT: "IDEMPOTENCY_CONFLICT";
            BUDGET_EXCEEDED: "BUDGET_EXCEEDED";
            CURSOR_STALE: "CURSOR_STALE";
            BROWSER_UNAVAILABLE: "BROWSER_UNAVAILABLE";
            SESSION_CLOSED: "SESSION_CLOSED";
            STALE_TARGET: "STALE_TARGET";
            AMBIGUOUS_TARGET: "AMBIGUOUS_TARGET";
            ORIGIN_NOT_ALLOWED: "ORIGIN_NOT_ALLOWED";
            CREDENTIAL_FIELD: "CREDENTIAL_FIELD";
            ACTION_NOT_ALLOWED: "ACTION_NOT_ALLOWED";
            EXECUTION_CONFLICT: "EXECUTION_CONFLICT";
            UNKNOWN_OUTCOME: "UNKNOWN_OUTCOME";
            APPLICATION_ERROR: "APPLICATION_ERROR";
            ACTION_TIMEOUT: "ACTION_TIMEOUT";
            ACTION_CANCELLED: "ACTION_CANCELLED";
        }>;
        message: z.ZodLiteral<"Contract request rejected">;
        field_paths: z.ZodArray<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const cursor: z.ZodObject<{
    token: z.ZodString;
    store_revision: z.ZodNumber;
}, z.core.$strict>;
export declare const budget: z.ZodObject<{
    records: z.ZodDefault<z.ZodNumber>;
    bytes: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export declare const freshness: z.ZodObject<{
    observed_at: z.ZodISODateTime;
    last_checked_at: z.ZodNullable<z.ZodISODateTime>;
    application_version: z.ZodNullable<z.ZodString>;
    age_seconds: z.ZodNumber;
    scope_match: z.ZodBoolean;
    status: z.ZodEnum<{
        unknown: "unknown";
        recent: "recent";
        stale: "stale";
        contradicted: "contradicted";
    }>;
}, z.core.$strict>;
export declare const source: z.ZodObject<{
    producer: z.ZodString;
    producer_version: z.ZodString;
    format: z.ZodString;
    format_version: z.ZodString;
}, z.core.$strict>;
export declare const profile: z.ZodObject<{
    alias: z.ZodString;
    version: z.ZodNumber;
}, z.core.$strict>;
export declare function envelope<T extends z.ZodType>(data: T): z.ZodObject<{
    schema_version: z.ZodLiteral<1>;
    store_revision: z.ZodNumber;
    data: T;
    warnings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        affected_ids: z.ZodArray<z.ZodUUID>;
    }, z.core.$strict>>;
    next_cursor: z.ZodOptional<z.ZodObject<{
        token: z.ZodString;
        store_revision: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare function browserEnvelope<T extends z.ZodType>(data: T): z.ZodObject<{
    schema_version: z.ZodLiteral<1>;
    store_revision: z.ZodNumber;
    data: T;
    warnings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        affected_ids: z.ZodArray<z.ZodUUID>;
    }, z.core.$strict>>;
    next_cursor: z.ZodOptional<z.ZodObject<{
        token: z.ZodString;
        store_revision: z.ZodNumber;
    }, z.core.$strict>>;
    browser_schema_version: z.ZodLiteral<1>;
}, z.core.$strict>;
