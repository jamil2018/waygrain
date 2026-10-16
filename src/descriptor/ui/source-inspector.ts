import type { DescriptorBundle } from '../contracts.js';
import { node, type CitationHandler } from './render.js';

export function mountSourceInspector(
  root: HTMLElement,
  read: (
    target: string,
    source: string,
  ) => Promise<DescriptorBundle['sources'][number]>,
) {
  const panel = node('section');
  panel.className = 'wg-panel wg-source';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Source inspector');
  panel.hidden = true;
  const close = node('button', 'Close source inspector'),
    body = node('div');
  close.type = 'button';
  panel.append(node('h2', 'Source inspector'), close, body);
  root.append(panel);
  let generation = 0,
    trigger: HTMLElement | null = null;
  const reset = (restore = false) => {
    generation++;
    panel.hidden = true;
    body.replaceChildren();
    if (restore && trigger?.isConnected) trigger.focus();
    trigger = null;
  };
  close.addEventListener('click', () => reset(true));
  const escape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !panel.hidden) {
      e.preventDefault();
      e.stopImmediatePropagation();
      reset(true);
    }
  };
  document.addEventListener('keydown', escape, true);
  const open: CitationHandler = (sourceId, targetId, sourceTrigger) => {
    const current = ++generation;
    trigger = sourceTrigger;
    panel.hidden = false;
    body.replaceChildren(node('p', 'Loading authorized source…'));
    close.focus();
    void read(targetId, sourceId)
      .then((source) => {
        if (current !== generation || panel.hidden) return;
        if (source.id !== sourceId) throw new Error('SOURCE_MISMATCH');
        body.replaceChildren(node('h3', source.title));
        for (const [key, value] of Object.entries({
          Kind: source.kind,
          Origin: source.origin,
          Locator: source.locator,
          'Content hash': source.content_hash,
          'Source revision': source.revision_id,
          'Supplied revision': source.supplied_revision,
          Symbol: source.symbol,
          Observation: source.observation_id,
        })) {
          if (value) body.append(node('p', `${key}: ${value}`));
        }
        body.append(
          node('h4', 'Retained excerpt'),
          node('pre', source.excerpt),
        );
      })
      .catch(() => {
        if (current === generation && !panel.hidden)
          body.replaceChildren(node('p', 'Source unavailable or restricted.'));
      });
  };
  return {
    open,
    reset,
    unmount() {
      reset();
      document.removeEventListener('keydown', escape, true);
      panel.remove();
    },
  };
}
