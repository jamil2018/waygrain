import type { EvidencePackage } from '../retrieval.js';
export function node<K extends keyof HTMLElementTagNameMap>(tag: K, text = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}
export function scopeLabel(data: Pick<EvidencePackage, 'scope'>) {
  const s = data.scope;
  return `Role ${s.role ?? 'unknown'} · Version ${s.version ?? 'unknown'} · Tenant ${s.tenant ?? 'unknown'} · Environment ${s.environment ?? 'unknown'} · State ${s.state ?? 'unknown'}`;
}
export interface SourceReference {
  descriptor_revision_id: string;
  source_revision_id: string;
}
export type CitationHandler = (
  sourceId: string,
  targetId: string,
  trigger: HTMLElement,
  reference?: SourceReference,
) => void;
export function renderDocumentation(
  body: HTMLElement,
  data: EvidencePackage,
  targetId: string,
  onCitation?: CitationHandler,
) {
  body.replaceChildren(node('p', scopeLabel(data)));
  if (data.truncated)
    body.append(
      node('p', 'Evidence is truncated; missing evidence remains unresolved.'),
    );
  const documents = data.documents.filter((d) => d.target_id === targetId);
  if (!documents.length)
    body.append(
      node(
        'p',
        'Documentation is empty or unavailable for this target and scope.',
      ),
    );
  for (const doc of documents) {
    body.append(
      node('h3', doc.name || 'Untitled description'),
      node('p', doc.summary),
      node(
        'p',
        'Authored documentation · claims below retain their own evidence classes.',
      ),
    );
    for (const [label, value] of Object.entries({
      Purpose: doc.purpose ? [doc.purpose] : [],
      Inputs: doc.inputs,
      Rules: doc.rules,
      Conditions: doc.conditions,
      Outputs: doc.outputs,
      'Side effects': doc.side_effects,
      Errors: doc.errors,
      Workflows: doc.workflows,
      Limitations: doc.limitations,
    })) {
      if (!value.length) continue;
      body.append(node('h4', label));
      const list = node('ul');
      for (const text of value) list.append(node('li', text));
      body.append(list);
    }
  }
  const claims = data.claims.filter((c) => c.target_id === targetId);
  if (claims.length)
    body.append(node('h3', 'Evidence and unresolved questions'));
  for (const claim of claims) {
    const article = node('article');
    article.className = 'wg-claim';
    article.append(
      node('h4', `${claim.evidence_class} · ${claim.freshness.status}`),
      node('p', claim.text),
    );
    if (claim.unknown)
      article.append(node('p', 'Unknown: this claim requires clarification.'));
    if (claim.conflicts.length)
      article.append(
        node(
          'p',
          'Unresolved conflict: related claims disagree; no reconciliation is established.',
        ),
      );
    if (claim.freshness.status !== 'current')
      article.append(
        node(
          'p',
          `Needs review: ${claim.freshness.reasons.join('; ') || 'Verification/freshness is unknown.'}`,
        ),
      );
    article.append(
      node(
        'p',
        `Confidence ${claim.confidence.level}: ${claim.confidence.reason}`,
      ),
    );
    if (claim.verification)
      article.append(
        node(
          'p',
          `Verified ${claim.verification.at} by ${claim.verification.actor}: ${claim.verification.method}; supplied revision ${claim.verification.supplied_revision ?? 'not supplied'}.`,
        ),
      );
    for (const ref of claim.sources) {
      const source = data.sources.find((s) => s.id === ref.source_id);
      if (!source) {
        article.append(
          node('p', 'Source unavailable in the bounded evidence package.'),
        );
        continue;
      }
      if (onCitation) {
        const button = node('button', `${source.title} · ${ref.locator}`);
        button.type = 'button';
        button.addEventListener('click', () =>
          onCitation(source.id, targetId, button, {
            descriptor_revision_id: data.revision_id!,
            source_revision_id: source.revision_id,
          }),
        );
        article.append(button);
      } else
        article.append(
          node('p', `${source.title} · ${ref.locator} · ${ref.content_hash}`),
        );
    }
    body.append(article);
  }
  for (const mapping of data.mappings.filter((m) => m.target_id === targetId))
    body.append(node('p', `Target mapping: ${mapping.status}`));
}
