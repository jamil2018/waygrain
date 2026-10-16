import type { EvidencePackage } from '../retrieval.js';
import type { ConversationView } from '../conversation.js';
import { node, scopeLabel, type CitationHandler } from './render.js';
export type ClarificationMount = (
  body: HTMLElement,
  data: EvidencePackage,
  targetId: string,
) => () => void;
export function mountClarification(
  root: HTMLElement,
  data: EvidencePackage,
  targetId: string,
  options: {
    label: string;
    load: (conversationId?: string) => Promise<ConversationView>;
    ask: (
      conversationId: string,
      expected: number,
      question: string,
    ) => Promise<ConversationView>;
    citation: CitationHandler;
  },
) {
  const section = node('section');
  section.className = 'wg-conversation';
  section.setAttribute('aria-label', 'Ask about this');
  const question = node('textarea'),
    label = node('label', 'Product question'),
    ask = node('button', 'Ask about this'),
    reset = node('button', 'Start new conversation'),
    reload = node('button', 'Reload conversation'),
    status = node('p'),
    history = node('ol');
  question.id = 'wg-question-' + crypto.randomUUID();
  question.rows = 3;
  question.maxLength = 2048;
  label.htmlFor = question.id;
  ask.type = reset.type = reload.type = 'button';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  ask.disabled = true;
  section.append(
    node('h3', 'Ask about this'),
    node(
      'p',
      `Target: ${data.documents.find((d) => d.target_id === targetId)?.name || data.targets.find((t) => t.id === targetId)?.key || 'unavailable'}`,
    ),
    node('p', scopeLabel(data)),
    node('p', options.label),
    node(
      'p',
      'Try “Why is the total 90 for 10 items at 10 each?”, then “What about 9?”. This offline fixture has a bounded question vocabulary.',
    ),
    history,
    label,
    question,
    ask,
    reset,
    reload,
    status,
  );
  root.append(section);
  let generation = 0,
    conversationId = '',
    expected = 0;
  function render(view: ConversationView) {
    conversationId = view.conversation_id;
    expected = view.turns.length;
    history.replaceChildren();
    for (const turn of view.turns) {
      const item = node('li'),
        answer = turn.answer;
      item.append(
        node('p', `Question: ${turn.question}`),
        node(
          'h4',
          {
            supported: 'Supported synthetic explanation',
            unknown: 'Missing evidence',
            conflict: 'Conflicting evidence',
            unsupported: 'Unsupported question',
          }[answer.status],
        ),
        node('p', answer.provider_label),
      );
      if (!turn.evidence_current)
        item.append(
          node(
            'p',
            'Historical answer: documentation revision changed. Ask again for current evidence.',
          ),
        );
      const text = node('p', answer.text);
      text.className = 'wg-answer';
      item.append(text);
      if (answer.warnings.length)
        item.append(
          node(
            'p',
            'Warnings: ' +
              answer.warnings
                .map((w) => w.toLowerCase().replaceAll('_', ' '))
                .join('; '),
          ),
        );
      if (answer.missing.length)
        item.append(
          node(
            'p',
            'Missing: ' +
              answer.missing
                .map((w) => w.toLowerCase().replaceAll('_', ' '))
                .join('; '),
          ),
        );
      for (const [index, citation] of answer.citations.entries()) {
        const button = node(
          'button',
          `Open cited ${citation.evidence_class} source ${index + 1}`,
        );
        button.type = 'button';
        button.addEventListener('click', () =>
          options.citation(citation.source_id, targetId, button, {
            descriptor_revision_id: answer.evidence_revision_id,
            source_revision_id: citation.source_revision_id,
          }),
        );
        item.append(button);
      }
      history.append(item);
    }
  }
  function failure(error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error ? error.code : '';
    status.textContent =
      code === 'PROVIDER_UNAVAILABLE'
        ? 'Provider unavailable. No turn was saved; retry.'
        : code === 'INVALID_ANSWER'
          ? 'Provider response failed validation. No turn was saved.'
          : code === 'CONFLICT'
            ? 'Evidence or conversation changed. Reload documentation and conversation before retrying.'
            : code === 'LIMIT_EXCEEDED'
              ? 'Conversation limit reached. Earlier history is retained.'
              : 'Scoped conversation unavailable. Reload to retry.';
  }
  async function load() {
    const current = ++generation;
    ask.disabled = true;
    status.textContent = 'Loading scoped conversation…';
    try {
      const view = await options.load(conversationId || undefined);
      if (current !== generation) return;
      render(view);
      status.textContent = 'Ready for a scoped product question.';
      ask.disabled = false;
    } catch (error) {
      if (current === generation) failure(error);
    }
  }
  reload.addEventListener('click', () => void load());
  reset.addEventListener('click', () => {
    generation++;
    conversationId = crypto.randomUUID();
    expected = 0;
    history.replaceChildren();
    question.value = '';
    ask.disabled = false;
    status.textContent =
      'New conversation selected. Earlier history is retained.';
    question.focus();
  });
  ask.addEventListener('click', async () => {
    if (ask.disabled || !question.value.trim()) return;
    const current = ++generation,
      captured = question.value;
    ask.disabled = true;
    status.textContent = 'Preparing cited answer…';
    try {
      const view = await options.ask(conversationId, expected, captured);
      if (current !== generation) return;
      render(view);
      if (question.value === captured) question.value = '';
      status.textContent =
        'Answer ready. Citations open retained authorized sources.';
    } catch (error) {
      if (current === generation) failure(error);
    } finally {
      if (current === generation) ask.disabled = false;
    }
  });
  void load();
  return () => {
    generation++;
    question.value = '';
    history.replaceChildren();
    section.remove();
  };
}
