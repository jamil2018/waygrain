import { readFile } from 'node:fs/promises';
import {
  contentHash,
  parseDescriptor,
  bundleSchema,
  type DescriptorBundle,
  type DescriptorScope,
  type AccessContext,
} from './contracts.js';

// Stable opaque fixture identities are independent of UI labels and applicability.
export const fixtureId = (name: string) => {
  const h = contentHash('waygrain-descriptor-synthetic:' + name);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
export const fixtureScope: DescriptorScope = {
  environment: 'demo',
  version: '1',
  role: 'reader',
  tenant: 'synthetic',
  state: 'default',
};
export const fixtureTargets = {
  page: fixtureId('page'),
  quantity: fixtureId('quantity'),
  calculate: fixtureId('calculate'),
  result: fixtureId('result'),
};
const stamp = '2026-10-16T00:00:00Z';
const rev = (key: string) => ({
  revision_id: fixtureId(key + ':revision:1'),
  supersedes_revision_id: null,
});
export function fixtureAccess(
  project_id: string,
  app_id: string,
  scope: DescriptorScope,
  author = false,
): AccessContext {
  return {
    principal: author ? 'local-author' : 'local-reader',
    author,
    grants: [{ project_id, app_id, scope }],
  };
}
export async function descriptorFixture(
  project_id: string,
  app_id: string,
): Promise<DescriptorBundle> {
  const code = await readFile(
    new URL('../../assets/descriptor-demo/calculate.mjs', import.meta.url),
    'utf8',
  );
  const codeRevision = contentHash(code);
  const bundle: DescriptorBundle = {
    schema_version: 1,
    project_id,
    app_id,
    ...rev('bundle'),
    targets: [
      {
        id: fixtureTargets.page,
        kind: 'page',
        page_id: null,
        key: 'calculator',
      },
      ...(['quantity', 'calculate', 'result'] as const).map((key) => ({
        id: fixtureTargets[key],
        kind: 'component' as const,
        page_id: fixtureTargets.page,
        key,
      })),
    ],
    sources: [],
    claims: [],
    documents: [],
    mappings: [],
  };
  const scopes: DescriptorScope[] = [];
  for (const role of ['reader', 'editor'])
    for (const version of ['1', '2'])
      scopes.push({ ...fixtureScope, role, version });
  scopes.push(
    { ...fixtureScope, tenant: 'isolated-tenant' },
    { ...fixtureScope, state: 'conflict' },
    { ...fixtureScope, state: 'missing-mapping' },
    { ...fixtureScope, state: 'ambiguous-mapping' },
    { ...fixtureScope, state: 'changed-source' },
    { ...fixtureScope, version: '2', state: 'changed-version' },
    { ...fixtureScope, role: null, version: null },
  );
  for (const [index, scope] of scopes.entries()) {
    const prefix = `scope-${index}`;
    const fact =
      'Total = quantity × unit price; quantity ≥ 10 receives 10% discount; round half up to two decimals.';
    const classes = [
      'documented',
      'observed',
      'code-verified',
      'inferred',
    ] as const;
    for (const evidence of classes) {
      const key = `${prefix}:${evidence}`,
        sourceId = fixtureId(key + ':source');
      const excerpt =
        evidence === 'code-verified'
          ? code
          : evidence === 'observed'
            ? 'Synthetic calculation check: quantity 10 and unit price 10 returns 90.00; quantity 9 returns 90.00 without discount.'
            : evidence === 'inferred'
              ? 'The quantity discount may encourage larger synthetic orders; intent is inferred.'
              : fact;
      const locator =
        evidence === 'code-verified'
          ? 'assets/descriptor-demo/calculate.mjs#calculate'
          : `fixture:${key}`;
      const source = {
        id: sourceId,
        ...rev(key + ':source'),
        scope,
        kind:
          evidence === 'code-verified'
            ? ('code' as const)
            : evidence === 'observed'
              ? ('observation' as const)
              : ('document' as const),
        title: `Synthetic ${evidence} · ${scope.role ?? 'unknown'} / ${scope.version ?? 'unknown'} / ${scope.tenant} / ${scope.state}`,
        origin: 'fixture:descriptor',
        excerpt,
        content_hash: contentHash(excerpt),
        locator,
        supplied_revision: evidence === 'code-verified' ? codeRevision : null,
        symbol: evidence === 'code-verified' ? 'calculate' : null,
        observation_id:
          evidence === 'observed' ? 'synthetic-quantity-9-and-10' : null,
      };
      bundle.sources.push(source);
      bundle.claims.push({
        id: fixtureId(key + ':claim'),
        ...rev(key + ':claim'),
        target_id: fixtureTargets.calculate,
        scope,
        text:
          evidence === 'observed' || evidence === 'inferred' ? excerpt : fact,
        evidence_class: evidence,
        sources: [
          {
            source_id: sourceId,
            revision_id: source.revision_id,
            content_hash: source.content_hash,
            locator,
          },
        ],
        recorded_at: stamp,
        verification:
          evidence === 'code-verified'
            ? {
                at: stamp,
                actor: 'synthetic-fixture-author',
                method:
                  'Supplied function inspected at SHA256 revision; tests/descriptor/fixture.test.mjs checks quantity boundaries and decimal rounding.',
                scope,
                supplied_revision: codeRevision,
              }
            : null,
        confidence: {
          level: evidence === 'inferred' ? 'low' : 'medium',
          reason:
            'Synthetic fixture evidence only; not host application qualification.',
        },
        unknown: scope.version === null,
        conflicts: [],
        freshness: {
          status:
            scope.state === 'changed-source' ||
            scope.state === 'changed-version' ||
            scope.version === null
              ? 'needs_review'
              : 'current',
          reasons:
            scope.state === 'changed-source'
              ? ['Supplied source changed; synthetic review case']
              : scope.state === 'changed-version'
                ? [
                    'Application version changed from 1 to 2; synthetic review case',
                  ]
                : scope.version === null
                  ? ['Application version unknown']
                  : [],
        },
      });
    }
    if (scope.state === 'conflict') {
      const first = bundle.claims[bundle.claims.length - 4]!;
      const key = `${prefix}:conflict`,
        text =
          'A conflicting synthetic policy states a 20% discount at quantity ≥ 10.';
      const source = {
        ...bundle.sources[bundle.sources.length - 4]!,
        id: fixtureId(key + ':source'),
        ...rev(key + ':source'),
        title: 'Conflicting synthetic discount policy',
        excerpt: text,
        content_hash: contentHash(text),
        locator: 'fixture:conflicting-policy',
      };
      bundle.sources.push(source);
      const claim = {
        ...first,
        id: fixtureId(key + ':claim'),
        ...rev(key + ':claim'),
        text,
        sources: [
          {
            source_id: source.id,
            revision_id: source.revision_id,
            content_hash: source.content_hash,
            locator: source.locator,
          },
        ],
        conflicts: [first.id],
      };
      first.conflicts.push(claim.id);
      bundle.claims.push(claim);
    }
    for (const [key, target_id] of Object.entries(fixtureTargets)) {
      const name =
        key === 'page'
          ? 'Calculate an order'
          : key === 'calculate'
            ? 'Calculate'
            : key === 'quantity'
              ? 'Quantity'
              : 'Order total';
      bundle.documents.push({
        id: fixtureId(`${prefix}:${key}:doc`),
        ...rev(`${prefix}:${key}:doc`),
        target_id,
        scope,
        name,
        summary:
          key === 'calculate'
            ? 'Calculate the synthetic order total with a quantity discount.'
            : `${name} documentation`,
        purpose:
          key === 'page'
            ? 'Explain a synthetic order calculation, its inputs, validation, result and limits.'
            : `Describe ${name.toLowerCase()} in the synthetic calculator.`,
        inputs: [
          'Quantity: whole number 0–10000',
          'Unit price: 0–1000000, up to four decimals',
        ],
        rules: key === 'quantity' ? [] : [fact],
        conditions: ['Quantity ≥ 10 enables the discount'],
        outputs: ['Total rounded half up to two decimals'],
        side_effects: ['Updates only the transient synthetic result'],
        errors: ['Invalid quantity or unit price produces validation feedback'],
        workflows: [
          'Enter quantity and price, then Calculate; inspect evidence separately.',
        ],
        limitations: [
          'Synthetic units; tax policy is unknown; no payment or inventory operation.',
        ],
        related_target_ids: Object.values(fixtureTargets).filter(
          (id) => id !== target_id,
        ),
        claim_ids:
          key === 'calculate'
            ? bundle.claims.filter((c) => c.scope === scope).map((c) => c.id)
            : [],
      });
      bundle.mappings.push({
        id: fixtureId(`${prefix}:${key}:mapping`),
        target_id,
        scope,
        target_key:
          scope.state === 'ambiguous-mapping' &&
          (key === 'quantity' || key === 'calculate')
            ? 'calculate'
            : scope.state === 'missing-mapping' && key === 'calculate'
              ? 'missing-control'
              : key === 'page'
                ? 'calculator'
                : key,
        status:
          scope.state === 'missing-mapping'
            ? 'missing'
            : scope.state === 'ambiguous-mapping'
              ? 'ambiguous'
              : 'resolved',
      });
    }
  }
  return parseDescriptor(bundleSchema, bundle);
}
