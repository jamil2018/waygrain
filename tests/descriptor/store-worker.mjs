import process from 'node:process';
import { createRequire } from 'node:module';
import { Store } from '../../dist/store/database.js';
import { descriptorMigration } from '../../dist/store/schema.js';
const Sqlite = createRequire(import.meta.url)('better-sqlite3');
const original = Sqlite.prototype.exec;
Sqlite.prototype.exec = function (sql) {
  const result = original.call(this, sql);
  if (sql === descriptorMigration) {
    process.send({ type: 'staged' });
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
  }
  return result;
};
const store = await Store.open(process.argv[2]);
store.close();
process.disconnect();
