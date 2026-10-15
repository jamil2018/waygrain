import { Store } from '../store/database.js';
export declare function commit(store: Store, input: unknown, now?: number): {
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
};
