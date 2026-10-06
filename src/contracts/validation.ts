import { z } from 'zod';
import { knowledgeContracts } from './knowledge.js';
import { browserContracts } from './browser.js';
import { LIMITS } from './common.js';
import type { ToolName, Requests, Responses } from './index.js';

const toolSchemas = { ...knowledgeContracts, ...browserContracts };
const safeFields = new Set<string>();
// Schema-owned paths only; dynamic caller keys never enter error output.
function collectFields(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  if (
    'properties' in value &&
    value.properties &&
    typeof value.properties === 'object'
  ) {
    for (const name of Object.keys(value.properties)) safeFields.add(name);
  }
  for (const child of Object.values(value)) collectFields(child);
}
for (const contract of Object.values(toolSchemas)) {
  collectFields(z.toJSONSchema(contract.input));
  collectFields(z.toJSONSchema(contract.output));
}
export class ContractError extends Error {
  constructor(
    readonly code: 'INVALID_INPUT' | 'LIMIT_EXCEEDED' | 'UNSUPPORTED_SCHEMA',
    readonly field_paths: (string | number)[][] = [],
  ) {
    super(code);
  }
  toJSON() {
    return {
      schema_version: 1,
      error: {
        code: this.code,
        message: 'Contract request rejected' as const,
        field_paths: this.field_paths,
      },
    };
  }
}

function reject(
  code: 'INVALID_INPUT' | 'LIMIT_EXCEEDED',
  path: (string | number)[] = [],
): never {
  throw new ContractError(code, [
    path
      .filter((part) => typeof part === 'number' || safeFields.has(part))
      .slice(0, 128),
  ]);
}
// Fail before recursive schema parsing; accept plain JSON, not cyclic/executable JS objects.
function checkJson(input: unknown): void {
  const stack: { value: unknown; depth: number }[] = [
    { value: input, depth: 0 },
  ];
  const seen = new Set<object>();
  let nodes = 0;
  while (stack.length) {
    const { value, depth } = stack.pop()!;
    if (++nodes > 100_000 || depth > 256) reject('LIMIT_EXCEEDED');
    if (
      typeof value === 'string' &&
      Buffer.byteLength(value) > LIMITS.text_bytes
    )
      reject('LIMIT_EXCEEDED');
    if (value === null || ['string', 'boolean'].includes(typeof value))
      continue;
    if (typeof value === 'number' && Number.isFinite(value)) continue;
    if (typeof value !== 'object') reject('INVALID_INPUT');
    const object = value as object;
    if (seen.has(object)) reject('INVALID_INPUT');
    seen.add(object);
    if (
      !Array.isArray(object) &&
      Object.getPrototypeOf(object) !== Object.prototype &&
      Object.getPrototypeOf(object) !== null
    )
      reject('INVALID_INPUT');
    if (Object.getOwnPropertySymbols(object).length) reject('INVALID_INPUT');
    for (const [name, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(object),
    )) {
      if (Array.isArray(object) && name === 'length') continue;
      if (!descriptor.enumerable || !('value' in descriptor))
        reject('INVALID_INPUT');
      stack.push({ value: descriptor.value, depth: depth + 1 });
    }
  }
}
function checkTree(input: unknown): void {
  if (!input || typeof input !== 'object') return;
  const stack: { value: unknown; depth: number }[] = [
    { value: input, depth: 1 },
  ];
  let count = 0;
  while (stack.length) {
    const { value, depth } = stack.pop()!;
    if (++count > LIMITS.tree_nodes || depth > LIMITS.tree_depth)
      reject('LIMIT_EXCEEDED', ['capture', 'tree']);
    if (
      value &&
      typeof value === 'object' &&
      'children' in value &&
      Array.isArray(value.children)
    )
      for (const child of value.children)
        stack.push({ value: child, depth: depth + 1 });
  }
}
function semanticChecks(input: unknown, now: number): void {
  if (!input || typeof input !== 'object') return;
  if (
    'capture' in input &&
    input.capture &&
    typeof input.capture === 'object'
  ) {
    const capture = input.capture;
    if ('tree' in capture) checkTree(capture.tree);
    if (
      'captured_at' in capture &&
      typeof capture.captured_at === 'string' &&
      Date.parse(capture.captured_at) > now + LIMITS.future_tolerance_ms
    )
      reject('INVALID_INPUT', ['capture', 'captured_at']);
  }
  if ('operations' in input && Array.isArray(input.operations)) {
    const refs = new Set<string>();
    for (const op of input.operations) {
      if (op.client_ref) {
        if (refs.has(op.client_ref))
          reject('INVALID_INPUT', ['operations', 'client_ref']);
        refs.add(op.client_ref);
      }
      if (
        op.op === 'record_test_run' &&
        Date.parse(op.run.finished_at) < Date.parse(op.run.started_at)
      )
        reject('INVALID_INPUT', ['operations', 'run', 'finished_at']);
      if (
        op.op === 'create_transition' &&
        op.provenance === 'test_verified' &&
        !op.test_run_id
      )
        reject('INVALID_INPUT', ['operations', 'test_run_id']);
    }
  }
  if (
    'mode' in input &&
    input.mode === 'revisions' &&
    'from_revision' in input &&
    'to_revision' in input &&
    Number(input.from_revision) > Number(input.to_revision)
  )
    reject('INVALID_INPUT', ['from_revision']);
}
function validate(schema: z.ZodType, input: unknown) {
  checkJson(input);
  const result = schema.safeParse(input);
  if (!result.success)
    throw new ContractError(
      result.error.issues.some((issue) => issue.code === 'too_big')
        ? 'LIMIT_EXCEEDED'
        : 'INVALID_INPUT',
      result.error.issues
        .slice(0, 50)
        .map((issue) =>
          issue.path
            .filter(
              (part): part is string | number =>
                typeof part === 'number' ||
                (typeof part === 'string' && safeFields.has(part)),
            )
            .slice(0, 128),
        ),
    );
  return result.data;
}
/** Validation only; never writes, redacts, launches a browser or grants authorization. */
export function validateRequest<K extends ToolName>(
  name: K,
  input: unknown,
  now = Date.now(),
): Requests[K] {
  if (!Object.hasOwn(toolSchemas, name)) reject('INVALID_INPUT');
  checkJson(input);
  if (Buffer.byteLength(JSON.stringify(input)) > LIMITS.ingest_bytes)
    reject('LIMIT_EXCEEDED');
  if (
    input &&
    typeof input === 'object' &&
    'schema_version' in input &&
    input.schema_version !== 1
  )
    throw new ContractError('UNSUPPORTED_SCHEMA', [['schema_version']]);
  if (
    name.startsWith('wg_browser_') &&
    input &&
    typeof input === 'object' &&
    'browser_schema_version' in input &&
    input.browser_schema_version !== 1
  )
    throw new ContractError('UNSUPPORTED_SCHEMA', [['browser_schema_version']]);
  if (
    name === 'wg_ingest' &&
    input &&
    typeof input === 'object' &&
    'capture' in input &&
    input.capture &&
    typeof input.capture === 'object' &&
    'tree' in input.capture
  )
    checkTree(input.capture.tree);
  const result = validate(toolSchemas[name].input, input);
  semanticChecks(result, now);
  return result as Requests[K];
}
export function validateResponse<K extends ToolName>(
  name: K,
  input: unknown,
): Responses[K] {
  if (!Object.hasOwn(toolSchemas, name)) reject('INVALID_INPUT');
  // Structural output validation; scope, reference, redaction and budget enforcement belong to services.
  checkJson(input);
  if (
    name === 'wg_browser_snapshot' &&
    input &&
    typeof input === 'object' &&
    'data' in input &&
    input.data &&
    typeof input.data === 'object' &&
    'capture' in input.data &&
    input.data.capture &&
    typeof input.data.capture === 'object' &&
    'tree' in input.data.capture
  )
    checkTree(input.data.capture.tree);
  if (
    name === 'wg_evidence' &&
    input &&
    typeof input === 'object' &&
    'data' in input &&
    input.data &&
    typeof input.data === 'object' &&
    'items' in input.data &&
    Array.isArray(input.data.items)
  ) {
    for (const item of input.data.items)
      if (
        item &&
        typeof item === 'object' &&
        item.projection === 'structured_capture' &&
        item.capture &&
        typeof item.capture === 'object'
      )
        checkTree(item.capture.tree);
  }
  const result = validate(toolSchemas[name].output, input);
  if (name === 'wg_evidence') {
    const data = (result as Responses['wg_evidence']).data;
    for (const [index, item] of data.items.entries())
      if (item.projection === 'structured_capture') {
        if (
          (item.capture.coverage.kind === 'partial') !==
          (item.state_id === null)
        )
          reject('INVALID_INPUT', ['data', 'items', index, 'state_id']);
      }
  }
  if (name === 'wg_query') {
    const data = (result as Responses['wg_query']).data;
    for (const [index, record] of data.records.entries())
      if (
        record.kind === 'capture' &&
        (record.evidence.coverage.kind === 'partial') !==
          (record.state_id === null)
      )
        reject('INVALID_INPUT', ['data', 'records', index, 'state_id']);
  }
  return result as Responses[K];
}
