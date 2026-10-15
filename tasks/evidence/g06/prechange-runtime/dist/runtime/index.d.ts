export declare class RuntimeError extends Error {
    readonly code: 'SQLITE_UNAVAILABLE' | 'BROWSER_UNAVAILABLE' | 'BROWSER_INSTALL_FAILED' | 'MCP_FAILED';
    constructor(code: 'SQLITE_UNAVAILABLE' | 'BROWSER_UNAVAILABLE' | 'BROWSER_INSTALL_FAILED' | 'MCP_FAILED');
}
export declare function smokeSqlite(storageDirectory: string): Promise<void>;
export declare function installBrowser(): Promise<void>;
export declare function smokeRuntime(configPath: string): Promise<{
    status: string;
    sqlite: string;
    browser: string;
}>;
export declare function serve(configPath: string): Promise<void>;
