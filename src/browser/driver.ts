import { randomUUID } from 'node:crypto';
import type { Page, ElementHandle } from 'playwright';
import { canonical, digest, type AppConfiguration } from '../core/normalize.js';
import type { Responses, Requests } from '../contracts/index.js';
import { BrowserError, type PageBinding } from './protocol.js';
import { mappedRoute, snapshotPage } from './snapshot.js';

type Snapshot = Responses['wg_browser_snapshot']['data'];
type Receipt = Responses['wg_browser_navigate']['data'];
type Handle = ElementHandle<HTMLElement | SVGElement>;
const projection = (s: Snapshot) => ({
  scope: s.capture.scope,
  view: s.capture.view,
  tree: s.capture.tree,
  coverage: s.capture.coverage,
});

/** All executable references stay inside the isolated worker and die with its snapshot. */
export class BrowserDriver {
  readonly trace = randomUUID();
  private sequence = 0;
  private latest: Snapshot | undefined;
  private url = '';
  private generation = 0;
  private snapshotGeneration = -1;
  private handles = new Map<string, Handle | null>();
  private prepared: { receipt: Receipt; url: string } | undefined;
  constructor(
    readonly page: Page,
    readonly app: AppConfiguration,
    readonly binding: PageBinding,
  ) {
    page.on('framenavigated', () => {
      this.generation++;
    });
  }
  async snapshot(): Promise<Snapshot> {
    await this.invalidate();
    const generation = this.generation;
    const current = await snapshotPage(
      this.page,
      this.app,
      this.binding,
      this.trace,
      ++this.sequence,
    );
    const descriptors = new Map<string, Handle | null>();
    const deadline = Date.now() + 5000;
    for (const target of current.targets) {
      if (Date.now() > deadline) {
        await this.invalidate();
        throw new BrowserError('LIMIT_EXCEEDED');
      }
      const descriptor = canonical({ role: target.role, name: target.name });
      if (!descriptors.has(descriptor)) {
        const locator = this.page.getByRole(
          target.role as Parameters<Page['getByRole']>[0],
          { name: target.name, exact: true },
        );
        const count = await locator.count();
        descriptors.set(
          descriptor,
          count === 1 ? await locator.elementHandle({ timeout: 1000 }) : null,
        );
      }
      this.handles.set(target.target_id, descriptors.get(descriptor)!);
    }
    if (generation !== this.generation) {
      await this.invalidate();
      throw new BrowserError('STALE_TARGET');
    }
    this.latest = current;
    this.url = this.page.url();
    this.snapshotGeneration = generation;
    return current;
  }
  async invalidate() {
    const unique = new Set(this.handles.values());
    this.handles.clear();
    this.latest = undefined;
    await Promise.all(
      [...unique].map((h) => h?.dispose().catch(() => undefined)),
    );
  }
  private bound(session: string, page: string, snapshot: string) {
    if (
      session !== this.binding.session_id ||
      page !== this.binding.page_id ||
      !this.latest ||
      snapshot !== this.latest.snapshot_id ||
      this.generation !== this.snapshotGeneration ||
      this.page.url() !== this.url
    )
      throw new BrowserError('STALE_TARGET');
    return this.latest;
  }
  async current(session: string, page: string, snapshot: string) {
    const previous = this.bound(session, page, snapshot);
    const fresh = await snapshotPage(
      this.page,
      this.app,
      this.binding,
      this.trace,
      this.sequence,
    );
    this.bound(session, page, snapshot);
    if (digest(projection(previous)) !== digest(projection(fresh)))
      throw new BrowserError('STALE_TARGET');
    return previous;
  }
  async resolve(
    session: string,
    page: string,
    snapshot: string,
    target: string,
  ) {
    const current = await this.current(session, page, snapshot);
    const descriptor = current.targets.find((t) => t.target_id === target);
    if (!descriptor || !this.handles.has(target))
      throw new BrowserError('STALE_TARGET');
    const live = this.page.getByRole(
      descriptor.role as Parameters<Page['getByRole']>[0],
      { name: descriptor.name, exact: true },
    );
    const count = await live.count();
    if (count > 1) throw new BrowserError('AMBIGUOUS_TARGET');
    const handle = this.handles.get(target);
    if (count !== 1 || !handle)
      throw new BrowserError(count > 0 ? 'AMBIGUOUS_TARGET' : 'STALE_TARGET');
    const same = await live.evaluate((element, old) => element === old, handle);
    this.bound(session, page, snapshot);
    if (!same || !(await handle.isVisible()) || !(await handle.isEnabled()))
      throw new BrowserError('STALE_TARGET');
    return { handle, descriptor };
  }
  async prepareNavigation(
    q: Requests['wg_browser_navigate'],
  ): Promise<Receipt> {
    await this.current(q.session_id, q.page_id, q.snapshot_id);
    if (
      canonical({ ...q.scope, role: q.scope.role ?? 'unknown' }) !==
      canonical(this.binding.scope)
    )
      throw new BrowserError('UNKNOWN_SCOPE');
    // No query, fragment, userinfo or redirect/scope handoff is permitted by the input/policy.
    const destination = new URL(q.url);
    if (
      destination.search ||
      destination.hash ||
      destination.username ||
      destination.password
    )
      throw new BrowserError('ORIGIN_NOT_ALLOWED');
    mappedRoute(q.url, this.app, this.binding.scope.origin);
    const receipt: Receipt = {
      execution_id: q.execution_id,
      session_id: q.session_id,
      page_id: q.page_id,
      snapshot_id: q.snapshot_id,
      target_id: null,
      trace_id: this.trace,
      trace_seq: ++this.sequence,
      action_kind: 'navigate',
      occurred_at: new Date().toISOString(),
      after_snapshot_id: null,
      state: 'pending',
      dispatch: 'not_dispatched',
      error_code: null,
    };
    this.prepared = { receipt, url: q.url };
    return receipt;
  }
  async navigate(execution: string): Promise<Receipt> {
    const prepared = this.prepared;
    this.prepared = undefined;
    if (!prepared || prepared.receipt.execution_id !== execution)
      throw new BrowserError('EXECUTION_CONFLICT');
    // Recheck immediately before dispatch; a durable marker must already exist at the parent.
    try {
      await this.current(
        prepared.receipt.session_id,
        prepared.receipt.page_id,
        prepared.receipt.snapshot_id,
      );
    } catch (error) {
      return {
        ...prepared.receipt,
        after_snapshot_id: null,
        state: 'not_started',
        dispatch: 'not_dispatched',
        error_code:
          error instanceof BrowserError ? error.code : 'APPLICATION_ERROR',
      };
    }
    await this.invalidate();
    try {
      const response = await this.page.goto(prepared.url, {
        timeout: 5000,
        waitUntil: 'domcontentloaded',
      });
      mappedRoute(this.page.url(), this.app, this.binding.scope.origin);
      if (!response || !response.ok())
        return {
          ...prepared.receipt,
          state: 'failed',
          dispatch: 'dispatched',
          error_code: 'APPLICATION_ERROR',
        };
      return {
        ...prepared.receipt,
        state: 'succeeded',
        dispatch: 'dispatched',
        error_code: null,
      };
    } catch {
      return {
        ...prepared.receipt,
        state: 'unknown',
        dispatch: 'uncertain',
        error_code: 'UNKNOWN_OUTCOME',
      };
    }
  }
}
