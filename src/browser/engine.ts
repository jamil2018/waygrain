import { chromium, type Page } from 'playwright';
import type { PageBinding } from './protocol.js';

export async function openBrowser(value: PageBinding, onLost: () => void) {
  let page: Page | undefined;
  const browser = await chromium.launch({ headless: false, timeout: 15_000 });
  try {
    const context = await browser.newContext({
      acceptDownloads: false,
      serviceWorkers: 'block',
      locale: value.scope.locale,
    });
    // Fail closed for cross-origin manual navigation/subresources. No request URL
    // or body is logged, returned, or stored. Federated login is unsupported.
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (
        ['http:', 'https:'].includes(url.protocol) &&
        url.origin === value.scope.origin &&
        (!route.request().isNavigationRequest() ||
          route.request().frame().page() === page)
      )
        await route.continue();
      else await route.abort();
    });
    await context.routeWebSocket('**/*', (socket) => socket.close());
    context.on('page', (extra) => {
      if (page && extra !== page) void extra.close().catch(() => undefined);
    });
    page = await context.newPage();
    page.on('dialog', (dialog) => {
      void dialog.dismiss().catch(() => undefined);
    });
    page.on('download', (download) => {
      void download.cancel().catch(() => undefined);
    });
    page.on('close', () => {
      onLost();
    });
    browser.on('disconnected', () => {
      onLost();
    });
    return { browser, context, page };
    // Open is deliberately blank. The human can navigate and log in in the headed
    // window; C03 will add agent navigation with current snapshot bindings.
  } catch (error) {
    await browser.close();
    throw error;
  }
}
