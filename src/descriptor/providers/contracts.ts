import { z } from 'zod';
import {
  boundedText,
  idSchema,
  scopeSchema,
  DESCRIPTOR_LIMITS,
  type ReadRequest,
} from '../contracts.js';
import type { EvidencePackage } from '../retrieval.js';
export const clarificationRequestSchema = z.strictObject({
  schema_version: z.literal(1),
  project_id: idSchema,
  app_id: idSchema,
  conversation_id: idSchema,
  target_id: idSchema,
  page_id: idSchema,
  scope: scopeSchema,
  question: boundedText(DESCRIPTOR_LIMITS.question).min(1),
});
export type ClarificationRequest = z.infer<typeof clarificationRequestSchema>;
export type QuestionKind =
  'ten' | 'nine' | 'nine_without_context' | 'tax' | 'rule' | 'unsupported';
export interface CalculationBasis {
  conversation_id: string;
  project_id: string;
  app_id: string;
  target_id: string;
  page_id: string;
  scope: ReadRequest['scope'];
  unit_price: '10';
}
export interface ProviderInput {
  request: ClarificationRequest;
  question_kind: QuestionKind;
  evidence: EvidencePackage;
}
export interface AnswerProvider {
  readonly label: string;
  generate(input: ProviderInput): Promise<unknown>;
}
export const citationSchema = z.strictObject({
  claim_id: idSchema,
  source_id: idSchema,
  source_revision_id: idSchema,
  content_hash: z.string().regex(/^[a-f0-9]{64}$/),
  locator: boundedText(4096),
  evidence_class: z.enum([
    'documented',
    'observed',
    'code-verified',
    'inferred',
  ]),
});
export const answerSchema = z.strictObject({
  schema_version: z.literal(1),
  conversation_id: idSchema,
  project_id: idSchema,
  app_id: idSchema,
  target_id: idSchema,
  page_id: idSchema,
  scope: scopeSchema,
  evidence_revision_id: idSchema,
  provider_label: boundedText(128).min(1),
  derivation: z.enum([
    'ten',
    'nine',
    'rule',
    'tax',
    'conflict',
    'missing',
    'unsupported',
  ]),
  status: z.enum(['supported', 'unknown', 'conflict', 'unsupported']),
  text: boundedText(8192).min(1),
  citations: z.array(citationSchema).max(32),
  evidence_classes: z.array(citationSchema.shape.evidence_class).max(4),
  conflicts: z.array(idSchema).max(64),
  missing: z.array(boundedText(128)).max(64),
  warnings: z.array(boundedText(128)).max(64),
});
export type ClarificationAnswer = z.infer<typeof answerSchema>;
