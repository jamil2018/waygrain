import { Store } from '../store/database.js';
import { canonical, digest } from '../core/normalize.js';
import { attemptReceipt, type Responses } from '../contracts/index.js';
import { BrowserError } from './protocol.js';

type Receipt = Responses['wg_browser_navigate']['data'];
interface Row {
  tool: string;
  digest: string;
  receipt_json: string;
}
/** Uses the existing private transactional receipt store; no raw inputs or hashes of input values. */
export class AttemptJournal {
  constructor(
    private readonly store: Store,
    private readonly app: string,
  ) {}
  read(execution: string): Receipt | undefined {
    const row = this.store.db
      .prepare(
        'SELECT tool,digest,receipt_json FROM receipts WHERE app_id=? AND request_id=?',
      )
      .get(this.app, 'browser_execution_' + execution) as Row | undefined;
    if (!row) return;
    if (!['wg_browser_navigate', 'wg_browser_act'].includes(row.tool))
      throw new BrowserError('EXECUTION_CONFLICT');
    const receipt = attemptReceipt.parse(JSON.parse(row.receipt_json));
    if (receipt.state === 'pending')
      return {
        ...receipt,
        state: 'unknown',
        dispatch: 'uncertain',
        error_code: 'UNKNOWN_OUTCOME',
      };
    return receipt;
  }
  replay(
    execution: string,
    tool: string,
    metadata: unknown,
  ): Receipt | undefined {
    const row = this.store.db
      .prepare(
        'SELECT tool,digest,receipt_json FROM receipts WHERE app_id=? AND request_id=?',
      )
      .get(this.app, 'browser_execution_' + execution) as Row | undefined;
    if (row && (row.tool !== tool || row.digest !== digest(metadata)))
      throw new BrowserError('EXECUTION_CONFLICT');
    return this.read(execution);
  }
  reserve(request: string, tool: string, metadata: unknown, receipt: Receipt) {
    const hash = digest(metadata);
    this.store.transaction(() => {
      if (this.read(receipt.execution_id))
        throw new BrowserError('EXECUTION_CONFLICT');
      this.store.advanceRevision();
      for (const key of [
        'browser_execution_' + receipt.execution_id,
        'browser_request_' + request,
      ])
        this.store.db
          .prepare('INSERT INTO receipts VALUES(?,?,?,?,?)')
          .run(
            this.app,
            key,
            tool,
            hash,
            canonical(attemptReceipt.parse(receipt)),
          );
    });
  }
  finish(request: string, receipt: Receipt) {
    this.store.transaction(() => {
      this.store.advanceRevision();
      for (const key of [
        'browser_execution_' + receipt.execution_id,
        'browser_request_' + request,
      ])
        if (
          this.store.db
            .prepare(
              'UPDATE receipts SET receipt_json=? WHERE app_id=? AND request_id=?',
            )
            .run(canonical(attemptReceipt.parse(receipt)), this.app, key)
            .changes !== 1
        )
          throw new BrowserError('EXECUTION_CONFLICT');
    });
  }
}
