import { Store } from '../store/database.js';
import { type Responses } from '../contracts/index.js';
export declare const IMPLEMENTED_TOOLS: readonly ["wg_status", "wg_ingest", "wg_evidence", "wg_commit", "wg_query", "wg_changes", "wg_plan_refresh"];
export type ImplementedTool = (typeof IMPLEMENTED_TOOLS)[number];
export declare function status(store: Store, input: unknown): Responses['wg_status'];
export declare function evidence(store: Store, input: unknown, now?: number): Responses['wg_evidence'];
export declare function dispatch(store: Store, tool: ImplementedTool, input: unknown, now?: number): {
    schema_version: 1;
    store_revision: number;
    data: {
        store_schema_version: number;
        supported_schema_versions: [1];
        capabilities: ("ingest" | "query" | "changes" | "evidence" | "refresh_plan")[];
        counts: {
            kind: "state" | "transition" | "screen" | "annotation" | "action" | "control" | "flow" | "capture" | "action_event" | "test_run";
            count: number;
        }[];
        byte_usage: {
            database: number;
            wal: number;
            cap: number;
        };
        ingest_formats: {
            format: string;
            version: string;
        }[];
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
} | {
    schema_version: 1;
    store_revision: number;
    data: {
        coverage: "complete";
        state_id: string;
        state_hash: string;
        fragment_hash: null;
        screen_id: string;
        capture_id: string;
        control_ids: string[];
        redaction_summary: {
            dropped_fields: number;
            dropped_texts: number;
            profile: {
                alias: string;
                version: number;
            };
        };
    } | {
        coverage: "partial";
        state_id: null;
        state_hash: null;
        fragment_hash: string;
        control_ids: [];
        screen_id: string;
        capture_id: string;
        redaction_summary: {
            dropped_fields: number;
            dropped_texts: number;
            profile: {
                alias: string;
                version: number;
            };
        };
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
} | {
    schema_version: 1;
    store_revision: number;
    data: {
        created_ids: string[];
        client_refs: {
            client_ref: string;
            id: string;
        }[];
        new_revision: number;
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
} | {
    schema_version: 1;
    store_revision: number;
    data: {
        status: "complete";
        records: ({
            kind: "screen";
            route_template: string;
            creation_revision: number;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "state";
            screen_id: string;
            state_hash: string;
            normalization_version: string;
            view: {
                route_template: string;
                selected_tabs: string[];
                modal_stack: string[];
                feature_variants: {
                    name: string;
                    variant: string;
                }[];
            };
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "control";
            state_id: string;
            role: string;
            enabled: boolean;
            visible: boolean;
            descriptor: string;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
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
        } | {
            kind: "action";
            state_id: string;
            control_id: string | null;
            verb: "fill" | "key" | "navigate" | "select" | "click" | "scroll" | "check" | "uncheck";
            input_schema: {
                kind: "boolean" | "none" | "option" | "text" | "scroll" | "navigation_key";
                required: boolean;
                max_length?: number | undefined;
            };
            preconditions: string[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "transition";
            source_state_id: string;
            action_id: string;
            target_state_id: string;
            before_capture_id: string;
            after_capture_id: string;
            action_event_id: string;
            outcome: "error" | "success" | "timeout" | "cancelled";
            guards: string[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "flow";
            transition_ids: string[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "capture";
            screen_id: string;
            state_id: string | null;
            request_id: string;
            trace_id: string;
            trace_seq: number;
            session_id: string;
            tab_id: string;
            captured_at: string;
            received_at: string;
            source: {
                producer: string;
                producer_version: string;
                format: string;
                format_version: string;
            };
            redaction_profile: {
                alias: string;
                version: number;
            };
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "action_event";
            action_id: string;
            before_capture_id: string;
            after_capture_id: string | null;
            trace_id: string;
            trace_seq: number;
            session_id: string;
            tab_id: string;
            occurred_at: string;
            outcome: "error" | "success" | "timeout" | "cancelled";
            error_code: "INVALID_INPUT" | "UNKNOWN_SCOPE" | "NOT_FOUND" | "INCOMPATIBLE_CAPTURE" | "UNSUPPORTED_FORMAT" | "UNSUPPORTED_SCHEMA" | "STORE_BUSY" | "STORE_CORRUPT" | "STORAGE_LIMIT" | "LIMIT_EXCEEDED" | "CONFLICT" | "IDEMPOTENCY_CONFLICT" | "BUDGET_EXCEEDED" | "CURSOR_STALE" | "BROWSER_UNAVAILABLE" | "SESSION_CLOSED" | "STALE_TARGET" | "AMBIGUOUS_TARGET" | "ORIGIN_NOT_ALLOWED" | "CREDENTIAL_FIELD" | "ACTION_NOT_ALLOWED" | "EXECUTION_CONFLICT" | "UNKNOWN_OUTCOME" | "APPLICATION_ERROR" | "ACTION_TIMEOUT" | "ACTION_CANCELLED" | null;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "test_run";
            runner: string;
            runner_version: string;
            application_version: string;
            started_at: string;
            finished_at: string;
            outcome: "skipped" | "failed" | "passed";
            assertions: {
                target_id: string;
                assertion: string;
                result: "skipped" | "failed" | "passed";
                evidence_ids: string[];
            }[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            revision: number;
            supersedes_id: string | null;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        })[];
        guards: string[];
        applicability: "conditional" | "unconditional" | "requires_check";
    } | {
        status: "no_matches";
        records: [];
        guards: [];
        applicability: "requires_check";
    } | {
        status: "incomplete";
        records: ({
            kind: "screen";
            route_template: string;
            creation_revision: number;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "state";
            screen_id: string;
            state_hash: string;
            normalization_version: string;
            view: {
                route_template: string;
                selected_tabs: string[];
                modal_stack: string[];
                feature_variants: {
                    name: string;
                    variant: string;
                }[];
            };
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "control";
            state_id: string;
            role: string;
            enabled: boolean;
            visible: boolean;
            descriptor: string;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
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
        } | {
            kind: "action";
            state_id: string;
            control_id: string | null;
            verb: "fill" | "key" | "navigate" | "select" | "click" | "scroll" | "check" | "uncheck";
            input_schema: {
                kind: "boolean" | "none" | "option" | "text" | "scroll" | "navigation_key";
                required: boolean;
                max_length?: number | undefined;
            };
            preconditions: string[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "transition";
            source_state_id: string;
            action_id: string;
            target_state_id: string;
            before_capture_id: string;
            after_capture_id: string;
            action_event_id: string;
            outcome: "error" | "success" | "timeout" | "cancelled";
            guards: string[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "flow";
            transition_ids: string[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "capture";
            screen_id: string;
            state_id: string | null;
            request_id: string;
            trace_id: string;
            trace_seq: number;
            session_id: string;
            tab_id: string;
            captured_at: string;
            received_at: string;
            source: {
                producer: string;
                producer_version: string;
                format: string;
                format_version: string;
            };
            redaction_profile: {
                alias: string;
                version: number;
            };
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "action_event";
            action_id: string;
            before_capture_id: string;
            after_capture_id: string | null;
            trace_id: string;
            trace_seq: number;
            session_id: string;
            tab_id: string;
            occurred_at: string;
            outcome: "error" | "success" | "timeout" | "cancelled";
            error_code: "INVALID_INPUT" | "UNKNOWN_SCOPE" | "NOT_FOUND" | "INCOMPATIBLE_CAPTURE" | "UNSUPPORTED_FORMAT" | "UNSUPPORTED_SCHEMA" | "STORE_BUSY" | "STORE_CORRUPT" | "STORAGE_LIMIT" | "LIMIT_EXCEEDED" | "CONFLICT" | "IDEMPOTENCY_CONFLICT" | "BUDGET_EXCEEDED" | "CURSOR_STALE" | "BROWSER_UNAVAILABLE" | "SESSION_CLOSED" | "STALE_TARGET" | "AMBIGUOUS_TARGET" | "ORIGIN_NOT_ALLOWED" | "CREDENTIAL_FIELD" | "ACTION_NOT_ALLOWED" | "EXECUTION_CONFLICT" | "UNKNOWN_OUTCOME" | "APPLICATION_ERROR" | "ACTION_TIMEOUT" | "ACTION_CANCELLED" | null;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "test_run";
            runner: string;
            runner_version: string;
            application_version: string;
            started_at: string;
            finished_at: string;
            outcome: "skipped" | "failed" | "passed";
            assertions: {
                target_id: string;
                assertion: string;
                result: "skipped" | "failed" | "passed";
                evidence_ids: string[];
            }[];
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            revision: number;
            supersedes_id: string | null;
            id: string;
            name: string;
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            evidence: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        })[];
        guards: string[];
        applicability: "conditional" | "requires_check";
        reason: "BUDGET_EXCEEDED";
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
} | {
    schema_version: 1;
    store_revision: number;
    data: {
        status: "available";
        items: ({
            provenance: "observed";
            projection: "structured_annotation";
            id: string;
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            evidence_ids: string[];
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            revision: number;
            supersedes_id: string | null;
        } | {
            provenance: "inferred";
            rationale: string;
            projection: "structured_annotation";
            id: string;
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            evidence_ids: string[];
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            revision: number;
            supersedes_id: string | null;
        } | {
            provenance: "test_verified";
            test_run_id: string;
            projection: "structured_annotation";
            id: string;
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            evidence_ids: string[];
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            revision: number;
            supersedes_id: string | null;
        } | {
            projection: "summary";
            id: string;
            kind: "annotation" | "capture";
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            source_summary: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            projection: "structured_capture";
            id: string;
            kind: "capture";
            screen_id: string;
            state_id: string | null;
            request_id: string;
            received_at: string;
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
        })[];
    } | {
        status: "unavailable";
        items: [];
        missing_ids: string[];
    } | {
        status: "incomplete";
        items: ({
            provenance: "observed";
            projection: "structured_annotation";
            id: string;
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            evidence_ids: string[];
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            revision: number;
            supersedes_id: string | null;
        } | {
            provenance: "inferred";
            rationale: string;
            projection: "structured_annotation";
            id: string;
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            evidence_ids: string[];
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            revision: number;
            supersedes_id: string | null;
        } | {
            provenance: "test_verified";
            test_run_id: string;
            projection: "structured_annotation";
            id: string;
            kind: "annotation";
            target_id: string;
            annotation_kind: "name" | "description" | "tag" | "prerequisite" | "interpretation";
            value: string;
            author_type: "agent" | "human";
            evidence_ids: string[];
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            revision: number;
            supersedes_id: string | null;
        } | {
            projection: "summary";
            id: string;
            kind: "annotation" | "capture";
            scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            source_summary: {
                evidence_ids: string[];
                provenance: "observed" | "inferred" | "test_verified";
                coverage: {
                    kind: "complete";
                    subtree: "root";
                } | {
                    kind: "partial";
                    subtree: string;
                    reason: "truncated" | "unsupported" | "subtree_only";
                };
                freshness: {
                    observed_at: string;
                    last_checked_at: string | null;
                    application_version: string | null;
                    age_seconds: number;
                    scope_match: boolean;
                    status: "unknown" | "recent" | "stale" | "contradicted";
                };
            };
        } | {
            projection: "structured_capture";
            id: string;
            kind: "capture";
            screen_id: string;
            state_id: string | null;
            request_id: string;
            received_at: string;
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
        })[];
        missing_ids: string[];
        reason: "BUDGET_EXCEEDED";
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
} | {
    schema_version: 1;
    store_revision: number;
    data: {
        status: "comparable";
        changes: {
            kind: "removed" | "added" | "altered" | "not_seen";
            subject: "annotation" | "control" | "outcome" | "tab" | "modal";
            before_id: string | null;
            after_id: string | null;
            evidence_ids: string[];
            coverage: {
                kind: "complete";
                subtree: "root";
            } | {
                kind: "partial";
                subtree: string;
                reason: "truncated" | "unsupported" | "subtree_only";
            };
        }[];
        invalidated_ids: string[];
        complete: boolean;
    } | {
        status: "incomparable";
        reason: "scope" | "coverage" | "normalization_version";
        evidence_ids: string[];
        changes: [];
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
} | {
    schema_version: 1;
    store_revision: number;
    data: {
        status: "blocked" | "unsupported" | "planned" | "needs_user_input";
        steps: {
            target_id: string;
            expected_scope: {
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            };
            minimum_observations: "complete_state" | "before_action_after" | "passed_assertion";
            prerequisites: string[];
            expected_view?: {
                route_template: string;
                selected_tabs: string[];
                modal_stack: string[];
                feature_variants: {
                    name: string;
                    variant: string;
                }[];
            } | undefined;
        }[];
        unresolved_ids: string[];
        complete: boolean;
    };
    warnings: {
        code: string;
        message: string;
        affected_ids: string[];
    }[];
    next_cursor?: {
        token: string;
        store_revision: number;
    } | undefined;
};
