import type { Store } from '../store/database.js';
import { readBundle } from './store.js';
import {
  accessContextSchema,
  readRequestSchema,
  parseDescriptor,
  sameScope,
  DescriptorError,
  DESCRIPTOR_LIMITS,
  type AccessContext,
  type ReadRequest,
  type DescriptorBundle,
} from './contracts.js';

export function authorize(
  context: AccessContext,
  request: ReadRequest,
  author = false,
): void {
  const trusted = parseDescriptor(accessContextSchema, context);
  if (
    (author && !trusted.author) ||
    !trusted.grants.some(
      (g) =>
        g.project_id === request.project_id &&
        g.app_id === request.app_id &&
        sameScope(g.scope, request.scope),
    )
  )
    throw new DescriptorError('ACCESS_DENIED');
}
export interface EvidencePackage {
  project_id: string;
  app_id: string;
  target_id: string;
  scope: ReadRequest['scope'];
  revision: number;
  revision_id: string | null;
  targets: DescriptorBundle['targets'];
  documents: DescriptorBundle['documents'];
  claims: DescriptorBundle['claims'];
  sources: DescriptorBundle['sources'];
  mappings: DescriptorBundle['mappings'];
  missing: string[];
  omitted: {
    targets: number;
    documents: number;
    claims: number;
    sources: number;
    mappings: number;
  };
  truncated: boolean;
}
const ordered = <T extends { id: string }>(items: T[]) =>
  [...items].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const size = (value: unknown) => Buffer.byteLength(JSON.stringify(value));
/** No caller metadata is used as authority. The context comes from configured host/server code. */
export function retrieveDescriptor(
  store: Store,
  context: AccessContext,
  input: unknown,
): EvidencePackage {
  const request = parseDescriptor(readRequestSchema, input);
  authorize(context, request); // Before opening any source/document projection.
  if (
    request.project_id !== store.location.configuration.project_id ||
    !store.location.configuration.apps.some((a) => a.app_id === request.app_id)
  )
    throw new DescriptorError('ACCESS_DENIED');
  return store.transaction(() => {
    const bundle = readBundle(store, request.app_id);
    const result: EvidencePackage = {
      ...request,
      revision: store.revision,
      revision_id: bundle?.revision_id ?? null,
      targets: [],
      documents: [],
      claims: [],
      sources: [],
      mappings: [],
      missing: [],
      omitted: { targets: 0, documents: 0, claims: 0, sources: 0, mappings: 0 },
      truncated: false,
    };
    const selected = bundle?.targets.find((t) => t.id === request.target_id);
    if (!bundle || !selected) {
      result.missing.push('TARGET_NOT_FOUND');
      return result;
    }
    const included = new Set([selected.id]);
    if (selected.kind === 'component') included.add(selected.page_id!);
    else
      for (const t of bundle.targets)
        if (t.page_id === selected.id) included.add(t.id);
    const compatible = <
      T extends { id: string; scope: ReadRequest['scope']; target_id: string },
    >(
      items: T[],
    ) =>
      ordered(
        items.filter(
          (e) => included.has(e.target_id) && sameScope(e.scope, request.scope),
        ),
      );
    const visibleTargets = new Set(
      [
        ...compatible(bundle.documents),
        ...compatible(bundle.claims),
        ...compatible(bundle.mappings),
      ].map((e) => e.target_id),
    );
    // Reserve a fixed margin for final missing/omission metadata; trial additions stay atomic.
    const fits = () => size(result) <= DESCRIPTOR_LIMITS.evidenceBytes - 512;
    for (const target of ordered(
      bundle.targets.filter((t) => visibleTargets.has(t.id)),
    )) {
      result.targets.push(target);
      if (!fits()) {
        result.targets.pop();
        result.omitted.targets++;
      }
    }
    for (const doc of compatible(bundle.documents)) {
      result.documents.push(doc);
      if (!fits()) {
        result.documents.pop();
        result.omitted.documents++;
      }
    }
    const candidates = compatible(bundle.claims);
    for (const claim of candidates) {
      const refs = new Set(claim.sources.map((s) => s.source_id));
      const additions = ordered(
        bundle.sources.filter(
          (s) =>
            refs.has(s.id) &&
            sameScope(s.scope, request.scope) &&
            !result.sources.some((old) => old.id === s.id),
        ),
      );
      const originalSources = result.sources.length;
      result.claims.push(claim);
      result.sources.push(...additions);
      if (result.claims.length > DESCRIPTOR_LIMITS.claims || !fits()) {
        result.claims.pop();
        result.sources.splice(originalSources);
        result.omitted.claims++;
      }
    }
    result.sources = ordered(result.sources);
    result.omitted.sources = new Set(
      candidates
        .flatMap((c) => c.sources.map((s) => s.source_id))
        .filter((id) => !result.sources.some((s) => s.id === id)),
    ).size;
    for (const mapping of compatible(bundle.mappings)) {
      result.mappings.push(mapping);
      if (!fits()) {
        result.mappings.pop();
        result.omitted.mappings++;
      }
    }
    if (!result.documents.some((d) => d.target_id === selected.id))
      result.missing.push('TARGET_DOCUMENTATION_MISSING');
    if (!result.claims.length) result.missing.push('APPLICABLE_CLAIMS_MISSING');
    if (Object.values(result.omitted).some((n) => n > 0)) {
      result.truncated = true;
      result.missing.push('EVIDENCE_TRUNCATED');
    }
    return result;
  }, false);
}
/** The source inspector uses the same scope gate and does not reveal restricted titles in errors. */
export function inspectSource(
  store: Store,
  context: AccessContext,
  input: unknown,
  sourceId: string,
): DescriptorBundle['sources'][number] {
  const request = parseDescriptor(readRequestSchema, input);
  authorize(context, request);
  const evidence = retrieveDescriptor(store, context, request);
  const source = evidence.sources.find((s) => s.id === sourceId);
  if (!source) throw new DescriptorError('NOT_FOUND');
  return source;
}
