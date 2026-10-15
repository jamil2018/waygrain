import { Store } from '../store/database.js';
import { type Responses } from '../contracts/index.js';
import { type LifecycleTool } from './protocol.js';
/** One owned worker per MCP process. No browser is started by construction or reads. */
export declare class BrowserSession {
    private readonly store;
    private child;
    private page?;
    private root?;
    private sequence;
    private queue;
    private stopping;
    private activeExecution;
    private closingRequested;
    private disposed;
    private disposal;
    private cleanup;
    private opens;
    private pending;
    constructor(store: Store);
    private rpc;
    private start;
    dispatch<K extends LifecycleTool>(tool: K, input: unknown, signal?: AbortSignal): Promise<Responses[K]>;
    private handle;
    cancel(execution: string): void;
    private ownerApp?;
    dispose(): Promise<void>;
    close(): Promise<void>;
}
