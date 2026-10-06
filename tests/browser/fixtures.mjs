// Explicit browser check; no screenshots, snapshots, traces, profiles or input values retained.
import assert from 'node:assert/strict';
import console from 'node:console';
import { chromium } from 'playwright';
import { fixtureHtml } from '../fixtures/ui/index.mjs';
const browser = await chromium.launch({ headless: false });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  let errors = 0;
  page.on('pageerror', () => errors++);
  for (const screen of ['home', 'settings', 'members', 'detail'])
    for (const role of ['admin', 'viewer'])
      for (const environment of ['staging', 'production'])
        for (const version of [1, 2]) {
          await page.setContent(
            fixtureHtml({ screen, role, environment, version }),
          );
          assert.equal(await page.getByRole('heading').count(), 1);
          if (screen === 'members') {
            const invite = page.getByRole('button', {
              name: version === 1 ? 'Invite' : 'Invite member',
              exact: true,
            });
            assert.equal(await invite.count(), role === 'admin' ? 1 : 0);
            await page.getByRole('tab', { name: 'Pending' }).click();
            assert.equal(
              await page
                .getByRole('tab', { name: 'Pending' })
                .getAttribute('aria-selected'),
              'true',
            );
            if (role === 'admin') {
              await invite.click();
              assert.equal(await page.getByRole('dialog').count(), 1);
              await page.getByRole('button', { name: 'Cancel' }).click();
              assert.equal(await page.getByRole('dialog').count(), 0);
            }
          }
          if (screen === 'detail')
            assert.equal(
              await page.getByRole('button', { name: 'Remove member' }).count(),
              role === 'admin' && version === 1 ? 1 : 0,
            );
        }
  assert.equal(errors, 0);
  await context.close();
  console.log(
    'B01 headed synthetic fixture matrix PASS (32 cases); no retained browser artifacts',
  );
} finally {
  await browser.close();
}
