// Synthetic-only source fixtures. Never copy real page content into this corpus.
export const fixtureVersion = 1;
export const sensitive = Object.freeze({
  personal: 'SYNTHETIC_PERSON_739',
  secret: 'SYNTHETIC_SECRET_482',
  payment: 'SYNTHETIC_PAYMENT_951',
  injection: 'SYNTHETIC_INSTRUCTION_IGNORE_RULES',
});
export const labels = [
  'Home',
  'Settings',
  'Members',
  'Member detail',
  'Invite',
  'Invite member',
  'Cancel',
  'Email',
  'Password',
  'Save',
  'General',
  'Security',
  'Remove member',
  'Active',
  'Pending',
  'Fixture',
];
export const source = {
  producer: 'synthetic',
  producer_version: '1',
  format: 'structured_accessibility',
  format_version: '1',
};
export const scopeFor = (role = 'admin', environment = 'staging') => ({
  environment,
  origin: 'https://fixture.test',
  role,
  account_scope: 'synthetic',
  locale: 'en',
});
export const node = (role, name, children = [], extra = {}) => ({
  role,
  name,
  enabled: true,
  visible: true,
  ...extra,
  children,
});
export function fixtureCapture({
  screen = 'members',
  role = 'admin',
  environment = 'staging',
  version = 1,
  tab = 'active',
  modal = false,
  seq = 1,
} = {}) {
  const titles = {
    home: 'Home',
    settings: 'Settings',
    members: 'Members',
    detail: 'Member detail',
  };
  if (
    !Object.hasOwn(titles, screen) ||
    !['admin', 'viewer'].includes(role) ||
    !['staging', 'production'].includes(environment) ||
    ![1, 2].includes(version) ||
    !['active', 'pending'].includes(tab)
  )
    throw new Error('INVALID_FIXTURE');
  const controls = [node('heading', titles[screen])];
  if (screen === 'settings')
    controls.push(node('button', 'Save', [], { enabled: role === 'admin' }));
  if (screen === 'members') {
    controls.push(
      node('tab', 'Active', [], { selected: tab === 'active' }),
      node('tab', 'Pending', [], { selected: tab === 'pending' }),
    );
    if (role === 'admin')
      controls.push(node('button', version === 1 ? 'Invite' : 'Invite member'));
    controls.push(
      node('text', sensitive.personal),
      node('text', sensitive.injection),
    );
  }
  if (screen === 'detail' && role === 'admin' && version === 1)
    controls.push(node('button', 'Remove member'));
  if (modal)
    controls.push(
      node('dialog', 'Invite', [
        node('textbox', 'Email'),
        node('textbox', 'Password'),
        node('button', 'Cancel'),
      ]),
    );
  return {
    captured_at: '2026-10-07T00:00:00Z',
    trace_id: 'fixture_trace',
    trace_seq: seq,
    session_id: 'fixture_session',
    tab_id: 'fixture_tab',
    source,
    scope: scopeFor(role, environment),
    view: {
      route_template: screen === 'detail' ? '/members/:member' : `/${screen}`,
      selected_tabs: screen === 'members' ? [tab] : [],
      modal_stack: modal ? ['invite'] : [],
      feature_variants: [],
    },
    tree: node('document', 'Fixture', controls),
    coverage: { kind: 'complete', subtree: 'root' },
    redaction_profile: { alias: 'fixture', version: 1 },
  };
}
export function fixtureSettings() {
  return {
    project_alias: 'fixture',
    apps: [
      {
        alias: 'fixture',
        allowed_origins: ['https://fixture.test'],
        scopes: ['admin', 'viewer'].flatMap((role) =>
          ['staging', 'production'].map((environment) => ({
            alias: `${role}-${environment}`,
            ...scopeFor(role, environment),
          })),
        ),
        route_mappings: ['home', 'settings', 'members', 'detail'].map(
          (screen) => ({
            view_key: screen,
            origin: 'https://fixture.test',
            route_template:
              screen === 'detail' ? '/members/:member' : `/${screen}`,
          }),
        ),
        redaction_profiles: [
          {
            alias: 'fixture',
            version: 1,
            allowed_labels: [
              ...labels,
              'active',
              'pending',
              'invite',
              'members',
            ],
            ignored_fields: [],
            unknown_text: 'drop',
          },
        ],
      },
    ],
  };
}
export function fixtureHtml(options = {}) {
  const capture = fixtureCapture(options);
  const render = (n) => {
    const children = n.children.map(render).join('');
    if (n.role === 'textbox')
      return `<label>${n.name}<input ${n.name === 'Password' ? 'type="password"' : 'type="text"'} value="${sensitive.secret}"></label>`;
    if (n.role === 'dialog')
      return `<dialog open aria-label="Invite">${children}</dialog>`;
    if (n.role === 'button')
      return `<button ${n.enabled ? '' : 'disabled'}>${n.name}</button>`;
    if (n.role === 'tab')
      return `<button role="tab" aria-selected="${n.selected}">${n.name}</button>`;
    if (n.role === 'heading') return `<h1>${n.name}</h1>`;
    return `<div>${n.role === 'document' ? '' : n.name}${children}</div>`;
  };
  return `<!doctype html><html lang="en"><title>Fixture</title><body>
    <nav>${['Home', 'Settings', 'Members', 'Member detail'].map((name) => `<button data-screen>${name}</button>`).join('')}</nav>
    <main>${render(capture.tree)}</main><p hidden>${sensitive.payment}</p>
    <script>
      document.querySelectorAll('[role=tab]').forEach(button => button.onclick = () => {
        document.querySelectorAll('[role=tab]').forEach(tab => tab.setAttribute('aria-selected', String(tab === button)));
      });
      document.querySelectorAll('button').forEach(button => {
        if (button.textContent === 'Invite' || button.textContent === 'Invite member') button.onclick = () => {
          const dialog = document.createElement('dialog'); dialog.setAttribute('aria-label', 'Invite');
          dialog.innerHTML = '<label>Email<input></label><button>Cancel</button>'; document.body.append(dialog);
          dialog.querySelector('button').onclick = () => dialog.remove(); dialog.showModal();
        };
        if (button.textContent === 'Cancel') button.onclick = () => button.closest('dialog').remove();
      });
    </script></body></html>`;
}
