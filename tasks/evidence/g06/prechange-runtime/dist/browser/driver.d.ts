import type { Page, ElementHandle } from 'playwright';
import { type AppConfiguration } from '../core/normalize.js';
import type { Responses, Requests } from '../contracts/index.js';
import { type PageBinding } from './protocol.js';
type Snapshot = Responses['wg_browser_snapshot']['data'];
type Receipt = Responses['wg_browser_navigate']['data'];
type Handle = ElementHandle<HTMLElement | SVGElement>;
/** All executable references stay inside the isolated worker and die with its snapshot. */
export declare class BrowserDriver {
    readonly page: Page;
    readonly app: AppConfiguration;
    readonly binding: PageBinding;
    readonly trace: `${string}-${string}-${string}-${string}-${string}`;
    private sequence;
    private latest;
    private url;
    private generation;
    private snapshotGeneration;
    private handles;
    private prepared;
    constructor(page: Page, app: AppConfiguration, binding: PageBinding);
    snapshot(): Promise<Snapshot>;
    receipt(execution: string, snapshot: string, kind: Receipt['action_kind'], target: string | null): Receipt;
    cached(target: string): Handle | null;
    consume(): void;
    invalidate(): Promise<void>;
    private bound;
    current(session: string, page: string, snapshot: string): Promise<{
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
        targets: {
            target_id: string;
            role: string;
            name: string;
            permitted_actions: ("fill" | "key" | "select" | "click" | "scroll" | "check" | "uncheck")[];
            option_ids?: string[] | undefined;
        }[];
        session_id: string;
        page_id: string;
        snapshot_id: string;
    }>;
    resolve(session: string, page: string, snapshot: string, target: string): Promise<{
        handle: Handle;
        descriptor: {
            target_id: string;
            role: string;
            name: string;
            permitted_actions: ("fill" | "key" | "select" | "click" | "scroll" | "check" | "uncheck")[];
            option_ids?: string[] | undefined;
        };
    }>;
    prepareNavigation(q: Requests['wg_browser_navigate']): Promise<Receipt>;
    navigate(execution: string): Promise<Receipt>;
}
export {};
