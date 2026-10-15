import type { z } from 'zod';
import { testRun, operation } from '../contracts/operations.js';
import { Store } from '../store/database.js';
import { type AppConfiguration } from './normalize.js';
import { type Reference } from './graph.js';
export interface Flow {
    name: string;
    transition_ids: string[];
    scope: z.output<typeof testRun>['scope'];
}
export type TestRun = Omit<z.output<typeof testRun>, 'assertions'> & {
    assertions: {
        target_id: string;
        assertion: string;
        result: 'passed' | 'failed' | 'skipped';
        evidence_ids: string[];
    }[];
};
type Operation = z.output<typeof operation>;
export declare function supportsClaim(store: Store, app: string, evidence: string[], target: string): boolean;
export declare function validateRun(store: Store, app: AppConfiguration, id: string, now: number): void;
export declare function requireVerification(store: Store, app: AppConfiguration, runId: string, target: string): void;
export declare function testOperation(store: Store, app: AppConfiguration, op: Operation, resolve: (r: Reference) => string, deferred: (r: Reference) => string, revision: number, now: number, id: string): string;
export {};
