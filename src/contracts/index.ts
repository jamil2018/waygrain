import { z } from 'zod';
import { knowledgeContracts } from './knowledge.js';
import { browserContracts } from './browser.js';
import { errorSchema } from './common.js';

export * from './common.js';
export * from './capture.js';
export * from './operations.js';
export * from './records.js';
export * from './browser.js';
export const contracts = {
  ...knowledgeContracts,
  ...browserContracts,
} as const;
export type ToolName = keyof typeof contracts;
export type Requests = {
  [K in ToolName]: z.input<(typeof contracts)[K]['input']>;
};
export type Responses = {
  [K in ToolName]: z.output<(typeof contracts)[K]['output']>;
};

/** Export fresh JSON Schemas from the same definitions used for validation/types. */
export function contractJsonSchemas() {
  return Object.fromEntries(
    Object.entries(contracts).map(([name, contract]) => [
      name,
      {
        input: z.toJSONSchema(contract.input, { io: 'input' }),
        output: z.toJSONSchema(contract.output, { io: 'output' }),
        error: z.toJSONSchema(errorSchema),
      },
    ]),
  );
}
export {
  validateRequest,
  validateResponse,
  ContractError,
} from './validation.js';
