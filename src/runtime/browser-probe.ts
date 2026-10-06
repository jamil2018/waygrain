import { chromium } from 'playwright';

// Explicit A04 smoke only: no URL, page content, snapshot, profile or IPC payload.
try {
  const browser = await chromium.launch({ headless: false, timeout: 15_000 });
  try {
    const context = await browser.newContext({ acceptDownloads: false });
    const page = await context.newPage();
    if (page.url() !== 'about:blank') throw new Error();
    await context.close();
  } finally {
    await browser.close();
  }
} catch {
  process.exitCode = 1;
}
