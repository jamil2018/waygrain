import type { EvidencePackage } from '../retrieval.js';
import { node, renderDocumentation, type CitationHandler } from './render.js';

export function mountPagePanel(
  root: HTMLElement,
  read: () => Promise<EvidencePackage>,
  component: (id: string, trigger: HTMLElement) => void,
  citation: CitationHandler,
  beforeOpen: () => void,
) {
  const entry = node('button', 'Page documentation');
  entry.type = 'button';
  const panel = node('section');
  panel.className = 'wg-panel wg-page';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Page documentation');
  panel.hidden = true;
  const close = node('button', 'Close page documentation'),
    body = node('div');
  close.type = 'button';
  panel.append(node('h2', 'Page documentation'), close, body);
  root.append(entry, panel);
  let generation = 0;
  const reset = (restore = false) => {
    generation++;
    panel.hidden = true;
    body.replaceChildren();
    if (restore) entry.focus();
  };
  close.addEventListener('click', () => reset(true));
  const escape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !e.defaultPrevented && !panel.hidden) {
      e.preventDefault();
      reset(true);
    }
  };
  document.addEventListener('keydown', escape);
  entry.addEventListener('click', () => {
    beforeOpen();
    const current = ++generation;
    panel.hidden = false;
    body.replaceChildren(node('p', 'Loading page documentation…'));
    close.focus();
    void read()
      .then((data) => {
        if (current !== generation || panel.hidden) return;
        renderDocumentation(body, data, data.target_id, citation);
        body.append(node('h3', 'Component documentation'));
        for (const target of data.targets.filter(
          (t) => t.page_id === data.target_id,
        )) {
          const link = node(
            'button',
            `Open component: ${data.documents.find((d) => d.target_id === target.id)?.name || target.key}`,
          );
          link.type = 'button';
          link.addEventListener('click', () => component(target.id, link));
          const section = node('details'),
            heading = node(
              'summary',
              data.documents.find((d) => d.target_id === target.id)?.name ||
                target.key,
            ),
            content = node('div');
          section.append(heading, link, content);
          renderDocumentation(content, data, target.id, citation);
          body.append(section);
        }
      })
      .catch(() => {
        if (current === generation && !panel.hidden)
          body.replaceChildren(
            node('p', 'Page documentation unavailable. Reload to retry.'),
          );
      });
  });
  return {
    reset,
    unmount() {
      reset();
      document.removeEventListener('keydown', escape);
      entry.remove();
      panel.remove();
    },
  };
}
