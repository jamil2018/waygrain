/** Explicitly creates a new dedicated directory. Existing locations are never adopted. */
export declare function initializeConfiguration(configPath: string, input: unknown): Promise<Readonly<{
    project_id: string;
    app_ids: string[];
}>>;
/** Startup-only selection. No tool input is accepted or used to choose storage paths. */
export declare function loadConfiguration(configPath: string): Promise<{
    configPath: string;
    directory: string;
    storageDirectory: string;
    databasePath: string;
    coordinationPath: string;
    configuration: {
        schema_version: 1;
        project_id: string;
        apps: {
            alias: string;
            allowed_origins: string[];
            scopes: {
                alias: string;
                environment: string;
                origin: string;
                role: string;
                account_scope: string;
                locale: string;
            }[];
            route_mappings: {
                view_key: string;
                origin: string;
                route_template: string;
            }[];
            redaction_profiles: {
                alias: string;
                version: number;
                allowed_labels: string[];
                ignored_fields: string[];
                unknown_text: "drop";
            }[];
            app_id: string;
        }[];
        project_alias: string;
        storage_limit_bytes: number;
    };
}>;
