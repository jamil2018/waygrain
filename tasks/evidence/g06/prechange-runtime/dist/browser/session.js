import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, chmod, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { AttemptJournal } from './attempts.js';
import { mappedRoute } from './snapshot.js';
import { Store } from '../store/database.js';
import { selectedApp } from '../core/ingest.js';
import { canonical } from '../core/normalize.js';
import { validateRequest, validateResponse, } from '../contracts/index.js';
import { BrowserError, capabilities, } from './protocol.js';
/** One owned worker per MCP process. No browser is started by construction or reads. */
export class BrowserSession {
    store;
    child;
    page;
    root;
    sequence = 0;
    queue = Promise.resolve();
    stopping = false;
    activeExecution;
    closingRequested = false;
    disposed = false;
    disposal;
    cleanup = 'complete';
    opens = new Map();
    pending = new Map();
    constructor(store) {
        this.store = store;
    }
    async rpc(command, page, app, extra = {}) {
        const child = this.child;
        if (!child?.connected)
            throw new BrowserError('SESSION_CLOSED');
        const id = ++this.sequence;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(id);
                this.stopping = true;
                this.cleanup = 'unconfirmed';
                child.disconnect(); // Worker remains responsible for its in-flight launch and cleanup.
                reject(new BrowserError('BROWSER_UNAVAILABLE'));
            }, 25_000);
            this.pending.set(id, {
                resolve: (reply) => reply.error
                    ? reject(new BrowserError(reply.error))
                    : reply.data
                        ? resolve(reply.data)
                        : reject(new BrowserError('BROWSER_UNAVAILABLE')),
                reject,
                timer,
            });
            child.send({
                id,
                command,
                ...(page ? { page } : {}),
                ...(app ? { app } : {}),
                ...extra,
            }, (error) => {
                if (error) {
                    clearTimeout(timer);
                    this.pending.delete(id);
                    reject(new BrowserError('BROWSER_UNAVAILABLE'));
                }
            });
        });
    }
    async start(page) {
        this.root = await mkdtemp(join(tmpdir(), 'waygrain-browser-'));
        await chmod(this.root, 0o700);
        const child = fork(fileURLToPath(new URL('./worker.js', import.meta.url)), [], {
            stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
            execArgv: [],
            env: {
                ...process.env,
                TMPDIR: this.root,
                TMP: this.root,
                TEMP: this.root,
                DEBUG: '',
                PWDEBUG: '',
            },
        });
        this.child = child;
        child.on('message', (reply) => {
            const pending = this.pending.get(reply.id);
            if (!pending)
                return;
            clearTimeout(pending.timer);
            this.pending.delete(reply.id);
            pending.resolve(reply);
        });
        child.on('error', () => {
            this.cleanup = 'unconfirmed';
        });
        child.on('exit', (code) => {
            if (this.child !== child)
                return;
            this.child = undefined;
            this.cleanup = code === 0 ? 'complete' : 'unconfirmed';
            for (const p of this.pending.values()) {
                clearTimeout(p.timer);
                p.reject(new BrowserError('SESSION_CLOSED'));
            }
            this.pending.clear();
        });
        const result = await this.rpc('open', page, this.store.location.configuration.apps.find((a) => a.app_id === this.ownerApp));
        if (result.status !== 'open')
            throw new BrowserError('BROWSER_UNAVAILABLE');
        this.page = page;
    }
    dispatch(tool, input, signal) {
        if (tool === 'wg_browser_close') {
            try {
                const q = validateRequest('wg_browser_close', input);
                const app = selectedApp(this.store, q);
                if (this.child?.connected &&
                    this.ownerApp === app.app_id &&
                    q.session_id === this.page?.session_id) {
                    this.closingRequested = true;
                    if (this.activeExecution)
                        this.child.send({ id: ++this.sequence, command: 'cancel' }, () => undefined);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
        }
        // Serialize all lifecycle mutations so concurrent open/close cannot orphan resources.
        const run = this.queue.then(() => this.handle(tool, input, signal));
        this.queue = run.then(() => undefined, () => undefined);
        return run;
    }
    async handle(tool, input, signal) {
        if (this.disposed)
            throw new BrowserError('SESSION_CLOSED');
        if (signal?.aborted ||
            (this.closingRequested &&
                !['wg_browser_close', 'wg_browser_status'].includes(tool)))
            throw new BrowserError('ACTION_CANCELLED');
        const request = validateRequest(tool, input);
        const app = selectedApp(this.store, request);
        const envelope = (data) => validateResponse(tool, {
            schema_version: 1,
            browser_schema_version: 1,
            store_revision: this.store.revision,
            warnings: [],
            data,
        });
        if (this.child && this.ownerApp !== app.app_id)
            throw new BrowserError('UNKNOWN_SCOPE');
        if (tool === 'wg_browser_open') {
            const q = validateRequest('wg_browser_open', input);
            const scope = { ...q.scope, role: q.scope.role ?? 'unknown' };
            if (!app.scopes.some((s) => canonical({
                environment: s.environment,
                origin: s.origin,
                role: s.role,
                account_scope: s.account_scope,
                locale: s.locale,
            }) === canonical(scope)))
                throw new BrowserError('UNKNOWN_SCOPE');
            const replayKey = app.app_id + q.request_id;
            const replay = this.opens.get(replayKey);
            if (replay) {
                if (replay.scope !== canonical(scope))
                    throw new BrowserError('IDEMPOTENCY_CONFLICT');
                if (!this.child?.connected ||
                    this.page?.session_id !== replay.page.session_id)
                    throw new BrowserError('SESSION_CLOSED');
                return envelope({ status: 'open', page: replay.page, capabilities });
            }
            if (this.child || this.stopping)
                throw new BrowserError('CONFLICT');
            if (this.opens.size >= 1000)
                throw new BrowserError('LIMIT_EXCEEDED');
            const page = { session_id: randomUUID(), page_id: randomUUID(), scope };
            this.ownerApp = app.app_id;
            await this.start(page);
            this.opens.set(replayKey, { scope: canonical(scope), page });
            return envelope({ status: 'open', page, capabilities });
        }
        if (tool === 'wg_browser_act') {
            const q = validateRequest('wg_browser_act', input);
            const action = q.action;
            const metadata = action.kind === 'fill'
                ? {
                    kind: action.kind,
                    session_id: action.session_id,
                    page_id: action.page_id,
                    snapshot_id: action.snapshot_id,
                    target_id: action.target_id,
                }
                : action;
            const journal = new AttemptJournal(this.store, app.app_id);
            const replay = journal.replay(q.execution_id, tool, metadata);
            if (replay)
                return envelope(replay);
            if (!this.child?.connected ||
                this.stopping ||
                this.ownerApp !== app.app_id)
                throw new BrowserError('SESSION_CLOSED');
            const pending = (await this.rpc('prepare_act', undefined, undefined, { action: q })).receipt;
            if (!pending)
                throw new BrowserError('BROWSER_UNAVAILABLE');
            if (signal?.aborted || this.closingRequested)
                throw new BrowserError('ACTION_CANCELLED');
            journal.reserve(q.request_id, tool, metadata, pending);
            this.activeExecution = q.execution_id;
            const cancel = () => this.cancel(q.execution_id);
            signal?.addEventListener('abort', cancel, { once: true });
            let final;
            try {
                final = (await this.rpc('act', undefined, undefined, {
                    execution_id: q.execution_id,
                })).receipt;
            }
            catch {
                final = {
                    ...pending,
                    state: 'unknown',
                    dispatch: 'uncertain',
                    error_code: 'UNKNOWN_OUTCOME',
                };
            }
            finally {
                this.activeExecution = undefined;
                signal?.removeEventListener('abort', cancel);
            }
            if (!final)
                throw new BrowserError('UNKNOWN_OUTCOME');
            journal.finish(q.request_id, final);
            return envelope(final);
        }
        if (tool === 'wg_browser_navigate') {
            const q = validateRequest('wg_browser_navigate', input);
            const metadata = {
                session_id: q.session_id,
                page_id: q.page_id,
                snapshot_id: q.snapshot_id,
                scope: q.scope,
                route: mappedRoute(q.url, app, q.scope.origin),
            };
            const journal = new AttemptJournal(this.store, app.app_id);
            const replay = journal.replay(q.execution_id, tool, metadata);
            if (replay)
                return envelope(replay);
            if (!this.child?.connected ||
                this.stopping ||
                this.ownerApp !== app.app_id)
                throw new BrowserError('SESSION_CLOSED');
            const pending = (await this.rpc('prepare_navigate', undefined, undefined, {
                navigation: q,
            })).receipt;
            if (!pending)
                throw new BrowserError('BROWSER_UNAVAILABLE');
            if (signal?.aborted || this.closingRequested)
                throw new BrowserError('ACTION_CANCELLED');
            journal.reserve(q.request_id, tool, metadata, pending);
            this.activeExecution = q.execution_id;
            const cancel = () => this.cancel(q.execution_id);
            signal?.addEventListener('abort', cancel, { once: true });
            let final;
            try {
                final = (await this.rpc('navigate', undefined, undefined, {
                    execution_id: q.execution_id,
                })).receipt;
            }
            catch {
                final = {
                    ...pending,
                    state: 'unknown',
                    dispatch: 'uncertain',
                    error_code: 'UNKNOWN_OUTCOME',
                };
            }
            this.activeExecution = undefined;
            signal?.removeEventListener('abort', cancel);
            if (!final)
                throw new BrowserError('UNKNOWN_OUTCOME');
            journal.finish(q.request_id, final);
            return envelope(final);
        }
        if (tool === 'wg_browser_snapshot') {
            const q = validateRequest('wg_browser_snapshot', input);
            if (!this.child?.connected ||
                this.stopping ||
                q.session_id !== this.page?.session_id ||
                q.page_id !== this.page.page_id ||
                this.ownerApp !== app.app_id)
                throw new BrowserError('SESSION_CLOSED');
            const result = await this.rpc('snapshot');
            if (!result.snapshot)
                throw new BrowserError('BROWSER_UNAVAILABLE');
            return envelope(result.snapshot);
        }
        if (tool === 'wg_browser_status') {
            const q = validateRequest('wg_browser_status', input);
            if (q.session_id && q.session_id !== this.page?.session_id)
                throw new BrowserError('SESSION_CLOSED');
            if (q.execution_id) {
                const receipt = new AttemptJournal(this.store, app.app_id).read(q.execution_id);
                if (!receipt)
                    throw new BrowserError('NOT_FOUND');
                const open = this.child?.connected &&
                    !this.stopping &&
                    (await this.rpc('status')).status === 'open';
                return envelope({
                    status: open ? 'open' : 'closed',
                    page: open ? this.page : null,
                    capabilities,
                    attempts: [receipt],
                });
            }
            const open = this.child?.connected &&
                !this.stopping &&
                (await this.rpc('status')).status === 'open';
            return envelope({
                status: open ? 'open' : 'closed',
                page: open ? this.page : null,
                capabilities,
                attempts: [],
            });
        }
        const q = validateRequest('wg_browser_close', input);
        if (q.session_id !== this.page?.session_id)
            throw new BrowserError('SESSION_CLOSED');
        await this.close();
        return envelope({
            status: 'closed',
            session_id: q.session_id,
            cleanup: this.cleanup,
        });
    }
    cancel(execution) {
        if (this.activeExecution === execution && this.child?.connected)
            this.child.send({ id: ++this.sequence, command: 'cancel' }, () => undefined);
    }
    ownerApp;
    dispose() {
        this.disposed = true;
        return (this.disposal ??= this.queue.then(() => this.close()));
    }
    async close() {
        this.stopping = true;
        try {
            if (this.child?.connected)
                this.cleanup = (await this.rpc('close')).cleanup ?? 'unconfirmed';
            else if (this.child)
                this.cleanup = 'unconfirmed';
        }
        catch {
            this.cleanup = 'unconfirmed';
        }
        // Wait only on this live owned child; bounded exit confirmation is not PID authority.
        const child = this.child;
        if (child && (this.cleanup === 'complete' || !child.connected)) {
            await new Promise((resolve) => {
                if (child.exitCode !== null || child.signalCode !== null) {
                    resolve();
                    return;
                }
                const exited = () => {
                    clearTimeout(timer);
                    resolve();
                };
                const timer = setTimeout(() => {
                    child.removeListener('exit', exited);
                    this.cleanup = 'unconfirmed';
                    resolve();
                }, 5000);
                child.once('exit', exited);
            });
        }
        if (!this.child && this.cleanup === 'complete') {
            if (this.root)
                await rm(this.root, { recursive: true, force: true });
            this.stopping = false;
            this.closingRequested = false;
        }
    }
}
