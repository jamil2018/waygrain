/* global document, fetch */
import { mountTargetAdapter } from '/ui/adapter.js';
import { mountComponentPanel } from '/ui/component-panel.js';
import { mountPagePanel } from '/ui/page-panel.js';
import { mountSourceInspector } from '/ui/source-inspector.js';
import { mountClarification } from '/ui/clarification.js';
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
  const inspector = mountSourceInspector(
    panelRoot,
    async (targetId, sourceId, reference) => {
      const response = await fetch(
        `/api/source?context=${encodeURIComponent(context)}&target=${encodeURIComponent(targetId)}&source=${encodeURIComponent(sourceId)}${reference ? `&revision=${encodeURIComponent(reference.descriptor_revision_id)}&source_revision=${encodeURIComponent(reference.source_revision_id)}` : ''}`,
      );
      if (!response.ok) throw new Error('SOURCE_UNAVAILABLE');
      return response.json();
    },
  );
  panels.setCitationHandler(inspector.open);
  const pagePanel = mountPagePanel(
    panelRoot,
    () => client().read(bootstrap.targets.page),
    (id, trigger) => {
      inspector.reset();
      panels.details(id, trigger);
    },
    inspector.open,
    () => {
      inspector.reset();
      panels.reset();
    },
  );
  async function conversationAPI(path, input) {
    const response = await fetch(
      path,
      input === undefined
        ? {}
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
    );
    const data = await response.json();
    if (!response.ok) {
      const error = new Error('CONVERSATION_UNAVAILABLE');
      error.code = data.error;
      throw error;
    }
    return data;
  }
  const mountQuestion = (body, data, targetId) =>
    mountClarification(body, data, targetId, {
      label: bootstrap.provider_label,
      load: (id) =>
        conversationAPI(
          `/api/conversation?context=${encodeURIComponent(context)}&target=${encodeURIComponent(targetId)}&page=${encodeURIComponent(bootstrap.targets.page)}${id ? `&id=${encodeURIComponent(id)}` : ''}`,
        ),
      ask: (id, expected, question) =>
        conversationAPI('/api/ask', {
          context,
          target_id: targetId,
          page_id: bootstrap.targets.page,
          conversation_id: id,
          expected_turn: expected,
          question,
        }),
      citation: inspector.open,
    });
  panels.setClarificationHandler(mountQuestion);
  pagePanel.setClarificationHandler(mountQuestion);
  adapter = mountTargetAdapter(targetRoot, client(), {
    summary: panels.summary,
    details(id, trigger) {
      inspector.reset();
      pagePanel.reset();
      panels.details(id, trigger);
    },
    reset: panels.reset,
  });
  for (const key of ['calculator', 'quantity', 'calculate', 'result'])
    adapter.register(
      key,
      document.querySelector(`[data-waygrain-key="${key}"]`),
    );
  async function update() {
    const current = ++generation;
    panels.reset();
    pagePanel.reset();
    inspector.reset();
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
