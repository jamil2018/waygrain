import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Store } from '../store/database.js';
import { KnowledgeError } from '../core/normalize.js';
import {
  parseDescriptor,
  sameScope,
  DescriptorError,
  DESCRIPTOR_LIMITS,
  scopeSchema,
  accessContextSchema,
  type AccessContext,
} from './contracts.js';
import { readBundle } from './store.js';
import {
  clarificationRequestSchema,
  answerSchema,
  type ClarificationAnswer,
  type CalculationBasis,
  type AnswerProvider,
} from './providers/contracts.js';
import { prepareClarification } from './providers/evidence.js';
import { executeProvider } from './providers/validation.js';
export const conversationBindingSchema = clarificationRequestSchema.omit({
  question: true,
});
const askSchema = clarificationRequestSchema.extend({
  expected_turn: z.number().int().min(0).max(DESCRIPTOR_LIMITS.turns),
});
type Binding = z.infer<typeof conversationBindingSchema>;
interface Head {
  id: string;
  project_id: string;
  app_id: string;
  principal: string;
  target_id: string;
  page_id: string;
  scope_json: string;
}
interface TurnRow {
  ordinal: number;
  descriptor_revision_id: string;
  question: string;
  answer_json: string;
}
export interface ConversationView {
  conversation_id: string;
  turns: {
    ordinal: number;
    question: string;
    answer: ClarificationAnswer;
    evidence_current: boolean;
  }[];
}
function head(store: Store, id: string) {
  return store.db
    .prepare('SELECT * FROM descriptor_conversations WHERE id=?')
    .get(id) as Head | undefined;
}
function compatible(row: Head, context: AccessContext, binding: Binding) {
  return (
    row.project_id === binding.project_id &&
    row.app_id === binding.app_id &&
    row.principal === context.principal &&
    row.target_id === binding.target_id &&
    row.page_id === binding.page_id &&
    sameScope(
      parseDescriptor(scopeSchema, JSON.parse(row.scope_json) as unknown),
      binding.scope,
    )
  );
}
/** Every history read reauthorizes before any conversation projection; old answers are labeled, never fed back as evidence. */
export function loadConversation(
  store: Store,
  context: AccessContext,
  input: unknown,
): ConversationView {
  const binding = parseDescriptor(conversationBindingSchema, input);
  const prepared = prepareClarification(store, context, {
    ...binding,
    question: 'Load product clarification history.',
  });
  const row = head(store, binding.conversation_id);
  if (row && !compatible(row, context, binding))
    throw new DescriptorError('ACCESS_DENIED');
  const snapshot = {
    turns: row
      ? store.transaction(
          () =>
            store.db
              .prepare(
                'SELECT ordinal,descriptor_revision_id,question,answer_json FROM descriptor_turns WHERE conversation_id=? ORDER BY ordinal',
              )
              .all(binding.conversation_id) as TurnRow[],
          false,
        )
      : [],
  };
  if (snapshot.turns.length > DESCRIPTOR_LIMITS.turns)
    throw new KnowledgeError('STORE_CORRUPT');
  return {
    conversation_id: binding.conversation_id,
    turns: snapshot.turns.map((row) => ({
      ordinal: row.ordinal,
      question: row.question,
      answer: parseDescriptor(
        answerSchema,
        JSON.parse(row.answer_json) as unknown,
      ),
      evidence_current:
        row.descriptor_revision_id === prepared.evidence.revision_id,
    })),
  };
}
export function latestConversation(
  store: Store,
  context: AccessContext,
  input: unknown,
): ConversationView {
  const parsed = parseDescriptor(conversationBindingSchema, {
    ...(input as object),
    conversation_id: randomUUID(),
  });
  prepareClarification(store, context, {
    ...parsed,
    question: 'Load product clarification history.',
  });
  const row = store.db
    .prepare(
      'SELECT h.id FROM descriptor_conversations h WHERE project_id=? AND app_id=? AND principal=? AND target_id=? AND page_id=? AND scope_json=? ORDER BY (SELECT MAX(store_revision) FROM descriptor_turns WHERE conversation_id=h.id) DESC,h.id LIMIT 1',
    )
    .get(
      parsed.project_id,
      parsed.app_id,
      context.principal,
      parsed.target_id,
      parsed.page_id,
      JSON.stringify(parsed.scope),
    ) as { id: string } | undefined;
  return loadConversation(store, context, {
    ...parsed,
    conversation_id: row?.id ?? parsed.conversation_id,
  });
}
export async function askConversation(
  store: Store,
  getContext: () => AccessContext,
  input: unknown,
  provider: AnswerProvider,
): Promise<ConversationView> {
  const request = parseDescriptor(askSchema, input),
    context = parseDescriptor(accessContextSchema, getContext());
  const { expected_turn, question, ...binding } = request;
  const history = loadConversation(store, context, binding);
  if (history.turns.length !== expected_turn)
    throw new DescriptorError('CONFLICT');
  if (expected_turn >= DESCRIPTOR_LIMITS.turns)
    throw new DescriptorError('LIMIT_EXCEEDED');
  const lastCalculation = [...history.turns]
    .reverse()
    .find(
      (t) =>
        t.answer.status === 'supported' &&
        ['ten', 'nine'].includes(t.answer.derivation),
    );
  const basis: CalculationBasis | undefined = lastCalculation
    ? { ...binding, unit_price: '10' }
    : undefined;
  const prepared = prepareClarification(
    store,
    context,
    { ...binding, question },
    basis,
  );
  const answer = await executeProvider(prepared, provider);
  const after = parseDescriptor(accessContextSchema, getContext());
  // Reauthorize after async generation, including principal ownership. No stale result is saved.
  loadConversation(store, after, binding);
  if (after.principal !== context.principal)
    throw new DescriptorError('ACCESS_DENIED');
  const currentHead = head(store, binding.conversation_id);
  if (currentHead && !compatible(currentHead, after, binding))
    throw new DescriptorError('ACCESS_DENIED');
  const total = (
    store.db
      .prepare('SELECT COUNT(*) n FROM descriptor_conversations')
      .get() as { n: number }
  ).n;
  if (!currentHead && total >= DESCRIPTOR_LIMITS.conversations)
    throw new DescriptorError('LIMIT_EXCEEDED');
  store.write(undefined, (revision) => {
    if (
      readBundle(store, binding.app_id)?.revision_id !==
      prepared.evidence.revision_id
    )
      throw new KnowledgeError('CONFLICT');
    const row = head(store, binding.conversation_id),
      count = (
        store.db
          .prepare(
            'SELECT COUNT(*) n FROM descriptor_turns WHERE conversation_id=?',
          )
          .get(binding.conversation_id) as { n: number }
      ).n;
    if (count !== expected_turn || (row && !compatible(row, after, binding)))
      throw new KnowledgeError('CONFLICT');
    if (!row) {
      if (
        (
          store.db
            .prepare('SELECT COUNT(*) n FROM descriptor_conversations')
            .get() as { n: number }
        ).n >= DESCRIPTOR_LIMITS.conversations
      )
        throw new KnowledgeError('STORAGE_LIMIT');
      store.db
        .prepare('INSERT INTO descriptor_conversations VALUES(?,?,?,?,?,?,?)')
        .run(
          binding.conversation_id,
          binding.project_id,
          binding.app_id,
          after.principal,
          binding.target_id,
          binding.page_id,
          JSON.stringify(binding.scope),
        );
    }
    store.db
      .prepare('INSERT INTO descriptor_turns VALUES(?,?,?,?,?,?)')
      .run(
        binding.conversation_id,
        expected_turn + 1,
        revision,
        answer.evidence_revision_id,
        prepared.request.question,
        JSON.stringify(answer),
      );
    store.requireStorageCapacity();
  });
  return loadConversation(store, after, binding);
}
