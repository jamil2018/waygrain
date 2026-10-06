import { z } from 'zod';
import {
  browserRequest,
  browserEnvelope,
  id,
  key,
  scope,
  timestamp,
  errorCode,
  text,
} from './common.js';
import { capture } from './capture.js';

const liveBinding = { session_id: id, page_id: id, snapshot_id: id };
const targetBinding = { ...liveBinding, target_id: id };
export const navigationKey = z.enum([
  'Tab',
  'Shift+Tab',
  'ArrowUp',
  'ArrowDown',
  'Escape',
]);
export const browserAction = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('click'), ...targetBinding }),
  z.strictObject({ kind: z.literal('fill'), ...targetBinding, text }),
  z.strictObject({
    kind: z.literal('select'),
    ...targetBinding,
    option_id: id,
  }),
  z.strictObject({ kind: z.literal('check'), ...targetBinding }),
  z.strictObject({ kind: z.literal('uncheck'), ...targetBinding }),
  z.strictObject({
    kind: z.literal('scroll'),
    ...targetBinding,
    axis: z.enum(['vertical', 'horizontal']),
    delta: z.number().int().min(-4096).max(4096),
  }),
  z.strictObject({
    kind: z.literal('key'),
    ...targetBinding,
    key: navigationKey,
  }),
]);
export const attemptState = z.enum([
  'not_started',
  'pending',
  'succeeded',
  'failed',
  'unknown',
]);
const receiptBase = {
  execution_id: key,
  ...liveBinding,
  target_id: id.nullable(),
  trace_id: key,
  trace_seq: z.number().int().nonnegative(),
  action_kind: z.enum([
    'click',
    'fill',
    'select',
    'check',
    'uncheck',
    'scroll',
    'key',
    'navigate',
  ]),
  occurred_at: timestamp,
  after_snapshot_id: id.nullable(),
};
export const attemptReceipt = z.discriminatedUnion('state', [
  z.strictObject({
    ...receiptBase,
    state: z.literal('not_started'),
    after_snapshot_id: z.null(),
    dispatch: z.literal('not_dispatched'),
    error_code: errorCode.nullable(),
  }),
  z.strictObject({
    ...receiptBase,
    state: z.literal('pending'),
    dispatch: z.enum(['not_dispatched', 'dispatched']),
    error_code: z.null(),
  }),
  z.strictObject({
    ...receiptBase,
    state: z.literal('succeeded'),
    dispatch: z.literal('dispatched'),
    error_code: z.null(),
  }),
  z.strictObject({
    ...receiptBase,
    state: z.literal('failed'),
    dispatch: z.literal('dispatched'),
    error_code: errorCode,
  }),
  z.strictObject({
    ...receiptBase,
    state: z.literal('unknown'),
    dispatch: z.enum(['dispatched', 'uncertain']),
    error_code: z.literal('UNKNOWN_OUTCOME'),
  }),
]);
const capabilities = z.strictObject({
  ownership: z.literal('ephemeral_owned'),
  headed: z.literal(true),
  persistent_authentication: z.literal(false),
  actions: z
    .array(
      z.enum(['click', 'fill', 'select', 'check', 'uncheck', 'scroll', 'key']),
    )
    .max(7),
  navigation_keys: z.array(navigationKey).max(5),
});
const page = z.strictObject({ session_id: id, page_id: id, scope });
export const browserContracts = {
  wg_browser_open: {
    input: z.strictObject({ ...browserRequest, request_id: key, scope }),
    output: browserEnvelope(
      z.strictObject({ status: z.literal('open'), page, capabilities }),
    ),
  },
  wg_browser_snapshot: {
    input: z.strictObject({ ...browserRequest, session_id: id, page_id: id }),
    output: browserEnvelope(
      z.strictObject({
        ...liveBinding,
        capture,
        targets: z
          .array(
            z.strictObject({
              target_id: id,
              role: key,
              name: text,
              permitted_actions: z
                .array(
                  z.enum([
                    'click',
                    'fill',
                    'select',
                    'check',
                    'uncheck',
                    'scroll',
                    'key',
                  ]),
                )
                .max(7),
              option_ids: z.array(id).max(50).optional(),
            }),
          )
          .max(5000),
      }),
    ),
  },
  wg_browser_navigate: {
    input: z.strictObject({
      ...browserRequest,
      request_id: key,
      execution_id: key,
      ...liveBinding,
      scope,
      url: z
        .url({ protocol: /^https?$/ })
        .max(2048)
        .regex(/^https?:\/\/[^\s/?#@]+(?:\/[^\s?#@]*)?$/),
    }),
    output: browserEnvelope(attemptReceipt),
  },
  wg_browser_act: {
    input: z.strictObject({
      ...browserRequest,
      request_id: key,
      execution_id: key,
      action: browserAction,
    }),
    output: browserEnvelope(attemptReceipt),
  },
  wg_browser_status: {
    input: z.strictObject({
      ...browserRequest,
      session_id: id.optional(),
      execution_id: key.optional(),
    }),
    output: browserEnvelope(
      z.discriminatedUnion('status', [
        z.strictObject({
          status: z.literal('closed'),
          page: z.null(),
          capabilities,
          attempts: z.array(attemptReceipt).max(50),
        }),
        z.strictObject({
          status: z.literal('open'),
          page,
          capabilities,
          attempts: z.array(attemptReceipt).max(50),
        }),
      ]),
    ),
  },
  wg_browser_close: {
    input: z.strictObject({
      ...browserRequest,
      request_id: key,
      session_id: id,
    }),
    output: browserEnvelope(
      z.strictObject({
        status: z.literal('closed'),
        session_id: id,
        cleanup: z.enum(['complete', 'unconfirmed']),
      }),
    ),
  },
} as const;
