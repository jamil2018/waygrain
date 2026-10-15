import { loadConfiguration } from '../config/index.js';
export interface Statement {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): {
        changes: number;
    };
}
export interface Database {
    exec(sql: string): void;
    pragma(sql: string, options?: {
        simple: boolean;
    }): unknown;
    prepare(sql: string): Statement;
    backup(path: string): Promise<unknown>;
    close(): void;
}
export declare const BUSY_TIMEOUT_MS = 250;
type Location = Awaited<ReturnType<typeof loadConfiguration>>;
/** Holds exclusive lifetime authority without opening a possibly corrupt knowledge file. */
export declare function offlineMaintenance<T>(configPath: string, callback: (location: Location) => Promise<T>): Promise<T>;
export declare class Store {
    readonly location: Location;
    readonly db: Database;
    private readonly coordination;
    readonly cursorEpoch: string;
    readonly maintenance: boolean;
    private closed;
    private constructor();
    static open(configPath: string, mode?: 'normal' | 'maintenance'): Promise<Store>;
    get revision(): number;
    private assertOpen;
    requireRevision(expected?: number): void;
    advanceRevision(): number;
    transaction<T>(callback: () => T, write?: boolean): T;
    write<T>(expected: number | undefined, callback: (revision: number) => T): T;
    requireStorageCapacity(): void;
    close(): void;
}
export {};
