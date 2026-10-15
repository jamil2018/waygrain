import { randomUUID } from 'node:crypto';
import { contentHash } from '../../dist/descriptor/contracts.js';
export const scope = {
  environment: 'demo',
  version: '1',
  role: 'reader',
  tenant: 'synthetic',
  state: 'default',
};
export const revision = () => ({
  revision_id: randomUUID(),
  supersedes_revision_id: null,
});
export function contractFixture() {
  const page = {
    id: randomUUID(),
    kind: 'page',
    page_id: null,
    key: 'calculator',
  };
  const component = {
    id: randomUUID(),
    kind: 'component',
    page_id: page.id,
    key: 'calculate',
  };
  const source = {
    id: randomUUID(),
    ...revision(),
    scope: { ...scope },
    kind: 'document',
    title: 'Synthetic rule',
    origin: 'fixture:rules',
    excerpt: 'Discount is 10% at quantity >= 10.',
    content_hash: contentHash('Discount is 10% at quantity >= 10.'),
    locator: 'rules/discount',
    supplied_revision: null,
    symbol: null,
    observation_id: null,
  };
  const claim = {
    id: randomUUID(),
    ...revision(),
    target_id: component.id,
    scope: { ...scope },
    text: source.excerpt,
    evidence_class: 'documented',
    sources: [
      {
        source_id: source.id,
        revision_id: source.revision_id,
        content_hash: source.content_hash,
        locator: source.locator,
      },
    ],
    recorded_at: '2026-10-16T00:00:00Z',
    verification: null,
    confidence: {
      level: 'medium',
      reason: 'Synthetic document states rule; no host verification.',
    },
    unknown: false,
    conflicts: [],
    freshness: { status: 'unknown', reasons: [] },
  };
  const doc = {
    id: randomUUID(),
    ...revision(),
    target_id: component.id,
    scope: { ...scope },
    name: 'Calculate',
    summary: 'Calculate fixture total',
    purpose: '',
    inputs: [],
    rules: [],
    conditions: [],
    outputs: [],
    side_effects: [],
    errors: [],
    workflows: [],
    limitations: [],
    related_target_ids: [page.id],
    claim_ids: [claim.id],
  };
  return {
    schema_version: 1,
    project_id: randomUUID(),
    app_id: randomUUID(),
    ...revision(),
    targets: [page, component],
    sources: [source],
    claims: [claim],
    documents: [doc],
    mappings: [
      {
        id: randomUUID(),
        target_id: component.id,
        scope: { ...scope },
        target_key: 'calculate',
        status: 'resolved',
      },
    ],
  };
}
