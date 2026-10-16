import type { AnswerProvider, ProviderInput } from './contracts.js';
import { groundedAnswer } from './validation.js';
export const DETERMINISTIC_LABEL =
  'Deterministic synthetic fixture adapter · offline, no model';
/** Pure local templates; no model, network, host access or tools. Validation still runs at the caller boundary. */
export function deterministicProvider(): AnswerProvider {
  return Object.freeze({
    label: DETERMINISTIC_LABEL,
    async generate(input: ProviderInput) {
      return groundedAnswer(input, DETERMINISTIC_LABEL);
    },
  });
}
