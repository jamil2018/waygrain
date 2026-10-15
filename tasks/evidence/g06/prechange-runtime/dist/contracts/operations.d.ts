import { z } from 'zod';
export declare const verb: z.ZodEnum<{
    fill: "fill";
    key: "key";
    navigate: "navigate";
    select: "select";
    click: "click";
    scroll: "scroll";
    check: "check";
    uncheck: "uncheck";
}>;
export declare const outcome: z.ZodEnum<{
    error: "error";
    success: "success";
    timeout: "timeout";
    cancelled: "cancelled";
}>;
export declare const safeInput: z.ZodObject<{
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
export declare const guards: z.ZodArray<z.ZodString>;
export declare const actionEvent: z.ZodObject<{
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
export declare const testRun: z.ZodObject<{
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
export declare const annotation: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const operation: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "op">;
export declare const RELATION_ENDPOINTS: Readonly<{
    readonly contains: readonly [readonly ["screen", "state"], readonly ["state", "control"]];
    readonly offers: readonly [readonly ["state", "action"]];
    readonly transitions_to: readonly [readonly ["state", "state"]];
    readonly part_of: readonly [readonly ["transition", "flow"]];
    readonly describes: readonly [readonly ["annotation", "screen"], readonly ["annotation", "state"], readonly ["annotation", "control"], readonly ["annotation", "action"], readonly ["annotation", "transition"], readonly ["annotation", "flow"], readonly ["annotation", "capture"], readonly ["annotation", "action_event"], readonly ["annotation", "test_run"]];
}>;
