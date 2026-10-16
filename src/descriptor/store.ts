import type { Store } from '../store/database.js';
import { KnowledgeError } from '../core/normalize.js';
import { assertFreshness } from './freshness.js';
import {
  DescriptorError,
  bundleSchema,
  parseDescriptor,
  writeRequestSchema,
  type DescriptorBundle,
} from './contracts.js';

function appOwned(store: Store, projectId: string, appId: string) {
  if (
    projectId !== store.location.configuration.project_id ||
    !store.location.configuration.apps.some((a) => a.app_id === appId)
  )
    throw new DescriptorError('ACCESS_DENIED');
}
function decode(row: unknown): DescriptorBundle | null {
  if (!row) return null;
  const record = row as { schema_version: number; bundle_json: string };
  if (record.schema_version !== 1)
    throw new DescriptorError('UNSUPPORTED_SCHEMA');
  return parseDescriptor(
    bundleSchema,
    JSON.parse(record.bundle_json) as unknown,
  );
}
/** Internal store API. Transport consumers must authorize before calling or projecting it. */
export function readBundle(
  store: Store,
  appId: string,
): DescriptorBundle | null {
  appOwned(store, store.location.configuration.project_id, appId);
  return decode(
    store.db
      .prepare(
        'SELECT r.schema_version,r.bundle_json FROM descriptor_revisions r JOIN descriptor_heads h ON r.revision_id=h.revision_id WHERE h.app_id=?',
      )
      .get(appId),
  );
}
export function bundleHistory(store: Store, appId: string): DescriptorBundle[] {
  appOwned(store, store.location.configuration.project_id, appId);
  return store.db
    .prepare(
      'SELECT schema_version,bundle_json FROM descriptor_revisions WHERE app_id=? ORDER BY store_revision',
    )
    .all(appId)
    .map((row) => decode(row)!);
}
function validateSuccessor(
  previous: DescriptorBundle | null,
  next: DescriptorBundle,
) {
  if (
    next.supersedes_revision_id !== (previous?.revision_id ?? null) ||
    previous?.revision_id === next.revision_id
  )
    throw new KnowledgeError('CONFLICT');
  if (!previous) {
    if (
      [...next.sources, ...next.claims, ...next.documents].some(
        (e) => e.supersedes_revision_id !== null,
      )
    )
      throw new KnowledgeError('CONFLICT');
    return;
  }
  for (const key of ['sources', 'claims', 'documents'] as const) {
    for (const item of next[key]) {
      const old = previous[key].find((e) => e.id === item.id);
      if (!old) {
        if (item.supersedes_revision_id !== null)
          throw new KnowledgeError('CONFLICT');
      } else if (
        JSON.stringify(old) !== JSON.stringify(item) &&
        (item.revision_id === old.revision_id ||
          item.supersedes_revision_id !== old.revision_id)
      )
        throw new KnowledgeError('CONFLICT');
    }
  }
  for (const t of next.targets) {
    const old = previous.targets.find((e) => e.id === t.id);
    if (old && (old.kind !== t.kind || old.page_id !== t.page_id))
      throw new KnowledgeError('CONFLICT');
  }
}
function validateStoredSuccessor(
  store: Store,
  b: DescriptorBundle,
  previous: DescriptorBundle | null = readBundle(store, b.app_id),
  historic: DescriptorBundle[] = bundleHistory(store, b.app_id),
) {
  validateSuccessor(previous, b);
  // An ID cannot reappear after removal or be repurposed across entity kinds/apps.
  for (const old of historic) {
    for (const key of [
      'targets',
      'sources',
      'claims',
      'documents',
      'mappings',
    ] as const) {
      for (const item of b[key]) {
        const existed = old[key].some((e) => e.id === item.id);
        if ('revision_id' in item) {
          const sameRevision = old[key].find(
            (e) =>
              e.id === item.id &&
              'revision_id' in e &&
              e.revision_id === item.revision_id,
          );
          if (
            sameRevision &&
            JSON.stringify(sameRevision) !== JSON.stringify(item)
          )
            throw new KnowledgeError('CONFLICT');
        }
        if (existed && previous && !previous[key].some((e) => e.id === item.id))
          throw new KnowledgeError('CONFLICT');
        for (const other of [
          'targets',
          'sources',
          'claims',
          'documents',
          'mappings',
        ] as const)
          if (other !== key && old[other].some((e) => e.id === item.id))
            throw new KnowledgeError('CONFLICT');
      }
    }
  }
  const otherApps = store.db
    .prepare(
      'SELECT bundle_json,schema_version FROM descriptor_revisions WHERE app_id<>?',
    )
    .all(b.app_id);
  const nextIds = new Set(
    [
      ...b.targets,
      ...b.sources,
      ...b.claims,
      ...b.documents,
      ...b.mappings,
    ].map((e) => e.id),
  );
  for (const row of otherApps) {
    const other = decode(row)!;
    if (
      [
        ...other.targets,
        ...other.sources,
        ...other.claims,
        ...other.documents,
        ...other.mappings,
      ].some((e) => nextIds.has(e.id))
    )
      throw new KnowledgeError('CONFLICT');
  }
  store.requireStorageCapacity();
}
/** Validate an authoring candidate without advancing revision or retaining content. */
export function previewBundle(store: Store, input: unknown) {
  const request = parseDescriptor(writeRequestSchema, input);
  appOwned(store, request.bundle.project_id, request.bundle.app_id);
  return store.transaction(() => {
    store.requireRevision(request.expected_revision);
    validateStoredSuccessor(store, request.bundle);
    assertFreshness(readBundle(store, request.bundle.app_id), request.bundle);
    return {
      valid: true,
      expected_revision: request.expected_revision,
      revision_id: request.bundle.revision_id,
    };
  }, false);
}
export function writeBundle(
  store: Store,
  input: unknown,
  explicitVerification = false,
): { revision: number; revision_id: string } {
  const request = parseDescriptor(writeRequestSchema, input),
    b = request.bundle;
  appOwned(store, b.project_id, b.app_id);
  const encoded = JSON.stringify(b);
  return store.write(request.expected_revision, (revision) => {
    validateStoredSuccessor(store, b);
    assertFreshness(readBundle(store, b.app_id), b, explicitVerification);
    store.db
      .prepare('INSERT INTO descriptor_revisions VALUES(?,?,?,1,?,?)')
      .run(
        b.revision_id,
        b.app_id,
        revision,
        b.supersedes_revision_id,
        encoded,
      );
    store.db
      .prepare(
        'INSERT INTO descriptor_heads VALUES(?,?) ON CONFLICT(app_id) DO UPDATE SET revision_id=excluded.revision_id',
      )
      .run(b.app_id, b.revision_id);
    // Recheck after allocation; rollback includes head, history and global revision.
    store.requireStorageCapacity();
    return { revision, revision_id: b.revision_id };
  });
}

/** Restore a complete chain only into an empty app. Validation precedes allocation; one transaction covers all rows. */
export function restoreBundleHistory(
  store: Store,
  expectedRevision: number,
  history: DescriptorBundle[],
  preview = false,
) {
  return store.transaction(() => {
    store.requireRevision(expectedRevision);
    if (!history.length) throw new DescriptorError('INVALID_INPUT');
    const app = history[0]!.app_id,
      project = history[0]!.project_id;
    appOwned(store, project, app);
    if (bundleHistory(store, app).length) throw new KnowledgeError('CONFLICT');
    const validated: DescriptorBundle[] = [];
    for (const raw of history) {
      const bundle = parseDescriptor(bundleSchema, raw);
      if (bundle.app_id !== app || bundle.project_id !== project)
        throw new DescriptorError('ACCESS_DENIED');
      if (validated.some((old) => old.revision_id === bundle.revision_id))
        throw new KnowledgeError('CONFLICT');
      validateStoredSuccessor(
        store,
        bundle,
        validated.at(-1) ?? null,
        validated,
      );
      validated.push(bundle);
    }
    if (!preview) {
      for (const b of validated) {
        const revision = store.advanceRevision();
        store.db
          .prepare('INSERT INTO descriptor_revisions VALUES(?,?,?,1,?,?)')
          .run(
            b.revision_id,
            b.app_id,
            revision,
            b.supersedes_revision_id,
            JSON.stringify(b),
          );
      }
      const last = validated.at(-1)!;
      store.db
        .prepare('INSERT INTO descriptor_heads VALUES(?,?)')
        .run(app, last.revision_id);
      store.requireStorageCapacity();
    }
    return {
      valid: true,
      revision: store.revision,
      revisions: validated.length,
      revision_id: validated.at(-1)!.revision_id,
    };
  }, !preview);
}
