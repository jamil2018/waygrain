/* global document, crypto, fetch */
import { mountImport } from './editor-import.mjs';
const $ = (selector) => document.querySelector(selector);
const fields = [
  'name',
  'summary',
  'purpose',
  'inputs',
  'rules',
  'conditions',
  'outputs',
  'side_effects',
  'errors',
  'workflows',
  'limitations',
];
const arrays = new Set(fields.slice(3));
let saved,
  draft,
  revision,
  selected = 0;
function feedback(message, error = false) {
  $(error ? '#editor-error' : '#editor-status').textContent = message;
  if (!error) $('#editor-error').textContent = '';
}
async function api(path, payload) {
  const response = await fetch(
    path,
    payload === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error === 'CONFLICT'
        ? 'A newer revision exists or a revision link is invalid. Reload saved documentation before retrying.'
        : `Validation failed: ${data.error}`,
    );
  return data;
}
function syncJSON() {
  $('#bundle-editor').value = JSON.stringify(draft, null, 2);
}
function render() {
  const choice = $('#document-choice');
  choice.replaceChildren();
  for (const [index, d] of draft.documents.entries()) {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${d.name || 'Untitled'} · ${d.scope.role ?? 'unknown'} / v${d.scope.version ?? '?'} / ${d.scope.tenant} / ${d.scope.state}`;
    choice.append(option);
  }
  selected = Math.min(selected, Math.max(0, draft.documents.length - 1));
  choice.value = String(selected);
  const container = $('#document-fields');
  container.replaceChildren();
  const doc = draft.documents[selected];
  if (doc)
    for (const field of fields) {
      const wrapper = document.createElement('div'),
        label = document.createElement('label'),
        input = document.createElement('textarea');
      input.id = `edit-${field}`;
      label.htmlFor = input.id;
      label.textContent = field.replaceAll('_', ' ');
      input.value = arrays.has(field) ? doc[field].join('\n') : doc[field];
      input.addEventListener('input', () => {
        doc[field] = arrays.has(field)
          ? input.value.split('\n').filter((line) => line.length)
          : input.value;
        syncJSON();
      });
      wrapper.append(label, input);
      container.append(wrapper);
    }
  $('#mapping-list').replaceChildren();
  for (const mapping of draft.mappings.filter(
    (m) =>
      !doc ||
      (m.target_id === doc.target_id &&
        JSON.stringify(m.scope) === JSON.stringify(doc.scope)),
  )) {
    const item = document.createElement('li');
    item.textContent = `${mapping.target_key}: ${mapping.status}`;
    $('#mapping-list').append(item);
  }
  $('#claim-list').replaceChildren();
  for (const claim of draft.claims.filter((c) =>
    doc?.claim_ids.includes(c.id),
  )) {
    const article = document.createElement('article'),
      title = document.createElement('h3'),
      text = document.createElement('p'),
      meta = document.createElement('p');
    title.textContent = `${claim.evidence_class} · ${claim.freshness.status}${claim.conflicts.length ? ' · unresolved conflict' : ''}${claim.unknown ? ' · unknown' : ''}`;
    text.textContent = claim.text;
    meta.textContent = claim.sources
      .map((ref) => {
        const source = draft.sources.find((s) => s.id === ref.source_id);
        return source ? `${source.title} — ${ref.locator}` : 'Missing source';
      })
      .join('; ');
    const verification = document.createElement('p'),
      method = document.createElement('select'),
      verify = document.createElement('button');
    verification.textContent = claim.verification
      ? `Verified ${claim.verification.at} by ${claim.verification.actor}: ${claim.verification.method}.`
      : 'No explicit verification recorded.';
    method.setAttribute('aria-label', 'Verification method');
    for (const [value, label] of [
      ['supplied-source-review', 'Review supplied source'],
      ['synthetic-behavior-test', 'Run synthetic behavior test'],
    ]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      method.append(option);
    }
    verify.type = 'button';
    verify.textContent = 'Record explicit verification';
    verify.addEventListener('click', async () => {
      if (
        JSON.stringify(draft) !== JSON.stringify(saved) ||
        $('#bundle-editor').value !== JSON.stringify(draft, null, 2)
      ) {
        feedback(
          'Save or reload draft changes before recording verification.',
          true,
        );
        return;
      }
      verify.disabled = true;
      try {
        await api('/api/verify', {
          schema_version: 1,
          expected_revision: revision,
          project_id: saved.project_id,
          app_id: saved.app_id,
          claim_id: claim.id,
          scope: claim.scope,
          method: method.value,
        });
        await load();
        feedback(
          'Explicit verification recorded; unknowns and conflicts are retained.',
        );
      } catch (e) {
        feedback(e.message, true);
        verify.disabled = false;
      }
    });
    const note = document.createElement('p');
    note.textContent =
      'Record only a review you performed. UI similarity does not verify hidden rules; unknown versions or unresolved mappings prevent verification.';
    article.append(title, text, meta, verification, method, verify, note);
    $('#claim-list').append(article);
  }
  syncJSON();
}
function candidate() {
  const b = JSON.parse(JSON.stringify(draft));
  b.supersedes_revision_id = saved.revision_id;
  b.revision_id = crypto.randomUUID();
  for (const key of ['sources', 'claims', 'documents'])
    for (const item of b[key]) {
      const old = saved[key].find((e) => e.id === item.id);
      if (old && JSON.stringify(item) !== JSON.stringify(old)) {
        item.supersedes_revision_id = old.revision_id;
        item.revision_id = crypto.randomUUID();
      }
    }
  for (const claim of b.claims) {
    const old = saved.claims.find((c) => c.id === claim.id);
    if (old && old.scope.version !== claim.scope.version)
      claim.freshness = {
        status: 'needs_review',
        reasons: [
          ...new Set([
            ...claim.freshness.reasons,
            'Application version changed',
          ]),
        ],
      };
  }
  for (const claim of b.claims)
    for (const ref of claim.sources) {
      const source = b.sources.find((s) => s.id === ref.source_id);
      if (source && ref.revision_id !== source.revision_id) {
        const old = saved.claims.find((c) => c.id === claim.id);
        if (old && claim.revision_id === old.revision_id) {
          claim.supersedes_revision_id = old.revision_id;
          claim.revision_id = crypto.randomUUID();
        }
        const oldSource = saved.sources.find((s) => s.id === source.id);
        if (
          oldSource &&
          (oldSource.content_hash !== source.content_hash ||
            oldSource.supplied_revision !== source.supplied_revision)
        ) {
          claim.freshness = {
            status: 'needs_review',
            reasons: [
              ...new Set([
                ...claim.freshness.reasons,
                'Source content changed',
              ]),
            ],
          };
        }
        ref.revision_id = source.revision_id;
        ref.content_hash = source.content_hash;
        ref.locator = source.locator;
      }
    }
  return { schema_version: 1, expected_revision: revision, bundle: b };
}
async function load() {
  const data = await api('/api/bundle');
  saved = data.bundle;
  draft = JSON.parse(JSON.stringify(saved));
  revision = data.revision;
  render();
  feedback(`Saved revision ${revision}. Local synthetic documentation.`);
}
$('#document-choice').addEventListener('change', () => {
  selected = Number($('#document-choice').value);
  render();
});
$('#apply-bundle').addEventListener('click', () => {
  try {
    const value = JSON.parse($('#bundle-editor').value);
    if (
      !Array.isArray(value.documents) ||
      !Array.isArray(value.claims) ||
      !Array.isArray(value.sources) ||
      !Array.isArray(value.mappings)
    )
      throw new Error();
    draft = value;
    render();
    feedback('Bundle changes staged locally. Validate before saving.');
  } catch {
    feedback(
      'Invalid knowledge bundle. Use the saved bundle shape; no changes were saved.',
      true,
    );
  }
});
$('#validate-document').addEventListener('click', async () => {
  try {
    await api('/api/validate', candidate());
    feedback('Draft valid. Nothing has been saved.');
  } catch (e) {
    feedback(e.message, true);
  }
});
$('#save-document').addEventListener('click', async () => {
  try {
    const result = await api('/api/bundle', candidate());
    await load();
    feedback(`Saved revision ${result.revision}.`);
  } catch (e) {
    feedback(e.message, true);
  }
});
$('#reload-document').addEventListener('click', () => {
  void load().catch((e) => feedback(e.message, true));
});
void load().catch((e) => feedback(e.message, true));

mountImport({
  api,
  load,
  feedback,
  getState: () => ({ saved, draft, revision, selected }),
});
