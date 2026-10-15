import {
  fixtureHtml,
  fixtureSettings,
} from '../../../tests/fixtures/ui/index.mjs';
export function settings(origin) {
  const value = fixtureSettings(),
    app = value.apps[0];
  app.allowed_origins = [origin];
  for (const item of [...app.scopes, ...app.route_mappings])
    item.origin = origin;
  app.redaction_profiles[0].allowed_labels.push('Revision one', 'Revision two');
  return value;
}
export function html(options) {
  return fixtureHtml(options).replace(
    '<main>',
    `<p role="status">${options.version === 2 ? 'Revision two' : 'Revision one'}</p><main>`,
  );
}
export function facts(capture) {
  const nodes = [];
  const visit = (n) => {
    nodes.push(n);
    n.children.forEach(visit);
  };
  visit(capture.tree);
  const has = (name) => nodes.some((n) => n.name === name);
  const save = nodes.find((n) => n.role === 'button' && n.name === 'Save');
  return {
    route: capture.view.route_template,
    role: capture.scope.role,
    coverage: capture.coverage.kind,
    version: has('Revision two') ? 2 : has('Revision one') ? 1 : null,
    invite_label: has('Invite member')
      ? 'Invite member'
      : has('Invite')
        ? 'Invite'
        : null,
    invite_visible: nodes.some(
      (n) =>
        n.role === 'button' && ['Invite', 'Invite member'].includes(n.name),
    ),
    selected_tab:
      nodes.find((n) => n.role === 'tab' && n.selected)?.name ?? null,
    save: save ? (save.enabled ? 'enabled' : 'disabled') : null,
    remove_visible: has('Remove member'),
    dialog_open: nodes.some((n) => n.role === 'dialog' && n.name === 'Invite'),
  };
}
