import { z } from 'zod';
export declare const recordSummary: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
}, z.core.$strict>], "kind">;
