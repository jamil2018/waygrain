import { z } from 'zod';
export declare const view: z.ZodObject<{
    route_template: z.ZodString;
    selected_tabs: z.ZodArray<z.ZodString>;
    modal_stack: z.ZodArray<z.ZodString>;
    feature_variants: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        variant: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const coverage: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export declare const locatorHint: z.ZodObject<{
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
}, z.core.$strict>;
export declare const treeNode: z.ZodObject<{
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
export type TreeNode = z.infer<typeof treeNode>;
export declare const capture: z.ZodObject<{
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
export declare const screenRef: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"existing">;
    screen_id: z.ZodUUID;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"new">;
    name: z.ZodString;
    view_key: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "kind">;
export declare const redactionSummary: z.ZodObject<{
    dropped_fields: z.ZodNumber;
    dropped_texts: z.ZodNumber;
    profile: z.ZodObject<{
        alias: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const ingestResult: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
