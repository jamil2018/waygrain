import type { Responses } from '../contracts/index.js';
import type { Capture } from '../core/normalize.js';

export const LIFECYCLE_TOOLS = [
  'wg_browser_open',
  'wg_browser_status',
  'wg_browser_close',
] as const;
export type LifecycleTool = (typeof LIFECYCLE_TOOLS)[number];
export type PageBinding = Responses['wg_browser_open']['data']['page'];
export const capabilities = {
  ownership: 'ephemeral_owned' as const,
  headed: true as const,
  persistent_authentication: false as const,
  actions: [],
  navigation_keys: [],
};
export class BrowserError extends Error {
  constructor(
    readonly code:
      | 'BROWSER_UNAVAILABLE'
      | 'SESSION_CLOSED'
      | 'CONFLICT'
      | 'IDEMPOTENCY_CONFLICT'
      | 'LIMIT_EXCEEDED'
      | 'UNKNOWN_SCOPE',
  ) {
    super(code);
  }
  toJSON() {
    return {
      schema_version: 1,
      error: {
        code: this.code,
        message: 'Contract request rejected',
        field_paths: [],
      },
    };
  }
}
export interface WorkerRequest {
  id: number;
  command: 'open' | 'status' | 'close';
  page?: PageBinding;
}
export interface WorkerReply {
  id: number;
  data?: { status: 'open' | 'closed'; cleanup?: 'complete' | 'unconfirmed' };
  error?: 'BROWSER_UNAVAILABLE' | 'SESSION_CLOSED';
}
// Type-only boundary: raw browser observations may never be sent through IPC.
export type SanitizedCapture = Capture;
