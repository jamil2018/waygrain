import { Store } from './database.js';
export declare function deleteScope(store: Store, input: unknown): {
    status: "deleted";
    deletion_batch: `${string}-${string}-${string}-${string}-${string}`;
    record_count: number;
    store_revision: number;
};
export declare function undoDelete(store: Store, input: unknown): {
    status: "restored";
    deletion_batch: string;
    record_count: number;
    store_revision: number;
};
export declare function previewPurge(store: Store, input: unknown): {
    status: "preview";
    scope: {
        environment: string;
        origin: string;
        role: string;
        account_scope: string;
        locale: string;
    };
    store_revision: number;
    record_count: number;
    counts: {
        [k: string]: number;
    };
    sample_ids: string[];
    preview_token: string;
    backups_retain_data: boolean;
};
export declare function purge(store: Store, input: unknown): {
    storage_reclaimed: boolean;
    status: "purged";
    record_count: number;
    store_revision: number;
    backups_retain_data: boolean;
};
