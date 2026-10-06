import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRequest } from '../dist/contracts/index.js';
import { base } from './fixtures/contracts.mjs';
import {
  fixtureCapture,
  fixtureHtml,
  fixtureSettings,
  sensitive,
} from './fixtures/ui/index.mjs';
import { validateSettings } from '../dist/config/schema.js';

test('B01 corpus covers four screens, scopes, tab/modal and changed UI version', () => {
  assert.equal(validateSettings(fixtureSettings()).apps[0].scopes.length, 4);
  for (const screen of ['home', 'settings', 'members', 'detail']) {
    for (const role of ['admin', 'viewer'])
      for (const environment of ['staging', 'production'])
        for (const version of [1, 2]) {
          const capture = fixtureCapture({
            screen,
            role,
            environment,
            version,
          });
          validateRequest(
            'wg_ingest',
            {
              ...base,
              request_id: 'fixture',
              screen_ref: { kind: 'new', name: 'Fixture' },
              capture,
            },
            Date.parse(capture.captured_at),
          );
          assert.match(
            fixtureHtml({ screen, role, environment, version }),
            /<h1>/,
          );
        }
  }
  const members = fixtureCapture().tree.children;
  assert(members.some((n) => n.name === 'Invite'));
  assert(
    fixtureCapture({ version: 2 }).tree.children.some(
      (n) => n.name === 'Invite member',
    ),
  );
  assert(
    !fixtureCapture({ screen: 'detail', version: 2 }).tree.children.some(
      (n) => n.name === 'Remove member',
    ),
  );
  assert(
    !fixtureCapture({ role: 'viewer' }).tree.children.some(
      (n) => n.name === 'Invite',
    ),
  );
  assert.deepEqual(
    fixtureCapture({ modal: true, tab: 'pending' }).view.modal_stack,
    ['invite'],
  );
  for (const value of Object.values(sensitive))
    assert(fixtureHtml({ modal: true }).includes(value));
});
