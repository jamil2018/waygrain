import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { ingest, query, evidence, changes, backup, exportArchive, restore, Store } from '../../../dist/index.js';
import { storageFixture, fixtureNow } from '../../../tests/fixtures/storage.mjs';
import { readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { sensitive } from '../../../tests/fixtures/ui/index.mjs';
const Sqlite=createRequire(import.meta.url)('better-sqlite3');
const hash=async(path)=>createHash('sha256').update(await readFile(path)).digest('hex');

test('independent backup/export restores exact full query; all cursor types reject equal-revision restore',async(t)=>{
 const f=await storageFixture(t);const first=f.request();const a=ingest(f.store,first,fixtureNow).data;
 const second=f.request();second.capture.tree.children=[];const b=ingest(f.store,second,fixtureNow).data;
 const search={...f.base,mode:'search',scope:first.capture.scope,filters:{},budget:{records:1,bytes:8192}};
 const ev={...f.base,ids:[a.capture_id,b.capture_id],budget:{records:1,bytes:8192}};
 const delta={...f.base,mode:'captures',before_capture_id:a.capture_id,after_capture_id:b.capture_id,budget:{records:1,bytes:8192}};
 const cursors=[query(f.store,search,fixtureNow).next_cursor,evidence(f.store,ev,fixtureNow).next_cursor,changes(f.store,delta).next_cursor];assert(cursors.every(Boolean));
 const full={...search,budget:{records:50,bytes:200000}};const original=query(f.store,full,fixtureNow);
 const saved=await backup(f.store);const exported=await exportArchive(f.store);const dir=f.store.location.storageDirectory;
 const archive=join(dir,`backup-${saved.backup_id}.sqlite`);assert.equal(await hash(archive),saved.sha256);assert.equal((await stat(archive)).mode&0o777,0o600);
 const db=new Sqlite(archive,{readonly:true});assert.equal(db.pragma('journal_mode',{simple:true}),'delete');assert.equal(db.pragma('quick_check',{simple:true}),'ok');db.close();
 const output=await readFile(join(dir,`export-${exported.export_id}.json`),'utf8');const json=JSON.parse(output);assert.equal(json.store_revision,2);assert.equal(json.archival_only,true);assert.equal(json.tables.captures.length,2);
 for(const marker of Object.values(sensitive)){assert(!output.includes(marker));assert(!(await readFile(archive)).includes(Buffer.from(marker)));}
 await assert.rejects(restore(f.configPath,saved.backup_id,saved.sha256),{code:'STORE_BUSY'});assert.equal(f.store.revision,2);f.store.close();
 await restore(f.configPath,saved.backup_id,saved.sha256);const reopened=await Store.open(f.configPath);
 try{assert.equal(reopened.revision,2);assert.deepEqual(query(reopened,full,fixtureNow),original);
  for(const [fn,q,cursor] of [[query,search,cursors[0]],[evidence,ev,cursors[1]],[changes,delta,cursors[2]]])assert.throws(()=>fn(reopened,{...q,cursor},fixtureNow),{code:'CURSOR_STALE'});
 }finally{reopened.close();}
});

test('independent verified restore refuses WAL overlays, future schema and changed schema without replacing store',async(t)=>{
 const f=await storageFixture(t);ingest(f.store,f.request(),fixtureNow);const saved=await backup(f.store);const dir=f.store.location.storageDirectory;const path=join(dir,`backup-${saved.backup_id}.sqlite`);const pristine=await readFile(path);f.store.close();
 await writeFile(path+'-wal','synthetic-overlay',{mode:0o600});await assert.rejects(restore(f.configPath,saved.backup_id,saved.sha256),{code:'STORE_CORRUPT'});await unlink(path+'-wal');
 let db=new Sqlite(path);db.pragma('user_version=999');db.close();await assert.rejects(restore(f.configPath,saved.backup_id,await hash(path)),{code:'UNSUPPORTED_SCHEMA'});await writeFile(path,pristine);
 db=new Sqlite(path);db.exec('DROP TRIGGER immutable_captures');db.close();await assert.rejects(restore(f.configPath,saved.backup_id,await hash(path)),{code:'STORE_CORRUPT'});
 const live=await Store.open(f.configPath);try{assert.equal(live.revision,1);assert.equal(live.db.prepare('SELECT COUNT(*) n FROM captures').get().n,1);}finally{live.close();}
});

test('independent CLI maintenance uses fixed IDs and verified offline restore',async(t)=>{
 const f=await storageFixture(t);ingest(f.store,f.request(),fixtureNow);f.store.close();const cli=fileURLToPath(new URL('../../../dist/cli.js',import.meta.url));
 const run=(cmd,...args)=>JSON.parse(execFileSync(process.execPath,[cli,cmd,'--config',f.configPath,...args],{encoding:'utf8'}));
 const b=run('backup');assert.equal(b.status,'backed_up');assert.equal(run('export').archival_only,true);assert.equal(run('restore','--backup',b.backup_id,'--sha256',b.sha256).status,'restored');
 const live=await Store.open(f.configPath);try{assert.equal(live.revision,1);}finally{live.close();}
});
