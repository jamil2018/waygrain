/* global document, crypto */
export function mountImport({ api, load, feedback, getState }) {
  const $ = (selector) => document.querySelector(selector);
  let importPreview = null,
    generation = 0;
  const fingerprint = () =>
    JSON.stringify({
      state: getState(),
      bundleText: $('#bundle-editor').value,
    });
  function clearImport() {
    generation++;
    importPreview = null;
    $('#commit-import').disabled = true;
    $('#import-status').textContent =
      'Import draft changed. Preview before committing.';
    $('#import-preview').textContent = '';
  }
  $('#source-import').addEventListener('input', clearImport);
  $('#document-fields').addEventListener('input', clearImport);
  $('#document-choice').addEventListener('change', clearImport);
  $('#bundle-editor').addEventListener('input', clearImport);
  $('#preview-import').addEventListener('click', async () => {
    clearImport();
    const requestGeneration = generation,
      requestFingerprint = fingerprint(),
      displayedContent = $('#import-content').value;
    const { saved, draft, revision, selected } = getState();
    $('#editor-error').textContent = '';
    try {
      if (
        JSON.stringify(draft) !== JSON.stringify(saved) ||
        $('#bundle-editor').value !== JSON.stringify(draft, null, 2)
      )
        throw new Error('Save or reload description changes before importing.');
      const doc = draft.documents[selected];
      const kind = $('#import-kind').value;
      const input =
        $('#import-mode').value === 'bundle'
          ? {
              kind: 'bundle',
              candidate: {
                schema_version: 1,
                expected_revision: revision,
                bundle: JSON.parse($('#import-content').value),
              },
            }
          : {
              kind: 'source',
              expected_revision: revision,
              project_id: draft.project_id,
              app_id: draft.app_id,
              target_id: doc.target_id,
              scope: doc.scope,
              source_id: crypto.randomUUID(),
              title: $('#import-title').value,
              origin: $('#import-origin').value,
              content: $('#import-content').value,
              locator: $('#import-locator').value,
              source_kind: kind,
              supplied_revision:
                kind === 'code' ? $('#import-revision').value : null,
              symbol: kind === 'code' ? $('#import-symbol').value : null,
              observation_id:
                kind === 'observation' ? $('#import-observation').value : null,
            };
      const result = await api('/api/import/preview', input);
      if (
        requestGeneration !== generation ||
        requestFingerprint !== fingerprint()
      )
        return;
      importPreview = {
        ...result,
        fingerprint: requestFingerprint,
        generation: requestGeneration,
      };
      $('#import-status').textContent =
        `Import validated for ${doc?.name || 'the assigned bundle'}; saved revision ${revision} is unchanged.`;
      $('#import-preview').textContent = displayedContent;
      $('#commit-import').disabled = false;
    } catch (e) {
      if (
        requestGeneration === generation &&
        requestFingerprint === fingerprint()
      )
        feedback(e.message, true);
    }
  });
  $('#commit-import').addEventListener('click', async () => {
    if (!importPreview) return;
    if (
      importPreview.generation !== generation ||
      importPreview.fingerprint !== fingerprint()
    ) {
      clearImport();
      feedback('Save or reload description changes before importing.', true);
      return;
    }
    const candidate = importPreview;
    clearImport();
    try {
      const result = await api('/api/import/commit', {
        candidate: candidate.candidate,
        receipt: candidate.receipt,
      });
      await load();
      $('#import-status').textContent =
        `Import saved in revision ${result.revision}.`;
    } catch (e) {
      feedback(e.message, true);
    }
  });
}
