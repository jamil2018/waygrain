import { randomUUID } from 'node:crypto';
import type { Page } from 'playwright';
import { LIMITS, type TreeNode, type Responses } from '../contracts/index.js';
import {
  normalizeCapture,
  type AppConfiguration,
  type Capture,
} from '../core/normalize.js';
import { BrowserError, type PageBinding } from './protocol.js';

type Snapshot = Responses['wg_browser_snapshot']['data'];
const roles = new Set([
  'document',
  'heading',
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'option',
  'tab',
  'tablist',
  'dialog',
  'list',
  'listitem',
  'table',
  'row',
  'cell',
  'text',
  'group',
  'navigation',
  'main',
  'generic',
  'menu',
  'menuitem',
  'switch',
  'slider',
  'spinbutton',
  'status',
  'alert',
]);
const controlRoles = new Set([
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'combobox',
  'tab',
  'menuitem',
  'switch',
  'slider',
  'spinbutton',
]);
const whitespace = (s: string) => s.replace(/\s+/gu, ' ').trim();

/** Returns only a configured template; actual paths/query/fragment never leave worker memory. */
export function mappedRoute(
  url: string,
  app: AppConfiguration,
  origin: string,
) {
  const current = new URL(url);
  if (
    current.origin !== origin ||
    current.username ||
    current.password ||
    !['http:', 'https:'].includes(current.protocol)
  )
    throw new BrowserError('ORIGIN_NOT_ALLOWED');
  const parts = current.pathname.split('/');
  const matches = app.route_mappings.filter(
    (m) =>
      m.origin === origin &&
      m.route_template.split('/').length === parts.length &&
      m.route_template
        .split('/')
        .every((p, i) => (p.startsWith(':') ? !!parts[i] : p === parts[i])),
  );
  if (matches.length !== 1) throw new BrowserError('INCOMPATIBLE_CAPTURE');
  return matches[0]!.route_template;
}

/** Public Playwright JSON only, never YAML parsing. Pure mapper is tested with synthetic input. */
export function mapSnapshot(
  raw: unknown,
  app: AppConfiguration,
  binding: PageBinding,
  route: string,
  trace: string,
  seq: number,
  now = new Date().toISOString(),
  frames = false,
): Snapshot {
  if (app.redaction_profiles.length !== 1)
    throw new BrowserError('INCOMPATIBLE_CAPTURE');
  const profile = app.redaction_profiles[0]!;
  const allowed = new Set(profile.allowed_labels.map(whitespace));
  const safe = (v: unknown) =>
    typeof v === 'string' &&
    Buffer.byteLength(v) <= LIMITS.text_bytes &&
    allowed.has(whitespace(v))
      ? whitespace(v)
      : '';
  let partial = frames;
  let truncated = false;
  let count = 1;
  const tabs: string[] = [];
  const modals: string[] = [];
  const targets: Snapshot['targets'] = [];
  const stateAlias = (name: string, list: string[]) => {
    const alias = name.toLowerCase().replace(/\s+/g, '_');
    if (
      /^[a-z][a-z0-9_-]{0,63}$/.test(alias) &&
      allowed.has(alias) &&
      list.length < 50
    )
      list.push(alias);
    else partial = true;
  };
  const visit = (value: unknown, depth: number): TreeNode | undefined => {
    if (depth > LIMITS.tree_depth || count >= LIMITS.tree_nodes) {
      truncated = true;
      return;
    }
    if (typeof value === 'string') {
      count++;
      return {
        role: 'text',
        name: safe(value),
        enabled: true,
        visible: true,
        children: [],
      };
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      partial = true;
      return;
    }
    const v = value as Record<string, unknown>;
    const role =
      typeof v.role === 'string' && roles.has(v.role) ? v.role : 'generic';
    if (role !== v.role) partial = true;
    if (
      ['expanded', 'pressed', 'invalid'].some((k) => Object.hasOwn(v, k)) ||
      v.checked === 'mixed'
    )
      partial = true;
    count++;
    const name = safe(role === 'text' ? (v.text ?? v.name) : v.name);
    const node: TreeNode = {
      role,
      name,
      enabled: v.disabled !== true,
      visible: true,
      children: [],
    };
    if (typeof v.selected === 'boolean') node.selected = v.selected;
    else if (typeof v.checked === 'boolean') node.selected = v.checked;
    if (role === 'tab' && node.selected) stateAlias(name, tabs);
    if (role === 'dialog') stateAlias(name, modals);
    // Text/children of editable controls may be their input value. They are never read into the safe tree.
    if (!['textbox', 'combobox', 'spinbutton', 'slider'].includes(role)) {
      if (v.text !== undefined && role !== 'text') {
        const child = visit(v.text, depth + 1);
        if (child) node.children.push(child);
      }
      if (Array.isArray(v.children))
        for (const child of v.children) {
          const mapped = visit(child, depth + 1);
          if (mapped) node.children.push(mapped);
          if (truncated) break;
        }
    }
    if (name && controlRoles.has(role))
      targets.push({
        target_id: randomUUID(),
        role,
        name,
        permitted_actions: [],
      });
    return node;
  };
  if (!Array.isArray(raw)) throw new BrowserError('INCOMPATIBLE_CAPTURE');
  const tree: TreeNode = {
    role: 'document',
    name: '',
    enabled: true,
    visible: true,
    children: [],
  };
  for (const value of raw) {
    const node = visit(value, 2);
    if (node) tree.children.push(node);
    if (truncated) break;
  }
  const capture: Capture = {
    captured_at: now,
    trace_id: trace,
    trace_seq: seq,
    session_id: binding.session_id,
    tab_id: binding.page_id,
    source: {
      producer: 'waygrain_browser',
      producer_version: '1',
      format: 'structured_accessibility',
      format_version: '1',
    },
    scope: binding.scope,
    view: {
      route_template: route,
      selected_tabs: tabs,
      modal_stack: modals,
      feature_variants: [],
    },
    tree,
    coverage: truncated
      ? { kind: 'partial', subtree: 'root', reason: 'truncated' }
      : partial
        ? { kind: 'partial', subtree: 'root', reason: 'unsupported' }
        : { kind: 'complete', subtree: 'root' },
    redaction_profile: { alias: profile.alias, version: profile.version },
  };
  const normalized = normalizeCapture(capture, app).capture;
  return {
    session_id: binding.session_id,
    page_id: binding.page_id,
    snapshot_id: randomUUID(),
    capture: normalized,
    targets,
  };
}

export async function snapshotPage(
  page: Page,
  app: AppConfiguration,
  binding: PageBinding,
  trace: string,
  seq: number,
): Promise<Snapshot> {
  const before = page.url();
  const route = mappedRoute(before, app, binding.scope.origin);
  const capturedAt = new Date().toISOString();
  let navigated = false;
  const navigation = () => {
    navigated = true;
  };
  page.on('framenavigated', navigation);
  try {
    // The JSON format lacks editable-host ancestry/type. Never interpret values
    // from these unsupported controls as safe static text, even if allowlisted.
    const unsupportedSelector =
      '[contenteditable]:not([contenteditable="false"]), input[type]:not([type="text"]):not([type="email"]):not([type="password"]):not([type="search"]):not([type="url"]):not([type="tel"]):not([type="number"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"])';
    const unsupportedEditing =
      (await page.locator(unsupportedSelector).count()) > 0;
    if (unsupportedEditing) {
      if (navigated || page.url() !== before)
        throw new BrowserError('STALE_TARGET');
      return mapSnapshot([], app, binding, route, trace, seq, capturedAt, true);
    }
    // The pinned runtime returns JSON values despite declaring Promise<string>.
    const raw: unknown = await page.ariaSnapshotJSON({
      mode: 'default',
      depth: 65,
      timeout: 5000,
    });
    if (
      Buffer.byteLength(typeof raw === 'string' ? raw : JSON.stringify(raw)) >
      4 * LIMITS.ingest_bytes
    )
      throw new BrowserError('LIMIT_EXCEEDED');
    const unsupported =
      page.frames().length > 1 ||
      (await page
        .locator(
          'input[type="password"], input[type="file"], canvas, [contenteditable="true"]',
        )
        .count()) > 0;
    const editingAfter = (await page.locator(unsupportedSelector).count()) > 0;
    if (navigated || page.url() !== before)
      throw new BrowserError('STALE_TARGET');
    if (editingAfter)
      return mapSnapshot([], app, binding, route, trace, seq, capturedAt, true);
    const result = mapSnapshot(
      typeof raw === 'string' ? JSON.parse(raw) : raw,
      app,
      binding,
      route,
      trace,
      seq,
      capturedAt,
      unsupported,
    );
    if (Buffer.byteLength(JSON.stringify(result)) > LIMITS.ingest_bytes)
      throw new BrowserError('LIMIT_EXCEEDED');
    return result;
  } finally {
    page.off('framenavigated', navigation);
  }
}
