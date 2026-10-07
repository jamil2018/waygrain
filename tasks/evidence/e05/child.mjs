import { createRequire } from 'node:module';
import { Store, ingest } from '../../../dist/index.js';
const [mode, configPath] = process.argv.slice(2);
const Sqlite = createRequire(import.meta.url)('better-sqlite3');
if (mode === 'migration') {
 const actual = Sqlite.prototype.exec;
 Sqlite.prototype.exec = function(sql) {
  const result = actual.call(this,sql);
  if (sql.includes('CREATE TABLE deletion_batches')) process.send({type:'uncommitted_migration'},()=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0));
  return result;
 };
 await Store.open(configPath);
 throw new Error('migration barrier missed');
}
const store=await Store.open(configPath);
if(mode==='writer'){
 process.send({type:'ready'});
 process.once('message',(request)=>{try{const result=ingest(store,request);process.send({type:'done',result});}catch(e){process.send({type:'failed',code:e.code});}finally{store.close();process.disconnect();}});
}else if(mode==='transaction'){
 store.db.exec('BEGIN IMMEDIATE');
 store.db.exec('UPDATE meta SET revision=revision+100');
 process.send({type:'uncommitted_write'},()=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0));
}else throw new Error('unknown mode');
