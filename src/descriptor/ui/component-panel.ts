import type { ClarificationMount } from './clarification.js';
import type { EvidencePackage } from '../retrieval.js';
import {
  node,
  renderDocumentation,
  scopeLabel,
  type CitationHandler,
} from './render.js';

export function mountComponentPanel(
  root: HTMLElement,
  read: (targetId: string) => Promise<EvidencePackage | null>,
) {
  const summary = node('section');
  summary.className = 'wg-summary';
  summary.setAttribute('aria-label', 'Component summary');
  summary.setAttribute('aria-live', 'polite');
  const panel = node('section');
  panel.className = 'wg-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Component documentation');
  panel.hidden = true;
  const heading = node('h2', 'Component documentation'),
    close = node('button', 'Close documentation'),
    body = node('div');
  close.type = 'button';
  panel.append(heading, close, body);
  root.append(summary, panel);
  let summaryGeneration = 0,
    detailGeneration = 0,
    trigger: HTMLElement | null = null,
    citation: CitationHandler | undefined,
    clarification: ClarificationMount | undefined,
    cleanup: (() => void) | undefined;
  const dismiss = (restore = true) => {
    detailGeneration++;
    panel.hidden = true;
    cleanup?.();
    cleanup = undefined;
    body.replaceChildren();
    if (restore && trigger?.isConnected) trigger.focus();
    trigger = null;
  };
  close.addEventListener('click', () => dismiss());
  const escape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !panel.hidden && !event.defaultPrevented) {
      event.preventDefault();
      dismiss();
    }
  };
  document.addEventListener('keydown', escape);
  return {
    summary(targetId: string) {
      if (!panel.hidden) return;
      summary.hidden = false;
      const current = ++summaryGeneration;
      summary.replaceChildren(node('p', 'Loading component summary…'));
      void read(targetId)
        .then((data) => {
          if (current !== summaryGeneration) return;
          if (!data) {
            summary.replaceChildren(
              node('p', 'Target mapping or scope is unavailable.'),
            );
            return;
          }
          const docs = data.documents.filter((d) => d.target_id === targetId);
          summary.replaceChildren(node('p', scopeLabel(data)));
          if (!docs.length)
            summary.append(node('p', 'No applicable component documentation.'));
          for (const doc of docs)
            summary.append(
              node('h3', doc.name),
              node('p', doc.purpose),
              node('p', `Inputs: ${doc.inputs.join('; ') || 'not documented'}`),
              node('p', doc.summary),
            );
          if (
            data.claims.some(
              (c) =>
                c.target_id === targetId && c.freshness.status !== 'current',
            )
          )
            summary.append(
              node(
                'p',
                'Evidence needs review. Open Details for provenance and freshness.',
              ),
            );
        })
        .catch(() => {
          if (current === summaryGeneration)
            summary.replaceChildren(
              node('p', 'Component summary unavailable.'),
            );
        });
    },
    details(targetId: string, source: HTMLElement) {
      cleanup?.();
      cleanup = undefined;
      const current = ++detailGeneration;
      summaryGeneration++;
      summary.hidden = true;
      trigger = source;
      panel.hidden = false;
      body.replaceChildren(node('p', 'Loading component documentation…'));
      close.focus();
      void read(targetId)
        .then((data) => {
          if (current !== detailGeneration || panel.hidden) return;
          if (!data)
            body.replaceChildren(
              node('p', 'Target mapping or scope is unavailable.'),
            );
          else {
            renderDocumentation(body, data, targetId, citation);
            cleanup = clarification?.(body, data, targetId);
          }
        })
        .catch(() => {
          if (current === detailGeneration && !panel.hidden)
            body.replaceChildren(
              node(
                'p',
                'Component documentation unavailable. Retry after checking the local service.',
              ),
            );
        });
    },
    setClarificationHandler(handler: ClarificationMount) {
      clarification = handler;
    },
    setCitationHandler(handler: CitationHandler) {
      citation = handler;
    },
    reset() {
      summaryGeneration++;
      summary.replaceChildren();
      summary.hidden = true;
      dismiss(false);
    },
    unmount() {
      summaryGeneration++;
      dismiss(false);
      document.removeEventListener('keydown', escape);
      summary.remove();
      panel.remove();
    },
  };
}
