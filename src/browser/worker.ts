import { rm } from 'node:fs/promises';
import { basename, isAbsolute } from 'node:path';
import type { Browser, Page } from 'playwright';
import { BrowserDriver } from './driver.js';
import { BrowserError } from './protocol.js';
import { openBrowser } from './engine.js';
import type { WorkerRequest, WorkerReply } from './protocol.js';

let browser: Browser | undefined;
let page: Page | undefined;
let stopping = false;
let app: WorkerRequest['app'];
let binding: WorkerRequest['page'];
let driver: BrowserDriver | undefined;
let opening: Promise<void> | undefined;
const temporaryRoot = process.env.TMPDIR ?? '';
// A direct standalone invocation has no owned IPC/root and must never delete
// the caller's generic temporary directory.
if (
  !process.send ||
  !isAbsolute(temporaryRoot) ||
  !basename(temporaryRoot).startsWith('waygrain-browser-')
)
  process.exit(1);

let cleaning: Promise<'complete' | 'unconfirmed'> | undefined;
function cleanup(): Promise<'complete' | 'unconfirmed'> {
  return (cleaning ??= (async () => {
    try {
      await browser?.close();
      browser = undefined;
      page = undefined;
      await rm(temporaryRoot, { recursive: true, force: true });
      process.exitCode = 0;
      return 'complete';
    } catch {
      process.exitCode = 1;
      return 'unconfirmed';
    }
  })());
}
async function stop() {
  if (stopping) return;
  stopping = true;
  // Launch may be in flight when the owning MCP parent vanishes.
  await opening?.catch(() => undefined);
  const result = await cleanup();
  process.exitCode = result === 'complete' ? 0 : 1;
  if (process.connected) process.disconnect();
}
process.on('disconnect', () => {
  void stop();
});
for (const signal of ['SIGTERM', 'SIGINT', 'SIGHUP'] as const)
  process.on(signal, () => {
    void stop();
  });
process.on('uncaughtException', () => {
  void stop();
});
process.on('unhandledRejection', () => {
  void stop();
});

async function handle(request: WorkerRequest): Promise<WorkerReply> {
  if (request.command === 'close') {
    stopping = true;
    await opening?.catch(() => undefined);
    return {
      id: request.id,
      data: { status: 'closed', cleanup: await cleanup() },
    };
  }
  if (stopping) return { id: request.id, error: 'SESSION_CLOSED' };
  if (request.command === 'open' && request.page && !opening) {
    app = request.app;
    binding = request.page;
    opening = openBrowser(request.page, () => {
      void stop();
    }).then((opened) => {
      browser = opened.browser;
      page = opened.page;
      if (app && binding) driver = new BrowserDriver(page, app, binding);
    });
    try {
      await opening;
      if (stopping) throw new Error();
    } catch {
      await cleanup();
      return { id: request.id, error: 'BROWSER_UNAVAILABLE' };
    }
  }
  if (request.command === 'snapshot') {
    if (!page || !app || !binding || page.isClosed())
      throw new BrowserError('SESSION_CLOSED');
    return {
      id: request.id,
      data: {
        status: 'open',
        snapshot: await driver!.snapshot(),
      },
    };
  }
  if (request.command === 'prepare_navigate' && request.navigation && driver)
    return {
      id: request.id,
      data: {
        status: 'open',
        receipt: await driver.prepareNavigation(request.navigation),
      },
    };
  if (request.command === 'navigate' && request.execution_id && driver)
    return {
      id: request.id,
      data: {
        status: 'open',
        receipt: await driver.navigate(request.execution_id),
      },
    };
  return {
    id: request.id,
    data: {
      status:
        browser?.isConnected() && page && !page.isClosed() ? 'open' : 'closed',
    },
  };
}
let queue = Promise.resolve();
process.on('message', (message: WorkerRequest) => {
  queue = queue.then(async () => {
    let reply: WorkerReply;
    try {
      reply = await handle(message);
    } catch (error) {
      reply = {
        id: message.id,
        error:
          error instanceof BrowserError ? error.code : 'BROWSER_UNAVAILABLE',
      };
    }
    if (process.connected) process.send?.(reply);
    if (
      message.command === 'close' ||
      (reply.error && message.command === 'open')
    ) {
      await stop();
      if (process.connected) process.disconnect();
    }
  });
});

if (!process.connected) void stop();
