/** Explicit disposable SQLite probe; no graph migration or browser launch. */
export declare function diagnose(configPath: string): Promise<{
    status: string;
    node_supported: boolean;
    configuration: string;
    project_id: string;
    sqlite: string;
    browser_installed: boolean;
    browser_launch: string;
    host_integration: string;
}>;
