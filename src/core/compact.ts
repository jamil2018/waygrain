import type { TreeNode } from '../contracts/capture.js';
import type { Responses } from '../contracts/index.js';
import type { Capture } from './normalize.js';
import { Store } from '../store/database.js';
import { KnowledgeError } from './normalize.js';

type CaptureSummary = Extract<
  Extract<
    Responses['wg_query']['data'],
    { status: 'complete' }
  >['records'][number],
  { kind: 'capture' }
>;

// Only stored, normalized captures selected in the query's read transaction.
// Paths identify data in wg_evidence's capture, never executable locators.
export function compactCapture(store: Store, item: CaptureSummary) {
  const row = store.db
    .prepare('SELECT capture_json FROM captures WHERE id=?')
    .get(item.id) as { capture_json: string } | undefined;
  if (!row) throw new KnowledgeError('NOT_FOUND');
  const capture = JSON.parse(row.capture_json) as Capture;
  const nodes: NonNullable<CaptureSummary['compact']>['nodes'] = [];
  const reasons = new Set<'NODE_LIMIT' | 'TEXT_LIMIT'>();
  let omitted = 0;
  const visit = (node: TreeNode, path: string) => {
    if (Buffer.byteLength(node.name) > 256) {
      omitted++;
      reasons.add('TEXT_LIMIT');
    } else if (nodes.length === 16) {
      omitted++;
      reasons.add('NODE_LIMIT');
    } else {
      nodes.push({
        source_path: path,
        role: node.role,
        name: node.name,
        enabled: node.enabled,
        visible: node.visible,
        ...(node.selected === undefined ? {} : { selected: node.selected }),
      });
    }
    node.children.forEach((child, index) =>
      visit(child, `${path}/children/${index}`),
    );
  };
  visit(capture.tree, '/tree');
  return {
    source_id: item.id,
    view_path: '/view' as const,
    view: capture.view,
    nodes,
    omitted_nodes: omitted,
    omission_reasons: [...reasons].sort(),
  };
}
