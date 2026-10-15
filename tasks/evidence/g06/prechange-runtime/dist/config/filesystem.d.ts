import { ConfigurationError } from './schema.js';
export declare function validateAbsolutePath(path: string): void;
export declare function checkDirectoryChain(path: string): Promise<void>;
export declare function checkPrivateEntry(path: string, directory: boolean): Promise<void>;
export declare function readJsonFile(path: string, privateFile?: boolean): Promise<unknown>;
export declare function filesystemError(error: unknown): ConfigurationError;
