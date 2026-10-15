import { Store } from './database.js';
export declare function backup(store: Store): Promise<{
    status: "backed_up";
    backup_id: `${string}-${string}-${string}-${string}-${string}`;
    store_revision: number;
    sha256: string;
}>;
/** JSON export is archival, including redacted history and tombstones. No import API. */
export declare function exportArchive(store: Store): Promise<{
    status: "exported";
    export_id: `${string}-${string}-${string}-${string}-${string}`;
    store_revision: number;
    archival_only: boolean;
    sha256: string;
}>;
export declare function restore(configPath: string, id: unknown, sha256: unknown): Promise<{
    status: "restored";
    backup_id: string;
    store_revision: number;
    retained_previous_id: `${string}-${string}-${string}-${string}-${string}`;
}>;
