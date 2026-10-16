/* global document, fetch */
const text = document.querySelector('#history-json'),
  status = document.querySelector('#history-status'),
  commit = document.querySelector('#commit-history');
let receipt = null,
  generation = 0;
const clear = () => {
  generation++;
  receipt = null;
  commit.disabled = true;
};
text.addEventListener('input', clear);
async function request(path, input) {
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
  if (!response.ok) throw new Error('HISTORY_UNAVAILABLE');
  return response.json();
}
document
  .querySelector('#export-history')
  .addEventListener('click', async () => {
    clear();
    const current = generation;
    status.textContent = 'Exporting authorized history…';
    try {
      const archive = await request('/api/archive');
      if (current !== generation) return;
      text.value = JSON.stringify(archive, null, 2);
      status.textContent =
        'Export ready. Copy this synthetic archive to a private file.';
    } catch {
      if (current === generation)
        status.textContent =
          'History export unavailable or outside the bounded archive limit.';
    }
  });
document
  .querySelector('#preview-history')
  .addEventListener('click', async () => {
    clear();
    const current = generation,
      captured = text.value;
    status.textContent = 'Validating complete history…';
    try {
      const archive = JSON.parse(captured),
        state = await request('/api/bundle');
      if (current !== generation) return;
      const result = await request('/api/archive/preview', {
        expected_revision: state.revision,
        archive,
      });
      if (current !== generation || text.value !== captured) return;
      receipt = { candidate: result.candidate, digest: result.digest };
      commit.disabled = false;
      status.textContent = `Validated ${result.revisions} revisions. No changes saved. Confirm to restore.`;
    } catch {
      if (current === generation)
        status.textContent =
          'Restore refused: check identity, empty destination, scope, schema, size and revision chain.';
    }
  });
commit.addEventListener('click', async () => {
  if (!receipt) return;
  const input = receipt;
  clear();
  const current = generation;
  try {
    await request('/api/archive/commit', input);
    if (current !== generation) return;
    status.textContent =
      'History restored. Reload saved documentation to view it.';
    document.querySelector('#reload-document').click();
  } catch {
    if (current === generation)
      status.textContent =
        'Restore refused; preview again. No partial restoration was saved.';
  }
});
