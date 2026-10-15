import { z } from 'zod';
export declare const navigationKey: z.ZodEnum<{
    Tab: "Tab";
    "Shift+Tab": "Shift+Tab";
    ArrowUp: "ArrowUp";
    ArrowDown: "ArrowDown";
    Escape: "Escape";
}>;
export declare const browserAction: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const attemptState: z.ZodEnum<{
    failed: "failed";
    succeeded: "succeeded";
    unknown: "unknown";
    pending: "pending";
    not_started: "not_started";
}>;
export declare const attemptReceipt: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const browserContracts: {
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
};
