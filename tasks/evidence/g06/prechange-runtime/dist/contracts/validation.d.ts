import type { ToolName, Requests, Responses } from './index.js';
export declare class ContractError extends Error {
    readonly code: 'INVALID_INPUT' | 'LIMIT_EXCEEDED' | 'UNSUPPORTED_SCHEMA';
    readonly field_paths: (string | number)[][];
    constructor(code: 'INVALID_INPUT' | 'LIMIT_EXCEEDED' | 'UNSUPPORTED_SCHEMA', field_paths?: (string | number)[][]);
    toJSON(): {
        schema_version: number;
        error: {
            code: "INVALID_INPUT" | "UNSUPPORTED_SCHEMA" | "LIMIT_EXCEEDED";
            message: "Contract request rejected";
            field_paths: (string | number)[][];
        };
    };
}
/** Validation only; never writes, redacts, launches a browser or grants authorization. */
export declare function validateRequest<K extends ToolName>(name: K, input: unknown, now?: number): Requests[K];
export declare function validateResponse<K extends ToolName>(name: K, input: unknown): Responses[K];
