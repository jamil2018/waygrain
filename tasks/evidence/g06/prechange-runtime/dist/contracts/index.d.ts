import { z } from 'zod';
export * from './common.js';
export * from './capture.js';
export * from './operations.js';
export * from './records.js';
export * from './browser.js';
export declare const contracts: {
    readonly wg_browser_open: {
        readonly input: z.ZodObject<{
            request_id: z.ZodString;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                status: z.ZodLiteral<"open">;
                page: z.ZodObject<{
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                capabilities: z.ZodObject<{
                    ownership: z.ZodLiteral<"ephemeral_owned">;
                    headed: z.ZodLiteral<true>;
                    persistent_authentication: z.ZodLiteral<false>;
                    actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    navigation_keys: z.ZodArray<z.ZodEnum<{
                        Tab: "Tab";
                        "Shift+Tab": "Shift+Tab";
                        ArrowUp: "ArrowUp";
                        ArrowDown: "ArrowDown";
                        Escape: "Escape";
                    }>>;
                }, z.core.$strict>;
            }, z.core.$strict>;
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
    };
    readonly wg_browser_snapshot: {
        readonly input: z.ZodObject<{
            session_id: z.ZodUUID;
            page_id: z.ZodUUID;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                capture: z.ZodObject<{
                    captured_at: z.ZodISODateTime;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    source: z.ZodObject<{
                        producer: z.ZodString;
                        producer_version: z.ZodString;
                        format: z.ZodString;
                        format_version: z.ZodString;
                    }, z.core.$strict>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    view: z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    tree: z.ZodObject<{
                        role: z.ZodString;
                        name: z.ZodString;
                        enabled: z.ZodBoolean;
                        visible: z.ZodBoolean;
                        selected: z.ZodOptional<z.ZodBoolean>;
                        locator_hint: z.ZodOptional<z.ZodObject<{
                            kind: z.ZodEnum<{
                                accessible_name: "accessible_name";
                                test_id: "test_id";
                            }>;
                            hint: z.ZodString;
                            source: z.ZodObject<{
                                producer: z.ZodString;
                                producer_version: z.ZodString;
                                format: z.ZodString;
                                format_version: z.ZodString;
                            }, z.core.$strict>;
                            observed_at: z.ZodISODateTime;
                        }, z.core.$strict>>;
                        children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                    }, z.core.$strict>;
                    coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"complete">;
                        subtree: z.ZodLiteral<"root">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"partial">;
                        subtree: z.ZodString;
                        reason: z.ZodEnum<{
                            truncated: "truncated";
                            unsupported: "unsupported";
                            subtree_only: "subtree_only";
                        }>;
                    }, z.core.$strict>], "kind">;
                    redaction_profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                targets: z.ZodArray<z.ZodObject<{
                    target_id: z.ZodUUID;
                    role: z.ZodString;
                    name: z.ZodString;
                    permitted_actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    option_ids: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
                }, z.core.$strict>>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
            }, z.core.$strict>;
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
    };
    readonly wg_browser_navigate: {
        readonly input: z.ZodObject<{
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            url: z.ZodURL;
            session_id: z.ZodUUID;
            page_id: z.ZodUUID;
            snapshot_id: z.ZodUUID;
            request_id: z.ZodString;
            execution_id: z.ZodString;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"not_started">;
                after_snapshot_id: z.ZodNull;
                dispatch: z.ZodLiteral<"not_dispatched">;
                error_code: z.ZodNullable<z.ZodEnum<{
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
                }>>;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"pending">;
                dispatch: z.ZodEnum<{
                    not_dispatched: "not_dispatched";
                    dispatched: "dispatched";
                }>;
                error_code: z.ZodNull;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"succeeded">;
                dispatch: z.ZodLiteral<"dispatched">;
                error_code: z.ZodNull;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"failed">;
                dispatch: z.ZodLiteral<"dispatched">;
                error_code: z.ZodEnum<{
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
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"unknown">;
                dispatch: z.ZodEnum<{
                    dispatched: "dispatched";
                    uncertain: "uncertain";
                }>;
                error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>], "state">;
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
    };
    readonly wg_browser_act: {
        readonly input: z.ZodObject<{
            request_id: z.ZodString;
            execution_id: z.ZodString;
            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"click">;
            }, z.core.$strict>, z.ZodObject<{
                text: z.ZodString;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"fill">;
            }, z.core.$strict>, z.ZodObject<{
                option_id: z.ZodUUID;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"select">;
            }, z.core.$strict>, z.ZodObject<{
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"check">;
            }, z.core.$strict>, z.ZodObject<{
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"uncheck">;
            }, z.core.$strict>, z.ZodObject<{
                axis: z.ZodEnum<{
                    vertical: "vertical";
                    horizontal: "horizontal";
                }>;
                delta: z.ZodNumber;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"scroll">;
            }, z.core.$strict>, z.ZodObject<{
                key: z.ZodEnum<{
                    Tab: "Tab";
                    "Shift+Tab": "Shift+Tab";
                    ArrowUp: "ArrowUp";
                    ArrowDown: "ArrowDown";
                    Escape: "Escape";
                }>;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"key">;
            }, z.core.$strict>], "kind">;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"not_started">;
                after_snapshot_id: z.ZodNull;
                dispatch: z.ZodLiteral<"not_dispatched">;
                error_code: z.ZodNullable<z.ZodEnum<{
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
                }>>;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"pending">;
                dispatch: z.ZodEnum<{
                    not_dispatched: "not_dispatched";
                    dispatched: "dispatched";
                }>;
                error_code: z.ZodNull;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"succeeded">;
                dispatch: z.ZodLiteral<"dispatched">;
                error_code: z.ZodNull;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"failed">;
                dispatch: z.ZodLiteral<"dispatched">;
                error_code: z.ZodEnum<{
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
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"unknown">;
                dispatch: z.ZodEnum<{
                    dispatched: "dispatched";
                    uncertain: "uncertain";
                }>;
                error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>], "state">;
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
    };
    readonly wg_browser_status: {
        readonly input: z.ZodObject<{
            session_id: z.ZodOptional<z.ZodUUID>;
            execution_id: z.ZodOptional<z.ZodString>;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"closed">;
                page: z.ZodNull;
                capabilities: z.ZodObject<{
                    ownership: z.ZodLiteral<"ephemeral_owned">;
                    headed: z.ZodLiteral<true>;
                    persistent_authentication: z.ZodLiteral<false>;
                    actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    navigation_keys: z.ZodArray<z.ZodEnum<{
                        Tab: "Tab";
                        "Shift+Tab": "Shift+Tab";
                        ArrowUp: "ArrowUp";
                        ArrowDown: "ArrowDown";
                        Escape: "Escape";
                    }>>;
                }, z.core.$strict>;
                attempts: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    state: z.ZodLiteral<"not_started">;
                    after_snapshot_id: z.ZodNull;
                    dispatch: z.ZodLiteral<"not_dispatched">;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"pending">;
                    dispatch: z.ZodEnum<{
                        not_dispatched: "not_dispatched";
                        dispatched: "dispatched";
                    }>;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"succeeded">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"failed">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodEnum<{
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
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"unknown">;
                    dispatch: z.ZodEnum<{
                        dispatched: "dispatched";
                        uncertain: "uncertain";
                    }>;
                    error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>], "state">>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"open">;
                page: z.ZodObject<{
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                capabilities: z.ZodObject<{
                    ownership: z.ZodLiteral<"ephemeral_owned">;
                    headed: z.ZodLiteral<true>;
                    persistent_authentication: z.ZodLiteral<false>;
                    actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    navigation_keys: z.ZodArray<z.ZodEnum<{
                        Tab: "Tab";
                        "Shift+Tab": "Shift+Tab";
                        ArrowUp: "ArrowUp";
                        ArrowDown: "ArrowDown";
                        Escape: "Escape";
                    }>>;
                }, z.core.$strict>;
                attempts: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    state: z.ZodLiteral<"not_started">;
                    after_snapshot_id: z.ZodNull;
                    dispatch: z.ZodLiteral<"not_dispatched">;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"pending">;
                    dispatch: z.ZodEnum<{
                        not_dispatched: "not_dispatched";
                        dispatched: "dispatched";
                    }>;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"succeeded">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"failed">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodEnum<{
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
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"unknown">;
                    dispatch: z.ZodEnum<{
                        dispatched: "dispatched";
                        uncertain: "uncertain";
                    }>;
                    error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>], "state">>;
            }, z.core.$strict>], "status">;
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
    };
    readonly wg_browser_close: {
        readonly input: z.ZodObject<{
            request_id: z.ZodString;
            session_id: z.ZodUUID;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                status: z.ZodLiteral<"closed">;
                session_id: z.ZodUUID;
                cleanup: z.ZodEnum<{
                    complete: "complete";
                    unconfirmed: "unconfirmed";
                }>;
            }, z.core.$strict>;
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
    };
    readonly wg_status: {
        readonly input: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                store_schema_version: z.ZodNumber;
                supported_schema_versions: z.ZodTuple<[z.ZodLiteral<1>], null>;
                capabilities: z.ZodArray<z.ZodEnum<{
                    ingest: "ingest";
                    query: "query";
                    changes: "changes";
                    evidence: "evidence";
                    refresh_plan: "refresh_plan";
                }>>;
                counts: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
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
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                byte_usage: z.ZodObject<{
                    database: z.ZodNumber;
                    wal: z.ZodNumber;
                    cap: z.ZodNumber;
                }, z.core.$strict>;
                ingest_formats: z.ZodArray<z.ZodObject<{
                    format: z.ZodString;
                    version: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
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
    };
    readonly wg_ingest: {
        readonly input: z.ZodObject<{
            screen_ref: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"existing">;
                screen_id: z.ZodUUID;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"new">;
                name: z.ZodString;
                view_key: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "kind">;
            capture: z.ZodObject<{
                captured_at: z.ZodISODateTime;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                session_id: z.ZodString;
                tab_id: z.ZodString;
                source: z.ZodObject<{
                    producer: z.ZodString;
                    producer_version: z.ZodString;
                    format: z.ZodString;
                    format_version: z.ZodString;
                }, z.core.$strict>;
                scope: z.ZodObject<{
                    environment: z.ZodString;
                    origin: z.ZodURL;
                    role: z.ZodDefault<z.ZodString>;
                    account_scope: z.ZodString;
                    locale: z.ZodString;
                }, z.core.$strict>;
                view: z.ZodObject<{
                    route_template: z.ZodString;
                    selected_tabs: z.ZodArray<z.ZodString>;
                    modal_stack: z.ZodArray<z.ZodString>;
                    feature_variants: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        variant: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                tree: z.ZodObject<{
                    role: z.ZodString;
                    name: z.ZodString;
                    enabled: z.ZodBoolean;
                    visible: z.ZodBoolean;
                    selected: z.ZodOptional<z.ZodBoolean>;
                    locator_hint: z.ZodOptional<z.ZodObject<{
                        kind: z.ZodEnum<{
                            accessible_name: "accessible_name";
                            test_id: "test_id";
                        }>;
                        hint: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        observed_at: z.ZodISODateTime;
                    }, z.core.$strict>>;
                    children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                }, z.core.$strict>;
                coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"complete">;
                    subtree: z.ZodLiteral<"root">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"partial">;
                    subtree: z.ZodString;
                    reason: z.ZodEnum<{
                        truncated: "truncated";
                        unsupported: "unsupported";
                        subtree_only: "subtree_only";
                    }>;
                }, z.core.$strict>], "kind">;
                redaction_profile: z.ZodObject<{
                    alias: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>;
            expected_store_revision: z.ZodOptional<z.ZodNumber>;
            request_id: z.ZodString;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                coverage: z.ZodLiteral<"complete">;
                state_id: z.ZodUUID;
                state_hash: z.ZodString;
                fragment_hash: z.ZodNull;
                screen_id: z.ZodUUID;
                capture_id: z.ZodUUID;
                control_ids: z.ZodArray<z.ZodUUID>;
                redaction_summary: z.ZodObject<{
                    dropped_fields: z.ZodNumber;
                    dropped_texts: z.ZodNumber;
                    profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                coverage: z.ZodLiteral<"partial">;
                state_id: z.ZodNull;
                state_hash: z.ZodNull;
                fragment_hash: z.ZodString;
                control_ids: z.ZodTuple<[], null>;
                screen_id: z.ZodUUID;
                capture_id: z.ZodUUID;
                redaction_summary: z.ZodObject<{
                    dropped_fields: z.ZodNumber;
                    dropped_texts: z.ZodNumber;
                    profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>], "coverage">;
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
    };
    readonly wg_commit: {
        readonly input: z.ZodObject<{
            expected_store_revision: z.ZodNumber;
            operations: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                op: z.ZodLiteral<"create_action">;
                state_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                control_id: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">>;
                verb: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                input_schema: z.ZodObject<{
                    kind: z.ZodEnum<{
                        boolean: "boolean";
                        none: "none";
                        option: "option";
                        text: "text";
                        scroll: "scroll";
                        navigation_key: "navigation_key";
                    }>;
                    required: z.ZodBoolean;
                    max_length: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>;
                preconditions: z.ZodArray<z.ZodString>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"record_action_event">;
                event: z.ZodObject<{
                    action_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    before_capture_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    after_capture_id: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    occurred_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                }, z.core.$strict>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"record_test_run">;
                run: z.ZodObject<{
                    runner: z.ZodString;
                    runner_version: z.ZodString;
                    application_version: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    started_at: z.ZodISODateTime;
                    finished_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        skipped: "skipped";
                        failed: "failed";
                        passed: "passed";
                    }>;
                    assertions: z.ZodArray<z.ZodObject<{
                        target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"existing">;
                            id: z.ZodUUID;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"local">;
                            client_ref: z.ZodString;
                        }, z.core.$strict>], "kind">;
                        assertion: z.ZodString;
                        result: z.ZodEnum<{
                            skipped: "skipped";
                            failed: "failed";
                            passed: "passed";
                        }>;
                        evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"existing">;
                            id: z.ZodUUID;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"local">;
                            client_ref: z.ZodString;
                        }, z.core.$strict>], "kind">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"create_transition">;
                source_state_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                action_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                target_state_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                before_capture_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                after_capture_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                action_event_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                outcome: z.ZodEnum<{
                    error: "error";
                    success: "success";
                    timeout: "timeout";
                    cancelled: "cancelled";
                }>;
                guards: z.ZodArray<z.ZodString>;
                provenance: z.ZodEnum<{
                    observed: "observed";
                    test_verified: "test_verified";
                }>;
                test_run_id: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"create_flow">;
                name: z.ZodString;
                transition_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">>;
                scope: z.ZodObject<{
                    environment: z.ZodString;
                    origin: z.ZodURL;
                    role: z.ZodDefault<z.ZodString>;
                    account_scope: z.ZodString;
                    locale: z.ZodString;
                }, z.core.$strict>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"add_annotation">;
                annotation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "provenance">;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"supersede_annotation">;
                supersedes_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                annotation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "provenance">;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"alias_identity">;
                record_kind: z.ZodEnum<{
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
                from_id: z.ZodUUID;
                to_id: z.ZodUUID;
                rationale: z.ZodString;
                evidence_ids: z.ZodArray<z.ZodUUID>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "op">>;
            request_id: z.ZodString;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                created_ids: z.ZodArray<z.ZodUUID>;
                client_refs: z.ZodArray<z.ZodObject<{
                    client_ref: z.ZodString;
                    id: z.ZodUUID;
                }, z.core.$strict>>;
                new_revision: z.ZodNumber;
            }, z.core.$strict>;
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
    };
    readonly wg_query: {
        readonly input: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"search">;
            filters: z.ZodObject<{
                ids: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
                kinds: z.ZodOptional<z.ZodArray<z.ZodEnum<{
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
                }>>>;
                tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                terms: z.ZodOptional<z.ZodArray<z.ZodString>>;
                name: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"neighbors">;
            target_id: z.ZodUUID;
            hops: z.ZodDefault<z.ZodNumber>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"path">;
            source_state_id: z.ZodUUID;
            target_state_id: z.ZodUUID;
            max_depth: z.ZodDefault<z.ZodNumber>;
            max_visited: z.ZodDefault<z.ZodNumber>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"flow">;
            flow_id: z.ZodUUID;
            max_depth: z.ZodDefault<z.ZodNumber>;
            max_visited: z.ZodDefault<z.ZodNumber>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>], "mode">;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"complete">;
                records: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"screen">;
                    route_template: z.ZodString;
                    creation_revision: z.ZodNumber;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"state">;
                    screen_id: z.ZodUUID;
                    state_hash: z.ZodString;
                    normalization_version: z.ZodString;
                    view: z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"control">;
                    state_id: z.ZodUUID;
                    role: z.ZodString;
                    enabled: z.ZodBoolean;
                    visible: z.ZodBoolean;
                    descriptor: z.ZodString;
                    locator_hint: z.ZodOptional<z.ZodObject<{
                        kind: z.ZodEnum<{
                            accessible_name: "accessible_name";
                            test_id: "test_id";
                        }>;
                        hint: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        observed_at: z.ZodISODateTime;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action">;
                    state_id: z.ZodUUID;
                    control_id: z.ZodNullable<z.ZodUUID>;
                    verb: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    input_schema: z.ZodObject<{
                        kind: z.ZodEnum<{
                            boolean: "boolean";
                            none: "none";
                            option: "option";
                            text: "text";
                            scroll: "scroll";
                            navigation_key: "navigation_key";
                        }>;
                        required: z.ZodBoolean;
                        max_length: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                    preconditions: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"transition">;
                    source_state_id: z.ZodUUID;
                    action_id: z.ZodUUID;
                    target_state_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodUUID;
                    action_event_id: z.ZodUUID;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    guards: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"flow">;
                    transition_ids: z.ZodArray<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    captured_at: z.ZodISODateTime;
                    received_at: z.ZodISODateTime;
                    source: z.ZodObject<{
                        producer: z.ZodString;
                        producer_version: z.ZodString;
                        format: z.ZodString;
                        format_version: z.ZodString;
                    }, z.core.$strict>;
                    redaction_profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action_event">;
                    action_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    occurred_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"test_run">;
                    runner: z.ZodString;
                    runner_version: z.ZodString;
                    application_version: z.ZodString;
                    started_at: z.ZodISODateTime;
                    finished_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        skipped: "skipped";
                        failed: "failed";
                        passed: "passed";
                    }>;
                    assertions: z.ZodArray<z.ZodObject<{
                        target_id: z.ZodUUID;
                        assertion: z.ZodString;
                        result: z.ZodEnum<{
                            skipped: "skipped";
                            failed: "failed";
                            passed: "passed";
                        }>;
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
                guards: z.ZodArray<z.ZodString>;
                applicability: z.ZodEnum<{
                    conditional: "conditional";
                    unconditional: "unconditional";
                    requires_check: "requires_check";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"no_matches">;
                records: z.ZodTuple<[], null>;
                guards: z.ZodTuple<[], null>;
                applicability: z.ZodLiteral<"requires_check">;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"incomplete">;
                records: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"screen">;
                    route_template: z.ZodString;
                    creation_revision: z.ZodNumber;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"state">;
                    screen_id: z.ZodUUID;
                    state_hash: z.ZodString;
                    normalization_version: z.ZodString;
                    view: z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"control">;
                    state_id: z.ZodUUID;
                    role: z.ZodString;
                    enabled: z.ZodBoolean;
                    visible: z.ZodBoolean;
                    descriptor: z.ZodString;
                    locator_hint: z.ZodOptional<z.ZodObject<{
                        kind: z.ZodEnum<{
                            accessible_name: "accessible_name";
                            test_id: "test_id";
                        }>;
                        hint: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        observed_at: z.ZodISODateTime;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action">;
                    state_id: z.ZodUUID;
                    control_id: z.ZodNullable<z.ZodUUID>;
                    verb: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    input_schema: z.ZodObject<{
                        kind: z.ZodEnum<{
                            boolean: "boolean";
                            none: "none";
                            option: "option";
                            text: "text";
                            scroll: "scroll";
                            navigation_key: "navigation_key";
                        }>;
                        required: z.ZodBoolean;
                        max_length: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                    preconditions: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"transition">;
                    source_state_id: z.ZodUUID;
                    action_id: z.ZodUUID;
                    target_state_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodUUID;
                    action_event_id: z.ZodUUID;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    guards: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"flow">;
                    transition_ids: z.ZodArray<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    captured_at: z.ZodISODateTime;
                    received_at: z.ZodISODateTime;
                    source: z.ZodObject<{
                        producer: z.ZodString;
                        producer_version: z.ZodString;
                        format: z.ZodString;
                        format_version: z.ZodString;
                    }, z.core.$strict>;
                    redaction_profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action_event">;
                    action_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    occurred_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"test_run">;
                    runner: z.ZodString;
                    runner_version: z.ZodString;
                    application_version: z.ZodString;
                    started_at: z.ZodISODateTime;
                    finished_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        skipped: "skipped";
                        failed: "failed";
                        passed: "passed";
                    }>;
                    assertions: z.ZodArray<z.ZodObject<{
                        target_id: z.ZodUUID;
                        assertion: z.ZodString;
                        result: z.ZodEnum<{
                            skipped: "skipped";
                            failed: "failed";
                            passed: "passed";
                        }>;
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
                guards: z.ZodArray<z.ZodString>;
                applicability: z.ZodEnum<{
                    conditional: "conditional";
                    requires_check: "requires_check";
                }>;
                reason: z.ZodLiteral<"BUDGET_EXCEEDED">;
            }, z.core.$strict>], "status">;
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
    };
    readonly wg_evidence: {
        readonly input: z.ZodObject<{
            ids: z.ZodArray<z.ZodUUID>;
            projection: z.ZodDefault<z.ZodEnum<{
                summary: "summary";
                structured: "structured";
            }>>;
            budget: z.ZodOptional<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"available">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                    projection: z.ZodLiteral<"summary">;
                    id: z.ZodUUID;
                    kind: z.ZodEnum<{
                        annotation: "annotation";
                        capture: "capture";
                    }>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    source_summary: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    projection: z.ZodLiteral<"structured_capture">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    received_at: z.ZodISODateTime;
                    capture: z.ZodObject<{
                        captured_at: z.ZodISODateTime;
                        trace_id: z.ZodString;
                        trace_seq: z.ZodNumber;
                        session_id: z.ZodString;
                        tab_id: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        scope: z.ZodObject<{
                            environment: z.ZodString;
                            origin: z.ZodURL;
                            role: z.ZodDefault<z.ZodString>;
                            account_scope: z.ZodString;
                            locale: z.ZodString;
                        }, z.core.$strict>;
                        view: z.ZodObject<{
                            route_template: z.ZodString;
                            selected_tabs: z.ZodArray<z.ZodString>;
                            modal_stack: z.ZodArray<z.ZodString>;
                            feature_variants: z.ZodArray<z.ZodObject<{
                                name: z.ZodString;
                                variant: z.ZodString;
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                        tree: z.ZodObject<{
                            role: z.ZodString;
                            name: z.ZodString;
                            enabled: z.ZodBoolean;
                            visible: z.ZodBoolean;
                            selected: z.ZodOptional<z.ZodBoolean>;
                            locator_hint: z.ZodOptional<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    accessible_name: "accessible_name";
                                    test_id: "test_id";
                                }>;
                                hint: z.ZodString;
                                source: z.ZodObject<{
                                    producer: z.ZodString;
                                    producer_version: z.ZodString;
                                    format: z.ZodString;
                                    format_version: z.ZodString;
                                }, z.core.$strict>;
                                observed_at: z.ZodISODateTime;
                            }, z.core.$strict>>;
                            children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                        }, z.core.$strict>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        redaction_profile: z.ZodObject<{
                            alias: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodUUID;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>], "provenance">]>>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unavailable">;
                items: z.ZodTuple<[], null>;
                missing_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"incomplete">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                    projection: z.ZodLiteral<"summary">;
                    id: z.ZodUUID;
                    kind: z.ZodEnum<{
                        annotation: "annotation";
                        capture: "capture";
                    }>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    source_summary: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    projection: z.ZodLiteral<"structured_capture">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    received_at: z.ZodISODateTime;
                    capture: z.ZodObject<{
                        captured_at: z.ZodISODateTime;
                        trace_id: z.ZodString;
                        trace_seq: z.ZodNumber;
                        session_id: z.ZodString;
                        tab_id: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        scope: z.ZodObject<{
                            environment: z.ZodString;
                            origin: z.ZodURL;
                            role: z.ZodDefault<z.ZodString>;
                            account_scope: z.ZodString;
                            locale: z.ZodString;
                        }, z.core.$strict>;
                        view: z.ZodObject<{
                            route_template: z.ZodString;
                            selected_tabs: z.ZodArray<z.ZodString>;
                            modal_stack: z.ZodArray<z.ZodString>;
                            feature_variants: z.ZodArray<z.ZodObject<{
                                name: z.ZodString;
                                variant: z.ZodString;
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                        tree: z.ZodObject<{
                            role: z.ZodString;
                            name: z.ZodString;
                            enabled: z.ZodBoolean;
                            visible: z.ZodBoolean;
                            selected: z.ZodOptional<z.ZodBoolean>;
                            locator_hint: z.ZodOptional<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    accessible_name: "accessible_name";
                                    test_id: "test_id";
                                }>;
                                hint: z.ZodString;
                                source: z.ZodObject<{
                                    producer: z.ZodString;
                                    producer_version: z.ZodString;
                                    format: z.ZodString;
                                    format_version: z.ZodString;
                                }, z.core.$strict>;
                                observed_at: z.ZodISODateTime;
                            }, z.core.$strict>>;
                            children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                        }, z.core.$strict>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        redaction_profile: z.ZodObject<{
                            alias: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodUUID;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>], "provenance">]>>;
                missing_ids: z.ZodArray<z.ZodUUID>;
                reason: z.ZodLiteral<"BUDGET_EXCEEDED">;
            }, z.core.$strict>], "status">;
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
    };
    readonly wg_changes: {
        readonly input: z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"captures">;
            before_capture_id: z.ZodUUID;
            after_capture_id: z.ZodUUID;
            budget: z.ZodOptional<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"revisions">;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            from_revision: z.ZodNumber;
            to_revision: z.ZodNumber;
            budget: z.ZodOptional<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>], "mode">;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"comparable">;
                changes: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        removed: "removed";
                        added: "added";
                        altered: "altered";
                        not_seen: "not_seen";
                    }>;
                    subject: z.ZodEnum<{
                        annotation: "annotation";
                        control: "control";
                        outcome: "outcome";
                        tab: "tab";
                        modal: "modal";
                    }>;
                    before_id: z.ZodNullable<z.ZodUUID>;
                    after_id: z.ZodNullable<z.ZodUUID>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"complete">;
                        subtree: z.ZodLiteral<"root">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"partial">;
                        subtree: z.ZodString;
                        reason: z.ZodEnum<{
                            truncated: "truncated";
                            unsupported: "unsupported";
                            subtree_only: "subtree_only";
                        }>;
                    }, z.core.$strict>], "kind">;
                }, z.core.$strict>>;
                invalidated_ids: z.ZodArray<z.ZodUUID>;
                complete: z.ZodBoolean;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"incomparable">;
                reason: z.ZodEnum<{
                    scope: "scope";
                    coverage: "coverage";
                    normalization_version: "normalization_version";
                }>;
                evidence_ids: z.ZodArray<z.ZodUUID>;
                changes: z.ZodTuple<[], null>;
            }, z.core.$strict>], "status">;
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
    };
    readonly wg_plan_refresh: {
        readonly input: z.ZodObject<{
            target_ids: z.ZodArray<z.ZodUUID>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            step_budget: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>;
        readonly output: z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                status: z.ZodEnum<{
                    blocked: "blocked";
                    unsupported: "unsupported";
                    planned: "planned";
                    needs_user_input: "needs_user_input";
                }>;
                steps: z.ZodArray<z.ZodObject<{
                    target_id: z.ZodUUID;
                    expected_scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    expected_view: z.ZodOptional<z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    minimum_observations: z.ZodEnum<{
                        complete_state: "complete_state";
                        before_action_after: "before_action_after";
                        passed_assertion: "passed_assertion";
                    }>;
                    prerequisites: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
                unresolved_ids: z.ZodArray<z.ZodUUID>;
                complete: z.ZodBoolean;
            }, z.core.$strict>;
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
    };
};
export type ToolName = keyof typeof contracts;
export type Requests = {
    [K in ToolName]: z.input<(typeof contracts)[K]['input']>;
};
export type Responses = {
    [K in ToolName]: z.output<(typeof contracts)[K]['output']>;
};
/** Export fresh JSON Schemas from the same definitions used for validation/types. */
export declare function contractJsonSchemas(): {
    [k: string]: {
        input: z.core.ZodStandardJSONSchemaPayload<z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"search">;
            filters: z.ZodObject<{
                ids: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
                kinds: z.ZodOptional<z.ZodArray<z.ZodEnum<{
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
                }>>>;
                tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
                terms: z.ZodOptional<z.ZodArray<z.ZodString>>;
                name: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"neighbors">;
            target_id: z.ZodUUID;
            hops: z.ZodDefault<z.ZodNumber>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"path">;
            source_state_id: z.ZodUUID;
            target_state_id: z.ZodUUID;
            max_depth: z.ZodDefault<z.ZodNumber>;
            max_visited: z.ZodDefault<z.ZodNumber>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"flow">;
            flow_id: z.ZodUUID;
            max_depth: z.ZodDefault<z.ZodNumber>;
            max_visited: z.ZodDefault<z.ZodNumber>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            budget: z.ZodDefault<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>], "mode"> | z.ZodDiscriminatedUnion<[z.ZodObject<{
            mode: z.ZodLiteral<"captures">;
            before_capture_id: z.ZodUUID;
            after_capture_id: z.ZodUUID;
            budget: z.ZodOptional<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>, z.ZodObject<{
            mode: z.ZodLiteral<"revisions">;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            from_revision: z.ZodNumber;
            to_revision: z.ZodNumber;
            budget: z.ZodOptional<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>], "mode"> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            screen_ref: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"existing">;
                screen_id: z.ZodUUID;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"new">;
                name: z.ZodString;
                view_key: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "kind">;
            capture: z.ZodObject<{
                captured_at: z.ZodISODateTime;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                session_id: z.ZodString;
                tab_id: z.ZodString;
                source: z.ZodObject<{
                    producer: z.ZodString;
                    producer_version: z.ZodString;
                    format: z.ZodString;
                    format_version: z.ZodString;
                }, z.core.$strict>;
                scope: z.ZodObject<{
                    environment: z.ZodString;
                    origin: z.ZodURL;
                    role: z.ZodDefault<z.ZodString>;
                    account_scope: z.ZodString;
                    locale: z.ZodString;
                }, z.core.$strict>;
                view: z.ZodObject<{
                    route_template: z.ZodString;
                    selected_tabs: z.ZodArray<z.ZodString>;
                    modal_stack: z.ZodArray<z.ZodString>;
                    feature_variants: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        variant: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                tree: z.ZodObject<{
                    role: z.ZodString;
                    name: z.ZodString;
                    enabled: z.ZodBoolean;
                    visible: z.ZodBoolean;
                    selected: z.ZodOptional<z.ZodBoolean>;
                    locator_hint: z.ZodOptional<z.ZodObject<{
                        kind: z.ZodEnum<{
                            accessible_name: "accessible_name";
                            test_id: "test_id";
                        }>;
                        hint: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        observed_at: z.ZodISODateTime;
                    }, z.core.$strict>>;
                    children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                }, z.core.$strict>;
                coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"complete">;
                    subtree: z.ZodLiteral<"root">;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"partial">;
                    subtree: z.ZodString;
                    reason: z.ZodEnum<{
                        truncated: "truncated";
                        unsupported: "unsupported";
                        subtree_only: "subtree_only";
                    }>;
                }, z.core.$strict>], "kind">;
                redaction_profile: z.ZodObject<{
                    alias: z.ZodString;
                    version: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>;
            expected_store_revision: z.ZodOptional<z.ZodNumber>;
            request_id: z.ZodString;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            expected_store_revision: z.ZodNumber;
            operations: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                op: z.ZodLiteral<"create_action">;
                state_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                control_id: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">>;
                verb: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                input_schema: z.ZodObject<{
                    kind: z.ZodEnum<{
                        boolean: "boolean";
                        none: "none";
                        option: "option";
                        text: "text";
                        scroll: "scroll";
                        navigation_key: "navigation_key";
                    }>;
                    required: z.ZodBoolean;
                    max_length: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>;
                preconditions: z.ZodArray<z.ZodString>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"record_action_event">;
                event: z.ZodObject<{
                    action_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    before_capture_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    after_capture_id: z.ZodNullable<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    occurred_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                }, z.core.$strict>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"record_test_run">;
                run: z.ZodObject<{
                    runner: z.ZodString;
                    runner_version: z.ZodString;
                    application_version: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    started_at: z.ZodISODateTime;
                    finished_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        skipped: "skipped";
                        failed: "failed";
                        passed: "passed";
                    }>;
                    assertions: z.ZodArray<z.ZodObject<{
                        target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"existing">;
                            id: z.ZodUUID;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"local">;
                            client_ref: z.ZodString;
                        }, z.core.$strict>], "kind">;
                        assertion: z.ZodString;
                        result: z.ZodEnum<{
                            skipped: "skipped";
                            failed: "failed";
                            passed: "passed";
                        }>;
                        evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"existing">;
                            id: z.ZodUUID;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"local">;
                            client_ref: z.ZodString;
                        }, z.core.$strict>], "kind">>;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"create_transition">;
                source_state_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                action_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                target_state_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                before_capture_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                after_capture_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                action_event_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                outcome: z.ZodEnum<{
                    error: "error";
                    success: "success";
                    timeout: "timeout";
                    cancelled: "cancelled";
                }>;
                guards: z.ZodArray<z.ZodString>;
                provenance: z.ZodEnum<{
                    observed: "observed";
                    test_verified: "test_verified";
                }>;
                test_run_id: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"create_flow">;
                name: z.ZodString;
                transition_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">>;
                scope: z.ZodObject<{
                    environment: z.ZodString;
                    origin: z.ZodURL;
                    role: z.ZodDefault<z.ZodString>;
                    account_scope: z.ZodString;
                    locale: z.ZodString;
                }, z.core.$strict>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"add_annotation">;
                annotation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "provenance">;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"supersede_annotation">;
                supersedes_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"existing">;
                    id: z.ZodUUID;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"local">;
                    client_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                annotation: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    target_id: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">;
                    kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"existing">;
                        id: z.ZodUUID;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"local">;
                        client_ref: z.ZodString;
                    }, z.core.$strict>], "kind">>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>], "provenance">;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>, z.ZodObject<{
                op: z.ZodLiteral<"alias_identity">;
                record_kind: z.ZodEnum<{
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
                from_id: z.ZodUUID;
                to_id: z.ZodUUID;
                rationale: z.ZodString;
                evidence_ids: z.ZodArray<z.ZodUUID>;
                client_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "op">>;
            request_id: z.ZodString;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            ids: z.ZodArray<z.ZodUUID>;
            projection: z.ZodDefault<z.ZodEnum<{
                summary: "summary";
                structured: "structured";
            }>>;
            budget: z.ZodOptional<z.ZodObject<{
                records: z.ZodDefault<z.ZodNumber>;
                bytes: z.ZodDefault<z.ZodNumber>;
            }, z.core.$strict>>;
            cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            target_ids: z.ZodArray<z.ZodUUID>;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            max_age_seconds: z.ZodDefault<z.ZodNumber>;
            step_budget: z.ZodDefault<z.ZodNumber>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            request_id: z.ZodString;
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            session_id: z.ZodUUID;
            page_id: z.ZodUUID;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            scope: z.ZodObject<{
                environment: z.ZodString;
                origin: z.ZodURL;
                role: z.ZodDefault<z.ZodString>;
                account_scope: z.ZodString;
                locale: z.ZodString;
            }, z.core.$strict>;
            url: z.ZodURL;
            session_id: z.ZodUUID;
            page_id: z.ZodUUID;
            snapshot_id: z.ZodUUID;
            request_id: z.ZodString;
            execution_id: z.ZodString;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            request_id: z.ZodString;
            execution_id: z.ZodString;
            action: z.ZodDiscriminatedUnion<[z.ZodObject<{
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"click">;
            }, z.core.$strict>, z.ZodObject<{
                text: z.ZodString;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"fill">;
            }, z.core.$strict>, z.ZodObject<{
                option_id: z.ZodUUID;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"select">;
            }, z.core.$strict>, z.ZodObject<{
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"check">;
            }, z.core.$strict>, z.ZodObject<{
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"uncheck">;
            }, z.core.$strict>, z.ZodObject<{
                axis: z.ZodEnum<{
                    vertical: "vertical";
                    horizontal: "horizontal";
                }>;
                delta: z.ZodNumber;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"scroll">;
            }, z.core.$strict>, z.ZodObject<{
                key: z.ZodEnum<{
                    Tab: "Tab";
                    "Shift+Tab": "Shift+Tab";
                    ArrowUp: "ArrowUp";
                    ArrowDown: "ArrowDown";
                    Escape: "Escape";
                }>;
                target_id: z.ZodUUID;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                kind: z.ZodLiteral<"key">;
            }, z.core.$strict>], "kind">;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            session_id: z.ZodOptional<z.ZodUUID>;
            execution_id: z.ZodOptional<z.ZodString>;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict> | z.ZodObject<{
            request_id: z.ZodString;
            session_id: z.ZodUUID;
            browser_schema_version: z.ZodLiteral<1>;
            schema_version: z.ZodLiteral<1>;
            project_id: z.ZodUUID;
            app_id: z.ZodUUID;
        }, z.core.$strict>>;
        output: z.core.ZodStandardJSONSchemaPayload<z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                store_schema_version: z.ZodNumber;
                supported_schema_versions: z.ZodTuple<[z.ZodLiteral<1>], null>;
                capabilities: z.ZodArray<z.ZodEnum<{
                    ingest: "ingest";
                    query: "query";
                    changes: "changes";
                    evidence: "evidence";
                    refresh_plan: "refresh_plan";
                }>>;
                counts: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
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
                    count: z.ZodNumber;
                }, z.core.$strict>>;
                byte_usage: z.ZodObject<{
                    database: z.ZodNumber;
                    wal: z.ZodNumber;
                    cap: z.ZodNumber;
                }, z.core.$strict>;
                ingest_formats: z.ZodArray<z.ZodObject<{
                    format: z.ZodString;
                    version: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                coverage: z.ZodLiteral<"complete">;
                state_id: z.ZodUUID;
                state_hash: z.ZodString;
                fragment_hash: z.ZodNull;
                screen_id: z.ZodUUID;
                capture_id: z.ZodUUID;
                control_ids: z.ZodArray<z.ZodUUID>;
                redaction_summary: z.ZodObject<{
                    dropped_fields: z.ZodNumber;
                    dropped_texts: z.ZodNumber;
                    profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>, z.ZodObject<{
                coverage: z.ZodLiteral<"partial">;
                state_id: z.ZodNull;
                state_hash: z.ZodNull;
                fragment_hash: z.ZodString;
                control_ids: z.ZodTuple<[], null>;
                screen_id: z.ZodUUID;
                capture_id: z.ZodUUID;
                redaction_summary: z.ZodObject<{
                    dropped_fields: z.ZodNumber;
                    dropped_texts: z.ZodNumber;
                    profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
            }, z.core.$strict>], "coverage">;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                created_ids: z.ZodArray<z.ZodUUID>;
                client_refs: z.ZodArray<z.ZodObject<{
                    client_ref: z.ZodString;
                    id: z.ZodUUID;
                }, z.core.$strict>>;
                new_revision: z.ZodNumber;
            }, z.core.$strict>;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"complete">;
                records: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"screen">;
                    route_template: z.ZodString;
                    creation_revision: z.ZodNumber;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"state">;
                    screen_id: z.ZodUUID;
                    state_hash: z.ZodString;
                    normalization_version: z.ZodString;
                    view: z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"control">;
                    state_id: z.ZodUUID;
                    role: z.ZodString;
                    enabled: z.ZodBoolean;
                    visible: z.ZodBoolean;
                    descriptor: z.ZodString;
                    locator_hint: z.ZodOptional<z.ZodObject<{
                        kind: z.ZodEnum<{
                            accessible_name: "accessible_name";
                            test_id: "test_id";
                        }>;
                        hint: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        observed_at: z.ZodISODateTime;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action">;
                    state_id: z.ZodUUID;
                    control_id: z.ZodNullable<z.ZodUUID>;
                    verb: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    input_schema: z.ZodObject<{
                        kind: z.ZodEnum<{
                            boolean: "boolean";
                            none: "none";
                            option: "option";
                            text: "text";
                            scroll: "scroll";
                            navigation_key: "navigation_key";
                        }>;
                        required: z.ZodBoolean;
                        max_length: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                    preconditions: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"transition">;
                    source_state_id: z.ZodUUID;
                    action_id: z.ZodUUID;
                    target_state_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodUUID;
                    action_event_id: z.ZodUUID;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    guards: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"flow">;
                    transition_ids: z.ZodArray<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    captured_at: z.ZodISODateTime;
                    received_at: z.ZodISODateTime;
                    source: z.ZodObject<{
                        producer: z.ZodString;
                        producer_version: z.ZodString;
                        format: z.ZodString;
                        format_version: z.ZodString;
                    }, z.core.$strict>;
                    redaction_profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action_event">;
                    action_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    occurred_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"test_run">;
                    runner: z.ZodString;
                    runner_version: z.ZodString;
                    application_version: z.ZodString;
                    started_at: z.ZodISODateTime;
                    finished_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        skipped: "skipped";
                        failed: "failed";
                        passed: "passed";
                    }>;
                    assertions: z.ZodArray<z.ZodObject<{
                        target_id: z.ZodUUID;
                        assertion: z.ZodString;
                        result: z.ZodEnum<{
                            skipped: "skipped";
                            failed: "failed";
                            passed: "passed";
                        }>;
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
                guards: z.ZodArray<z.ZodString>;
                applicability: z.ZodEnum<{
                    conditional: "conditional";
                    unconditional: "unconditional";
                    requires_check: "requires_check";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"no_matches">;
                records: z.ZodTuple<[], null>;
                guards: z.ZodTuple<[], null>;
                applicability: z.ZodLiteral<"requires_check">;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"incomplete">;
                records: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"screen">;
                    route_template: z.ZodString;
                    creation_revision: z.ZodNumber;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"state">;
                    screen_id: z.ZodUUID;
                    state_hash: z.ZodString;
                    normalization_version: z.ZodString;
                    view: z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"control">;
                    state_id: z.ZodUUID;
                    role: z.ZodString;
                    enabled: z.ZodBoolean;
                    visible: z.ZodBoolean;
                    descriptor: z.ZodString;
                    locator_hint: z.ZodOptional<z.ZodObject<{
                        kind: z.ZodEnum<{
                            accessible_name: "accessible_name";
                            test_id: "test_id";
                        }>;
                        hint: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        observed_at: z.ZodISODateTime;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action">;
                    state_id: z.ZodUUID;
                    control_id: z.ZodNullable<z.ZodUUID>;
                    verb: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    input_schema: z.ZodObject<{
                        kind: z.ZodEnum<{
                            boolean: "boolean";
                            none: "none";
                            option: "option";
                            text: "text";
                            scroll: "scroll";
                            navigation_key: "navigation_key";
                        }>;
                        required: z.ZodBoolean;
                        max_length: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                    preconditions: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"transition">;
                    source_state_id: z.ZodUUID;
                    action_id: z.ZodUUID;
                    target_state_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodUUID;
                    action_event_id: z.ZodUUID;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    guards: z.ZodArray<z.ZodString>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"flow">;
                    transition_ids: z.ZodArray<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    captured_at: z.ZodISODateTime;
                    received_at: z.ZodISODateTime;
                    source: z.ZodObject<{
                        producer: z.ZodString;
                        producer_version: z.ZodString;
                        format: z.ZodString;
                        format_version: z.ZodString;
                    }, z.core.$strict>;
                    redaction_profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"action_event">;
                    action_id: z.ZodUUID;
                    before_capture_id: z.ZodUUID;
                    after_capture_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    occurred_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        error: "error";
                        success: "success";
                        timeout: "timeout";
                        cancelled: "cancelled";
                    }>;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"test_run">;
                    runner: z.ZodString;
                    runner_version: z.ZodString;
                    application_version: z.ZodString;
                    started_at: z.ZodISODateTime;
                    finished_at: z.ZodISODateTime;
                    outcome: z.ZodEnum<{
                        skipped: "skipped";
                        failed: "failed";
                        passed: "passed";
                    }>;
                    assertions: z.ZodArray<z.ZodObject<{
                        target_id: z.ZodUUID;
                        assertion: z.ZodString;
                        result: z.ZodEnum<{
                            skipped: "skipped";
                            failed: "failed";
                            passed: "passed";
                        }>;
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                    }, z.core.$strict>>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                    id: z.ZodUUID;
                    name: z.ZodString;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    evidence: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>], "kind">>;
                guards: z.ZodArray<z.ZodString>;
                applicability: z.ZodEnum<{
                    conditional: "conditional";
                    requires_check: "requires_check";
                }>;
                reason: z.ZodLiteral<"BUDGET_EXCEEDED">;
            }, z.core.$strict>], "status">;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"available">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                    projection: z.ZodLiteral<"summary">;
                    id: z.ZodUUID;
                    kind: z.ZodEnum<{
                        annotation: "annotation";
                        capture: "capture";
                    }>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    source_summary: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    projection: z.ZodLiteral<"structured_capture">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    received_at: z.ZodISODateTime;
                    capture: z.ZodObject<{
                        captured_at: z.ZodISODateTime;
                        trace_id: z.ZodString;
                        trace_seq: z.ZodNumber;
                        session_id: z.ZodString;
                        tab_id: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        scope: z.ZodObject<{
                            environment: z.ZodString;
                            origin: z.ZodURL;
                            role: z.ZodDefault<z.ZodString>;
                            account_scope: z.ZodString;
                            locale: z.ZodString;
                        }, z.core.$strict>;
                        view: z.ZodObject<{
                            route_template: z.ZodString;
                            selected_tabs: z.ZodArray<z.ZodString>;
                            modal_stack: z.ZodArray<z.ZodString>;
                            feature_variants: z.ZodArray<z.ZodObject<{
                                name: z.ZodString;
                                variant: z.ZodString;
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                        tree: z.ZodObject<{
                            role: z.ZodString;
                            name: z.ZodString;
                            enabled: z.ZodBoolean;
                            visible: z.ZodBoolean;
                            selected: z.ZodOptional<z.ZodBoolean>;
                            locator_hint: z.ZodOptional<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    accessible_name: "accessible_name";
                                    test_id: "test_id";
                                }>;
                                hint: z.ZodString;
                                source: z.ZodObject<{
                                    producer: z.ZodString;
                                    producer_version: z.ZodString;
                                    format: z.ZodString;
                                    format_version: z.ZodString;
                                }, z.core.$strict>;
                                observed_at: z.ZodISODateTime;
                            }, z.core.$strict>>;
                            children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                        }, z.core.$strict>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        redaction_profile: z.ZodObject<{
                            alias: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodUUID;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>], "provenance">]>>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"unavailable">;
                items: z.ZodTuple<[], null>;
                missing_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"incomplete">;
                items: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                    projection: z.ZodLiteral<"summary">;
                    id: z.ZodUUID;
                    kind: z.ZodEnum<{
                        annotation: "annotation";
                        capture: "capture";
                    }>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    source_summary: z.ZodObject<{
                        evidence_ids: z.ZodArray<z.ZodUUID>;
                        provenance: z.ZodEnum<{
                            observed: "observed";
                            inferred: "inferred";
                            test_verified: "test_verified";
                        }>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        freshness: z.ZodObject<{
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
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodObject<{
                    projection: z.ZodLiteral<"structured_capture">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"capture">;
                    screen_id: z.ZodUUID;
                    state_id: z.ZodNullable<z.ZodUUID>;
                    request_id: z.ZodString;
                    received_at: z.ZodISODateTime;
                    capture: z.ZodObject<{
                        captured_at: z.ZodISODateTime;
                        trace_id: z.ZodString;
                        trace_seq: z.ZodNumber;
                        session_id: z.ZodString;
                        tab_id: z.ZodString;
                        source: z.ZodObject<{
                            producer: z.ZodString;
                            producer_version: z.ZodString;
                            format: z.ZodString;
                            format_version: z.ZodString;
                        }, z.core.$strict>;
                        scope: z.ZodObject<{
                            environment: z.ZodString;
                            origin: z.ZodURL;
                            role: z.ZodDefault<z.ZodString>;
                            account_scope: z.ZodString;
                            locale: z.ZodString;
                        }, z.core.$strict>;
                        view: z.ZodObject<{
                            route_template: z.ZodString;
                            selected_tabs: z.ZodArray<z.ZodString>;
                            modal_stack: z.ZodArray<z.ZodString>;
                            feature_variants: z.ZodArray<z.ZodObject<{
                                name: z.ZodString;
                                variant: z.ZodString;
                            }, z.core.$strict>>;
                        }, z.core.$strict>;
                        tree: z.ZodObject<{
                            role: z.ZodString;
                            name: z.ZodString;
                            enabled: z.ZodBoolean;
                            visible: z.ZodBoolean;
                            selected: z.ZodOptional<z.ZodBoolean>;
                            locator_hint: z.ZodOptional<z.ZodObject<{
                                kind: z.ZodEnum<{
                                    accessible_name: "accessible_name";
                                    test_id: "test_id";
                                }>;
                                hint: z.ZodString;
                                source: z.ZodObject<{
                                    producer: z.ZodString;
                                    producer_version: z.ZodString;
                                    format: z.ZodString;
                                    format_version: z.ZodString;
                                }, z.core.$strict>;
                                observed_at: z.ZodISODateTime;
                            }, z.core.$strict>>;
                            children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                        }, z.core.$strict>;
                        coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"complete">;
                            subtree: z.ZodLiteral<"root">;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"partial">;
                            subtree: z.ZodString;
                            reason: z.ZodEnum<{
                                truncated: "truncated";
                                unsupported: "unsupported";
                                subtree_only: "subtree_only";
                            }>;
                        }, z.core.$strict>], "kind">;
                        redaction_profile: z.ZodObject<{
                            alias: z.ZodString;
                            version: z.ZodNumber;
                        }, z.core.$strict>;
                    }, z.core.$strict>;
                }, z.core.$strict>, z.ZodDiscriminatedUnion<[z.ZodObject<{
                    provenance: z.ZodLiteral<"observed">;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"inferred">;
                    rationale: z.ZodString;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>, z.ZodObject<{
                    provenance: z.ZodLiteral<"test_verified">;
                    test_run_id: z.ZodUUID;
                    projection: z.ZodLiteral<"structured_annotation">;
                    id: z.ZodUUID;
                    kind: z.ZodLiteral<"annotation">;
                    target_id: z.ZodUUID;
                    annotation_kind: z.ZodEnum<{
                        name: "name";
                        description: "description";
                        tag: "tag";
                        prerequisite: "prerequisite";
                        interpretation: "interpretation";
                    }>;
                    value: z.ZodString;
                    author_type: z.ZodEnum<{
                        agent: "agent";
                        human: "human";
                    }>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    revision: z.ZodNumber;
                    supersedes_id: z.ZodNullable<z.ZodUUID>;
                }, z.core.$strict>], "provenance">]>>;
                missing_ids: z.ZodArray<z.ZodUUID>;
                reason: z.ZodLiteral<"BUDGET_EXCEEDED">;
            }, z.core.$strict>], "status">;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"comparable">;
                changes: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        removed: "removed";
                        added: "added";
                        altered: "altered";
                        not_seen: "not_seen";
                    }>;
                    subject: z.ZodEnum<{
                        annotation: "annotation";
                        control: "control";
                        outcome: "outcome";
                        tab: "tab";
                        modal: "modal";
                    }>;
                    before_id: z.ZodNullable<z.ZodUUID>;
                    after_id: z.ZodNullable<z.ZodUUID>;
                    evidence_ids: z.ZodArray<z.ZodUUID>;
                    coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"complete">;
                        subtree: z.ZodLiteral<"root">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"partial">;
                        subtree: z.ZodString;
                        reason: z.ZodEnum<{
                            truncated: "truncated";
                            unsupported: "unsupported";
                            subtree_only: "subtree_only";
                        }>;
                    }, z.core.$strict>], "kind">;
                }, z.core.$strict>>;
                invalidated_ids: z.ZodArray<z.ZodUUID>;
                complete: z.ZodBoolean;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"incomparable">;
                reason: z.ZodEnum<{
                    scope: "scope";
                    coverage: "coverage";
                    normalization_version: "normalization_version";
                }>;
                evidence_ids: z.ZodArray<z.ZodUUID>;
                changes: z.ZodTuple<[], null>;
            }, z.core.$strict>], "status">;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                status: z.ZodEnum<{
                    blocked: "blocked";
                    unsupported: "unsupported";
                    planned: "planned";
                    needs_user_input: "needs_user_input";
                }>;
                steps: z.ZodArray<z.ZodObject<{
                    target_id: z.ZodUUID;
                    expected_scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    expected_view: z.ZodOptional<z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    minimum_observations: z.ZodEnum<{
                        complete_state: "complete_state";
                        before_action_after: "before_action_after";
                        passed_assertion: "passed_assertion";
                    }>;
                    prerequisites: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
                unresolved_ids: z.ZodArray<z.ZodUUID>;
                complete: z.ZodBoolean;
            }, z.core.$strict>;
            warnings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                affected_ids: z.ZodArray<z.ZodUUID>;
            }, z.core.$strict>>;
            next_cursor: z.ZodOptional<z.ZodObject<{
                token: z.ZodString;
                store_revision: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                status: z.ZodLiteral<"open">;
                page: z.ZodObject<{
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                capabilities: z.ZodObject<{
                    ownership: z.ZodLiteral<"ephemeral_owned">;
                    headed: z.ZodLiteral<true>;
                    persistent_authentication: z.ZodLiteral<false>;
                    actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    navigation_keys: z.ZodArray<z.ZodEnum<{
                        Tab: "Tab";
                        "Shift+Tab": "Shift+Tab";
                        ArrowUp: "ArrowUp";
                        ArrowDown: "ArrowDown";
                        Escape: "Escape";
                    }>>;
                }, z.core.$strict>;
            }, z.core.$strict>;
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
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                capture: z.ZodObject<{
                    captured_at: z.ZodISODateTime;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    session_id: z.ZodString;
                    tab_id: z.ZodString;
                    source: z.ZodObject<{
                        producer: z.ZodString;
                        producer_version: z.ZodString;
                        format: z.ZodString;
                        format_version: z.ZodString;
                    }, z.core.$strict>;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                    view: z.ZodObject<{
                        route_template: z.ZodString;
                        selected_tabs: z.ZodArray<z.ZodString>;
                        modal_stack: z.ZodArray<z.ZodString>;
                        feature_variants: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            variant: z.ZodString;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
                    tree: z.ZodObject<{
                        role: z.ZodString;
                        name: z.ZodString;
                        enabled: z.ZodBoolean;
                        visible: z.ZodBoolean;
                        selected: z.ZodOptional<z.ZodBoolean>;
                        locator_hint: z.ZodOptional<z.ZodObject<{
                            kind: z.ZodEnum<{
                                accessible_name: "accessible_name";
                                test_id: "test_id";
                            }>;
                            hint: z.ZodString;
                            source: z.ZodObject<{
                                producer: z.ZodString;
                                producer_version: z.ZodString;
                                format: z.ZodString;
                                format_version: z.ZodString;
                            }, z.core.$strict>;
                            observed_at: z.ZodISODateTime;
                        }, z.core.$strict>>;
                        children: z.ZodArray<z.ZodObject</*elided*/ any, z.core.$strict>>;
                    }, z.core.$strict>;
                    coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        kind: z.ZodLiteral<"complete">;
                        subtree: z.ZodLiteral<"root">;
                    }, z.core.$strict>, z.ZodObject<{
                        kind: z.ZodLiteral<"partial">;
                        subtree: z.ZodString;
                        reason: z.ZodEnum<{
                            truncated: "truncated";
                            unsupported: "unsupported";
                            subtree_only: "subtree_only";
                        }>;
                    }, z.core.$strict>], "kind">;
                    redaction_profile: z.ZodObject<{
                        alias: z.ZodString;
                        version: z.ZodNumber;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                targets: z.ZodArray<z.ZodObject<{
                    target_id: z.ZodUUID;
                    role: z.ZodString;
                    name: z.ZodString;
                    permitted_actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    option_ids: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
                }, z.core.$strict>>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
            }, z.core.$strict>;
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
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                state: z.ZodLiteral<"not_started">;
                after_snapshot_id: z.ZodNull;
                dispatch: z.ZodLiteral<"not_dispatched">;
                error_code: z.ZodNullable<z.ZodEnum<{
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
                }>>;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"pending">;
                dispatch: z.ZodEnum<{
                    not_dispatched: "not_dispatched";
                    dispatched: "dispatched";
                }>;
                error_code: z.ZodNull;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"succeeded">;
                dispatch: z.ZodLiteral<"dispatched">;
                error_code: z.ZodNull;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"failed">;
                dispatch: z.ZodLiteral<"dispatched">;
                error_code: z.ZodEnum<{
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
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                state: z.ZodLiteral<"unknown">;
                dispatch: z.ZodEnum<{
                    dispatched: "dispatched";
                    uncertain: "uncertain";
                }>;
                error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                target_id: z.ZodNullable<z.ZodUUID>;
                trace_id: z.ZodString;
                trace_seq: z.ZodNumber;
                action_kind: z.ZodEnum<{
                    fill: "fill";
                    key: "key";
                    navigate: "navigate";
                    select: "select";
                    click: "click";
                    scroll: "scroll";
                    check: "check";
                    uncheck: "uncheck";
                }>;
                occurred_at: z.ZodISODateTime;
                after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                session_id: z.ZodUUID;
                page_id: z.ZodUUID;
                snapshot_id: z.ZodUUID;
                execution_id: z.ZodString;
            }, z.core.$strict>], "state">;
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
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodDiscriminatedUnion<[z.ZodObject<{
                status: z.ZodLiteral<"closed">;
                page: z.ZodNull;
                capabilities: z.ZodObject<{
                    ownership: z.ZodLiteral<"ephemeral_owned">;
                    headed: z.ZodLiteral<true>;
                    persistent_authentication: z.ZodLiteral<false>;
                    actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    navigation_keys: z.ZodArray<z.ZodEnum<{
                        Tab: "Tab";
                        "Shift+Tab": "Shift+Tab";
                        ArrowUp: "ArrowUp";
                        ArrowDown: "ArrowDown";
                        Escape: "Escape";
                    }>>;
                }, z.core.$strict>;
                attempts: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    state: z.ZodLiteral<"not_started">;
                    after_snapshot_id: z.ZodNull;
                    dispatch: z.ZodLiteral<"not_dispatched">;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"pending">;
                    dispatch: z.ZodEnum<{
                        not_dispatched: "not_dispatched";
                        dispatched: "dispatched";
                    }>;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"succeeded">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"failed">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodEnum<{
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
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"unknown">;
                    dispatch: z.ZodEnum<{
                        dispatched: "dispatched";
                        uncertain: "uncertain";
                    }>;
                    error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>], "state">>;
            }, z.core.$strict>, z.ZodObject<{
                status: z.ZodLiteral<"open">;
                page: z.ZodObject<{
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    scope: z.ZodObject<{
                        environment: z.ZodString;
                        origin: z.ZodURL;
                        role: z.ZodDefault<z.ZodString>;
                        account_scope: z.ZodString;
                        locale: z.ZodString;
                    }, z.core.$strict>;
                }, z.core.$strict>;
                capabilities: z.ZodObject<{
                    ownership: z.ZodLiteral<"ephemeral_owned">;
                    headed: z.ZodLiteral<true>;
                    persistent_authentication: z.ZodLiteral<false>;
                    actions: z.ZodArray<z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>>;
                    navigation_keys: z.ZodArray<z.ZodEnum<{
                        Tab: "Tab";
                        "Shift+Tab": "Shift+Tab";
                        ArrowUp: "ArrowUp";
                        ArrowDown: "ArrowDown";
                        Escape: "Escape";
                    }>>;
                }, z.core.$strict>;
                attempts: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    state: z.ZodLiteral<"not_started">;
                    after_snapshot_id: z.ZodNull;
                    dispatch: z.ZodLiteral<"not_dispatched">;
                    error_code: z.ZodNullable<z.ZodEnum<{
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
                    }>>;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"pending">;
                    dispatch: z.ZodEnum<{
                        not_dispatched: "not_dispatched";
                        dispatched: "dispatched";
                    }>;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"succeeded">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodNull;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"failed">;
                    dispatch: z.ZodLiteral<"dispatched">;
                    error_code: z.ZodEnum<{
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
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    state: z.ZodLiteral<"unknown">;
                    dispatch: z.ZodEnum<{
                        dispatched: "dispatched";
                        uncertain: "uncertain";
                    }>;
                    error_code: z.ZodLiteral<"UNKNOWN_OUTCOME">;
                    target_id: z.ZodNullable<z.ZodUUID>;
                    trace_id: z.ZodString;
                    trace_seq: z.ZodNumber;
                    action_kind: z.ZodEnum<{
                        fill: "fill";
                        key: "key";
                        navigate: "navigate";
                        select: "select";
                        click: "click";
                        scroll: "scroll";
                        check: "check";
                        uncheck: "uncheck";
                    }>;
                    occurred_at: z.ZodISODateTime;
                    after_snapshot_id: z.ZodNullable<z.ZodUUID>;
                    session_id: z.ZodUUID;
                    page_id: z.ZodUUID;
                    snapshot_id: z.ZodUUID;
                    execution_id: z.ZodString;
                }, z.core.$strict>], "state">>;
            }, z.core.$strict>], "status">;
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
        }, z.core.$strict> | z.ZodObject<{
            schema_version: z.ZodLiteral<1>;
            store_revision: z.ZodNumber;
            data: z.ZodObject<{
                status: z.ZodLiteral<"closed">;
                session_id: z.ZodUUID;
                cleanup: z.ZodEnum<{
                    complete: "complete";
                    unconfirmed: "unconfirmed";
                }>;
            }, z.core.$strict>;
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
        }, z.core.$strict>>;
        error: z.core.ZodStandardJSONSchemaPayload<z.ZodObject<{
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
        }, z.core.$strict>>;
    };
};
export { validateRequest, validateResponse, ContractError, } from './validation.js';
