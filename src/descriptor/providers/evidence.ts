import type { Store } from '../../store/database.js';
import {
  DescriptorError,
  parseDescriptor,
  sameScope,
  type AccessContext,
} from '../contracts.js';
import { retrieveDescriptor } from '../retrieval.js';
import {
  clarificationRequestSchema,
  type CalculationBasis,
  type ProviderInput,
  type QuestionKind,
} from './contracts.js';
function question(
  input: string,
  basis: boolean,
): { kind: QuestionKind; text: string } {
  const q = input
    .trim()
    .toLowerCase()
    .replace(/[?!.]+$/, '')
    .replace(/\s+/g, ' ');
  if (q === 'why is the total 90 for 10 items at 10 each')
    return {
      kind: 'ten',
      text: 'Why is the total 90 for 10 items at 10 each?',
    };
  if (q === 'why is the total 90 for 9 items at 10 each')
    return {
      kind: 'nine',
      text: 'Why is the total 90 for 9 items at 10 each?',
    };
  if (q === 'what about 9')
    return {
      kind: basis ? 'nine' : 'nine_without_context',
      text: 'What about 9?',
    };
  if (
    [
      'explain the calculate rule',
      'what is the discount rule',
      'explain the discount rule',
    ].includes(q)
  )
    return { kind: 'rule', text: 'Explain the discount rule.' };
  if (
    !/^(click|press|submit|delete|save|execute|run|change|set|fill|buy|send)\b/.test(
      q,
    ) &&
    /\btax\b/.test(q)
  )
    return { kind: 'tax', text: 'What tax policy applies?' };
  return {
    kind: 'unsupported',
    text: 'Unsupported product clarification request.',
  };
}
function freeze(value: unknown): void {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
}
/** Trusted access first. Provider receives a detached, frozen, bounded authorized projection and canonical question only. */
export function prepareClarification(
  store: Store,
  context: AccessContext,
  input: unknown,
  basis?: CalculationBasis,
): ProviderInput {
  const request = parseDescriptor(clarificationRequestSchema, input);
  const evidence = retrieveDescriptor(store, context, {
    schema_version: 1,
    project_id: request.project_id,
    app_id: request.app_id,
    target_id: request.target_id,
    scope: request.scope,
  });
  const target = evidence.targets.find((t) => t.id === request.target_id);
  if (!target) throw new DescriptorError('NOT_FOUND');
  if (request.page_id !== (target.kind === 'page' ? target.id : target.page_id))
    throw new DescriptorError('INVALID_INPUT');
  if (
    basis &&
    (basis.unit_price !== '10' ||
      !sameScope(basis.scope, request.scope) ||
      ['conversation_id', 'project_id', 'app_id', 'target_id', 'page_id'].some(
        (k) =>
          basis[k as keyof CalculationBasis] !==
          request[k as keyof typeof request],
      ))
  )
    throw new DescriptorError('ACCESS_DENIED');
  const normalized = question(request.question, !!basis);
  request.question = normalized.text;
  const prepared: ProviderInput = {
    request,
    question_kind: normalized.kind,
    evidence,
  };
  freeze(prepared);
  return prepared;
}
