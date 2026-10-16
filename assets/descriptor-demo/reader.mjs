/* global document, fetch */
import { mountTargetAdapter } from '/ui/adapter.js';
import { mountComponentPanel } from '/ui/component-panel.js';
const root = document.querySelector('#waygrain-documentation');
const status = document.createElement('p');
status.setAttribute('role', 'status');
status.textContent = 'Loading documentation…';
root.append(status);
try {
  const bootstrap = await fetch('/api/bootstrap').then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  });
  const label = document.createElement('label'),
    select = document.createElement('select');
  label.textContent = 'Documentation scope';
  select.setAttribute('aria-label', 'Documentation scope');
  for (const context of bootstrap.contexts) {
    const option = document.createElement('option');
    option.value = context.key;
    option.textContent = context.label;
    select.append(option);
  }
  label.append(select);
  root.append(label);
  let context = bootstrap.contexts[0].key,
    generation = 0,
    adapter;
  const client = () => ({
    read: async (targetId) => {
      const response = await fetch(
        `/api/evidence?context=${encodeURIComponent(context)}&target=${encodeURIComponent(targetId)}`,
      );
      if (!response.ok) throw new Error('DOCUMENTATION_UNAVAILABLE');
      return response.json();
    },
  });
  const targetRoot = document.createElement('div'),
    panelRoot = document.createElement('div');
  targetRoot.className = 'wg-targets';
  root.append(targetRoot, panelRoot);
  const panels = mountComponentPanel(panelRoot, (id) => adapter.describe(id));
  adapter = mountTargetAdapter(targetRoot, client(), panels);
  for (const key of ['calculator', 'quantity', 'calculate', 'result'])
    adapter.register(
      key,
      document.querySelector(`[data-waygrain-key="${key}"]`),
    );
  async function update() {
    const current = ++generation;
    panels.reset();
    adapter.update([], client());
    status.textContent = 'Loading documentation scope…';
    try {
      const data = await client().read(bootstrap.targets.page);
      if (current !== generation) return;
      adapter.update(data.mappings, client());
      status.textContent =
        'Documentation ready. Hover or focus a target, or choose Details.';
    } catch {
      if (current === generation)
        status.textContent = 'Documentation unavailable. Reload to retry.';
    }
  }
  select.addEventListener('change', () => {
    context = select.value;
    void update();
  });
  await update();
} catch {
  status.textContent =
    'Documentation unavailable. Reload after starting the local service.';
}
