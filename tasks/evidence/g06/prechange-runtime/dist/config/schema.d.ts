import { z } from 'zod';
export declare const DEFAULT_STORAGE_LIMIT_BYTES: number;
export declare const MAX_CONFIGURATION_BYTES: number;
export declare const initializationSchema: z.ZodObject<{
    project_alias: z.ZodString;
    apps: z.ZodArray<z.ZodObject<{
        alias: z.ZodString;
        allowed_origins: z.ZodArray<z.ZodString>;
        scopes: z.ZodArray<z.ZodObject<{
            alias: z.ZodString;
            environment: z.ZodString;
            origin: z.ZodString;
            role: z.ZodDefault<z.ZodString>;
            account_scope: z.ZodString;
            locale: z.ZodString;
        }, z.core.$strict>>;
        route_mappings: z.ZodArray<z.ZodObject<{
            view_key: z.ZodString;
            origin: z.ZodString;
            route_template: z.ZodString;
        }, z.core.$strict>>;
        redaction_profiles: z.ZodArray<z.ZodObject<{
            alias: z.ZodString;
            version: z.ZodNumber;
            allowed_labels: z.ZodArray<z.ZodString>;
            ignored_fields: z.ZodArray<z.ZodString>;
            unknown_text: z.ZodLiteral<"drop">;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    storage_limit_bytes: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export declare const configurationSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<1>;
    project_id: z.ZodUUID;
    apps: z.ZodArray<z.ZodObject<{
        alias: z.ZodString;
        allowed_origins: z.ZodArray<z.ZodString>;
        scopes: z.ZodArray<z.ZodObject<{
            alias: z.ZodString;
            environment: z.ZodString;
            origin: z.ZodString;
            role: z.ZodDefault<z.ZodString>;
            account_scope: z.ZodString;
            locale: z.ZodString;
        }, z.core.$strict>>;
        route_mappings: z.ZodArray<z.ZodObject<{
            view_key: z.ZodString;
            origin: z.ZodString;
            route_template: z.ZodString;
        }, z.core.$strict>>;
        redaction_profiles: z.ZodArray<z.ZodObject<{
            alias: z.ZodString;
            version: z.ZodNumber;
            allowed_labels: z.ZodArray<z.ZodString>;
            ignored_fields: z.ZodArray<z.ZodString>;
            unknown_text: z.ZodLiteral<"drop">;
        }, z.core.$strict>>;
        app_id: z.ZodUUID;
    }, z.core.$strict>>;
    project_alias: z.ZodString;
    storage_limit_bytes: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type Configuration = z.infer<typeof configurationSchema>;
export declare class ConfigurationError extends Error {
    readonly code: 'INVALID_CONFIG' | 'INVALID_PATH' | 'ALREADY_INITIALIZED' | 'CONFIG_IO';
    constructor(code: 'INVALID_CONFIG' | 'INVALID_PATH' | 'ALREADY_INITIALIZED' | 'CONFIG_IO');
}
export declare function validateSettings(input: unknown): {
    project_alias: string;
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
    }[];
    storage_limit_bytes: number;
};
export declare function validateConfiguration(input: unknown): Configuration;
